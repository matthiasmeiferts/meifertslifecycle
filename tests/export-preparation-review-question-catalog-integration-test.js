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

assert.equal(
    pageSource.includes("renderExportPreparationReview"),
    false
);

assert.ok(
    controllerSource.includes(
        "ExportPreparationReviewPreview.create("
    )
);

assert.ok(
    controllerSource.includes(
        "onAddNote: () => this.addReviewNote()"
    )
);

assert.ok(
    controllerSource.includes(
        "onApprove: () => this.approveReview()"
    )
);

assert.ok(
    controllerSource.includes(
        "onReject: () => this.rejectReview()"
    )
);

assert.equal(
    pageSource.includes("renderExportPreparationReviewPanel"),
    false
);

console.log("Export preparation review QuestionCatalogPage integration test passed");
console.log("Controller construction count:", controllerCount);
console.log("Controller-managed review renderer: present");
console.log("Legacy review renderer present: false");
console.log("Review callbacks: add note, approve, reject");
