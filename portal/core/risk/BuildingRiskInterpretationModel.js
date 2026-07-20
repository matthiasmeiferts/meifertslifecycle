const INTERPRETATION_MODEL_VERSION = "brs-risk-interpretation-1.0";
const SUPPORTED_INTERNAL_MODEL_VERSION = "brs-internal-model-1.0";

const RISK_CATEGORIES = Object.freeze({
    NO_CONFIRMED_RISK_INTERPRETATION: "NO_CONFIRMED_RISK_INTERPRETATION",
    LOW_CONCERN: "LOW_CONCERN",
    MODERATE_CONCERN: "MODERATE_CONCERN",
    ELEVATED_CONCERN: "ELEVATED_CONCERN",
    CRITICAL_CONCERN: "CRITICAL_CONCERN",
    UNKNOWN: "UNKNOWN",
    NOT_ASSESSED: "NOT_ASSESSED"
});

const EVIDENCE_SUFFICIENCY = Object.freeze({
    SUPPORTED: "SUPPORTED",
    PROVISIONALLY_SUPPORTED: "PROVISIONALLY_SUPPORTED",
    INSUFFICIENTLY_SUPPORTED: "INSUFFICIENTLY_SUPPORTED",
    CONTRADICTED: "CONTRADICTED",
    UNKNOWN_SUFFICIENCY: "UNKNOWN_SUFFICIENCY",
    NOT_APPLICABLE: "NOT_APPLICABLE"
});

const COMPLETENESS = Object.freeze({
    COMPLETE: "COMPLETE",
    INCOMPLETE: "INCOMPLETE",
    LEGACY: "LEGACY",
    UNKNOWN_COMPLETENESS: "UNKNOWN_COMPLETENESS",
    INVALID: "INVALID",
    NOT_ASSESSED: "NOT_ASSESSED"
});

const CATEGORY_PRECEDENCE = [
    RISK_CATEGORIES.LOW_CONCERN,
    RISK_CATEGORIES.MODERATE_CONCERN,
    RISK_CATEGORIES.ELEVATED_CONCERN,
    RISK_CATEGORIES.CRITICAL_CONCERN
];

const EXPLICIT_CATEGORY_VALUES = Object.freeze({
    NO_CONFIRMED_RISK_INTERPRETATION: RISK_CATEGORIES.NO_CONFIRMED_RISK_INTERPRETATION,
    LOW_CONCERN: RISK_CATEGORIES.LOW_CONCERN,
    LOW: RISK_CATEGORIES.LOW_CONCERN,
    MODERATE_CONCERN: RISK_CATEGORIES.MODERATE_CONCERN,
    MODERATE: RISK_CATEGORIES.MODERATE_CONCERN,
    ELEVATED_CONCERN: RISK_CATEGORIES.ELEVATED_CONCERN,
    ELEVATED: RISK_CATEGORIES.ELEVATED_CONCERN,
    HIGH: RISK_CATEGORIES.ELEVATED_CONCERN,
    CRITICAL_CONCERN: RISK_CATEGORIES.CRITICAL_CONCERN,
    CRITICAL: RISK_CATEGORIES.CRITICAL_CONCERN,
    SAFETY_RELEVANT: RISK_CATEGORIES.CRITICAL_CONCERN,
    SAFETY_CRITICAL: RISK_CATEGORIES.CRITICAL_CONCERN,
    UNKNOWN: RISK_CATEGORIES.UNKNOWN,
    NOT_ASSESSED: RISK_CATEGORIES.NOT_ASSESSED
});

const CATEGORY_SOURCE_FIELDS = [
    "riskCategory",
    "concernCategory",
    "riskConcern",
    "riskRelevance"
];

const INTERPRETATION_BLOCKING_CONFLICT_TYPES = [
    "POSITIVE_VS_RISK",
    "EVIDENCE_CONTRADICTION"
];

export default class BuildingRiskInterpretationModel {

    static get MODEL_VERSION() {
        return INTERPRETATION_MODEL_VERSION;
    }

    static get RISK_CATEGORIES() {
        return RISK_CATEGORIES;
    }

    static get EVIDENCE_SUFFICIENCY() {
        return EVIDENCE_SUFFICIENCY;
    }

