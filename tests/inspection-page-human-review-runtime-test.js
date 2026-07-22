import assert from "node:assert/strict";
import fs from "node:fs";

class MemoryStorage {
    constructor() { this.values = new Map(); }
    getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
    setItem(key, value) { this.values.set(key, String(value)); }
    removeItem(key) { this.values.delete(key); }
    clear() { this.values.clear(); }
}

class TestElement {
    constructor(tagName) {
        this.tagName = tagName;
        this.children = [];
        this.dataset = {};
        this.className = "";
        this.textContent = "";
        this.disabled = false;
        this.hidden = false;
        this.listeners = {};
        this.value = "";
        this.name = "";
        this.type = "";
    }

    appendChild(child) {
        this.children.push(child);
        if (this.tagName === "select" && this.children.length === 1) {
            this.value = child.value;
        }
        return child;
    }

    addEventListener(type, listener) { this.listeners[type] = listener; }

    querySelector(selector) {
        const dataKey = selector.match(/^\[data-([a-z-]+)\]$/)?.[1]
            ?.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

        if (dataKey && Object.hasOwn(this.dataset, dataKey)) return this;
        for (const child of this.children) {
            const found = child.querySelector?.(selector);
            if (found) return found;
        }
        return null;
    }
}

globalThis.localStorage = new MemoryStorage();
globalThis.document = {
    createElement(tagName) { return new TestElement(tagName); },
    createDocumentFragment() { return new TestElement("fragment"); },
    getElementById() { return null; }
};

const { default: HumanReviewRuntimeManager } = await import("../portal/core/HumanReviewRuntimeManager.js");
const { default: ExpertIntelligenceRuntimeManager } = await import("../portal/core/ExpertIntelligenceRuntimeManager.js");
const { default: InspectionPage } = await import("../portal/ui/pages/InspectionPage.js");

const originalGetState = HumanReviewRuntimeManager.getHumanReviewStateForInspection;
const originalRecord = HumanReviewRuntimeManager.recordHumanReviewForCurrentExecution;
const originalExecute = ExpertIntelligenceRuntimeManager.executeForInspection;
const originalRefresh = InspectionPage.refresh;

function runtimeState(overrides = {}) {
    return {
        status: "REVIEW_STATE_AVAILABLE",
        inspectionId: "inspection-ui",
        executionId: "EI-inspection-ui-0001",
        executionSummary: {
            executionId: "EI-inspection-ui-0001",
            inspectionId: "inspection-ui",
            status: "succeeded"
        },
        executionStale: false,
        humanReviewRequired: true,
        reviewResolution: {
            status: "NOT_REVIEWED",
            executionId: "EI-inspection-ui-0001",
            reviewed: false,
            effectiveReview: null,
            effectiveDecision: null,
            reviewCount: 0,
            records: [],
            diagnostics: []
        },
        appendedReview: null,
        errorMessage: null,
        ...overrides
    };
}

function all(root, predicate, entries = []) {
    if (predicate(root)) entries.push(root);
    root.children.forEach(child => all(child, predicate, entries));
    return entries;
}

function text(root) {
    return [root.textContent, ...root.children.map(text)].join(" ");
}

function reset() {
    HumanReviewRuntimeManager.getHumanReviewStateForInspection = originalGetState;
    HumanReviewRuntimeManager.recordHumanReviewForCurrentExecution = originalRecord;
    ExpertIntelligenceRuntimeManager.executeForInspection = originalExecute;
    InspectionPage.refresh = originalRefresh;
}

function runTest(name, fn) {
    try {
        fn();
        console.log(`✓ ${name}`);
    } catch (error) {
        console.error(`✗ ${name}`);
        throw error;
    } finally {
        reset();
    }
}

async function runAsyncTest(name, fn) {
    try {
        await fn();
        console.log(`✓ ${name}`);
    } catch (error) {
        console.error(`✗ ${name}`);
        throw error;
    } finally {
        reset();
    }
}

