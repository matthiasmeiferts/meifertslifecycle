import assert from "node:assert/strict";
import fs from "node:fs";
import InspectionFindingDomainModel, * as InspectionFindingModule from "../portal/core/InspectionFindingDomainModel.js";

const EXPECTED_ERROR = "InspectionFindingDomainModel: invalid Inspection Finding.";
const VALID_INPUT = Object.freeze({
    findingId: "FINDING-001",
    evidenceIds: Object.freeze(["EVIDENCE-001", "EVIDENCE-002"]),
    description: "Feine Risslinie im untersuchten Wandbereich dokumentiert.",
    createdAt: "2026-07-25T08:30:00.000Z"
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
        () => InspectionFindingDomainModel.createFinding(value),
        (error) => error?.message === EXPECTED_ERROR
    );
}

function rejectsValidation(value) {
    assert.throws(
        () => InspectionFindingDomainModel.validateFinding(value),
        (error) => error?.message === EXPECTED_ERROR
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
            throw new Error("values must come from descriptors");
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
    const publicMembers = Object.getOwnPropertyNames(InspectionFindingDomainModel)
        .filter((name) => !["length", "name", "prototype"].includes(name))
        .sort();

    assert.deepEqual(Object.keys(InspectionFindingModule), ["default"]);
    assert.deepEqual(publicMembers, ["VERSION", "createFinding", "validateFinding"]);
});

test("VERSION is exactly 1.0", () => {
    assert.equal(InspectionFindingDomainModel.VERSION, "1.0");
});

test("creates the exact canonical finding in canonical order", () => {
    const result = InspectionFindingDomainModel.createFinding(VALID_INPUT);

    assert.deepEqual(result, { version: "1.0", ...VALID_INPUT });
    assert.deepEqual(Object.keys(result), [
        "version",
        "findingId",
        "evidenceIds",
        "description",
        "createdAt"
    ]);
});

test("sets version internally and rejects caller-provided version", () => {
    assert.equal(InspectionFindingDomainModel.createFinding(VALID_INPUT).version, "1.0");
    rejectsCreate({ ...VALID_INPUT, version: "1.0" });
    rejectsCreate({ ...VALID_INPUT, version: "2.0" });
});

test("requires every input field", () => {
    ["findingId", "evidenceIds", "description", "createdAt"].forEach((field) => {
        const input = { ...VALID_INPUT };
        delete input[field];
        rejectsCreate(input);
    });
});

test("rejects all excluded and unknown fields", () => {
    [
        "observationId",
        "caseId",
        "sessionId",
        "areaId",
        "title",
        "summary",
        "category",
        "findingType",
        "findingKind",
        "severity",
        "confidence",
        "probability",
        "urgency",
        "priority",
        "status",
        "reviewStatus",
        "expertReviewRequired",
        "generated",
        "generationReason",
        "metadata",
        "assessmentIds",
        "recommendationIds",
        "unknownField"
    ].forEach((field) => rejectsCreate({ ...VALID_INPUT, [field]: "unsupported" }));
});

test("rejects symbol non-enumerable and accessor root fields without getters", () => {
    rejectsCreate({ ...VALID_INPUT, [Symbol("hidden")]: true });

    const nonEnumerable = { ...VALID_INPUT };
    Object.defineProperty(nonEnumerable, "hidden", { value: true });
    rejectsCreate(nonEnumerable);

    let getterCalls = 0;
    const accessor = { ...VALID_INPUT };
    Object.defineProperty(accessor, "description", {
        enumerable: true,
        get() {
            getterCalls += 1;
            return VALID_INPUT.description;
        }
    });
    rejectsCreate(accessor);
    assert.equal(getterCalls, 0);
});

test("rejects invalid root values and unsupported prototypes", () => {
    [null, undefined, [], "finding", 1, true, 1n, Symbol("finding"), () => {}]
        .forEach((value) => rejectsCreate(value));
    rejectsCreate(Object.assign(Object.create({ inherited: true }), VALID_INPUT));
});

test("accepts an ordinary and a null-prototype root", () => {
    const nullPrototype = Object.assign(Object.create(null), VALID_INPUT);
    assert.deepEqual(InspectionFindingDomainModel.createFinding(VALID_INPUT), {
        version: "1.0",
        ...VALID_INPUT
    });
    assert.deepEqual(InspectionFindingDomainModel.createFinding(nullPrototype), {
        version: "1.0",
        ...VALID_INPUT
    });
});

