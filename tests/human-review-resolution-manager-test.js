import assert from "node:assert/strict";
import fs from "node:fs";
import HumanReviewDomainModel from "../portal/core/HumanReviewDomainModel.js";
import HumanReviewPersistenceManager from "../portal/core/HumanReviewPersistenceManager.js";
import HumanReviewResolutionManager from "../portal/core/HumanReviewResolutionManager.js";

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

function execution(id = "EI-inspection-1-0001", inspectionId = "inspection-1") {
    return {
        id,
        executionSchemaVersion: "expert-intelligence-execution-1.0",
        inspectionId,
        engineStatus: "succeeded",
        sourceFingerprint: `fingerprint-${id}`
    };
}

function createReview({
    executionRecord = execution(),
    sequence = 1,
    previousReview = null,
    decision = HumanReviewDomainModel.DECISIONS.CONFIRMED,
    reviewerRole = HumanReviewDomainModel.REVIEWER_ROLES.PROFESSIONAL_REVIEWER,
    reviewedAt = "2026-07-21T18:00:00.000Z"
} = {}) {
    const reviewId = HumanReviewDomainModel.createReviewId(executionRecord.id, sequence);
    const limitations = decision === HumanReviewDomainModel.DECISIONS.CONFIRMED_WITH_LIMITATIONS
        ? ["Limited access to one inspection area."]
        : [];
    const followUpRequirements = decision === HumanReviewDomainModel.DECISIONS.RERUN_REQUIRED
        ? ["Repeat the deterministic execution after evidence correction."]
        : [];

    return HumanReviewDomainModel.createHumanReviewRecord({
        reviewId,
        reviewSchemaVersion: HumanReviewDomainModel.REVIEW_SCHEMA_VERSION,
        inspectionId: executionRecord.inspectionId,
        buildingId: "building-1",
        caseId: "case-1",
        executionId: executionRecord.id,
        sequence,
        previousReviewId: previousReview?.reviewId ?? null,
        reviewerId: `reviewer-${sequence}`,
        reviewerDisplayName: `Reviewer ${sequence}`,
        reviewerRole,
        executionStatusAtReview: executionRecord.engineStatus,
        executionFingerprintAtReview: executionRecord.sourceFingerprint,
        staleAtReview: false,
        decision,
        rationale: "Professional decision recorded without automated reinterpretation.",
        notes: "",
        limitations,
        followUpRequirements,
        rerunRecommendation: null,
        references: [{ id: `evidence-${sequence}`, metadata: { sequence } }],
        reviewedAt,
        createdAt: reviewedAt,
        decisionVocabularyVersion: HumanReviewDomainModel.DECISION_VOCABULARY_VERSION,
        humanReviewResponsibility: HumanReviewDomainModel.HUMAN_REVIEW_RESPONSIBILITY
    }, {
        execution: executionRecord,
        persisted: true,
        staleAtReview: false,
        previousReview
    });
}

function appendChain(decisions = [HumanReviewDomainModel.DECISIONS.CONFIRMED], executionRecord = execution()) {
    const records = [];

    decisions.forEach((decision, index) => {
        const record = createReview({
            executionRecord,
            sequence: index + 1,
            previousReview: records[index - 1] ?? null,
            decision,
            reviewedAt: `2026-07-21T${String(18 - index).padStart(2, "0")}:00:00.000Z`
        });
        HumanReviewPersistenceManager.appendHumanReview(record);
        records.push(record);
    });

    return records;
}

function inject(entries) {
    localStorage.setItem("mbi:humanReviews", JSON.stringify(entries));
}

function envelope(record, overrides = {}) {
    return { id: record.reviewId, record, ...overrides };
}

function immutableRecord(overrides = {}) {
    const first = createReview();
    return deepFreeze({ ...first, ...overrides });
}

function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) {
        return value;
    }

    Object.values(value).forEach((entry) => deepFreeze(entry));
    return Object.freeze(value);
}

function withPersistenceResult(result, fn) {
    const original = HumanReviewPersistenceManager.listHumanReviewsForExecution;
    HumanReviewPersistenceManager.listHumanReviewsForExecution = () => result;

    try {
        return fn();
    } finally {
        HumanReviewPersistenceManager.listHumanReviewsForExecution = original;
    }
}

