import assert from "node:assert/strict";
import fs from "node:fs";
import QuestionCatalogPage from "../portal/ui/pages/QuestionCatalogPage.js";
import FinalizationGatePreview from "../portal/ui/components/FinalizationGatePreview.js";

const pagePath = new URL(
    "../portal/ui/pages/QuestionCatalogPage.js",
    import.meta.url
);

const pageSource = fs.readFileSync(pagePath, "utf8");

assert.ok(QuestionCatalogPage);
assert.ok(FinalizationGatePreview);

assert.ok(
    pageSource.includes(
        'import FinalizationGatePreview from "../components/FinalizationGatePreview.js";'
    )
);

const createCallCount = (
    pageSource.match(/FinalizationGatePreview\.create\(/g) || []
).length;

assert.equal(createCallCount, 1);

assert.ok(
    pageSource.includes(
        "finalizationGateNode.replaceChildren("
    )
);

assert.equal(pageSource.includes("gateIdNode"), false);
assert.equal(pageSource.includes("gateStatusNode"), false);
assert.equal(pageSource.includes("gateExpertApprovedNode"), false);
assert.equal(pageSource.includes("gateSafetyNode"), false);

assert.ok(
    pageSource.includes("renderInternalFinalizationReview(gate);")
);

console.log(
    "Finalization gate QuestionCatalogPage integration test passed"
);
console.log("Finalization gate component import: present");
console.log("Finalization gate component render count:", createCallCount);
console.log("Legacy finalization gate DOM bindings present: false");
