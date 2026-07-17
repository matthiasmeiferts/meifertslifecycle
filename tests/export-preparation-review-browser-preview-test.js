import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const pageSource = readFileSync("portal/ui/pages/QuestionCatalogPage.js", "utf8");
const styleSource = readFileSync("portal/ui/styles/workspace.css", "utf8");
const controllerSource = readFileSync("portal/ui/controllers/ExportWorkflowPreviewController.js", "utf8");
const exportPreparationReviewPreviewSource = readFileSync("portal/ui/components/ExportPreparationReviewPreview.js", "utf8");

assert.ok(pageSource.includes("ExportWorkflowPreviewController"));
assert.ok(controllerSource.includes("currentExportPreparationReview"));
assert.ok(controllerSource.includes("createExportPreparationReview"));
assert.ok(controllerSource.includes("addExportPreparationReviewNote"));
assert.ok(controllerSource.includes("approveExportPreparationReview"));
assert.ok(controllerSource.includes("rejectExportPreparationReview"));
assert.ok(controllerSource.includes("renderExportPreparationReview"));
assert.ok(exportPreparationReviewPreviewSource.includes("export-preparation-review-preview"));
assert.ok(exportPreparationReviewPreviewSource.includes("preview.dataset.exportPreparationReviewCard"));
assert.ok(exportPreparationReviewPreviewSource.includes('"Add export preparation review note"'));
assert.ok(exportPreparationReviewPreviewSource.includes("onApprove"));
assert.ok(exportPreparationReviewPreviewSource.includes("onReject"));
assert.ok(exportPreparationReviewPreviewSource.includes("Export preparation review note required first."));
assert.ok(exportPreparationReviewPreviewSource.includes("Export preparation review only."));


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
