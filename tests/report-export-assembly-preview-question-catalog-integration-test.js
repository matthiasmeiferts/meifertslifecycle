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
        "DraftWorkspaceManager.createReportExportAssemblyPreview("
    )
);

assert.ok(
    controllerSource.includes(
        "ReportExportAssemblyPreview.create("
    )
);

assert.ok(
    controllerSource.includes(
        "this.nodes.reportExportAssemblyNode.replaceChildren("
    )
);

assert.equal(
    controllerSource.includes(
        "data-report-export-assembly-preview-action"
    ),
    false
);

assert.equal(
    controllerSource.includes(
        "ReportExportAssemblyPreview.create(this.currentReportExportAssemblyPreview).addEventListener"
    ),
    false
);

console.log("Report export assembly preview QuestionCatalogPage integration test passed");
console.log("Controller construction count:", controllerCount);
console.log("Assembly preview model transition: present");
console.log("Assembly preview managed by controller: true");
console.log("Assembly preview actions added: false");
