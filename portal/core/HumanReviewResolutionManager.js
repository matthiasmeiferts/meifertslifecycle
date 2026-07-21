import HumanReviewPersistenceManager from "./HumanReviewPersistenceManager.js";
import HumanReviewDomainModel from "./HumanReviewDomainModel.js";

const RESOLUTION_STATES = Object.freeze({
    NOT_REVIEWED: "NOT_REVIEWED",
    REVIEWED: "REVIEWED",
    PARTIAL_WITH_CORRUPTION: "PARTIAL_WITH_CORRUPTION",
    CORRUPT_HISTORY: "CORRUPT_HISTORY"
});

export default class HumanReviewResolutionManager {

    static resolveEffectiveHumanReview(executionId) {
        return resolve(executionId);
    }

    static resolveExecutionReviewState(executionId) {
        return resolve(executionId);
    }

    static isExecutionReviewed(executionId) {
        const resolution = resolve(executionId);

        return immutableClone({
            status: resolution.status,
            executionId: resolution.executionId,
            reviewed: resolution.reviewed,
            diagnostics: resolution.diagnostics
        });
    }

    static getReviewChain(executionId) {
        const resolution = resolve(executionId);

        return immutableClone({
            status: resolution.status,
            executionId: resolution.executionId,
            reviewed: resolution.reviewed,
            records: resolution.records,
            reviewCount: resolution.reviewCount,
            diagnostics: resolution.diagnostics
        });
    }

    static getCurrentReview(executionId) {
        const resolution = resolve(executionId);

        return immutableClone({
            status: resolution.status,
            executionId: resolution.executionId,
            reviewed: resolution.reviewed,
            record: resolution.effectiveReview,
            effectiveDecision: resolution.effectiveDecision,
            diagnostics: resolution.diagnostics
        });
    }
}

function resolve(executionId) {
    requireExecutionId(executionId);

    const persisted = HumanReviewPersistenceManager.listHumanReviewsForExecution(executionId);
    const validation = validatePersistenceResult(persisted, executionId);

    if (!validation.valid) {
        return dependencyContractFailure(executionId, validation.reason);
    }

    const records = persisted.records;
    const diagnostics = persisted.diagnostics;
    const status = resolveStatus(persisted.status, records, diagnostics);
    const effectiveReview = records.length > 0 ? records[records.length - 1] : null;

    return immutableClone({
        status,
        executionId,
        reviewed: effectiveReview !== null,
        effectiveReview,
        effectiveDecision: effectiveReview?.decision ?? null,
        reviewCount: records.length,
        records,
        diagnostics
    });
}

function validatePersistenceResult(persisted, executionId) {
    if (!isPlainDataObject(persisted)) {
        return invalidResult("B2-B result must be a plain data object.");
    }

    if (!["EMPTY", "FOUND", "PARTIAL_WITH_CORRUPTION"].includes(persisted.status)) {
        return invalidResult("B2-B result has an unsupported status.");
    }

    if (!isDenseDataArray(persisted.records)) {
        return invalidResult("B2-B records must be a dense data array.");
    }

    if (!isDenseDataArray(persisted.diagnostics)
        || persisted.diagnostics.some((entry) => !isValidDiagnostic(entry))) {
        return invalidResult("B2-B diagnostics must be a dense array of valid diagnostics.");
    }

    if (persisted.status === "EMPTY"
        && (persisted.records.length !== 0 || persisted.diagnostics.length !== 0)) {
        return invalidResult("B2-B EMPTY result contradicts its records or diagnostics.");
    }

    if (persisted.status === "FOUND"
        && (persisted.records.length === 0 || persisted.diagnostics.length !== 0)) {
        return invalidResult("B2-B FOUND result contradicts its records or diagnostics.");
    }

    if (persisted.status === "PARTIAL_WITH_CORRUPTION" && persisted.diagnostics.length === 0) {
        return invalidResult("B2-B partial-corruption result requires diagnostics.");
    }

    const reviewIds = new Set();
    const sequences = new Set();
    let previousSequence = null;

    for (const record of persisted.records) {
        if (!isPlainDataObject(record)) {
            return invalidResult("B2-B record must be a plain data object.");
        }

        if (record.executionId !== executionId) {
            return invalidResult("B2-B record does not match the requested executionId.");
        }

        if (!Number.isSafeInteger(record.sequence) || record.sequence < 1) {
            return invalidResult("B2-B record sequence must be a positive safe integer.");
        }

        if (reviewIds.has(record.reviewId)) {
            return invalidResult("B2-B records contain a duplicate reviewId.");
        }

        if (sequences.has(record.sequence)) {
            return invalidResult("B2-B records contain a duplicate sequence.");
        }

        if (previousSequence !== null && record.sequence <= previousSequence) {
            return invalidResult("B2-B records must be strictly sequence-ascending.");
        }

        reviewIds.add(record.reviewId);
        sequences.add(record.sequence);
        previousSequence = record.sequence;

        const recordValidation = HumanReviewDomainModel.validateHumanReviewRecord(record);

        if (!recordValidation.valid) {
            return invalidResult("B2-B record does not satisfy the B2-A Human Review contract.");
        }
    }

    return { valid: true, reason: null };
}

