import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import FoundationPersistenceBoundary from "../portal/core/FoundationPersistenceBoundary.js";
import InspectionCaseDomainModel from "../portal/core/InspectionCaseDomainModel.js";
import InspectionSessionDomainModel from "../portal/core/InspectionSessionDomainModel.js";
import InspectionAreaDomainModel from "../portal/core/InspectionAreaDomainModel.js";
import InspectionObservationDomainModel from "../portal/core/InspectionObservationDomainModel.js";
import InspectionEvidenceDomainModel from "../portal/core/InspectionEvidenceDomainModel.js";
import InspectionFindingDomainModel from "../portal/core/InspectionFindingDomainModel.js";
import InspectionAssessmentDomainModel from "../portal/core/InspectionAssessmentDomainModel.js";
import InspectionRecommendationDomainModel from "../portal/core/InspectionRecommendationDomainModel.js";
import InspectionDecisionDomainModel from "../portal/core/InspectionDecisionDomainModel.js";
import InspectionReportDomainModel from "../portal/core/InspectionReportDomainModel.js";

const CREATED_AT = "2026-07-26T12:00:00.000Z";
let passed = 0;

function test(name, operation) {
    operation();
    passed += 1;
    console.log(`PASS ${name}`);
}

async function asyncTest(name, operation) {
    await operation();
    passed += 1;
    console.log(`PASS ${name}`);
}

function records() {
    return [
        InspectionCaseDomainModel.createCase({
            caseId: "case-1",
            title: "Case 1",
            inspectionType: "DEFECT_INSPECTION",
            propertyReference: { city: "Berlin", countryCode: "DE" },
            createdAt: CREATED_AT
        }),
        InspectionSessionDomainModel.createSession({
            sessionId: "session-1",
            caseId: "case-1",
            createdAt: CREATED_AT
        }),
        InspectionAreaDomainModel.createArea({
            areaId: "area-1",
            sessionId: "session-1",
            name: "Roof",
            createdAt: CREATED_AT
        }),
        InspectionObservationDomainModel.createObservation({
            observationId: "observation-1",
            areaId: "area-1",
            text: "Visible condition",
            createdAt: CREATED_AT
        }),
        InspectionEvidenceDomainModel.createEvidence({
            evidenceId: "evidence-1",
            observationId: "observation-1",
            reference: "photo-1",
            createdAt: CREATED_AT
        }),
        InspectionFindingDomainModel.createFinding({
            findingId: "finding-1",
            evidenceIds: ["evidence-1", "evidence-2"],
            description: "Finding 1",
            createdAt: CREATED_AT
        }),
        InspectionAssessmentDomainModel.createAssessment({
            assessmentId: "assessment-1",
            findingId: "finding-1",
            assessment: "Assessment 1",
            createdAt: CREATED_AT
        }),
        InspectionRecommendationDomainModel.createRecommendation({
            recommendationId: "recommendation-1",
            assessmentId: "assessment-1",
            recommendation: "Recommendation 1",
            createdAt: CREATED_AT
        }),
        InspectionDecisionDomainModel.createDecision({
            decisionId: "decision-1",
            recommendationId: "recommendation-1",
            decision: "Decision 1",
            createdAt: CREATED_AT
        }),
        InspectionReportDomainModel.createReport({
            reportId: "report-1",
            decisionId: "decision-1",
            report: "Report 1",
            createdAt: CREATED_AT
        })
    ];
}

const TYPES = [
    "InspectionCase",
    "InspectionSession",
    "InspectionArea",
    "InspectionObservation",
    "InspectionEvidence",
    "InspectionFinding",
    "InspectionAssessment",
    "InspectionRecommendation",
    "InspectionDecision",
    "InspectionReport"
];

function envelopes(source = records()) {
    return source.map((record, index) => {
        return FoundationPersistenceBoundary.createEnvelope(TYPES[index], record);
    });
}

function namespace(source = envelopes()) {
    return { foundationRecords: source };
}

function mutable(value) {
    return JSON.parse(JSON.stringify(value));
}

