import assert from "node:assert/strict";
import DraftWorkspaceManager from "../portal/core/DraftWorkspaceManager.js";

const draftRecord = DraftWorkspaceManager.createDraftRecord({
    draftMode: "report_draft_preview_sandbox_read_only",
    reportPrepared: true,
    reportSection: "conditional_acquisition_note",
    question: {
        questionId: "DE-TDD-06-036"
    },
    report: {
        title: "Report draft · DE-TDD-06-036",
        previewOnly: true,
        persisted: false,
        exported: false
    },
    decision: {
        route: "conditional_decision"
    }
}, {
    createdAt: "2026-07-09T23:50:00.000Z"
});

const review = DraftWorkspaceManager.createExpertReview(draftRecord, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-09T23:51:00.000Z"
});

assert.equal(review.reviewMode, "expert_review_controlled");
assert.equal(review.reviewId, "expert_review-report_draft-de-tdd-06-036");
assert.equal(review.draftId, "report_draft-de-tdd-06-036");
assert.equal(review.draftType, "report_draft");
assert.equal(review.sourceId, "DE-TDD-06-036");
assert.equal(review.status, "review_required");
assert.equal(review.reviewer, "Matthias Meiferts");
assert.equal(review.notes.length, 0);
assert.equal(review.decision, null);

assert.equal(review.permissions.canAddNote, true);
assert.equal(review.permissions.canApprove, true);
assert.equal(review.permissions.canReject, true);
assert.equal(review.permissions.canExport, false);
assert.equal(review.permissions.canCreateClientDocument, false);
assert.equal(review.permissions.canFinalizeWorkflow, false);

assert.equal(review.safetyBoundary.reviewPersisted, false);
assert.equal(review.safetyBoundary.expertApprovalGranted, false);
assert.equal(review.safetyBoundary.clientDocumentCreated, false);
assert.equal(review.safetyBoundary.reportExported, false);
assert.equal(review.safetyBoundary.workflowFinalized, false);

const withNote = DraftWorkspaceManager.addExpertReviewNote(review, {
    text: "CAPEX assumption requires expert validation before client use.",
    author: "Matthias Meiferts",
    category: "capex"
}, {
    createdAt: "2026-07-09T23:52:00.000Z"
});

assert.equal(withNote.notes.length, 1);
assert.equal(withNote.notes[0].category, "capex");
assert.equal(withNote.notes[0].text, "CAPEX assumption requires expert validation before client use.");
assert.equal(withNote.status, "review_required");
assert.equal(withNote.permissions.canExport, false);

const approvedReview = DraftWorkspaceManager.approveExpertReview(withNote, {
    comment: "Approved for controlled draft progression.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-09T23:53:00.000Z"
});

assert.equal(approvedReview.status, "approved");
assert.equal(approvedReview.decision.decisionType, "approved");
assert.equal(approvedReview.safetyBoundary.expertApprovalGranted, true);
assert.equal(approvedReview.permissions.canExport, false);
assert.equal(approvedReview.permissions.canCreateClientDocument, false);
assert.equal(approvedReview.permissions.canFinalizeWorkflow, false);

const rejectedReview = DraftWorkspaceManager.rejectExpertReview(withNote, {
    comment: "Rejected until evidence is clarified.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-09T23:54:00.000Z"
});

assert.equal(rejectedReview.status, "rejected");
assert.equal(rejectedReview.decision.decisionType, "rejected");
assert.equal(rejectedReview.safetyBoundary.expertApprovalGranted, false);
assert.equal(rejectedReview.permissions.canExport, false);
assert.equal(rejectedReview.permissions.canCreateClientDocument, false);
assert.equal(rejectedReview.permissions.canFinalizeWorkflow, false);

console.log("Expert review model test passed");
console.log(`Review id: ${review.reviewId}`);
console.log(`Review status: ${review.status}`);
console.log(`Notes after add: ${withNote.notes.length}`);
console.log(`Approved status: ${approvedReview.status}`);
console.log(`Rejected status: ${rejectedReview.status}`);
console.log(`Approved can export: ${approvedReview.permissions.canExport}`);
console.log(`Approved workflow finalized: ${approvedReview.safetyBoundary.workflowFinalized}`);
