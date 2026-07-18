/**
 * MBLS Expert Intelligence Layer
 * Concrete Corrosion Knowledge Provider
 *
 * Provides deterministic expert knowledge for reinforced concrete deterioration,
 * corrosion, durability, and structural observations. The implementation is
 * pure, immutable, and free of AI, external services, UI, or statistical
 * outputs.
 */

const EMPTY_CONTRACT = Object.freeze({
    domain: "concrete-corrosion",
    hypotheses: []
});

const KNOWLEDGE = [
    {
        id: "reinforcement-corrosion",
        cause: "reinforcement corrosion",
        classification: "reinforcement corrosion hypothesis",
        keywords: ["exposed reinforcement", "rebar", "reinforcement", "steel bar", "rust", "rust staining", "corroded steel"],
        indicators: [
            "exposed reinforcement or rusted steel visible in concrete",
            "rust staining along cracks, spalls, or edges",
            "corrosion signs at reinforcement level"
        ],
        contradictions: [
            "no sign of reinforcement exposure or corrosion staining",
            "deterioration clearly limited to a non-concrete finish"
        ],
        verification: [
            "Inspect the affected concrete face and any visible reinforcement carefully.",
            "Check whether rust staining, cracking, or spalling aligns with reinforcement lines.",
            "Seek specialist investigation if hidden reinforcement damage is suspected."
        ],
        consequences: [
            "loss of section at the reinforcement zone",
            "progressive concrete deterioration",
            "possible structural durability impact"
        ],
        actions: [
            "Document the exposed area with overview and close photographs.",
            "Compare the affected element with adjacent concrete surfaces.",
            "Escalate for specialist assessment where reinforcement damage is plausible."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "carbonation-induced-corrosion",
        cause: "carbonation-induced corrosion",
        classification: "carbonation corrosion hypothesis",
        keywords: ["carbonation", "carbonated", "pH", "concrete cover", "neutralized cover", "front"],
        indicators: [
            "concrete deterioration associated with carbonation exposure",
            "corrosion-related distress in older exposed concrete",
            "cover breakdown consistent with carbonation progression"
        ],
        contradictions: [
            "damage clearly linked to a one-off impact rather than durability loss",
            "corrosion signs explained by direct chloride exposure only"
        ],
        verification: [
            "Inspect the exposed concrete for carbonation-related deterioration patterns.",
            "Check whether corrosion signs align with long-term exposure of the cover zone.",
            "Seek specialist investigation if durability loss is suspected."
        ],
        consequences: [
            "reduced protection of embedded reinforcement",
            "progressive durability loss",
            "recurring repair demand"
        ],
        actions: [
            "Document the exposed concrete and any cover deterioration.",
            "Compare the affected area with better-protected adjacent surfaces.",
            "Escalate for specialist durability review if the pattern persists."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "chloride-induced-corrosion",
        cause: "chloride-induced corrosion",
        classification: "chloride corrosion hypothesis",
        keywords: ["chloride", "salt", "marine", "de-icing", "coastal", "chloride ingress"],
        indicators: [
            "corrosion signs in a chloride-exposed environment",
            "rust staining or spalling in a salt-exposed concrete element",
            "durability distress associated with chloride ingress"
        ],
        contradictions: [
            "distress clearly linked to carbonation alone without salt exposure",
            "no exposure context that suggests chloride ingress"
        ],
        verification: [
            "Inspect the concrete for salt exposure and corrosion-related distress.",
            "Check whether the location is exposed to marine spray or de-icing residues.",
            "Seek specialist investigation if chloride ingress is plausible."
        ],
        consequences: [
            "accelerated reinforcement corrosion",
            "loss of concrete durability",
            "possible structural follow-up"
        ],
        actions: [
            "Document the exposed location and any salt-related staining.",
            "Compare the affected element with sheltered adjacent concrete.",
            "Escalate for specialist durability assessment where needed."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "concrete-spalling",
        cause: "concrete spalling",
        classification: "spalling hypothesis",
        keywords: ["spalling", "spall", "loss of cover", "broken concrete", "delaminated cover"],
        indicators: [
            "visible loss of concrete cover or broken surface fragments",
            "spalled concrete around cracks or edges",
            "concrete breakaway exposing deeper material"
        ],
        contradictions: [
            "surface finish damage without concrete loss",
            "degradation confined to a non-structural coating"
        ],
        verification: [
            "Inspect the damaged area for concrete loss and exposed substrate.",
            "Check whether the spalling extends beyond the visible surface edge.",
            "Seek specialist investigation if hidden deterioration is suspected."
        ],
        consequences: [
            "ongoing material loss",
            "higher exposure of embedded reinforcement",
            "recurring repair demand"
        ],
        actions: [
            "Document the extent of concrete loss with detail photographs.",
            "Compare the damaged area with nearby concrete surfaces.",
            "Escalate for specialist repair planning if deterioration is active."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "delamination-or-hollow-sounding-concrete",
        cause: "delamination or hollow-sounding concrete",
        classification: "delamination hypothesis",
        keywords: ["delamination", "hollow sounding", "hollow", "debonded", "drummy", "void"],
        indicators: [
            "hollow-sounding concrete or debonded surface layers",
            "suspected separation between cover and substrate",
            "localized hollow response in a concrete element"
        ],
        contradictions: [
            "sound or damage pattern clearly explained by a non-concrete surface finish",
            "no sign of separation or cover distress"
        ],
        verification: [
            "Inspect the concrete surface for separation, cracking, or cover loss.",
            "Check whether the affected area sounds hollow compared with adjacent concrete.",
            "Seek specialist investigation if hidden delamination is suspected."
        ],
        consequences: [
            "progressive loss of cover integrity",
            "local concrete failure risk",
            "possible follow-up repair demand"
        ],
        actions: [
            "Document the suspect area and compare with adjacent concrete.",
            "Map the likely extent of separation or hollow response.",
            "Escalate for specialist assessment if the defect appears active."
        ],
        riskRelevance: "high",
        capexRelevance: "medium",
        valuationRelevance: "high"
    },
    {
        id: "insufficient-concrete-cover",
        cause: "insufficient concrete cover",
        classification: "cover deficiency hypothesis",
        keywords: ["insufficient cover", "thin cover", "cover depth", "cover concrete", "shallow reinforcement"],
        indicators: [
            "reinforcement appears close to the concrete surface",
            "cover deficiency visible at an exposed edge or damaged zone",
            "durability distress consistent with shallow cover"
        ],
        contradictions: [
            "reinforcement remains well protected beneath sound concrete cover",
            "distress clearly unrelated to cover thickness"
        ],
        verification: [
            "Inspect the concrete edge or damaged area for evidence of shallow cover.",
            "Check whether reinforcement is unusually close to the surface.",
            "Seek specialist investigation if cover deficiency is suspected."
        ],
        consequences: [
            "reduced protection of reinforcement",
            "accelerated deterioration",
            "higher maintenance demand"
        ],
        actions: [
            "Document the suspect cover zone and adjacent surfaces.",
            "Compare the affected detail with better-protected concrete areas.",
            "Escalate for durability review if the cover appears inadequate."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "freeze-thaw-deterioration",
        cause: "freeze-thaw deterioration",
        classification: "freeze-thaw hypothesis",
        keywords: ["freeze-thaw", "freezing", "thawing", "icing", "frost", "cold weather"],
        indicators: [
            "surface scaling or cracking in weather-exposed concrete",
            "deterioration associated with repeated freeze and thaw exposure",
            "edge damage in a cold or wet concrete element"
        ],
        contradictions: [
            "distress clearly explained by corrosion only",
            "damage limited to an interior protected element"
        ],
        verification: [
            "Inspect the exposed concrete for scaling or frost-related distress.",
            "Check whether the damage follows repeated cold-weather exposure.",
            "Seek specialist investigation if freeze-thaw deterioration is plausible."
        ],
        consequences: [
            "surface loss",
            "progressive durability decline",
            "repeat weather-related repair cycles"
        ],
        actions: [
            "Document the exposed area and weathering pattern.",
            "Compare the damaged zone with sheltered adjacent concrete.",
            "Escalate for repair review if deterioration is recurring."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "alkali-silica-reaction",
        cause: "alkali-silica reaction",
        classification: "ASR hypothesis",
        keywords: ["alkali-silica", "asr", "map cracking", "gel", "expansion"],
        indicators: [
            "map cracking or expansion patterns in concrete",
            "distress consistent with internal reactive expansion",
            "progressive cracking not explained by a local impact"
        ],
        contradictions: [
            "localized damage clearly caused by a single mechanical event",
            "crack pattern limited to reinforcement corrosion only"
        ],
        verification: [
            "Inspect the concrete for map cracking, expansion, or gel-like distress.",
            "Check whether the cracking pattern is widespread rather than isolated.",
            "Seek specialist investigation if ASR is suspected."
        ],
        consequences: [
            "ongoing expansion and cracking",
            "loss of durability",
            "possible structural follow-up"
        ],
        actions: [
            "Document the crack map and affected concrete areas.",
            "Compare the distress pattern with adjacent elements.",
            "Escalate for specialist durability review if the pattern persists."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "construction-or-workmanship-defects",
        cause: "construction or workmanship defects",
        classification: "workmanship hypothesis",
        keywords: ["construction defect", "workmanship", "honeycomb", "void", "poor compaction", "cold joint"],
        indicators: [
            "defects consistent with poor placement or compaction",
            "honeycombing or visible voids in concrete",
            "distress aligned to a cold joint or construction fault"
        ],
        contradictions: [
            "damage clearly caused by a later environmental mechanism only",
            "no evidence of workmanship-related irregularity"
        ],
        verification: [
            "Inspect the concrete for voids, honeycombing, or cold-joint distress.",
            "Check whether the defect follows a construction interface.",
            "Seek specialist investigation if workmanship failure is suspected."
        ],
        consequences: [
            "reduced concrete integrity",
            "accelerated deterioration at weak points",
            "repeat maintenance demand"
        ],
        actions: [
            "Document the defect geometry and surrounding concrete.",
            "Compare the area with adjacent construction zones.",
            "Escalate for specialist review if a placement defect is likely."
        ],
        riskRelevance: "high",
        capexRelevance: "medium",
        valuationRelevance: "high"
    },
    {
        id: "moisture-accelerated-deterioration",
        cause: "moisture-accelerated deterioration",
        classification: "moisture durability hypothesis",
        keywords: ["moisture", "wet", "damp", "leak", "water", "humidity"],
        indicators: [
            "deterioration intensified by repeated moisture exposure",
            "concrete damage recurring after wetting",
            "moisture-related worsening of visible concrete distress"
        ],
        contradictions: [
            "damage clearly isolated from moisture exposure",
            "no evidence of recurring wetting or damp conditions"
        ],
        verification: [
            "Inspect whether the concrete distress worsens after wetting.",
            "Check adjacent exposed areas for similar moisture-related deterioration.",
            "Seek specialist investigation if durability loss appears moisture-driven."
        ],
        consequences: [
            "faster deterioration of concrete surfaces",
            "possible progression of hidden defects",
            "repeat repair demand"
        ],
        actions: [
            "Document the affected area and moisture pattern.",
            "Compare the exposed detail with less affected adjacent concrete.",
            "Escalate for durability review if wetting persists."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "aging-related-concrete-degradation",
        cause: "aging-related concrete degradation",
        classification: "aging hypothesis",
        keywords: ["aging", "ageing", "old concrete", "deterioration", "weathered", "long-term exposure"],
        indicators: [
            "general wear and deterioration in older concrete",
            "broad surface aging without one isolated trigger",
            "multiple signs of long-term material decline"
        ],
        contradictions: [
            "defect clearly tied to a specific recent event",
            "damage isolated to one discrete construction fault"
        ],
        verification: [
            "Inspect the concrete for widespread age-related deterioration.",
            "Check whether the pattern is consistent with long-term exposure.",
            "Seek specialist investigation if the concrete appears broadly degraded."
        ],
        consequences: [
            "ongoing loss of durability",
            "recurring maintenance cycles",
            "possible follow-up repair demand"
        ],
        actions: [
            "Document the extent of age-related wear across the element.",
            "Compare the area with nearby concrete components.",
            "Plan maintenance review if deterioration appears widespread."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "structural-durability-deficit",
        cause: "structural durability deficit",
        classification: "durability deficit hypothesis",
        keywords: ["durability deficit", "structural durability", "systemic deterioration", "widespread distress", "structural concrete"],
        indicators: [
            "multiple durability-related defects affecting a structural element",
            "widespread deterioration suggesting insufficient long-term durability",
            "combined signs of corrosion, cover loss, or cracking"
        ],
        contradictions: [
            "single isolated defect without broader durability context",
            "damage clearly limited to a non-structural surface finish"
        ],
        verification: [
            "Inspect the element for combined durability distress rather than one isolated issue.",
            "Check whether several deterioration mechanisms are present together.",
            "Seek specialist investigation if a structural durability deficit is suspected."
        ],
        consequences: [
            "reduced service life",
            "repeat intervention demand",
            "possible structural follow-up"
        ],
        actions: [
            "Document the extent of deterioration across the element.",
            "Compare the affected area with adjacent concrete components.",
            "Escalate for specialist durability review if the problem is widespread."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    }
];

export default class ConcreteCorrosionKnowledgeProvider {

    /**
     * Return deterministic knowledge for concrete deterioration findings.
     *
     * @param {Object} [input={}] - Knowledge request.
     * @param {Object} [input.finding] - Finding payload.
     * @param {Object} [input.building] - Building payload.
     * @param {Array<Object>} [input.measurements] - Optional measurement list.
     * @returns {Object} Stable concrete-corrosion knowledge contract.
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
            domain: "concrete-corrosion",
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

function hasSufficientInput(source) {
    return Boolean(
        textOf(source.finding.category).trim().length > 0 ||
        textOf(source.finding.location).trim().length > 0 ||
        textOf(source.finding.description).trim().length > 0 ||
        textOf(source.finding.observations).trim().length > 0 ||
        textOf(source.building.constructionYear).trim().length > 0 ||
        textOf(source.building.constructionType).trim().length > 0 ||
        textOf(source.building.exposureClass).trim().length > 0 ||
        textOf(source.building.numberOfStoreys).trim().length > 0 ||
        source.measurements.length > 0
    );
}

function scoreMatch(entry, source, combinedText) {
    const text = String(combinedText).toLowerCase();
    const findingText = [
        textOf(source.finding.category),
        textOf(source.finding.location),
        textOf(source.finding.description),
        textOf(source.finding.observations)
    ].join(" ").toLowerCase();
    const buildingText = [
        textOf(source.building.constructionYear),
        textOf(source.building.constructionType),
        textOf(source.building.exposureClass),
        textOf(source.building.numberOfStoreys),
        ...source.measurements.map((measurement) => textOf(measurement))
    ].join(" ").toLowerCase();

    let score = 0;

    entry.keywords.forEach((keyword) => {
        if (contains(text, keyword)) {
            score += 3;
        }

        if (contains(findingText, keyword)) {
            score += 2;
        }

        if (contains(buildingText, keyword)) {
            score += 2;
        }
    });

    entry.indicators.forEach((indicator) => {
        if (contains(text, indicator)) {
            score += 4;
        }

        if (contains(findingText, indicator)) {
            score += 3;
        }

        if (contains(buildingText, indicator)) {
            score += 2;
        }
    });

    if (entry.cause === "reinforcement corrosion" && /exposed reinforcement|rebar|rust staining|rusted steel/i.test(text)) {
        score += 8;
    }

    if (entry.cause === "carbonation-induced corrosion" && /carbonation|carbonated|pH|cover/i.test(text)) {
        score += 8;
    }

    if (entry.cause === "chloride-induced corrosion" && /chloride|salt|marine|de-icing|coastal/i.test(text)) {
        score += 8;
    }

    if (entry.cause === "concrete spalling" && /spalling|spall|loss of cover|broken concrete/i.test(text)) {
        score += 8;
    }

    if (entry.cause === "delamination or hollow-sounding concrete" && /delamination|hollow sounding|hollow|debonded|drummy/i.test(text)) {
        score += 8;
    }

    if (entry.cause === "insufficient concrete cover" && /insufficient cover|thin cover|cover depth|shallow reinforcement/i.test(text)) {
        score += 8;
    }

    if (entry.cause === "insufficient concrete cover" && /insufficient|shallow|thin cover|cover depth|exposed reinforcement/i.test(text)) {
        score += 6;
    }

    if (entry.cause === "freeze-thaw deterioration" && /freeze-thaw|freezing|thawing|frost/i.test(text)) {
        score += 8;
    }

    if (entry.cause === "alkali-silica reaction" && /alkali-silica|asr|map cracking|gel|expansion/i.test(text)) {
        score += 8;
    }

    if (entry.cause === "construction or workmanship defects" && /construction defect|workmanship|honeycomb|void|poor compaction|cold joint/i.test(text)) {
        score += 8;
    }

    if (entry.cause === "moisture-accelerated deterioration" && /moisture|wet|damp|water|humidity/i.test(text)) {
        score += 8;
    }

    if (entry.cause === "aging-related concrete degradation" && /aging|ageing|old concrete|weathered|long-term exposure/i.test(text)) {
        score += 8;
    }

    if (entry.cause === "structural durability deficit" && /durability deficit|structural durability|systemic deterioration|widespread distress/i.test(text)) {
        score += 8;
    }

    return score;
}

function toHypothesis(entry) {
    return {
        id: entry.id,
        cause: entry.cause,
        classification: entry.classification,
        supportingIndicators: [...entry.indicators],
        contradictingIndicators: [...entry.contradictions],
        requiredVerification: [...entry.verification],
        potentialConsequences: [...entry.consequences],
        recommendedActions: [...entry.actions],
        riskRelevance: entry.riskRelevance,
        capexRelevance: entry.capexRelevance,
        valuationRelevance: entry.valuationRelevance
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
        textOf(source.building.constructionYear),
        textOf(source.building.constructionType),
        textOf(source.building.exposureClass),
        textOf(source.building.numberOfStoreys),
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
