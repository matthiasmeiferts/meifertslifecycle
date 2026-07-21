const REVIEW_SCHEMA_VERSION = "human-review-record-1.0";
const DECISION_VOCABULARY_VERSION = "human-review-decision-1.0";
const HUMAN_REVIEW_RESPONSIBILITY = "HUMAN_PROFESSIONAL_RESPONSIBILITY_REQUIRED";
const SUPPORTED_EXECUTION_SCHEMA_VERSION = "expert-intelligence-execution-1.0";

const DECISIONS = Object.freeze({
    CONFIRMED: "CONFIRMED",
    CONFIRMED_WITH_LIMITATIONS: "CONFIRMED_WITH_LIMITATIONS",
    REJECTED: "REJECTED",
    RERUN_REQUIRED: "RERUN_REQUIRED"
});

const REVIEWER_ROLES = Object.freeze({
    PROFESSIONAL_REVIEWER: "PROFESSIONAL_REVIEWER",
    SECOND_REVIEWER: "SECOND_REVIEWER",
    QUALITY_ASSURANCE_REVIEWER: "QUALITY_ASSURANCE_REVIEWER",
    LEAD_REVIEWER: "LEAD_REVIEWER"
});

const REVIEWABLE_EXECUTION_STATUSES = new Set([
    "succeeded",
    "no_provider_contract"
]);

export default class HumanReviewDomainModel {

    static get REVIEW_SCHEMA_VERSION() {
        return REVIEW_SCHEMA_VERSION;
    }

    static get DECISION_VOCABULARY_VERSION() {
        return DECISION_VOCABULARY_VERSION;
    }

    static get HUMAN_REVIEW_RESPONSIBILITY() {
        return HUMAN_REVIEW_RESPONSIBILITY;
    }

    static get DECISIONS() {
        return DECISIONS;
    }

    static get REVIEWER_ROLES() {
        return REVIEWER_ROLES;
    }

    static createReviewId(executionId, sequence) {
        const normalizedExecutionId = requireString(executionId, "executionId");
        const normalizedSequence = requireSequence(sequence);

        if (executionId !== normalizedExecutionId
            || !/^[a-z0-9][a-z0-9_-]*$/i.test(normalizedExecutionId)) {
            throw new Error("HumanReviewDomainModel: executionId contains unsupported characters.");
        }

        return `HR-${normalizedExecutionId}-${String(normalizedSequence).padStart(4, "0")}`;
    }

    static createNextReviewSequence(previousReview = null) {
        if (previousReview === null || previousReview === undefined) {
            return 1;
        }

        const validation = this.validateHumanReviewRecord(previousReview);

        if (!validation.valid) {
            throw new Error(`HumanReviewDomainModel: previous review is invalid: ${validation.errors.join(" ")}`);
        }

        if (previousReview.sequence === Number.MAX_SAFE_INTEGER) {
            throw new Error("HumanReviewDomainModel: previous review sequence has no safe successor.");
        }

        return requireSequence(previousReview.sequence + 1);
    }

    static validateExpertExecutionReviewEligibility(execution, options = {}) {
        const errors = [];

        if (!isPlainObject(execution)) {
            errors.push("Expert execution must be an object.");
            return eligibilityResult(errors, null, options);
        }

        if (options.persisted !== true) {
            errors.push("Expert execution must be confirmed as persisted.");
        }

        if (execution?.persisted === false) {
            errors.push("Expert execution explicitly reports a non-persisted state.");
        }

        if (options.corrupted === true
            || execution?.corrupted === true
            || execution?.corruptionState
            || execution?.validationState === "CORRUPT") {
            errors.push("Corrupted Expert execution cannot be reviewed.");
        }

        if (!isNonEmptyString(execution.id)) {
            errors.push("Expert execution must have a stable execution ID.");
        }

        if (!isNonEmptyString(execution.inspectionId)) {
            errors.push("Expert execution must have an inspection ID.");
        }

        if (isNonEmptyString(options.inspectionId)
            && execution.inspectionId !== options.inspectionId) {
            errors.push("Expert execution does not belong to the requested inspection.");
        }

        if (!isNonEmptyString(execution.sourceFingerprint)) {
            errors.push("Expert execution must have a source fingerprint.");
        }

        if (!isNonEmptyString(execution.engineStatus)) {
            errors.push("Expert execution must have an execution status.");
        } else if (!REVIEWABLE_EXECUTION_STATUSES.has(execution.engineStatus)) {
            errors.push(`Expert execution status is not reviewable: ${execution.engineStatus}.`);
        }

        if (execution.executionSchemaVersion !== SUPPORTED_EXECUTION_SCHEMA_VERSION) {
            errors.push("Expert execution has an unsupported or missing schema version.");
        }

        return eligibilityResult(errors, execution, options);
    }

