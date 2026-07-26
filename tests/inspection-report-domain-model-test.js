import assert from "node:assert/strict";
import fs from "node:fs";
import InspectionReportDomainModel, * as InspectionReportModule from "../portal/core/InspectionReportDomainModel.js";

const EXPECTED_ERROR = "InspectionReportDomainModel: invalid Inspection Report.";
const VALID_INPUT = Object.freeze({
    reportId: "RPT-1",
    decisionId: "DEC-1",
    report: "The responsible expert records the inspection report content.",
    createdAt: "2026-07-26T10:30:00.000Z"
});

let passed = 0;

function test(name, operation) {
    try {
        operation();
        passed += 1;
    } catch (error) {
        error.message = `${name}: ${error.message}`;
        throw error;
    }
}

function rejectsCreate(value) {
    assert.throws(
        () => InspectionReportDomainModel.createReport(value),
        (error) => error instanceof Error && error.message === EXPECTED_ERROR
    );
}

function rejectsValidate(value) {
    assert.throws(
        () => InspectionReportDomainModel.validateReport(value),
        (error) => error instanceof Error && error.message === EXPECTED_ERROR
    );
}

function instrumentRecord(target) {
    const counts = {
        getPrototypeOf: 0,
        ownKeys: 0,
        descriptors: new Map(),
        get: 0,
        has: 0,
        set: 0,
        defineProperty: 0
    };
    const proxy = new Proxy(target, {
        getPrototypeOf(value) {
            counts.getPrototypeOf += 1;
            return Reflect.getPrototypeOf(value);
        },
        ownKeys(value) {
            counts.ownKeys += 1;
            return Reflect.ownKeys(value);
        },
        getOwnPropertyDescriptor(value, key) {
            counts.descriptors.set(key, (counts.descriptors.get(key) || 0) + 1);
            return Reflect.getOwnPropertyDescriptor(value, key);
        },
        get() {
            counts.get += 1;
            throw new Error("unexpected get");
        },
        has(value, key) {
            counts.has += 1;
            return Reflect.has(value, key);
        },
        set(value, key, next, receiver) {
            counts.set += 1;
            return Reflect.set(value, key, next, receiver);
        },
        defineProperty(value, key, descriptor) {
            counts.defineProperty += 1;
            return Reflect.defineProperty(value, key, descriptor);
        }
    });

    return { proxy, counts };
}

function assertSingleCapture(counts, expectedKeys) {
    assert.equal(counts.getPrototypeOf, 1);
    assert.equal(counts.ownKeys, 1);
    assert.equal(counts.descriptors.size, expectedKeys.length);
    expectedKeys.forEach((key) => assert.equal(counts.descriptors.get(key), 1));
    assert.equal(counts.get, 0);
    assert.equal(counts.has, 0);
    assert.equal(counts.set, 0);
    assert.equal(counts.defineProperty, 0);
}

test("exports only the governed default public contract", () => {
    assert.deepEqual(Object.keys(InspectionReportModule), ["default"]);
    assert.equal(InspectionReportModule.default, InspectionReportDomainModel);
    const publicMembers = Object.getOwnPropertyNames(InspectionReportDomainModel)
        .filter((name) => !["length", "name", "prototype"].includes(name));
    assert.deepEqual(publicMembers, ["VERSION", "createReport", "validateReport"]);
});

test("VERSION is exactly 1.0", () => {
    assert.equal(InspectionReportDomainModel.VERSION, "1.0");
});

test("creates the exact canonical report in canonical field order", () => {
    const result = InspectionReportDomainModel.createReport(VALID_INPUT);
    assert.deepEqual(Object.keys(result), [
        "version",
        "reportId",
        "decisionId",
        "report",
        "createdAt"
    ]);
    assert.deepEqual(result, { version: "1.0", ...VALID_INPUT });
});

