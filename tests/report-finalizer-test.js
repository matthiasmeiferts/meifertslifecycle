import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ReportAssemblyEngine from "../portal/core/ReportAssemblyEngine.js";
import ReportFinalizationGate from "../portal/core/reporting/ReportFinalizationGate.js";
import ReportFinalizer from "../portal/core/reporting/ReportFinalizer.js";

let groups = 0;

function group(name, callback) {
    callback();
    groups += 1;
    console.log(`PASS: ${name}`);
}

function assembledReport(overrides = {}) {
    return {
        ...ReportAssemblyEngine.assembleReport({
            context: {
                inspectionId: "inspection-b5-b",
                observations: ["observation-1"]
            },
            findings: [{ findingId: "finding-1", value: -0 }],
            assessments: [{ assessmentId: "assessment-1", risk: "medium" }],
            recommendations: [{ recommendationId: "recommendation-1" }],
            generatedAt: "2026-07-22T17:00:00.000Z"
        }),
        ...overrides
    };
}

function eligibleDecision(report) {
    return ReportFinalizationGate.evaluate(report);
}

group("finalizes a report only with an eligible released gate decision", () => {
    const report = assembledReport();
    const artifact = ReportFinalizer.finalize(report, eligibleDecision(report));

    assert.equal(artifact.status, "finalized");
    assert.equal(artifact.version, "finalized-report-1.0");
    assert.deepEqual(artifact.finalization, {
        gateVersion: "report-finalization-gate-1.1",
        reportDigest: eligibleDecision(report).reportDigest
    });
});

group("routes every root report value through the released digest boundary", () => {
    const validDecision = eligibleDecision(assembledReport());
    const unsupported = [
        NaN,
        Infinity,
        -Infinity,
        0n,
        1n,
        Symbol("unsupported"),
        () => null,
        undefined,
        new Date("2026-07-23T00:00:00.000Z"),
        new Map([["key", "value"]]),
        new Set(["value"])
    ];

    unsupported.forEach((report) => {
        assert.throws(
            () => ReportFinalizer.finalize(report, validDecision),
            (error) => error instanceof Error
                && error.name === "Error"
                && error.message === "REPORT_CONTENT_DIGEST_UNSUPPORTED"
        );
    });

    [null, "report", true, 7, []].forEach((supportedDigestValue) => {
        assert.throws(
            () => ReportFinalizer.finalize(supportedDigestValue, validDecision),
            /does not match the gate decision digest/i
        );
    });

    assert.throws(
        () => ReportFinalizer.finalize(),
        (error) => error instanceof Error
            && error.message === "REPORT_CONTENT_DIGEST_UNSUPPORTED"
    );
});

group("rejects a missing or invalid gate-decision type", () => {
    const report = assembledReport();

    [undefined, null, [], "decision", 7].forEach((decision) => {
        assert.throws(() => ReportFinalizer.finalize(report, decision), /invalid gate decision/i);
    });
});

group("rejects the wrong gate version and malformed closed schemas", () => {
    const report = assembledReport();
    const valid = eligibleDecision(report);
    const invalid = [
        { ...valid, version: "report-finalization-gate-1.0" },
        { ...valid, version: "report-finalization-gate-2.0" },
        { ...valid, extra: true },
        { eligible: true, reasons: [], version: valid.version },
        { ...valid, eligible: "true" },
        { ...valid, reasons: "none" },
        { ...valid, reasons: [""] },
        { ...valid, reasons: ["UNKNOWN_REASON"] },
        { ...valid, reportDigest: "" },
        { ...valid, reportDigest: "A".repeat(64) },
        { ...valid, reportDigest: "0".repeat(63) },
        { ...valid, reportDigest: 42 },
        { eligible: false, reasons: [], reportDigest: valid.reportDigest, version: valid.version }
    ];

    const augmentedReasons = [];
    augmentedReasons.extra = "unsupported";
    invalid.push({ ...valid, reasons: augmentedReasons });

    invalid.forEach((decision) => {
        assert.throws(() => ReportFinalizer.finalize(report, decision), /invalid gate decision/i);
    });
});

