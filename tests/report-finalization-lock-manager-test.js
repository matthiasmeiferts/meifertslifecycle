import ReportFinalizationLockManager from "../portal/core/ReportFinalizationLockManager.js";
import ReportManager from "../portal/core/ReportManager.js";
import StorageManager from "../portal/core/storage/StorageManager.js";

const memoryStorage = new Map();

global.localStorage = {
    getItem(key) {
        return memoryStorage.has(key) ? memoryStorage.get(key) : null;
    },
    setItem(key, value) {
        memoryStorage.set(key, String(value));
    },
    removeItem(key) {
        memoryStorage.delete(key);
    },
    clear() {
        memoryStorage.clear();
    }
};

StorageManager.clear(ReportManager.collection);

const draftReport = ReportManager.create({
    caseId: "CASE-LOCK-001",
    title: "Draft report",
    status: "Draft",
    reviewStatus: "Draft",
    expertReviewRequired: true,
    noAutomaticFinalReport: true
});

const draftLock = ReportFinalizationLockManager.getLockState(draftReport);

if (draftLock.locked) {
    throw new Error("Draft report must remain editable.");
}

if (!draftLock.canEdit || !draftLock.canPrepareDraftOutput) {
    throw new Error("Draft report should allow edit and draft preparation.");
}

if (draftLock.canExportExternal) {
    throw new Error("Draft report must not allow external export.");
}

const approvedReport = ReportManager.create({
    caseId: "CASE-LOCK-002",
    title: "Approved report",
    status: "Approved",
    reviewStatus: "Reviewed",
    expertReviewRequired: false,
    noAutomaticFinalReport: false
});

const approvedLock = ReportFinalizationLockManager.getLockState(approvedReport);

if (!approvedLock.locked) {
    throw new Error("Approved final-output-ready report must be locked.");
}

if (approvedLock.canEdit || approvedLock.canPrepareDraftOutput) {
    throw new Error("Locked approved report must not allow draft edits.");
}

if (!approvedLock.canExportExternal) {
    throw new Error("Approved locked report should allow external export.");
}

const archivedReport = ReportManager.create({
    caseId: "CASE-LOCK-003",
    title: "Archived report",
    status: "Archived",
    reviewStatus: "Reviewed",
    expertReviewRequired: false,
    noAutomaticFinalReport: false
});

const archivedLock = ReportFinalizationLockManager.getLockState(archivedReport);

if (!archivedLock.locked || archivedLock.canDelete) {
    throw new Error("Archived report must be locked and protected from delete.");
}

const preparedUnreviewedReport = ReportManager.create({
    caseId: "CASE-LOCK-004",
    title: "Prepared unreviewed report",
    status: "Prepared",
    reviewStatus: "In review",
    expertReviewRequired: true,
    noAutomaticFinalReport: false
});

const preparedLock = ReportFinalizationLockManager.getLockState(preparedUnreviewedReport);

if (preparedLock.locked) {
    throw new Error("Prepared unreviewed report should not be finalization-locked yet.");
}

if (preparedLock.canExportExternal) {
    throw new Error("Prepared unreviewed report must not allow external export.");
}

console.log("ReportFinalizationLockManager tests passed.");
