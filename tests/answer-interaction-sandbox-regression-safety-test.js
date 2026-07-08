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
    sandboxId: "sandbox-answer-interaction-regression-001"
});

const workView = InspectionHumanWorkLayer.createWorkView(sandbox, {
    currentModuleIndex: 0,
    currentQuestionIndex: 0
});

const interactions = ["ok", "finding", "not_verifiable", "later"].map((answerValue) => {
    return AnswerInteractionSandbox.applyAnswer(workView, answerValue, {
        interactionId: `answer-regression-${answerValue}`,
        timestamp: "2026-07-08T12:00:00.000Z"
    });
});

assert.equal(catalogItems.length, 680);

assert.equal(preview.previewMode, "read_only");
assert.equal(draft.draftMode, "read_only");
assert.equal(sandbox.sessionMode, "sandbox_read_only");
assert.equal(workView.workMode, "human_read_only");

interactions.forEach((interaction) => {
    assert.equal(interaction.interactionMode, "answer_sandbox_read_only");
    assert.equal(interaction.workMode, "human_read_only");

    assert.ok(interaction.selectedAnswer.value);
    assert.ok(interaction.selectedAnswer.label);
    assert.ok(interaction.currentQuestion.questionId);
    assert.ok(interaction.currentModule.chapterTitle);

    assert.equal(interaction.interaction.status, "preview_only");
    assert.equal(interaction.interaction.persisted, false);
    assert.equal(interaction.interaction.evidenceCreated, false);
    assert.equal(interaction.interaction.findingCreated, false);

    assert.equal(interaction.progressPreview.previewOnly, true);
    assert.equal(interaction.safetyBoundary.sandboxOnly, true);
    assert.equal(interaction.safetyBoundary.answerPersisted, false);
    assert.equal(interaction.safetyBoundary.inspectionCreated, false);
    assert.equal(interaction.safetyBoundary.evidenceCreated, false);
    assert.equal(interaction.safetyBoundary.findingCreated, false);
    assert.equal(interaction.safetyBoundary.assessmentCreated, false);
    assert.equal(interaction.safetyBoundary.reportCreated, false);

    assert.ok(!("answerId" in interaction));
    assert.ok(!("answerIds" in interaction));
    assert.ok(!("evidenceId" in interaction));
    assert.ok(!("evidenceIds" in interaction));
    assert.ok(!("findingId" in interaction));
    assert.ok(!("findingIds" in interaction));
    assert.ok(!("inspectionId" in interaction));
    assert.ok(!("inspectionIds" in interaction));
});

const okInteraction = interactions.find(item => item.selectedAnswer.value === "ok");
const findingInteraction = interactions.find(item => item.selectedAnswer.value === "finding");
const notVerifiableInteraction = interactions.find(item => item.selectedAnswer.value === "not_verifiable");
const laterInteraction = interactions.find(item => item.selectedAnswer.value === "later");

assert.equal(okInteraction.progressPreview.answeredQuestions, 1);
assert.equal(okInteraction.progressPreview.completionRate, 20);

assert.equal(findingInteraction.progressPreview.answeredQuestions, 1);
assert.equal(findingInteraction.progressPreview.completionRate, 20);
assert.ok(findingInteraction.guidance.evidenceHint.includes("No evidence has been created"));

assert.equal(notVerifiableInteraction.progressPreview.answeredQuestions, 1);
assert.equal(notVerifiableInteraction.progressPreview.completionRate, 20);

assert.equal(laterInteraction.progressPreview.answeredQuestions, 0);
assert.equal(laterInteraction.progressPreview.completionRate, 0);

const rejectedInteraction = AnswerInteractionSandbox.applyAnswer(workView, "invalid-answer");

assert.equal(rejectedInteraction.interactionMode, "answer_sandbox_rejected");
assert.equal(rejectedInteraction.reason, "Unknown answer option");
assert.equal(rejectedInteraction.safetyBoundary.answerPersisted, false);
assert.equal(rejectedInteraction.safetyBoundary.evidenceCreated, false);
assert.equal(rejectedInteraction.safetyBoundary.findingCreated, false);

console.log("AnswerInteractionSandbox regression safety test passed");
console.log(`Catalog items: ${catalogItems.length}`);
console.log(`Preview mode: ${preview.previewMode}`);
console.log(`Draft mode: ${draft.draftMode}`);
console.log(`Sandbox mode: ${sandbox.sessionMode}`);
console.log(`Work mode: ${workView.workMode}`);
console.log(`Interactions tested: ${interactions.map(item => item.selectedAnswer.value).join(", ")}`);
console.log(`Finding progress preview: ${findingInteraction.progressPreview.completionRate}%`);
console.log(`Later progress preview: ${laterInteraction.progressPreview.completionRate}%`);
console.log("Safety boundary:");
console.log(`- sandboxOnly: ${findingInteraction.safetyBoundary.sandboxOnly}`);
console.log(`- answerPersisted: ${findingInteraction.safetyBoundary.answerPersisted}`);
console.log(`- inspectionCreated: ${findingInteraction.safetyBoundary.inspectionCreated}`);
console.log(`- evidenceCreated: ${findingInteraction.safetyBoundary.evidenceCreated}`);
console.log(`- findingCreated: ${findingInteraction.safetyBoundary.findingCreated}`);
console.log(`- assessmentCreated: ${findingInteraction.safetyBoundary.assessmentCreated}`);
console.log(`- reportCreated: ${findingInteraction.safetyBoundary.reportCreated}`);
