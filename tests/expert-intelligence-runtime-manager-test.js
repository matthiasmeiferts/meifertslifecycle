import assert from "node:assert/strict";

import ExpertIntelligenceRuntimeManager from "../portal/core/ExpertIntelligenceRuntimeManager.js";
import ExpertReasoningEngine from "../portal/core/ExpertReasoningEngine.js";
import BuildingRiskInternalModel from "../portal/core/risk/BuildingRiskInternalModel.js";
import BuildingRiskInterpretationModel from "../portal/core/risk/BuildingRiskInterpretationModel.js";

class MemoryStorage {
    constructor() {
        this.values = new Map();
    }

    getItem(key) {
        return this.values.has(key) ? this.values.get(key) : null;
    }

    setItem(key, value) {
        this.values.set(key, String(value));
    }

    removeItem(key) {
        this.values.delete(key);
    }

    clear() {
        this.values.clear();
    }
}

globalThis.localStorage = new MemoryStorage();

function runTest(name, fn) {
    try {
        fn();
        console.log(`✓ ${name}`);
    } catch (error) {
        console.error(`✗ ${name}`);
        throw error;
    }
}

function seed({
    answer = "load-bearing wall diagonal crack settlement movement",
    buildingId = "building-1",
    inspectionStatus = "draft"
} = {}) {
    localStorage.clear();
    ExpertIntelligenceRuntimeManager.transientExecutions.clear();
    localStorage.setItem("mbi:buildings", JSON.stringify([
        { id: "building-1", name: "Review Building", type: "Residential", yearBuilt: 1985 }
    ]));
    localStorage.setItem("mbi:inspections", JSON.stringify([
        {
            id: "inspection-1",
            buildingId,
            inspectionType: "technical_due_diligence",
            status: inspectionStatus,
            scheduledAt: "2026-07-21T08:00:00.000Z",
            startedAt: "2026-07-21T09:00:00.000Z",
            completedAt: "2026-07-21T10:00:00.000Z",
            createdAt: "2026-07-20T08:00:00.000Z",
            updatedAt: "2026-07-20T09:00:00.000Z"
        }
    ]));
    localStorage.setItem("mbi:inspectionScopes", JSON.stringify([
        {
            id: "scope-1",
            caseId: "case-1",
            buildingId,
            inspectionId: "inspection-1",
            questions: [{ id: "question-1", question: "Describe structural condition", category: "structural" }],
            answers: answer === null ? {} : {
                "question-1": {
                    id: "answer-1",
                    value: answer,
                    measurement: { value: 1.5, unit: "mm" },
                    evidenceIds: ["evidence-from-answer"]
                }
            },
            evidenceRequirements: [{
                questionId: "question-1",
                requirement: "Structural drawing"
            }],
            limitations: ["Visual inspection only."]
        }
    ]));
    localStorage.setItem("mbi:findings", JSON.stringify([
        {
            id: "finding-1",
            caseId: "case-1",
            buildingId,
            inspectionId: "inspection-1",
            category: "structural",
            description: "Diagonal crack at a load-bearing wall.",
            location: "Stair core"
        },
        {
            id: "finding-sibling",
            caseId: "case-1",
            inspectionId: "inspection-2",
            description: "Must not enter the selected inspection input."
        }
    ]));
    localStorage.setItem("mbi:evidence", JSON.stringify([
        {
            id: "evidence-1",
            caseId: "case-1",
            buildingId,
            inspectionId: "inspection-1",
            title: "Crack measurement",
            type: "measurement",
            description: "Crack width recorded at the stair core.",
            notes: "Manual gauge reading.",
            measurementValue: 1.4,
            measurementUnit: "mm",
            measurementType: "crack-width",
            location: "Stair core",
            capturedAt: "2026-07-21T09:30:00.000Z",
            fileReference: "evidence/crack-gauge-1",
            createdAt: "2026-07-21T09:31:00.000Z",
            updatedAt: "2026-07-21T09:32:00.000Z"
        },
        {
            id: "evidence-sibling",
            caseId: "case-1",
            inspectionId: "inspection-2",
            title: "Must not be included"
        }
    ]));
}

