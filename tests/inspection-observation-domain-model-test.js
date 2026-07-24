import assert from "node:assert/strict";
import fs from "node:fs";
import InspectionObservationDomainModel, * as InspectionObservationModule from "../portal/core/InspectionObservationDomainModel.js";

const EXPECTED_ERROR = "InspectionObservationDomainModel: invalid Inspection Observation.";
const VALID_INPUT = Object.freeze({
    observationId: "OBSERVATION-001",
    areaId: "AREA-001",
    text: "Oberfläche trocken; keine Verfärbung im Prüfbereich erkennbar.",
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
        () => InspectionObservationDomainModel.createObservation(value),
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
    const publicMembers = Object.getOwnPropertyNames(InspectionObservationDomainModel)
        .filter((name) => !["length", "name", "prototype"].includes(name))
        .sort();

    assert.deepEqual(Object.keys(InspectionObservationModule), ["default"]);
    assert.deepEqual(publicMembers, ["VERSION", "createObservation", "validateObservation"]);
});

test("VERSION is exactly 1.0", () => {
    assert.equal(InspectionObservationDomainModel.VERSION, "1.0");
});

test("creates the exact minimal canonical observation", () => {
    assert.deepEqual(InspectionObservationDomainModel.createObservation(VALID_INPUT), {
        version: "1.0",
        ...VALID_INPUT
    });
});

test("sets version internally and rejects caller-provided version", () => {
    assert.equal(InspectionObservationDomainModel.createObservation(VALID_INPUT).version, "1.0");
    rejectsCreate({ ...VALID_INPUT, version: "1.0" });
    rejectsCreate({ ...VALID_INPUT, version: "2.0" });
});

test("input key order does not alter the canonical result", () => {
    const reordered = {
        createdAt: VALID_INPUT.createdAt,
        text: VALID_INPUT.text,
        areaId: VALID_INPUT.areaId,
        observationId: VALID_INPUT.observationId
    };

    assert.deepEqual(
        InspectionObservationDomainModel.createObservation(reordered),
        InspectionObservationDomainModel.createObservation(VALID_INPUT)
    );
});

test("allows multiple observations to reference the same area", () => {
    const first = InspectionObservationDomainModel.createObservation(VALID_INPUT);
    const second = InspectionObservationDomainModel.createObservation({
        ...VALID_INPUT,
        observationId: "OBSERVATION-002",
        text: "Korrosionsspuren an der unteren Befestigungsschraube sichtbar."
    });

    assert.equal(first.areaId, second.areaId);
    assert.notEqual(first.observationId, second.observationId);
});

test("requires every input field", () => {
    ["observationId", "areaId", "text", "createdAt"].forEach((field) => {
        const input = { ...VALID_INPUT };
        delete input[field];
        rejectsCreate(input);
    });
});

test("rejects the complete non-string and empty string matrix", () => {
    ["observationId", "areaId", "text"].forEach((field) => {
        [null, 1, true, {}, [], () => {}, undefined, "", "   "]
            .forEach((value) => rejectsCreate({ ...VALID_INPUT, [field]: value }));
    });
});

test("preserves meaningful identifiers and text without normalization", () => {
    const input = {
        ...VALID_INPUT,
        observationId: "  Observation-Mixed_Ä  ",
        areaId: "  Aréa 🏢 e\u0301  ",
        text: "  Erste Zeile e\u0301.\nZWEITE Zeile; unverändert!  "
    };
    const result = InspectionObservationDomainModel.createObservation(input);

    assert.equal(result.observationId, input.observationId);
    assert.equal(result.areaId, input.areaId);
    assert.equal(result.text, input.text);
});

