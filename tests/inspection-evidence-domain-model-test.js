import assert from "node:assert/strict";
import fs from "node:fs";
import InspectionEvidenceDomainModel, * as InspectionEvidenceModule from "../portal/core/InspectionEvidenceDomainModel.js";

const EXPECTED_ERROR = "InspectionEvidenceDomainModel: invalid Inspection Evidence.";
const VALID_INPUT = Object.freeze({
    evidenceId: "EVIDENCE-001",
    observationId: "OBSERVATION-001",
    reference: "local-capture://inspection-evidence/EVIDENCE-001",
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
        () => InspectionEvidenceDomainModel.createEvidence(value),
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
    const publicMembers = Object.getOwnPropertyNames(InspectionEvidenceDomainModel)
        .filter((name) => !["length", "name", "prototype"].includes(name))
        .sort();

    assert.deepEqual(Object.keys(InspectionEvidenceModule), ["default"]);
    assert.deepEqual(publicMembers, ["VERSION", "createEvidence", "validateEvidence"]);
});

test("VERSION is exactly 1.0", () => {
    assert.equal(InspectionEvidenceDomainModel.VERSION, "1.0");
});

test("creates the exact minimal canonical evidence", () => {
    assert.deepEqual(InspectionEvidenceDomainModel.createEvidence(VALID_INPUT), {
        version: "1.0",
        ...VALID_INPUT
    });
});

test("sets version internally and rejects caller-provided version", () => {
    assert.equal(InspectionEvidenceDomainModel.createEvidence(VALID_INPUT).version, "1.0");
    rejectsCreate({ ...VALID_INPUT, version: "1.0" });
    rejectsCreate({ ...VALID_INPUT, version: "2.0" });
});

test("input key order does not alter the canonical result", () => {
    const reordered = {
        createdAt: VALID_INPUT.createdAt,
        reference: VALID_INPUT.reference,
        observationId: VALID_INPUT.observationId,
        evidenceId: VALID_INPUT.evidenceId
    };

    assert.deepEqual(
        InspectionEvidenceDomainModel.createEvidence(reordered),
        InspectionEvidenceDomainModel.createEvidence(VALID_INPUT)
    );
});

test("allows multiple evidence records to reference the same observation", () => {
    const first = InspectionEvidenceDomainModel.createEvidence(VALID_INPUT);
    const second = InspectionEvidenceDomainModel.createEvidence({
        ...VALID_INPUT,
        evidenceId: "EVIDENCE-002",
        reference: "local-capture://inspection-evidence/EVIDENCE-002"
    });

    assert.equal(first.observationId, second.observationId);
    assert.notEqual(first.evidenceId, second.evidenceId);
    assert.notEqual(first.reference, second.reference);
});

test("requires every input field including reference", () => {
    ["evidenceId", "observationId", "reference", "createdAt"].forEach((field) => {
        const input = { ...VALID_INPUT };
        delete input[field];
        rejectsCreate(input);
    });
});

test("rejects the complete non-string and empty string matrix", () => {
    ["evidenceId", "observationId", "reference"].forEach((field) => {
        [null, 1, true, {}, [], () => {}, undefined, "", "   "]
            .forEach((value) => rejectsCreate({ ...VALID_INPUT, [field]: value }));
    });
});

test("preserves meaningful identifiers and opaque references without normalization", () => {
    const input = {
        ...VALID_INPUT,
        evidenceId: "  Evidence-Mixed_Ä  ",
        observationId: "  Observation-Mixed_Ä  ",
        reference: "  local-capture://Gerät/e\u0301/Foto 001.jpg  "
    };
    const result = InspectionEvidenceDomainModel.createEvidence(input);

    assert.equal(result.evidenceId, input.evidenceId);
    assert.equal(result.observationId, input.observationId);
    assert.equal(result.reference, input.reference);
});

test("preserves opaque local remote external and temporary references", () => {
    [
        "local-capture://inspection-evidence/EVIDENCE-001",
        "offline-temp://ipad/session-001/blob-001",
        "external-document-reference-42",
        "storage-handle-without-storage-semantics",
        "opaque reference with spaces and punctuation !?"
    ].forEach((reference, index) => {
        const result = InspectionEvidenceDomainModel.createEvidence({
            ...VALID_INPUT,
            evidenceId: `EVIDENCE-${index + 1}`,
            reference
        });

        assert.equal(result.reference, reference);
    });
});

