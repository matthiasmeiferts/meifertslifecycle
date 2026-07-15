import assert from "node:assert/strict";
import FinalizationGatePreview from "../portal/ui/components/FinalizationGatePreview.js";

function createMockElement(tagName) {
    return {
        tagName,
        className: "",
        textContent: "",
        dataset: {},
        children: [],
        appendChild(child) {
            this.children.push(child);
            return child;
        }
    };
}

function findByClassName(element, className) {
    if (element.className.split(" ").includes(className)) {
        return element;
    }

    for (const child of element.children) {
        const match = findByClassName(child, className);

        if (match) {
            return match;
        }
    }

    return null;
}

function findAllByTagName(element, tagName, matches = []) {
    if (element.tagName === tagName) {
        matches.push(element);
    }

    element.children.forEach(child => {
        findAllByTagName(child, tagName, matches);
    });

    return matches;
}

global.document = {
    createElement: createMockElement
};

const readyGate = {
    gateId: "finalization_gate-REP-001",
    gateType: "controlled_finalization_gate",
    status: "ready_for_internal_finalization_review",
    readiness: {
        expertReviewApproved: true,
        internalFinalizationReviewRequired: true
    },
    permissions: {
        canExport: false,
        canCreateClientDocument: false,
        canFinalizeWorkflow: false
    }
};

const readySnapshot = JSON.stringify(readyGate);
const readyPreview = FinalizationGatePreview.create(readyGate);

assert.equal(
    readyPreview.className,
    "finalization-gate-preview is-ready"
);

assert.equal(
    readyPreview.dataset.finalizationGatePreview,
    ""
);

const readyMetadata = findByClassName(
    readyPreview,
    "finalization-gate-preview__summary"
);

assert.ok(readyMetadata);
assert.equal(readyMetadata.children.length, 4);
assert.equal(readyMetadata.children[0].children[0].textContent, "Gate ID");
assert.equal(
    readyMetadata.children[0].children[1].textContent,
    "finalization_gate-REP-001"
);
assert.equal(readyMetadata.children[2].children[1].textContent, "Yes");
assert.equal(readyMetadata.children[3].children[1].textContent, "Required");

const readySafety = findByClassName(
    readyPreview,
    "finalization-gate-preview__safety"
);

assert.ok(readySafety);
assert.equal(
    readySafety.textContent,
    "canExport: false · canCreateClientDocument: false · canFinalizeWorkflow: false"
);

assert.equal(findAllByTagName(readyPreview, "button").length, 0);
assert.equal(JSON.stringify(readyGate), readySnapshot);

const blockedGate = {
    gateId: null,
    gateType: "controlled_finalization_gate",
    status: "blocked_pending_expert_approval",
    readiness: {
        expertReviewApproved: false,
        internalFinalizationReviewRequired: true
    },
    permissions: {
        canExport: false,
        canCreateClientDocument: false,
        canFinalizeWorkflow: false
    }
};

const blockedPreview = FinalizationGatePreview.create(blockedGate);

assert.equal(
    blockedPreview.className,
    "finalization-gate-preview is-blocked"
);

const blockedMetadata = findByClassName(
    blockedPreview,
    "finalization-gate-preview__summary"
);

assert.ok(blockedMetadata);
assert.equal(blockedMetadata.children[0].children[1].textContent, "—");
assert.equal(
    blockedMetadata.children[1].children[1].textContent,
    "blocked_pending_expert_approval"
);
assert.equal(blockedMetadata.children[2].children[1].textContent, "No");
assert.equal(blockedMetadata.children[3].children[1].textContent, "Required");

assert.equal(findAllByTagName(blockedPreview, "button").length, 0);

console.log("Finalization gate preview component test passed");
console.log("Ready gate state:", readyPreview.className);
console.log("Blocked gate state:", blockedPreview.className);
console.log("Safety text:", readySafety.textContent);
