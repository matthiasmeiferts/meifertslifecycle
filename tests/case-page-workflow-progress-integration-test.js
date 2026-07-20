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

const caseId = "CASE-PAGE-PROGRESS-INTEGRATION";

const intelligence = CasePage.getCaseIntelligence(
    { id: caseId },
    {
        evidence: [
            {
                id: "EVIDENCE-1",
                caseId
            }
        ],
        findings: [
            {
                id: "FINDING-1",
                caseId
            }
        ],
        assessments: [],
        recommendations: [],
        decisions: [],
        reports: []
    }
);

if (intelligence.caseId !== caseId) {
    throw new Error("CasePage intelligence should expose the progress case id");
}

if (intelligence.counts.evidence !== 1) {
    throw new Error(
        `Expected one evidence item, received ${intelligence.counts.evidence}`
    );
}

if (intelligence.counts.finding !== 1) {
    throw new Error(
        `Expected one finding item, received ${intelligence.counts.finding}`
    );
}

if (intelligence.completedStages !== 2) {
    throw new Error(
        `Expected two represented stages, received ${intelligence.completedStages}`
    );
}

if (intelligence.readinessPercent !== 33) {
    throw new Error(
        `Expected readiness 33, received ${intelligence.readinessPercent}`
    );
}

if (intelligence.currentStage !== "finding") {
    throw new Error(
        `Expected finding as current stage, received ${intelligence.currentStage}`
    );
}

if (intelligence.nextStage !== "assessment") {
    throw new Error(
        `Expected assessment as next stage, received ${intelligence.nextStage}`
    );
}

if (!intelligence.nextAction?.label) {
    throw new Error("Expected localized next-action presentation");
}

if (typeof intelligence.confidenceScore !== "number") {
    throw new Error("Expected numeric confidence score");
}

if (intelligence.validationStatus !== "passed") {
    throw new Error(
        `Expected empty stored review queue to pass, received ${intelligence.validationStatus}`
    );
}

console.log("CasePage workflow progress integration tests passed.");

const noCasePresentation = CasePage.getWorkflowActionPresentation();

if (
    noCasePresentation.titleKey !== "CaseSelectToContinueWorkflow" ||
    noCasePresentation.buttonKey !== null
) {
    throw new Error(
        "No-case workflow presentation should request case selection"
    );
}

const incompletePresentation = CasePage.getWorkflowActionPresentation({
    hasCurrentCase: true,
    workflowRepresented: false,
    workflowReviewReady: false,
    workflowBlocked: false
});

if (
    incompletePresentation.titleKey !== "CaseMoveThroughChain" ||
    incompletePresentation.buttonKey !== "CaseCreateWorkflowChain"
) {
    throw new Error(
        "Incomplete workflow should remain in workflow creation mode"
    );
}

const representedPresentation = CasePage.getWorkflowActionPresentation({
    hasCurrentCase: true,
    workflowRepresented: true,
    workflowReviewReady: false,
    workflowBlocked: false
});

if (
    representedPresentation.titleKey !== "CaseReviewRequiredChain" ||
    representedPresentation.buttonKey !== "CaseReviewWorkflowChain"
) {
    throw new Error(
        "Represented workflow awaiting validation should require governance review"
    );
}

const blockedPresentation = CasePage.getWorkflowActionPresentation({
    hasCurrentCase: true,
    workflowRepresented: true,
    workflowReviewReady: false,
    workflowBlocked: true
});

if (
    blockedPresentation.titleKey !== "CaseReviewBlockedChain" ||
    blockedPresentation.buttonKey !== "CaseReviewWorkflowChain"
) {
    throw new Error(
        "Blocked represented workflow should remain in review mode"
    );
}

const readyPresentation = CasePage.getWorkflowActionPresentation({
    hasCurrentCase: true,
    workflowRepresented: true,
    workflowReviewReady: true,
    workflowBlocked: false
});

if (
    readyPresentation.titleKey !== "CaseReviewReadyChain" ||
    readyPresentation.buttonKey !== "CaseReviewWorkflowChain"
) {
    throw new Error(
        "Review-ready workflow should expose the cleared review state"
    );
}

console.log(
    "CasePage governance-aware workflow presentation tests passed."
);
