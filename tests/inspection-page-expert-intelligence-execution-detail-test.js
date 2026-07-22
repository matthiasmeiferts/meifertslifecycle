import assert from "node:assert/strict";

class TestElement {
    constructor(tagName) {
        this.tagName = tagName;
        this.children = [];
        this.dataset = {};
        this.textContent = "";
        this.className = "";
        this.listeners = {};
    }
    appendChild(child) { this.children.push(child); return child; }
    addEventListener(type, listener) { this.listeners[type] = listener; }
    querySelector(selector) { return findAll(this, selector)[0] || null; }
}

function dataKey(selector) {
    return selector.match(/^\[data-([a-z-]+)\]$/)?.[1]
        ?.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function findAll(root, selector) {
    const key = dataKey(selector);
    const matches = [];
    const visit = (node) => {
        if (key && Object.hasOwn(node.dataset || {}, key)) matches.push(node);
        (node.children || []).forEach(visit);
    };
    visit(root);
    return matches;
}

function findByTag(root, tagName) {
    const expected = String(tagName).toLowerCase();
    const matches = [];
    const visit = (node) => {
        if (String(node.tagName).toLowerCase() === expected) matches.push(node);
        (node.children || []).forEach(visit);
    };
    visit(root);
    return matches;
}

function textOf(root) {
    return [root.textContent, ...(root.children || []).map(textOf)].join(" ");
}

function sectionByHeading(root, heading) {
    return findByTag(root, "section").find((section) => {
        return section.children.some((entry) => {
            return String(entry.tagName).toLowerCase() === "h5" && entry.textContent === heading;
        });
    }) || null;
}

function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.values(value).forEach(deepFreeze);
    return Object.freeze(value);
}

globalThis.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
globalThis.document = {
    createElement(tagName) { return new TestElement(tagName); },
    createDocumentFragment() { return new TestElement("fragment"); }
};

const { default: InspectionPage } = await import("../portal/ui/pages/InspectionPage.js");
const { default: ExpertIntelligenceRuntimeManager } = await import("../portal/core/ExpertIntelligenceRuntimeManager.js");
const { default: HumanReviewRuntimeManager } = await import("../portal/core/HumanReviewRuntimeManager.js");

const originals = {
    getByInspection: ExpertIntelligenceRuntimeManager.getByInspection,
    getExecutionState: ExpertIntelligenceRuntimeManager.getExecutionState,
    createSummary: ExpertIntelligenceRuntimeManager.createSummary,
    executeForInspection: ExpertIntelligenceRuntimeManager.executeForInspection,
    createExecution: ExpertIntelligenceRuntimeManager.createExecution,
    getHumanReviewStateForInspection: HumanReviewRuntimeManager.getHumanReviewStateForInspection,
    recordHumanReviewForCurrentExecution: HumanReviewRuntimeManager.recordHumanReviewForCurrentExecution
};

let groups = 0;
const group = (name, callback) => {
    callback();
    groups += 1;
    console.log(`PASS: ${name}`);
};

const createRecord = (id, sequence, extra = {}) => deepFreeze({
    id,
    inspectionId: "inspection-audit",
    sequence,
    executedAt: `2026-07-22T${String(sequence).padStart(2, "0")}:00:00.000Z`,
    executionSchemaVersion: "expert-intelligence-execution-1.0",
    sourceFingerprint: `fingerprint-${sequence}`,
    engineStatus: "succeeded",
    routedDomains: ["structural-systems", "moisture"],
    selectedDomain: "structural-systems",
    selectedProvider: "StructuralSystemsKnowledgeProvider",
    reasoningResult: {
        primaryHypothesis: {
            id: `hypothesis-${sequence}`,
            label: "Movement-related condition",
            status: "hypothesis"
        },
        alternativeHypotheses: [{
            id: `alternative-${sequence}`,
            cause: "Material-aging condition",
            status: "hypothesis"
        }],
        supportingEvidence: ["Observed diagonal cracking", "Measured crack width"],
        missingEvidence: ["Movement monitoring", "Specialist verification"],
        confidence: 0.75
    },
    internalModelResult: {
        conflicts: [{
            conflictReference: `conflict-${sequence}`,
            conflictType: "EVIDENCE_CONTRADICTION"
        }]
    },
    interpretationModelResult: { interpretationState: "INTERPRETED" },
    limitations: ["Visual inspection only", "Concealed construction not inspected"],
    governanceVersions: {
        riskRelevanceGovernanceVersion: "risk-relevance-governance-1.0",
        riskRelevanceSupportedSourceVersion: "risk-relevance-1.0",
        internalModelVersion: "building-risk-internal-model-1.0",
        interpretationModelVersion: "building-risk-interpretation-model-1.0"
    },
    errorState: null,
    humanReviewRequired: true,
    ...extra
});

