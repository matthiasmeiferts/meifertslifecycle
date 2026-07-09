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

const draftScope = AdaptiveScopeDraftEngine.createScopeDraft(preview);

const sandbox = AdaptiveInspectionSessionSandbox.createSandboxSession(draftScope, {
    sandboxId: "capture-draft-catalog-integration-001"
});

const initialState = SandboxAnswerStateEngine.createInitialState(sandbox);

const afterFinding = SandboxAnswerStateEngine.applyAnswer(initialState, "finding", {
    timestamp: "2026-07-08T16:10:00.000Z"
});

const evidencePreview = EvidenceRequirementPreviewEngine.createPreview(afterFinding);
const captureDraft = EvidenceCaptureDraftSandbox.createDraft(evidencePreview);

const completedDraft = EvidenceCaptureDraftSandbox.updateDraft(captureDraft, {
    photo: "sandbox-photo-placeholder.jpg",
    comment: "Sandbox comment for observed issue.",
    moisture_indicator: "Optional moisture note."
}, {
    timestamp: "2026-07-08T16:11:00.000Z"
});

assert.equal(catalogItems.length, 680);
assert.equal(preview.previewMode, "read_only");
assert.equal(draftScope.draftMode, "read_only");
assert.equal(sandbox.sessionMode, "sandbox_read_only");
assert.equal(afterFinding.stateMode, "sandbox_answer_state_read_only");
assert.equal(evidencePreview.previewMode, "evidence_requirement_preview_read_only");

assert.equal(captureDraft.draftMode, "evidence_capture_draft_sandbox_read_only");
assert.equal(captureDraft.evidenceRequired, true);
assert.equal(captureDraft.answer.value, "finding");
assert.equal(captureDraft.fields.length >= 2, true);
assert.ok(captureDraft.fields.some(field => field.type === "photo"));
assert.ok(captureDraft.fields.some(field => field.type === "comment"));
assert.equal(captureDraft.completion.readyForReview, false);

assert.equal(completedDraft.completion.readyForReview, true);
assert.equal(completedDraft.completion.completionRate, 100);
assert.equal(completedDraft.captureState.persisted, false);
assert.equal(completedDraft.captureState.evidenceCreated, false);
assert.equal(completedDraft.captureState.findingCreated, false);

[
    captureDraft,
    completedDraft
].forEach((item) => {
    assert.equal(item.safetyBoundary.sandboxOnly, true);
    assert.equal(item.safetyBoundary.captureDraftPersisted, false);
    assert.equal(item.safetyBoundary.evidencePersisted, false);
    assert.equal(item.safetyBoundary.answerPersisted, false);
    assert.equal(item.safetyBoundary.inspectionCreated, false);
    assert.equal(item.safetyBoundary.evidenceCreated, false);
    assert.equal(item.safetyBoundary.findingCreated, false);
    assert.equal(item.safetyBoundary.assessmentCreated, false);
    assert.equal(item.safetyBoundary.reportCreated, false);

    assert.ok(!("captureDraftId" in item));
    assert.ok(!("evidenceId" in item));
    assert.ok(!("findingId" in item));
});

console.log("EvidenceCaptureDraftSandbox catalog integration test passed");
console.log(`Catalog items: ${catalogItems.length}`);
console.log(`Sandbox questions: ${sandbox.questionCount}`);
console.log(`Evidence question: ${captureDraft.question.questionId}`);
console.log(`Capture draft fields: ${captureDraft.fields.map(field => field.type).join(", ")}`);
console.log(`Initial ready for review: ${captureDraft.completion.readyForReview}`);
console.log(`Completed ready for review: ${completedDraft.completion.readyForReview}`);
console.log("Safety boundary:");
console.log(`- captureDraftPersisted: ${completedDraft.safetyBoundary.captureDraftPersisted}`);
console.log(`- evidencePersisted: ${completedDraft.safetyBoundary.evidencePersisted}`);
console.log(`- evidenceCreated: ${completedDraft.safetyBoundary.evidenceCreated}`);
console.log(`- findingCreated: ${completedDraft.safetyBoundary.findingCreated}`);