function rejects(operation, code) {
    assert.throws(operation, (error) => {
        assert.equal(error?.name, "FoundationPersistenceError");
        assert.equal(error?.code, code);
        assert.equal(Object.isFrozen(error), true);
        assert.equal(error.index === null || Number.isSafeInteger(error.index), true);
        return true;
    });
}

function assertDeepFrozen(value, seen = new WeakSet()) {
    if (!value || typeof value !== "object" || seen.has(value)) {
        return;
    }
    seen.add(value);
    assert.equal(Object.isFrozen(value), true);
    Reflect.ownKeys(value).forEach((key) => {
        const descriptor = Object.getOwnPropertyDescriptor(value, key);
        if (descriptor && "value" in descriptor) {
            assertDeepFrozen(descriptor.value, seen);
        }
    });
}

test("public API is exact", () => {
    const members = Object.getOwnPropertyNames(FoundationPersistenceBoundary)
        .filter((name) => !["length", "name", "prototype"].includes(name));
    assert.deepEqual(members, ["createEnvelope", "serialize", "deserialize", "rehydrate", "roundtrip"]);
});

test("depends only on the ten released Foundation domain models", () => {
    const source = readFileSync(
        new URL("../portal/core/FoundationPersistenceBoundary.js", import.meta.url),
        "utf8"
    );
    const imports = [...source.matchAll(/^import .* from "([^"]+)";/gm)]
        .map((match) => match[1]);
    assert.equal(imports.length, 11);
    assert.equal(imports.filter((value) => value.startsWith("./Inspection")).every((value) => /^\.\/Inspection(?:Case|Session|Area|Observation|Evidence|Finding|Assessment|Recommendation|Decision|Report)DomainModel\.js$/.test(value)), true);
    assert.equal(imports.filter((value) => value.startsWith("./Inspection")).length, 10);
    assert.equal(imports.includes("node:util"), true);
    [
        "StorageManager", "HumanReviewPersistenceManager", "InspectionContext",
        "PipelineIntegrityValidator", "RuntimeManager", "Workspace", "ReportAssembly"
    ].forEach((token) => assert.equal(source.includes(token), false, token));
});

test("creates exact detached envelopes for all A1 to A10 record types", () => {
    const source = records();
    const created = envelopes(source);

    created.forEach((envelope, index) => {
        const idField = Object.keys(source[index])[1];
        assert.deepEqual(Object.keys(envelope), [
            "envelopeVersion", "storageVersion", "envelopeId", "recordType", "payload"
        ]);
        assert.equal(envelope.envelopeVersion, "1.0");
        assert.equal(envelope.storageVersion, "1.0");
        assert.equal(envelope.recordType, TYPES[index]);
        assert.equal(envelope.envelopeId, JSON.stringify([TYPES[index], source[index][idField]]));
        assert.deepEqual(envelope.payload, source[index]);
        assert.notEqual(envelope.payload, source[index]);
        assertDeepFrozen(envelope);
    });
});

test("preserves canonical payload, nested object and array order", () => {
    const created = envelopes();
    assert.deepEqual(Object.keys(created[0].payload), [
        "version", "caseId", "title", "inspectionType", "propertyReference", "createdAt"
    ]);
    assert.deepEqual(Object.keys(created[0].payload.propertyReference), ["city", "countryCode"]);
    assert.deepEqual(created[5].payload.evidenceIds, ["evidence-1", "evidence-2"]);
});

test("does not mutate envelope inputs", () => {
    const source = records();
    const before = JSON.stringify(source);
    envelopes(source);
    assert.equal(JSON.stringify(source), before);
});

