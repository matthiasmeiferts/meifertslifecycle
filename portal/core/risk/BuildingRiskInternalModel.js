/**
 * MBLS Building Risk Score Layer
 * Internal Domain Model
 *
 * Deterministic preservation-and-preparation model for ExpertReasoningContracts.
 * This module does not calculate risk, calculate confidence, score, persist,
 * render UI, create reports, call providers, or inspect router state.
 */

import {
    classifyRiskRelevanceValue,
    classifyRiskRelevanceVersion
} from "./RiskRelevanceGovernanceRegistry.js";

const INTERNAL_MODEL_VERSION = "brs-internal-model-1.0";

const COMPLETENESS = Object.freeze({
    COMPLETE: "COMPLETE",
    INCOMPLETE: "INCOMPLETE",
    LEGACY: "LEGACY",
    UNKNOWN_COMPLETENESS: "UNKNOWN_COMPLETENESS",
    INVALID: "INVALID",
    NOT_ASSESSED: "NOT_ASSESSED"
});

const CONFLICT_TYPES = Object.freeze({
    POSITIVE_VS_RISK: "POSITIVE_VS_RISK",
    EVIDENCE_CONTRADICTION: "EVIDENCE_CONTRADICTION",
    DOMAIN_OVERLAP: "DOMAIN_OVERLAP",
    CONFIDENCE_DIVERGENCE: "CONFIDENCE_DIVERGENCE",
    RECOMMENDATION_DIVERGENCE: "RECOMMENDATION_DIVERGENCE",
    STATUS_CONFLICT: "STATUS_CONFLICT",
    VERSION_CONFLICT: "VERSION_CONFLICT"
});

const CONTRACT_ARRAY_KEYS = [
    "alternativeHypotheses",
    "supportingEvidence",
    "missingEvidence",
    "requiredVerification",
    "potentialConsequences"
];

const EVIDENCE_SECTIONS = [
    "supportingEvidence",
    "missingEvidence",
    "requiredVerification",
    "potentialConsequences"
];

const HYPOTHESIS_EVIDENCE_SECTIONS = [
    "supportingIndicators",
    "contradictingIndicators",
    "requiredVerification",
    "potentialConsequences",
    "recommendedActions"
];

export default class BuildingRiskInternalModel {

    static get MODEL_VERSION() {
        return INTERNAL_MODEL_VERSION;
    }

    static get COMPLETENESS() {
        return COMPLETENESS;
    }

    static get CONFLICT_TYPES() {
        return CONFLICT_TYPES;
    }

    static build(input = {}) {
        const source = normalizeInput(input);

        if (!source.validInput) {
            return buildBaseModel({
                assessmentContext: source.assessmentContext,
                assessmentState: COMPLETENESS.INVALID,
                invalidSources: [
                    {
                        sourceReference: "brs-invalid-input-001",
                        completenessState: COMPLETENESS.INVALID,
                        reason: "Input must be an ExpertReasoningContract, an ordered contract collection, or an assessment context with contracts."
                    }
                ],
                transformations: ["invalid overall input rejected"]
            });
        }

        if (source.contracts.length === 0) {
            return buildBaseModel({
                assessmentContext: source.assessmentContext,
                assessmentState: COMPLETENESS.NOT_ASSESSED,
                transformations: ["empty contract collection classified as not assessed"]
            });
        }

        const referenceState = new Map();
        const prepared = source.contracts.map((contract, index) => {
            return prepareContract(contract, index, referenceState);
        });
        const sourceContracts = prepared.map((entry) => entry.sourceContract);
        const domainAssessments = prepared
            .filter((entry) => entry.domainAssessment)
            .map((entry) => entry.domainAssessment);
        const invalidSources = prepared
            .filter((entry) => entry.invalidSource)
            .map((entry) => entry.invalidSource);
        const conflicts = buildConflicts(domainAssessments);
        const evidenceReferences = domainAssessments.flatMap((assessment) => assessment.evidenceReferences);
        const assessmentState = domainAssessments.length === 0 && invalidSources.length > 0
            ? COMPLETENESS.INVALID
            : invalidSources.length > 0
                ? COMPLETENESS.INCOMPLETE
                : COMPLETENESS.COMPLETE;

        return {
            ...buildBaseModel({
                assessmentContext: source.assessmentContext,
                assessmentState,
                sourceContracts,
                domainAssessments,
                invalidSources,
                conflicts,
                transformations: [
                    "input order preserved",
                    "source contract references prepared",
                    "evidence references prepared",
                    "completeness states classified",
                    "explicit conflicts preserved"
                ]
            }),
            auditContext: {
                internalModelVersion: INTERNAL_MODEL_VERSION,
                sourceContractReferences: sourceContracts.map((entry) => entry.sourceReference),
                evidenceReferences: evidenceReferences.map((entry) => entry.evidenceReference),
                conflictReferences: conflicts.map((entry) => entry.conflictReference),
                transformations: [
                    "input order preserved",
                    "technical empty values normalized",
                    "source references formed deterministically",
                    "evidence references formed deterministically",
                    "confidence values preserved without aggregation"
                ]
            }
        };
    }

}

