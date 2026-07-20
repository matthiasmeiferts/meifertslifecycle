/**
 * MBLS Expert Intelligence Layer
 * Facade and External Wall Systems Knowledge Provider
 *
 * Deterministic, pure, immutable provider for facade, render, cladding,
 * ETICS/EIFS, masonry facade, joint, anchor, coating, and weather-related
 * deterioration hypotheses.
 */

import { RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION } from "../risk/RiskRelevanceGovernanceRegistry.js";

const EMPTY_CONTRACT = Object.freeze({
    domain: "facade-wall-systems",
    hypotheses: []
});

const HYPOTHESES = [
    {
        id: "render-cracking",
        cause: "render cracking",
        classification: "render condition hypothesis",
        keywords: ["render crack", "render cracking", "cracked render", "hairline render", "facade crack"],
        supportingIndicators: [
            "visible cracking pattern in render layer",
            "localized fissures at rendered facade zones",
            "cracks concentrated in coating or render surface"
        ],
        contradictingIndicators: [
            "render surface appears continuous without cracking",
            "cracking clearly limited to non-render internal finishes"
        ],
        requiredVerification: [
            "Inspect crack width, extent, and distribution across rendered areas.",
            "Do not infer structural movement from render cracks alone.",
            "Check whether cracks are limited to finish layers or continue through substrate interfaces."
        ],
        potentialConsequences: [
            "progressive local finish deterioration",
            "increased moisture susceptibility at cracked zones",
            "recurring maintenance demand"
        ],
        recommendedActions: [
            "Document crack map with facade elevations.",
            "Review detail transitions where cracking concentrates.",
            "Plan remedial scope after verification of crack mechanism."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "detached-render",
        cause: "detached render",
        classification: "render bond hypothesis",
        keywords: ["detached render", "render detachment", "debonded render", "render delamination", "render separation"],
        supportingIndicators: [
            "render shows local separation from facade plane",
            "edge lifting or debonding visible at rendered areas",
            "detachment pattern consistent with loss of bond in render layer"
        ],
        contradictingIndicators: [
            "render appears fully bonded under close inspection",
            "distress confined to superficial discoloration only"
        ],
        requiredVerification: [
            "Inspect extent of detached render zones and interface condition.",
            "Do not infer substrate failure from detached render alone.",
            "Use targeted opening-up where bond condition cannot be verified visually."
        ],
        potentialConsequences: [
            "localized falling-material hazard",
            "accelerated weather exposure of underlying layers",
            "expanded repair scope if detachment progresses"
        ],
        recommendedActions: [
            "Document detached areas and edge conditions.",
            "Secure immediate risk zones where necessary.",
            "Sequence repair decisions after bond verification."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "hollow-render",
        cause: "hollow render",
        classification: "render sounding hypothesis",
        keywords: ["hollow render", "drummy render", "hollow sounding", "hollow spot", "render sounding"],
        supportingIndicators: [
            "hollow sounding response reported at render surface",
            "localized drummy areas identified during tapping checks",
            "hollow zones coincide with visible facade distress"
        ],
        contradictingIndicators: [
            "soundings indicate consistent bonded render response",
            "no hollow response identified at affected zones"
        ],
        requiredVerification: [
            "Map hollow sounding areas with systematic tapping checks.",
            "Treat hollow sounding as a hypothesis until detachment is verified.",
            "Differentiate isolated hollow spots from broader bond failure patterns."
        ],
        potentialConsequences: [
            "potential progression to local detachment",
            "increased maintenance and monitoring demand",
            "localized facade durability concerns"
        ],
        recommendedActions: [
            "Document sounding map with facade references.",
            "Reinspect hollow zones for change over time.",
            "Prioritize focused verification before repair scoping."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "facade-moisture-penetration",
        cause: "facade moisture penetration",
        classification: "weather-tightness hypothesis",
        keywords: ["facade moisture", "moisture penetration", "water ingress facade", "rain penetration", "seepage facade"],
        supportingIndicators: [
            "moisture pattern aligns with exterior facade exposure",
            "rain-related dampness reported at facade-adjacent zones",
            "staining or damp marks suggest external penetration path"
        ],
        contradictingIndicators: [
            "moisture pattern unrelated to exposed facade areas",
            "symptoms clearly tied to internal source only"
        ],
        requiredVerification: [
            "Correlate moisture pattern with weather exposure and facade detailing.",
            "Differentiate facade penetration from internal moisture sources.",
            "Use targeted inspection where concealed facade interfaces are suspected."
        ],
        potentialConsequences: [
            "ongoing moisture-related finish damage",
            "reduced facade durability over time",
            "expanded remedial scope if source remains unresolved"
        ],
        recommendedActions: [
            "Document ingress pattern and weather context.",
            "Inspect facade transitions, joints, and terminations.",
            "Plan interventions after source-path verification."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "defective-facade-joints",
        cause: "defective facade joints",
        classification: "joint continuity hypothesis",
        keywords: ["facade joint", "joint defect", "open joint", "failed facade joint", "joint discontinuity"],
        supportingIndicators: [
            "joint lines show discontinuity or opening",
            "distress pattern follows facade joint layout",
            "weather exposure symptoms concentrate at joint lines"
        ],
        contradictingIndicators: [
            "facade joints appear continuous and stable",
            "distress clearly unrelated to joint locations"
        ],
        requiredVerification: [
            "Inspect facade joint continuity, width, and condition.",
            "Verify whether symptoms align with defective joint paths.",
            "Review joint detailing against observed weather exposure."
        ],
        potentialConsequences: [
            "increased weather penetration susceptibility",
            "localized deterioration near joint lines",
            "recurring maintenance demand"
        ],
        recommendedActions: [
            "Document defective joint segments by elevation.",
            "Inspect adjacent facade materials for secondary distress.",
            "Define targeted remedial strategy after verification."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "defective-sealant-joints",
        cause: "defective sealant joints",
        classification: "sealant condition hypothesis",
        keywords: ["sealant", "mastic", "joint sealant", "sealant crack", "failed sealant"],
        supportingIndicators: [
            "sealant shows cracking, shrinkage, or loss of adhesion",
            "joint seal profile appears discontinuous or brittle",
            "localized weathering distress corresponds with failed sealant segments"
        ],
        contradictingIndicators: [
            "sealant remains continuous and elastic under inspection",
            "no signs of sealant deterioration at affected details"
        ],
        requiredVerification: [
            "Inspect sealant continuity, adhesion, and aging condition.",
            "Do not infer facade leakage from sealant failure alone.",
            "Differentiate sealant defects from movement-joint capacity issues."
        ],
        potentialConsequences: [
            "localized weather-tightness reduction",
            "accelerated deterioration at interface details",
            "recurring maintenance interventions"
        ],
        recommendedActions: [
            "Document failed sealant segments and substrate condition.",
            "Review joint movement and sealant compatibility.",
            "Plan resealing only after condition verification."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "etics-detachment",
        cause: "ETICS detachment",
        classification: "ETICS bond hypothesis",
        keywords: ["etics detachment", "eifs detachment", "detached etics", "detached eifs", "insulation board detachment"],
        supportingIndicators: [
            "external insulation layer shows separation indicators",
            "localized ETICS/EIFS plane irregularity suggests detachment",
            "detachment signs align with insulation composite zones"
        ],
        contradictingIndicators: [
            "ETICS/EIFS layer appears plane and consistently bonded",
            "distress confined to superficial coating weathering only"
        ],
        requiredVerification: [
            "Inspect ETICS/EIFS bond condition at representative locations.",
            "Differentiate detached insulation layer from coating-only defects.",
            "Use targeted opening-up where detachment cannot be verified visually."
        ],
        potentialConsequences: [
            "localized facade safety concerns",
            "reduced durability of insulation envelope",
            "higher intervention complexity if progression occurs"
        ],
        recommendedActions: [
            "Document suspected detachment areas and facade exposure.",
            "Secure risk zones if loose elements are suspected.",
            "Sequence remedial planning after verification."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "etics-moisture-damage",
        cause: "ETICS moisture damage",
        classification: "ETICS moisture hypothesis",
        keywords: ["etics moisture", "eifs moisture", "wet insulation", "moist etics", "moisture in eifs"],
        supportingIndicators: [
            "moisture-related distress appears within ETICS/EIFS zones",
            "insulation composite areas show dampness-related deterioration",
            "weather exposure and detail condition suggest ETICS moisture risk"
        ],
        contradictingIndicators: [
            "no moisture-related distress at ETICS/EIFS areas",
            "symptoms clearly unrelated to insulation composite system"
        ],
        requiredVerification: [
            "Treat ETICS moisture as a hypothesis pending verification.",
            "Inspect likely entry paths at ETICS terminations and joints.",
            "Use targeted intrusive or specialist checks where needed."
        ],
        potentialConsequences: [
            "decline in insulation system performance",
            "progressive facade deterioration",
            "expanded remedial scope if moisture persists"
        ],
        recommendedActions: [
            "Document affected ETICS areas and likely moisture paths.",
            "Review detailing at transitions, openings, and terminations.",
            "Plan intervention after verification of moisture mechanism."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "algae-or-biological-growth",
        cause: "algae or biological growth",
        classification: "biological growth hypothesis",
        keywords: ["algae", "biological growth", "biofilm", "green facade staining", "organic growth"],
        supportingIndicators: [
            "visible biological growth on facade surfaces",
            "staining pattern consistent with algae or biofilm",
            "growth concentrated at weather-exposed or persistently damp areas"
        ],
        contradictingIndicators: [
            "no biological growth signs on inspected facade areas",
            "discoloration appears non-biological under close inspection"
        ],
        requiredVerification: [
            "Inspect distribution and persistence of biological growth.",
            "Do not infer active moisture ingress from algae growth alone.",
            "Do not justify facade replacement based on biological growth alone."
        ],
        potentialConsequences: [
            "progressive facade soiling and visual degradation",
            "localized coating wear over time",
            "recurring cleaning and maintenance demand"
        ],
        recommendedActions: [
            "Document growth pattern by orientation and elevation.",
            "Review cleaning history and facade exposure context.",
            "Plan maintenance strategy after verification of contributing conditions."
        ],
        riskRelevance: "low",
        capexRelevance: "low",
        valuationRelevance: "medium"
    },
    {
        id: "coating-deterioration",
        cause: "coating deterioration",
        classification: "coating condition hypothesis",
        keywords: ["coating deterioration", "paint failure", "coating peel", "chalked coating", "coating weathering"],
        supportingIndicators: [
            "coating layer shows peeling, chalking, or erosion",
            "surface protection appears degraded on exposed facade zones",
            "coating distress pattern matches weathered elevations"
        ],
        contradictingIndicators: [
            "coating remains intact and adherent across affected zones",
            "distress pattern indicates substrate issue only without coating degradation"
        ],
        requiredVerification: [
            "Inspect coating adhesion and weathering state across elevations.",
            "Differentiate coating deterioration from substrate bond defects.",
            "Verify whether deterioration is localized or widespread."
        ],
        potentialConsequences: [
            "reduced facade surface protection",
            "accelerated weathering of underlying layers",
            "increasing maintenance frequency"
        ],
        recommendedActions: [
            "Document coating failures with representative photos.",
            "Review maintenance and recoating history.",
            "Define remedial coating scope after verification."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "freeze-thaw-deterioration",
        cause: "freeze-thaw deterioration",
        classification: "weathering mechanism hypothesis",
        keywords: ["freeze-thaw", "frost damage", "frost spalling", "winter weathering", "freeze thaw cycle"],
        supportingIndicators: [
            "material distress pattern consistent with freeze-thaw exposure",
            "surface scaling or spalling at weather-exposed facade zones",
            "deterioration associated with recurrent cold-weather conditions"
        ],
        contradictingIndicators: [
            "no weathering pattern associated with freeze-thaw exposure",
            "distress localized to protected zones without cold-weather mechanism"
        ],
        requiredVerification: [
            "Inspect exposure orientation and moisture condition of affected areas.",
            "Correlate deterioration pattern with seasonal weathering behavior.",
            "Differentiate freeze-thaw effects from other deterioration mechanisms."
        ],
        potentialConsequences: [
            "progressive surface and edge deterioration",
            "loss of local material integrity",
            "increasing repair demand"
        ],
        recommendedActions: [
            "Document weathering extent and material condition.",
            "Review drainage and moisture management details.",
            "Plan repair strategy after mechanism verification."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "masonry-weathering",
        cause: "masonry weathering",
        classification: "masonry condition hypothesis",
        keywords: ["masonry weathering", "weathered brick", "weathered masonry", "brick erosion", "mortar weathering"],
        supportingIndicators: [
            "masonry facade shows weathering and erosion patterns",
            "mortar and masonry units exhibit age and exposure-related wear",
            "distress concentrated on exposed masonry elevations"
        ],
        contradictingIndicators: [
            "masonry condition appears stable without weathering signs",
            "distress isolated to non-masonry facade components"
        ],
        requiredVerification: [
            "Inspect masonry units and mortar condition across elevations.",
            "Differentiate weathering from acute mechanical damage.",
            "Review whether weathering is localized or facade-wide."
        ],
        potentialConsequences: [
            "progressive loss of masonry surface integrity",
            "increased maintenance interventions",
            "localized ingress susceptibility at degraded joints"
        ],
        recommendedActions: [
            "Document masonry weathering pattern and severity.",
            "Inspect mortar joints and detail transitions.",
            "Plan condition-based remediation after verification."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "facade-anchor-deterioration",
        cause: "facade anchor deterioration",
        classification: "anchorage hypothesis",
        keywords: ["facade anchor", "anchor corrosion", "cladding anchor", "fixing deterioration", "anchor deterioration"],
        supportingIndicators: [
            "anchorage-related distress appears at fixing zones",
            "visible deterioration signs around facade anchor points",
            "cladding or facade movement indicators near anchor locations"
        ],
        contradictingIndicators: [
            "no signs of distress near anchor or fixing locations",
            "facade anomalies clearly unrelated to anchorage details"
        ],
        requiredVerification: [
            "Inspect anchor and fixing condition at representative zones.",
            "Assess whether observed distress aligns with anchorage layout.",
            "Use specialist inspection where anchor condition is concealed."
        ],
        potentialConsequences: [
            "localized facade stability concerns",
            "progressive displacement at fixing points",
            "higher intervention urgency if deterioration advances"
        ],
        recommendedActions: [
            "Document anchor-related distress by location.",
            "Prioritize safety-focused inspection of affected zones.",
            "Plan remedial decisions after anchor verification."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "facade-movement-joint-defect",
        cause: "facade movement joint defect",
        classification: "movement accommodation hypothesis",
        keywords: ["movement joint", "expansion joint", "movement gap", "joint restraint", "failed movement joint"],
        supportingIndicators: [
            "movement joint condition suggests reduced accommodation",
            "distress pattern follows movement-joint locations",
            "joint closure or restraint indicators present at facade transitions"
        ],
        contradictingIndicators: [
            "movement joints appear open and functional",
            "distress not associated with movement-joint layout"
        ],
        requiredVerification: [
            "Inspect movement-joint continuity and functional width.",
            "Differentiate movement-joint defects from sealant-only deterioration.",
            "Review adjacent facade cracking and displacement indicators."
        ],
        potentialConsequences: [
            "progressive cracking near restrained zones",
            "local weather-tightness reduction at joints",
            "repeated maintenance and repair demand"
        ],
        recommendedActions: [
            "Document movement-joint defects by elevation.",
            "Inspect adjacent materials for secondary distress.",
            "Plan targeted remedial scope after verification."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "age-related-facade-deterioration",
        cause: "age-related facade deterioration",
        classification: "aging hypothesis",
        keywords: ["age-related", "aging facade", "older facade", "long-term weathering", "service life"],
        supportingIndicators: [
            "overall facade condition indicates long-term deterioration",
            "multiple minor defects consistent with age-related wear",
            "weathering pattern is broad rather than one isolated defect"
        ],
        contradictingIndicators: [
            "facade condition appears recent with isolated acute damage only",
            "single localized event explains observed anomalies"
        ],
        requiredVerification: [
            "Review construction age and maintenance history of facade systems.",
            "Assess whether deterioration is widespread or localized.",
            "Separate age-related wear from acute isolated defects."
        ],
        potentialConsequences: [
            "progressive decline in facade performance",
            "higher maintenance frequency over time",
            "increasing future renewal scope"
        ],
        recommendedActions: [
            "Document age-related wear indicators per facade zone.",
            "Prioritize condition-based maintenance planning.",
            "Sequence deeper reviews for critical elevations."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "workmanship-defect",
        cause: "workmanship defect",
        classification: "quality hypothesis",
        keywords: ["workmanship defect", "poor workmanship", "installation defect", "detail defect", "improper execution"],
        supportingIndicators: [
            "detail quality indicates potential execution deficiencies",
            "multiple facade anomalies are consistent with workmanship issues",
            "inconsistent detailing at interfaces and terminations"
        ],
        contradictingIndicators: [
            "details appear consistent and well executed",
            "single isolated issue without broader quality pattern"
        ],
        requiredVerification: [
            "Inspect representative details for execution consistency.",
            "Treat workmanship concerns as hypotheses pending verification.",
            "Review as-built and construction records where available."
        ],
        potentialConsequences: [
            "recurring defects at multiple facade details",
            "increased maintenance and repair complexity",
            "possible broader quality-related deterioration"
        ],
        recommendedActions: [
            "Document workmanship anomalies with detail references.",
            "Correlate observed defects with construction interfaces.",
            "Prioritize targeted verification before remedial scoping."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    }
];

const COMPONENT_TERMS = [
    "facade",
    "façade",
    "external wall",
    "render",
    "cladding",
    "etics",
    "eifs",
    "insulation composite",
    "masonry",
    "brick",
    "joint",
    "sealant",
    "anchor",
    "coating"
];

const ISSUE_TERMS = [
    "crack",
    "cracked",
    "cracking",
    "detached",
    "detachment",
    "hollow",
    "moisture",
    "ingress",
    "leak",
    "defect",
    "deterioration",
    "weathering",
    "freeze",
    "thaw",
    "algae",
    "biological",
    "anchor",
    "movement",
    "workmanship"
];

export default class FacadeWallSystemsKnowledgeProvider {

    /**
     * Return deterministic knowledge for facade and wall-system findings.
     *
     * @param {Object} [input={}] - Knowledge input payload.
     * @returns {Object} Stable facade-wall-systems knowledge contract.
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
            domain: "facade-wall-systems",
            hypotheses: ranked.map((item) => toHypothesis(item.entry))
        };
    }

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
        textOf(source.building.constructionYear).trim().length > 0 ||
        textOf(source.building.constructionType).trim().length > 0 ||
        textOf(source.building.facadeType).trim().length > 0 ||
        textOf(source.building.insulationSystem).trim().length > 0 ||
        textOf(source.building.claddingType).trim().length > 0 ||
        textOf(source.building.exposure).trim().length > 0 ||
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
        textOf(source.building.constructionYear),
        textOf(source.building.constructionType),
        textOf(source.building.facadeType),
        textOf(source.building.insulationSystem),
        textOf(source.building.claddingType),
        textOf(source.building.exposure)
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

    return {
        text: [findingText, buildingText, measurementText].join(" ").trim(),
        findingText,
        buildingText,
        measurementText
    };
}

function isRelevantContext(context) {
    const hasComponent = COMPONENT_TERMS.some((term) => containsWord(context.text, term));
    const hasIssue = ISSUE_TERMS.some((term) => containsWord(context.text, term));

    return hasComponent && hasIssue;
}

function scoreHypothesis(entry, context) {
    let score = 0;

    entry.keywords.forEach((keyword) => {
        if (containsWord(context.text, keyword)) {
            score += 3;
        }

        if (containsWord(context.findingText, keyword)) {
            score += 2;
        }

        if (containsWord(context.buildingText, keyword)) {
            score += 1;
        }
    });

    score += scoreSignals(entry.id, context.text);

    return score;
}

function scoreSignals(id, text) {
    let score = 0;

    if (id === "render-cracking") {
        if (containsAny(text, ["render", "facade", "external wall"]) && containsAny(text, ["crack", "fissure"])) {
            score += 12;
        }

        if (containsAny(text, ["structural movement", "settlement"]) && !containsAny(text, ["render", "coating"])) {
            score -= 4;
        }
    }

    if (id === "detached-render") {
        if (containsAny(text, ["detached render", "render detachment", "debonded render", "render delamination"])) {
            score += 12;
        }

        if (containsAny(text, ["substrate failure", "structural failure"]) && !containsAny(text, ["render", "detached"])) {
            score -= 3;
        }
    }

    if (id === "hollow-render") {
        if (containsAny(text, ["hollow render", "hollow sounding", "drummy render", "hollow spot"])) {
            score += 12;
        }
    }

    if (id === "facade-moisture-penetration") {
        if (containsAny(text, ["facade moisture", "moisture penetration", "rain penetration", "water ingress facade", "seepage facade"])) {
            score += 12;
        }
    }

    if (id === "defective-facade-joints") {
        if (containsAny(text, ["facade joint", "open joint", "failed facade joint", "joint discontinuity"])) {
            score += 11;
        }
    }

    if (id === "defective-sealant-joints") {
        if (containsAny(text, ["sealant", "mastic", "joint sealant", "failed sealant"]) && containsAny(text, ["crack", "shrinkage", "detached", "defect"])) {
            score += 12;
        }
    }

    if (id === "etics-detachment") {
        if (containsAny(text, ["etics detachment", "eifs detachment", "detached etics", "detached eifs", "insulation board detachment"])) {
            score += 12;
        }
    }

    if (id === "etics-moisture-damage") {
        if (containsAny(text, ["etics", "eifs", "insulation composite"]) && containsAny(text, ["moisture", "damp", "wet insulation"])) {
            score += 12;
        }
    }

    if (id === "algae-or-biological-growth") {
        if (containsAny(text, ["algae", "biological growth", "biofilm", "organic growth"])) {
            score += 12;
        }

        if (containsAny(text, ["replacement", "replace facade"]) && !containsAny(text, ["detached", "anchor", "safety"])) {
            score -= 2;
        }
    }

    if (id === "coating-deterioration") {
        if (containsAny(text, ["coating deterioration", "paint failure", "coating peel", "chalked coating", "coating weathering"])) {
            score += 12;
        }
    }

    if (id === "freeze-thaw-deterioration") {
        if (containsAny(text, ["freeze-thaw", "frost damage", "freeze thaw cycle", "frost spalling"])) {
            score += 12;
        }
    }

    if (id === "masonry-weathering") {
        if (containsAny(text, ["masonry weathering", "weathered brick", "weathered masonry", "brick erosion", "mortar weathering"])) {
            score += 12;
        }
    }

    if (id === "facade-anchor-deterioration") {
        if (containsAny(text, ["facade anchor", "anchor corrosion", "cladding anchor", "anchor deterioration", "fixing deterioration"])) {
            score += 12;
        }
    }

    if (id === "facade-movement-joint-defect") {
        if (containsAny(text, ["movement joint", "expansion joint", "failed movement joint", "joint restraint"])) {
            score += 12;
        }
    }

    if (id === "age-related-facade-deterioration") {
        if (containsAny(text, ["age-related", "aging facade", "older facade", "long-term weathering", "service life"])) {
            score += 10;
        }
    }

    if (id === "workmanship-defect") {
        if (containsAny(text, ["workmanship", "poor workmanship", "installation defect", "detail defect", "improper execution"])) {
            score += 12;
        }
    }

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

function containsAny(text, terms) {
    return terms.some((term) => containsWord(text, term));
}

function containsWord(text, term) {
    const normalizedText = String(text).toLowerCase();
    const normalizedTerm = String(term).toLowerCase();

    if (normalizedTerm.includes(" ")) {
        return normalizedText.includes(normalizedTerm);
    }

    return new RegExp(`(^|[^a-z0-9])${escapeRegex(normalizedTerm)}([^a-z0-9]|$)`).test(normalizedText);
}

function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

    return Object.values(value)
        .map((entry) => textOf(entry))
        .filter((entry) => entry.length > 0)
        .join(" ");
}

function cloneArray(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.map((entry) => cloneValue(entry));
}

function cloneObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return {};
    }

    return cloneValue(value);
}

function cloneValue(value) {
    if (value === undefined) {
        return undefined;
    }

    return JSON.parse(JSON.stringify(value));
}
