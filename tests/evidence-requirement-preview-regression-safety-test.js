import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import QuestionCatalogManager from "../portal/core/QuestionCatalogManager.js";
import AdaptiveInspectionPreviewBridge from "../portal/core/AdaptiveInspectionPreviewBridge.js";
import AdaptiveScopeDraftEngine from "../portal/core/AdaptiveScopeDraftEngine.js";
import AdaptiveInspectionSessionSandbox from "../portal/core/AdaptiveInspectionSessionSandbox.js";
import SandboxAnswerStateEngine from "../portal/core/SandboxAnswerStateEngine.js";
import EvidenceRequirementPreviewEngine from "../portal/core/EvidenceRequirementPreviewEngine.js";

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
    sandboxId: "evidence-requirement-regression-safety-001"
});

const initialState = SandboxAnswerStateEngine.createInitialState(sandbox);

const afterFinding = SandboxAnswerStateEngine.applyAnswer(initialState, "finding", {
    timestamp: "2026-07-08T15:00:00.000Z"
});

const findingPreview = EvidenceRequirementPreviewEngine.createPreview(afterFinding);

const afterOk = SandboxAnswerStateEngine.applyAnswer(afterFinding, "ok", {
    timestamp: "2026-07-08T15:01:00.000Z"
});

const okPreview = EvidenceRequirementPreviewEngine.createPreview(afterOk);

const afterNotVerifiable = SandboxAnswerStateEngine.applyAnswer(afterOk, "not_verifiable", {
    timestamp: "2026-07-08T15:02:00.000Z"
});

const notVerifiablePreview = EvidenceRequirementPreviewEngine.createPreview(afterNotVerifiable);

const afterLater = SandboxAnswerStateEngine.applyAnswer(afterNotVerifiable, "later", {
    timestamp: "2026-07-08T15:03:00.000Z"
});

const laterPreview = EvidenceRequirementPreviewEngine.createPreview(afterLater);

assert.equal(catalogItems.length, 680);

assert.equal(preview.previewMode, "read_only");
assert.equal(draft.draftMode, "read_only");
assert.equal(sandbox.sessionMode, "sandbox_read_only");

assert.equal(afterFinding.stateMode, "sandbox_answer_state_read_only");
assert.equal(afterFinding.progress.completionRate, 20);

assert.equal(findingPreview.previewMode, "evidence_requirement_preview_read_only");
assert.equal(findingPreview.sourceStateMode, "sandbox_answer_state_read_only");
assert.equal(findingPreview.answerValue, "finding");
assert.equal(findingPreview.answerLabel, "Auffällig");
assert.equal(findingPreview.evidenceRequired, true);
assert.equal(findingPreview.nextStep, "Prepare evidence capture");
assert.equal(findingPreview.captureState.prepared, true);
assert.equal(findingPreview.captureState.persisted, false);
assert.equal(findingPreview.captureState.previewOnly, true);
assert.equal(findingPreview.captureState.evidenceCreated, false);
assert.equal(findingPreview.captureState.findingCreated, false);
assert.ok(findingPreview.question.questionId);
assert.ok(findingPreview.question.questionText);
assert.ok(findingPreview.requiredInputs.length >= 2);
assert.ok(findingPreview.requiredInputs.some(input => input.type === "photo"));
assert.ok(findingPreview.requiredInputs.some(input => input.type === "comment"));

assert.equal(okPreview.answerValue, "ok");
assert.equal(okPreview.evidenceRequired, false);
assert.equal(okPreview.requiredInputs.length, 0);
assert.equal(okPreview.nextStep, "Continue to next question");
assert.equal(okPreview.captureState.prepared, false);
assert.equal(okPreview.captureState.evidenceCreated, false);
assert.equal(okPreview.captureState.findingCreated, false);

assert.equal(notVerifiablePreview.answerValue, "not_verifiable");
assert.equal(notVerifiablePreview.evidenceRequired, false);
assert.equal(notVerifiablePreview.requiredInputs.length, 0);
assert.equal(notVerifiablePreview.captureState.prepared, false);

assert.equal(laterPreview.answerValue, "later");
assert.equal(laterPreview.evidenceRequired, false);
assert.equal(laterPreview.requiredInputs.length, 0);
assert.equal(laterPreview.guidance.primary, "Question remains open for later review.");

[
    findingPreview,
    okPreview,
    notVerifiablePreview,
    laterPreview
].forEach((item) => {
    assert.equal(item.safetyBoundary.sandboxOnly, true);
    assert.equal(item.safetyBoundary.evidencePersisted, false);
    assert.equal(item.safetyBoundary.answerPersisted, false);
    assert.equal(item.safetyBoundary.inspectionCreated, false);
    assert.equal(item.safetyBoundary.evidenceCreated, false);
    assert.equal(item.safetyBoundary.findingCreated, false);
    assert.equal(item.safetyBoundary.assessmentCreated, false);
    assert.equal(item.safetyBoundary.reportCreated, false);

    assert.ok(!("evidenceId" in item));
    assert.ok(!("evidenceIds" in item));
    assert.ok(!("findingId" in item));
    assert.ok(!("findingIds" in item));
    assert.ok(!("assessmentId" in item));
    assert.ok(!("assessmentIds" in item));
    assert.ok(!("reportId" in item));
    assert.ok(!("reportIds" in item));
});

console.log("EvidenceRequirementPreviewEngine regression safety test passed");
console.log(`Catalog items: ${catalogItems.length}`);
console.log(`Finding preview question: ${findingPreview.question.questionId}`);
console.log(`Finding evidence required: ${findingPreview.evidenceRequired}`);
console.log(`Required inputs: ${findingPreview.requiredInputs.map(input => input.type).join(", ")}`);
console.log(`OK evidence required: ${okPreview.evidenceRequired}`);
console.log(`Not verifiable evidence required: ${notVerifiablePreview.evidenceRequired}`);
console.log(`Later evidence required: ${laterPreview.evidenceRequired}`);
console.log("Safety boundary:");
console.log(`- sandboxOnly: ${findingPreview.safetyBoundary.sandboxOnly}`);
console.log(`- evidencePersisted: ${findingPreview.safetyBoundary.evidencePersisted}`);
console.log(`- answerPersisted: ${findingPreview.safetyBoundary.answerPersisted}`);
console.log(`- inspectionCreated: ${findingPreview.safetyBoundary.inspectionCreated}`);
console.log(`- evidenceCreated: ${findingPreview.safetyBoundary.evidenceCreated}`);
console.log(`- findingCreated: ${findingPreview.safetyBoundary.findingCreated}`);
console.log(`- assessmentCreated: ${findingPreview.safetyBoundary.assessmentCreated}`);
console.log(`- reportCreated: ${findingPreview.safetyBoundary.reportCreated}`);