    static interpret(input = {}) {
        const validation = validateInternalModel(input);

        if (!validation.valid) {
            return buildRejectedInterpretation(validation);
        }

        if (input.assessmentState === COMPLETENESS.NOT_ASSESSED) {
            return buildNotAssessedInterpretation(input);
        }

        const invalidSources = collectArray(input.invalidSources);
        const domainAssessments = collectArray(input.domainAssessments);

        if (domainAssessments.length === 0) {
            return buildNoDomainInterpretation(input, invalidSources);
        }

        const conflicts = collectArray(input.conflicts);
        const domainInterpretations = domainAssessments.map((assessment, index) => {
            return interpretDomainAssessment({
                assessment,
                assessmentPosition: index,
                conflicts: conflictsForAssessment(conflicts, assessment.sourceReference)
            });
        });

        const overallInterpretation = buildOverallInterpretation({
            input,
            domainInterpretations,
            invalidSources,
            conflicts
        });

        return {
            interpretationModelVersion: INTERPRETATION_MODEL_VERSION,
            sourceInternalModelVersion: input.internalModelVersion,
            interpretationState: "INTERPRETED",
            inputValidation: {
                accepted: true,
                boundary: "BuildingRiskInternalModel"
            },
            overallInterpretation,
            domainInterpretations,
            invalidSources: invalidSources.map((entry) => cloneValue(entry)),
            conflicts: conflicts.map((entry) => cloneValue(entry)),
            sourceContractReferences: collectArray(input.sourceContracts).map((entry) => entry.sourceReference),
            auditContext: buildAuditContext(input, domainInterpretations, conflicts),
            limitations: buildAssessmentLimitations(input, invalidSources)
        };
    }

}

function validateInternalModel(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        return invalidValidation("Input must be a BuildingRiskInternalModel result.");
    }

    if (input.internalModelVersion !== SUPPORTED_INTERNAL_MODEL_VERSION) {
        return invalidValidation(
            Object.hasOwn(input, "internalModelVersion")
                ? "Unsupported BuildingRiskInternalModel version."
                : "Input does not expose a BuildingRiskInternalModel version."
        );
    }

    const arrayFields = ["sourceContracts", "domainAssessments", "invalidSources", "conflicts"];
    const missingArray = arrayFields.find((field) => !Array.isArray(input[field]));

    if (missingArray) {
        return invalidValidation(`Internal model field ${missingArray} must be an array.`);
    }

    if (!input.auditContext || typeof input.auditContext !== "object" || Array.isArray(input.auditContext)) {
        return invalidValidation("Internal model auditContext must be present.");
    }

    if (typeof input.assessmentState !== "string") {
        return invalidValidation("Internal model assessmentState must be present.");
    }

    const invalidSourceContract = input.sourceContracts.find((entry) => {
        return !entry || typeof entry !== "object" || Array.isArray(entry) || typeof entry.sourceReference !== "string";
    });

    if (invalidSourceContract) {
        return invalidValidation("Internal model sourceContracts must expose sourceReference values.");
    }

    const invalidDomainAssessment = input.domainAssessments.find((entry) => !isValidDomainAssessment(entry));

    if (invalidDomainAssessment) {
        return invalidValidation("Internal model domainAssessments must expose the expected preservation structure.");
    }

    const invalidConflict = input.conflicts.find((entry) => {
        return !entry ||
            typeof entry !== "object" ||
            Array.isArray(entry) ||
            typeof entry.conflictReference !== "string" ||
            typeof entry.type !== "string" ||
            !Array.isArray(entry.sourceContractReferences);
    });

    if (invalidConflict) {
        return invalidValidation("Internal model conflicts must expose references, types, and source contract references.");
    }

    return { valid: true };
}

function isValidDomainAssessment(entry) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        return false;
    }

    const requiredArrayFields = [
        "hypotheses",
        "evidenceReferences",
        "missingEvidence",
        "unknowns",
        "positiveIndicators",
        "redFlags",
        "recommendations",
        "guardrails",
        "sourceReferences"
    ];

    return typeof entry.sourceReference === "string" &&
        typeof entry.domainId === "string" &&
        typeof entry.completenessState === "string" &&
        entry.confidenceContext &&
        typeof entry.confidenceContext === "object" &&
        !Array.isArray(entry.confidenceContext) &&
        requiredArrayFields.every((field) => Array.isArray(entry[field]));
}

function invalidValidation(reason) {
    return {
        valid: false,
        reason
    };
}

