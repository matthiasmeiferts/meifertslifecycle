import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import QuestionCatalogManager from "../portal/core/QuestionCatalogManager.js";
import AdaptiveInspectionPreviewBridge from "../portal/core/AdaptiveInspectionPreviewBridge.js";
import AdaptiveScopeDraftEngine from "../portal/core/AdaptiveScopeDraftEngine.js";
import AdaptiveInspectionSessionSandbox from "../portal/core/AdaptiveInspectionSessionSandbox.js";
import SandboxAnswerStateEngine from "../portal/core/SandboxAnswerStateEngine.js";
import EvidenceRequirementPreviewEngine from "../portal/core/EvidenceRequirementPreviewEngine.js";
import EvidenceCaptureDraftSandbox from "../portal/core/EvidenceCaptureDraftSandbox.js";
import FindingDraftPreviewSandbox from "../portal/core/FindingDraftPreviewSandbox.js";

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
    sandboxId: "finding-draft-regression-safety-001"
});

const initialState = SandboxAnswerStateEngine.createInitialState(sandbox);

const afterFinding = SandboxAnswerStateEngine.applyAnswer(initialState, "finding", {
    timestamp: "2026-07-09T10:00:00.000Z"
});

const evidenceRequirement = EvidenceRequirementPreviewEngine.createPreview(afterFinding);
const captureDraft = EvidenceCaptureDraftSandbox.createDraft(evidenceRequirement);

const partialCaptureDraft = EvidenceCaptureDraftSandbox.updateDraft(captureDraft, {
    photo: "sandbox-photo-placeholder.jpg"
}, {
    timestamp: "2026-07-09T10:01:00.000Z"
});

const partialFindingDraft = FindingDraftPreviewSandbox.createDraft(partialCaptureDraft);

const completedCaptureDraft = EvidenceCaptureDraftSandbox.updateDraft(partialCaptureDraft, {
    photo: "sandbox-photo-placeholder.jpg",
    comment: "Sandbox expert comment for observed issue.",
    moisture_indicator: "Optional moisture note."
}, {
    timestamp: "2026-07-09T10:02:00.000Z"
});

const completedFindingDraft = FindingDraftPreviewSandbox.createDraft(completedCaptureDraft);

const afterOk = SandboxAnswerStateEngine.applyAnswer(afterFinding, "ok", {
    timestamp: "2026-07-09T10:03:00.000Z"
});

const okRequirement = EvidenceRequirementPreviewEngine.createPreview(afterOk);
const okCaptureDraft = EvidenceCaptureDraftSandbox.createDraft(okRequirement);
const okFindingDraft = FindingDraftPreviewSandbox.createDraft(okCaptureDraft);

assert.equal(catalogItems.length, 680);

assert.equal(preview.previewMode, "read_only");
assert.equal(scopeDraft.draftMode, "read_only");
assert.equal(sandbox.sessionMode, "sandbox_read_only");
assert.equal(afterFinding.stateMode, "sandbox_answer_state_read_only");
assert.equal(evidenceRequirement.previewMode, "evidence_requirement_preview_read_only");
assert.equal(captureDraft.draftMode, "evidence_capture_draft_sandbox_read_only");

assert.equal(partialCaptureDraft.completion.readyForReview, false);
assert.equal(partialFindingDraft.draftMode, "finding_draft_preview_sandbox_read_only");
assert.equal(partialFindingDraft.canPrepareFinding, false);
assert.equal(partialFindingDraft.findingPrepared, false);
assert.equal(partialFindingDraft.finding, null);
assert.equal(partialFindingDraft.severityPreview.level, "n/a");
assert.equal(partialFindingDraft.findingState.prepared, false);
assert.equal(partialFindingDraft.findingState.findingCreated, false);

assert.equal(completedCaptureDraft.completion.readyForReview, true);
assert.equal(completedFindingDraft.draftMode, "finding_draft_preview_sandbox_read_only");
assert.equal(completedFindingDraft.sourceDraftMode, "evidence_capture_draft_sandbox_read_only");
assert.equal(completedFindingDraft.canPrepareFinding, true);
assert.equal(completedFindingDraft.findingPrepared, true);
assert.equal(completedFindingDraft.findingState.prepared, true);
assert.equal(completedFindingDraft.findingState.submitted, false);
assert.equal(completedFindingDraft.findingState.persisted, false);
assert.equal(completedFindingDraft.findingState.previewOnly, true);
assert.equal(completedFindingDraft.findingState.findingCreated, false);
assert.equal(completedFindingDraft.findingState.assessmentCreated, false);
assert.equal(completedFindingDraft.findingState.reportCreated, false);

