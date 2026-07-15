import assert from "node:assert/strict";
import InternalFinalizationReviewPreview from "../portal/ui/components/InternalFinalizationReviewPreview.js";

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

const blockedReview = {
    reviewId: "internal_finalization_review-REP-001",
    status: "blocked_pending_finalization_gate",
    notes: [],
    decision: null,
    permissions: {
        canExport: false,
        canCreateClientDocument: false,
        canFinalizeWorkflow: false
    }
};

const blockedPreview = InternalFinalizationReviewPreview.create(
    blockedReview,
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
    blockedPreview.className,
    "internal-finalization-review-preview is-blocked"
);

assert.equal(
    blockedPreview.dataset.internalFinalizationReviewPreview,
    ""
);

const blockedNote = findByClassName(
    blockedPreview,
    "internal-finalization-review-preview__note"
);

assert.ok(blockedNote);
assert.equal(
    blockedNote.children[0].textContent,
    "Expert Review approval required first."
);

const blockedButtons = findAllByTagName(blockedPreview, "button");

assert.equal(blockedButtons.length, 3);
assert.equal(blockedButtons.every(button => button.disabled), true);
assert.equal(blockedButtons[0].textContent, "Internal note locked");
assert.equal(blockedButtons[1].textContent, "Approval locked");
assert.equal(blockedButtons[2].textContent, "Reject locked");

blockedButtons.forEach(button => button.click());

assert.equal(addNoteCount, 0);
assert.equal(approveCount, 0);
assert.equal(rejectCount, 0);

const requiredReviewWithoutNote = {
    ...blockedReview,
    status: "internal_review_required"
};

const requiredPreviewWithoutNote = InternalFinalizationReviewPreview.create(
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
    "internal-finalization-review-preview is-required"
);

const requiredButtons = findAllByTagName(
    requiredPreviewWithoutNote,
    "button"
);

assert.equal(requiredButtons[0].disabled, false);
assert.equal(requiredButtons[0].textContent, "Add internal note");
assert.equal(requiredButtons[1].disabled, true);
assert.equal(requiredButtons[2].disabled, true);
assert.equal(
    requiredButtons[1].title,
    "Internal finalization note required first."
);

requiredButtons[0].click();

assert.equal(addNoteCount, 1);

const requiredReviewWithNote = {
    ...requiredReviewWithoutNote,
    notes: [
        {
            category: "internal-finalization",
            text: "Internal finalization note."
        }
    ]
};

const requiredPreviewWithNote = InternalFinalizationReviewPreview.create(
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
    "internal-finalization-review-preview__note"
);

assert.ok(notePreview);
assert.equal(notePreview.children[0].textContent, "internal-finalization");
assert.equal(notePreview.children[1].textContent, "Internal finalization note.");

const unlockedButtons = findAllByTagName(
    requiredPreviewWithNote,
    "button"
);

assert.equal(unlockedButtons[0].disabled, true);
assert.equal(unlockedButtons[0].textContent, "Internal note added");
assert.equal(unlockedButtons[1].disabled, false);
assert.equal(unlockedButtons[2].disabled, false);

unlockedButtons[1].click();
unlockedButtons[2].click();

assert.equal(approveCount, 1);
assert.equal(rejectCount, 1);

const approvedReview = {
    ...requiredReviewWithNote,
    status: "internally_approved",
    decision: {
        decisionType: "internally_approved",
        comment: "Internal review approved."
    }
};

const approvedPreview = InternalFinalizationReviewPreview.create(approvedReview);

assert.equal(
    approvedPreview.className,
    "internal-finalization-review-preview is-approved"
);

const approvedDecision = findByClassName(
    approvedPreview,
    "internal-finalization-review-preview__decision"
);

assert.ok(approvedDecision);
assert.equal(approvedDecision.children[0].textContent, "Decision");
assert.equal(approvedDecision.children[1].textContent, "Internal review approved.");

const rejectedReview = {
    ...requiredReviewWithNote,
    status: "internally_rejected",
    decision: {
        decisionType: "internally_rejected",
        comment: "Internal review rejected."
    }
};

const rejectedPreview = InternalFinalizationReviewPreview.create(rejectedReview);

assert.equal(
    rejectedPreview.className,
    "internal-finalization-review-preview is-rejected"
);

const safety = findByClassName(
    rejectedPreview,
    "internal-finalization-review-preview__safety"
);

assert.ok(safety);
assert.equal(
    safety.textContent,
    "canExport: false · canCreateClientDocument: false · canFinalizeWorkflow: false"
);

console.log("Internal finalization review preview component test passed");
console.log("Blocked state:", blockedPreview.className);
console.log("Required state:", requiredPreviewWithoutNote.className);
console.log("Approved state:", approvedPreview.className);
console.log("Rejected state:", rejectedPreview.className);
console.log("Action callbacks:", {
    addNoteCount,
    approveCount,
    rejectCount
});
