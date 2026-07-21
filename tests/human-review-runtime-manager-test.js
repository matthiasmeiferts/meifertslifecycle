import assert from "node:assert/strict";
import fs from "node:fs";
import ExpertIntelligenceRuntimeManager from "../portal/core/ExpertIntelligenceRuntimeManager.js";
import HumanReviewDomainModel from "../portal/core/HumanReviewDomainModel.js";
import HumanReviewPersistenceManager from "../portal/core/HumanReviewPersistenceManager.js";
import HumanReviewResolutionManager from "../portal/core/HumanReviewResolutionManager.js";
import HumanReviewRuntimeManager from "../portal/core/HumanReviewRuntimeManager.js";

const storage = new Map();
globalThis.localStorage = {
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, String(value)); },
    removeItem(key) { storage.delete(key); },
    clear() { storage.clear(); }
};

const originalGetExecutionState = ExpertIntelligenceRuntimeManager.getExecutionState;
const originalCreateSummary = ExpertIntelligenceRuntimeManager.createSummary;
const originalExecute = ExpertIntelligenceRuntimeManager.executeForInspection;
const originalAppend = HumanReviewPersistenceManager.appendHumanReview;

function runTest(name, fn) {
    try {
        storage.clear();
        installExecutionState();
        fn();
        console.log(`✓ ${name}`);
    } catch (error) {
        console.error(`✗ ${name}`);
        throw error;
    } finally {
        ExpertIntelligenceRuntimeManager.getExecutionState = originalGetExecutionState;
        ExpertIntelligenceRuntimeManager.createSummary = originalCreateSummary;
        ExpertIntelligenceRuntimeManager.executeForInspection = originalExecute;
        HumanReviewPersistenceManager.appendHumanReview = originalAppend;
    }
}

function execution(overrides = {}) {
    return deepFreeze({
        id: "EI-inspection-1-0001",
        executionSchemaVersion: "expert-intelligence-execution-1.0",
        sequence: 1,
        inspectionId: "inspection-1",
        buildingId: "building-1",
        caseId: "case-1",
        engineStatus: "succeeded",
        sourceFingerprint: "fnv1a-12345678",
        selectedDomain: "structural-systems",
        selectedProvider: "StructuralSystemsKnowledgeProvider",
        humanReviewRequired: true,
        ...overrides
    });
}

function installExecutionState(record = execution(), { stale = false } = {}) {
    ExpertIntelligenceRuntimeManager.getExecutionState = inspectionId => ({
        status: record?.engineStatus || "not_run",
        latest: record,
        stale,
        corruption: { detected: false, count: 0, records: [] },
        inspectionId
    });
    ExpertIntelligenceRuntimeManager.createSummary = current => ({
        executionId: current.id,
        status: current.engineStatus,
        selectedDomain: current.selectedDomain,
        selectedProvider: current.selectedProvider,
        humanReviewRequired: current.humanReviewRequired !== false
    });
}

function reviewData(overrides = {}) {
    return {
        executionId: "EI-inspection-1-0001",
        reviewerId: "reviewer-1",
        reviewerDisplayName: "Professional Reviewer",
        reviewerRole: HumanReviewDomainModel.REVIEWER_ROLES.PROFESSIONAL_REVIEWER,
        decision: HumanReviewDomainModel.DECISIONS.CONFIRMED,
        rationale: "The persisted evidence was reviewed by the named professional.",
        notes: "",
        limitations: [],
        followUpRequirements: [],
        rerunRecommendation: null,
        references: [],
        staleAtReview: false,
        reviewedAt: "2026-07-21T20:00:00.000Z",
        createdAt: "2026-07-21T20:00:00.000Z",
        ...overrides
    };
}

function record(overrides = {}, previousReview = null) {
    const currentExecution = execution(overrides.execution || {});
    const sequence = overrides.sequence ?? (previousReview ? previousReview.sequence + 1 : 1);
    return HumanReviewDomainModel.createHumanReviewRecord({
        reviewId: HumanReviewDomainModel.createReviewId(currentExecution.id, sequence),
        reviewSchemaVersion: HumanReviewDomainModel.REVIEW_SCHEMA_VERSION,
        inspectionId: currentExecution.inspectionId,
        buildingId: currentExecution.buildingId,
        caseId: currentExecution.caseId,
        executionId: currentExecution.id,
        sequence,
        previousReviewId: previousReview?.reviewId ?? null,
        reviewerId: "existing-reviewer",
        reviewerDisplayName: "Existing Reviewer",
        reviewerRole: HumanReviewDomainModel.REVIEWER_ROLES.PROFESSIONAL_REVIEWER,
        executionStatusAtReview: currentExecution.engineStatus,
        executionFingerprintAtReview: currentExecution.sourceFingerprint,
        staleAtReview: false,
        decision: HumanReviewDomainModel.DECISIONS.REJECTED,
        rationale: "Existing professional review rationale.",
        notes: "",
        limitations: [],
        followUpRequirements: [],
        rerunRecommendation: null,
        references: [],
        reviewedAt: "2026-07-21T19:00:00.000Z",
        createdAt: "2026-07-21T19:00:00.000Z",
        decisionVocabularyVersion: HumanReviewDomainModel.DECISION_VOCABULARY_VERSION,
        humanReviewResponsibility: HumanReviewDomainModel.HUMAN_REVIEW_RESPONSIBILITY,
        ...overrides.record
    }, {
        execution: currentExecution,
        persisted: true,
        staleAtReview: false,
        previousReview
    });
}

