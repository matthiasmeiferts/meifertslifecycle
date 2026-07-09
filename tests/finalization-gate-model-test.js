import assert from "node:assert/strict";
import DraftWorkspaceManager from "../portal/core/DraftWorkspaceManager.js";

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
        title: "Finalization gate report draft",
        previewOnly: true,
        persisted: false,
        exported: false
    }
}, {
    createdAt: "2026-07-10T01:20:00.000Z"
});

const review = DraftWorkspaceManager.createExpertReview(workspaceDraft, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T01:21:00.000Z"
});

const blockedGate = DraftWorkspaceManager.createFinalizationGate(review, {
    createdAt: "2026-07-10T01:22:00.000Z"
});

assert.equal(blockedGate.status, "blocked_pending_expert_approval");
assert.equal(blockedGate.readiness.expertReviewApproved, false);
assert.equal(blockedGate.permissions.canExport, false);
assert.equal(blockedGate.permissions.canCreateClientDocument, false);
assert.equal(blockedGate.permissions.canFinalizeWorkflow, false);
assert.equal(blockedGate.safetyBoundary.reportExported, false);
assert.equal(blockedGate.safetyBoundary.clientDocumentCreated, false);
assert.equal(blockedGate.safetyBoundary.workflowFinalized, false);

const reviewed = DraftWorkspaceManager.addExpertReviewNote(review, {
    text: "Finalization gate readiness reviewed.",
    author: "Matthias Meiferts",
    category: "finalization-gate"
}, {
    createdAt: "2026-07-10T01:23:00.000Z"
});

const approved = DraftWorkspaceManager.approveExpertReview(reviewed, {
    comment: "Approved for internal finalization gate only.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T01:24:00.000Z"
});

const readyGate = DraftWorkspaceManager.createFinalizationGate(approved, {
    createdAt: "2026-07-10T01:25:00.000Z"
});

assert.equal(readyGate.gateId, "finalization_gate-report_draft-de-tdd-06-036");
assert.equal(readyGate.gateType, "controlled_finalization_gate");
assert.equal(readyGate.sourceReviewId, "expert_review-report_draft-de-tdd-06-036");
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

console.log("Finalization gate model test passed");
console.log(`Blocked gate status: ${blockedGate.status}`);
console.log(`Ready gate id: ${readyGate.gateId}`);
console.log(`Ready gate status: ${readyGate.status}`);
console.log(`Can export: ${readyGate.permissions.canExport}`);
console.log(`Can create client document: ${readyGate.permissions.canCreateClientDocument}`);
console.log(`Can finalize workflow: ${readyGate.permissions.canFinalizeWorkflow}`);
