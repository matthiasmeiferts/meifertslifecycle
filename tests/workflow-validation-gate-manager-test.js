import WorkflowValidationGateManager from "../portal/core/WorkflowValidationGateManager.js";
import EvidenceManager from "../portal/core/EvidenceManager.js";
import FindingManager from "../portal/core/FindingManager.js";
import AssessmentManager from "../portal/core/AssessmentManager.js";
import RecommendationManager from "../portal/core/RecommendationManager.js";
import DecisionManager from "../portal/core/DecisionManager.js";
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

[
    EvidenceManager,
    FindingManager,
    AssessmentManager,
    RecommendationManager,
    DecisionManager,
    ReportManager
].forEach(manager => StorageManager.clear(manager.collection));

const blockedCaseId = "CASE-GATE-BLOCKED";

EvidenceManager.create({
    caseId: blockedCaseId,
    title: "Moisture evidence requires expert check",
    status: "Captured",
    reviewStatus: "Requires expert check",
    expertReviewRequired: true,
    priority: "High"
});

AssessmentManager.create({
    caseId: blockedCaseId,
    title: "Blocked assessment",
    status: "Blocked",
    reviewStatus: "Blocked",
    expertReviewRequired: true,
    priority: "High"
});

const blockedReportGate = WorkflowValidationGateManager.validateForReport(blockedCaseId);

if (blockedReportGate.canProceed) {
    throw new Error("Blocked report gate should not allow proceed");
}

if (blockedReportGate.status !== "blocked") {
    throw new Error(`Expected blocked status, received ${blockedReportGate.status}`);
}

if (blockedReportGate.blockingItems.length < 2) {
    throw new Error("Expected at least two blocking items");
}

if (!blockedReportGate.message.includes("blocking review item")) {
    throw new Error("Blocking validation message missing");
}

const warningCaseId = "CASE-GATE-WARNING";

FindingManager.create({
    caseId: warningCaseId,
    title: "Finding needs review",
    status: "Draft",
    reviewStatus: "Needs review",
    expertReviewRequired: true,
    priority: "Medium"
});

const warningGate = WorkflowValidationGateManager.validateForDecision(warningCaseId);

if (warningGate.canProceed) {
    throw new Error("Warning gate should not proceed without allowWarnings");
}

if (warningGate.status !== "warning") {
    throw new Error(`Expected warning status, received ${warningGate.status}`);
}

const warningAllowedGate = WorkflowValidationGateManager.validateForDecision(warningCaseId, {
    allowWarnings: true
});

if (!warningAllowedGate.canProceed) {
    throw new Error("Warning gate should proceed when allowWarnings is true");
}

const cleanCaseId = "CASE-GATE-CLEAN";

ReportManager.create({
    caseId: cleanCaseId,
    title: "Reviewed report",
    status: "Reviewed",
    reviewStatus: "Reviewed",
    expertReviewRequired: false,
    sourceExpertReviewRequired: false
});

const cleanGate = WorkflowValidationGateManager.validateForExternalUse(cleanCaseId);

if (!cleanGate.canProceed) {
    throw new Error("Clean gate should allow proceed");
}

if (cleanGate.status !== "passed") {
    throw new Error(`Expected passed status, received ${cleanGate.status}`);
}

console.log("WorkflowValidationGateManager tests passed.");