function dependencyDiagnostic(overrides = {}) {
    return {
        storageIndex: null,
        recordId: null,
        executionId: "EI-inspection-1-0001",
        inspectionId: "inspection-1",
        state: "CORRUPT_HUMAN_REVIEW_EXCLUDED",
        reason: "Persisted Human Review dependency data is corrupt.",
        ...overrides
    };
}

function assertContractCorruption(result) {
    assert.equal(result.status, "CORRUPT_HISTORY");
    assert.equal(result.reviewed, false);
    assert.equal(result.effectiveReview, null);
    assert.equal(result.effectiveDecision, null);
    assert.equal(result.reviewCount, 0);
    assert.deepEqual(result.records, []);
    assert.equal(result.diagnostics.length, 1);
    assert.equal(result.diagnostics[0].state, "CORRUPT_B2B_RESULT_EXCLUDED");
}

runTest("accepts a valid execution identifier", () => {
    assert.equal(HumanReviewResolutionManager.resolveExecutionReviewState("EI-inspection-1-0001").status, "NOT_REVIEWED");
});

runTest("rejects invalid execution identifiers without normalization", () => {
    ["", " ", " EI-1", "EI-1 ", "EI/1", "EI.1", 1, null, undefined, {}, []].forEach((value) => {
        assert.throws(() => HumanReviewResolutionManager.resolveExecutionReviewState(value), /executionId/);
    });
});

runTest("resolves an empty valid history as NOT_REVIEWED", () => {
    const result = HumanReviewResolutionManager.resolveEffectiveHumanReview("EI-inspection-1-0001");
    assert.deepEqual(result, {
        status: "NOT_REVIEWED",
        executionId: "EI-inspection-1-0001",
        reviewed: false,
        effectiveReview: null,
        effectiveDecision: null,
        reviewCount: 0,
        records: [],
        diagnostics: []
    });
});

runTest("resolves one valid review as REVIEWED and effective", () => {
    const [first] = appendChain();
    const result = HumanReviewResolutionManager.resolveEffectiveHumanReview(first.executionId);
    assert.equal(result.status, "REVIEWED");
    assert.equal(result.reviewed, true);
    assert.deepEqual(result.effectiveReview, first);
    assert.equal(result.reviewCount, 1);
});

runTest("selects the highest safe sequence rather than the latest timestamp", () => {
    const records = appendChain([
        HumanReviewDomainModel.DECISIONS.REJECTED,
        HumanReviewDomainModel.DECISIONS.CONFIRMED
    ]);
    const result = HumanReviewResolutionManager.getCurrentReview(records[0].executionId);
    assert.equal(result.record.sequence, 2);
    assert.equal(result.record.reviewId, records[1].reviewId);
});

runTest("preserves every professional decision exactly without ranking", () => {
    const decisions = Object.values(HumanReviewDomainModel.DECISIONS);

    decisions.forEach((decision, index) => {
        storage.clear();
        const executionRecord = execution(`EI-inspection-${index + 1}-0001`, `inspection-${index + 1}`);
        const [record] = appendChain([decision], executionRecord);
        const result = HumanReviewResolutionManager.resolveExecutionReviewState(record.executionId);
        assert.equal(result.effectiveDecision, decision);
        assert.equal(result.effectiveReview.decision, decision);
    });
});

runTest("returns a valid chain in B2-B sequence order", () => {
    const records = appendChain([
        HumanReviewDomainModel.DECISIONS.CONFIRMED,
        HumanReviewDomainModel.DECISIONS.REJECTED,
        HumanReviewDomainModel.DECISIONS.RERUN_REQUIRED
    ]);
    const chain = HumanReviewResolutionManager.getReviewChain(records[0].executionId);
    assert.deepEqual(chain.records.map((entry) => entry.sequence), [1, 2, 3]);
    assert.equal(chain.reviewCount, 3);
});

