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

assert.equal(draft.draftMode, "read_only");
assert.equal(draft.sourcePreviewMode, "read_only");
assert.equal(draft.totalCatalogItems, 680);
assert.equal(draft.questionCount, preview.previewQuestions.length);
assert.equal(draft.questionCount, 5);

assert.ok(draft.moduleCount >= 1);
assert.ok(Array.isArray(draft.modules));
assert.ok(draft.modules.length >= 1);

assert.ok(Array.isArray(draft.evidenceRequirements));
assert.ok(draft.evidenceRequirements.includes("comment"));
assert.ok(draft.evidenceRequirements.includes("photo"));

assert.ok(Array.isArray(draft.signalSummary));
assert.ok(draft.signalSummary.length >= 1);
assert.ok(draft.signalSummary.find(item => item.signal === "findingSignalPrepared"));

assert.equal(draft.safetyBoundary.inspectionCreated, false);
assert.equal(draft.safetyBoundary.answersPersisted, false);
assert.equal(draft.safetyBoundary.evidenceCreated, false);
assert.equal(draft.safetyBoundary.findingsCreated, false);
assert.equal(draft.safetyBoundary.assessmentsCreated, false);
assert.equal(draft.safetyBoundary.reportsCreated, false);

draft.modules.forEach((module) => {
    assert.ok(module.key);
    assert.ok(module.chapterTitle);
    assert.ok(module.questionCount >= 1);
    assert.ok(Array.isArray(module.questions));
    assert.ok(module.questions.length >= 1);
});

console.log("AdaptiveScopeDraftEngine catalog integration test passed");
console.log(`Catalog items: ${draft.totalCatalogItems}`);
console.log(`Draft questions: ${draft.questionCount}`);
console.log(`Draft modules: ${draft.moduleCount}`);
console.log(`Evidence requirements: ${draft.evidenceRequirements.join(", ")}`);
console.log("Modules:");

draft.modules.forEach((module, index) => {
    console.log(`${index + 1}. ${module.chapterNumber} ${module.chapterTitle} | ${module.buildingSystem}`);
    console.log(`   Questions: ${module.questionCount}`);
    console.log(`   Candidate follow-ups: ${module.candidateFollowUpCount}`);
    console.log(`   Finding follow-ups: ${module.findingFollowUpCount}`);
    console.log(`   OK skips: ${module.okSkipCount}`);
    console.log(`   Evidence: ${module.evidenceRequirements.join(", ") || "none"}`);
});

console.log("Signals:");
draft.signalSummary.forEach((item) => {
    console.log(`- ${item.signal}: ${item.count}`);
});
