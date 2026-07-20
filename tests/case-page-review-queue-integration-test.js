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

global.sessionStorage = {
    getItem() {
        return null;
    },
    setItem() {},
    removeItem() {},
    clear() {}
};

const { default: CasePage } = await import(
    "../portal/ui/pages/CasePage.js"
);

const managers = [
    EvidenceManager,
    FindingManager,
    AssessmentManager,
    RecommendationManager,
    DecisionManager,
    ReportManager
];

const clearWorkflowStorage = () => {
    managers.forEach(manager => {
        StorageManager.clear(manager.collection);
    });
};

const getStoredCaseData = caseId => ({
    evidence: EvidenceManager.getByCase(caseId),
    findings: FindingManager.getByCase(caseId),
    assessments: AssessmentManager.getByCase(caseId),
    recommendations: RecommendationManager.getByCase(caseId),
    decisions: DecisionManager.getByCase(caseId),
    reports: ReportManager.getByCase(caseId)
});

clearWorkflowStorage();

/*
 * Passed:
 * A reviewed persisted record must not enter the review queue.
 */
const passedCaseId = "CASE-PAGE-GOVERNANCE-PASSED";

EvidenceManager.create({
    caseId: passedCaseId,
    title: "Reviewed evidence",
    status: "Reviewed",
    reviewStatus: "Reviewed",
    expertReviewRequired: false,
    sourceExpertReviewRequired: false
});

const passedIntelligence = CasePage.getCaseIntelligence(
    { id: passedCaseId },
    getStoredCaseData(passedCaseId)
);

if (passedIntelligence.validationStatus !== "passed") {
    throw new Error(
        `Expected passed validation, received ${passedIntelligence.validationStatus}`
    );
}

if (passedIntelligence.blockingReviewItemCount !== 0) {
    throw new Error(
        `Expected no blockers, received ${passedIntelligence.blockingReviewItemCount}`
    );
}

if (passedIntelligence.warningReviewItemCount !== 0) {
    throw new Error(
        `Expected no warnings, received ${passedIntelligence.warningReviewItemCount}`
    );
}

const passedMarkup = CasePage.renderCaseIntelligenceSnapshot(
    { id: passedCaseId },
    getStoredCaseData(passedCaseId)
);

if (
    !passedMarkup.includes(
        "case-intelligence__governance-item--passed"
    )
) {
    throw new Error(
        "Passed persisted workflow should render passed governance"
    );
}

/*
 * Warning:
 * A medium-priority review item is a report warning when it does not
 * inherit a source expert-review requirement.
 */
const warningCaseId = "CASE-PAGE-GOVERNANCE-WARNING";

FindingManager.create({
    caseId: warningCaseId,
    title: "Finding awaiting review",
    status: "Draft",
    reviewStatus: "Needs review",
    expertReviewRequired: true,
    sourceExpertReviewRequired: false,
    priority: "Medium"
});

const warningIntelligence = CasePage.getCaseIntelligence(
    { id: warningCaseId },
    getStoredCaseData(warningCaseId)
);

if (warningIntelligence.validationStatus !== "warning") {
    throw new Error(
        `Expected warning validation, received ${warningIntelligence.validationStatus}`
    );
}

if (warningIntelligence.blockingReviewItemCount !== 0) {
    throw new Error(
        `Expected no warning-case blockers, received ${warningIntelligence.blockingReviewItemCount}`
    );
}

if (warningIntelligence.warningReviewItemCount !== 1) {
    throw new Error(
        `Expected one warning, received ${warningIntelligence.warningReviewItemCount}`
    );
}

const warningMarkup = CasePage.renderCaseIntelligenceSnapshot(
    { id: warningCaseId },
    getStoredCaseData(warningCaseId)
);

if (
    !warningMarkup.includes(
        "case-intelligence__governance-item--warning"
    )
) {
    throw new Error(
        "Persisted warning workflow should render warning governance"
    );
}

/*
 * Blocked:
 * An explicitly blocked assessment must block report validation.
 */
const blockedCaseId = "CASE-PAGE-GOVERNANCE-BLOCKED";

AssessmentManager.create({
    caseId: blockedCaseId,
    title: "Blocked assessment",
    status: "Blocked",
    reviewStatus: "Blocked",
    expertReviewRequired: true,
    sourceExpertReviewRequired: false,
    priority: "High"
});

const blockedIntelligence = CasePage.getCaseIntelligence(
    { id: blockedCaseId },
    getStoredCaseData(blockedCaseId)
);

if (blockedIntelligence.validationStatus !== "blocked") {
    throw new Error(
        `Expected blocked validation, received ${blockedIntelligence.validationStatus}`
    );
}

if (blockedIntelligence.blockingReviewItemCount !== 1) {
    throw new Error(
        `Expected one blocker, received ${blockedIntelligence.blockingReviewItemCount}`
    );
}

if (blockedIntelligence.warningReviewItemCount !== 0) {
    throw new Error(
        `Expected no separate blocked-case warnings, received ${blockedIntelligence.warningReviewItemCount}`
    );
}

const blockedMarkup = CasePage.renderCaseIntelligenceSnapshot(
    { id: blockedCaseId },
    getStoredCaseData(blockedCaseId)
);

if (
    !blockedMarkup.includes(
        "case-intelligence__governance-item--blocked"
    )
) {
    throw new Error(
        "Persisted blocked workflow should render blocked governance"
    );
}

console.log(
    "CasePage persisted review queue governance integration tests passed."
);
