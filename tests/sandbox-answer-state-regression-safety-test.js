import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import QuestionCatalogManager from "../portal/core/QuestionCatalogManager.js";
import AdaptiveInspectionPreviewBridge from "../portal/core/AdaptiveInspectionPreviewBridge.js";
import AdaptiveScopeDraftEngine from "../portal/core/AdaptiveScopeDraftEngine.js";
import AdaptiveInspectionSessionSandbox from "../portal/core/AdaptiveInspectionSessionSandbox.js";
import SandboxAnswerStateEngine from "../portal/core/SandboxAnswerStateEngine.js";

const catalogPath = "portal/data/question-catalog/meiferts-question-catalog-import-ready.v2.7.json";
const rawCatalog = JSON.parse(readFileSync(catalogPath, "utf8"));

QuestionCatalogManager.loadFromData(rawCatalog);

const catalogItems = QuestionCatalogManager.getAll();

const profile = {
    country: "Thailand",
    buildingType: "Condominium",
    useType: "Residential",
    ageBand: "Existing",
    climateZone: "Tropical",
    locationContext: "Coastal",
    legalContext: "Ownership",
    inspectionPurpose: "Acquisition"
};

const preview = AdaptiveInspectionPreviewBridge.createPreview(profile, catalogItems, {
    startLimit: 5,
    followUpLimit: 5
});

const draft = AdaptiveScopeDraftEngine.createScopeDraft(preview);

const sandbox = AdaptiveInspectionSessionSandbox.createSandboxSession(draft, {
    sandboxId: "sandbox-answer-state-regression-safety-001"
});

const initialState = SandboxAnswerStateEngine.createInitialState(sandbox);

const afterFinding = SandboxAnswerStateEngine.applyAnswer(initialState, "finding", {
    timestamp: "2026-07-08T13:00:00.000Z"
});

const afterOk = SandboxAnswerStateEngine.applyAnswer(afterFinding, "ok", {
    timestamp: "2026-07-08T13:01:00.000Z"
});

const afterNotVerifiable = SandboxAnswerStateEngine.applyAnswer(afterOk, "not_verifiable", {
    timestamp: "2026-07-08T13:02:00.000Z"
});

const afterLater = SandboxAnswerStateEngine.applyAnswer(afterNotVerifiable, "later", {
    timestamp: "2026-07-08T13:03:00.000Z"
});

const rejected = SandboxAnswerStateEngine.applyAnswer(afterLater, "invalid-answer");

assert.equal(catalogItems.length, 680);

assert.equal(preview.previewMode, "read_only");
assert.equal(draft.draftMode, "read_only");
assert.equal(sandbox.sessionMode, "sandbox_read_only");

assert.equal(initialState.stateMode, "sandbox_answer_state_read_only");
assert.equal(initialState.totalQuestions, 5);
assert.equal(initialState.progress.completionRate, 0);
assert.equal(initialState.answeredQuestionIds.length, 0);
assert.equal(Object.keys(initialState.answers).length, 0);

assert.equal(afterFinding.stateMode, "sandbox_answer_state_read_only");
assert.equal(afterFinding.lastInteraction.selectedAnswer.value, "finding");
assert.equal(afterFinding.progress.answeredQuestions, 1);
assert.equal(afterFinding.progress.unansweredQuestions, 4);
assert.equal(afterFinding.progress.completionRate, 20);
assert.equal(afterFinding.answeredQuestionIds.length, 1);
assert.equal(Object.keys(afterFinding.answers).length, 1);

assert.equal(afterOk.lastInteraction.selectedAnswer.value, "ok");
assert.equal(afterOk.progress.answeredQuestions, 2);
assert.equal(afterOk.progress.unansweredQuestions, 3);
assert.equal(afterOk.progress.completionRate, 40);
assert.equal(afterOk.answeredQuestionIds.length, 2);
assert.equal(Object.keys(afterOk.answers).length, 2);

