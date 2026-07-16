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
        'expertReviewWorkflowNode.querySelector("[data-export-preparation-gate-preview]")'
    )
);

assert.ok(
    pageSource.includes(
        "exportWorkflowController.startFromInternalReview("
    )
);

assert.ok(
    controllerSource.includes(
        "ExportPreparationGatePreview.create("
    )
);

assert.ok(
    controllerSource.includes(
        "this.nodes.exportPreparationGateNode.replaceChildren("
    )
);

assert.equal(
    pageSource.includes("function renderExportPreparationGate()"),
    false
);

assert.equal(
    pageSource.includes("renderInlineExportPreparationReview"),
    false
);

assert.equal(
    pageSource.includes("bindInlineExportPreparationReviewActions"),
    false
);

console.log("Export preparation gate QuestionCatalogPage integration test passed");
console.log("Controller construction count:", controllerCount);
console.log("Export preparation gate managed by controller: true");
console.log("Legacy free gate renderer present: false");
console.log("Inline review duplication present: false");