function inject(entries) {
    localStorage.setItem("mbi:humanReviews", JSON.stringify(entries));
}

function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.values(value).forEach(deepFreeze);
    return Object.freeze(value);
}

function isDeepFrozen(value) {
    return !value || typeof value !== "object"
        || (Object.isFrozen(value) && Object.values(value).every(isDeepFrozen));
}

runTest("exposes exactly the two approved public methods", () => {
    const methods = Object.getOwnPropertyNames(HumanReviewRuntimeManager)
        .filter(name => typeof HumanReviewRuntimeManager[name] === "function");
    assert.deepEqual(methods, [
        "getHumanReviewStateForInspection",
        "recordHumanReviewForCurrentExecution"
    ]);
});

runTest("validates inspection identifiers without trimming or coercion", () => {
    assert.equal(HumanReviewRuntimeManager.getHumanReviewStateForInspection("inspection-1").inspectionId, "inspection-1");
    ["", " ", " inspection-1", "inspection-1 ", "inspection/1", "inspection.1", 1, null, {}].forEach(value => {
        assert.throws(() => HumanReviewRuntimeManager.getHumanReviewStateForInspection(value), /inspectionId/);
    });
});

runTest("returns NO_CURRENT_EXECUTION without executing Expert Intelligence", () => {
    installExecutionState(null);
    let executions = 0;
    ExpertIntelligenceRuntimeManager.executeForInspection = () => { executions += 1; };
    const result = HumanReviewRuntimeManager.getHumanReviewStateForInspection("inspection-1");
    assert.equal(result.status, "NO_CURRENT_EXECUTION");
    assert.equal(result.executionId, null);
    assert.equal(executions, 0);
});

runTest("returns the current persisted execution with B2-C NOT_REVIEWED", () => {
    const result = HumanReviewRuntimeManager.getHumanReviewStateForInspection("inspection-1");
    assert.equal(result.status, "REVIEW_STATE_AVAILABLE");
    assert.equal(result.reviewResolution.status, "NOT_REVIEWED");
    assert.equal(result.executionId, "EI-inspection-1-0001");
    assert.equal(result.humanReviewRequired, true);
});

runTest("returns existing REVIEWED state through B2-C", () => {
    const first = record();
    HumanReviewPersistenceManager.appendHumanReview(first);
    const result = HumanReviewRuntimeManager.getHumanReviewStateForInspection("inspection-1");
    assert.equal(result.reviewResolution.status, "REVIEWED");
    assert.equal(result.reviewResolution.effectiveReview.reviewId, first.reviewId);
});

runTest("preserves partial corruption and lets B2-B reject append", () => {
    const first = record();
    const invalidThird = deepFreeze({
        ...first,
        reviewId: HumanReviewDomainModel.createReviewId(first.executionId, 3),
        sequence: 3,
        previousReviewId: first.reviewId
    });
    inject([{ id: first.reviewId, record: first }, { id: invalidThird.reviewId, record: invalidThird }]);
    const before = localStorage.getItem("mbi:humanReviews");
    const state = HumanReviewRuntimeManager.getHumanReviewStateForInspection("inspection-1");
    assert.equal(state.reviewResolution.status, "PARTIAL_WITH_CORRUPTION");
    assert.equal(state.reviewResolution.reviewCount, 1);
    const appended = HumanReviewRuntimeManager.recordHumanReviewForCurrentExecution("inspection-1", reviewData());
    assert.equal(appended.status, "REVIEW_APPEND_REJECTED");
    assert.equal(localStorage.getItem("mbi:humanReviews"), before);
});