function buildBaseModel({
    assessmentContext = {},
    assessmentState = COMPLETENESS.COMPLETE,
    sourceContracts = [],
    domainAssessments = [],
    invalidSources = [],
    conflicts = [],
    transformations = []
} = {}) {
    return {
        internalModelVersion: INTERNAL_MODEL_VERSION,
        assessmentState,
        assessmentContext: cloneObject(assessmentContext),
        sourceContracts,
        domainAssessments,
        invalidSources,
        conflicts,
        auditContext: {
            internalModelVersion: INTERNAL_MODEL_VERSION,
            sourceContractReferences: sourceContracts.map((entry) => entry.sourceReference),
            evidenceReferences: domainAssessments.flatMap((assessment) => assessment.evidenceReferences.map((entry) => entry.evidenceReference)),
            conflictReferences: conflicts.map((entry) => entry.conflictReference),
            transformations
        }
    };
}

function normalizeInput(input) {
    if (isExpertReasoningContract(input)) {
        return {
            validInput: true,
            assessmentContext: {},
            contracts: [input]
        };
    }

    if (Array.isArray(input)) {
        return {
            validInput: true,
            assessmentContext: {},
            contracts: input
        };
    }

    if (!input || typeof input !== "object") {
        return {
            validInput: false,
            assessmentContext: {},
            contracts: []
        };
    }

    const assessmentContext = cloneObject(input.assessmentContext);

    if (Array.isArray(input.contracts)) {
        return {
            validInput: true,
            assessmentContext,
            contracts: input.contracts
        };
    }

    if (isExpertReasoningContract(input.contract)) {
        return {
            validInput: true,
            assessmentContext,
            contracts: [input.contract]
        };
    }

    return {
        validInput: false,
        assessmentContext,
        contracts: []
    };
}

function prepareContract(contract, index, referenceState) {
    const localReference = formatSourceReference(index);
    const completenessState = classifyCompleteness(contract);
    const versionState = getVersionState(contract);
    const referenceOrigin = getReferenceOrigin(contract, completenessState);
    const sourceReference = buildSourceReference(contract, localReference, referenceState, referenceOrigin);

    const sourceContract = {
        sourceReference,
        localReference,
        sourcePosition: index,
        completenessState,
        contractVersion: versionState.value,
        contractVersionState: versionState.state,
        referenceOrigin
    };

    if (completenessState === COMPLETENESS.INVALID) {
        return {
            sourceContract,
            invalidSource: {
                sourceReference,
                localReference,
                sourcePosition: index,
                completenessState,
                reason: "Source does not expose the minimum ExpertReasoningContract boundary."
            }
        };
    }

    const evidenceReferences = collectEvidenceReferences(contract, sourceReference);
    const hypotheses = collectHypotheses(contract, sourceReference);
    const riskRelevanceEntries = collectRiskRelevanceEntries(contract, sourceReference);
    const recommendations = collectRecommendations(contract, sourceReference);
    const unknowns = collectUnknowns(contract, sourceReference, completenessState);
    const redFlags = collectRedFlags(contract, sourceReference);
    const positiveIndicators = collectPositiveIndicators(contract, sourceReference);
    const guardrails = collectArray(contract.guardrails).concat(collectArray(contract.limitations));
    const domainId = getDomainId(contract);

    return {
        sourceContract,
        domainAssessment: {
            sourceReference,
            sourcePosition: index,
            domainId,
            domainState: domainId === "UNKNOWN_DOMAIN" ? "unknown" : "known",
            contractVersion: versionState.value,
            contractVersionState: versionState.state,
            completenessState,
            hypotheses,
            riskRelevanceEntries,
            evidenceReferences,
            missingEvidence: collectArray(contract.missingEvidence),
            unknowns,
            positiveIndicators,
            redFlags,
            recommendations,
            confidenceContext: {
                sourceReference,
                value: Object.hasOwn(contract, "confidence") ? cloneValue(contract.confidence) : null,
                availabilityState: Object.hasOwn(contract, "confidence") ? "available" : "unknown"
            },
            guardrails,
            sourceReferences: [sourceReference]
        }
    };
}

