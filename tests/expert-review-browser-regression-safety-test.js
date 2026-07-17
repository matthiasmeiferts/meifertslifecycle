import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

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













assert.ok(
    styleSource.includes('Foundation 2.5-C Expert Review Browser Preview'),
    "Expert review browser preview styles must be present."
);

assert.ok(
    styleSource.includes('Foundation 2.5-C Expert Review Visual State Fix'),
    "Expert review visual state styles must be present."
);

assert.ok(
    styleSource.includes('.expert-review-preview.is-approved'),
    "Approved expert review state must have a visible style hook."
);

assert.ok(
    styleSource.includes('.expert-review-preview.is-rejected'),
    "Rejected expert review state must have a visible style hook."
);

console.log("Expert review browser regression safety test passed");
console.log("Panel present: true");
console.log("Single-note guard present: true");
console.log("Approve/reject actions present: true");
console.log("Safety output present: true");
console.log("Visual state hooks present: true");