runTest("assembles deterministic immutable input bound to the selected inspection", () => {
    seed();
    const sourceBefore = localStorage.getItem("mbi:inspectionScopes");
    const first = ExpertIntelligenceRuntimeManager.assembleRuntimeInput("inspection-1");
    const second = ExpertIntelligenceRuntimeManager.assembleRuntimeInput("inspection-1");

    assert.deepStrictEqual(first.runtimeInput, second.runtimeInput);
    assert.equal(first.sourceFingerprint, second.sourceFingerprint);
    assert.equal(first.runtimeInput.context.inspectionId, "inspection-1");
    assert.deepStrictEqual(first.runtimeInput.context.findingReferences, ["finding-1"]);
    assert.deepStrictEqual(
        first.runtimeInput.context.evidenceReferences,
        ["evidence-1", "evidence-from-answer"]
    );
    assert.equal(first.runtimeInput.measurements[0].value, 1.4);
    assert.equal(first.runtimeInput.measurements[1].value, 1.5);
    assert.deepStrictEqual(first.runtimeInput.context.evidenceRequirements, [{
        questionId: "question-1",
        requirement: "Structural drawing"
    }]);
    assert.deepStrictEqual(
        first.sourceSnapshot.evidenceRequirements,
        first.runtimeInput.context.evidenceRequirements
    );
    assert.equal(first.sourceSnapshot.evidenceReferences.length, 2);
    assert.equal(first.evidenceCount, 1);
    first.runtimeInput.finding.description = "mutated copy";
    first.runtimeInput.context.evidenceRequirements[0].requirement = "mutated requirement";
    assert.equal(localStorage.getItem("mbi:inspectionScopes"), sourceBefore);
});

runTest("evidence requirements participate deterministically in stale detection without becoming evidence", () => {
    seed();
    const firstAssembly = ExpertIntelligenceRuntimeManager.assembleRuntimeInput("inspection-1");
    const secondAssembly = ExpertIntelligenceRuntimeManager.assembleRuntimeInput("inspection-1");
    assert.equal(firstAssembly.sourceFingerprint, secondAssembly.sourceFingerprint);

    ExpertIntelligenceRuntimeManager.executeForInspection("inspection-1");
    assert.equal(ExpertIntelligenceRuntimeManager.getExecutionState("inspection-1").stale, false);

    const scopes = JSON.parse(localStorage.getItem("mbi:inspectionScopes"));
    scopes[0].evidenceRequirements[0].requirement = "Structural drawing and calculation";
    localStorage.setItem("mbi:inspectionScopes", JSON.stringify(scopes));
    assert.equal(ExpertIntelligenceRuntimeManager.getExecutionState("inspection-1").stale, true);

    const changed = ExpertIntelligenceRuntimeManager.assembleRuntimeInput("inspection-1");
    assert.notEqual(changed.sourceFingerprint, firstAssembly.sourceFingerprint);
    assert.equal(changed.evidenceCount, 1);
    assert.equal(changed.sourceSnapshot.evidenceReferences.length, 2);
    assert.equal(changed.runtimeInput.context.evidenceRequirements.length, 1);
});

runTest("operational timestamps do not participate in the source fingerprint or stale state", () => {
    const operationalFields = [
        "scheduledAt",
        "startedAt",
        "completedAt",
        "createdAt",
        "updatedAt"
    ];

    operationalFields.forEach((field, index) => {
        seed();
        const before = ExpertIntelligenceRuntimeManager.assembleRuntimeInput("inspection-1");
        const inspections = JSON.parse(localStorage.getItem("mbi:inspections"));
        inspections[0][field] = `2026-07-${String(index + 22).padStart(2, "0")}T11:00:00.000Z`;
        localStorage.setItem("mbi:inspections", JSON.stringify(inspections));
        const after = ExpertIntelligenceRuntimeManager.assembleRuntimeInput("inspection-1");

        assert.equal(after.sourceFingerprint, before.sourceFingerprint, field);
        assert.deepStrictEqual(after.sourceFingerprintProjection, before.sourceFingerprintProjection, field);
    });

    seed();
    ExpertIntelligenceRuntimeManager.executeForInspection("inspection-1");
    const inspections = JSON.parse(localStorage.getItem("mbi:inspections"));
    operationalFields.forEach((field, index) => {
        inspections[0][field] = `2026-08-${String(index + 1).padStart(2, "0")}T12:00:00.000Z`;
    });
    localStorage.setItem("mbi:inspections", JSON.stringify(inspections));
    assert.equal(ExpertIntelligenceRuntimeManager.getExecutionState("inspection-1").stale, false);
});

