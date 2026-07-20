const RISK_RELEVANCE_GOVERNANCE_VERSION = "risk-relevance-governance-1.0";
const RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION = "risk-relevance-1.0";

const RISK_RELEVANCE_VALUES = Object.freeze({
    LOW_RELEVANCE: "LOW_RELEVANCE",
    MODERATE_RELEVANCE: "MODERATE_RELEVANCE",
    HIGH_RELEVANCE: "HIGH_RELEVANCE"
});

const RISK_RELEVANCE_VALUE_STATES = Object.freeze({
    CANONICAL: "CANONICAL",
    LEGACY_SUPPORTED: "LEGACY_SUPPORTED",
    LEGACY_UNSUPPORTED: "LEGACY_UNSUPPORTED",
    UNKNOWN_VALUE: "UNKNOWN_VALUE",
    INVALID_VALUE: "INVALID_VALUE",
    NOT_PRESENT: "NOT_PRESENT"
});

const RISK_RELEVANCE_VERSION_STATES = Object.freeze({
    VERSION_SUPPORTED: "VERSION_SUPPORTED",
    UNKNOWN_VERSION: "UNKNOWN_VERSION",
    VERSION_UNSUPPORTED: "VERSION_UNSUPPORTED"
});

const CANONICAL_VALUES = Object.freeze(new Set(Object.values(RISK_RELEVANCE_VALUES)));

const SUPPORTED_LEGACY_VALUES = Object.freeze({
    low: RISK_RELEVANCE_VALUES.LOW_RELEVANCE,
    medium: RISK_RELEVANCE_VALUES.MODERATE_RELEVANCE,
    moderate: RISK_RELEVANCE_VALUES.MODERATE_RELEVANCE,
    high: RISK_RELEVANCE_VALUES.HIGH_RELEVANCE
});

const UNSUPPORTED_LEGACY_VALUES = Object.freeze(new Set([
    "critical",
    "safety_relevant",
    "safety-critical",
    "safety_critical",
    "very high",
    "very_high",
    "not assessed",
    "not_assessed",
    "not applicable",
    "not_applicable"
]));

const UNKNOWN_TOKENS = Object.freeze(new Set([
    "unknown",
    "UNKNOWN",
    "UNKNOWN_RELEVANCE"
]));

function classifyRiskRelevanceValue(rawValue, options = {}) {
    const valuePresent = isPresent(options);

    if (!valuePresent) {
        return freezeResult({
            rawValue: preserveRawValue(rawValue),
            canonicalValue: null,
            valueState: RISK_RELEVANCE_VALUE_STATES.NOT_PRESENT
        });
    }

    if (CANONICAL_VALUES.has(rawValue)) {
        return freezeResult({
            rawValue,
            canonicalValue: rawValue,
            valueState: RISK_RELEVANCE_VALUE_STATES.CANONICAL
        });
    }

    if (typeof rawValue === "string") {
        if (Object.hasOwn(SUPPORTED_LEGACY_VALUES, rawValue)) {
            return freezeResult({
                rawValue,
                canonicalValue: SUPPORTED_LEGACY_VALUES[rawValue],
                valueState: RISK_RELEVANCE_VALUE_STATES.LEGACY_SUPPORTED
            });
        }

        if (UNSUPPORTED_LEGACY_VALUES.has(rawValue)) {
            return freezeResult({
                rawValue,
                canonicalValue: null,
                valueState: RISK_RELEVANCE_VALUE_STATES.LEGACY_UNSUPPORTED
            });
        }

        if (rawValue.length === 0 || rawValue.trim().length === 0 || UNKNOWN_TOKENS.has(rawValue)) {
            return freezeResult({
                rawValue,
                canonicalValue: null,
                valueState: RISK_RELEVANCE_VALUE_STATES.UNKNOWN_VALUE
            });
        }

        return freezeResult({
            rawValue,
            canonicalValue: null,
            valueState: RISK_RELEVANCE_VALUE_STATES.INVALID_VALUE
        });
    }

    if (rawValue === undefined || rawValue === null) {
        return freezeResult({
            rawValue,
            canonicalValue: null,
            valueState: RISK_RELEVANCE_VALUE_STATES.UNKNOWN_VALUE
        });
    }

    return freezeResult({
        rawValue: preserveRawValue(rawValue),
        canonicalValue: null,
        valueState: RISK_RELEVANCE_VALUE_STATES.INVALID_VALUE
    });
}

