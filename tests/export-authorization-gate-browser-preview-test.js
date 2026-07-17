import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const pageSource = readFileSync("portal/ui/pages/QuestionCatalogPage.js", "utf8");
const styleSource = readFileSync("portal/ui/styles/workspace.css", "utf8");
const controllerSource = readFileSync("portal/ui/controllers/ExportWorkflowPreviewController.js", "utf8");
const exportAuthorizationGatePreviewSource = readFileSync("portal/ui/components/ExportAuthorizationGatePreview.js", "utf8");

assert.ok(pageSource.includes("ExportWorkflowPreviewController"));
assert.ok(controllerSource.includes("currentExportAuthorizationGate"));
assert.ok(controllerSource.includes("createExportAuthorizationGate"));
assert.ok(controllerSource.includes("renderExportAuthorizationGate"));
assert.ok(exportAuthorizationGatePreviewSource.includes("export-authorization-gate-preview"));
assert.ok(exportAuthorizationGatePreviewSource.includes("preview.dataset.exportAuthorizationGateCard"));
assert.ok(exportAuthorizationGatePreviewSource.includes("Controlled export authorization gate only."));
assert.ok(exportAuthorizationGatePreviewSource.includes("canExport"));
assert.ok(exportAuthorizationGatePreviewSource.includes("exportFileCreated"));


assert.ok(styleSource.includes("Foundation 3.0-C Controlled Export Authorization Gate Browser Preview"));
assert.ok(styleSource.includes(".export-authorization-gate-preview"));
assert.ok(styleSource.includes(".export-authorization-gate-preview.is-required"));
assert.ok(styleSource.includes(".export-authorization-gate-preview.is-blocked"));
assert.ok(styleSource.includes(".export-authorization-gate-preview__locks"));

console.log("Export authorization gate browser preview test passed");
console.log("Export authorization gate panel present: true");
console.log("Controlled lock text present: true");
console.log("Export file created safety anchor present: true");
