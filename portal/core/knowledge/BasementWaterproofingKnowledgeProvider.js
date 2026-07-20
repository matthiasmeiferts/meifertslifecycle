/**
 * MBLS Expert Intelligence Layer
 * Basement Waterproofing Knowledge Provider
 *
 * Deterministic, pure, immutable knowledge provider for basement moisture,
 * below-grade components, waterproofing defects, and drainage-related findings.
 */

import { RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION } from "../risk/RiskRelevanceGovernanceRegistry.js";

const EMPTY_CONTRACT = Object.freeze({
    domain: "basement-waterproofing",
    hypotheses: []
});

const HYPOTHESES = [
    {
        id: "defective-external-basement-waterproofing",
        cause: "defective external basement waterproofing",
        classification: "external waterproofing hypothesis",
        keywords: ["external waterproofing", "membrane", "bituminous coating", "below-grade wall", "basement wall", "retaining wall", "waterproofing defect"],
        supportingIndicators: [
            "moisture indications at below-grade walls where hidden waterproofing cannot be inspected visually",
            "recurring dampness after rain or wet-ground periods near basement perimeter",
            "waterproofing distress signs in basement wall context"
        ],
        contradictingIndicators: [
            "moisture pattern clearly limited to interior condensation on cold surfaces",
            "single localized leak path explained by one service penetration only"
        ],
        requiredVerification: [
            "Inspect basement perimeter details and exposed waterproofing terminations where accessible.",
            "Use targeted opening-up or specialist investigation when hidden membrane condition cannot be assessed visually.",
            "Verify whether moisture path is external or internal before deciding the cause."
        ],
        potentialConsequences: [
            "progressive basement moisture exposure",
            "surface deterioration of below-grade walls and finishes",
            "higher maintenance and remediation scope"
        ],
        recommendedActions: [
            "Document moisture distribution and perimeter context with dated photographs.",
            "Prioritize specialist waterproofing assessment where hidden construction cannot be inspected.",
            "Coordinate follow-up investigation to identify the dominant moisture path."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "rising-damp-in-masonry",
        cause: "rising damp in masonry",
        classification: "rising damp hypothesis",
        keywords: ["rising damp", "rising moisture", "masonry", "brick", "blockwork", "plinth", "damp course"],
        supportingIndicators: [
            "moisture pattern in masonry materials that may be consistent with capillary rise",
            "lower wall moisture with compatible masonry context and persistent dampness",
            "deterioration near wall base that requires distinction from lateral ingress"
        ],
        contradictingIndicators: [
            "moisture pattern concentrated at one crack, joint, or penetration",
            "clear condensation pattern on cold surfaces with poor ventilation"
        ],
        requiredVerification: [
            "Confirm masonry moisture profile with targeted moisture-path diagnostics.",
            "Do not infer rising damp from floor-level location alone; verify competing sources.",
            "Check for lateral ingress and service leaks before attributing cause to rising damp."
        ],
        potentialConsequences: [
            "persistent dampness in lower wall zones",
            "damage to plaster, coatings, and interior finishes",
            "increased maintenance demand"
        ],
        recommendedActions: [
            "Record height and distribution of dampness on masonry surfaces.",
            "Request specialist moisture-source differentiation where pattern is ambiguous.",
            "Sequence remediation only after source verification."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "lateral-moisture-penetration",
        cause: "lateral moisture penetration",
        classification: "lateral penetration hypothesis",
        keywords: ["lateral ingress", "lateral penetration", "side penetration", "retaining wall", "earth-facing wall", "below-grade wall"],
        supportingIndicators: [
            "moisture appears to migrate through earth-facing or retaining wall surfaces",
            "recurring damp patches aligned with external soil contact zones",
            "below-grade wall moisture pattern consistent with side-entry water path"
        ],
        contradictingIndicators: [
            "pattern limited to isolated service penetration leakage",
            "symptoms consistent with internal condensation only"
        ],
        requiredVerification: [
            "Assess moisture distribution against external ground-contact geometry.",
            "Distinguish lateral penetration from capillary moisture uptake and condensation.",
            "Use opening-up or specialist investigation where the wall build-up is concealed."
        ],
        potentialConsequences: [
            "continued interior dampness at below-grade walls",
            "degradation of finishes and local substrate",
            "ongoing remediation needs"
        ],
        recommendedActions: [
            "Map wall zones affected by recurring dampness.",
            "Review external drainage and waterproofing continuity.",
            "Escalate for specialist envelope and below-grade diagnostics."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "hydrostatic-water-pressure",
        cause: "hydrostatic water pressure",
        classification: "hydrostatic pressure hypothesis",
        keywords: ["hydrostatic", "groundwater", "water table", "water pressure", "standing groundwater", "pressurized water"],
        supportingIndicators: [
            "explicit wording indicates groundwater or water-pressure conditions",
            "reported pressure-driven moisture behavior at below-grade envelope",
            "findings describe potential pressure loading on basement waterproofing"
        ],
        contradictingIndicators: [
            "no groundwater or pressure indicator in the available input",
            "moisture pattern fully explained by interior condensation"
        ],
        requiredVerification: [
            "Confirm groundwater or pressure context with site and drainage investigation.",
            "Do not assume hydrostatic pressure without direct supporting indicators.",
            "Coordinate specialist below-grade assessment for pressure exposure verification."
        ],
        potentialConsequences: [
            "elevated load on waterproofing systems",
            "persistent ingress risk at below-grade interfaces",
            "expanded remediation scope"
        ],
        recommendedActions: [
            "Document any direct evidence of pressure-related moisture behavior.",
            "Review site conditions, drainage function, and seasonal water influences.",
            "Initiate specialist investigation where pressure exposure is plausible."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "defective-wall-floor-junction",
        cause: "defective wall-floor junction",
        classification: "junction waterproofing hypothesis",
        keywords: ["wall-floor junction", "cove joint", "wall slab joint", "floor-wall intersection", "fillet", "kicker joint"],
        supportingIndicators: [
            "moisture localized at the wall-floor intersection",
            "junction distress pattern suggests interface weakness",
            "repeat dampness where wall and slab meet"
        ],
        contradictingIndicators: [
            "moisture pattern clearly remote from junction zones",
            "evidence points to isolated penetration leak only"
        ],
        requiredVerification: [
            "Inspect wall-floor interface continuity and any visible seal detail.",
            "Use targeted opening-up when hidden interface condition is unknown.",
            "Confirm whether moisture source tracks along the junction or from another path."
        ],
        potentialConsequences: [
            "localized dampness expansion along perimeter",
            "damage to lower wall and floor finishes",
            "repeat local repair demand"
        ],
        recommendedActions: [
            "Map moisture extent around the wall-floor interface.",
            "Document junction details and adjacent defect indicators.",
            "Refer for specialist below-grade junction assessment."
        ],
        riskRelevance: "high",
        capexRelevance: "medium",
        valuationRelevance: "high"
    },
    {
        id: "defective-construction-joint",
        cause: "defective construction joint",
        classification: "construction joint hypothesis",
        keywords: ["construction joint", "cold joint", "joint leakage", "pour joint", "joint strip", "joint waterstop"],
        supportingIndicators: [
            "moisture pattern aligns with a construction joint path",
            "joint-related distress near cast interfaces",
            "joint sealing condition appears compromised"
        ],
        contradictingIndicators: [
            "no relevant joint location or joint-related symptom",
            "moisture limited to broad surface condensation"
        ],
        requiredVerification: [
            "Inspect known construction joint locations for continuity and defects.",
            "Confirm whether leakage traces correspond to the joint axis.",
            "Use specialist investigation if joint assembly is concealed."
        ],
        potentialConsequences: [
            "recurring leakage at structural interfaces",
            "local deterioration at joint-adjacent materials",
            "higher intervention complexity"
        ],
        recommendedActions: [
            "Record joint locations and moisture mapping along each joint.",
            "Prioritize specialist review of hidden joint sealing systems.",
            "Plan remedial strategy only after source confirmation."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "defective-service-penetration-sealing",
        cause: "defective service penetration sealing",
        classification: "penetration sealing hypothesis",
        keywords: ["service penetration", "pipe penetration", "conduit penetration", "sleeve", "penetration seal", "around pipe"],
        supportingIndicators: [
            "moisture concentrated around service penetrations",
            "visible seepage paths around pipes or conduits",
            "penetration interface appears insufficiently sealed"
        ],
        contradictingIndicators: [
            "no service penetration in affected area",
            "broad wall moisture unrelated to penetration locations"
        ],
        requiredVerification: [
            "Inspect penetration interfaces, sleeves, and surrounding seal condition.",
            "Confirm whether moisture path originates at the penetration perimeter.",
            "Use targeted opening-up where concealed penetration details are inaccessible."
        ],
        potentialConsequences: [
            "ongoing localized moisture entry",
            "deterioration of adjacent finishes and substrate",
            "repeat patch-repair cycles"
        ],
        recommendedActions: [
            "Photograph each affected penetration and moisture traces.",
            "Correlate leak timing with service and weather conditions.",
            "Escalate for specialist sealing and waterproofing review."
        ],
        riskRelevance: "high",
        capexRelevance: "medium",
        valuationRelevance: "high"
    },
    {
        id: "failed-or-missing-perimeter-drainage",
        cause: "failed or missing perimeter drainage",
        classification: "perimeter drainage hypothesis",
        keywords: ["perimeter drainage", "drain tile", "french drain", "missing drainage", "drainage failure", "perimeter drain"],
        supportingIndicators: [
            "site indications suggest absent or failed perimeter drainage",
            "water accumulation near below-grade envelope after rain",
            "drainage context indicates inadequate interception of ground water"
        ],
        contradictingIndicators: [
            "no signs of perimeter drainage deficiency",
            "moisture pattern explained by interior condensation only"
        ],
        requiredVerification: [
            "Inspect drainage system presence, continuity, and outfall condition.",
            "Correlate moisture events with rainfall and external runoff behavior.",
            "Use specialist below-grade and drainage investigation where concealed."
        ],
        potentialConsequences: [
            "higher moisture exposure at below-grade walls",
            "recurrent dampness and material degradation",
            "expanded remediation scope"
        ],
        recommendedActions: [
            "Document site grading, ponding, and drainage routes near basement walls.",
            "Review as-built drainage provisions against current observations.",
            "Prioritize specialist drainage diagnostics before remedial works."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "blocked-or-ineffective-drainage",
        cause: "blocked or ineffective drainage",
        classification: "drainage performance hypothesis",
        keywords: ["blocked drain", "clogged drain", "ineffective drainage", "silted drain", "backed up drain", "overflow drain"],
        supportingIndicators: [
            "drainage elements show blockage or reduced function indicators",
            "water retention near drain points and below-grade zones",
            "observed drainage overflow or delayed discharge"
        ],
        contradictingIndicators: [
            "drainage confirmed clear and functioning during relevant events",
            "moisture pattern not associated with drainage network"
        ],
        requiredVerification: [
            "Inspect and test drainage flow paths for blockage or loss of capacity.",
            "Confirm whether drainage performance degrades during peak water events.",
            "Use specialist CCTV or flow diagnostics where direct inspection is limited."
        ],
        potentialConsequences: [
            "increased water exposure at basement envelope",
            "recurrent damp events after precipitation",
            "accelerated finish and substrate deterioration"
        ],
        recommendedActions: [
            "Record drain condition and any observed blockage indicators.",
            "Clean and reassess system performance with follow-up monitoring.",
            "Escalate to specialist drainage assessment if poor performance persists."
        ],
        riskRelevance: "high",
        capexRelevance: "medium",
        valuationRelevance: "high"
    },
    {
        id: "condensation-on-basement-surfaces",
        cause: "condensation on basement surfaces",
        classification: "condensation hypothesis",
        keywords: ["condensation", "cold surface", "cold bridge", "high humidity", "insufficient ventilation", "surface mould"],
        supportingIndicators: [
            "surface moisture and mould patterns align with cold surface conditions",
            "air humidity and ventilation context are consistent with condensation risk",
            "symptoms are mainly superficial and climate-related"
        ],
        contradictingIndicators: [
            "clear through-wall seepage or pressure-driven ingress indicators",
            "localized leakage from joint, crack, or penetration path"
        ],
        requiredVerification: [
            "Check ventilation adequacy and surface temperature conditions.",
            "Distinguish condensation indicators from external moisture penetration.",
            "Confirm whether moisture appears seasonally or with indoor humidity peaks."
        ],
        potentialConsequences: [
            "recurring surface dampness and mould growth",
            "degradation of coatings and stored materials",
            "indoor environment quality concerns"
        ],
        recommendedActions: [
            "Document cold-surface locations and mould distribution.",
            "Review ventilation strategy and basement usage conditions.",
            "Coordinate targeted diagnostics if penetration cannot be excluded."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "moisture-transport-through-cracks",
        cause: "moisture transport through cracks",
        classification: "crack transport hypothesis",
        keywords: ["crack", "cracking", "fissure", "fracture", "water through crack", "leak through crack"],
        supportingIndicators: [
            "moisture traces align with crack geometry",
            "wetting concentrates along visible fissures",
            "crack network may act as moisture transport path"
        ],
        contradictingIndicators: [
            "no crack pattern at moisture location",
            "uniform condensation pattern without linear moisture traces"
        ],
        requiredVerification: [
            "Map crack width, continuity, and relationship to moisture traces.",
            "Confirm whether crack acts as entry path or secondary moisture route.",
            "Use specialist investigation when crack depth and path are unclear."
        ],
        potentialConsequences: [
            "recurring localized ingress at crack lines",
            "progressive deterioration around cracked zones",
            "ongoing repair and monitoring demand"
        ],
        recommendedActions: [
            "Document crack pattern with scale references.",
            "Track moisture recurrence relative to weather and groundwater conditions.",
            "Escalate for specialist crack and waterproofing assessment as needed."
        ],
        riskRelevance: "high",
        capexRelevance: "medium",
        valuationRelevance: "high"
    },
    {
        id: "defective-basement-floor-waterproofing",
        cause: "defective basement floor waterproofing",
        classification: "floor waterproofing hypothesis",
        keywords: ["basement floor", "floor slab", "slab waterproofing", "under-slab membrane", "floor seepage", "wet floor"],
        supportingIndicators: [
            "moisture expression at basement floor or slab surfaces",
            "floor wetting pattern suggests compromised below-slab waterproofing",
            "dampness concentrated at floor zones without clear wall-only source"
        ],
        contradictingIndicators: [
            "all moisture limited to upper wall condensation zones",
            "clear pipe leak source independent of floor assembly"
        ],
        requiredVerification: [
            "Inspect floor moisture distribution and adjacent junction relationships.",
            "Use targeted opening-up or specialist diagnostics where floor build-up is concealed.",
            "Differentiate slab waterproofing issues from isolated service leakage."
        ],
        potentialConsequences: [
            "persistent floor dampness",
            "damage to floor finishes and stored contents",
            "increased remediation effort"
        ],
        recommendedActions: [
            "Map floor moisture zones and recurrence timing.",
            "Review slab and below-slab waterproofing details if available.",
            "Request specialist below-grade floor waterproofing assessment."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "capillary-moisture-uptake",
        cause: "capillary moisture uptake",
        classification: "capillary uptake hypothesis",
        keywords: ["capillary", "wicking", "suction", "porous uptake", "capillary rise", "masonry uptake"],
        supportingIndicators: [
            "material behavior may indicate moisture uptake through pore structure",
            "dampness pattern in porous masonry materials",
            "lower-zone moisture requiring separation from lateral penetration"
        ],
        contradictingIndicators: [
            "clear side-entry or penetration leak path",
            "surface condensation pattern without substrate wetting evidence"
        ],
        requiredVerification: [
            "Differentiate capillary uptake from lateral penetration through wall profile checks.",
            "Confirm porous-material moisture behavior using targeted investigation.",
            "Do not infer capillary uptake solely from floor-level moisture location."
        ],
        potentialConsequences: [
            "persistent substrate dampness in porous materials",
            "recurrent finish degradation",
            "ongoing maintenance needs"
        ],
        recommendedActions: [
            "Document moisture distribution in porous wall zones.",
            "Request specialist moisture-path diagnostics where source remains unclear.",
            "Align remediation with verified transport mechanism."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "salt-contamination-and-surface-deterioration",
        cause: "salt contamination and salt-related surface deterioration",
        classification: "salt contamination hypothesis",
        keywords: ["efflorescence", "salt", "salt bloom", "crystalline deposit", "salt staining", "salt contamination"],
        supportingIndicators: [
            "salt deposits or efflorescence observed on basement surfaces",
            "surface deterioration consistent with salt activity",
            "repeated salt-related staining in damp zones"
        ],
        contradictingIndicators: [
            "no salt deposits or residue indicators reported",
            "surface condition unrelated to moisture or salts"
        ],
        requiredVerification: [
            "Confirm salt presence and distribution at affected surfaces.",
            "Treat efflorescence as an indicator of moisture movement, not proof of one specific source.",
            "Differentiate between capillary, lateral, and leakage-related moisture paths."
        ],
        potentialConsequences: [
            "surface scaling, flaking, or coating damage",
            "recurring cosmetic and substrate deterioration",
            "increased maintenance cycle frequency"
        ],
        recommendedActions: [
            "Record residue type and extent with close-up documentation.",
            "Pair salt findings with targeted moisture-source diagnostics.",
            "Define remedial actions only after source confirmation."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "age-related-waterproofing-deterioration",
        cause: "age-related waterproofing deterioration",
        classification: "aging waterproofing hypothesis",
        keywords: ["age-related", "aged waterproofing", "old membrane", "deteriorated waterproofing", "service life", "weathered waterproofing"],
        supportingIndicators: [
            "waterproofing described as old or degraded",
            "broad below-grade moisture findings in aged assemblies",
            "pattern compatible with long-term deterioration of waterproofing components"
        ],
        contradictingIndicators: [
            "newly installed waterproofing with isolated localized defect only",
            "moisture pattern clearly limited to ventilation-related condensation"
        ],
        requiredVerification: [
            "Review construction year and refurbishment history for waterproofing components.",
            "Inspect accessible waterproofing details for age-related degradation signs.",
            "Use specialist opening-up where hidden components cannot be assessed visually."
        ],
        potentialConsequences: [
            "loss of waterproofing performance over time",
            "widening area of dampness and deterioration",
            "higher renewal CAPEX exposure"
        ],
        recommendedActions: [
            "Compile age and maintenance records of below-grade waterproofing elements.",
            "Prioritize specialist condition assessment for hidden assemblies.",
            "Plan intervention strategy based on verified deterioration extent."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "unsuitable-basement-use-or-insufficient-ventilation",
        cause: "unsuitable basement use or insufficient ventilation",
        classification: "use and ventilation hypothesis",
        keywords: ["insufficient ventilation", "poor ventilation", "unsuitable use", "occupied basement", "storage moisture", "indoor humidity"],
        supportingIndicators: [
            "basement use profile may increase indoor humidity and surface dampness",
            "ventilation appears insufficient for observed moisture load",
            "climate-related symptoms are stronger than penetration indicators"
        ],
        contradictingIndicators: [
            "clear evidence of external penetration or pressure-driven ingress",
            "moisture path directly linked to a single construction defect"
        ],
        requiredVerification: [
            "Assess ventilation provision relative to actual basement use.",
            "Distinguish usage-driven humidity issues from envelope penetration.",
            "Confirm whether moisture events correlate with occupancy and ventilation patterns."
        ],
        potentialConsequences: [
            "recurrent condensation and mould-prone conditions",
            "material and content deterioration risk",
            "ongoing indoor-environment management burden"
        ],
        recommendedActions: [
            "Document current basement use and ventilation setup.",
            "Implement targeted ventilation and humidity control review.",
            "Reassess symptoms after operational adjustments."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    }
];

const BASEMENT_RELEVANCE_TERMS = [
    "basement",
    "cellar",
    "below-grade",
    "below grade",
    "foundation",
    "retaining wall",
    "earth-facing",
    "floor slab",
    "wall-floor",
    "construction joint",
    "service penetration",
    "groundwater",
    "waterproofing",
    "drainage"
];

const MOISTURE_TERMS = [
    "moisture",
    "damp",
    "wet",
    "leak",
    "water",
    "ingress",
    "seepage",
    "condensation",
    "mould",
    "efflorescence",
    "salt"
];

const HYDROSTATIC_TERMS = [
    "hydrostatic",
    "groundwater",
    "water table",
    "water pressure",
    "pressurized water",
    "standing groundwater"
];

export default class BasementWaterproofingKnowledgeProvider {

    /**
     * Return deterministic knowledge for basement and below-grade moisture findings.
     *
     * @param {Object} [input={}] - Knowledge input payload.
     * @returns {Object} Stable basement-waterproofing knowledge contract.
     */
    static getKnowledge(input = {}) {
        const source = normalizeInput(input);

        if (!hasSufficientInput(source)) {
            return EMPTY_CONTRACT;
        }

        const context = buildContext(source);

        if (!isBasementRelevant(context)) {
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
            domain: "basement-waterproofing",
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
        textOf(source.building.basementType).trim().length > 0 ||
        textOf(source.building.foundationType).trim().length > 0 ||
        textOf(source.building.waterproofingType).trim().length > 0 ||
        textOf(source.building.siteConditions).trim().length > 0 ||
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
        textOf(source.building.basementType),
        textOf(source.building.foundationType),
        textOf(source.building.waterproofingType),
        textOf(source.building.siteConditions)
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

    const text = [findingText, buildingText, measurementText].join(" ").trim();

    return {
        source,
        text,
        findingText,
        buildingText,
        measurementText
    };
}

function isBasementRelevant(context) {
    const hasComponentTerm = BASEMENT_RELEVANCE_TERMS.some((term) => containsWord(context.text, term));
    const hasMoistureTerm = MOISTURE_TERMS.some((term) => containsWord(context.text, term));

    if (hasComponentTerm && hasMoistureTerm) {
        return true;
    }

    return hasComponentTerm && /waterproof|drain|joint|penetration|groundwater|hydrostatic|foundation/.test(context.text);
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

    score += scoreDomainSpecificSignals(entry.id, context);

    return score;
}

function scoreDomainSpecificSignals(id, context) {
    const text = context.text;
    let score = 0;

    if (id === "defective-external-basement-waterproofing") {
        if (containsAny(text, ["basement wall", "below-grade wall", "retaining wall", "earth-facing", "foundation wall"]) && containsAny(text, ["moisture", "damp", "ingress", "seepage", "leak"])) {
            score += 8;
        }

        if (containsAny(text, ["membrane", "waterproofing", "coating", "failed waterproofing", "defective waterproofing"])) {
            score += 6;
        }

        if (containsAny(text, ["condensation", "cold surface", "surface mould"]) && !containsAny(text, ["ingress", "seepage", "through-wall", "groundwater", "water pressure"])) {
            score -= 6;
        }
    }

    if (id === "rising-damp-in-masonry") {
        if (containsAny(text, ["rising damp", "rising moisture", "damp course"])) {
            score += 10;
        }

        if (containsAny(text, ["masonry", "brick", "blockwork", "porous wall"]) && containsAny(text, ["damp", "moisture", "wet"])) {
            score += 5;
        }

        if (containsAny(text, ["lower wall", "floor level", "wall base"]) && containsAny(text, ["masonry", "brick", "blockwork"]) && containsAny(text, ["moisture", "damp"])) {
            score += 2;
        }

        if (containsAny(text, ["lower wall", "floor level", "wall base"]) && containsAny(text, ["moisture", "damp", "wet"])) {
            score += 4;
        }

        if (containsAny(text, ["salt tide marks", "tide marks", "salt staining", "efflorescence"]) && containsAny(text, ["lower wall", "wall base"]) && containsAny(text, ["moisture", "damp"])) {
            score += 20;
        }
    }

    if (id === "lateral-moisture-penetration") {
        if (containsAny(text, ["retaining wall", "earth-facing", "below-grade wall", "basement wall"]) && containsAny(text, ["lateral", "side", "ingress", "penetration", "seepage"])) {
            score += 9;
        }

        if (containsAny(text, ["basement wall", "retaining wall"]) && containsAny(text, ["moisture", "damp", "wet"])) {
            score += 5;
        }
    }

    if (id === "hydrostatic-water-pressure") {
        if (HYDROSTATIC_TERMS.some((term) => containsWord(text, term))) {
            score += 12;
        }

        if (containsAny(text, ["groundwater", "water table"]) && containsAny(text, ["pressure", "pressurized", "hydrostatic"])) {
            score += 8;
        }
    }

    if (id === "defective-wall-floor-junction") {
        if (containsAny(text, ["wall-floor", "wall floor", "floor-wall", "wall slab joint", "junction"]) && containsAny(text, ["moisture", "damp", "wet", "seepage"])) {
            score += 11;
        }
    }

    if (id === "defective-construction-joint") {
        if (containsAny(text, ["construction joint", "cold joint", "joint leakage", "joint waterstop"]) && containsAny(text, ["moisture", "leak", "ingress", "seepage"])) {
            score += 11;
        }
    }

    if (id === "defective-service-penetration-sealing") {
        if (containsAny(text, ["pipe penetration", "service penetration", "conduit penetration", "around pipe", "sleeve"]) && containsAny(text, ["moisture", "wet", "seepage", "leak"])) {
            score += 12;
        }
    }

    if (id === "failed-or-missing-perimeter-drainage") {
        if (containsAny(text, ["missing perimeter drainage", "failed perimeter drainage", "no perimeter drain", "drain tile failure", "french drain missing"])) {
            score += 11;
        }

        if (containsAny(text, ["perimeter drainage", "drain tile", "french drain"]) && containsAny(text, ["water accumulation", "ponding", "wet soil", "rain event"])) {
            score += 7;
        }
    }

    if (id === "blocked-or-ineffective-drainage") {
        if (containsAny(text, ["blocked drain", "clogged drain", "silted drain", "backed up drain", "overflow drain", "ineffective drainage"])) {
            score += 12;
        }

        if (containsAny(text, ["drain", "drainage"]) && containsAny(text, ["blocked", "clogged", "overflow", "backed up", "slow discharge"])) {
            score += 8;
        }
    }

    if (id === "condensation-on-basement-surfaces") {
        if (containsAny(text, ["condensation", "cold surface", "cold bridge", "high humidity", "poor ventilation", "insufficient ventilation"])) {
            score += 12;
        }

        if (containsAny(text, ["mould", "surface mould"]) && containsAny(text, ["cold surface", "humidity", "ventilation"])) {
            score += 8;
        }

        if (containsAny(text, ["groundwater", "hydrostatic", "pressurized water", "through-wall seepage"])) {
            score -= 4;
        }
    }

    if (id === "moisture-transport-through-cracks") {
        if (containsAny(text, ["crack", "cracking", "fissure", "fracture"]) && containsAny(text, ["moisture", "wet", "seepage", "leak", "ingress"])) {
            score += 12;
        }
    }

    if (id === "defective-basement-floor-waterproofing") {
        if (containsAny(text, ["basement floor", "floor slab", "under-slab", "slab waterproofing"]) && containsAny(text, ["moisture", "wet", "damp", "seepage"])) {
            score += 11;
        }
    }

    if (id === "capillary-moisture-uptake") {
        if (containsAny(text, ["capillary", "wicking", "suction", "capillary rise", "porous uptake"])) {
            score += 11;
        }

        if (containsAny(text, ["masonry", "brick", "blockwork"]) && containsAny(text, ["moisture", "damp"]) && containsAny(text, ["lower wall", "wall base", "floor level"])) {
            score += 3;
        }
    }

    if (id === "salt-contamination-and-surface-deterioration") {
        if (containsAny(text, ["efflorescence", "salt", "salt bloom", "crystalline deposit", "salt contamination"])) {
            score += 12;
        }
    }

    if (id === "age-related-waterproofing-deterioration") {
        if (containsAny(text, ["age-related", "aged waterproofing", "old membrane", "deteriorated waterproofing", "weathered waterproofing"])) {
            score += 12;
        }

        if (containsAny(text, ["construction year", "older building", "built", "year"]) && containsAny(text, ["waterproofing", "basement moisture", "below-grade moisture"])) {
            score += 4;
        }
    }

    if (id === "unsuitable-basement-use-or-insufficient-ventilation") {
        if (containsAny(text, ["insufficient ventilation", "poor ventilation", "unsuitable use", "occupied basement", "high humidity", "storage moisture"])) {
            score += 11;
        }

        if (containsAny(text, ["mould", "condensation"]) && containsAny(text, ["poor ventilation", "insufficient ventilation", "high humidity"])) {
            score += 6;
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