test("rejects transparent proxies at root, record, payload and nested boundaries without mutation", () => {
    const source = mutable(records()[0]);
    const before = JSON.stringify(source);
    rejects(
        () => FoundationPersistenceBoundary.createEnvelope("InspectionCase", new Proxy(source, {})),
        "FOUNDATION_PERSISTENCE_NON_JSON_VALUE"
    );
    assert.equal(JSON.stringify(source), before);

    const trapCounts = { get: 0, getPrototypeOf: 0, ownKeys: 0, getOwnPropertyDescriptor: 0 };
    const instrumented = new Proxy(source, {
        get() { trapCounts.get += 1; throw new Error("get trap must not run"); },
        getPrototypeOf() { trapCounts.getPrototypeOf += 1; throw new Error("prototype trap must not run"); },
        ownKeys() { trapCounts.ownKeys += 1; throw new Error("ownKeys trap must not run"); },
        getOwnPropertyDescriptor() {
            trapCounts.getOwnPropertyDescriptor += 1;
            throw new Error("descriptor trap must not run");
        }
    });
    rejects(
        () => FoundationPersistenceBoundary.createEnvelope("InspectionCase", instrumented),
        "FOUNDATION_PERSISTENCE_NON_JSON_VALUE"
    );
    assert.deepEqual(trapCounts, { get: 0, getPrototypeOf: 0, ownKeys: 0, getOwnPropertyDescriptor: 0 });

    const proxiedReference = new Proxy({ city: "Berlin" }, {});
    rejects(
        () => FoundationPersistenceBoundary.createEnvelope("InspectionCase", {
            ...source,
            propertyReference: proxiedReference
        }),
        "FOUNDATION_PERSISTENCE_NON_JSON_VALUE"
    );

    const finding = mutable(records()[5]);
    finding.evidenceIds = new Proxy(finding.evidenceIds, {});
    rejects(
        () => FoundationPersistenceBoundary.createEnvelope("InspectionFinding", finding),
        "FOUNDATION_PERSISTENCE_NON_JSON_VALUE"
    );

    const root = new Proxy(namespace(), {});
    rejects(
        () => FoundationPersistenceBoundary.serialize(root),
        "FOUNDATION_PERSISTENCE_ROOT_INVALID"
    );

    const serializable = mutable(namespace());
    serializable.foundationRecords[0].payload = new Proxy(serializable.foundationRecords[0].payload, {});
    rejects(
        () => FoundationPersistenceBoundary.serialize(serializable),
        "FOUNDATION_PERSISTENCE_NON_JSON_VALUE"
    );

    const technical = mutable(namespace());
    technical.foundationRecords[0] = new Proxy(technical.foundationRecords[0], {});
    rejects(
        () => FoundationPersistenceBoundary.rehydrate(technical),
        "FOUNDATION_PERSISTENCE_NON_JSON_VALUE"
    );

    const list = records();
    list[9] = new Proxy(list[9], {});
    rejects(
        () => FoundationPersistenceBoundary.roundtrip(list),
        "FOUNDATION_PERSISTENCE_NON_JSON_VALUE"
    );
});

test("serializes the exact namespace deterministically", () => {
    const root = namespace();
    const before = JSON.stringify(root);
    const first = FoundationPersistenceBoundary.serialize(root);
    const second = FoundationPersistenceBoundary.serialize(root);
    assert.equal(first, second);
    assert.equal(first, before);
    assert.equal(JSON.stringify(root), before);
});

test("deserializes to detached deeply frozen technical envelopes", () => {
    const serialized = FoundationPersistenceBoundary.serialize(namespace());
    const first = FoundationPersistenceBoundary.deserialize(serialized);
    const second = FoundationPersistenceBoundary.deserialize(serialized);
    assert.deepEqual(first, second);
    assert.notEqual(first, second);
    assert.notEqual(first.foundationRecords, second.foundationRecords);
    assertDeepFrozen(first);
});

test("rehydrates all records through detached immutable results", () => {
    const technical = FoundationPersistenceBoundary.deserialize(
        FoundationPersistenceBoundary.serialize(namespace())
    );
    const result = FoundationPersistenceBoundary.rehydrate(technical);
    const source = records();
    assert.deepEqual(result, source);
    result.forEach((record, index) => assert.notEqual(record, technical.foundationRecords[index].payload));
    assertDeepFrozen(result);
});

test("roundtrips all A1 to A10 records canonically with new identities", () => {
    const source = records();
    const result = FoundationPersistenceBoundary.roundtrip(source);
    assert.deepEqual(result, source);
    result.forEach((record, index) => assert.notEqual(record, source[index]));
    assertDeepFrozen(result);
});

