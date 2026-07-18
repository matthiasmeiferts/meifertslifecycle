/**
 * MBLS Expert Intelligence Layer
 * Balconies, Loggias and Terraces Knowledge Provider
 *
 * Deterministic, pure, immutable provider for balcony, loggia, terrace, and
 * cantilever-slab condition hypotheses.
 */

const EMPTY_CONTRACT = Object.freeze({
    domain: "balconies-terraces",
    hypotheses: []
});

const HYPOTHESES = [
    {
        id: "defective-balcony-waterproofing",
        cause: "defective balcony waterproofing",
        classification: "balcony waterproofing hypothesis",
        keywords: ["balcony waterproofing", "balcony membrane", "balcony slab waterproofing", "balcony leak", "balcony leakage"],
        supportingIndicators: [
            "moisture or leakage pattern associated with balcony surface",
            "water entry at balcony buildup or exposed slab zone",
            "signs consistent with compromised balcony waterproofing"
        ],
        contradictingIndicators: [
            "moisture clearly limited to an unrelated roof or plumbing source",
            "balcony condition better explained by one isolated outlet blockage"
        ],
        requiredVerification: [
            "Inspect the balcony surface, joints, and waterproofing terminations.",
            "Differentiate waterproofing defects from drainage or threshold issues.",
            "Confirm whether moisture tracks through the balcony build-up before concluding."
        ],
        potentialConsequences: [
            "continued moisture ingress",
            "deterioration of finishes and substrate layers",
            "recurring local repair demand"
        ],
        recommendedActions: [
            "Document the affected balcony zone and visible leakage path.",
            "Review adjoining details for matching distress.",
            "Escalate for targeted waterproofing verification."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "defective-terrace-waterproofing",
        cause: "defective terrace waterproofing",
        classification: "terrace waterproofing hypothesis",
        keywords: ["terrace waterproofing", "terrace membrane", "roof terrace", "terrace leak", "terrace leakage"],
        supportingIndicators: [
            "moisture associated with terrace surface or edge",
            "water entry through exposed terrace buildup",
            "recurring dampness in terrace-adjacent zones"
        ],
        contradictingIndicators: [
            "issue clearly limited to a blocked drain alone",
            "moisture path unrelated to terrace build-up"
        ],
        requiredVerification: [
            "Inspect terrace surface, terminations, and waterproofing continuity.",
            "Check whether leakage follows the terrace build-up or a separate detail.",
            "Differentiate terrace waterproofing defects from drainage defects."
        ],
        potentialConsequences: [
            "repeated leakage and dampness",
            "surface deterioration",
            "expanded repair scope if untreated"
        ],
        recommendedActions: [
            "Record terrace condition with overview and detail photographs.",
            "Review the drainage pattern and exposed terminations.",
            "Plan targeted waterproofing review after verification."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "insufficient-drainage",
        cause: "insufficient drainage",
        classification: "drainage hypothesis",
        keywords: ["insufficient drainage", "poor drainage", "drainage issue", "water not draining", "ponding", "standing water"],
        supportingIndicators: [
            "standing water or ponding observed on balcony or terrace",
            "runoff does not leave the surface as intended",
            "drainage pattern suggests slow or insufficient discharge"
        ],
        contradictingIndicators: [
            "water entry better explained by a single opening connection",
            "surface wetting caused by one localized defect only"
        ],
        requiredVerification: [
            "Inspect the drainage path, outlets, and surface runoff behavior.",
            "Do not infer inadequate slope from standing water alone.",
            "Check whether water is impeded by discharge or accumulation details."
        ],
        potentialConsequences: [
            "persistent wetting",
            "accelerated finish wear",
            "greater moisture exposure of adjacent details"
        ],
        recommendedActions: [
            "Document water accumulation pattern and drainage route.",
            "Review whether discharge is obstructed or undersized.",
            "Escalate for drainage correction review if the pattern persists."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "blocked-drainage-outlet",
        cause: "blocked drainage outlet",
        classification: "drainage outlet hypothesis",
        keywords: ["blocked drainage outlet", "blocked drain", "drain outlet", "outlet blockage", "blocked outlet"],
        supportingIndicators: [
            "water does not discharge through the expected outlet",
            "visible blockage at balcony or terrace outlet",
            "overflow near a drainage exit point"
        ],
        contradictingIndicators: [
            "issue better explained by a membrane fault or threshold defect",
            "drainage path appears open and functional"
        ],
        requiredVerification: [
            "Inspect the outlet and adjacent drainage route for blockage.",
            "Confirm whether discharge is impeded at the outlet itself.",
            "Review whether overflow recurs under similar conditions."
        ],
        potentialConsequences: [
            "recurrent ponding and overflow",
            "local moisture exposure of finishes",
            "ongoing maintenance demand"
        ],
        recommendedActions: [
            "Document outlet condition and discharge path.",
            "Compare blocked and adjacent drainage points.",
            "Plan maintenance attention after verification."
        ],
        riskRelevance: "medium",
        capexRelevance: "low",
        valuationRelevance: "medium"
    },
    {
        id: "inadequate-surface-slope",
        cause: "inadequate surface slope",
        classification: "slope hypothesis",
        keywords: ["inadequate slope", "insufficient slope", "flat surface", "no fall", "poor fall", "surface slope"],
        supportingIndicators: [
            "water lingers on the surface after rainfall",
            "surface geometry appears to direct water poorly",
            "runoff does not move toward the intended drain"
        ],
        contradictingIndicators: [
            "standing water better explained by outlet blockage alone",
            "moisture trace limited to a threshold or wall connection"
        ],
        requiredVerification: [
            "Inspect the balcony or terrace fall and runoff direction.",
            "Do not infer slope deficiency from standing water alone.",
            "Check whether drainage function or level geometry is the dominant issue."
        ],
        potentialConsequences: [
            "persistent ponding",
            "repeated moisture exposure",
            "accelerated wear of surface finishes"
        ],
        recommendedActions: [
            "Document the runoff path and any ponding locations.",
            "Review surface geometry against adjacent zones.",
            "Escalate for slope verification if water retention persists."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "failed-wall-connection-waterproofing",
        cause: "failed wall connection waterproofing",
        classification: "wall-connection hypothesis",
        keywords: ["wall connection", "wall junction", "wall abutment", "upstand", "balcony wall junction", "terrace wall junction"],
        supportingIndicators: [
            "moisture at the wall-to-balcony or wall-to-terrace junction",
            "staining along the upstand or wall connection",
            "edge distress suggests failed wall connection detail"
        ],
        contradictingIndicators: [
            "issue clearly limited to a blocked outlet",
            "condition restricted to tile surface only"
        ],
        requiredVerification: [
            "Inspect the wall connection, upstand, and transition detail.",
            "Check whether the moisture follows the wall junction line.",
            "Differentiate connection failure from surface or drain issues."
        ],
        potentialConsequences: [
            "localized leakage at junctions",
            "finish deterioration around the perimeter",
            "recurring repair needs"
        ],
        recommendedActions: [
            "Document the wall connection and any staining pattern.",
            "Review adjacent junctions for similar distress.",
            "Plan targeted detail verification before repair scope decisions."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "failed-door-threshold-waterproofing",
        cause: "failed door threshold waterproofing",
        classification: "threshold hypothesis",
        keywords: ["door threshold", "threshold", "door sill", "balcony door", "terrace door", "threshold leak"],
        supportingIndicators: [
            "moisture concentrated at the door threshold",
            "water entry at the threshold or sill line",
            "staining at the opening connection to the balcony or terrace"
        ],
        contradictingIndicators: [
            "moisture isolated away from the door opening",
            "condition better explained by a drainage outlet blockage"
        ],
        requiredVerification: [
            "Inspect the door threshold and sill waterproofing detail.",
            "Verify whether leakage follows the threshold line.",
            "Distinguish threshold failure from surface drainage issues."
        ],
        potentialConsequences: [
            "water entry into the interior",
            "finish damage near the opening",
            "recurring localized leakage"
        ],
        recommendedActions: [
            "Document the threshold condition and moisture path.",
            "Review the opening detail against adjacent doors.",
            "Escalate for targeted threshold review if needed."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "tile-debonding",
        cause: "tile debonding",
        classification: "finish defect hypothesis",
        keywords: ["tile debonding", "debonded tile", "loose tile", "tile lift", "tile detachment"],
        supportingIndicators: [
            "localized tile movement or edge lifting",
            "surface finish sounds or behaves inconsistently under inspection",
            "bond failure signs at a tiled balcony or terrace surface"
        ],
        contradictingIndicators: [
            "surface defect limited to a crack in the tile only",
            "no evidence of lift or bond failure at the finish layer"
        ],
        requiredVerification: [
            "Inspect the tile finish for movement, edge lift, and local bond loss.",
            "Do not infer complete detachment from a crack alone.",
            "Check adjacent tiles for a repeated pattern."
        ],
        potentialConsequences: [
            "localized finish failure",
            "possible trip or maintenance concern",
            "progressive surface deterioration"
        ],
        recommendedActions: [
            "Document the affected tile area with close-up photos.",
            "Compare the finish against adjacent unaffected tiles.",
            "Plan targeted repair only after bond verification."
        ],
        riskRelevance: "medium",
        capexRelevance: "low",
        valuationRelevance: "medium"
    },
    {
        id: "hollow-sounding-tiles",
        cause: "hollow-sounding tiles",
        classification: "tile sounding hypothesis",
        keywords: ["hollow-sounding tiles", "hollow sounding", "drummy tiles", "hollow tile"],
        supportingIndicators: [
            "hollow or drummy sound during tapping checks",
            "tile surface response differs from adjacent bonded areas",
            "possible local voids under the finish"
        ],
        contradictingIndicators: [
            "tile surface remains fully bonded and stable",
            "issue limited to a visible crack without sounding anomaly"
        ],
        requiredVerification: [
            "Map hollow-sounding zones by tapping and visual inspection.",
            "Do not treat hollow sound as proof of complete detachment.",
            "Check whether the sounding anomaly repeats across adjacent tiles."
        ],
        potentialConsequences: [
            "localized finish deterioration",
            "possible bond degradation over time",
            "expanded inspection needs if the pattern spreads"
        ],
        recommendedActions: [
            "Document hollow-sounding locations and extent.",
            "Reinspect affected tiles for progression.",
            "Plan verification before deciding on intervention scope."
        ],
        riskRelevance: "medium",
        capexRelevance: "low",
        valuationRelevance: "medium"
    },
    {
        id: "frost-related-deterioration",
        cause: "frost-related deterioration",
        classification: "weathering hypothesis",
        keywords: ["frost", "freeze-thaw", "winter weathering", "frost deterioration", "frost damage"],
        supportingIndicators: [
            "weather-exposed deterioration after cold periods",
            "surface damage consistent with freeze-thaw exposure",
            "repeated winter-related distress at the balcony or terrace"
        ],
        contradictingIndicators: [
            "damage clearly traced to a separate mechanical impact",
            "surface distress explained by a single drainage blockage only"
        ],
        requiredVerification: [
            "Inspect weather exposure, water retention, and surface damage pattern.",
            "Differentiate frost deterioration from one-off impact damage.",
            "Review whether cold-weather exposure matches the observed distress."
        ],
        potentialConsequences: [
            "surface wear and breakdown",
            "accelerated material deterioration",
            "recurring maintenance needs"
        ],
        recommendedActions: [
            "Document weathering pattern and exposure orientation.",
            "Review drainage and moisture retention details.",
            "Plan targeted verification before remedial decisions."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "reinforcement-corrosion-at-balcony-slab",
        cause: "reinforcement corrosion at balcony slab",
        classification: "structural durability hypothesis",
        keywords: ["reinforcement corrosion", "balcony slab", "rust staining", "concrete cover", "rebar"],
        supportingIndicators: [
            "rust staining or cover distress at the balcony slab",
            "localized deterioration consistent with reinforcement exposure",
            "balcony slab distress near reinforcement zone"
        ],
        contradictingIndicators: [
            "no sign of concrete cover distress or reinforcement exposure",
            "damage limited to surface tile finish only"
        ],
        requiredVerification: [
            "Inspect the slab surface, cover, and any reinforcement exposure.",
            "Do not infer structural instability from corrosion alone.",
            "Confirm whether slab distress is localized or progressive."
        ],
        potentialConsequences: [
            "possible loss of durability at the slab",
            "progressive local concrete deterioration",
            "higher maintenance demand"
        ],
        recommendedActions: [
            "Document the corrosion signs and slab condition.",
            "Review adjacent concrete zones for matching distress.",
            "Plan specialist verification if slab deterioration progresses."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "concrete-spalling",
        cause: "concrete spalling",
        classification: "concrete deterioration hypothesis",
        keywords: ["spalling", "spalled concrete", "concrete spalling", "broken cover", "exposed concrete"],
        supportingIndicators: [
            "loss of concrete cover at the balcony or terrace element",
            "surface breakout or spalled area visible",
            "localized material loss in a concrete slab or edge"
        ],
        contradictingIndicators: [
            "surface distress limited to a tile finish only",
            "no verified breakout or concrete loss observed"
        ],
        requiredVerification: [
            "Inspect the concrete surface, cover layer, and exposed edges.",
            "Keep concrete spalling hypothetical until verified.",
            "Check whether the loss is superficial or indicates deeper deterioration."
        ],
        potentialConsequences: [
            "further concrete deterioration",
            "loss of local cover protection",
            "higher repair complexity if progression continues"
        ],
        recommendedActions: [
            "Document the spalled area and surrounding condition.",
            "Review adjacent concrete elements for similar distress.",
            "Escalate for targeted structural/durability verification if needed."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "railing-anchorage-deterioration",
        cause: "railing anchorage deterioration",
        classification: "anchorage hypothesis",
        keywords: ["railing anchor", "railing anchorage", "anchor corrosion", "railing fixing", "balustrade anchor"],
        supportingIndicators: [
            "deterioration at railing anchor or fixing points",
            "visible corrosion around anchorage detail",
            "weather-exposed fixing deterioration"
        ],
        contradictingIndicators: [
            "anchors appear sound and secure on inspection",
            "issue limited to railing finish only"
        ],
        requiredVerification: [
            "Inspect railing fixings and anchorage details.",
            "Do not infer structural instability from anchor corrosion alone.",
            "Check whether distress is localized or repeated at several fixings."
        ],
        potentialConsequences: [
            "localized maintenance demand",
            "possible durability loss at fixing points",
            "further corrosion if untreated"
        ],
        recommendedActions: [
            "Document anchor locations and visible deterioration.",
            "Compare affected fixings with adjacent anchors.",
            "Plan targeted verification and repair as required."
        ],
        riskRelevance: "high",
        capexRelevance: "medium",
        valuationRelevance: "high"
    },
    {
        id: "movement-joint-defect",
        cause: "movement joint defect",
        classification: "joint accommodation hypothesis",
        keywords: ["movement joint", "expansion joint", "joint defect", "joint failure", "movement gap"],
        supportingIndicators: [
            "joint distress at a balcony or terrace movement joint",
            "joint opening or restraint consistent with reduced movement capacity",
            "surface distress follows the movement-joint line"
        ],
        contradictingIndicators: [
            "joint remains open and functional",
            "distress isolated away from any joint detail"
        ],
        requiredVerification: [
            "Inspect the movement joint for continuity and functional gap.",
            "Differentiate movement-joint defects from surface finish defects.",
            "Check nearby elements for matching distress patterns."
        ],
        potentialConsequences: [
            "localized cracking or leakage",
            "reduced movement accommodation",
            "repeat repair demand"
        ],
        recommendedActions: [
            "Document joint condition and adjacent distress.",
            "Review whether the joint is restraining expected movement.",
            "Plan targeted verification before intervention scope is defined."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "age-related-deterioration",
        cause: "age-related deterioration",
        classification: "aging hypothesis",
        keywords: ["age-related", "aged", "weathered", "older balcony", "service life"],
        supportingIndicators: [
            "overall condition consistent with long-term exposure",
            "multiple minor defects typical of age and wear",
            "broad deterioration rather than one isolated trigger"
        ],
        contradictingIndicators: [
            "recent isolated damage better explains the condition",
            "single defect dominates the observed pattern"
        ],
        requiredVerification: [
            "Review age, maintenance, and history of the element.",
            "Inspect whether deterioration is widespread or localized.",
            "Separate aging from acute isolated defects."
        ],
        potentialConsequences: [
            "progressive decline in condition",
            "higher maintenance frequency",
            "future intervention scope growth"
        ],
        recommendedActions: [
            "Document age-related wear indicators.",
            "Prioritize condition-based maintenance planning.",
            "Schedule follow-up review for critical details."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "workmanship-defect",
        cause: "workmanship defect",
        classification: "quality hypothesis",
        keywords: ["workmanship defect", "poor workmanship", "installation defect", "poor installation", "incorrect detailing"],
        supportingIndicators: [
            "detail quality indicates possible execution deficiencies",
            "multiple anomalies consistent with poor workmanship",
            "inconsistent detailing at joints, edges, or transitions"
        ],
        contradictingIndicators: [
            "details appear consistent and well executed",
            "single isolated issue without broader workmanship pattern"
        ],
        requiredVerification: [
            "Inspect representative details for execution consistency.",
            "Treat workmanship as a hypothesis pending verification.",
            "Review available as-built or maintenance records if needed."
        ],
        potentialConsequences: [
            "recurring detail defects",
            "increased repair complexity",
            "possible broader quality concerns"
        ],
        recommendedActions: [
            "Document workmanship anomalies with detail references.",
            "Compare affected details with adjacent construction zones.",
            "Prioritize targeted verification before scoping repairs."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "water-penetration-into-occupied-space",
        cause: "water penetration into occupied space",
        classification: "internal ingress hypothesis",
        keywords: ["occupied space", "interior leak", "water penetration", "leak into interior", "ceiling leak", "room below"],
        supportingIndicators: [
            "water reaches the occupied space below the balcony or terrace",
            "interior staining or dampness appears below the external element",
            "leakage path extends through the external assembly into the room below"
        ],
        contradictingIndicators: [
            "moisture limited to the external surface only",
            "condition clearly explained by a blocked outlet without internal impact"
        ],
        requiredVerification: [
            "Confirm whether leakage has reached the occupied interior space.",
            "Map the moisture path from the external element into the interior.",
            "Distinguish occupied-space leakage from surface wetting only."
        ],
        potentialConsequences: [
            "interior finish damage",
            "occupant disturbance",
            "possible hidden moisture accumulation"
        ],
        recommendedActions: [
            "Document any interior staining or dampness below the element.",
            "Review the leakage route through the assembly.",
            "Escalate for targeted investigation if interior impact persists."
        ],
        riskRelevance: "high",
        capexRelevance: "medium",
        valuationRelevance: "high"
    },
    {
        id: "thermal-bridge-at-balcony-connection",
        cause: "thermal bridge at balcony connection",
        classification: "thermal performance hypothesis",
        keywords: ["thermal bridge", "balcony connection", "cantilever slab", "cold bridge", "thermal break"],
        supportingIndicators: [
            "cold surface or condensation pattern at the balcony connection",
            "balcony connection detail suggests a conductive thermal path",
            "supporting indicators point to a localized thermal weak point"
        ],
        contradictingIndicators: [
            "no supporting indicators beyond generic moisture or leakage",
            "condition clearly explained by waterproofing or drainage alone"
        ],
        requiredVerification: [
            "Inspect the balcony connection for thermal-bridge indicators.",
            "Thermal bridge must remain hypothetical without supporting evidence.",
            "Differentiate thermal performance from leakage or finish defects."
        ],
        potentialConsequences: [
            "localized condensation risk",
            "comfort and energy-performance concerns",
            "possible finish deterioration at cold zones"
        ],
        recommendedActions: [
            "Document the connection detail and any cold-zone indicators.",
            "Review adjacent conditions for repeat cold-bridge behavior.",
            "Plan targeted verification where thermal performance is relevant."
        ],
        riskRelevance: "medium",
        capexRelevance: "low",
        valuationRelevance: "medium"
    }
];

const COMPONENT_TERMS = [
    "balcony",
    "balconies",
    "terrace",
    "terraces",
    "loggia",
    "loggias",
    "cantilever slab",
    "cantilever",
    "slab",
    "railing",
    "balustrade",
    "waterproofing",
    "drainage",
    "tile",
    "tiles",
    "surface finish",
    "finish",
    "weather exposure"
];

const ISSUE_TERMS = [
    "waterproofing",
    "drain",
    "drainage",
    "standing water",
    "ponding",
    "slope",
    "sloped",
    "threshold",
    "wall connection",
    "door",
    "tile",
    "hollow",
    "frost",
    "corrosion",
    "spalling",
    "anchor",
    "movement joint",
    "age-related",
    "workmanship",
    "penetration",
    "thermal bridge",
    "leak",
    "leakage",
    "moisture",
    "staining"
];

export default class BalconiesTerracesKnowledgeProvider {

    /**
     * Return deterministic knowledge for balconies, loggias and terraces.
     *
     * @param {Object} [input={}] - Knowledge input payload.
     * @returns {Object} Stable balconies-terraces knowledge contract.
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
            domain: "balconies-terraces",
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
        textOf(source.building.balconyType).trim().length > 0 ||
        textOf(source.building.terraceType).trim().length > 0 ||
        textOf(source.building.waterproofingType).trim().length > 0 ||
        textOf(source.building.railingType).trim().length > 0 ||
        textOf(source.building.structuralSystem).trim().length > 0 ||
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
        textOf(source.building.balconyType),
        textOf(source.building.terraceType),
        textOf(source.building.waterproofingType),
        textOf(source.building.railingType),
        textOf(source.building.structuralSystem)
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

    if (id === "defective-balcony-waterproofing") {
        if (containsAny(text, ["balcony waterproofing", "balcony membrane", "balcony slab waterproofing", "balcony leak", "balcony leakage"])) {
            score += 12;
        }
    }

    if (id === "defective-terrace-waterproofing") {
        if (containsAny(text, ["terrace waterproofing", "terrace membrane", "roof terrace", "terrace leak", "terrace leakage"])) {
            score += 12;
        }
    }

    if (id === "insufficient-drainage") {
        if (containsAny(text, ["insufficient drainage", "poor drainage", "drainage issue", "water not draining", "ponding", "standing water"])) {
            score += 12;
        }
    }

    if (id === "blocked-drainage-outlet") {
        if (containsAny(text, ["blocked drainage outlet", "blocked drain", "drain outlet", "outlet blockage", "blocked outlet"])) {
            score += 12;
        }
    }

    if (id === "inadequate-surface-slope") {
        if (containsAny(text, ["inadequate slope", "insufficient slope", "flat surface", "no fall", "poor fall", "surface slope"])) {
            score += 12;
        }
    }

    if (id === "failed-wall-connection-waterproofing") {
        if (containsAny(text, ["wall connection", "wall junction", "wall abutment", "upstand", "balcony wall junction", "terrace wall junction"])) {
            score += 12;
        }
    }

    if (id === "failed-door-threshold-waterproofing") {
        if (containsAny(text, ["door threshold", "threshold", "door sill", "balcony door", "terrace door", "threshold leak"])) {
            score += 12;
        }
    }

    if (id === "tile-debonding") {
        if (containsAny(text, ["tile debonding", "debonded tile", "loose tile", "tile lift", "tile detachment"])) {
            score += 12;
        }
    }

    if (id === "hollow-sounding-tiles") {
        if (containsAny(text, ["hollow-sounding tiles", "hollow sounding", "drummy tiles", "hollow tile"])) {
            score += 12;
        }
    }

    if (id === "frost-related-deterioration") {
        if (containsAny(text, ["frost", "freeze-thaw", "winter weathering", "frost deterioration", "frost damage"])) {
            score += 12;
        }
    }

    if (id === "reinforcement-corrosion-at-balcony-slab") {
        if (containsAny(text, ["reinforcement corrosion", "balcony slab", "rust staining", "concrete cover", "rebar"])) {
            score += 12;
        }
    }

    if (id === "concrete-spalling") {
        if (containsAny(text, ["spalling", "spalled concrete", "concrete spalling", "broken cover", "exposed concrete"])) {
            score += 12;
        }
    }

    if (id === "railing-anchorage-deterioration") {
        if (containsAny(text, ["railing anchor", "railing anchorage", "anchor corrosion", "railing fixing", "balustrade anchor"])) {
            score += 12;
        }
    }

    if (id === "movement-joint-defect") {
        if (containsAny(text, ["movement joint", "expansion joint", "joint defect", "joint failure", "movement gap"])) {
            score += 12;
        }
    }

    if (id === "age-related-deterioration") {
        if (containsAny(text, ["age-related", "aged", "weathered", "older balcony", "service life"])) {
            score += 10;
        }
    }

    if (id === "workmanship-defect") {
        if (containsAny(text, ["workmanship defect", "poor workmanship", "installation defect", "poor installation", "incorrect detailing"])) {
            score += 12;
        }
    }

    if (id === "water-penetration-into-occupied-space") {
        if (containsAny(text, ["occupied space", "interior leak", "water penetration", "leak into interior", "ceiling leak", "room below"])) {
            score += 12;
        }
    }

    if (id === "thermal-bridge-at-balcony-connection") {
        if (containsAny(text, ["thermal bridge", "balcony connection", "cantilever slab", "cold bridge", "thermal break"])) {
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
