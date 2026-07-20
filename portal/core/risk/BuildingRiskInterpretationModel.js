import { getRiskRelevanceGovernanceDefinition } from "./RiskRelevanceGovernanceRegistry.js";

const INTERPRETATION_MODEL_VERSION = "brs-risk-interpretation-1.0";
const SUPPORTED_INTERNAL_MODEL_VERSION = "brs-internal-model-1.0";
const RISK_RELEVANCE_GOVERNANCE_DEFINITION = getRiskRelevanceGovernanceDefinition();
const SUPPORTED_RISK_RELEVANCE_GOVERNANCE_VERSION = RISK_RELEVANCE_GOVERNANCE_DEFINITION.governanceVersion;

const RISK_RELEVANCE_INTERPRETATION_STATES = Object.freeze({
    INTERPRETED: "INTERPRETED",
    NOT_INTERPRETED: "NOT_INTERPRETED"
});

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
    "riskConcern"
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
    const riskRelevanceInterpretationResult = buildRiskRelevanceInterpretationResult(assessment);
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
        riskRelevanceInterpretations: riskRelevanceInterpretationResult.riskRelevanceInterpretations,
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
            evidenceSufficiency,
            riskRelevanceLimitations: riskRelevanceInterpretationResult.limitations
        })
    };
}

function buildRiskRelevanceInterpretationResult(assessment) {
    if (!hasOwnDataProperty(assessment, "riskRelevanceEntries")) {
        return {
            riskRelevanceInterpretations: Object.freeze([]),
            limitations: ["Risk Relevance preservation entries are not available on this Internal Model input."]
        };
    }

    if (!Array.isArray(assessment.riskRelevanceEntries)) {
        return {
            riskRelevanceInterpretations: Object.freeze([]),
            limitations: ["RR_SKIPPED_MALFORMED_ENTRY_WITHOUT_REFERENCE"]
        };
    }

    const references = new Map();
    const limitations = [];
    const interpretations = assessment.riskRelevanceEntries
        .map((entry, index) => {
            const interpretation = buildRiskRelevanceInterpretation({
                assessment,
                entry,
                entryPosition: index,
                references
            });

            if (!interpretation) {
                limitations.push("RR_SKIPPED_MALFORMED_ENTRY_WITHOUT_REFERENCE");
            }

            return interpretation;
        })
        .filter((entry) => entry);

    return {
        riskRelevanceInterpretations: Object.freeze(interpretations),
        limitations
    };
}

function buildRiskRelevanceInterpretation({ assessment, entry, entryPosition, references }) {
    void entryPosition;

    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        return null;
    }

    const sourceRiskRelevanceEntryReference = safeReference(entry.riskRelevanceEntryReference) || safeReference(entry.sourceElementReference);

    if (!sourceRiskRelevanceEntryReference) {
        return null;
    }

    const baseReference = `${sourceRiskRelevanceEntryReference}:interpretation`;
    const referenceCount = references.get(baseReference) || 0;
    references.set(baseReference, referenceCount + 1);

    const interpretationReason = getRiskRelevanceInterpretationReason(entry);
    const interpreted = isRiskRelevanceEntryInterpreted(entry, interpretationReason);
    const sourceElementIndex = parseSourceElementIndex(entry.sourceElementReference);
    const sourceHypothesisId = getSourceHypothesisId(assessment, sourceElementIndex);
    const interpretation = {
        riskRelevanceInterpretationReference: referenceCount === 0
            ? baseReference
            : `${baseReference}:${String(referenceCount + 1).padStart(3, "0")}`,
        sourceRiskRelevanceEntryReference,
        sourceReference: safeReference(entry.sourceReference) || assessment.sourceReference,
        sourceElementReference: safeReference(entry.sourceElementReference) || null,
        sourceElementType: typeof entry.sourceElementType === "string" ? entry.sourceElementType : null,
        canonicalValue: typeof entry.canonicalValue === "string" ? entry.canonicalValue : null,
        valueState: typeof entry.valueState === "string" ? entry.valueState : null,
        versionState: typeof entry.versionState === "string" ? entry.versionState : null,
        interpretationState: interpreted
            ? RISK_RELEVANCE_INTERPRETATION_STATES.INTERPRETED
            : RISK_RELEVANCE_INTERPRETATION_STATES.NOT_INTERPRETED,
        interpretationReason,
        governanceVersion: typeof entry.governanceVersion === "string" ? entry.governanceVersion : null,
        sourceRiskRelevanceVersion: safeScalar(entry.rawVersion),
        auditVisibility: "INTERNAL_AUDIT_VISIBLE"
    };

    if (Number.isInteger(sourceElementIndex)) {
        interpretation.sourceElementIndex = sourceElementIndex;
    }

    if (sourceHypothesisId) {
        interpretation.sourceHypothesisId = sourceHypothesisId;
    }

    if (hasOwnDataProperty(entry, "interpretationEligible")) {
        interpretation.preservedInterpretationEligible = entry.interpretationEligible === true;
    }

    if (interpreted) {
        interpretation.relevanceLevel = entry.canonicalValue;
    }

    return Object.freeze(interpretation);
}