test("roundtrip invokes every required public boundary operation", () => {
    const methods = ["createEnvelope", "serialize", "deserialize", "rehydrate"];
    const originals = new Map(methods.map((method) => [method, FoundationPersistenceBoundary[method]]));
    const calls = Object.fromEntries(methods.map((method) => [method, 0]));

    try {
        methods.forEach((method) => {
            FoundationPersistenceBoundary[method] = function (...args) {
                calls[method] += 1;
                return originals.get(method).apply(this, args);
            };
        });
        FoundationPersistenceBoundary.roundtrip(records());
    } finally {
        methods.forEach((method) => { FoundationPersistenceBoundary[method] = originals.get(method); });
    }

    assert.deepEqual(calls, { createEnvelope: 10, serialize: 1, deserialize: 1, rehydrate: 1 });
});

test("rejects invalid roots and missing namespace", () => {
    [null, undefined, [], {}, "root", 1, true].forEach((value) => {
        rejects(() => FoundationPersistenceBoundary.serialize(value), "FOUNDATION_PERSISTENCE_ROOT_INVALID");
    });
    rejects(
        () => FoundationPersistenceBoundary.serialize({ foundationRecords: [], extra: true }),
        "FOUNDATION_PERSISTENCE_ROOT_INVALID"
    );
});

test("deserialize accepts only non-empty JSON strings", () => {
    [null, undefined, {}, [], Buffer.from("{}"), 1, true, "", "   "].forEach((value) => {
        rejects(() => FoundationPersistenceBoundary.deserialize(value), "FOUNDATION_PERSISTENCE_INPUT_INVALID");
    });
    rejects(() => FoundationPersistenceBoundary.deserialize("{"), "FOUNDATION_PERSISTENCE_JSON_INVALID");
});

test("rejects unknown record types", () => {
    rejects(
        () => FoundationPersistenceBoundary.createEnvelope("Unknown", records()[0]),
        "FOUNDATION_PERSISTENCE_RECORD_TYPE_UNSUPPORTED"
    );
    const root = mutable(namespace());
    root.foundationRecords[0].recordType = "Unknown";
    rejects(() => FoundationPersistenceBoundary.serialize(root), "FOUNDATION_PERSISTENCE_RECORD_TYPE_UNSUPPORTED");
});

test("rejects unsupported envelope, storage and payload versions", () => {
    const envelopeVersion = mutable(namespace());
    envelopeVersion.foundationRecords[0].envelopeVersion = "2.0";
    rejects(() => FoundationPersistenceBoundary.serialize(envelopeVersion), "FOUNDATION_PERSISTENCE_ENVELOPE_VERSION_UNSUPPORTED");

    const storageVersion = mutable(namespace());
    storageVersion.foundationRecords[0].storageVersion = "2.0";
    rejects(() => FoundationPersistenceBoundary.serialize(storageVersion), "FOUNDATION_PERSISTENCE_STORAGE_VERSION_UNSUPPORTED");

    const payloadVersion = mutable(namespace());
    payloadVersion.foundationRecords[0].payload.version = "2.0";
    rejects(() => FoundationPersistenceBoundary.serialize(payloadVersion), "FOUNDATION_PERSISTENCE_PAYLOAD_INVALID");
});

test("rejects unknown, missing and reordered envelope fields", () => {
    const unknown = mutable(namespace());
    unknown.foundationRecords[0].extra = true;
    rejects(() => FoundationPersistenceBoundary.serialize(unknown), "FOUNDATION_PERSISTENCE_ENVELOPE_INVALID");

    const missing = mutable(namespace());
    delete missing.foundationRecords[0].storageVersion;
    rejects(() => FoundationPersistenceBoundary.serialize(missing), "FOUNDATION_PERSISTENCE_ENVELOPE_INVALID");

    const source = mutable(namespace()).foundationRecords[0];
    const reordered = {
        storageVersion: source.storageVersion,
        envelopeVersion: source.envelopeVersion,
        envelopeId: source.envelopeId,
        recordType: source.recordType,
        payload: source.payload
    };
    rejects(() => FoundationPersistenceBoundary.serialize(namespace([reordered])), "FOUNDATION_PERSISTENCE_ENVELOPE_INVALID");
});

