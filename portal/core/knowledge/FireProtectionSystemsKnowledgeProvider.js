/**
 * MBLS Expert Intelligence Layer
 * Fire Protection Systems Knowledge Provider
 *
 * Deterministic, pure, immutable provider for visually observable fire
 * protection and escape-route conditions. The provider stays within visual
 * inspection limits and does not establish operational or lifecycle status.
 */

import { RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION } from "../risk/RiskRelevanceGovernanceRegistry.js";

const EMPTY_CONTRACT = Object.freeze({
    domain: "fire-protection-systems",
    hypotheses: []
});

const HYPOTHESES = [
    h("damaged-or-obstructed-portable-fire-equipment", "damaged or obstructed portable fire protection equipment", "visual fire protection hypothesis", ["fire extinguisher damaged", "damaged fire extinguisher", "extinguisher cabinet damaged", "missing extinguisher sign", "obstructed fire extinguisher", "obstructed extinguisher cabinet", "fire hose reel damaged", "fire hydrant damaged", "corroded fire hydrant", "loose fire extinguisher"], ["portable fire protection equipment is visually damaged, obstructed, corroded, or missing signage", "access or operation may be impaired by the observed condition", "visual inspection alone cannot establish operational condition"], ["equipment is accessible and visually intact during follow-up", "reported condition is visibly unrelated to fire protection equipment"], ["Document the affected equipment, location, and access condition.", "Further specialist inspection may be appropriate before assigning cause.", "Visual inspection alone cannot establish operational condition."], ["possible reduced accessibility", "increased maintenance attention", "possible operational delay if the condition persists"], ["Record visible condition without establishing operational status.", "Keep conclusions within visual-inspection limits.", "Request specialist review where access or equipment condition appears impaired."], "high", "medium", "medium"),
    h("sprinkler-component-visible-condition", "visible condition affecting sprinkler component", "visual fire protection hypothesis", ["sprinkler head damaged", "displaced sprinkler head", "painted sprinkler head", "sprinkler head painted", "sprinkler pipe leaking", "leaking sprinkler pipe", "corroded sprinkler pipe", "loose sprinkler component", "sprinkler cover missing"], ["sprinkler head or pipe condition is visually reported", "the observed condition may affect intended performance", "visual inspection alone cannot establish sprinkler operation"], ["sprinkler components are visually intact and unobstructed", "reported pipe is visibly unrelated to sprinkler protection"], ["Document sprinkler component, location, and visible condition.", "Further specialist inspection may be appropriate before operation conclusions.", "Avoid manipulating sprinkler components during visual review."], ["possible need for specialist review", "increased maintenance demand", "possible local water damage if leakage persists"], ["Describe visible sprinkler condition without establishing operational status.", "Avoid pressure or flow conclusions from visual review alone.", "Request qualified review for displaced, painted, leaking, or damaged components."], "high", "medium", "medium"),
    h("fire-detection-or-alarm-component-visible-condition", "visible condition affecting fire detection or alarm component", "visual fire protection hypothesis", ["smoke detector damaged", "damaged smoke detector", "heat detector damaged", "fire alarm detector damaged", "manual call point damaged", "manual call point missing cover", "fire alarm panel damaged", "fire alarm panel missing cover", "loose detector", "missing detector cover"], ["fire detection or alarm component condition is visually reported", "access or operation may be impaired by visible damage or missing cover", "visual inspection alone cannot confirm detector or alarm function"], ["component is visually intact during follow-up", "reported device is unrelated to fire alarm or detection equipment"], ["Document the component, location, and visible condition.", "Further specialist inspection may be appropriate before operation conclusions.", "Do not infer alarm operation results from visual condition alone."], ["possible increased maintenance attention", "possible impaired operation if condition is confirmed", "possible need for specialist verification"], ["Record visible detector or alarm component condition.", "Avoid stating component operation from visual review alone.", "Request specialist follow-up where damage, missing cover, or looseness is observed."], "high", "medium", "medium"),
    h("fire-door-or-smoke-control-door-visible-condition", "visible condition affecting fire or smoke control door", "visual fire protection hypothesis", ["fire door damaged", "damaged fire door", "smoke control door damaged", "wedged-open fire door", "fire door wedged open", "damaged closer", "fire door closer damaged", "damaged fire door seal", "missing fire door seal", "emergency exit door damaged"], ["fire or smoke control door condition is visually reported", "door closure, sealing, or access may be impaired by the observed condition", "visual inspection alone cannot establish fire-resistance performance"], ["door is visually intact, closed, and unobstructed during follow-up", "reported door is not identified as fire or smoke control related"], ["Document door type, location, closer, seal, and obstruction condition.", "Further specialist inspection may be appropriate before performance conclusions.", "The extent and significance cannot be determined visually."], ["possible reduced compartmentation reliability", "increased maintenance attention", "possible operational impact during emergency use"], ["Record visible fire-door or smoke-control-door condition.", "Keep conclusions limited to observed door condition.", "Request qualified review where closure, seal, or access appears impaired."], "high", "medium", "medium"),
    h("escape-route-or-emergency-wayfinding-obstruction", "escape route or emergency wayfinding obstruction", "visual fire protection hypothesis", ["blocked escape route", "obstructed escape route", "escape route obstructed", "emergency exit blocked", "exit sign missing", "missing exit sign", "damaged exit sign", "emergency lighting damaged", "missing emergency lighting", "obstructed emergency exit door"], ["escape route, exit sign, or emergency lighting condition is visually reported", "access or wayfinding may be impaired by the observed condition", "visual inspection alone cannot establish emergency-use performance"], ["route is clear and signage or lighting is visually intact during follow-up", "reported obstruction is temporary and removed"], ["Document route, door, sign, or lighting location and visible condition.", "Further specialist inspection may be appropriate before emergency-use conclusions.", "Visual observation alone cannot establish route adequacy."], ["possible reduced route clarity", "possible access delay", "increased operational management attention"], ["Record visible obstruction or missing sign condition.", "Keep conclusions limited to observed access and wayfinding conditions.", "Request follow-up where access or emergency wayfinding appears impaired."], "high", "medium", "medium"),
    h("fire-compartmentation-or-penetration-seal-condition", "visible fire compartmentation or penetration seal condition", "visual fire protection hypothesis", ["fire compartment wall damaged", "fire stopping damaged", "fire stopping missing", "unsealed penetration", "penetration seal missing", "damaged penetration seal", "fire protection enclosure damaged", "fire-rated glazing damaged", "damaged fire-rated glazing"], ["fire compartmentation, fire stopping, or penetration seal condition is visually reported", "the observed condition may affect intended separation performance", "visual inspection alone cannot establish fire-resistance performance"], ["penetration seal or compartment element is visually intact during follow-up", "reported opening is visibly unrelated to fire compartmentation"], ["Document the wall, enclosure, glazing, or penetration location.", "Further specialist inspection may be appropriate before performance conclusions.", "The extent and significance cannot be determined visually."], ["possible need for specialist compartmentation review", "increased maintenance or documentation demand", "possible reduced intended separation if condition is verified"], ["Record visible compartmentation or seal condition.", "Keep conclusions limited to observed completeness and visible condition.", "Request qualified review where penetration or fire stopping appears incomplete."], "high", "medium", "medium"),
    h("fire-or-smoke-damper-visible-condition", "visible condition affecting fire or smoke damper", "visual fire protection hypothesis", ["fire damper damaged", "damaged fire damper", "smoke damper damaged", "damaged smoke damper", "fire damper access obstructed", "smoke damper access obstructed", "loose fire damper component", "corroded fire damper"], ["fire or smoke damper condition is visually reported", "access or operation may be impaired by the observed condition", "visual inspection alone cannot establish damper operation"], ["damper is visually intact and accessible during follow-up", "reported ventilation component is not fire or smoke damper related"], ["Document damper type, location, and visible access condition.", "Further specialist inspection may be appropriate before operation conclusions.", "The observed condition warrants further technical assessment."], ["possible need for specialist verification", "increased maintenance attention", "possible intended performance concern if condition is verified"], ["Record visible fire or smoke damper condition.", "Do not infer operation status from visual review alone.", "Request qualified follow-up where damage, corrosion, looseness, or obstruction is observed."], "high", "medium", "medium"),
    h("visible-corrosion-or-deterioration-of-fire-protection-component", "visible corrosion or deterioration of fire protection component", "visual fire protection hypothesis", ["corroded fire protection", "corrosion at fire protection", "fire protection component deteriorated", "visible deterioration", "loose component", "missing cover", "visible damage", "damaged fire protection enclosure", "corroded sprinkler pipe"], ["corrosion, missing cover, loose component, or visible deterioration is reported at fire protection equipment", "the observed condition may indicate increased maintenance need", "visual inspection alone cannot establish system performance"], ["component is visually intact and deterioration is not present during follow-up", "reported deterioration is unrelated to fire protection components"], ["Document visible deterioration and affected component.", "Check visible access, cover, and corrosion extent where safe.", "Further specialist inspection may be appropriate before lifecycle conclusions."], ["possible increased maintenance demand", "possible need for specialist verification", "possible local deterioration if condition progresses"], ["Record visible deterioration without establishing operational status.", "Avoid lifecycle directives from visual evidence alone.", "Use specialist assessment before lifecycle decisions."], "medium", "medium", "medium")
];

