/**
 * MBLS Expert Intelligence Layer
 * Vertical Transportation Systems Knowledge Provider
 *
 * Deterministic, pure, immutable provider for visually observable elevator,
 * lift, escalator, and moving walkway conditions. The provider stays within
 * visual inspection limits and does not establish operational or lifecycle
 * status.
 */

import { RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION } from "../risk/RiskRelevanceGovernanceRegistry.js";

const EMPTY_CONTRACT = Object.freeze({
    domain: "vertical-transportation-systems",
    hypotheses: []
});

const HYPOTHESES = [
    h("lift-door-entrance-visible-condition", "visible condition affecting lift entrance or door component", "visual vertical transportation hypothesis", ["damaged landing door", "damaged elevator landing door", "damaged car door", "damaged lift door", "elevator landing door damaged", "door sill damaged", "damaged door sill", "door track damaged", "shaft door damaged", "uneven landing door", "damaged lift entrance"], ["lift entrance, landing door, car door, sill, or track condition is visually observed", "access, movement, or operation may be impaired by the observed condition", "visual inspection alone cannot establish operational condition"], ["door and entrance components are visually intact during follow-up", "reported door is visibly unrelated to vertical transportation equipment"], ["Document door, sill, track, and entrance location.", "Further specialist inspection may be appropriate before operation conclusions.", "The extent and significance cannot be determined visually."], ["possible access disruption", "possible increased maintenance attention", "possible operational delay if the condition persists"], ["Record visible lift entrance and door condition.", "Keep conclusions limited to observed component condition.", "Request qualified review where door movement, sill, track, or alignment appears impaired."], "high", "medium", "medium"),
    h("lift-car-cabin-visible-damage", "visible damage or deterioration inside lift car or cabin", "visual vertical transportation hypothesis", ["lift car damaged", "elevator cabin damaged", "damaged lift car panel", "damaged elevator cabin panel", "damaged panel", "loose cabin panel", "missing cabin cover", "cabin staining", "lift car deterioration", "elevator cabin deterioration"], ["lift car or elevator cabin damage is visually observed", "loose, missing, stained, or deteriorated cabin elements may affect intended use", "visual inspection alone cannot establish operational condition"], ["cabin finishes and visible panels are intact during follow-up", "reported panel is visibly unrelated to vertical transportation equipment"], ["Document lift car or cabin element, location, and visible condition.", "Accessible components should be examined further where looseness or missing covers are observed.", "Further technical assessment may be appropriate."], ["possible increased maintenance attention", "possible user access disruption", "possible progressive deterioration if condition persists"], ["Record visible cabin condition without extending beyond visual evidence.", "Keep findings specific to observed panels, covers, staining, or deterioration.", "Request specialist follow-up where loose or missing components are observed."], "medium", "medium", "medium"),
    h("lift-pit-shaft-or-machinery-leakage", "visible leakage or contamination near lift pit shaft or machinery", "visual vertical transportation hypothesis", ["visible leakage at lift machinery", "hydraulic oil leakage", "lift pit leakage", "elevator pit leakage", "staining at lift pit", "debris in lift pit", "lift shaft staining", "elevator shaft staining", "machine room leakage", "drive unit leakage"], ["leakage, staining, or debris is visually observed near lift pit, shaft, machine room, or machinery", "the observed condition may affect intended performance", "visual inspection alone cannot determine source or significance"], ["pit, shaft, and machinery areas are visually dry and clear during follow-up", "reported leakage is visibly unrelated to vertical transportation equipment"], ["Document location, visible material, staining, and nearby components.", "Further specialist inspection may be appropriate to determine source and extent.", "Avoid contact with machinery or contaminated material during visual review."], ["possible increased maintenance attention", "possible local contamination", "possible access or operation impact if condition persists"], ["Record visible leakage, staining, or debris condition.", "Keep source and significance open pending specialist assessment.", "Request qualified review where leakage or debris is observed near lift equipment."], "high", "medium", "medium"),
    h("lift-machinery-or-control-panel-visible-condition", "visible condition affecting lift machinery or control panel", "visual vertical transportation hypothesis", ["lift machinery damaged", "drive unit damaged", "traction equipment damaged", "hydraulic lift component damaged", "lift control panel damaged", "lift control panel missing cover", "machine room component damaged", "missing access cover", "loose machinery component", "corroded lift machinery"], ["machinery, drive unit, hydraulic component, or control panel condition is visually observed", "access, movement, or operation may be impaired by the observed condition", "visual inspection alone cannot establish operational condition"], ["machinery and control panel components are visually intact during follow-up", "reported component is visibly unrelated to vertical transportation equipment"], ["Document equipment type, location, visible cover condition, and access constraints.", "Further technical assessment may be appropriate before operation conclusions.", "Accessible components should be examined further by qualified personnel."], ["possible increased maintenance attention", "possible access limitation", "possible intended performance concern if condition persists"], ["Record visible machinery or control panel condition.", "Do not infer operation status from visual review alone.", "Request qualified follow-up where covers, corrosion, looseness, or damage are observed."], "high", "medium", "medium"),
    h("lift-controls-indicators-or-communication-condition", "visible condition affecting lift controls indicators or communication unit", "visual vertical transportation hypothesis", ["landing call button damaged", "damaged call button", "damaged lift button", "floor indicator damaged", "damaged indicator", "emergency communication unit damaged", "missing button cover", "loose call button", "lift control button damaged", "elevator button damaged"], ["button, indicator, or communication unit condition is visually observed", "access, indication, or communication may be impaired by the observed condition", "visual inspection alone cannot establish operation"], ["controls, indicators, and communication units are visually intact during follow-up", "reported device is visibly unrelated to lift or elevator controls"], ["Document device type, location, and visible condition.", "Further specialist inspection may be appropriate before operation conclusions.", "The observed condition warrants further technical assessment."], ["possible user access disruption", "possible wayfinding or communication limitation", "possible increased maintenance attention"], ["Record visible controls, indicators, or communication-unit condition.", "Keep conclusions limited to observed damage, looseness, or missing covers.", "Request qualified review where user interface components appear impaired."], "high", "medium", "medium"),
    h("platform-wheelchair-or-stair-lift-visible-condition", "visible condition affecting platform wheelchair or stair lift", "visual vertical transportation hypothesis", ["platform lift damaged", "wheelchair lift damaged", "stair lift damaged", "service lift damaged", "goods lift damaged", "freight elevator damaged", "platform lift obstruction", "wheelchair lift missing cover", "stair lift loose component", "service lift visible deterioration"], ["platform, wheelchair, stair, service, goods, or freight lift condition is visually observed", "access, movement, or operation may be impaired by the observed condition", "visual inspection alone cannot establish operational condition"], ["lift components are visually intact and unobstructed during follow-up", "reported equipment is visibly unrelated to building vertical transportation"], ["Document lift type, location, obstruction, and visible component condition.", "Further specialist inspection may be appropriate before operation conclusions.", "Accessible components should be examined further where looseness or missing covers are observed."], ["possible accessibility impact", "possible access disruption", "possible increased maintenance attention"], ["Record visible platform, wheelchair, stair, service, goods, or freight lift condition.", "Keep conclusions within visual-inspection limits.", "Request qualified review where access, movement, or component condition appears impaired."], "high", "medium", "medium"),
    h("escalator-or-moving-walkway-component-condition", "visible condition affecting escalator or moving walkway component", "visual vertical transportation hypothesis", ["escalator step damaged", "damaged escalator step", "escalator comb plate damaged", "damaged comb plate", "escalator skirt panel damaged", "damaged skirt panel", "moving walkway belt damaged", "damaged moving walkway belt", "escalator obstruction", "moving walkway obstruction"], ["escalator or moving walkway component condition is visually observed", "movement or access may be impaired by the observed condition", "visual inspection alone cannot establish operational condition"], ["steps, comb plate, skirt panel, belt, and access areas are visually intact during follow-up", "reported component is visibly unrelated to escalator or moving walkway equipment"], ["Document component, location, and visible obstruction or damage.", "Further specialist inspection may be appropriate before operation conclusions.", "The extent and significance cannot be determined visually."], ["possible access disruption", "possible increased maintenance attention", "possible intended performance concern if condition persists"], ["Record visible escalator or moving walkway condition.", "Keep conclusions limited to observed components and access condition.", "Request qualified follow-up where steps, comb plates, skirt panels, belts, or obstructions appear impaired."], "high", "medium", "medium"),
    h("vertical-transportation-handrail-threshold-or-seal-condition", "visible condition affecting vertical transportation handrail threshold or seal", "visual vertical transportation hypothesis", ["damaged escalator handrail", "escalator handrail damaged", "damaged moving walkway handrail", "damaged lift threshold", "damaged elevator threshold", "damaged lift seal", "damaged elevator seal", "door threshold damaged", "handrail visible deterioration", "threshold visible deterioration"], ["handrail, threshold, or seal condition is visually observed at vertical transportation equipment", "access, movement, or intended use may be impaired by the observed condition", "visual inspection alone cannot establish operational condition"], ["handrail, threshold, and seal components are visually intact during follow-up", "reported handrail or threshold is visibly unrelated to vertical transportation equipment"], ["Document affected handrail, threshold, or seal component and location.", "Further specialist inspection may be appropriate before significance is assigned.", "Accessible components should be examined further where damage or deterioration is observed."], ["possible user access disruption", "possible increased maintenance attention", "possible progression of visible deterioration"], ["Record visible handrail, threshold, or seal condition.", "Keep conclusions limited to observed deterioration or damage.", "Request qualified review where handrail, threshold, or seal condition appears impaired."], "medium", "medium", "medium")
];

