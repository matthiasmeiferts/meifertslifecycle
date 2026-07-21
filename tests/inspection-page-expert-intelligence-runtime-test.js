import assert from "node:assert/strict";

class MemoryStorage {
    constructor() {
        this.values = new Map();
    }

    getItem(key) {
        return this.values.has(key) ? this.values.get(key) : null;
    }

    setItem(key, value) {
        this.values.set(key, String(value));
    }

    removeItem(key) {
        this.values.delete(key);
    }
}

class TestElement {
    constructor(tagName) {
        this.tagName = tagName;
        this.children = [];
        this.dataset = {};
        this.className = "";
        this.textContent = "";
        this.disabled = false;
        this.listeners = {};
    }

    appendChild(child) {
        this.children.push(child);
        return child;
    }

    addEventListener(type, listener) {
        this.listeners[type] = listener;
    }

    querySelector(selector) {
        const dataKey = selector.match(/^\[data-([a-z-]+)\]$/)?.[1]
            ?.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

        if (dataKey && Object.hasOwn(this.dataset, dataKey)) {
            return this;
        }

        for (const child of this.children) {
            const match = child.querySelector?.(selector);
            if (match) return match;
        }

        return null;
    }
}

globalThis.localStorage = new MemoryStorage();
globalThis.document = {
    createElement(tagName) {
        return new TestElement(tagName);
    }
};

const { default: InspectionPage } = await import("../portal/ui/pages/InspectionPage.js");

const panel = InspectionPage.createExpertIntelligenceRuntimePanel({ id: "inspection-ui" });
const trigger = panel.children[0].children.find((entry) => {
    return entry.dataset.action === "run-expert-intelligence";
});

assert.ok(trigger);
assert.equal(trigger.disabled, false);
assert.equal(typeof trigger.listeners.click, "function");
assert.equal(panel.querySelector("[data-expert-intelligence-status]").dataset.expertIntelligenceStatus, "not_run");

const safeCorruptionState = InspectionPage.createExpertIntelligenceRuntimeSummary({
    status: "not_run",
    latest: null,
    stale: false,
    corruption: {
        detected: true,
        count: 2,
        records: []
    }
});
const corruptionNotice = safeCorruptionState.querySelector("[data-expert-intelligence-corruption]");
assert.ok(corruptionNotice);
assert.match(corruptionNotice.textContent, /2 malformed Expert Intelligence execution records were excluded/);
assert.match(corruptionNotice.textContent, /Human review/);

const resultSummary = InspectionPage.createExpertIntelligenceRuntimeSummary({
    status: "succeeded",
    stale: true,
    corruption: { detected: false, count: 0, records: [] },
    latest: {
        id: "EI-inspection-ui-0001",
        engineStatus: "succeeded",
        selectedDomain: "structural-systems",
        selectedProvider: "StructuralSystemsKnowledgeProvider",
        reasoningResult: {
            supportingEvidence: ["indicator"],
            missingEvidence: ["verification"],
            confidence: 1
        },
        internalModelResult: { domainAssessments: [], conflicts: [] },
        interpretationModelResult: { interpretationState: "INTERPRETED", domainInterpretations: [] },
        limitations: ["Visual inspection only."],
        humanReviewRequired: true
    }
});

assert.ok(resultSummary.querySelector("[data-expert-intelligence-stale]"));
assert.match(resultSummary.textContent + resultSummary.children.map((entry) => entry.textContent).join(" "), /execution succeeded/i);

console.log("Inspection Page Expert Intelligence runtime integration test completed successfully.");
