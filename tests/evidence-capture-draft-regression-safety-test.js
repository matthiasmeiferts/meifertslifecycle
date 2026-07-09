import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import QuestionCatalogManager from "../portal/core/QuestionCatalogManager.js";
import AdaptiveInspectionPreviewBridge from "../portal/core/AdaptiveInspectionPreviewBridge.js";
import AdaptiveScopeDraftEngine from "../portal/core/AdaptiveScopeDraftEngine.js";
import AdaptiveInspectionSessionSandbox from "../portal/core/AdaptiveInspectionSessionSandbox.js";
import SandboxAnswerStateEngine from "../portal/core/SandboxAnswerStateEngine.js";
import EvidenceRequirementPreviewEngine from "../portal/core/EvidenceRequirementPreviewEngine.js";
import EvidenceCaptureDraftSandbox from "../portal/core/EvidenceCaptureDraftSandbox.js";

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

const scopeDraft = AdaptiveScopeDraftEngine.createScopeDraft(preview);

const sandbox = AdaptiveInspectionSessionSandbox.createSandboxSession(scopeDraft, {
    sandboxId: "capture-draft-regression-safety-001"
});

const initialState = SandboxAnswerStateEngine.createInitialState(sandbox);

const afterFinding = SandboxAnswerStateEngine.applyAnswer(initialState, "finding", {
    timestamp: "2026-07-09T08:00:00.000Z"
});

const findingRequirement = EvidenceRequirementPreviewEngine.createPreview(afterFinding);
const initialCaptureDraft = EvidenceCaptureDraftSandbox.createDraft(findingRequirement);

const partialCaptureDraft = EvidenceCaptureDraftSandbox.updateDraft(initialCaptureDraft, {
    photo: "sandbox-photo-placeholder.jpg"
}, {
    timestamp: "2026-07-09T08:01:00.000Z"
});

const completedCaptureDraft = EvidenceCaptureDraftSandbox.updateDraft(partialCaptureDraft, {
    photo: "sandbox-photo-placeholder.jpg",
    comment: "Sandbox expert comment for observed issue.",
    moisture_indicator: "Optional moisture note."
}, {
    timestamp: "2026-07-09T08:02:00.000Z"
});

const afterOk = SandboxAnswerStateEngine.applyAnswer(afterFinding, "ok", {
    timestamp: "2026-07-09T08:03:00.000Z"
});

const okRequirement = EvidenceRequirementPreviewEngine.createPreview(afterOk);
const okCaptureDraft = EvidenceCaptureDraftSandbox.createDraft(okRequirement);

assert.equal(catalogItems.length, 680);

assert.equal(preview.previewMode, "read_only");
assert.equal(scopeDraft.draftMode, "read_only");
assert.equal(sandbox.sessionMode, "sandbox_read_only");
assert.equal(afterFinding.stateMode, "sandbox_answer_state_read_only");

assert.equal(findingRequirement.previewMode, "evidence_requirement_preview_read_only");
assert.equal(findingRequirement.evidenceRequired, true);

assert.equal(initialCaptureDraft.draftMode, "evidence_capture_draft_sandbox_read_only");
assert.equal(initialCaptureDraft.evidenceRequired, true);
assert.equal(initialCaptureDraft.captureState.prepared, true);
assert.equal(initialCaptureDraft.captureState.submitted, false);
assert.equal(initialCaptureDraft.captureState.persisted, false);
assert.equal(initialCaptureDraft.captureState.evidenceCreated, false);
assert.equal(initialCaptureDraft.captureState.findingCreated, false);
assert.equal(initialCaptureDraft.completion.requiredFields, 2);
assert.equal(initialCaptureDraft.completion.filledRequiredFields, 0);
assert.equal(initialCaptureDraft.completion.missingRequiredFields, 2);
assert.equal(initialCaptureDraft.completion.completionRate, 0);
assert.equal(initialCaptureDraft.completion.readyForReview, false);

assert.equal(partialCaptureDraft.completion.filledRequiredFields, 1);
assert.equal(partialCaptureDraft.completion.missingRequiredFields, 1);
assert.equal(partialCaptureDraft.completion.completionRate, 50);
assert.equal(partialCaptureDraft.completion.readyForReview, false);
assert.equal(partialCaptureDraft.captureState.persisted, false);
assert.equal(partialCaptureDraft.captureState.evidenceCreated, false);
assert.equal(partialCaptureDraft.captureState.findingCreated, false);

