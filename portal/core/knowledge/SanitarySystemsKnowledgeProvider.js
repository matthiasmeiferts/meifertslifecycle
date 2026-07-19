/**
 * MBLS Expert Intelligence Layer
 * Sanitary Systems Knowledge Provider
 *
 * Deterministic, pure, immutable provider for visually observable sanitary
 * system conditions. The provider does not diagnose water quality, certify
 * function, conclude regulatory compliance, or mandate repair or replacement.
 */

const EMPTY_CONTRACT = Object.freeze({
    domain: "sanitary-systems",
    hypotheses: []
});

const HYPOTHESES = [
    h("visible-leakage-at-sanitary-component", "visible leakage around sanitary component", "visual sanitary hypothesis", ["visible leakage", "leaking pipe", "leaking valve", "leaking fitting", "water leak", "dripping", "active drip", "leakage at trap", "leakage at connection"], ["visible leakage is reported at or near a sanitary component", "water escape may indicate a local joint, fitting, or component condition", "visual inspection alone cannot confirm the internal cause"], ["reported water is confirmed to originate from a non-sanitary source", "component is dry during follow-up review"], ["Document the affected component, location, and visible moisture extent.", "Further inspection may be appropriate before assigning cause.", "Avoid opening concealed sanitary components during visual review."], ["possible local deterioration of adjacent finishes", "increased maintenance attention", "possible interruption of fixture use if the condition progresses"], ["Record visible leakage without treating it as pipe failure.", "Keep conclusions within visual-inspection limits.", "Request qualified sanitary review where leakage remains unexplained."], "high", "medium", "medium"),
    h("visible-corrosion-staining-or-moisture", "visible corrosion, staining, or moisture around sanitary components", "visual sanitary hypothesis", ["corrosion", "corroded pipe", "rust staining", "staining", "water staining", "moisture around sanitary", "moisture around pipe", "moisture around fixture", "damp around trap"], ["corrosion, staining, or moisture is visually observed near sanitary components", "surface condition may indicate repeated wetting or local deterioration", "visual inspection alone cannot confirm source or progression"], ["staining is confirmed to be unrelated surface contamination", "sanitary components are dry and visually intact at follow-up"], ["Document staining, corrosion, and moisture proximity with location context.", "Check adjacent visible sanitary components for related evidence.", "Further inspection may be appropriate where moisture and sanitary components coincide."], ["possible deterioration of adjacent materials", "increased maintenance demand", "possible concealed moisture extension if unresolved"], ["Record visible staining and moisture relationship to sanitary components.", "Avoid attributing concealed failure from staining alone.", "Coordinate moisture-source review where sanitary components are adjacent."], "medium", "medium", "medium"),
    h("damaged-or-loose-sanitary-fixture", "damaged or loose sanitary fixture", "visual sanitary hypothesis", ["damaged fixture", "damaged wash basin", "damaged sink", "damaged toilet", "damaged urinal", "damaged shower", "damaged bathtub", "cracked basin", "cracked toilet", "loose fixture", "loose toilet", "loose basin", "loose sink"], ["fixture damage or looseness is visually reported", "fixture condition may affect serviceability or adjacent seals", "functional condition cannot be confirmed from appearance alone"], ["fixture is intact and securely fixed", "reported damage relates to adjacent finish only"], ["Inspect visible fixture surfaces and accessible fixings without dismantling.", "Document cracks, looseness, or damaged visible parts.", "Further sanitary inspection may be appropriate before defining scope."], ["increased maintenance demand", "possible localized leakage at fixture interfaces", "possible temporary limitation of fixture use"], ["Record the affected fixture and visible condition.", "Do not infer concealed connection failure from fixture damage alone.", "Request qualified follow-up where fixture movement or damage is observed."], "medium", "medium", "medium"),
    h("possible-drainage-restriction-indicator", "possible drainage restriction indicator", "visual and operational sanitary hypothesis", ["blocked drain", "slow drainage", "slow draining", "standing water in fixture", "water backing up", "gurgling drain", "floor drain blocked", "trap blocked", "drain obstruction"], ["blocked or slow drainage is reported at a sanitary fixture or drain", "observable drainage behavior may indicate a local restriction", "visual inspection alone cannot confirm blockage location or cause"], ["drainage is observed as normal during follow-up", "reported condition is confirmed to be unrelated to sanitary drainage"], ["Document the affected fixture or drain and observed drainage behavior.", "Further inspection may be appropriate before locating a restriction.", "Avoid concluding concealed pipe condition without additional evidence."], ["possible reduced fixture usability", "increased maintenance attention", "possible local overflow if drainage worsens"], ["Describe the observed drainage symptom without confirming blockage.", "Keep findings separate from CCTV or pressure-test conclusions.", "Request sanitary specialist review where symptoms persist."], "medium", "low", "medium"),
    h("unpleasant-odour-near-sanitary-drainage", "unpleasant odour near sanitary drainage component", "visual and sensory sanitary hypothesis", ["unpleasant odour", "unpleasant odor", "sewer odour", "sewer odor", "drain smell", "odour at floor drain", "odor at floor drain", "trap odour", "trap odor"], ["odour is reported near a drain, trap, or sanitary fixture", "odour may indicate a trap, vent, or drainage condition requiring verification", "visual inspection alone cannot confirm internal drainage cause"], ["odour is absent during follow-up", "odour source is confirmed unrelated to sanitary drainage"], ["Record the location and sanitary component near the odour report.", "Check visible trap, drain, and fixture context where accessible.", "Further inspection may be appropriate before assigning cause."], ["possible occupant nuisance", "increased maintenance attention", "possible need for fixture or trap review"], ["Report odour as an observed condition, not a confirmed drainage defect.", "Avoid indoor air or contamination conclusions without testing.", "Request follow-up where odour persists near sanitary components."], "low", "low", "medium"),
    h("missing-or-damaged-sanitary-seal", "missing or damaged sanitary seal", "visual sanitary hypothesis", ["missing seal", "damaged seal", "failed seal", "seal gap", "sealant missing", "sealant damaged", "damaged connection seal", "missing trap seal"], ["seal condition is reported missing, damaged, or discontinuous", "seal condition may affect splash water control or odour separation", "visual inspection alone cannot confirm concealed connection condition"], ["seal is continuous and intact", "reported gap is unrelated to sanitary fixture or connection"], ["Document the affected seal, connection, or fixture interface.", "Check visible adjacent staining or moisture where accessible.", "Further sanitary inspection may be appropriate before defining repair scope."], ["possible local moisture exposure", "increased maintenance need", "possible odour or splash-water nuisance"], ["Record visible seal condition without inferring concealed failure.", "Avoid compliance or replacement conclusions from visual seal condition alone.", "Request qualified follow-up where seal discontinuity is associated with moisture."], "medium", "low", "medium"),
    h("possible-backflow-indication", "possible backflow indication at sanitary drain", "visual and operational sanitary hypothesis", ["backflow indication", "backflow at drain", "water backing up", "wastewater backing up", "reverse flow", "overflow from floor drain", "floor drain overflow", "toilet backing up"], ["backflow-like behavior is reported at a sanitary drain or fixture", "observed reverse flow may indicate a drainage or surcharge condition", "visual inspection alone cannot confirm system cause or extent"], ["no reverse flow is observed during follow-up", "condition is confirmed to originate outside the sanitary system"], ["Document the affected drain or fixture and observed direction of water movement.", "Review whether the condition is local or repeated where information is available.", "Further sanitary inspection may be appropriate before assigning cause."], ["possible temporary loss of fixture use", "increased hygiene-related maintenance attention", "possible local water damage if repeated"], ["Use possible backflow wording only where observable behavior is reported.", "Do not confirm blockage or system failure from visual evidence alone.", "Request qualified review where reverse flow is observed."], "high", "medium", "medium"),
    h("poor-support-or-protection-of-sanitary-pipework", "poor support or protection of sanitary pipework", "visual sanitary hypothesis", ["poor support", "unsupported pipe", "loose pipe support", "missing pipe support", "sagging pipe", "damaged pipe insulation", "missing pipe insulation", "poorly supported drain pipe", "pipe support damaged"], ["pipe support or insulation condition is visually irregular", "poor support or protection may affect durability or alignment", "installation adequacy cannot be confirmed from visual inspection alone"], ["pipework is adequately supported and protected", "reported support relates to non-sanitary services"], ["Document visible pipe support, sagging, or insulation condition.", "Review accessible pipe route and support context without dismantling.", "Further inspection may be appropriate before classifying installation quality."], ["possible increased maintenance demand", "possible local movement of pipework", "possible deterioration of visible insulation or supports"], ["Record visible support or protection irregularities.", "Do not infer code compliance from visual support condition alone.", "Request qualified sanitary review if service pipework appears unsupported."], "medium", "medium", "medium"),
    h("visible-deterioration-at-sanitary-connection", "visible deterioration at sanitary connection", "visual sanitary hypothesis", ["damaged connection", "loose connection", "deteriorated connection", "visible deterioration", "deteriorated fitting", "damaged fitting", "damaged valve", "loose valve", "corroded fitting"], ["connection, valve, or fitting deterioration is visually reported", "visible deterioration may indicate increased maintenance need", "visual inspection alone cannot confirm internal service condition"], ["connection and fitting are intact during follow-up", "reported deterioration is unrelated to sanitary services"], ["Document the affected connection, valve, or fitting.", "Check for visible moisture, staining, or movement where accessible.", "Further sanitary inspection may be appropriate before lifecycle conclusions."], ["possible localized leakage if deterioration progresses", "increased maintenance demand", "possible service interruption during future works"], ["Record visible connection condition without treating it as pipe failure.", "Avoid mandated lifecycle action wording from visual deterioration alone.", "Use qualified assessment before lifecycle decisions."], "medium", "medium", "medium")
];

