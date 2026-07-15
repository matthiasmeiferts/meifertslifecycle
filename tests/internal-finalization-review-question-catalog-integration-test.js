import assert from "node:assert/strict";
import fs from "node:fs";
import QuestionCatalogPage from "../portal/ui/pages/QuestionCatalogPage.js";
import InternalFinalizationReviewPreview from "../portal/ui/components/InternalFinalizationReviewPreview.js";

const pagePath = new URL(
    "../portal/ui/pages/QuestionCatalogPage.js",
    import.meta.url
);

const pageSource = fs.readFileSync(pagePath, "utf8");

assert.ok(QuestionCatalogPage);
assert.ok(InternalFinalizationReviewPreview);

assert.ok(
    pageSource.includes(
        'import InternalFinalizationReviewPreview from "../components/InternalFinalizationReviewPreview.js";'
    )
);

const createCallCount = (
    pageSource.match(/InternalFinalizationReviewPreview\.create\(/g) || []
).length;

assert.equal(createCallCount, 1);

assert.ok(
    pageSource.includes(
        "internalReviewNode.replaceChildren("
    )
);

assert.ok(pageSource.includes("onAddNote: () =>"));
assert.ok(pageSource.includes("onApprove: () =>"));
assert.ok(pageSource.includes("onReject: () =>"));

assert.equal(
    pageSource.includes("addInternalNoteButton"),
    false
);

assert.equal(
    pageSource.includes("approveInternalButton"),
    false
);

assert.equal(
    pageSource.includes("rejectInternalButton"),
    false
);

assert.equal(
    pageSource.includes("internalReviewIdNode"),
    false
);

assert.equal(
    pageSource.includes("internalReviewStatusNode"),
    false
);

assert.equal(
    pageSource.includes("internalReviewNotesNode"),
    false
);

console.log(
    "Internal finalization review QuestionCatalogPage integration test passed"
);
console.log("Internal review component import: present");
console.log("Internal review component render count:", createCallCount);
console.log("Legacy internal review DOM bindings present: false");
console.log("Internal review callbacks: add note, approve, reject");