function buildRejectedInterpretation(validation) {
    return {
        interpretationModelVersion: INTERPRETATION_MODEL_VERSION,
        sourceInternalModelVersion: null,
        interpretationState: "INVALID_INPUT",
        inputValidation: {
            accepted: false,
            boundary: "BuildingRiskInternalModel",
            reason: validation.reason
        },
        overallInterpretation: {
            riskCategory: RISK_CATEGORIES.UNKNOWN,
            evidenceSufficiency: EVIDENCE_SUFFICIENCY.UNKNOWN_SUFFICIENCY,
            basis: "invalid internal model input rejected",
            sourceContractReferences: []
        },
        domainInterpretations: [],
        invalidSources: [],
        conflicts: [],
        sourceContractReferences: [],
        auditContext: {
            interpretationModelVersion: INTERPRETATION_MODEL_VERSION,
            sourceInternalModelVersion: null,
            transformations: ["invalid input rejected without interpretation"]
        },
        limitations: ["No risk interpretation was produced because the input was not a valid BuildingRiskInternalModel result."]
    };
}

function buildNotAssessedInterpretation(input) {
    return {
        interpretationModelVersion: INTERPRETATION_MODEL_VERSION,
        sourceInternalModelVersion: input.internalModelVersion,
        interpretationState: "NOT_ASSESSED",
        inputValidation: {
            accepted: true,
            boundary: "BuildingRiskInternalModel"
        },
        overallInterpretation: {
            riskCategory: RISK_CATEGORIES.NOT_ASSESSED,
            evidenceSufficiency: EVIDENCE_SUFFICIENCY.NOT_APPLICABLE,
            basis: "internal model assessmentState is NOT_ASSESSED",
            sourceContractReferences: []
        },
        domainInterpretations: [],
        invalidSources: collectArray(input.invalidSources).map((entry) => cloneValue(entry)),
        conflicts: collectArray(input.conflicts).map((entry) => cloneValue(entry)),
        sourceContractReferences: [],
        auditContext: buildAuditContext(input, [], collectArray(input.conflicts)),
        limitations: ["No source contract assessment was available for interpretation."]
    };
}

function buildNoDomainInterpretation(input, invalidSources) {
    return {
        interpretationModelVersion: INTERPRETATION_MODEL_VERSION,
        sourceInternalModelVersion: input.internalModelVersion,
        interpretationState: "NO_DOMAIN_ASSESSMENTS",
        inputValidation: {
            accepted: true,
            boundary: "BuildingRiskInternalModel"
        },
        overallInterpretation: {
            riskCategory: RISK_CATEGORIES.UNKNOWN,
            evidenceSufficiency: EVIDENCE_SUFFICIENCY.UNKNOWN_SUFFICIENCY,
            basis: invalidSources.length > 0
                ? "only invalid source contracts are available"
                : "internal model contains no domain assessments",
            sourceContractReferences: collectArray(input.sourceContracts).map((entry) => entry.sourceReference)
        },
        domainInterpretations: [],
        invalidSources: invalidSources.map((entry) => cloneValue(entry)),
        conflicts: collectArray(input.conflicts).map((entry) => cloneValue(entry)),
        sourceContractReferences: collectArray(input.sourceContracts).map((entry) => entry.sourceReference),
        auditContext: buildAuditContext(input, [], collectArray(input.conflicts)),
        limitations: ["No domain assessment was available for a source-bound interpretation."]
    };
}