assert.ok(completedFindingDraft.question.questionId);
assert.ok(completedFindingDraft.finding.title);
assert.ok(completedFindingDraft.finding.category);
assert.ok(completedFindingDraft.finding.sourceQuestionId);
assert.ok(completedFindingDraft.finding.expertWording);
assert.ok(completedFindingDraft.finding.evidenceReferences.length >= 2);
assert.equal(completedFindingDraft.finding.persisted, false);
assert.equal(completedFindingDraft.finding.previewOnly, true);
assert.ok(["medium", "elevated"].includes(completedFindingDraft.severityPreview.level));
assert.equal(completedFindingDraft.severityPreview.persisted, false);
assert.equal(completedFindingDraft.severityPreview.previewOnly, true);

assert.equal(okRequirement.evidenceRequired, false);
assert.equal(okCaptureDraft.evidenceRequired, false);
assert.equal(okFindingDraft.canPrepareFinding, false);
assert.equal(okFindingDraft.findingPrepared, false);
assert.equal(okFindingDraft.finding, null);
assert.equal(okFindingDraft.findingState.findingCreated, false);

[
    partialFindingDraft,
    completedFindingDraft,
    okFindingDraft
].forEach((draft) => {
    assert.equal(draft.safetyBoundary.sandboxOnly, true);
    assert.equal(draft.safetyBoundary.findingDraftPersisted, false);
    assert.equal(draft.safetyBoundary.captureDraftPersisted, false);
    assert.equal(draft.safetyBoundary.evidencePersisted, false);
    assert.equal(draft.safetyBoundary.answerPersisted, false);
    assert.equal(draft.safetyBoundary.inspectionCreated, false);
    assert.equal(draft.safetyBoundary.evidenceCreated, false);
    assert.equal(draft.safetyBoundary.findingCreated, false);
    assert.equal(draft.safetyBoundary.assessmentCreated, false);
    assert.equal(draft.safetyBoundary.reportCreated, false);

    assert.ok(!("findingId" in draft));
    assert.ok(!("findingIds" in draft));
    assert.ok(!("assessmentId" in draft));
    assert.ok(!("assessmentIds" in draft));
    assert.ok(!("recommendationId" in draft));
    assert.ok(!("recommendationIds" in draft));
    assert.ok(!("decisionId" in draft));
    assert.ok(!("decisionIds" in draft));
    assert.ok(!("reportId" in draft));
    assert.ok(!("reportIds" in draft));
});

completedFindingDraft.evidenceSummary.inputs.forEach((input) => {
    assert.equal(input.persisted, false);
    assert.equal(input.previewOnly, true);
});

console.log("FindingDraftPreviewSandbox regression safety test passed");
console.log(`Catalog items: ${catalogItems.length}`);
console.log(`Finding question: ${completedFindingDraft.question.questionId}`);
console.log(`Partial finding prepared: ${partialFindingDraft.findingPrepared}`);
console.log(`Completed finding prepared: ${completedFindingDraft.findingPrepared}`);
console.log(`Finding title: ${completedFindingDraft.finding.title}`);
console.log(`Severity preview: ${completedFindingDraft.severityPreview.level}`);
console.log(`OK finding prepared: ${okFindingDraft.findingPrepared}`);
console.log("Safety boundary:");
console.log(`- sandboxOnly: ${completedFindingDraft.safetyBoundary.sandboxOnly}`);
console.log(`- findingDraftPersisted: ${completedFindingDraft.safetyBoundary.findingDraftPersisted}`);
console.log(`- captureDraftPersisted: ${completedFindingDraft.safetyBoundary.captureDraftPersisted}`);
console.log(`- evidencePersisted: ${completedFindingDraft.safetyBoundary.evidencePersisted}`);
console.log(`- answerPersisted: ${completedFindingDraft.safetyBoundary.answerPersisted}`);
console.log(`- inspectionCreated: ${completedFindingDraft.safetyBoundary.inspectionCreated}`);
console.log(`- evidenceCreated: ${completedFindingDraft.safetyBoundary.evidenceCreated}`);
console.log(`- findingCreated: ${completedFindingDraft.safetyBoundary.findingCreated}`);
console.log(`- assessmentCreated: ${completedFindingDraft.safetyBoundary.assessmentCreated}`);
console.log(`- reportCreated: ${completedFindingDraft.safetyBoundary.reportCreated}`);
