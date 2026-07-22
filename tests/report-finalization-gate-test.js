import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ReportAssemblyEngine from "../portal/core/ReportAssemblyEngine.js";
import ReportFinalizationGate from "../portal/core/reporting/ReportFinalizationGate.js";

let groups = 0;

function group(name, callback) {
    callback();
    groups += 1;
    console.log(`PASS: ${name}`);
}

function validReport(overrides = {}) {
    return {
        ...ReportAssemblyEngine.assembleReport({
            context: { inspectionId: "inspection-b5-a" },
            findings: [{ findingId: "finding-1" }],
            assessments: [{ assessmentId: "assessment-1", risk: "medium" }],
            recommendations: [{ recommendationId: "recommendation-1" }],
            generatedAt: "2026-07-22T16:00:00.000Z"
        }),
        ...overrides
    };
}

function availableExpertIntelligence(overrides = {}) {
    return {
        status: "available",
        hasExecution: true,
        stale: false,
        domain: "structural-systems",
        provider: "StructuralSystemsKnowledgeProvider",
        confidence: 0.7,
        interpretation: {
            state: "INTERPRETED",
            eligible: true
        },
        humanReviewRequired: true,
        humanReviewStatus: "completed",
        generatedFromVersion: "expert-intelligence-report-projection-1.0",
        ...overrides
    };
}

group("accepts a valid released assembled report", () => {
    const result = ReportFinalizationGate.evaluate(validReport());

    assert.deepEqual(result, {
        eligible: true,
        reasons: [],
        version: "report-finalization-gate-1.0"
    });
});

group("accepts a valid governed Expert Intelligence section", () => {
    const result = ReportFinalizationGate.evaluate(validReport({
        expertIntelligence: availableExpertIntelligence()
    }));

    assert.equal(result.eligible, true);
    assert.deepEqual(result.reasons, []);
});

group("accepts every released Expert Intelligence status combination", () => {
    const noExecution = {
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
    };
    const sections = [
        noExecution,
        availableExpertIntelligence(),
        availableExpertIntelligence({ status: "stale", stale: true }),
        availableExpertIntelligence({ status: "unavailable", stale: false }),
        availableExpertIntelligence({ status: "unavailable", stale: true })
    ];

    sections.forEach((expertIntelligence) => {
        assert.equal(ReportFinalizationGate.evaluate(
            validReport({ expertIntelligence })
        ).eligible, true);
    });
});

group("rejects a missing report deterministically", () => {
    [undefined, null].forEach((report) => {
        assert.deepEqual(ReportFinalizationGate.evaluate(report), {
            eligible: false,
            reasons: ["REPORT_MISSING"],
            version: "report-finalization-gate-1.0"
        });
    });
});

group("rejects invalid report structures", () => {
    [
        [],
        "report",
        { ...validReport(), findings: {} },
        { ...validReport(), metadata: { ...validReport().metadata, findingCount: 2 } },
        { ...validReport(), metadata: { ...validReport().metadata, generatedAt: "not-a-timestamp" } },
        { ...validReport(), metadata: { ...validReport().metadata, reportVersion: "Foundation-unknown" } },
        { ...validReport(), summary: { ...validReport().summary, highestRisk: "unknown" } }
    ].forEach((report) => {
        const result = ReportFinalizationGate.evaluate(report);
        assert.equal(result.eligible, false);
        assert.ok(result.reasons.includes("REPORT_STRUCTURE_INVALID"));
    });
});

group("ignores structured future top-level sections without weakening governed sections", () => {
    const futureReleasedSection = {
        version: "future-section-1.0",
        data: ["preserved", "but not inspected"]
    };
    const report = validReport({ futureReleasedSection });
    const before = structuredClone(report);
    const first = ReportFinalizationGate.evaluate(report);
    const second = ReportFinalizationGate.evaluate(report);
    const malformedGoverned = ReportFinalizationGate.evaluate({
        ...report,
        metadata: { ...report.metadata, findingCount: 2 }
    });

    assert.deepEqual(first, {
        eligible: true,
        reasons: [],
        version: "report-finalization-gate-1.0"
    });
    assert.deepEqual(second, first);
    assert.notEqual(second, first);
    assert.deepEqual(report, before);
    assert.equal(report.futureReleasedSection, futureReleasedSection);
    assert.equal(Object.isFrozen(first), true);
    assert.equal(Object.isFrozen(first.reasons), true);
    assert.equal(malformedGoverned.eligible, false);
    assert.ok(malformedGoverned.reasons.includes("REPORT_STRUCTURE_INVALID"));
});

