import HumanReviewDomainModel from "./HumanReviewDomainModel.js";
import StorageManager from "./storage/StorageManager.js";

const COLLECTION = "humanReviews";
const NEGATIVE_ZERO_MARKER_KEY = "__mblsHumanReviewNegativeZero__";
const NEGATIVE_ZERO_MARKER_VALUE = "human-review-negative-zero-1";
const FORBIDDEN_PATH_SEGMENTS = new Set(["__proto__", "prototype", "constructor"]);

export default class HumanReviewPersistenceManager {

    static appendHumanReview(review) {
        const validation = HumanReviewDomainModel.validateHumanReviewRecord(review);

        if (!validation.valid) {
            throw new Error(`HumanReviewPersistenceManager: invalid Human Review: ${validation.errors.join(" ")}`);
        }

        if (!isDeepFrozen(review)) {
            throw new Error("HumanReviewPersistenceManager: Human Review must be deeply immutable.");
        }

        const inspection = inspectStorage();

        if (inspection.diagnostics.length > 0) {
            throw new Error("HumanReviewPersistenceManager: corrupt Human Review storage prevents append.");
        }

        if (inspection.records.some((entry) => entry.reviewId === review.reviewId)
            || inspection.rawIds.includes(review.reviewId)) {
            throw new Error(`HumanReviewPersistenceManager: duplicate reviewId: ${review.reviewId}.`);
        }

        const executionHistory = recordsForExecution(inspection.records, review.executionId);
        const chain = validateHistoryChain(executionHistory);

        if (!chain.valid) {
            throw new Error(`HumanReviewPersistenceManager: corrupt existing execution history: ${chain.reason}`);
        }

        if (executionHistory.some((entry) => entry.sequence === review.sequence)) {
            throw new Error(`HumanReviewPersistenceManager: duplicate sequence for execution: ${review.sequence}.`);
        }

        validateAppendHistory(review, executionHistory, inspection.records);

        const persistedRecord = cloneValue(review);
        StorageManager.save(COLLECTION, {
            id: persistedRecord.reviewId,
            record: encodeForStorage(persistedRecord),
            negativeZeroPaths: collectNegativeZeroPaths(persistedRecord)
        });

        return result("APPENDED", {
            record: immutableClone(persistedRecord),
            records: [],
            diagnostics: []
        });
    }

    static getHumanReviewById(reviewId) {
        requireIdentifier(reviewId, "reviewId");
        const inspection = inspectStorage();
        const matches = inspection.records.filter((entry) => entry.reviewId === reviewId);
        const relevantDiagnostics = inspection.diagnostics.filter((entry) => entry.recordId === reviewId);

        if (matches.length > 1 || relevantDiagnostics.length > 0) {
            return result("CORRUPT", {
                record: null,
                records: [],
                diagnostics: relevantDiagnostics.length > 0
                    ? relevantDiagnostics
                    : [diagnostic(null, reviewId, null, null, "Duplicate stored reviewId.")]
            });
        }

        if (matches.length === 0) {
            return result("NOT_FOUND", {
                record: null,
                records: [],
                diagnostics: inspection.diagnostics
            });
        }

        const requested = matches[0];
        const history = recordsForExecution(inspection.records, requested.executionId);
        const analysis = analyzeHistoryChain(history);
        const safeMatch = analysis.safeRecords.some((entry) => entry.reviewId === reviewId);

        if (!safeMatch) {
            return result("CORRUPT", {
                record: null,
                records: [],
                diagnostics: analysis.diagnostics
            });
        }

        const diagnostics = [...inspection.diagnostics, ...analysis.diagnostics];
        return result(diagnostics.length > 0 ? "FOUND_WITH_CORRUPTION" : "FOUND", {
            record: immutableClone(requested),
            records: [],
            diagnostics
        });
    }

    static listHumanReviewsForExecution(executionId) {
        requireIdentifier(executionId, "executionId");
        const inspection = inspectStorage();
        return listResult(inspection, "executionId", executionId);
    }

    static listHumanReviewsForInspection(inspectionId) {
        requireIdentifier(inspectionId, "inspectionId");
        const inspection = inspectStorage();
        return listResult(inspection, "inspectionId", inspectionId);
    }