group("rejects ineligible decisions and eligible decisions with reasons", () => {
    const report = assembledReport();

    assert.throws(() => ReportFinalizer.finalize(report, {
        eligible: false,
        reasons: ["REPORT_STRUCTURE_INVALID"],
        reportDigest: eligibleDecision(report).reportDigest,
        version: "report-finalization-gate-1.1"
    }), /invalid gate decision/i);
    assert.throws(() => ReportFinalizer.finalize(report, {
        eligible: true,
        reasons: ["REPORT_STRUCTURE_INVALID"],
        reportDigest: eligibleDecision(report).reportDigest,
        version: "report-finalization-gate-1.1"
    }), /invalid gate decision/i);
});

group("returns the exact closed finalized-artifact contract", () => {
    const report = assembledReport();
    const artifact = ReportFinalizer.finalize(report, eligibleDecision(report));

    assert.deepEqual(Reflect.ownKeys(artifact), ["status", "version", "report", "finalization"]);
    assert.deepEqual(Reflect.ownKeys(artifact.finalization), ["gateVersion", "reportDigest"]);
    assert.equal(artifact.finalization.reportDigest, eligibleDecision(report).reportDigest);
    assert.equal(JSON.stringify(artifact).includes("finalizedAt"), false);
    assert.equal(JSON.stringify(artifact).includes("finalizationId"), false);
    assert.equal(JSON.stringify(artifact).includes("approved"), false);
});

group("preserves complete report content ordering and future sections", () => {
    const observations = [{ observationId: "observation-1", value: -0 }];
    const futureReleasedSection = {
        version: "future-section-1.0",
        data: ["preserved", { nested: true }]
    };
    const report = assembledReport({ observations, futureReleasedSection });
    const artifact = ReportFinalizer.finalize(report, eligibleDecision(report));

    assert.deepEqual(artifact.report, report);
    assert.deepEqual(Object.keys(artifact.report), Object.keys(report));
    assert.deepEqual(artifact.report.metadata, report.metadata);
    assert.deepEqual(artifact.report.context, report.context);
    assert.deepEqual(artifact.report.observations, observations);
    assert.deepEqual(artifact.report.findings, report.findings);
    assert.deepEqual(artifact.report.recommendations, report.recommendations);
    assert.deepEqual(artifact.report.summary, report.summary);
    assert.deepEqual(artifact.report.expertIntelligence, report.expertIntelligence);
    assert.deepEqual(artifact.report.futureReleasedSection, futureReleasedSection);
    assert.equal(Object.is(artifact.report.observations[0].value, -0), true);
});

group("preserves prototype-named data without prototype mutation", () => {
    const futureReleasedSection = {};
    Object.defineProperty(futureReleasedSection, "__proto__", {
        value: { preserved: true },
        enumerable: true,
        configurable: true,
        writable: true
    });
    const report = assembledReport({ futureReleasedSection });
    const artifact = ReportFinalizer.finalize(report, eligibleDecision(report));

    assert.equal(Object.getPrototypeOf(artifact.report.futureReleasedSection), Object.prototype);
    assert.equal(Object.hasOwn(artifact.report.futureReleasedSection, "__proto__"), true);
    assert.deepEqual(artifact.report.futureReleasedSection.__proto__, { preserved: true });
    assert.equal(Object.isFrozen(artifact.report.futureReleasedSection.__proto__), true);
});

group("enforces report-decision binding without re-evaluating eligibility", () => {
    const reportA = assembledReport();
    const decisionA = eligibleDecision(reportA);
    const detachedA = structuredClone(reportA);
    const alteredA = {
        ...structuredClone(reportA),
        metadata: { ...reportA.metadata, findingCount: 99 }
    };
    const unrelated = { arbitrary: "not-an-assembled-report" };
    const malformed = { ...structuredClone(reportA), findings: {} };
    const reportB = assembledReport({
        context: { inspectionId: "inspection-b", observations: [] }
    });
    const extendedA = {
        ...structuredClone(reportA),
        futureReleasedSection: { version: "future-1.0", data: ["bound"] }
    };

    assert.deepEqual(ReportFinalizer.finalize(detachedA, decisionA).report, reportA);
    [alteredA, unrelated, malformed, reportB, extendedA].forEach((candidate) => {
        assert.throws(
            () => ReportFinalizer.finalize(candidate, decisionA),
            /does not match the gate decision digest/i
        );
    });

    const extendedDecision = eligibleDecision(extendedA);
    const artifact = ReportFinalizer.finalize(extendedA, extendedDecision);
    assert.deepEqual(artifact.report, extendedA);
    assert.equal(artifact.finalization.reportDigest, extendedDecision.reportDigest);
});

