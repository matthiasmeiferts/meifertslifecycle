/**
 * MBLS Expert Intelligence Layer
 * Crack Knowledge Provider
 *
 * Provides deterministic, structured expert knowledge for crack-related
 * findings and potential structural indicators. The implementation is pure,
 * immutable, and does not rely on AI, external APIs, or UI concerns.
 */

const EMPTY_CONTRACT = Object.freeze({
    domain: "crack",
    hypotheses: []
});

const KNOWLEDGE = [
    {
        id: "drying-shrinkage",
        cause: "drying shrinkage",
        classification: "cosmetic",
        structuralRelevance: "low",
        keywords: ["drying shrinkage", "shrinkage", "hairline", "fine surface", "crazing"],
        indicators: [
            "fine hairline cracking",
            "uniform surface cracking without displacement",
            "cracks in plaster, render, or finish layers"
        ],
        contradictions: [
            "cracks that widen significantly",
            "cracks around openings with visible movement"
        ],
        verification: [
            "Check whether the crack is limited to a finish or surface layer.",
            "Inspect the crack for uniformity and lack of displacement.",
            "Confirm whether the crack follows a broad shrinkage pattern rather than a local movement pattern."
        ],
        consequences: [
            "finish deterioration",
            "repeat cosmetic repairs",
            "localized moisture entry through surface openings"
        ],
        actions: [
            "Document the crack with close-up and overview photographs.",
            "Compare the crack pattern with adjacent unchanged surfaces.",
            "Monitor for any change in width or propagation."
        ],
        riskRelevance: "low",
        capexRelevance: "low",
        valuationRelevance: "low"
    },
    {
        id: "thermal-movement",
        cause: "thermal movement",
        classification: "non-structural",
        structuralRelevance: "low",
        keywords: ["thermal movement", "temperature change", "expansion", "contraction", "horizontal crack", "joint"],
        indicators: [
            "crack orientation consistent with repeated movement",
            "cracks aligned to joints or material transitions",
            "movement influenced by temperature change"
        ],
        contradictions: [
            "crack clearly tied to settlement or foundation displacement",
            "crack with clear structural offset or crushing"
        ],
        verification: [
            "Check whether the crack aligns with a movement or joint line.",
            "Review whether the crack pattern repeats across similar details.",
            "Confirm whether temperature-related movement is a plausible driver."
        ],
        consequences: [
            "ongoing surface movement",
            "recurrent opening and closing of the crack",
            "finish damage over time"
        ],
        actions: [
            "Record the crack orientation and relation to joints or transitions.",
            "Inspect adjacent material interfaces for similar patterns.",
            "Monitor the crack for seasonal variation."
        ],
        riskRelevance: "low",
        capexRelevance: "low",
        valuationRelevance: "low"
    },
    {
        id: "plaster-render-movement",
        cause: "plaster or render movement",
        classification: "non-structural",
        structuralRelevance: "low",
        keywords: ["plaster", "render", "surface layer", "finish layer", "fine crack"],
        indicators: [
            "cracking isolated to plaster or render",
            "surface cracking without evidence of deeper movement",
            "cracks that follow finish transitions"
        ],
        contradictions: [
            "clear movement in the masonry or concrete substrate",
            "cracks with displacement or structural offset"
        ],
        verification: [
            "Check whether the crack is confined to the finish layer.",
            "Inspect the substrate behind the finish where accessible.",
            "Confirm whether the crack pattern is superficial rather than structural."
        ],
        consequences: [
            "finish repair demand",
            "water entry through the crack line",
            "surface deterioration"
        ],
        actions: [
            "Map the crack extent across the finish surface.",
            "Inspect whether adjacent plaster or render is debonded.",
            "Monitor for propagation into the substrate."
        ],
        riskRelevance: "low",
        capexRelevance: "low",
        valuationRelevance: "low"
    },
    {
        id: "differential-settlement",
        cause: "differential settlement",
        classification: "potentially structural",
        structuralRelevance: "high",
        keywords: ["settlement", "diagonal crack", "step crack", "opening", "corner", "foundation"],
        indicators: [
            "diagonal cracking near openings or corners",
            "cracks that step through masonry or finishes",
            "pattern suggestive of differential movement"
        ],
        contradictions: [
            "uniform superficial hairline cracking only",
            "cracks clearly limited to a finish layer"
        ],
        verification: [
            "Check whether the crack passes diagonally from an opening or corner.",
            "Review whether the crack pattern suggests differential movement.",
            "Arrange specialist structural verification if movement is suspected."
        ],
        consequences: [
            "progressive cracking",
            "worsening opening distortion",
            "possible structural implications requiring investigation"
        ],
        actions: [
            "Document crack width, direction, and relationship to openings.",
            "Compare the crack with adjacent structural lines and corners.",
            "Escalate for structural review if progression is observed."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "foundation-movement",
        cause: "foundation movement",
        classification: "structural assessment required",
        structuralRelevance: "very high",
        keywords: ["foundation movement", "foundation", "substructure", "movement", "widening", "recurring"],
        indicators: [
            "recurring or widening crack pattern",
            "cracking associated with foundation or substructure movement",
            "multiple locations showing related distress"
        ],
        contradictions: [
            "stable, static finish crack with no change",
            "crack clearly limited to a cosmetic finish layer"
        ],
        verification: [
            "Check whether the crack is recurring or widening over time.",
            "Review whether the crack aligns with substructure movement indicators.",
            "Obtain specialist structural verification before drawing conclusions."
        ],
        consequences: [
            "continued structural distress",
            "progressive cracking and distortion",
            "potential need for targeted structural intervention"
        ],
        actions: [
            "Record the crack location and width precisely.",
            "Monitor for change in width or propagation.",
            "Escalate for specialist structural assessment."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "lintel-opening-movement",
        cause: "lintel or opening-related movement",
        classification: "potentially structural",
        structuralRelevance: "high",
        keywords: ["lintel", "opening", "window", "door", "arch", "above opening"],
        indicators: [
            "cracking above or radiating from an opening",
            "diagonal cracking from corners of windows or doors",
            "movement concentrated around lintels or reveals"
        ],
        contradictions: [
            "cracks remote from any opening or lintel detail",
            "isolated surface crazing only"
        ],
        verification: [
            "Inspect the opening corners, lintel line, and surrounding masonry.",
            "Check whether the crack radiates from the opening detail.",
            "Seek specialist verification if load transfer is uncertain."
        ],
        consequences: [
            "opening distortion",
            "progressive masonry cracking",
            "possible local structural distress"
        ],
        actions: [
            "Photograph the full opening and crack path.",
            "Compare the crack with nearby openings and wall lines.",
            "Escalate for structural review if movement appears active."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "slab-deflection",
        cause: "slab deflection",
        classification: "potentially structural",
        structuralRelevance: "high",
        keywords: ["slab", "deflection", "floor", "beam", "sagging", "horizontal crack"],
        indicators: [
            "cracks associated with floor slab movement or sagging",
            "horizontal cracking influenced by deflection",
            "cracking at interfaces between floor and wall elements"
        ],
        contradictions: [
            "surface-only finish cracking without substrate involvement",
            "movement clearly linked to thermal expansion only"
        ],
        verification: [
            "Check whether the crack coincides with floor or slab deflection.",
            "Review surrounding finishes for related distortion.",
            "Request specialist assessment if slab movement is suspected."
        ],
        consequences: [
            "ongoing deformation",
            "serviceability impact",
            "possible structural follow-up"
        ],
        actions: [
            "Document the crack relative to the slab and adjoining walls.",
            "Observe whether the pattern changes with loading or time.",
            "Escalate if there are signs of active deflection."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "masonry-movement",
        cause: "masonry movement",
        classification: "potentially structural",
        structuralRelevance: "high",
        keywords: ["masonry", "brick", "blockwork", "step crack", "diagonal", "wall"],
        indicators: [
            "stair-step cracking through masonry units",
            "cracks following mortar joints or masonry movement",
            "cracking that reflects unit or wall movement"
        ],
        contradictions: [
            "paint or plaster only surface cracking",
            "isolated hairline crack with no masonry pattern"
        ],
        verification: [
            "Inspect whether the crack follows masonry joints or units.",
            "Check adjacent wall areas for related movement patterns.",
            "Arrange structural review if masonry movement is suspected."
        ],
        consequences: [
            "loss of masonry integrity",
            "progressive wall cracking",
            "possible need for structural intervention"
        ],
        actions: [
            "Record the unit-by-unit crack path.",
            "Compare the crack with neighboring masonry bays.",
            "Escalate for specialist structural verification if movement continues."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "corrosion-induced-concrete-cracking",
        cause: "corrosion-induced concrete cracking",
        classification: "potentially structural",
        structuralRelevance: "high",
        keywords: ["concrete", "corrosion", "rust", "spalling", "reinforcement", "cover"],
        indicators: [
            "cracking with corrosion or rust indicators",
            "concrete cracking with spalling or cover distress",
            "movement associated with reinforcement corrosion"
        ],
        contradictions: [
            "crack confined to a thin surface finish only",
            "no sign of concrete or reinforcement involvement"
        ],
        verification: [
            "Check whether rust staining, spalling, or exposed reinforcement is present.",
            "Review the crack against the concrete element and cover layer.",
            "Seek specialist verification if reinforcement corrosion is plausible."
        ],
        consequences: [
            "concrete deterioration",
            "loss of cover integrity",
            "possible structural implications"
        ],
        actions: [
            "Document the crack and any rust or spalling.",
            "Inspect adjacent concrete areas for similar distress.",
            "Escalate for detailed structural assessment if corrosion is visible."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "moisture-or-frost-related-cracking",
        cause: "moisture- or frost-related cracking",
        classification: "non-structural",
        structuralRelevance: "medium",
        keywords: ["moisture", "frost", "freeze", "wetting", "surface cracking"],
        indicators: [
            "cracking associated with wetting or frost exposure",
            "surface deterioration after moisture exposure",
            "cracks in exposed elements subject to weathering"
        ],
        contradictions: [
            "cracking clearly related to settlement or opening movement",
            "cracks with strong structural distortion"
        ],
        verification: [
            "Check whether the crack aligns with moisture or frost exposure.",
            "Review exposed surfaces and weathered details.",
            "Confirm whether the crack is localized to the exposed finish."
        ],
        consequences: [
            "surface deterioration",
            "repeat weathering damage",
            "localized repair demand"
        ],
        actions: [
            "Document the exposed location and weathering pattern.",
            "Inspect adjacent weather-exposed details.",
            "Monitor for repeated seasonal recurrence."
        ],
        riskRelevance: "medium",
        capexRelevance: "low",
        valuationRelevance: "medium"
    },
    {
        id: "connection-or-joint-failure",
        cause: "connection or joint failure",
        classification: "potentially structural",
        structuralRelevance: "high",
        keywords: ["joint", "connection", "junction", "movement joint", "interface"],
        indicators: [
            "cracking at a connection or joint line",
            "cracks reflecting movement at interfaces",
            "distress concentrated at construction joints"
        ],
        contradictions: [
            "cracks isolated from any joint or connection detail",
            "uniform hairline surface cracking only"
        ],
        verification: [
            "Inspect the connection or joint detail for displacement.",
            "Check whether the crack follows a construction interface.",
            "Seek specialist verification if joint performance is uncertain."
        ],
        consequences: [
            "progressive interface opening",
            "loss of joint performance",
            "possible localized structural distress"
        ],
        actions: [
            "Document the crack against the joint or connection line.",
            "Inspect adjoining materials for matching distress.",
            "Escalate for specialist review if movement appears active."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "load-bearing-structural-distress",
        cause: "potentially load-bearing structural distress",
        classification: "structural assessment required",
        structuralRelevance: "very high",
        keywords: ["load-bearing", "bearing", "distress", "severe crack", "widening", "progression"],
        indicators: [
            "crack pattern suggesting active structural distress",
            "widening, recurring, or multiple related cracks",
            "distress in a location that may be load bearing"
        ],
        contradictions: [
            "stable cosmetic crack with no progression",
            "surface-only defect with no structural context"
        ],
        verification: [
            "Check whether the crack is recurring or widening over time.",
            "Review whether the location may be load bearing.",
            "Obtain specialist structural verification before any conclusion."
        ],
        consequences: [
            "possible serviceability impact",
            "progressive structural distress",
            "need for specialist intervention"
        ],
        actions: [
            "Record crack extent, orientation, and any progression.",
            "Monitor the crack and adjacent movement indicators.",
            "Escalate immediately for structural assessment."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    }
];

export default class CrackKnowledgeProvider {

    /**
     * Return deterministic knowledge for crack-related findings.
     *
     * @param {Object} [input={}] - Knowledge request.
     * @param {Object} [input.finding] - Finding payload.
     * @param {Object} [input.building] - Building payload.
     * @param {Array<Object>} [input.measurements] - Optional measurement list.
     * @returns {Object} Stable crack knowledge contract.
     */
    static getKnowledge(input = {}) {
        const source = normalizeInput(input);

        if (!hasSufficientInput(source)) {
            return EMPTY_CONTRACT;
        }

        const combinedText = buildCombinedText(source);
        const ranked = KNOWLEDGE
            .map((entry) => ({
                entry,
                score: scoreMatch(entry, source, combinedText)
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
            domain: "crack",
            hypotheses: ranked.map(({ entry }) => toHypothesis(entry))
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
        textOf(source.building.numberOfStoreys).trim().length > 0 ||
        source.building.basementPresent === true ||
        source.measurements.length > 0
    );
}

function scoreMatch(entry, source, combinedText) {
    const text = String(combinedText).toLowerCase();
    const location = textOf(source.finding.location).toLowerCase();
    const description = textOf(source.finding.description).toLowerCase();
    const observations = textOf(source.finding.observations).toLowerCase();
    const buildingText = [
        textOf(source.building.constructionType),
        textOf(source.building.constructionYear),
        textOf(source.building.numberOfStoreys),
        source.building.basementPresent === true ? "basement present" : "",
        ...source.measurements.map((measurement) => textOf(measurement))
    ].join(" ").toLowerCase();

    let score = 0;

    entry.keywords.forEach((keyword) => {
        if (contains(text, keyword)) {
            score += 3;
        }

        if (contains(location, keyword)) {
            score += 2;
        }

        if (contains(description, keyword)) {
            score += 2;
        }

        if (contains(observations, keyword)) {
            score += 1;
        }

        if (contains(buildingText, keyword)) {
            score += 2;
        }
    });

    if (entry.cause === "differential settlement" && /diagonal|opening|corner|step/.test(text)) {
        score += 8;
    }

    if (entry.cause === "thermal movement" && /horizontal|movement|temperature|expansion|contraction/.test(text)) {
        score += 8;
    }

    if (entry.cause === "plaster or render movement" && /fine|surface|plaster|render|hairline/.test(text)) {
        score += 8;
    }

    if (entry.cause === "corrosion-induced concrete cracking" && /concrete|corrosion|rust|spalling|reinforcement/.test(text)) {
        score += 8;
    }

    if (entry.cause === "moisture- or frost-related cracking" && /moisture|frost|freeze|wetting/.test(text)) {
        score += 8;
    }

    if (entry.cause === "connection or joint failure" && /joint|connection|junction|interface/.test(text)) {
        score += 8;
    }

    if (entry.cause === "potentially load-bearing structural distress" && /widening|recurring|load-bearing|bearing|severe/.test(text)) {
        score += 8;
    }

    if (entry.cause === "foundation movement" && /recurring|widening|foundation|substructure/.test(text)) {
        score += 8;
    }

    if (entry.cause === "lintel or opening-related movement" && /opening|window|door|lintel|above opening/.test(text)) {
        score += 8;
    }

    return score;
}

function toHypothesis(entry) {
    return {
        id: entry.id,
        cause: entry.cause,
        classification: entry.classification,
        structuralRelevance: entry.structuralRelevance,
        supportingIndicators: cloneArray(entry.indicators),
        contradictingIndicators: cloneArray(entry.contradictions),
        requiredVerification: cloneArray(entry.verification),
        potentialConsequences: cloneArray(entry.consequences),
        recommendedActions: cloneArray(entry.actions),
        riskRelevance: entry.riskRelevance,
        capexRelevance: entry.capexRelevance,
        valuationRelevance: entry.valuationRelevance
    };
}

function buildCombinedText(source) {
    return [
        textOf(source.finding.category),
        textOf(source.finding.location),
        textOf(source.finding.description),
        textOf(source.finding.observations),
        textOf(source.building.constructionYear),
        textOf(source.building.constructionType),
        textOf(source.building.numberOfStoreys),
        source.building.basementPresent === true ? "basement present" : "",
        ...source.measurements.map((measurement) => [
            textOf(measurement.type),
            textOf(measurement.value),
            textOf(measurement.unit),
            textOf(measurement.location)
        ].join(" "))
    ].join(" ");
}

function contains(source, value) {
    return String(source).includes(String(value).toLowerCase());
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