const COMPONENT_TERMS = [
    "elevator", "passenger elevator", "goods lift", "freight elevator", "service lift", "platform lift", "wheelchair lift", "stair lift", "escalator", "moving walkway", "lift car", "elevator cabin", "lift landing", "lift entrance", "landing door", "car door", "lift door", "door sill", "door track", "shaft door", "lift shaft", "elevator shaft", "lift pit", "elevator pit", "machine room", "lift machinery", "drive unit", "traction equipment", "hydraulic lift component", "lift control panel", "landing call button", "floor indicator", "emergency communication unit", "escalator handrail", "moving walkway handrail", "escalator step", "escalator comb plate", "comb plate", "escalator skirt panel", "skirt panel", "moving walkway belt", "lift threshold", "elevator threshold", "lift seal", "elevator seal", "vertical transportation equipment"
];

const ISSUE_TERMS = [
    "visible leakage", "leakage", "hydraulic oil leakage", "corrosion", "corroded", "impact damage", "damaged panel", "damaged door", "damaged", "loose component", "loose", "missing cover", "damaged button", "damaged indicator", "staining", "debris accumulation", "debris", "obstruction", "obstructed", "uneven alignment", "uneven", "visible deterioration", "deteriorated", "damaged seal", "damaged threshold", "damaged handrail", "damaged step", "missing access cover", "missing", "defect", "defective"
];