function classifyCompleteness(contract) {
    if (!contract || typeof contract !== "object" || Array.isArray(contract)) {
        return COMPLETENESS.INVALID;
    }

    if (!isExpertReasoningContract(contract)) {
        return hasContractLikeFields(contract)
            ? COMPLETENESS.UNKNOWN_COMPLETENESS
            : COMPLETENESS.INVALID;
    }

    const hasAllArrays = CONTRACT_ARRAY_KEYS.every((key) => Array.isArray(contract[key]));
    const hasConfidence = Object.hasOwn(contract, "confidence");
    const primary = contract.primaryHypothesis;
    const hasProviderNativeStatus = primary && primary.status === "hypothesis";
    const hasProviderNativeIdentity = Boolean(primary && (primary.id || primary.cause));

    if (hasAllArrays && hasConfidence && hasProviderNativeStatus && hasProviderNativeIdentity) {
        return COMPLETENESS.COMPLETE;
    }

    if (hasAllArrays && hasConfidence && !hasProviderNativeStatus) {
        return COMPLETENESS.LEGACY;
    }

    if (primary && (hasConfidence || CONTRACT_ARRAY_KEYS.some((key) => Array.isArray(contract[key])))) {
        return COMPLETENESS.INCOMPLETE;
    }

    return COMPLETENESS.UNKNOWN_COMPLETENESS;
}

function isExpertReasoningContract(value) {
    return Boolean(
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        value.primaryHypothesis &&
        typeof value.primaryHypothesis === "object" &&
        !Array.isArray(value.primaryHypothesis)
    );
}

function hasContractLikeFields(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
    }

    return [
        "alternativeHypotheses",
        "supportingEvidence",
        "missingEvidence",
        "requiredVerification",
        "potentialConsequences",
        "confidence"
    ].some((key) => Object.hasOwn(value, key));
}

function buildSourceReference(contract, localReference, referenceState, referenceOrigin) {
    const externalReference = getExternalReference(contract);
    const candidate = externalReference || localReference;
    const count = referenceState.get(candidate) || 0;
    referenceState.set(candidate, count + 1);

    if (count === 0) {
        return candidate;
    }

    return `${candidate}::${localReference}`;
}

function getExternalReference(contract) {
    const candidates = [
        contract?.sourceReference,
        contract?.sourceContractReference,
        contract?.contractReference,
        contract?.metadata?.sourceReference,
        contract?.metadata?.contractReference
    ];

    const reference = candidates.find((candidate) => isSafeReference(candidate));

    return reference ? String(reference) : null;
}

function isSafeReference(value) {
    return typeof value === "string" &&
        value.length > 0 &&
        value.length <= 120 &&
        /^[A-Za-z0-9._:-]+$/.test(value) &&
        !value.includes("@");
}

function getReferenceOrigin(contract, completenessState) {
    if (getExternalReference(contract)) {
        return "provided";
    }

    if (completenessState === COMPLETENESS.LEGACY) {
        return "legacy-derived";
    }

    return "derived";
}

