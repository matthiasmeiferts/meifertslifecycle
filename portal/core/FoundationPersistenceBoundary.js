import InspectionCaseDomainModel from "./InspectionCaseDomainModel.js";
import InspectionSessionDomainModel from "./InspectionSessionDomainModel.js";
import InspectionAreaDomainModel from "./InspectionAreaDomainModel.js";
import InspectionObservationDomainModel from "./InspectionObservationDomainModel.js";
import InspectionEvidenceDomainModel from "./InspectionEvidenceDomainModel.js";
import InspectionFindingDomainModel from "./InspectionFindingDomainModel.js";
import InspectionAssessmentDomainModel from "./InspectionAssessmentDomainModel.js";
import InspectionRecommendationDomainModel from "./InspectionRecommendationDomainModel.js";
import InspectionDecisionDomainModel from "./InspectionDecisionDomainModel.js";
import InspectionReportDomainModel from "./InspectionReportDomainModel.js";
import { types } from "node:util";

const ROOT_FIELDS = Object.freeze(["foundationRecords"]);
const ENVELOPE_FIELDS = Object.freeze([
    "envelopeVersion",
    "storageVersion",
    "envelopeId",
    "recordType",
    "payload"
]);
const ENVELOPE_VERSION = "1.0";
const STORAGE_VERSION = "1.0";

const ERROR_CODES = Object.freeze({
    INPUT_INVALID: "FOUNDATION_PERSISTENCE_INPUT_INVALID",
    ROOT_INVALID: "FOUNDATION_PERSISTENCE_ROOT_INVALID",
    JSON_INVALID: "FOUNDATION_PERSISTENCE_JSON_INVALID",
    ENVELOPE_INVALID: "FOUNDATION_PERSISTENCE_ENVELOPE_INVALID",
    ENVELOPE_VERSION_UNSUPPORTED: "FOUNDATION_PERSISTENCE_ENVELOPE_VERSION_UNSUPPORTED",
    STORAGE_VERSION_UNSUPPORTED: "FOUNDATION_PERSISTENCE_STORAGE_VERSION_UNSUPPORTED",
    RECORD_TYPE_UNSUPPORTED: "FOUNDATION_PERSISTENCE_RECORD_TYPE_UNSUPPORTED",
    PAYLOAD_INVALID: "FOUNDATION_PERSISTENCE_PAYLOAD_INVALID",
    ENVELOPE_ID_MISMATCH: "FOUNDATION_PERSISTENCE_ENVELOPE_ID_MISMATCH",
    DUPLICATE_ENVELOPE: "FOUNDATION_PERSISTENCE_DUPLICATE_ENVELOPE",
    DUPLICATE_RECORD: "FOUNDATION_PERSISTENCE_DUPLICATE_RECORD",
    NON_JSON_VALUE: "FOUNDATION_PERSISTENCE_NON_JSON_VALUE",
    REHYDRATION_FAILED: "FOUNDATION_PERSISTENCE_REHYDRATION_FAILED",
    ROUNDTRIP_MISMATCH: "FOUNDATION_PERSISTENCE_ROUNDTRIP_MISMATCH"
});

