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
import AssessmentDraftPreviewSandbox from "../portal/core/AssessmentDraftPreviewSandbox.js";

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
    sandboxId: "assessment-draft-browser-flow-safety-001"
});

const initialState = SandboxAnswerStateEngine.createInitialState(sandbox);

const afterFindingAnswer = SandboxAnswerStateEngine.applyAnswer(initialState, "finding", {
    timestamp: "2026-07-09T12:00:00.000Z"
});

const evidenceRequirement = EvidenceRequirementPreviewEngine.createPreview(afterFindingAnswer);
const captureDraft = EvidenceCaptureDraftSandbox.createDraft(evidenceRequirement);

const completedCaptureDraft = EvidenceCaptureDraftSandbox.updateDraft(captureDraft, {
    photo: "sandbox-photo-placeholder.jpg",
    comment: "Sandbox expert comment draft.",
    moisture_indicator: "Optional moisture note."
}, {
    timestamp: "2026-07-09T12:01:00.000Z"
});

const findingDraft = FindingDraftPreviewSandbox.createDraft(completedCaptureDraft);
const assessmentDraft = AssessmentDraftPreviewSandbox.createDraft(findingDraft);

assert.equal(catalogItems.length, 680);

assert.equal(preview.previewMode, "read_only");
assert.equal(scopeDraft.draftMode, "read_only");
assert.equal(sandbox.sessionMode, "sandbox_read_only");

assert.equal(afterFindingAnswer.stateMode, "sandbox_answer_state_read_only");

assert.equal(evidenceRequirement.previewMode, "evidence_requirement_preview_read_only");
assert.equal(evidenceRequirement.evidenceRequired, true);

assert.equal(captureDraft.draftMode, "evidence_capture_draft_sandbox_read_only");
assert.equal(captureDraft.evidenceRequired, true);

assert.equal(completedCaptureDraft.completion.readyForReview, true);
assert.equal(completedCaptureDraft.safetyBoundary.captureDraftPersisted, false);
assert.equal(completedCaptureDraft.safetyBoundary.evidenceCreated, false);

assert.equal(findingDraft.draftMode, "finding_draft_preview_sandbox_read_only");
assert.equal(findingDraft.findingPrepared, true);
assert.equal(findingDraft.safetyBoundary.findingDraftPersisted, false);
assert.equal(findingDraft.safetyBoundary.findingCreated, false);

assert.equal(assessmentDraft.draftMode, "assessment_draft_preview_sandbox_read_only");
assert.equal(assessmentDraft.assessmentPrepared, true);
assert.equal(assessmentDraft.riskPreview.level, "elevated");
assert.ok(assessmentDraft.assessment.technicalImplication);
assert.ok(assessmentDraft.assessment.recommendedReview);

assert.equal(assessmentDraft.safetyBoundary.assessmentDraftPersisted, false);
assert.equal(assessmentDraft.safetyBoundary.assessmentCreated, false);
assert.equal(assessmentDraft.safetyBoundary.recommendationCreated, false);
assert.equal(assessmentDraft.safetyBoundary.reportCreated, false);

console.log("Assessment draft browser flow safety test passed");
console.log(`Catalog items: ${catalogItems.length}`);
console.log(`Sandbox mode: ${sandbox.sessionMode}`);
console.log(`Answer state: ${afterFindingAnswer.stateMode}`);
console.log(`Evidence required: ${evidenceRequirement.evidenceRequired}`);
console.log(`Capture ready: ${completedCaptureDraft.completion.readyForReview}`);
console.log(`Finding prepared: ${findingDraft.findingPrepared}`);
console.log(`Assessment prepared: ${assessmentDraft.assessmentPrepared}`);
console.log(`Risk level: ${assessmentDraft.riskPreview.level}`);
console.log(`Technical implication: ${assessmentDraft.assessment.technicalImplication}`);
console.log("Safety boundary:");
console.log(`- captureDraftPersisted: ${completedCaptureDraft.safetyBoundary.captureDraftPersisted}`);
console.log(`- findingDraftPersisted: ${findingDraft.safetyBoundary.findingDraftPersisted}`);
console.log(`- assessmentDraftPersisted: ${assessmentDraft.safetyBoundary.assessmentDraftPersisted}`);
console.log(`- assessmentCreated: ${assessmentDraft.safetyBoundary.assessmentCreated}`);
console.log(`- recommendationCreated: ${assessmentDraft.safetyBoundary.recommendationCreated}`);
console.log(`- reportCreated: ${assessmentDraft.safetyBoundary.reportCreated}`);
