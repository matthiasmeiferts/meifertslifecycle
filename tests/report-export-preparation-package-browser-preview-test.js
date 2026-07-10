import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const pageSource = readFileSync("portal/ui/pages/QuestionCatalogPage.js", "utf8");
const styleSource = readFileSync("portal/ui/styles/workspace.css", "utf8");

assert.ok(pageSource.includes("let currentReportExportPreparationPackage = null;"));
assert.ok(pageSource.includes("DraftWorkspaceManager.createReportExportPreparationPackage(currentExportAuthorizationGate || {}"));
assert.ok(pageSource.includes("renderReportExportPreparationPackage"));
assert.ok(pageSource.includes("data-report-export-preparation-package-preview"));
assert.ok(pageSource.includes("data-report-export-preparation-package-card"));
assert.ok(pageSource.includes("Foundation 3.1-C Controlled Report Export Preparation Package Browser Preview"));
assert.ok(pageSource.includes("Preparation package metadata only. Export, client document creation and workflow finalization remain locked."));
assert.ok(pageSource.includes("reportExportPreparationPackage.permissions.canExport"));
assert.ok(pageSource.includes("reportExportPreparationPackage.safetyBoundary?.exportPackagePrepared"));
assert.ok(pageSource.includes("reportExportPreparationPackage.safetyBoundary.exportFileCreated"));

assert.ok(styleSource.includes("Foundation 3.1-C Controlled Report Export Preparation Package Browser Preview"));
assert.ok(styleSource.includes(".report-export-preparation-package-preview"));
assert.ok(styleSource.includes(".report-export-preparation-package-preview.is-required"));
assert.ok(styleSource.includes(".report-export-preparation-package-preview.is-blocked"));
assert.ok(styleSource.includes(".report-export-preparation-package-preview__locks"));

console.log("Report export preparation package browser preview test passed");
console.log("Report export preparation package panel present: true");
console.log("Controlled lock text present: true");
console.log("Export package prepared safety anchor present: true");