function interpretDomainAssessment({ assessment, assessmentPosition, conflicts }) {
    const blockingConflicts = interpretationBlockingConflicts(conflicts);
    const riskDrivers = collectRiskDrivers(assessment, conflicts);
    const hypotheses = collectArray(assessment.hypotheses).map((entry, index) => ({
        hypothesisReference: buildElementReference(assessment.sourceReference, "hypothesis", index),
        sourceReference: assessment.sourceReference,
        domainAssessmentReference: buildDomainAssessmentReference(assessment),
        sourceElement: cloneValue(entry)
    }));
    const potentialConsequences = collectArray(assessment.evidenceReferences)
        .filter((entry) => entry.section === "potentialConsequences")
        .map((entry) => ({
            potentialConsequenceReference: entry.evidenceReference,
            sourceReference: entry.sourceReference,
            domainAssessmentReference: buildDomainAssessmentReference(assessment),
            sourceElement: cloneValue(entry)
        }));
    const missingEvidence = collectArray(assessment.missingEvidence).map((entry, index) => ({
        missingEvidenceReference: buildElementReference(assessment.sourceReference, "missing-evidence", index),
        sourceReference: assessment.sourceReference,
        domainAssessmentReference: buildDomainAssessmentReference(assessment),
        value: cloneValue(entry)
    }));
    const unknowns = collectArray(assessment.unknowns).map((entry, index) => ({
        unknownReference: buildElementReference(assessment.sourceReference, "unknown", index),
        sourceReference: assessment.sourceReference,
        domainAssessmentReference: buildDomainAssessmentReference(assessment),
        value: cloneValue(entry)
    }));
    const positiveIndicators = collectArray(assessment.positiveIndicators).map((entry, index) => ({
        positiveIndicatorReference: buildElementReference(assessment.sourceReference, "positive-indicator", index),
        sourceReference: assessment.sourceReference,
        domainAssessmentReference: buildDomainAssessmentReference(assessment),
        value: cloneValue(entry)
    }));
    const redFlags = collectArray(assessment.redFlags).map((entry, index) => ({
        redFlagReference: buildElementReference(assessment.sourceReference, "red-flag", index),
        sourceReference: assessment.sourceReference,
        domainAssessmentReference: buildDomainAssessmentReference(assessment),
        sourceElement: cloneValue(entry)
    }));
    const recommendations = collectArray(assessment.recommendations).map((entry, index) => ({
        recommendationReference: buildElementReference(assessment.sourceReference, "recommendation", index),
        sourceReference: assessment.sourceReference,
        domainAssessmentReference: buildDomainAssessmentReference(assessment),
        sourceElement: cloneValue(entry)
    }));
    const evidenceSufficiency = classifyEvidenceSufficiency({
        assessment,
        riskDrivers,
        missingEvidence,
        unknowns,
        blockingConflicts
    });
    const riskCategory = classifyDomainCategory({
        assessment,
        riskDrivers,
        missingEvidence,
        unknowns,
        blockingConflicts,
        evidenceSufficiency
    });

    return {
        domainInterpretationReference: `brs-risk-domain-${String(assessmentPosition + 1).padStart(3, "0")}`,
        domainAssessmentReference: buildDomainAssessmentReference(assessment),
        sourceReference: assessment.sourceReference,
        sourcePosition: assessment.sourcePosition,
        domainId: assessment.domainId,
        domainState: assessment.domainState,
        riskCategory,
        evidenceSufficiency,
        hypotheses,
        potentialConsequences,
        riskDrivers,
        supportingEvidenceReferences: collectArray(assessment.evidenceReferences).map((entry) => entry.evidenceReference),
        positiveIndicators,
        missingEvidence,
        unknowns,
        redFlags,
        recommendations,
        conflicts: conflicts.map((entry) => cloneValue(entry)),
        confidenceContext: cloneValue(assessment.confidenceContext),
        completenessContext: {
            sourceReference: assessment.sourceReference,
            completenessState: assessment.completenessState,
            contractVersion: assessment.contractVersion,
            contractVersionState: assessment.contractVersionState
        },
        guardrails: collectArray(assessment.guardrails),
        limitations: buildDomainLimitations({
            assessment,
            riskDrivers,
            missingEvidence,
            unknowns,
            conflicts,
            blockingConflicts,
            evidenceSufficiency
        })
    };
}

function collectRiskDrivers(assessment, conflicts) {
    const drivers = [];

    collectArray(assessment.hypotheses).forEach((entry, index) => {
        const explicitCategory = getExplicitCategory(entry.hypothesis);

        if (!isConcernCategory(explicitCategory)) {
            return;
        }

        drivers.push(buildRiskDriver({
            assessment,
            driverPosition: drivers.length,
            sourceElementType: `${entry.role || "unknown"}-hypothesis`,
            sourceElementReference: buildElementReference(assessment.sourceReference, "hypothesis", index),
            sourceElement: entry,
            riskCategory: explicitCategory,
            basis: "explicit structured hypothesis concern field",
            conflicts
        }));
    });

    collectArray(assessment.evidenceReferences).forEach((entry) => {
        if (entry.section !== "potentialConsequences") {
            return;
        }

        const explicitCategory = getExplicitCategory(entry.value);

        if (!isConcernCategory(explicitCategory)) {
            return;
        }

        drivers.push(buildRiskDriver({
            assessment,
            driverPosition: drivers.length,
            sourceElementType: "potential-consequence",
            sourceElementReference: entry.evidenceReference,
            sourceElement: entry,
            riskCategory: explicitCategory,
            basis: "explicit structured potential consequence concern field",
            conflicts
        }));
    });

    collectArray(assessment.redFlags).forEach((entry, index) => {
        const explicitCategory = getExplicitCategory(entry.value);

        if (!isConcernCategory(explicitCategory)) {
            return;
        }

        drivers.push(buildRiskDriver({
            assessment,
            driverPosition: drivers.length,
            sourceElementType: "red-flag",
            sourceElementReference: buildElementReference(assessment.sourceReference, "red-flag", index),
            sourceElement: entry,
            riskCategory: explicitCategory,
            basis: "preserved red flag with explicit structured concern field",
            conflicts
        }));
    });

    return drivers;
}

