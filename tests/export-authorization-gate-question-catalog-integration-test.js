import assert from "node:assert/strict";
import fs from "node:fs";
import QuestionCatalogPage from "../portal/ui/pages/QuestionCatalogPage.js";
import ExportAuthorizationGatePreview from "../portal/ui/components/ExportAuthorizationGatePreview.js";

const pagePath = new URL(
    "../portal/ui/pages/QuestionCatalogPage.js",
    import.meta.url
);

const pageSource = fs.readFileSync(pagePath, "utf8");

assert.ok(QuestionCatalogPage);
assert.ok(ExportAuthorizationGatePreview);

assert.ok(
    pageSource.includes(
        'import ExportAuthorizationGatePreview from "../components/ExportAuthorizationGatePreview.js";'
    )
);

const createCallCount = (
    pageSource.match(/ExportAuthorizationGatePreview\.create\(/g) || []
).length;

assert.equal(createCallCount, 1);

assert.equal(
    pageSource.includes("renderExportAuthorizationGatePanel"),
    false
);

assert.ok(
    pageSource.includes(
        "exportAuthorizationGateNode.replaceChildren("
    )
);

assert.equal(
    pageSource.includes(
        "ExportAuthorizationGatePreview.create(currentExportAuthorizationGate).addEventListener"
    ),
    false
);

console.log(
    "Export authorization gate QuestionCatalogPage integration test passed"
);
console.log("Export authorization component import: present");
console.log("Export authorization component render count:", createCallCount);
console.log("Legacy export authorization renderer present: false");
console.log("Export authorization actions added: false");