test("preserves positive neutral negative technical and multilingual observations", () => {
    [
        "Bauteiloberfläche ohne sichtbare Auffälligkeiten.",
        "Oberfläche trocken; keine Verfärbung im Prüfbereich erkennbar.",
        "Feine horizontale Risslinie oberhalb der Fensteröffnung sichtbar.",
        "Korrosionsspuren an der unteren Befestigungsschraube sichtbar.",
        "ห้องนี้ไม่พบความชื้นที่มองเห็นได้",
        "Roof membrane appears continuous at the inspected section.",
        "Mehrzeiliger Beobachtungstext mit:\nzweiter Zeile und unveränderter Interpunktion."
    ].forEach((text, index) => {
        const result = InspectionObservationDomainModel.createObservation({
            ...VALID_INPUT,
            observationId: `OBSERVATION-${index + 1}`,
            text
        });

        assert.equal(result.text, text);
    });
});

test("does not classify diagnostic or risk-like keywords", () => {
    const text = "defect risk crack moisture corrosion diagnosis cause severity";
    const result = InspectionObservationDomainModel.createObservation({ ...VALID_INPUT, text });

    assert.equal(result.text, text);
    assert.deepEqual(Object.keys(result), [
        "version",
        "observationId",
        "areaId",
        "text",
        "createdAt"
    ]);
});