runTest("inspection workflow status remains available but is fingerprint-neutral", () => {
    const transitions = [
        ["draft", "completed"],
        ["scheduled", "in_progress"],
        ["completed", "reopened"]
    ];

    transitions.forEach(([fromStatus, toStatus]) => {
        seed({ inspectionStatus: fromStatus });
        const before = ExpertIntelligenceRuntimeManager.assembleRuntimeInput("inspection-1");
        const inspections = JSON.parse(localStorage.getItem("mbi:inspections"));
        inspections[0].status = toStatus;
        localStorage.setItem("mbi:inspections", JSON.stringify(inspections));
        const after = ExpertIntelligenceRuntimeManager.assembleRuntimeInput("inspection-1");

        assert.equal(before.runtimeInput.context.inspectionStatus, fromStatus);
        assert.equal(after.runtimeInput.context.inspectionStatus, toStatus);
        assert.equal(before.sourceSnapshot.inspection.status, fromStatus);
        assert.equal(after.sourceSnapshot.inspection.status, toStatus);
        assert.equal(before.sourceFingerprint, after.sourceFingerprint);
        assert.equal(
            Object.hasOwn(after.sourceFingerprintProjection.runtimeInput.context, "inspectionStatus"),
            false
        );
    });

    seed({ inspectionStatus: "draft" });
    ExpertIntelligenceRuntimeManager.executeForInspection("inspection-1");
    const inspections = JSON.parse(localStorage.getItem("mbi:inspections"));
    inspections[0].status = "closed";
    localStorage.setItem("mbi:inspections", JSON.stringify(inspections));
    assert.equal(ExpertIntelligenceRuntimeManager.getExecutionState("inspection-1").stale, false);

    Object.assign(inspections[0], {
        scheduledAt: "2026-08-01T08:00:00.000Z",
        startedAt: "2026-08-01T09:00:00.000Z",
        completedAt: "2026-08-01T10:00:00.000Z",
        createdAt: "2026-08-01T11:00:00.000Z",
        updatedAt: "2026-08-01T12:00:00.000Z"
    });
    localStorage.setItem("mbi:inspections", JSON.stringify(inspections));
    assert.equal(ExpertIntelligenceRuntimeManager.getExecutionState("inspection-1").stale, false);
});

runTest("technical evidence and finding status remain fingerprint-relevant", () => {
    seed();
    const beforeEvidence = ExpertIntelligenceRuntimeManager.assembleRuntimeInput("inspection-1").sourceFingerprint;
    const evidence = JSON.parse(localStorage.getItem("mbi:evidence"));
    evidence[0].status = "classified";
    localStorage.setItem("mbi:evidence", JSON.stringify(evidence));
    assert.notEqual(
        ExpertIntelligenceRuntimeManager.assembleRuntimeInput("inspection-1").sourceFingerprint,
        beforeEvidence
    );

    seed();
    const beforeFinding = ExpertIntelligenceRuntimeManager.assembleRuntimeInput("inspection-1").sourceFingerprint;
    const findings = JSON.parse(localStorage.getItem("mbi:findings"));
    findings[0].status = "under_review";
    localStorage.setItem("mbi:findings", JSON.stringify(findings));
    assert.notEqual(
        ExpertIntelligenceRuntimeManager.assembleRuntimeInput("inspection-1").sourceFingerprint,
        beforeFinding
    );
});

