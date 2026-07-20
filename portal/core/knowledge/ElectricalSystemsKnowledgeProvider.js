/**
 * MBLS Expert Intelligence Layer
 * Electrical Systems Knowledge Provider
 *
 * Deterministic, pure, immutable provider for visually observable electrical
 * system conditions. The provider does not diagnose, certify compliance,
 * confirm safety status, or mandate repair or replacement.
 */

import { RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION } from "../risk/RiskRelevanceGovernanceRegistry.js";

const EMPTY_CONTRACT = Object.freeze({
    domain: "electrical-systems",
    hypotheses: []
});

const HYPOTHESES = [
    h("visible-thermal-stress-indication", "visible thermal stress or overheating indicators", "visual electrical hypothesis", ["visible overheating marks", "overheating marks", "scorching", "scorch marks", "discoloration", "heat discoloration", "thermal stress", "burn mark", "brown marks"], ["visible discoloration or scorching is reported at an electrical component", "overheating-related marks may be associated with prior thermal stress", "visual inspection alone is insufficient to confirm the technical cause"], ["marks are confirmed to be unrelated surface contamination", "component is tested and assessed by a qualified electrical specialist without abnormal thermal indication"], ["Document the affected component and location.", "Further electrical inspection may be appropriate before assigning cause.", "Condition cannot be confirmed without testing by a qualified electrical specialist."], ["increased need for specialist review", "possible deterioration of affected component", "potential interruption of electrical service if the condition progresses"], ["Record visible marks without inferring confirmed overheating.", "Keep the finding within visual-inspection limits.", "Request qualified electrical assessment where thermal marks remain unexplained."], "high", "medium", "medium"),
    h("damaged-or-incomplete-electrical-enclosure", "damaged or incomplete electrical enclosure", "visual electrical hypothesis", ["damaged cover", "missing cover", "missing enclosure cover", "damaged electrical enclosure", "open electrical panel", "broken consumer unit cover", "missing fuse box cover", "damaged distribution board cover"], ["cover or enclosure condition is visibly incomplete or damaged", "enclosure condition may reduce protection of internal components", "direct functional relevance requires electrical verification"], ["cover is intact and correctly secured", "reported damage is unrelated to electrical equipment"], ["Inspect the visible cover, enclosure, and accessible fixings.", "Verify whether internal components remain protected without touching live parts.", "Further electrical inspection may be appropriate before defining repair scope."], ["reduced component protection", "increased maintenance demand", "possible exposure of internal equipment to dust or impact"], ["Document the enclosure and missing or damaged cover condition.", "Avoid opening or manipulating energized equipment during visual review.", "Request qualified electrical follow-up where protection appears incomplete."], "medium", "medium", "medium"),
    h("exposed-or-insufficiently-protected-conductors", "exposed or insufficiently protected conductors", "visual electrical hypothesis", ["exposed conductor", "exposed conductors", "visible bare wire", "bare conductor", "unprotected conductor", "open cable end", "cable insulation damaged", "damaged insulation on wiring"], ["visible conductor exposure or insulation damage is reported", "conductor protection may be incomplete", "condition cannot be confirmed without testing and safe access"], ["conductors are enclosed and insulation appears intact", "visible item is not part of the electrical installation"], ["Do not touch exposed or uncertain conductors during visual inspection.", "Document the location and extent of visible exposure.", "Qualified electrical inspection may be appropriate before use or intervention decisions."], ["increased need for immediate specialist review", "possible service interruption until assessed", "restricted safe access to the affected area"], ["Record the visible condition and access context.", "Keep conclusions limited to visible conductor protection.", "Escalate for qualified electrical assessment where exposure is observed."], "high", "medium", "medium"),
    h("moisture-or-corrosion-related-electrical-deterioration", "visible corrosion or moisture-related electrical deterioration", "visual electrical hypothesis", ["corrosion in electrical panel", "corroded electrical component", "rust in fuse box", "moisture near electrical panel", "water marks near consumer unit", "condensation in electrical enclosure", "moisture proximity", "corroded junction box"], ["corrosion or moisture proximity is reported near electrical equipment", "visible deterioration may be associated with environmental exposure", "electrical condition requires verification beyond visual observation"], ["corrosion is superficial and unrelated to electrical components", "moisture source is confirmed absent after specialist assessment"], ["Document corrosion, staining, or moisture proximity with location context.", "Identify visible moisture source indicators without inferring electrical failure.", "Further electrical inspection may be appropriate where moisture and electrical equipment are adjacent."], ["accelerated component deterioration", "increased maintenance demand", "possible interruption of affected electrical equipment"], ["Record the visible relationship between moisture and electrical components.", "Avoid attributing internal failure from moisture proximity alone.", "Coordinate moisture-source review and qualified electrical assessment where relevant."], "high", "medium", "medium"),
    h("temporary-or-poorly-supported-wiring", "temporary or poorly supported wiring", "visual electrical hypothesis", ["temporary wiring", "loose cable", "unsupported cable", "poor cable support", "hanging cable", "improvised wiring", "cable not supported", "temporary cable run"], ["wiring or cable support appears temporary or incomplete", "poor cable support may affect durability or protection", "installation intent cannot be confirmed from visual inspection alone"], ["cables are permanently fixed and adequately supported", "reported temporary item is not part of the building electrical installation"], ["Document cable route, support condition, and apparent temporary arrangement.", "Verify installation intent and documentation where available.", "Further electrical inspection may be appropriate before classifying the arrangement."], ["increased maintenance demand", "possible mechanical damage to cable runs", "reduced reliability of the visible arrangement"], ["Record visible cable support irregularities.", "Do not infer installation non-compliance from appearance alone.", "Request qualified review if temporary wiring appears to serve building use."], "medium", "low", "medium"),
    h("damaged-socket-or-switch-component", "damaged socket or switch component", "visual electrical hypothesis", ["damaged socket", "cracked socket", "broken socket", "loose socket", "damaged switch", "cracked switch", "broken switch", "loose switch", "socket cover damaged", "switch cover damaged"], ["socket or switch damage is visually reported", "component cover or fixing condition may be impaired", "functional condition cannot be confirmed without electrical testing"], ["socket or switch is intact and securely fixed", "damage relates to adjacent finish only"], ["Inspect the visible socket or switch cover without removing components.", "Document looseness, cracking, or missing parts.", "Qualified electrical testing may be appropriate before continued use decisions."], ["increased maintenance demand", "possible loss of service at the affected point", "further deterioration of the component"], ["Record the affected outlet or switch location.", "Avoid confirming internal failure from visible cover damage alone.", "Request qualified electrical follow-up where the component is loose or damaged."], "medium", "low", "medium"),
    h("unclear-or-missing-circuit-labeling", "unclear or missing circuit labeling", "documentation and operation hypothesis", ["missing circuit labeling", "unclear circuit labeling", "unlabeled circuit breaker", "unlabelled circuit breaker", "missing label", "unclear labels", "distribution board labeling missing", "fuse box labels missing"], ["circuit or distribution labeling is reported missing or unclear", "unclear labeling may affect maintenance and isolation procedures", "label accuracy cannot be confirmed without circuit tracing"], ["labels are complete and verified against circuits", "label issue relates to non-electrical storage or signage"], ["Review visible labels at the distribution board or consumer unit.", "Verify labels against documentation where available.", "Circuit identification should be confirmed by a qualified electrical specialist where needed."], ["reduced maintainability", "longer fault isolation or maintenance time", "increased operational uncertainty"], ["Document missing or unclear labels.", "Do not infer circuit function from labels alone.", "Recommend label verification only after qualified circuit identification."], "low", "low", "low"),
    h("aged-or-visibly-deteriorated-electrical-components", "aged or visibly deteriorated electrical components", "age-related visual hypothesis", ["aged electrical component", "old fuse box", "old consumer unit", "aged wiring", "deteriorated wiring", "brittle cable", "old circuit breaker", "visible age-related deterioration"], ["age or visible deterioration is reported in electrical components", "older visible components may require condition verification", "age alone is insufficient to confirm functional condition"], ["older components are assessed as serviceable by qualified testing", "age metadata exists without observed deterioration"], ["Document visible age-related condition indicators.", "Review available maintenance or inspection records.", "Further electrical inspection may be appropriate before lifecycle or CAPEX conclusions."], ["future maintenance demand", "possible component deterioration", "increased need for condition-based planning"], ["Do not infer lifecycle action from age alone.", "Record only visible deterioration and available context.", "Use qualified assessment before lifecycle decisions."], "medium", "medium", "medium"),
    h("possible-overloaded-extension-or-adapter-arrangement", "possible overloaded extension or adapter arrangement", "visual electrical hypothesis", ["overloaded adapter", "overloaded extension", "multiple extension leads", "daisy chained extension", "many plugs in adapter", "extension lead cluster", "multi plug adapter overloaded", "temporary extension leads"], ["multiple extension leads or adapters are visibly concentrated", "arrangement may be associated with high plug load or temporary use", "actual circuit loading cannot be confirmed without testing"], ["extension arrangement is temporary and removed", "load assessment shows no concern under qualified testing"], ["Document the visible adapter or extension arrangement.", "Do not infer circuit overload from plug count alone.", "Further electrical inspection may be appropriate where concentrated loads are observed."], ["increased operational management need", "possible nuisance interruption", "increased maintenance attention for the affected area"], ["Record adapter type, location, and visible plug concentration.", "Avoid confirmed overload conclusions without electrical testing.", "Review whether permanent socket provision is adequate for observed use."], "medium", "low", "medium"),
    h("visible-grounding-or-bonding-irregularity", "visible grounding or bonding irregularity", "verification-required electrical hypothesis", ["loose grounding conductor", "loose earthing conductor", "missing bonding conductor", "bonding conductor disconnected", "grounding conductor damaged", "earthing conductor damaged", "visible bonding irregularity", "earth wire loose"], ["grounding or bonding conductor condition is visibly irregular", "bonding continuity cannot be confirmed by visual inspection alone", "further electrical inspection may be appropriate"], ["bonding conductor is intact and verified by qualified testing", "reported conductor is unrelated to grounding or bonding"], ["Document visible grounding or bonding conductor condition.", "Do not test or manipulate conductors during visual inspection.", "Qualified electrical testing is required before confirming continuity or function."], ["increased need for specialist verification", "possible operational uncertainty for protective measures", "maintenance follow-up requirement"], ["Record the visible conductor and connection context.", "Avoid confirming loss of grounding or bonding from visual observation alone.", "Escalate to qualified electrical assessment where a conductor appears loose, missing, or damaged."], "high", "medium", "medium")
];

