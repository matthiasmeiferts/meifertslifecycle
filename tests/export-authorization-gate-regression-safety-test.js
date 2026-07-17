import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import DraftWorkspaceManager from "../portal/core/DraftWorkspaceManager.js";

const pageSource = readFileSync("portal/ui/pages/QuestionCatalogPage.js", "utf8");
const styleSource = readFileSync("portal/ui/styles/workspace.css", "utf8");
const controllerSource = readFileSync("portal/ui/controllers/ExportWorkflowPreviewController.js", "utf8");
const exportAuthorizationGatePreviewSource = readFileSync("portal/ui/components/ExportAuthorizationGatePreview.js", "utf8");

assert.ok(pageSource.includes("ExportWorkflowPreviewController"));
assert.ok(controllerSource.includes("currentExportAuthorizationGate"));
assert.ok(controllerSource.includes("createExportAuthorizationGate"));
assert.ok(controllerSource.includes("renderExportAuthorizationGate"));
assert.ok(exportAuthorizationGatePreviewSource.includes("export-authorization-gate-preview"));
assert.ok(exportAuthorizationGatePreviewSource.includes("preview.dataset.exportAuthorizationGateCard"));
assert.ok(exportAuthorizationGatePreviewSource.includes("Controlled export authorization gate only."));
assert.ok(exportAuthorizationGatePreviewSource.includes("canExport"));
assert.ok(exportAuthorizationGatePreviewSource.includes("exportFileCreated"));


assert.ok(styleSource.includes("Foundation 3.0-C Controlled Export Authorization Gate Browser Preview"));
assert.ok(styleSource.includes(".export-authorization-gate-preview.is-required"));
assert.ok(styleSource.includes(".export-authorization-gate-preview.is-blocked"));

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
        title: "Export authorization gate regression safety",
        previewOnly: true,
        persisted: false,
        exported: false
    }
}, {
    createdAt: "2026-07-10T09:40:00.000Z"
});

const expertReview = DraftWorkspaceManager.createExpertReview(workspaceDraft, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T09:41:00.000Z"
});

const expertReviewWithNote = DraftWorkspaceManager.addExpertReviewNote(expertReview, {
    text: "Expert note before authorization regression safety.",
    author: "Matthias Meiferts",
    category: "expert-review"
}, {
    createdAt: "2026-07-10T09:42:00.000Z"
});

const approvedExpertReview = DraftWorkspaceManager.approveExpertReview(expertReviewWithNote, {
    comment: "Expert approved.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T09:43:00.000Z"
});

const finalizationGate = DraftWorkspaceManager.createFinalizationGate(approvedExpertReview, {
    createdAt: "2026-07-10T09:44:00.000Z"
});

const internalReview = DraftWorkspaceManager.createInternalFinalizationReview(finalizationGate, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T09:45:00.000Z"
});

const internalReviewWithNote = DraftWorkspaceManager.addInternalFinalizationReviewNote(internalReview, {
    text: "Internal note before authorization regression safety.",
    author: "Matthias Meiferts",
    category: "internal-finalization"
}, {
    createdAt: "2026-07-10T09:46:00.000Z"
});

const approvedInternalReview = DraftWorkspaceManager.approveInternalFinalizationReview(internalReviewWithNote, {
    comment: "Internal approved.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T09:47:00.000Z"
});

const exportPreparationGate = DraftWorkspaceManager.createExportPreparationGate(approvedInternalReview, {
    createdAt: "2026-07-10T09:48:00.000Z"
});

const exportPreparationReview = DraftWorkspaceManager.createExportPreparationReview(exportPreparationGate, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T09:49:00.000Z"
});

const blockedBeforeDecision = DraftWorkspaceManager.createExportAuthorizationGate(exportPreparationReview, {
    createdAt: "2026-07-10T09:50:00.000Z"
});