group("does not mutate inputs and returns detached data", () => {
    const report = assembledReport();
    const decision = eligibleDecision(report);
    const reportBefore = structuredClone(report);
    const decisionBefore = structuredClone(decision);
    const artifact = ReportFinalizer.finalize(report, decision);

    assert.deepEqual(report, reportBefore);
    assert.deepEqual(decision, decisionBefore);
    assert.notEqual(artifact.report, report);
    assert.notEqual(artifact.report.metadata, report.metadata);
    assert.notEqual(artifact.report.findings, report.findings);
    assert.notEqual(artifact.report.findings[0], report.findings[0]);
});

group("returns deterministic recursively immutable artifacts", () => {
    const report = assembledReport();
    const decision = eligibleDecision(report);
    const first = ReportFinalizer.finalize(report, decision);
    const second = ReportFinalizer.finalize(report, decision);

    assert.deepEqual(first, second);
    assert.notEqual(first, second);
    assert.notEqual(first.report, second.report);
    assert.equal(Object.isFrozen(first), true);
    assert.equal(Object.isFrozen(first.report), true);
    assert.equal(Object.isFrozen(first.report.metadata), true);
    assert.equal(Object.isFrozen(first.report.findings), true);
    assert.equal(Object.isFrozen(first.report.findings[0]), true);
    assert.equal(Object.isFrozen(first.finalization), true);
    assert.throws(() => { first.status = "approved"; }, TypeError);
    assert.throws(() => { first.report.findings.push({}); }, TypeError);
    assert.throws(() => { first.report.metadata.reportVersion = "altered"; }, TypeError);
});

group("fails completely for report data that cannot be safely preserved", () => {
    const report = assembledReport();
    const decision = eligibleDecision(report);
    const circular = { value: "cycle" };
    circular.self = circular;

    [
        { ...report, futureReleasedSection: new Map([["key", "value"]]) },
        { ...report, futureReleasedSection: circular },
        { ...report, futureReleasedSection: { unsupported: () => true } }
    ].forEach((unsupported) => {
        assert.throws(
            () => ReportFinalizer.finalize(unsupported, decision),
            /unsupported|cyclic/i
        );
    });
});

group("normalizes root nested throwing and revoked report proxies through the digest boundary", () => {
    const report = assembledReport();
    const decision = eligibleDecision(report);
    const throwingProxy = new Proxy({}, {
        ownKeys() {
            throw new RangeError("REPORT_PROXY_TRAP");
        }
    });
    const prototypeProxy = new Proxy({}, {
        getPrototypeOf() {
            throw new RangeError("REPORT_PROTOTYPE_TRAP");
        }
    });
    const revoked = Proxy.revocable({}, {});
    revoked.revoke();
    const surrounding = {
        ...report,
        futureReleasedSection: {
            nested: [{ revoked: revoked.proxy }]
        }
    };

    [
        new Proxy(report, {}),
        throwingProxy,
        prototypeProxy,
        revoked.proxy,
        { ...report, futureReleasedSection: new Proxy({}, {}) },
        surrounding
    ].forEach((candidate) => {
        assert.throws(
            () => ReportFinalizer.finalize(candidate, decision),
            (error) => error instanceof Error
                && error.name === "Error"
                && error.message === "REPORT_CONTENT_DIGEST_UNSUPPORTED"
        );
    });

    assert.equal(Object.isFrozen(surrounding), false);
    assert.equal(Object.isFrozen(surrounding.futureReleasedSection), false);
});

group("rejects proxy-backed gate decisions through one stable finalizer boundary", () => {
    const report = assembledReport();
    const decision = eligibleDecision(report);
    const throwingProxy = new Proxy(decision, {
        ownKeys() {
            throw new RangeError("DECISION_PROXY_TRAP");
        }
    });
    const revoked = Proxy.revocable(decision, {});
    revoked.revoke();
    const revokedReasons = Proxy.revocable([], {});
    revokedReasons.revoke();

    [
        new Proxy(decision, {}),
        throwingProxy,
        revoked.proxy,
        { ...decision, reasons: new Proxy([], {}) },
        { ...decision, reasons: revokedReasons.proxy },
        { ...decision, reportDigest: new Proxy({}, {}) }
    ].forEach((candidate) => {
        for (let attempt = 0; attempt < 2; attempt += 1) {
            assert.throws(
                () => ReportFinalizer.finalize(report, candidate),
                (error) => error instanceof Error
                    && error.name === "Error"
                    && error.message === "ReportFinalizer: invalid gate decision."
                    && !error.message.includes("DECISION_PROXY_TRAP")
                    && !error.message.includes("revoked")
                    && !error.message.includes("IsArray")
            );
        }
    });
});

