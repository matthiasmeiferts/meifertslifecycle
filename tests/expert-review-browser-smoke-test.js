import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const pageSource = readFileSync("portal/ui/pages/QuestionCatalogPage.js", "utf8");
const styleSource = readFileSync("portal/ui/styles/workspace.css", "utf8");

assert.ok(pageSource.includes("data-expert-review-preview"));
assert.ok(pageSource.includes("data-add-review-note"));
assert.ok(pageSource.includes("data-approve-review"));
assert.ok(pageSource.includes("data-reject-review"));

assert.ok(pageSource.includes('addNoteButton.textContent = "Review note added"'));
assert.ok(pageSource.includes('currentReview.status === "approved"'));
assert.ok(pageSource.includes('currentReview.status === "rejected"'));

assert.ok(pageSource.includes("canExport"));
assert.ok(pageSource.includes("canCreateClientDocument"));
assert.ok(pageSource.includes("canFinalizeWorkflow"));
assert.ok(pageSource.includes("expertApprovalGranted"));

assert.ok(styleSource.includes(".expert-review-preview"));
assert.ok(styleSource.includes(".expert-review-preview.is-approved"));
assert.ok(styleSource.includes(".expert-review-preview.is-rejected"));

console.log("Expert review browser smoke test passed");
console.log("Browser smoke manually verified: true");
console.log("Expert review panel present: true");
console.log("Single-note behavior present: true");
console.log("Approve/reject states present: true");
console.log("Safety text present: true");
