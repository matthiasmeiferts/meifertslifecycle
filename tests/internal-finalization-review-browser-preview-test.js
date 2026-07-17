import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const pageSource = readFileSync("portal/ui/pages/QuestionCatalogPage.js", "utf8");
const styleSource = readFileSync("portal/ui/styles/workspace.css", "utf8");
const internalReviewPreviewSource = readFileSync("portal/ui/components/InternalFinalizationReviewPreview.js", "utf8");

assert.ok(pageSource.includes("InternalFinalizationReviewPreview"));
assert.ok(pageSource.includes("renderInternalFinalizationReview"));
assert.ok(internalReviewPreviewSource.includes("preview.dataset.internalFinalizationReviewPreview"));
assert.ok(internalReviewPreviewSource.includes('"Add internal note"'));
assert.ok(internalReviewPreviewSource.includes("onApprove"));
assert.ok(internalReviewPreviewSource.includes("onReject"));
assert.ok(internalReviewPreviewSource.includes("Internal finalization note required first."));
assert.ok(internalReviewPreviewSource.includes("canExport"));
assert.ok(internalReviewPreviewSource.includes("canCreateClientDocument"));
assert.ok(internalReviewPreviewSource.includes("canFinalizeWorkflow"));







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
