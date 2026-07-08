import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import QuestionCatalogManager from "../portal/core/QuestionCatalogManager.js";
import AdaptiveInspectionPreviewBridge from "../portal/core/AdaptiveInspectionPreviewBridge.js";
import AdaptiveScopeDraftEngine from "../portal/core/AdaptiveScopeDraftEngine.js";

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

assert.equal(catalogItems.length, 680);

assert.equal(preview.previewMode, "read_only");
assert.equal(preview.totalCatalogItems, 680);
assert.equal(preview.startQuestionCount, 5);
assert.equal(preview.previewQuestions.length, 5);

assert.equal(draft.draftMode, "read_only");
assert.equal(draft.sourcePreviewMode, "read_only");
assert.equal(draft.totalCatalogItems, 680);
assert.equal(draft.questionCount, 5);
assert.ok(draft.moduleCount >= 1);

const previewBoundary = preview.safetyBoundary;
const draftBoundary = draft.safetyBoundary;

assert.equal(previewBoundary.answersPersisted, false);
assert.equal(previewBoundary.evidenceCreated, false);
assert.equal(previewBoundary.findingsCreated, false);
assert.equal(previewBoundary.assessmentsCreated, false);
assert.equal(previewBoundary.reportsCreated, false);

assert.equal(draftBoundary.inspectionCreated, false);
assert.equal(draftBoundary.answersPersisted, false);
assert.equal(draftBoundary.evidenceCreated, false);
assert.equal(draftBoundary.findingsCreated, false);
assert.equal(draftBoundary.assessmentsCreated, false);
assert.equal(draftBoundary.reportsCreated, false);

assert.ok(!("inspectionId" in draft));
assert.ok(!("answerIds" in draft));
assert.ok(!("evidenceIds" in draft));
assert.ok(!("findingIds" in draft));
assert.ok(!("assessmentIds" in draft));
assert.ok(!("reportIds" in draft));

assert.ok(Array.isArray(draft.modules));
assert.ok(Array.isArray(draft.evidenceRequirements));
assert.ok(Array.isArray(draft.signalSummary));

assert.ok(draft.evidenceRequirements.includes("comment"));
assert.ok(draft.evidenceRequirements.includes("photo"));
assert.ok(draft.signalSummary.some(item => item.signal === "findingSignalPrepared"));
assert.ok(draft.signalSummary.some(item => item.signal === "capexSignalPrepared"));

draft.modules.forEach((module) => {
    assert.ok(module.key);
    assert.ok(module.questionCount >= 1);
    assert.ok(module.candidateFollowUpCount >= module.questionCount);
    assert.ok(module.findingFollowUpCount >= 0);
    assert.ok(module.okSkipCount >= 0);
    assert.ok(Array.isArray(module.questions));

    module.questions.forEach((question) => {
        assert.ok(question.questionId);
        assert.ok(question.questionText);
    });
});

console.log("Adaptive scope draft regression safety test passed");
console.log(`Catalog items: ${catalogItems.length}`);
console.log(`Preview mode: ${preview.previewMode}`);
console.log(`Draft mode: ${draft.draftMode}`);
console.log(`Draft questions: ${draft.questionCount}`);
console.log(`Draft modules: ${draft.moduleCount}`);
console.log("Safety boundary:");
console.log(`- inspectionCreated: ${draftBoundary.inspectionCreated}`);
console.log(`- answersPersisted: ${draftBoundary.answersPersisted}`);
console.log(`- evidenceCreated: ${draftBoundary.evidenceCreated}`);
console.log(`- findingsCreated: ${draftBoundary.findingsCreated}`);
console.log(`- assessmentsCreated: ${draftBoundary.assessmentsCreated}`);
console.log(`- reportsCreated: ${draftBoundary.reportsCreated}`);