const ELECTRICAL_COMPONENT_TERMS = [
    "electrical", "distribution board", "electrical panel", "consumer unit", "fuse box", "circuit breaker", "breaker", "residual current device", "rcd", "socket outlet", "socket", "switch", "wiring", "wire", "cable", "junction box", "electrical enclosure", "enclosure", "grounding", "earthing", "bonding", "grounding conductor", "earthing conductor", "bonding conductor", "conductor", "extension lead", "extension leads", "adapter", "adapters"
];

const ELECTRICAL_ISSUE_TERMS = [
    "visible overheating", "overheating", "thermal stress", "scorching", "scorch", "burn mark", "discoloration", "damaged", "damage", "missing cover", "open", "broken", "cracked", "exposed", "bare", "unprotected", "loose", "corrosion", "corroded", "rust", "moisture", "water marks", "condensation", "temporary", "unsupported", "poor cable support", "hanging", "overloaded", "daisy chained", "multiple extension", "missing label", "missing labeling", "unclear label", "unlabeled", "unlabelled", "aged", "old", "deteriorated", "brittle", "missing bonding", "disconnected"
];

const FALSE_POSITIVE_CONTEXTS = [
    "electrical address", "electrical color", "electrical colour", "decorative switch", "light switch style", "switch room", "switching room", "network switch", "software switch", "vehicle wiring", "appliance cable only", "phone charger", "temporary event wiring", "marketing", "brand name", "model name"
];

