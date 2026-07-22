import FoundationVersion from "./FoundationVersion.js";

export default class ReportAssemblyEngine {

    static assembleReport({
        context = {},
        findings = [],
        assessments = [],
        recommendations = [],
        expertIntelligenceProjection = null,
        generatedAt = new Date().toISOString()
    } = {}) {

        return {

            metadata: {

                generatedAt:
                    generatedAt,

                reportVersion:
                    FoundationVersion.CURRENT,

                findingCount:
                    findings.length,

                assessmentCount:
                    assessments.length,

                recommendationCount:
                    recommendations.length

            },

            context,

            findings:
                [...findings],

            assessments:
                [...assessments],

            recommendations:
                [...recommendations],

            expertIntelligence:
                createExpertIntelligenceSection(
                    expertIntelligenceProjection
                ),

            summary: {

                highestRisk:
                    this.determineHighestRisk(
                        assessments
                    ),

                totalFindings:
                    findings.length,

                totalAssessments:
                    assessments.length,

                totalRecommendations:
                    recommendations.length

            }

        };

    }

    static determineHighestRisk(
        assessments = []
    ) {

        const ranking = [
            "critical",
            "high",
            "medium",
            "low"
        ];

        for (const risk of ranking) {

            if (
                assessments.some(
                    assessment =>
                        assessment?.risk === risk
                )
            ) {
                return risk;
            }

        }

        return "low";

    }

}

function createExpertIntelligenceSection(projection = null) {
    if (projection === null) {
        return null;
    }

    validateExpertIntelligenceProjection(projection);

    return deepFreeze({
        status: projection.status,
        hasExecution: projection.hasExecution,
        stale: projection.stale,
        domain: projection.domain,
        provider: projection.provider,
        confidence: projection.confidence,
        interpretation: {
            state: projection.interpretation.state,
            eligible: projection.interpretation.eligible
        },
        humanReviewRequired: projection.humanReviewRequired,
        humanReviewStatus: projection.humanReviewStatus,
        generatedFromVersion: projection.generatedFromVersion
    });
}

function validateExpertIntelligenceProjection(projection) {
    const expectedFields = [
        "status",
        "hasExecution",
        "stale",
        "domain",
        "provider",
        "confidence",
        "interpretation",
        "humanReviewRequired",
        "humanReviewStatus",
        "generatedFromVersion"
    ];

    if (!isPlainDataObject(projection) || !hasExactFields(projection, expectedFields)) {
        throw new Error("ReportAssemblyEngine: unsupported Expert Intelligence projection contract.");
    }

    if (!["no_execution", "available", "stale", "unavailable"].includes(projection.status)
        || typeof projection.hasExecution !== "boolean"
        || typeof projection.stale !== "boolean"
        || !isOptionalExactString(projection.domain)
        || !isOptionalExactString(projection.provider)
        || !isOptionalFiniteNumber(projection.confidence)
        || typeof projection.humanReviewRequired !== "boolean"
        || !["not_required", "pending", "completed"].includes(projection.humanReviewStatus)
        || projection.generatedFromVersion !== "expert-intelligence-report-projection-1.0") {
        throw new Error("ReportAssemblyEngine: invalid Expert Intelligence projection fields.");
    }

    if (!isPlainDataObject(projection.interpretation)
        || !hasExactFields(projection.interpretation, ["state", "eligible"])
        || !isOptionalExactString(projection.interpretation.state)
        || typeof projection.interpretation.eligible !== "boolean") {
        throw new Error("ReportAssemblyEngine: invalid Expert Intelligence interpretation projection.");
    }

    validateExpertIntelligenceProjectionSemantics(projection);
}

function validateExpertIntelligenceProjectionSemantics(projection) {
    const noExecution = projection.status === "no_execution";
    const reviewStatusMatchesRequirement = projection.humanReviewRequired
        ? ["pending", "completed"].includes(projection.humanReviewStatus)
        : projection.humanReviewStatus === "not_required";

    const validNoExecutionState = !noExecution || (
        projection.hasExecution === false
        && projection.stale === false
        && projection.domain === null
        && projection.provider === null
        && projection.confidence === null
        && projection.interpretation.state === null
        && projection.interpretation.eligible === false
        && projection.humanReviewRequired === false
        && projection.humanReviewStatus === "not_required"
    );

    const validExecutionState = noExecution
        ? projection.hasExecution === false
        : projection.hasExecution === true;
    const validAvailabilityState = projection.status !== "available"
        || projection.stale === false;
    const validStaleState = projection.status !== "stale"
        || projection.stale === true;

    if (!validNoExecutionState
        || !validExecutionState
        || !validAvailabilityState
        || !validStaleState
        || !reviewStatusMatchesRequirement) {
        throw new Error("ReportAssemblyEngine: semantically invalid Expert Intelligence projection.");
    }
}

function hasExactFields(value, expectedFields) {
    const keys = Reflect.ownKeys(value);

    return keys.length === expectedFields.length
        && expectedFields.every((field) => keys.includes(field));
}

function isPlainDataObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)
        || Object.getPrototypeOf(value) !== Object.prototype) {
        return false;
    }

    return Reflect.ownKeys(value).every((key) => {
        const descriptor = typeof key === "string"
            ? Object.getOwnPropertyDescriptor(value, key)
            : null;

        return descriptor?.enumerable === true && "value" in descriptor;
    });
}

function isOptionalExactString(value) {
    return value === null
        || (typeof value === "string" && Boolean(value) && value === value.trim());
}

function isOptionalFiniteNumber(value) {
    return value === null
        || (typeof value === "number" && Number.isFinite(value));
}

function deepFreeze(value) {
    Object.values(value).forEach((entry) => {
        if (entry && typeof entry === "object" && !Object.isFrozen(entry)) {
            deepFreeze(entry);
        }
    });

    return Object.freeze(value);
}