test("rejects unknown, missing and reordered payload fields", () => {
    const unknown = mutable(namespace());
    unknown.foundationRecords[0].payload.extra = true;
    rejects(() => FoundationPersistenceBoundary.serialize(unknown), "FOUNDATION_PERSISTENCE_PAYLOAD_INVALID");

    const missing = mutable(namespace());
    delete missing.foundationRecords[0].payload.title;
    rejects(() => FoundationPersistenceBoundary.serialize(missing), "FOUNDATION_PERSISTENCE_PAYLOAD_INVALID");

    const source = mutable(namespace()).foundationRecords[1];
    source.payload = {
        sessionId: source.payload.sessionId,
        version: source.payload.version,
        caseId: source.payload.caseId,
        createdAt: source.payload.createdAt
    };
    rejects(() => FoundationPersistenceBoundary.serialize(namespace([source])), "FOUNDATION_PERSISTENCE_REHYDRATION_FAILED");
});

test("rejects an envelope ID mismatch", () => {
    const root = mutable(namespace());
    root.foundationRecords[0].envelopeId = "manual-id";
    rejects(() => FoundationPersistenceBoundary.serialize(root), "FOUNDATION_PERSISTENCE_ENVELOPE_ID_MISMATCH");
});

test("rejects missing, empty and incorrectly typed canonical IDs and envelope IDs", () => {
    const source = mutable(records()[0]);
    delete source.caseId;
    rejects(
        () => FoundationPersistenceBoundary.createEnvelope("InspectionCase", source),
        "FOUNDATION_PERSISTENCE_PAYLOAD_INVALID"
    );
    rejects(
        () => FoundationPersistenceBoundary.createEnvelope("InspectionCase", { ...records()[0], caseId: "" }),
        "FOUNDATION_PERSISTENCE_PAYLOAD_INVALID"
    );
    rejects(
        () => FoundationPersistenceBoundary.createEnvelope("InspectionCase", { ...records()[0], caseId: 1 }),
        "FOUNDATION_PERSISTENCE_PAYLOAD_INVALID"
    );

    const root = mutable(namespace());
    root.foundationRecords[0].envelopeId = 1;
    rejects(
        () => FoundationPersistenceBoundary.serialize(root),
        "FOUNDATION_PERSISTENCE_ENVELOPE_ID_MISMATCH"
    );

    const contradiction = mutable(namespace());
    contradiction.foundationRecords[0].payload.caseId = "different-case";
    rejects(
        () => FoundationPersistenceBoundary.serialize(contradiction),
        "FOUNDATION_PERSISTENCE_ENVELOPE_ID_MISMATCH"
    );
});

test("rejects duplicate envelopes, records and payloads", () => {
    const first = mutable(envelopes()[0]);
    rejects(
        () => FoundationPersistenceBoundary.serialize(namespace([first, mutable(first)])),
        "FOUNDATION_PERSISTENCE_DUPLICATE_ENVELOPE"
    );

    const conflicting = mutable(first);
    conflicting.envelopeId = first.envelopeId;
    conflicting.payload.title = "Conflicting title";
    rejects(
        () => FoundationPersistenceBoundary.serialize(namespace([first, conflicting])),
        "FOUNDATION_PERSISTENCE_DUPLICATE_RECORD"
    );

    const differentTypes = records();
    const caseRecord = InspectionCaseDomainModel.createCase({
        caseId: "shared-id",
        title: "Shared",
        inspectionType: "OTHER",
        createdAt: CREATED_AT
    });
    const sessionRecord = InspectionSessionDomainModel.createSession({
        sessionId: "shared-id",
        caseId: differentTypes[0].caseId,
        createdAt: CREATED_AT
    });
    assert.doesNotThrow(() => FoundationPersistenceBoundary.serialize(namespace([
        FoundationPersistenceBoundary.createEnvelope("InspectionCase", caseRecord),
        FoundationPersistenceBoundary.createEnvelope("InspectionSession", sessionRecord)
    ])));
});