const SANITARY_COMPONENT_TERMS = [
    "sanitary", "sanitary system", "water supply pipe", "drinking water pipe", "waste water pipe", "wastewater pipe", "drain pipe", "soil stack", "vent pipe", "sanitary fixture", "wash basin", "basin", "sink", "toilet", "urinal", "shower", "bathtub", "bath tub", "floor drain", "trap", "valve", "fitting", "pipe support", "pipe insulation", "pipework", "sanitary pipe", "drain", "fixture", "connection"
];

const SANITARY_ISSUE_TERMS = [
    "visible leakage", "leakage", "leaking", "water leak", "dripping", "corrosion", "corroded", "rust", "staining", "moisture", "damaged", "damage", "broken", "cracked", "loose", "blocked", "slow drainage", "slow draining", "unpleasant odour", "unpleasant odor", "odour", "odor", "missing seal", "damaged seal", "seal gap", "backflow", "backing up", "overflow", "damaged connection", "poor support", "unsupported", "sagging", "visible deterioration", "deteriorated", "defect", "defective"
];

const FALSE_POSITIVE_CONTEXTS = [
    "water quality", "laboratory analysis", "legionella", "pressure testing", "pressure test", "cctv inspection", "functional certification", "utility bill", "water bill", "drinking water discussion", "plumbing company advertisement", "plumbing advertisement", "contractor address", "address information", "product specification", "specification only", "marketing", "brand name", "model name"
];

