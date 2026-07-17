import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import DraftWorkspaceManager from "../portal/core/DraftWorkspaceManager.js";

const requiredTestFiles = [
    "tests/finalization-gate-model-test.js",
    "tests/finalization-gate-from-expert-review-test.js",
    "tests/finalization-gate-browser-autoscroll-test.js",
    "tests/finalization-gate-regression-safety-test.js"
];

for (const file of requiredTestFiles) {
    assert.ok(existsSync(file), `${file} must exist before Finalization Gate release lock.`);
}

const managerSource = readFileSync("portal/core/DraftWorkspaceManager.js", "utf8");
const pageSource = readFileSync("portal/ui/pages/QuestionCatalogPage.js", "utf8");
const styleSource = readFileSync("portal/ui/styles/workspace.css", "utf8");
const finalizationGatePreviewSource = readFileSync("portal/ui/components/FinalizationGatePreview.js", "utf8");

assert.ok(pageSource.includes("FinalizationGatePreview"));
assert.ok(pageSource.includes("FinalizationGatePreview.create"));
assert.ok(finalizationGatePreviewSource.includes("preview.dataset.finalizationGatePreview"));
assert.ok(finalizationGatePreviewSource.includes("StatusBadge.create(status)"));
assert.ok(finalizationGatePreviewSource.includes('"Expert Review Approved"'));
assert.ok(finalizationGatePreviewSource.includes("finalization-gate-preview__safety"));

assert.ok(managerSource.includes("createFinalizationGate"));
assert.ok(managerSource.includes("createFinalizationGateId"));
assert.ok(managerSource.includes("createFinalizationGateSafetyBoundary"));


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
        title: "Finalization gate release lock",
        previewOnly: true,
        persisted: false,
        exported: false
    }
}, {
    createdAt: "2026-07-10T02:30:00.000Z"
});

const review = DraftWorkspaceManager.createExpertReview(workspaceDraft, {
    reviewer: "Matthias Meiferts",
    createdAt: "2026-07-10T02:31:00.000Z"
});

const reviewed = DraftWorkspaceManager.addExpertReviewNote(review, {
    text: "Release lock note for finalization gate.",
    author: "Matthias Meiferts",
    category: "release-lock"
}, {
    createdAt: "2026-07-10T02:32:00.000Z"
});

const approved = DraftWorkspaceManager.approveExpertReview(reviewed, {
    comment: "Approved only for internal finalization gate release lock.",
    decidedBy: "Matthias Meiferts"
}, {
    updatedAt: "2026-07-10T02:33:00.000Z"
});

const readyGate = DraftWorkspaceManager.createFinalizationGate(approved, {
    createdAt: "2026-07-10T02:34:00.000Z"
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

console.log("Finalization gate release lock test passed");
console.log(`Required test files: ${requiredTestFiles.length}`);
console.log(`Ready gate id: ${readyGate.gateId}`);
console.log(`Ready gate status: ${readyGate.status}`);
console.log(`Expert review approved: ${readyGate.readiness.expertReviewApproved}`);
console.log(`Can export: ${readyGate.permissions.canExport}`);
console.log(`Can create client document: ${readyGate.permissions.canCreateClientDocument}`);
console.log(`Can finalize workflow: ${readyGate.permissions.canFinalizeWorkflow}`);
console.log("Browser finalization gate anchors present: true");
