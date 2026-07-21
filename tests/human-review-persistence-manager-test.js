import assert from "node:assert/strict";
import HumanReviewDomainModel from "../portal/core/HumanReviewDomainModel.js";
import HumanReviewPersistenceManager from "../portal/core/HumanReviewPersistenceManager.js";

const storage = new Map();
globalThis.localStorage = {
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, String(value)); },
    removeItem(key) { storage.delete(key); },
    clear() { storage.clear(); }
};

function runTest(name, fn) {
    try {
        storage.clear();
        fn();
        console.log(`✓ ${name}`);
    } catch (error) {
        console.error(`✗ ${name}`);
        throw error;
    }
}

function execution(overrides = {}) {
    return {
        id: "EI-inspection-1-0001",
        executionSchemaVersion: "expert-intelligence-execution-1.0",
        inspectionId: "inspection-1",
        engineStatus: "succeeded",
        sourceFingerprint: "fnv1a-12345678",
        ...overrides
    };
}

function reviewData(overrides = {}) {
    const executionId = overrides.executionId ?? "EI-inspection-1-0001";
    const sequence = overrides.sequence ?? 1;
    return {
        reviewId: HumanReviewDomainModel.createReviewId(executionId, sequence),
        reviewSchemaVersion: HumanReviewDomainModel.REVIEW_SCHEMA_VERSION,
        inspectionId: overrides.inspectionId ?? "inspection-1",
        buildingId: "building-1",
        caseId: "case-1",
        executionId,
        sequence,
        previousReviewId: sequence === 1 ? null : "HR-EI-inspection-1-0001-0001",
        reviewerId: "reviewer-1",
        reviewerDisplayName: "Professional Reviewer",
        reviewerRole: HumanReviewDomainModel.REVIEWER_ROLES.PROFESSIONAL_REVIEWER,
        executionStatusAtReview: "succeeded",
        executionFingerprintAtReview: "fnv1a-12345678",
        staleAtReview: false,
        decision: HumanReviewDomainModel.DECISIONS.CONFIRMED,
        rationale: "The persisted evidence supports this professional review.",
        notes: "",
        limitations: [],
        followUpRequirements: [],
        rerunRecommendation: null,
        references: [],
        reviewedAt: overrides.reviewedAt ?? "2026-07-21T18:00:00.000Z",
        createdAt: overrides.createdAt ?? "2026-07-21T18:00:00.000Z",
        decisionVocabularyVersion: HumanReviewDomainModel.DECISION_VOCABULARY_VERSION,
        humanReviewResponsibility: HumanReviewDomainModel.HUMAN_REVIEW_RESPONSIBILITY,
        ...overrides
    };
}

function createReview(overrides = {}, previousReview = null) {
    const data = reviewData(overrides);
    return HumanReviewDomainModel.createHumanReviewRecord(data, {
        execution: execution({ id: data.executionId, inspectionId: data.inspectionId }),
        persisted: true,
        staleAtReview: false,
        previousReview
    });
}

function appendSecond(first, overrides = {}) {
    const second = createReview({
        sequence: 2,
        reviewId: HumanReviewDomainModel.createReviewId(first.executionId, 2),
        previousReviewId: first.reviewId,
        reviewedAt: "2026-07-21T17:00:00.000Z",
        createdAt: "2026-07-21T17:00:00.000Z",
        ...overrides
    }, first);
    HumanReviewPersistenceManager.appendHumanReview(second);
    return second;
}

function inject(entries) {
    localStorage.setItem("mbi:humanReviews", JSON.stringify(entries));
}

function immutableRecord(overrides = {}) {
    return deepFreeze(reviewData(overrides));
}

function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) {
        return value;
    }

    Object.values(value).forEach((entry) => deepFreeze(entry));
    return Object.freeze(value);
}

runTest("appends and retrieves the first immutable Human Review", () => {
    const first = createReview();
    const appended = HumanReviewPersistenceManager.appendHumanReview(first);
    const found = HumanReviewPersistenceManager.getHumanReviewById(first.reviewId);
    assert.equal(appended.status, "APPENDED");
    assert.equal(found.status, "FOUND");
    assert.deepEqual(found.record, first);
});

runTest("lists Human Reviews by execution and inspection", () => {
    const first = createReview();
    HumanReviewPersistenceManager.appendHumanReview(first);
    assert.deepEqual(HumanReviewPersistenceManager.listHumanReviewsForExecution(first.executionId).records, [first]);
    assert.deepEqual(HumanReviewPersistenceManager.listHumanReviewsForInspection(first.inspectionId).records, [first]);
});

