import assert from "node:assert/strict";
import ExpertIntelligenceReportProjection from "../portal/core/reporting/ExpertIntelligenceReportProjection.js";
import ExpertIntelligenceRuntimeManager from "../portal/core/ExpertIntelligenceRuntimeManager.js";

let groups = 0;

function group(name, callback) {
    callback();
    groups += 1;
    console.log(`PASS: ${name}`);
}

function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.values(value).forEach((entry) => deepFreeze(entry));
    return Object.freeze(value);
}

function validInput(overrides = {}) {
    return {
        executionSummary: {
            status: "succeeded",
            selectedDomain: "structural-systems",
            selectedProvider: "StructuralSystemsKnowledgeProvider",
            confidence: 0.75,
            interpretationState: "INTERPRETED",
            interpretationEligible: true,
            humanReviewRequired: true
        },
        canonicalCurrent: true,
        stale: false,
        humanReviewSummary: { completed: false },
        ...overrides
    };
}

const expectedFields = [
    "status",
    "hasExecution",
    "stale",
    "domain",
    "provider",
    "confidence",
    "interpretation",
    "humanReviewRequired",
    "humanReviewStatus",
    "generatedFromVersion"
];

group("projects the canonical current execution through the closed contract", () => {
    const result = ExpertIntelligenceReportProjection.createProjection(validInput());

    assert.deepEqual(Object.keys(result), expectedFields);
    assert.equal(result.status, "available");
    assert.equal(result.hasExecution, true);
    assert.equal(result.stale, false);
    assert.equal(result.domain, "structural-systems");
    assert.equal(result.provider, "StructuralSystemsKnowledgeProvider");
    assert.equal(result.confidence, 0.75);
    assert.deepEqual(result.interpretation, { state: "INTERPRETED", eligible: true });
    assert.equal(result.humanReviewRequired, true);
    assert.equal(result.humanReviewStatus, "pending");
    assert.equal(result.generatedFromVersion, "expert-intelligence-report-projection-1.0");
});

group("accepts the released runtime summary unchanged and ignores non-projected fields", () => {
    const execution = deepFreeze({
        id: "expert-intelligence-execution-1",
        engineStatus: "succeeded",
        selectedDomain: "structural-systems",
        selectedProvider: "StructuralSystemsKnowledgeProvider",
        reasoningResult: {
            supportingEvidence: ["released evidence"],
            missingEvidence: ["released missing evidence"],
            confidence: 0.64
        },
        internalModelResult: {
            domainAssessments: [{
                riskRelevanceEntries: [{
                    canonicalValue: "medium",
                    valueState: "CANONICAL_VALUE",
                    rawVersion: "risk-relevance-1.0",
                    versionState: "VERSION_SUPPORTED"
                }]
            }],
            conflicts: [{ conflictReference: "must-not-project" }]
        },
        interpretationModelResult: {
            interpretationState: "INTERPRETED",
            domainInterpretations: [{
                riskRelevanceInterpretations: [{ interpretationState: "INTERPRETED" }]
            }]
        },
        limitations: ["must-not-project"],
        humanReviewRequired: true,
        errorState: { message: "raw error must not project" }
    });
    const releasedSummary = ExpertIntelligenceRuntimeManager.createSummary(execution);
    const before = JSON.stringify(releasedSummary);
    const input = {
        executionSummary: releasedSummary,
        canonicalCurrent: true,
        stale: false,
        humanReviewSummary: { completed: false }
    };
    const first = ExpertIntelligenceReportProjection.createProjection(input);
    const second = ExpertIntelligenceReportProjection.createProjection(input);
    const outputText = JSON.stringify(first);

    assert.equal(JSON.stringify(releasedSummary), before);
    assert.equal(first.status, "available");
    assert.equal(first.domain, releasedSummary.selectedDomain);
    assert.equal(first.provider, releasedSummary.selectedProvider);
    assert.equal(first.confidence, releasedSummary.confidence);
    assert.deepEqual(first, second);
    assert.doesNotMatch(outputText, /executionId|riskRelevance|diagnostic|errorMessage|raw error|must-not-project/i);
    [
        "executionId",
        "matchedIndicatorCount",
        "evidenceCount",
        "missingEvidenceCount",
        "riskRelevanceValue",
        "riskRelevanceValueState",
        "riskRelevanceVersion",
        "riskRelevanceVersionState",
        "limitationCount",
        "conflictCount",
        "errorMessage"
    ].forEach((field) => assert.equal(Object.hasOwn(first, field), false, field));

    const futureSummary = {
        ...releasedSummary,
        futureReleasedField: { nested: "must-not-project" },
        diagnostics: ["must-not-project"],
        executionHistory: ["must-not-project"]
    };
    const futureProjection = ExpertIntelligenceReportProjection.createProjection({
        ...input,
        executionSummary: futureSummary
    });

    assert.deepEqual(futureProjection, first);
    assert.doesNotMatch(JSON.stringify(futureProjection), /futureReleasedField|diagnostics|executionHistory|must-not-project/);
});

