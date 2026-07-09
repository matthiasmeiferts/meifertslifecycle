import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const pageSource = readFileSync("portal/ui/pages/QuestionCatalogPage.js", "utf8");

assert.ok(
    pageSource.includes("const scrollToFinalizationGate = () =>"),
    "QuestionCatalogPage must define a finalization gate scroll helper."
);

assert.ok(
    pageSource.includes("finalizationGateNode.scrollIntoView"),
    "Finalization gate preview must use scrollIntoView for browser visibility."
);

assert.ok(
    pageSource.includes('behavior: "smooth"'),
    "Finalization gate auto-scroll should use smooth scrolling."
);

assert.ok(
    pageSource.includes('block: "center"'),
    "Finalization gate auto-scroll should center the gate in the viewport."
);

const scrollCallCount = pageSource.match(/scrollToFinalizationGate\(\);/g)?.length || 0;

assert.ok(
    scrollCallCount >= 2,
    "Approve and reject review actions must both scroll to the finalization gate."
);

console.log("Finalization gate browser autoscroll test passed");
console.log(`Scroll calls: ${scrollCallCount}`);
console.log("Smooth scroll: true");
console.log("Viewport center: true");
