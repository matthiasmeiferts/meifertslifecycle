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
import RecommendationDraftPreviewSandbox from "../portal/core/RecommendationDraftPreviewSandbox.js";
import DecisionDraftPreviewSandbox from "../portal/core/DecisionDraftPreviewSandbox.js";
import ReportDraftPreviewSandbox from "../portal/core/ReportDraftPreviewSandbox.js";
import DraftWorkspaceManager from "../portal/core/DraftWorkspaceManager.js";

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
    sandboxId: "expert-review-from-workspace-draft-001"
});

const initialState = SandboxAnswerStateEngine.createInitialState(sandbox);

const afterFinding = SandboxAnswerStateEngine.applyAnswer(initialState, "finding", {
    timestamp: "2026-07-10T00:00:00.000Z"
});

const evidenceRequirement = EvidenceRequirementPreviewEngine.createPreview(afterFinding);
const captureDraft = EvidenceCaptureDraftSandbox.createDraft(evidenceRequirement);

const completedCaptureDraft = EvidenceCaptureDraftSandbox.updateDraft(captureDraft, {
    photo: "sandbox-photo-placeholder.jpg",
    comment: "Observed facade defect near balcony edge.",
    moisture_indicator: "Surface moisture indicator noted."
}, {
    timestamp: "2026-07-10T00:01:00.000Z"
});

const findingDraft = FindingDraftPreviewSandbox.createDraft(completedCaptureDraft);
const assessmentDraft = AssessmentDraftPreviewSandbox.createDraft(findingDraft);
const recommendationDraft = RecommendationDraftPreviewSandbox.createDraft(assessmentDraft);
const decisionDraft = DecisionDraftPreviewSandbox.createDraft(recommendationDraft);
const reportDraft = ReportDraftPreviewSandbox.createDraft(decisionDraft);

assert.equal(reportDraft.reportPrepared, true);
assert.equal(reportDraft.reportSection, "conditional_acquisition_note");

const workspaceDraft = DraftWorkspaceManager.createDraftRecord(reportDraft, {
    createdAt: "2026-07-10T00:02:00.000Z"
});

assert.equal(workspaceDraft.draftMode, "workspace_draft_controlled");
assert.equal(workspaceDraft.draftType, "report_draft");
assert.equal(workspaceDraft.permissions.requiresExpertApproval, true);
assert.equal(workspaceDraft.permissions.canExport, false);

const review = DraftWorkspaceManager.createExpertReview(workspaceDraft, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T00:03:00.000Z"
});

assert.equal(review.reviewMode, "expert_review_controlled");
assert.equal(review.draftId, workspaceDraft.draftId);
assert.equal(review.draftType, "report_draft");
assert.equal(review.sourceId, "DE-TDD-06-036");
assert.equal(review.status, "review_required");
assert.equal(review.notes.length, 0);
assert.equal(review.permissions.canExport, false);
assert.equal(review.permissions.canCreateClientDocument, false);
assert.equal(review.permissions.canFinalizeWorkflow, false);

const reviewWithNote = DraftWorkspaceManager.addExpertReviewNote(review, {
    text: "Check CAPEX wording and acquisition condition before client use.",
    author: "Matthias Meiferts",
    category: "transaction-risk"
}, {
    createdAt: "2026-07-10T00:04:00.000Z"
});

assert.equal(reviewWithNote.status, "review_required");
assert.equal(reviewWithNote.notes.length, 1);
assert.equal(reviewWithNote.notes[0].category, "transaction-risk");
assert.equal(reviewWithNote.safetyBoundary.expertApprovalGranted, false);

const approvedReview = DraftWorkspaceManager.approveExpertReview(reviewWithNote, {
    comment: "Approved as controlled expert-reviewed draft.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T00:05:00.000Z"
});

assert.equal(approvedReview.status, "approved");
assert.equal(approvedReview.decision.decisionType, "approved");
assert.equal(approvedReview.safetyBoundary.expertApprovalGranted, true);
assert.equal(approvedReview.permissions.canExport, false);
assert.equal(approvedReview.permissions.canCreateClientDocument, false);
assert.equal(approvedReview.permissions.canFinalizeWorkflow, false);
assert.equal(approvedReview.safetyBoundary.clientDocumentCreated, false);
assert.equal(approvedReview.safetyBoundary.reportExported, false);
assert.equal(approvedReview.safetyBoundary.workflowFinalized, false);

const rejectedReview = DraftWorkspaceManager.rejectExpertReview(reviewWithNote, {
    comment: "Rejected until source evidence is clarified.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T00:06:00.000Z"
});

assert.equal(rejectedReview.status, "rejected");
assert.equal(rejectedReview.decision.decisionType, "rejected");
assert.equal(rejectedReview.safetyBoundary.expertApprovalGranted, false);
assert.equal(rejectedReview.permissions.canExport, false);
assert.equal(rejectedReview.permissions.canCreateClientDocument, false);
assert.equal(rejectedReview.permissions.canFinalizeWorkflow, false);
assert.equal(rejectedReview.safetyBoundary.clientDocumentCreated, false);
assert.equal(rejectedReview.safetyBoundary.reportExported, false);
assert.equal(rejectedReview.safetyBoundary.workflowFinalized, false);

console.log("Expert review from workspace draft test passed");
console.log(`Workspace draft id: ${workspaceDraft.draftId}`);
console.log(`Review id: ${review.reviewId}`);
console.log(`Review status: ${review.status}`);
console.log(`Notes: ${reviewWithNote.notes.length}`);
console.log(`Approved status: ${approvedReview.status}`);
console.log(`Rejected status: ${rejectedReview.status}`);
console.log(`Approved can export: ${approvedReview.permissions.canExport}`);
console.log(`Approved workflow finalized: ${approvedReview.safetyBoundary.workflowFinalized}`);