test("does not classify content type diagnostic or risk-like keywords", () => {
    const reference = "photo document measurement risk diagnosis severity storageKey url path";
    const result = InspectionEvidenceDomainModel.createEvidence({ ...VALID_INPUT, reference });

    assert.equal(result.reference, reference);
    assert.deepEqual(Object.keys(result), [
        "version",
        "evidenceId",
        "observationId",
        "reference",
        "createdAt"
    ]);
});

test("accepts only canonical real UTC timestamps", () => {
    [
        "2000-02-29T10:00:00.000Z",
        "2024-02-29T10:00:00.000Z",
        "2400-02-29T10:00:00.000Z",
        "2026-04-30T10:00:00.000Z",
        "2026-06-30T10:00:00.000Z",
        "2026-07-24T08:30:00.000Z"
    ].forEach((createdAt) => {
        assert.equal(InspectionEvidenceDomainModel.createEvidence({
            ...VALID_INPUT,
            createdAt
        }).createdAt, createdAt);
    });

    [
        "1900-02-29T10:00:00.000Z",
        "2100-02-29T10:00:00.000Z",
        "2026-02-29T10:00:00.000Z",
        "2026-04-31T10:00:00.000Z",
        "2026-06-31T10:00:00.000Z",
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
        "inspectionEvidenceId",
        "caseId",
        "sessionId",
        "areaId",
        "findingId",
        "questionId",
        "sourceId",
        "attachmentId",
        "captureId",
        "type",
        "evidenceType",
        "evidenceKind",
        "source",
        "evidenceSource",
        "uri",
        "path",
        "url",
        "storageKey",
        "fileName",
        "fileType",
        "mimeType",
        "fileSize",
        "fileSource",
        "captureMethod",
        "capturedAt",
        "recordedAt",
        "observedAt",
        "attachedAt",
        "importedAt",
        "measurementValue",
        "measurementUnit",
        "status",
        "reviewStatus",
        "severity",
        "confidence",
        "risk",
        "recommendation",
        "cost",
        "capex",
        "findingIds",
        "assessmentIds",
        "tags",
        "unknownField"
    ].forEach((field) => rejectsCreate({ ...VALID_INPUT, [field]: "unsupported" }));
});

test("keeps evidence isolated from requirements drafts storage and finding semantics", () => {
    const result = InspectionEvidenceDomainModel.createEvidence(VALID_INPUT);

    [
        "caseId",
        "sessionId",
        "areaId",
        "findingId",
        "questionId",
        "fileReference",
        "storageKey",
        "captureState",
        "draftMode",
        "evidenceRequired",
        "status",
        "severity",
        "risk",
        "diagnosis"
    ].forEach((field) => assert.equal(field in result, false));
});

test("rejects primitive function array and custom-prototype roots", () => {
    [null, undefined, [], "evidence", 1, true, 1n, Symbol("evidence"), () => {}]
        .forEach((value) => rejectsCreate(value));
    rejectsCreate(Object.assign(Object.create({ inherited: true }), VALID_INPUT));
});

