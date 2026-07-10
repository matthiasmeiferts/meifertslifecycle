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
        title: "Export preparation review model",
        previewOnly: true,
        persisted: false,
        exported: false
    }
}, {
    createdAt: "2026-07-10T05:40:00.000Z"
});

const expertReview = DraftWorkspaceManager.createExpertReview(workspaceDraft, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T05:41:00.000Z"
});

const expertReviewWithNote = DraftWorkspaceManager.addExpertReviewNote(expertReview, {
    text: "Expert note.",
    author: "Matthias Meiferts",
    category: "expert-review"
}, {
    createdAt: "2026-07-10T05:42:00.000Z"
});

const approvedExpertReview = DraftWorkspaceManager.approveExpertReview(expertReviewWithNote, {
    comment: "Expert approved.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T05:43:00.000Z"
});

const finalizationGate = DraftWorkspaceManager.createFinalizationGate(approvedExpertReview, {
    createdAt: "2026-07-10T05:44:00.000Z"
});

const internalReview = DraftWorkspaceManager.createInternalFinalizationReview(finalizationGate, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T05:45:00.000Z"
});

const internalReviewWithNote = DraftWorkspaceManager.addInternalFinalizationReviewNote(internalReview, {
    text: "Internal note.",
    author: "Matthias Meiferts",
    category: "internal-finalization"
}, {
    createdAt: "2026-07-10T05:46:00.000Z"
});

const approvedInternalReview = DraftWorkspaceManager.approveInternalFinalizationReview(internalReviewWithNote, {
    comment: "Internally approved.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T05:47:00.000Z"
});

const readyExportGate = DraftWorkspaceManager.createExportPreparationGate(approvedInternalReview, {
    createdAt: "2026-07-10T05:48:00.000Z"
});

const blockedExportReview = DraftWorkspaceManager.createExportPreparationReview({
    status: "blocked_pending_internal_finalization_review",
    readiness: {
        internalFinalizationReviewCompleted: false
    }
}, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T05:49:00.000Z"
});

const exportReview = DraftWorkspaceManager.createExportPreparationReview(readyExportGate, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T05:50:00.000Z"
});

assert.equal(blockedExportReview.status, "blocked_pending_export_preparation_gate");
assert.equal(blockedExportReview.readiness.exportPreparationGateReady, false);
assert.equal(blockedExportReview.permissions.canExport, false);
assert.equal(blockedExportReview.safetyBoundary.exportFileCreated, false);

assert.equal(exportReview.reviewId, "export_preparation_review-report_draft-de-tdd-06-036");
assert.equal(exportReview.reviewType, "export_preparation_review");
assert.equal(exportReview.sourceExportPreparationGateId, "export_preparation_gate-report_draft-de-tdd-06-036");
assert.equal(exportReview.status, "review_required");
assert.equal(exportReview.readiness.exportPreparationGateReady, true);
assert.equal(exportReview.readiness.exportPreparationReviewCompleted, false);
assert.equal(exportReview.permissions.canExport, false);
assert.equal(exportReview.permissions.canCreateClientDocument, false);
assert.equal(exportReview.permissions.canFinalizeWorkflow, false);
assert.equal(exportReview.safetyBoundary.exportPreparationReviewCompleted, false);
assert.equal(exportReview.safetyBoundary.exportPrepared, false);
assert.equal(exportReview.safetyBoundary.exportFileCreated, false);
assert.equal(exportReview.safetyBoundary.reportExported, false);
assert.equal(exportReview.safetyBoundary.clientDocumentCreated, false);
assert.equal(exportReview.safetyBoundary.workflowFinalized, false);

const approvalWithoutNote = DraftWorkspaceManager.approveExportPreparationReview(exportReview, {
    comment: "Should remain review_required because note is missing.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T05:51:00.000Z"
});

assert.equal(approvalWithoutNote.status, "review_required");
assert.equal(approvalWithoutNote.safetyBoundary.exportPreparationReviewCompleted, false);

const exportReviewWithNote = DraftWorkspaceManager.addExportPreparationReviewNote(exportReview, {
    text: "Export preparation review note before approval.",
    author: "Matthias Meiferts",
    category: "export-preparation"
}, {
    createdAt: "2026-07-10T05:52:00.000Z"
});

const approvedExportReview = DraftWorkspaceManager.approveExportPreparationReview(exportReviewWithNote, {
    comment: "Approved for export preparation review only. Export remains locked.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T05:53:00.000Z"
});

const rejectedExportReview = DraftWorkspaceManager.rejectExportPreparationReview(exportReviewWithNote, {
    comment: "Rejected branch remains locked.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T05:54:00.000Z"
});

assert.equal(exportReviewWithNote.notes.length, 1);
assert.equal(approvedExportReview.status, "approved");
assert.equal(approvedExportReview.readiness.exportPreparationReviewCompleted, true);
assert.equal(approvedExportReview.permissions.canExport, false);
assert.equal(approvedExportReview.permissions.canCreateClientDocument, false);
assert.equal(approvedExportReview.permissions.canFinalizeWorkflow, false);
assert.equal(approvedExportReview.safetyBoundary.exportPreparationReviewCompleted, true);
assert.equal(approvedExportReview.safetyBoundary.exportPrepared, false);
assert.equal(approvedExportReview.safetyBoundary.exportFileCreated, false);
assert.equal(approvedExportReview.safetyBoundary.reportExported, false);
assert.equal(approvedExportReview.safetyBoundary.clientDocumentCreated, false);
assert.equal(approvedExportReview.safetyBoundary.workflowFinalized, false);

assert.equal(rejectedExportReview.status, "rejected");
assert.equal(rejectedExportReview.readiness.exportPreparationReviewCompleted, false);
assert.equal(rejectedExportReview.permissions.canExport, false);
assert.equal(rejectedExportReview.safetyBoundary.exportFileCreated, false);

const clone = DraftWorkspaceManager.cloneExportPreparationReview(approvedExportReview);
clone.safetyBoundary.exportFileCreated = true;
assert.equal(approvedExportReview.safetyBoundary.exportFileCreated, false);

console.log("Export preparation review model test passed");
console.log(`Blocked export review status: ${blockedExportReview.status}`);
console.log(`Export review id: ${exportReview.reviewId}`);
console.log(`Export review status: ${exportReview.status}`);
console.log(`Notes before decision: ${exportReviewWithNote.notes.length}`);
console.log(`Approved export review status: ${approvedExportReview.status}`);
console.log(`Rejected export review status: ${rejectedExportReview.status}`);
console.log(`Can export: ${approvedExportReview.permissions.canExport}`);
console.log(`Can create client document: ${approvedExportReview.permissions.canCreateClientDocument}`);
console.log(`Can finalize workflow: ${approvedExportReview.permissions.canFinalizeWorkflow}`);
console.log(`Export file created: ${approvedExportReview.safetyBoundary.exportFileCreated}`);