runTest("runtime execution excludes inspection workflow status from reasoning input only", () => {
    seed({ inspectionStatus: "completed" });
    let observedInput = null;
    const record = ExpertIntelligenceRuntimeManager.executeForInspection("inspection-1", {
        engine: {
            analyzeWithTrace(input) {
                observedInput = input;
                return {
                    status: "no_provider_contract",
                    routedDomains: [],
                    selectedDomain: null,
                    selectedProvider: null,
                    reasoningResult: { supportingEvidence: [], missingEvidence: [] }
                };
            }
        }
    });

    assert.equal(record.runtimeInput.context.inspectionStatus, "completed");
    assert.equal(record.sourceSnapshot.inspection.status, "completed");
    assert.equal(Object.hasOwn(observedInput.context, "inspectionStatus"), false);
});

runTest("fachlich relevant answers, evidence, requirements, and date values remain fingerprinted", () => {
    const cases = [
        () => {
            const scopes = JSON.parse(localStorage.getItem("mbi:inspectionScopes"));
            scopes[0].answers["question-1"].value = "Observed on 2026-07-22";
            localStorage.setItem("mbi:inspectionScopes", JSON.stringify(scopes));
        },
        () => {
            const scopes = JSON.parse(localStorage.getItem("mbi:inspectionScopes"));
            scopes[0].evidenceRequirements[0].requirement = "Drawing dated 2026-07-22";
            localStorage.setItem("mbi:inspectionScopes", JSON.stringify(scopes));
        },
        () => {
            const evidence = JSON.parse(localStorage.getItem("mbi:evidence"));
            evidence[0].title = "Crack measurement dated 2026-07-22";
            localStorage.setItem("mbi:evidence", JSON.stringify(evidence));
        },
        () => {
            const findings = JSON.parse(localStorage.getItem("mbi:findings"));
            findings[0].description = "Crack first observed on 2026-07-22.";
            localStorage.setItem("mbi:findings", JSON.stringify(findings));
        }
    ];

    cases.forEach((change) => {
        seed();
        const before = ExpertIntelligenceRuntimeManager.assembleRuntimeInput("inspection-1").sourceFingerprint;
        change();
        const after = ExpertIntelligenceRuntimeManager.assembleRuntimeInput("inspection-1").sourceFingerprint;
        assert.notEqual(after, before);
    });
});

runTest("reasoning-relevant evidence fields and collection changes remain fingerprinted", () => {
    const evidenceChanges = [
        (entry) => { entry.measurementValue = 4.2; },
        (entry) => { entry.measurementUnit = "cm"; },
        (entry) => { entry.type = "note"; },
        (entry) => { entry.measurementType = "displacement"; },
        (entry) => { entry.location = "Wall B"; },
        (entry) => { entry.capturedAt = "2026-07-22T09:30:00.000Z"; },
        (entry) => { entry.description = "Updated technical observation."; },
        (entry) => { entry.notes = "Updated evidence note."; },
        (entry) => { entry.title = "Updated crack measurement"; },
        (entry) => { entry.fileReference = "evidence/crack-gauge-2"; }
    ];

    evidenceChanges.forEach((change) => {
        seed();
        const before = ExpertIntelligenceRuntimeManager.assembleRuntimeInput("inspection-1").sourceFingerprint;
        const evidence = JSON.parse(localStorage.getItem("mbi:evidence"));
        change(evidence[0]);
        localStorage.setItem("mbi:evidence", JSON.stringify(evidence));
        const after = ExpertIntelligenceRuntimeManager.assembleRuntimeInput("inspection-1").sourceFingerprint;
        assert.notEqual(after, before);
    });

    seed();
    const beforeFinding = ExpertIntelligenceRuntimeManager.assembleRuntimeInput("inspection-1").sourceFingerprint;
    const findings = JSON.parse(localStorage.getItem("mbi:findings"));
    findings[0].location = "Wall C";
    localStorage.setItem("mbi:findings", JSON.stringify(findings));
    assert.notEqual(
        ExpertIntelligenceRuntimeManager.assembleRuntimeInput("inspection-1").sourceFingerprint,
        beforeFinding
    );

    seed();
    const beforeCollection = ExpertIntelligenceRuntimeManager.assembleRuntimeInput("inspection-1").sourceFingerprint;
    const evidence = JSON.parse(localStorage.getItem("mbi:evidence"));
    evidence.push({
        id: "evidence-2",
        caseId: "case-1",
        inspectionId: "inspection-1",
        title: "Second evidence record",
        type: "photo"
    });
    localStorage.setItem("mbi:evidence", JSON.stringify(evidence));
    assert.notEqual(
        ExpertIntelligenceRuntimeManager.assembleRuntimeInput("inspection-1").sourceFingerprint,
        beforeCollection
    );
});