const records = deepFreeze([
    createRecord("execution-30", 3),
    createRecord("execution-10", 1),
    createRecord("execution-20", 2)
]);

const summaryFor = (record) => deepFreeze({
    executionId: record.id,
    status: record.engineStatus,
    selectedDomain: record.selectedDomain,
    selectedProvider: record.selectedProvider,
    confidence: record.reasoningResult?.confidence ?? null,
    riskRelevanceValue: "medium",
    riskRelevanceValueState: "CANONICAL_VALUE",
    riskRelevanceVersion: "risk-relevance-1.0",
    riskRelevanceVersionState: "VERSION_SUPPORTED",
    interpretationState: record.interpretationModelResult?.interpretationState || "NOT_INTERPRETED",
    interpretationEligible: true,
    humanReviewRequired: record.humanReviewRequired !== false
});

let historyCalls = 0;
let stateCalls = 0;
let summaryCalls = 0;
let executionSideEffects = 0;
let humanReviewSideEffects = 0;

function install(recordsValue = records, stateExtra = {}) {
    ExpertIntelligenceRuntimeManager.getByInspection = () => {
        historyCalls += 1;
        return recordsValue;
    };
    ExpertIntelligenceRuntimeManager.getExecutionState = () => {
        stateCalls += 1;
        return deepFreeze({
            latest: recordsValue[1] || recordsValue[0] || null,
            stale: true,
            corruption: { detected: false, count: 0, records: [] },
            ...stateExtra
        });
    };
    ExpertIntelligenceRuntimeManager.createSummary = (record) => {
        summaryCalls += 1;
        return summaryFor(record);
    };
}

ExpertIntelligenceRuntimeManager.executeForInspection = () => { executionSideEffects += 1; };
ExpertIntelligenceRuntimeManager.createExecution = () => { executionSideEffects += 1; };
HumanReviewRuntimeManager.getHumanReviewStateForInspection = () => { humanReviewSideEffects += 1; };
HumanReviewRuntimeManager.recordHumanReviewForCurrentExecution = () => { humanReviewSideEffects += 1; };