test("rejects an identical payload as a duplicate envelope", () => {
    const first = mutable(envelopes()[0]);
    rejects(
        () => FoundationPersistenceBoundary.serialize(namespace([first, mutable(first)])),
        "FOUNDATION_PERSISTENCE_DUPLICATE_ENVELOPE"
    );
});

test("rejects a different payload for the same record type and ID", () => {
    const first = mutable(envelopes()[0]);
    const conflicting = mutable(first);
    conflicting.payload.title = "Different title";
    rejects(
        () => FoundationPersistenceBoundary.serialize(namespace([first, conflicting])),
        "FOUNDATION_PERSISTENCE_DUPLICATE_RECORD"
    );
});

test("rejects envelope-ID collisions before duplicate processing", () => {
    const source = mutable(envelopes());
    source[1].envelopeId = source[0].envelopeId;
    rejects(
        () => FoundationPersistenceBoundary.serialize(namespace([source[0], source[1]])),
        "FOUNDATION_PERSISTENCE_ENVELOPE_ID_MISMATCH"
    );
});

test("rejects non-JSON primitive values at every relevant boundary", () => {
    [undefined, 1n, Symbol("value"), () => true, NaN, Infinity, -Infinity].forEach((value) => {
        const record = { ...records()[0], title: value };
        rejects(() => FoundationPersistenceBoundary.createEnvelope("InspectionCase", record), "FOUNDATION_PERSISTENCE_NON_JSON_VALUE");
    });
});

test("rejects cyclic data", () => {
    const record = { ...records()[0] };
    record.self = record;
    rejects(() => FoundationPersistenceBoundary.createEnvelope("InspectionCase", record), "FOUNDATION_PERSISTENCE_NON_JSON_VALUE");
});

test("rejects symbol, accessor and non-enumerable properties", () => {
    const symbolRecord = { ...records()[0] };
    symbolRecord[Symbol("hidden")] = true;
    rejects(() => FoundationPersistenceBoundary.createEnvelope("InspectionCase", symbolRecord), "FOUNDATION_PERSISTENCE_NON_JSON_VALUE");

    const accessorRecord = { ...records()[0] };
    Object.defineProperty(accessorRecord, "title", { get: () => "Title", enumerable: true });
    rejects(() => FoundationPersistenceBoundary.createEnvelope("InspectionCase", accessorRecord), "FOUNDATION_PERSISTENCE_NON_JSON_VALUE");

    const hiddenRecord = { ...records()[0] };
    Object.defineProperty(hiddenRecord, "hidden", { value: true, enumerable: false });
    rejects(() => FoundationPersistenceBoundary.createEnvelope("InspectionCase", hiddenRecord), "FOUNDATION_PERSISTENCE_NON_JSON_VALUE");
});

test("rejects unsupported object prototypes and sparse or extended arrays", () => {
    const dateRecord = { ...records()[0], title: new Date() };
    rejects(() => FoundationPersistenceBoundary.createEnvelope("InspectionCase", dateRecord), "FOUNDATION_PERSISTENCE_NON_JSON_VALUE");

    const root = mutable(namespace());
    root.foundationRecords.extra = true;
    rejects(() => FoundationPersistenceBoundary.serialize(root), "FOUNDATION_PERSISTENCE_NON_JSON_VALUE");

    const sparse = [];
    sparse.length = 1;
    rejects(() => FoundationPersistenceBoundary.roundtrip(sparse), "FOUNDATION_PERSISTENCE_NON_JSON_VALUE");
});

test("rejects Map, Set, Promise and foreign class instances separately", () => {
    class ForeignRecord {}

    [new Map(), new Set(), Promise.resolve(), new ForeignRecord()].forEach((value) => {
        rejects(
            () => FoundationPersistenceBoundary.createEnvelope("InspectionCase", {
                ...records()[0],
                title: value
            }),
            "FOUNDATION_PERSISTENCE_NON_JSON_VALUE"
        );
    });
});

