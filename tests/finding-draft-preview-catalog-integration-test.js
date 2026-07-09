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
    sandboxId: "finding-draft-catalog-integration-001"
});

const initialState = SandboxAnswerStateEngine.createInitialState(sandbox);

const afterFinding = SandboxAnswerStateEngine.applyAnswer(initialState, "finding", {
    timestamp: "2026-07-09T09:00:00.000Z"
});

const evidenceRequirement = EvidenceRequirementPreviewEngine.createPreview(afterFinding);
const captureDraft = EvidenceCaptureDraftSandbox.createDraft(evidenceRequirement);

const completedCaptureDraft = EvidenceCaptureDraftSandbox.updateDraft(captureDraft, {
    photo: "sandbox-photo-placeholder.jpg",
    comment: "Sandbox comment for observed issue.",
    moisture_indicator: "Optional moisture note."
}, {
    timestamp: "2026-07-09T09:01:00.000Z"
});

const findingDraft = FindingDraftPreviewSandbox.createDraft(completedCaptureDraft);

assert.equal(catalogItems.length, 680);
assert.equal(preview.previewMode, "read_only");
assert.equal(scopeDraft.draftMode, "read_only");
assert.equal(sandbox.sessionMode, "sandbox_read_only");
assert.equal(afterFinding.stateMode, "sandbox_answer_state_read_only");
assert.equal(evidenceRequirement.previewMode, "evidence_requirement_preview_read_only");
assert.equal(completedCaptureDraft.draftMode, "evidence_capture_draft_sandbox_read_only");
assert.equal(completedCaptureDraft.completion.readyForReview, true);

assert.equal(findingDraft.draftMode, "finding_draft_preview_sandbox_read_only");
assert.equal(findingDraft.sourceDraftMode, "evidence_capture_draft_sandbox_read_only");
assert.equal(findingDraft.canPrepareFinding, true);
assert.equal(findingDraft.findingPrepared, true);
assert.ok(findingDraft.question.questionId);
assert.ok(findingDraft.finding.title);
assert.ok(findingDraft.finding.expertWording);
assert.ok(findingDraft.finding.evidenceReferences.length >= 2);
assert.equal(findingDraft.finding.persisted, false);
assert.equal(findingDraft.finding.previewOnly, true);
assert.ok(["medium", "elevated"].includes(findingDraft.severityPreview.level));
assert.equal(findingDraft.severityPreview.persisted, false);
assert.equal(findingDraft.findingState.findingCreated, false);

assert.equal(findingDraft.safetyBoundary.sandboxOnly, true);
assert.equal(findingDraft.safetyBoundary.findingDraftPersisted, false);
assert.equal(findingDraft.safetyBoundary.captureDraftPersisted, false);
assert.equal(findingDraft.safetyBoundary.evidencePersisted, false);
assert.equal(findingDraft.safetyBoundary.answerPersisted, false);
assert.equal(findingDraft.safetyBoundary.inspectionCreated, false);
assert.equal(findingDraft.safetyBoundary.evidenceCreated, false);
assert.equal(findingDraft.safetyBoundary.findingCreated, false);
assert.equal(findingDraft.safetyBoundary.assessmentCreated, false);
assert.equal(findingDraft.safetyBoundary.reportCreated, false);

assert.ok(!("findingId" in findingDraft));
assert.ok(!("findingIds" in findingDraft));
assert.ok(!("assessmentId" in findingDraft));
assert.ok(!("reportId" in findingDraft));

console.log("FindingDraftPreviewSandbox catalog integration test passed");
console.log(`Catalog items: ${catalogItems.length}`);
console.log(`Finding question: ${findingDraft.question.questionId}`);
console.log(`Finding prepared: ${findingDraft.findingPrepared}`);
console.log(`Finding title: ${findingDraft.finding.title}`);
console.log(`Severity preview: ${findingDraft.severityPreview.level}`);
console.log("Safety boundary:");
console.log(`- findingDraftPersisted: ${findingDraft.safetyBoundary.findingDraftPersisted}`);
console.log(`- findingCreated: ${findingDraft.safetyBoundary.findingCreated}`);
console.log(`- assessmentCreated: ${findingDraft.safetyBoundary.assessmentCreated}`);
console.log(`- reportCreated: ${findingDraft.safetyBoundary.reportCreated}`);