const FIRE_COMPONENT_TERMS = [
    "fire extinguisher", "extinguisher cabinet", "fire hose reel", "fire hydrant", "sprinkler head", "sprinkler pipe", "fire alarm detector", "smoke detector", "heat detector", "manual call point", "fire alarm panel", "fire door", "smoke control door", "emergency exit door", "escape route", "exit sign", "emergency lighting", "fire compartment wall", "fire stopping", "penetration seal", "fire damper", "smoke damper", "fire protection enclosure", "fire-rated glazing", "fire rated glazing", "fire protection component", "fire protection equipment"
];

const FIRE_ISSUE_TERMS = [
    "visible damage", "damaged", "broken", "corrosion", "corroded", "missing cover", "missing sign", "obstructed access", "obstructed", "blocked escape route", "blocked", "wedged-open", "wedged open", "damaged closer", "damaged seal", "missing seal", "unsealed penetration", "displaced sprinkler head", "painted sprinkler head", "leaking sprinkler pipe", "loose component", "loose", "visible deterioration", "deteriorated", "missing", "defect", "defective"
];

const FALSE_POSITIVE_CONTEXTS = [
    "fireplace", "domestic stove", "wood stove", "insurance", "fire brigade", "fire safety advertisement", "product catalogue", "product catalog", "maintenance record", "functional certification", "regulatory compliance", "legal compliance", "code compliance", "fire safety approval", "evacuation certification", "pressure testing", "alarm testing", "sprinkler testing", "detector functionality", "certification validity", "maintenance validity", "address information", "marketing", "brand name", "model name"
];

