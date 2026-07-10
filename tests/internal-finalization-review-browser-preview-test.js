import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const pageSource = readFileSync("portal/ui/pages/QuestionCatalogPage.js", "utf8");
const styleSource = readFileSync("portal/ui/styles/workspace.css", "utf8");

assert.ok(pageSource.includes("data-internal-finalization-review-preview"));
assert.ok(pageSource.includes("renderInternalFinalizationReview"));
assert.ok(pageSource.includes("DraftWorkspaceManager.createInternalFinalizationReview"));
assert.ok(pageSource.includes("DraftWorkspaceManager.addInternalFinalizationReviewNote"));
assert.ok(pageSource.includes("DraftWorkspaceManager.approveInternalFinalizationReview"));
assert.ok(pageSource.includes("DraftWorkspaceManager.rejectInternalFinalizationReview"));

assert.ok(pageSource.includes("data-add-internal-review-note"));
assert.ok(pageSource.includes("data-approve-internal-review"));
assert.ok(pageSource.includes("data-reject-internal-review"));

assert.ok(pageSource.includes("scrollToInternalFinalizationReview"));
assert.ok(pageSource.includes("internalReviewNode.scrollIntoView"));

assert.ok(pageSource.includes("canExport"));
assert.ok(pageSource.includes("canCreateClientDocument"));
assert.ok(pageSource.includes("canFinalizeWorkflow"));

assert.ok(
    pageSource.includes("const hasInternalNote = currentInternalReview.notes.length > 0"),
    "Internal finalization approve/reject actions must require an internal note."
);

assert.ok(
    pageSource.includes("Internal finalization note required first."),
    "Internal finalization review must explain that a note is required before decision."
);

assert.ok(styleSource.includes("Foundation 2.7-C Internal Finalization Review Browser Preview"));
assert.ok(styleSource.includes(".internal-finalization-review-preview.is-required"));
assert.ok(styleSource.includes(".internal-finalization-review-preview.is-approved"));
assert.ok(styleSource.includes(".internal-finalization-review-preview.is-rejected"));
assert.ok(styleSource.includes(".internal-finalization-review-preview.is-blocked"));

console.log("Internal finalization review browser preview test passed");
console.log("Internal review panel present: true");
console.log("Internal note action present: true");
console.log("Internal approve/reject actions present: true");
console.log("Internal review autoscroll present: true");
console.log("Internal review safety text present: true");
console.log("Internal review visual states present: true");