try {
    install();

    group("no inspection performs no audit lookup", () => {
        const before = [historyCalls, stateCalls, summaryCalls];
        const panel = InspectionPage.createExpertIntelligenceExecutionHistory(null);
        assert.equal(findAll(panel, "[data-expert-intelligence-audit-details]").length, 0);
        assert.deepEqual([historyCalls, stateCalls, summaryCalls], before);
    });

    group("empty history contains no fabricated audit detail", () => {
        install([], { latest: null, stale: false });
        const panel = InspectionPage.createExpertIntelligenceExecutionHistory({ id: "inspection-audit" });
        assert.equal(findAll(panel, "[data-expert-intelligence-audit-details]").length, 0);
        assert.equal(panel.dataset.expertIntelligenceHistoryState, "EMPTY");
    });

    group("one execution uses native associated disclosure", () => {
        install(deepFreeze([records[0]]), { latest: records[0], stale: false });
        const panel = InspectionPage.createExpertIntelligenceExecutionHistory({ id: "inspection-audit" });
        const detail = panel.querySelector("[data-expert-intelligence-audit-details]");
        assert.ok(detail);
        assert.equal(detail.tagName, "details");
        assert.equal(detail.dataset.expertIntelligenceAuditDetails, records[0].id);
        assert.equal(findByTag(detail, "summary")[0].textContent, "View execution audit details");
    });

    install();
    const panel = InspectionPage.createExpertIntelligenceExecutionHistory({ id: "inspection-audit" });
    const entries = findAll(panel, "[data-expert-intelligence-execution-id]");
    const details = findAll(panel, "[data-expert-intelligence-audit-details]");

    group("multiple executions preserve order and association", () => {
        assert.deepEqual(entries.map((entry) => entry.dataset.expertIntelligenceExecutionId), [
            "execution-30", "execution-10", "execution-20"
        ]);
        assert.deepEqual(details.map((detail) => detail.dataset.expertIntelligenceAuditDetails), [
            "execution-30", "execution-10", "execution-20"
        ]);
    });

    group("canonical current and stale state remain outside disclosure state", () => {
        assert.deepEqual(entries.map((entry) => entry.dataset.expertIntelligenceCurrent), ["false", "true", "false"]);
        assert.equal(findAll(entries[0], "[data-expert-intelligence-history-stale]").length, 0);
        assert.equal(findAll(entries[1], "[data-expert-intelligence-history-stale]").length, 1);
        assert.equal(findAll(entries[2], "[data-expert-intelligence-history-stale]").length, 0);
        assert.equal(Object.hasOwn(details[1], "open"), false);
    });

    group("routing and provider facts render factually", () => {
        const detail = details[0];
        assert.match(textOf(sectionByHeading(detail, "Routing facts")), /structural-systems.*moisture/);
        assert.match(textOf(sectionByHeading(detail, "Provider facts")), /Selected domain structural-systems/);
        assert.match(textOf(sectionByHeading(detail, "Provider facts")), /StructuralSystemsKnowledgeProvider/);
    });

    group("hypotheses preserve labels and explicit status", () => {
        const text = textOf(sectionByHeading(details[0], "Preserved hypotheses"));
        assert.match(text, /Movement-related condition — Status: hypothesis/);
        assert.match(text, /Material-aging condition — Status: hypothesis/);
        assert.doesNotMatch(text, /confirmed|diagnosis/i);
    });

    group("supporting and missing evidence remain separate", () => {
        assert.match(textOf(sectionByHeading(details[0], "Supporting evidence")), /Observed diagonal cracking/);
        assert.match(textOf(sectionByHeading(details[0], "Missing evidence")), /Movement monitoring/);
        assert.doesNotMatch(textOf(sectionByHeading(details[0], "Supporting evidence")), /Movement monitoring/);
    });

    group("confidence is stored and not recalculated", () => {
        assert.match(textOf(sectionByHeading(details[0], "Stored confidence")), /0.75/);
        assert.equal(records[0].reasoningResult.confidence, 0.75);
    });

    group("Risk Relevance and interpretation states remain neutral", () => {
        const relevance = textOf(sectionByHeading(details[0], "Risk Relevance state"));
        const interpretation = textOf(sectionByHeading(details[0], "Interpretation state"));
        assert.match(relevance, /medium/);
        assert.match(relevance, /CANONICAL_VALUE/);
        assert.match(relevance, /risk-relevance-1.0/);
        assert.match(relevance, /VERSION_SUPPORTED/);
        assert.match(interpretation, /INTERPRETED/);
        assert.doesNotMatch(`${relevance} ${interpretation}`, /score|approved|report ready/i);
    });

    group("conflicts and limitations remain distinct", () => {
        assert.match(textOf(sectionByHeading(details[0], "Preserved model conflicts")), /EVIDENCE_CONTRADICTION.*conflict-3/);
        assert.match(textOf(sectionByHeading(details[0], "Preserved limitations")), /Visual inspection only/);
        assert.doesNotMatch(textOf(sectionByHeading(details[0], "Preserved limitations")), /conflict-3/);
    });

    group("governance versions render only verified fields", () => {
        const governance = textOf(sectionByHeading(details[0], "Governance versions"));
        assert.match(governance, /risk-relevance-governance-1.0/);
        assert.match(governance, /building-risk-internal-model-1.0/);
        assert.match(governance, /building-risk-interpretation-model-1.0/);
    });

    group("execution error is disclosed without raw exception material", () => {
        const record = createRecord("execution-error", 4, {
            engineStatus: "failed",
            errorState: { name: "SecretError", message: "secret /Users/private/path stack" }
        });
        install(deepFreeze([record]), { latest: record, stale: false });
        const result = InspectionPage.createExpertIntelligenceExecutionHistory({ id: "inspection-audit" });
        const detail = result.querySelector("[data-expert-intelligence-audit-details]");
        assert.match(textOf(sectionByHeading(detail, "Execution error information")), /was preserved/);
        assert.doesNotMatch(textOf(detail), /SecretError|secret|Users|stack/);
    });

    group("malformed collection items are omitted independently", () => {
        const malformed = createRecord("execution-malformed", 5, {
            reasoningResult: {
                primaryHypothesis: { label: "Valid hypothesis", status: "hypothesis" },
                alternativeHypotheses: [null, { label: "Second valid hypothesis", status: "hypothesis" }],
                supportingEvidence: ["Valid evidence", { unsafe: true }, "Later evidence"],
                missingEvidence: [null, "Valid missing evidence"],
                confidence: 0.5
            },
            internalModelResult: {
                conflicts: [null, { conflictType: "VALID_CONFLICT", conflictReference: "valid-reference" }]
            },
            limitations: ["Valid limitation", { unsafe: true }],
            governanceVersions: {
                riskRelevanceGovernanceVersion: { unsafe: true },
                internalModelVersion: "valid-model"
            }
        });
        install(deepFreeze([malformed]), { latest: malformed, stale: false });
        const result = InspectionPage.createExpertIntelligenceExecutionHistory({ id: "inspection-audit" });
        const detail = result.querySelector("[data-expert-intelligence-audit-details]");
        const text = textOf(detail);
        assert.match(text, /Valid hypothesis/);
        assert.match(text, /Second valid hypothesis/);
        assert.match(text, /Valid evidence.*Later evidence/);
        assert.match(text, /Valid missing evidence/);
        assert.match(text, /VALID_CONFLICT.*valid-reference/);
        assert.match(text, /Valid limitation/);
        assert.match(text, /valid-model/);
        assert.ok(detail.querySelector("[data-expert-intelligence-audit-collection-bound]"));
        assert.match(text, /unsupported items? (?:was|were) omitted/);
        assert.doesNotMatch(text, /\[object Object\]|\{"unsafe"/);
    });

    group("missing optional sections do not render empty structures", () => {
        const minimal = createRecord("execution-minimal", 6, {
            routedDomains: [],
            selectedDomain: null,
            selectedProvider: null,
            reasoningResult: null,
            internalModelResult: null,
            interpretationModelResult: null,
            limitations: [],
            governanceVersions: null,
            errorState: null
        });
        install(deepFreeze([minimal]), { latest: minimal, stale: false });
        ExpertIntelligenceRuntimeManager.createSummary = () => deepFreeze({
            executionId: minimal.id,
            status: minimal.engineStatus,
            humanReviewRequired: true
        });
        const result = InspectionPage.createExpertIntelligenceExecutionHistory({ id: "inspection-audit" });
        assert.equal(result.querySelector("[data-expert-intelligence-audit-details]"), null);
    });

    group("collection bounds distinguish displayed supported and preserved totals", () => {
        const renderEvidence = (id, evidence) => {
            const bounded = createRecord(id, 7, {
                reasoningResult: {
                    primaryHypothesis: null,
                    alternativeHypotheses: [],
                    supportingEvidence: evidence,
                    missingEvidence: [],
                    confidence: 0.4
                }
            });
            install(deepFreeze([bounded]), { latest: bounded, stale: false });
            const result = InspectionPage.createExpertIntelligenceExecutionHistory({ id: "inspection-audit" });

            return sectionByHeading(result, "Supporting evidence");
        };
        const twenty = deepFreeze(Array.from({ length: 20 }, (_, index) => `twenty-${index + 1}`));
        const twentySection = renderEvidence("execution-twenty", twenty);
        assert.equal(findByTag(twentySection, "li").length, 20);
        assert.equal(twentySection.querySelector("[data-expert-intelligence-audit-collection-bound]"), null);

        const twentyOne = deepFreeze(Array.from({ length: 21 }, (_, index) => `twenty-one-${index + 1}`));
        const twentyOneSection = renderEvidence("execution-twenty-one", twentyOne);
        assert.equal(findByTag(twentyOneSection, "li").length, 20);
        assert.match(textOf(twentyOneSection), /Showing 20 of 21 preserved items/);

        const mixed = deepFreeze([
            ...Array.from({ length: 20 }, (_, index) => `mixed-${index + 1}`),
            { unsafe: true },
            "mixed-21"
        ]);
        const mixedSection = renderEvidence("execution-mixed-bound", mixed);
        assert.equal(findByTag(mixedSection, "li").length, 20);
        assert.equal(findByTag(mixedSection, "li")[19].textContent, "mixed-20");
        assert.match(textOf(mixedSection), /Showing 20 of 21 supported items from 22 preserved items/);
        assert.match(textOf(mixedSection), /1 unsupported item was omitted/);
        assert.doesNotMatch(textOf(mixedSection), /\[object Object\]/);

        const largeMixed = deepFreeze([
            ...Array.from({ length: 19 }, (_, index) => `large-${index + 1}`),
            { unsafe: "first" },
            "large-20",
            ...Array.from({ length: 18 }, (_, index) => `large-${index + 21}`),
            null,
            { unsafe: "second" }
        ]);
        const largeSection = renderEvidence("execution-large-bound", largeMixed);
        assert.equal(largeMixed.length, 41);
        assert.equal(findByTag(largeSection, "li").length, 20);
        assert.equal(findByTag(largeSection, "li")[0].textContent, "large-1");
        assert.equal(findByTag(largeSection, "li")[19].textContent, "large-20");
        assert.match(textOf(largeSection), /Showing 20 of 38 supported items from 41 preserved items/);
        assert.match(textOf(largeSection), /3 unsupported items were omitted/);
        assert.doesNotMatch(textOf(largeSection), /first|second|\[object Object\]/);

        const allMalformed = deepFreeze([{ unsafe: true }, null, []]);
        const malformedSection = renderEvidence("execution-all-malformed", allMalformed);
        assert.equal(findByTag(malformedSection, "li").length, 0);
        assert.match(textOf(malformedSection), /No supported items could be presented from 3 preserved items/);
        assert.match(textOf(malformedSection), /3 unsupported items were omitted/);
        assert.doesNotMatch(textOf(malformedSection), /Showing 0 of 0|\[object Object\]/);
        assert.equal(Object.isFrozen(largeMixed), true);
        assert.equal(largeMixed.length, 41);
    });

    group("audit disclosure preserves semantic heading hierarchy", () => {
        const evidence = deepFreeze(["evidence"]);
        const bounded = createRecord("execution-heading", 7, {
            reasoningResult: {
                primaryHypothesis: null,
                alternativeHypotheses: [],
                supportingEvidence: evidence,
                missingEvidence: [],
                confidence: 0.4
            }
        });
        install(deepFreeze([bounded]), { latest: bounded, stale: false });
        const result = InspectionPage.createExpertIntelligenceExecutionHistory({ id: "inspection-audit" });
        const detail = result.querySelector("[data-expert-intelligence-audit-details]");
        assert.equal(findByTag(result, "h3").filter((entry) => entry.textContent === "Expert Intelligence Execution History").length, 1);
        assert.equal(findByTag(detail, "h4").filter((entry) => entry.textContent === "Execution audit details").length, 1);
        assert.ok(findByTag(detail, "h5").length > 0);
        assert.equal(findByTag(detail, "summary")[0].textContent, "View execution audit details");
    });

    group("Human Review required remains a factual B3-A field", () => {
        const yes = createRecord("execution-review-yes", 8, { humanReviewRequired: true });
        const no = createRecord("execution-review-no", 9, { humanReviewRequired: false });
        install(deepFreeze([yes, no]), { latest: no, stale: false });
        const result = InspectionPage.createExpertIntelligenceExecutionHistory({ id: "inspection-audit" });
        const resultEntries = findAll(result, "[data-expert-intelligence-execution-id]");
        assert.match(textOf(resultEntries[0]), /Human review required Yes/);
        assert.match(textOf(resultEntries[1]), /Human review required No/);
        assert.doesNotMatch(textOf(result), /review completed|review approved/i);
    });

    group("repository summary and audit diagnostics remain separate", () => {
        const unsafe = createRecord("execution-detail-omission", 10, {
            reasoningResult: { primaryHypothesis: { unsafe: true }, supportingEvidence: [], missingEvidence: [] }
        });
        install(deepFreeze([unsafe]), {
            latest: unsafe,
            stale: false,
            corruption: {
                detected: true,
                count: 1,
                records: [{ reason: "Unscoped repository integrity diagnostic" }]
            }
        });
        const result = InspectionPage.createExpertIntelligenceExecutionHistory({ id: "inspection-audit" });
        const detail = result.querySelector("[data-expert-intelligence-audit-details]");
        assert.ok(detail.querySelector("[data-expert-intelligence-audit-collection-bound]"));
        assert.match(textOf(detail), /unsupported item was omitted/);
        assert.ok(result.querySelector("[data-expert-intelligence-history-diagnostics]"));
        assert.match(textOf(result), /intentionally unscoped/);
        assert.doesNotMatch(textOf(detail), /repository|corrupt/i);
    });

    group("B3-A summary-unavailable remains separate from audit detail", () => {
        install(deepFreeze([records[0]]), { latest: records[0], stale: true });
        ExpertIntelligenceRuntimeManager.createSummary = () => { throw new Error("private summary failure"); };
        const result = InspectionPage.createExpertIntelligenceExecutionHistory({ id: "inspection-audit" });
        const entry = result.querySelector("[data-expert-intelligence-execution-id]");
        assert.ok(entry.querySelector("[data-expert-intelligence-history-entry-unavailable]"));
        assert.equal(entry.querySelector("[data-expert-intelligence-audit-details]"), null);
        assert.ok(entry.querySelector("[data-expert-intelligence-history-stale]"));
        assert.doesNotMatch(textOf(entry), /private summary failure/);
    });

    group("audit details contain no forbidden authority or control semantics", () => {
        install();
        const result = InspectionPage.createExpertIntelligenceExecutionHistory({ id: "inspection-audit" });
        const auditText = findAll(result, "[data-expert-intelligence-audit-details]").map(textOf).join(" ");
        assert.doesNotMatch(auditText, /approved|approval|authorized|certified|verified|final conclusion|report ready|export permitted|risk accepted|superseded|obsolete/i);
        assert.doesNotMatch(auditText, /rerun|restore|select execution|compare|delete|update/i);
        assert.doesNotMatch(auditText, /\[object Object\]|\{"/);
    });

    group("rendering is immutable and side-effect free", () => {
        install();
        const before = JSON.stringify(records);
        InspectionPage.createExpertIntelligenceExecutionHistory({ id: "inspection-audit" });
        assert.equal(JSON.stringify(records), before);
        assert.equal(Object.isFrozen(records), true);
        assert.equal(Object.isFrozen(records[0].reasoningResult.supportingEvidence), true);
        assert.equal(executionSideEffects, 0);
        assert.equal(humanReviewSideEffects, 0);
        const source = InspectionPage.createExpertIntelligenceExecutionAuditDetails.toString();
        assert.doesNotMatch(source, /StorageManager|Report|Export|Workflow|Authorization|Identity/);
    });

    group("B3-A and B2 placement remains unchanged", () => {
        const renderSource = InspectionPage.render.toString();
        assert.ok(renderSource.indexOf("createExpertIntelligenceRuntimePanel") < renderSource.indexOf("createExpertIntelligenceExecutionHistory"));
        assert.ok(renderSource.indexOf("createExpertIntelligenceExecutionHistory") < renderSource.indexOf("createHumanReviewRuntimePanel"));
        assert.equal(findByTag(panel, "h3").filter((entry) => entry.textContent === "Expert Intelligence Execution History").length, 1);
    });

    assert.equal(groups, 23);
    console.log(`Inspection Page Expert Intelligence execution detail test completed: ${groups} groups passed.`);
} finally {
    Object.assign(ExpertIntelligenceRuntimeManager, {
        getByInspection: originals.getByInspection,
        getExecutionState: originals.getExecutionState,
        createSummary: originals.createSummary,
        executeForInspection: originals.executeForInspection,
        createExecution: originals.createExecution
    });
    Object.assign(HumanReviewRuntimeManager, {
        getHumanReviewStateForInspection: originals.getHumanReviewStateForInspection,
        recordHumanReviewForCurrentExecution: originals.recordHumanReviewForCurrentExecution
    });
}