runTest("uses B2-B safe prefix for partial corruption", () => {
    const first = createReview();
    const invalidThird = immutableRecord({
        sequence: 3,
        reviewId: HumanReviewDomainModel.createReviewId(first.executionId, 3),
        previousReviewId: first.reviewId
    });
    inject([envelope(first), envelope(invalidThird)]);
    const result = HumanReviewResolutionManager.resolveEffectiveHumanReview(first.executionId);
    assert.equal(result.status, "PARTIAL_WITH_CORRUPTION");
    assert.equal(result.reviewCount, 1);
    assert.equal(result.effectiveReview.reviewId, first.reviewId);
    assert.deepEqual(result.records.map((entry) => entry.sequence), [1]);
    assert.ok(result.diagnostics.length > 0);
});

runTest("excludes the first invalid member and every dependent suffix member", () => {
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
    inject([envelope(dependentFourth), envelope(first), envelope(invalidThird)]);
    const chain = HumanReviewResolutionManager.getReviewChain(first.executionId);
    assert.deepEqual(chain.records.map((entry) => entry.reviewId), [first.reviewId]);
    assert.equal(chain.diagnostics.length, 2);
});

runTest("resolves corruption without a safe record as CORRUPT_HISTORY", () => {
    const malformed = immutableRecord({
        sequence: 2,
        reviewId: HumanReviewDomainModel.createReviewId("EI-inspection-1-0001", 2),
        previousReviewId: "HR-missing-0001"
    });
    inject([envelope(malformed)]);
    const result = HumanReviewResolutionManager.resolveEffectiveHumanReview(malformed.executionId);
    assert.equal(result.status, "CORRUPT_HISTORY");
    assert.equal(result.reviewed, false);
    assert.equal(result.effectiveReview, null);
    assert.equal(result.effectiveDecision, null);
    assert.equal(result.reviewCount, 0);
    assert.ok(result.diagnostics.length > 0);
});

runTest("does not convert malformed persisted content into NOT_REVIEWED", () => {
    inject([{ id: "broken", record: { reviewId: "broken", executionId: "EI-inspection-1-0001" } }]);
    const result = HumanReviewResolutionManager.resolveExecutionReviewState("EI-inspection-1-0001");
    assert.equal(result.status, "CORRUPT_HISTORY");
    assert.notEqual(result.status, "NOT_REVIEWED");
});

runTest("storage order cannot change effective sequence", () => {
    const records = appendChain([
        HumanReviewDomainModel.DECISIONS.REJECTED,
        HumanReviewDomainModel.DECISIONS.CONFIRMED
    ]);
    const stored = JSON.parse(localStorage.getItem("mbi:humanReviews"));
    inject(stored.reverse());
    assert.equal(HumanReviewResolutionManager.getCurrentReview(records[0].executionId).record.sequence, 2);
});

runTest("reviewer role cannot override the current sequence", () => {
    const executionRecord = execution();
    const first = createReview({
        executionRecord,
        reviewerRole: HumanReviewDomainModel.REVIEWER_ROLES.LEAD_REVIEWER
    });
    HumanReviewPersistenceManager.appendHumanReview(first);
    const second = createReview({
        executionRecord,
        sequence: 2,
        previousReview: first,
        reviewerRole: HumanReviewDomainModel.REVIEWER_ROLES.PROFESSIONAL_REVIEWER
    });
    HumanReviewPersistenceManager.appendHumanReview(second);
    assert.equal(HumanReviewResolutionManager.getCurrentReview(executionRecord.id).record.reviewId, second.reviewId);
});

runTest("decision type cannot override the current sequence", () => {
    const records = appendChain([
        HumanReviewDomainModel.DECISIONS.CONFIRMED,
        HumanReviewDomainModel.DECISIONS.REJECTED
    ]);
    const result = HumanReviewResolutionManager.getCurrentReview(records[0].executionId);
    assert.equal(result.record.reviewId, records[1].reviewId);
    assert.equal(result.effectiveDecision, HumanReviewDomainModel.DECISIONS.REJECTED);
});