runTest("fingerprint follows normalized reasoning input while operational evidence timestamps remain neutral", () => {
    seed();
    const before = ExpertIntelligenceRuntimeManager.assembleRuntimeInput("inspection-1");
    const evidence = JSON.parse(localStorage.getItem("mbi:evidence"));
    evidence[0].measurementValue = 5.5;
    evidence[0].location = "Wall D";
    localStorage.setItem("mbi:evidence", JSON.stringify(evidence));
    const after = ExpertIntelligenceRuntimeManager.assembleRuntimeInput("inspection-1");

    assert.notDeepStrictEqual(after.runtimeInput, before.runtimeInput);
    assert.notEqual(after.sourceFingerprint, before.sourceFingerprint);
    const expectedFingerprintRuntimeInput = JSON.parse(JSON.stringify(after.runtimeInput));
    delete expectedFingerprintRuntimeInput.context.inspectionStatus;
    assert.deepStrictEqual(
        after.sourceFingerprintProjection.runtimeInput,
        expectedFingerprintRuntimeInput
    );

    seed();
    const operationalBefore = ExpertIntelligenceRuntimeManager.assembleRuntimeInput("inspection-1");
    const operationalEvidence = JSON.parse(localStorage.getItem("mbi:evidence"));
    operationalEvidence[0].createdAt = "2026-08-01T00:00:00.000Z";
    operationalEvidence[0].updatedAt = "2026-08-02T00:00:00.000Z";
    localStorage.setItem("mbi:evidence", JSON.stringify(operationalEvidence));
    const operationalAfter = ExpertIntelligenceRuntimeManager.assembleRuntimeInput("inspection-1");

    assert.equal(operationalAfter.sourceFingerprint, operationalBefore.sourceFingerprint);
    assert.notDeepStrictEqual(
        operationalAfter.sourceSnapshot.evidence,
        operationalBefore.sourceSnapshot.evidence
    );
});

runTest("engine trace preserves the public result contract and first-success selection", () => {
    const input = {
        finding: {
            category: "moisture structural crack",
            description: "moisture ingress and a structural crack at a load-bearing wall"
        }
    };
    const traceOne = ExpertReasoningEngine.analyzeWithTrace(input);
    const traceTwo = ExpertReasoningEngine.analyzeWithTrace(input);

    assert.deepStrictEqual(ExpertReasoningEngine.analyze(input), traceOne.reasoningResult);
    assert.deepStrictEqual(traceOne, traceTwo);
    assert.notStrictEqual(traceOne, traceTwo);
    assert.ok(traceOne.routedDomains.length > 1);
    assert.equal(typeof traceOne.selectedDomain, "string");
    assert.equal(traceOne.selectedProvider, "StructuralSystemsKnowledgeProvider");
    assert.equal(Array.isArray(traceOne.reasoningResult), false);
});

runTest("executes first-success reasoning and preserves governed handoffs without aggregation", () => {
    seed();
    const record = ExpertIntelligenceRuntimeManager.executeForInspection("inspection-1", {
        executedAt: "2026-07-21T12:00:00.000Z"
    });

    assert.equal(record.id, "EI-inspection-1-0001");
    assert.equal(record.engineStatus, "succeeded");
    assert.equal(record.selectedDomain, "structural-systems");
    assert.equal(record.selectedProvider, "StructuralSystemsKnowledgeProvider");
    assert.ok(record.routedDomains.length >= 1);
    assert.equal(Array.isArray(record.reasoningResult), false);
    assert.equal(record.internalModelResult.assessmentState, "COMPLETE");
    assert.equal(
        record.internalModelResult.assessmentContext.selectedProvider,
        "StructuralSystemsKnowledgeProvider"
    );
    assert.equal(record.internalModelResult.assessmentContext.selectedDomain, "structural-systems");
    assert.equal(record.internalModelResult.assessmentContext.sourceReference, record.id);
    assert.equal(record.interpretationModelResult.inputValidation.accepted, true);
    assert.deepStrictEqual(
        record.internalModelResult.domainAssessments[0].missingEvidence,
        record.reasoningResult.missingEvidence
    );
    assert.ok(record.internalModelResult.domainAssessments[0].evidenceReferences.length > 0);
    assert.equal(
        record.internalModelResult.domainAssessments[0].confidenceContext.value,
        record.reasoningResult.confidence
    );
    assert.equal(record.internalModelResult.domainAssessments[0].riskRelevanceEntries[0].rawVersion, "risk-relevance-1.0");
    assert.equal(record.humanReviewRequired, true);
    assert.ok(record.limitations.includes("Visual inspection only."));
});