function buildRiskDriver({
    assessment,
    driverPosition,
    sourceElementType,
    sourceElementReference,
    sourceElement,
    riskCategory,
    basis,
    conflicts
}) {
    const blockingConflicts = interpretationBlockingConflicts(conflicts);

    return {
        riskDriverReference: buildElementReference(assessment.sourceReference, "risk-driver", driverPosition),
        sourceReference: assessment.sourceReference,
        domainAssessmentReference: buildDomainAssessmentReference(assessment),
        domainId: assessment.domainId,
        sourceElementType,
        sourceElementReference,
        sourceElement: cloneValue(sourceElement),
        riskCategory,
        evidenceSufficiency: blockingConflicts.length > 0
            ? EVIDENCE_SUFFICIENCY.CONTRADICTED
            : EVIDENCE_SUFFICIENCY.SUPPORTED,
        basis,
        interpretationBoundary: "source-bound structured internal model element only"
    };
}

function classifyEvidenceSufficiency({ assessment, riskDrivers, missingEvidence, unknowns, blockingConflicts }) {
    if (blockingConflicts.length > 0) {
        return EVIDENCE_SUFFICIENCY.CONTRADICTED;
    }

    if (riskDrivers.length > 0) {
        if (
            missingEvidence.length > 0 ||
            unknowns.length > 0 ||
            assessment.completenessState === COMPLETENESS.INCOMPLETE ||
            assessment.completenessState === COMPLETENESS.LEGACY ||
            assessment.completenessState === COMPLETENESS.UNKNOWN_COMPLETENESS
        ) {
            return EVIDENCE_SUFFICIENCY.PROVISIONALLY_SUPPORTED;
        }

        return EVIDENCE_SUFFICIENCY.SUPPORTED;
    }

    if (hasProfessionalUnknown(unknowns)) {
        return EVIDENCE_SUFFICIENCY.UNKNOWN_SUFFICIENCY;
    }

    if (missingEvidence.length > 0) {
        return EVIDENCE_SUFFICIENCY.INSUFFICIENTLY_SUPPORTED;
    }

    return EVIDENCE_SUFFICIENCY.NOT_APPLICABLE;
}

function classifyDomainCategory({ riskDrivers, missingEvidence, unknowns, blockingConflicts, evidenceSufficiency }) {
    if (blockingConflicts.length > 0) {
        return RISK_CATEGORIES.UNKNOWN;
    }

    if (riskDrivers.length > 0) {
        return highestConcernCategory(riskDrivers.map((entry) => entry.riskCategory));
    }

    if (hasProfessionalUnknown(unknowns)) {
        return RISK_CATEGORIES.UNKNOWN;
    }

    if (evidenceSufficiency === EVIDENCE_SUFFICIENCY.INSUFFICIENTLY_SUPPORTED && missingEvidence.length > 0) {
        return RISK_CATEGORIES.UNKNOWN;
    }

    return RISK_CATEGORIES.NO_CONFIRMED_RISK_INTERPRETATION;
}