group("preserves supported null-prototype report data losslessly", () => {
    const futureReleasedSection = Object.create(null);
    futureReleasedSection.version = "future-section-1.0";
    futureReleasedSection.data = ["preserved", { nested: true }];
    futureReleasedSection.negativeZero = -0;
    const nestedNullPrototype = Object.create(null);
    nestedNullPrototype.value = "nested-value";
    futureReleasedSection.nestedNullPrototype = nestedNullPrototype;
    Object.defineProperty(futureReleasedSection, "__proto__", {
        value: { preserved: true },
        enumerable: true
    });
    Object.defineProperty(futureReleasedSection, "constructor", {
        value: "own-constructor",
        enumerable: true
    });
    Object.defineProperty(futureReleasedSection, "prototype", {
        value: "own-prototype",
        enumerable: true
    });
    const report = assembledReport({ futureReleasedSection });
    const decision = eligibleDecision(report);
    const artifact = ReportFinalizer.finalize(report, decision);

    assert.equal(Object.getPrototypeOf(artifact.report.futureReleasedSection), null);
    assert.equal(Object.getPrototypeOf(
        artifact.report.futureReleasedSection.nestedNullPrototype
    ), null);
    assert.deepEqual(Object.keys(artifact.report.futureReleasedSection), Object.keys(futureReleasedSection));
    assert.deepEqual(artifact.report.futureReleasedSection.data, futureReleasedSection.data);
    assert.equal(Object.is(artifact.report.futureReleasedSection.negativeZero, -0), true);
    assert.deepEqual(artifact.report.futureReleasedSection.__proto__, { preserved: true });
    assert.equal(artifact.report.futureReleasedSection.constructor, "own-constructor");
    assert.equal(artifact.report.futureReleasedSection.prototype, "own-prototype");
    assert.equal(Object.isFrozen(artifact.report.futureReleasedSection), true);
    assert.equal(Object.isFrozen(artifact.report.futureReleasedSection.nestedNullPrototype), true);
    assert.equal(Object.isFrozen(futureReleasedSection), false);
    assert.equal(Object.isFrozen(nestedNullPrototype), false);

    const equivalentSection = Object.create(null);
    Object.keys(futureReleasedSection).forEach((key) => {
        Object.defineProperty(equivalentSection, key, {
            value: cloneNullPrototypeTestValue(futureReleasedSection[key]),
            enumerable: true,
            configurable: true,
            writable: true
        });
    });
    const equivalentReport = assembledReport({ futureReleasedSection: equivalentSection });
    assert.doesNotThrow(() => ReportFinalizer.finalize(equivalentReport, decision));

    equivalentSection.version = "future-section-2.0";
    assert.throws(
        () => ReportFinalizer.finalize(equivalentReport, decision),
        /does not match the gate decision digest/i
    );
});

group("exposes exactly one public method and remains dependency isolated", () => {
    assert.deepEqual(Object.getOwnPropertyNames(ReportFinalizer)
        .filter((name) => !["length", "name", "prototype"].includes(name)), ["finalize"]);

    const source = readFileSync(
        new URL("../portal/core/reporting/ReportFinalizer.js", import.meta.url),
        "utf8"
    );

    assert.match(source, /^import ReportContentDigest from "\.\/ReportContentDigest\.js";/m);
    assert.doesNotMatch(
        source,
        /import ReportFinalizationGate|ReportFinalizationGate\.evaluate|RuntimeManager|StorageManager|ExpertIntelligenceReportProjection|ReportPage|Export|localStorage|fetch|Date\(|Date\.now|Math\.random/
    );
});

assert.equal(groups, 16);
console.log(`Report Finalizer tests completed: ${groups} groups passed.`);

function cloneNullPrototypeTestValue(value) {
    if (value && typeof value === "object") {
        if (Array.isArray(value)) {
            return value.map(cloneNullPrototypeTestValue);
        }

        const clone = Object.create(Object.getPrototypeOf(value));
        Object.keys(value).forEach((key) => {
            Object.defineProperty(clone, key, {
                value: cloneNullPrototypeTestValue(value[key]),
                enumerable: true,
                configurable: true,
                writable: true
            });
        });
        return clone;
    }

    return value;
}