group("rejects every missing required section", () => {
    [
        "metadata",
        "context",
        "findings",
        "assessments",
        "recommendations",
        "expertIntelligence",
        "summary"
    ].forEach((section) => {
        const report = validReport();
        delete report[section];
        const result = ReportFinalizationGate.evaluate(report);

        assert.equal(result.eligible, false);
        assert.ok(result.reasons.includes("REQUIRED_SECTION_MISSING"), section);
    });
});

group("rejects invalid Expert Intelligence contracts and invariants", () => {
    [
        {},
        { ...availableExpertIntelligence(), executionId: "forbidden" },
        { ...availableExpertIntelligence(), hasExecution: false },
        { ...availableExpertIntelligence(), stale: true },
        { ...availableExpertIntelligence(), humanReviewRequired: false, humanReviewStatus: "completed" },
        { ...availableExpertIntelligence(), interpretation: { state: {}, eligible: true } },
        {
            ...availableExpertIntelligence(),
            status: "no_execution",
            hasExecution: false,
            domain: "structural-systems",
            provider: null,
            confidence: null,
            interpretation: { state: null, eligible: false },
            humanReviewRequired: false,
            humanReviewStatus: "not_required"
        }
    ].forEach((expertIntelligence) => {
        const result = ReportFinalizationGate.evaluate(validReport({ expertIntelligence }));

        assert.equal(result.eligible, false);
        assert.ok(result.reasons.includes("EXPERT_INTELLIGENCE_INVALID"));
    });
});

group("rejects impossible governance combinations without inferring readiness", () => {
    const pending = ReportFinalizationGate.evaluate(validReport({
        expertIntelligence: availableExpertIntelligence({ humanReviewStatus: "pending" })
    }));
    const impossibleCompleted = ReportFinalizationGate.evaluate(validReport({
        expertIntelligence: availableExpertIntelligence({
            humanReviewRequired: false,
            humanReviewStatus: "completed"
        })
    }));
    const impossibleNotRequired = ReportFinalizationGate.evaluate(validReport({
        expertIntelligence: availableExpertIntelligence({ humanReviewStatus: "not_required" })
    }));

    assert.equal(pending.eligible, true);
    assert.deepEqual(pending.reasons, []);
    assert.deepEqual(impossibleCompleted.reasons, ["EXPERT_INTELLIGENCE_INVALID"]);
    assert.deepEqual(impossibleNotRequired.reasons, ["EXPERT_INTELLIGENCE_INVALID"]);
});

group("does not mutate repair or normalize input", () => {
    const report = validReport({
        expertIntelligence: availableExpertIntelligence({ stale: true })
    });
    const before = structuredClone(report);

    const result = ReportFinalizationGate.evaluate(report);

    assert.equal(result.eligible, false);
    assert.deepEqual(report, before);
    assert.equal(report.expertIntelligence.stale, true);
});

group("returns deterministic detached deeply immutable results", () => {
    const report = validReport();
    const first = ReportFinalizationGate.evaluate(report);
    const second = ReportFinalizationGate.evaluate(report);

    assert.deepEqual(first, second);
    assert.notEqual(first, second);
    assert.notEqual(first.reasons, second.reasons);
    assert.equal(Object.isFrozen(first), true);
    assert.equal(Object.isFrozen(first.reasons), true);
    assert.throws(() => { first.eligible = false; }, TypeError);
    assert.throws(() => { first.reasons.push("ALTERED"); }, TypeError);
});

group("exposes exactly one public evaluation method and remains dependency isolated", () => {
    assert.deepEqual(Object.getOwnPropertyNames(ReportFinalizationGate)
        .filter((name) => !["length", "name", "prototype"].includes(name)), ["evaluate"]);

    const source = readFileSync(
        new URL("../portal/core/reporting/ReportFinalizationGate.js", import.meta.url),
        "utf8"
    );

    assert.doesNotMatch(source, /^import\s/m);
    assert.doesNotMatch(
        source,
        /ExpertIntelligenceRuntimeManager|StorageManager|ExpertIntelligenceReportProjection|ReportPage|ReportAssemblyEngine|ReportOutputGovernanceManager|ReportFinalizationLockManager|localStorage|fetch/
    );
});

assert.equal(groups, 12);
console.log(`Report Finalization Gate tests completed: ${groups} groups passed.`);
