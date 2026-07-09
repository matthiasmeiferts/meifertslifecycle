import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import DraftWorkspaceManager from "../portal/core/DraftWorkspaceManager.js";

const reportDraftSource = {
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
        title: "Final integration report draft · DE-TDD-06-036",
        executiveSummary: "Sandbox-only report draft for expert review integration.",
        previewOnly: true,
        persisted: false,
        exported: false
    }
};

const createdAt = "2026-07-10T00:40:00.000Z";

const workspaceDraft = DraftWorkspaceManager.createDraftRecord(reportDraftSource, {
    createdAt
});

assert.equal(workspaceDraft.draftId, "report_draft-de-tdd-06-036");
assert.equal(workspaceDraft.status, "draft");
assert.equal(workspaceDraft.permissions.requiresExpertApproval, true);
assert.equal(workspaceDraft.permissions.canExport, false);
assert.equal(workspaceDraft.permissions.canCreateClientDocument, false);
assert.equal(workspaceDraft.permissions.canFinalizeWorkflow, false);
assert.equal(workspaceDraft.safetyBoundary.expertApprovalGranted, false);

const registry = DraftWorkspaceManager.createRegistry({
    registryId: "expert-review-final-integration-registry",
    createdAt
});

const registryWithDraft = DraftWorkspaceManager.addDraft(registry, workspaceDraft, {
    updatedAt: "2026-07-10T00:41:00.000Z"
});

assert.equal(registryWithDraft.drafts.length, 1);
assert.equal(registryWithDraft.drafts[0].draftId, workspaceDraft.draftId);
assert.equal(registryWithDraft.safetyBoundary.registryPersisted, false);
assert.equal(registryWithDraft.safetyBoundary.reportExported, false);
assert.equal(registryWithDraft.safetyBoundary.clientDocumentCreated, false);
assert.equal(registryWithDraft.safetyBoundary.workflowFinalized, false);

const review = DraftWorkspaceManager.createExpertReview(workspaceDraft, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T00:42:00.000Z"
});

assert.equal(review.reviewId, "expert_review-report_draft-de-tdd-06-036");
assert.equal(review.status, "review_required");
assert.equal(review.notes.length, 0);
assert.equal(review.permissions.canExport, false);
assert.equal(review.permissions.canCreateClientDocument, false);
assert.equal(review.permissions.canFinalizeWorkflow, false);
assert.equal(review.safetyBoundary.expertApprovalGranted, false);

const reviewed = DraftWorkspaceManager.addExpertReviewNote(review, {
    text: "Final integration note confirms controlled expert review path.",
    author: "Matthias Meiferts",
    category: "final-integration"
}, {
    createdAt: "2026-07-10T00:43:00.000Z"
});

assert.equal(reviewed.status, "review_required");
assert.equal(reviewed.notes.length, 1);
assert.equal(reviewed.safetyBoundary.expertApprovalGranted, false);
assert.equal(reviewed.permissions.canExport, false);

const approved = DraftWorkspaceManager.approveExpertReview(reviewed, {
    comment: "Approved for internal controlled draft progression only.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T00:44:00.000Z"
});

assert.equal(approved.status, "approved");
assert.equal(approved.decision.decisionType, "approved");
assert.equal(approved.safetyBoundary.expertApprovalGranted, true);
assert.equal(approved.permissions.canExport, false);
assert.equal(approved.permissions.canCreateClientDocument, false);
assert.equal(approved.permissions.canFinalizeWorkflow, false);
assert.equal(approved.safetyBoundary.reportExported, false);
assert.equal(approved.safetyBoundary.clientDocumentCreated, false);
assert.equal(approved.safetyBoundary.workflowFinalized, false);

const rejected = DraftWorkspaceManager.rejectExpertReview(reviewed, {
    comment: "Rejected branch remains safely isolated from approved branch.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T00:45:00.000Z"
});

assert.equal(rejected.status, "rejected");
assert.equal(rejected.decision.decisionType, "rejected");
assert.equal(rejected.safetyBoundary.expertApprovalGranted, false);
assert.equal(rejected.permissions.canExport, false);
assert.equal(rejected.permissions.canCreateClientDocument, false);
assert.equal(rejected.permissions.canFinalizeWorkflow, false);

assert.equal(
    approved.safetyBoundary.expertApprovalGranted,
    true,
    "Approved review must remain approved after rejected branch is created."
);

assert.equal(
    rejected.safetyBoundary.expertApprovalGranted,
    false,
    "Rejected review must remain rejected without mutating approved branch."
);

const pageSource = readFileSync("portal/ui/pages/QuestionCatalogPage.js", "utf8");
const styleSource = readFileSync("portal/ui/styles/workspace.css", "utf8");

assert.ok(pageSource.includes("data-expert-review-preview"));
assert.ok(pageSource.includes("static bindExpertReviewPreview"));
assert.ok(pageSource.includes("if (currentReview.notes.length > 0)"));
assert.ok(pageSource.includes("addNoteButton.disabled = true"));
assert.ok(pageSource.includes("DraftWorkspaceManager.createExpertReview"));
assert.ok(pageSource.includes("DraftWorkspaceManager.approveExpertReview"));
assert.ok(pageSource.includes("DraftWorkspaceManager.rejectExpertReview"));

assert.ok(styleSource.includes(".expert-review-preview.is-approved"));
assert.ok(styleSource.includes(".expert-review-preview.is-rejected"));

console.log("Expert review final integration safety test passed");
console.log(`Workspace draft id: ${workspaceDraft.draftId}`);
console.log(`Registry drafts: ${registryWithDraft.drafts.length}`);
console.log(`Review id: ${review.reviewId}`);
console.log(`Reviewed notes: ${reviewed.notes.length}`);
console.log(`Approved status: ${approved.status}`);
console.log(`Approved expert approval: ${approved.safetyBoundary.expertApprovalGranted}`);
console.log(`Rejected status: ${rejected.status}`);
console.log(`Rejected expert approval: ${rejected.safetyBoundary.expertApprovalGranted}`);
console.log(`Approved can export: ${approved.permissions.canExport}`);
console.log(`Approved workflow finalized: ${approved.safetyBoundary.workflowFinalized}`);
console.log("Browser anchors present: true");
