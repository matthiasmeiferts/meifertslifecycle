import assert from "node:assert/strict";
import ExportPreparationReviewPreview from "../portal/ui/components/ExportPreparationReviewPreview.js";

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

let addNoteCount = 0;
let approveCount = 0;
let rejectCount = 0;

const requiredReviewWithoutNote = {
    reviewId: "export_preparation_review-REP-001",
    reviewType: "export_preparation_review",
    sourceExportPreparationGateId: "export_preparation_gate-REP-001",
    status: "review_required",
    notes: [],
    decision: null,
    readiness: {
        exportPreparationReviewCompleted: false
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

const requiredSnapshot = JSON.stringify(requiredReviewWithoutNote);

const requiredPreviewWithoutNote = ExportPreparationReviewPreview.create(
    requiredReviewWithoutNote,
    {
        onAddNote: () => {
            addNoteCount += 1;
        },
        onApprove: () => {
            approveCount += 1;
        },
        onReject: () => {
            rejectCount += 1;
        }
    }
);

assert.equal(
    requiredPreviewWithoutNote.className,
    "export-preparation-review-preview is-required"
);

assert.equal(
    requiredPreviewWithoutNote.dataset.exportPreparationReviewCard,
    ""
);

const requiredMetadata = findByClassName(
    requiredPreviewWithoutNote,
    "export-preparation-review-preview__meta"
);

assert.ok(requiredMetadata);
assert.equal(requiredMetadata.children.length, 4);
assert.equal(requiredMetadata.children[0].children[0].textContent, "Review ID");
assert.equal(
    requiredMetadata.children[0].children[1].textContent,
    "export_preparation_review-REP-001"
);
assert.equal(requiredMetadata.children[2].children[1].textContent, "0");
assert.equal(requiredMetadata.children[3].children[1].textContent, "No");

const emptyNote = findByClassName(
    requiredPreviewWithoutNote,
    "export-preparation-review-preview__note"
);

assert.ok(emptyNote);
assert.equal(
    emptyNote.children[0].textContent,
    "No export preparation review note added yet."
);

const requiredButtons = findAllByTagName(
    requiredPreviewWithoutNote,
    "button"
);

assert.equal(requiredButtons.length, 3);

assert.equal(requiredButtons[0].disabled, false);
assert.equal(
    requiredButtons[0].textContent,
    "Add export preparation review note"
);

assert.equal(requiredButtons[1].disabled, true);
assert.equal(requiredButtons[1].textContent, "Approval locked");
assert.equal(
    requiredButtons[1].title,
    "Export preparation review note required first."
);

assert.equal(requiredButtons[2].disabled, true);
assert.equal(requiredButtons[2].textContent, "Reject locked");

requiredButtons[0].click();
requiredButtons[1].click();
requiredButtons[2].click();

assert.equal(addNoteCount, 1);
assert.equal(approveCount, 0);
assert.equal(rejectCount, 0);
assert.equal(
    JSON.stringify(requiredReviewWithoutNote),
    requiredSnapshot
);

const requiredReviewWithNote = {
    ...requiredReviewWithoutNote,
    notes: [
        {
            category: "export-preparation",
            text: "Export preparation review note."
        }
    ]
};

const requiredPreviewWithNote = ExportPreparationReviewPreview.create(
    requiredReviewWithNote,
    {
        onAddNote: () => {
            addNoteCount += 1;
        },
        onApprove: () => {
            approveCount += 1;
        },
        onReject: () => {
            rejectCount += 1;
        }
    }
);

const notePreview = findByClassName(
    requiredPreviewWithNote,
    "export-preparation-review-preview__note"
);

assert.ok(notePreview);
assert.equal(notePreview.children[0].textContent, "export-preparation");
assert.equal(
    notePreview.children[1].textContent,
    "Export preparation review note."
);

const unlockedButtons = findAllByTagName(
    requiredPreviewWithNote,
    "button"
);

assert.equal(unlockedButtons[0].disabled, true);
assert.equal(
    unlockedButtons[0].textContent,
    "Export preparation note added"
);

assert.equal(unlockedButtons[1].disabled, false);
assert.equal(
    unlockedButtons[1].textContent,
    "Approve export preparation review"
);

assert.equal(unlockedButtons[2].disabled, false);
assert.equal(
    unlockedButtons[2].textContent,
    "Reject export preparation review"
);

unlockedButtons[1].click();
unlockedButtons[2].click();

assert.equal(approveCount, 1);
assert.equal(rejectCount, 1);

const approvedReview = {
    ...requiredReviewWithNote,
    status: "approved",
    decision: {
        decisionType: "approved",
        comment: "Export preparation review approved."
    },
    readiness: {
        exportPreparationReviewCompleted: true
    }
};

const approvedPreview = ExportPreparationReviewPreview.create(approvedReview);

assert.equal(
    approvedPreview.className,
    "export-preparation-review-preview is-approved"
);

const approvedNotePreview = findByClassName(
    approvedPreview,
    "export-preparation-review-preview__note"
);

const decisionPreview = findByClassName(
    approvedNotePreview,
    "export-preparation-review-preview__decision"
);

assert.ok(decisionPreview);
assert.equal(decisionPreview.children[0].textContent, "Decision");
assert.equal(
    decisionPreview.children[1].textContent,
    "Export preparation review approved."
);

const approvedButtons = findAllByTagName(approvedPreview, "button");
assert.equal(approvedButtons.every(button => button.disabled), true);

const rejectedReview = {
    ...requiredReviewWithNote,
    status: "rejected",
    decision: {
        decisionType: "rejected",
        comment: "Export preparation review rejected."
    }
};

const rejectedPreview = ExportPreparationReviewPreview.create(rejectedReview);

assert.equal(
    rejectedPreview.className,
    "export-preparation-review-preview is-rejected"
);

const locks = findByClassName(
    rejectedPreview,
    "export-preparation-review-preview__locks"
);

assert.ok(locks);
assert.equal(locks.children.length, 4);
assert.equal(locks.children[0].textContent, "Can export: false");
assert.equal(locks.children[1].textContent, "Can create client document: false");
assert.equal(locks.children[2].textContent, "Can finalize workflow: false");
assert.equal(locks.children[3].textContent, "Export file created: false");

console.log("Export preparation review preview component test passed");
console.log("Required state:", requiredPreviewWithoutNote.className);
console.log("Approved state:", approvedPreview.className);
console.log("Rejected state:", rejectedPreview.className);
console.log("Action callbacks:", {
    addNoteCount,
    approveCount,
    rejectCount
});
