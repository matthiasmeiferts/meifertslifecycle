import assert from "node:assert/strict";

class MemoryStorage {
    constructor() { this.values = new Map(); }
    getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
    setItem(key, value) { this.values.set(key, String(value)); }
    removeItem(key) { this.values.delete(key); }
}

class TestElement {
    constructor(tagName) {
        this.tagName = tagName;
        this.children = [];
        this.dataset = {};
        this.className = "";
        this.textContent = "";
        this.disabled = false;
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

function textOf(root) {
    return [root.textContent, ...(root.children || []).map(textOf)].join(" ");
}

function findAllByTag(root, tagName) {
    const matches = [];
    const expected = String(tagName).toLowerCase();
    const visit = (node) => {
        if (String(node.tagName).toLowerCase() === expected) matches.push(node);
        (node.children || []).forEach(visit);
    };
    visit(root);
    return matches;
}

globalThis.localStorage = new MemoryStorage();
globalThis.document = {
    createElement(tagName) { return new TestElement(tagName); },
    createDocumentFragment() { return new TestElement("fragment"); }
};

const { default: InspectionPage } = await import("../portal/ui/pages/InspectionPage.js");
const { default: ExpertIntelligenceRuntimeManager } = await import("../portal/core/ExpertIntelligenceRuntimeManager.js");

const originals = {
    getByInspection: ExpertIntelligenceRuntimeManager.getByInspection,
    getExecutionState: ExpertIntelligenceRuntimeManager.getExecutionState,
    createSummary: ExpertIntelligenceRuntimeManager.createSummary
};

let groups = 0;
const group = (name, callback) => {
    callback();
    groups += 1;
    console.log(`PASS: ${name}`);
};

const execution = (id, sequence, executedAt, extra = {}) => Object.freeze({
    id,
    inspectionId: "inspection-history",
    sequence,
    executedAt,
    sourceFingerprint: `fingerprint-${sequence}`,
    executionSchemaVersion: `revision-${sequence}`,
    engineStatus: "succeeded",
    selectedDomain: "structural-systems",
    selectedProvider: "StructuralSystemsKnowledgeProvider",
    humanReviewRequired: true,
    ...extra
});

const supplied = Object.freeze([
    execution("execution-30", 30, "2026-07-22T13:00:00.000Z"),
    execution("execution-10", 10, "2026-07-22T15:00:00.000Z"),
    execution("execution-20", 20, "2026-07-22T11:00:00.000Z")
]);

let historyCalls = 0;
let stateCalls = 0;
let summaryCalls = 0;
ExpertIntelligenceRuntimeManager.getByInspection = (inspectionId) => {
    historyCalls += 1;
    assert.equal(inspectionId, "inspection-history");
    return supplied;
};
ExpertIntelligenceRuntimeManager.getExecutionState = (inspectionId) => {
    stateCalls += 1;
    assert.equal(inspectionId, "inspection-history");
    return Object.freeze({
        latest: supplied[1],
        stale: true,
        corruption: Object.freeze({ detected: false, count: 0, records: Object.freeze([]) })
    });
};
ExpertIntelligenceRuntimeManager.createSummary = (record) => {
    summaryCalls += 1;
    return Object.freeze({
        executionId: record.id,
        status: record.engineStatus,
        selectedDomain: record.selectedDomain,
        selectedProvider: record.selectedProvider,
        humanReviewRequired: record.humanReviewRequired
    });
};

try {
    group("no inspection performs no runtime lookup", () => {
        const before = [historyCalls, stateCalls, summaryCalls];
        const panel = InspectionPage.createExpertIntelligenceExecutionHistory(null);
        assert.equal(panel.dataset.expertIntelligenceHistoryState, "NO_INSPECTION");
        assert.deepEqual([historyCalls, stateCalls, summaryCalls], before);
        assert.match(textOf(panel), /Select an inspection/);
    });

    const panel = InspectionPage.createExpertIntelligenceExecutionHistory({ id: "inspection-history" });
    const items = findAll(panel, "[data-expert-intelligence-execution-id]");

    group("released read APIs are the only history inputs", () => {
        assert.equal(historyCalls, 1);
        assert.equal(stateCalls, 1);
        assert.equal(summaryCalls, 3);
    });

    group("all valid persisted executions are rendered", () => {
        assert.equal(items.length, 3);
        assert.equal(panel.dataset.expertIntelligenceHistoryState, "AVAILABLE");
    });

    group("supplied history order is preserved", () => {
        assert.deepEqual(items.map((item) => item.dataset.expertIntelligenceExecutionId), [
            "execution-30", "execution-10", "execution-20"
        ]);
    });

    group("current execution is identified only by canonical ID", () => {
        assert.deepEqual(items.map((item) => item.dataset.expertIntelligenceCurrent), ["false", "true", "false"]);
        assert.match(textOf(items[1]), /Current execution/);
    });

    group("timestamps and sequence do not select current", () => {
        assert.equal(items[1].dataset.expertIntelligenceCurrent, "true");
        assert.equal(items[0].dataset.expertIntelligenceCurrent, "false");
    });

    group("stale state is scoped to canonical current execution", () => {
        assert.equal(findAll(items[0], "[data-expert-intelligence-history-stale]").length, 0);
        assert.equal(findAll(items[1], "[data-expert-intelligence-history-stale]").length, 1);
        assert.equal(findAll(items[2], "[data-expert-intelligence-history-stale]").length, 0);
    });

    group("identity, sequence, timestamp, revision and fingerprint are visible", () => {
        const text = textOf(items[0]);
        assert.match(text, /execution-30/);
        assert.match(text, /30/);
        assert.match(text, /2026-07-22T13:00:00.000Z/);
        assert.match(text, /revision-30/);
        assert.match(text, /fingerprint-30/);
    });

    group("neutral summary fields are visible", () => {
        const text = textOf(items[0]);
        assert.match(text, /succeeded/);
        assert.match(text, /structural-systems/);
        assert.match(text, /StructuralSystemsKnowledgeProvider/);
        assert.match(text, /Human review required Yes/);
    });

    group("history copy avoids approval, ranking and rerun semantics", () => {
        const text = textOf(panel);
        assert.match(text, /does not approve, rank, rerun, or reinterpret/);
        assert.doesNotMatch(text, /approved execution|best execution|preferred execution/i);
    });

    group("empty history is distinct and neutral", () => {
        ExpertIntelligenceRuntimeManager.getByInspection = () => [];
        ExpertIntelligenceRuntimeManager.getExecutionState = () => ({
            latest: null, stale: false, corruption: { detected: false, count: 0, records: [] }
        });
        const empty = InspectionPage.createExpertIntelligenceExecutionHistory({ id: "inspection-history" });
        assert.equal(empty.dataset.expertIntelligenceHistoryState, "EMPTY");
        assert.match(textOf(empty), /No persisted Expert Intelligence execution exists/);
    });

    group("valid history and corruption remain visibly separate", () => {
        ExpertIntelligenceRuntimeManager.getByInspection = () => supplied;
        ExpertIntelligenceRuntimeManager.getExecutionState = () => ({
            latest: supplied[1], stale: false,
            corruption: { detected: true, count: 1, records: [{ reason: "Malformed envelope" }] }
        });
        const mixed = InspectionPage.createExpertIntelligenceExecutionHistory({ id: "inspection-history" });
        assert.equal(mixed.dataset.expertIntelligenceHistoryState, "AVAILABLE_WITH_UNSCOPED_CORRUPTION");
        assert.equal(findAll(mixed, "[data-expert-intelligence-execution-id]").length, 3);
        assert.equal(mixed.querySelector("[data-expert-intelligence-history-corruption]").dataset.expertIntelligenceHistoryCorruption, "unscoped");
        assert.match(textOf(mixed), /does not claim that the persisted history is complete/);
    });

    group("corrupt-only state exposes no inferred record", () => {
        ExpertIntelligenceRuntimeManager.getByInspection = () => [];
        ExpertIntelligenceRuntimeManager.getExecutionState = () => ({
            latest: null, stale: false,
            corruption: { detected: true, count: 1, records: [{ reason: "Unreadable record" }] }
        });
        const corrupt = InspectionPage.createExpertIntelligenceExecutionHistory({ id: "inspection-history" });
        assert.equal(corrupt.dataset.expertIntelligenceHistoryState, "UNSCOPED_CORRUPTION_ONLY");
        assert.equal(findAll(corrupt, "[data-expert-intelligence-execution-id]").length, 0);
        assert.match(textOf(corrupt), /No valid persisted/);
    });

    group("diagnostics are explicitly repository-level and unscoped", () => {
        const corrupt = InspectionPage.createExpertIntelligenceExecutionHistory({ id: "inspection-history" });
        assert.match(textOf(corrupt), /repository level/);
        assert.match(textOf(corrupt), /intentionally unscoped/);
        assert.equal(corrupt.querySelector("[data-expert-intelligence-history-diagnostics]").dataset.expertIntelligenceHistoryDiagnostics, "unscoped");
    });

    group("malformed dependency result fails closed", () => {
        ExpertIntelligenceRuntimeManager.getByInspection = () => ({ records: supplied });
        ExpertIntelligenceRuntimeManager.getExecutionState = () => ({ latest: supplied[2] });
        const malformed = InspectionPage.createExpertIntelligenceExecutionHistory({ id: "inspection-history" });
        assert.equal(malformed.dataset.expertIntelligenceHistoryState, "UNAVAILABLE");
        assert.equal(findAll(malformed, "[data-expert-intelligence-execution-id]").length, 0);
        assert.match(textOf(malformed), /unsupported result/);
    });

    group("dependency failure does not reconstruct history", () => {
        ExpertIntelligenceRuntimeManager.getByInspection = () => { throw new Error("storage failure"); };
        const failed = InspectionPage.createExpertIntelligenceExecutionHistory({ id: "inspection-history" });
        assert.equal(failed.dataset.expertIntelligenceHistoryState, "UNAVAILABLE");
        assert.match(textOf(failed), /No history record was inferred or reconstructed/);
    });

    group("structured metadata is omitted without implicit object rendering", () => {
        const structured = Object.freeze({
            ...supplied[0],
            sourceFingerprint: Object.freeze({ hash: "unsupported" }),
            executionSchemaVersion: Object.freeze({ version: 1 })
        });
        ExpertIntelligenceRuntimeManager.getByInspection = () => Object.freeze([structured]);
        ExpertIntelligenceRuntimeManager.getExecutionState = () => ({
            latest: structured, stale: false, corruption: { detected: false, count: 0, records: [] }
        });
        ExpertIntelligenceRuntimeManager.createSummary = () => Object.freeze({
            executionId: structured.id,
            status: Object.freeze({ state: "succeeded" }),
            selectedDomain: Object.freeze({ id: "structural-systems" }),
            selectedProvider: Object.freeze({ id: "provider" }),
            humanReviewRequired: true
        });
        const result = InspectionPage.createExpertIntelligenceExecutionHistory({ id: "inspection-history" });
        const text = textOf(result);
        assert.doesNotMatch(text, /\[object Object\]/);
        assert.doesNotMatch(text, /unsupported|structural-systems|provider|succeeded/);
        assert.match(text, /Human review required Yes/);
    });

    group("one summary failure remains bounded to its identified entry", () => {
        const records = Object.freeze([supplied[0], supplied[1]]);
        ExpertIntelligenceRuntimeManager.getByInspection = () => records;
        ExpertIntelligenceRuntimeManager.getExecutionState = () => ({
            latest: supplied[1], stale: false, corruption: { detected: false, count: 0, records: [] }
        });
        ExpertIntelligenceRuntimeManager.createSummary = (record) => {
            if (record.id === supplied[0].id) throw new Error("summary failure");
            return Object.freeze({
                executionId: record.id,
                status: record.engineStatus,
                selectedDomain: record.selectedDomain,
                selectedProvider: record.selectedProvider,
                humanReviewRequired: false
            });
        };
        const result = InspectionPage.createExpertIntelligenceExecutionHistory({ id: "inspection-history" });
        const entries = findAll(result, "[data-expert-intelligence-execution-id]");
        assert.equal(entries.length, 2);
        assert.match(textOf(entries[0]), /Summary metadata is unavailable/);
        assert.doesNotMatch(textOf(entries[0]), /fingerprint-30|revision-30|succeeded/);
        assert.match(textOf(entries[1]), /Human review required No/);
        assert.equal(entries[1].dataset.expertIntelligenceCurrent, "true");
    });

    group("unsafe identity is omitted with a neutral presentation diagnostic", () => {
        const unsafe = Object.freeze({ ...supplied[0], id: Object.freeze({ value: "unsafe" }) });
        ExpertIntelligenceRuntimeManager.getByInspection = () => Object.freeze([unsafe, supplied[1]]);
        ExpertIntelligenceRuntimeManager.getExecutionState = () => ({
            latest: supplied[1], stale: false, corruption: { detected: false, count: 0, records: [] }
        });
        ExpertIntelligenceRuntimeManager.createSummary = (record) => Object.freeze({
            executionId: record.id,
            status: record.engineStatus,
            selectedDomain: record.selectedDomain,
            selectedProvider: record.selectedProvider,
            humanReviewRequired: record.humanReviewRequired
        });
        const result = InspectionPage.createExpertIntelligenceExecutionHistory({ id: "inspection-history" });
        assert.equal(findAll(result, "[data-expert-intelligence-execution-id]").length, 1);
        assert.ok(result.querySelector("[data-expert-intelligence-history-presentation-diagnostics]"));
        assert.match(textOf(result), /stable execution identifier was unavailable/);
        assert.doesNotMatch(textOf(result), /\[object Object\]/);
    });

    group("failed current summary preserves canonical stale state and combined diagnostics", () => {
        const corruptionRecords = Object.freeze([
            Object.freeze({ reason: "Unscoped malformed execution envelope" })
        ]);
        const state = Object.freeze({
            latest: supplied[1],
            stale: true,
            corruption: Object.freeze({ detected: true, count: 1, records: corruptionRecords })
        });
        ExpertIntelligenceRuntimeManager.getByInspection = () => supplied;
        ExpertIntelligenceRuntimeManager.getExecutionState = () => state;
        ExpertIntelligenceRuntimeManager.createSummary = (record) => {
            if (record.id === supplied[1].id) throw new Error("private summary failure");
            return Object.freeze({
                executionId: record.id,
                status: record.engineStatus,
                selectedDomain: record.selectedDomain,
                selectedProvider: record.selectedProvider,
                humanReviewRequired: record.humanReviewRequired
            });
        };

        const result = InspectionPage.createExpertIntelligenceExecutionHistory({ id: "inspection-history" });
        const entries = findAll(result, "[data-expert-intelligence-execution-id]");
        assert.deepEqual(entries.map((entry) => entry.dataset.expertIntelligenceExecutionId), [
            "execution-30", "execution-10", "execution-20"
        ]);
        assert.deepEqual(entries.map((entry) => entry.dataset.expertIntelligenceCurrent), ["false", "true", "false"]);
        assert.equal(findAll(entries[0], "[data-expert-intelligence-history-stale]").length, 0);
        assert.equal(findAll(entries[1], "[data-expert-intelligence-history-stale]").length, 1);
        assert.equal(findAll(entries[2], "[data-expert-intelligence-history-stale]").length, 0);
        assert.match(textOf(entries[0]), /fingerprint-30/);
        assert.match(textOf(entries[1]), /Summary metadata is unavailable/);
        assert.doesNotMatch(textOf(entries[1]), /private summary failure|fingerprint-10|revision-10|succeeded|StructuralSystemsKnowledgeProvider|structural-systems|Human review required/);
        assert.match(textOf(entries[2]), /fingerprint-20/);
        assert.ok(result.querySelector("[data-expert-intelligence-history-diagnostics]"));
        assert.match(textOf(result), /intentionally unscoped/);
        assert.doesNotMatch(textOf(entries[1]), /repository|corrupt/i);
        assert.doesNotMatch(textOf(result), /\[object Object\]/);
        assert.equal(Object.isFrozen(supplied), true);
        assert.equal(Object.isFrozen(state), true);
        assert.equal(Object.isFrozen(corruptionRecords), true);
    });

    group("failed historical and non-stale current summaries do not gain stale state", () => {
        ExpertIntelligenceRuntimeManager.getByInspection = () => supplied;
        ExpertIntelligenceRuntimeManager.getExecutionState = () => ({
            latest: supplied[1], stale: false, corruption: { detected: false, count: 0, records: [] }
        });
        ExpertIntelligenceRuntimeManager.createSummary = (record) => {
            if ([supplied[0].id, supplied[1].id].includes(record.id)) throw new Error("summary failure");
            return Object.freeze({
                executionId: record.id,
                status: record.engineStatus,
                selectedDomain: record.selectedDomain,
                selectedProvider: record.selectedProvider,
                humanReviewRequired: record.humanReviewRequired
            });
        };
        const result = InspectionPage.createExpertIntelligenceExecutionHistory({ id: "inspection-history" });
        const entries = findAll(result, "[data-expert-intelligence-execution-id]");
        assert.equal(entries[0].dataset.expertIntelligenceCurrent, "false");
        assert.equal(entries[1].dataset.expertIntelligenceCurrent, "true");
        assert.equal(findAll(entries[0], "[data-expert-intelligence-history-stale]").length, 0);
        assert.equal(findAll(entries[1], "[data-expert-intelligence-history-stale]").length, 0);
    });

    group("history and diagnostic regions use one consistent semantic heading each", () => {
        ExpertIntelligenceRuntimeManager.getByInspection = () => supplied;
        ExpertIntelligenceRuntimeManager.getExecutionState = () => ({
            latest: supplied[1], stale: false,
            corruption: { detected: true, count: 1, records: [{ reason: "Unscoped diagnostic" }] }
        });
        ExpertIntelligenceRuntimeManager.createSummary = (record) => Object.freeze({
            executionId: record.id,
            status: record.engineStatus,
            selectedDomain: record.selectedDomain,
            selectedProvider: record.selectedProvider,
            humanReviewRequired: record.humanReviewRequired
        });
        const result = InspectionPage.createExpertIntelligenceExecutionHistory({ id: "inspection-history" });
        const historyHeadings = findAllByTag(result, "h3")
            .filter((entry) => entry.textContent === "Expert Intelligence Execution History");
        const diagnosticHeadings = findAllByTag(result, "h4")
            .filter((entry) => entry.textContent === "Execution-history diagnostics");
        assert.equal(historyHeadings.length, 1);
        assert.equal(diagnosticHeadings.length, 1);
        assert.ok(result.querySelector("[data-expert-intelligence-history-diagnostic-region]"));
    });

    group("caller-owned released records remain unchanged", () => {
        assert.equal(Object.isFrozen(supplied), true);
        assert.deepEqual(supplied.map((record) => record.id), ["execution-30", "execution-10", "execution-20"]);
    });

    group("history is positioned between current runtime and Human Review", () => {
        const source = InspectionPage.render.toString();
        assert.ok(source.indexOf("createExpertIntelligenceRuntimePanel") < source.indexOf("createExpertIntelligenceExecutionHistory"));
        assert.ok(source.indexOf("createExpertIntelligenceExecutionHistory") < source.indexOf("createHumanReviewRuntimePanel"));
    });

    assert.equal(groups, 24);
    console.log(`Inspection Page Expert Intelligence history test completed: ${groups} groups passed.`);
} finally {
    Object.assign(ExpertIntelligenceRuntimeManager, originals);
}
