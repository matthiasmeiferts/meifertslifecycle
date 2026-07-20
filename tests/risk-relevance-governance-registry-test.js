import assert from "node:assert/strict";

import RiskRelevanceGovernanceRegistry, {
    RISK_RELEVANCE_GOVERNANCE_VERSION,
    RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION,
    RISK_RELEVANCE_VALUES,
    RISK_RELEVANCE_VALUE_STATES,
    RISK_RELEVANCE_VERSION_STATES,
    classifyRiskRelevanceValue,
    classifyRiskRelevanceVersion,
    getRiskRelevanceGovernanceDefinition
} from "../portal/core/risk/RiskRelevanceGovernanceRegistry.js";

let passedTests = 0;

function runTest(name, fn) {
    try {
        fn();
        passedTests += 1;
        console.log(`✓ ${name}`);
    } catch (error) {
        console.error(`✗ ${name}`);
        throw error;
    }
}

function assertValue(rawValue, expected, options) {
    assert.deepStrictEqual(
        classifyRiskRelevanceValue(rawValue, options),
        expected
    );
}

function assertVersion(sourceVersion, expected, options) {
    assert.deepStrictEqual(
        classifyRiskRelevanceVersion(sourceVersion, options),
        expected
    );
}

runTest(
    "exports closed canonical value set without numeric metadata",
    () => {
        assert.deepStrictEqual(Object.values(RISK_RELEVANCE_VALUES), [
            "LOW_RELEVANCE",
            "MODERATE_RELEVANCE",
            "HIGH_RELEVANCE"
        ]);
        assert.equal(Object.isFrozen(RISK_RELEVANCE_VALUES), true);
        assert.equal(JSON.stringify(RISK_RELEVANCE_VALUES).includes("1"), false);
        assert.equal(JSON.stringify(RISK_RELEVANCE_VALUES).includes("2"), false);
        assert.equal(JSON.stringify(RISK_RELEVANCE_VALUES).includes("3"), false);
    }
);

runTest(
    "exports exact value states",
    () => {
        assert.deepStrictEqual(Object.values(RISK_RELEVANCE_VALUE_STATES), [
            "CANONICAL",
            "LEGACY_SUPPORTED",
            "LEGACY_UNSUPPORTED",
            "UNKNOWN_VALUE",
            "INVALID_VALUE",
            "NOT_PRESENT"
        ]);
    }
);

runTest(
    "exports exact version states",
    () => {
        assert.deepStrictEqual(Object.values(RISK_RELEVANCE_VERSION_STATES), [
            "VERSION_SUPPORTED",
            "UNKNOWN_VERSION",
            "VERSION_UNSUPPORTED"
        ]);
    }
);

runTest(
    "canonical values classify without interpretation",
    () => {
        [
            RISK_RELEVANCE_VALUES.LOW_RELEVANCE,
            RISK_RELEVANCE_VALUES.MODERATE_RELEVANCE,
            RISK_RELEVANCE_VALUES.HIGH_RELEVANCE
        ].forEach((value) => {
            assertValue(value, {
                rawValue: value,
                canonicalValue: value,
                valueState: RISK_RELEVANCE_VALUE_STATES.CANONICAL
            });
        });
    }
);

runTest(
    "supported legacy values map exactly",
    () => {
        [
            ["low", RISK_RELEVANCE_VALUES.LOW_RELEVANCE],
            ["medium", RISK_RELEVANCE_VALUES.MODERATE_RELEVANCE],
            ["high", RISK_RELEVANCE_VALUES.HIGH_RELEVANCE],
            ["moderate", RISK_RELEVANCE_VALUES.MODERATE_RELEVANCE]
        ].forEach(([rawValue, canonicalValue]) => {
            assertValue(rawValue, {
                rawValue,
                canonicalValue,
                valueState: RISK_RELEVANCE_VALUE_STATES.LEGACY_SUPPORTED
            });
        });
    }
);

runTest(
    "legacy mapping does not repair case or surrounding whitespace",
    () => {
        ["Low", "LOW", " low", "low ", " medium ", "HIGH"].forEach((rawValue) => {
            assertValue(rawValue, {
                rawValue,
                canonicalValue: null,
                valueState: RISK_RELEVANCE_VALUE_STATES.INVALID_VALUE
            });
        });
    }
);

