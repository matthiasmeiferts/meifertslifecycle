import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import DraftWorkspaceManager from "../portal/core/DraftWorkspaceManager.js";

const requiredFiles = [
    "tests/report-export-preparation-package-model-test.js",
    "tests/report-export-preparation-package-from-export-authorization-gate-test.js",
    "tests/report-export-preparation-package-browser-preview-test.js",
    "tests/report-export-preparation-package-regression-safety-test.js",
    "portal/core/DraftWorkspaceManager.js",
    "portal/ui/pages/QuestionCatalogPage.js",
    "portal/ui/styles/workspace.css"
];

for (const file of requiredFiles) {
    assert.ok(existsSync(file), `Required Foundation 3.1 file missing: ${file}`);
}

const managerSource = readFileSync("portal/core/DraftWorkspaceManager.js", "utf8");
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

assert.ok(managerSource.includes("createReportExportPreparationPackage"));
assert.ok(managerSource.includes("createReportExportPreparationPackageId"));
assert.ok(managerSource.includes("createReportExportPreparationPackageSafetyBoundary"));
assert.ok(managerSource.includes("blocked_pending_export_authorization_gate"));
assert.ok(managerSource.includes("report_export_preparation_required"));
assert.ok(managerSource.includes("report_export_preparation_package"));


assert.ok(styleSource.includes("Foundation 3.1-C Controlled Report Export Preparation Package Browser Preview"));
assert.ok(styleSource.includes(".report-export-preparation-package-preview"));
assert.ok(styleSource.includes(".report-export-preparation-package-preview__locks"));

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
        title: "Report export preparation package release lock",
        previewOnly: true,
        persisted: false,
        exported: false
    }
}, {
    createdAt: "2026-07-10T12:00:00.000Z"
});

const expertReview = DraftWorkspaceManager.createExpertReview(workspaceDraft, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T12:01:00.000Z"
});

const expertReviewWithNote = DraftWorkspaceManager.addExpertReviewNote(expertReview, {
    text: "Expert release lock note.",
    author: "Matthias Meiferts",
    category: "expert-review"
}, {
    createdAt: "2026-07-10T12:02:00.000Z"
});

const approvedExpertReview = DraftWorkspaceManager.approveExpertReview(expertReviewWithNote, {
    comment: "Expert approved.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T12:03:00.000Z"
});

const finalizationGate = DraftWorkspaceManager.createFinalizationGate(approvedExpertReview, {
    createdAt: "2026-07-10T12:04:00.000Z"
});

const internalReview = DraftWorkspaceManager.createInternalFinalizationReview(finalizationGate, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T12:05:00.000Z"
});

const internalReviewWithNote = DraftWorkspaceManager.addInternalFinalizationReviewNote(internalReview, {
    text: "Internal release lock note.",
    author: "Matthias Meiferts",
    category: "internal-finalization"
}, {
    createdAt: "2026-07-10T12:06:00.000Z"
});

const approvedInternalReview = DraftWorkspaceManager.approveInternalFinalizationReview(internalReviewWithNote, {
    comment: "Internal approved.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T12:07:00.000Z"
});

const exportPreparationGate = DraftWorkspaceManager.createExportPreparationGate(approvedInternalReview, {
    createdAt: "2026-07-10T12:08:00.000Z"
});

const exportPreparationReview = DraftWorkspaceManager.createExportPreparationReview(exportPreparationGate, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T12:09:00.000Z"
});

const exportPreparationReviewWithNote = DraftWorkspaceManager.addExportPreparationReviewNote(exportPreparationReview, {
    text: "Export preparation release lock note.",
    author: "Matthias Meiferts",
    category: "export-preparation"
}, {
    createdAt: "2026-07-10T12:10:00.000Z"
});

const approvedExportPreparationReview = DraftWorkspaceManager.approveExportPreparationReview(exportPreparationReviewWithNote, {
    comment: "Approved export preparation review. Authorization remains controlled and locked.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T12:11:00.000Z"
});

const exportAuthorizationGate = DraftWorkspaceManager.createExportAuthorizationGate(approvedExportPreparationReview, {
    createdAt: "2026-07-10T12:12:00.000Z"
});

const reportExportPreparationPackage = DraftWorkspaceManager.createReportExportPreparationPackage(exportAuthorizationGate, {
    createdAt: "2026-07-10T12:13:00.000Z"
});

assert.equal(reportExportPreparationPackage.status, "report_export_preparation_required");
assert.equal(reportExportPreparationPackage.packageType, "report_export_preparation_package");
assert.equal(reportExportPreparationPackage.readiness.exportAuthorizationGateValidated, true);
assert.equal(reportExportPreparationPackage.readiness.reportExportPreparationRequired, true);
assert.equal(reportExportPreparationPackage.readiness.exportPackagePrepared, true);
assert.equal(reportExportPreparationPackage.readiness.exportAllowed, false);
assert.equal(reportExportPreparationPackage.readiness.reportExportAllowed, false);
assert.equal(reportExportPreparationPackage.readiness.clientDocumentPreparationAllowed, false);
assert.equal(reportExportPreparationPackage.readiness.workflowFinalizationAllowed, false);

assert.equal(reportExportPreparationPackage.permissions.canExport, false);
assert.equal(reportExportPreparationPackage.permissions.canCreateClientDocument, false);
assert.equal(reportExportPreparationPackage.permissions.canFinalizeWorkflow, false);

assert.equal(reportExportPreparationPackage.safetyBoundary.reportExportPreparationPackagePersisted, false);
assert.equal(reportExportPreparationPackage.safetyBoundary.exportAuthorizationGateValidated, true);
assert.equal(reportExportPreparationPackage.safetyBoundary.exportPackagePrepared, true);
assert.equal(reportExportPreparationPackage.safetyBoundary.exportFileCreated, false);
assert.equal(reportExportPreparationPackage.safetyBoundary.reportExported, false);
assert.equal(reportExportPreparationPackage.safetyBoundary.clientDocumentCreated, false);
assert.equal(reportExportPreparationPackage.safetyBoundary.workflowFinalized, false);

console.log("Report export preparation package release lock test passed");
console.log(`Required files: ${requiredFiles.length}`);
console.log(`Report export preparation package status: ${reportExportPreparationPackage.status}`);
console.log(`Report export preparation package type: ${reportExportPreparationPackage.packageType}`);
console.log(`Can export: ${reportExportPreparationPackage.permissions.canExport}`);
console.log(`Can create client document: ${reportExportPreparationPackage.permissions.canCreateClientDocument}`);
console.log(`Can finalize workflow: ${reportExportPreparationPackage.permissions.canFinalizeWorkflow}`);
console.log(`Export file created: ${reportExportPreparationPackage.safetyBoundary.exportFileCreated}`);
console.log("Foundation 3.1 release lock anchors present: true");
