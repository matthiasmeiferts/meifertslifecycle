import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import DraftWorkspaceManager from "../portal/core/DraftWorkspaceManager.js";

const requiredTestFiles = [
    "tests/internal-finalization-review-model-test.js",
    "tests/internal-finalization-review-from-gate-test.js",
    "tests/internal-finalization-review-browser-preview-test.js",
    "tests/internal-finalization-review-regression-safety-test.js"
];

for (const file of requiredTestFiles) {
    assert.ok(existsSync(file), `${file} must exist before Internal Finalization Review release lock.`);
}

const managerSource = readFileSync("portal/core/DraftWorkspaceManager.js", "utf8");
const pageSource = readFileSync("portal/ui/pages/QuestionCatalogPage.js", "utf8");
const styleSource = readFileSync("portal/ui/styles/workspace.css", "utf8");

assert.ok(managerSource.includes("createInternalFinalizationReview"));
assert.ok(managerSource.includes("addInternalFinalizationReviewNote"));
assert.ok(managerSource.includes("approveInternalFinalizationReview"));
assert.ok(managerSource.includes("rejectInternalFinalizationReview"));
assert.ok(managerSource.includes("cloneInternalFinalizationReview"));
assert.ok(managerSource.includes("createInternalFinalizationReviewSafetyBoundary"));

assert.ok(pageSource.includes("data-internal-finalization-review-preview"));
assert.ok(pageSource.includes("renderInternalFinalizationReview"));
assert.ok(pageSource.includes("data-add-internal-review-note"));
assert.ok(pageSource.includes("data-approve-internal-review"));
assert.ok(pageSource.includes("data-reject-internal-review"));
assert.ok(pageSource.includes("const hasInternalNote = currentInternalReview.notes.length > 0"));

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
        title: "Internal finalization review release lock",
        previewOnly: true,
        persisted: false,
        exported: false
    }
}, {
    createdAt: "2026-07-10T04:00:00.000Z"
});

const expertReview = DraftWorkspaceManager.createExpertReview(workspaceDraft, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T04:01:00.000Z"
});

const notedExpertReview = DraftWorkspaceManager.addExpertReviewNote(expertReview, {
    text: "Expert review note before release lock.",
    author: "Matthias Meiferts",
    category: "expert-review"
}, {
    createdAt: "2026-07-10T04:02:00.000Z"
});

const approvedExpertReview = DraftWorkspaceManager.approveExpertReview(notedExpertReview, {
    comment: "Approved for finalization gate release lock.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T04:03:00.000Z"
});

const readyGate = DraftWorkspaceManager.createFinalizationGate(approvedExpertReview, {
    createdAt: "2026-07-10T04:04:00.000Z"
});

const internalReview = DraftWorkspaceManager.createInternalFinalizationReview(readyGate, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T04:05:00.000Z"
});

const notedInternalReview = DraftWorkspaceManager.addInternalFinalizationReviewNote(internalReview, {
    text: "Internal finalization release lock note.",
    author: "Matthias Meiferts",
    category: "release-lock"
}, {
    createdAt: "2026-07-10T04:06:00.000Z"
});

const approvedInternalReview = DraftWorkspaceManager.approveInternalFinalizationReview(notedInternalReview, {
    comment: "Internally approved for release lock only. Export remains locked.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T04:07:00.000Z"
});

assert.equal(readyGate.status, "ready_for_internal_finalization_review");
assert.equal(internalReview.status, "internal_review_required");
assert.equal(notedInternalReview.notes.length, 1);
assert.equal(approvedInternalReview.status, "internally_approved");
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

console.log("Internal finalization review release lock test passed");
console.log(`Required test files: ${requiredTestFiles.length}`);
console.log(`Ready gate status: ${readyGate.status}`);
console.log(`Internal review status: ${internalReview.status}`);
console.log(`Internal notes: ${notedInternalReview.notes.length}`);
console.log(`Approved internal status: ${approvedInternalReview.status}`);
console.log(`Can export: ${approvedInternalReview.permissions.canExport}`);
console.log(`Can create client document: ${approvedInternalReview.permissions.canCreateClientDocument}`);
console.log(`Can finalize workflow: ${approvedInternalReview.permissions.canFinalizeWorkflow}`);
console.log("Browser internal review governance anchors present: true");