runTest(
    "unsupported legacy values are recognized without canonical mapping",
    () => {
        ["critical", "safety_relevant", "safety_critical", "safety-critical", "very high", "very_high"].forEach((rawValue) => {
            assertValue(rawValue, {
                rawValue,
                canonicalValue: null,
                valueState: RISK_RELEVANCE_VALUE_STATES.LEGACY_UNSUPPORTED
            });
        });
    }
);

runTest(
    "explicit unknown tokens remain unknown values",
    () => {
        ["unknown", "UNKNOWN", "UNKNOWN_RELEVANCE", "", "   "].forEach((rawValue) => {
            assertValue(rawValue, {
                rawValue,
                canonicalValue: null,
                valueState: RISK_RELEVANCE_VALUE_STATES.UNKNOWN_VALUE
            });
        });
    }
);

runTest(
    "missing property is not present only through explicit presence option",
    () => {
        assertValue(undefined, {
            rawValue: undefined,
            canonicalValue: null,
            valueState: RISK_RELEVANCE_VALUE_STATES.NOT_PRESENT
        }, { isPresent: false });

        assertValue(undefined, {
            rawValue: undefined,
            canonicalValue: null,
            valueState: RISK_RELEVANCE_VALUE_STATES.UNKNOWN_VALUE
        });
    }
);

runTest(
    "null-like present values do not become not present",
    () => {
        [undefined, null].forEach((rawValue) => {
            assertValue(rawValue, {
                rawValue,
                canonicalValue: null,
                valueState: RISK_RELEVANCE_VALUE_STATES.UNKNOWN_VALUE
            });
        });
    }
);

runTest(
    "invalid primitive and callable values are preserved",
    () => {
        const symbolValue = Symbol("risk-relevance-test");
        const functionValue = function rawValueFunction() {
            return true;
        };

        [12, true, false, 10n, symbolValue, functionValue].forEach((rawValue) => {
            assertValue(rawValue, {
                rawValue,
                canonicalValue: null,
                valueState: RISK_RELEVANCE_VALUE_STATES.INVALID_VALUE
            });
        });
    }
);

runTest(
    "invalid object and array values are preserved by reference without copying",
    () => {
        const objectValue = Object.freeze({ value: "high" });
        const arrayValue = Object.freeze(["high"]);
        const objectResult = classifyRiskRelevanceValue(objectValue);
        const arrayResult = classifyRiskRelevanceValue(arrayValue);

        assert.equal(objectResult.rawValue, objectValue);
        assert.equal(arrayResult.rawValue, arrayValue);
        assert.equal(objectResult.valueState, RISK_RELEVANCE_VALUE_STATES.INVALID_VALUE);
        assert.equal(arrayResult.valueState, RISK_RELEVANCE_VALUE_STATES.INVALID_VALUE);
    }
);

runTest(
    "supported source version is accepted exactly",
    () => {
        assertVersion(RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION, {
            sourceVersion: RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION,
            versionState: RISK_RELEVANCE_VERSION_STATES.VERSION_SUPPORTED,
            governanceVersion: RISK_RELEVANCE_GOVERNANCE_VERSION
        });
    }
);

runTest(
    "missing source version uses unknown version state through explicit presence option",
    () => {
        assertVersion(undefined, {
            sourceVersion: undefined,
            versionState: RISK_RELEVANCE_VERSION_STATES.UNKNOWN_VERSION,
            governanceVersion: RISK_RELEVANCE_GOVERNANCE_VERSION
        }, { isPresent: false });
    }
);

runTest(
    "present null-like source versions remain unknown",
    () => {
        [undefined, null, "", "   "].forEach((sourceVersion) => {
            assertVersion(sourceVersion, {
                sourceVersion,
                versionState: RISK_RELEVANCE_VERSION_STATES.UNKNOWN_VERSION,
                governanceVersion: RISK_RELEVANCE_GOVERNANCE_VERSION
            });
        });
    }
);

runTest(
    "unsupported source versions and version types are preserved",
    () => {
        const symbolValue = Symbol("risk-relevance-version-test");
        const functionValue = function sourceVersionFunction() {
            return true;
        };

        ["risk-relevance-2.0", 1, true, false, 20n, symbolValue, functionValue].forEach((sourceVersion) => {
            assertVersion(sourceVersion, {
                sourceVersion,
                versionState: RISK_RELEVANCE_VERSION_STATES.VERSION_UNSUPPORTED,
                governanceVersion: RISK_RELEVANCE_GOVERNANCE_VERSION
            });
        });
    }
);

