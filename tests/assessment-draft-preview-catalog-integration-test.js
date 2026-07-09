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
    sandboxId: "assessment-draft-catalog-integration-001"
});

const initialState = SandboxAnswerStateEngine.createInitialState(sandbox);

const afterFinding = SandboxAnswerStateEngine.applyAnswer(initialState, "finding", {
    timestamp: "2026-07-09T11:00:00.000Z"
});

const evidenceRequirement = EvidenceRequirementPreviewEngine.createPreview(afterFinding);
const captureDraft = EvidenceCaptureDraftSandbox.createDraft(evidenceRequirement);

const completedCaptureDraft = EvidenceCaptureDraftSandbox.updateDraft(captureDraft, {
    photo: "sandbox-photo-placeholder.jpg",
    comment: "Sandbox comment for observed issue.",
    moisture_indicator: "Optional moisture note."
}, {
    timestamp: "2026-07-09T11:01:00.000Z"
});

const findingDraft = FindingDraftPreviewSandbox.createDraft(completedCaptureDraft);
const assessmentDraft = AssessmentDraftPreviewSandbox.createDraft(findingDraft);

assert.equal(catalogItems.length, 680);
assert.equal(preview.previewMode, "read_only");
assert.equal(scopeDraft.draftMode, "read_only");
assert.equal(sandbox.sessionMode, "sandbox_read_only");
assert.equal(afterFinding.stateMode, "sandbox_answer_state_read_only");
assert.equal(evidenceRequirement.previewMode, "evidence_requirement_preview_read_only");
assert.equal(completedCaptureDraft.draftMode, "evidence_capture_draft_sandbox_read_only");
assert.equal(findingDraft.draftMode, "finding_draft_preview_sandbox_read_only");
assert.equal(findingDraft.findingPrepared, true);

assert.equal(assessmentDraft.draftMode, "assessment_draft_preview_sandbox_read_only");
assert.equal(assessmentDraft.sourceDraftMode, "finding_draft_preview_sandbox_read_only");
assert.equal(assessmentDraft.canPrepareAssessment, true);
assert.equal(assessmentDraft.assessmentPrepared, true);
assert.ok(assessmentDraft.question.questionId);
assert.ok(assessmentDraft.finding.title);
assert.ok(assessmentDraft.assessment.assessmentTitle);
assert.ok(assessmentDraft.assessment.technicalImplication);
assert.ok(assessmentDraft.assessment.recommendedReview);
assert.ok(["moderate", "elevated"].includes(assessmentDraft.riskPreview.level));
assert.equal(assessmentDraft.assessment.persisted, false);
assert.equal(assessmentDraft.assessment.previewOnly, true);
assert.equal(assessmentDraft.assessmentState.assessmentCreated, false);
assert.equal(assessmentDraft.assessmentState.recommendationCreated, false);
assert.equal(assessmentDraft.assessmentState.reportCreated, false);

assert.equal(assessmentDraft.safetyBoundary.sandboxOnly, true);
assert.equal(assessmentDraft.safetyBoundary.assessmentDraftPersisted, false);
assert.equal(assessmentDraft.safetyBoundary.findingDraftPersisted, false);
assert.equal(assessmentDraft.safetyBoundary.captureDraftPersisted, false);
assert.equal(assessmentDraft.safetyBoundary.evidencePersisted, false);
assert.equal(assessmentDraft.safetyBoundary.answerPersisted, false);
assert.equal(assessmentDraft.safetyBoundary.inspectionCreated, false);
assert.equal(assessmentDraft.safetyBoundary.evidenceCreated, false);
assert.equal(assessmentDraft.safetyBoundary.findingCreated, false);
assert.equal(assessmentDraft.safetyBoundary.assessmentCreated, false);
assert.equal(assessmentDraft.safetyBoundary.recommendationCreated, false);
assert.equal(assessmentDraft.safetyBoundary.decisionCreated, false);
assert.equal(assessmentDraft.safetyBoundary.reportCreated, false);

assert.ok(!("assessmentId" in assessmentDraft));
assert.ok(!("assessmentIds" in assessmentDraft));
assert.ok(!("recommendationId" in assessmentDraft));
assert.ok(!("decisionId" in assessmentDraft));
assert.ok(!("reportId" in assessmentDraft));

console.log("AssessmentDraftPreviewSandbox catalog integration test passed");
console.log(`Catalog items: ${catalogItems.length}`);
console.log(`Assessment question: ${assessmentDraft.question.questionId}`);
console.log(`Assessment prepared: ${assessmentDraft.assessmentPrepared}`);
console.log(`Risk level: ${assessmentDraft.riskPreview.level}`);
console.log(`Recommended review: ${assessmentDraft.assessment.recommendedReview}`);
console.log("Safety boundary:");
console.log(`- assessmentDraftPersisted: ${assessmentDraft.safetyBoundary.assessmentDraftPersisted}`);
console.log(`- assessmentCreated: ${assessmentDraft.safetyBoundary.assessmentCreated}`);
console.log(`- recommendationCreated: ${assessmentDraft.safetyBoundary.recommendationCreated}`);
console.log(`- reportCreated: ${assessmentDraft.safetyBoundary.reportCreated}`);
