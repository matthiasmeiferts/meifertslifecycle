const VERSION = "1.0";
const DOMAIN_ERROR = "InspectionAssessmentDomainModel: invalid Inspection Assessment.";

const ASSESSMENT_FIELDS = Object.freeze([
    "version",
    "assessmentId",
    "findingId",
    "assessment",
    "createdAt"
]);

export default class InspectionAssessmentDomainModel {

    static get VERSION() {
        return VERSION;
    }

    static createAssessment(input) {
        return domainBoundary(() => {
            const source = captureRecord(input, "assessment input");
            assertExactFields(
                source,
                ASSESSMENT_FIELDS.filter((field) => field !== "version")
            );
            assertRequiredFields(source, [
                "assessmentId",
                "findingId",
                "assessment",
                "createdAt"
            ]);

            return deepFreeze({
                version: VERSION,
                assessmentId: requireMeaningfulString(
                    source.assessmentId,
                    "assessmentId"
                ),
                findingId: requireMeaningfulString(
                    source.findingId,
                    "findingId"
                ),
                assessment: requireMeaningfulString(
                    source.assessment,
                    "assessment"
                ),
                createdAt: requireTimestamp(source.createdAt)
            });
        });
    }

    static validateAssessment(value) {
        return domainBoundary(() => {
            const record = captureRecord(value, "assessment");
            validateCapturedAssessment(record);

            return deepFreeze({
                valid: true,
                errors: []
            });
        });
    }
}

function validateCapturedAssessment(record) {
    assertExactFields(record, ASSESSMENT_FIELDS);
    assertRequiredFields(record, ASSESSMENT_FIELDS);

    if (record.version !== VERSION) {
        fail("version must be 1.0");
    }

    requireMeaningfulString(record.assessmentId, "assessmentId");
    requireMeaningfulString(record.findingId, "findingId");
    requireMeaningfulString(record.assessment, "assessment");
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

        if (!descriptor
            || descriptor.enumerable !== true
            || !("value" in descriptor)) {
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
    if (typeof value !== "string" || !isCanonicalTimestamp(value)) {
        fail("createdAt must be an exact UTC ISO timestamp with milliseconds");
    }

    return value;
}

function isCanonicalTimestamp(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z$/.exec(value);

    if (!match) {
        return false;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const hour = Number(match[4]);
    const minute = Number(match[5]);
    const second = Number(match[6]);

    return month >= 1
        && month <= 12
        && day >= 1
        && day <= getDaysInMonth(year, month)
        && hour >= 0
        && hour <= 23
        && minute >= 0
        && minute <= 59
        && second >= 0
        && second <= 59;
}

function getDaysInMonth(year, month) {
    if (month === 2) {
        return isLeapYear(year) ? 29 : 28;
    }

    if ([4, 6, 9, 11].includes(month)) {
        return 30;
    }

    return 31;
}

function isLeapYear(year) {
    return year % 4 === 0
        && (year % 100 !== 0 || year % 400 === 0);
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
