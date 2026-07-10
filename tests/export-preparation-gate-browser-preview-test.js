import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const pageSource = readFileSync("portal/ui/pages/QuestionCatalogPage.js", "utf8");
const styleSource = readFileSync("portal/ui/styles/workspace.css", "utf8");

assert.ok(pageSource.includes("let currentExportPreparationGate = null;"));
assert.ok(pageSource.includes("DraftWorkspaceManager.createExportPreparationGate(currentInternalReview"));
assert.ok(pageSource.includes("renderExportPreparationGate"));
assert.ok(pageSource.includes("scrollToExportPreparationGate"));
assert.ok(pageSource.includes("data-export-preparation-gate-preview"));
assert.ok(pageSource.includes("data-export-preparation-gate-card"));
assert.ok(pageSource.includes("Foundation 2.8-C Export Preparation Gate Browser Preview"));
assert.ok(pageSource.includes("Export preparation only. Export, client document creation and workflow finalization remain locked."));
assert.ok(pageSource.includes("currentExportPreparationGate.permissions.canExport"));
assert.ok(pageSource.includes("currentExportPreparationGate.safetyBoundary.exportFileCreated"));

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