function buildOverallInterpretation({ input, domainInterpretations, invalidSources, conflicts }) {
    if (input.assessmentState === COMPLETENESS.INVALID && domainInterpretations.length === 0) {
        return {
            riskCategory: RISK_CATEGORIES.UNKNOWN,
            evidenceSufficiency: EVIDENCE_SUFFICIENCY.UNKNOWN_SUFFICIENCY,
            basis: "internal model assessmentState is INVALID",
            sourceContractReferences: collectArray(input.sourceContracts).map((entry) => entry.sourceReference)
        };
    }

    if (domainInterpretations.some((entry) => entry.riskCategory === RISK_CATEGORIES.UNKNOWN)) {
        const blockingConflicts = interpretationBlockingConflicts(conflicts);

        return {
            riskCategory: RISK_CATEGORIES.UNKNOWN,
            evidenceSufficiency: blockingConflicts.length > 0
                ? EVIDENCE_SUFFICIENCY.CONTRADICTED
                : EVIDENCE_SUFFICIENCY.UNKNOWN_SUFFICIENCY,
            basis: "one or more domain interpretations are unknown or contradicted",
            sourceContractReferences: sourceReferencesFromDomains(domainInterpretations)
        };
    }

    const concernCategories = domainInterpretations
        .map((entry) => entry.riskCategory)
        .filter((entry) => CATEGORY_PRECEDENCE.includes(entry));

    if (concernCategories.length > 0) {
        return {
            riskCategory: highestConcernCategory(concernCategories),
            evidenceSufficiency: combinedEvidenceSufficiency(domainInterpretations),
            basis: "highest explicit domain concern preserved without averaging or domain priority",
            sourceContractReferences: sourceReferencesFromDomains(domainInterpretations)
        };
    }

    if (invalidSources.length > 0) {
        return {
            riskCategory: RISK_CATEGORIES.UNKNOWN,
            evidenceSufficiency: EVIDENCE_SUFFICIENCY.UNKNOWN_SUFFICIENCY,
            basis: "valid domain assessments coexist with invalid sources",
            sourceContractReferences: sourceReferencesFromDomains(domainInterpretations)
        };
    }

    return {
        riskCategory: RISK_CATEGORIES.NO_CONFIRMED_RISK_INTERPRETATION,
        evidenceSufficiency: EVIDENCE_SUFFICIENCY.NOT_APPLICABLE,
        basis: "domain assessments contain no explicit supported risk drivers",
        sourceContractReferences: sourceReferencesFromDomains(domainInterpretations)
    };
}

function combinedEvidenceSufficiency(domainInterpretations) {
    const states = domainInterpretations.map((entry) => entry.evidenceSufficiency);

    if (states.includes(EVIDENCE_SUFFICIENCY.CONTRADICTED)) {
        return EVIDENCE_SUFFICIENCY.CONTRADICTED;
    }

    if (states.includes(EVIDENCE_SUFFICIENCY.UNKNOWN_SUFFICIENCY)) {
        return EVIDENCE_SUFFICIENCY.UNKNOWN_SUFFICIENCY;
    }

    if (states.includes(EVIDENCE_SUFFICIENCY.PROVISIONALLY_SUPPORTED)) {
        return EVIDENCE_SUFFICIENCY.PROVISIONALLY_SUPPORTED;
    }

    if (states.includes(EVIDENCE_SUFFICIENCY.INSUFFICIENTLY_SUPPORTED)) {
        return EVIDENCE_SUFFICIENCY.INSUFFICIENTLY_SUPPORTED;
    }

    if (states.includes(EVIDENCE_SUFFICIENCY.SUPPORTED)) {
        return EVIDENCE_SUFFICIENCY.SUPPORTED;
    }

    return EVIDENCE_SUFFICIENCY.NOT_APPLICABLE;
}

function highestConcernCategory(categories) {
    return categories.reduce((current, candidate) => {
        return CATEGORY_PRECEDENCE.indexOf(candidate) > CATEGORY_PRECEDENCE.indexOf(current)
            ? candidate
            : current;
    }, RISK_CATEGORIES.LOW_CONCERN);
}

function getExplicitCategory(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return null;
    }

    const direct = CATEGORY_SOURCE_FIELDS
        .map((field) => value[field])
        .map((entry) => explicitCategoryFromValue(entry))
        .find((entry) => entry);

    if (direct) {
        return direct;
    }

    if (value.value && typeof value.value === "object" && !Array.isArray(value.value)) {
        return getExplicitCategory(value.value);
    }

    if (value.hypothesis && typeof value.hypothesis === "object" && !Array.isArray(value.hypothesis)) {
        return getExplicitCategory(value.hypothesis);
    }

    return null;
}

function explicitCategoryFromValue(value) {
    if (typeof value === "string") {
        return EXPLICIT_CATEGORY_VALUES[normalizeToken(value)] || null;
    }

    if (value === true) {
        return null;
    }

    if (value && typeof value === "object" && !Array.isArray(value)) {
        return getExplicitCategory(value);
    }

    return null;
}

function isConcernCategory(category) {
    return CATEGORY_PRECEDENCE.includes(category);
}

