import assert from "node:assert/strict";
import IntelligenceEngine from "../portal/core/IntelligenceEngine.js";

function testClampScore() {
    assert.equal(IntelligenceEngine.clampScore(0), 0);
    assert.equal(IntelligenceEngine.clampScore(42.4), 42);
    assert.equal(IntelligenceEngine.clampScore(42.6), 43);
    assert.equal(IntelligenceEngine.clampScore(130), 100);
    assert.equal(IntelligenceEngine.clampScore(-12), 0);
    assert.equal(IntelligenceEngine.clampScore("not-a-number"), 0);
}

function testWorkflowCounts() {
    const counts = IntelligenceEngine.getWorkflowCounts({
        inspections: [{ id: "i1" }],
        evidences: [{ id: "e1" }, { id: "e2" }],
        findings: [{ id: "f1" }],
        assessments: [],
        recommendations: [{ id: "r1" }],
        decisions: [{ id: "d1" }],
        reports: [{ id: "rp1" }]
    });

    assert.deepEqual(counts, {
        inspection: 1,
        evidence: 2,
        finding: 1,
        assessment: 0,
        recommendation: 1,
        decision: 1,
        report: 1
    });
}

function testStageReadiness() {
    const readiness = IntelligenceEngine.getStageReadiness(
        {
            evidence: 2,
            finding: 1,
            assessment: 0,
            recommendation: 0,
            decision: 0,
            report: 0
        },
        IntelligenceEngine.defaultWorkflowStages
    );

    assert.equal(readiness.completedStages, 2);
    assert.equal(readiness.totalStages, 6);
    assert.equal(readiness.percent, 33);
    assert.equal(readiness.isComplete, false);
}

function testConfidenceScore() {
    const confidence = IntelligenceEngine.getConfidenceScore({
        readinessPercent: 50,
        primarySignals: 2,
        downstreamSignals: 1,
        outputSignals: 1,
        weights: {
            readiness: 0.6,
            primary: 4,
            downstream: 3,
            output: 4
        }
    });

    assert.equal(confidence, 45);
}

function testSignalLevel() {
    assert.equal(IntelligenceEngine.getSignalLevel(0), "draft");
    assert.equal(IntelligenceEngine.getSignalLevel(4), "active");
    assert.equal(IntelligenceEngine.getSignalLevel(8), "ready");
}

function testCreateSignal() {
    const signal = IntelligenceEngine.createSignal({
        value: 5,
        low: {
            label: "Low",
            description: "Low signal"
        },
        moderate: {
            label: "Moderate",
            description: "Moderate signal"
        },
        high: {
            label: "High",
            description: "High signal"
        }
    });

    assert.deepEqual(signal, {
        tone: "active",
        label: "Moderate",
        description: "Moderate signal"
    });
}

function testFirstOpenStage() {
    const firstOpen = IntelligenceEngine.getFirstOpenStage(
        {
            evidence: 1,
            finding: 1,
            assessment: 0,
            recommendation: 0
        },
        ["evidence", "finding", "assessment", "recommendation"]
    );

    assert.equal(firstOpen, "assessment");
}

function testFilterByRelation() {
    const items = [
        { id: "a", caseId: "case-1" },
        { id: "b", linkedCaseId: "case-1" },
        { id: "c", buildingId: "building-1" },
        { id: "d", inspectionId: "inspection-1" },
        { id: "e", caseId: "case-2" }
    ];

    const caseItems = IntelligenceEngine.filterByRelation(items, {
        caseId: "case-1"
    });

    assert.deepEqual(caseItems.map((item) => item.id), ["a", "b"]);

    const buildingItems = IntelligenceEngine.filterByRelation(items, {
        buildingId: "building-1"
    });

    assert.deepEqual(buildingItems.map((item) => item.id), ["c"]);
}

function testReadinessFromChecks() {
    const readiness = IntelligenceEngine.getReadinessFromChecks([
        true,
        false,
        true,
        true
    ]);

    assert.equal(readiness.completed, 3);
    assert.equal(readiness.total, 4);
    assert.equal(readiness.percent, 75);
    assert.equal(readiness.isComplete, false);
}

function testReadinessLabel() {
    assert.equal(
        IntelligenceEngine.getReadinessLabel(100, {
            complete: "Complete",
            developing: "Developing",
            early: "Early"
        }),
        "Complete"
    );

    assert.equal(
        IntelligenceEngine.getReadinessLabel(50, {
            complete: "Complete",
            developing: "Developing",
            early: "Early"
        }),
        "Developing"
    );

    assert.equal(
        IntelligenceEngine.getReadinessLabel(20, {
            complete: "Complete",
            developing: "Developing",
            early: "Early"
        }),
        "Early"
    );
}

testClampScore();
testWorkflowCounts();
testStageReadiness();
testConfidenceScore();
testSignalLevel();
testCreateSignal();
testFirstOpenStage();
testFilterByRelation();
testReadinessFromChecks();
testReadinessLabel();

console.log("IntelligenceEngine tests passed.");