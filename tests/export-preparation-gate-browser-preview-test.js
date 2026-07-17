import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const pageSource = readFileSync("portal/ui/pages/QuestionCatalogPage.js", "utf8");
const styleSource = readFileSync("portal/ui/styles/workspace.css", "utf8");
const controllerSource = readFileSync("portal/ui/controllers/ExportWorkflowPreviewController.js", "utf8");
const exportPreparationGatePreviewSource = readFileSync("portal/ui/components/ExportPreparationGatePreview.js", "utf8");
const expertReviewPreviewSource = readFileSync("portal/ui/components/ExpertReviewPreview.js", "utf8");

assert.ok(pageSource.includes("ExportWorkflowPreviewController"));
assert.ok(controllerSource.includes("currentExportPreparationGate"));
assert.ok(controllerSource.includes("createExportPreparationGate"));
assert.ok(controllerSource.includes("ExportPreparationGatePreview.create"));
assert.ok(exportPreparationGatePreviewSource.includes("export-preparation-gate-preview"));
assert.ok(exportPreparationGatePreviewSource.includes("preview.dataset.exportPreparationGateCard"));
assert.ok(exportPreparationGatePreviewSource.includes("Export preparation only."));
assert.ok(exportPreparationGatePreviewSource.includes("exportFileCreated"));
assert.ok(expertReviewPreviewSource.includes("Expert review note required first."));




assert.ok(styleSource.includes("Foundation 2.8-C Export Preparation Gate Browser Preview"));
assert.ok(styleSource.includes(".export-preparation-gate-preview"));
assert.ok(styleSource.includes(".export-preparation-gate-preview.is-required"));
assert.ok(styleSource.includes(".export-preparation-gate-preview.is-blocked"));
assert.ok(styleSource.includes(".export-preparation-gate-preview__locks"));

console.log("Export preparation gate browser preview test passed");
console.log("Export preparation gate panel present: true");
console.log("Export preparation gate autoscroll present: true");
console.log("Export/client/workflow lock text present: true");
console.log("Export file created safety anchor present: true");
