import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import QuestionCatalogManager from "../portal/core/QuestionCatalogManager.js";
import AdaptiveInspectionPreviewBridge from "../portal/core/AdaptiveInspectionPreviewBridge.js";
import AdaptiveScopeDraftEngine from "../portal/core/AdaptiveScopeDraftEngine.js";
import AdaptiveInspectionSessionSandbox from "../portal/core/AdaptiveInspectionSessionSandbox.js";
import InspectionHumanWorkLayer from "../portal/core/InspectionHumanWorkLayer.js";

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
    sandboxId: "sandbox-human-work-layer-regression-001"
});

const workView = InspectionHumanWorkLayer.createWorkView(sandbox, {
    currentModuleIndex: 0,
    currentQuestionIndex: 0
});

assert.equal(catalogItems.length, 680);

assert.equal(preview.previewMode, "read_only");
assert.equal(draft.draftMode, "read_only");
assert.equal(sandbox.sessionMode, "sandbox_read_only");
assert.equal(workView.workMode, "human_read_only");
assert.equal(workView.sourceSessionMode, "sandbox_read_only");

assert.ok(workView.currentModule);
assert.ok(workView.currentQuestion);
assert.ok(workView.currentQuestion.questionId);
assert.ok(workView.currentQuestion.questionText);

assert.equal(workView.progress.totalQuestions, 5);
assert.equal(workView.progress.answeredQuestions, 0);
assert.equal(workView.progress.unansweredQuestions, 5);
assert.equal(workView.progress.completionRate, 0);

const answerValues = workView.answerOptions.map(option => option.value);

assert.deepEqual(answerValues, [
    "ok",
    "finding",
    "not_verifiable",
    "later"
]);

assert.ok(workView.answerOptions.every(option => option.label));
assert.ok(workView.answerOptions.every(option => option.description));
assert.ok(workView.answerOptions.every(option => option.tone));

assert.ok(workView.guidance.primary);
assert.ok(workView.guidance.evidenceHint);
assert.equal(workView.guidance.nextStep, "Choose answer");

assert.equal(workView.safetyBoundary.humanLayerOnly, true);
assert.equal(workView.safetyBoundary.inspectionCreated, false);
assert.equal(workView.safetyBoundary.answersPersisted, false);
assert.equal(workView.safetyBoundary.evidenceCreated, false);
assert.equal(workView.safetyBoundary.findingsCreated, false);
assert.equal(workView.safetyBoundary.assessmentsCreated, false);
assert.equal(workView.safetyBoundary.reportsCreated, false);

assert.ok(!("inspectionId" in workView));
assert.ok(!("inspectionIds" in workView));
assert.ok(!("answerIds" in workView));
assert.ok(!("evidenceIds" in workView));
assert.ok(!("findingIds" in workView));
assert.ok(!("assessmentIds" in workView));
assert.ok(!("reportIds" in workView));

assert.ok(!("persist" in workView));
assert.ok(!("save" in workView));
assert.ok(!("createEvidence" in workView));
assert.ok(!("createFinding" in workView));

console.log("InspectionHumanWorkLayer regression safety test passed");
console.log(`Catalog items: ${catalogItems.length}`);
console.log(`Preview mode: ${preview.previewMode}`);
console.log(`Draft mode: ${draft.draftMode}`);
console.log(`Sandbox mode: ${sandbox.sessionMode}`);
console.log(`Work mode: ${workView.workMode}`);
console.log(`Current module: ${workView.currentModule.chapterNumber} ${workView.currentModule.chapterTitle}`);
console.log(`Current question: ${workView.currentQuestion.questionId}`);
console.log(`Progress: ${workView.progress.completionRate}%`);
console.log(`Answer options: ${workView.answerOptions.map(option => option.label).join(", ")}`);
console.log("Safety boundary:");
console.log(`- humanLayerOnly: ${workView.safetyBoundary.humanLayerOnly}`);
console.log(`- inspectionCreated: ${workView.safetyBoundary.inspectionCreated}`);
console.log(`- answersPersisted: ${workView.safetyBoundary.answersPersisted}`);
console.log(`- evidenceCreated: ${workView.safetyBoundary.evidenceCreated}`);
console.log(`- findingsCreated: ${workView.safetyBoundary.findingsCreated}`);
console.log(`- assessmentsCreated: ${workView.safetyBoundary.assessmentsCreated}`);
console.log(`- reportsCreated: ${workView.safetyBoundary.reportsCreated}`);
