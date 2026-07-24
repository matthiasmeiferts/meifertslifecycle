const VERSION = "1.0";
const DOMAIN_ERROR = "InspectionSessionDomainModel: invalid Inspection Session.";

const SESSION_FIELDS = Object.freeze([
    "version",
    "sessionId",
    "caseId",
    "createdAt"
]);

export default class InspectionSessionDomainModel {

    static get VERSION() {
        return VERSION;
    }

    static createSession(input) {
        return domainBoundary(() => {
            const source = captureRecord(input, "session input");
            assertExactFields(source, SESSION_FIELDS.filter((field) => field !== "version"));
            assertRequiredFields(source, ["sessionId", "caseId", "createdAt"]);

            return deepFreeze({
                version: VERSION,
                sessionId: requireMeaningfulString(source.sessionId, "sessionId"),
                caseId: requireMeaningfulString(source.caseId, "caseId"),
                createdAt: requireTimestamp(source.createdAt)
            });
        });
    }

    static validateSession(value) {
        return domainBoundary(() => {
            const record = captureRecord(value, "session");
            validateCapturedSession(record);

            return deepFreeze({
                valid: true,
                errors: []
            });
        });
    }
}

function validateCapturedSession(record) {
    assertExactFields(record, SESSION_FIELDS);
    assertRequiredFields(record, SESSION_FIELDS);

    if (record.version !== VERSION) {
        fail("version must be 1.0");
    }

    requireMeaningfulString(record.sessionId, "sessionId");
    requireMeaningfulString(record.caseId, "caseId");
    requireTimestamp(record.createdAt);
}

function captureRecord(value, field) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        fail(`${field} must be a record object`);
    }

    const prototype = Object.getPrototypeOf(value);

    if (prototype !== Object.prototype && prototype !== null) {
        fail(`${field} has an unsupported prototype`);
    }

    const keys = Reflect.ownKeys(value);
    const snapshot = Object.create(null);

    keys.forEach((key) => {
        if (typeof key !== "string") {
            fail(`${field} contains a non-string key`);
        }

        const descriptor = Object.getOwnPropertyDescriptor(value, key);

        if (!descriptor || descriptor.enumerable !== true || !("value" in descriptor)) {
            fail(`${field} contains an unsupported property`);
        }

        snapshot[key] = descriptor.value;
    });

    return snapshot;
}

function assertExactFields(record, permittedFields) {
    const permitted = new Set(permittedFields);

    Object.keys(record).forEach((key) => {
        if (!permitted.has(key)) {
            fail(`unknown field: ${key}`);
        }
    });
}

function assertRequiredFields(record, requiredFields) {
    requiredFields.forEach((field) => {
        if (!Object.hasOwn(record, field)) {
            fail(`${field} is required`);
        }
    });
}

function requireMeaningfulString(value, field) {
    if (typeof value !== "string" || value.trim().length === 0) {
        fail(`${field} must be a meaningful string`);
    }

    return value;
}

function requireTimestamp(value) {
    if (typeof value !== "string"
        || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)
        || Number.isNaN(Date.parse(value))
        || new Date(value).toISOString() !== value) {
        fail("createdAt must be an exact UTC ISO timestamp with milliseconds");
    }

    return value;
}

function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) {
        return value;
    }

    Object.values(value).forEach((entry) => deepFreeze(entry));
    return Object.freeze(value);
}

function domainBoundary(operation) {
    try {
        return operation();
    } catch {
        throw new Error(DOMAIN_ERROR);
    }
}

function fail(reason) {
    throw new TypeError(reason);
}
