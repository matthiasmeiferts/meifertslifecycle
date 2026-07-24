const VERSION = "1.0";
const DOMAIN_ERROR = "InspectionAreaDomainModel: invalid Inspection Area.";

const AREA_FIELDS = Object.freeze([
    "version",
    "areaId",
    "sessionId",
    "name",
    "createdAt"
]);

export default class InspectionAreaDomainModel {

    static get VERSION() {
        return VERSION;
    }

    static createArea(input) {
        return domainBoundary(() => {
            const source = captureRecord(input, "area input");
            assertExactFields(source, AREA_FIELDS.filter((field) => field !== "version"));
            assertRequiredFields(source, ["areaId", "sessionId", "name", "createdAt"]);

            return deepFreeze({
                version: VERSION,
                areaId: requireMeaningfulString(source.areaId, "areaId"),
                sessionId: requireMeaningfulString(source.sessionId, "sessionId"),
                name: requireMeaningfulString(source.name, "name"),
                createdAt: requireTimestamp(source.createdAt)
            });
        });
    }

    static validateArea(value) {
        return domainBoundary(() => {
            const record = captureRecord(value, "area");
            validateCapturedArea(record);

            return deepFreeze({
                valid: true,
                errors: []
            });
        });
    }
}

function validateCapturedArea(record) {
    assertExactFields(record, AREA_FIELDS);
    assertRequiredFields(record, AREA_FIELDS);

    if (record.version !== VERSION) {
        fail("version must be 1.0");
    }

    requireMeaningfulString(record.areaId, "areaId");
    requireMeaningfulString(record.sessionId, "sessionId");
    requireMeaningfulString(record.name, "name");
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
