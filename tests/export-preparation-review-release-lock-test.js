import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import DraftWorkspaceManager from "../portal/core/DraftWorkspaceManager.js";

const requiredFiles = [
    "tests/export-preparation-review-model-test.js",
    "tests/export-preparation-review-from-gate-test.js",
    "tests/export-preparation-review-browser-preview-test.js",
    "tests/export-preparation-review-regression-safety-test.js",
    "portal/core/DraftWorkspaceManager.js",
    "portal/ui/pages/QuestionCatalogPage.js",
    "portal/ui/styles/workspace.css"
];

for (const file of requiredFiles) {
    assert.ok(existsSync(file), `Required Foundation 2.9 file missing: ${file}`);
}

const pageSource = readFileSync("portal/ui/pages/QuestionCatalogPage.js", "utf8");
const styleSource = readFileSync("portal/ui/styles/workspace.css", "utf8");
const controllerSource = readFileSync("portal/ui/controllers/ExportWorkflowPreviewController.js", "utf8");
const exportPreparationReviewPreviewSource = readFileSync("portal/ui/components/ExportPreparationReviewPreview.js", "utf8");

assert.ok(pageSource.includes("ExportWorkflowPreviewController"));
assert.ok(controllerSource.includes("currentExportPreparationReview"));
assert.ok(controllerSource.includes("createExportPreparationReview"));
assert.ok(controllerSource.includes("addExportPreparationReviewNote"));
assert.ok(controllerSource.includes("approveExportPreparationReview"));
assert.ok(controllerSource.includes("rejectExportPreparationReview"));
assert.ok(controllerSource.includes("renderExportPreparationReview"));
assert.ok(exportPreparationReviewPreviewSource.includes("export-preparation-review-preview"));
assert.ok(exportPreparationReviewPreviewSource.includes("preview.dataset.exportPreparationReviewCard"));
assert.ok(exportPreparationReviewPreviewSource.includes('"Add export preparation review note"'));
assert.ok(exportPreparationReviewPreviewSource.includes("onApprove"));
assert.ok(exportPreparationReviewPreviewSource.includes("onReject"));
assert.ok(exportPreparationReviewPreviewSource.includes("Export preparation review note required first."));
assert.ok(exportPreparationReviewPreviewSource.includes("Export preparation review only."));
const managerSource = readFileSync("portal/core/DraftWorkspaceManager.js", "utf8");

assert.ok(managerSource.includes("createExportPreparationReview"));
assert.ok(managerSource.includes("approveExportPreparationReview"));
assert.ok(managerSource.includes("rejectExportPreparationReview"));
assert.ok(managerSource.includes("cloneExportPreparationReview"));
assert.ok(managerSource.includes("createExportPreparationReviewSafetyBoundary"));


assert.ok(styleSource.includes("Foundation 2.9-C Export Preparation Review Browser Preview"));
assert.ok(styleSource.includes(".export-preparation-review-preview"));
assert.ok(styleSource.includes(".export-preparation-review-preview__actions"));

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
        title: "Export preparation review release lock",
        previewOnly: true,
        persisted: false,
        exported: false
    }
}, {
    createdAt: "2026-07-10T08:00:00.000Z"
});

const expertReview = DraftWorkspaceManager.createExpertReview(workspaceDraft, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T08:01:00.000Z"
});

const expertReviewWithNote = DraftWorkspaceManager.addExpertReviewNote(expertReview, {
    text: "Expert release lock note.",
    author: "Matthias Meiferts",
    category: "expert-review"
}, {
    createdAt: "2026-07-10T08:02:00.000Z"
});

const approvedExpertReview = DraftWorkspaceManager.approveExpertReview(expertReviewWithNote, {
    comment: "Expert approved for release lock progression.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T08:03:00.000Z"
});

const finalizationGate = DraftWorkspaceManager.createFinalizationGate(approvedExpertReview, {
    createdAt: "2026-07-10T08:04:00.000Z"
});

const internalReview = DraftWorkspaceManager.createInternalFinalizationReview(finalizationGate, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T08:05:00.000Z"
});

const internalReviewWithNote = DraftWorkspaceManager.addInternalFinalizationReviewNote(internalReview, {
    text: "Internal release lock note.",
    author: "Matthias Meiferts",
    category: "internal-finalization"
}, {
    createdAt: "2026-07-10T08:06:00.000Z"
});

const approvedInternalReview = DraftWorkspaceManager.approveInternalFinalizationReview(internalReviewWithNote, {
    comment: "Internal review approved for export preparation review release lock.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T08:07:00.000Z"
});

const exportGate = DraftWorkspaceManager.createExportPreparationGate(approvedInternalReview, {
    createdAt: "2026-07-10T08:08:00.000Z"
});

const exportReview = DraftWorkspaceManager.createExportPreparationReview(exportGate, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T08:09:00.000Z"
});

const exportReviewWithNote = DraftWorkspaceManager.addExportPreparationReviewNote(exportReview, {
    text: "Export preparation review release lock note.",
    author: "Matthias Meiferts",
    category: "export-preparation"
}, {
    createdAt: "2026-07-10T08:10:00.000Z"
});

const approvedExportReview = DraftWorkspaceManager.approveExportPreparationReview(exportReviewWithNote, {
    comment: "Approved export preparation review. Export remains locked.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T08:11:00.000Z"
});

assert.equal(exportGate.status, "export_preparation_review_required");
assert.equal(exportReview.status, "review_required");
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

console.log("Export preparation review release lock test passed");
console.log(`Required files: ${requiredFiles.length}`);
console.log(`Export preparation gate status: ${exportGate.status}`);
console.log(`Export preparation review status: ${approvedExportReview.status}`);
console.log(`Export preparation review completed: ${approvedExportReview.readiness.exportPreparationReviewCompleted}`);
console.log(`Can export: ${approvedExportReview.permissions.canExport}`);
console.log(`Can create client document: ${approvedExportReview.permissions.canCreateClientDocument}`);
console.log(`Can finalize workflow: ${approvedExportReview.permissions.canFinalizeWorkflow}`);
console.log(`Export file created: ${approvedExportReview.safetyBoundary.exportFileCreated}`);
console.log("Foundation 2.9 release lock anchors present: true");
