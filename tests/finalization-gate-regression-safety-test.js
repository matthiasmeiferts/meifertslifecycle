import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import DraftWorkspaceManager from "../portal/core/DraftWorkspaceManager.js";

const pageSource = readFileSync("portal/ui/pages/QuestionCatalogPage.js", "utf8");
const styleSource = readFileSync("portal/ui/styles/workspace.css", "utf8");

assert.ok(pageSource.includes("data-finalization-gate-preview"));
assert.ok(pageSource.includes("renderFinalizationGate"));
assert.ok(pageSource.includes("scrollToFinalizationGate"));
assert.ok(pageSource.includes("finalizationGateNode.scrollIntoView"));

assert.ok(pageSource.includes("data-gate-status"));
assert.ok(pageSource.includes("data-gate-expert-approved"));
assert.ok(pageSource.includes("data-gate-safety"));

assert.ok(styleSource.includes("Foundation 2.6-C Finalization Gate Browser Preview"));
assert.ok(styleSource.includes(".finalization-gate-preview.is-ready"));
assert.ok(styleSource.includes(".finalization-gate-preview.is-blocked"));

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
        title: "Finalization gate regression safety",
        previewOnly: true,
        persisted: false,
        exported: false
    }
}, {
    createdAt: "2026-07-10T02:10:00.000Z"
});

const reviewRequired = DraftWorkspaceManager.createExpertReview(workspaceDraft, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T02:11:00.000Z"
});

const blockedGate = DraftWorkspaceManager.createFinalizationGate(reviewRequired, {
    createdAt: "2026-07-10T02:12:00.000Z"
});

assert.equal(blockedGate.status, "blocked_pending_expert_approval");
assert.equal(blockedGate.readiness.expertReviewApproved, false);
assert.equal(blockedGate.readiness.exportPreparationAllowed, false);
assert.equal(blockedGate.readiness.clientDocumentPreparationAllowed, false);
assert.equal(blockedGate.readiness.workflowFinalizationAllowed, false);

assert.equal(blockedGate.permissions.canExport, false);
assert.equal(blockedGate.permissions.canCreateClientDocument, false);
assert.equal(blockedGate.permissions.canFinalizeWorkflow, false);

assert.equal(blockedGate.safetyBoundary.exportPrepared, false);
assert.equal(blockedGate.safetyBoundary.reportExported, false);
assert.equal(blockedGate.safetyBoundary.clientDocumentCreated, false);
assert.equal(blockedGate.safetyBoundary.workflowFinalized, false);

const reviewed = DraftWorkspaceManager.addExpertReviewNote(reviewRequired, {
    text: "Regression safety note before finalization gate.",
    author: "Matthias Meiferts",
    category: "finalization-gate-regression"
}, {
    createdAt: "2026-07-10T02:13:00.000Z"
});

const approved = DraftWorkspaceManager.approveExpertReview(reviewed, {
    comment: "Approved only for internal finalization gate visibility.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T02:14:00.000Z"
});

const readyGate = DraftWorkspaceManager.createFinalizationGate(approved, {
    createdAt: "2026-07-10T02:15:00.000Z"
});

assert.equal(readyGate.status, "ready_for_internal_finalization_review");
assert.equal(readyGate.readiness.expertReviewApproved, true);
assert.equal(readyGate.readiness.internalFinalizationReviewRequired, true);

assert.equal(readyGate.readiness.exportPreparationAllowed, false);
assert.equal(readyGate.readiness.clientDocumentPreparationAllowed, false);
assert.equal(readyGate.readiness.workflowFinalizationAllowed, false);

assert.equal(readyGate.permissions.canExport, false);
assert.equal(readyGate.permissions.canCreateClientDocument, false);
assert.equal(readyGate.permissions.canFinalizeWorkflow, false);

assert.equal(readyGate.safetyBoundary.finalizationGatePersisted, false);
assert.equal(readyGate.safetyBoundary.internalFinalizationReviewCompleted, false);
assert.equal(readyGate.safetyBoundary.exportPrepared, false);
assert.equal(readyGate.safetyBoundary.reportExported, false);
assert.equal(readyGate.safetyBoundary.clientDocumentCreated, false);
assert.equal(readyGate.safetyBoundary.workflowFinalized, false);

const rejected = DraftWorkspaceManager.rejectExpertReview(reviewed, {
    comment: "Rejected review must keep finalization gate blocked.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T02:16:00.000Z"
});

const rejectedGate = DraftWorkspaceManager.createFinalizationGate(rejected, {
    createdAt: "2026-07-10T02:17:00.000Z"
});

assert.equal(rejectedGate.status, "blocked_pending_expert_approval");
assert.equal(rejectedGate.readiness.expertReviewApproved, false);
assert.equal(rejectedGate.permissions.canExport, false);
assert.equal(rejectedGate.permissions.canCreateClientDocument, false);
assert.equal(rejectedGate.permissions.canFinalizeWorkflow, false);
assert.equal(rejectedGate.safetyBoundary.reportExported, false);
assert.equal(rejectedGate.safetyBoundary.clientDocumentCreated, false);
assert.equal(rejectedGate.safetyBoundary.workflowFinalized, false);

console.log("Finalization gate regression safety test passed");
console.log(`Blocked gate status: ${blockedGate.status}`);
console.log(`Ready gate status: ${readyGate.status}`);
console.log(`Rejected gate status: ${rejectedGate.status}`);
console.log(`Ready gate expert review approved: ${readyGate.readiness.expertReviewApproved}`);
console.log(`Ready gate can export: ${readyGate.permissions.canExport}`);
console.log(`Ready gate can create client document: ${readyGate.permissions.canCreateClientDocument}`);
console.log(`Ready gate can finalize workflow: ${readyGate.permissions.canFinalizeWorkflow}`);
console.log("Browser finalization gate anchors present: true");