const REGISTRY = deepFreeze({
    InspectionCase: {
        idField: "caseId",
        validate: InspectionCaseDomainModel.validateCase.bind(InspectionCaseDomainModel),
        create: InspectionCaseDomainModel.createCase.bind(InspectionCaseDomainModel)
    },
    InspectionSession: {
        idField: "sessionId",
        validate: InspectionSessionDomainModel.validateSession.bind(InspectionSessionDomainModel),
        create: InspectionSessionDomainModel.createSession.bind(InspectionSessionDomainModel)
    },
    InspectionArea: {
        idField: "areaId",
        validate: InspectionAreaDomainModel.validateArea.bind(InspectionAreaDomainModel),
        create: InspectionAreaDomainModel.createArea.bind(InspectionAreaDomainModel)
    },
    InspectionObservation: {
        idField: "observationId",
        validate: InspectionObservationDomainModel.validateObservation.bind(InspectionObservationDomainModel),
        create: InspectionObservationDomainModel.createObservation.bind(InspectionObservationDomainModel)
    },
    InspectionEvidence: {
        idField: "evidenceId",
        validate: InspectionEvidenceDomainModel.validateEvidence.bind(InspectionEvidenceDomainModel),
        create: InspectionEvidenceDomainModel.createEvidence.bind(InspectionEvidenceDomainModel)
    },
    InspectionFinding: {
        idField: "findingId",
        validate: InspectionFindingDomainModel.validateFinding.bind(InspectionFindingDomainModel),
        create: InspectionFindingDomainModel.createFinding.bind(InspectionFindingDomainModel)
    },
    InspectionAssessment: {
        idField: "assessmentId",
        validate: InspectionAssessmentDomainModel.validateAssessment.bind(InspectionAssessmentDomainModel),
        create: InspectionAssessmentDomainModel.createAssessment.bind(InspectionAssessmentDomainModel)
    },
    InspectionRecommendation: {
        idField: "recommendationId",
        validate: InspectionRecommendationDomainModel.validateRecommendation.bind(InspectionRecommendationDomainModel),
        create: InspectionRecommendationDomainModel.createRecommendation.bind(InspectionRecommendationDomainModel)
    },
    InspectionDecision: {
        idField: "decisionId",
        validate: InspectionDecisionDomainModel.validateDecision.bind(InspectionDecisionDomainModel),
        create: InspectionDecisionDomainModel.createDecision.bind(InspectionDecisionDomainModel)
    },
    InspectionReport: {
        idField: "reportId",
        validate: InspectionReportDomainModel.validateReport.bind(InspectionReportDomainModel),
        create: InspectionReportDomainModel.createReport.bind(InspectionReportDomainModel)
    }
});

class FoundationPersistenceError extends Error {
    constructor(code, message, context = {}) {
        super(message);
        this.name = "FoundationPersistenceError";
        this.code = code;
        this.index = context.index ?? null;
        this.recordType = context.recordType ?? null;
        this.envelopeId = context.envelopeId ?? null;
        this.field = context.field ?? null;
        Object.freeze(this);
    }
}

export default class FoundationPersistenceBoundary {

    static createEnvelope(recordType, record) {
        const model = requireModel(recordType);
        const payload = captureJsonValue(record, "payload");
        validatePayload(model, payload, { recordType });
        const canonicalId = readOwnDataValue(payload, model.idField);
        const envelope = {
            envelopeVersion: ENVELOPE_VERSION,
            storageVersion: STORAGE_VERSION,
            envelopeId: createEnvelopeId(recordType, canonicalId),
            recordType,
            payload
        };

        return deepFreeze(envelope);
    }

    static serialize(namespace) {
        const captured = captureNamespace(namespace);
        validateNamespace(captured);

        return JSON.stringify(captured);
    }

    static deserialize(serialized) {
        if (typeof serialized !== "string" || serialized.trim().length === 0) {
            fail(ERROR_CODES.INPUT_INVALID, "Foundation persistence input must be a non-empty JSON string.");
        }

        let parsed;

        try {
            parsed = JSON.parse(serialized);
        } catch {
            fail(ERROR_CODES.JSON_INVALID, "Foundation persistence JSON is invalid.");
        }

        const captured = captureNamespace(parsed);
        validateNamespace(captured);

        return captured;
    }

    static rehydrate(namespace) {
        const captured = captureNamespace(namespace);
        validateNamespace(captured);
        const records = captured.foundationRecords.map((envelope, index) => {
            return rehydrateEnvelope(envelope, index);
        });

        return deepFreeze(records);
    }

    static roundtrip(records) {
        const capturedRecords = captureRecordList(records);
        const envelopes = capturedRecords.map((record) => {
            const recordType = identifyRecordType(record);
            return this.createEnvelope(recordType, record);
        });
        const namespace = deepFreeze({ foundationRecords: envelopes });
        const serialized = this.serialize(namespace);
        const deserialized = this.deserialize(serialized);
        const rehydrated = this.rehydrate(deserialized);

        if (!canonicalEqual(capturedRecords, rehydrated, true)) {
            fail(ERROR_CODES.ROUNDTRIP_MISMATCH, "Foundation persistence roundtrip is not canonical.");
        }

        return rehydrated;
    }
}

function requireModel(recordType) {
    if (typeof recordType !== "string" || !Object.hasOwn(REGISTRY, recordType)) {
        fail(ERROR_CODES.RECORD_TYPE_UNSUPPORTED, "Foundation persistence record type is unsupported.", {
            recordType: typeof recordType === "string" ? recordType : null,
            field: "recordType"
        });
    }

    return REGISTRY[recordType];
}