    static getLatestHumanReviewForExecution(executionId) {
        requireIdentifier(executionId, "executionId");
        const inspection = inspectStorage();
        const records = recordsForExecution(inspection.records, executionId);
        const relevantDiagnostics = diagnosticsFor(inspection.diagnostics, "executionId", executionId);
        const analysis = analyzeHistoryChain(records);

        if (!analysis.valid || relevantDiagnostics.length > 0) {
            return result("CORRUPT_HISTORY", {
                record: analysis.safeRecords.length > 0
                    ? immutableClone(analysis.safeRecords[analysis.safeRecords.length - 1])
                    : null,
                records: [],
                diagnostics: [...relevantDiagnostics, ...analysis.diagnostics]
            });
        }

        if (records.length === 0) {
            return result("NOT_FOUND", { record: null, records: [], diagnostics: [] });
        }

        return result("FOUND", {
            record: immutableClone(analysis.safeRecords[analysis.safeRecords.length - 1]),
            records: [],
            diagnostics: []
        });
    }
}

function validateAppendHistory(review, executionHistory, allRecords) {
    if (review.sequence === 1) {
        if (executionHistory.length > 0 || review.previousReviewId !== null) {
            throw new Error("HumanReviewPersistenceManager: first review conflicts with existing history.");
        }
        return;
    }

    if (executionHistory.length === 0) {
        const crossExecutionPredecessor = allRecords.find((entry) => entry.reviewId === review.previousReviewId);

        if (crossExecutionPredecessor) {
            throw new Error("HumanReviewPersistenceManager: predecessor belongs to another execution.");
        }

        throw new Error("HumanReviewPersistenceManager: review sequence creates a history gap.");
    }

    const predecessor = executionHistory[executionHistory.length - 1];

    if (review.sequence !== predecessor.sequence + 1) {
        throw new Error("HumanReviewPersistenceManager: review sequence must immediately follow persisted history.");
    }

    if (review.previousReviewId !== predecessor.reviewId) {
        const referenced = allRecords.find((entry) => entry.reviewId === review.previousReviewId);
        const reason = referenced && referenced.executionId !== review.executionId
            ? "predecessor belongs to another execution"
            : "previousReviewId does not identify the latest persisted review";
        throw new Error(`HumanReviewPersistenceManager: ${reason}.`);
    }

    if (review.inspectionId !== predecessor.inspectionId) {
        throw new Error("HumanReviewPersistenceManager: inspection binding conflicts with persisted history.");
    }
}

function inspectStorage() {
    const records = [];
    const diagnostics = [];
    const rawIds = [];
    const raw = localStorage.getItem(StorageManager.getKey(COLLECTION));

    if (!raw) {
        return { records, diagnostics, rawIds };
    }

    let entries;

    try {
        entries = JSON.parse(raw);
    } catch {
        return {
            records,
            rawIds,
            diagnostics: [diagnostic(null, null, null, null, "Storage namespace contains malformed JSON.")]
        };
    }

    if (!Array.isArray(entries)) {
        return {
            records,
            rawIds,
            diagnostics: [diagnostic(null, null, null, null, "Storage namespace is not an array.")]
        };
    }

    entries.forEach((entry, index) => {
        const recordId = isObject(entry) && typeof entry.id === "string" ? entry.id : null;
        const storedCandidate = isObject(entry) ? entry.record : null;
        const candidate = isObject(storedCandidate) ? cloneValue(storedCandidate) : null;
        const executionId = isObject(candidate) && typeof candidate.executionId === "string"
            ? candidate.executionId
            : null;
        const inspectionId = isObject(candidate) && typeof candidate.inspectionId === "string"
            ? candidate.inspectionId
            : null;

        if (recordId) {
            rawIds.push(recordId);
        }

        if (!isObject(entry) || !isObject(candidate) || recordId !== candidate.reviewId) {
            diagnostics.push(diagnostic(index, recordId, executionId, inspectionId, "Malformed Human Review storage envelope."));
            return;
        }

        const restoration = restoreNegativeZeros(candidate, entry.negativeZeroPaths);

        if (!restoration.valid) {
            diagnostics.push(diagnostic(index, recordId, executionId, inspectionId, restoration.reason));
            return;
        }

        const validation = HumanReviewDomainModel.validateHumanReviewRecord(candidate);

        if (!validation.valid) {
            diagnostics.push(diagnostic(index, recordId, executionId, inspectionId, validation.errors.join(" ")));
            return;
        }

        records.push(immutableClone(candidate));
    });

    return { records, diagnostics, rawIds };
}