runTest("preserves full corruption and prevents append", () => {
    const invalidSecond = deepFreeze({
        ...record(),
        reviewId: HumanReviewDomainModel.createReviewId("EI-inspection-1-0001", 2),
        sequence: 2,
        previousReviewId: "HR-missing-0001"
    });
    inject([{ id: invalidSecond.reviewId, record: invalidSecond }]);
    const state = HumanReviewRuntimeManager.getHumanReviewStateForInspection("inspection-1");
    assert.equal(state.status, "REVIEW_HISTORY_CORRUPT");
    const result = HumanReviewRuntimeManager.recordHumanReviewForCurrentExecution("inspection-1", reviewData());
    assert.equal(result.status, "REVIEW_HISTORY_CORRUPT");
    assert.equal(result.reviewResolution.status, "CORRUPT_HISTORY");
});

runTest("creates the first immutable review with sequence one and no predecessor", () => {
    const input = reviewData();
    const snapshot = JSON.stringify(input);
    const result = HumanReviewRuntimeManager.recordHumanReviewForCurrentExecution("inspection-1", input);
    assert.equal(result.status, "REVIEW_RECORDED");
    assert.equal(result.appendedReview.sequence, 1);
    assert.equal(result.appendedReview.previousReviewId, null);
    assert.equal(result.reviewResolution.reviewCount, 1);
    assert.equal(JSON.stringify(input), snapshot);
    assert.equal(isDeepFrozen(result), true);
});

runTest("derives the next sequence and immediate predecessor from B2-C", () => {
    const first = record();
    HumanReviewPersistenceManager.appendHumanReview(first);
    const result = HumanReviewRuntimeManager.recordHumanReviewForCurrentExecution("inspection-1", reviewData({
        reviewedAt: "2026-07-21T18:00:00.000Z",
        createdAt: "2026-07-21T18:00:00.000Z"
    }));
    assert.equal(result.appendedReview.sequence, 2);
    assert.equal(result.appendedReview.previousReviewId, first.reviewId);
    assert.equal(result.reviewResolution.effectiveReview.reviewId, result.appendedReview.reviewId);
});

runTest("preserves all four professional decisions without authority fields", () => {
    Object.values(HumanReviewDomainModel.DECISIONS).forEach(decision => {
        storage.clear();
        const extra = decision === HumanReviewDomainModel.DECISIONS.CONFIRMED_WITH_LIMITATIONS
            ? { limitations: ["Limited access."] }
            : decision === HumanReviewDomainModel.DECISIONS.RERUN_REQUIRED
                ? { followUpRequirements: ["Repeat after evidence update."] }
                : {};
        const result = HumanReviewRuntimeManager.recordHumanReviewForCurrentExecution("inspection-1", reviewData({
            decision,
            ...extra
        }));
        assert.equal(result.appendedReview.decision, decision);
        ["approval", "authorization", "permissions", "final", "rerunExecuted"].forEach(field => {
            assert.equal(Object.hasOwn(result, field), false);
            assert.equal(Object.hasOwn(result.appendedReview, field), false);
        });
    });
});

runTest("keeps reviewer identity descriptive and does not execute reruns", () => {
    let executions = 0;
    ExpertIntelligenceRuntimeManager.executeForInspection = () => { executions += 1; };
    const result = HumanReviewRuntimeManager.recordHumanReviewForCurrentExecution("inspection-1", reviewData({
        decision: HumanReviewDomainModel.DECISIONS.RERUN_REQUIRED,
        followUpRequirements: ["Repeat after additional evidence."]
    }));
    assert.equal(result.appendedReview.reviewerId, "reviewer-1");
    assert.equal(result.appendedReview.reviewerDisplayName, "Professional Reviewer");
    assert.equal(executions, 0);
    assert.equal(Object.hasOwn(result.appendedReview, "authenticated"), false);
    assert.equal(Object.hasOwn(result.appendedReview, "verified"), false);
});

runTest("rejects unsupported reviewData shapes and fields", () => {
    [null, [], "review", Object.create(null)].forEach(value => {
        assert.throws(() => HumanReviewRuntimeManager.recordHumanReviewForCurrentExecution("inspection-1", value), /reviewData/);
    });
    assert.throws(() => HumanReviewRuntimeManager.recordHumanReviewForCurrentExecution("inspection-1", {
        ...reviewData(),
        approved: true
    }), /unsupported reviewData field/);
});

runTest("returns unsupported state for non-reviewable or mismatched executions", () => {
    installExecutionState(execution({ engineStatus: "failed" }));
    assert.equal(HumanReviewRuntimeManager.getHumanReviewStateForInspection("inspection-1").status, "UNSUPPORTED_EXECUTION_STATE");
    installExecutionState(execution({ inspectionId: "inspection-2" }));
    assert.equal(HumanReviewRuntimeManager.getHumanReviewStateForInspection("inspection-1").status, "UNSUPPORTED_EXECUTION_STATE");
});