test("findingId and description reject the complete invalid type matrix", () => {
    ["findingId", "description"].forEach((field) => {
        [undefined, null, 1, true, {}, [], () => {}, 1n, Symbol("value"), "", "   "]
            .forEach((value) => rejectsCreate({ ...VALID_INPUT, [field]: value }));
    });
});

test("findingId and description preserve meaningful strings exactly", () => {
    const input = {
        ...VALID_INPUT,
        findingId: "  Finding-MiXeD_Ä e\u0301 ไทย  ",
        description: "  Erste Zeile e\u0301; defect risk severity.\nบรรทัดที่สอง!  "
    };
    const result = InspectionFindingDomainModel.createFinding(input);

    assert.equal(result.findingId, input.findingId);
    assert.equal(result.description, input.description);
});

test("accepts exactly one and multiple ordered evidence identifiers", () => {
    assert.deepEqual(
        InspectionFindingDomainModel.createFinding({ ...VALID_INPUT, evidenceIds: ["E-1"] }).evidenceIds,
        ["E-1"]
    );
    assert.deepEqual(
        InspectionFindingDomainModel.createFinding({
            ...VALID_INPUT,
            evidenceIds: ["E-3", "E-1", "E-2"]
        }).evidenceIds,
        ["E-3", "E-1", "E-2"]
    );
});

test("preserves meaningful evidence identifier strings without normalization", () => {
    const evidenceIds = ["  Evidence-MiXeD_Ä  ", "EVIDENCE-e\u0301-ไทย"];
    const result = InspectionFindingDomainModel.createFinding({ ...VALID_INPUT, evidenceIds });

    assert.deepEqual(result.evidenceIds, evidenceIds);
});

test("rejects missing non-array empty duplicate and invalid evidence identifiers", () => {
    [undefined, null, {}, "E-1", 1, true, () => {}]
        .forEach((evidenceIds) => rejectsCreate({ ...VALID_INPUT, evidenceIds }));
    rejectsCreate({ ...VALID_INPUT, evidenceIds: [] });
    rejectsCreate({ ...VALID_INPUT, evidenceIds: ["E-1", "E-1"] });
    [undefined, null, {}, [], 1, true, 1n, Symbol("id"), () => {}, "", "   "]
        .forEach((value) => rejectsCreate({ ...VALID_INPUT, evidenceIds: ["E-1", value] }));
});

test("rejects sparse evidence arrays", () => {
    const leadingHole = Array(2);
    leadingHole[1] = "E-2";
    rejectsCreate({ ...VALID_INPUT, evidenceIds: leadingHole });

    const middleHole = ["E-1", "E-2", "E-3"];
    delete middleHole[1];
    rejectsCreate({ ...VALID_INPUT, evidenceIds: middleHole });
});

test("rejects custom array prototypes and extra string symbol or non-enumerable properties", () => {
    const customPrototype = ["E-1"];
    Object.setPrototypeOf(customPrototype, Object.create(Array.prototype));
    rejectsCreate({ ...VALID_INPUT, evidenceIds: customPrototype });

    const stringProperty = ["E-1"];
    stringProperty.extra = true;
    rejectsCreate({ ...VALID_INPUT, evidenceIds: stringProperty });

    const symbolProperty = ["E-1"];
    symbolProperty[Symbol("hidden")] = true;
    rejectsCreate({ ...VALID_INPUT, evidenceIds: symbolProperty });

    const hiddenProperty = ["E-1"];
    Object.defineProperty(hiddenProperty, "hidden", { value: true });
    rejectsCreate({ ...VALID_INPUT, evidenceIds: hiddenProperty });
});

test("rejects evidence accessors without executing getters", () => {
    let getterCalls = 0;
    const evidenceIds = ["E-1"];
    Object.defineProperty(evidenceIds, "0", {
        configurable: true,
        enumerable: true,
        get() {
            getterCalls += 1;
            return "E-1";
        }
    });

    rejectsCreate({ ...VALID_INPUT, evidenceIds });
    assert.equal(getterCalls, 0);
});

test("captures the root record exactly once without direct operations", () => {
    const { proxy, counts } = instrumentRecord({ ...VALID_INPUT });
    const result = InspectionFindingDomainModel.createFinding(proxy);

    assert.deepEqual(result, { version: "1.0", ...VALID_INPUT });
    assertSingleCapture(counts, ["findingId", "evidenceIds", "description", "createdAt"]);
});