function listResult(inspection, field, value) {
    const relevantDiagnostics = diagnosticsFor(inspection.diagnostics, field, value);
    const applicableRecords = field === "executionId"
        ? recordsForExecution(inspection.records, value)
        : recordsForInspection(inspection.records, value);
    const grouped = groupByExecution(inspection.records);
    const applicableExecutionIds = new Set(applicableRecords.map((entry) => entry.executionId));
    const analyses = [...grouped.entries()]
        .filter(([executionId]) => field === "executionId" ? executionId === value : applicableExecutionIds.has(executionId))
        .map(([, history]) => analyzeHistoryChain(history));
    const safeEntries = new Set(analyses.flatMap((analysis) => analysis.safeRecords));
    const records = applicableRecords.filter((entry) => safeEntries.has(entry));
    const chainDiagnostics = analyses.flatMap((analysis) => analysis.diagnostics);
    const diagnostics = [...relevantDiagnostics, ...chainDiagnostics];
    const status = diagnostics.length > 0
        ? "PARTIAL_WITH_CORRUPTION"
        : records.length > 0 ? "FOUND" : "EMPTY";

    return result(status, {
        record: null,
        records: records.map((entry) => immutableClone(entry)),
        diagnostics
    });
}

function diagnosticsFor(diagnostics, field, value) {
    return diagnostics.filter((entry) => entry[field] === value || entry[field] === null);
}

function validateHistoryChain(records) {
    const analysis = analyzeHistoryChain(records);
    return {
        valid: analysis.valid,
        reason: analysis.diagnostics[0]?.reason || null
    };
}

function analyzeHistoryChain(records) {
    const safeRecords = [];
    const diagnostics = [];

    if (records.length === 0) {
        return { valid: true, safeRecords, diagnostics };
    }

    for (let index = 0; index < records.length; index += 1) {
        const record = records[index];
        const expectedSequence = index + 1;
        let reason = null;

        if (record.sequence !== expectedSequence) {
            reason = `Expected sequence ${expectedSequence}, found ${record.sequence}.`;
        } else if (index === 0 && record.previousReviewId !== null) {
            reason = "First persisted review has a predecessor.";
        } else if (index > 0) {
            const predecessor = safeRecords[index - 1];

            if (record.previousReviewId !== predecessor.reviewId) {
                reason = "Persisted predecessor linkage is invalid.";
            } else if (record.inspectionId !== predecessor.inspectionId) {
                reason = "Persisted inspection binding is inconsistent.";
            }
        }

        if (reason) {
            records.slice(index).forEach((invalidRecord, suffixIndex) => {
                diagnostics.push(diagnostic(
                    null,
                    invalidRecord.reviewId,
                    invalidRecord.executionId,
                    invalidRecord.inspectionId,
                    suffixIndex === 0 ? reason : "Record depends on an invalid execution-history member."
                ));
            });
            break;
        }

        safeRecords.push(record);
    }

    return {
        valid: safeRecords.length === records.length,
        safeRecords,
        diagnostics
    };
}

function recordsForExecution(records, executionId) {
    return deterministicSort(records.filter((entry) => entry.executionId === executionId));
}

function recordsForInspection(records, inspectionId) {
    return deterministicSort(records.filter((entry) => entry.inspectionId === inspectionId));
}

function deterministicSort(records) {
    return [...records].sort((left, right) => {
        return left.sequence - right.sequence || left.reviewId.localeCompare(right.reviewId);
    });
}

function groupByExecution(records) {
    return records.reduce((groups, record) => {
        const history = groups.get(record.executionId) || [];
        history.push(record);
        groups.set(record.executionId, deterministicSort(history));
        return groups;
    }, new Map());
}

function result(status, { record, records, diagnostics }) {
    return deepFreeze({
        status,
        record,
        records,
        diagnostics: diagnostics.map((entry) => ({ ...entry }))
    });
}

