const VERSION = "1.0";
const DOMAIN_ERROR = "InspectionCaseDomainModel: invalid Inspection Case.";

const INSPECTION_TYPES = Object.freeze(new Set([
    "TECHNICAL_DUE_DILIGENCE",
    "PROPERTY_CONDITION_ASSESSMENT",
    "DEFECT_INSPECTION",
    "VALUATION_SUPPORT",
    "OTHER"
]));

const CASE_FIELDS = Object.freeze([
    "version",
    "caseId",
    "title",
    "inspectionType",
    "propertyReference",
    "createdAt"
]);

const PROPERTY_REFERENCE_FIELDS = Object.freeze([
    "addressLine1",
    "addressLine2",
    "postalCode",
    "city",
    "countryCode",
    "internalReference"
]);

export default class InspectionCaseDomainModel {

    static get VERSION() {
        return VERSION;
    }

    static createCase(input) {
        return domainBoundary(() => {
            const source = captureRecord(input, "case input");
            assertExactFields(source, CASE_FIELDS.filter((field) => field !== "version"));
            assertRequiredFields(source, ["caseId", "title", "inspectionType", "createdAt"]);

            const result = {
                version: VERSION,
                caseId: requireMeaningfulString(source.caseId, "caseId"),
                title: requireMeaningfulString(source.title, "title"),
                inspectionType: requireInspectionType(source.inspectionType)
            };

            if (hasOwn(source, "propertyReference")) {
                result.propertyReference = clonePropertyReference(
                    source.propertyReference
                );
            }

            result.createdAt = requireTimestamp(source.createdAt);

            return deepFreeze(result);
        });
    }

    static validateCase(value) {
        return domainBoundary(() => {
            validateCanonicalCase(value);

            return deepFreeze({
                valid: true,
                errors: []
            });
        });
    }
}

function validateCanonicalCase(value) {
    const record = captureRecord(value, "case");
    validateCapturedCase(record);
}

function validateCapturedCase(record) {
    assertExactFields(record, CASE_FIELDS);
    assertRequiredFields(record, ["version", "caseId", "title", "inspectionType", "createdAt"]);

    if (record.version !== VERSION) {
        fail("version must be 1.0");
    }

    requireMeaningfulString(record.caseId, "caseId");
    requireMeaningfulString(record.title, "title");
    requireInspectionType(record.inspectionType);
    requireTimestamp(record.createdAt);

    if (hasOwn(record, "propertyReference")) {
        validatePropertyReference(record.propertyReference);
    }
}

function clonePropertyReference(value) {
    const record = capturePropertyReference(value);
    const result = {};

    Object.keys(record).forEach((key) => {
        result[key] = record[key];
    });

    return result;
}

function validatePropertyReference(value) {
    capturePropertyReference(value);
}

function capturePropertyReference(value) {
    const record = captureRecord(value, "propertyReference");
    assertExactFields(record, PROPERTY_REFERENCE_FIELDS);

    Object.keys(record).forEach((key) => {
        requireMeaningfulString(record[key], `propertyReference.${key}`);
    });

    return record;
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

function requireInspectionType(value) {
    if (!INSPECTION_TYPES.has(value)) {
        fail("inspectionType is unsupported");
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

function hasOwn(value, key) {
    return Object.hasOwn(value, key);
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
