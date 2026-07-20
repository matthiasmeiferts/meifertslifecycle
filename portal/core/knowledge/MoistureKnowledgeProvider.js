/**
 * MBLS Expert Intelligence Layer
 * Moisture Knowledge Provider
 *
 * Provides deterministic, structured expert knowledge for moisture-related
 * inspection findings. The implementation is pure, immutable, and free of AI,
 * external services, or UI concerns.
 */

import { RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION } from "../risk/RiskRelevanceGovernanceRegistry.js";

const EMPTY_CONTRACT = Object.freeze({
    domain: "moisture",
    hypotheses: []
});

const KNOWLEDGE = [
    {
        id: "defective-exterior-waterproofing",
        cause: "defective exterior waterproofing",
        keywords: ["exterior waterproofing", "waterproofing", "membrane", "balcony", "terrace", "facade finish"],
        indicators: [
            "moisture on an exterior wall or facade-facing surface",
            "water ingress after rain or wet weather",
            "staining near balconies, terraces, or exposed junctions"
        ],
        contradictions: [
            "moisture limited to isolated internal fixtures without exterior exposure",
            "no relation to rain, runoff, or exposed building elements"
        ],
        verification: [
            "Inspect the affected exterior surface, junctions, and waterproofing layers.",
            "Check whether the condition intensifies after rainfall or wet weather.",
            "Verify nearby seals, coatings, and exposed transitions for defects."
        ],
        consequences: [
            "progressive finish deterioration",
            "hidden substrate damage",
            "continued water ingress"
        ],
        actions: [
            "Document the exposed area with overview and detail photos.",
            "Check adjacent exterior details for matching moisture patterns.",
            "Escalate for maintenance review if active ingress is suspected."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "rising-damp",
        cause: "rising damp",
        keywords: ["rising damp", "basement wall", "ground level", "lower wall", "plinth", "capillary"],
        indicators: [
            "moisture concentrated at the bottom of walls",
            "condition located at basement or ground-contact areas",
            "salt or tide-mark style staining rising from the base"
        ],
        contradictions: [
            "moisture located well above ground-contact areas without vertical rise",
            "condition clearly linked to a plumbing fixture or roof leak"
        ],
        verification: [
            "Check the lowest affected wall sections and adjoining floor edges.",
            "Confirm whether the pattern rises from the base rather than starting mid-wall.",
            "Review ground-contact details, damp-proof layers, and adjacent finishes."
        ],
        consequences: [
            "persistent lower-wall deterioration",
            "salts or staining in finishes",
            "repeated internal repair cycles"
        ],
        actions: [
            "Record the height and spread of the damp pattern.",
            "Inspect the floor-to-wall interface and basement perimeter details.",
            "Compare the pattern with nearby plumbing and external sources."
        ],
        riskRelevance: "high",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "condensation",
        cause: "condensation",
        keywords: ["condensation", "surface moisture", "cold surface", "indoor humidity", "interior wall", "window reveal"],
        indicators: [
            "moisture on interior surfaces without direct water entry",
            "cold surfaces or recurring morning dampness",
            "condensation visible at windows, reveals, or thermal bridges"
        ],
        contradictions: [
            "clear leak path from plumbing, roof, or exterior defect",
            "condition concentrated only at a pressurized water service"
        ],
        verification: [
            "Check whether the moisture appears on cold interior surfaces.",
            "Review ventilation, indoor humidity, and temperature differences.",
            "Confirm whether the condition is recurring under normal occupancy."
        ],
        consequences: [
            "mold growth potential",
            "finish degradation",
            "occupant comfort issues"
        ],
        actions: [
            "Measure the affected surface and surrounding conditions.",
            "Inspect for recurring humidity accumulation or insufficient air exchange.",
            "Differentiate surface condensation from active ingress."
        ],
        riskRelevance: "medium",
        capexRelevance: "low",
        valuationRelevance: "medium"
    },
    {
        id: "plumbing-leakage",
        cause: "plumbing leakage",
        keywords: ["plumbing", "pipe", "service line", "fixture", "tap", "drain", "localized"],
        indicators: [
            "moisture near pipes, fixtures, or service routes",
            "localized dampness around kitchens, bathrooms, or wet areas",
            "spot-like staining aligned to internal services"
        ],
        contradictions: [
            "pattern clearly tied to exterior exposure or roof drainage",
            "moisture spread broadly across cold internal surfaces only"
        ],
        verification: [
            "Inspect nearby plumbing, fittings, and service runs.",
            "Check whether moisture is concentrated around one localized service area.",
            "Confirm whether the condition is linked to an operating fixture or drain."
        ],
        consequences: [
            "ongoing internal water damage",
            "hidden substrate deterioration",
            "repeat maintenance demand"
        ],
        actions: [
            "Trace the damp area back to nearby service lines or fixtures.",
            "Check adjoining rooms or lower levels for matching signs.",
            "Arrange maintenance attention if active leakage is indicated."
        ],
        riskRelevance: "high",
        capexRelevance: "medium",
        valuationRelevance: "high"
    },
    {
        id: "roof-or-facade-connection-defect",
        cause: "defective roof or facade connection",
        keywords: ["roof", "facade junction", "connection", "junction", "transition", "parapet", "penetration"],
        indicators: [
            "moisture at a roof-to-wall or facade connection",
            "staining near junctions, penetrations, or edges",
            "water entry concentrated at transitions between building elements"
        ],
        contradictions: [
            "condition isolated far away from any junction or edge detail",
            "no relation to roof, facade, or connection geometry"
        ],
        verification: [
            "Inspect the junction, edge, and penetration details closely.",
            "Check whether the moisture aligns with a roof or facade transition.",
            "Review seals, flashings, and connection workmanship for defects."
        ],
        consequences: [
            "progressive water ingress",
            "widespread finish damage",
            "recurring repair requirement"
        ],
        actions: [
            "Document the exact connection detail and moisture track.",
            "Compare the area against adjacent roof or facade sections.",
            "Escalate for targeted repair if a defective connection is likely."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "thermal-bridge",
        cause: "thermal bridge",
        keywords: ["thermal bridge", "cold corner", "cold surface", "reveal", "bridge", "surface cooling"],
        indicators: [
            "moisture on a known cold spot or corner",
            "surface cooling concentrated at a structural junction",
            "repeated condensation at the same interior location"
        ],
        contradictions: [
            "clear plumbing or roof leak source",
            "condition localized only to exterior-facing wet ingress"
        ],
        verification: [
            "Check whether the moisture coincides with a cold surface area.",
            "Compare the affected point with nearby unaffected surfaces.",
            "Confirm whether the pattern follows a thermal boundary rather than active ingress."
        ],
        consequences: [
            "surface condensation",
            "mold potential",
            "finish deterioration over time"
        ],
        actions: [
            "Document the cold spot and surrounding conditions.",
            "Check the geometry of the affected detail and adjacent insulation continuity.",
            "Differentiate recurring condensation from water entry."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "insufficient-ventilation",
        cause: "insufficient ventilation",
        keywords: ["ventilation", "air change", "stale air", "humidity", "indoor air", "bathroom"],
        indicators: [
            "moisture recurring in enclosed rooms with limited air movement",
            "high indoor humidity without a direct leak source",
            "condensation or dampness in bathrooms, kitchens, or closed rooms"
        ],
        contradictions: [
            "moisture clearly aligned to a single plumbing or exterior defect",
            "localized external water entry explaining the pattern"
        ],
        verification: [
            "Check the room's air movement and moisture accumulation pattern.",
            "Review whether the area has limited natural or mechanical ventilation.",
            "Confirm whether moisture appears in closed or heavily used internal spaces."
        ],
        consequences: [
            "mold growth potential",
            "persistent condensation",
            "reduced internal comfort"
        ],
        actions: [
            "Record occupancy, enclosure, and moisture persistence conditions.",
            "Inspect ventilation points and surrounding air circulation.",
            "Separate ventilation-related moisture from active water ingress."
        ],
        riskRelevance: "medium",
        capexRelevance: "low",
        valuationRelevance: "medium"
    },
    {
        id: "drainage-or-site-grading-deficiency",
        cause: "drainage or site grading deficiency",
        keywords: ["drainage", "site grading", "ground level", "runoff", "water pooling", "external wall base"],
        indicators: [
            "moisture at the base of walls exposed to runoff or pooling",
            "external water not being directed away from the building",
            "dampness near ground-contact edges or perimeter zones"
        ],
        contradictions: [
            "indoor-only moisture with no external water exposure",
            "condition tied to plumbing or interior service routes"
        ],
        verification: [
            "Check the external ground slope and runoff behavior around the building.",
            "Inspect whether water is pooling near the affected facade or wall base.",
            "Confirm that drainage directs water away from the building footprint."
        ],
        consequences: [
            "recurrent wetting of lower building elements",
            "finish deterioration at ground level",
            "increased moisture exposure over time"
        ],
        actions: [
            "Document the external ground condition and nearby water flow.",
            "Inspect perimeter drainage and grading around the affected area.",
            "Address runoff accumulation before repeated wetting continues."
        ],
        riskRelevance: "high",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    }
];

export default class MoistureKnowledgeProvider {

    /**
     * Return deterministic knowledge for moisture-related inspection findings.
     *
     * @param {Object} [input={}] - Knowledge request.
     * @param {Object} [input.finding] - Finding payload.
     * @param {Object} [input.building] - Building payload.
     * @param {Array<Object>} [input.measurements] - Optional measurement list.
     * @returns {Object} Stable moisture knowledge contract.
     */
    static getKnowledge(input = {}) {
        const source = normalizeInput(input);

        if (!hasSufficientInput(source)) {
            return EMPTY_CONTRACT;
        }

        const combinedText = buildCombinedText(source);
        const matched = matchKnowledge(source, combinedText);

        if (matched.length === 0) {
            return EMPTY_CONTRACT;
        }

        return {
            domain: "moisture",
            hypotheses: matched.map((entry) => toHypothesis(entry))
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

function matchKnowledge(source, combinedText) {
    const normalized = combinedText.toLowerCase();
    const category = String(source.finding.category || "").toLowerCase();
    const location = String(source.finding.location || "").toLowerCase();
    const description = String(source.finding.description || "").toLowerCase();
    const observations = textOf(source.finding.observations).toLowerCase();
    const buildingText = [
        String(source.building.constructionType || ""),
        String(source.building.constructionYear || ""),
        source.building.basementPresent === true ? "basement present" : ""
    ].join(" ").toLowerCase();

    const results = KNOWLEDGE.filter((item) => {
        if (category && /moisture|damp|wet/.test(category) === false && item.cause === "rising damp" && /basement|ground|lower wall/.test(`${location} ${description} ${observations} ${buildingText}`) === false) {
            return false;
        }

        return item.keywords.some((keyword) => {
            return contains(normalized, keyword) || contains(location, keyword) || contains(description, keyword) || contains(observations, keyword) || contains(buildingText, keyword);
        }) || category === "moisture" || contains(location, item.cause) || contains(description, item.cause) || contains(observations, item.cause);
    });

    if (results.length === 0) {
        return [];
    }

    return results
        .map((item) => ({
            item,
            score: scoreMatch(item, source, combinedText)
        }))
        .sort((left, right) => {
            if (right.score !== left.score) {
                return right.score - left.score;
            }

            return left.item.id.localeCompare(right.item.id);
        })
        .map(({ item }) => item);
}

function hasSufficientInput(source) {
    return Boolean(
        textOf(source.finding.location).trim().length > 0 ||
        textOf(source.finding.description).trim().length > 0 ||
        textOf(source.finding.observations).trim().length > 0 ||
        textOf(source.building.constructionType).trim().length > 0 ||
        textOf(source.building.constructionYear).trim().length > 0 ||
        source.building.basementPresent === true ||
        cloneArray(source.measurements).length > 0
    );
}

function scoreMatch(item, source, combinedText) {
    const location = String(source.finding.location || "").toLowerCase();
    const description = String(source.finding.description || "").toLowerCase();
    const observations = textOf(source.finding.observations).toLowerCase();
    const buildingText = [
        String(source.building.constructionType || ""),
        String(source.building.constructionYear || ""),
        source.building.basementPresent === true ? "basement present" : ""
    ].join(" ").toLowerCase();

    let score = 0;

    item.keywords.forEach((keyword) => {
        if (contains(combinedText, keyword)) {
            score += 3;
        }

        if (contains(location, keyword)) {
            score += 3;
        }

        if (contains(description, keyword)) {
            score += 3;
        }

        if (contains(observations, keyword)) {
            score += 2;
        }

        if (contains(buildingText, keyword)) {
            score += 2;
        }
    });

    if (item.cause === "rising damp" && /basement|ground|lower wall|base/i.test(`${location} ${description} ${observations} ${buildingText}`)) {
        score += 8;
    }

    if (item.cause === "condensation" && /indoor|interior|surface|window|bathroom|kitchen/i.test(`${location} ${description} ${observations} ${buildingText}`)) {
        score += 8;
    }

    if (item.cause === "plumbing leakage" && /pipe|fixture|tap|drain|service|localized/i.test(`${location} ${description} ${observations}`)) {
        score += 8;
    }

    if (item.cause === "defective roof or facade connection" && /roof|facade|junction|connection|transition|penetration/i.test(`${location} ${description} ${observations}`)) {
        score += 8;
    }

    if (item.cause === "insufficient ventilation" && /ventilation|humidity|stale|closed|enclosed/i.test(`${location} ${description} ${observations}`)) {
        score += 8;
    }

    if (item.cause === "thermal bridge" && /cold|corner|bridge|surface cooling|reveal/i.test(`${location} ${description} ${observations}`)) {
        score += 8;
    }

    if (item.cause === "drainage or site grading deficiency" && /drainage|grading|runoff|pooling|ground level|base/i.test(`${location} ${description} ${observations} ${buildingText}`)) {
        score += 8;
    }

    if (item.cause === "defective exterior waterproofing" && /exterior|balcony|terrace|facade|rain|weather/i.test(`${location} ${description} ${observations}`)) {
        score += 8;
    }

    return score;
}

function toHypothesis(item) {
    return {
        id: item.id,
        cause: item.cause,
        supportingIndicators: [...item.indicators],
        contradictingIndicators: [...item.contradictions],
        requiredVerification: [...item.verification],
        potentialConsequences: [...item.consequences],
        recommendedActions: [...item.actions],
        riskRelevance: item.riskRelevance,
        riskRelevanceVersion: RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION,
        capexRelevance: item.capexRelevance,
        valuationRelevance: item.valuationRelevance
    };
}

function contains(source, value) {
    return String(source).includes(String(value).toLowerCase());
}

function buildCombinedText(source) {
    return [
        textOf(source.finding.category),
        textOf(source.finding.location),
        textOf(source.finding.description),
        textOf(source.finding.observations),
        textOf(source.building.constructionType),
        textOf(source.building.constructionYear),
        source.building.basementPresent === true ? "basement present" : "",
        ...source.measurements.map((entry) => textOf(entry))
    ].join(" ");
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