export default class ElectricalSystemsKnowledgeProvider {

    /**
     * Return deterministic knowledge for visually observable electrical findings.
     *
     * @param {Object} [input={}] - Knowledge input payload.
     * @returns {Object} Stable electrical-systems knowledge contract.
     */
    static getKnowledge(input = {}) {
        const source = normalizeInput(input);

        if (!hasSufficientInput(source)) {
            return EMPTY_CONTRACT;
        }

        const context = buildContext(source);

        if (!isRelevantContext(context)) {
            return EMPTY_CONTRACT;
        }

        const ranked = HYPOTHESES
            .map((entry, index) => ({
                entry,
                index,
                score: scoreHypothesis(entry, context)
            }))
            .filter((item) => item.score > 0)
            .sort((left, right) => {
                if (right.score !== left.score) {
                    return right.score - left.score;
                }

                return left.index - right.index;
            });

        if (ranked.length === 0) {
            return EMPTY_CONTRACT;
        }

        return {
            domain: "electrical-systems",
            hypotheses: ranked.map((item) => toHypothesis(item.entry))
        };
    }

}

function h(id, cause, classification, keywords, supportingIndicators, contradictingIndicators, requiredVerification, potentialConsequences, recommendedActions, riskRelevance, capexRelevance, valuationRelevance) {
    return {
        id,
        cause,
        classification,
        keywords,
        supportingIndicators,
        contradictingIndicators,
        requiredVerification,
        potentialConsequences,
        recommendedActions,
        riskRelevance,
        capexRelevance,
        valuationRelevance
    };
}

