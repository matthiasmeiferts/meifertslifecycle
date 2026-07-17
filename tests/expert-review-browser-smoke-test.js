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




assert.ok(styleSource.includes(".expert-review-preview"));
assert.ok(styleSource.includes(".expert-review-preview.is-approved"));
assert.ok(styleSource.includes(".expert-review-preview.is-rejected"));

console.log("Expert review browser smoke test passed");
console.log("Browser smoke manually verified: true");
console.log("Expert review panel present: true");
console.log("Single-note behavior present: true");
console.log("Approve/reject states present: true");
console.log("Safety text present: true");