test("accepts only canonical real UTC timestamps", () => {
    [
        "2024-02-29T10:00:00.000Z",
        "2026-07-24T08:30:00.000Z"
    ].forEach((createdAt) => {
        assert.equal(InspectionObservationDomainModel.createObservation({
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
        "inspectionObservationId",
        "caseId",
        "sessionId",
        "observation",
        "description",
        "statement",
        "note",
        "notes",
        "observedAt",
        "recordedAt",
        "capturedAt",
        "findingId",
        "defectId",
        "evidenceId",
        "evidence",
        "photoId",
        "photo",
        "measurementId",
        "measurement",
        "questionId",
        "answer",
        "response",
        "status",
        "observationType",
        "condition",
        "severity",
        "certainty",
        "confidence",
        "source",
        "origin",
        "author",
        "inspector",
        "diagnosis",
        "cause",
        "recommendation",
        "risk",
        "probability",
        "consequence",
        "cost",
        "capex",
        "priority",
        "unknownField"
    ].forEach((field) => rejectsCreate({ ...VALID_INPUT, [field]: "unsupported" }));
});

test("keeps observations isolated from catalog evidence and finding semantics", () => {
    const result = InspectionObservationDomainModel.createObservation(VALID_INPUT);

    [
        "inspectionArea",
        "questionId",
        "answer",
        "evidenceId",
        "findingId",
        "defectId",
        "severity",
        "risk",
        "diagnosis"
    ].forEach((field) => assert.equal(field in result, false));
});

test("rejects primitive function array and custom-prototype roots", () => {
    [null, undefined, [], "observation", 1, true, 1n, Symbol("observation"), () => {}]
        .forEach((value) => rejectsCreate(value));
    rejectsCreate(Object.assign(Object.create({ inherited: true }), VALID_INPUT));
});

test("accepts a null-prototype root", () => {
    const input = Object.assign(Object.create(null), VALID_INPUT);

    assert.deepEqual(InspectionObservationDomainModel.createObservation(input), {
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
    Object.defineProperty(accessor, "observationId", {
        enumerable: true,
        get() {
            getterCalls += 1;
            return "OBSERVATION-001";
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
            ownKeys() { return ["observationId"]; },
            getOwnPropertyDescriptor() { return undefined; }
        })
    ].forEach((value) => rejectsCreate(value));
});

test("rejects an observable descriptor inconsistency", () => {
    let invalidateAreaId = false;
    const proxy = new Proxy({ ...VALID_INPUT }, {
        getOwnPropertyDescriptor(target, key) {
            if (key === "observationId") {
                invalidateAreaId = true;
                return Reflect.getOwnPropertyDescriptor(target, key);
            }

            if (key === "areaId" && invalidateAreaId) {
                return {
                    configurable: true,
                    enumerable: true,
                    get() { return target.areaId; }
                };
            }

            return Reflect.getOwnPropertyDescriptor(target, key);
        }
    });

    rejectsCreate(proxy);
});

test("captures createObservation input exactly once", () => {
    const { proxy, counts } = instrumentRecord({ ...VALID_INPUT });
    const result = InspectionObservationDomainModel.createObservation(proxy);

    assert.deepEqual(result, { version: "1.0", ...VALID_INPUT });
    assertSingleCapture(counts, ["observationId", "areaId", "text", "createdAt"]);
});

test("captures validateObservation input exactly once", () => {
    const canonical = { version: "1.0", ...VALID_INPUT };
    const { proxy, counts } = instrumentRecord(canonical);
    const validation = InspectionObservationDomainModel.validateObservation(proxy);

    assert.deepEqual(validation, { valid: true, errors: [] });
    assertSingleCapture(counts, ["version", "observationId", "areaId", "text", "createdAt"]);
});

test("accepts a fully transparent proxy as the observable record boundary", () => {
    const target = { ...VALID_INPUT, hiddenTargetField: "not observable" };
    const proxy = new Proxy(target, {
        ownKeys() { return Object.keys(VALID_INPUT); },
        getOwnPropertyDescriptor(value, key) {
            return Reflect.getOwnPropertyDescriptor(value, key);
        }
    });

    assert.deepEqual(InspectionObservationDomainModel.createObservation(proxy), {
        version: "1.0",
        ...VALID_INPUT
    });
});

test("createObservation does not mutate freeze or retain input", () => {
    const input = { ...VALID_INPUT };
    const before = structuredClone(input);
    const result = InspectionObservationDomainModel.createObservation(input);

    assert.deepEqual(input, before);
    assert.equal(Object.isFrozen(input), false);
    assert.notEqual(result, input);
    assert.equal(Object.isFrozen(result), true);
});

test("separate calls are deterministic and share no root reference", () => {
    const first = InspectionObservationDomainModel.createObservation(VALID_INPUT);
    const second = InspectionObservationDomainModel.createObservation(VALID_INPUT);

    assert.deepEqual(first, second);
    assert.notEqual(first, second);
});

test("validateObservation accepts only the complete canonical contract without mutation", () => {
    const canonical = { version: "1.0", ...VALID_INPUT };
    const before = structuredClone(canonical);
    const validation = InspectionObservationDomainModel.validateObservation(canonical);

    assert.deepEqual(validation, { valid: true, errors: [] });
    assert.equal(Object.isFrozen(validation), true);
    assert.equal(Object.isFrozen(validation.errors), true);
    assert.deepEqual(canonical, before);
    assert.equal(Object.isFrozen(canonical), false);
});

test("validateObservation creates no defaults and rejects contract drift", () => {
    const canonical = { version: "1.0", ...VALID_INPUT };
    const { version, ...withoutVersion } = canonical;

    rejectsOperation(() => InspectionObservationDomainModel.validateObservation(withoutVersion));
    rejectsOperation(() => InspectionObservationDomainModel.validateObservation({
        ...canonical,
        version: "2.0"
    }));
    rejectsOperation(() => InspectionObservationDomainModel.validateObservation({
        ...canonical,
        status: "RECORDED"
    }));
});

test("production source has no forbidden dependencies generators or semantic coupling", () => {
    const source = fs.readFileSync(
        new URL("../portal/core/InspectionObservationDomainModel.js", import.meta.url),
        "utf8"
    );
    const forbidden = [
        "InspectionAreaDomainModel",
        "InspectionSessionDomainModel",
        "InspectionCaseDomainModel",
        "InspectionManager",
        "InspectionContext",
        "InspectionScopeManager",
        "AdaptiveInspectionSessionSandbox",
        "QuestionCatalogManager",
        "EvidenceManager",
        "EvidenceToFindingDraftBuilder",
        "FindingManager",
        "FindingGenerationEngine",
        "DamageHypothesisEngine",
        "HumanReviewDomainModel",
        "StorageManager",
        "localStorage",
        "EventBus",
        "ExpertIntelligence",
        "Reporting",
        "ReportContentDigest",
        "Export",
        "Risk",
        "Runtime",
        "Workflow",
        "inspectionArea",
        "questionId",
        "evidenceId",
        "findingId",
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

console.log(`Inspection Observation Domain Model: ${passed}/${passed} groups passed.`);
