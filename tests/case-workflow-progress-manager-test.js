import CaseWorkflowProgressManager from "../portal/core/CaseWorkflowProgressManager.js";
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

const managers = [
    EvidenceManager,
    FindingManager,
    AssessmentManager,
    RecommendationManager,
    DecisionManager,
    ReportManager
];

managers.forEach(manager => StorageManager.clear(manager.collection));

const emptyCaseId = "CASE-PROGRESS-EMPTY";

const emptyModel = CaseWorkflowProgressManager.create(
    { id: emptyCaseId },
    {}
);

if (emptyModel.caseId !== emptyCaseId) {
    throw new Error("Empty model should preserve case id");
}

if (emptyModel.readinessPercent !== 0) {
    throw new Error(
        `Expected empty readiness 0, received ${emptyModel.readinessPercent}`
    );
}

if (emptyModel.representedStageCount !== 0) {
    throw new Error("Empty case should have no represented stages");
}

if (emptyModel.currentStage !== null) {
    throw new Error("Empty case should not have a current stage");
}

if (emptyModel.nextStage !== "evidence") {
    throw new Error(
        `Expected evidence as first next stage, received ${emptyModel.nextStage}`
    );
}

if (emptyModel.validationStatus !== "passed") {
    throw new Error(
        `Empty review queue should pass report validation, received ${emptyModel.validationStatus}`
    );
}

const developingCaseId = "CASE-PROGRESS-DEVELOPING";

const evidence = EvidenceManager.create({
    caseId: developingCaseId,
    title: "Reviewed evidence",
    status: "Reviewed",
    reviewStatus: "Reviewed",
    expertReviewRequired: false,
    sourceExpertReviewRequired: false
});

const finding = FindingManager.create({
    caseId: developingCaseId,
    title: "Finding requires review",
    status: "Draft",
    reviewStatus: "Needs review",
    expertReviewRequired: true,
    priority: "Medium",
    evidenceIds: [evidence.id]
});

const developingModel = CaseWorkflowProgressManager.create(
    { id: developingCaseId },
    {
        evidence: [evidence],
        findings: [finding]
    }
);

if (developingModel.counts.evidence !== 1) {
    throw new Error("Expected one evidence record");
}

if (developingModel.counts.finding !== 1) {
    throw new Error("Expected one finding record");
}

if (developingModel.representedStageCount !== 2) {
    throw new Error(
        `Expected two represented stages, received ${developingModel.representedStageCount}`
    );
}

if (developingModel.readinessPercent !== 33) {
    throw new Error(
        `Expected readiness 33, received ${developingModel.readinessPercent}`
    );
}

if (developingModel.currentStage !== "finding") {
    throw new Error(
        `Expected finding as current stage, received ${developingModel.currentStage}`
    );
}

if (developingModel.nextStage !== "assessment") {
    throw new Error(
        `Expected assessment as next stage, received ${developingModel.nextStage}`
    );
}

if (developingModel.reviewItemCount !== 1) {
    throw new Error(
        `Expected one review item, received ${developingModel.reviewItemCount}`
    );
}

if (developingModel.warningReviewItemCount !== 0) {
    throw new Error(
        `Expected no separate review warning, received ${developingModel.warningReviewItemCount}`
    );
}

if (developingModel.blockingReviewItemCount !== 1) {
    throw new Error(
        `Expected one blocking review item, received ${developingModel.blockingReviewItemCount}`
    );
}

if (developingModel.validationStatus !== "blocked") {
    throw new Error(
        `Expected blocked validation, received ${developingModel.validationStatus}`
    );
}

if (developingModel.canProceedToReport) {
    throw new Error("Warning model should not proceed without allowWarnings");
}

const blockedCaseId = "CASE-PROGRESS-BLOCKED";

const blockedAssessment = AssessmentManager.create({
    caseId: blockedCaseId,
    title: "Blocked assessment",
    status: "Blocked",
    reviewStatus: "Blocked",
    expertReviewRequired: true,
    priority: "High"
});

const blockedModel = CaseWorkflowProgressManager.create(
    { id: blockedCaseId },
    {
        assessments: [blockedAssessment]
    }
);

if (blockedModel.blockingReviewItemCount !== 1) {
    throw new Error(
        `Expected one blocking item, received ${blockedModel.blockingReviewItemCount}`
    );
}

if (blockedModel.validationStatus !== "blocked") {
    throw new Error(
        `Expected blocked validation, received ${blockedModel.validationStatus}`
    );
}

if (blockedModel.canProceedToReport) {
    throw new Error("Blocked workflow must not proceed to report use");
}

const completeCaseId = "CASE-PROGRESS-COMPLETE";

const completeData = {
    evidence: [{ id: "E-1", caseId: completeCaseId }],
    findings: [{ id: "F-1", caseId: completeCaseId }],
    assessments: [{ id: "A-1", caseId: completeCaseId }],
    recommendations: [{ id: "R-1", caseId: completeCaseId }],
    decisions: [{ id: "D-1", caseId: completeCaseId }],
    reports: [{ id: "REP-1", caseId: completeCaseId }]
};

const completeModel = CaseWorkflowProgressManager.create(
    { id: completeCaseId },
    completeData
);

if (completeModel.readinessPercent !== 100) {
    throw new Error(
        `Expected complete readiness 100, received ${completeModel.readinessPercent}`
    );
}

if (!completeModel.isWorkflowRepresented) {
    throw new Error("Complete workflow should represent all stages");
}

if (completeModel.currentStage !== "report") {
    throw new Error(
        `Expected report as current stage, received ${completeModel.currentStage}`
    );
}

if (completeModel.nextStage !== null) {
    throw new Error("Complete workflow should not have a next stage");
}

console.log("CaseWorkflowProgressManager tests passed.");
