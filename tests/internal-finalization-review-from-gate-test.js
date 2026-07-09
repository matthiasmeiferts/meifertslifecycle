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
        title: "Internal finalization review from gate",
        previewOnly: true,
        persisted: false,
        exported: false
    }
}, {
    createdAt: "2026-07-10T03:20:00.000Z"
});

const expertReview = DraftWorkspaceManager.createExpertReview(workspaceDraft, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T03:21:00.000Z"
});

const blockedGate = DraftWorkspaceManager.createFinalizationGate(expertReview, {
    createdAt: "2026-07-10T03:22:00.000Z"
});

const internalReviewFromBlockedGate = DraftWorkspaceManager.createInternalFinalizationReview(blockedGate, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T03:23:00.000Z"
});

assert.equal(blockedGate.status, "blocked_pending_expert_approval");
assert.equal(internalReviewFromBlockedGate.status, "blocked_pending_finalization_gate");
assert.equal(internalReviewFromBlockedGate.readiness.finalizationGateReady, false);
assert.equal(internalReviewFromBlockedGate.permissions.canExport, false);
assert.equal(internalReviewFromBlockedGate.permissions.canCreateClientDocument, false);
assert.equal(internalReviewFromBlockedGate.permissions.canFinalizeWorkflow, false);

const notedExpertReview = DraftWorkspaceManager.addExpertReviewNote(expertReview, {
    text: "Expert review note before internal finalization review.",
    author: "Matthias Meiferts",
    category: "expert-review"
}, {
    createdAt: "2026-07-10T03:24:00.000Z"
});

const approvedExpertReview = DraftWorkspaceManager.approveExpertReview(notedExpertReview, {
    comment: "Approved for internal finalization review preparation.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T03:25:00.000Z"
});

const readyGate = DraftWorkspaceManager.createFinalizationGate(approvedExpertReview, {
    createdAt: "2026-07-10T03:26:00.000Z"
});

const internalReview = DraftWorkspaceManager.createInternalFinalizationReview(readyGate, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T03:27:00.000Z"
});

assert.equal(readyGate.status, "ready_for_internal_finalization_review");
assert.equal(internalReview.reviewId, "internal_finalization_review-report_draft-de-tdd-06-036");
assert.equal(internalReview.status, "internal_review_required");
assert.equal(internalReview.readiness.finalizationGateReady, true);
assert.equal(internalReview.readiness.internalReviewCompleted, false);
assert.equal(internalReview.readiness.exportPreparationAllowed, false);
assert.equal(internalReview.readiness.clientDocumentPreparationAllowed, false);
assert.equal(internalReview.readiness.workflowFinalizationAllowed, false);
assert.equal(internalReview.permissions.canExport, false);
assert.equal(internalReview.permissions.canCreateClientDocument, false);
assert.equal(internalReview.permissions.canFinalizeWorkflow, false);

const notedInternalReview = DraftWorkspaceManager.addInternalFinalizationReviewNote(internalReview, {
    text: "Internal finalization review note.",
    author: "Matthias Meiferts",
    category: "internal-finalization"
}, {
    createdAt: "2026-07-10T03:28:00.000Z"
});

assert.equal(notedInternalReview.notes.length, 1);
assert.equal(notedInternalReview.status, "internal_review_required");
assert.equal(notedInternalReview.permissions.canExport, false);

const approvedInternalReview = DraftWorkspaceManager.approveInternalFinalizationReview(notedInternalReview, {
    comment: "Internally approved only. Export remains locked.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T03:29:00.000Z"
});

assert.equal(approvedInternalReview.status, "internally_approved");
assert.equal(approvedInternalReview.decision.decisionType, "internally_approved");
assert.equal(approvedInternalReview.readiness.internalReviewCompleted, true);
assert.equal(approvedInternalReview.safetyBoundary.internalFinalizationReviewCompleted, true);
assert.equal(approvedInternalReview.permissions.canExport, false);
assert.equal(approvedInternalReview.permissions.canCreateClientDocument, false);
assert.equal(approvedInternalReview.permissions.canFinalizeWorkflow, false);
assert.equal(approvedInternalReview.safetyBoundary.exportPrepared, false);
assert.equal(approvedInternalReview.safetyBoundary.reportExported, false);
assert.equal(approvedInternalReview.safetyBoundary.clientDocumentCreated, false);
assert.equal(approvedInternalReview.safetyBoundary.workflowFinalized, false);

const rejectedInternalReview = DraftWorkspaceManager.rejectInternalFinalizationReview(notedInternalReview, {
    comment: "Internally rejected. Export remains locked.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T03:30:00.000Z"
});

assert.equal(rejectedInternalReview.status, "internally_rejected");
assert.equal(rejectedInternalReview.decision.decisionType, "internally_rejected");
assert.equal(rejectedInternalReview.readiness.internalReviewCompleted, false);
assert.equal(rejectedInternalReview.safetyBoundary.internalFinalizationReviewCompleted, false);
assert.equal(rejectedInternalReview.permissions.canExport, false);
assert.equal(rejectedInternalReview.permissions.canCreateClientDocument, false);
assert.equal(rejectedInternalReview.permissions.canFinalizeWorkflow, false);
assert.equal(rejectedInternalReview.safetyBoundary.reportExported, false);
assert.equal(rejectedInternalReview.safetyBoundary.clientDocumentCreated, false);
assert.equal(rejectedInternalReview.safetyBoundary.workflowFinalized, false);

assert.equal(
    approvedInternalReview.safetyBoundary.internalFinalizationReviewCompleted,
    true,
    "Approved internal review must remain approved after rejected branch is created."
);

assert.equal(
    rejectedInternalReview.safetyBoundary.internalFinalizationReviewCompleted,
    false,
    "Rejected internal review must remain rejected without mutating approved branch."
);

console.log("Internal finalization review from gate test passed");
console.log(`Blocked gate: ${blockedGate.status}`);
console.log(`Blocked internal review: ${internalReviewFromBlockedGate.status}`);
console.log(`Ready gate: ${readyGate.status}`);
console.log(`Internal review: ${internalReview.status}`);
console.log(`Notes: ${notedInternalReview.notes.length}`);
console.log(`Approved internal status: ${approvedInternalReview.status}`);
console.log(`Rejected internal status: ${rejectedInternalReview.status}`);
console.log(`Approved can export: ${approvedInternalReview.permissions.canExport}`);
console.log(`Approved can create client document: ${approvedInternalReview.permissions.canCreateClientDocument}`);
console.log(`Approved can finalize workflow: ${approvedInternalReview.permissions.canFinalizeWorkflow}`);
