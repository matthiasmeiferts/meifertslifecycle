import assert from "node:assert/strict";
import ExportAuthorizationGatePreview from "../portal/ui/components/ExportAuthorizationGatePreview.js";

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

const requiredGate = {
    gateId: "export_authorization_gate-REP-001",
    gateType: "export_authorization_gate",
    sourceExportPreparationReviewId: "export_preparation_review-REP-001",
    status: "export_authorization_required",
    readiness: {
        exportPreparationReviewCompleted: true,
        exportAuthorizationRequired: true
    },
    permissions: {
        canExport: false,
        canCreateClientDocument: false,
        canFinalizeWorkflow: false
    },
    safetyBoundary: {
        exportFileCreated: false
    }
};

const requiredSnapshot = JSON.stringify(requiredGate);
const requiredPreview = ExportAuthorizationGatePreview.create(requiredGate);

assert.equal(
    requiredPreview.className,
    "export-authorization-gate-preview is-required"
);

assert.equal(
    requiredPreview.dataset.exportAuthorizationGateCard,
    ""
);

const requiredHeader = findByClassName(
    requiredPreview,
    "export-authorization-gate-preview__header"
);

assert.ok(requiredHeader);
assert.equal(requiredHeader.children[1].className, "status-badge default");
assert.equal(
    requiredHeader.children[1].textContent,
    "export_authorization_required"
);

const metadata = findByClassName(
    requiredPreview,
    "export-authorization-gate-preview__meta"
);

assert.ok(metadata);
assert.equal(metadata.children.length, 4);
assert.equal(metadata.children[0].children[0].textContent, "Gate ID");
assert.equal(
    metadata.children[0].children[1].textContent,
    "export_authorization_gate-REP-001"
);
assert.equal(metadata.children[2].children[1].textContent, "Yes");
assert.equal(metadata.children[3].children[1].textContent, "Required");

const safety = findByClassName(
    requiredPreview,
    "export-authorization-gate-preview__safety"
);

assert.ok(safety);
assert.equal(safety.children[0].textContent, "Safety boundary");

const locks = findByClassName(
    requiredPreview,
    "export-authorization-gate-preview__locks"
);

assert.ok(locks);
assert.equal(locks.children.length, 4);
assert.equal(locks.children[0].textContent, "Can export: false");
assert.equal(locks.children[1].textContent, "Can create client document: false");
assert.equal(locks.children[2].textContent, "Can finalize workflow: false");
assert.equal(locks.children[3].textContent, "Export file created: false");

assert.equal(findAllByTagName(requiredPreview, "button").length, 0);
assert.equal(JSON.stringify(requiredGate), requiredSnapshot);

const blockedGate = {
    gateId: null,
    gateType: "export_authorization_gate",
    sourceExportPreparationReviewId: null,
    status: "blocked_pending_export_preparation_review",
    readiness: {
        exportPreparationReviewCompleted: false,
        exportAuthorizationRequired: true
    },
    permissions: {
        canExport: false,
        canCreateClientDocument: false,
        canFinalizeWorkflow: false
    },
    safetyBoundary: {
        exportFileCreated: false
    }
};

const blockedPreview = ExportAuthorizationGatePreview.create(blockedGate);

assert.equal(
    blockedPreview.className,
    "export-authorization-gate-preview is-blocked"
);

const blockedMetadata = findByClassName(
    blockedPreview,
    "export-authorization-gate-preview__meta"
);

assert.ok(blockedMetadata);
assert.equal(blockedMetadata.children[0].children[1].textContent, "—");
assert.equal(
    blockedMetadata.children[1].children[1].textContent,
    "not available"
);
assert.equal(blockedMetadata.children[2].children[1].textContent, "No");
assert.equal(blockedMetadata.children[3].children[1].textContent, "Required");

assert.equal(findAllByTagName(blockedPreview, "button").length, 0);

console.log("Export authorization gate preview component test passed");
console.log("Required gate state:", requiredPreview.className);
console.log("Blocked gate state:", blockedPreview.className);
console.log("Safety lock count:", locks.children.length);
