import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import QuestionCatalogManager from "../portal/core/QuestionCatalogManager.js";
import AdaptiveInspectionPreviewBridge from "../portal/core/AdaptiveInspectionPreviewBridge.js";
import AdaptiveScopeDraftEngine from "../portal/core/AdaptiveScopeDraftEngine.js";
import AdaptiveInspectionSessionSandbox from "../portal/core/AdaptiveInspectionSessionSandbox.js";

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
    sandboxId: "sandbox-catalog-integration-001"
});

assert.equal(catalogItems.length, 680);

assert.equal(preview.previewMode, "read_only");
assert.equal(draft.draftMode, "read_only");
assert.equal(sandbox.sessionMode, "sandbox_read_only");

assert.equal(sandbox.sourceDraftMode, "read_only");
assert.equal(sandbox.sandboxId, "sandbox-catalog-integration-001");
assert.equal(sandbox.totalCatalogItems, 680);
assert.equal(sandbox.moduleCount, draft.moduleCount);
assert.equal(sandbox.questionCount, draft.questionCount);
assert.equal(sandbox.questionCount, 5);

assert.equal(sandbox.progress.totalQuestions, 5);
assert.equal(sandbox.progress.answeredQuestions, 0);
assert.equal(sandbox.progress.unansweredQuestions, 5);
assert.equal(sandbox.progress.completionRate, 0);

assert.equal(sandbox.safetyBoundary.sandboxOnly, true);
assert.equal(sandbox.safetyBoundary.inspectionCreated, false);
assert.equal(sandbox.safetyBoundary.answersPersisted, false);
assert.equal(sandbox.safetyBoundary.evidenceCreated, false);
assert.equal(sandbox.safetyBoundary.findingsCreated, false);
assert.equal(sandbox.safetyBoundary.assessmentsCreated, false);
assert.equal(sandbox.safetyBoundary.reportsCreated, false);

assert.ok(!("inspectionId" in sandbox));
assert.ok(!("answerIds" in sandbox));
assert.ok(!("evidenceIds" in sandbox));
assert.ok(!("findingIds" in sandbox));
assert.ok(!("assessmentIds" in sandbox));
assert.ok(!("reportIds" in sandbox));

assert.ok(Array.isArray(sandbox.modules));
assert.ok(sandbox.modules.length >= 1);
assert.ok(Array.isArray(sandbox.evidenceRequirements));
assert.ok(sandbox.evidenceRequirements.includes("comment"));
assert.ok(sandbox.evidenceRequirements.includes("photo"));
assert.ok(Array.isArray(sandbox.signalSummary));
assert.ok(sandbox.signalSummary.some(item => item.signal === "findingSignalPrepared"));

sandbox.modules.forEach((module) => {
    assert.ok(module.moduleIndex >= 1);
    assert.ok(module.key);
    assert.ok(module.chapterTitle);
    assert.ok(module.questionCount >= 1);
    assert.ok(Array.isArray(module.questions));
    assert.equal(module.questions.length, module.questionCount);

    module.questions.forEach((question) => {
        assert.ok(question.questionId);
        assert.ok(question.questionText);

        assert.equal(question.answerState.value, null);
        assert.equal(question.answerState.isAnswered, false);
        assert.equal(question.answerState.persisted, false);

        assert.equal(question.evidenceState.created, false);
        assert.deepEqual(question.evidenceState.evidenceIds, []);

        assert.equal(question.findingState.created, false);
        assert.deepEqual(question.findingState.findingIds, []);
    });
});

console.log("AdaptiveInspectionSessionSandbox catalog integration test passed");
console.log(`Catalog items: ${catalogItems.length}`);
console.log(`Preview mode: ${preview.previewMode}`);
console.log(`Draft mode: ${draft.draftMode}`);
console.log(`Sandbox mode: ${sandbox.sessionMode}`);
console.log(`Sandbox ID: ${sandbox.sandboxId}`);
console.log(`Sandbox modules: ${sandbox.moduleCount}`);
console.log(`Sandbox questions: ${sandbox.questionCount}`);
console.log(`Completion: ${sandbox.progress.completionRate}%`);
console.log("Modules:");

sandbox.modules.forEach((module, index) => {
    console.log(`${index + 1}. ${module.chapterNumber} ${module.chapterTitle} | ${module.buildingSystem}`);
    console.log(`   Questions: ${module.questionCount}`);
    console.log(`   Candidate follow-ups: ${module.candidateFollowUpCount}`);
    console.log(`   Finding route: ${module.findingFollowUpCount}`);
    console.log(`   OK skip route: ${module.okSkipCount}`);
});
