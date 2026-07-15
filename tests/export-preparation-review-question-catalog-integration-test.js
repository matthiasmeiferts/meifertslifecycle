import assert from "node:assert/strict";
import fs from "node:fs";
import QuestionCatalogPage from "../portal/ui/pages/QuestionCatalogPage.js";
import ExportPreparationReviewPreview from "../portal/ui/components/ExportPreparationReviewPreview.js";

const pagePath = new URL(
    "../portal/ui/pages/QuestionCatalogPage.js",
    import.meta.url
);

const pageSource = fs.readFileSync(pagePath, "utf8");

assert.ok(QuestionCatalogPage);
assert.ok(ExportPreparationReviewPreview);

assert.ok(
    pageSource.includes(
        'import ExportPreparationReviewPreview from "../components/ExportPreparationReviewPreview.js";'
    )
);

const rendererCount = (
    pageSource.match(/const renderExportPreparationReview = \(\) =>/g) || []
).length;

assert.equal(rendererCount, 1);

const createCallCount = (
    pageSource.match(/ExportPreparationReviewPreview\.create\(/g) || []
).length;

assert.equal(createCallCount, 1);

assert.equal(
    pageSource.includes("renderExportPreparationReviewPanel"),
    false
);

assert.ok(
    pageSource.includes("onAddNote: () =>")
);

assert.ok(
    pageSource.includes("onApprove: () =>")
);

assert.ok(
    pageSource.includes("onReject: () =>")
);

assert.ok(
    pageSource.includes("renderExportAuthorizationGate();")
);

console.log(
    "Export preparation review QuestionCatalogPage integration test passed"
);
console.log("Export preparation review component import: present");
console.log("Active review renderer count:", rendererCount);
console.log("Component render count:", createCallCount);
console.log("Legacy review renderer present: false");
console.log("Review callbacks: add note, approve, reject");
