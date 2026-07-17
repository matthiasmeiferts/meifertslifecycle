import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import DraftWorkspaceManager from "../portal/core/DraftWorkspaceManager.js";

const requiredFiles = [
    "tests/export-preparation-gate-model-test.js",
    "tests/export-preparation-gate-from-internal-review-test.js",
    "tests/export-preparation-gate-browser-preview-test.js",
    "tests/export-preparation-gate-regression-safety-test.js",
    "scripts/run-foundation-2-8-tests.sh"
];

for (const file of requiredFiles) {
    assert.ok(existsSync(file), `${file} must exist before Export Preparation Gate release lock.`);
}

const managerSource = readFileSync("portal/core/DraftWorkspaceManager.js", "utf8");
const pageSource = readFileSync("portal/ui/pages/QuestionCatalogPage.js", "utf8");
const styleSource = readFileSync("portal/ui/styles/workspace.css", "utf8");
const controllerSource = readFileSync("portal/ui/controllers/ExportWorkflowPreviewController.js", "utf8");
const exportPreparationGatePreviewSource = readFileSync("portal/ui/components/ExportPreparationGatePreview.js", "utf8");
const expertReviewPreviewSource = readFileSync("portal/ui/components/ExpertReviewPreview.js", "utf8");

assert.ok(pageSource.includes("ExportWorkflowPreviewController"));
assert.ok(controllerSource.includes("currentExportPreparationGate"));
assert.ok(controllerSource.includes("createExportPreparationGate"));
assert.ok(controllerSource.includes("ExportPreparationGatePreview.create"));
assert.ok(exportPreparationGatePreviewSource.includes("export-preparation-gate-preview"));
assert.ok(exportPreparationGatePreviewSource.includes("preview.dataset.exportPreparationGateCard"));
assert.ok(exportPreparationGatePreviewSource.includes("Export preparation only."));
assert.ok(exportPreparationGatePreviewSource.includes("exportFileCreated"));
assert.ok(expertReviewPreviewSource.includes("Expert review note required first."));
const runnerSource = readFileSync("scripts/run-foundation-2-8-tests.sh", "utf8");

assert.ok(managerSource.includes("createExportPreparationGate"));
assert.ok(managerSource.includes("createExportPreparationGateId"));
assert.ok(managerSource.includes("createExportPreparationGateSafetyBoundary"));
assert.ok(managerSource.includes("blocked_pending_internal_finalization_review"));
assert.ok(managerSource.includes("export_preparation_review_required"));


assert.ok(styleSource.includes("Foundation 2.8-C Export Preparation Gate Browser Preview"));
assert.ok(styleSource.includes(".export-preparation-gate-preview"));
assert.ok(styleSource.includes(".export-preparation-gate-preview.is-required"));
assert.ok(styleSource.includes(".export-preparation-gate-preview__locks"));

assert.ok(runnerSource.includes("export-preparation-gate-release-lock-test.js"));
assert.ok(runnerSource.includes("export-preparation-gate-regression-safety-test.js"));
assert.ok(runnerSource.includes("Foundation 2.8 test suite passed."));

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
        title: "Export preparation gate release lock",
        previewOnly: true,
        persisted: false,
        exported: false
    }
}, {
    createdAt: "2026-07-10T05:20:00.000Z"
});

const expertReview = DraftWorkspaceManager.createExpertReview(workspaceDraft, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T05:21:00.000Z"
});

const expertReviewWithNote = DraftWorkspaceManager.addExpertReviewNote(expertReview, {
    text: "Expert release lock note.",
    author: "Matthias Meiferts",
    category: "expert-review"
}, {
    createdAt: "2026-07-10T05:22:00.000Z"
});

const approvedExpertReview = DraftWorkspaceManager.approveExpertReview(expertReviewWithNote, {
    comment: "Expert approved for release lock.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T05:23:00.000Z"
});

const finalizationGate = DraftWorkspaceManager.createFinalizationGate(approvedExpertReview, {
    createdAt: "2026-07-10T05:24:00.000Z"
});

const internalReview = DraftWorkspaceManager.createInternalFinalizationReview(finalizationGate, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T05:25:00.000Z"
});

const internalReviewWithNote = DraftWorkspaceManager.addInternalFinalizationReviewNote(internalReview, {
    text: "Internal release lock note.",
    author: "Matthias Meiferts",
    category: "internal-finalization"
}, {
    createdAt: "2026-07-10T05:26:00.000Z"
});

const approvedInternalReview = DraftWorkspaceManager.approveInternalFinalizationReview(internalReviewWithNote, {
    comment: "Internally approved for export preparation release lock only.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T05:27:00.000Z"
});

const exportPreparationGate = DraftWorkspaceManager.createExportPreparationGate(approvedInternalReview, {
    createdAt: "2026-07-10T05:28:00.000Z"
});

assert.equal(finalizationGate.status, "ready_for_internal_finalization_review");
assert.equal(approvedInternalReview.status, "internally_approved");
assert.equal(exportPreparationGate.status, "export_preparation_review_required");

assert.equal(exportPreparationGate.readiness.internalFinalizationReviewCompleted, true);
assert.equal(exportPreparationGate.readiness.exportPreparationReviewRequired, true);
assert.equal(exportPreparationGate.readiness.exportPreparationAllowed, false);
assert.equal(exportPreparationGate.readiness.reportExportAllowed, false);
assert.equal(exportPreparationGate.readiness.clientDocumentPreparationAllowed, false);
assert.equal(exportPreparationGate.readiness.workflowFinalizationAllowed, false);

assert.equal(exportPreparationGate.permissions.canExport, false);
assert.equal(exportPreparationGate.permissions.canCreateClientDocument, false);
assert.equal(exportPreparationGate.permissions.canFinalizeWorkflow, false);

assert.equal(exportPreparationGate.safetyBoundary.exportPreparationGatePersisted, false);
assert.equal(exportPreparationGate.safetyBoundary.exportPreparationReviewCompleted, false);
assert.equal(exportPreparationGate.safetyBoundary.exportPrepared, false);
assert.equal(exportPreparationGate.safetyBoundary.exportFileCreated, false);
assert.equal(exportPreparationGate.safetyBoundary.reportExported, false);
assert.equal(exportPreparationGate.safetyBoundary.clientDocumentCreated, false);
assert.equal(exportPreparationGate.safetyBoundary.workflowFinalized, false);

console.log("Export preparation gate release lock test passed");
console.log(`Required files: ${requiredFiles.length}`);
console.log(`Finalization gate status: ${finalizationGate.status}`);
console.log(`Internal review status: ${approvedInternalReview.status}`);
console.log(`Export preparation gate status: ${exportPreparationGate.status}`);
console.log(`Can export: ${exportPreparationGate.permissions.canExport}`);
console.log(`Can create client document: ${exportPreparationGate.permissions.canCreateClientDocument}`);
console.log(`Can finalize workflow: ${exportPreparationGate.permissions.canFinalizeWorkflow}`);
console.log(`Export file created: ${exportPreparationGate.safetyBoundary.exportFileCreated}`);
console.log("Foundation 2.8 release lock anchors present: true");
