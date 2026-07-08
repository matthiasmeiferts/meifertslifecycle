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
    sandboxId: "sandbox-answer-state-catalog-integration-001"
});

const initialState = SandboxAnswerStateEngine.createInitialState(sandbox);

assert.equal(catalogItems.length, 680);

assert.equal(preview.previewMode, "read_only");
assert.equal(draft.draftMode, "read_only");
assert.equal(sandbox.sessionMode, "sandbox_read_only");

assert.equal(initialState.stateMode, "sandbox_answer_state_read_only");
assert.equal(initialState.sourceSessionMode, "sandbox_read_only");
assert.equal(initialState.sandboxId, "sandbox-answer-state-catalog-integration-001");
assert.equal(initialState.totalQuestions, sandbox.questionCount);
assert.equal(initialState.progress.totalQuestions, sandbox.questionCount);
assert.equal(initialState.progress.answeredQuestions, 0);
assert.equal(initialState.progress.completionRate, 0);
assert.ok(initialState.currentQuestion.questionId);
assert.ok(initialState.currentQuestion.questionText);
assert.ok(initialState.currentQuestion.moduleTitle);
assert.equal(initialState.safetyBoundary.sandboxOnly, true);
assert.equal(initialState.safetyBoundary.answerPersisted, false);
assert.equal(initialState.safetyBoundary.evidenceCreated, false);
assert.equal(initialState.safetyBoundary.findingCreated, false);

const afterFirstAnswer = SandboxAnswerStateEngine.applyAnswer(initialState, "finding", {
    timestamp: "2026-07-08T12:10:00.000Z"
});

assert.equal(afterFirstAnswer.stateMode, "sandbox_answer_state_read_only");
assert.equal(afterFirstAnswer.lastInteraction.interactionMode, "sandbox_answer_state_preview");
assert.equal(afterFirstAnswer.lastInteraction.selectedAnswer.value, "finding");
assert.equal(afterFirstAnswer.lastInteraction.answerPersisted, false);
assert.equal(afterFirstAnswer.lastInteraction.evidenceCreated, false);
assert.equal(afterFirstAnswer.lastInteraction.findingCreated, false);
assert.equal(afterFirstAnswer.progress.answeredQuestions, 1);
assert.equal(afterFirstAnswer.progress.completionRate, 20);
assert.equal(afterFirstAnswer.answeredQuestionIds.length, 1);
assert.ok(afterFirstAnswer.currentQuestion.questionId);
assert.notEqual(afterFirstAnswer.currentQuestion.questionId, initialState.currentQuestion.questionId);

const afterSecondAnswer = SandboxAnswerStateEngine.applyAnswer(afterFirstAnswer, "ok", {
    timestamp: "2026-07-08T12:11:00.000Z"
});

assert.equal(afterSecondAnswer.lastInteraction.selectedAnswer.value, "ok");
assert.equal(afterSecondAnswer.progress.answeredQuestions, 2);
assert.equal(afterSecondAnswer.progress.completionRate, 40);
assert.equal(afterSecondAnswer.answeredQuestionIds.length, 2);
assert.equal(afterSecondAnswer.safetyBoundary.answerPersisted, false);

const afterThirdAnswer = SandboxAnswerStateEngine.applyAnswer(afterSecondAnswer, "not_verifiable", {
    timestamp: "2026-07-08T12:12:00.000Z"
});

assert.equal(afterThirdAnswer.lastInteraction.selectedAnswer.value, "not_verifiable");
assert.equal(afterThirdAnswer.progress.answeredQuestions, 3);
assert.equal(afterThirdAnswer.progress.completionRate, 60);
assert.equal(afterThirdAnswer.answeredQuestionIds.length, 3);

const afterLater = SandboxAnswerStateEngine.applyAnswer(afterThirdAnswer, "later", {
    timestamp: "2026-07-08T12:13:00.000Z"
});

assert.equal(afterLater.lastInteraction.selectedAnswer.value, "later");
assert.equal(afterLater.progress.answeredQuestions, 3);
assert.equal(afterLater.progress.completionRate, 60);
assert.equal(afterLater.skippedQuestionIds.length, 1);
assert.equal(afterLater.safetyBoundary.answerPersisted, false);
assert.equal(afterLater.safetyBoundary.inspectionCreated, false);
assert.equal(afterLater.safetyBoundary.evidenceCreated, false);
assert.equal(afterLater.safetyBoundary.findingCreated, false);
assert.equal(afterLater.safetyBoundary.assessmentCreated, false);
assert.equal(afterLater.safetyBoundary.reportCreated, false);

assert.ok(!("answerId" in afterLater));
assert.ok(!("answerIds" in afterLater));
assert.ok(!("inspectionId" in afterLater));
assert.ok(!("inspectionIds" in afterLater));
assert.ok(!("evidenceId" in afterLater));
assert.ok(!("evidenceIds" in afterLater));
assert.ok(!("findingId" in afterLater));
assert.ok(!("findingIds" in afterLater));

console.log("SandboxAnswerStateEngine catalog integration test passed");
console.log(`Catalog items: ${catalogItems.length}`);
console.log(`Preview mode: ${preview.previewMode}`);
console.log(`Draft mode: ${draft.draftMode}`);
console.log(`Sandbox mode: ${sandbox.sessionMode}`);
console.log(`Sandbox question count: ${sandbox.questionCount}`);
console.log(`Initial current question: ${initialState.currentQuestion.questionId}`);
console.log(`After first answer current question: ${afterFirstAnswer.currentQuestion.questionId}`);
console.log(`Progress after finding: ${afterFirstAnswer.progress.completionRate}%`);
console.log(`Progress after OK: ${afterSecondAnswer.progress.completionRate}%`);
console.log(`Progress after not verifiable: ${afterThirdAnswer.progress.completionRate}%`);
console.log(`Progress after later: ${afterLater.progress.completionRate}%`);
console.log("Safety boundary:");
console.log(`- sandboxOnly: ${afterLater.safetyBoundary.sandboxOnly}`);
console.log(`- answerPersisted: ${afterLater.safetyBoundary.answerPersisted}`);
console.log(`- inspectionCreated: ${afterLater.safetyBoundary.inspectionCreated}`);
console.log(`- evidenceCreated: ${afterLater.safetyBoundary.evidenceCreated}`);
console.log(`- findingCreated: ${afterLater.safetyBoundary.findingCreated}`);
console.log(`- assessmentCreated: ${afterLater.safetyBoundary.assessmentCreated}`);
console.log(`- reportCreated: ${afterLater.safetyBoundary.reportCreated}`);
