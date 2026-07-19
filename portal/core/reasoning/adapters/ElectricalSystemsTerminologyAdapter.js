import ExpertIntelligenceTerminologyRegistry from "../ExpertIntelligenceTerminologyRegistry.js";

const DOMAIN_ID = "electrical-systems";

export const ELECTRICAL_SYSTEMS_SIGNAL_PRECEDENCE = Object.freeze([
    "visible-thermal-stress-indication",
    "damaged-or-incomplete-electrical-enclosure",
    "exposed-or-insufficiently-protected-conductors",
    "moisture-or-corrosion-related-electrical-deterioration",
    "temporary-or-poorly-supported-wiring",
    "damaged-socket-or-switch-component",
    "unclear-or-missing-circuit-labeling",
    "aged-or-visibly-deteriorated-electrical-components",
    "possible-overloaded-extension-or-adapter-arrangement",
    "visible-grounding-or-bonding-irregularity"
]);

const CANONICAL_TERMS_BY_SIGNAL = Object.freeze({
    "visible-thermal-stress-indication": Object.freeze(["electrical component", "visible overheating marks", "scorching"]),
    "damaged-or-incomplete-electrical-enclosure": Object.freeze(["electrical enclosure", "missing cover", "damaged cover"]),
    "exposed-or-insufficiently-protected-conductors": Object.freeze(["electrical conductor", "exposed conductor", "damaged insulation"]),
    "moisture-or-corrosion-related-electrical-deterioration": Object.freeze(["electrical equipment", "corrosion", "moisture proximity"]),
    "temporary-or-poorly-supported-wiring": Object.freeze(["electrical wiring", "temporary wiring", "poor cable support"]),
    "damaged-socket-or-switch-component": Object.freeze(["socket or switch", "damaged socket", "damaged switch"]),
    "unclear-or-missing-circuit-labeling": Object.freeze(["circuit labeling", "missing circuit labeling", "unclear circuit labeling"]),
    "aged-or-visibly-deteriorated-electrical-components": Object.freeze(["electrical component", "age-related deterioration", "deteriorated wiring"]),
    "possible-overloaded-extension-or-adapter-arrangement": Object.freeze(["extension lead arrangement", "overloaded adapter", "multiple extension leads"]),
    "visible-grounding-or-bonding-irregularity": Object.freeze(["grounding or bonding conductor", "loose grounding conductor", "missing bonding conductor"])
});

export default class ElectricalSystemsTerminologyAdapter {

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

    return ELECTRICAL_SYSTEMS_SIGNAL_PRECEDENCE.filter((signalId) => {
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