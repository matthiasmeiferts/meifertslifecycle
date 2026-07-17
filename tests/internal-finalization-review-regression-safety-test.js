import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import DraftWorkspaceManager from "../portal/core/DraftWorkspaceManager.js";

const pageSource = readFileSync("portal/ui/pages/QuestionCatalogPage.js", "utf8");
const styleSource = readFileSync("portal/ui/styles/workspace.css", "utf8");
const internalReviewPreviewSource = readFileSync("portal/ui/components/InternalFinalizationReviewPreview.js", "utf8");

assert.ok(pageSource.includes("InternalFinalizationReviewPreview"));
assert.ok(pageSource.includes("renderInternalFinalizationReview"));
assert.ok(internalReviewPreviewSource.includes("preview.dataset.internalFinalizationReviewPreview"));
assert.ok(internalReviewPreviewSource.includes('"Add internal note"'));
assert.ok(internalReviewPreviewSource.includes("onApprove"));
assert.ok(internalReviewPreviewSource.includes("onReject"));
assert.ok(internalReviewPreviewSource.includes("Internal finalization note required first."));
assert.ok(internalReviewPreviewSource.includes("canExport"));
assert.ok(internalReviewPreviewSource.includes("canCreateClientDocument"));
assert.ok(internalReviewPreviewSource.includes("canFinalizeWorkflow"));




assert.ok(styleSource.includes("Foundation 2.7-C Internal Finalization Review Browser Preview"));
assert.ok(styleSource.includes(".internal-finalization-review-preview.is-required"));
assert.ok(styleSource.includes(".internal-finalization-review-preview.is-approved"));
assert.ok(styleSource.includes(".internal-finalization-review-preview.is-rejected"));
assert.ok(styleSource.includes(".internal-finalization-review-preview.is-blocked"));

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
        title: "Internal finalization regression safety",
        previewOnly: true,
        persisted: false,
        exported: false
    }
}, {
    createdAt: "2026-07-10T03:40:00.000Z"
});

const expertReview = DraftWorkspaceManager.createExpertReview(workspaceDraft, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T03:41:00.000Z"
});

const blockedGate = DraftWorkspaceManager.createFinalizationGate(expertReview, {
    createdAt: "2026-07-10T03:42:00.000Z"
});

const blockedInternalReview = DraftWorkspaceManager.createInternalFinalizationReview(blockedGate, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T03:43:00.000Z"
});

assert.equal(blockedGate.status, "blocked_pending_expert_approval");
assert.equal(blockedInternalReview.status, "blocked_pending_finalization_gate");
assert.equal(blockedInternalReview.readiness.finalizationGateReady, false);
assert.equal(blockedInternalReview.readiness.internalReviewCompleted, false);
assert.equal(blockedInternalReview.permissions.canExport, false);
assert.equal(blockedInternalReview.permissions.canCreateClientDocument, false);
assert.equal(blockedInternalReview.permissions.canFinalizeWorkflow, false);

const notedExpertReview = DraftWorkspaceManager.addExpertReviewNote(expertReview, {
    text: "Expert review note before internal finalization regression.",
    author: "Matthias Meiferts",
    category: "expert-review"
}, {
    createdAt: "2026-07-10T03:44:00.000Z"
});

const approvedExpertReview = DraftWorkspaceManager.approveExpertReview(notedExpertReview, {
    comment: "Approved for internal finalization regression only.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T03:45:00.000Z"
});

const readyGate = DraftWorkspaceManager.createFinalizationGate(approvedExpertReview, {
    createdAt: "2026-07-10T03:46:00.000Z"
});

const internalReview = DraftWorkspaceManager.createInternalFinalizationReview(readyGate, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T03:47:00.000Z"
});

assert.equal(readyGate.status, "ready_for_internal_finalization_review");
assert.equal(internalReview.status, "internal_review_required");
assert.equal(internalReview.notes.length, 0);
assert.equal(internalReview.readiness.finalizationGateReady, true);
assert.equal(internalReview.readiness.internalReviewCompleted, false);
assert.equal(internalReview.readiness.exportPreparationAllowed, false);
assert.equal(internalReview.readiness.clientDocumentPreparationAllowed, false);
assert.equal(internalReview.readiness.workflowFinalizationAllowed, false);
assert.equal(internalReview.permissions.canExport, false);
assert.equal(internalReview.permissions.canCreateClientDocument, false);
assert.equal(internalReview.permissions.canFinalizeWorkflow, false);