runTest("places the Human Review section adjacent to the Expert Intelligence runtime", () => {
    const source = fs.readFileSync(new URL("../portal/ui/pages/InspectionPage.js", import.meta.url), "utf8");
    const expert = source.indexOf("fragment.appendChild(this.createExpertIntelligenceRuntimePanel(activeInspection))");
    const review = source.indexOf("fragment.appendChild(this.createHumanReviewRuntimePanel(activeInspection))");
    assert.ok(expert >= 0);
    assert.ok(review > expert);
    assert.equal(source.slice(expert, review).includes("createMetrics"), false);
});

runTest("renders no-inspection and no-execution states conservatively without a form", () => {
    const noInspection = InspectionPage.createHumanReviewRuntimePanel(null);
    assert.match(text(noInspection), /Select an inspection/);
    assert.equal(noInspection.querySelector("[data-human-review-form]"), null);

    HumanReviewRuntimeManager.getHumanReviewStateForInspection = () => runtimeState({
        status: "NO_CURRENT_EXECUTION",
        executionId: null,
        executionSummary: null,
        humanReviewRequired: false,
        reviewResolution: null
    });
    const noExecution = InspectionPage.createHumanReviewRuntimePanel({ id: "inspection-ui" });
    assert.match(text(noExecution), /No current persisted Expert Intelligence execution/);
    assert.equal(noExecution.querySelector("[data-human-review-form]"), null);
});

runTest("renders NOT_REVIEWED with an explicit entry form and neutral wording", () => {
    HumanReviewRuntimeManager.getHumanReviewStateForInspection = () => runtimeState();
    const panel = InspectionPage.createHumanReviewRuntimePanel({ id: "inspection-ui" });
    assert.ok(panel.querySelector("[data-human-review-form]"));
    assert.match(text(panel), /NOT_REVIEWED/);
    assert.match(text(panel), /Professional decision/);
    assert.doesNotMatch(text(panel), /Approved|Authorized|Signed|Verified reviewer|Export permitted|Report approved/i);
});

runTest("renders the B2-C effective decision safe count and stale-at-review state", () => {
    const current = {
        reviewId: "HR-EI-inspection-ui-0001-0002",
        decision: "REJECTED",
        rationale: "Current professional rationale.",
        staleAtReview: true
    };
    HumanReviewRuntimeManager.getHumanReviewStateForInspection = () => runtimeState({
        reviewResolution: {
            status: "REVIEWED",
            reviewed: true,
            effectiveReview: current,
            effectiveDecision: current.decision,
            reviewCount: 2,
            records: [{ reviewId: "first" }, current],
            diagnostics: []
        }
    });
    const panel = InspectionPage.createHumanReviewRuntimePanel({ id: "inspection-ui" });
    assert.match(text(panel), /REVIEWED/);
    assert.match(text(panel), /REJECTED/);
    assert.match(text(panel), /Current professional rationale/);
    assert.match(text(panel), /Safe review records 2/);
    assert.match(text(panel), /Stale when reviewed Yes/);
});

runTest("renders partial and full corruption distinctly from unreviewed state", () => {
    for (const status of ["PARTIAL_WITH_CORRUPTION", "CORRUPT_HISTORY"]) {
        HumanReviewRuntimeManager.getHumanReviewStateForInspection = () => runtimeState({
            status: status === "CORRUPT_HISTORY" ? "REVIEW_HISTORY_CORRUPT" : "REVIEW_STATE_AVAILABLE",
            reviewResolution: {
                status,
                reviewed: status === "PARTIAL_WITH_CORRUPTION",
                effectiveReview: status === "PARTIAL_WITH_CORRUPTION" ? { decision: "CONFIRMED", rationale: "Safe prefix.", staleAtReview: false } : null,
                reviewCount: status === "PARTIAL_WITH_CORRUPTION" ? 1 : 0,
                records: status === "PARTIAL_WITH_CORRUPTION" ? [{ reviewId: "safe" }] : [],
                diagnostics: [{ reason: "Excluded corrupt Human Review record." }]
            }
        });
        const panel = InspectionPage.createHumanReviewRuntimePanel({ id: "inspection-ui" });
        assert.match(text(panel), /integrity issues/);
        assert.match(text(panel), /Excluded corrupt Human Review record/);
        assert.doesNotMatch(text(panel), /merely unreviewed/i);
        assert.equal(panel.querySelector("[data-human-review-form]"), null);
    }
});