export default class FireProtectionSystemsKnowledgeProvider {

    /**
     * Return deterministic knowledge for visually observable fire protection findings.
     *
     * @param {Object} [input={}] - Knowledge input payload.
     * @returns {Object} Stable fire-protection-systems knowledge contract.
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
            domain: "fire-protection-systems",
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
        textOf(source.building.fireProtectionSystemType).trim().length > 0 ||
        textOf(source.building.fireAlarmSystemType).trim().length > 0 ||
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
        textOf(source.building.fireProtectionSystemType),
        textOf(source.building.fireAlarmSystemType),
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

    if (/\bfire\b/.test(evidence) && !FIRE_COMPONENT_TERMS.some((term) => containsWord(evidence, term))) {
        return false;
    }

    const hasComponent = FIRE_COMPONENT_TERMS.some((term) => containsWord(evidence, term));
    const hasIssue = FIRE_ISSUE_TERMS.some((term) => containsWord(evidence, term));

    if (hasComponent && hasIssue) {
        return true;
    }

    return containsAny(evidence, [
        "wedged open fire door",
        "unsealed penetration",
        "painted sprinkler head",
        "displaced sprinkler head",
        "leaking sprinkler pipe",
        "blocked escape route",
        "missing exit sign",
        "damaged fire damper",
        "damaged smoke detector"
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

    if (id === "damaged-or-obstructed-portable-fire-equipment" && containsAny(text, ["fire extinguisher damaged", "damaged fire extinguisher", "extinguisher cabinet damaged", "obstructed fire extinguisher", "fire hose reel damaged", "fire hydrant damaged"])) score += 10;
    if (id === "sprinkler-component-visible-condition" && containsAny(text, ["sprinkler head damaged", "displaced sprinkler head", "painted sprinkler head", "leaking sprinkler pipe", "corroded sprinkler pipe"])) score += 10;
    if (id === "fire-detection-or-alarm-component-visible-condition" && containsAny(text, ["smoke detector damaged", "heat detector damaged", "manual call point damaged", "fire alarm panel damaged", "missing detector cover"])) score += 10;
    if (id === "fire-door-or-smoke-control-door-visible-condition" && containsAny(text, ["fire door damaged", "damaged fire door", "wedged-open fire door", "fire door wedged open", "damaged closer", "damaged fire door seal"])) score += 10;
    if (id === "escape-route-or-emergency-wayfinding-obstruction" && containsAny(text, ["blocked escape route", "obstructed escape route", "emergency exit blocked", "missing exit sign", "emergency lighting damaged"])) score += 10;
    if (id === "fire-compartmentation-or-penetration-seal-condition" && containsAny(text, ["fire stopping damaged", "fire stopping missing", "unsealed penetration", "penetration seal missing", "fire-rated glazing damaged"])) score += 10;
    if (id === "fire-or-smoke-damper-visible-condition" && containsAny(text, ["fire damper damaged", "damaged fire damper", "smoke damper damaged", "damaged smoke damper", "fire damper access obstructed"])) score += 10;
    if (id === "visible-corrosion-or-deterioration-of-fire-protection-component" && containsAny(text, ["corroded fire protection", "corrosion at fire protection", "visible deterioration", "loose component", "missing cover", "visible damage"])) score += 10;

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