function diagnostic(storageIndex, recordId, executionId, inspectionId, reason) {
    return {
        storageIndex,
        recordId,
        executionId,
        inspectionId,
        state: "CORRUPT_HUMAN_REVIEW_EXCLUDED",
        reason
    };
}

function requireIdentifier(value, field) {
    if (typeof value !== "string" || !value.trim() || value !== value.trim()) {
        throw new Error(`HumanReviewPersistenceManager: ${field} must be an exact meaningful string.`);
    }
}

function isObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
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

function immutableClone(value) {
    return deepFreeze(cloneValue(value));
}

function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) {
        return value;
    }

    Object.values(value).forEach((entry) => deepFreeze(entry));
    return Object.freeze(value);
}

function isDeepFrozen(value, seen = new WeakSet()) {
    if (!value || typeof value !== "object") {
        return true;
    }

    if (seen.has(value)) {
        return true;
    }

    if (!Object.isFrozen(value)) {
        return false;
    }

    seen.add(value);
    return Object.values(value).every((entry) => isDeepFrozen(entry, seen));
}

function collectNegativeZeroPaths(value, path = [], paths = []) {
    if (typeof value === "number" && Object.is(value, -0)) {
        paths.push([...path]);
        return paths;
    }

    if (!value || typeof value !== "object") {
        return paths;
    }

    if (Array.isArray(value)) {
        value.forEach((entry, index) => collectNegativeZeroPaths(entry, [...path, index], paths));
        return paths;
    }

    Object.keys(value).forEach((key) => collectNegativeZeroPaths(value[key], [...path, key], paths));
    return paths;
}

function restoreNegativeZeros(value, paths = []) {
    if (paths === undefined) {
        return { valid: true, reason: null };
    }

    if (!Array.isArray(paths)) {
        return { valid: false, reason: "Malformed negative-zero preservation metadata." };
    }

    const canonicalPaths = new Set();
    const targets = [];

    for (const path of paths) {
        if (!Array.isArray(path) || path.length === 0) {
            return { valid: false, reason: "Malformed negative-zero preservation path." };
        }

        const canonicalPath = JSON.stringify(path);

        if (canonicalPaths.has(canonicalPath)) {
            return { valid: false, reason: `Duplicate negative-zero preservation path: ${canonicalPath}.` };
        }

        canonicalPaths.add(canonicalPath);

        let owner = value;

        for (let index = 0; index < path.length - 1; index += 1) {
            const segment = path[index];

            if (!isCanonicalPathSegment(owner, segment) || !Object.hasOwn(owner, segment)) {
                return { valid: false, reason: "Negative-zero preservation path does not resolve." };
            }

            owner = owner[segment];
        }

        const key = path[path.length - 1];

        if (!isCanonicalPathSegment(owner, key) || !Object.hasOwn(owner, key)
            || !isNegativeZeroMarker(owner[key])) {
            return { valid: false, reason: "Negative-zero preservation target is invalid." };
        }

        targets.push({ owner, key });
    }

    targets.forEach(({ owner, key }) => {
        owner[key] = -0;
    });

    return { valid: true, reason: null };
}

function isCanonicalPathSegment(owner, segment) {
    if (!owner || typeof owner !== "object") {
        return false;
    }

    if (Array.isArray(owner)) {
        return Number.isSafeInteger(segment)
            && segment >= 0
            && segment < owner.length;
    }

    return typeof segment === "string" && !FORBIDDEN_PATH_SEGMENTS.has(segment);
}

function encodeForStorage(value) {
    if (typeof value === "number" && Object.is(value, -0)) {
        return { [NEGATIVE_ZERO_MARKER_KEY]: NEGATIVE_ZERO_MARKER_VALUE };
    }

    if (value === null || typeof value !== "object") {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map((entry) => encodeForStorage(entry));
    }

    return Object.keys(value).reduce((encoded, key) => {
        Object.defineProperty(encoded, key, {
            value: encodeForStorage(value[key]),
            enumerable: true,
            writable: true,
            configurable: true
        });
        return encoded;
    }, {});
}

function isNegativeZeroMarker(value) {
    return isObject(value)
        && Object.keys(value).length === 1
        && Object.hasOwn(value, NEGATIVE_ZERO_MARKER_KEY)
        && value[NEGATIVE_ZERO_MARKER_KEY] === NEGATIVE_ZERO_MARKER_VALUE;
}