function formatSourceReference(index) {
    return `brs-src-${String(index + 1).padStart(3, "0")}`;
}

function getVersionState(contract) {
    const version = contract?.contractVersion ??
        contract?.version ??
        contract?.metadata?.contractVersion ??
        contract?.metadata?.version;

    if (typeof version === "string" && version.trim().length > 0) {
        return {
            state: "known",
            value: version
        };
    }

    return {
        state: "unknown",
        value: null
    };
}

function getDomainId(contract) {
    const domain = contract?.domain ??
        contract?.domainId ??
        contract?.primaryHypothesis?.domain ??
        contract?.primaryHypothesis?.domainId ??
        contract?.metadata?.domain ??
        contract?.metadata?.domainId;

    return typeof domain === "string" && domain.trim().length > 0
        ? domain
        : "UNKNOWN_DOMAIN";
}

function collectHypotheses(contract, sourceReference) {
    const primary = contract.primaryHypothesis
        ? [{ role: "primary", sourceReference, hypothesis: cloneHypothesis(contract.primaryHypothesis) }]
        : [];

    const alternatives = Array.isArray(contract.alternativeHypotheses)
        ? contract.alternativeHypotheses.map((hypothesis, index) => ({
        role: "alternative",
        sourceReference,
        alternativePosition: index,
        hypothesis: cloneHypothesis(hypothesis)
    }))
        : [];

    return [...primary, ...alternatives];
}

function cloneHypothesis(hypothesis) {
    if (!hypothesis || typeof hypothesis !== "object" || Array.isArray(hypothesis)) {
        return {};
    }

    const cloneSource = {};
    Object.keys(hypothesis).forEach((key) => {
        if (key !== "riskRelevance" && key !== "riskRelevanceVersion") {
            cloneSource[key] = hypothesis[key];
        }
    });

    const cloned = cloneObject(cloneSource);
    preserveOwnField(cloned, hypothesis, "riskRelevance");
    preserveOwnField(cloned, hypothesis, "riskRelevanceVersion");

    return cloned;
}

function preserveOwnField(target, source, field) {
    const value = readOwnValueWithoutGetter(source, field);

    if (value.present) {
        target[field] = value.rawValue;
    }
}

function collectRiskRelevanceEntries(contract, sourceReference) {
    const entries = [];

    if (contract.primaryHypothesis && typeof contract.primaryHypothesis === "object" && !Array.isArray(contract.primaryHypothesis)) {
        entries.push(buildRiskRelevanceEntry({
            sourceReference,
            sourceElementReference: buildHypothesisReference(sourceReference, 0),
            sourceElementType: "primary-hypothesis",
            sourceElement: contract.primaryHypothesis
        }));
    }

    if (Array.isArray(contract.alternativeHypotheses)) {
        contract.alternativeHypotheses.forEach((hypothesis, index) => {
            if (!hypothesis || typeof hypothesis !== "object" || Array.isArray(hypothesis)) {
                return;
            }

            entries.push(buildRiskRelevanceEntry({
                sourceReference,
                sourceElementReference: buildHypothesisReference(sourceReference, index + 1),
                sourceElementType: "alternative-hypothesis",
                sourceElement: hypothesis
            }));
        });
    }

    return entries;
}

function buildRiskRelevanceEntry({ sourceReference, sourceElementReference, sourceElementType, sourceElement }) {
    const valuePresent = hasOwnField(sourceElement, "riskRelevance");
    const versionPresent = hasOwnField(sourceElement, "riskRelevanceVersion");
    const valueResult = classifyRiskRelevanceValue(
        readOwnValueWithoutGetter(sourceElement, "riskRelevance").rawValue,
        { isPresent: valuePresent }
    );
    const versionResult = classifyRiskRelevanceVersion(
        readOwnValueWithoutGetter(sourceElement, "riskRelevanceVersion").rawValue,
        { isPresent: versionPresent }
    );

    return Object.freeze({
        riskRelevanceEntryReference: `${sourceElementReference}:risk-relevance`,
        sourceReference,
        sourceElementReference,
        sourceElementType,
        sourceField: "riskRelevance",
        valuePresent,
        rawValue: valueResult.rawValue,
        canonicalValue: valueResult.canonicalValue,
        valueState: valueResult.valueState,
        versionField: "riskRelevanceVersion",
        versionPresent,
        rawVersion: versionResult.sourceVersion,
        versionState: versionResult.versionState,
        governanceVersion: versionResult.governanceVersion,
        interpretationEligible: false
    });
}