runTest("appends a valid second review and derives latest by sequence", () => {
    const first = createReview({ reviewedAt: "2026-07-21T20:00:00.000Z" });
    HumanReviewPersistenceManager.appendHumanReview(first);
    const second = appendSecond(first);
    const latest = HumanReviewPersistenceManager.getLatestHumanReviewForExecution(first.executionId);
    assert.equal(latest.status, "FOUND");
    assert.equal(latest.record.reviewId, second.reviewId);
    assert.equal(latest.record.sequence, 2);
});

runTest("enforces immediate predecessor linkage", () => {
    const first = createReview();
    HumanReviewPersistenceManager.appendHumanReview(first);
    const wrong = immutableRecord({
        sequence: 2,
        reviewId: HumanReviewDomainModel.createReviewId(first.executionId, 2),
        previousReviewId: "HR-wrong-0001"
    });
    assert.throws(() => HumanReviewPersistenceManager.appendHumanReview(wrong), /previousReviewId/);
});

runTest("rejects duplicate review IDs", () => {
    const first = createReview();
    HumanReviewPersistenceManager.appendHumanReview(first);
    assert.throws(() => HumanReviewPersistenceManager.appendHumanReview(first), /duplicate reviewId/);
});

runTest("rejects duplicate sequence for the same execution", () => {
    const first = createReview();
    inject([{ id: first.reviewId, record: first }, { id: first.reviewId, record: first }]);
    const candidate = createReview({
        sequence: 2,
        reviewId: HumanReviewDomainModel.createReviewId(first.executionId, 2),
        previousReviewId: first.reviewId
    }, first);
    assert.throws(() => HumanReviewPersistenceManager.appendHumanReview(candidate), /corrupt|duplicate/i);
});

runTest("rejects a sequence gap", () => {
    const first = createReview();
    HumanReviewPersistenceManager.appendHumanReview(first);
    const gap = immutableRecord({
        sequence: 3,
        reviewId: HumanReviewDomainModel.createReviewId(first.executionId, 3),
        previousReviewId: first.reviewId
    });
    assert.throws(() => HumanReviewPersistenceManager.appendHumanReview(gap), /immediately follow/);
});

runTest("rejects a cross-execution predecessor", () => {
    const first = createReview();
    HumanReviewPersistenceManager.appendHumanReview(first);
    const other = immutableRecord({
        executionId: "EI-inspection-1-0002",
        sequence: 2,
        reviewId: HumanReviewDomainModel.createReviewId("EI-inspection-1-0002", 2),
        previousReviewId: first.reviewId
    });
    assert.throws(() => HumanReviewPersistenceManager.appendHumanReview(other), /another execution/);
});

runTest("rejects an inspection binding conflict", () => {
    const first = createReview();
    HumanReviewPersistenceManager.appendHumanReview(first);
    const conflicting = immutableRecord({
        inspectionId: "inspection-2",
        sequence: 2,
        reviewId: HumanReviewDomainModel.createReviewId(first.executionId, 2),
        previousReviewId: first.reviewId
    });
    assert.throws(() => HumanReviewPersistenceManager.appendHumanReview(conflicting), /inspection binding/);
});

runTest("rejects malformed mutable and unsupported-schema reviews", () => {
    const valid = createReview();
    assert.throws(() => HumanReviewPersistenceManager.appendHumanReview({ ...valid, rationale: "" }), /invalid/);
    assert.throws(() => HumanReviewPersistenceManager.appendHumanReview({ ...valid }), /immutable/);
    const unsupported = Object.freeze({ ...valid, reviewSchemaVersion: "human-review-record-2.0" });
    assert.throws(() => HumanReviewPersistenceManager.appendHumanReview(unsupported), /invalid/);
});

runTest("does not mutate input and persists a detached record", () => {
    const first = createReview({ references: [{ id: "evidence-1", metadata: { page: 2 } }] });
    const before = JSON.stringify(first);
    const appended = HumanReviewPersistenceManager.appendHumanReview(first);
    assert.equal(JSON.stringify(first), before);
    assert.notStrictEqual(appended.record, first);
    assert.notStrictEqual(appended.record.references, first.references);
});

runTest("returns detached immutable records on every retrieval", () => {
    const first = createReview({ references: [{ id: "evidence-1", metadata: { page: 2 } }] });
    HumanReviewPersistenceManager.appendHumanReview(first);
    const one = HumanReviewPersistenceManager.getHumanReviewById(first.reviewId).record;
    const two = HumanReviewPersistenceManager.getHumanReviewById(first.reviewId).record;
    assert.notStrictEqual(one, two);
    assert.equal(Object.isFrozen(one), true);
    assert.equal(Object.isFrozen(one.references[0].metadata), true);
    assert.throws(() => { one.references[0].metadata.page = 99; }, TypeError);
    assert.equal(two.references[0].metadata.page, 2);
});