function captureNamespace(value) {
    if (types.isProxy(value) || !isOrdinaryObject(value)) {
        fail(ERROR_CODES.ROOT_INVALID, "Foundation persistence root is invalid.");
    }

    let captured;

    try {
        captured = captureJsonValue(value, "root");
    } catch (error) {
        if (error instanceof FoundationPersistenceError) {
            throw error;
        }
        fail(ERROR_CODES.ROOT_INVALID, "Foundation persistence root is invalid.");
    }

    if (!isOrdinaryObject(captured)
        || !hasExactOrderedFields(captured, ROOT_FIELDS)
        || !Array.isArray(captured.foundationRecords)) {
        fail(ERROR_CODES.ROOT_INVALID, "Foundation persistence root is invalid.");
    }

    return deepFreeze(captured);
}

function captureRecordList(value) {
    const captured = captureJsonValue(value, "records");

    if (!Array.isArray(captured)) {
        fail(ERROR_CODES.INPUT_INVALID, "Foundation persistence roundtrip requires a record array.");
    }

    return deepFreeze(captured);
}

function validateNamespace(namespace) {
    const envelopeIds = new Map();
    const recordKeys = new Set();
    const payloads = new Set();

    namespace.foundationRecords.forEach((envelope, index) => {
        const details = validateEnvelope(envelope, index);

        if (envelopeIds.has(envelope.envelopeId)) {
            const previous = envelopeIds.get(envelope.envelopeId);
            const code = canonicalEqual(previous, envelope, true)
                ? ERROR_CODES.DUPLICATE_ENVELOPE
                : ERROR_CODES.DUPLICATE_RECORD;
            const message = code === ERROR_CODES.DUPLICATE_ENVELOPE
                ? "Foundation persistence envelope is duplicated."
                : "Foundation persistence record conflicts with an existing record.";
            fail(code, message, details);
        }
        envelopeIds.set(envelope.envelopeId, envelope);

        const recordKey = JSON.stringify([envelope.recordType, details.canonicalId]);
        if (recordKeys.has(recordKey)) {
            fail(ERROR_CODES.DUPLICATE_RECORD, "Foundation persistence record is duplicated.", details);
        }
        recordKeys.add(recordKey);

        const payloadKey = JSON.stringify(envelope.payload);
        if (payloads.has(payloadKey)) {
            fail(ERROR_CODES.DUPLICATE_RECORD, "Foundation persistence payload is duplicated.", details);
        }
        payloads.add(payloadKey);
    });
}

function validateEnvelope(envelope, index) {
    const basicContext = {
        index,
        recordType: readOwnDataValue(envelope, "recordType") ?? null,
        envelopeId: readOwnDataValue(envelope, "envelopeId") ?? null
    };

    if (!isOrdinaryObject(envelope) || !hasExactOrderedFields(envelope, ENVELOPE_FIELDS)) {
        fail(ERROR_CODES.ENVELOPE_INVALID, "Foundation persistence envelope is invalid.", basicContext);
    }
    if (envelope.envelopeVersion !== ENVELOPE_VERSION) {
        fail(ERROR_CODES.ENVELOPE_VERSION_UNSUPPORTED, "Foundation persistence envelope version is unsupported.", {
            ...basicContext,
            field: "envelopeVersion"
        });
    }
    if (envelope.storageVersion !== STORAGE_VERSION) {
        fail(ERROR_CODES.STORAGE_VERSION_UNSUPPORTED, "Foundation persistence storage version is unsupported.", {
            ...basicContext,
            field: "storageVersion"
        });
    }

    const model = requireModel(envelope.recordType);
    validatePayload(model, envelope.payload, basicContext);
    const canonicalId = readOwnDataValue(envelope.payload, model.idField);
    const expectedEnvelopeId = createEnvelopeId(envelope.recordType, canonicalId);

    if (envelope.envelopeId !== expectedEnvelopeId) {
        fail(ERROR_CODES.ENVELOPE_ID_MISMATCH, "Foundation persistence envelope ID does not match its payload.", {
            ...basicContext,
            field: "envelopeId"
        });
    }

    const rehydrated = createFromPayload(model, envelope.payload, basicContext);
    if (!canonicalEqual(envelope.payload, rehydrated, true)) {
        fail(ERROR_CODES.REHYDRATION_FAILED, "Foundation persistence payload is not canonical.", basicContext);
    }

    return { ...basicContext, canonicalId };
}