function getRiskRelevanceInterpretationReason(entry) {
    if (!isStructurallyUsableRiskRelevanceEntry(entry)) {
        return "RR_NOT_ELIGIBLE_MALFORMED_ENTRY";
    }

    const valueStates = RISK_RELEVANCE_GOVERNANCE_DEFINITION.valueStates;
    const versionStates = RISK_RELEVANCE_GOVERNANCE_DEFINITION.versionStates;

    if (entry.governanceVersion !== SUPPORTED_RISK_RELEVANCE_GOVERNANCE_VERSION) {
        return "RR_NOT_ELIGIBLE_UNSUPPORTED_GOVERNANCE_VERSION";
    }

    if (entry.valueState === valueStates.CANONICAL && entry.versionState === versionStates.VERSION_SUPPORTED) {
        return entry.canonicalValue
            ? "RR_ELIGIBLE_CANONICAL_SUPPORTED_VERSION"
            : "RR_NOT_ELIGIBLE_MISSING_CANONICAL_VALUE";
    }

    if (entry.valueState === valueStates.CANONICAL && entry.versionState === versionStates.UNKNOWN_VERSION) {
        return "RR_NOT_ELIGIBLE_CANONICAL_UNKNOWN_VERSION";
    }

    if (entry.valueState === valueStates.CANONICAL && entry.versionState === versionStates.VERSION_UNSUPPORTED) {
        return "RR_NOT_ELIGIBLE_UNSUPPORTED_VERSION";
    }

    if (entry.valueState === valueStates.LEGACY_SUPPORTED && entry.versionState === versionStates.VERSION_SUPPORTED) {
        return entry.canonicalValue
            ? "RR_ELIGIBLE_LEGACY_SUPPORTED_VERSION"
            : "RR_NOT_ELIGIBLE_MISSING_CANONICAL_VALUE";
    }

    if (entry.valueState === valueStates.LEGACY_SUPPORTED && entry.versionState === versionStates.UNKNOWN_VERSION) {
        return "RR_NOT_ELIGIBLE_LEGACY_UNKNOWN_VERSION";
    }

    if (entry.valueState === valueStates.LEGACY_SUPPORTED && entry.versionState === versionStates.VERSION_UNSUPPORTED) {
        return "RR_NOT_ELIGIBLE_LEGACY_UNSUPPORTED_VERSION";
    }

    if (entry.valueState === valueStates.LEGACY_UNSUPPORTED && entry.versionState === versionStates.VERSION_UNSUPPORTED) {
        return "RR_NOT_ELIGIBLE_UNSUPPORTED_VALUE_AND_VERSION";
    }

    if (entry.valueState === valueStates.LEGACY_UNSUPPORTED) {
        return "RR_NOT_ELIGIBLE_UNSUPPORTED_VALUE";
    }

    if (entry.valueState === valueStates.UNKNOWN_VALUE && entry.versionState === versionStates.VERSION_UNSUPPORTED) {
        return "RR_NOT_ELIGIBLE_UNKNOWN_VALUE_UNSUPPORTED_VERSION";
    }

    if (entry.valueState === valueStates.UNKNOWN_VALUE) {
        return "RR_NOT_ELIGIBLE_UNKNOWN_VALUE";
    }

    if (entry.valueState === valueStates.INVALID_VALUE && entry.versionState === versionStates.VERSION_UNSUPPORTED) {
        return "RR_NOT_ELIGIBLE_INVALID_VALUE_UNSUPPORTED_VERSION";
    }

    if (entry.valueState === valueStates.INVALID_VALUE) {
        return "RR_NOT_ELIGIBLE_INVALID_VALUE";
    }

    if (entry.valueState === valueStates.NOT_PRESENT) {
        return "RR_NOT_ELIGIBLE_NOT_PRESENT";
    }

    return "RR_NOT_ELIGIBLE_MALFORMED_ENTRY";
}