assert.equal(blockedBeforeDecision.status, "blocked_pending_export_preparation_review");
assert.equal(blockedBeforeDecision.readiness.exportPreparationReviewCompleted, false);
assert.equal(blockedBeforeDecision.permissions.canExport, false);
assert.equal(blockedBeforeDecision.permissions.canCreateClientDocument, false);
assert.equal(blockedBeforeDecision.permissions.canFinalizeWorkflow, false);
assert.equal(blockedBeforeDecision.safetyBoundary.exportFileCreated, false);
assert.equal(blockedBeforeDecision.safetyBoundary.reportExported, false);
assert.equal(blockedBeforeDecision.safetyBoundary.clientDocumentCreated, false);
assert.equal(blockedBeforeDecision.safetyBoundary.workflowFinalized, false);

const exportPreparationReviewWithNote = DraftWorkspaceManager.addExportPreparationReviewNote(exportPreparationReview, {
    text: "Export preparation note before authorization decision branches.",
    author: "Matthias Meiferts",
    category: "export-preparation"
}, {
    createdAt: "2026-07-10T09:51:00.000Z"
});

const approvedExportPreparationReview = DraftWorkspaceManager.approveExportPreparationReview(exportPreparationReviewWithNote, {
    comment: "Approved branch.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T09:52:00.000Z"
});

const rejectedExportPreparationReview = DraftWorkspaceManager.rejectExportPreparationReview(exportPreparationReviewWithNote, {
    comment: "Rejected branch.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T09:53:00.000Z"
});

const approvedAuthorizationGate = DraftWorkspaceManager.createExportAuthorizationGate(approvedExportPreparationReview, {
    createdAt: "2026-07-10T09:54:00.000Z"
});

const rejectedAuthorizationGate = DraftWorkspaceManager.createExportAuthorizationGate(rejectedExportPreparationReview, {
    createdAt: "2026-07-10T09:55:00.000Z"
});

assert.equal(approvedAuthorizationGate.status, "export_authorization_required");
assert.equal(approvedAuthorizationGate.readiness.exportPreparationReviewCompleted, true);
assert.equal(approvedAuthorizationGate.permissions.canExport, false);
assert.equal(approvedAuthorizationGate.permissions.canCreateClientDocument, false);
assert.equal(approvedAuthorizationGate.permissions.canFinalizeWorkflow, false);
assert.equal(approvedAuthorizationGate.safetyBoundary.exportFileCreated, false);
assert.equal(approvedAuthorizationGate.safetyBoundary.reportExported, false);
assert.equal(approvedAuthorizationGate.safetyBoundary.clientDocumentCreated, false);
assert.equal(approvedAuthorizationGate.safetyBoundary.workflowFinalized, false);

assert.equal(rejectedAuthorizationGate.status, "blocked_pending_export_preparation_review");
assert.equal(rejectedAuthorizationGate.readiness.exportPreparationReviewCompleted, false);
assert.equal(rejectedAuthorizationGate.permissions.canExport, false);
assert.equal(rejectedAuthorizationGate.permissions.canCreateClientDocument, false);
assert.equal(rejectedAuthorizationGate.permissions.canFinalizeWorkflow, false);
assert.equal(rejectedAuthorizationGate.safetyBoundary.exportFileCreated, false);

assert.equal(
    approvedAuthorizationGate.status,
    "export_authorization_required",
    "Approved authorization branch must remain required after rejected branch is created."
);

assert.equal(
    rejectedAuthorizationGate.status,
    "blocked_pending_export_preparation_review",
    "Rejected authorization branch must remain blocked without mutating approved branch."
);

console.log("Export authorization gate regression safety test passed");
console.log(`Blocked before decision status: ${blockedBeforeDecision.status}`);
console.log(`Approved authorization status: ${approvedAuthorizationGate.status}`);
console.log(`Rejected authorization status: ${rejectedAuthorizationGate.status}`);
console.log(`Approved can export: ${approvedAuthorizationGate.permissions.canExport}`);
console.log(`Approved can create client document: ${approvedAuthorizationGate.permissions.canCreateClientDocument}`);
console.log(`Approved can finalize workflow: ${approvedAuthorizationGate.permissions.canFinalizeWorkflow}`);
console.log("Browser export authorization gate governance anchors present: true");