runTest("provider metadata remains source-bound, nullable, and interpretation-neutral", () => {
    seed();
    const withoutProvider = ExpertIntelligenceRuntimeManager.executeForInspection("inspection-1", {
        engine: {
            analyzeWithTrace(input) {
                return {
                    ...ExpertReasoningEngine.analyzeWithTrace(input),
                    selectedProvider: null
                };
            }
        }
    });

    assert.equal(withoutProvider.selectedDomain, "structural-systems");
    assert.equal(withoutProvider.selectedProvider, null);
    assert.equal(withoutProvider.internalModelResult.assessmentContext.selectedProvider, null);
    assert.equal(withoutProvider.internalModelResult.assessmentContext.selectedDomain, "structural-systems");

    const sourceContract = {
        contractVersion: "expert-reasoning-contract-1.0",
        sourceReference: "source-without-provider",
        domain: "structural-systems",
        primaryHypothesis: { id: "h", label: "hypothesis", status: "hypothesis" },
        alternativeHypotheses: [],
        supportingEvidence: [],
        missingEvidence: [],
        requiredVerification: [],
        potentialConsequences: [],
        confidence: 0
    };
    const legacyCompatible = BuildingRiskInternalModel.build(sourceContract);
    assert.equal(legacyCompatible.assessmentState, "COMPLETE");
    assert.deepStrictEqual(legacyCompatible.assessmentContext, {});

    const withMetadata = BuildingRiskInternalModel.build({
        assessmentContext: { selectedProvider: "Provider A", selectedDomain: "structural-systems" },
        contracts: [sourceContract]
    });
    const alternateMetadata = {
        ...withMetadata,
        assessmentContext: { selectedProvider: "Provider B", selectedDomain: "structural-systems" }
    };
    assert.deepStrictEqual(
        BuildingRiskInterpretationModel.interpret(withMetadata),
        BuildingRiskInterpretationModel.interpret(alternateMetadata)
    );
});

runTest("persists append-only history, reloads it, selects latest, and detects stale source", () => {
    seed();
    const first = ExpertIntelligenceRuntimeManager.executeForInspection("inspection-1", {
        executedAt: "2026-07-21T12:00:00.000Z"
    });
    assert.deepStrictEqual(ExpertIntelligenceRuntimeManager.load(first.id), first);
    assert.equal(ExpertIntelligenceRuntimeManager.getExecutionState("inspection-1").stale, false);

    const scopes = JSON.parse(localStorage.getItem("mbi:inspectionScopes"));
    scopes[0].answers["question-1"].value += " changed";
    localStorage.setItem("mbi:inspectionScopes", JSON.stringify(scopes));
    assert.equal(ExpertIntelligenceRuntimeManager.getExecutionState("inspection-1").stale, true);

    const second = ExpertIntelligenceRuntimeManager.executeForInspection("inspection-1", {
        executedAt: "2026-07-21T12:01:00.000Z"
    });
    assert.equal(second.id, "EI-inspection-1-0002");
    assert.equal(ExpertIntelligenceRuntimeManager.getByInspection("inspection-1").length, 2);
    assert.equal(ExpertIntelligenceRuntimeManager.getLatest("inspection-1").id, second.id);
    assert.notEqual(first.sourceFingerprint, second.sourceFingerprint);
});