runTest("separate executions resolve independently", () => {
    const one = execution("EI-inspection-1-0001", "inspection-1");
    const two = execution("EI-inspection-2-0001", "inspection-2");
    appendChain([HumanReviewDomainModel.DECISIONS.CONFIRMED], one);
    appendChain([HumanReviewDomainModel.DECISIONS.REJECTED], two);
    assert.equal(HumanReviewResolutionManager.getCurrentReview(one.id).effectiveDecision, "CONFIRMED");
    assert.equal(HumanReviewResolutionManager.getCurrentReview(two.id).effectiveDecision, "REJECTED");
});

runTest("executions under one inspection do not contaminate each other", () => {
    const one = execution("EI-inspection-1-0001", "inspection-1");
    const two = execution("EI-inspection-1-0002", "inspection-1");
    appendChain([HumanReviewDomainModel.DECISIONS.CONFIRMED], one);
    appendChain([HumanReviewDomainModel.DECISIONS.RERUN_REQUIRED], two);
    assert.equal(HumanReviewResolutionManager.getReviewChain(one.id).reviewCount, 1);
    assert.equal(HumanReviewResolutionManager.getCurrentReview(two.id).effectiveDecision, "RERUN_REQUIRED");
});

runTest("returns deeply frozen canonical state", () => {
    appendChain();
    const result = HumanReviewResolutionManager.resolveEffectiveHumanReview("EI-inspection-1-0001");
    assert.equal(Object.isFrozen(result), true);
    assert.equal(Object.isFrozen(result.records), true);
    assert.equal(Object.isFrozen(result.records[0]), true);
    assert.equal(Object.isFrozen(result.records[0].references[0].metadata), true);
    assert.equal(Object.isFrozen(result.diagnostics), true);
    assert.throws(() => { result.records[0].decision = "REJECTED"; }, TypeError);
});

runTest("returns deeply frozen chain and current-review projections", () => {
    appendChain();
    const chain = HumanReviewResolutionManager.getReviewChain("EI-inspection-1-0001");
    const current = HumanReviewResolutionManager.getCurrentReview("EI-inspection-1-0001");
    assert.equal(Object.isFrozen(chain), true);
    assert.equal(Object.isFrozen(chain.records), true);
    assert.equal(Object.isFrozen(current), true);
    assert.equal(Object.isFrozen(current.record), true);
});

runTest("returns detached results on separate calls", () => {
    appendChain();
    const one = HumanReviewResolutionManager.resolveExecutionReviewState("EI-inspection-1-0001");
    const two = HumanReviewResolutionManager.resolveExecutionReviewState("EI-inspection-1-0001");
    assert.notStrictEqual(one, two);
    assert.notStrictEqual(one.records, two.records);
    assert.notStrictEqual(one.effectiveReview, two.effectiveReview);
    assert.notStrictEqual(one.diagnostics, two.diagnostics);
});

runTest("does not mutate B2-B persistence results", () => {
    appendChain();
    const before = HumanReviewPersistenceManager.listHumanReviewsForExecution("EI-inspection-1-0001");
    const snapshot = JSON.stringify(before);
    HumanReviewResolutionManager.resolveEffectiveHumanReview("EI-inspection-1-0001");
    assert.equal(JSON.stringify(before), snapshot);
});

runTest("all five public methods return consistent status-bearing results", () => {
    appendChain();
    const methods = [
        "resolveEffectiveHumanReview",
        "resolveExecutionReviewState",
        "isExecutionReviewed",
        "getReviewChain",
        "getCurrentReview"
    ];
    const results = methods.map((method) => HumanReviewResolutionManager[method]("EI-inspection-1-0001"));
    results.forEach((result) => {
        assert.equal(result.status, "REVIEWED");
        assert.equal(result.executionId, "EI-inspection-1-0001");
        assert.equal(result.reviewed, true);
        assert.equal(Object.isFrozen(result), true);
    });
});

runTest("all five public methods remain consistent for partial corruption", () => {
    const first = createReview();
    const invalidThird = immutableRecord({
        sequence: 3,
        reviewId: HumanReviewDomainModel.createReviewId(first.executionId, 3),
        previousReviewId: first.reviewId
    });
    inject([envelope(first), envelope(invalidThird)]);
    const methods = [
        "resolveEffectiveHumanReview",
        "resolveExecutionReviewState",
        "isExecutionReviewed",
        "getReviewChain",
        "getCurrentReview"
    ];

    methods.forEach((method) => {
        const result = HumanReviewResolutionManager[method](first.executionId);
        assert.equal(result.status, "PARTIAL_WITH_CORRUPTION");
        assert.equal(result.reviewed, true);
        assert.ok(result.diagnostics.length > 0);
    });
});