function hasOwnField(sourceElement, field) {
    try {
        return Object.hasOwn(sourceElement, field);
    } catch {
        return false;
    }
}

function readOwnValueWithoutGetter(sourceElement, field) {
    try {
        const descriptor = Object.getOwnPropertyDescriptor(sourceElement, field);

        if (!descriptor) {
            return { present: false, rawValue: undefined };
        }

        if (Object.hasOwn(descriptor, "value")) {
            return { present: true, rawValue: descriptor.value };
        }

        return { present: true, rawValue: descriptor.get || descriptor.set || undefined };
    } catch {
        return { present: false, rawValue: undefined };
    }
}

function buildHypothesisReference(sourceReference, index) {
    return `${sourceReference}:hypothesis:${String(index + 1).padStart(3, "0")}`;
}

function collectEvidenceReferences(contract, sourceReference) {
    const entries = [];
    const seen = new Map();

    EVIDENCE_SECTIONS.forEach((section) => {
        collectArray(contract[section]).forEach((entry, index) => {
            addEvidenceEntry({
                entries,
                seen,
                sourceReference,
                section,
                entry,
                originalPosition: index
            });
        });
    });

    collectHypothesisEvidence({
        entries,
        seen,
        sourceReference,
        hypothesis: contract.primaryHypothesis,
        role: "primary",
        hypothesisPosition: 0
    });

    collectArray(contract.alternativeHypotheses).forEach((hypothesis, index) => {
        collectHypothesisEvidence({
            entries,
            seen,
            sourceReference,
            hypothesis,
            role: "alternative",
            hypothesisPosition: index
        });
    });

    return entries;
}

function collectHypothesisEvidence({ entries, seen, sourceReference, hypothesis, role, hypothesisPosition }) {
    if (!hypothesis || typeof hypothesis !== "object") {
        return;
    }

    HYPOTHESIS_EVIDENCE_SECTIONS.forEach((section) => {
        collectArray(hypothesis[section]).forEach((entry, index) => {
            addEvidenceEntry({
                entries,
                seen,
                sourceReference,
                section: `${role}Hypothesis.${section}`,
                entry,
                originalPosition: index,
                hypothesisRole: role,
                hypothesisPosition
            });
        });
    });
}

function addEvidenceEntry({
    entries,
    seen,
    sourceReference,
    section,
    entry,
    originalPosition,
    hypothesisRole = null,
    hypothesisPosition = null
}) {
    const fingerprint = `${section}::${stableString(entry)}`;
    const duplicate = seen.get(fingerprint);

    if (duplicate) {
        duplicate.duplicatePositions.push(originalPosition);
        duplicate.aliases.push(buildEvidenceReference(sourceReference, section, entries.length + duplicate.aliases.length));
        return;
    }

    const evidenceReference = buildEvidenceReference(sourceReference, section, entries.length);
    const evidence = {
        evidenceReference,
        sourceReference,
        section,
        originalPosition,
        value: cloneValue(entry),
        duplicatePositions: [],
        aliases: []
    };

    if (hypothesisRole) {
        evidence.hypothesisRole = hypothesisRole;
        evidence.hypothesisPosition = hypothesisPosition;
    }

    entries.push(evidence);
    seen.set(fingerprint, evidence);
}

function buildEvidenceReference(sourceReference, section, index) {
    return `${sourceReference}:evidence:${slug(section)}:${String(index + 1).padStart(3, "0")}`;
}

