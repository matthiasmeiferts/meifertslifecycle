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
        title: "Export preparation gate from internal review",
        previewOnly: true,
        persisted: false,
        exported: false
    }
}, {
    createdAt: "2026-07-10T04:40:00.000Z"
});

const expertReview = DraftWorkspaceManager.createExpertReview(workspaceDraft, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T04:41:00.000Z"
});

const expertReviewWithNote = DraftWorkspaceManager.addExpertReviewNote(expertReview, {
    text: "Expert review note before export preparation from internal review.",
    author: "Matthias Meiferts",
    category: "expert-review"
}, {
    createdAt: "2026-07-10T04:42:00.000Z"
});

const approvedExpertReview = DraftWorkspaceManager.approveExpertReview(expertReviewWithNote, {
    comment: "Expert approved. Continue to finalization gate.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T04:43:00.000Z"
});

const finalizationGate = DraftWorkspaceManager.createFinalizationGate(approvedExpertReview, {
    createdAt: "2026-07-10T04:44:00.000Z"
});

const internalReview = DraftWorkspaceManager.createInternalFinalizationReview(finalizationGate, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T04:45:00.000Z"
});

const blockedExportGateBeforeInternalApproval = DraftWorkspaceManager.createExportPreparationGate(internalReview, {
    createdAt: "2026-07-10T04:46:00.000Z"
});

assert.equal(finalizationGate.status, "ready_for_internal_finalization_review");
assert.equal(internalReview.status, "internal_review_required");
assert.equal(blockedExportGateBeforeInternalApproval.status, "blocked_pending_internal_finalization_review");
assert.equal(blockedExportGateBeforeInternalApproval.readiness.internalFinalizationReviewCompleted, false);
assert.equal(blockedExportGateBeforeInternalApproval.permissions.canExport, false);
assert.equal(blockedExportGateBeforeInternalApproval.permissions.canCreateClientDocument, false);
assert.equal(blockedExportGateBeforeInternalApproval.permissions.canFinalizeWorkflow, false);

const internalReviewWithNote = DraftWorkspaceManager.addInternalFinalizationReviewNote(internalReview, {
    text: "Internal finalization note before export preparation.",
    author: "Matthias Meiferts",
    category: "internal-finalization"
}, {
    createdAt: "2026-07-10T04:47:00.000Z"
});

const approvedInternalReview = DraftWorkspaceManager.approveInternalFinalizationReview(internalReviewWithNote, {
    comment: "Internally approved for export preparation gate only.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T04:48:00.000Z"
});

const readyExportGate = DraftWorkspaceManager.createExportPreparationGate(approvedInternalReview, {
    createdAt: "2026-07-10T04:49:00.000Z"
});

assert.equal(approvedInternalReview.status, "internally_approved");
assert.equal(approvedInternalReview.readiness.internalReviewCompleted, true);
assert.equal(approvedInternalReview.safetyBoundary.internalFinalizationReviewCompleted, true);

assert.equal(readyExportGate.gateId, "export_preparation_gate-report_draft-de-tdd-06-036");
assert.equal(readyExportGate.gateType, "export_preparation_gate");
assert.equal(readyExportGate.status, "export_preparation_review_required");
assert.equal(readyExportGate.sourceInternalReviewId, approvedInternalReview.reviewId);
assert.equal(readyExportGate.sourceGateId, finalizationGate.gateId);
assert.equal(readyExportGate.sourceReviewId, approvedExpertReview.reviewId);
assert.equal(readyExportGate.sourceDraftId, workspaceDraft.draftId);

assert.equal(readyExportGate.readiness.internalFinalizationReviewCompleted, true);
assert.equal(readyExportGate.readiness.exportPreparationReviewRequired, true);
assert.equal(readyExportGate.readiness.exportPreparationAllowed, false);
assert.equal(readyExportGate.readiness.reportExportAllowed, false);
assert.equal(readyExportGate.readiness.clientDocumentPreparationAllowed, false);
assert.equal(readyExportGate.readiness.workflowFinalizationAllowed, false);

assert.equal(readyExportGate.permissions.canExport, false);
assert.equal(readyExportGate.permissions.canCreateClientDocument, false);
assert.equal(readyExportGate.permissions.canFinalizeWorkflow, false);

assert.equal(readyExportGate.safetyBoundary.exportPreparationGatePersisted, false);
assert.equal(readyExportGate.safetyBoundary.exportPreparationReviewCompleted, false);
assert.equal(readyExportGate.safetyBoundary.exportPrepared, false);
assert.equal(readyExportGate.safetyBoundary.exportFileCreated, false);
assert.equal(readyExportGate.safetyBoundary.reportExported, false);
assert.equal(readyExportGate.safetyBoundary.clientDocumentCreated, false);
assert.equal(readyExportGate.safetyBoundary.workflowFinalized, false);

console.log("Export preparation gate from internal review test passed");
console.log(`Draft id: ${workspaceDraft.draftId}`);
console.log(`Expert review status: ${approvedExpertReview.status}`);
console.log(`Finalization gate status: ${finalizationGate.status}`);
console.log(`Internal review status: ${approvedInternalReview.status}`);
console.log(`Blocked export gate status: ${blockedExportGateBeforeInternalApproval.status}`);
console.log(`Ready export gate status: ${readyExportGate.status}`);
console.log(`Can export: ${readyExportGate.permissions.canExport}`);
console.log(`Can create client document: ${readyExportGate.permissions.canCreateClientDocument}`);
console.log(`Can finalize workflow: ${readyExportGate.permissions.canFinalizeWorkflow}`);
