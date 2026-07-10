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
        title: "Export preparation review from gate",
        previewOnly: true,
        persisted: false,
        exported: false
    }
}, {
    createdAt: "2026-07-10T06:00:00.000Z"
});

const expertReview = DraftWorkspaceManager.createExpertReview(workspaceDraft, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T06:01:00.000Z"
});

const expertReviewWithNote = DraftWorkspaceManager.addExpertReviewNote(expertReview, {
    text: "Expert note before export preparation review from gate.",
    author: "Matthias Meiferts",
    category: "expert-review"
}, {
    createdAt: "2026-07-10T06:02:00.000Z"
});

const approvedExpertReview = DraftWorkspaceManager.approveExpertReview(expertReviewWithNote, {
    comment: "Expert approved.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T06:03:00.000Z"
});

const finalizationGate = DraftWorkspaceManager.createFinalizationGate(approvedExpertReview, {
    createdAt: "2026-07-10T06:04:00.000Z"
});

const internalReview = DraftWorkspaceManager.createInternalFinalizationReview(finalizationGate, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T06:05:00.000Z"
});

const blockedExportGate = DraftWorkspaceManager.createExportPreparationGate(internalReview, {
    createdAt: "2026-07-10T06:06:00.000Z"
});

const blockedExportReview = DraftWorkspaceManager.createExportPreparationReview(blockedExportGate, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T06:07:00.000Z"
});

assert.equal(blockedExportGate.status, "blocked_pending_internal_finalization_review");
assert.equal(blockedExportReview.status, "blocked_pending_export_preparation_gate");
assert.equal(blockedExportReview.readiness.exportPreparationGateReady, false);
assert.equal(blockedExportReview.permissions.canExport, false);
assert.equal(blockedExportReview.permissions.canCreateClientDocument, false);
assert.equal(blockedExportReview.permissions.canFinalizeWorkflow, false);

const internalReviewWithNote = DraftWorkspaceManager.addInternalFinalizationReviewNote(internalReview, {
    text: "Internal note before export preparation gate.",
    author: "Matthias Meiferts",
    category: "internal-finalization"
}, {
    createdAt: "2026-07-10T06:08:00.000Z"
});

const approvedInternalReview = DraftWorkspaceManager.approveInternalFinalizationReview(internalReviewWithNote, {
    comment: "Internally approved.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T06:09:00.000Z"
});

const readyExportGate = DraftWorkspaceManager.createExportPreparationGate(approvedInternalReview, {
    createdAt: "2026-07-10T06:10:00.000Z"
});

const exportReview = DraftWorkspaceManager.createExportPreparationReview(readyExportGate, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T06:11:00.000Z"
});

assert.equal(readyExportGate.status, "export_preparation_review_required");
assert.equal(exportReview.reviewId, "export_preparation_review-report_draft-de-tdd-06-036");
assert.equal(exportReview.status, "review_required");
assert.equal(exportReview.sourceExportPreparationGateId, readyExportGate.gateId);
assert.equal(exportReview.sourceInternalReviewId, approvedInternalReview.reviewId);
assert.equal(exportReview.sourceGateId, finalizationGate.gateId);
assert.equal(exportReview.sourceReviewId, approvedExpertReview.reviewId);
assert.equal(exportReview.sourceDraftId, workspaceDraft.draftId);
assert.equal(exportReview.readiness.exportPreparationGateReady, true);
assert.equal(exportReview.readiness.exportPreparationReviewCompleted, false);

const approvalWithoutNote = DraftWorkspaceManager.approveExportPreparationReview(exportReview, {
    comment: "Should stay locked without note.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T06:12:00.000Z"
});

assert.equal(approvalWithoutNote.status, "review_required");
assert.equal(approvalWithoutNote.readiness.exportPreparationReviewCompleted, false);
assert.equal(approvalWithoutNote.permissions.canExport, false);
assert.equal(approvalWithoutNote.safetyBoundary.exportFileCreated, false);

const exportReviewWithNote = DraftWorkspaceManager.addExportPreparationReviewNote(exportReview, {
    text: "Export preparation review note before decision.",
    author: "Matthias Meiferts",
    category: "export-preparation"
}, {
    createdAt: "2026-07-10T06:13:00.000Z"
});

const approvedExportReview = DraftWorkspaceManager.approveExportPreparationReview(exportReviewWithNote, {
    comment: "Approved for export preparation review only.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T06:14:00.000Z"
});

const rejectedExportReview = DraftWorkspaceManager.rejectExportPreparationReview(exportReviewWithNote, {
    comment: "Rejected branch remains locked.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T06:15:00.000Z"
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
assert.equal(rejectedExportReview.permissions.canCreateClientDocument, false);
assert.equal(rejectedExportReview.permissions.canFinalizeWorkflow, false);
assert.equal(rejectedExportReview.safetyBoundary.exportFileCreated, false);

console.log("Export preparation review from gate test passed");
console.log(`Blocked export gate status: ${blockedExportGate.status}`);
console.log(`Blocked export review status: ${blockedExportReview.status}`);
console.log(`Ready export gate status: ${readyExportGate.status}`);
console.log(`Export review status: ${exportReview.status}`);
console.log(`Notes before decision: ${exportReviewWithNote.notes.length}`);
console.log(`Approved export review status: ${approvedExportReview.status}`);
console.log(`Rejected export review status: ${rejectedExportReview.status}`);
console.log(`Can export: ${approvedExportReview.permissions.canExport}`);
console.log(`Can create client document: ${approvedExportReview.permissions.canCreateClientDocument}`);
console.log(`Can finalize workflow: ${approvedExportReview.permissions.canFinalizeWorkflow}`);
console.log(`Export file created: ${approvedExportReview.safetyBoundary.exportFileCreated}`);