function validatePayload(model, payload, context) {
    if (!isOrdinaryObject(payload)) {
        fail(ERROR_CODES.PAYLOAD_INVALID, "Foundation persistence payload is invalid.", context);
    }

    try {
        model.validate(payload);
    } catch {
        fail(ERROR_CODES.PAYLOAD_INVALID, "Foundation persistence payload is invalid.", context);
    }
}

function rehydrateEnvelope(envelope, index) {
    const context = {
        index,
        recordType: envelope.recordType,
        envelopeId: envelope.envelopeId
    };
    const model = requireModel(envelope.recordType);
    const record = createFromPayload(model, envelope.payload, context);

    if (!canonicalEqual(envelope.payload, record, true)) {
        fail(ERROR_CODES.REHYDRATION_FAILED, "Foundation persistence rehydration is not canonical.", context);
    }

    return record;
}

function createFromPayload(model, payload, context) {
    const creationInput = {};

    Object.keys(payload).forEach((field) => {
        if (field !== "version") {
            Object.defineProperty(creationInput, field, {
                value: cloneCapturedValue(payload[field]),
                enumerable: true,
                writable: true,
                configurable: true
            });
        }
    });

    try {
        return model.create(creationInput);
    } catch {
        fail(ERROR_CODES.REHYDRATION_FAILED, "Foundation persistence rehydration failed.", context);
    }
}

function identifyRecordType(record) {
    const matches = Object.entries(REGISTRY).filter(([, model]) => {
        try {
            model.validate(record);
            return true;
        } catch {
            return false;
        }
    });

    if (matches.length !== 1) {
        fail(ERROR_CODES.PAYLOAD_INVALID, "Foundation persistence record does not identify one supported type.");
    }

    return matches[0][0];
}

function createEnvelopeId(recordType, canonicalId) {
    return JSON.stringify([recordType, canonicalId]);
}

function captureJsonValue(value, field, ancestors = new WeakSet()) {
    if (value === null || typeof value === "string" || typeof value === "boolean") {
        return value;
    }
    if (typeof value === "number") {
        if (!Number.isFinite(value)) {
            fail(ERROR_CODES.NON_JSON_VALUE, "Foundation persistence contains a non-JSON value.", { field });
        }
        return value;
    }
    if (["undefined", "bigint", "symbol", "function"].includes(typeof value)) {
        fail(ERROR_CODES.NON_JSON_VALUE, "Foundation persistence contains a non-JSON value.", { field });
    }
    if (!value || typeof value !== "object") {
        fail(ERROR_CODES.NON_JSON_VALUE, "Foundation persistence contains a non-JSON value.", { field });
    }
    if (types.isProxy(value)) {
        fail(ERROR_CODES.NON_JSON_VALUE, "Foundation persistence contains a proxy value.", { field });
    }
    if (ancestors.has(value)) {
        fail(ERROR_CODES.NON_JSON_VALUE, "Foundation persistence contains cyclic data.", { field });
    }

    ancestors.add(value);
    try {
        if (Array.isArray(value)) {
            if (Object.getPrototypeOf(value) !== Array.prototype) {
                fail(ERROR_CODES.NON_JSON_VALUE, "Foundation persistence contains an unsupported array.", { field });
            }
            const lengthDescriptor = Object.getOwnPropertyDescriptor(value, "length");
            const expectedKeys = new Set(["length"]);
            const length = lengthDescriptor?.value;

            if (!Number.isSafeInteger(length) || length < 0) {
                fail(ERROR_CODES.NON_JSON_VALUE, "Foundation persistence contains an invalid array.", { field });
            }
            for (let index = 0; index < length; index += 1) {
                expectedKeys.add(String(index));
            }
            const keys = Reflect.ownKeys(value);
            if (keys.length !== expectedKeys.size
                || keys.some((key) => typeof key !== "string" || !expectedKeys.has(key))) {
                fail(ERROR_CODES.NON_JSON_VALUE, "Foundation persistence contains unsupported array properties.", { field });
            }

            const clone = [];
            for (let index = 0; index < length; index += 1) {
                const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
                if (!descriptor || descriptor.enumerable !== true || !("value" in descriptor)) {
                    fail(ERROR_CODES.NON_JSON_VALUE, "Foundation persistence contains unsupported array properties.", { field });
                }
                clone.push(captureJsonValue(descriptor.value, `${field}[${index}]`, ancestors));
            }
            return clone;
        }

        if (!isOrdinaryObject(value)) {
            fail(ERROR_CODES.NON_JSON_VALUE, "Foundation persistence contains an unsupported object.", { field });
        }

        const clone = {};
        for (const key of Reflect.ownKeys(value)) {
            if (typeof key !== "string") {
                fail(ERROR_CODES.NON_JSON_VALUE, "Foundation persistence contains a symbol property.", { field });
            }
            const descriptor = Object.getOwnPropertyDescriptor(value, key);
            if (!descriptor || descriptor.enumerable !== true || !("value" in descriptor)) {
                fail(ERROR_CODES.NON_JSON_VALUE, "Foundation persistence contains an unsupported property.", { field: key });
            }
            Object.defineProperty(clone, key, {
                value: captureJsonValue(descriptor.value, key, ancestors),
                enumerable: true,
                writable: true,
                configurable: true
            });
        }
        return clone;
    } catch (error) {
        if (error instanceof FoundationPersistenceError) {
            throw error;
        }
        fail(ERROR_CODES.NON_JSON_VALUE, "Foundation persistence inspection failed.", { field });
    } finally {
        ancestors.delete(value);
    }
}

