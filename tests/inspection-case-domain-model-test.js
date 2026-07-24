import assert from "node:assert/strict";
import fs from "node:fs";
import InspectionCaseDomainModel from "../portal/core/InspectionCaseDomainModel.js";

const EXPECTED_ERROR = "InspectionCaseDomainModel: invalid Inspection Case.";
const VALID_INPUT = Object.freeze({
    caseId: "CASE-001",
    title: "Main building condition assessment",
    inspectionType: "PROPERTY_CONDITION_ASSESSMENT",
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

function rejects(valueOrOperation) {
    const operation = typeof valueOrOperation === "function"
        ? valueOrOperation
        : () => InspectionCaseDomainModel.createCase(valueOrOperation);

    assert.throws(operation, (error) => error?.message === EXPECTED_ERROR);
}

function fullInput() {
    return {
        ...VALID_INPUT,
        propertyReference: {
            addressLine1: "Example Street 10",
            addressLine2: "Building B",
            postalCode: "10115",
            city: "Berlin",
            countryCode: "DE",
            internalReference: "PROPERTY-42"
        }
    };
}

test("public API is exact", () => {
    const publicMembers = Object.getOwnPropertyNames(InspectionCaseDomainModel)
        .filter((name) => !["length", "name", "prototype"].includes(name))
        .sort();

    assert.deepEqual(publicMembers, ["VERSION", "createCase", "validateCase"]);
});

test("VERSION is 1.0", () => {
    assert.equal(InspectionCaseDomainModel.VERSION, "1.0");
});

test("creates the minimal canonical case", () => {
    assert.deepEqual(InspectionCaseDomainModel.createCase(VALID_INPUT), {
        version: "1.0",
        ...VALID_INPUT
    });
});

test("accepts a complete property reference", () => {
    assert.deepEqual(InspectionCaseDomainModel.createCase(fullInput()), {
        version: "1.0",
        ...fullInput()
    });
});

test("sets version canonically and rejects caller version", () => {
    assert.equal(InspectionCaseDomainModel.createCase(VALID_INPUT).version, "1.0");
    rejects({ ...VALID_INPUT, version: "1.0" });
    rejects({ ...VALID_INPUT, version: "2.0" });
});

test("rejects missing or empty caseId", () => {
    const { caseId, ...missing } = VALID_INPUT;
    rejects(missing);
    rejects({ ...VALID_INPUT, caseId: "" });
    rejects({ ...VALID_INPUT, caseId: "   " });
});

test("rejects missing or empty title", () => {
    const { title, ...missing } = VALID_INPUT;
    rejects(missing);
    rejects({ ...VALID_INPUT, title: "" });
    rejects({ ...VALID_INPUT, title: "   " });
});

test("accepts only the closed inspection type vocabulary", () => {
    [
        "TECHNICAL_DUE_DILIGENCE",
        "PROPERTY_CONDITION_ASSESSMENT",
        "DEFECT_INSPECTION",
        "VALUATION_SUPPORT",
        "OTHER"
    ].forEach((inspectionType) => {
        assert.equal(InspectionCaseDomainModel.createCase({
            ...VALID_INPUT,
            inspectionType
        }).inspectionType, inspectionType);
    });

    rejects({ ...VALID_INPUT, inspectionType: "GENERAL" });
    rejects({ ...VALID_INPUT, inspectionType: "other" });
    rejects({ ...VALID_INPUT, inspectionType: " Other " });
});

test("requires an exact UTC ISO timestamp with milliseconds", () => {
    const { createdAt, ...missing } = VALID_INPUT;
    rejects(missing);
    rejects({ ...VALID_INPUT, createdAt: "2026-02-29T10:00:00.000Z" });
    assert.equal(InspectionCaseDomainModel.createCase({
        ...VALID_INPUT,
        createdAt: "2024-02-29T10:00:00.000Z"
    }).createdAt, "2024-02-29T10:00:00.000Z");
    rejects({ ...VALID_INPUT, createdAt: "2026-13-01T10:00:00.000Z" });
    rejects({ ...VALID_INPUT, createdAt: "2026-01-32T10:00:00.000Z" });
    rejects({ ...VALID_INPUT, createdAt: "2026-07-24T08:30:00Z" });
    rejects({ ...VALID_INPUT, createdAt: "2026-07-24T10:30:00.000+02:00" });
    rejects({ ...VALID_INPUT, createdAt: "2026-02-30T08:30:00.000Z" });
    rejects({ ...VALID_INPUT, createdAt: "2026-07-24T24:00:00.000Z" });
    rejects({ ...VALID_INPUT, createdAt: "2026-07-24T25:00:00.000Z" });
    rejects({ ...VALID_INPUT, createdAt: "2026-07-24T08:60:00.000Z" });
    rejects({ ...VALID_INPUT, createdAt: "2026-07-24T08:30:60.000Z" });
    rejects({ ...VALID_INPUT, createdAt: "2026-07-24T08:30:00.0Z" });
    rejects({ ...VALID_INPUT, createdAt: "2026-07-24T08:30:00.00Z" });
    rejects({ ...VALID_INPUT, createdAt: "2026-07-24T08:30:00.0000Z" });
});

test("rejects unknown fields at both contract levels", () => {
    rejects({ ...VALID_INPUT, inspectionId: "INSPECTION-1" });
    rejects({
        ...VALID_INPUT,
        propertyReference: { city: "Berlin", district: "Mitte" }
    });
});

test("rejects arrays, nulls, primitives and unsupported values", () => {
    [null, undefined, [], "case", 1, true, 1n, Symbol("case")]
        .forEach((value) => rejects(value));

    rejects(() => InspectionCaseDomainModel.createCase(() => {}));
    rejects({ ...VALID_INPUT, propertyReference: [] });
    rejects({ ...VALID_INPUT, title: () => "title" });
    rejects({ ...VALID_INPUT, propertyReference: { city: 1n } });
    rejects({ ...VALID_INPUT, propertyReference: { city: Symbol("city") } });
});

test("rejects circular structures through the stable boundary", () => {
    const input = { ...VALID_INPUT };
    input.propertyReference = input;
    rejects(input);
});

test("accepts null-prototype root and nested records", () => {
    const propertyReference = Object.assign(Object.create(null), {
        city: "Berlin",
        countryCode: "DE"
    });
    const input = Object.assign(Object.create(null), VALID_INPUT, { propertyReference });
    const result = InspectionCaseDomainModel.createCase(input);

    assert.deepEqual(result.propertyReference, { city: "Berlin", countryCode: "DE" });
});

test("converts record-capture proxy traps into stable domain errors", () => {
    const traps = [
        new Proxy(VALID_INPUT, { getPrototypeOf() { throw new Error("prototype trap"); } }),
        new Proxy({}, { ownKeys() { throw new Error("ownKeys trap"); } }),
        new Proxy(VALID_INPUT, {
            getOwnPropertyDescriptor() { throw new Error("descriptor trap"); }
        })
    ];

    traps.forEach((proxy) => rejects(proxy));
});

test("rejects keys without descriptors and descriptor-value failures", () => {
    rejects(new Proxy({}, {
        ownKeys() { return ["caseId"]; },
        getOwnPropertyDescriptor() { return undefined; }
    }));

    rejects(new Proxy(VALID_INPUT, {
        getOwnPropertyDescriptor(target, key) {
            const descriptor = Reflect.getOwnPropertyDescriptor(target, key);

            if (key !== "caseId") {
                return descriptor;
            }

            return {
                configurable: descriptor.configurable,
                enumerable: descriptor.enumerable,
                writable: descriptor.writable,
                get value() { throw new Error("descriptor value trap"); }
            };
        }
    }));
});

test("captures each external record property exactly once without get operations", () => {
    const descriptorCalls = new Map();
    let prototypeCalls = 0;
    let ownKeysCalls = 0;
    let getCalls = 0;
    let hasCalls = 0;
    let definePropertyCalls = 0;
    let setCalls = 0;
    const proxy = new Proxy({ ...VALID_INPUT }, {
        getPrototypeOf(target) {
            prototypeCalls += 1;
            return Reflect.getPrototypeOf(target);
        },
        ownKeys(target) {
            ownKeysCalls += 1;
            return Reflect.ownKeys(target);
        },
        getOwnPropertyDescriptor(target, key) {
            descriptorCalls.set(key, (descriptorCalls.get(key) || 0) + 1);

            if (descriptorCalls.get(key) > 1) {
                throw new Error("descriptor was read more than once");
            }

            return Reflect.getOwnPropertyDescriptor(target, key);
        },
        get() {
            getCalls += 1;
            throw new Error("external values must come from descriptors");
        },
        has(target, key) {
            hasCalls += 1;
            return Reflect.has(target, key);
        },
        defineProperty(target, key, descriptor) {
            definePropertyCalls += 1;
            return Reflect.defineProperty(target, key, descriptor);
        },
        set(target, key, value, receiver) {
            setCalls += 1;
            return Reflect.set(target, key, value, receiver);
        }
    });
    const result = InspectionCaseDomainModel.createCase(proxy);

    assert.deepEqual(result, { version: "1.0", ...VALID_INPUT });
    assert.equal(prototypeCalls, 1);
    assert.equal(ownKeysCalls, 1);
    assert.equal(getCalls, 0);
    assert.equal(hasCalls, 0);
    assert.equal(definePropertyCalls, 0);
    assert.equal(setCalls, 0);
    assert.deepEqual([...descriptorCalls.values()], [1, 1, 1, 1]);
});

test("captures a nested property reference exactly once", () => {
    const descriptorCalls = new Map();
    let prototypeCalls = 0;
    let ownKeysCalls = 0;
    let getCalls = 0;
    let hasCalls = 0;
    let definePropertyCalls = 0;
    let setCalls = 0;
    const propertyReference = new Proxy({ city: "Berlin", countryCode: "DE" }, {
        getPrototypeOf(target) {
            prototypeCalls += 1;
            return Reflect.getPrototypeOf(target);
        },
        ownKeys(target) {
            ownKeysCalls += 1;
            return Reflect.ownKeys(target);
        },
        getOwnPropertyDescriptor(target, key) {
            descriptorCalls.set(key, (descriptorCalls.get(key) || 0) + 1);
            return Reflect.getOwnPropertyDescriptor(target, key);
        },
        get() {
            getCalls += 1;
            throw new Error("nested external values must come from descriptors");
        },
        has(target, key) {
            hasCalls += 1;
            return Reflect.has(target, key);
        },
        defineProperty(target, key, descriptor) {
            definePropertyCalls += 1;
            return Reflect.defineProperty(target, key, descriptor);
        },
        set(target, key, value, receiver) {
            setCalls += 1;
            return Reflect.set(target, key, value, receiver);
        }
    });
    const result = InspectionCaseDomainModel.createCase({ ...VALID_INPUT, propertyReference });

    assert.deepEqual(result.propertyReference, { city: "Berlin", countryCode: "DE" });
    assert.equal(prototypeCalls, 1);
    assert.equal(ownKeysCalls, 1);
    assert.equal(getCalls, 0);
    assert.equal(hasCalls, 0);
    assert.equal(definePropertyCalls, 0);
    assert.equal(setCalls, 0);
    assert.deepEqual([...descriptorCalls.values()], [1, 1]);
});

test("validateCase captures the canonical root exactly once", () => {
    const canonical = { version: "1.0", ...fullInput() };
    const descriptorCalls = new Map();
    let prototypeCalls = 0;
    let ownKeysCalls = 0;
    let getCalls = 0;
    let hasCalls = 0;
    let definePropertyCalls = 0;
    let setCalls = 0;
    const proxy = new Proxy(canonical, {
        getPrototypeOf(target) {
            prototypeCalls += 1;
            return Reflect.getPrototypeOf(target);
        },
        ownKeys(target) {
            ownKeysCalls += 1;
            return Reflect.ownKeys(target);
        },
        getOwnPropertyDescriptor(target, key) {
            descriptorCalls.set(key, (descriptorCalls.get(key) || 0) + 1);
            return Reflect.getOwnPropertyDescriptor(target, key);
        },
        get() {
            getCalls += 1;
            throw new Error("validation values must come from descriptors");
        },
        has(target, key) {
            hasCalls += 1;
            return Reflect.has(target, key);
        },
        defineProperty(target, key, descriptor) {
            definePropertyCalls += 1;
            return Reflect.defineProperty(target, key, descriptor);
        },
        set(target, key, value, receiver) {
            setCalls += 1;
            return Reflect.set(target, key, value, receiver);
        }
    });
    const validation = InspectionCaseDomainModel.validateCase(proxy);

    assert.deepEqual(validation, { valid: true, errors: [] });
    assert.equal(prototypeCalls, 1);
    assert.equal(ownKeysCalls, 1);
    assert.equal(getCalls, 0);
    assert.equal(hasCalls, 0);
    assert.equal(definePropertyCalls, 0);
    assert.equal(setCalls, 0);
    assert.deepEqual([...descriptorCalls.values()], [1, 1, 1, 1, 1, 1]);
});

test("rejects observable descriptor inconsistency during the single capture", () => {
    let invalidateTitle = false;
    const proxy = new Proxy({ ...VALID_INPUT }, {
        getOwnPropertyDescriptor(target, key) {
            if (key === "caseId") {
                invalidateTitle = true;
                return Reflect.getOwnPropertyDescriptor(target, key);
            }

            if (key === "title" && invalidateTitle) {
                return {
                    configurable: true,
                    enumerable: true,
                    get() { return target.title; }
                };
            }

            return Reflect.getOwnPropertyDescriptor(target, key);
        }
    });

    rejects(proxy);
});

test("accepts a fully transparent proxy as the observable record boundary", () => {
    const target = { ...VALID_INPUT, hiddenTargetField: "not observable" };
    const visibleKeys = Object.keys(VALID_INPUT);
    const proxy = new Proxy(target, {
        ownKeys() { return visibleKeys; },
        getOwnPropertyDescriptor(value, key) {
            return Reflect.getOwnPropertyDescriptor(value, key);
        }
    });

    assert.deepEqual(InspectionCaseDomainModel.createCase(proxy), {
        version: "1.0",
        ...VALID_INPUT
    });
});

test("rejects accessors symbol keys and non-enumerable properties", () => {
    let getterCalls = 0;
    const accessorInput = { ...VALID_INPUT };
    Object.defineProperty(accessorInput, "caseId", {
        enumerable: true,
        get() {
            getterCalls += 1;
            return "CASE-001";
        }
    });
    rejects(accessorInput);
    assert.equal(getterCalls, 0);

    rejects({ ...VALID_INPUT, [Symbol("hidden")]: "value" });

    const nonEnumerableInput = { ...VALID_INPUT };
    Object.defineProperty(nonEnumerableInput, "hidden", {
        enumerable: false,
        value: "unsupported"
    });
    rejects(nonEnumerableInput);
});

test("does not mutate or normalize input", () => {
    const input = fullInput();
    input.title = "  Überprüfung 🏢 e\u0301  ";
    const before = structuredClone(input);
    const result = InspectionCaseDomainModel.createCase(input);

    assert.deepEqual(input, before);
    assert.equal(result.title, "  Überprüfung 🏢 e\u0301  ");
    assert.equal(Object.isFrozen(input), false);
    assert.equal(Object.isFrozen(input.propertyReference), false);
});

test("rejects empty optional strings instead of normalizing them", () => {
    rejects({ ...VALID_INPUT, propertyReference: { city: "" } });
    rejects({ ...VALID_INPUT, propertyReference: { city: "   " } });
});

test("returns detached recursively frozen records", () => {
    const input = fullInput();
    const result = InspectionCaseDomainModel.createCase(input);

    assert.notEqual(result, input);
    assert.notEqual(result.propertyReference, input.propertyReference);
    assert.equal(Object.isFrozen(result), true);
    assert.equal(Object.isFrozen(result.propertyReference), true);

    input.propertyReference.city = "Hamburg";
    assert.equal(result.propertyReference.city, "Berlin");
    assert.throws(() => { result.propertyReference.city = "Munich"; }, TypeError);
});

test("separate calls share no references and remain deterministic", () => {
    const first = InspectionCaseDomainModel.createCase(fullInput());
    const second = InspectionCaseDomainModel.createCase(fullInput());

    assert.deepEqual(first, second);
    assert.notEqual(first, second);
    assert.notEqual(first.propertyReference, second.propertyReference);
});

test("validateCase accepts canonical records with a frozen success result", () => {
    const canonical = structuredClone(InspectionCaseDomainModel.createCase(fullInput()));
    const before = structuredClone(canonical);
    const validation = InspectionCaseDomainModel.validateCase(canonical);

    assert.deepEqual(validation, { valid: true, errors: [] });
    assert.equal(Object.isFrozen(validation), true);
    assert.equal(Object.isFrozen(validation.errors), true);
    assert.deepEqual(canonical, before);
    assert.equal(Object.isFrozen(canonical), false);
    assert.equal(Object.isFrozen(canonical.propertyReference), false);
});

test("validateCase creates no defaults and rejects contract drift", () => {
    const canonical = InspectionCaseDomainModel.createCase(VALID_INPUT);
    const { version, ...withoutVersion } = canonical;

    rejects(() => InspectionCaseDomainModel.validateCase(withoutVersion));
    rejects(() => InspectionCaseDomainModel.validateCase({ ...canonical, version: "2.0" }));
    rejects(() => InspectionCaseDomainModel.validateCase({ ...canonical, status: "draft" }));
});

test("has no forbidden architectural dependencies", () => {
    const source = fs.readFileSync(
        new URL("../portal/core/InspectionCaseDomainModel.js", import.meta.url),
        "utf8"
    );
    const forbidden = [
        "StorageManager",
        "localStorage",
        "EventBus",
        "CaseManager",
        "InspectionManager",
        "InspectionContext",
        "RuntimeManager",
        "ExpertIntelligence",
        "ReportContentDigest",
        "HumanReview",
        "Reporting",
        "RiskRelevance",
        "Risk",
        "Workflow",
        "ReportAssembly",
        "Export",
        "crypto"
    ];

    assert.equal(/^\s*import\s/m.test(source), false);
    forbidden.forEach((token) => assert.equal(source.includes(token), false, token));
    assert.equal(source.includes("Date.now"), false);
    assert.equal(source.includes("new Date()"), false);
    assert.equal(source.includes("Math.random"), false);
    assert.equal(source.includes("JSON.parse"), false);
    assert.equal(source.includes("JSON.stringify"), false);
});

console.log(`Inspection Case Domain Model: ${passed}/${passed} groups passed.`);