runTest("handles no inspection, missing building, and empty persisted inspection data", () => {
    seed();
    assert.throws(
        () => ExpertIntelligenceRuntimeManager.executeForInspection("missing"),
        /not available/
    );

    seed({ buildingId: null });
    const missingBuilding = ExpertIntelligenceRuntimeManager.executeForInspection("inspection-1");
    assert.equal(missingBuilding.engineStatus, "failed");
    assert.match(missingBuilding.errorState.message, /building reference/);

    seed({ answer: null });
    localStorage.setItem("mbi:findings", "[]");
    const empty = ExpertIntelligenceRuntimeManager.executeForInspection("inspection-1");
    assert.equal(empty.engineStatus, "not_run");
    assert.match(empty.errorState.message, /No persisted inspection answers or findings/);
});

runTest("persists no-domain and engine-failure states without false success", () => {
    seed();
    const noDomain = ExpertIntelligenceRuntimeManager.executeForInspection("inspection-1", {
        engine: {
            analyzeWithTrace() {
                return {
                    status: "no_provider_contract",
                    routedDomains: [],
                    selectedDomain: null,
                    selectedProvider: null,
                    reasoningResult: { supportingEvidence: [], missingEvidence: [] }
                };
            }
        }
    });
    assert.equal(noDomain.engineStatus, "no_provider_contract");
    assert.equal(noDomain.internalModelResult, null);

    const failure = ExpertIntelligenceRuntimeManager.executeForInspection("inspection-1", {
        engine: {
            analyzeWithTrace() {
                throw new Error("provider contract failure");
            }
        }
    });
    assert.equal(failure.engineStatus, "failed");
    assert.equal(failure.errorState.message, "provider contract failure");
});

runTest("preserves model rejection data and exposes persistence failures", () => {
    seed();
    const rejected = ExpertIntelligenceRuntimeManager.executeForInspection("inspection-1", {
        internalModel: {
            MODEL_VERSION: "test-internal-model",
            build() {
                return { assessmentState: "INVALID", invalidSources: [{ reason: "invalid test contract" }] };
            }
        }
    });
    assert.equal(rejected.engineStatus, "failed");
    assert.equal(rejected.internalModelResult.assessmentState, "INVALID");
    assert.equal(rejected.reasoningResult.primaryHypothesis.status, "hypothesis");

    seed();
    const originalSetItem = localStorage.setItem.bind(localStorage);
    localStorage.setItem = (key, value) => {
        if (key === "mbi:expertIntelligenceExecutions") {
            throw new Error("storage unavailable");
        }
        originalSetItem(key, value);
    };
    const persistenceFailure = ExpertIntelligenceRuntimeManager.executeForInspection("inspection-1");
    localStorage.setItem = originalSetItem;

    assert.equal(persistenceFailure.engineStatus, "failed");
    assert.match(persistenceFailure.errorState.message, /Execution persistence failed/);
    assert.equal(ExpertIntelligenceRuntimeManager.getLatest("inspection-1").id, persistenceFailure.id);
});

runTest("preserves model conflicts and interpretation limitations", () => {
    seed();
    const conflict = { conflictReference: "conflict-1", conflictType: "EVIDENCE_CONTRADICTION" };
    const record = ExpertIntelligenceRuntimeManager.executeForInspection("inspection-1", {
        internalModel: {
            build() {
                return {
                    internalModelVersion: "test-internal-model",
                    assessmentState: "COMPLETE",
                    domainAssessments: [],
                    conflicts: [conflict]
                };
            }
        },
        interpretationModel: {
            interpret() {
                return {
                    inputValidation: { accepted: true },
                    interpretationState: "LIMITED",
                    domainInterpretations: [],
                    limitations: ["Conflict requires human review."]
                };
            }
        }
    });

    assert.deepStrictEqual(record.internalModelResult.conflicts, [conflict]);
    assert.ok(record.limitations.includes("Conflict requires human review."));
    assert.equal(ExpertIntelligenceRuntimeManager.createSummary(record).conflictCount, 1);
});

