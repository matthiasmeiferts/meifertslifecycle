import ReportContentDigest from "./ReportContentDigest.js";
import { types } from "node:util";

const FINALIZED_REPORT_VERSION = "finalized-report-1.0";
const GATE_VERSION = "report-finalization-gate-1.1";
const INVALID_GATE_DECISION_MESSAGE = "ReportFinalizer: invalid gate decision.";

export default class ReportFinalizer {

    static finalize(report, gateDecision) {
        const reportDigest = ReportContentDigest.create(report);

        validateGateDecision(gateDecision);

        if (reportDigest !== gateDecision.reportDigest) {
            throw new Error("ReportFinalizer: report content does not match the gate decision digest.");
        }

        return deepFreeze({
            status: "finalized",
            version: FINALIZED_REPORT_VERSION,
            report: cloneDataValue(report),
            finalization: {
                gateVersion: GATE_VERSION,
                reportDigest
            }
        });
    }
}

function validateGateDecision(decision) {
    try {
        if (!decision || !["object", "function"].includes(typeof decision)
            || types.isProxy(decision)
            || !isOrdinaryDataObject(decision)
            || !hasExactFields(decision, ["eligible", "reasons", "reportDigest", "version"])) {
            throw invalidGateDecisionError();
        }

        const eligible = readOwnDataValue(decision, "eligible");
        const reasons = readOwnDataValue(decision, "reasons");
        const reportDigest = readOwnDataValue(decision, "reportDigest");
        const version = readOwnDataValue(decision, "version");

        if (eligible !== true
            || types.isProxy(reasons)
            || !isDenseEmptyDataArray(reasons)
            || typeof reportDigest !== "string"
            || !/^[0-9a-f]{64}$/.test(reportDigest)
            || version !== GATE_VERSION) {
            throw invalidGateDecisionError();
        }
    } catch {
        throw invalidGateDecisionError();
    }
}

function cloneDataValue(value, ancestors = new WeakSet()) {
    if (value === null || !["object", "function", "symbol"].includes(typeof value)) {
        return value;
    }

    if (typeof value === "function" || typeof value === "symbol"
        || ancestors.has(value)) {
        throw new Error("ReportFinalizer: report contains unsupported data.");
    }

    const isArray = Array.isArray(value);

    if (!isArray && !isSupportedDataObject(value)) {
        throw new Error("ReportFinalizer: report contains unsupported data.");
    }

    ancestors.add(value);

    const clone = isArray
        ? new Array(value.length)
        : Object.create(Object.getPrototypeOf(value));
    const keys = Object.keys(value);

    keys.forEach((key) => {
        const descriptor = Object.getOwnPropertyDescriptor(value, key);

        if (!descriptor || descriptor.enumerable !== true || !("value" in descriptor)) {
            throw new Error("ReportFinalizer: report contains unsupported data.");
        }

        Object.defineProperty(clone, key, {
            value: cloneDataValue(descriptor.value, ancestors),
            enumerable: true,
            configurable: true,
            writable: true
        });
    });

    ancestors.delete(value);

    return Object.freeze(clone);
}

function hasExactFields(value, expectedFields) {
    const keys = Reflect.ownKeys(value);

    return keys.length === expectedFields.length
        && expectedFields.every((field) => keys.includes(field));
}

function isOrdinaryDataObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)
        || Object.getPrototypeOf(value) !== Object.prototype) {
        return false;
    }

    return Reflect.ownKeys(value).every((key) => {
        const descriptor = typeof key === "string"
            ? Object.getOwnPropertyDescriptor(value, key)
            : null;

        return descriptor?.enumerable === true && "value" in descriptor;
    });
}

function isDenseEmptyDataArray(value) {
    if (!Array.isArray(value) || Object.keys(value).length !== value.length) {
        return false;
    }

    return Reflect.ownKeys(value).every((key) => {
        if (key === "length") {
            return true;
        }

        const descriptor = typeof key === "string"
            ? Object.getOwnPropertyDescriptor(value, key)
            : null;
        const index = typeof key === "string" && /^(0|[1-9]\d*)$/.test(key)
            ? Number(key)
            : -1;

        return Number.isSafeInteger(index)
            && index >= 0
            && index < value.length
            && descriptor?.enumerable === true
            && "value" in descriptor;
    }) && value.length === 0;
}

function isSupportedDataObject(value) {
    const prototype = Object.getPrototypeOf(value);

    return prototype === Object.prototype || prototype === null;
}

function readOwnDataValue(value, key) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);

    if (!descriptor || descriptor.enumerable !== true || !("value" in descriptor)) {
        throw invalidGateDecisionError();
    }

    return descriptor.value;
}

function invalidGateDecisionError() {
    return new Error(INVALID_GATE_DECISION_MESSAGE);
}

function deepFreeze(value) {
    Object.values(value).forEach((entry) => {
        if (entry && typeof entry === "object" && !Object.isFrozen(entry)) {
            deepFreeze(entry);
        }
    });

    return Object.freeze(value);
}
