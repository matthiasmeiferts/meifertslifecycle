import assert from "node:assert/strict";
import DraftWorkspaceManager from "../portal/core/DraftWorkspaceManager.js";

const reportWorkspaceDraft = DraftWorkspaceManager.createDraftRecord({
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
        title: "Report draft · DE-TDD-06-036",
        previewOnly: true,
        persisted: false,
        exported: false
    }
}, {
    createdAt: "2026-07-10T00:20:00.000Z"
});

assert.equal(reportWorkspaceDraft.permissions.requiresExpertApproval, true);
assert.equal(reportWorkspaceDraft.permissions.canExport, false);
assert.equal(reportWorkspaceDraft.permissions.canCreateClientDocument, false);
assert.equal(reportWorkspaceDraft.permissions.canFinalizeWorkflow, false);
assert.equal(reportWorkspaceDraft.safetyBoundary.expertApprovalGranted, false);

const review = DraftWorkspaceManager.createExpertReview(reportWorkspaceDraft, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T00:21:00.000Z"
});

assert.equal(review.status, "review_required");
assert.equal(review.decision, null);
assert.equal(review.notes.length, 0);
assert.equal(review.safetyBoundary.expertApprovalGranted, false);
assert.equal(review.permissions.canExport, false);
assert.equal(review.permissions.canCreateClientDocument, false);
assert.equal(review.permissions.canFinalizeWorkflow, false);

const withNote = DraftWorkspaceManager.addExpertReviewNote(review, {
    text: "Evidence and CAPEX note reviewed before decision progression.",
    author: "Matthias Meiferts",
    category: "safety"
}, {
    createdAt: "2026-07-10T00:22:00.000Z"
});

assert.equal(withNote.status, "review_required");
assert.equal(withNote.notes.length, 1);
assert.equal(withNote.decision, null);
assert.equal(withNote.safetyBoundary.expertApprovalGranted, false);
assert.equal(withNote.permissions.canExport, false);
assert.equal(withNote.permissions.canCreateClientDocument, false);
assert.equal(withNote.permissions.canFinalizeWorkflow, false);

const approved = DraftWorkspaceManager.approveExpertReview(withNote, {
    comment: "Approved for controlled internal progression only.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T00:23:00.000Z"
});

assert.equal(approved.status, "approved");
assert.equal(approved.decision.decisionType, "approved");
assert.equal(approved.safetyBoundary.expertApprovalGranted, true);
assert.equal(approved.safetyBoundary.reviewPersisted, false);
assert.equal(approved.safetyBoundary.clientDocumentCreated, false);
assert.equal(approved.safetyBoundary.reportExported, false);
assert.equal(approved.safetyBoundary.workflowFinalized, false);
assert.equal(approved.permissions.canExport, false);
assert.equal(approved.permissions.canCreateClientDocument, false);
assert.equal(approved.permissions.canFinalizeWorkflow, false);

const rejected = DraftWorkspaceManager.rejectExpertReview(withNote, {
    comment: "Rejected because evidence is not sufficiently clear.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T00:24:00.000Z"
});

assert.equal(rejected.status, "rejected");
assert.equal(rejected.decision.decisionType, "rejected");
assert.equal(rejected.safetyBoundary.expertApprovalGranted, false);
assert.equal(rejected.safetyBoundary.reviewPersisted, false);
assert.equal(rejected.safetyBoundary.clientDocumentCreated, false);
assert.equal(rejected.safetyBoundary.reportExported, false);
assert.equal(rejected.safetyBoundary.workflowFinalized, false);
assert.equal(rejected.permissions.canExport, false);
assert.equal(rejected.permissions.canCreateClientDocument, false);
assert.equal(rejected.permissions.canFinalizeWorkflow, false);

const registry = DraftWorkspaceManager.createRegistry({
    registryId: "expert-review-regression-registry-001",
    createdAt: "2026-07-10T00:25:00.000Z"
});

const savedRegistry = DraftWorkspaceManager.addDraft(registry, reportWorkspaceDraft, {
    updatedAt: "2026-07-10T00:26:00.000Z"
});

assert.equal(savedRegistry.drafts.length, 1);
assert.equal(savedRegistry.safetyBoundary.registryPersisted, false);
assert.equal(savedRegistry.safetyBoundary.clientDocumentCreated, false);
assert.equal(savedRegistry.safetyBoundary.reportExported, false);
assert.equal(savedRegistry.safetyBoundary.workflowFinalized, false);
assert.equal(savedRegistry.safetyBoundary.expertApprovalGranted, false);

console.log("Expert review regression safety test passed");
console.log(`Workspace draft requires approval: ${reportWorkspaceDraft.permissions.requiresExpertApproval}`);
console.log(`Initial review status: ${review.status}`);
console.log(`Notes after note: ${withNote.notes.length}`);
console.log(`Approved status: ${approved.status}`);
console.log(`Approved expert approval: ${approved.safetyBoundary.expertApprovalGranted}`);
console.log(`Approved can export: ${approved.permissions.canExport}`);
console.log(`Approved workflow finalized: ${approved.safetyBoundary.workflowFinalized}`);
console.log(`Rejected status: ${rejected.status}`);
console.log(`Rejected expert approval: ${rejected.safetyBoundary.expertApprovalGranted}`);
