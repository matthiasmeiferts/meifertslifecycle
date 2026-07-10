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
        title: "Export authorization gate from export preparation review",
        previewOnly: true,
        persisted: false,
        exported: false
    }
}, {
    createdAt: "2026-07-10T09:20:00.000Z"
});

const expertReview = DraftWorkspaceManager.createExpertReview(workspaceDraft, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T09:21:00.000Z"
});

const expertReviewWithNote = DraftWorkspaceManager.addExpertReviewNote(expertReview, {
    text: "Expert note before authorization gate test.",
    author: "Matthias Meiferts",
    category: "expert-review"
}, {
    createdAt: "2026-07-10T09:22:00.000Z"
});

const approvedExpertReview = DraftWorkspaceManager.approveExpertReview(expertReviewWithNote, {
    comment: "Expert approved.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T09:23:00.000Z"
});

const finalizationGate = DraftWorkspaceManager.createFinalizationGate(approvedExpertReview, {
    createdAt: "2026-07-10T09:24:00.000Z"
});

const internalReview = DraftWorkspaceManager.createInternalFinalizationReview(finalizationGate, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T09:25:00.000Z"
});

const internalReviewWithNote = DraftWorkspaceManager.addInternalFinalizationReviewNote(internalReview, {
    text: "Internal note before authorization gate test.",
    author: "Matthias Meiferts",
    category: "internal-finalization"
}, {
    createdAt: "2026-07-10T09:26:00.000Z"
});

const approvedInternalReview = DraftWorkspaceManager.approveInternalFinalizationReview(internalReviewWithNote, {
    comment: "Internal approved.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T09:27:00.000Z"
});

const exportPreparationGate = DraftWorkspaceManager.createExportPreparationGate(approvedInternalReview, {
    createdAt: "2026-07-10T09:28:00.000Z"
});

const exportPreparationReview = DraftWorkspaceManager.createExportPreparationReview(exportPreparationGate, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T09:29:00.000Z"
});

const blockedAuthorizationGate = DraftWorkspaceManager.createExportAuthorizationGate(exportPreparationReview, {
    createdAt: "2026-07-10T09:30:00.000Z"
});

const exportPreparationReviewWithNote = DraftWorkspaceManager.addExportPreparationReviewNote(exportPreparationReview, {
    text: "Export preparation review note before authorization gate.",
    author: "Matthias Meiferts",
    category: "export-preparation"
}, {
    createdAt: "2026-07-10T09:31:00.000Z"
});

const approvedExportPreparationReview = DraftWorkspaceManager.approveExportPreparationReview(exportPreparationReviewWithNote, {
    comment: "Approved for controlled authorization gate only.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T09:32:00.000Z"
});

const rejectedExportPreparationReview = DraftWorkspaceManager.rejectExportPreparationReview(exportPreparationReviewWithNote, {
    comment: "Rejected branch remains locked.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T09:33:00.000Z"
});

const readyAuthorizationGate = DraftWorkspaceManager.createExportAuthorizationGate(approvedExportPreparationReview, {
    createdAt: "2026-07-10T09:34:00.000Z"
});

const blockedRejectedAuthorizationGate = DraftWorkspaceManager.createExportAuthorizationGate(rejectedExportPreparationReview, {
    createdAt: "2026-07-10T09:35:00.000Z"
});

assert.equal(exportPreparationGate.status, "export_preparation_review_required");
assert.equal(exportPreparationReview.status, "review_required");
assert.equal(blockedAuthorizationGate.status, "blocked_pending_export_preparation_review");
assert.equal(blockedAuthorizationGate.readiness.exportPreparationReviewCompleted, false);
assert.equal(blockedAuthorizationGate.permissions.canExport, false);
assert.equal(blockedAuthorizationGate.permissions.canCreateClientDocument, false);
assert.equal(blockedAuthorizationGate.permissions.canFinalizeWorkflow, false);

assert.equal(readyAuthorizationGate.status, "export_authorization_required");
assert.equal(readyAuthorizationGate.sourceExportPreparationReviewId, approvedExportPreparationReview.reviewId);
assert.equal(readyAuthorizationGate.sourceExportPreparationGateId, exportPreparationGate.gateId);
assert.equal(readyAuthorizationGate.sourceInternalReviewId, approvedInternalReview.reviewId);
assert.equal(readyAuthorizationGate.sourceGateId, finalizationGate.gateId);
assert.equal(readyAuthorizationGate.sourceReviewId, approvedExpertReview.reviewId);
assert.equal(readyAuthorizationGate.sourceDraftId, workspaceDraft.draftId);
assert.equal(readyAuthorizationGate.readiness.exportPreparationReviewCompleted, true);
assert.equal(readyAuthorizationGate.readiness.exportAuthorizationRequired, true);
assert.equal(readyAuthorizationGate.readiness.exportAuthorizationGranted, false);
assert.equal(readyAuthorizationGate.permissions.canExport, false);
assert.equal(readyAuthorizationGate.permissions.canCreateClientDocument, false);
assert.equal(readyAuthorizationGate.permissions.canFinalizeWorkflow, false);
assert.equal(readyAuthorizationGate.safetyBoundary.exportFileCreated, false);
assert.equal(readyAuthorizationGate.safetyBoundary.reportExported, false);
assert.equal(readyAuthorizationGate.safetyBoundary.clientDocumentCreated, false);
assert.equal(readyAuthorizationGate.safetyBoundary.workflowFinalized, false);

assert.equal(blockedRejectedAuthorizationGate.status, "blocked_pending_export_preparation_review");
assert.equal(blockedRejectedAuthorizationGate.readiness.exportPreparationReviewCompleted, false);
assert.equal(blockedRejectedAuthorizationGate.permissions.canExport, false);
assert.equal(blockedRejectedAuthorizationGate.permissions.canCreateClientDocument, false);
assert.equal(blockedRejectedAuthorizationGate.permissions.canFinalizeWorkflow, false);
assert.equal(blockedRejectedAuthorizationGate.safetyBoundary.exportFileCreated, false);

console.log("Export authorization gate from export preparation review test passed");
console.log(`Blocked authorization gate status: ${blockedAuthorizationGate.status}`);
console.log(`Ready authorization gate status: ${readyAuthorizationGate.status}`);
console.log(`Rejected branch authorization gate status: ${blockedRejectedAuthorizationGate.status}`);
console.log(`Can export: ${readyAuthorizationGate.permissions.canExport}`);
console.log(`Can create client document: ${readyAuthorizationGate.permissions.canCreateClientDocument}`);
console.log(`Can finalize workflow: ${readyAuthorizationGate.permissions.canFinalizeWorkflow}`);
console.log(`Export file created: ${readyAuthorizationGate.safetyBoundary.exportFileCreated}`);
