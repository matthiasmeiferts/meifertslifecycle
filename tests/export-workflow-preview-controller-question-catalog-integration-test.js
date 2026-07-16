import assert from "node:assert/strict";
import fs from "node:fs";
import QuestionCatalogPage from "../portal/ui/pages/QuestionCatalogPage.js";
import ExportWorkflowPreviewController from "../portal/ui/controllers/ExportWorkflowPreviewController.js";

const pagePath = new URL(
    "../portal/ui/pages/QuestionCatalogPage.js",
    import.meta.url
);

const pageSource = fs.readFileSync(pagePath, "utf8");

assert.ok(QuestionCatalogPage);
assert.ok(ExportWorkflowPreviewController);

assert.ok(
    pageSource.includes(
        'import ExportWorkflowPreviewController from "../controllers/ExportWorkflowPreviewController.js";'
    )
);

const constructorCount = (
    pageSource.match(/new ExportWorkflowPreviewController\(/g) || []
).length;

assert.equal(constructorCount, 1);

assert.ok(
    pageSource.includes(
        "exportWorkflowController.startFromInternalReview("
    )
);

[
    "renderExportPreparationReview",
    "renderExportAuthorizationGate",
    "renderReportExportPreparationPackage",
    "currentExportPreparationGate",
    "currentExportPreparationReview",
    "currentExportAuthorizationGate",
    "currentReportExportPreparationPackage"
].forEach(name => {
    assert.equal(pageSource.includes(name), false);
});

[
    "ExportPreparationGatePreview",
    "ExportPreparationReviewPreview",
    "ExportAuthorizationGatePreview",
    "ReportExportPreparationPackagePreview",
    "ReportExportAssemblyPreview"
].forEach(name => {
    assert.equal(pageSource.includes(name), false);
});

console.log(
    "Export workflow preview controller QuestionCatalogPage integration test passed"
);
console.log("Controller import: present");
console.log("Controller construction count:", constructorCount);
console.log("Controller start transition: present");
console.log("Legacy export orchestration present: false");