    static createHumanReviewRecord(data = {}, options = {}) {
        if (!isPlainObject(data)) {
            throw new Error("HumanReviewDomainModel: Human Review input must be a plain object.");
        }

        const execution = options.execution;
        const eligibility = this.validateExpertExecutionReviewEligibility(execution, {
            persisted: options.persisted,
            corrupted: options.corrupted,
            inspectionId: data.inspectionId,
            staleAtReview: options.staleAtReview
        });

        if (!eligibility.eligible) {
            throw new Error(`HumanReviewDomainModel: execution is not reviewable: ${eligibility.errors.join(" ")}`);
        }

        if (options.previousReview) {
            const previousValidation = this.validateHumanReviewRecord(options.previousReview);

            if (!previousValidation.valid) {
                throw new Error(`HumanReviewDomainModel: previous review is invalid: ${previousValidation.errors.join(" ")}`);
            }
        }

        validateSourceBinding(data, execution, eligibility.staleAtReview);
        validateHistory(data, options.previousReview || null);

        const reviewer = normalizeReviewerIdentity(data);
        const record = {
            reviewId: data.reviewId,
            reviewSchemaVersion: data.reviewSchemaVersion,
            inspectionId: data.inspectionId,
            buildingId: normalizeOptionalIdentifier(data.buildingId, "buildingId"),
            caseId: normalizeOptionalIdentifier(data.caseId, "caseId"),
            executionId: data.executionId,
            sequence: data.sequence,
            previousReviewId: data.previousReviewId ?? null,
            reviewerId: reviewer.reviewerId,
            reviewerDisplayName: reviewer.reviewerDisplayName,
            reviewerRole: reviewer.reviewerRole,
            executionStatusAtReview: data.executionStatusAtReview,
            executionFingerprintAtReview: data.executionFingerprintAtReview,
            staleAtReview: data.staleAtReview,
            decision: data.decision,
            rationale: data.rationale,
            notes: normalizeNotes(data.notes),
            limitations: normalizeOptionalArray(data, "limitations"),
            followUpRequirements: normalizeOptionalArray(data, "followUpRequirements"),
            rerunRecommendation: normalizeOptionalText(data.rerunRecommendation, "rerunRecommendation"),
            references: normalizeOptionalArray(data, "references"),
            reviewedAt: data.reviewedAt,
            createdAt: data.createdAt,
            decisionVocabularyVersion: data.decisionVocabularyVersion,
            humanReviewResponsibility: data.humanReviewResponsibility
        };
        const validation = this.validateHumanReviewRecord(record);

        if (!validation.valid) {
            throw new Error(`HumanReviewDomainModel: invalid review record: ${validation.errors.join(" ")}`);
        }

        return deepFreeze(cloneValue(record));
    }