runTest("rejects a replaced current execution without redirecting review", () => {
    const first = execution();
    const replacement = execution({ id: "EI-inspection-1-0002", sequence: 2 });
    let reads = 0;
    ExpertIntelligenceRuntimeManager.getExecutionState = () => ({
        status: "succeeded",
        latest: reads++ === 0 ? first : replacement,
        stale: false,
        corruption: { detected: false, count: 0, records: [] }
    });
    ExpertIntelligenceRuntimeManager.createSummary = originalCreateSummary;
    const result = HumanReviewRuntimeManager.recordHumanReviewForCurrentExecution("inspection-1", reviewData());
    assert.equal(result.status, "EXECUTION_CHANGED");
    assert.equal(HumanReviewResolutionManager.resolveExecutionReviewState(first.id).reviewCount, 0);
    assert.equal(HumanReviewResolutionManager.resolveExecutionReviewState(replacement.id).reviewCount, 0);
});

runTest("rejects a mismatched execution concurrency token", () => {
    const result = HumanReviewRuntimeManager.recordHumanReviewForCurrentExecution("inspection-1", reviewData({
        executionId: "EI-inspection-1-0002"
    }));
    assert.equal(result.status, "EXECUTION_CHANGED");
    assert.equal(HumanReviewResolutionManager.resolveExecutionReviewState("EI-inspection-1-0001").reviewCount, 0);
});

runTest("exposes append rejection without retry or manufactured success", () => {
    let attempts = 0;
    HumanReviewPersistenceManager.appendHumanReview = () => {
        attempts += 1;
        throw new Error("competing sequence append");
    };
    const before = HumanReviewResolutionManager.resolveExecutionReviewState("EI-inspection-1-0001");
    const result = HumanReviewRuntimeManager.recordHumanReviewForCurrentExecution("inspection-1", reviewData());
    const after = HumanReviewResolutionManager.resolveExecutionReviewState("EI-inspection-1-0001");
    assert.equal(result.status, "REVIEW_APPEND_REJECTED");
    assert.match(result.errorMessage, /competing sequence/);
    assert.equal(attempts, 1);
    assert.deepEqual(after, before);
});

runTest("preserves a current stale execution through B2-A semantics", () => {
    installExecutionState(execution(), { stale: true });
    assert.throws(() => HumanReviewRuntimeManager.recordHumanReviewForCurrentExecution("inspection-1", reviewData({
        staleAtReview: true,
        rationale: ""
    })), /rationale/);
    assert.throws(() => HumanReviewRuntimeManager.recordHumanReviewForCurrentExecution("inspection-1", reviewData({
        staleAtReview: false
    })), /staleAtReview/);
    const result = HumanReviewRuntimeManager.recordHumanReviewForCurrentExecution("inspection-1", reviewData({
        staleAtReview: true,
        rationale: "The execution is stale; this review records that limitation explicitly."
    }));
    assert.equal(result.appendedReview.staleAtReview, true);
});

runTest("returns detached deeply frozen reads without mutating dependencies", () => {
    const current = execution();
    installExecutionState(current);
    const executionSnapshot = JSON.stringify(current);
    const resolution = HumanReviewResolutionManager.resolveExecutionReviewState(current.id);
    const resolutionSnapshot = JSON.stringify(resolution);
    const one = HumanReviewRuntimeManager.getHumanReviewStateForInspection("inspection-1");
    const two = HumanReviewRuntimeManager.getHumanReviewStateForInspection("inspection-1");
    assert.equal(isDeepFrozen(one), true);
    assert.notStrictEqual(one, two);
    assert.notStrictEqual(one.executionSummary, two.executionSummary);
    assert.notStrictEqual(one.reviewResolution, two.reviewResolution);
    assert.equal(JSON.stringify(current), executionSnapshot);
    assert.equal(JSON.stringify(resolution), resolutionSnapshot);
});

runTest("uses only released dependency directions and no forbidden scope", () => {
    const source = fs.readFileSync(new URL("../portal/core/HumanReviewRuntimeManager.js", import.meta.url), "utf8");
    assert.doesNotMatch(source, /import .*StorageManager|localStorage|from "\.\/ReviewResolutionManager|from "\.\/ReviewQueueManager/);
    const persistenceCalls = [...source.matchAll(/HumanReviewPersistenceManager\.([A-Za-z0-9_]+)\s*\(/g)]
        .map(match => match[1]);
    assert.deepEqual([...new Set(persistenceCalls)], ["appendHumanReview"]);
    assert.doesNotMatch(source, /\.sort\s*\(|previousReviewId\s*!==|Date\.now|Math\.random|setTimeout/);
    assert.doesNotMatch(source, /Report|Export|React|document\./);
});

console.log("Human Review Runtime Manager tests completed successfully.");
