import assert from "node:assert/strict";
import fs from "node:fs";
import QuestionCatalogPage from "../portal/ui/pages/QuestionCatalogPage.js";
import ExpertReviewPreview from "../portal/ui/components/ExpertReviewPreview.js";

const pagePath = new URL(
    "../portal/ui/pages/QuestionCatalogPage.js",
    import.meta.url
);

const pageSource = fs.readFileSync(pagePath, "utf8");

assert.ok(QuestionCatalogPage);
assert.ok(ExpertReviewPreview);

assert.ok(
    pageSource.includes(
        'import ExpertReviewPreview from "../components/ExpertReviewPreview.js";'
    )
);

const createCallCount = (
    pageSource.match(/ExpertReviewPreview\.create\(/g) || []
).length;

assert.equal(createCallCount, 1);

assert.ok(
    pageSource.includes(
        "expertReviewNode.replaceChildren("
    )
);

assert.ok(pageSource.includes("onAddNote: () =>"));
assert.ok(pageSource.includes("onApprove: () =>"));
assert.ok(pageSource.includes("onReject: () =>"));

[
    "reviewIdNode",
    "reviewStatusNode",
    "reviewNotesNode",
    "reviewNotePreviewNode",
    "reviewSafetyNode",
    "addNoteButton",
    "approveButton",
    "rejectButton"
].forEach(name => {
    assert.equal(pageSource.includes(name), false);
});

assert.ok(
    pageSource.includes("renderFinalizationGate();")
);

console.log(
    "Expert review QuestionCatalogPage integration test passed"
);
console.log("Expert review component import: present");
console.log("Expert review component render count:", createCallCount);
console.log("Legacy expert review DOM bindings present: false");
console.log("Expert review callbacks: add note, approve, reject");
