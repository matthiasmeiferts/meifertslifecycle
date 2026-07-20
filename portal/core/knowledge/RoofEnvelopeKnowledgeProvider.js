/**
 * MBLS Expert Intelligence Layer
 * Roof Envelope Knowledge Provider
 *
 * Provides deterministic, structured expert knowledge for roof-envelope and
 * facade-moisture findings. The implementation is pure, immutable, and free of
 * AI, external services, or UI concerns.
 */

import { RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION } from "../risk/RiskRelevanceGovernanceRegistry.js";

const EMPTY_CONTRACT = Object.freeze({
    domain: "roof-envelope",
    hypotheses: []
});

const KNOWLEDGE = [
    {
        id: "defective-roof-covering",
        cause: "defective roof covering",
        classification: "roof-envelope defect hypothesis",
        keywords: ["roof covering", "roof tile", "roof tiles", "roof sheet", "roof membrane", "roof surface", "missing roof element"],
        indicators: [
            "visible damage or gaps in the roof covering",
            "moisture entering through the roof surface after rainfall",
            "deteriorated roof surface material"
        ],
        contradictions: [
            "moisture concentrated only at a window or facade joint",
            "condition clearly traced to a plumbing service"
        ],
        verification: [
            "Inspect the roof surface for broken, missing, or displaced elements.",
            "Check whether the moisture appears after rainfall or wind exposure.",
            "Review adjoining roof details for matching deterioration."
        ],
        consequences: [
            "continued water ingress",
            "finish deterioration below the roof",
            "hidden substrate damage"
        ],
        actions: [
            "Document the affected roof area with overview and detail photos.",
            "Compare the roof surface against adjacent sections.",
            "Escalate for targeted maintenance review if active ingress is suspected."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "defective-flat-roof-waterproofing",
        cause: "defective flat-roof waterproofing",
        classification: "roof-envelope waterproofing hypothesis",
        keywords: ["flat roof", "flat-roof", "roof terrace", "ponding", "standing water", "waterproofing", "membrane"],
        indicators: [
            "ponding water on a flat roof",
            "moisture through the flat-roof membrane",
            "repeated wet patches on a horizontal roof surface"
        ],
        contradictions: [
            "damage clearly caused by a blocked gutter alone",
            "leak source isolated to a roof penetration"
        ],
        verification: [
            "Inspect the membrane, laps, and transitions on the flat roof.",
            "Review whether water is ponding or draining poorly.",
            "Check exposed edges and upstands for deterioration."
        ],
        consequences: [
            "progressive leakage",
            "membrane deterioration",
            "substrate damage"
        ],
        actions: [
            "Document the affected roof zone and drainage pattern.",
            "Compare the membrane condition with nearby roof sections.",
            "Escalate for targeted waterproofing review if moisture persists."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "failed-flashing-or-penetration-detail",
        cause: "failed flashing or penetration detail",
        classification: "roof-envelope penetration hypothesis",
        keywords: ["flashing", "penetration", "roof penetration", "vent stack", "pipe penetration", "upstand", "detail"],
        indicators: [
            "moisture around a penetration or edge detail",
            "staining at a roof opening or service penetration",
            "water entry at a flashing line"
        ],
        contradictions: [
            "moisture limited to a wide area of roof surface without a detail fault",
            "issue clearly explained by blocked gutter overflow"
        ],
        verification: [
            "Inspect the penetration, flashing, and adjacent roof junction.",
            "Check whether the moisture tracks from a single roof detail.",
            "Review nearby weather-exposed transitions for matching wear."
        ],
        consequences: [
            "localized water ingress",
            "hidden damage around the penetration",
            "recurring repair demand"
        ],
        actions: [
            "Document the exact penetration detail and moisture path.",
            "Compare the affected detail with adjacent penetrations.",
            "Escalate for targeted repair if the detail remains active."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "defective-roof-drainage",
        cause: "defective roof drainage",
        classification: "drainage-related roof-envelope hypothesis",
        keywords: ["roof drainage", "drain", "scupper", "outlet", "rainwater outlet", "roof drain", "sump"],
        indicators: [
            "water not leaving the roof as intended",
            "overflow near roof outlets or drainage points",
            "moisture associated with poor roof runoff"
        ],
        contradictions: [
            "water entry concentrated at a window or facade junction",
            "condition caused by a single isolated roof penetration"
        ],
        verification: [
            "Inspect the roof drainage path and outlet details.",
            "Check whether runoff is ponding or backing up near the drain.",
            "Review adjacent roof areas for repeated wetting."
        ],
        consequences: [
            "continued wetting of roof surfaces",
            "overflow into vulnerable details",
            "ongoing maintenance demand"
        ],
        actions: [
            "Document the drainage route and any overflow signs.",
            "Compare the roof outlet against nearby discharge points.",
            "Escalate for maintenance review if runoff remains obstructed."
        ],
        riskRelevance: "high",
        capexRelevance: "medium",
        valuationRelevance: "high"
    },
    {
        id: "blocked-gutter-or-downpipe",
        cause: "blocked gutter or downpipe",
        classification: "maintenance-related roof-envelope hypothesis",
        keywords: ["gutter", "downpipe", "blocked", "blockage", "overflow", "debris", "leaf"],
        indicators: [
            "overflow from gutter or downpipe",
            "water staining below a gutter line",
            "rainwater not discharging through the downpipe"
        ],
        contradictions: [
            "moisture clearly traced to a roof penetration or flashing",
            "condition unrelated to rainwater collection or discharge"
        ],
        verification: [
            "Inspect the gutter and downpipe for visible blockage.",
            "Check whether water is overflowing from the edge or outlet.",
            "Review nearby facade areas for matching overflow staining."
        ],
        consequences: [
            "recurrent overflow and wetting",
            "finish deterioration below the gutter line",
            "water entry at adjacent roof details"
        ],
        actions: [
            "Document the blockage and the overflow path.",
            "Compare the gutter line with adjoining roof drainage points.",
            "Escalate for maintenance attention if discharge remains obstructed."
        ],
        riskRelevance: "medium",
        capexRelevance: "low",
        valuationRelevance: "medium"
    },
    {
        id: "facade-joint-or-sealant-failure",
        cause: "facade joint or sealant failure",
        classification: "facade connection hypothesis",
        keywords: ["facade joint", "sealant", "joint", "movement joint", "panel joint", "interface", "mortar joint"],
        indicators: [
            "moisture at a facade joint or seal line",
            "staining along vertical or horizontal joints",
            "sealant deterioration at an exposed facade line"
        ],
        contradictions: [
            "condition isolated to a roof or gutter element only",
            "moisture clearly traced to internal plumbing"
        ],
        verification: [
            "Inspect the joint or seal line for visible deterioration.",
            "Check whether moisture follows a facade interface.",
            "Review adjacent joints for similar wear or opening."
        ],
        consequences: [
            "continued facade water ingress",
            "seal failure progression",
            "finish deterioration at the joint"
        ],
        actions: [
            "Document the joint line and any staining pattern.",
            "Compare the affected joint with adjacent facade details.",
            "Escalate for targeted resealing or repair review if needed."
        ],
        riskRelevance: "high",
        capexRelevance: "medium",
        valuationRelevance: "high"
    },
    {
        id: "defective-window-or-door-connection",
        cause: "defective window or door connection",
        classification: "opening-connection hypothesis",
        keywords: ["window", "door", "reveal", "frame", "threshold", "sill", "connection", "opening detail"],
        indicators: [
            "moisture at a window or door frame connection",
            "staining at a reveal, sill, or threshold",
            "water entry around the perimeter of an opening"
        ],
        contradictions: [
            "condition clearly limited to a roof membrane or drainage issue",
            "moisture tied only to a facade joint away from the opening"
        ],
        verification: [
            "Inspect the opening perimeter, sill, and frame connection.",
            "Check whether the moisture follows the reveal or threshold detail.",
            "Review nearby openings for a similar pattern."
        ],
        consequences: [
            "ongoing moisture entry at the opening",
            "finish deterioration around the reveal",
            "localized damage to adjacent internal surfaces"
        ],
        actions: [
            "Document the opening detail with overview and close photos.",
            "Compare the affected opening against adjacent windows or doors.",
            "Escalate for targeted seal or connection review if required."
        ],
        riskRelevance: "high",
        capexRelevance: "medium",
        valuationRelevance: "high"
    },
    {
        id: "failed-balcony-or-terrace-waterproofing",
        cause: "failed balcony or terrace waterproofing",
        classification: "balcony waterproofing hypothesis",
        keywords: ["balcony", "terrace", "waterproofing", "balcony slab", "balcony edge", "terrace surface", "outdoor deck"],
        indicators: [
            "moisture at a balcony or terrace surface",
            "leakage below an exposed balcony or terrace",
            "water entry at balcony edges or junctions"
        ],
        contradictions: [
            "moisture clearly isolated to an indoor plumbing service",
            "condition limited to a roof drain or gutter blockage"
        ],
        verification: [
            "Inspect the balcony or terrace surface, edges, and junctions.",
            "Check whether moisture appears below the exposed platform.",
            "Review adjacent external transitions for matching distress."
        ],
        consequences: [
            "continued leakage through the platform",
            "hidden deterioration below the surface",
            "recurring repairs to exposed finishes"
        ],
        actions: [
            "Document the balcony or terrace detail and leak path.",
            "Compare the platform edge with adjoining envelope elements.",
            "Escalate for targeted waterproofing review if active ingress remains likely."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "thermal-bridge-at-envelope-junction",
        cause: "thermal bridge at envelope junction",
        classification: "thermal bridge hypothesis",
        keywords: ["thermal bridge", "junction", "corner", "reveal", "edge", "envelope junction", "cold spot"],
        indicators: [
            "recurrent condensation at a cold junction",
            "moisture at an envelope intersection without direct rainwater entry",
            "surface cooling at a junction detail"
        ],
        contradictions: [
            "clear rainwater entry from a roof, gutter, or opening defect",
            "moisture explained by a direct drainage failure"
        ],
        verification: [
            "Inspect whether the moisture aligns with a cold junction or corner.",
            "Compare the affected detail with adjacent surfaces.",
            "Review whether the pattern is consistent with an envelope transition."
        ],
        consequences: [
            "recurrent surface condensation",
            "finish deterioration at the junction",
            "persistent moisture in the same location"
        ],
        actions: [
            "Document the cold junction and affected surface pattern.",
            "Compare the area with neighboring details for repetition.",
            "Differentiate condensation from active water entry before repair planning."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "insufficient-roof-or-facade-ventilation",
        cause: "insufficient roof or facade ventilation",
        classification: "ventilation hypothesis",
        keywords: ["ventilation", "airflow", "roof space", "attic", "cavity", "facade cavity", "vented", "air exchange"],
        indicators: [
            "condensation in a roof space or facade cavity",
            "moisture linked to poor air movement",
            "dampness recurring in enclosed building voids"
        ],
        contradictions: [
            "moisture clearly traced to a roof penetration or opening connection",
            "condition explained by rainwater overflow"
        ],
        verification: [
            "Inspect the roof space or facade cavity for air movement issues.",
            "Check whether the moisture recurs in enclosed voids.",
            "Review nearby vents or openings for restricted airflow."
        ],
        consequences: [
            "persistent condensation",
            "finish deterioration in concealed spaces",
            "ongoing moisture accumulation"
        ],
        actions: [
            "Document the affected void or enclosure and its moisture pattern.",
            "Compare the area with adjacent ventilated spaces.",
            "Separate ventilation-related moisture from direct ingress before repair planning."
        ],
        riskRelevance: "medium",
        capexRelevance: "low",
        valuationRelevance: "medium"
    },
    {
        id: "wind-driven-rain-penetration",
        cause: "wind-driven rain penetration",
        classification: "weather-exposure hypothesis",
        keywords: ["wind-driven rain", "driven rain", "storm", "weather side", "exposed facade", "weather exposure", "wind exposure"],
        indicators: [
            "moisture after storm or exposed weather",
            "penetration on the weather-facing side",
            "rain entry driven by wind exposure"
        ],
        contradictions: [
            "condition limited to an internal service leak",
            "moisture explained by a blocked gutter only"
        ],
        verification: [
            "Inspect the weather-facing side for moisture entry patterns.",
            "Check whether the issue appears after storm exposure.",
            "Review nearby envelope details for similar weather staining."
        ],
        consequences: [
            "recurrent wetting during exposed weather",
            "finish deterioration on the weather side",
            "repeat ingress at exposed details"
        ],
        actions: [
            "Document the exposure direction and moisture track.",
            "Compare the affected surface with sheltered sections.",
            "Escalate for targeted envelope review if weather-driven entry is likely."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "material-ageing-or-maintenance-backlog",
        cause: "material ageing or maintenance backlog",
        classification: "maintenance backlog hypothesis",
        keywords: ["ageing", "aging", "maintenance backlog", "deferred maintenance", "worn", "deteriorated", "old sealant", "general wear"],
        indicators: [
            "multiple envelope details show general wear",
            "widespread deterioration without a single isolated fault",
            "outdated or neglected roof-envelope elements"
        ],
        contradictions: [
            "issue clearly isolated to one fresh damage point",
            "condition explained by a single localized defect"
        ],
        verification: [
            "Inspect whether the condition reflects widespread wear rather than one defect.",
            "Review adjacent envelope elements for similar ageing signs.",
            "Check whether maintenance has been deferred across the area."
        ],
        consequences: [
            "progressive deterioration across the envelope",
            "repeat repair demand",
            "increasing risk of secondary moisture entry"
        ],
        actions: [
            "Document the extent of general wear across the area.",
            "Compare the affected element with nearby envelope components.",
            "Plan maintenance attention if the pattern is consistent with backlog."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    }
];

export default class RoofEnvelopeKnowledgeProvider {

    /**
     * Return deterministic knowledge for roof-envelope and facade-moisture findings.
     *
     * @param {Object} [input={}] - Knowledge request.
     * @param {Object} [input.finding] - Finding payload.
     * @param {Object} [input.building] - Building payload.
     * @param {Array<Object>} [input.measurements] - Optional measurement list.
     * @returns {Object} Stable roof-envelope knowledge contract.
     */
    static getKnowledge(input = {}) {
        const source = normalizeInput(input);
        const combinedText = buildCombinedText(source);
        const ranked = KNOWLEDGE
            .map((entry) => ({
                entry,
                score: scoreMatch(entry, combinedText)
            }))
            .sort((left, right) => {
                if (right.score !== left.score) {
                    return right.score - left.score;
                }

                return left.entry.id.localeCompare(right.entry.id);
            });

        if (ranked.length === 0 || ranked[0].score === 0) {
            return EMPTY_CONTRACT;
        }

        return {
            domain: "roof-envelope",
            hypotheses: ranked
                .filter((entry) => entry.score > 0)
                .map(({ entry }) => toHypothesis(entry))
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

function scoreMatch(entry, combinedText) {
    const text = String(combinedText).toLowerCase();
    let score = 0;

    entry.keywords.forEach((keyword) => {
        if (matches(text, keyword)) {
            score += 3;
        }
    });

    entry.indicators.forEach((indicator) => {
        if (matches(text, indicator)) {
            score += 2;
        }
    });

    return score;
}

function toHypothesis(entry) {
    return {
        id: entry.id,
        cause: entry.cause,
        classification: entry.classification,
        supportingIndicators: cloneArray(entry.indicators),
        contradictingIndicators: cloneArray(entry.contradictions),
        requiredVerification: cloneArray(entry.verification),
        potentialConsequences: cloneArray(entry.consequences),
        recommendedActions: cloneArray(entry.actions),
        riskRelevance: entry.riskRelevance,
        riskRelevanceVersion: RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION,
        capexRelevance: entry.capexRelevance,
        valuationRelevance: entry.valuationRelevance
    };
}

function matches(text, phrase) {
    const normalizedPhrase = String(phrase).toLowerCase();

    if (normalizedPhrase.length === 0) {
        return false;
    }

    if (text.includes(normalizedPhrase)) {
        return true;
    }

    return normalizedPhrase
        .split(/[^a-z0-9]+/)
        .filter((token) => token.length >= 4)
        .some((token) => text.includes(token));
}

function buildCombinedText(source) {
    return [
        textOf(source.finding.category),
        textOf(source.finding.location),
        textOf(source.finding.description),
        textOf(source.finding.observations),
        textOf(source.building.constructionType),
        textOf(source.building.constructionYear),
        textOf(source.building.numberOfStoreys),
        source.building.basementPresent === true ? "basement present" : "",
        ...source.measurements.map((entry) => textOf(entry))
    ].join(" ").toLowerCase();
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