test("accepts a null-prototype root", () => {
    const input = Object.assign(Object.create(null), VALID_INPUT);

    assert.deepEqual(InspectionEvidenceDomainModel.createEvidence(input), {
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
    Object.defineProperty(accessor, "evidenceId", {
        enumerable: true,
        get() {
            getterCalls += 1;
            return "EVIDENCE-001";
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
            ownKeys() { return ["evidenceId"]; },
            getOwnPropertyDescriptor() { return undefined; }
        })
    ].forEach((value) => rejectsCreate(value));
});

test("rejects an observable descriptor inconsistency", () => {
    let invalidateObservationId = false;
    const proxy = new Proxy({ ...VALID_INPUT }, {
        getOwnPropertyDescriptor(target, key) {
            if (key === "evidenceId") {
                invalidateObservationId = true;
                return Reflect.getOwnPropertyDescriptor(target, key);
            }

            if (key === "observationId" && invalidateObservationId) {
                return {
                    configurable: true,
                    enumerable: true,
                    get() { return target.observationId; }
                };
            }

            return Reflect.getOwnPropertyDescriptor(target, key);
        }
    });

    rejectsCreate(proxy);
});

test("captures createEvidence input exactly once", () => {
    const { proxy, counts } = instrumentRecord({ ...VALID_INPUT });
    const result = InspectionEvidenceDomainModel.createEvidence(proxy);

    assert.deepEqual(result, { version: "1.0", ...VALID_INPUT });
    assertSingleCapture(counts, ["evidenceId", "observationId", "reference", "createdAt"]);
});

test("captures validateEvidence input exactly once", () => {
    const canonical = { version: "1.0", ...VALID_INPUT };
    const { proxy, counts } = instrumentRecord(canonical);
    const validation = InspectionEvidenceDomainModel.validateEvidence(proxy);

    assert.deepEqual(validation, { valid: true, errors: [] });
    assertSingleCapture(counts, ["version", "evidenceId", "observationId", "reference", "createdAt"]);
});

test("accepts a fully transparent proxy as the observable record boundary", () => {
    const target = { ...VALID_INPUT, hiddenTargetField: "not observable" };
    const proxy = new Proxy(target, {
        ownKeys() { return Object.keys(VALID_INPUT); },
        getOwnPropertyDescriptor(value, key) {
            return Reflect.getOwnPropertyDescriptor(value, key);
        }
    });

    assert.deepEqual(InspectionEvidenceDomainModel.createEvidence(proxy), {
        version: "1.0",
        ...VALID_INPUT
    });
});

test("createEvidence does not mutate freeze or retain input", () => {
    const input = { ...VALID_INPUT };
    const before = structuredClone(input);
    const result = InspectionEvidenceDomainModel.createEvidence(input);

    assert.deepEqual(input, before);
    assert.equal(Object.isFrozen(input), false);
    assert.notEqual(result, input);
    assert.equal(Object.isFrozen(result), true);
});

test("separate calls are deterministic and share no root reference", () => {
    const first = InspectionEvidenceDomainModel.createEvidence(VALID_INPUT);
    const second = InspectionEvidenceDomainModel.createEvidence(VALID_INPUT);

    assert.deepEqual(first, second);
    assert.notEqual(first, second);
});

test("validateEvidence accepts only the complete canonical contract without mutation", () => {
    const canonical = { version: "1.0", ...VALID_INPUT };
    const before = structuredClone(canonical);
    const validation = InspectionEvidenceDomainModel.validateEvidence(canonical);

    assert.deepEqual(validation, { valid: true, errors: [] });
    assert.equal(Object.isFrozen(validation), true);
    assert.equal(Object.isFrozen(validation.errors), true);
    assert.deepEqual(canonical, before);
    assert.equal(Object.isFrozen(canonical), false);
});

test("validateEvidence creates no defaults and rejects contract drift", () => {
    const canonical = { version: "1.0", ...VALID_INPUT };
    const { version, ...withoutVersion } = canonical;

    rejectsOperation(() => InspectionEvidenceDomainModel.validateEvidence(withoutVersion));
    rejectsOperation(() => InspectionEvidenceDomainModel.validateEvidence({
        ...canonical,
        version: "2.0"
    }));
    rejectsOperation(() => InspectionEvidenceDomainModel.validateEvidence({
        ...canonical,
        status: "CAPTURED"
    }));
});

test("production source has no forbidden dependencies generators storage or workflow coupling", () => {
    const source = fs.readFileSync(
        new URL("../portal/core/InspectionEvidenceDomainModel.js", import.meta.url),
        "utf8"
    );
    const forbidden = [
        "InspectionObservationDomainModel",
        "InspectionAreaDomainModel",
        "InspectionSessionDomainModel",
        "InspectionCaseDomainModel",
        "EvidenceManager",
        "EvidenceCaptureDraftSandbox",
        "EvidenceRequirementPreviewEngine",
        "EvidenceToFindingDraftBuilder",
        "FindingManager",
        "FindingGenerationEngine",
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
        "caseId",
        "sessionId",
        "areaId",
        "findingId",
        "questionId",
        "evidenceType",
        "fileReference",
        "storageKey",
        "fileName",
        "measurementValue",
        "status",
        "severity",
        "confidence",
        "crypto"
    ];

    assert.equal(/^\s*import\s/m.test(source), false);
    forbidden.forEach((token) => assert.equal(source.includes(token), false, token));
    assert.equal(/\bDate\b/.test(source), false);
    assert.equal(source.includes("Date.parse"), false);
    assert.equal(/\bnew\s+Date\b/.test(source), false);
    assert.equal(source.includes("Date.now"), false);
    assert.equal(source.includes("Math.random"), false);
    assert.equal(source.includes("JSON.parse"), false);
    assert.equal(source.includes("JSON.stringify"), false);
});

console.log(`Inspection Evidence Domain Model: ${passed}/${passed} groups passed.`);
