import assert from "node:assert/strict";
import fs from "node:fs";
import QuestionCatalogPage from "../portal/ui/pages/QuestionCatalogPage.js";
import ExportPreparationGatePreview from "../portal/ui/components/ExportPreparationGatePreview.js";

const pagePath = new URL(
    "../portal/ui/pages/QuestionCatalogPage.js",
    import.meta.url
);

const pageSource = fs.readFileSync(pagePath, "utf8");

assert.ok(QuestionCatalogPage);
assert.ok(ExportPreparationGatePreview);

assert.ok(
    pageSource.includes(
        'import ExportPreparationGatePreview from "../components/ExportPreparationGatePreview.js";'
    )
);

const createCallCount = (
    pageSource.match(/ExportPreparationGatePreview\.create\(/g) || []
).length;

assert.equal(createCallCount, 1);

assert.ok(
    pageSource.includes(
        'expertReviewNode.querySelector("[data-export-flow-preview]")'
    )
);

assert.ok(
    pageSource.includes(
        "exportFlowNode.replaceChildren("
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

assert.ok(
    pageSource.includes("renderExportPreparationReview();")
);

console.log(
    "Export preparation gate QuestionCatalogPage integration test passed"
);
console.log("Export preparation gate component import: present");
console.log("Export preparation gate component render count:", createCallCount);
console.log("Legacy free gate renderer present: false");
console.log("Inline review duplication present: false");