function normalizeInput(input) {
    const source = cloneObject(input);

    return {
        finding: cloneObject(source.finding),
        building: cloneObject(source.building),
        measurements: cloneArray(source.measurements)
    };
}

function hasSufficientInput(source) {
    return Boolean(
        textOf(source.finding.category).trim().length > 0 ||
        textOf(source.finding.location).trim().length > 0 ||
        textOf(source.finding.description).trim().length > 0 ||
        textOf(source.finding.observations).trim().length > 0 ||
        textOf(source.building.electricalSystemType).trim().length > 0 ||
        textOf(source.building.electricalInstallationAge).trim().length > 0 ||
        textOf(source.building.maintenanceStatus).trim().length > 0 ||
        source.measurements.length > 0
    );
}

function buildContext(source) {
    const findingText = [
        textOf(source.finding.category),
        textOf(source.finding.location),
        textOf(source.finding.description),
        textOf(source.finding.observations)
    ].join(" ").toLowerCase();

    const buildingText = [
        textOf(source.building.electricalSystemType),
        textOf(source.building.electricalInstallationAge),
        textOf(source.building.maintenanceStatus)
    ].join(" ").toLowerCase();

    const measurementText = source.measurements
        .map((measurement) => [
            textOf(measurement.type),
            textOf(measurement.value),
            textOf(measurement.unit),
            textOf(measurement.location)
        ].join(" "))
        .join(" ")
        .toLowerCase();

    const evidenceText = [findingText, measurementText].join(" ").trim();

    return {
        text: [findingText, buildingText, measurementText].join(" ").trim(),
        evidenceText,
        findingText,
        buildingText,
        measurementText
    };
}

function isRelevantContext(context) {
    const evidence = context.evidenceText;

    if (evidence.length === 0) {
        return false;
    }

    if (FALSE_POSITIVE_CONTEXTS.some((term) => containsWord(evidence, term))) {
        return false;
    }

    if (/\b(label|labels|labeling|labelling)\b/.test(evidence) && !/electrical|distribution board|electrical panel|consumer unit|fuse box|circuit breaker|breaker/.test(evidence)) {
        return false;
    }

    if (/\b(moisture|water|condensation|corrosion|rust)\b/.test(evidence) && !ELECTRICAL_COMPONENT_TERMS.some((term) => containsWord(evidence, term))) {
        return false;
    }

    const hasComponent = ELECTRICAL_COMPONENT_TERMS.some((term) => containsWord(evidence, term));
    const hasIssue = ELECTRICAL_ISSUE_TERMS.some((term) => containsWord(evidence, term));

    if (hasComponent && hasIssue) {
        return true;
    }

    return containsAny(evidence, [
        "visible overheating marks",
        "missing circuit labeling",
        "missing circuit labelling",
        "exposed conductors",
        "temporary wiring",
        "overloaded adapter",
        "overloaded extension",
        "loose grounding conductor",
        "loose earthing conductor",
        "missing bonding conductor"
    ]);
}