runTest(
    "object and array source versions are preserved by reference without copying",
    () => {
        const objectVersion = Object.freeze({ version: "risk-relevance-1.0" });
        const arrayVersion = Object.freeze(["risk-relevance-1.0"]);
        const objectResult = classifyRiskRelevanceVersion(objectVersion);
        const arrayResult = classifyRiskRelevanceVersion(arrayVersion);

        assert.equal(objectResult.sourceVersion, objectVersion);
        assert.equal(arrayResult.sourceVersion, arrayVersion);
        assert.equal(objectResult.versionState, RISK_RELEVANCE_VERSION_STATES.VERSION_UNSUPPORTED);
        assert.equal(arrayResult.versionState, RISK_RELEVANCE_VERSION_STATES.VERSION_UNSUPPORTED);
    }
);

runTest(
    "version conflict is not produced by a single-version classifier",
    () => {
        assertVersion("risk-relevance-2.0", {
            sourceVersion: "risk-relevance-2.0",
            versionState: RISK_RELEVANCE_VERSION_STATES.VERSION_UNSUPPORTED,
            governanceVersion: RISK_RELEVANCE_GOVERNANCE_VERSION
        }, { hasVersionConflict: true });
    }
);

runTest(
    "classification does not mutate inputs or options",
    () => {
        const rawValue = Object.freeze({ value: "critical" });
        const sourceVersion = Object.freeze({ version: "risk-relevance-2.0" });
        const valueOptions = Object.freeze({ isPresent: true });
        const versionOptions = Object.freeze({ isPresent: true });

        classifyRiskRelevanceValue(rawValue, valueOptions);
        classifyRiskRelevanceVersion(sourceVersion, versionOptions);

        assert.deepStrictEqual(rawValue, { value: "critical" });
        assert.deepStrictEqual(sourceVersion, { version: "risk-relevance-2.0" });
        assert.deepStrictEqual(valueOptions, { isPresent: true });
        assert.deepStrictEqual(versionOptions, { isPresent: true });
    }
);

runTest(
    "complex raw values keep exact references and are not copied through getters",
    () => {
        const nested = { inner: { value: "before" } };
        const array = [{ value: "before" }];
        const getterInput = {};

        Object.defineProperty(getterInput, "boom", {
            enumerable: true,
            get() {
                throw new Error("getter must not run");
            }
        });

        const nestedResult = classifyRiskRelevanceValue(nested);
        const arrayResult = classifyRiskRelevanceValue(array);
        const getterResult = classifyRiskRelevanceValue(getterInput);

        nested.inner.value = "after";
        array[0].value = "after";

        assert.equal(nestedResult.rawValue, nested);
        assert.equal(nestedResult.rawValue.inner.value, "after");
        assert.equal(arrayResult.rawValue, array);
        assert.equal(arrayResult.rawValue[0].value, "after");
        assert.equal(getterResult.rawValue, getterInput);
        assert.equal(getterResult.valueState, RISK_RELEVANCE_VALUE_STATES.INVALID_VALUE);
    }
);

runTest(
    "cyclic symbol keyed non-enumerable and null-prototype raw values classify without serialization",
    () => {
        const cyclic = {};
        const symbolKey = Symbol("risk-relevance-symbol-key");
        const symbolObject = { visible: true };
        const nonEnumerable = {};
        const nullPrototype = Object.create(null);

        cyclic.self = cyclic;
        symbolObject[symbolKey] = "symbol-value";
        Object.defineProperty(nonEnumerable, "hidden", { value: true, enumerable: false });
        nullPrototype.value = "high";

        assert.equal(classifyRiskRelevanceValue(cyclic).rawValue.self, cyclic);
        assert.equal(classifyRiskRelevanceValue(symbolObject).rawValue[symbolKey], "symbol-value");
        assert.equal(classifyRiskRelevanceValue(nonEnumerable).rawValue.hidden, true);
        assert.equal(classifyRiskRelevanceValue(nullPrototype).rawValue, nullPrototype);
    }
);

