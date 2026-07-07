import ReviewResolutionManager from "../portal/core/ReviewResolutionManager.js";
import ReviewQueueManager from "../portal/core/ReviewQueueManager.js";
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

const caseId = "CASE-REVIEW-RESOLUTION-001";

const evidence = EvidenceManager.create({
    caseId,
    title: "Moisture evidence requires review",
    status: "Captured",
    reviewStatus: "Requires expert check",
    expertReviewRequired: true,
    priority: "High"
});

const assessment = AssessmentManager.create({
    caseId,
    title: "Assessment blocked before report",
    status: "Blocked",
    reviewStatus: "Blocked",
    expertReviewRequired: true,
    priority: "High"
});

const initialQueue = ReviewQueueManager.getByCase(caseId);

if (initialQueue.length !== 2) {
    throw new Error(`Expected 2 open review items, received ${initialQueue.length}`);
}

const initialGate = WorkflowValidationGateManager.validateForReport(caseId);

if (initialGate.status !== "blocked") {
    throw new Error(`Expected blocked gate before resolution, received ${initialGate.status}`);
}

const evidenceResolution = ReviewResolutionManager.resolveQueueItem(`evidence:${evidence.id}`, {
    reviewedBy: "Matthias Meiferts",
    reviewNotes: "Evidence checked and accepted."
});

if (!evidenceResolution || evidenceResolution.record.expertReviewRequired !== false) {
    throw new Error("Evidence resolution did not clear expert review requirement");
}

if (evidenceResolution.record.reviewStatus !== "Reviewed") {
    throw new Error("Evidence review status was not set to Reviewed");
}

if (!evidenceResolution.record.reviewedAt || evidenceResolution.record.reviewedBy !== "Matthias Meiferts") {
    throw new Error("Evidence review audit fields missing");
}

const queueAfterEvidence = ReviewQueueManager.getByCase(caseId);

if (queueAfterEvidence.length !== 1) {
    throw new Error(`Expected 1 open review item after evidence resolution, received ${queueAfterEvidence.length}`);
}

ReviewResolutionManager.resolveQueueItem(`assessment:${assessment.id}`, {
    reviewedBy: "Matthias Meiferts",
    reviewNotes: "Assessment blocker resolved."
});

const finalQueue = ReviewQueueManager.getByCase(caseId);

if (finalQueue.length !== 0) {
    throw new Error(`Expected no open review items after resolution, received ${finalQueue.length}`);
}

const finalGate = WorkflowValidationGateManager.validateForReport(caseId);

if (!finalGate.canProceed || finalGate.status !== "passed") {
    throw new Error(`Expected passed gate after resolution, received ${finalGate.status}`);
}

const reopened = ReviewResolutionManager.reopenQueueItem(`evidence:${evidence.id}`, {
    reviewNotes: "Reopened for additional check."
});

if (!reopened || reopened.record.expertReviewRequired !== true) {
    throw new Error("Reopen did not restore expert review requirement");
}

const reopenedQueue = ReviewQueueManager.getByCase(caseId);

if (reopenedQueue.length !== 1) {
    throw new Error(`Expected 1 reopened review item, received ${reopenedQueue.length}`);
}

ReviewResolutionManager.markInReview(`evidence:${evidence.id}`, {
    reviewNotes: "Currently in review."
});

const inReviewEvidence = EvidenceManager.load(evidence.id);

if (inReviewEvidence.reviewStatus !== "In review") {
    throw new Error("Mark in review did not set reviewStatus to In review");
}

console.log("ReviewResolutionManager tests passed.");