function collectRecommendations(contract, sourceReference) {
    const recommendations = collectArray(contract.requiredVerification).map((entry, index) => ({
        sourceReference,
        sourceField: "requiredVerification",
        sourcePosition: index,
        value: cloneValue(entry)
    }));

    collectHypotheses(contract, sourceReference).forEach((entry) => {
        collectArray(entry.hypothesis.recommendedActions).forEach((action, index) => {
            recommendations.push({
                sourceReference,
                sourceField: `${entry.role}Hypothesis.recommendedActions`,
                sourcePosition: index,
                value: cloneValue(action)
            });
        });
    });

    return recommendations;
}

function collectUnknowns(contract, sourceReference, completenessState) {
    const unknowns = [];
    const primary = contract.primaryHypothesis || {};
    const text = [primary.label, primary.cause, primary.category, primary.rationale]
        .map((entry) => String(entry || "").toLowerCase())
        .join(" ");

    if (text.includes("insufficient information") || text.includes("unknown")) {
        unknowns.push({
            sourceReference,
            unknownType: "source-contract-outcome",
            basis: "primaryHypothesis"
        });
    }

    if (completenessState === COMPLETENESS.UNKNOWN_COMPLETENESS) {
        unknowns.push({
            sourceReference,
            unknownType: "unknown-completeness",
            basis: "completenessState"
        });
    }

    return unknowns;
}

function collectRedFlags(contract, sourceReference) {
    const redFlags = collectArray(contract.redFlags).map((entry, index) => ({
        sourceReference,
        sourceField: "redFlags",
        sourcePosition: index,
        value: cloneValue(entry)
    }));

    collectHypotheses(contract, sourceReference).forEach((entry) => {
        collectArray(entry.hypothesis.redFlags).forEach((redFlag, index) => {
            redFlags.push({
                sourceReference,
                sourceField: `${entry.role}Hypothesis.redFlags`,
                sourcePosition: index,
                value: cloneValue(redFlag)
            });
        });
    });

    return redFlags;
}

function collectPositiveIndicators(contract, sourceReference) {
    return collectArray(contract.positiveIndicators).map((entry, index) => ({
        sourceReference,
        sourceField: "positiveIndicators",
        sourcePosition: index,
        value: cloneValue(entry)
    }));
}

function buildConflicts(domainAssessments) {
    const conflicts = [];

    addDomainOverlapConflicts(conflicts, domainAssessments);
    addConfidenceDivergenceConflict(conflicts, domainAssessments);
    addRecommendationDivergenceConflict(conflicts, domainAssessments);
    addStatusConflict(conflicts, domainAssessments);
    addVersionConflict(conflicts, domainAssessments);
    addEvidenceContradictionConflict(conflicts, domainAssessments);

    return conflicts.map((conflict, index) => ({
        conflictReference: `brs-conflict-${String(index + 1).padStart(3, "0")}`,
        status: "unresolved",
        ...conflict
    }));
}

function addDomainOverlapConflicts(conflicts, assessments) {
    const groups = groupBy(assessments.filter((entry) => entry.domainId !== "UNKNOWN_DOMAIN"), (entry) => entry.domainId);

    Object.entries(groups).forEach(([domainId, entries]) => {
        if (entries.length > 1) {
            conflicts.push({
                type: CONFLICT_TYPES.DOMAIN_OVERLAP,
                sourceContractReferences: entries.map((entry) => entry.sourceReference),
                basis: { domainId }
            });
        }
    });
}

function addConfidenceDivergenceConflict(conflicts, assessments) {
    const withConfidence = assessments.filter((entry) => entry.confidenceContext.availabilityState === "available");
    const values = new Set(withConfidence.map((entry) => stableString(entry.confidenceContext.value)));

    if (values.size > 1) {
        conflicts.push({
            type: CONFLICT_TYPES.CONFIDENCE_DIVERGENCE,
            sourceContractReferences: withConfidence.map((entry) => entry.sourceReference),
            basis: {
                confidenceValues: withConfidence.map((entry) => ({
                    sourceReference: entry.sourceReference,
                    value: cloneValue(entry.confidenceContext.value)
                }))
            }
        });
    }
}

