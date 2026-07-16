import assert from "node:assert/strict";
import fs from "node:fs";
import QuestionCatalogPage from "../portal/ui/pages/QuestionCatalogPage.js";
import ExportWorkflowPreviewController from "../portal/ui/controllers/ExportWorkflowPreviewController.js";

const pagePath = new URL("../portal/ui/pages/QuestionCatalogPage.js", import.meta.url);
const controllerPath = new URL("../portal/ui/controllers/ExportWorkflowPreviewController.js", import.meta.url);

const pageSource = fs.readFileSync(pagePath, "utf8");
const controllerSource = fs.readFileSync(controllerPath, "utf8");

assert.ok(QuestionCatalogPage);
assert.ok(ExportWorkflowPreviewController);

const controllerCount = (
    pageSource.match(/new ExportWorkflowPreviewController\(/g) || []
).length;

assert.equal(controllerCount, 1);

assert.ok(
    pageSource.includes(
        "exportWorkflowController.startFromInternalReview("
    )
);

assert.ok(
    controllerSource.includes(
        "ReportExportPreparationPackagePreview.create("
    )
);

assert.ok(
    controllerSource.includes(
        "this.nodes.reportExportPreparationPackageNode.replaceChildren("
    )
);

assert.equal(
    pageSource.includes("renderReportExportPreparationPackagePanel"),
    false
);

assert.equal(
    controllerSource.includes(
        "ReportExportPreparationPackagePreview.create(this.currentReportExportPreparationPackage).addEventListener"
    ),
    false
);

console.log("Report export preparation package QuestionCatalogPage integration test passed");
console.log("Controller construction count:", controllerCount);
console.log("Preparation package managed by controller: true");
console.log("Legacy preparation package renderer present: false");
console.log("Preparation package actions added: false");