group("projects no execution without inventing identity or state", () => {
    const result = ExpertIntelligenceReportProjection.createProjection({});

    assert.deepEqual(result, {
        status: "no_execution",
        hasExecution: false,
        stale: false,
        domain: null,
        provider: null,
        confidence: null,
        interpretation: { state: null, eligible: false },
        humanReviewRequired: false,
        humanReviewStatus: "not_required",
        generatedFromVersion: "expert-intelligence-report-projection-1.0"
    });
});

group("maps failed and incomplete released executions to unavailable", () => {
    ["failed", "not_run", "no_provider_contract"].forEach((status) => {
        const result = ExpertIntelligenceReportProjection.createProjection(validInput({
            executionSummary: { ...validInput().executionSummary, status }
        }));

        assert.equal(result.status, "unavailable");
        assert.equal(result.hasExecution, true);
    });
});

group("preserves stale state without turning it into approval or failure", () => {
    const result = ExpertIntelligenceReportProjection.createProjection(validInput({ stale: true }));

    assert.equal(result.status, "stale");
    assert.equal(result.stale, true);
    assert.equal(result.humanReviewStatus, "pending");
});

group("exposes only restricted factual Human Review state", () => {
    const completed = ExpertIntelligenceReportProjection.createProjection(validInput({
        humanReviewSummary: { completed: true }
    }));
    const notRequired = ExpertIntelligenceReportProjection.createProjection(validInput({
        executionSummary: { ...validInput().executionSummary, humanReviewRequired: false },
        humanReviewSummary: null
    }));

    assert.equal(completed.humanReviewStatus, "completed");
    assert.equal(notRequired.humanReviewStatus, "not_required");
    assert.equal(notRequired.humanReviewRequired, false);
});

group("rejects historical execution projection and contradictory state", () => {
    assert.throws(() => ExpertIntelligenceReportProjection.createProjection(validInput({
        canonicalCurrent: false
    })), /canonical current/);
    assert.throws(() => ExpertIntelligenceReportProjection.createProjection({
        executionSummary: null,
        canonicalCurrent: true
    }), /contradictory/);
    assert.throws(() => ExpertIntelligenceReportProjection.createProjection(validInput({
        executionSummary: { ...validInput().executionSummary, humanReviewRequired: false }
    })), /contradicts/);
});

group("accepts only the closed released execution status set", () => {
    assert.throws(() => ExpertIntelligenceReportProjection.createProjection(validInput({
        executionSummary: { ...validInput().executionSummary, status: "approved" }
    })), /unsupported released execution status/);
});