function classifyRiskRelevanceVersion(sourceVersion, options = {}) {
    if (!isPresent(options)) {
        return freezeResult({
            sourceVersion: preserveRawValue(sourceVersion),
            versionState: RISK_RELEVANCE_VERSION_STATES.UNKNOWN_VERSION,
            governanceVersion: RISK_RELEVANCE_GOVERNANCE_VERSION
        });
    }

    if (sourceVersion === RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION) {
        return freezeResult({
            sourceVersion,
            versionState: RISK_RELEVANCE_VERSION_STATES.VERSION_SUPPORTED,
            governanceVersion: RISK_RELEVANCE_GOVERNANCE_VERSION
        });
    }

    if (typeof sourceVersion === "string") {
        if (sourceVersion.length === 0 || sourceVersion.trim().length === 0) {
            return freezeResult({
                sourceVersion,
                versionState: RISK_RELEVANCE_VERSION_STATES.UNKNOWN_VERSION,
                governanceVersion: RISK_RELEVANCE_GOVERNANCE_VERSION
            });
        }

        return freezeResult({
            sourceVersion,
            versionState: RISK_RELEVANCE_VERSION_STATES.VERSION_UNSUPPORTED,
            governanceVersion: RISK_RELEVANCE_GOVERNANCE_VERSION
        });
    }

    if (sourceVersion === undefined || sourceVersion === null) {
        return freezeResult({
            sourceVersion,
            versionState: RISK_RELEVANCE_VERSION_STATES.UNKNOWN_VERSION,
            governanceVersion: RISK_RELEVANCE_GOVERNANCE_VERSION
        });
    }

    return freezeResult({
        sourceVersion: preserveRawValue(sourceVersion),
        versionState: RISK_RELEVANCE_VERSION_STATES.VERSION_UNSUPPORTED,
        governanceVersion: RISK_RELEVANCE_GOVERNANCE_VERSION
    });
}

function getRiskRelevanceGovernanceDefinition() {
    return freezeResult({
        governanceVersion: RISK_RELEVANCE_GOVERNANCE_VERSION,
        supportedSourceVersion: RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION,
        canonicalValues: RISK_RELEVANCE_VALUES,
        valueStates: RISK_RELEVANCE_VALUE_STATES,
        versionStates: RISK_RELEVANCE_VERSION_STATES,
        supportedLegacyValues: SUPPORTED_LEGACY_VALUES,
        unsupportedLegacyValues: Object.freeze([...UNSUPPORTED_LEGACY_VALUES])
    });
}

function isPresent(options) {
    return readBooleanOption(options, "isPresent") !== false;
}

function preserveRawValue(value) {
    return value;
}

function readBooleanOption(options, key) {
    if (!options || (typeof options !== "object" && typeof options !== "function")) {
        return undefined;
    }

    try {
        const descriptor = Object.getOwnPropertyDescriptor(options, key);

        if (!descriptor || !Object.hasOwn(descriptor, "value")) {
            return undefined;
        }

        return descriptor.value === true || descriptor.value === false
            ? descriptor.value
            : undefined;
    } catch {
        return undefined;
    }
}

function freezeResult(result) {
    return Object.freeze(result);
}

const RiskRelevanceGovernanceRegistry = Object.freeze({
    classifyRiskRelevanceValue,
    classifyRiskRelevanceVersion,
    getRiskRelevanceGovernanceDefinition
});

export {
    RISK_RELEVANCE_GOVERNANCE_VERSION,
    RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION,
    RISK_RELEVANCE_VALUES,
    RISK_RELEVANCE_VALUE_STATES,
    RISK_RELEVANCE_VERSION_STATES,
    classifyRiskRelevanceValue,
    classifyRiskRelevanceVersion,
    getRiskRelevanceGovernanceDefinition
};

export default RiskRelevanceGovernanceRegistry;
