import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const pageSource = readFileSync("portal/ui/pages/QuestionCatalogPage.js", "utf8");
const styleSource = readFileSync("portal/ui/styles/workspace.css", "utf8");

assert.ok(pageSource.includes("let currentExportPreparationReview = null;"));
assert.ok(pageSource.includes("DraftWorkspaceManager.createExportPreparationReview(currentExportPreparationGate"));
assert.ok(pageSource.includes("renderExportPreparationReview"));
assert.ok(pageSource.includes("data-export-preparation-review-preview"));
assert.ok(pageSource.includes("data-export-preparation-review-card"));
assert.ok(pageSource.includes("Foundation 2.9-C Export Preparation Review Browser Preview"));
assert.ok(pageSource.includes("data-add-export-preparation-review-note"));
assert.ok(pageSource.includes("data-approve-export-preparation-review"));
assert.ok(pageSource.includes("data-reject-export-preparation-review"));
assert.ok(pageSource.includes("Export preparation review note required first."));
assert.ok(pageSource.includes("DraftWorkspaceManager.addExportPreparationReviewNote"));
assert.ok(pageSource.includes("DraftWorkspaceManager.approveExportPreparationReview"));
assert.ok(pageSource.includes("DraftWorkspaceManager.rejectExportPreparationReview"));
assert.ok(pageSource.includes("Export preparation review only. Export, client document creation and workflow finalization remain locked."));
assert.ok(pageSource.includes("review.safetyBoundary.exportFileCreated"));

assert.ok(styleSource.includes("Foundation 2.9-C Export Preparation Review Browser Preview"));
assert.ok(styleSource.includes(".export-preparation-review-preview"));
assert.ok(styleSource.includes(".export-preparation-review-preview.is-required"));
assert.ok(styleSource.includes(".export-preparation-review-preview.is-approved"));
assert.ok(styleSource.includes(".export-preparation-review-preview.is-rejected"));
assert.ok(styleSource.includes(".export-preparation-review-preview__actions"));

console.log("Export preparation review browser preview test passed");
console.log("Export preparation review panel present: true");
console.log("Export preparation review note action present: true");
console.log("Export preparation review approve/reject actions present: true");
console.log("Export/client/workflow lock text present: true");
console.log("Export file created safety anchor present: true");
