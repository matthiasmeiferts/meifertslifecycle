import ReportOutputGovernanceManager from "../portal/core/ReportOutputGovernanceManager.js";
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

const caseId = "CASE-REPORT-GOVERNANCE-001";

const draftReport = ReportManager.create({
    caseId,
    title: "Draft report requiring review",
    status: "Draft",
    reviewStatus: "Draft",
    expertReviewRequired: true,
    noAutomaticFinalReport: true
});

const draftResult = ReportOutputGovernanceManager.validateDraftOutput(draftReport);

if (!draftResult.canProceed) {
    throw new Error("Draft output should be allowed for preparation when not blocked.");
}

const draftExternalResult = ReportOutputGovernanceManager.validateExternalOutput(draftReport);

if (draftExternalResult.canProceed) {
    throw new Error("Draft report must not be allowed for external output.");
}

const approvedReport = ReportManager.create({
    caseId: "CASE-REPORT-GOVERNANCE-002",
    title: "Approved report",
    status: "Approved",
    reviewStatus: "Reviewed",
    expertReviewRequired: false,
    noAutomaticFinalReport: false
});

const finalResult = ReportOutputGovernanceManager.validateFinalOutput(approvedReport);

if (!finalResult.canProceed || finalResult.status !== "passed") {
    throw new Error(`Approved reviewed report should pass final governance, received ${finalResult.status}`);
}

const externalResult = ReportOutputGovernanceManager.validateExternalOutput(approvedReport);

if (!externalResult.canProceed || externalResult.outputUse !== "external") {
    throw new Error("Approved reviewed report should pass external governance.");
}

const preparedButUnreviewed = ReportManager.create({
    caseId: "CASE-REPORT-GOVERNANCE-003",
    title: "Prepared but unreviewed report",
    status: "Prepared",
    reviewStatus: "In review",
    expertReviewRequired: true,
    noAutomaticFinalReport: false
});

const preparedFinalResult = ReportOutputGovernanceManager.validateFinalOutput(preparedButUnreviewed);

if (preparedFinalResult.canProceed) {
    throw new Error("Prepared but unreviewed report must not pass final governance.");
}

if (!preparedFinalResult.reason) {
    throw new Error("Blocked final governance result should provide a reason.");
}

console.log("ReportOutputGovernanceManager tests passed.");
