const PROJECTION_VERSION = "expert-intelligence-report-projection-1.0";

const PROJECTION_STATUSES = Object.freeze({
    NO_EXECUTION: "no_execution",
    AVAILABLE: "available",
    STALE: "stale",
    UNAVAILABLE: "unavailable"
});

const HUMAN_REVIEW_STATUSES = Object.freeze({
    NOT_REQUIRED: "not_required",
    PENDING: "pending",
    COMPLETED: "completed"
});

const RELEASED_EXECUTION_STATUSES = new Set([
    "succeeded",
    "failed",
    "not_run",
    "no_provider_contract"
]);

const ROOT_FIELDS = new Set([
    "executionSummary",
    "canonicalCurrent",
    "stale",
    "humanReviewSummary"
]);

const HUMAN_REVIEW_SUMMARY_FIELDS = new Set(["completed"]);

export default class ExpertIntelligenceReportProjection {

    static createProjection(input = {}) {
        requirePlainDataObject(input, "input");
        requireAllowedFields(input, ROOT_FIELDS, "input");

        const executionSummary = readDataField(input, "executionSummary", null);
        const canonicalCurrent = readBoolean(input, "canonicalCurrent", false);
        const stale = readBoolean(input, "stale", false);
        const humanReviewSummary = readDataField(input, "humanReviewSummary", null);

        if (executionSummary === null) {
            requireNoExecutionState(canonicalCurrent, stale, humanReviewSummary);

            return immutableProjection({
                status: PROJECTION_STATUSES.NO_EXECUTION,
                hasExecution: false,
                stale: false,
                domain: null,
                provider: null,
                confidence: null,
                interpretation: {
                    state: null,
                    eligible: false
                },
                humanReviewRequired: false,
                humanReviewStatus: HUMAN_REVIEW_STATUSES.NOT_REQUIRED,
                generatedFromVersion: PROJECTION_VERSION
            });
        }

        requirePlainDataObject(executionSummary, "executionSummary");

        if (canonicalCurrent !== true) {
            throw new Error("ExpertIntelligenceReportProjection: only the canonical current execution may be projected.");
        }

        const executionStatus = readRequiredString(executionSummary, "status");

        if (!RELEASED_EXECUTION_STATUSES.has(executionStatus)) {
            throw new Error("ExpertIntelligenceReportProjection: unsupported released execution status.");
        }

        const domain = readOptionalString(executionSummary, "selectedDomain");
        const provider = readOptionalString(executionSummary, "selectedProvider");
        const confidence = readOptionalFiniteNumber(executionSummary, "confidence");
        const interpretationState = readOptionalString(executionSummary, "interpretationState");
        const interpretationEligible = readBoolean(executionSummary, "interpretationEligible", false);
        const humanReviewRequired = readBoolean(executionSummary, "humanReviewRequired", true);
        const humanReviewStatus = resolveHumanReviewStatus(humanReviewRequired, humanReviewSummary);
        const status = executionStatus !== "succeeded"
            ? PROJECTION_STATUSES.UNAVAILABLE
            : (stale ? PROJECTION_STATUSES.STALE : PROJECTION_STATUSES.AVAILABLE);

        return immutableProjection({
            status,
            hasExecution: true,
            stale,
            domain,
            provider,
            confidence,
            interpretation: {
                state: interpretationState,
                eligible: interpretationEligible
            },
            humanReviewRequired,
            humanReviewStatus,
            generatedFromVersion: PROJECTION_VERSION
        });
    }
}

function resolveHumanReviewStatus(required, summary) {
    if (!required) {
        if (summary !== null) {
            throw new Error("ExpertIntelligenceReportProjection: Human Review data contradicts a not-required state.");
        }

        return HUMAN_REVIEW_STATUSES.NOT_REQUIRED;
    }

    if (summary === null) {
        return HUMAN_REVIEW_STATUSES.PENDING;
    }

    requirePlainDataObject(summary, "humanReviewSummary");
    requireAllowedFields(summary, HUMAN_REVIEW_SUMMARY_FIELDS, "humanReviewSummary");

    return readBoolean(summary, "completed", false)
        ? HUMAN_REVIEW_STATUSES.COMPLETED
        : HUMAN_REVIEW_STATUSES.PENDING;
}

function requireNoExecutionState(canonicalCurrent, stale, humanReviewSummary) {
    if (canonicalCurrent || stale || humanReviewSummary !== null) {
        throw new Error("ExpertIntelligenceReportProjection: no-execution input contains contradictory state.");
    }
}

function requirePlainDataObject(value, field) {
    if (!value || typeof value !== "object" || Array.isArray(value)
        || Object.getPrototypeOf(value) !== Object.prototype) {
        throw new Error(`ExpertIntelligenceReportProjection: ${field} must be a plain data object.`);
    }

    Reflect.ownKeys(value).forEach((key) => {
        const descriptor = typeof key === "string"
            ? Object.getOwnPropertyDescriptor(value, key)
            : null;

        if (!descriptor || descriptor.enumerable !== true || !("value" in descriptor)) {
            throw new Error(`ExpertIntelligenceReportProjection: ${field} contains unsupported properties.`);
        }
    });
}

function requireAllowedFields(value, allowed, field) {
    const unsupported = Object.keys(value).find((key) => !allowed.has(key));

    if (unsupported) {
        throw new Error(`ExpertIntelligenceReportProjection: unsupported ${field} field: ${unsupported}.`);
    }
}

function readDataField(value, field, fallback) {
    return Object.hasOwn(value, field) ? value[field] : fallback;
}

function readBoolean(value, field, fallback) {
    if (!Object.hasOwn(value, field)) return fallback;

    if (typeof value[field] !== "boolean") {
        throw new Error(`ExpertIntelligenceReportProjection: ${field} must be a boolean.`);
    }

    return value[field];
}

function readRequiredString(value, field) {
    const result = readOptionalString(value, field);

    if (result === null) {
        throw new Error(`ExpertIntelligenceReportProjection: ${field} is required.`);
    }

    return result;
}

function readOptionalString(value, field) {
    if (!Object.hasOwn(value, field) || value[field] === null) return null;

    if (typeof value[field] !== "string" || !value[field] || value[field] !== value[field].trim()) {
        throw new Error(`ExpertIntelligenceReportProjection: ${field} must be null or a meaningful exact string.`);
    }

    return value[field];
}

function readOptionalFiniteNumber(value, field) {
    if (!Object.hasOwn(value, field) || value[field] === null) return null;

    if (typeof value[field] !== "number" || !Number.isFinite(value[field])) {
        throw new Error(`ExpertIntelligenceReportProjection: ${field} must be null or a finite number.`);
    }

    return value[field];
}

function immutableProjection(value) {
    return deepFreeze(cloneValue(value));
}

function cloneValue(value) {
    if (value === null || typeof value !== "object") return value;

    if (Array.isArray(value)) {
        return value.map((entry) => cloneValue(entry));
    }

    return Object.keys(value).reduce((clone, key) => {
        clone[key] = cloneValue(value[key]);
        return clone;
    }, {});
}

function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;

    Object.values(value).forEach((entry) => deepFreeze(entry));
    return Object.freeze(value);
}