runTest("provides exactly the four released decision options and no invented decision", () => {
    HumanReviewRuntimeManager.getHumanReviewStateForInspection = () => runtimeState();
    const panel = InspectionPage.createHumanReviewRuntimePanel({ id: "inspection-ui" });
    const decision = all(panel, entry => entry.dataset.humanReviewField === "decision")[0];
    assert.deepEqual(decision.children.map(option => option.value), [
        "CONFIRMED",
        "CONFIRMED_WITH_LIMITATIONS",
        "REJECTED",
        "RERUN_REQUIRED"
    ]);
    assert.equal(new Set(decision.children.map(option => option.value)).size, 4);
});

runTest("uses descriptive reviewer fields and B2-A decision-specific inputs", () => {
    HumanReviewRuntimeManager.getHumanReviewStateForInspection = () => runtimeState();
    const panel = InspectionPage.createHumanReviewRuntimePanel({ id: "inspection-ui" });
    const fields = all(panel, entry => Boolean(entry.dataset.humanReviewField))
        .map(entry => entry.dataset.humanReviewField);
    [
        "reviewerId",
        "reviewerDisplayName",
        "reviewerRole",
        "decision",
        "rationale",
        "limitations",
        "followUpRequirements",
        "rerunRecommendation"
    ].forEach(field => assert.ok(fields.includes(field)));
    assert.doesNotMatch(text(panel), /verified reviewer|authenticated|signature/i);
});

runTest("page load and decision selection do not append", () => {
    let appends = 0;
    HumanReviewRuntimeManager.getHumanReviewStateForInspection = () => runtimeState();
    HumanReviewRuntimeManager.recordHumanReviewForCurrentExecution = () => { appends += 1; };
    const panel = InspectionPage.createHumanReviewRuntimePanel({ id: "inspection-ui" });
    const decision = all(panel, entry => entry.dataset.humanReviewField === "decision")[0];
    decision.value = "RERUN_REQUIRED";
    assert.equal(appends, 0);
});

await runAsyncTest("submits only through the runtime manager and refreshes after success", async () => {
    let submitted = null;
    let refreshes = 0;
    HumanReviewRuntimeManager.getHumanReviewStateForInspection = () => runtimeState();
    HumanReviewRuntimeManager.recordHumanReviewForCurrentExecution = (inspectionId, data) => {
        submitted = { inspectionId, data };
        return runtimeState({ status: "REVIEW_RECORDED", appendedReview: { reviewId: "review-1" } });
    };
    InspectionPage.refresh = () => { refreshes += 1; };
    const panel = InspectionPage.createHumanReviewRuntimePanel({ id: "inspection-ui" });
    const form = panel.querySelector("[data-human-review-form]");
    all(form, entry => Boolean(entry.dataset.humanReviewField)).forEach(control => {
        if (control.dataset.humanReviewField === "reviewerId") control.value = "reviewer-ui";
        if (control.dataset.humanReviewField === "reviewerDisplayName") control.value = "UI Reviewer";
        if (control.dataset.humanReviewField === "rationale") control.value = "Explicit professional rationale.";
    });
    await form.listeners.submit({ preventDefault() {} });
    assert.equal(submitted.inspectionId, "inspection-ui");
    assert.equal(submitted.data.executionId, "EI-inspection-ui-0001");
    assert.equal(submitted.data.reviewerId, "reviewer-ui");
    assert.equal(refreshes, 1);
});

