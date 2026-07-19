import ExpertIntelligenceTerminologyRegistry from "../ExpertIntelligenceTerminologyRegistry.js";

const DOMAIN_ID = "windows-doors";

export const WINDOWS_DOORS_SIGNAL_PRECEDENCE = Object.freeze([
    "defective-perimeter-seal",
    "failed-installation-joint",
    "water-penetration-through-window-connection",
    "defective-exterior-door-seal",
    "defective-flashing-or-sill-connection",
    "failed-weather-seals",
    "defective-glazing-seal",
    "glazing-damage",
    "condensation-on-glazing-or-frame",
    "thermal-bridge-at-window-installation",
    "distorted-frame-or-sash",
    "defective-hardware-or-adjustment",
    "installation-workmanship-defect",
    "insufficient-maintenance",
    "age-related-deterioration",
    "air-leakage"
]);

const CANONICAL_TERMS_BY_SIGNAL = Object.freeze({
    "defective-perimeter-seal": Object.freeze(["window", "perimeter seal", "joint seal", "frame connection"]),
    "defective-glazing-seal": Object.freeze(["glazing", "edge seal"]),
    "failed-installation-joint": Object.freeze(["window", "installation joint", "frame connection"]),
    "defective-flashing-or-sill-connection": Object.freeze(["window", "sill", "flashing", "water ingress"]),
    "air-leakage": Object.freeze(["window", "draught", "air leakage"]),
    "water-penetration-through-window-connection": Object.freeze(["window", "frame connection", "water ingress"]),
    "thermal-bridge-at-window-installation": Object.freeze(["window", "thermal bridge", "surface temperature"]),
    "distorted-frame-or-sash": Object.freeze(["window", "frame", "sash", "operation issue"]),
    "defective-hardware-or-adjustment": Object.freeze(["window", "hardware", "operation issue"]),
    "failed-weather-seals": Object.freeze(["window", "weather seal", "gasket"]),
    "glazing-damage": Object.freeze(["glazing", "glass damage"]),
    "condensation-on-glazing-or-frame": Object.freeze(["window", "glazing", "condensation"]),
    "age-related-deterioration": Object.freeze(["window", "age", "maintenance"]),
    "insufficient-maintenance": Object.freeze(["window", "maintenance"]),
    "defective-exterior-door-seal": Object.freeze(["exterior door", "threshold seal", "draught"]),
    "installation-workmanship-defect": Object.freeze(["window", "installation", "workmanship"])
});

const SECONDARY_GENERIC_TERMS_BY_SIGNAL = Object.freeze({
    "air-leakage": Object.freeze(["draught"])
});

export default class WindowsDoorsTerminologyAdapter {

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

        const canonicalContext = {
            domainId: DOMAIN_ID,
            matchedSignalIds: [...matchedSignalIds],
            terms: [...terms]
        };

        return {
            input: source,
            canonicalContext
        };
    }

}

function collectMatchedSignalIds(source = {}) {
    const sourceText = textOf(source);

    return WINDOWS_DOORS_SIGNAL_PRECEDENCE.filter((signalId) => {
        return ExpertIntelligenceTerminologyRegistry.hasSignal(DOMAIN_ID, signalId, sourceText);
    });
}

function collectCanonicalTerms(matchedSignalIds = []) {
    const terms = [];
    const hasSpecificSignal = matchedSignalIds.some((signalId) => signalId !== "air-leakage");

    matchedSignalIds.forEach((signalId) => {
        const canonicalTerms = hasSpecificSignal && SECONDARY_GENERIC_TERMS_BY_SIGNAL[signalId]
            ? SECONDARY_GENERIC_TERMS_BY_SIGNAL[signalId]
            : CANONICAL_TERMS_BY_SIGNAL[signalId];

        cloneArray(canonicalTerms).forEach((term) => {
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