test("validateFinding captures the canonical root exactly once", () => {
    const canonical = { version: "1.0", ...VALID_INPUT };
    const { proxy, counts } = instrumentRecord(canonical);
    assert.deepEqual(InspectionFindingDomainModel.validateFinding(proxy), { valid: true, errors: [] });
    assertSingleCapture(counts, ["version", "findingId", "evidenceIds", "description", "createdAt"]);
});

test("captures evidence array descriptors exactly once without direct operations", () => {
    const { proxy, counts } = instrumentRecord(["E-2", "E-1"]);
    const result = InspectionFindingDomainModel.createFinding({ ...VALID_INPUT, evidenceIds: proxy });

    assert.deepEqual(result.evidenceIds, ["E-2", "E-1"]);
    assertSingleCapture(counts, ["length", "0", "1"]);
});

test("converts root and evidence proxy failures to the stable domain error", () => {
    ["getPrototypeOf", "ownKeys", "getOwnPropertyDescriptor"].forEach((trap) => {
        rejectsCreate(new Proxy({ ...VALID_INPUT }, {
            [trap]() {
                throw new Error(`root ${trap}`);
            }
        }));
        rejectsCreate({
            ...VALID_INPUT,
            evidenceIds: new Proxy(["E-1"], {
                [trap]() {
                    throw new Error(`array ${trap}`);
                }
            })
        });
    });
});

test("rejects missing or inconsistent descriptors through the stable boundary", () => {
    rejectsCreate(new Proxy({}, {
        ownKeys() {
            return ["findingId"];
        },
        getOwnPropertyDescriptor() {
            return undefined;
        }
    }));

    const evidenceIds = new Proxy(["E-1"], {
        getOwnPropertyDescriptor(target, key) {
            if (key === "0") {
                return undefined;
            }
            return Reflect.getOwnPropertyDescriptor(target, key);
        }
    });
    rejectsCreate({ ...VALID_INPUT, evidenceIds });
});

test("accepts transparent root and evidence proxies by observable record shape", () => {
    const evidenceIds = new Proxy(["E-1", "E-2"], {});
    const root = new Proxy({ ...VALID_INPUT, evidenceIds }, {});

    assert.deepEqual(InspectionFindingDomainModel.createFinding(root), {
        version: "1.0",
        ...VALID_INPUT,
        evidenceIds: ["E-1", "E-2"]
    });
});

test("accepts complete canonical timestamp boundaries", () => {
    [
        "0000-01-01T00:00:00.000Z",
        "0000-02-29T23:59:59.999Z",
        "1904-02-29T08:30:00.000Z",
        "2000-02-29T08:30:00.000Z",
        "2024-02-29T08:30:00.000Z",
        "2400-02-29T08:30:00.000Z",
        "2026-01-31T08:30:00.000Z",
        "2026-04-30T08:30:00.000Z",
        "2026-12-31T23:59:59.999Z"
    ].forEach((createdAt) => {
        assert.equal(
            InspectionFindingDomainModel.createFinding({ ...VALID_INPUT, createdAt }).createdAt,
            createdAt
        );
    });
});

test("rejects impossible calendar timestamps", () => {
    [
        "1900-02-29T08:30:00.000Z",
        "2100-02-29T08:30:00.000Z",
        "2026-02-29T08:30:00.000Z",
        "2026-00-01T08:30:00.000Z",
        "2026-13-01T08:30:00.000Z",
        "2026-01-00T08:30:00.000Z",
        "2026-01-32T08:30:00.000Z",
        "2026-04-31T08:30:00.000Z",
        "2026-06-31T08:30:00.000Z"
    ].forEach((createdAt) => rejectsCreate({ ...VALID_INPUT, createdAt }));
});

test("rejects noncanonical time and precision boundaries", () => {
    [
        "2026-07-25T24:00:00.000Z",
        "2026-07-25T25:00:00.000Z",
        "2026-07-25T08:60:00.000Z",
        "2026-07-25T08:30:60.000Z",
        "2026-07-25T08:30:00Z",
        "2026-07-25T08:30:00.0Z",
        "2026-07-25T08:30:00.00Z",
        "2026-07-25T08:30:00.0000Z",
        "2026-07-25T08:30:00.000",
        "2026-07-25T08:30:00.000z",
        "2026-07-25T10:30:00.000+02:00",
        "2026-07-25 08:30:00.000Z",
        " 2026-07-25T08:30:00.000Z",
        "2026-07-25T08:30:00.000Z "
    ].forEach((createdAt) => rejectsCreate({ ...VALID_INPUT, createdAt }));
});