function scoreHypothesis(entry, context) {
    let score = 0;

    entry.keywords.forEach((keyword) => {
        if (containsWord(context.evidenceText, keyword)) {
            score += 5;
        }

        if (containsWord(context.findingText, keyword)) {
            score += 2;
        }

        if (containsWord(context.measurementText, keyword)) {
            score += 2;
        }

        if (containsWord(context.buildingText, keyword)) {
            score += 1;
        }
    });

    score += scoreDomainSignals(entry.id, context.evidenceText);

    return score;
}

function scoreDomainSignals(id, text) {
    let score = 0;

    if (id === "visible-thermal-stress-indication" && containsAny(text, ["visible overheating marks", "scorching", "scorch marks", "heat discoloration", "thermal stress"])) score += 10;
    if (id === "damaged-or-incomplete-electrical-enclosure" && containsAny(text, ["missing cover", "damaged cover", "open electrical panel", "missing fuse box cover", "damaged distribution board cover"])) score += 10;
    if (id === "exposed-or-insufficiently-protected-conductors" && containsAny(text, ["exposed conductor", "exposed conductors", "visible bare wire", "bare conductor", "damaged insulation on wiring"])) score += 10;
    if (id === "moisture-or-corrosion-related-electrical-deterioration" && containsAny(text, ["corrosion in electrical panel", "corroded electrical component", "moisture near electrical panel", "water marks near consumer unit", "condensation in electrical enclosure"])) score += 10;
    if (id === "temporary-or-poorly-supported-wiring" && containsAny(text, ["temporary wiring", "unsupported cable", "poor cable support", "hanging cable", "temporary cable run"])) score += 10;
    if (id === "damaged-socket-or-switch-component" && containsAny(text, ["damaged socket", "cracked socket", "loose socket", "damaged switch", "broken switch"])) score += 10;
    if (id === "unclear-or-missing-circuit-labeling" && containsAny(text, ["missing circuit labeling", "unclear circuit labeling", "unlabeled circuit breaker", "distribution board labeling missing", "fuse box labels missing"])) score += 10;
    if (id === "aged-or-visibly-deteriorated-electrical-components" && containsAny(text, ["aged electrical component", "old fuse box", "old consumer unit", "aged wiring", "visible age-related deterioration"])) score += 10;
    if (id === "possible-overloaded-extension-or-adapter-arrangement" && containsAny(text, ["overloaded adapter", "overloaded extension", "multiple extension leads", "daisy chained extension", "many plugs in adapter"])) score += 10;
    if (id === "visible-grounding-or-bonding-irregularity" && containsAny(text, ["loose grounding conductor", "loose earthing conductor", "missing bonding conductor", "bonding conductor disconnected", "earth wire loose"])) score += 10;

    return score;
}

function toHypothesis(entry) {
    return {
        id: entry.id,
        cause: entry.cause,
        classification: entry.classification,
        supportingIndicators: [...entry.supportingIndicators],
        contradictingIndicators: [...entry.contradictingIndicators],
        requiredVerification: [...entry.requiredVerification],
        potentialConsequences: [...entry.potentialConsequences],
        recommendedActions: [...entry.recommendedActions],
        riskRelevance: entry.riskRelevance,
        riskRelevanceVersion: RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION,
        capexRelevance: entry.capexRelevance,
        valuationRelevance: entry.valuationRelevance
    };
}

function cloneObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return {};
    }

    return { ...value };
}

function cloneArray(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.map((item) => cloneObject(item));
}

function textOf(value) {
    if (Array.isArray(value)) {
        return value.map((item) => textOf(item)).join(" ");
    }

    if (value && typeof value === "object") {
        return Object.values(value).map((item) => textOf(item)).join(" ");
    }

    if (value === null || value === undefined) {
        return "";
    }

    return String(value);
}

function containsAny(text, terms) {
    return terms.some((term) => containsWord(text, term));
}

function containsWord(text, term) {
    const escaped = escapeRegExp(term.toLowerCase()).replace(/\\\s+/g, "\\s+");
    return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(text);
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
