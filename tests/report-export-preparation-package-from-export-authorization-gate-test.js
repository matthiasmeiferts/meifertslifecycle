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
        title: "Report export preparation package from export authorization gate",
        previewOnly: true,
        persisted: false,
        exported: false
    }
}, {
    createdAt: "2026-07-10T11:20:00.000Z"
});

const expertReview = DraftWorkspaceManager.createExpertReview(workspaceDraft, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T11:21:00.000Z"
});

const expertReviewWithNote = DraftWorkspaceManager.addExpertReviewNote(expertReview, {
    text: "Expert note before package gate test.",
    author: "Matthias Meiferts",
    category: "expert-review"
}, {
    createdAt: "2026-07-10T11:22:00.000Z"
});

const approvedExpertReview = DraftWorkspaceManager.approveExpertReview(expertReviewWithNote, {
    comment: "Expert approved.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T11:23:00.000Z"
});

const finalizationGate = DraftWorkspaceManager.createFinalizationGate(approvedExpertReview, {
    createdAt: "2026-07-10T11:24:00.000Z"
});

const internalReview = DraftWorkspaceManager.createInternalFinalizationReview(finalizationGate, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T11:25:00.000Z"
});

const internalReviewWithNote = DraftWorkspaceManager.addInternalFinalizationReviewNote(internalReview, {
    text: "Internal note before package gate test.",
    author: "Matthias Meiferts",
    category: "internal-finalization"
}, {
    createdAt: "2026-07-10T11:26:00.000Z"
});

const approvedInternalReview = DraftWorkspaceManager.approveInternalFinalizationReview(internalReviewWithNote, {
    comment: "Internal approved.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T11:27:00.000Z"
});

const exportPreparationGate = DraftWorkspaceManager.createExportPreparationGate(approvedInternalReview, {
    createdAt: "2026-07-10T11:28:00.000Z"
});

const exportPreparationReview = DraftWorkspaceManager.createExportPreparationReview(exportPreparationGate, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T11:29:00.000Z"
});

const blockedAuthorizationGate = DraftWorkspaceManager.createExportAuthorizationGate(exportPreparationReview, {
    createdAt: "2026-07-10T11:30:00.000Z"
});

const blockedPreparationPackage = DraftWorkspaceManager.createReportExportPreparationPackage(blockedAuthorizationGate, {
    createdAt: "2026-07-10T11:31:00.000Z"
});

const exportPreparationReviewWithNote = DraftWorkspaceManager.addExportPreparationReviewNote(exportPreparationReview, {
    text: "Export preparation review note before authorization gate.",
    author: "Matthias Meiferts",
    category: "export-preparation"
}, {
    createdAt: "2026-07-10T11:32:00.000Z"
});

const approvedExportPreparationReview = DraftWorkspaceManager.approveExportPreparationReview(exportPreparationReviewWithNote, {
    comment: "Approved for controlled report export preparation only.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T11:33:00.000Z"
});

const readyAuthorizationGate = DraftWorkspaceManager.createExportAuthorizationGate(approvedExportPreparationReview, {
    createdAt: "2026-07-10T11:34:00.000Z"
});

const readyPreparationPackage = DraftWorkspaceManager.createReportExportPreparationPackage(readyAuthorizationGate, {
    createdAt: "2026-07-10T11:35:00.000Z"
});

const invalidAuthorizationGate = {
    ...readyAuthorizationGate,
    gateType: "invalid_gate_type"
};

const blockedInvalidPreparationPackage = DraftWorkspaceManager.createReportExportPreparationPackage(invalidAuthorizationGate, {
    createdAt: "2026-07-10T11:36:00.000Z"
});

assert.equal(blockedAuthorizationGate.status, "blocked_pending_export_preparation_review");
assert.equal(blockedPreparationPackage.status, "blocked_pending_export_authorization_gate");
assert.equal(blockedPreparationPackage.readiness.exportAuthorizationGateValidated, false);
assert.equal(blockedPreparationPackage.readiness.exportPackagePrepared, false);
assert.equal(blockedPreparationPackage.permissions.canExport, false);
assert.equal(blockedPreparationPackage.permissions.canCreateClientDocument, false);
assert.equal(blockedPreparationPackage.permissions.canFinalizeWorkflow, false);

assert.equal(readyAuthorizationGate.status, "export_authorization_required");
assert.equal(readyPreparationPackage.status, "report_export_preparation_required");
assert.equal(readyPreparationPackage.sourceExportAuthorizationGateId, readyAuthorizationGate.gateId);
assert.equal(readyPreparationPackage.sourceExportPreparationReviewId, approvedExportPreparationReview.reviewId);
assert.equal(readyPreparationPackage.sourceDraftId, workspaceDraft.draftId);
assert.equal(readyPreparationPackage.readiness.exportAuthorizationGateValidated, true);
assert.equal(readyPreparationPackage.readiness.exportPackagePrepared, true);
assert.equal(readyPreparationPackage.permissions.canExport, false);
assert.equal(readyPreparationPackage.permissions.canCreateClientDocument, false);
assert.equal(readyPreparationPackage.permissions.canFinalizeWorkflow, false);
assert.equal(readyPreparationPackage.safetyBoundary.exportPackagePrepared, true);
assert.equal(readyPreparationPackage.safetyBoundary.exportFileCreated, false);
assert.equal(readyPreparationPackage.safetyBoundary.reportExported, false);
assert.equal(readyPreparationPackage.safetyBoundary.clientDocumentCreated, false);
assert.equal(readyPreparationPackage.safetyBoundary.workflowFinalized, false);

assert.equal(blockedInvalidPreparationPackage.status, "blocked_pending_export_authorization_gate");
assert.equal(blockedInvalidPreparationPackage.readiness.exportAuthorizationGateValidated, false);
assert.equal(blockedInvalidPreparationPackage.readiness.exportPackagePrepared, false);
assert.equal(blockedInvalidPreparationPackage.permissions.canExport, false);
assert.equal(blockedInvalidPreparationPackage.permissions.canCreateClientDocument, false);
assert.equal(blockedInvalidPreparationPackage.permissions.canFinalizeWorkflow, false);

console.log("Report export preparation package from export authorization gate test passed");
console.log(`Blocked preparation package status: ${blockedPreparationPackage.status}`);
console.log(`Ready preparation package status: ${readyPreparationPackage.status}`);
console.log(`Invalid gate package status: ${blockedInvalidPreparationPackage.status}`);
console.log(`Can export: ${readyPreparationPackage.permissions.canExport}`);
console.log(`Can create client document: ${readyPreparationPackage.permissions.canCreateClientDocument}`);
console.log(`Can finalize workflow: ${readyPreparationPackage.permissions.canFinalizeWorkflow}`);
console.log(`Export file created: ${readyPreparationPackage.safetyBoundary.exportFileCreated}`);