test("sets version internally and rejects version in creation input", () => {
    assert.equal(InspectionReportDomainModel.createReport(VALID_INPUT).version, "1.0");
    rejectsCreate({ version: "1.0", ...VALID_INPUT });
});

test("requires all four creation fields", () => {
    Object.keys(VALID_INPUT).forEach((field) => {
        const input = { ...VALID_INPUT };
        delete input[field];
        rejectsCreate(input);
    });
});

test("rejects all excluded architectural and unknown fields", () => {
    [
        "id", "recommendationId", "assessmentId", "findingId", "evidenceIds",
        "caseId", "sessionId", "areaId", "observationId", "status", "state",
        "approved", "released", "published", "reviewer", "approver",
        "authorization", "exportFormat", "fileName", "mimeType", "template",
        "sections", "metadata", "risk", "priority", "severity", "confidence",
        "summary", "preview", "projection", "rendered", "persisted", "createdBy",
        "updatedBy", "updatedAt", "unknownField"
    ].forEach((field) => rejectsCreate({ ...VALID_INPUT, [field]: "forbidden" }));
});

test("rejects symbol non-enumerable and accessor properties without execution", () => {
    rejectsCreate({ ...VALID_INPUT, [Symbol("hidden")]: true });

    const hidden = { ...VALID_INPUT };
    Object.defineProperty(hidden, "hidden", { value: true });
    rejectsCreate(hidden);

    let getterCalls = 0;
    let setterCalls = 0;
    const accessor = { ...VALID_INPUT };
    Object.defineProperty(accessor, "report", {
        enumerable: true,
        get() {
            getterCalls += 1;
            return VALID_INPUT.report;
        },
        set() {
            setterCalls += 1;
        }
    });
    rejectsCreate(accessor);
    assert.equal(getterCalls, 0);
    assert.equal(setterCalls, 0);
});

test("accepts ordinary and null-prototype roots", () => {
    assert.deepEqual(InspectionReportDomainModel.createReport(VALID_INPUT), {
        version: "1.0",
        ...VALID_INPUT
    });
    const input = Object.assign(Object.create(null), VALID_INPUT);
    assert.deepEqual(InspectionReportDomainModel.createReport(input), {
        version: "1.0",
        ...VALID_INPUT
    });
});

test("rejects primitive array function and custom-prototype roots", () => {
    [null, undefined, true, false, 1, 1n, "record", Symbol("record"), [], () => {}]
        .forEach((value) => rejectsCreate(value));
    rejectsCreate(Object.create({ custom: true }));
});

test("string fields preserve unicode whitespace and report line breaks", () => {
    const input = {
        reportId: "  RPT-Ä-一  ",
        decisionId: "  DEC-é-二  ",
        report: "  Menschlich verantworteter Bericht – unverändert.\n第二行  ",
        createdAt: VALID_INPUT.createdAt
    };
    const result = InspectionReportDomainModel.createReport(input);
    assert.equal(result.reportId, input.reportId);
    assert.equal(result.decisionId, input.decisionId);
    assert.equal(result.report, input.report);
});

test("all string fields reject the complete invalid type matrix", () => {
    const invalidValues = [
        "", " ", "\t\n", 0, 1, NaN, Infinity, true, false, null, undefined,
        Symbol("value"), 1n, new String("wrapped"), [], {}, () => {}
    ];
    ["reportId", "decisionId", "report"].forEach((field) => {
        invalidValues.forEach((value) => rejectsCreate({ ...VALID_INPUT, [field]: value }));
    });
});

test("does not resolve the parent decision or generate report content", () => {
    const result = InspectionReportDomainModel.createReport({
        ...VALID_INPUT,
        decisionId: "NONEXISTENT-DECISION",
        report: "Caller-supplied content remains exact."
    });
    assert.equal(result.decisionId, "NONEXISTENT-DECISION");
    assert.equal(result.report, "Caller-supplied content remains exact.");
    ["recommendationId", "assessmentId", "findingId", "evidenceIds"]
        .forEach((field) => assert.equal(Object.hasOwn(result, field), false));
});