runTest("preserves unsupported and invalid Risk Relevance states", () => {
    const cases = [
        ["high", "risk-relevance-9.9", "VERSION_UNSUPPORTED", "LEGACY_SUPPORTED"],
        ["extreme", "risk-relevance-1.0", "VERSION_SUPPORTED", "INVALID_VALUE"]
    ];

    cases.forEach(([value, version, expectedVersionState, expectedValueState]) => {
        seed();
        const record = ExpertIntelligenceRuntimeManager.executeForInspection("inspection-1", {
            engine: {
                analyzeWithTrace() {
                    return {
                        status: "success",
                        routedDomains: ["structural-systems"],
                        selectedDomain: "structural-systems",
                        selectedProvider: "structural-systems",
                        reasoningResult: {
                            primaryHypothesis: {
                                id: "test-hypothesis",
                                label: "test hypothesis",
                                status: "hypothesis",
                                riskRelevance: value,
                                riskRelevanceVersion: version
                            },
                            alternativeHypotheses: [],
                            supportingEvidence: ["observed condition"],
                            missingEvidence: ["specialist verification"],
                            requiredVerification: ["Verify."],
                            potentialConsequences: ["Uncertainty remains."],
                            confidence: 1
                        }
                    };
                }
            }
        });
        const relevance = record.internalModelResult.domainAssessments[0].riskRelevanceEntries[0];
        assert.equal(relevance.rawValue, value);
        assert.equal(relevance.rawVersion, version);
        assert.equal(relevance.versionState, expectedVersionState);
        assert.equal(relevance.valueState, expectedValueState);
        assert.equal(record.interpretationModelResult.domainInterpretations[0]
            .riskRelevanceInterpretations[0].interpretationState, "NOT_INTERPRETED");
    });
});

runTest("malformed execution history is excluded safely and remains observable", () => {
    seed();
    const valid = ExpertIntelligenceRuntimeManager.executeForInspection("inspection-1", {
        executedAt: "2026-07-21T12:00:00.000Z"
    });
    const malformed = [
        null,
        42,
        "invalid",
        [],
        { ...valid, id: "missing-inspection", inspectionId: null, sequence: 90 },
        { ...valid, id: "bad-time", sequence: 91, executedAt: "not-a-date" },
        { ...valid, id: "bad-snapshot", sequence: 92, sourceSnapshot: "invalid" },
        { ...valid, id: "bad-status", sequence: 93, engineStatus: "unknown-success" },
        { ...valid, id: null, sequence: 94 }
    ];
    localStorage.setItem(
        "mbi:expertIntelligenceExecutions",
        JSON.stringify([valid, ...malformed])
    );

    assert.doesNotThrow(() => ExpertIntelligenceRuntimeManager.getByInspection("inspection-1"));
    assert.equal(ExpertIntelligenceRuntimeManager.getByInspection("inspection-1").length, 1);
    assert.equal(ExpertIntelligenceRuntimeManager.getLatest("inspection-1").id, valid.id);
    assert.equal(ExpertIntelligenceRuntimeManager.load("bad-time"), null);

    const state = ExpertIntelligenceRuntimeManager.getExecutionState("inspection-1");
    assert.equal(state.status, "succeeded");
    assert.equal(state.latest.id, valid.id);
    assert.equal(state.stale, false);
    assert.equal(state.corruption.detected, true);
    assert.equal(state.corruption.count, malformed.length);
    assert.ok(state.corruption.records.every((entry) => {
        return entry.state === "CORRUPT_EXECUTION_RECORD_EXCLUDED"
            && entry.humanReviewRequired === true;
    }));
});

runTest("a malformed-only collection returns a safe reviewable empty state", () => {
    seed();
    localStorage.setItem("mbi:expertIntelligenceExecutions", JSON.stringify([null, 7, { id: "partial" }]));

    const state = ExpertIntelligenceRuntimeManager.getExecutionState("inspection-1");
    assert.equal(state.status, "not_run");
    assert.equal(state.latest, null);
    assert.equal(state.stale, false);
    assert.equal(state.corruption.detected, true);
    assert.equal(state.corruption.count, 3);
});

console.log("Expert Intelligence Runtime Manager tests completed successfully.");
