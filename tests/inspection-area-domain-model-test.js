import assert from "node:assert/strict";
import fs from "node:fs";
import InspectionAreaDomainModel, * as InspectionAreaModule from "../portal/core/InspectionAreaDomainModel.js";

const EXPECTED_ERROR = "InspectionAreaDomainModel: invalid Inspection Area.";
const VALID_INPUT = Object.freeze({
    areaId: "AREA-001",
    sessionId: "SESSION-001",
    name: "Dachfläche Nord",
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

function rejectsCreate(value) {
    assert.throws(
        () => InspectionAreaDomainModel.createArea(value),
        (error) => error?.message === EXPECTED_ERROR
    );
}

function rejectsOperation(operation) {
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

function assertSingleCapture(counts, expectedKeys) {
    assert.equal(counts.getPrototypeOf, 1);
    assert.equal(counts.ownKeys, 1);
    assert.deepEqual([...counts.descriptors.keys()], expectedKeys);
    expectedKeys.forEach((key) => assert.equal(counts.descriptors.get(key), 1));
    assert.equal(counts.get, 0);
    assert.equal(counts.has, 0);
    assert.equal(counts.set, 0);
    assert.equal(counts.defineProperty, 0);
}

test("public API and module exports are exact", () => {
    const publicMembers = Object.getOwnPropertyNames(InspectionAreaDomainModel)
        .filter((name) => !["length", "name", "prototype"].includes(name))
        .sort();

    assert.deepEqual(Object.keys(InspectionAreaModule), ["default"]);
    assert.deepEqual(publicMembers, ["VERSION", "createArea", "validateArea"]);
});

test("VERSION is exactly 1.0", () => {
    assert.equal(InspectionAreaDomainModel.VERSION, "1.0");
});

test("creates the exact minimal canonical area", () => {
    assert.deepEqual(InspectionAreaDomainModel.createArea(VALID_INPUT), {
        version: "1.0",
        ...VALID_INPUT
    });
});

test("sets version internally and rejects caller-provided version", () => {
    assert.equal(InspectionAreaDomainModel.createArea(VALID_INPUT).version, "1.0");
    rejectsCreate({ ...VALID_INPUT, version: "1.0" });
    rejectsCreate({ ...VALID_INPUT, version: "2.0" });
});

test("input key order does not alter the canonical result", () => {
    const reordered = {
        createdAt: VALID_INPUT.createdAt,
        name: VALID_INPUT.name,
        sessionId: VALID_INPUT.sessionId,
        areaId: VALID_INPUT.areaId
    };

    assert.deepEqual(
        InspectionAreaDomainModel.createArea(reordered),
        InspectionAreaDomainModel.createArea(VALID_INPUT)
    );
});

test("allows multiple areas to reference the same session", () => {
    const first = InspectionAreaDomainModel.createArea(VALID_INPUT);
    const second = InspectionAreaDomainModel.createArea({
        ...VALID_INPUT,
        areaId: "AREA-002",
        name: "Technikraum"
    });

    assert.equal(first.sessionId, second.sessionId);
    assert.notEqual(first.areaId, second.areaId);
});

test("requires every input field", () => {
    ["areaId", "sessionId", "name", "createdAt"].forEach((field) => {
        const input = { ...VALID_INPUT };
        delete input[field];
        rejectsCreate(input);
    });
});

test("rejects the complete non-string and empty string matrix", () => {
    ["areaId", "sessionId", "name"].forEach((field) => {
        [null, 1, true, {}, [], () => {}, undefined, "", "   "]
            .forEach((value) => rejectsCreate({ ...VALID_INPUT, [field]: value }));
    });
});

test("preserves meaningful identifier and name strings without normalization", () => {
    const input = {
        ...VALID_INPUT,
        areaId: "  AREA-Mixed_Ä  ",
        sessionId: "  Séssion 🏢 e\u0301  ",
        name: "  Dachfläche NORD e\u0301  "
    };
    const result = InspectionAreaDomainModel.createArea(input);

    assert.equal(result.areaId, input.areaId);
    assert.equal(result.sessionId, input.sessionId);
    assert.equal(result.name, input.name);
});

test("accepts only canonical real UTC timestamps", () => {
    [
        "2024-02-29T10:00:00.000Z",
        "2026-07-24T08:30:00.000Z"
    ].forEach((createdAt) => {
        assert.equal(InspectionAreaDomainModel.createArea({
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
    ].forEach((createdAt) => rejectsCreate({ ...VALID_INPUT, createdAt }));

    [null, 1, true, {}, [], () => {}, undefined]
        .forEach((createdAt) => rejectsCreate({ ...VALID_INPUT, createdAt }));
});

test("rejects all forbidden and unknown fields", () => {
    [
        "inspectionAreaId",
        "caseId",
        "areaType",
        "status",
        "description",
        "notes",
        "parentAreaId",
        "floor",
        "level",
        "storey",
        "buildingSection",
        "unitReference",
        "sequence",
        "sortOrder",
        "enteredAt",
        "completedAt",
        "lastVisitedAt",
        "roomId",
        "zoneId",
        "component",
        "observations",
        "photos",
        "evidence",
        "measurements",
        "timeline",
        "unknownField"
    ].forEach((field) => rejectsCreate({ ...VALID_INPUT, [field]: "unsupported" }));
});

test("keeps concrete areas isolated from catalog inspectionArea semantics", () => {
    [
        "roof_covering",
        "Wohnzimmer",
        "Dachfläche Nord",
        "Außenanlage West",
        "Technikraum",
        "Treppenhaus"
    ].forEach((name, index) => {
        const result = InspectionAreaDomainModel.createArea({
            ...VALID_INPUT,
            areaId: `AREA-${index + 1}`,
            name
        });

        assert.equal(result.name, name);
        assert.equal(result.areaId, `AREA-${index + 1}`);
        assert.equal("inspectionArea" in result, false);
        assert.equal("areaType" in result, false);
    });
});

test("rejects primitive function array and custom-prototype roots", () => {
    [null, undefined, [], "area", 1, true, 1n, Symbol("area"), () => {}]
        .forEach((value) => rejectsCreate(value));
    rejectsCreate(Object.assign(Object.create({ inherited: true }), VALID_INPUT));
});

test("accepts a null-prototype root", () => {
    const input = Object.assign(Object.create(null), VALID_INPUT);

    assert.deepEqual(InspectionAreaDomainModel.createArea(input), {
        version: "1.0",
        ...VALID_INPUT
    });
});

test("rejects symbols non-enumerable properties and accessors without executing getters", () => {
    rejectsCreate({ ...VALID_INPUT, [Symbol("hidden")]: "unsupported" });

    const nonEnumerable = { ...VALID_INPUT };
    Object.defineProperty(nonEnumerable, "hidden", {
        enumerable: false,
        value: "unsupported"
    });
    rejectsCreate(nonEnumerable);

    let getterCalls = 0;
    const accessor = { ...VALID_INPUT };
    Object.defineProperty(accessor, "areaId", {
        enumerable: true,
        get() {
            getterCalls += 1;
            return "AREA-001";
        }
    });
    rejectsCreate(accessor);
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
            ownKeys() { return ["areaId"]; },
            getOwnPropertyDescriptor() { return undefined; }
        })
    ].forEach((value) => rejectsCreate(value));
});

test("rejects an observable descriptor inconsistency", () => {
    let invalidateSessionId = false;
    const proxy = new Proxy({ ...VALID_INPUT }, {
        getOwnPropertyDescriptor(target, key) {
            if (key === "areaId") {
                invalidateSessionId = true;
                return Reflect.getOwnPropertyDescriptor(target, key);
            }

            if (key === "sessionId" && invalidateSessionId) {
                return {
                    configurable: true,
                    enumerable: true,
                    get() { return target.sessionId; }
                };
            }

            return Reflect.getOwnPropertyDescriptor(target, key);
        }
    });

    rejectsCreate(proxy);
});

test("captures createArea input exactly once", () => {
    const { proxy, counts } = instrumentRecord({ ...VALID_INPUT });
    const result = InspectionAreaDomainModel.createArea(proxy);

    assert.deepEqual(result, { version: "1.0", ...VALID_INPUT });
    assertSingleCapture(counts, ["areaId", "sessionId", "name", "createdAt"]);
});

test("captures validateArea input exactly once", () => {
    const canonical = { version: "1.0", ...VALID_INPUT };
    const { proxy, counts } = instrumentRecord(canonical);
    const validation = InspectionAreaDomainModel.validateArea(proxy);

    assert.deepEqual(validation, { valid: true, errors: [] });
    assertSingleCapture(counts, ["version", "areaId", "sessionId", "name", "createdAt"]);
});

test("accepts a fully transparent proxy as the observable record boundary", () => {
    const target = { ...VALID_INPUT, hiddenTargetField: "not observable" };
    const proxy = new Proxy(target, {
        ownKeys() { return Object.keys(VALID_INPUT); },
        getOwnPropertyDescriptor(value, key) {
            return Reflect.getOwnPropertyDescriptor(value, key);
        }
    });

    assert.deepEqual(InspectionAreaDomainModel.createArea(proxy), {
        version: "1.0",
        ...VALID_INPUT
    });
});

test("createArea does not mutate freeze or retain input", () => {
    const input = { ...VALID_INPUT };
    const before = structuredClone(input);
    const result = InspectionAreaDomainModel.createArea(input);

    assert.deepEqual(input, before);
    assert.equal(Object.isFrozen(input), false);
    assert.notEqual(result, input);
    assert.equal(Object.isFrozen(result), true);
});

test("separate calls are deterministic and share no root reference", () => {
    const first = InspectionAreaDomainModel.createArea(VALID_INPUT);
    const second = InspectionAreaDomainModel.createArea(VALID_INPUT);

    assert.deepEqual(first, second);
    assert.notEqual(first, second);
});

test("validateArea accepts only the complete canonical contract without mutation", () => {
    const canonical = { version: "1.0", ...VALID_INPUT };
    const before = structuredClone(canonical);
    const validation = InspectionAreaDomainModel.validateArea(canonical);

    assert.deepEqual(validation, { valid: true, errors: [] });
    assert.equal(Object.isFrozen(validation), true);
    assert.equal(Object.isFrozen(validation.errors), true);
    assert.deepEqual(canonical, before);
    assert.equal(Object.isFrozen(canonical), false);
});

test("validateArea creates no defaults and rejects contract drift", () => {
    const canonical = { version: "1.0", ...VALID_INPUT };
    const { version, ...withoutVersion } = canonical;

    rejectsOperation(() => InspectionAreaDomainModel.validateArea(withoutVersion));
    rejectsOperation(() => InspectionAreaDomainModel.validateArea({ ...canonical, version: "2.0" }));
    rejectsOperation(() => InspectionAreaDomainModel.validateArea({ ...canonical, status: "OPEN" }));
});

test("production source has no forbidden dependencies generators or catalog mapping", () => {
    const source = fs.readFileSync(
        new URL("../portal/core/InspectionAreaDomainModel.js", import.meta.url),
        "utf8"
    );
    const forbidden = [
        "InspectionSessionDomainModel",
        "InspectionCaseDomainModel",
        "InspectionManager",
        "InspectionContext",
        "InspectionScopeManager",
        "AdaptiveInspectionSessionSandbox",
        "QuestionCatalogManager",
        "EvidenceManager",
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
        "inspectionArea",
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

console.log(`Inspection Area Domain Model: ${passed}/${passed} groups passed.`);