assert.equal(completedCaptureDraft.completion.filledRequiredFields, 2);
assert.equal(completedCaptureDraft.completion.missingRequiredFields, 0);
assert.equal(completedCaptureDraft.completion.completionRate, 100);
assert.equal(completedCaptureDraft.completion.readyForReview, true);
assert.equal(completedCaptureDraft.captureState.submitted, false);
assert.equal(completedCaptureDraft.captureState.persisted, false);
assert.equal(completedCaptureDraft.captureState.previewOnly, true);
assert.equal(completedCaptureDraft.captureState.evidenceCreated, false);
assert.equal(completedCaptureDraft.captureState.findingCreated, false);

assert.ok(completedCaptureDraft.fields.some(field => field.type === "photo" && field.filled === true));
assert.ok(completedCaptureDraft.fields.some(field => field.type === "comment" && field.filled === true));
assert.ok(completedCaptureDraft.fields.some(field => field.type === "moisture_indicator" && field.filled === true));

assert.equal(okRequirement.evidenceRequired, false);
assert.equal(okCaptureDraft.evidenceRequired, false);
assert.equal(okCaptureDraft.fields.length, 0);
assert.equal(okCaptureDraft.captureState.prepared, false);
assert.equal(okCaptureDraft.completion.completionRate, 0);
assert.equal(okCaptureDraft.completion.readyForReview, false);

[
    initialCaptureDraft,
    partialCaptureDraft,
    completedCaptureDraft,
    okCaptureDraft
].forEach((draft) => {
    assert.equal(draft.safetyBoundary.sandboxOnly, true);
    assert.equal(draft.safetyBoundary.captureDraftPersisted, false);
    assert.equal(draft.safetyBoundary.evidencePersisted, false);
    assert.equal(draft.safetyBoundary.answerPersisted, false);
    assert.equal(draft.safetyBoundary.inspectionCreated, false);
    assert.equal(draft.safetyBoundary.evidenceCreated, false);
    assert.equal(draft.safetyBoundary.findingCreated, false);
    assert.equal(draft.safetyBoundary.assessmentCreated, false);
    assert.equal(draft.safetyBoundary.reportCreated, false);

    assert.ok(!("captureDraftId" in draft));
    assert.ok(!("captureDraftIds" in draft));
    assert.ok(!("evidenceId" in draft));
    assert.ok(!("evidenceIds" in draft));
    assert.ok(!("findingId" in draft));
    assert.ok(!("findingIds" in draft));
    assert.ok(!("assessmentId" in draft));
    assert.ok(!("assessmentIds" in draft));
    assert.ok(!("reportId" in draft));
    assert.ok(!("reportIds" in draft));
});

completedCaptureDraft.fields.forEach((field) => {
    assert.equal(field.persisted, false);
    assert.equal(field.previewOnly, true);
});

console.log("EvidenceCaptureDraftSandbox regression safety test passed");
console.log(`Catalog items: ${catalogItems.length}`);
console.log(`Evidence question: ${completedCaptureDraft.question.questionId}`);
console.log(`Initial completion: ${initialCaptureDraft.completion.completionRate}%`);
console.log(`Partial completion: ${partialCaptureDraft.completion.completionRate}%`);
console.log(`Completed completion: ${completedCaptureDraft.completion.completionRate}%`);
console.log(`Ready for review: ${completedCaptureDraft.completion.readyForReview}`);
console.log(`OK capture draft prepared: ${okCaptureDraft.captureState.prepared}`);
console.log("Safety boundary:");
console.log(`- sandboxOnly: ${completedCaptureDraft.safetyBoundary.sandboxOnly}`);
console.log(`- captureDraftPersisted: ${completedCaptureDraft.safetyBoundary.captureDraftPersisted}`);
console.log(`- evidencePersisted: ${completedCaptureDraft.safetyBoundary.evidencePersisted}`);
console.log(`- answerPersisted: ${completedCaptureDraft.safetyBoundary.answerPersisted}`);
console.log(`- inspectionCreated: ${completedCaptureDraft.safetyBoundary.inspectionCreated}`);
console.log(`- evidenceCreated: ${completedCaptureDraft.safetyBoundary.evidenceCreated}`);
console.log(`- findingCreated: ${completedCaptureDraft.safetyBoundary.findingCreated}`);
console.log(`- assessmentCreated: ${completedCaptureDraft.safetyBoundary.assessmentCreated}`);
console.log(`- reportCreated: ${completedCaptureDraft.safetyBoundary.reportCreated}`);