runTest("orders history by sequence rather than timestamp or storage order", () => {
    const first = createReview({ reviewedAt: "2026-07-21T20:00:00.000Z" });
    HumanReviewPersistenceManager.appendHumanReview(first);
    const second = appendSecond(first, { reviewedAt: "2026-07-21T10:00:00.000Z" });
    const raw = JSON.parse(localStorage.getItem("mbi:humanReviews"));
    inject(raw.reverse());
    const listed = HumanReviewPersistenceManager.listHumanReviewsForExecution(first.executionId);
    assert.deepEqual(listed.records.map((entry) => entry.sequence), [1, 2]);
    assert.equal(HumanReviewPersistenceManager.getLatestHumanReviewForExecution(first.executionId).record.reviewId, second.reviewId);
});

runTest("distinguishes empty history and missing review", () => {
    assert.equal(HumanReviewPersistenceManager.listHumanReviewsForExecution("missing-execution").status, "EMPTY");
    assert.equal(HumanReviewPersistenceManager.listHumanReviewsForInspection("missing-inspection").status, "EMPTY");
    assert.equal(HumanReviewPersistenceManager.getHumanReviewById("missing-review").status, "NOT_FOUND");
    assert.equal(HumanReviewPersistenceManager.getLatestHumanReviewForExecution("missing-execution").status, "NOT_FOUND");
});

runTest("excludes malformed storage and exposes diagnostics", () => {
    const first = createReview();
    inject([
        { id: first.reviewId, record: first },
        { id: "malformed", record: { reviewId: "malformed", executionId: first.executionId } }
    ]);
    const list = HumanReviewPersistenceManager.listHumanReviewsForExecution(first.executionId);
    const latest = HumanReviewPersistenceManager.getLatestHumanReviewForExecution(first.executionId);
    assert.equal(list.status, "PARTIAL_WITH_CORRUPTION");
    assert.deepEqual(list.records, [first]);
    assert.equal(list.diagnostics.length, 1);
    assert.equal(latest.status, "CORRUPT_HISTORY");
    assert.equal(latest.record.reviewId, first.reviewId);
});

runTest("does not guess latest when persisted sequences conflict", () => {
    const first = createReview();
    const duplicate = { ...first };
    inject([
        { id: first.reviewId, record: first },
        { id: "duplicate-envelope", record: { ...duplicate, reviewId: "duplicate-envelope" } }
    ]);
    const latest = HumanReviewPersistenceManager.getLatestHumanReviewForExecution(first.executionId);
    assert.equal(latest.status, "CORRUPT_HISTORY");
    assert.equal(latest.record.reviewId, first.reviewId);
});

runTest("excludes chain-invalid records from direct reads and safe-prefix lists", () => {
    const first = createReview();
    const invalidThird = immutableRecord({
        sequence: 3,
        reviewId: HumanReviewDomainModel.createReviewId(first.executionId, 3),
        previousReviewId: first.reviewId
    });
    const dependentFourth = immutableRecord({
        sequence: 4,
        reviewId: HumanReviewDomainModel.createReviewId(first.executionId, 4),
        previousReviewId: invalidThird.reviewId
    });
    inject([
        { id: first.reviewId, record: first },
        { id: invalidThird.reviewId, record: invalidThird },
        { id: dependentFourth.reviewId, record: dependentFourth }
    ]);

    const direct = HumanReviewPersistenceManager.getHumanReviewById(invalidThird.reviewId);
    const executionList = HumanReviewPersistenceManager.listHumanReviewsForExecution(first.executionId);
    const inspectionList = HumanReviewPersistenceManager.listHumanReviewsForInspection(first.inspectionId);
    const latest = HumanReviewPersistenceManager.getLatestHumanReviewForExecution(first.executionId);

    assert.equal(direct.status, "CORRUPT");
    assert.equal(direct.record, null);
    assert.deepEqual(executionList.records.map((entry) => entry.sequence), [1]);
    assert.deepEqual(inspectionList.records.map((entry) => entry.sequence), [1]);
    assert.equal(executionList.status, "PARTIAL_WITH_CORRUPTION");
    assert.equal(Object.isFrozen(executionList.diagnostics), true);
    assert.equal(Object.isFrozen(executionList.diagnostics[0]), true);
    assert.equal(latest.status, "CORRUPT_HISTORY");
    assert.equal(latest.record.reviewId, first.reviewId);
});

runTest("returns corrupt for an incorrect-predecessor record by ID", () => {
    const first = createReview();
    const invalidSecond = immutableRecord({
        sequence: 2,
        reviewId: HumanReviewDomainModel.createReviewId(first.executionId, 2),
        previousReviewId: "HR-wrong-0001"
    });
    inject([
        { id: first.reviewId, record: first },
        { id: invalidSecond.reviewId, record: invalidSecond }
    ]);
    assert.equal(HumanReviewPersistenceManager.getHumanReviewById(invalidSecond.reviewId).status, "CORRUPT");
});