test("accepts canonical timestamp calendar boundaries including year zero", () => {
    [
        "0000-02-29T00:00:00.000Z",
        "1900-02-28T23:59:59.999Z",
        "2000-02-29T00:00:00.000Z",
        "2024-02-29T12:30:45.123Z",
        "2026-04-30T23:59:59.999Z",
        "9999-12-31T23:59:59.999Z"
    ].forEach((createdAt) => {
        assert.equal(
            InspectionReportDomainModel.createReport({ ...VALID_INPUT, createdAt }).createdAt,
            createdAt
        );
    });
});

test("rejects impossible calendar timestamps", () => {
    [
        "0001-02-29T00:00:00.000Z", "1900-02-29T00:00:00.000Z",
        "2100-02-29T00:00:00.000Z", "2026-00-01T00:00:00.000Z",
        "2026-13-01T00:00:00.000Z", "2026-01-00T00:00:00.000Z",
        "2026-01-32T00:00:00.000Z", "2026-02-30T00:00:00.000Z",
        "2026-04-31T00:00:00.000Z", "2026-11-31T00:00:00.000Z"
    ].forEach((createdAt) => rejectsCreate({ ...VALID_INPUT, createdAt }));
});

test("rejects noncanonical timestamp time precision zone and types", () => {
    [
        "2026-07-26T24:00:00.000Z", "2026-07-26T25:00:00.000Z",
        "2026-07-26T08:60:00.000Z", "2026-07-26T08:30:60.000Z",
        "2026-07-26T08:30:00.0Z", "2026-07-26T08:30:00.00Z",
        "2026-07-26T08:30:00.0000Z", "2026-07-26T08:30:00.000",
        "2026-07-26T08:30:00.000z", "2026-07-26T08:30:00.000+00:00",
        " 2026-07-26T08:30:00.000Z", "2026-07-26T08:30:00.000Z "
    ].forEach((createdAt) => rejectsCreate({ ...VALID_INPUT, createdAt }));
    [null, undefined, 0, true, {}, []]
        .forEach((createdAt) => rejectsCreate({ ...VALID_INPUT, createdAt }));
});

test("captures createReport input exactly once", () => {
    const { proxy, counts } = instrumentRecord({ ...VALID_INPUT });
    assert.deepEqual(InspectionReportDomainModel.createReport(proxy), {
        version: "1.0",
        ...VALID_INPUT
    });
    assertSingleCapture(counts, Object.keys(VALID_INPUT));
});

test("captures validateReport input exactly once", () => {
    const canonical = { version: "1.0", ...VALID_INPUT };
    const { proxy, counts } = instrumentRecord(canonical);
    assert.deepEqual(
        InspectionReportDomainModel.validateReport(proxy),
        { valid: true, errors: [] }
    );
    assertSingleCapture(counts, Object.keys(canonical));
});

test("maps reflection descriptor and revoked-proxy failures to the domain error", () => {
    ["getPrototypeOf", "ownKeys", "getOwnPropertyDescriptor"].forEach((trap) => {
        rejectsCreate(new Proxy({ ...VALID_INPUT }, {
            [trap]() {
                throw new Error(`${trap} failed`);
            }
        }));
    });
    const revoked = Proxy.revocable({ ...VALID_INPUT }, {});
    revoked.revoke();
    rejectsCreate(revoked.proxy);
    rejectsCreate(new Proxy({}, {
        ownKeys() {
            return ["reportId"];
        },
        getOwnPropertyDescriptor() {
            return undefined;
        }
    }));
});

