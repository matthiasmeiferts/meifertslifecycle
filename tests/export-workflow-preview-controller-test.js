import assert from "node:assert/strict";
import ExportWorkflowPreviewController from "../portal/ui/controllers/ExportWorkflowPreviewController.js";

function createMockElement(tagName) {
    return {
        tagName,
        className: "",
        textContent: "",
        type: "",
        disabled: false,
        title: "",
        dataset: {},
        children: [],
        listeners: {},
        appendChild(child) {
            this.children.push(child);
            return child;
        },
        replaceChildren(...children) {
            this.children = children;
        },
        addEventListener(eventName, handler) {
            this.listeners[eventName] = handler;
        },
        click() {
            if (!this.disabled && typeof this.listeners.click === "function") {
                this.listeners.click({ type: "click" });
            }
        }
    };
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

const missingSlotsController = new ExportWorkflowPreviewController();

assert.equal(missingSlotsController.isReady(), false);
assert.equal(
    missingSlotsController.startFromInternalReview({}),
    null
);

const nodes = {
    exportPreparationGateNode: createMockElement("div"),
    exportPreparationReviewNode: createMockElement("div"),
    exportAuthorizationGateNode: createMockElement("div"),
    reportExportPreparationPackageNode: createMockElement("div"),
    reportExportAssemblyNode: createMockElement("div")
};

const timestamps = [
    "2026-07-16T10:00:00.000Z",
    "2026-07-16T10:01:00.000Z",
    "2026-07-16T10:02:00.000Z",
    "2026-07-16T10:03:00.000Z",
    "2026-07-16T10:04:00.000Z",
    "2026-07-16T10:04:00.000Z",
    "2026-07-16T10:06:00.000Z",
    "2026-07-16T10:07:00.000Z",
    "2026-07-16T10:08:00.000Z",
    "2026-07-16T10:09:00.000Z",
    "2026-07-16T10:10:00.000Z",
    "2026-07-16T10:11:00.000Z"
];

let timestampIndex = 0;

const controller = new ExportWorkflowPreviewController({
    ...nodes,
    reviewer: "Matthias Meiferts",
    now: () => timestamps[timestampIndex++]
});

assert.equal(controller.isReady(), true);

const internalReview = {
    reviewId: "internal_finalization_review-draft-001",
    sourceGateId: "finalization_gate-draft-001",
    sourceReviewId: "expert_review-draft-001",
    sourceDraftId: "draft-001",
    status: "internally_approved",
    readiness: {
        internalReviewCompleted: true
    },
    permissions: {
        canExport: false,
        canCreateClientDocument: false,
        canFinalizeWorkflow: false
    },
    safetyBoundary: {
        internalFinalizationReviewCompleted: true
    }
};

const initialState = controller.startFromInternalReview(internalReview);

assert.ok(initialState);
assert.equal(
    initialState.exportPreparationGate.status,
    "export_preparation_review_required"
);
assert.equal(
    initialState.exportPreparationReview.status,
    "review_required"
);
assert.equal(
    initialState.exportAuthorizationGate.status,
    "blocked_pending_export_preparation_review"
);

Object.values(nodes).forEach(node => {
    assert.equal(node.children.length, 1);
});

assert.equal(
    nodes.exportPreparationGateNode.children[0].className,
    "export-preparation-gate-preview is-required"
);

assert.equal(
    nodes.exportPreparationReviewNode.children[0].className,
    "export-preparation-review-preview is-required"
);

const initialReviewButtons = findAllByTagName(
    nodes.exportPreparationReviewNode.children[0],
    "button"
);

assert.equal(initialReviewButtons.length, 3);
assert.equal(initialReviewButtons[0].disabled, false);
assert.equal(initialReviewButtons[1].disabled, true);
assert.equal(initialReviewButtons[2].disabled, true);

initialReviewButtons[0].click();

const notedState = controller.getState();

assert.equal(
    notedState.exportPreparationReview.notes.length,
    1
);
assert.equal(
    notedState.exportPreparationReview.notes[0].author,
    "Matthias Meiferts"
);
assert.equal(
    notedState.exportPreparationReview.notes[0].createdAt,
    "2026-07-16T10:04:00.000Z"
);

const notedReviewButtons = findAllByTagName(
    nodes.exportPreparationReviewNode.children[0],
    "button"
);

assert.equal(notedReviewButtons[0].disabled, true);
assert.equal(notedReviewButtons[1].disabled, false);
assert.equal(notedReviewButtons[2].disabled, false);

notedReviewButtons[1].click();

const approvedState = controller.getState();

assert.equal(
    approvedState.exportPreparationReview.status,
    "approved"
);
assert.equal(
    approvedState.exportPreparationReview.decision.decidedBy,
    "Matthias Meiferts"
);
assert.equal(
    approvedState.exportAuthorizationGate.status,
    "export_authorization_required"
);
assert.equal(
    approvedState.exportAuthorizationGate.permissions.canExport,
    false
);
assert.equal(
    approvedState.reportExportPreparationPackage.permissions.canExport,
    false
);
assert.equal(
    approvedState.reportExportAssemblyPreview.permissions.canExport,
    false
);

const rejectNodes = {
    exportPreparationGateNode: createMockElement("div"),
    exportPreparationReviewNode: createMockElement("div"),
    exportAuthorizationGateNode: createMockElement("div"),
    reportExportPreparationPackageNode: createMockElement("div"),
    reportExportAssemblyNode: createMockElement("div")
};

let rejectTimeIndex = 0;

const rejectController = new ExportWorkflowPreviewController({
    ...rejectNodes,
    reviewer: "Matthias Meiferts",
    now: () => `2026-07-16T11:${String(rejectTimeIndex++).padStart(2, "0")}:00.000Z`
});

rejectController.startFromInternalReview(internalReview);
rejectController.addReviewNote();
rejectController.rejectReview();

const rejectedState = rejectController.getState();

assert.equal(
    rejectedState.exportPreparationReview.status,
    "rejected"
);
assert.equal(
    rejectedState.exportAuthorizationGate.status,
    "blocked_pending_export_preparation_review"
);
assert.equal(
    rejectedState.exportAuthorizationGate.permissions.canExport,
    false
);
assert.equal(
    rejectedState.reportExportPreparationPackage.permissions.canExport,
    false
);
assert.equal(
    rejectedState.reportExportAssemblyPreview.permissions.canExport,
    false
);

console.log("Export workflow preview controller test passed");
console.log("Initial review state:", initialState.exportPreparationReview.status);
console.log("Approved review state:", approvedState.exportPreparationReview.status);
console.log("Rejected review state:", rejectedState.exportPreparationReview.status);
console.log("All export permissions remain false");
