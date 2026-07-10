import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const pageSource = readFileSync("portal/ui/pages/QuestionCatalogPage.js", "utf8");
const styleSource = readFileSync("portal/ui/styles/workspace.css", "utf8");

assert.ok(pageSource.includes("let currentExportAuthorizationGate = null;"));
assert.ok(pageSource.includes("DraftWorkspaceManager.createExportAuthorizationGate(currentExportPreparationReview"));
assert.ok(pageSource.includes("renderExportAuthorizationGate"));
assert.ok(pageSource.includes("data-export-authorization-gate-preview"));
assert.ok(pageSource.includes("data-export-authorization-gate-card"));
assert.ok(pageSource.includes("Foundation 3.0-C Controlled Export Authorization Gate Browser Preview"));
assert.ok(pageSource.includes("Controlled export authorization gate only. Export, client document creation and workflow finalization remain locked."));
assert.ok(pageSource.includes("gate.permissions.canExport"));
assert.ok(pageSource.includes("gate.safetyBoundary.exportFileCreated"));

assert.ok(styleSource.includes("Foundation 3.0-C Controlled Export Authorization Gate Browser Preview"));
assert.ok(styleSource.includes(".export-authorization-gate-preview"));
assert.ok(styleSource.includes(".export-authorization-gate-preview.is-required"));
assert.ok(styleSource.includes(".export-authorization-gate-preview.is-blocked"));
assert.ok(styleSource.includes(".export-authorization-gate-preview__locks"));

console.log("Export authorization gate browser preview test passed");
console.log("Export authorization gate panel present: true");
console.log("Controlled lock text present: true");
console.log("Export file created safety anchor present: true");
