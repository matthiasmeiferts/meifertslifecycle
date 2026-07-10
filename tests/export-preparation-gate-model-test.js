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
        title: "Export preparation gate model",
        previewOnly: true,
        persisted: false,
        exported: false
    }
}, {
    createdAt: "2026-07-10T04:20:00.000Z"
});

const expertReview = DraftWorkspaceManager.createExpertReview(workspaceDraft, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T04:21:00.000Z"
});

const expertReviewWithNote = DraftWorkspaceManager.addExpertReviewNote(expertReview, {
    text: "Expert review note before export preparation gate.",
    author: "Matthias Meiferts",
    category: "expert-review"
}, {
    createdAt: "2026-07-10T04:22:00.000Z"
});

const approvedExpertReview = DraftWorkspaceManager.approveExpertReview(expertReviewWithNote, {
    comment: "Approved for finalization gate only.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T04:23:00.000Z"
});

const readyFinalizationGate = DraftWorkspaceManager.createFinalizationGate(approvedExpertReview, {
    createdAt: "2026-07-10T04:24:00.000Z"
});

const internalReview = DraftWorkspaceManager.createInternalFinalizationReview(readyFinalizationGate, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T04:25:00.000Z"
});

const blockedExportGate = DraftWorkspaceManager.createExportPreparationGate(internalReview, {
    createdAt: "2026-07-10T04:26:00.000Z"
});

assert.equal(internalReview.status, "internal_review_required");
assert.equal(blockedExportGate.status, "blocked_pending_internal_finalization_review");
assert.equal(blockedExportGate.readiness.internalFinalizationReviewCompleted, false);
assert.equal(blockedExportGate.permissions.canExport, false);
assert.equal(blockedExportGate.permissions.canCreateClientDocument, false);
assert.equal(blockedExportGate.permissions.canFinalizeWorkflow, false);
assert.equal(blockedExportGate.safetyBoundary.exportPrepared, false);
assert.equal(blockedExportGate.safetyBoundary.exportFileCreated, false);
assert.equal(blockedExportGate.safetyBoundary.reportExported, false);
assert.equal(blockedExportGate.safetyBoundary.clientDocumentCreated, false);
assert.equal(blockedExportGate.safetyBoundary.workflowFinalized, false);

const internalReviewWithNote = DraftWorkspaceManager.addInternalFinalizationReviewNote(internalReview, {
    text: "Internal finalization note before export preparation gate.",
    author: "Matthias Meiferts",
    category: "internal-finalization"
}, {
    createdAt: "2026-07-10T04:27:00.000Z"
});

const approvedInternalReview = DraftWorkspaceManager.approveInternalFinalizationReview(internalReviewWithNote, {
    comment: "Internally approved. Export preparation gate only.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T04:28:00.000Z"
});

const readyExportGate = DraftWorkspaceManager.createExportPreparationGate(approvedInternalReview, {
    createdAt: "2026-07-10T04:29:00.000Z"
});

assert.equal(readyExportGate.gateId, "export_preparation_gate-report_draft-de-tdd-06-036");
assert.equal(readyExportGate.gateType, "export_preparation_gate");
assert.equal(readyExportGate.sourceInternalReviewId, "internal_finalization_review-report_draft-de-tdd-06-036");
assert.equal(readyExportGate.status, "export_preparation_review_required");

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

console.log("Export preparation gate model test passed");
console.log(`Blocked export gate status: ${blockedExportGate.status}`);
console.log(`Ready export gate id: ${readyExportGate.gateId}`);
console.log(`Ready export gate status: ${readyExportGate.status}`);
console.log(`Can export: ${readyExportGate.permissions.canExport}`);
console.log(`Can create client document: ${readyExportGate.permissions.canCreateClientDocument}`);
console.log(`Can finalize workflow: ${readyExportGate.permissions.canFinalizeWorkflow}`);
console.log(`Export file created: ${readyExportGate.safetyBoundary.exportFileCreated}`);