    static validateHumanReviewRecord(record = {}) {
        const errors = [];

        if (!isPlainObject(record)) {
            return { valid: false, errors: ["Human Review record must be an object."] };
        }

        validateRequiredString(record.reviewId, "reviewId", errors);
        validateRequiredString(record.executionId, "executionId", errors);
        validateRequiredString(record.inspectionId, "inspectionId", errors);
        validateRequiredString(record.reviewerId, "reviewerId", errors);
        validateRequiredString(record.reviewerDisplayName, "reviewerDisplayName", errors);
        validateRequiredString(record.executionFingerprintAtReview, "executionFingerprintAtReview", errors);
        validateRequiredString(record.executionStatusAtReview, "executionStatusAtReview", errors);
        validateRequiredString(record.rationale, "rationale", errors);

        if (record.reviewSchemaVersion !== REVIEW_SCHEMA_VERSION) {
            errors.push("Unsupported or missing reviewSchemaVersion.");
        }

        if (!Object.values(REVIEWER_ROLES).includes(record.reviewerRole)) {
            errors.push("Unsupported or missing reviewerRole.");
        }

        if (!Object.values(DECISIONS).includes(record.decision)) {
            errors.push("Unsupported or missing professional decision.");
        }

        if (!Number.isSafeInteger(record.sequence) || record.sequence < 1) {
            errors.push("sequence must be a positive safe integer.");
        } else if (isNonEmptyString(record.executionId)
            && record.reviewId !== this.createReviewId(record.executionId, record.sequence)) {
            errors.push("reviewId does not match the deterministic execution sequence.");
        }

        if (record.sequence === 1 && record.previousReviewId !== null) {
            errors.push("The first review must not have a predecessor.");
        }

        if (record.sequence > 1 && !isNonEmptyString(record.previousReviewId)) {
            errors.push("A later review must reference its predecessor.");
        }

        if (record.previousReviewId === record.reviewId) {
            errors.push("A review cannot reference itself as predecessor.");
        }

        validateTimestamp(record.reviewedAt, "reviewedAt", errors);
        validateTimestamp(record.createdAt, "createdAt", errors);
        validateOptionalIdentifier(record.buildingId, "buildingId", errors);
        validateOptionalIdentifier(record.caseId, "caseId", errors);
        validateNotes(record.notes, errors);
        validateOptionalText(record.rerunRecommendation, "rerunRecommendation", errors);
        validateOptionalStringArray(record, "limitations", errors);
        validateOptionalStringArray(record, "followUpRequirements", errors);
        validateOptionalReferenceArray(record, errors);

        if (typeof record.staleAtReview !== "boolean") {
            errors.push("staleAtReview must be boolean.");
        }

        if (record.decisionVocabularyVersion !== DECISION_VOCABULARY_VERSION) {
            errors.push("Unsupported or missing decisionVocabularyVersion.");
        }

        if (record.humanReviewResponsibility !== HUMAN_REVIEW_RESPONSIBILITY) {
            errors.push("The human professional responsibility marker is required.");
        }

        if (record.decision === DECISIONS.CONFIRMED_WITH_LIMITATIONS
            && (!Array.isArray(record.limitations) || record.limitations.length === 0)) {
            errors.push("CONFIRMED_WITH_LIMITATIONS requires at least one limitation.");
        }

        if (record.decision === DECISIONS.RERUN_REQUIRED
            && !isNonEmptyString(record.rerunRecommendation)
            && (!Array.isArray(record.followUpRequirements) || record.followUpRequirements.length === 0)) {
            errors.push("RERUN_REQUIRED requires a rerun recommendation or follow-up requirement.");
        }

        if (record.staleAtReview === true && !isNonEmptyString(record.rationale)) {
            errors.push("A stale execution review requires an explicit rationale.");
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    static normalizeReviewerIdentity(data = {}) {
        return deepFreeze(normalizeReviewerIdentity(data));
    }
}

function validateSourceBinding(data, execution, staleAtReview) {
    if (data.executionId !== execution.id) {
        throw new Error("HumanReviewDomainModel: executionId does not match the reviewed execution.");
    }

    if (data.inspectionId !== execution.inspectionId) {
        throw new Error("HumanReviewDomainModel: inspectionId does not match the reviewed execution.");
    }

    if (data.executionStatusAtReview !== execution.engineStatus) {
        throw new Error("HumanReviewDomainModel: executionStatusAtReview does not match the reviewed execution.");
    }

    if (data.executionFingerprintAtReview !== execution.sourceFingerprint) {
        throw new Error("HumanReviewDomainModel: executionFingerprintAtReview does not match the reviewed execution.");
    }

    if (data.staleAtReview !== staleAtReview) {
        throw new Error("HumanReviewDomainModel: staleAtReview does not match eligibility state.");
    }
}

function validateHistory(data, previousReview) {
    const sequence = requireSequence(data.sequence);

    if (sequence === 1) {
        if (previousReview) {
            throw new Error("HumanReviewDomainModel: first review must not be created with a previous review.");
        }

        if (data.previousReviewId !== null && data.previousReviewId !== undefined) {
            throw new Error("HumanReviewDomainModel: first review must not have a predecessor.");
        }
        return;
    }

    if (!previousReview) {
        throw new Error("HumanReviewDomainModel: later review requires the immediately preceding review.");
    }

    if (data.previousReviewId !== previousReview.reviewId) {
        throw new Error("HumanReviewDomainModel: previousReviewId does not identify the supplied predecessor.");
    }

    if (data.reviewId === previousReview.reviewId) {
        throw new Error("HumanReviewDomainModel: a review cannot reference itself.");
    }

    if (previousReview.sequence === Number.MAX_SAFE_INTEGER) {
        throw new Error("HumanReviewDomainModel: previous review sequence has no safe successor.");
    }

    if (sequence !== previousReview.sequence + 1) {
        throw new Error("HumanReviewDomainModel: review sequence must immediately follow its predecessor.");
    }

    if (data.executionId !== previousReview.executionId
        || data.inspectionId !== previousReview.inspectionId) {
        throw new Error("HumanReviewDomainModel: predecessor must review the same execution and inspection.");
    }
}

function normalizeReviewerIdentity(data = {}) {
    const reviewerId = requireString(data.reviewerId, "reviewerId");
    const reviewerDisplayName = requireString(data.reviewerDisplayName, "reviewerDisplayName");

    if (!Object.values(REVIEWER_ROLES).includes(data.reviewerRole)) {
        throw new Error("HumanReviewDomainModel: unsupported reviewerRole.");
    }

    return {
        reviewerId,
        reviewerDisplayName,
        reviewerRole: data.reviewerRole
    };
}

function eligibilityResult(errors, execution, options) {
    return deepFreeze({
        eligible: errors.length === 0,
        errors: [...errors],
        executionId: isPlainObject(execution) && isNonEmptyString(execution.id) ? execution.id : null,
        inspectionId: isPlainObject(execution) && isNonEmptyString(execution.inspectionId) ? execution.inspectionId : null,
        executionStatus: isPlainObject(execution) && isNonEmptyString(execution.engineStatus) ? execution.engineStatus : null,
        executionFingerprint: isPlainObject(execution) && isNonEmptyString(execution.sourceFingerprint) ? execution.sourceFingerprint : null,
        staleAtReview: options.staleAtReview === true
    });
}

function validateRequiredString(value, field, errors) {
    if (!isNonEmptyString(value)) {
        errors.push(`${field} is required.`);
    }
}

function validateTimestamp(value, field, errors) {
    if (!isNonEmptyString(value)
        || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)
        || Number.isNaN(Date.parse(value))
        || new Date(value).toISOString() !== value) {
        errors.push(`${field} must be an exact UTC ISO timestamp with milliseconds.`);
    }
}

function validateOptionalIdentifier(value, field, errors) {
    if (value !== null && value !== undefined && !isNonEmptyString(value)) {
        errors.push(`${field} must be null or a meaningful string.`);
    }
}

function validateNotes(value, errors) {
    if (typeof value !== "string" || (value.length > 0 && value.trim().length === 0)) {
        errors.push("notes must be empty or a meaningful string.");
    }
}

function validateOptionalText(value, field, errors) {
    if (value !== null && value !== undefined && !isNonEmptyString(value)) {
        errors.push(`${field} must be null or a meaningful string.`);
    }
}

function validateOptionalStringArray(record, field, errors) {
    const value = Object.hasOwn(record, field) ? record[field] : [];

    if (!isSupportedArray(value) || value.some((entry) => !isNonEmptyString(entry))) {
        errors.push(`${field} must be an array of meaningful strings.`);
    }
}

function validateOptionalReferenceArray(record, errors) {
    const value = Object.hasOwn(record, "references") ? record.references : [];

    if (!isSupportedArray(value) || value.some((entry) => {
        if (isNonEmptyString(entry)) {
            return false;
        }

        return !isPlainObject(entry)
            || (!isNonEmptyString(entry.id) && !isNonEmptyString(entry.referenceId))
            || !isSupportedStructuredValue(entry);
    })) {
        errors.push("references must be an array of strings or identified reference objects.");
    }
}

function requireString(value, field) {
    if (!isNonEmptyString(value)) {
        throw new Error(`HumanReviewDomainModel: ${field} is required.`);
    }

    return value.trim();
}

function requireSequence(value) {
    if (!Number.isSafeInteger(value) || value < 1) {
        throw new Error("HumanReviewDomainModel: sequence must be a positive safe integer.");
    }

    return value;
}

function normalizeOptionalIdentifier(value, field) {
    if (value === null || value === undefined) {
        return null;
    }

    return requireString(value, field);
}

function normalizeNotes(value) {
    if (value === null || value === undefined || value === "") {
        return "";
    }

    if (!isNonEmptyString(value)) {
        throw new Error("HumanReviewDomainModel: notes must be empty or a meaningful string.");
    }

    return value;
}

function normalizeOptionalText(value, field) {
    if (value === null || value === undefined) {
        return null;
    }

    return requireString(value, field);
}

function normalizeOptionalArray(source, field) {
    if (!Object.hasOwn(source, field)) {
        return [];
    }

    return cloneValue(source[field]);
}

function cloneValue(value, seen = new WeakSet()) {
    if (value === undefined) {
        return undefined;
    }

    if (value === null || typeof value === "string" || typeof value === "boolean") {
        return value;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (typeof value !== "object") {
        throw new Error("HumanReviewDomainModel: unsupported structured value.");
    }

    if (seen.has(value)) {
        throw new Error("HumanReviewDomainModel: cyclic structured values are not supported.");
    }

    seen.add(value);

    if (Array.isArray(value)) {
        if (!isSupportedArray(value)) {
            throw new Error("HumanReviewDomainModel: sparse or property-bearing arrays are not supported.");
        }

        const result = value.map((entry) => cloneValue(entry, seen));
        seen.delete(value);
        return result;
    }

    if (!isPlainObject(value)) {
        throw new Error("HumanReviewDomainModel: prototype-bearing structured values are not supported.");
    }

    if (!hasSupportedObjectProperties(value)) {
        throw new Error("HumanReviewDomainModel: structured objects require enumerable string-keyed data properties.");
    }

    const result = Object.keys(value).reduce((output, key) => {
        output[key] = cloneValue(value[key], seen);
        return output;
    }, {});
    seen.delete(value);
    return result;
}

function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) {
        return value;
    }

