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
        "ExportAuthorizationGatePreview.create("
    )
);

assert.ok(
    controllerSource.includes(
        "this.nodes.exportAuthorizationGateNode.replaceChildren("
    )
);

assert.equal(
    pageSource.includes("renderExportAuthorizationGatePanel"),
    false
);

assert.equal(
    controllerSource.includes(
        "ExportAuthorizationGatePreview.create(this.currentExportAuthorizationGate).addEventListener"
    ),
    false
);

console.log("Export authorization gate QuestionCatalogPage integration test passed");
console.log("Controller construction count:", controllerCount);
console.log("Export authorization managed by controller: true");
console.log("Legacy export authorization renderer present: false");
console.log("Export authorization actions added: false");
