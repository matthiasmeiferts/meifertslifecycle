import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const pageSource = readFileSync("portal/ui/pages/QuestionCatalogPage.js", "utf8");
const styleSource = readFileSync("portal/ui/styles/workspace.css", "utf8");
const controllerSource = readFileSync("portal/ui/controllers/ExportWorkflowPreviewController.js", "utf8");
const reportPackagePreviewSource = readFileSync("portal/ui/components/ReportExportPreparationPackagePreview.js", "utf8");

assert.ok(pageSource.includes("ExportWorkflowPreviewController"));
assert.ok(controllerSource.includes("currentReportExportPreparationPackage"));
assert.ok(controllerSource.includes("createReportExportPreparationPackage"));
assert.ok(controllerSource.includes("renderReportExportPreparationPackage"));
assert.ok(reportPackagePreviewSource.includes("report-export-preparation-package-preview"));
assert.ok(reportPackagePreviewSource.includes("preview.dataset.reportExportPreparationPackageCard"));
assert.ok(reportPackagePreviewSource.includes("Preparation package metadata only."));
assert.ok(reportPackagePreviewSource.includes("canExport"));
assert.ok(reportPackagePreviewSource.includes("exportPackagePrepared"));
assert.ok(reportPackagePreviewSource.includes("exportFileCreated"));


assert.ok(styleSource.includes("Foundation 3.1-C Controlled Report Export Preparation Package Browser Preview"));
assert.ok(styleSource.includes(".report-export-preparation-package-preview"));
assert.ok(styleSource.includes(".report-export-preparation-package-preview.is-required"));
assert.ok(styleSource.includes(".report-export-preparation-package-preview.is-blocked"));
assert.ok(styleSource.includes(".report-export-preparation-package-preview__locks"));

console.log("Report export preparation package browser preview test passed");
console.log("Report export preparation package panel present: true");
console.log("Controlled lock text present: true");
console.log("Export package prepared safety anchor present: true");
