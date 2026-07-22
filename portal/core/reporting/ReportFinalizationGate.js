const GATE_VERSION = "report-finalization-gate-1.0";

const REQUIRED_REPORT_SECTIONS = Object.freeze([
    "metadata",
    "context",
    "findings",
    "assessments",
    "recommendations",
    "expertIntelligence",
    "summary"
]);

const REASONS = Object.freeze({
    REPORT_MISSING: "REPORT_MISSING",
    REQUIRED_SECTION_MISSING: "REQUIRED_SECTION_MISSING",
    REPORT_STRUCTURE_INVALID: "REPORT_STRUCTURE_INVALID",
    EXPERT_INTELLIGENCE_INVALID: "EXPERT_INTELLIGENCE_INVALID"
});

export default class ReportFinalizationGate {

    static evaluate(report) {
        const reasons = [];

        if (report === null || report === undefined) {
            reasons.push(REASONS.REPORT_MISSING);
            return createResult(reasons);
        }

        if (!isPlainDataObject(report)) {
            reasons.push(REASONS.REPORT_STRUCTURE_INVALID);
            return createResult(reasons);
        }

        const missingSection = REQUIRED_REPORT_SECTIONS.some(
            (section) => !Object.hasOwn(report, section)
        );

        if (missingSection) {
            reasons.push(REASONS.REQUIRED_SECTION_MISSING);
        }

        if (!isValidReportStructure(report)) {
            reasons.push(REASONS.REPORT_STRUCTURE_INVALID);
        }

        if (Object.hasOwn(report, "expertIntelligence")) {
            if (!isValidExpertIntelligenceSection(report.expertIntelligence)) {
                reasons.push(REASONS.EXPERT_INTELLIGENCE_INVALID);
            }
        }

        return createResult(reasons);
    }
}

function isValidReportStructure(report) {
    if (!isPlainDataObject(report.metadata)
        || !hasExactFields(report.metadata, [
            "generatedAt",
            "reportVersion",
            "findingCount",
            "assessmentCount",
            "recommendationCount"
        ])
        || !isCanonicalIsoTimestamp(report.metadata.generatedAt)
        || report.metadata.reportVersion !== "Foundation-1.0"
        || !isSafeCount(report.metadata.findingCount)
        || !isSafeCount(report.metadata.assessmentCount)
        || !isSafeCount(report.metadata.recommendationCount)
        || !isPlainDataObject(report.context)
        || !Array.isArray(report.findings)
        || !Array.isArray(report.assessments)
        || !Array.isArray(report.recommendations)
        || !isPlainDataObject(report.summary)
        || !hasExactFields(report.summary, [
            "highestRisk",
            "totalFindings",
            "totalAssessments",
            "totalRecommendations"
        ])
        || !["critical", "high", "medium", "low"].includes(report.summary.highestRisk)
        || !isSafeCount(report.summary.totalFindings)
        || !isSafeCount(report.summary.totalAssessments)
        || !isSafeCount(report.summary.totalRecommendations)) {
        return false;
    }

    return report.metadata.findingCount === report.findings.length
        && report.metadata.assessmentCount === report.assessments.length
        && report.metadata.recommendationCount === report.recommendations.length
        && report.summary.totalFindings === report.findings.length
        && report.summary.totalAssessments === report.assessments.length
        && report.summary.totalRecommendations === report.recommendations.length;
}

function isValidExpertIntelligenceSection(section) {
    if (section === null) {
        return true;
    }

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

    if (!isPlainDataObject(section)
        || !hasExactFields(section, expectedFields)
        || !["no_execution", "available", "stale", "unavailable"].includes(section.status)
        || typeof section.hasExecution !== "boolean"
        || typeof section.stale !== "boolean"
        || !isOptionalExactString(section.domain)
        || !isOptionalExactString(section.provider)
        || !isOptionalFiniteNumber(section.confidence)
        || !isPlainDataObject(section.interpretation)
        || !hasExactFields(section.interpretation, ["state", "eligible"])
        || !isOptionalExactString(section.interpretation.state)
        || typeof section.interpretation.eligible !== "boolean"
        || typeof section.humanReviewRequired !== "boolean"
        || !["not_required", "pending", "completed"].includes(section.humanReviewStatus)
        || section.generatedFromVersion !== "expert-intelligence-report-projection-1.0") {
        return false;
    }

    const noExecution = section.status === "no_execution";
    const reviewStateValid = section.humanReviewRequired
        ? ["pending", "completed"].includes(section.humanReviewStatus)
        : section.humanReviewStatus === "not_required";
    const noExecutionStateValid = !noExecution || (
        section.hasExecution === false
        && section.stale === false
        && section.domain === null
        && section.provider === null
        && section.confidence === null
        && section.interpretation.state === null
        && section.interpretation.eligible === false
        && section.humanReviewRequired === false
        && section.humanReviewStatus === "not_required"
    );

    return noExecutionStateValid
        && (noExecution ? section.hasExecution === false : section.hasExecution === true)
        && (section.status !== "available" || section.stale === false)
        && (section.status !== "stale" || section.stale === true)
        && reviewStateValid;
}

function createResult(reasons) {
    return deepFreeze({
        eligible: reasons.length === 0,
        reasons: [...new Set(reasons)],
        version: GATE_VERSION
    });
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

function isMeaningfulExactString(value) {
    return typeof value === "string" && Boolean(value) && value === value.trim();
}

function isOptionalExactString(value) {
    return value === null || isMeaningfulExactString(value);
}

function isOptionalFiniteNumber(value) {
    return value === null
        || (typeof value === "number" && Number.isFinite(value));
}

function isCanonicalIsoTimestamp(value) {
    if (!isMeaningfulExactString(value)) {
        return false;
    }

    const timestamp = Date.parse(value);

    return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
}

function isSafeCount(value) {
    return Number.isSafeInteger(value) && value >= 0;
}

function deepFreeze(value) {
    Object.values(value).forEach((entry) => {
        if (entry && typeof entry === "object" && !Object.isFrozen(entry)) {
            deepFreeze(entry);
        }
    });

    return Object.freeze(value);
}