function addRecommendationDivergenceConflict(conflicts, assessments) {
    const withRecommendations = assessments.filter((entry) => entry.recommendations.length > 0);
    const values = new Set(withRecommendations.map((entry) => stableString(entry.recommendations.map((item) => item.value))));

    if (values.size > 1) {
        conflicts.push({
            type: CONFLICT_TYPES.RECOMMENDATION_DIVERGENCE,
            sourceContractReferences: withRecommendations.map((entry) => entry.sourceReference),
            basis: "different public recommendation or verification sets"
        });
    }
}

function addStatusConflict(conflicts, assessments) {
    const statuses = assessments.map((entry) => ({
        sourceReference: entry.sourceReference,
        status: entry.hypotheses[0]?.hypothesis?.status || entry.completenessState
    }));
    const values = new Set(statuses.map((entry) => entry.status));

    if (values.size > 1) {
        conflicts.push({
            type: CONFLICT_TYPES.STATUS_CONFLICT,
            sourceContractReferences: statuses.map((entry) => entry.sourceReference),
            basis: statuses
        });
    }
}

function addVersionConflict(conflicts, assessments) {
    const versions = assessments.map((entry) => ({
        sourceReference: entry.sourceReference,
        version: entry.contractVersion,
        versionState: entry.contractVersionState
    }));
    const values = new Set(versions.map((entry) => `${entry.versionState}:${entry.version || "unknown"}`));

    if (values.size > 1) {
        conflicts.push({
            type: CONFLICT_TYPES.VERSION_CONFLICT,
            sourceContractReferences: versions.map((entry) => entry.sourceReference),
            basis: versions
        });
    }
}

function addEvidenceContradictionConflict(conflicts, assessments) {
    const supporting = collectEvidenceBySections(assessments, ["supportingEvidence", "primaryHypothesis.supportingIndicators", "alternativeHypothesis.supportingIndicators"]);
    const missing = collectEvidenceBySections(assessments, ["missingEvidence", "primaryHypothesis.contradictingIndicators", "alternativeHypothesis.contradictingIndicators"]);
    const supportingTexts = new Map(supporting.map((entry) => [normalizeEvidence(entry.value), entry]));

    const contradictions = missing
        .map((entry) => ({ missing: entry, supporting: supportingTexts.get(normalizeEvidence(entry.value)) }))
        .filter((entry) => entry.supporting && normalizeEvidence(entry.missing.value).length > 0);

    if (contradictions.length > 0) {
        const references = new Set();
        contradictions.forEach((entry) => {
            references.add(entry.missing.sourceReference);
            references.add(entry.supporting.sourceReference);
        });

        conflicts.push({
            type: CONFLICT_TYPES.EVIDENCE_CONTRADICTION,
            sourceContractReferences: [...references],
            basis: contradictions.map((entry) => ({
                supportingEvidenceReference: entry.supporting.evidenceReference,
                missingEvidenceReference: entry.missing.evidenceReference
            }))
        });
    }
}

function collectEvidenceBySections(assessments, sections) {
    return assessments.flatMap((assessment) => {
        return assessment.evidenceReferences.filter((entry) => sections.includes(entry.section));
    });
}

function groupBy(values, getKey) {
    return values.reduce((groups, value) => {
        const key = getKey(value);
        groups[key] = groups[key] || [];
        groups[key].push(value);
        return groups;
    }, {});
}

function collectArray(value) {
    return Array.isArray(value)
        ? value.map((entry) => cloneValue(entry))
        : [];
}

function cloneObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return {};
    }

    return cloneValue(value);
}

function cloneValue(value) {
    if (value === undefined) {
        return undefined;
    }

    return JSON.parse(JSON.stringify(value));
}

function stableString(value) {
    if (value === null || typeof value !== "object") {
        return String(value);
    }

    if (Array.isArray(value)) {
        return `[${value.map((entry) => stableString(entry)).join(",")}]`;
    }

    return `{${Object.keys(value).sort().map((key) => `${key}:${stableString(value[key])}`).join(",")}}`;
}

function normalizeEvidence(value) {
    return stableString(value).trim().toLowerCase();
}

function slug(value) {
    return String(value)
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase();
}
