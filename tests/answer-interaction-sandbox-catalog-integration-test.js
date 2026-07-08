import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import QuestionCatalogManager from "../portal/core/QuestionCatalogManager.js";
import AdaptiveInspectionPreviewBridge from "../portal/core/AdaptiveInspectionPreviewBridge.js";
import AdaptiveScopeDraftEngine from "../portal/core/AdaptiveScopeDraftEngine.js";
import AdaptiveInspectionSessionSandbox from "../portal/core/AdaptiveInspectionSessionSandbox.js";
import InspectionHumanWorkLayer from "../portal/core/InspectionHumanWorkLayer.js";
import AnswerInteractionSandbox from "../portal/core/AnswerInteractionSandbox.js";

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
    sandboxId: "sandbox-answer-interaction-integration-001"
});

const workView = InspectionHumanWorkLayer.createWorkView(sandbox, {
    currentModuleIndex: 0,
    currentQuestionIndex: 0
});

const findingInteraction = AnswerInteractionSandbox.applyAnswer(workView, "finding", {
    interactionId: "answer-sandbox-catalog-001",
    timestamp: "2026-07-08T12:00:00.000Z"
});

const okInteraction = AnswerInteractionSandbox.applyAnswer(workView, "ok");
const notVerifiableInteraction = AnswerInteractionSandbox.applyAnswer(workView, "not_verifiable");
const laterInteraction = AnswerInteractionSandbox.applyAnswer(workView, "later");

assert.equal(catalogItems.length, 680);

assert.equal(preview.previewMode, "read_only");
assert.equal(draft.draftMode, "read_only");
assert.equal(sandbox.sessionMode, "sandbox_read_only");
assert.equal(workView.workMode, "human_read_only");

assert.equal(findingInteraction.interactionMode, "answer_sandbox_read_only");
assert.equal(findingInteraction.workMode, "human_read_only");
assert.equal(findingInteraction.selectedAnswer.value, "finding");
assert.equal(findingInteraction.selectedAnswer.label, "Auffällig");

assert.equal(findingInteraction.currentQuestion.questionId, workView.currentQuestion.questionId);
assert.equal(findingInteraction.currentModule.chapterTitle, workView.currentModule.chapterTitle);

assert.equal(findingInteraction.interaction.interactionId, "answer-sandbox-catalog-001");
assert.equal(findingInteraction.interaction.status, "preview_only");
assert.equal(findingInteraction.interaction.persisted, false);
assert.equal(findingInteraction.interaction.evidenceCreated, false);
assert.equal(findingInteraction.interaction.findingCreated, false);

assert.equal(findingInteraction.progressPreview.totalQuestions, 5);
assert.equal(findingInteraction.progressPreview.answeredQuestions, 1);
assert.equal(findingInteraction.progressPreview.unansweredQuestions, 4);
assert.equal(findingInteraction.progressPreview.completionRate, 20);
assert.equal(findingInteraction.progressPreview.previewOnly, true);

assert.equal(okInteraction.selectedAnswer.value, "ok");
assert.equal(okInteraction.progressPreview.completionRate, 20);

assert.equal(notVerifiableInteraction.selectedAnswer.value, "not_verifiable");
assert.equal(notVerifiableInteraction.progressPreview.completionRate, 20);

assert.equal(laterInteraction.selectedAnswer.value, "later");
assert.equal(laterInteraction.progressPreview.answeredQuestions, 0);
assert.equal(laterInteraction.progressPreview.completionRate, 0);

assert.equal(findingInteraction.safetyBoundary.sandboxOnly, true);
assert.equal(findingInteraction.safetyBoundary.answerPersisted, false);
assert.equal(findingInteraction.safetyBoundary.inspectionCreated, false);
assert.equal(findingInteraction.safetyBoundary.evidenceCreated, false);
assert.equal(findingInteraction.safetyBoundary.findingCreated, false);
assert.equal(findingInteraction.safetyBoundary.assessmentCreated, false);
assert.equal(findingInteraction.safetyBoundary.reportCreated, false);

assert.ok(!("answerId" in findingInteraction));
assert.ok(!("answerIds" in findingInteraction));
assert.ok(!("evidenceId" in findingInteraction));
assert.ok(!("evidenceIds" in findingInteraction));
assert.ok(!("findingId" in findingInteraction));
assert.ok(!("findingIds" in findingInteraction));
assert.ok(!("inspectionId" in findingInteraction));
assert.ok(!("inspectionIds" in findingInteraction));

console.log("AnswerInteractionSandbox catalog integration test passed");
console.log(`Catalog items: ${catalogItems.length}`);
console.log(`Preview mode: ${preview.previewMode}`);
console.log(`Draft mode: ${draft.draftMode}`);
console.log(`Sandbox mode: ${sandbox.sessionMode}`);
console.log(`Work mode: ${workView.workMode}`);
console.log(`Interaction mode: ${findingInteraction.interactionMode}`);
console.log(`Current module: ${workView.currentModule.chapterNumber} ${workView.currentModule.chapterTitle}`);
console.log(`Current question: ${workView.currentQuestion.questionId}`);
console.log(`Selected answer: ${findingInteraction.selectedAnswer.label}`);
console.log(`Progress preview: ${findingInteraction.progressPreview.completionRate}%`);
console.log(`Later progress preview: ${laterInteraction.progressPreview.completionRate}%`);
console.log("Safety boundary:");
console.log(`- sandboxOnly: ${findingInteraction.safetyBoundary.sandboxOnly}`);
console.log(`- answerPersisted: ${findingInteraction.safetyBoundary.answerPersisted}`);
console.log(`- inspectionCreated: ${findingInteraction.safetyBoundary.inspectionCreated}`);
console.log(`- evidenceCreated: ${findingInteraction.safetyBoundary.evidenceCreated}`);
console.log(`- findingCreated: ${findingInteraction.safetyBoundary.findingCreated}`);
console.log(`- assessmentCreated: ${findingInteraction.safetyBoundary.assessmentCreated}`);
console.log(`- reportCreated: ${findingInteraction.safetyBoundary.reportCreated}`);
