import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import QuestionCatalogManager from "../portal/core/QuestionCatalogManager.js";
import AdaptiveInspectionPreviewBridge from "../portal/core/AdaptiveInspectionPreviewBridge.js";

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

assert.equal(preview.previewMode, "read_only");
assert.equal(preview.totalCatalogItems, 680);
assert.equal(preview.startQuestionCount, 5);

assert.equal(preview.safetyBoundary.answersPersisted, false);
assert.equal(preview.safetyBoundary.evidenceCreated, false);
assert.equal(preview.safetyBoundary.findingsCreated, false);
assert.equal(preview.safetyBoundary.assessmentsCreated, false);
assert.equal(preview.safetyBoundary.reportsCreated, false);

assert.ok(Array.isArray(preview.previewQuestions));
assert.equal(preview.previewQuestions.length, 5);

preview.previewQuestions.forEach((previewQuestion) => {
    assert.ok(previewQuestion.question.questionId);
    assert.ok(previewQuestion.question.questionText);
    assert.ok(previewQuestion.candidateFollowUpCount >= 0);

    assert.ok(Array.isArray(previewQuestion.negativeSimulation.followUpQuestionIds));
    assert.ok(previewQuestion.negativeSimulation.followUpQuestionIds.length <= 5);
    assert.ok(Array.isArray(previewQuestion.negativeSimulation.evidenceRequirements));
    assert.ok(previewQuestion.negativeSimulation.evidenceRequirements.includes("comment"));
    assert.ok(Array.isArray(previewQuestion.negativeSimulation.signals));
    assert.ok(previewQuestion.negativeSimulation.signals.includes("findingSignalPrepared"));

    assert.ok(Array.isArray(previewQuestion.positiveSimulation.skippedQuestionIds));
    assert.ok(previewQuestion.positiveSimulation.skippedQuestionIds.length <= 5);
    assert.ok(Array.isArray(previewQuestion.positiveSimulation.signals));
    assert.ok(previewQuestion.positiveSimulation.signals.includes("irrelevantDefectDetailsSkipped"));
});

console.log("AdaptiveInspectionPreviewBridge catalog integration test passed");
console.log(`Catalog items: ${preview.totalCatalogItems}`);
console.log(`Preview questions: ${preview.startQuestionCount}`);
console.log("Preview summary:");

preview.previewQuestions.forEach((previewQuestion, index) => {
    console.log(`${index + 1}. ${previewQuestion.question.questionId} | ${previewQuestion.question.questionText}`);
    console.log(`   Candidate follow-ups: ${previewQuestion.candidateFollowUpCount}`);
    console.log(`   Finding follow-ups: ${previewQuestion.negativeSimulation.followUpQuestionIds.length}`);
    console.log(`   OK skips: ${previewQuestion.positiveSimulation.skippedQuestionIds.length}`);
});
