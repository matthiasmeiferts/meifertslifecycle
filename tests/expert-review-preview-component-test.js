import assert from "node:assert/strict";
import ExpertReviewPreview from "../portal/ui/components/ExpertReviewPreview.js";

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

const requiredReview = {
    reviewId: "expert_review-draft-001",
    status: "review_required",
    notes: [],
    decision: null,
    permissions: {
        canExport: false,
        canCreateClientDocument: false,
        canFinalizeWorkflow: false
    },
    safetyBoundary: {
        expertApprovalGranted: false
    }
};

const requiredPreview = ExpertReviewPreview.create(requiredReview, {
    onAddNote: () => {
        addNoteCount += 1;
    },
    onApprove: () => {
        approveCount += 1;
    },
    onReject: () => {
        rejectCount += 1;
    }
});

assert.equal(
    requiredPreview.className,
    "expert-review-preview is-review-required is-note-required"
);

assert.equal(requiredPreview.dataset.expertReviewPreview, "");

const requiredMetadata = findByClassName(
    requiredPreview,
    "expert-review-preview__summary"
);

assert.ok(requiredMetadata);
assert.equal(requiredMetadata.children.length, 3);
assert.equal(
    requiredMetadata.children[0].children[1].textContent,
    "expert_review-draft-001"
);
assert.equal(
    requiredMetadata.children[1].children[1].textContent,
    "review_required"
);
assert.equal(requiredMetadata.children[2].children[1].textContent, "0");

const requiredNote = findByClassName(
    requiredPreview,
    "expert-review-preview__note"
);

assert.ok(requiredNote);
assert.equal(
    requiredNote.children[0].textContent,
    "No review note added yet."
);

const requiredButtons = findAllByTagName(requiredPreview, "button");

assert.equal(requiredButtons.length, 3);
assert.equal(requiredButtons[0].disabled, false);
assert.equal(requiredButtons[0].textContent, "Add review note");
assert.equal(requiredButtons[1].disabled, true);
assert.equal(requiredButtons[1].textContent, "Approval locked");
assert.equal(requiredButtons[2].disabled, true);
assert.equal(requiredButtons[2].textContent, "Reject locked");

requiredButtons[0].click();
requiredButtons[1].click();
requiredButtons[2].click();

assert.equal(addNoteCount, 1);
assert.equal(approveCount, 0);
assert.equal(rejectCount, 0);

const reviewWithNote = {
    ...requiredReview,
    notes: [
        {
            category: "expert-review",
            text: "Expert review note."
        }
    ]
};

const reviewWithNotePreview = ExpertReviewPreview.create(reviewWithNote, {
    onAddNote: () => {
        addNoteCount += 1;
    },
    onApprove: () => {
        approveCount += 1;
    },
    onReject: () => {
        rejectCount += 1;
    }
});

assert.equal(
    reviewWithNotePreview.className,
    "expert-review-preview is-review-required"
);

const notePreview = findByClassName(
    reviewWithNotePreview,
    "expert-review-preview__note"
);

assert.ok(notePreview);
assert.equal(notePreview.children[0].textContent, "expert-review");
assert.equal(notePreview.children[1].textContent, "Expert review note.");

const unlockedButtons = findAllByTagName(
    reviewWithNotePreview,
    "button"
);

assert.equal(unlockedButtons[0].disabled, true);
assert.equal(unlockedButtons[0].textContent, "Review note added");
assert.equal(unlockedButtons[1].disabled, false);
assert.equal(unlockedButtons[1].textContent, "Approve review");
assert.equal(unlockedButtons[2].disabled, false);
assert.equal(unlockedButtons[2].textContent, "Reject review");

unlockedButtons[1].click();
unlockedButtons[2].click();

assert.equal(approveCount, 1);
assert.equal(rejectCount, 1);

const approvedReview = {
    ...reviewWithNote,
    status: "approved",
    decision: {
        decisionType: "approved",
        comment: "Expert review approved."
    },
    safetyBoundary: {
        expertApprovalGranted: true
    }
};

const approvedPreview = ExpertReviewPreview.create(approvedReview);

assert.equal(
    approvedPreview.className,
    "expert-review-preview is-approved"
);

const approvedDecision = findByClassName(
    approvedPreview,
    "expert-review-preview__decision"
);

assert.ok(approvedDecision);
assert.equal(approvedDecision.children[0].textContent, "Decision");
assert.equal(
    approvedDecision.children[1].textContent,
    "Expert review approved."
);

const approvedButtons = findAllByTagName(approvedPreview, "button");

assert.equal(approvedButtons.every(button => button.disabled), true);

const rejectedReview = {
    ...reviewWithNote,
    status: "rejected",
    decision: {
        decisionType: "rejected",
        comment: "Expert review rejected."
    },
    safetyBoundary: {
        expertApprovalGranted: false
    }
};

const rejectedPreview = ExpertReviewPreview.create(rejectedReview);

assert.equal(
    rejectedPreview.className,
    "expert-review-preview is-rejected"
);

const safety = findByClassName(
    approvedPreview,
    "expert-review-preview__safety"
);

assert.ok(safety);
assert.equal(
    safety.textContent,
    "canExport: false · canCreateClientDocument: false · canFinalizeWorkflow: false · expertApprovalGranted: true"
);

console.log("Expert review preview component test passed");
console.log("Required state:", requiredPreview.className);
console.log("Approved state:", approvedPreview.className);
console.log("Rejected state:", rejectedPreview.className);
console.log("Action callbacks:", {
    addNoteCount,
    approveCount,
    rejectCount
});
