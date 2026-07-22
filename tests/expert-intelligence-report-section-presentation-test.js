import assert from "node:assert/strict";

class MemoryStorage {
    constructor() { this.values = new Map(); }
    getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
    setItem(key, value) { this.values.set(key, String(value)); }
    removeItem(key) { this.values.delete(key); }
}

globalThis.localStorage = new MemoryStorage();
globalThis.document = {
    createElement(tagName) {
        return { tagName, className: "", innerHTML: "" };
    }
};

const { default: ReportPage } = await import("../portal/ui/pages/ReportPage.js");

let groups = 0;

function group(name, callback) {
    callback();
    groups += 1;
    console.log(`PASS: ${name}`);
}

function section(overrides = {}) {
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
        humanReviewStatus: "pending",
        generatedFromVersion: "expert-intelligence-report-projection-1.0",
        ...overrides
    };
}

function render(expertIntelligence) {
    return ReportPage.renderExpertIntelligenceReportSection({ expertIntelligence });
}

group("renders the released available fields in deterministic order", () => {
    const html = render(section());
    const labels = [
        "Availability status",
        "Domain",
        "Provider",
        "Confidence",
        "Interpretation state",
        "Interpretation eligible",
        "Stale",
        "Human Review required",
        "Human Review status",
        "Projection version"
    ];

    labels.reduce((previous, label) => {
        const position = html.indexOf(label);
        assert.ok(position > previous, label);
        return position;
    }, -1);
    assert.match(html, /available/);
    assert.match(html, /structural-systems/);
    assert.match(html, /StructuralSystemsKnowledgeProvider/);
    assert.match(html, />0\.7</);
    assert.match(html, /INTERPRETED/);
    assert.match(html, /expert-intelligence-report-projection-1\.0/);
});

group("tolerates null projection without changing existing report layout", () => {
    assert.equal(render(null), "");
    assert.equal(ReportPage.renderExpertIntelligenceReportSection({}), "");

    const preview = ReportPage.createReportPreview({
        title: "Existing report",
        reportType: "Technical Due Diligence",
        expertIntelligence: null
    });

    assert.match(preview.innerHTML, /report-preview__cover/);
    assert.match(preview.innerHTML, /report-preview__summary/);
    assert.match(preview.innerHTML, /report-preview__status-table/);
    assert.doesNotMatch(preview.innerHTML, /data-expert-intelligence-report-section/);
});

group("integrates the governed section additively into the existing report preview", () => {
    const preview = ReportPage.createReportPreview({
        title: "Existing report",
        reportType: "Technical Due Diligence",
        expertIntelligence: section()
    });

    assert.equal((preview.innerHTML.match(/data-expert-intelligence-report-section/g) || []).length, 1);
    assert.ok(preview.innerHTML.indexOf("report-preview__status-table")
        < preview.innerHTML.indexOf("data-expert-intelligence-report-section"));
});

group("renders no-execution state without reconstructing missing values", () => {
    const html = render(section({
        status: "no_execution",
        hasExecution: false,
        domain: null,
        provider: null,
        confidence: null,
        interpretation: { state: null, eligible: false },
        humanReviewRequired: false,
        humanReviewStatus: "not_required"
    }));

    assert.match(html, /no_execution/);
    assert.match(html, /not_required/);
    assert.equal((html.match(/—/g) || []).length, 4);
});

group("renders unavailable state without inferring readiness", () => {
    const html = render(section({ status: "unavailable" }));

    assert.match(html, /unavailable/);
    assert.doesNotMatch(html, /ready|approved|approval/i);
});

group("keeps stale state explicitly visible", () => {
    const html = render(section({ status: "stale", stale: true }));

    assert.match(html, /stale/);
    assert.match(html, />true</);
});

group("renders Human Review states as unranked factual values", () => {
    [
        [false, "not_required"],
        [true, "pending"],
        [true, "completed"]
    ].forEach(([required, status]) => {
        const html = render(section({
            humanReviewRequired: required,
            humanReviewStatus: status
        }));

        assert.match(html, new RegExp(status));
        assert.match(html, new RegExp(`>${required}<`));
    });
});

group("excludes forbidden and unknown report data", () => {
    const expertIntelligence = section({
        executionId: "execution-secret",
        hypotheses: ["hidden-hypothesis"],
        supportingEvidence: ["hidden-evidence"],
        missingEvidence: ["hidden-missing"],
        riskRelevance: "hidden-risk-relevance",
        conflicts: ["hidden-conflict"],
        limitations: ["hidden-limitation"],
        diagnostics: ["hidden-diagnostic"],
        errorMessage: "hidden-error",
        reviewReasoning: "hidden-review-reasoning",
        reviewHistory: ["hidden-review-history"],
        executionHistory: ["hidden-execution-history"],
        providerInternals: "hidden-provider-internals"
    });
    const html = render(expertIntelligence);

    [
        "execution-secret",
        "hidden-hypothesis",
        "hidden-evidence",
        "hidden-missing",
        "hidden-risk-relevance",
        "hidden-conflict",
        "hidden-limitation",
        "hidden-diagnostic",
        "hidden-error",
        "hidden-review-reasoning",
        "hidden-review-history",
        "hidden-execution-history",
        "hidden-provider-internals"
    ].forEach((value) => assert.doesNotMatch(html, new RegExp(value)));
});

group("escapes scalar values and never stringifies structured payloads", () => {
    const html = render(section({
        domain: "<script>domain</script>",
        provider: { payload: "giant-provider-payload" },
        interpretation: { state: ["giant-interpretation-payload"], eligible: true }
    }));

    assert.match(html, /&lt;script&gt;domain&lt;\/script&gt;/);
    assert.doesNotMatch(html, /<script>|\[object Object\]|giant-provider-payload|giant-interpretation-payload/);
});

group("produces identical markup for identical assembled sections", () => {
    const expertIntelligence = section();

    assert.equal(render(expertIntelligence), render({
        ...expertIntelligence,
        interpretation: { ...expertIntelligence.interpretation }
    }));
});

group("presentation source has no Runtime Storage governance or export interaction", () => {
    const source = ReportPage.renderExpertIntelligenceReportSection.toString();

    assert.doesNotMatch(source, /RuntimeManager|StorageManager|HumanReviewPersistence|Governance|Export|createSummary|assembleReport/);
});

assert.equal(groups, 11);
console.log(`Expert Intelligence report-section presentation tests completed: ${groups} groups passed.`);
