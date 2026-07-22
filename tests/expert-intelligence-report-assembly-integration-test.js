import assert from "node:assert/strict";
import ReportAssemblyEngine from "../portal/core/ReportAssemblyEngine.js";
import ExpertIntelligenceReportProjection from "../portal/core/reporting/ExpertIntelligenceReportProjection.js";

let groups = 0;

function group(name, callback) {
    callback();
    groups += 1;
    console.log(`PASS: ${name}`);
}

function projectionInput(overrides = {}) {
    return {
        executionSummary: {
            status: "succeeded",
            selectedDomain: "structural-systems",
            selectedProvider: "StructuralSystemsKnowledgeProvider",
            confidence: 0.7,
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

function assemble(projection) {
    return ReportAssemblyEngine.assembleReport({
        context: { inspectionId: "inspection-b4-b" },
        findings: [{ findingId: "finding-1" }],
        assessments: [{ assessmentId: "assessment-1", risk: "medium" }],
        recommendations: [{ recommendationId: "recommendation-1" }],
        expertIntelligenceProjection: projection,
        generatedAt: "2026-07-22T12:00:00.000Z"
    });
}

group("integrates exactly one governed Expert Intelligence report section", () => {
    const projection = ExpertIntelligenceReportProjection.createProjection(projectionInput());
    const report = assemble(projection);

    assert.deepEqual(Object.keys(report.expertIntelligence), Object.keys(projection));
    assert.deepEqual(report.expertIntelligence, projection);
    assert.notEqual(report.expertIntelligence, projection);
    assert.notEqual(report.expertIntelligence.interpretation, projection.interpretation);
    assert.equal(Object.keys(report).filter((field) => field === "expertIntelligence").length, 1);
});

group("preserves available projection state without inference", () => {
    const projection = ExpertIntelligenceReportProjection.createProjection(projectionInput());
    const section = assemble(projection).expertIntelligence;

    assert.equal(section.status, "available");
    assert.equal(section.domain, "structural-systems");
    assert.equal(section.provider, "StructuralSystemsKnowledgeProvider");
    assert.equal(section.confidence, 0.7);
    assert.deepEqual(section.interpretation, { state: "INTERPRETED", eligible: true });
});

group("preserves the explicit no-execution projection", () => {
    const projection = ExpertIntelligenceReportProjection.createProjection({});
    const section = assemble(projection).expertIntelligence;

    assert.equal(section.status, "no_execution");
    assert.equal(section.hasExecution, false);
    assert.equal(section.domain, null);
    assert.equal(section.provider, null);
    assert.equal(section.confidence, null);
});

group("preserves stale projection state", () => {
    const projection = ExpertIntelligenceReportProjection.createProjection(projectionInput({ stale: true }));
    const section = assemble(projection).expertIntelligence;

    assert.equal(section.status, "stale");
    assert.equal(section.stale, true);
});

group("preserves unavailable projection state", () => {
    const projection = ExpertIntelligenceReportProjection.createProjection(projectionInput({
        executionSummary: { ...projectionInput().executionSummary, status: "failed" }
    }));
    const section = assemble(projection).expertIntelligence;

    assert.equal(section.status, "unavailable");
    assert.equal(section.hasExecution, true);
});

group("preserves only factual Human Review status", () => {
    const completed = ExpertIntelligenceReportProjection.createProjection(projectionInput({
        humanReviewSummary: { completed: true }
    }));
    const pending = ExpertIntelligenceReportProjection.createProjection(projectionInput());

    assert.equal(assemble(completed).expertIntelligence.humanReviewStatus, "completed");
    assert.equal(assemble(pending).expertIntelligence.humanReviewStatus, "pending");
});

group("report assembly is deterministic for a fixed timestamp and projection", () => {
    const projection = ExpertIntelligenceReportProjection.createProjection(projectionInput());
    const first = assemble(projection);
    const second = assemble(projection);

    assert.deepEqual(first, second);
    assert.notEqual(first, second);
    assert.notEqual(first.expertIntelligence, second.expertIntelligence);
});

group("forbidden Expert Intelligence fields cannot enter the report section", () => {
    const projection = ExpertIntelligenceReportProjection.createProjection(projectionInput());
    const section = assemble(projection).expertIntelligence;
    const forbidden = [
        "executionId",
        "hypotheses",
        "supportingEvidence",
        "missingEvidence",
        "riskRelevance",
        "conflicts",
        "limitations",
        "diagnostics",
        "errorMessage",
        "reviewReasoning",
        "reviewAuditTrail",
        "history"
    ];

    forbidden.forEach((field) => assert.equal(Object.hasOwn(section, field), false, field));
});

group("rejects expanded or malformed projection contracts without fallback", () => {
    const projection = ExpertIntelligenceReportProjection.createProjection(projectionInput());

    assert.throws(() => assemble({ ...projection, executionId: "forbidden" }), /unsupported.*contract/i);
    assert.throws(() => assemble({ ...projection, status: "approved" }), /invalid.*fields/i);
    assert.throws(() => assemble({ ...projection, confidence: Infinity }), /invalid.*fields/i);
    assert.throws(() => assemble({
        ...projection,
        interpretation: { ...projection.interpretation, diagnostics: [] }
    }), /invalid.*interpretation/i);
});

group("rejects semantically impossible projection contracts without repair", () => {
    const available = ExpertIntelligenceReportProjection.createProjection(projectionInput());
    const noExecution = ExpertIntelligenceReportProjection.createProjection({});

    assert.deepEqual(assemble(available).expertIntelligence, available);

    [
        { ...available, hasExecution: false },
        { ...available, stale: true },
        { ...available, humanReviewRequired: false, humanReviewStatus: "completed" },
        { ...available, humanReviewRequired: true, humanReviewStatus: "not_required" },
        { ...available, humanReviewRequired: false, humanReviewStatus: "pending" },
        { ...noExecution, domain: "structural-systems" },
        { ...noExecution, provider: "StructuralSystemsKnowledgeProvider" },
        { ...noExecution, confidence: 0.7 },
        { ...noExecution, stale: true },
        { ...noExecution, interpretation: { state: "INTERPRETED", eligible: false } },
        { ...noExecution, interpretation: { state: null, eligible: true } },
        { ...noExecution, humanReviewRequired: true, humanReviewStatus: "pending" },
        { ...available, status: "stale", stale: false },
        { ...available, status: "unavailable", hasExecution: false }
    ].forEach((projection) => {
        assert.throws(() => assemble(projection), /semantically invalid.*projection/i);
    });
});

group("consumes an immutable projection without mutation or shared references", () => {
    const projection = ExpertIntelligenceReportProjection.createProjection(projectionInput());
    const before = JSON.stringify(projection);
    const section = assemble(projection).expertIntelligence;

    assert.equal(JSON.stringify(projection), before);
    assert.equal(Object.isFrozen(projection), true);
    assert.equal(Object.isFrozen(section), true);
    assert.equal(Object.isFrozen(section.interpretation), true);
    assert.throws(() => { section.status = "approved"; }, TypeError);
    assert.throws(() => { section.interpretation.state = "APPROVED"; }, TypeError);
});

group("legacy report assembly remains available without reconstructing projection data", () => {
    const report = ReportAssemblyEngine.assembleReport({
        findings: [{ findingId: "legacy-finding" }],
        generatedAt: "2026-07-22T12:00:00.000Z"
    });

    assert.equal(report.expertIntelligence, null);
    assert.equal(report.findings.length, 1);
    assert.equal(report.metadata.findingCount, 1);
    assert.equal(report.summary.totalFindings, 1);
});

group("assembly introduces no Runtime Storage UI governance or export dependency", () => {
    const source = ReportAssemblyEngine.assembleReport.toString();

    assert.doesNotMatch(source, /RuntimeManager|StorageManager|createSummary|executionHistory|ReportPage|Finalization|Export|localStorage|fetch/);
});

assert.equal(groups, 13);
console.log(`Expert Intelligence Report Assembly integration tests completed: ${groups} groups passed.`);
