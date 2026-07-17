import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import DraftWorkspaceManager from "../portal/core/DraftWorkspaceManager.js";

const pageSource = readFileSync("portal/ui/pages/QuestionCatalogPage.js", "utf8");
const styleSource = readFileSync("portal/ui/styles/workspace.css", "utf8");
const controllerSource = readFileSync("portal/ui/controllers/ExportWorkflowPreviewController.js", "utf8");
const reportPackagePreviewSource = readFileSync("portal/ui/components/ReportExportPreparationPackagePreview.js", "utf8");

assert.ok(pageSource.includes("ExportWorkflowPreviewController"));
assert.ok(controllerSource.includes("currentReportExportPreparationPackage"));
assert.ok(controllerSource.includes("createReportExportPreparationPackage"));
assert.ok(controllerSource.includes("renderReportExportPreparationPackage"));
assert.ok(reportPackagePreviewSource.includes("report-export-preparation-package-preview"));
assert.ok(reportPackagePreviewSource.includes("preview.dataset.reportExportPreparationPackageCard"));
assert.ok(reportPackagePreviewSource.includes("Preparation package metadata only."));
assert.ok(reportPackagePreviewSource.includes("canExport"));
assert.ok(reportPackagePreviewSource.includes("exportPackagePrepared"));
assert.ok(reportPackagePreviewSource.includes("exportFileCreated"));


assert.ok(styleSource.includes("Foundation 3.1-C Controlled Report Export Preparation Package Browser Preview"));
assert.ok(styleSource.includes(".report-export-preparation-package-preview.is-required"));
assert.ok(styleSource.includes(".report-export-preparation-package-preview.is-blocked"));

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
        title: "Report export preparation package regression safety",
        previewOnly: true,
        persisted: false,
        exported: false
    }
}, {
    createdAt: "2026-07-10T11:40:00.000Z"
});

const expertReview = DraftWorkspaceManager.createExpertReview(workspaceDraft, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T11:41:00.000Z"
});

const expertReviewWithNote = DraftWorkspaceManager.addExpertReviewNote(expertReview, {
    text: "Expert note before package regression safety.",
    author: "Matthias Meiferts",
    category: "expert-review"
}, {
    createdAt: "2026-07-10T11:42:00.000Z"
});

const approvedExpertReview = DraftWorkspaceManager.approveExpertReview(expertReviewWithNote, {
    comment: "Expert approved.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T11:43:00.000Z"
});

const finalizationGate = DraftWorkspaceManager.createFinalizationGate(approvedExpertReview, {
    createdAt: "2026-07-10T11:44:00.000Z"
});

const internalReview = DraftWorkspaceManager.createInternalFinalizationReview(finalizationGate, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T11:45:00.000Z"
});

const internalReviewWithNote = DraftWorkspaceManager.addInternalFinalizationReviewNote(internalReview, {
    text: "Internal note before package regression safety.",
    author: "Matthias Meiferts",
    category: "internal-finalization"
}, {
    createdAt: "2026-07-10T11:46:00.000Z"
});

const approvedInternalReview = DraftWorkspaceManager.approveInternalFinalizationReview(internalReviewWithNote, {
    comment: "Internal approved.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T11:47:00.000Z"
});

const exportPreparationGate = DraftWorkspaceManager.createExportPreparationGate(approvedInternalReview, {
    createdAt: "2026-07-10T11:48:00.000Z"
});

const exportPreparationReview = DraftWorkspaceManager.createExportPreparationReview(exportPreparationGate, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T11:49:00.000Z"
});

const blockedBeforeAuthorization = DraftWorkspaceManager.createReportExportPreparationPackage({}, {
    createdAt: "2026-07-10T11:50:00.000Z"
});

assert.equal(blockedBeforeAuthorization.status, "blocked_pending_export_authorization_gate");
assert.equal(blockedBeforeAuthorization.readiness.exportAuthorizationGateValidated, false);
assert.equal(blockedBeforeAuthorization.permissions.canExport, false);
assert.equal(blockedBeforeAuthorization.permissions.canCreateClientDocument, false);
assert.equal(blockedBeforeAuthorization.permissions.canFinalizeWorkflow, false);
assert.equal(blockedBeforeAuthorization.safetyBoundary.exportPackagePrepared, false);
assert.equal(blockedBeforeAuthorization.safetyBoundary.exportFileCreated, false);
assert.equal(blockedBeforeAuthorization.safetyBoundary.reportExported, false);
assert.equal(blockedBeforeAuthorization.safetyBoundary.clientDocumentCreated, false);
assert.equal(blockedBeforeAuthorization.safetyBoundary.workflowFinalized, false);