    Object.values(value).forEach((entry) => deepFreeze(entry));
    return Object.freeze(value);
}

function isPlainObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
    }

    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype;
}

function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}

function isSupportedStructuredValue(value, seen = new WeakSet()) {
    if (value === null || typeof value === "string" || typeof value === "boolean") {
        return true;
    }

    if (typeof value === "number") {
        return Number.isFinite(value);
    }

    if (!value || typeof value !== "object" || seen.has(value)) {
        return false;
    }

    if (Array.isArray(value) ? !isSupportedArray(value) : !isPlainObject(value) || !hasSupportedObjectProperties(value)) {
        return false;
    }

    seen.add(value);
    const entries = Array.isArray(value) ? value : Object.values(value);
    const supported = entries.every((entry) => isSupportedStructuredValue(entry, seen));
    seen.delete(value);
    return supported;
}

function isSupportedArray(value) {
    if (!Array.isArray(value) || Reflect.ownKeys(value).some((key) => typeof key === "symbol")) {
        return false;
    }

    const ownNames = Object.getOwnPropertyNames(value);

    if (ownNames.length !== value.length + 1 || !ownNames.includes("length")) {
        return false;
    }

    for (let index = 0; index < value.length; index += 1) {
        const key = String(index);
        const descriptor = Object.getOwnPropertyDescriptor(value, key);

        if (!descriptor || descriptor.enumerable !== true || !("value" in descriptor)) {
            return false;
        }
    }

    return true;
}

function hasSupportedObjectProperties(value) {
    return Reflect.ownKeys(value).every((key) => {
        if (typeof key !== "string") {
            return false;
        }

        const descriptor = Object.getOwnPropertyDescriptor(value, key);
        return descriptor?.enumerable === true && "value" in descriptor;
    });
}