export default class SanitarySystemsKnowledgeProvider {

    /**
     * Return deterministic knowledge for visually observable sanitary findings.
     *
     * @param {Object} [input={}] - Knowledge input payload.
     * @returns {Object} Stable sanitary-systems knowledge contract.
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
            domain: "sanitary-systems",
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
        textOf(source.building.sanitarySystemType).trim().length > 0 ||
        textOf(source.building.plumbingSystemType).trim().length > 0 ||
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
        textOf(source.building.sanitarySystemType),
        textOf(source.building.plumbingSystemType),
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

    if (/\b(drinking water|water supply)\b/.test(evidence) && !/pipe|valve|fitting|leak|leaking|leakage|corrosion|staining|moisture|damaged|loose|deteriorated|defect/.test(evidence)) {
        return false;
    }

    if (/\b(odour|odor|smell)\b/.test(evidence) && !/drain|trap|toilet|urinal|sink|basin|shower|floor drain|sanitary/.test(evidence)) {
        return false;
    }

    const hasComponent = SANITARY_COMPONENT_TERMS.some((term) => containsWord(evidence, term));
    const hasIssue = SANITARY_ISSUE_TERMS.some((term) => containsWord(evidence, term));

    if (hasComponent && hasIssue) {
        return true;
    }

    return containsAny(evidence, [
        "visible leakage at trap",
        "blocked floor drain",
        "slow drainage at sink",
        "unpleasant odour at floor drain",
        "missing seal at toilet",
        "backflow at drain",
        "unsupported sanitary pipe",
        "damaged sanitary fixture"
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

    if (id === "visible-leakage-at-sanitary-component" && containsAny(text, ["visible leakage", "leaking pipe", "leaking valve", "leakage at trap", "leakage at connection"])) score += 10;
    if (id === "visible-corrosion-staining-or-moisture" && containsAny(text, ["corrosion", "rust staining", "water staining", "moisture around pipe", "moisture around fixture"])) score += 10;
    if (id === "damaged-or-loose-sanitary-fixture" && containsAny(text, ["damaged fixture", "damaged wash basin", "damaged sink", "damaged toilet", "loose fixture", "loose toilet", "cracked basin"])) score += 10;
    if (id === "possible-drainage-restriction-indicator" && containsAny(text, ["blocked drain", "slow drainage", "slow draining", "water backing up", "floor drain blocked", "trap blocked"])) score += 10;
    if (id === "unpleasant-odour-near-sanitary-drainage" && containsAny(text, ["unpleasant odour", "unpleasant odor", "sewer odour", "sewer odor", "drain smell", "odour at floor drain", "odor at floor drain"])) score += 10;
    if (id === "missing-or-damaged-sanitary-seal" && containsAny(text, ["missing seal", "damaged seal", "seal gap", "sealant missing", "damaged connection seal", "missing trap seal"])) score += 10;
    if (id === "possible-backflow-indication" && containsAny(text, ["backflow indication", "backflow at drain", "water backing up", "wastewater backing up", "floor drain overflow", "toilet backing up"])) score += 10;
    if (id === "poor-support-or-protection-of-sanitary-pipework" && containsAny(text, ["poor support", "unsupported pipe", "missing pipe support", "sagging pipe", "damaged pipe insulation", "poorly supported drain pipe"])) score += 10;
    if (id === "visible-deterioration-at-sanitary-connection" && containsAny(text, ["damaged connection", "loose connection", "deteriorated connection", "damaged fitting", "damaged valve", "corroded fitting"])) score += 10;

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