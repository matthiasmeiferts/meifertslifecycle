import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import DraftWorkspaceManager from "../portal/core/DraftWorkspaceManager.js";

const pageSource = readFileSync("portal/ui/pages/QuestionCatalogPage.js", "utf8");
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
        title: "Export preparation gate regression safety",
        previewOnly: true,
        persisted: false,
        exported: false
    }
}, {
    createdAt: "2026-07-10T05:00:00.000Z"
});

const expertReviewWithoutNote = DraftWorkspaceManager.createExpertReview(workspaceDraft, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T05:01:00.000Z"
});

const blockedFinalizationGate = DraftWorkspaceManager.createFinalizationGate(expertReviewWithoutNote, {
    createdAt: "2026-07-10T05:02:00.000Z"
});

assert.equal(expertReviewWithoutNote.status, "review_required");
assert.equal(expertReviewWithoutNote.notes.length, 0);
assert.equal(blockedFinalizationGate.status, "blocked_pending_expert_approval");
assert.equal(blockedFinalizationGate.readiness.expertReviewApproved, false);
assert.equal(blockedFinalizationGate.permissions.canExport, false);
assert.equal(blockedFinalizationGate.permissions.canCreateClientDocument, false);
assert.equal(blockedFinalizationGate.permissions.canFinalizeWorkflow, false);

const expertReviewWithNote = DraftWorkspaceManager.addExpertReviewNote(expertReviewWithoutNote, {
    text: "Expert review note before approval.",
    author: "Matthias Meiferts",
    category: "expert-review"
}, {
    createdAt: "2026-07-10T05:03:00.000Z"
});

const approvedExpertReview = DraftWorkspaceManager.approveExpertReview(expertReviewWithNote, {
    comment: "Approved after expert review note.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T05:04:00.000Z"
});

const readyFinalizationGate = DraftWorkspaceManager.createFinalizationGate(approvedExpertReview, {
    createdAt: "2026-07-10T05:05:00.000Z"
});

assert.equal(expertReviewWithNote.notes.length, 1);
assert.equal(approvedExpertReview.status, "approved");
assert.equal(approvedExpertReview.safetyBoundary.expertApprovalGranted, true);
assert.equal(readyFinalizationGate.status, "ready_for_internal_finalization_review");

const internalReviewWithoutNote = DraftWorkspaceManager.createInternalFinalizationReview(readyFinalizationGate, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T05:06:00.000Z"
});

const blockedExportGateBeforeInternalApproval = DraftWorkspaceManager.createExportPreparationGate(internalReviewWithoutNote, {
    createdAt: "2026-07-10T05:07:00.000Z"
});

assert.equal(internalReviewWithoutNote.status, "internal_review_required");
assert.equal(internalReviewWithoutNote.notes.length, 0);
assert.equal(blockedExportGateBeforeInternalApproval.status, "blocked_pending_internal_finalization_review");
assert.equal(blockedExportGateBeforeInternalApproval.readiness.internalFinalizationReviewCompleted, false);
assert.equal(blockedExportGateBeforeInternalApproval.permissions.canExport, false);
assert.equal(blockedExportGateBeforeInternalApproval.permissions.canCreateClientDocument, false);
assert.equal(blockedExportGateBeforeInternalApproval.permissions.canFinalizeWorkflow, false);
assert.equal(blockedExportGateBeforeInternalApproval.safetyBoundary.exportFileCreated, false);

const internalReviewWithNote = DraftWorkspaceManager.addInternalFinalizationReviewNote(internalReviewWithoutNote, {
    text: "Internal finalization note before export preparation.",
    author: "Matthias Meiferts",
    category: "internal-finalization"
}, {
    createdAt: "2026-07-10T05:08:00.000Z"
});

const approvedInternalReview = DraftWorkspaceManager.approveInternalFinalizationReview(internalReviewWithNote, {
    comment: "Internally approved after internal note.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T05:09:00.000Z"
});

const rejectedInternalReview = DraftWorkspaceManager.rejectInternalFinalizationReview(internalReviewWithNote, {
    comment: "Rejected branch must not unlock export preparation.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T05:10:00.000Z"
});

const readyExportGate = DraftWorkspaceManager.createExportPreparationGate(approvedInternalReview, {
    createdAt: "2026-07-10T05:11:00.000Z"
});

const blockedExportGateAfterReject = DraftWorkspaceManager.createExportPreparationGate(rejectedInternalReview, {
    createdAt: "2026-07-10T05:12:00.000Z"
});

assert.equal(internalReviewWithNote.notes.length, 1);
assert.equal(approvedInternalReview.status, "internally_approved");
assert.equal(rejectedInternalReview.status, "internally_rejected");

assert.equal(readyExportGate.status, "export_preparation_review_required");
assert.equal(readyExportGate.readiness.internalFinalizationReviewCompleted, true);
assert.equal(readyExportGate.readiness.exportPreparationReviewRequired, true);
assert.equal(readyExportGate.permissions.canExport, false);
assert.equal(readyExportGate.permissions.canCreateClientDocument, false);
assert.equal(readyExportGate.permissions.canFinalizeWorkflow, false);
assert.equal(readyExportGate.safetyBoundary.exportPreparationGatePersisted, false);
assert.equal(readyExportGate.safetyBoundary.exportPreparationReviewCompleted, false);
assert.equal(readyExportGate.safetyBoundary.exportPrepared, false);
assert.equal(readyExportGate.safetyBoundary.exportFileCreated, false);
assert.equal(readyExportGate.safetyBoundary.reportExported, false);
assert.equal(readyExportGate.safetyBoundary.clientDocumentCreated, false);
assert.equal(readyExportGate.safetyBoundary.workflowFinalized, false);

assert.equal(blockedExportGateAfterReject.status, "blocked_pending_internal_finalization_review");
assert.equal(blockedExportGateAfterReject.readiness.internalFinalizationReviewCompleted, false);
assert.equal(blockedExportGateAfterReject.permissions.canExport, false);
assert.equal(blockedExportGateAfterReject.permissions.canCreateClientDocument, false);
assert.equal(blockedExportGateAfterReject.permissions.canFinalizeWorkflow, false);
assert.equal(blockedExportGateAfterReject.safetyBoundary.exportFileCreated, false);

console.log("Export preparation gate regression safety test passed");
console.log(`Expert review notes before approval: ${expertReviewWithNote.notes.length}`);
console.log(`Finalization gate status: ${readyFinalizationGate.status}`);
console.log(`Internal review notes before approval: ${internalReviewWithNote.notes.length}`);
console.log(`Approved internal status: ${approvedInternalReview.status}`);
console.log(`Rejected internal status: ${rejectedInternalReview.status}`);
console.log(`Ready export gate status: ${readyExportGate.status}`);
console.log(`Rejected branch export gate status: ${blockedExportGateAfterReject.status}`);
console.log(`Can export: ${readyExportGate.permissions.canExport}`);
console.log(`Can create client document: ${readyExportGate.permissions.canCreateClientDocument}`);
console.log(`Can finalize workflow: ${readyExportGate.permissions.canFinalizeWorkflow}`);
console.log(`Export file created: ${readyExportGate.safetyBoundary.exportFileCreated}`);
console.log("Expert review and export preparation browser governance anchors present: true");