runTest(
    "options getters and throwing proxies do not break classification",
    () => {
        const optionsGetter = {};
        const proxyOptions = new Proxy({}, {
            getOwnPropertyDescriptor() {
                throw new Error("proxy option lookup must be contained");
            }
        });

        Object.defineProperty(optionsGetter, "isPresent", {
            enumerable: true,
            get() {
                throw new Error("option getter must not run");
            }
        });

        assert.equal(classifyRiskRelevanceValue("high", optionsGetter).valueState, RISK_RELEVANCE_VALUE_STATES.LEGACY_SUPPORTED);
        assert.equal(classifyRiskRelevanceVersion("risk-relevance-1.0", optionsGetter).versionState, RISK_RELEVANCE_VERSION_STATES.VERSION_SUPPORTED);
        assert.equal(classifyRiskRelevanceValue("high", proxyOptions).valueState, RISK_RELEVANCE_VALUE_STATES.LEGACY_SUPPORTED);
        assert.equal(classifyRiskRelevanceVersion("risk-relevance-1.0", proxyOptions).versionState, RISK_RELEVANCE_VERSION_STATES.VERSION_SUPPORTED);
    }
);

runTest(
    "repeated calls are deterministic and outputs are independent",
    () => {
        const first = classifyRiskRelevanceValue("medium");
        const second = classifyRiskRelevanceValue("medium");
        const versionFirst = classifyRiskRelevanceVersion("risk-relevance-1.0");
        const versionSecond = classifyRiskRelevanceVersion("risk-relevance-1.0");

        assert.deepStrictEqual(first, second);
        assert.deepStrictEqual(versionFirst, versionSecond);
        assert.notEqual(first, second);
        assert.notEqual(versionFirst, versionSecond);
        assert.equal(Object.isFrozen(first), true);
        assert.equal(Object.isFrozen(versionFirst), true);
    }
);

runTest(
    "ordinary source states never throw",
    () => {
        const rawValues = [undefined, null, "", "   ", "unknown", "future", 1, true, {}, [], Symbol("value"), 1n, () => true];
        const versions = [undefined, null, "", "   ", "risk-relevance-2.0", 1, true, {}, [], Symbol("version"), 1n, () => true];

        rawValues.forEach((rawValue) => assert.doesNotThrow(() => classifyRiskRelevanceValue(rawValue)));
        versions.forEach((sourceVersion) => assert.doesNotThrow(() => classifyRiskRelevanceVersion(sourceVersion)));
        assert.doesNotThrow(() => classifyRiskRelevanceValue("high", Symbol("options")));
        assert.doesNotThrow(() => classifyRiskRelevanceVersion("risk-relevance-1.0", Symbol("options")));
    }
);

runTest(
    "registry definition is frozen and references the supported versions",
    () => {
        const definition = getRiskRelevanceGovernanceDefinition();

        assert.equal(definition.governanceVersion, "risk-relevance-governance-1.0");
        assert.equal(definition.supportedSourceVersion, "risk-relevance-1.0");
        assert.equal(Object.isFrozen(definition), true);
        assert.equal(Object.isFrozen(definition.canonicalValues), true);
        assert.equal(Object.isFrozen(definition.valueStates), true);
        assert.equal(Object.isFrozen(definition.versionStates), true);
        assert.equal(Array.isArray(definition.unsupportedLegacyValues), true);
        assert.equal(Object.isFrozen(definition.unsupportedLegacyValues), true);
    }
);

runTest(
    "default registry exposes only the registry functions",
    () => {
        assert.deepStrictEqual(Object.keys(RiskRelevanceGovernanceRegistry), [
            "classifyRiskRelevanceValue",
            "classifyRiskRelevanceVersion",
            "getRiskRelevanceGovernanceDefinition"
        ]);
    }
);

runTest(
    "value and version outputs stay inside the registry boundary",
    () => {
        const valueResult = classifyRiskRelevanceValue("high");
        const versionResult = classifyRiskRelevanceVersion("risk-relevance-1.0");
        const forbiddenFields = [
            "concernCategory",
            "riskCategory",
            "riskConcern",
            "severity",
            "criticality",
            "redFlag",
            "reviewPriority",
            "score",
            "riskClass",
            "resultClassification",
            "interpretationEligible",
            "blocking",
            "auditRequired",
            "domainId",
            "provider",
            "router",
            "sourceReference",
            "hypothesisId"
        ];

        forbiddenFields.forEach((field) => {
            assert.equal(Object.hasOwn(valueResult, field), false);
            assert.equal(Object.hasOwn(versionResult, field), false);
        });
    }
);

console.log(`RiskRelevanceGovernanceRegistry tests completed successfully. Passed: ${passedTests}`);