test("rejects non-string timestamp values", () => {
    [undefined, null, 1, true, {}, [], () => {}, 1n]
        .forEach((createdAt) => rejectsCreate({ ...VALID_INPUT, createdAt }));
});

test("createFinding preserves input and returns detached deeply frozen output", () => {
    const input = {
        findingId: VALID_INPUT.findingId,
        evidenceIds: [...VALID_INPUT.evidenceIds],
        description: VALID_INPUT.description,
        createdAt: VALID_INPUT.createdAt
    };
    const before = structuredClone(input);
    const result = InspectionFindingDomainModel.createFinding(input);

    assert.deepEqual(input, before);
    assert.equal(Object.isFrozen(input), false);
    assert.equal(Object.isFrozen(input.evidenceIds), false);
    assert.equal(Object.isFrozen(result), true);
    assert.equal(Object.isFrozen(result.evidenceIds), true);
    assert.notEqual(result, input);
    assert.notEqual(result.evidenceIds, input.evidenceIds);
});

test("separate calls remain deterministic and share no references", () => {
    const first = InspectionFindingDomainModel.createFinding(VALID_INPUT);
    const second = InspectionFindingDomainModel.createFinding(VALID_INPUT);

    assert.deepEqual(first, second);
    assert.notEqual(first, second);
    assert.notEqual(first.evidenceIds, second.evidenceIds);
});

test("validateFinding accepts only a complete canonical finding without mutation", () => {
    const canonical = {
        version: "1.0",
        findingId: VALID_INPUT.findingId,
        evidenceIds: [...VALID_INPUT.evidenceIds],
        description: VALID_INPUT.description,
        createdAt: VALID_INPUT.createdAt
    };
    const before = structuredClone(canonical);
    const validation = InspectionFindingDomainModel.validateFinding(canonical);

    assert.deepEqual(validation, { valid: true, errors: [] });
    assert.equal(Object.isFrozen(validation), true);
    assert.equal(Object.isFrozen(validation.errors), true);
    assert.deepEqual(canonical, before);
    assert.equal(Object.isFrozen(canonical), false);
    assert.equal(Object.isFrozen(canonical.evidenceIds), false);
});

test("validateFinding creates no defaults and rejects contract drift", () => {
    const canonical = { version: "1.0", ...VALID_INPUT };
    const { version, ...withoutVersion } = canonical;

    rejectsValidation(withoutVersion);
    rejectsValidation({ ...canonical, version: "2.0" });
    rejectsValidation({ ...canonical, status: "CONFIRMED" });
    rejectsValidation({ ...canonical, evidenceIds: [] });
    rejectsValidation({ ...canonical, evidenceIds: ["E-1", "E-1"] });
});

test("production source has no forbidden dependencies or mechanisms", () => {
    const source = fs.readFileSync(
        new URL("../portal/core/InspectionFindingDomainModel.js", import.meta.url),
        "utf8"
    );
    const forbidden = [
        "InspectionCaseDomainModel",
        "InspectionSessionDomainModel",
        "InspectionAreaDomainModel",
        "InspectionObservationDomainModel",
        "InspectionEvidenceDomainModel",
        "FindingManager",
        "FindingGenerationEngine",
        "EvidenceToFindingDraftBuilder",
        "FindingDraftPreviewSandbox",
        "CanonicalDataModel",
        "StorageManager",
        "localStorage",
        "sessionStorage",
        "EventBus",
        "Runtime",
        "Workflow",
        "Report",
        "Export",
        "Assessment",
        "Recommendation",
        "Decision",
        "ExpertIntelligence",
        "KnowledgeProvider",
        "Date",
        "Temporal",
        "Intl",
        "Math.random",
        "crypto",
        "Crypto",
        "JSON.parse",
        "JSON.stringify",
        "structuredClone"
    ];

    assert.equal(/^\s*import\s/m.test(source), false);
    forbidden.forEach((token) => assert.equal(source.includes(token), false, token));
});

console.log(`Inspection Finding Domain Model: ${passed}/${passed} groups passed.`);