test("rejects descriptor instability without executing accessors", () => {
    let invalidateDecisionId = false;
    const proxy = new Proxy({ ...VALID_INPUT }, {
        getOwnPropertyDescriptor(target, key) {
            if (key === "reportId") {
                invalidateDecisionId = true;
                return Reflect.getOwnPropertyDescriptor(target, key);
            }
            if (key === "decisionId" && invalidateDecisionId) {
                return {
                    configurable: true,
                    enumerable: true,
                    get() {
                        return target.decisionId;
                    }
                };
            }
            return Reflect.getOwnPropertyDescriptor(target, key);
        }
    });
    rejectsCreate(proxy);
});

test("accepts a transparent proxy by observable record shape", () => {
    const target = { ...VALID_INPUT };
    const proxy = new Proxy(target, {
        ownKeys() {
            return Object.keys(VALID_INPUT);
        },
        getOwnPropertyDescriptor(value, key) {
            return Reflect.getOwnPropertyDescriptor(value, key);
        }
    });
    assert.deepEqual(InspectionReportDomainModel.createReport(proxy), {
        version: "1.0",
        ...VALID_INPUT
    });
});

test("preserves input and returns detached deeply frozen output", () => {
    const input = { ...VALID_INPUT };
    const before = { ...input };
    const result = InspectionReportDomainModel.createReport(input);
    assert.deepEqual(input, before);
    assert.equal(Object.isFrozen(input), false);
    assert.equal(Object.isFrozen(result), true);
    assert.notEqual(result, input);
});

test("is deterministic while returning separate root objects", () => {
    const first = InspectionReportDomainModel.createReport(VALID_INPUT);
    const second = InspectionReportDomainModel.createReport(VALID_INPUT);
    assert.deepEqual(first, second);
    assert.notEqual(first, second);
});

test("validates only the complete canonical contract with frozen success output", () => {
    const canonical = { version: "1.0", ...VALID_INPUT };
    const result = InspectionReportDomainModel.validateReport(canonical);
    assert.deepEqual(result, { valid: true, errors: [] });
    assert.equal(Object.isFrozen(result), true);
    assert.equal(Object.isFrozen(result.errors), true);
    assert.equal(Object.isFrozen(canonical), false);
});

test("validation creates no defaults and rejects contract drift", () => {
    const canonical = { version: "1.0", ...VALID_INPUT };
    Object.keys(canonical).forEach((field) => {
        const value = { ...canonical };
        delete value[field];
        rejectsValidate(value);
    });
    rejectsValidate({ ...canonical, version: "2.0" });
    rejectsValidate({ ...canonical, status: "RELEASED" });
});

test("production source has no forbidden dependencies or mechanisms", () => {
    const source = fs.readFileSync(
        new URL("../portal/core/InspectionReportDomainModel.js", import.meta.url),
        "utf8"
    );
    const forbidden = [
        "InspectionCaseDomainModel", "InspectionSessionDomainModel",
        "InspectionAreaDomainModel", "InspectionObservationDomainModel",
        "InspectionEvidenceDomainModel", "InspectionFindingDomainModel",
        "InspectionAssessmentDomainModel", "InspectionRecommendationDomainModel",
        "InspectionDecisionDomainModel", "ReportAssemblyEngine", "ReportFinalizer",
        "ReportFinalizationGate", "ReportContentDigest", "ReportPage",
        "ReportOutputGovernanceManager", "ReportFinalizationLockManager",
        "StorageManager", "localStorage", "sessionStorage", "EventBus", "Runtime",
        "Workflow", "Projection", "Preview", "Rendering", "Export",
        "ExpertIntelligence", "KnowledgeProvider", "Temporal", "Intl",
        "Math.random", "crypto", "Crypto", "JSON.parse", "JSON.stringify",
        "structuredClone"
    ];
    forbidden.forEach((token) => assert.equal(source.includes(token), false, token));
    assert.equal(/^\s*import\s/m.test(source), false);
    assert.equal(/\bDate\b/.test(source), false);
});

console.log(`Inspection Report Domain Model: ${passed}/${passed} groups passed.`);
