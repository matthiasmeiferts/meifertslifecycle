import ReviewQueueManager from "../portal/core/ReviewQueueManager.js";
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

const caseId = "CASE-REVIEW-1";

EvidenceManager.create({
    caseId,
    title: "Moisture photo evidence",
    status: "Captured",
    reviewStatus: "Needs review",
    expertReviewRequired: true,
    priority: "Medium"
});

FindingManager.create({
    caseId,
    title: "Reviewed finding",
    status: "Reviewed",
    reviewStatus: "Reviewed",
    expertReviewRequired: false
});

AssessmentManager.create({
    caseId,
    title: "Blocked assessment",
    status: "Blocked",
    reviewStatus: "Blocked",
    expertReviewRequired: true,
    priority: "High"
});

RecommendationManager.create({
    caseId,
    title: "Recommendation awaiting check",
    status: "Draft",
    reviewStatus: "Requires expert check",
    expertReviewRequired: true,
    decisionImpact: "High"
});

DecisionManager.create({
    caseId,
    title: "Decision support draft",
    status: "Draft",
    reviewStatus: "Draft",
    expertReviewRequired: true,
    sourceExpertReviewRequired: true,
    riskLevel: "Medium"
});

ReportManager.create({
    caseId,
    title: "Report already reviewed",
    status: "Reviewed",
    reviewStatus: "Reviewed",
    expertReviewRequired: false,
    sourceExpertReviewRequired: false
});

const queue = ReviewQueueManager.getByCase(caseId);

if (queue.length !== 4) {
    throw new Error(`Expected 4 review queue items, received ${queue.length}`);
}

if (queue.some(item => item.title === "Reviewed finding")) {
    throw new Error("Reviewed finding should not be in review queue");
}

if (queue.some(item => item.title === "Report already reviewed")) {
    throw new Error("Reviewed report should not be in review queue");
}

const summary = ReviewQueueManager.getSummary({ caseId });

if (summary.total !== 4) {
    throw new Error(`Expected summary total 4, received ${summary.total}`);
}

if (!summary.byStage.evidence) {
    throw new Error("Evidence stage missing from review summary");
}

if (!summary.byStage.assessment) {
    throw new Error("Assessment stage missing from review summary");
}

if (!summary.byStage.recommendation) {
    throw new Error("Recommendation stage missing from review summary");
}

if (!summary.byStage.decision) {
    throw new Error("Decision stage missing from review summary");
}

if (!summary.hasBlockedItems) {
    throw new Error("Blocked item signal missing from review summary");
}

if (!summary.highestPriority) {
    throw new Error("Highest priority item missing");
}

console.log("ReviewQueueManager tests passed.");