runTest("current-review null remains distinguishable for empty and corrupt histories", () => {
    const empty = HumanReviewResolutionManager.getCurrentReview("EI-empty-0001");
    assert.equal(empty.status, "NOT_REVIEWED");
    assert.equal(empty.record, null);
    assert.equal(empty.reviewed, false);

    const malformed = immutableRecord({
        sequence: 2,
        reviewId: HumanReviewDomainModel.createReviewId("EI-inspection-1-0001", 2),
        previousReviewId: "HR-missing-0001"
    });
    inject([envelope(malformed)]);
    const corrupt = HumanReviewResolutionManager.getCurrentReview(malformed.executionId);
    assert.equal(corrupt.status, "CORRUPT_HISTORY");
    assert.equal(corrupt.record, null);
    assert.equal(corrupt.reviewed, false);
    assert.ok(corrupt.diagnostics.length > 0);
});

runTest("rejects unordered and descending dependency records without sorting", () => {
    const records = appendChain([
        HumanReviewDomainModel.DECISIONS.CONFIRMED,
        HumanReviewDomainModel.DECISIONS.REJECTED
    ]);
    const supplied = [records[1], records[0]];

    withPersistenceResult({ status: "FOUND", records: supplied, diagnostics: [] }, () => {
        const result = HumanReviewResolutionManager.resolveEffectiveHumanReview(records[0].executionId);
        assertContractCorruption(result);
        assert.deepEqual(supplied, [records[1], records[0]]);
    });
});

runTest("rejects equal adjacent sequences and duplicate review IDs", () => {
    const [first] = appendChain();
    const duplicate = structuredClone(first);

    withPersistenceResult({ status: "FOUND", records: [first, duplicate], diagnostics: [] }, () => {
        const result = HumanReviewResolutionManager.resolveEffectiveHumanReview(first.executionId);
        assertContractCorruption(result);
        assert.match(result.diagnostics[0].reason, /duplicate reviewId/);
    });
});

runTest("rejects duplicate sequences with distinct review IDs", () => {
    const [first] = appendChain();
    const duplicateSequence = deepFreeze({ ...first, reviewId: "HR-distinct-duplicate-sequence" });

    withPersistenceResult({ status: "FOUND", records: [first, duplicateSequence], diagnostics: [] }, () => {
        const result = HumanReviewResolutionManager.resolveEffectiveHumanReview(first.executionId);
        assertContractCorruption(result);
        assert.match(result.diagnostics[0].reason, /duplicate sequence/);
    });
});

runTest("rejects a repeated record reference without inflating count or selecting it", () => {
    const [first] = appendChain();

    withPersistenceResult({ status: "FOUND", records: [first, first], diagnostics: [] }, () => {
        assertContractCorruption(HumanReviewResolutionManager.resolveEffectiveHumanReview(first.executionId));
    });
});

runTest("rejects non-array null string and object diagnostics", () => {
    const [first] = appendChain();

    [undefined, null, "diagnostic", {}, 1, true].forEach((diagnostics) => {
        withPersistenceResult({ status: "FOUND", records: [first], diagnostics }, () => {
            assertContractCorruption(HumanReviewResolutionManager.resolveEffectiveHumanReview(first.executionId));
        });
    });
});

runTest("rejects sparse and property-bearing diagnostics arrays", () => {
    const [first] = appendChain();
    const sparse = new Array(1);
    const propertyBearing = [];
    propertyBearing.extra = dependencyDiagnostic();

    [sparse, propertyBearing].forEach((diagnostics) => {
        withPersistenceResult({ status: "PARTIAL_WITH_CORRUPTION", records: [first], diagnostics }, () => {
            assertContractCorruption(HumanReviewResolutionManager.resolveEffectiveHumanReview(first.executionId));
        });
    });
});