const exportPreparationReviewWithNote = DraftWorkspaceManager.addExportPreparationReviewNote(exportPreparationReview, {
    text: "Export preparation note before authorization branch package checks.",
    author: "Matthias Meiferts",
    category: "export-preparation"
}, {
    createdAt: "2026-07-10T11:51:00.000Z"
});

const approvedExportPreparationReview = DraftWorkspaceManager.approveExportPreparationReview(exportPreparationReviewWithNote, {
    comment: "Approved branch.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T11:52:00.000Z"
});

const rejectedExportPreparationReview = DraftWorkspaceManager.rejectExportPreparationReview(exportPreparationReviewWithNote, {
    comment: "Rejected branch.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T11:53:00.000Z"
});

const approvedAuthorizationGate = DraftWorkspaceManager.createExportAuthorizationGate(approvedExportPreparationReview, {
    createdAt: "2026-07-10T11:54:00.000Z"
});

const rejectedAuthorizationGate = DraftWorkspaceManager.createExportAuthorizationGate(rejectedExportPreparationReview, {
    createdAt: "2026-07-10T11:55:00.000Z"
});

const approvedPreparationPackage = DraftWorkspaceManager.createReportExportPreparationPackage(approvedAuthorizationGate, {
    createdAt: "2026-07-10T11:56:00.000Z"
});

const rejectedPreparationPackage = DraftWorkspaceManager.createReportExportPreparationPackage(rejectedAuthorizationGate, {
    createdAt: "2026-07-10T11:57:00.000Z"
});

assert.equal(approvedAuthorizationGate.status, "export_authorization_required");
assert.equal(approvedPreparationPackage.status, "report_export_preparation_required");
assert.equal(approvedPreparationPackage.readiness.exportAuthorizationGateValidated, true);
assert.equal(approvedPreparationPackage.readiness.exportPackagePrepared, true);
assert.equal(approvedPreparationPackage.permissions.canExport, false);
assert.equal(approvedPreparationPackage.permissions.canCreateClientDocument, false);
assert.equal(approvedPreparationPackage.permissions.canFinalizeWorkflow, false);
assert.equal(approvedPreparationPackage.safetyBoundary.exportPackagePrepared, true);
assert.equal(approvedPreparationPackage.safetyBoundary.exportFileCreated, false);
assert.equal(approvedPreparationPackage.safetyBoundary.reportExported, false);
assert.equal(approvedPreparationPackage.safetyBoundary.clientDocumentCreated, false);
assert.equal(approvedPreparationPackage.safetyBoundary.workflowFinalized, false);

assert.equal(rejectedAuthorizationGate.status, "blocked_pending_export_preparation_review");
assert.equal(rejectedPreparationPackage.status, "blocked_pending_export_authorization_gate");
assert.equal(rejectedPreparationPackage.readiness.exportAuthorizationGateValidated, false);
assert.equal(rejectedPreparationPackage.readiness.exportPackagePrepared, false);
assert.equal(rejectedPreparationPackage.permissions.canExport, false);
assert.equal(rejectedPreparationPackage.permissions.canCreateClientDocument, false);
assert.equal(rejectedPreparationPackage.permissions.canFinalizeWorkflow, false);
assert.equal(rejectedPreparationPackage.safetyBoundary.exportPackagePrepared, false);
assert.equal(rejectedPreparationPackage.safetyBoundary.exportFileCreated, false);

assert.equal(
    approvedPreparationPackage.status,
    "report_export_preparation_required",
    "Approved preparation package branch must remain required after blocked branch is created."
);

assert.equal(
    rejectedPreparationPackage.status,
    "blocked_pending_export_authorization_gate",
    "Blocked preparation package branch must remain blocked without mutating required branch."
);

console.log("Report export preparation package regression safety test passed");
console.log(`Blocked before authorization status: ${blockedBeforeAuthorization.status}`);
console.log(`Approved preparation package status: ${approvedPreparationPackage.status}`);
console.log(`Rejected preparation package status: ${rejectedPreparationPackage.status}`);
console.log(`Approved can export: ${approvedPreparationPackage.permissions.canExport}`);
console.log(`Approved can create client document: ${approvedPreparationPackage.permissions.canCreateClientDocument}`);
console.log(`Approved can finalize workflow: ${approvedPreparationPackage.permissions.canFinalizeWorkflow}`);
console.log("Browser report export preparation package governance anchors present: true");