group("rejects malformed and non-finite report values", () => {
    [NaN, Infinity, -Infinity, {}, []].forEach((confidence) => {
        assert.throws(() => ExpertIntelligenceReportProjection.createProjection(validInput({
            executionSummary: { ...validInput().executionSummary, confidence }
        })));
    });
    assert.throws(() => ExpertIntelligenceReportProjection.createProjection(validInput({
        executionSummary: { ...validInput().executionSummary, selectedDomain: " domain " }
    })), /meaningful exact string/);
});

group("rejects forbidden raw and historical input fields", () => {
    [
        "executionHistory",
        "rawExecution",
        "sourceSnapshot",
        "sourceFingerprint",
        "executionDiagnostics",
        "rawError",
        "reviewHistory",
        "report"
    ].forEach((field) => {
        assert.throws(() => ExpertIntelligenceReportProjection.createProjection({
            ...validInput(),
            [field]: { secret: true }
        }), /unsupported input field/);
    });
});

group("excludes every forbidden audit and authority field from output", () => {
    const result = ExpertIntelligenceReportProjection.createProjection(validInput({
        humanReviewSummary: { completed: true }
    }));
    const forbidden = [
        "hypotheses",
        "supportingEvidence",
        "missingEvidence",
        "riskRelevance",
        "conflicts",
        "limitations",
        "governanceVersions",
        "error",
        "executionId",
        "reviewer",
        "reviewReasoning",
        "reviewHistory",
        "approval",
        "authorization"
    ];

    forbidden.forEach((field) => assert.equal(Object.hasOwn(result, field), false, field));
});

group("returns deterministic repeatable output for identical input", () => {
    const input = deepFreeze(validInput());
    const first = ExpertIntelligenceReportProjection.createProjection(input);
    const second = ExpertIntelligenceReportProjection.createProjection(input);

    assert.deepEqual(first, second);
    assert.equal(JSON.stringify(first), JSON.stringify(second));
    assert.notEqual(first, second);
    assert.notEqual(first.interpretation, second.interpretation);
});

group("returns deeply frozen detached output", () => {
    const input = validInput();
    const result = ExpertIntelligenceReportProjection.createProjection(input);

    assert.equal(Object.isFrozen(result), true);
    assert.equal(Object.isFrozen(result.interpretation), true);
    assert.notEqual(result.interpretation, input.executionSummary);
    assert.throws(() => { result.status = "approved"; }, TypeError);
    assert.throws(() => { result.interpretation.state = "APPROVED"; }, TypeError);
});

group("does not mutate deeply frozen caller input", () => {
    const input = deepFreeze(validInput());
    const before = JSON.stringify(input);

    ExpertIntelligenceReportProjection.createProjection(input);

    assert.equal(JSON.stringify(input), before);
    assert.equal(Object.isFrozen(input.executionSummary), true);
    assert.equal(Object.isFrozen(input.humanReviewSummary), true);
});

group("rejects accessors symbols arrays and prototype-bearing inputs", () => {
    const accessor = {};
    Object.defineProperty(accessor, "executionSummary", {
        enumerable: true,
        get() { throw new Error("must not execute"); }
    });

    assert.throws(() => ExpertIntelligenceReportProjection.createProjection(accessor), /unsupported properties/);
    assert.throws(() => ExpertIntelligenceReportProjection.createProjection([]), /plain data object/);
    assert.throws(() => ExpertIntelligenceReportProjection.createProjection(Object.create(null)), /plain data object/);
    assert.throws(() => ExpertIntelligenceReportProjection.createProjection({
        ...validInput(),
        [Symbol("raw")]: true
    }), /unsupported properties/);
});

group("has no runtime storage UI report finalization or export dependency", () => {
    const source = ExpertIntelligenceReportProjection.createProjection.toString();

    assert.doesNotMatch(source, /RuntimeManager|StorageManager|ReportAssembly|ReportPage|Finalization|Export|localStorage|fetch/);
});

assert.equal(groups, 16);
console.log(`Expert Intelligence Report Projection tests completed: ${groups} groups passed.`);
