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
        title: "Report export preparation package model",
        previewOnly: true,
        persisted: false,
        exported: false
    }
}, {
    createdAt: "2026-07-10T11:00:00.000Z"
});

const expertReview = DraftWorkspaceManager.createExpertReview(workspaceDraft, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T11:01:00.000Z"
});

const expertReviewWithNote = DraftWorkspaceManager.addExpertReviewNote(expertReview, {
    text: "Expert note.",
    author: "Matthias Meiferts",
    category: "expert-review"
}, {
    createdAt: "2026-07-10T11:02:00.000Z"
});

const approvedExpertReview = DraftWorkspaceManager.approveExpertReview(expertReviewWithNote, {
    comment: "Expert approved.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T11:03:00.000Z"
});

const finalizationGate = DraftWorkspaceManager.createFinalizationGate(approvedExpertReview, {
    createdAt: "2026-07-10T11:04:00.000Z"
});

const internalReview = DraftWorkspaceManager.createInternalFinalizationReview(finalizationGate, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T11:05:00.000Z"
});

const internalReviewWithNote = DraftWorkspaceManager.addInternalFinalizationReviewNote(internalReview, {
    text: "Internal note.",
    author: "Matthias Meiferts",
    category: "internal-finalization"
}, {
    createdAt: "2026-07-10T11:06:00.000Z"
});

const approvedInternalReview = DraftWorkspaceManager.approveInternalFinalizationReview(internalReviewWithNote, {
    comment: "Internal approved.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T11:07:00.000Z"
});

const exportPreparationGate = DraftWorkspaceManager.createExportPreparationGate(approvedInternalReview, {
    createdAt: "2026-07-10T11:08:00.000Z"
});

const exportPreparationReview = DraftWorkspaceManager.createExportPreparationReview(exportPreparationGate, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T11:09:00.000Z"
});

const exportPreparationReviewWithNote = DraftWorkspaceManager.addExportPreparationReviewNote(exportPreparationReview, {
    text: "Export preparation review note.",
    author: "Matthias Meiferts",
    category: "export-preparation"
}, {
    createdAt: "2026-07-10T11:10:00.000Z"
});

const approvedExportPreparationReview = DraftWorkspaceManager.approveExportPreparationReview(exportPreparationReviewWithNote, {
    comment: "Export preparation approved.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T11:11:00.000Z"
});

const blockedWithoutAuthorizationGate = DraftWorkspaceManager.createReportExportPreparationPackage({}, {
    createdAt: "2026-07-10T11:12:00.000Z"
});

const exportAuthorizationGate = DraftWorkspaceManager.createExportAuthorizationGate(approvedExportPreparationReview, {
    createdAt: "2026-07-10T11:13:00.000Z"
});

const readyReportExportPreparationPackage = DraftWorkspaceManager.createReportExportPreparationPackage(exportAuthorizationGate, {
    createdAt: "2026-07-10T11:14:00.000Z"
});

assert.equal(blockedWithoutAuthorizationGate.status, "blocked_pending_export_authorization_gate");
assert.equal(blockedWithoutAuthorizationGate.readiness.exportAuthorizationGateValidated, false);
assert.equal(blockedWithoutAuthorizationGate.readiness.exportPackagePrepared, false);
assert.equal(blockedWithoutAuthorizationGate.permissions.canExport, false);
assert.equal(blockedWithoutAuthorizationGate.permissions.canCreateClientDocument, false);
assert.equal(blockedWithoutAuthorizationGate.permissions.canFinalizeWorkflow, false);
assert.equal(blockedWithoutAuthorizationGate.safetyBoundary.exportPackagePrepared, false);
assert.equal(blockedWithoutAuthorizationGate.safetyBoundary.exportFileCreated, false);
assert.equal(blockedWithoutAuthorizationGate.safetyBoundary.reportExported, false);
assert.equal(blockedWithoutAuthorizationGate.safetyBoundary.clientDocumentCreated, false);
assert.equal(blockedWithoutAuthorizationGate.safetyBoundary.workflowFinalized, false);

assert.equal(readyReportExportPreparationPackage.packageId, "report_export_preparation_package-report_draft-de-tdd-06-036");
assert.equal(readyReportExportPreparationPackage.packageType, "report_export_preparation_package");
assert.equal(readyReportExportPreparationPackage.sourceExportAuthorizationGateId, "export_authorization_gate-report_draft-de-tdd-06-036");
assert.equal(readyReportExportPreparationPackage.sourceExportPreparationReviewId, "export_preparation_review-report_draft-de-tdd-06-036");
assert.equal(readyReportExportPreparationPackage.sourceDraftId, workspaceDraft.draftId);
assert.equal(readyReportExportPreparationPackage.status, "report_export_preparation_required");

assert.equal(readyReportExportPreparationPackage.readiness.exportAuthorizationGateValidated, true);
assert.equal(readyReportExportPreparationPackage.readiness.reportExportPreparationRequired, true);
assert.equal(readyReportExportPreparationPackage.readiness.metadataOnlyPackage, true);
assert.equal(readyReportExportPreparationPackage.readiness.exportPackagePrepared, true);
assert.equal(readyReportExportPreparationPackage.readiness.exportAllowed, false);
assert.equal(readyReportExportPreparationPackage.readiness.reportExportAllowed, false);
assert.equal(readyReportExportPreparationPackage.readiness.clientDocumentPreparationAllowed, false);
assert.equal(readyReportExportPreparationPackage.readiness.workflowFinalizationAllowed, false);

assert.equal(readyReportExportPreparationPackage.permissions.canExport, false);
assert.equal(readyReportExportPreparationPackage.permissions.canCreateClientDocument, false);
assert.equal(readyReportExportPreparationPackage.permissions.canFinalizeWorkflow, false);

assert.equal(readyReportExportPreparationPackage.safetyBoundary.reportExportPreparationPackagePersisted, false);
assert.equal(readyReportExportPreparationPackage.safetyBoundary.exportAuthorizationGateValidated, true);
assert.equal(readyReportExportPreparationPackage.safetyBoundary.exportPackagePrepared, true);
assert.equal(readyReportExportPreparationPackage.safetyBoundary.exportFileCreated, false);
assert.equal(readyReportExportPreparationPackage.safetyBoundary.reportExported, false);
assert.equal(readyReportExportPreparationPackage.safetyBoundary.clientDocumentCreated, false);
assert.equal(readyReportExportPreparationPackage.safetyBoundary.workflowFinalized, false);

assert.equal(readyReportExportPreparationPackage.exportReadinessChecklist.noBinaryFilesCreated, true);
assert.equal(readyReportExportPreparationPackage.exportReadinessChecklist.noWorkflowFinalization, true);

console.log("Report export preparation package model test passed");
console.log(`Blocked status: ${blockedWithoutAuthorizationGate.status}`);
console.log(`Ready package id: ${readyReportExportPreparationPackage.packageId}`);
console.log(`Ready package status: ${readyReportExportPreparationPackage.status}`);
console.log(`Can export: ${readyReportExportPreparationPackage.permissions.canExport}`);
console.log(`Can create client document: ${readyReportExportPreparationPackage.permissions.canCreateClientDocument}`);
console.log(`Can finalize workflow: ${readyReportExportPreparationPackage.permissions.canFinalizeWorkflow}`);
console.log(`Export file created: ${readyReportExportPreparationPackage.safetyBoundary.exportFileCreated}`);
