import ExpertIntelligenceTerminologyRegistry from "../ExpertIntelligenceTerminologyRegistry.js";

const DOMAIN_ID = "sanitary-systems";

export const SANITARY_SYSTEMS_SIGNAL_PRECEDENCE = Object.freeze([
    "visible-leakage-at-sanitary-component",
    "visible-corrosion-staining-or-moisture",
    "damaged-or-loose-sanitary-fixture",
    "possible-drainage-restriction-indicator",
    "unpleasant-odour-near-sanitary-drainage",
    "missing-or-damaged-sanitary-seal",
    "possible-backflow-indication",
    "poor-support-or-protection-of-sanitary-pipework",
    "visible-deterioration-at-sanitary-connection"
]);

const CANONICAL_TERMS_BY_SIGNAL = Object.freeze({
    "visible-leakage-at-sanitary-component": Object.freeze(["sanitary component", "visible leakage", "dripping"]),
    "visible-corrosion-staining-or-moisture": Object.freeze(["sanitary component", "corrosion", "staining", "moisture"]),
    "damaged-or-loose-sanitary-fixture": Object.freeze(["sanitary fixture", "damage", "loose fixture"]),
    "possible-drainage-restriction-indicator": Object.freeze(["sanitary drain", "slow drainage", "backing up"]),
    "unpleasant-odour-near-sanitary-drainage": Object.freeze(["sanitary drain", "unpleasant odour", "trap"]),
    "missing-or-damaged-sanitary-seal": Object.freeze(["sanitary seal", "missing seal", "damaged seal"]),
    "possible-backflow-indication": Object.freeze(["sanitary drain", "backflow indication", "reverse flow"]),
    "poor-support-or-protection-of-sanitary-pipework": Object.freeze(["sanitary pipework", "poor support", "pipe support"]),
    "visible-deterioration-at-sanitary-connection": Object.freeze(["sanitary connection", "visible deterioration", "damaged fitting"])
});

export default class SanitarySystemsTerminologyAdapter {

    static adapt(input = {}) {
        const source = cloneValue(input);

        if (!ExpertIntelligenceTerminologyRegistry.hasDomainEvidence(DOMAIN_ID, source)) {
            return {
                input: source,
                canonicalContext: null
            };
        }

        const matchedSignalIds = collectMatchedSignalIds(source);
        const terms = collectCanonicalTerms(matchedSignalIds);

        if (!terms.length) {
            return {
                input: source,
                canonicalContext: null
            };
        }

        return {
            input: source,
            canonicalContext: {
                domainId: DOMAIN_ID,
                matchedSignalIds: [...matchedSignalIds],
                terms: [...terms]
            }
        };
    }

}

function collectMatchedSignalIds(source = {}) {
    const sourceText = textOf(source);

    return SANITARY_SYSTEMS_SIGNAL_PRECEDENCE.filter((signalId) => {
        return ExpertIntelligenceTerminologyRegistry.hasSignal(DOMAIN_ID, signalId, sourceText);
    });
}

function collectCanonicalTerms(matchedSignalIds = []) {
    const terms = [];

    matchedSignalIds.forEach((signalId) => {
        cloneArray(CANONICAL_TERMS_BY_SIGNAL[signalId]).forEach((term) => {
            if (!terms.includes(term)) {
                terms.push(term);
            }
        });
    });

    return terms;
}

function cloneArray(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.map((entry) => cloneValue(entry));
}

function cloneValue(value) {
    if (value === undefined) {
        return undefined;
    }

    return JSON.parse(JSON.stringify(value));
}

function textOf(value) {
    if (typeof value === "string") {
        return value;
    }

    if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
    }

    if (!value || typeof value !== "object") {
        return "";
    }

    if (Array.isArray(value)) {
        return value.map((entry) => textOf(entry)).join(" ");
    }

    return Object.values(value).map((entry) => textOf(entry)).join(" ");
}