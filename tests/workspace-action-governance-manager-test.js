import WorkspaceActionGovernanceManager from "../portal/core/WorkspaceActionGovernanceManager.js";

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

const draftRecord = {
    id: "record-1",
    title: "Draft evidence",
    status: "Draft",
    reviewStatus: "Draft"
};

const draftState = WorkspaceActionGovernanceManager.getActionState(draftRecord);

assert(draftState.openAllowed, "Draft record should be openable.");
assert(draftState.editAllowed, "Draft record should be editable.");
assert(draftState.deleteAllowed, "Draft record should be deletable.");
assert(draftState.downstreamAllowed, "Draft record should allow downstream action when no review is required.");

const blockedRecord = {
    id: "record-2",
    title: "Blocked finding",
    status: "Blocked"
};

const blockedState = WorkspaceActionGovernanceManager.getActionState(blockedRecord);

assert(blockedState.openAllowed, "Blocked record should remain openable.");
assert(!blockedState.editAllowed, "Blocked record should not be editable.");
assert(!blockedState.deleteAllowed, "Blocked record should not be deletable.");
assert(!blockedState.downstreamAllowed, "Blocked record should not allow downstream action.");
assert(blockedState.blocked, "Blocked record should expose blocked state.");

const reviewedRecord = {
    id: "record-3",
    title: "Reviewed assessment",
    status: "Reviewed",
    reviewStatus: "Reviewed"
};

const reviewedState = WorkspaceActionGovernanceManager.getActionState(reviewedRecord, {
    requireReview: true
});

assert(reviewedState.reviewed, "Reviewed record should expose reviewed state.");
assert(reviewedState.downstreamAllowed, "Reviewed record should allow downstream action when review is required.");

const unreviewedState = WorkspaceActionGovernanceManager.getActionState(draftRecord, {
    requireReview: true
});

assert(!unreviewedState.downstreamAllowed, "Unreviewed record should not allow downstream action when review is required.");
assert(
    unreviewedState.reason === "Expert review is required before downstream use.",
    "Unreviewed downstream block reason should explain review requirement."
);

const lockedRecord = {
    id: "record-4",
    title: "Approved report",
    status: "Approved"
};

const lockedState = WorkspaceActionGovernanceManager.getActionState(lockedRecord);

assert(lockedState.openAllowed, "Locked record should remain openable.");
assert(!lockedState.editAllowed, "Locked record should not be editable.");
assert(!lockedState.deleteAllowed, "Locked record should not be deletable.");
assert(lockedState.locked, "Locked record should expose locked state.");

const contentRequiredState = WorkspaceActionGovernanceManager.getActionState(
    { id: "record-5", status: "Draft" },
    { requireContent: true }
);

assert(!contentRequiredState.downstreamAllowed, "Record without content should not allow downstream action when content is required.");
assert(
    contentRequiredState.reason === "Record content is required before downstream use.",
    "Content-required downstream block reason should explain missing content."
);

console.log("WorkspaceActionGovernanceManager tests passed.");
