import assert from "node:assert/strict";
import DraftWorkspaceManager from "../portal/core/DraftWorkspaceManager.js";

const workspaceDraft = DraftWorkspaceManager.createDraftRecord({
    draftMode: "report_draft_preview_sandbox_read_only",
    reportPrepared: true,
    reportSection: "conditional_acquisition_note",
    question: {
        questionId: "DE-TDD-06-036"
    },
    decision: {
        route: "conditional_decision"
    },
    report: {
        title: "Finalization gate from expert review",
        previewOnly: true,
        persisted: false,
        exported: false
    }
}, {
    createdAt: "2026-07-10T01:40:00.000Z"
});

const reviewRequired = DraftWorkspaceManager.createExpertReview(workspaceDraft, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T01:41:00.000Z"
});

const gateFromReviewRequired = DraftWorkspaceManager.createFinalizationGate(reviewRequired, {
    createdAt: "2026-07-10T01:42:00.000Z"
});

assert.equal(reviewRequired.status, "review_required");
assert.equal(reviewRequired.safetyBoundary.expertApprovalGranted, false);
assert.equal(gateFromReviewRequired.status, "blocked_pending_expert_approval");
assert.equal(gateFromReviewRequired.readiness.expertReviewApproved, false);
assert.equal(gateFromReviewRequired.permissions.canExport, false);
assert.equal(gateFromReviewRequired.permissions.canCreateClientDocument, false);
assert.equal(gateFromReviewRequired.permissions.canFinalizeWorkflow, false);

const reviewed = DraftWorkspaceManager.addExpertReviewNote(reviewRequired, {
    text: "Expert review completed for finalization gate preparation.",
    author: "Matthias Meiferts",
    category: "finalization-gate"
}, {
    createdAt: "2026-07-10T01:43:00.000Z"
});

const approved = DraftWorkspaceManager.approveExpertReview(reviewed, {
    comment: "Approved for internal finalization gate preparation.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T01:44:00.000Z"
});

const gateFromApproved = DraftWorkspaceManager.createFinalizationGate(approved, {
    createdAt: "2026-07-10T01:45:00.000Z"
});

assert.equal(approved.status, "approved");
assert.equal(approved.safetyBoundary.expertApprovalGranted, true);
assert.equal(gateFromApproved.status, "ready_for_internal_finalization_review");
assert.equal(gateFromApproved.readiness.expertReviewApproved, true);
assert.equal(gateFromApproved.readiness.exportPreparationAllowed, false);
assert.equal(gateFromApproved.readiness.clientDocumentPreparationAllowed, false);
assert.equal(gateFromApproved.readiness.workflowFinalizationAllowed, false);
assert.equal(gateFromApproved.permissions.canExport, false);
assert.equal(gateFromApproved.permissions.canCreateClientDocument, false);
assert.equal(gateFromApproved.permissions.canFinalizeWorkflow, false);

const rejected = DraftWorkspaceManager.rejectExpertReview(reviewed, {
    comment: "Rejected review must block finalization gate.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T01:46:00.000Z"
});

const gateFromRejected = DraftWorkspaceManager.createFinalizationGate(rejected, {
    createdAt: "2026-07-10T01:47:00.000Z"
});

assert.equal(rejected.status, "rejected");
assert.equal(rejected.safetyBoundary.expertApprovalGranted, false);
assert.equal(gateFromRejected.status, "blocked_pending_expert_approval");
assert.equal(gateFromRejected.readiness.expertReviewApproved, false);
assert.equal(gateFromRejected.permissions.canExport, false);
assert.equal(gateFromRejected.permissions.canCreateClientDocument, false);
assert.equal(gateFromRejected.permissions.canFinalizeWorkflow, false);

console.log("Finalization gate from expert review test passed");
console.log(`Review required gate: ${gateFromReviewRequired.status}`);
console.log(`Approved gate: ${gateFromApproved.status}`);
console.log(`Rejected gate: ${gateFromRejected.status}`);
console.log(`Approved gate can export: ${gateFromApproved.permissions.canExport}`);
console.log(`Approved gate can create client document: ${gateFromApproved.permissions.canCreateClientDocument}`);
console.log(`Approved gate can finalize workflow: ${gateFromApproved.permissions.canFinalizeWorkflow}`);