runTest("preserves negative and positive zero through nested metadata", () => {
    const first = createReview({
        references: [{
            id: "reference-zero",
            metadata: {
                rootNegative: -0,
                rootPositive: 0,
                values: [-0, 0, { nestedNegative: -0 }]
            }
        }]
    });
    HumanReviewPersistenceManager.appendHumanReview(first);
    const found = HumanReviewPersistenceManager.getHumanReviewById(first.reviewId).record;
    const metadata = found.references[0].metadata;

    assert.equal(Object.is(metadata.rootNegative, -0), true);
    assert.equal(Object.is(metadata.rootPositive, 0), true);
    assert.equal(Object.is(metadata.rootPositive, -0), false);
    assert.equal(Object.is(metadata.values[0], -0), true);
    assert.equal(Object.is(metadata.values[1], 0), true);
    assert.equal(Object.is(metadata.values[2].nestedNegative, -0), true);
    assert.deepEqual(found, first);
});

runTest("rejects duplicate and tampered negative-zero metadata before restoration", () => {
    const first = createReview({
        references: [{ id: "reference-zero", metadata: { negative: -0, positive: 0, text: "unchanged" } }]
    });
    HumanReviewPersistenceManager.appendHumanReview(first);
    const stored = JSON.parse(localStorage.getItem("mbi:humanReviews"))[0];
    const path = stored.negativeZeroPaths[0];

    inject([{ ...stored, negativeZeroPaths: [path, [...path]] }]);
    const duplicate = HumanReviewPersistenceManager.getHumanReviewById(first.reviewId);
    assert.equal(duplicate.status, "CORRUPT");
    assert.match(duplicate.diagnostics[0].reason, /Duplicate negative-zero/);

    const tampered = JSON.parse(JSON.stringify(stored));
    tampered.negativeZeroPaths = [["references", 0, "metadata", "positive"]];
    inject([tampered]);
    const positiveTarget = HumanReviewPersistenceManager.getHumanReviewById(first.reviewId);
    assert.equal(positiveTarget.status, "CORRUPT");
    assert.equal(positiveTarget.record, null);
    assert.equal(stored.record.references[0].metadata.positive, 0);
    assert.equal(stored.record.references[0].metadata.text, "unchanged");
});

runTest("enforces distinct canonical object and array path grammars", () => {
    const first = createReview({ references: [{ id: "reference-array", metadata: { values: [-0] } }] });
    HumanReviewPersistenceManager.appendHumanReview(first);
    const stored = JSON.parse(localStorage.getItem("mbi:humanReviews"))[0];
    const validPath = stored.negativeZeroPaths[0];
    assert.equal(validPath.at(-1), 0);
    assert.equal(HumanReviewPersistenceManager.getHumanReviewById(first.reviewId).status, "FOUND");

    const invalidPaths = [
        [...validPath.slice(0, -1), "0"],
        [...validPath.slice(0, -1), -1],
        [...validPath.slice(0, -1), 0.5],
        [...validPath.slice(0, -1), 1],
        ["references", 0, "metadata", "constructor"],
        ["references", 0, "metadata", "prototype"],
        ["references", 0, "metadata", "__proto__"]
    ];

    invalidPaths.forEach((path) => {
        inject([{ ...stored, negativeZeroPaths: [path] }]);
        assert.equal(HumanReviewPersistenceManager.getHumanReviewById(first.reviewId).status, "CORRUPT");
    });
});

runTest("returns only the exact safe entry for duplicate envelopes", () => {
    const first = createReview();
    inject([
        { id: first.reviewId, record: first },
        { id: first.reviewId, record: first }
    ]);
    const listed = HumanReviewPersistenceManager.listHumanReviewsForExecution(first.executionId);
    const latest = HumanReviewPersistenceManager.getLatestHumanReviewForExecution(first.executionId);
    assert.equal(listed.status, "PARTIAL_WITH_CORRUPTION");
    assert.deepEqual(listed.records.map((entry) => entry.reviewId), [first.reviewId]);
    assert.equal(latest.status, "CORRUPT_HISTORY");
    assert.equal(latest.record.reviewId, first.reviewId);
});

runTest("exposes no update delete replacement or clear API", () => {
    ["update", "updateReview", "patch", "replace", "delete", "deleteReview", "clear", "reorder"].forEach((method) => {
        assert.equal(Object.hasOwn(HumanReviewPersistenceManager, method), false);
    });
});

runTest("has no report export UI rerun permission voting or consensus behavior", () => {
    const first = createReview();
    HumanReviewPersistenceManager.appendHumanReview(first);
    const found = HumanReviewPersistenceManager.getHumanReviewById(first.reviewId).record;
    ["report", "export", "ui", "rerun", "permissions", "votes", "consensus", "approval"].forEach((field) => {
        assert.equal(Object.hasOwn(found, field), false);
    });
});

console.log("Human Review Persistence Manager tests completed successfully.");
