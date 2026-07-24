import assert from "node:assert/strict";
import fs from "node:fs";
import InspectionSessionDomainModel, * as InspectionSessionModule from "../portal/core/InspectionSessionDomainModel.js";

const EXPECTED_ERROR = "InspectionSessionDomainModel: invalid Inspection Session.";
const VALID_INPUT = Object.freeze({
    sessionId: "SESSION-001",
    caseId: "CASE-001",
    createdAt: "2026-07-24T08:30:00.000Z"
});

let passed = 0;

function test(name, operation) {
    try {
        operation();
        passed += 1;
        console.log(`PASS ${name}`);
    } catch (error) {
        console.error(`FAIL ${name}`);
        throw error;
    }
}

function rejects(valueOrOperation) {
    const operation = typeof valueOrOperation === "function"
        ? valueOrOperation
        : () => InspectionSessionDomainModel.createSession(valueOrOperation);

    assert.throws(operation, (error) => error?.message === EXPECTED_ERROR);
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
            throw new Error("external values must come from descriptors");
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

function assertSingleCapture(counts, expectedDescriptorCount) {
    assert.equal(counts.getPrototypeOf, 1);
    assert.equal(counts.ownKeys, 1);
    assert.equal(counts.descriptors.size, expectedDescriptorCount);
    assert.ok([...counts.descriptors.values()].every((count) => count === 1));
    assert.equal(counts.get, 0);
    assert.equal(counts.has, 0);
    assert.equal(counts.set, 0);
    assert.equal(counts.defineProperty, 0);
}

test("public API and module exports are exact", () => {
    const publicMembers = Object.getOwnPropertyNames(InspectionSessionDomainModel)
        .filter((name) => !["length", "name", "prototype"].includes(name))
        .sort();

    assert.deepEqual(Object.keys(InspectionSessionModule), ["default"]);
    assert.deepEqual(publicMembers, ["VERSION", "createSession", "validateSession"]);
});

test("VERSION is exactly 1.0", () => {
    assert.equal(InspectionSessionDomainModel.VERSION, "1.0");
});

test("creates the exact minimal canonical session", () => {
    assert.deepEqual(InspectionSessionDomainModel.createSession(VALID_INPUT), {
        version: "1.0",
        ...VALID_INPUT
    });
});

test("sets version internally and rejects caller-provided version", () => {
    assert.equal(InspectionSessionDomainModel.createSession(VALID_INPUT).version, "1.0");
    rejects({ ...VALID_INPUT, version: "1.0" });
    rejects({ ...VALID_INPUT, version: "2.0" });
});

test("input key order does not alter the canonical result", () => {
    const reordered = {
        createdAt: VALID_INPUT.createdAt,
        caseId: VALID_INPUT.caseId,
        sessionId: VALID_INPUT.sessionId
    };

    assert.deepEqual(
        InspectionSessionDomainModel.createSession(reordered),
        InspectionSessionDomainModel.createSession(VALID_INPUT)
    );
});

test("requires every input field", () => {
    ["sessionId", "caseId", "createdAt"].forEach((field) => {
        const input = { ...VALID_INPUT };
        delete input[field];
        rejects(input);
    });
});

test("rejects empty and whitespace-only identifiers", () => {
    ["", "   "].forEach((value) => {
        rejects({ ...VALID_INPUT, sessionId: value });
        rejects({ ...VALID_INPUT, caseId: value });
    });
});

test("preserves meaningful identifier strings without normalization", () => {
    const input = {
        ...VALID_INPUT,
        sessionId: "  Séssion 🏢 e\u0301  ",
        caseId: "  Case-Mixed_Ä  "
    };
    const result = InspectionSessionDomainModel.createSession(input);

    assert.equal(result.sessionId, input.sessionId);
    assert.equal(result.caseId, input.caseId);
});

test("accepts only canonical real UTC timestamps", () => {
    [
        "2024-02-29T10:00:00.000Z",
        "2026-07-24T08:30:00.000Z"
    ].forEach((createdAt) => {
        assert.equal(InspectionSessionDomainModel.createSession({
            ...VALID_INPUT,
            createdAt
        }).createdAt, createdAt);
    });

    [
        "2026-02-29T10:00:00.000Z",
        "2026-13-01T10:00:00.000Z",
        "2026-01-32T10:00:00.000Z",
        "2026-07-24T24:00:00.000Z",
        "2026-07-24T25:00:00.000Z",
        "2026-07-24T08:60:00.000Z",
        "2026-07-24T08:30:60.000Z",
        "2026-07-24T08:30:00Z",
        "2026-07-24T08:30:00.0Z",
        "2026-07-24T08:30:00.00Z",
        "2026-07-24T08:30:00.0000Z",
        "2026-07-24T10:30:00.000+02:00"
    ].forEach((createdAt) => rejects({ ...VALID_INPUT, createdAt }));
});

test("rejects all forbidden and unknown fields", () => {
    [
        "inspectionId",
        "inspectionSessionId",
        "sessionType",
        "inspectionType",
        "status",
        "startedAt",
        "completedAt",
        "finishedAt",
        "scheduledAt",
        "title",
        "notes",
        "inspector",
        "propertyReference",
        "unknownField"
    ].forEach((field) => rejects({ ...VALID_INPUT, [field]: "unsupported" }));
});

test("rejects primitive function array and custom-prototype roots", () => {
    [null, undefined, [], "session", 1, true, 1n, Symbol("session")]
        .forEach((value) => rejects(value));
    rejects(() => InspectionSessionDomainModel.createSession(() => {}));
    rejects(Object.assign(Object.create({ inherited: true }), VALID_INPUT));
});

test("accepts a null-prototype root", () => {
    const input = Object.assign(Object.create(null), VALID_INPUT);

    assert.deepEqual(InspectionSessionDomainModel.createSession(input), {
        version: "1.0",
        ...VALID_INPUT
    });
});

test("rejects symbols non-enumerable properties and accessors without executing getters", () => {
    rejects({ ...VALID_INPUT, [Symbol("hidden")]: "unsupported" });

    const nonEnumerable = { ...VALID_INPUT };
    Object.defineProperty(nonEnumerable, "hidden", {
        enumerable: false,
        value: "unsupported"
    });
    rejects(nonEnumerable);

    let getterCalls = 0;
    const accessor = { ...VALID_INPUT };
    Object.defineProperty(accessor, "sessionId", {
        enumerable: true,
        get() {
            getterCalls += 1;
            return "SESSION-001";
        }
    });
    rejects(accessor);
    assert.equal(getterCalls, 0);
});

test("converts record-capture proxy failures into the stable domain error", () => {
    [
        new Proxy(VALID_INPUT, { getPrototypeOf() { throw new Error("prototype trap"); } }),
        new Proxy(VALID_INPUT, { ownKeys() { throw new Error("ownKeys trap"); } }),
        new Proxy(VALID_INPUT, {
            getOwnPropertyDescriptor() { throw new Error("descriptor trap"); }
        }),
        new Proxy({}, {
            ownKeys() { return ["sessionId"]; },
            getOwnPropertyDescriptor() { return undefined; }
        })
    ].forEach((value) => rejects(value));
});

test("rejects an observable descriptor inconsistency", () => {
    let invalidateCaseId = false;
    const proxy = new Proxy({ ...VALID_INPUT }, {
        getOwnPropertyDescriptor(target, key) {
            if (key === "sessionId") {
                invalidateCaseId = true;
                return Reflect.getOwnPropertyDescriptor(target, key);
            }

            if (key === "caseId" && invalidateCaseId) {
                return {
                    configurable: true,
                    enumerable: true,
                    get() { return target.caseId; }
                };
            }

            return Reflect.getOwnPropertyDescriptor(target, key);
        }
    });

    rejects(proxy);
});

test("captures createSession input exactly once", () => {
    const { proxy, counts } = instrumentRecord({ ...VALID_INPUT });
    const result = InspectionSessionDomainModel.createSession(proxy);

    assert.deepEqual(result, { version: "1.0", ...VALID_INPUT });
    assertSingleCapture(counts, 3);
});

test("captures validateSession input exactly once", () => {
    const canonical = { version: "1.0", ...VALID_INPUT };
    const { proxy, counts } = instrumentRecord(canonical);
    const validation = InspectionSessionDomainModel.validateSession(proxy);

    assert.deepEqual(validation, { valid: true, errors: [] });
    assertSingleCapture(counts, 4);
});

test("accepts a fully transparent proxy as the observable record boundary", () => {
    const target = { ...VALID_INPUT, hiddenTargetField: "not observable" };
    const proxy = new Proxy(target, {
        ownKeys() { return Object.keys(VALID_INPUT); },
        getOwnPropertyDescriptor(value, key) {
            return Reflect.getOwnPropertyDescriptor(value, key);
        }
    });

    assert.deepEqual(InspectionSessionDomainModel.createSession(proxy), {
        version: "1.0",
        ...VALID_INPUT
    });
});

test("createSession does not mutate freeze or retain input", () => {
    const input = { ...VALID_INPUT };
    const before = structuredClone(input);
    const result = InspectionSessionDomainModel.createSession(input);

    assert.deepEqual(input, before);
    assert.equal(Object.isFrozen(input), false);
    assert.notEqual(result, input);
    assert.equal(Object.isFrozen(result), true);
});

test("separate calls are deterministic and share no root reference", () => {
    const first = InspectionSessionDomainModel.createSession(VALID_INPUT);
    const second = InspectionSessionDomainModel.createSession(VALID_INPUT);

    assert.deepEqual(first, second);
    assert.notEqual(first, second);
});

test("validateSession accepts only the complete canonical contract without mutation", () => {
    const canonical = { version: "1.0", ...VALID_INPUT };
    const before = structuredClone(canonical);
    const validation = InspectionSessionDomainModel.validateSession(canonical);

    assert.deepEqual(validation, { valid: true, errors: [] });
    assert.equal(Object.isFrozen(validation), true);
    assert.equal(Object.isFrozen(validation.errors), true);
    assert.deepEqual(canonical, before);
    assert.equal(Object.isFrozen(canonical), false);
});

test("validateSession creates no defaults and rejects contract drift", () => {
    const canonical = { version: "1.0", ...VALID_INPUT };
    const { version, ...withoutVersion } = canonical;

    rejects(() => InspectionSessionDomainModel.validateSession(withoutVersion));
    rejects(() => InspectionSessionDomainModel.validateSession({ ...canonical, version: "2.0" }));
    rejects(() => InspectionSessionDomainModel.validateSession({ ...canonical, status: "CREATED" }));
});

test("production source has no forbidden dependencies or generators", () => {
    const source = fs.readFileSync(
        new URL("../portal/core/InspectionSessionDomainModel.js", import.meta.url),
        "utf8"
    );
    const forbidden = [
        "InspectionCaseDomainModel",
        "InspectionManager",
        "CaseManager",
        "InspectionContext",
        "AdaptiveInspectionSessionSandbox",
        "StorageManager",
        "localStorage",
        "EventBus",
        "ExpertIntelligence",
        "HumanReview",
        "Reporting",
        "ReportContentDigest",
        "Export",
        "Risk",
        "Runtime",
        "Workflow",
        "crypto"
    ];

    assert.equal(/^\s*import\s/m.test(source), false);
    forbidden.forEach((token) => assert.equal(source.includes(token), false, token));
    assert.equal(source.includes("Date.now"), false);
    assert.equal(source.includes("new Date()"), false);
    assert.equal(source.includes("Math.random"), false);
    assert.equal(source.includes("JSON.parse"), false);
    assert.equal(source.includes("JSON.stringify"), false);
});

console.log(`Inspection Session Domain Model: ${passed}/${passed} groups passed.`);
