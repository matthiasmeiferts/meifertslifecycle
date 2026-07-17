import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import DraftWorkspaceManager from "../portal/core/DraftWorkspaceManager.js";

const requiredTestFiles = [
    "tests/expert-review-model-test.js",
    "tests/expert-review-from-workspace-draft-test.js",
    "tests/expert-review-regression-safety-test.js",
    "tests/expert-review-browser-regression-safety-test.js",
    "tests/expert-review-final-integration-safety-test.js",
    "tests/expert-review-browser-smoke-test.js"
];

for (const file of requiredTestFiles) {
    assert.ok(existsSync(file), `${file} must exist before Expert Review release lock.`);
}

const managerSource = readFileSync("portal/core/DraftWorkspaceManager.js", "utf8");
const pageSource = readFileSync("portal/ui/pages/QuestionCatalogPage.js", "utf8");
const styleSource = readFileSync("portal/ui/styles/workspace.css", "utf8");
const expertReviewPreviewSource = readFileSync("portal/ui/components/ExpertReviewPreview.js", "utf8");

assert.ok(pageSource.includes("ExpertReviewPreview"));
assert.ok(expertReviewPreviewSource.includes("preview.dataset.expertReviewPreview"));
assert.ok(expertReviewPreviewSource.includes('label: hasNote ? "Review note added" : "Add review note"'));
assert.ok(expertReviewPreviewSource.includes("onApprove"));
assert.ok(expertReviewPreviewSource.includes("onReject"));
assert.ok(expertReviewPreviewSource.includes("canExport"));
assert.ok(expertReviewPreviewSource.includes("canCreateClientDocument"));
assert.ok(expertReviewPreviewSource.includes("canFinalizeWorkflow"));
assert.ok(expertReviewPreviewSource.includes("expertApprovalGranted"));

assert.ok(managerSource.includes("createExpertReview"));
assert.ok(managerSource.includes("addExpertReviewNote"));
assert.ok(managerSource.includes("approveExpertReview"));
assert.ok(managerSource.includes("rejectExpertReview"));
assert.ok(managerSource.includes("cloneExpertReview"));
assert.ok(managerSource.includes("createExpertReviewSafetyBoundary"));


assert.ok(styleSource.includes(".expert-review-preview"));
assert.ok(styleSource.includes(".expert-review-preview.is-approved"));
assert.ok(styleSource.includes(".expert-review-preview.is-rejected"));

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
        title: "Release lock report draft",
        previewOnly: true,
        persisted: false,
        exported: false
    }
}, {
    createdAt: "2026-07-10T01:00:00.000Z"
});

const review = DraftWorkspaceManager.createExpertReview(workspaceDraft, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T01:01:00.000Z"
});

const reviewed = DraftWorkspaceManager.addExpertReviewNote(review, {
    text: "Release lock review note.",
    author: "Matthias Meiferts",
    category: "release-lock"
}, {
    createdAt: "2026-07-10T01:02:00.000Z"
});

const approved = DraftWorkspaceManager.approveExpertReview(reviewed, {
    comment: "Approved for internal controlled release lock only.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T01:03:00.000Z"
});

assert.equal(workspaceDraft.permissions.requiresExpertApproval, true);
assert.equal(review.status, "review_required");
assert.equal(reviewed.notes.length, 1);
assert.equal(approved.status, "approved");
assert.equal(approved.safetyBoundary.expertApprovalGranted, true);

assert.equal(approved.permissions.canExport, false);
assert.equal(approved.permissions.canCreateClientDocument, false);
assert.equal(approved.permissions.canFinalizeWorkflow, false);

assert.equal(approved.safetyBoundary.reportExported, false);
assert.equal(approved.safetyBoundary.clientDocumentCreated, false);
assert.equal(approved.safetyBoundary.workflowFinalized, false);

console.log("Expert review release lock test passed");
console.log(`Required test files: ${requiredTestFiles.length}`);
console.log(`Workspace draft id: ${workspaceDraft.draftId}`);
console.log(`Review status: ${review.status}`);
console.log(`Reviewed notes: ${reviewed.notes.length}`);
console.log(`Approved status: ${approved.status}`);
console.log(`Expert approval granted: ${approved.safetyBoundary.expertApprovalGranted}`);
console.log(`Can export: ${approved.permissions.canExport}`);
console.log(`Can create client document: ${approved.permissions.canCreateClientDocument}`);
console.log(`Can finalize workflow: ${approved.permissions.canFinalizeWorkflow}`);