runTest("rejects malformed and accessor-bearing diagnostic entries", () => {
    const [first] = appendChain();
    const accessor = {};
    Object.defineProperty(accessor, "reason", { enumerable: true, get: () => "hidden" });
    const malformedEntries = [
        null,
        "diagnostic",
        {},
        dependencyDiagnostic({ reason: "" }),
        dependencyDiagnostic({ state: "UNKNOWN" }),
        accessor
    ];

    malformedEntries.forEach((entry) => {
        withPersistenceResult({
            status: "PARTIAL_WITH_CORRUPTION",
            records: [first],
            diagnostics: [entry]
        }, () => {
            assertContractCorruption(HumanReviewResolutionManager.resolveEffectiveHumanReview(first.executionId));
        });
    });
});

runTest("accepts valid empty diagnostics for ordered unique FOUND records", () => {
    const records = appendChain([
        HumanReviewDomainModel.DECISIONS.CONFIRMED,
        HumanReviewDomainModel.DECISIONS.REJECTED
    ]);

    withPersistenceResult({ status: "FOUND", records, diagnostics: [] }, () => {
        const result = HumanReviewResolutionManager.resolveEffectiveHumanReview(records[0].executionId);
        assert.equal(result.status, "REVIEWED");
        assert.equal(result.reviewCount, 2);
        assert.equal(result.effectiveReview.reviewId, records[1].reviewId);
    });
});

runTest("keeps all five methods status-consistent for invalid dependency output", () => {
    const records = appendChain([
        HumanReviewDomainModel.DECISIONS.CONFIRMED,
        HumanReviewDomainModel.DECISIONS.REJECTED
    ]);
    const invalid = { status: "FOUND", records: [records[1], records[0]], diagnostics: [] };
    const methods = [
        "resolveEffectiveHumanReview",
        "resolveExecutionReviewState",
        "isExecutionReviewed",
        "getReviewChain",
        "getCurrentReview"
    ];

    withPersistenceResult(invalid, () => {
        methods.forEach((method) => {
            const result = HumanReviewResolutionManager[method](records[0].executionId);
            assert.equal(result.status, "CORRUPT_HISTORY");
            assert.equal(result.reviewed, false);
            assert.equal(result.diagnostics[0].state, "CORRUPT_B2B_RESULT_EXCLUDED");
        });
    });
});

runTest("exposes exactly the five approved public methods", () => {
    const methods = Object.getOwnPropertyNames(HumanReviewResolutionManager)
        .filter((name) => typeof HumanReviewResolutionManager[name] === "function")
        .filter((name) => !["length", "name", "prototype"].includes(name));
    assert.deepEqual(methods, [
        "resolveEffectiveHumanReview",
        "resolveExecutionReviewState",
        "isExecutionReviewed",
        "getReviewChain",
        "getCurrentReview"
    ]);
});

runTest("uses only the released B2-B execution-list read method", () => {
    const source = fs.readFileSync(new URL("../portal/core/HumanReviewResolutionManager.js", import.meta.url), "utf8");
    const persistenceCalls = [...source.matchAll(/HumanReviewPersistenceManager\.([A-Za-z0-9_]+)\s*\(/g)]
        .map((match) => match[1]);
    assert.deepEqual([...new Set(persistenceCalls)], ["listHumanReviewsForExecution"]);
});

runTest("contains no persistence writes or direct storage dependency", () => {
    const source = fs.readFileSync(new URL("../portal/core/HumanReviewResolutionManager.js", import.meta.url), "utf8");
    assert.doesNotMatch(source, /StorageManager|localStorage|appendHumanReview|\.(?:save|update|delete|clear|remove)\s*\(/);
});

runTest("contains no UI workflow authorization report or execution behavior", () => {
    const source = fs.readFileSync(new URL("../portal/core/HumanReviewResolutionManager.js", import.meta.url), "utf8");
    assert.doesNotMatch(source, /React|InspectionPage|authorization|permission|workflow|voting|consensus|report|exportApproval|exportReport|rerun|ExpertIntelligence/i);
    assert.doesNotMatch(source, /Date\.now|Math\.random|TODO|FIXME|console\./);
});

console.log("Human Review Resolution Manager tests completed successfully.");
