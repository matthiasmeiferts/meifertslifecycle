import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import DraftWorkspaceManager from "../portal/core/DraftWorkspaceManager.js";

const pageSource = readFileSync("portal/ui/pages/QuestionCatalogPage.js", "utf8");
const styleSource = readFileSync("portal/ui/styles/workspace.css", "utf8");

assert.ok(pageSource.includes("data-export-preparation-review-preview"));
assert.ok(pageSource.includes("renderExportPreparationReview"));
assert.ok(pageSource.includes("DraftWorkspaceManager.createExportPreparationReview"));
assert.ok(pageSource.includes("DraftWorkspaceManager.addExportPreparationReviewNote"));
assert.ok(pageSource.includes("DraftWorkspaceManager.approveExportPreparationReview"));
assert.ok(pageSource.includes("DraftWorkspaceManager.rejectExportPreparationReview"));

assert.ok(
    pageSource.includes("Export preparation review note required first."),
    "Browser preview must explain why export preparation decisions are locked before note."
);

assert.ok(
    pageSource.includes("Export preparation review only. Export, client document creation and workflow finalization remain locked."),
    "Browser preview must keep export/client/finalization boundary visible."
);

assert.ok(styleSource.includes("Foundation 2.9-C Export Preparation Review Browser Preview"));
assert.ok(styleSource.includes(".export-preparation-review-preview.is-required"));
assert.ok(styleSource.includes(".export-preparation-review-preview.is-approved"));
assert.ok(styleSource.includes(".export-preparation-review-preview.is-rejected"));
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
        title: "Export preparation review regression safety",
        previewOnly: true,
        persisted: false,
        exported: false
    }
}, {
    createdAt: "2026-07-10T07:00:00.000Z"
});

const expertReview = DraftWorkspaceManager.createExpertReview(workspaceDraft, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T07:01:00.000Z"
});

const expertReviewWithNote = DraftWorkspaceManager.addExpertReviewNote(expertReview, {
    text: "Expert note before export preparation review regression safety.",
    author: "Matthias Meiferts",
    category: "expert-review"
}, {
    createdAt: "2026-07-10T07:02:00.000Z"
});

const approvedExpertReview = DraftWorkspaceManager.approveExpertReview(expertReviewWithNote, {
    comment: "Expert approved for internal progression only.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T07:03:00.000Z"
});

const finalizationGate = DraftWorkspaceManager.createFinalizationGate(approvedExpertReview, {
    createdAt: "2026-07-10T07:04:00.000Z"
});

const internalReview = DraftWorkspaceManager.createInternalFinalizationReview(finalizationGate, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T07:05:00.000Z"
});

const internalReviewWithNote = DraftWorkspaceManager.addInternalFinalizationReviewNote(internalReview, {
    text: "Internal note before export preparation review regression safety.",
    author: "Matthias Meiferts",
    category: "internal-finalization"
}, {
    createdAt: "2026-07-10T07:06:00.000Z"
});

const approvedInternalReview = DraftWorkspaceManager.approveInternalFinalizationReview(internalReviewWithNote, {
    comment: "Internally approved for export preparation review only.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T07:07:00.000Z"
});

const readyExportGate = DraftWorkspaceManager.createExportPreparationGate(approvedInternalReview, {
    createdAt: "2026-07-10T07:08:00.000Z"
});

const exportReview = DraftWorkspaceManager.createExportPreparationReview(readyExportGate, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T07:09:00.000Z"
});

assert.equal(exportReview.status, "review_required");
assert.equal(exportReview.notes.length, 0);
assert.equal(exportReview.readiness.exportPreparationGateReady, true);
assert.equal(exportReview.readiness.exportPreparationReviewCompleted, false);
assert.equal(exportReview.permissions.canExport, false);
assert.equal(exportReview.permissions.canCreateClientDocument, false);
assert.equal(exportReview.permissions.canFinalizeWorkflow, false);
assert.equal(exportReview.safetyBoundary.exportPreparationReviewCompleted, false);
assert.equal(exportReview.safetyBoundary.exportPrepared, false);
assert.equal(exportReview.safetyBoundary.exportFileCreated, false);
assert.equal(exportReview.safetyBoundary.reportExported, false);
assert.equal(exportReview.safetyBoundary.clientDocumentCreated, false);
assert.equal(exportReview.safetyBoundary.workflowFinalized, false);

