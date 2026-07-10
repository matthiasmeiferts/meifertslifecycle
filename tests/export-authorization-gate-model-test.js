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
        title: "Export authorization gate model",
        previewOnly: true,
        persisted: false,
        exported: false
    }
}, {
    createdAt: "2026-07-10T09:00:00.000Z"
});

const expertReview = DraftWorkspaceManager.createExpertReview(workspaceDraft, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T09:01:00.000Z"
});

const expertReviewWithNote = DraftWorkspaceManager.addExpertReviewNote(expertReview, {
    text: "Expert note.",
    author: "Matthias Meiferts",
    category: "expert-review"
}, {
    createdAt: "2026-07-10T09:02:00.000Z"
});

const approvedExpertReview = DraftWorkspaceManager.approveExpertReview(expertReviewWithNote, {
    comment: "Expert approved.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T09:03:00.000Z"
});

const finalizationGate = DraftWorkspaceManager.createFinalizationGate(approvedExpertReview, {
    createdAt: "2026-07-10T09:04:00.000Z"
});

const internalReview = DraftWorkspaceManager.createInternalFinalizationReview(finalizationGate, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T09:05:00.000Z"
});

const internalReviewWithNote = DraftWorkspaceManager.addInternalFinalizationReviewNote(internalReview, {
    text: "Internal note.",
    author: "Matthias Meiferts",
    category: "internal-finalization"
}, {
    createdAt: "2026-07-10T09:06:00.000Z"
});

const approvedInternalReview = DraftWorkspaceManager.approveInternalFinalizationReview(internalReviewWithNote, {
    comment: "Internal approved.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T09:07:00.000Z"
});

const exportPreparationGate = DraftWorkspaceManager.createExportPreparationGate(approvedInternalReview, {
    createdAt: "2026-07-10T09:08:00.000Z"
});

const exportPreparationReview = DraftWorkspaceManager.createExportPreparationReview(exportPreparationGate, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T09:09:00.000Z"
});

const blockedWithoutDecision = DraftWorkspaceManager.createExportAuthorizationGate(exportPreparationReview, {
    createdAt: "2026-07-10T09:10:00.000Z"
});

const exportPreparationReviewWithNote = DraftWorkspaceManager.addExportPreparationReviewNote(exportPreparationReview, {
    text: "Export preparation review note.",
    author: "Matthias Meiferts",
    category: "export-preparation"
}, {
    createdAt: "2026-07-10T09:11:00.000Z"
});

const approvedExportPreparationReview = DraftWorkspaceManager.approveExportPreparationReview(exportPreparationReviewWithNote, {
    comment: "Export preparation approved.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T09:12:00.000Z"
});

const rejectedExportPreparationReview = DraftWorkspaceManager.rejectExportPreparationReview(exportPreparationReviewWithNote, {
    comment: "Export preparation rejected.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T09:13:00.000Z"
});

const readyAuthorizationGate = DraftWorkspaceManager.createExportAuthorizationGate(approvedExportPreparationReview, {
    createdAt: "2026-07-10T09:14:00.000Z"
});

const blockedRejectedAuthorizationGate = DraftWorkspaceManager.createExportAuthorizationGate(rejectedExportPreparationReview, {
    createdAt: "2026-07-10T09:15:00.000Z"
});

assert.equal(blockedWithoutDecision.status, "blocked_pending_export_preparation_review");
assert.equal(blockedWithoutDecision.readiness.exportPreparationReviewCompleted, false);
assert.equal(blockedWithoutDecision.permissions.canExport, false);
assert.equal(blockedWithoutDecision.safetyBoundary.exportFileCreated, false);

assert.equal(readyAuthorizationGate.gateId, "export_authorization_gate-report_draft-de-tdd-06-036");
assert.equal(readyAuthorizationGate.gateType, "export_authorization_gate");
assert.equal(readyAuthorizationGate.sourceExportPreparationReviewId, "export_preparation_review-report_draft-de-tdd-06-036");
assert.equal(readyAuthorizationGate.status, "export_authorization_required");

assert.equal(readyAuthorizationGate.readiness.exportPreparationReviewCompleted, true);
assert.equal(readyAuthorizationGate.readiness.exportAuthorizationRequired, true);
assert.equal(readyAuthorizationGate.readiness.exportAuthorizationGranted, false);
assert.equal(readyAuthorizationGate.readiness.exportAllowed, false);
assert.equal(readyAuthorizationGate.readiness.reportExportAllowed, false);
assert.equal(readyAuthorizationGate.readiness.clientDocumentPreparationAllowed, false);
assert.equal(readyAuthorizationGate.readiness.workflowFinalizationAllowed, false);

assert.equal(readyAuthorizationGate.permissions.canExport, false);
assert.equal(readyAuthorizationGate.permissions.canCreateClientDocument, false);
assert.equal(readyAuthorizationGate.permissions.canFinalizeWorkflow, false);

assert.equal(readyAuthorizationGate.safetyBoundary.exportAuthorizationGatePersisted, false);
assert.equal(readyAuthorizationGate.safetyBoundary.exportAuthorizationCompleted, false);
assert.equal(readyAuthorizationGate.safetyBoundary.exportPrepared, false);
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
assert.equal(blockedRejectedAuthorizationGate.safetyBoundary.reportExported, false);
assert.equal(blockedRejectedAuthorizationGate.safetyBoundary.clientDocumentCreated, false);
assert.equal(blockedRejectedAuthorizationGate.safetyBoundary.workflowFinalized, false);

console.log("Export authorization gate model test passed");
console.log(`Blocked without decision status: ${blockedWithoutDecision.status}`);
console.log(`Ready gate id: ${readyAuthorizationGate.gateId}`);
console.log(`Ready gate status: ${readyAuthorizationGate.status}`);
console.log(`Blocked rejected status: ${blockedRejectedAuthorizationGate.status}`);
console.log(`Can export: ${readyAuthorizationGate.permissions.canExport}`);
console.log(`Can create client document: ${readyAuthorizationGate.permissions.canCreateClientDocument}`);
console.log(`Can finalize workflow: ${readyAuthorizationGate.permissions.canFinalizeWorkflow}`);
console.log(`Export file created: ${readyAuthorizationGate.safetyBoundary.exportFileCreated}`);