function isRiskRelevanceEntryInterpreted(entry, interpretationReason) {
    return (
        interpretationReason === "RR_ELIGIBLE_CANONICAL_SUPPORTED_VERSION" ||
        interpretationReason === "RR_ELIGIBLE_LEGACY_SUPPORTED_VERSION"
    ) &&
        typeof entry.canonicalValue === "string" &&
        entry.governanceVersion === SUPPORTED_RISK_RELEVANCE_GOVERNANCE_VERSION;
}

function isStructurallyUsableRiskRelevanceEntry(entry) {
    return typeof entry.valueState === "string" &&
    typeof entry.versionState === "string";
}

function getSourceHypothesisId(assessment, sourceElementIndex) {
    if (!Number.isInteger(sourceElementIndex)) {
        return null;
    }

    const hypothesis = Array.isArray(assessment.hypotheses)
        ? assessment.hypotheses[sourceElementIndex]?.hypothesis
        : null;

    return typeof hypothesis?.id === "string" && hypothesis.id.length > 0
        ? hypothesis.id
        : null;
}

function parseSourceElementIndex(sourceElementReference) {
    if (typeof sourceElementReference !== "string") {
        return null;
    }

    const match = sourceElementReference.match(/:hypothesis:(\d+)$/);

    return match
        ? Number.parseInt(match[1], 10) - 1
        : null;
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
        .map((field) => readOwnDataValue(value, field))
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

function buildDomainLimitations({ assessment, riskDrivers, missingEvidence, unknowns, conflicts, blockingConflicts, evidenceSufficiency, riskRelevanceLimitations = [] }) {
    const limitations = [];

    limitations.push("Interpretation is limited to source-bound internal model elements.");
    riskRelevanceLimitations.forEach((entry) => limitations.push(entry));

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
        riskRelevanceInterpretationReferences: domainInterpretations.flatMap((entry) => entry.riskRelevanceInterpretations.map((interpretation) => interpretation.riskRelevanceInterpretationReference)),
        conflictReferences: conflicts.map((entry) => entry.conflictReference),
        transformations: [
            "internal model boundary validated",
            "domain assessment order preserved",
            "confidence contexts preserved without aggregation",
            "red flags preserved without derivation",
            "conflicts preserved without resolution",
            "risk categories assigned only from explicit structured source fields",
            "risk relevance interpretations derived only from preserved riskRelevanceEntries"
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

function cloneValue(value, seen = new WeakMap()) {
    if (value === undefined) {
        return undefined;
    }

    if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        return value;
    }

    if (typeof value === "bigint") {
        return value.toString();
    }

    if (typeof value === "symbol" || typeof value === "function") {
        return undefined;
    }

    if (typeof value !== "object") {
        return undefined;
    }

    if (seen.has(value)) {
        return "[Circular]";
    }

    if (Array.isArray(value)) {
        seen.set(value, true);
        return value.map((entry) => cloneValue(entry, seen));
    }

    seen.set(value, true);

    return Object.keys(value).reduce((clone, key) => {
        if (key === "riskRelevance" || key === "riskRelevanceVersion" || key === "rawValue") {
            return clone;
        }

        const descriptor = getOwnDescriptor(value, key);

        if (!descriptor || !Object.hasOwn(descriptor, "value")) {
            return clone;
        }

        if (descriptor.value === undefined) {
            clone[key] = undefined;
            return clone;
        }

        const cloned = cloneValue(descriptor.value, seen);

        if (cloned !== undefined) {
            clone[key] = cloned;
        }

        return clone;
    }, {});
}

function readOwnDataValue(value, field) {
    const descriptor = getOwnDescriptor(value, field);

    return descriptor && Object.hasOwn(descriptor, "value")
        ? descriptor.value
        : undefined;
}

function hasOwnDataProperty(value, field) {
    return Boolean(getOwnDescriptor(value, field));
}

function getOwnDescriptor(value, field) {
    if (!value || (typeof value !== "object" && typeof value !== "function")) {
        return null;
    }

    try {
        return Object.getOwnPropertyDescriptor(value, field) || null;
    } catch {
        return null;
    }
}

function safeReference(value) {
    return typeof value === "string" && value.length > 0
        ? value
        : null;
}

function safeScalar(value) {
    if (value === null || value === undefined || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        return value;
    }

    if (typeof value === "bigint") {
        return value.toString();
    }

    return null;
}