function hasProfessionalUnknown(unknowns) {
    return unknowns.some((entry) => {
        const type = entry.value?.unknownType ?? entry.unknownType;
        return type && type !== "unknown-completeness";
    });
}

function interpretationBlockingConflicts(conflicts) {
    return conflicts.filter((entry) => INTERPRETATION_BLOCKING_CONFLICT_TYPES.includes(entry.type));
}

function conflictsForAssessment(conflicts, sourceReference) {
    return conflicts.filter((entry) => {
        return collectArray(entry.sourceContractReferences).includes(sourceReference);
    });
}

function buildDomainAssessmentReference(assessment) {
    return `${assessment.sourceReference}:domain:${assessment.domainId || "UNKNOWN_DOMAIN"}`;
}

function buildElementReference(sourceReference, elementType, index) {
    return `${sourceReference}:${elementType}:${String(index + 1).padStart(3, "0")}`;
}

function buildDomainLimitations({ assessment, riskDrivers, missingEvidence, unknowns, conflicts, blockingConflicts, evidenceSufficiency }) {
    const limitations = [];

    limitations.push("Interpretation is limited to source-bound internal model elements.");

    if (riskDrivers.length === 0) {
        limitations.push("No explicit structured risk driver was available for this domain assessment.");
    }

    if (missingEvidence.length > 0) {
        limitations.push("Missing evidence limits evidence sufficiency but does not create risk by itself.");
    }

    if (unknowns.length > 0) {
        limitations.push("Unknown items remain separate from completeness, invalid, and missing evidence states.");
    }

    if (conflicts.length > 0) {
        limitations.push("Conflicts are preserved and not resolved by the interpretation model.");
    }

    if (blockingConflicts.length > 0) {
        limitations.push("Evidence contradiction or positive-versus-risk conflict blocks a confirmed domain interpretation.");
    }

    if (assessment.completenessState !== COMPLETENESS.COMPLETE) {
        limitations.push(`Source completeness is ${assessment.completenessState}; completeness is not a risk category.`);
    }

    if (evidenceSufficiency === EVIDENCE_SUFFICIENCY.NOT_APPLICABLE) {
        limitations.push("Evidence sufficiency is not applicable because no confirmed risk interpretation was produced.");
    }

    return limitations;
}

function buildAssessmentLimitations(input, invalidSources) {
    const limitations = [
        "Risk interpretation does not calculate or expose a Building Risk Score.",
        "Risk interpretation does not calculate review priority, confidence, CAPEX, RUL, valuation, or acquisition advice.",
        "Risk interpretation does not produce a public contract, UI output, report, API result, or persistence record."
    ];

    if (input.assessmentState !== COMPLETENESS.COMPLETE) {
        limitations.push(`Internal model assessmentState is ${input.assessmentState}.`);
    }

    if (invalidSources.length > 0) {
        limitations.push("Invalid source contracts are preserved as limitations and do not create risk drivers.");
    }

    return limitations;
}

function buildAuditContext(input, domainInterpretations, conflicts) {
    return {
        interpretationModelVersion: INTERPRETATION_MODEL_VERSION,
        sourceInternalModelVersion: input.internalModelVersion,
        sourceContractReferences: collectArray(input.sourceContracts).map((entry) => entry.sourceReference),
        domainInterpretationReferences: domainInterpretations.map((entry) => entry.domainInterpretationReference),
        riskDriverReferences: domainInterpretations.flatMap((entry) => entry.riskDrivers.map((driver) => driver.riskDriverReference)),
        conflictReferences: conflicts.map((entry) => entry.conflictReference),
        transformations: [
            "internal model boundary validated",
            "domain assessment order preserved",
            "confidence contexts preserved without aggregation",
            "red flags preserved without derivation",
            "conflicts preserved without resolution",
            "risk categories assigned only from explicit structured source fields"
        ]
    };
}

function sourceReferencesFromDomains(domainInterpretations) {
    return domainInterpretations.map((entry) => entry.sourceReference);
}

function normalizeToken(value) {
    return value
        .trim()
        .replace(/([a-z])([A-Z])/g, "$1_$2")
        .replace(/[^a-zA-Z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .toUpperCase();
}

function collectArray(value) {
    return Array.isArray(value)
        ? value.map((entry) => cloneValue(entry))
        : [];
}

function cloneValue(value) {
    if (value === undefined) {
        return undefined;
    }

    return JSON.parse(JSON.stringify(value));
}