test("preserves optional propertyReference presence and absence exactly", () => {
    const withoutOptional = InspectionCaseDomainModel.createCase({
        caseId: "case-without-property",
        title: "Without property reference",
        inspectionType: "OTHER",
        createdAt: CREATED_AT
    });
    const withOptional = records()[0];
    const restored = FoundationPersistenceBoundary.rehydrate(namespace([
        FoundationPersistenceBoundary.createEnvelope("InspectionCase", withoutOptional),
        FoundationPersistenceBoundary.createEnvelope("InspectionCase", withOptional)
    ]));

    assert.equal(Object.hasOwn(restored[0], "propertyReference"), false);
    assert.deepEqual(Object.keys(restored[0]), [
        "version", "caseId", "title", "inspectionType", "createdAt"
    ]);
    assert.equal(Object.hasOwn(restored[1], "propertyReference"), true);
    assert.deepEqual(restored[1].propertyReference, withOptional.propertyReference);
});

test("fails atomically without returning valid prefixes", () => {
    const root = mutable(namespace());
    root.foundationRecords[9].payload.report = "";
    rejects(() => FoundationPersistenceBoundary.rehydrate(root), "FOUNDATION_PERSISTENCE_PAYLOAD_INVALID");
});

test("detects array and envelope-order roundtrip mismatches", () => {
    const originalDeserialize = FoundationPersistenceBoundary.deserialize;
    try {
        FoundationPersistenceBoundary.deserialize = function (serialized) {
            const value = mutable(originalDeserialize.call(this, serialized));
            value.foundationRecords.reverse();
            return originalDeserialize.call(this, JSON.stringify(value));
        };
        rejects(() => FoundationPersistenceBoundary.roundtrip(records()), "FOUNDATION_PERSISTENCE_ROUNDTRIP_MISMATCH");
    } finally {
        FoundationPersistenceBoundary.deserialize = originalDeserialize;
    }

    const originalRehydrate = FoundationPersistenceBoundary.rehydrate;
    try {
        FoundationPersistenceBoundary.rehydrate = function (root) {
            const value = mutable(originalRehydrate.call(this, root));
            value[5].evidenceIds.reverse();
            return value;
        };
        rejects(() => FoundationPersistenceBoundary.roundtrip(records()), "FOUNDATION_PERSISTENCE_ROUNDTRIP_MISMATCH");
    } finally {
        FoundationPersistenceBoundary.rehydrate = originalRehydrate;
    }
});

test("detects a payload-field-order roundtrip mismatch", () => {
    const originalRehydrate = FoundationPersistenceBoundary.rehydrate;
    try {
        FoundationPersistenceBoundary.rehydrate = function (root) {
            const value = mutable(originalRehydrate.call(this, root));
            const source = value[1];
            value[1] = {
                sessionId: source.sessionId,
                version: source.version,
                caseId: source.caseId,
                createdAt: source.createdAt
            };
            return value;
        };
        rejects(() => FoundationPersistenceBoundary.roundtrip(records()), "FOUNDATION_PERSISTENCE_ROUNDTRIP_MISMATCH");
    } finally {
        FoundationPersistenceBoundary.rehydrate = originalRehydrate;
    }
});

test("rejects identical record object identities during roundtrip comparison", () => {
    const originalCreateEnvelope = FoundationPersistenceBoundary.createEnvelope;
    const originalRehydrate = FoundationPersistenceBoundary.rehydrate;
    const capturedRecords = [];

    try {
        FoundationPersistenceBoundary.createEnvelope = function (recordType, record) {
            capturedRecords.push(record);
            return originalCreateEnvelope.call(this, recordType, record);
        };
        FoundationPersistenceBoundary.rehydrate = function () {
            return Object.freeze([...capturedRecords]);
        };
        rejects(
            () => FoundationPersistenceBoundary.roundtrip(records()),
            "FOUNDATION_PERSISTENCE_ROUNDTRIP_MISMATCH"
        );
    } finally {
        FoundationPersistenceBoundary.createEnvelope = originalCreateEnvelope;
        FoundationPersistenceBoundary.rehydrate = originalRehydrate;
    }
});