const blockedApprovalWithoutNote = DraftWorkspaceManager.approveExportPreparationReview(exportReview, {
    comment: "Cannot approve without note.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T07:10:00.000Z"
});

const blockedRejectionWithoutNote = DraftWorkspaceManager.rejectExportPreparationReview(exportReview, {
    comment: "Cannot reject without note.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T07:11:00.000Z"
});

assert.equal(blockedApprovalWithoutNote.status, "review_required");
assert.equal(blockedApprovalWithoutNote.decision, null);
assert.equal(blockedApprovalWithoutNote.readiness.exportPreparationReviewCompleted, false);
assert.equal(blockedApprovalWithoutNote.permissions.canExport, false);
assert.equal(blockedApprovalWithoutNote.safetyBoundary.exportFileCreated, false);

assert.equal(blockedRejectionWithoutNote.status, "review_required");
assert.equal(blockedRejectionWithoutNote.decision, null);
assert.equal(blockedRejectionWithoutNote.readiness.exportPreparationReviewCompleted, false);
assert.equal(blockedRejectionWithoutNote.permissions.canCreateClientDocument, false);
assert.equal(blockedRejectionWithoutNote.safetyBoundary.workflowFinalized, false);

const exportReviewWithNote = DraftWorkspaceManager.addExportPreparationReviewNote(exportReview, {
    text: "Export preparation review safety note before decisions.",
    author: "Matthias Meiferts",
    category: "export-preparation-regression"
}, {
    createdAt: "2026-07-10T07:12:00.000Z"
});

assert.equal(exportReviewWithNote.notes.length, 1);
assert.equal(exportReviewWithNote.status, "review_required");

const approvedExportReview = DraftWorkspaceManager.approveExportPreparationReview(exportReviewWithNote, {
    comment: "Approved review branch. Export remains locked.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T07:13:00.000Z"
});

const rejectedExportReview = DraftWorkspaceManager.rejectExportPreparationReview(exportReviewWithNote, {
    comment: "Rejected review branch. Export remains locked.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T07:14:00.000Z"
});

assert.equal(approvedExportReview.status, "approved");
assert.equal(approvedExportReview.decision.decisionType, "approved");
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

assert.equal(rejectedExportReview.status, "rejected");
assert.equal(rejectedExportReview.decision.decisionType, "rejected");
assert.equal(rejectedExportReview.readiness.exportPreparationReviewCompleted, false);
assert.equal(rejectedExportReview.permissions.canExport, false);
assert.equal(rejectedExportReview.permissions.canCreateClientDocument, false);
assert.equal(rejectedExportReview.permissions.canFinalizeWorkflow, false);
assert.equal(rejectedExportReview.safetyBoundary.exportPreparationReviewCompleted, false);
assert.equal(rejectedExportReview.safetyBoundary.exportPrepared, false);
assert.equal(rejectedExportReview.safetyBoundary.exportFileCreated, false);
assert.equal(rejectedExportReview.safetyBoundary.reportExported, false);
assert.equal(rejectedExportReview.safetyBoundary.clientDocumentCreated, false);
assert.equal(rejectedExportReview.safetyBoundary.workflowFinalized, false);

assert.equal(
    approvedExportReview.safetyBoundary.exportPreparationReviewCompleted,
    true,
    "Approved branch must stay completed after rejected branch is created."
);

assert.equal(
    rejectedExportReview.safetyBoundary.exportPreparationReviewCompleted,
    false,
    "Rejected branch must stay incomplete without mutating approved branch."
);

const clone = DraftWorkspaceManager.cloneExportPreparationReview(approvedExportReview);
clone.safetyBoundary.exportFileCreated = true;
assert.equal(approvedExportReview.safetyBoundary.exportFileCreated, false);

console.log("Export preparation review regression safety test passed");
console.log(`Export review status: ${exportReview.status}`);
console.log(`Notes before decision: ${exportReviewWithNote.notes.length}`);
console.log(`Approved export review status: ${approvedExportReview.status}`);
console.log(`Rejected export review status: ${rejectedExportReview.status}`);
console.log(`Approved can export: ${approvedExportReview.permissions.canExport}`);
console.log(`Approved can create client document: ${approvedExportReview.permissions.canCreateClientDocument}`);
console.log(`Approved can finalize workflow: ${approvedExportReview.permissions.canFinalizeWorkflow}`);
console.log("Browser export preparation review governance anchors present: true");