assert.equal(afterNotVerifiable.lastInteraction.selectedAnswer.value, "not_verifiable");
assert.equal(afterNotVerifiable.progress.answeredQuestions, 3);
assert.equal(afterNotVerifiable.progress.unansweredQuestions, 2);
assert.equal(afterNotVerifiable.progress.completionRate, 60);
assert.equal(afterNotVerifiable.answeredQuestionIds.length, 3);
assert.equal(Object.keys(afterNotVerifiable.answers).length, 3);

assert.equal(afterLater.lastInteraction.selectedAnswer.value, "later");
assert.equal(afterLater.progress.answeredQuestions, 3);
assert.equal(afterLater.progress.unansweredQuestions, 2);
assert.equal(afterLater.progress.completionRate, 60);
assert.equal(afterLater.skippedQuestionIds.length, 1);
assert.equal(Object.keys(afterLater.answers).length, 3);

assert.equal(rejected.stateMode, "sandbox_answer_state_rejected");
assert.equal(rejected.reason, "Unknown answer option");

[
    initialState,
    afterFinding,
    afterOk,
    afterNotVerifiable,
    afterLater,
    rejected
].forEach((state) => {
    assert.equal(state.safetyBoundary.sandboxOnly, true);
    assert.equal(state.safetyBoundary.answerPersisted, false);
    assert.equal(state.safetyBoundary.inspectionCreated, false);
    assert.equal(state.safetyBoundary.evidenceCreated, false);
    assert.equal(state.safetyBoundary.findingCreated, false);
    assert.equal(state.safetyBoundary.assessmentCreated, false);
    assert.equal(state.safetyBoundary.reportCreated, false);

    assert.ok(!("answerId" in state));
    assert.ok(!("answerIds" in state));
    assert.ok(!("inspectionId" in state));
    assert.ok(!("inspectionIds" in state));
    assert.ok(!("evidenceId" in state));
    assert.ok(!("evidenceIds" in state));
    assert.ok(!("findingId" in state));
    assert.ok(!("findingIds" in state));
    assert.ok(!("assessmentId" in state));
    assert.ok(!("assessmentIds" in state));
    assert.ok(!("reportId" in state));
    assert.ok(!("reportIds" in state));
});

Object.values(afterLater.answers).forEach((answer) => {
    assert.equal(answer.persisted, false);
    assert.equal(answer.previewOnly, true);
    assert.ok(answer.questionId);
    assert.ok(answer.answerValue);
    assert.ok(answer.answerLabel);
});

assert.notEqual(afterFinding.currentQuestion.questionId, initialState.currentQuestion.questionId);
assert.notEqual(afterOk.currentQuestion.questionId, afterFinding.currentQuestion.questionId);
assert.notEqual(afterNotVerifiable.currentQuestion.questionId, afterOk.currentQuestion.questionId);

console.log("SandboxAnswerStateEngine regression safety test passed");
console.log(`Catalog items: ${catalogItems.length}`);
console.log(`Sandbox questions: ${initialState.totalQuestions}`);
console.log(`Initial progress: ${initialState.progress.completionRate}%`);
console.log(`After finding: ${afterFinding.progress.completionRate}%`);
console.log(`After OK: ${afterOk.progress.completionRate}%`);
console.log(`After not verifiable: ${afterNotVerifiable.progress.completionRate}%`);
console.log(`After later: ${afterLater.progress.completionRate}%`);
console.log(`Rejected mode: ${rejected.stateMode}`);
console.log("Safety boundary:");
console.log(`- sandboxOnly: ${afterLater.safetyBoundary.sandboxOnly}`);
console.log(`- answerPersisted: ${afterLater.safetyBoundary.answerPersisted}`);
console.log(`- inspectionCreated: ${afterLater.safetyBoundary.inspectionCreated}`);
console.log(`- evidenceCreated: ${afterLater.safetyBoundary.evidenceCreated}`);
console.log(`- findingCreated: ${afterLater.safetyBoundary.findingCreated}`);
console.log(`- assessmentCreated: ${afterLater.safetyBoundary.assessmentCreated}`);
console.log(`- reportCreated: ${afterLater.safetyBoundary.reportCreated}`);
