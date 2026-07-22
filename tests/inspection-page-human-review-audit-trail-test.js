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
        if (this.tagName === "select" && this.children.length === 1) this.value = child.value;
        return child;
    }

    addEventListener(type, listener) { this.listeners[type] = listener; }

    querySelector(selector) {
        const key = selector.match(/^\[data-([a-z-]+)\]$/)?.[1]
            ?.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
        if (key && Object.hasOwn(this.dataset, key)) return this;
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

function review(overrides = {}) {
    return {
        reviewId: "HR-EI-inspection-ui-0001-0001",
        sequence: 1,
        previousReviewId: null,
        decision: "CONFIRMED",
        rationale: "Professional rationale one.",
        reviewerDisplayName: "Reviewer One",
        reviewerRole: "PROFESSIONAL_REVIEWER",
        reviewedAt: "2026-07-21T22:00:00.000Z",
        staleAtReview: false,
        notes: "",
        limitations: [],
        followUpRequirements: [],
        references: [],
        rerunRecommendation: null,
        ...overrides
    };
}

function runtimeState(overrides = {}) {
    return {
        status: "REVIEW_STATE_AVAILABLE",
        inspectionId: "inspection-ui",
        executionId: "EI-inspection-ui-0001",
        executionSummary: { executionId: "EI-inspection-ui-0001", status: "succeeded" },
        executionStale: false,
        humanReviewRequired: true,
        reviewResolution: {
            status: "NOT_REVIEWED",
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

function auditRecords(root) {
    return all(root, element => Object.hasOwn(element.dataset, "humanReviewAuditRecord"));
}

function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.values(value).forEach(deepFreeze);
    return Object.freeze(value);
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

runTest("adds a bounded audit trail through the released B2-D read API", () => {
    let reads = 0;
    HumanReviewRuntimeManager.getHumanReviewStateForInspection = () => {
        reads += 1;
        return runtimeState();
    };
    const panel = InspectionPage.createHumanReviewRuntimePanel({ id: "inspection-ui" });
    assert.ok(panel.querySelector("[data-human-review-audit-trail]"));
    assert.equal(reads, 1);
    assert.deepEqual(
        Object.getOwnPropertyNames(HumanReviewRuntimeManager)
            .filter(name => typeof HumanReviewRuntimeManager[name] === "function"),
        ["getHumanReviewStateForInspection", "recordHumanReviewForCurrentExecution"]
    );
});

runTest("renders NOT_REVIEWED as an explicit neutral empty history", () => {
    const trail = InspectionPage.createHumanReviewAuditTrail(runtimeState().reviewResolution);
    assert.match(text(trail), /No Human Review records have been recorded/);
    assert.equal(auditRecords(trail).length, 0);
    assert.doesNotMatch(text(trail), /pending approval|missing authorization|workflow incomplete/i);
});

runTest("renders one reviewed record with released audit metadata", () => {
    const first = review();
    const trail = InspectionPage.createHumanReviewAuditTrail({
        status: "REVIEWED", records: [first], reviewCount: 1, effectiveReview: first, diagnostics: []
    });
    assert.equal(auditRecords(trail).length, 1);
    ["Sequence", "1", "Confirmed (CONFIRMED)", "Professional rationale one.", "Reviewer One",
        "PROFESSIONAL_REVIEWER", "2026-07-21T22:00:00.000Z"].forEach(value => assert.match(text(trail), new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))));
});

runTest("preserves supplied chain order instead of timestamp order", () => {
    const first = review({ reviewedAt: "2026-07-21T23:00:00.000Z" });
    const second = review({
        reviewId: "HR-EI-inspection-ui-0001-0002",
        sequence: 2,
        previousReviewId: first.reviewId,
        reviewerDisplayName: "Reviewer Two",
        reviewedAt: "2026-07-21T20:00:00.000Z"
    });
    const trail = InspectionPage.createHumanReviewAuditTrail({
        status: "REVIEWED", records: [first, second], reviewCount: 2, effectiveReview: second, diagnostics: []
    });
    const entries = auditRecords(trail);
    assert.deepEqual(entries.map(entry => entry.dataset.humanReviewAuditRecord), [first.reviewId, second.reviewId]);
    assert.ok(text(trail).indexOf("Reviewer One") < text(trail).indexOf("Reviewer Two"));
    assert.match(text(entries[1]), new RegExp(first.reviewId));
});

runTest("marks only the canonical B2-C effective review by stable identifier", () => {
    const first = review();
    const second = review({ reviewId: "HR-EI-inspection-ui-0001-0002", sequence: 2, previousReviewId: first.reviewId });
    const detachedEffective = { ...second };
    const trail = InspectionPage.createHumanReviewAuditTrail({
        status: "REVIEWED", records: [first, second], reviewCount: 2, effectiveReview: detachedEffective, diagnostics: []
    });
    const entries = auditRecords(trail);
    assert.equal(Object.hasOwn(entries[0].dataset, "humanReviewEffective"), false);
    assert.equal(Object.hasOwn(entries[1].dataset, "humanReviewEffective"), true);
    assert.match(text(entries[1]), /Current effective review/);
    assert.doesNotMatch(text(entries[1]), /Final review|Approved review|Authoritative review/i);
});

runTest("renders all four decisions neutrally and keeps stored values inspectable", () => {
    const labels = {
        CONFIRMED: "Confirmed",
        CONFIRMED_WITH_LIMITATIONS: "Confirmed with limitations",
        REJECTED: "Rejected",
        RERUN_REQUIRED: "Rerun required"
    };
    Object.entries(labels).forEach(([decision, label]) => {
        const item = review({ decision });
        const trail = InspectionPage.createHumanReviewAuditTrail({
            status: "REVIEWED", records: [item], effectiveReview: item, diagnostics: []
        });
        assert.match(text(trail), new RegExp(label, "i"));
        assert.match(text(trail), new RegExp(decision));
    });
});

runTest("renders optional record fields only when meaningful", () => {
    const item = review({
        notes: "Review note.",
        limitations: ["Access limitation."],
        followUpRequirements: ["Inspect concealed area."],
        references: [{ type: "evidence", id: "evidence-1" }],
        rerunRecommendation: "Rerun after evidence update."
    });
    const trail = InspectionPage.createHumanReviewAuditTrail({ status: "REVIEWED", records: [item], effectiveReview: item });
    ["Review note.", "Access limitation.", "Inspect concealed area.", "evidence-1", "Rerun after evidence update."].forEach(value => assert.match(text(trail), new RegExp(value)));
    assert.doesNotMatch(text(trail), /\[object Object\]/);

    const empty = InspectionPage.createHumanReviewAuditTrail({ status: "REVIEWED", records: [review()], effectiveReview: review() });
    assert.doesNotMatch(text(empty), /Notes|Limitations|Follow-up requirements|References|Rerun recommendation/);
});

runTest("presents stale-at-review as a neutral record fact", () => {
    const item = review({ staleAtReview: true });
    const trail = InspectionPage.createHumanReviewAuditTrail({ status: "REVIEWED", records: [item], effectiveReview: item });
    assert.match(text(trail), /execution was marked stale when this review was recorded/);
    assert.doesNotMatch(text(trail), /Invalid review|Expired review|Obsolete review|Rejected due to staleness/i);
});

runTest("shows a partial safe prefix and separate diagnostics", () => {
    const first = review();
    const second = review({ reviewId: "HR-EI-inspection-ui-0001-0002", sequence: 2, previousReviewId: first.reviewId });
    const trail = InspectionPage.createHumanReviewAuditTrail({
        status: "PARTIAL_WITH_CORRUPTION",
        records: [first, second],
        effectiveReview: second,
        diagnostics: [{ recordId: "unsafe-3", reason: "Sequence gap in later persisted record." }]
    });
    assert.equal(auditRecords(trail).length, 2);
    assert.match(text(trail), /Only the integrity-safe portion/);
    assert.match(text(trail), /Additional persisted review data could not be validated/);
    assert.match(text(trail), /Integrity diagnostics/);
    assert.match(text(trail), /Sequence gap in later persisted record/);
    assert.equal(text(auditRecords(trail)[0]).includes("unsafe-3"), false);
});

runTest("shows corrupt history without ordinary review entries", () => {
    const trail = InspectionPage.createHumanReviewAuditTrail({
        status: "CORRUPT_HISTORY",
        records: [review({ reviewId: "unsafe-record" })],
        effectiveReview: null,
        diagnostics: [{ reason: "No safe chain member." }]
    });
    assert.equal(auditRecords(trail).length, 0);
    assert.match(text(trail), /No integrity-safe Human Review history can be presented/);
    assert.match(text(trail), /No safe chain member/);
    assert.doesNotMatch(text(trail), /No Human Review records have been recorded/);
    assert.doesNotMatch(text(trail), /unsafe-record/);
});

runTest("renders deeply frozen results without mutation or reordering", () => {
    const first = review({ limitations: ["Frozen limitation."] });
    const second = review({ reviewId: "second", sequence: 2, previousReviewId: first.reviewId, references: [{ id: "frozen-reference" }] });
    const resolution = deepFreeze({
        status: "PARTIAL_WITH_CORRUPTION",
        records: [first, second],
        reviewCount: 2,
        effectiveReview: second,
        diagnostics: [{ reason: "Frozen diagnostic." }]
    });
    const before = JSON.stringify(resolution);
    const trail = InspectionPage.createHumanReviewAuditTrail(resolution);
    assert.equal(JSON.stringify(resolution), before);
    assert.deepEqual(resolution.records.map(item => item.reviewId), [first.reviewId, second.reviewId]);
    assert.equal(Object.isFrozen(resolution.records), true);
    assert.equal(Object.isFrozen(resolution.records[0].limitations), true);
    assert.match(text(trail), /Frozen diagnostic/);
});

runTest("rendering is read-only and RERUN_REQUIRED triggers no execution", () => {
    let writes = 0;
    let executions = 0;
    HumanReviewRuntimeManager.recordHumanReviewForCurrentExecution = () => { writes += 1; };
    ExpertIntelligenceRuntimeManager.executeForInspection = () => { executions += 1; };
    const item = review({ decision: "RERUN_REQUIRED", rerunRecommendation: "Repeat manually after evidence update." });
    InspectionPage.createHumanReviewAuditTrail({ status: "REVIEWED", records: [item], effectiveReview: item });
    assert.equal(writes, 0);
    assert.equal(executions, 0);
});

runTest("preserves no-current and unsupported runtime handling", () => {
    HumanReviewRuntimeManager.getHumanReviewStateForInspection = () => runtimeState({
        status: "NO_CURRENT_EXECUTION", executionId: null, executionSummary: null, reviewResolution: null
    });
    let panel = InspectionPage.createHumanReviewRuntimePanel({ id: "inspection-ui" });
    assert.match(text(panel), /No current persisted Expert Intelligence execution/);
    assert.equal(panel.querySelector("[data-human-review-audit-trail]"), null);

    HumanReviewRuntimeManager.getHumanReviewStateForInspection = () => runtimeState({
        status: "UNSUPPORTED_EXECUTION_STATE", reviewResolution: null, errorMessage: "Unsupported current execution."
    });
    panel = InspectionPage.createHumanReviewRuntimePanel({ id: "inspection-ui" });
    assert.match(text(panel), /Unsupported current execution/);
    assert.equal(panel.querySelector("[data-human-review-audit-trail]"), null);
});

runTest("keeps existing submission and stale token fields intact", () => {
    HumanReviewRuntimeManager.getHumanReviewStateForInspection = () => runtimeState({ executionStale: true });
    const panel = InspectionPage.createHumanReviewRuntimePanel({ id: "inspection-ui" });
    assert.ok(panel.querySelector("[data-human-review-form]"));
    assert.match(text(panel), /current execution is stale/i);
    const source = fs.readFileSync(new URL("../portal/ui/pages/InspectionPage.js", import.meta.url), "utf8");
    assert.match(source, /executionId: state\.executionId/);
    assert.match(source, /staleAtReview: state\.executionStale === true/);
});

runTest("uses no direct domain persistence resolution storage or legacy dependency", () => {
    const source = fs.readFileSync(new URL("../portal/ui/pages/InspectionPage.js", import.meta.url), "utf8");
    assert.doesNotMatch(source, /HumanReviewDomainModel|HumanReviewPersistenceManager|HumanReviewResolutionManager/);
    assert.doesNotMatch(source, /StorageManager|ReviewResolutionManager|ReviewQueueManager/);
    assert.doesNotMatch(source, /createReviewId|createNextReviewSequence|appendHumanReview/);
    assert.doesNotMatch(source, /\.sort\s*\(|sequence\s*[+\-]|previousReviewId\s*[:=]/);
});

runTest("audit trail has no report export workflow authorization or authority wording", () => {
    const source = fs.readFileSync(new URL("../portal/ui/pages/InspectionPage.js", import.meta.url), "utf8");
    const start = source.indexOf("static createHumanReviewAuditTrail");
    const end = source.indexOf("static createHumanReviewSelect", start);
    const auditSource = source.slice(start, end);
    assert.doesNotMatch(auditSource, /ReportManager|Export|WorkflowManager|Authorization|permissions/);

    const item = review({ decision: "CONFIRMED" });
    const trail = InspectionPage.createHumanReviewAuditTrail({ status: "REVIEWED", records: [item], effectiveReview: item });
    assert.doesNotMatch(text(trail), /approved|approval|authorized|authorization|certified|verified reviewer|final review|report ready|export permitted|released|workflow completed|rerun scheduled|rerun started/i);
});

console.log("Inspection Page Human Review audit trail tests completed successfully. Groups passed: 16");
