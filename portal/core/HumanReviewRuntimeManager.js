import ExpertIntelligenceRuntimeManager from "./ExpertIntelligenceRuntimeManager.js";
import HumanReviewDomainModel from "./HumanReviewDomainModel.js";
import HumanReviewPersistenceManager from "./HumanReviewPersistenceManager.js";
import HumanReviewResolutionManager from "./HumanReviewResolutionManager.js";

const REVIEW_DATA_FIELDS = new Set([
    "executionId",
    "reviewerId",
    "reviewerDisplayName",
    "reviewerRole",
    "decision",
    "rationale",
    "notes",
    "limitations",
    "followUpRequirements",
    "rerunRecommendation",
    "references",
    "reviewedAt",
    "createdAt",
    "staleAtReview"
]);

export default class HumanReviewRuntimeManager {

    static getHumanReviewStateForInspection(inspectionId) {
        requireIdentifier(inspectionId, "inspectionId");

        const executionState = ExpertIntelligenceRuntimeManager.getExecutionState(inspectionId);
        const execution = executionState?.latest || null;

        if (!execution) {
            return runtimeResult("NO_CURRENT_EXECUTION", {
                inspectionId,
                executionId: null,
                executionSummary: null,
                executionStale: false,
                humanReviewRequired: false,
                reviewResolution: null,
                appendedReview: null,
                errorMessage: null
            });
        }

        if (execution.inspectionId !== inspectionId) {
            return runtimeResult("UNSUPPORTED_EXECUTION_STATE", {
                inspectionId,
                executionId: execution.id || null,
                executionSummary: createExecutionSummary(execution),
                executionStale: executionState.stale === true,
                humanReviewRequired: execution.humanReviewRequired !== false,
                reviewResolution: null,
                appendedReview: null,
                errorMessage: "Current Expert Intelligence execution does not belong to the requested inspection."
            });
        }

        const eligibility = HumanReviewDomainModel.validateExpertExecutionReviewEligibility(execution, {
            persisted: true,
            corrupted: false,
            inspectionId,
            staleAtReview: executionState.stale === true
        });

        if (!eligibility.eligible) {
            return runtimeResult("UNSUPPORTED_EXECUTION_STATE", {
                inspectionId,
                executionId: execution.id,
                executionSummary: createExecutionSummary(execution),
                executionStale: executionState.stale === true,
                humanReviewRequired: execution.humanReviewRequired !== false,
                reviewResolution: null,
                appendedReview: null,
                errorMessage: eligibility.errors.join(" ")
            });
        }

        const reviewResolution = HumanReviewResolutionManager.resolveExecutionReviewState(execution.id);
        const status = reviewResolution.status === "CORRUPT_HISTORY"
            ? "REVIEW_HISTORY_CORRUPT"
            : "REVIEW_STATE_AVAILABLE";

        return runtimeResult(status, {
            inspectionId,
            executionId: execution.id,
            executionSummary: createExecutionSummary(execution),
            executionStale: executionState.stale === true,
            humanReviewRequired: execution.humanReviewRequired !== false,
            reviewResolution,
            appendedReview: null,
            errorMessage: null
        });
    }

    static recordHumanReviewForCurrentExecution(inspectionId, reviewData) {
        requireIdentifier(inspectionId, "inspectionId");
        validateReviewData(reviewData);

        const initialState = this.getHumanReviewStateForInspection(inspectionId);

        if (initialState.status !== "REVIEW_STATE_AVAILABLE") {
            return initialState;
        }

        if (reviewData.executionId !== initialState.executionId) {
            return runtimeResult("EXECUTION_CHANGED", {
                ...runtimeFields(initialState),
                appendedReview: null,
                errorMessage: "The current Expert Intelligence execution changed before Human Review submission."
            });
        }

        const resolution = initialState.reviewResolution;
        const previousReview = resolution.records.length > 0
            ? resolution.records[resolution.records.length - 1]
            : null;
        const sequence = HumanReviewDomainModel.createNextReviewSequence(previousReview);
        const recordData = createRecordData(reviewData, initialState, sequence, previousReview);
        const execution = loadCurrentExecution(inspectionId, initialState.executionId);

        if (!execution.current) {
            return executionChangedResult(initialState);
        }

        const review = HumanReviewDomainModel.createHumanReviewRecord(recordData, {
            execution: execution.record,
            persisted: true,
            corrupted: false,
            staleAtReview: initialState.executionStale,
            previousReview
        });
        const immediate = loadCurrentExecution(inspectionId, initialState.executionId);

        if (!immediate.current) {
            return executionChangedResult(initialState);
        }

        try {
            HumanReviewPersistenceManager.appendHumanReview(review);
        } catch (error) {
            return runtimeResult("REVIEW_APPEND_REJECTED", {
                ...runtimeFields(initialState),
                appendedReview: null,
                errorMessage: error.message || "Human Review append was rejected."
            });
        }

        const refreshed = HumanReviewResolutionManager.resolveExecutionReviewState(initialState.executionId);

        if (!refreshed.records.some((entry) => entry.reviewId === review.reviewId)) {
            return runtimeResult("REVIEW_APPEND_REJECTED", {
                ...runtimeFields(initialState),
                reviewResolution: refreshed,
                appendedReview: null,
                errorMessage: "Appended Human Review is not present in the refreshed resolution."
            });
        }

        return runtimeResult("REVIEW_RECORDED", {
            ...runtimeFields(initialState),
            reviewResolution: refreshed,
            appendedReview: review,
            errorMessage: null
        });
    }
}