test("rejects added, lost and optional fields during roundtrip comparison", () => {
    const mutations = [
        (record) => { record.extra = true; },
        (record) => { delete record.title; },
        (record) => { delete record.propertyReference; }
    ];

    mutations.forEach((mutate) => {
        const originalRehydrate = FoundationPersistenceBoundary.rehydrate;
        try {
            FoundationPersistenceBoundary.rehydrate = function (root) {
                const value = mutable(originalRehydrate.call(this, root));
                mutate(value[0]);
                return value;
            };
            rejects(
                () => FoundationPersistenceBoundary.roundtrip(records()),
                "FOUNDATION_PERSISTENCE_ROUNDTRIP_MISMATCH"
            );
        } finally {
            FoundationPersistenceBoundary.rehydrate = originalRehydrate;
        }
    });
});

test("does not retain input references or permit mutations", () => {
    const source = records();
    const root = namespace(envelopes(source));
    const technical = FoundationPersistenceBoundary.deserialize(FoundationPersistenceBoundary.serialize(root));
    const restored = FoundationPersistenceBoundary.rehydrate(technical);
    assert.notEqual(technical, root);
    assert.notEqual(technical.foundationRecords, root.foundationRecords);
    assert.notEqual(restored[0], source[0]);
    assert.throws(() => { technical.extra = true; }, TypeError);
    assert.throws(() => { technical.foundationRecords.push(null); }, TypeError);
    assert.throws(() => { technical.foundationRecords[0].recordType = "changed"; }, TypeError);
    assert.throws(() => { technical.foundationRecords[0].payload.caseId = "changed"; }, TypeError);
    assert.throws(() => { technical.foundationRecords[0].payload.propertyReference.city = "changed"; }, TypeError);
    assert.throws(() => { technical.foundationRecords[5].payload.evidenceIds.push("changed"); }, TypeError);
    assert.throws(() => { restored[0].propertyReference.city = "changed"; }, TypeError);
    assert.throws(() => { restored[5].evidenceIds.push("changed"); }, TypeError);
});

await asyncTest("wraps validateX and createX failures fail-closed", async () => {
    const originalValidate = InspectionCaseDomainModel.validateCase;
    let ValidateFailureBoundary;
    try {
        InspectionCaseDomainModel.validateCase = () => { throw new Error("validate failure"); };
        ValidateFailureBoundary = (await import("../portal/core/FoundationPersistenceBoundary.js?validate-failure")).default;
    } finally {
        InspectionCaseDomainModel.validateCase = originalValidate;
    }
    rejects(
        () => ValidateFailureBoundary.serialize(namespace()),
        "FOUNDATION_PERSISTENCE_PAYLOAD_INVALID"
    );

    const originalCreate = InspectionCaseDomainModel.createCase;
    let CreateFailureBoundary;
    try {
        InspectionCaseDomainModel.createCase = () => { throw new Error("create failure"); };
        CreateFailureBoundary = (await import("../portal/core/FoundationPersistenceBoundary.js?create-failure")).default;
    } finally {
        InspectionCaseDomainModel.createCase = originalCreate;
    }
    rejects(
        () => CreateFailureBoundary.serialize(namespace()),
        "FOUNDATION_PERSISTENCE_REHYDRATION_FAILED"
    );
});

test("uses deterministic closed error context", () => {
    let observed;
    try {
        FoundationPersistenceBoundary.serialize({ foundationRecords: [{ bad: true }] });
    } catch (error) {
        observed = error;
    }
    assert.equal(observed.name, "FoundationPersistenceError");
    assert.deepEqual(
        Object.keys(observed),
        ["name", "code", "index", "recordType", "envelopeId", "field"]
    );
    assert.equal(observed.index, 0);
    assert.equal(observed.recordType, null);
    assert.equal(observed.envelopeId, null);
    assert.equal(observed.field, null);
});

console.log(`Foundation Persistence Boundary tests passed: ${passed}`);