function dependencyContractFailure(executionId, reason) {
    return immutableClone({
        status: RESOLUTION_STATES.CORRUPT_HISTORY,
        executionId,
        reviewed: false,
        effectiveReview: null,
        effectiveDecision: null,
        reviewCount: 0,
        records: [],
        diagnostics: [{
            storageIndex: null,
            recordId: null,
            executionId,
            inspectionId: null,
            state: "CORRUPT_B2B_RESULT_EXCLUDED",
            reason
        }]
    });
}

function invalidResult(reason) {
    return { valid: false, reason };
}

function isValidDiagnostic(value) {
    return isPlainDataObject(value)
        && (value.storageIndex === null
            || (Number.isSafeInteger(value.storageIndex) && value.storageIndex >= 0))
        && (value.recordId === null || typeof value.recordId === "string")
        && (value.executionId === null || typeof value.executionId === "string")
        && (value.inspectionId === null || typeof value.inspectionId === "string")
        && value.state === "CORRUPT_HUMAN_REVIEW_EXCLUDED"
        && typeof value.reason === "string"
        && value.reason.trim().length > 0;
}

function isDenseDataArray(value) {
    if (!Array.isArray(value) || Reflect.ownKeys(value).some((key) => typeof key === "symbol")) {
        return false;
    }

    const ownNames = Object.getOwnPropertyNames(value);

    if (ownNames.length !== value.length + 1 || !ownNames.includes("length")) {
        return false;
    }

    for (let index = 0; index < value.length; index += 1) {
        const descriptor = Object.getOwnPropertyDescriptor(value, String(index));

        if (!descriptor || descriptor.enumerable !== true || !("value" in descriptor)) {
            return false;
        }
    }

    return true;
}

function isPlainDataObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)
        || Object.getPrototypeOf(value) !== Object.prototype) {
        return false;
    }

    return Reflect.ownKeys(value).every((key) => {
        if (typeof key !== "string") {
            return false;
        }

        const descriptor = Object.getOwnPropertyDescriptor(value, key);
        return descriptor?.enumerable === true && "value" in descriptor;
    });
}

function resolveStatus(persistenceStatus, records, diagnostics) {
    if (persistenceStatus === "EMPTY" && records.length === 0 && diagnostics.length === 0) {
        return RESOLUTION_STATES.NOT_REVIEWED;
    }

    if (persistenceStatus === "FOUND" && records.length > 0 && diagnostics.length === 0) {
        return RESOLUTION_STATES.REVIEWED;
    }

    if (persistenceStatus === "PARTIAL_WITH_CORRUPTION" && diagnostics.length > 0) {
        return records.length > 0
            ? RESOLUTION_STATES.PARTIAL_WITH_CORRUPTION
            : RESOLUTION_STATES.CORRUPT_HISTORY;
    }

    throw new Error(`HumanReviewResolutionManager: unsupported persistence result: ${persistenceStatus}.`);
}

function requireExecutionId(value) {
    if (typeof value !== "string"
        || !value
        || value !== value.trim()
        || !/^[a-z0-9][a-z0-9_-]*$/i.test(value)) {
        throw new Error("HumanReviewResolutionManager: executionId must be an exact supported identifier.");
    }
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