function canonicalEqual(left, right, requireFrozen = false, seen = new WeakMap()) {
    if (Object.is(left, right)) {
        return !left || typeof left !== "object";
    }
    if (!left || !right || typeof left !== "object" || typeof right !== "object") {
        return false;
    }
    if (Object.getPrototypeOf(left) !== Object.getPrototypeOf(right)) {
        return false;
    }
    if (requireFrozen && (!Object.isFrozen(left) || !Object.isFrozen(right))) {
        return false;
    }
    if (seen.get(left) === right) {
        return true;
    }
    seen.set(left, right);

    const leftKeys = Reflect.ownKeys(left);
    const rightKeys = Reflect.ownKeys(right);
    if (leftKeys.length !== rightKeys.length
        || leftKeys.some((key, index) => key !== rightKeys[index])) {
        return false;
    }

    return leftKeys.every((key) => {
        const leftDescriptor = Object.getOwnPropertyDescriptor(left, key);
        const rightDescriptor = Object.getOwnPropertyDescriptor(right, key);
        if (!leftDescriptor || !rightDescriptor
            || leftDescriptor.enumerable !== rightDescriptor.enumerable
            || leftDescriptor.configurable !== rightDescriptor.configurable
            || ("writable" in leftDescriptor && leftDescriptor.writable !== rightDescriptor.writable)
            || !("value" in leftDescriptor)
            || !("value" in rightDescriptor)) {
            return false;
        }
        return canonicalEqual(leftDescriptor.value, rightDescriptor.value, requireFrozen, seen);
    });
}

function cloneCapturedValue(value) {
    if (!value || typeof value !== "object") {
        return value;
    }
    if (Array.isArray(value)) {
        return value.map((entry) => cloneCapturedValue(entry));
    }

    const clone = {};
    Object.keys(value).forEach((key) => {
        Object.defineProperty(clone, key, {
            value: cloneCapturedValue(value[key]),
            enumerable: true,
            writable: true,
            configurable: true
        });
    });
    return clone;
}

function readOwnDataValue(value, field) {
    if (!value || typeof value !== "object") {
        return undefined;
    }
    const descriptor = Object.getOwnPropertyDescriptor(value, field);
    return descriptor && "value" in descriptor ? descriptor.value : undefined;
}

function hasExactOrderedFields(value, fields) {
    const keys = Reflect.ownKeys(value);
    return keys.length === fields.length && keys.every((key, index) => key === fields[index]);
}

function isOrdinaryObject(value) {
    return Boolean(value)
        && typeof value === "object"
        && !Array.isArray(value)
        && Object.getPrototypeOf(value) === Object.prototype;
}

function deepFreeze(value) {
    if (!value
        || (typeof value !== "object" && typeof value !== "function")
        || Object.isFrozen(value)) {
        return value;
    }
    Reflect.ownKeys(value).forEach((key) => {
        const descriptor = Object.getOwnPropertyDescriptor(value, key);
        if (descriptor && "value" in descriptor) {
            deepFreeze(descriptor.value);
        }
    });
    return Object.freeze(value);
}

function fail(code, message, context = {}) {
    throw new FoundationPersistenceError(code, message, context);
}
