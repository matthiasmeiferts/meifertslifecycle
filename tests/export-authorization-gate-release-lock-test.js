import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import DraftWorkspaceManager from "../portal/core/DraftWorkspaceManager.js";

const requiredFiles = [
    "tests/export-authorization-gate-model-test.js",
    "tests/export-authorization-gate-from-export-preparation-review-test.js",
    "tests/export-authorization-gate-browser-preview-test.js",
    "tests/export-authorization-gate-regression-safety-test.js",
    "portal/core/DraftWorkspaceManager.js",
    "portal/ui/pages/QuestionCatalogPage.js",
    "portal/ui/styles/workspace.css"
];

for (const file of requiredFiles) {
    assert.ok(existsSync(file), `Required Foundation 3.0 file missing: ${file}`);
}

const managerSource = readFileSync("portal/core/DraftWorkspaceManager.js", "utf8");
const pageSource = readFileSync("portal/ui/pages/QuestionCatalogPage.js", "utf8");
const styleSource = readFileSync("portal/ui/styles/workspace.css", "utf8");

assert.ok(managerSource.includes("createExportAuthorizationGate"));
assert.ok(managerSource.includes("createExportAuthorizationGateId"));
assert.ok(managerSource.includes("createExportAuthorizationGateSafetyBoundary"));
assert.ok(managerSource.includes("blocked_pending_export_preparation_review"));
assert.ok(managerSource.includes("export_authorization_required"));

assert.ok(pageSource.includes("data-export-authorization-gate-preview"));
assert.ok(pageSource.includes("data-export-authorization-gate-card"));
assert.ok(pageSource.includes("renderExportAuthorizationGate"));
assert.ok(pageSource.includes("DraftWorkspaceManager.createExportAuthorizationGate(currentExportPreparationReview"));
assert.ok(pageSource.includes("Controlled export authorization gate only. Export, client document creation and workflow finalization remain locked."));

assert.ok(styleSource.includes("Foundation 3.0-C Controlled Export Authorization Gate Browser Preview"));
assert.ok(styleSource.includes(".export-authorization-gate-preview"));
assert.ok(styleSource.includes(".export-authorization-gate-preview__locks"));

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
        title: "Export authorization gate release lock",
        previewOnly: true,
        persisted: false,
        exported: false
    }
}, {
    createdAt: "2026-07-10T10:00:00.000Z"
});

const expertReview = DraftWorkspaceManager.createExpertReview(workspaceDraft, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T10:01:00.000Z"
});

const expertReviewWithNote = DraftWorkspaceManager.addExpertReviewNote(expertReview, {
    text: "Expert release lock note.",
    author: "Matthias Meiferts",
    category: "expert-review"
}, {
    createdAt: "2026-07-10T10:02:00.000Z"
});

const approvedExpertReview = DraftWorkspaceManager.approveExpertReview(expertReviewWithNote, {
    comment: "Expert approved.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T10:03:00.000Z"
});

const finalizationGate = DraftWorkspaceManager.createFinalizationGate(approvedExpertReview, {
    createdAt: "2026-07-10T10:04:00.000Z"
});

const internalReview = DraftWorkspaceManager.createInternalFinalizationReview(finalizationGate, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T10:05:00.000Z"
});

const internalReviewWithNote = DraftWorkspaceManager.addInternalFinalizationReviewNote(internalReview, {
    text: "Internal release lock note.",
    author: "Matthias Meiferts",
    category: "internal-finalization"
}, {
    createdAt: "2026-07-10T10:06:00.000Z"
});

const approvedInternalReview = DraftWorkspaceManager.approveInternalFinalizationReview(internalReviewWithNote, {
    comment: "Internal approved.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T10:07:00.000Z"
});

const exportPreparationGate = DraftWorkspaceManager.createExportPreparationGate(approvedInternalReview, {
    createdAt: "2026-07-10T10:08:00.000Z"
});

const exportPreparationReview = DraftWorkspaceManager.createExportPreparationReview(exportPreparationGate, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T10:09:00.000Z"
});

const exportPreparationReviewWithNote = DraftWorkspaceManager.addExportPreparationReviewNote(exportPreparationReview, {
    text: "Export preparation release lock note.",
    author: "Matthias Meiferts",
    category: "export-preparation"
}, {
    createdAt: "2026-07-10T10:10:00.000Z"
});

const approvedExportPreparationReview = DraftWorkspaceManager.approveExportPreparationReview(exportPreparationReviewWithNote, {
    comment: "Approved export preparation review. Authorization remains controlled and locked.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T10:11:00.000Z"
});

const exportAuthorizationGate = DraftWorkspaceManager.createExportAuthorizationGate(approvedExportPreparationReview, {
    createdAt: "2026-07-10T10:12:00.000Z"
});

assert.equal(exportAuthorizationGate.status, "export_authorization_required");
assert.equal(exportAuthorizationGate.readiness.exportPreparationReviewCompleted, true);
assert.equal(exportAuthorizationGate.readiness.exportAuthorizationRequired, true);
assert.equal(exportAuthorizationGate.readiness.exportAuthorizationGranted, false);
assert.equal(exportAuthorizationGate.readiness.exportAllowed, false);
assert.equal(exportAuthorizationGate.readiness.reportExportAllowed, false);
assert.equal(exportAuthorizationGate.readiness.clientDocumentPreparationAllowed, false);
assert.equal(exportAuthorizationGate.readiness.workflowFinalizationAllowed, false);

assert.equal(exportAuthorizationGate.permissions.canExport, false);
assert.equal(exportAuthorizationGate.permissions.canCreateClientDocument, false);
assert.equal(exportAuthorizationGate.permissions.canFinalizeWorkflow, false);

assert.equal(exportAuthorizationGate.safetyBoundary.exportAuthorizationGatePersisted, false);
assert.equal(exportAuthorizationGate.safetyBoundary.exportAuthorizationCompleted, false);
assert.equal(exportAuthorizationGate.safetyBoundary.exportPrepared, false);
assert.equal(exportAuthorizationGate.safetyBoundary.exportFileCreated, false);
assert.equal(exportAuthorizationGate.safetyBoundary.reportExported, false);
assert.equal(exportAuthorizationGate.safetyBoundary.clientDocumentCreated, false);
assert.equal(exportAuthorizationGate.safetyBoundary.workflowFinalized, false);

console.log("Export authorization gate release lock test passed");
console.log(`Required files: ${requiredFiles.length}`);
console.log(`Export authorization gate status: ${exportAuthorizationGate.status}`);
console.log(`Export authorization required: ${exportAuthorizationGate.readiness.exportAuthorizationRequired}`);
console.log(`Can export: ${exportAuthorizationGate.permissions.canExport}`);
console.log(`Can create client document: ${exportAuthorizationGate.permissions.canCreateClientDocument}`);
console.log(`Can finalize workflow: ${exportAuthorizationGate.permissions.canFinalizeWorkflow}`);
console.log(`Export file created: ${exportAuthorizationGate.safetyBoundary.exportFileCreated}`);
console.log("Foundation 3.0 release lock anchors present: true");