await runAsyncTest("blocks duplicate pending submission and RERUN_REQUIRED does not execute B1", async () => {
    let appends = 0;
    let executions = 0;
    HumanReviewRuntimeManager.getHumanReviewStateForInspection = () => runtimeState();
    HumanReviewRuntimeManager.recordHumanReviewForCurrentExecution = () => {
        appends += 1;
        return runtimeState({ status: "REVIEW_APPEND_REJECTED", errorMessage: "Append rejected." });
    };
    ExpertIntelligenceRuntimeManager.executeForInspection = () => { executions += 1; };
    const panel = InspectionPage.createHumanReviewRuntimePanel({ id: "inspection-ui" });
    const form = panel.querySelector("[data-human-review-form]");
    const decision = all(form, entry => entry.dataset.humanReviewField === "decision")[0];
    decision.value = "RERUN_REQUIRED";
    const first = form.listeners.submit({ preventDefault() {} });
    const second = form.listeners.submit({ preventDefault() {} });
    await Promise.all([first, second]);
    assert.equal(appends, 1);
    assert.equal(executions, 0);
    assert.match(form.querySelector("[data-human-review-error]").textContent, /Append rejected/);
});

await runAsyncTest("shows execution-changed and validation failures while preserving controls", async () => {
    HumanReviewRuntimeManager.getHumanReviewStateForInspection = () => runtimeState();
    HumanReviewRuntimeManager.recordHumanReviewForCurrentExecution = () => runtimeState({
        status: "EXECUTION_CHANGED",
        errorMessage: "The current Expert Intelligence execution changed."
    });
    const panel = InspectionPage.createHumanReviewRuntimePanel({ id: "inspection-ui" });
    const form = panel.querySelector("[data-human-review-form]");
    const rationale = all(form, entry => entry.dataset.humanReviewField === "rationale")[0];
    rationale.value = "Preserve this input.";
    await form.listeners.submit({ preventDefault() {} });
    assert.match(form.querySelector("[data-human-review-error]").textContent, /execution changed/i);
    assert.equal(rationale.value, "Preserve this input.");

    HumanReviewRuntimeManager.recordHumanReviewForCurrentExecution = () => { throw new Error("Rationale is required."); };
    await form.listeners.submit({ preventDefault() {} });
    assert.match(form.querySelector("[data-human-review-error]").textContent, /Rationale is required/);
});

runTest("UI depends only on the Human Review runtime manager and owns no sequence logic", () => {
    const source = fs.readFileSync(new URL("../portal/ui/pages/InspectionPage.js", import.meta.url), "utf8");
    assert.doesNotMatch(source, /HumanReviewDomainModel|HumanReviewPersistenceManager|HumanReviewResolutionManager/);
    assert.doesNotMatch(source, /createReviewId|createNextReviewSequence|\.sort\s*\(|sequence\s*[+\-]|previousReviewId\s*[:=]/);
    assert.doesNotMatch(source, /ReviewResolutionManager|ReviewQueueManager/);
});

runTest("Human Review UI introduces no report export or authority action", () => {
    const source = fs.readFileSync(new URL("../portal/ui/pages/InspectionPage.js", import.meta.url), "utf8");
    const start = source.indexOf("static createHumanReviewRuntimePanel");
    const end = source.indexOf("static formatExpertIntelligenceStatus", start);
    const humanReviewSource = source.slice(start, end);
    assert.doesNotMatch(humanReviewSource, /ReportManager|Export|Authorization|permissions|workflowStatus|ReviewQueueManager/);
    assert.doesNotMatch(humanReviewSource, /Approved|Authorized|Released|Signed|Verified reviewer|Report approved/i);
});

console.log("Inspection Page Human Review runtime integration tests completed successfully.");