const FALSE_POSITIVE_CONTEXTS = [
    "construction crane", "forklift", "vehicle lift", "car jack", "warehouse lifting equipment", "lifting sling", "lifting beam", "hoist advertisement", "lift advertisement", "manufacturer brochure", "product brochure", "maintenance schedule", "inspection record", "statutory inspection", "operational certificate", "inspection certificate", "load test", "brake test", "emergency brake test", "overspeed governor test", "door force test", "electrical test", "hydraulic pressure test", "functional acceptance", "address information", "marketing", "advertisement", "listing", "brand name", "model name"
];

export default class VerticalTransportationSystemsKnowledgeProvider {

    /**
     * Return deterministic knowledge for visually observable vertical transportation findings.
     *
     * @param {Object} [input={}] - Knowledge input payload.
     * @returns {Object} Stable vertical-transportation-systems knowledge contract.
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
            domain: "vertical-transportation-systems",
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
        textOf(source.building.verticalTransportationSystemType).trim().length > 0 ||
        textOf(source.building.elevatorType).trim().length > 0 ||
        textOf(source.building.escalatorType).trim().length > 0 ||
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
        textOf(source.building.verticalTransportationSystemType),
        textOf(source.building.elevatorType),
        textOf(source.building.escalatorType)
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

    if (/\b(lift|elevator|escalator|walkway)\b/.test(evidence) && !COMPONENT_TERMS.some((term) => containsWord(evidence, term))) {
        return false;
    }

    const hasComponent = COMPONENT_TERMS.some((term) => containsWord(evidence, term));
    const hasIssue = ISSUE_TERMS.some((term) => containsWord(evidence, term));

    if (hasComponent && hasIssue) {
        return true;
    }

    return containsAny(evidence, [
        "damaged elevator landing door",
        "damaged lift door",
        "damaged escalator handrail",
        "damaged escalator step",
        "hydraulic oil leakage",
        "damaged landing call button",
        "damaged moving walkway belt",
        "debris in lift pit",
        "missing access cover at lift machinery"
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

    if (id === "lift-door-entrance-visible-condition" && containsAny(text, ["damaged landing door", "damaged elevator landing door", "damaged car door", "damaged lift door", "door sill damaged", "door track damaged", "shaft door damaged"])) score += 10;
    if (id === "lift-car-cabin-visible-damage" && containsAny(text, ["lift car damaged", "elevator cabin damaged", "damaged lift car panel", "damaged elevator cabin panel", "loose cabin panel"])) score += 10;
    if (id === "lift-pit-shaft-or-machinery-leakage" && containsAny(text, ["visible leakage at lift machinery", "hydraulic oil leakage", "lift pit leakage", "elevator pit leakage", "debris in lift pit"])) score += 10;
    if (id === "lift-machinery-or-control-panel-visible-condition" && containsAny(text, ["lift machinery damaged", "drive unit damaged", "traction equipment damaged", "hydraulic lift component damaged", "lift control panel damaged", "missing access cover"])) score += 10;
    if (id === "lift-controls-indicators-or-communication-condition" && containsAny(text, ["landing call button damaged", "damaged call button", "damaged lift button", "floor indicator damaged", "emergency communication unit damaged"])) score += 10;
    if (id === "platform-wheelchair-or-stair-lift-visible-condition" && containsAny(text, ["platform lift damaged", "wheelchair lift damaged", "stair lift damaged", "service lift damaged", "goods lift damaged", "freight elevator damaged"])) score += 10;
    if (id === "escalator-or-moving-walkway-component-condition" && containsAny(text, ["escalator step damaged", "escalator comb plate damaged", "escalator skirt panel damaged", "moving walkway belt damaged", "escalator obstruction"])) score += 10;
    if (id === "vertical-transportation-handrail-threshold-or-seal-condition" && containsAny(text, ["damaged escalator handrail", "damaged moving walkway handrail", "damaged lift threshold", "damaged elevator threshold", "damaged lift seal"])) score += 10;

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
