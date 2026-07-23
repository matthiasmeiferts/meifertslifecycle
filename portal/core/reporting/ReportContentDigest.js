import { createHash } from "node:crypto";
import { types } from "node:util";

const UNSUPPORTED_ERROR_MESSAGE = "REPORT_CONTENT_DIGEST_UNSUPPORTED";

export default class ReportContentDigest {

    static create(report) {
        try {
            const canonicalContent = canonicalize(report, new Set());

            return createHash("sha256")
                .update(canonicalContent, "utf8")
                .digest("hex");
        } catch {
            throw new Error(UNSUPPORTED_ERROR_MESSAGE);
        }
    }
}

function canonicalize(value, ancestors) {
    if (value === null) {
        return "null";
    }

    if (typeof value === "boolean") {
        return value ? "boolean:true" : "boolean:false";
    }

    if (typeof value === "string") {
        return `string:${JSON.stringify(value)}`;
    }

    if (typeof value === "number") {
        if (!Number.isFinite(value)) {
            throw unsupportedValueError();
        }

        return Object.is(value, -0) ? "number:-0" : `number:${String(value)}`;
    }

    if (!value || typeof value !== "object") {
        throw unsupportedValueError();
    }

    if (types.isProxy(value)) {
        throw unsupportedValueError();
    }

    if (ancestors.has(value)) {
        throw new TypeError("ReportContentDigest: cyclic report content is unsupported.");
    }

    ancestors.add(value);

    try {
        if (Array.isArray(value)) {
            return canonicalizeArray(value, ancestors);
        }

        if (!isSupportedObject(value)) {
            throw unsupportedValueError();
        }

        const keys = Object.keys(value).sort(compareKeys);
        const entries = keys.map((key) => {
            const descriptor = Object.getOwnPropertyDescriptor(value, key);

            if (!descriptor || !("value" in descriptor)) {
                throw unsupportedValueError();
            }

            return `${JSON.stringify(key)}:${canonicalize(descriptor.value, ancestors)}`;
        });

        return `object:{${entries.join(",")}}`;
    } finally {
        ancestors.delete(value);
    }
}

function canonicalizeArray(value, ancestors) {
    const keys = Object.keys(value);
    const expectedKeys = Array.from({ length: value.length }, (_, index) => String(index));

    if (keys.length !== expectedKeys.length
        || expectedKeys.some((key, index) => keys[index] !== key)) {
        throw unsupportedValueError();
    }

    const entries = expectedKeys.map((key) => {
        const descriptor = Object.getOwnPropertyDescriptor(value, key);

        if (!descriptor || !("value" in descriptor)) {
            throw unsupportedValueError();
        }

        return canonicalize(descriptor.value, ancestors);
    });

    return `array:[${entries.join(",")}]`;
}

function isSupportedObject(value) {
    const prototype = Object.getPrototypeOf(value);

    return prototype === Object.prototype || prototype === null;
}

function compareKeys(left, right) {
    return left < right ? -1 : left > right ? 1 : 0;
}

function unsupportedValueError() {
    return new TypeError("ReportContentDigest: unsupported report content.");
}