function createRecordData(reviewData, state, sequence, previousReview) {
    const data = {
        reviewId: HumanReviewDomainModel.createReviewId(state.executionId, sequence),
        reviewSchemaVersion: HumanReviewDomainModel.REVIEW_SCHEMA_VERSION,
        inspectionId: state.inspectionId,
        buildingId: state.executionSummary.buildingId,
        caseId: state.executionSummary.caseId,
        executionId: state.executionId,
        sequence,
        previousReviewId: previousReview?.reviewId ?? null,
        reviewerId: reviewData.reviewerId,
        reviewerDisplayName: reviewData.reviewerDisplayName,
        reviewerRole: reviewData.reviewerRole,
        executionStatusAtReview: state.executionSummary.status,
        executionFingerprintAtReview: state.executionSummary.sourceFingerprint,
        staleAtReview: reviewData.staleAtReview,
        decision: reviewData.decision,
        rationale: reviewData.rationale,
        reviewedAt: reviewData.reviewedAt,
        createdAt: reviewData.createdAt,
        decisionVocabularyVersion: HumanReviewDomainModel.DECISION_VOCABULARY_VERSION,
        humanReviewResponsibility: HumanReviewDomainModel.HUMAN_REVIEW_RESPONSIBILITY
    };

    [
        "notes",
        "limitations",
        "followUpRequirements",
        "rerunRecommendation",
        "references"
    ].forEach((field) => {
        if (Object.hasOwn(reviewData, field)) {
            data[field] = cloneValue(reviewData[field]);
        }
    });

    return data;
}

function loadCurrentExecution(inspectionId, expectedExecutionId) {
    const state = ExpertIntelligenceRuntimeManager.getExecutionState(inspectionId);
    const record = state?.latest || null;

    return {
        current: Boolean(record)
            && record.id === expectedExecutionId
            && record.inspectionId === inspectionId,
        record
    };
}

function executionChangedResult(state) {
    return runtimeResult("EXECUTION_CHANGED", {
        ...runtimeFields(state),
        appendedReview: null,
        errorMessage: "The current Expert Intelligence execution changed before Human Review append."
    });
}

function runtimeFields(state) {
    return {
        inspectionId: state.inspectionId,
        executionId: state.executionId,
        executionSummary: state.executionSummary,
        executionStale: state.executionStale,
        humanReviewRequired: state.humanReviewRequired,
        reviewResolution: state.reviewResolution
    };
}

function createExecutionSummary(execution) {
    const summary = ExpertIntelligenceRuntimeManager.createSummary(execution) || {};

    return {
        executionId: execution.id,
        inspectionId: execution.inspectionId,
        buildingId: execution.buildingId ?? null,
        caseId: execution.caseId ?? null,
        status: execution.engineStatus,
        sourceFingerprint: execution.sourceFingerprint,
        selectedDomain: summary.selectedDomain ?? execution.selectedDomain ?? null,
        selectedProvider: summary.selectedProvider ?? execution.selectedProvider ?? null,
        humanReviewRequired: execution.humanReviewRequired !== false
    };
}

function validateReviewData(value) {
    if (!isPlainDataObject(value)) {
        throw new Error("HumanReviewRuntimeManager: reviewData must be a plain data object.");
    }

    const unsupported = Object.keys(value).filter((field) => !REVIEW_DATA_FIELDS.has(field));

    if (unsupported.length > 0) {
        throw new Error(`HumanReviewRuntimeManager: unsupported reviewData field: ${unsupported[0]}.`);
    }
}

function requireIdentifier(value, field) {
    if (typeof value !== "string"
        || !value
        || value !== value.trim()
        || !/^[a-z0-9][a-z0-9_-]*$/i.test(value)) {
        throw new Error(`HumanReviewRuntimeManager: ${field} must be an exact supported identifier.`);
    }
}

function runtimeResult(status, fields) {
    return immutableClone({ status, ...fields });
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

function immutableClone(value) {
    return deepFreeze(cloneValue(value));
}

function cloneValue(value) {
    if (value === null || typeof value !== "object") {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map((entry) => cloneValue(entry));
    }

    return Object.keys(value).reduce((clone, key) => {
        Object.defineProperty(clone, key, {
            value: cloneValue(value[key]),
            enumerable: true,
            writable: true,
            configurable: true
        });
        return clone;
    }, {});
}

function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) {
        return value;
    }

    Object.values(value).forEach((entry) => deepFreeze(entry));
    return Object.freeze(value);
}