const notedInternalReview = DraftWorkspaceManager.addInternalFinalizationReviewNote(internalReview, {
    text: "Internal finalization regression note.",
    author: "Matthias Meiferts",
    category: "internal-finalization-regression"
}, {
    createdAt: "2026-07-10T03:48:00.000Z"
});

assert.equal(notedInternalReview.notes.length, 1);
assert.equal(notedInternalReview.status, "internal_review_required");
assert.equal(notedInternalReview.readiness.internalReviewCompleted, false);
assert.equal(notedInternalReview.permissions.canExport, false);
assert.equal(notedInternalReview.permissions.canCreateClientDocument, false);
assert.equal(notedInternalReview.permissions.canFinalizeWorkflow, false);

const approvedInternalReview = DraftWorkspaceManager.approveInternalFinalizationReview(notedInternalReview, {
    comment: "Internally approved for regression path only. Export remains locked.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T03:49:00.000Z"
});

assert.equal(approvedInternalReview.status, "internally_approved");
assert.equal(approvedInternalReview.decision.decisionType, "internally_approved");
assert.equal(approvedInternalReview.readiness.internalReviewCompleted, true);
assert.equal(approvedInternalReview.safetyBoundary.internalFinalizationReviewCompleted, true);
assert.equal(approvedInternalReview.readiness.exportPreparationAllowed, false);
assert.equal(approvedInternalReview.readiness.clientDocumentPreparationAllowed, false);
assert.equal(approvedInternalReview.readiness.workflowFinalizationAllowed, false);
assert.equal(approvedInternalReview.permissions.canExport, false);
assert.equal(approvedInternalReview.permissions.canCreateClientDocument, false);
assert.equal(approvedInternalReview.permissions.canFinalizeWorkflow, false);
assert.equal(approvedInternalReview.safetyBoundary.exportPrepared, false);
assert.equal(approvedInternalReview.safetyBoundary.reportExported, false);
assert.equal(approvedInternalReview.safetyBoundary.clientDocumentCreated, false);
assert.equal(approvedInternalReview.safetyBoundary.workflowFinalized, false);

const rejectedInternalReview = DraftWorkspaceManager.rejectInternalFinalizationReview(notedInternalReview, {
    comment: "Internally rejected for regression path. Export remains locked.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T03:50:00.000Z"
});

assert.equal(rejectedInternalReview.status, "internally_rejected");
assert.equal(rejectedInternalReview.decision.decisionType, "internally_rejected");
assert.equal(rejectedInternalReview.readiness.internalReviewCompleted, false);
assert.equal(rejectedInternalReview.safetyBoundary.internalFinalizationReviewCompleted, false);
assert.equal(rejectedInternalReview.permissions.canExport, false);
assert.equal(rejectedInternalReview.permissions.canCreateClientDocument, false);
assert.equal(rejectedInternalReview.permissions.canFinalizeWorkflow, false);
assert.equal(rejectedInternalReview.safetyBoundary.exportPrepared, false);
assert.equal(rejectedInternalReview.safetyBoundary.reportExported, false);
assert.equal(rejectedInternalReview.safetyBoundary.clientDocumentCreated, false);
assert.equal(rejectedInternalReview.safetyBoundary.workflowFinalized, false);

assert.equal(
    approvedInternalReview.safetyBoundary.internalFinalizationReviewCompleted,
    true,
    "Approved internal review branch must remain approved after rejected branch is created."
);

assert.equal(
    rejectedInternalReview.safetyBoundary.internalFinalizationReviewCompleted,
    false,
    "Rejected internal review branch must remain rejected without mutating approved branch."
);

console.log("Internal finalization review regression safety test passed");
console.log(`Blocked internal review: ${blockedInternalReview.status}`);
console.log(`Ready internal review: ${internalReview.status}`);
console.log(`Internal notes before decision: ${notedInternalReview.notes.length}`);
console.log(`Approved internal status: ${approvedInternalReview.status}`);
console.log(`Rejected internal status: ${rejectedInternalReview.status}`);
console.log(`Approved can export: ${approvedInternalReview.permissions.canExport}`);
console.log(`Approved can create client document: ${approvedInternalReview.permissions.canCreateClientDocument}`);
console.log(`Approved can finalize workflow: ${approvedInternalReview.permissions.canFinalizeWorkflow}`);
console.log("Browser internal review governance anchors present: true");
