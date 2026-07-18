/**
 * MBLS Expert Intelligence Layer
 * Windows and Doors Knowledge Provider
 *
 * Deterministic, pure, immutable knowledge provider for windows, doors,
 * glazing, seals, frame condition, and installation-related defects.
 */

const EMPTY_CONTRACT = Object.freeze({
    domain: "windows-doors",
    hypotheses: []
});

const HYPOTHESES = [
    {
        id: "defective-perimeter-seal",
        cause: "defective perimeter seal",
        classification: "perimeter seal hypothesis",
        keywords: ["perimeter seal", "frame perimeter", "joint seal", "sealant", "edge seal", "gap at frame"],
        supportingIndicators: [
            "visible seal discontinuity around frame perimeter",
            "localized leakage or draught near frame edge",
            "aged or cracked perimeter sealant"
        ],
        contradictingIndicators: [
            "no deterioration at perimeter sealing line",
            "symptoms clearly limited to glazing edge only"
        ],
        requiredVerification: [
            "Inspect full perimeter seal continuity around the opening.",
            "Check whether leakage or draught aligns with perimeter joints.",
            "Use specialist inspection if hidden perimeter details are concealed."
        ],
        potentialConsequences: [
            "recurring local moisture ingress or air leakage",
            "degradation of adjacent finishes",
            "increased maintenance scope"
        ],
        recommendedActions: [
            "Document perimeter condition with close-up photos.",
            "Map leakage or draught pattern around the frame.",
            "Schedule targeted remedial planning after verification."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "defective-glazing-seal",
        cause: "defective glazing seal",
        classification: "glazing seal hypothesis",
        keywords: ["glazing seal", "edge seal", "insulated glass edge", "failed edge seal", "spacer edge", "fogging between panes"],
        supportingIndicators: [
            "glazing-edge condition indicates possible seal degradation",
            "moisture or haze patterns consistent with edge-seal issues",
            "localized deterioration at glass-to-frame interface"
        ],
        contradictingIndicators: [
            "no glazing-edge anomaly observed",
            "symptoms confined to external perimeter joint only"
        ],
        requiredVerification: [
            "Inspect glazing edge and spacer zone for seal degradation signs.",
            "Differentiate glazing-seal defects from perimeter-joint defects.",
            "Use specialist glazing review if seal condition is uncertain."
        ],
        potentialConsequences: [
            "decline in glazing performance",
            "recurring condensation-related complaints",
            "possible replacement planning at element level"
        ],
        recommendedActions: [
            "Record edge-seal condition and affected pane location.",
            "Review glazing specification and service history.",
            "Coordinate specialist glazing verification where needed."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "failed-installation-joint",
        cause: "failed installation joint",
        classification: "installation joint hypothesis",
        keywords: ["installation joint", "mounting joint", "interface joint", "window connection joint", "door connection joint"],
        supportingIndicators: [
            "distress pattern follows installation interface zone",
            "joint-line leakage or air path at installation boundary",
            "installation connection appears discontinuous"
        ],
        contradictingIndicators: [
            "no anomaly at installation boundary",
            "issue appears isolated to hardware only"
        ],
        requiredVerification: [
            "Inspect installation joint continuity around the element.",
            "Verify whether symptoms align with the joint path.",
            "Use opening-up or specialist review where concealed joint layers cannot be seen."
        ],
        potentialConsequences: [
            "recurring leakage at interface level",
            "ongoing finish deterioration around openings",
            "increased intervention complexity"
        ],
        recommendedActions: [
            "Map defect extent along installation joint zones.",
            "Document inside and outside interface condition.",
            "Sequence remediation after source-path verification."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "defective-flashing-or-sill-connection",
        cause: "defective flashing or sill connection",
        classification: "flashing and sill hypothesis",
        keywords: ["flashing", "sill connection", "sill detail", "drip edge", "sub-sill", "head flashing"],
        supportingIndicators: [
            "water traces align with sill or flashing detail",
            "connection geometry may allow moisture entry",
            "localized staining below or beside sill/flashing lines"
        ],
        contradictingIndicators: [
            "no signs near flashing or sill zones",
            "symptoms limited to glazing body without connection involvement"
        ],
        requiredVerification: [
            "Inspect sill and flashing continuity, laps, and terminations.",
            "Check whether observed water path originates at these details.",
            "Use specialist inspection where concealed flashing layers cannot be confirmed."
        ],
        potentialConsequences: [
            "repeated moisture ingress at opening perimeter",
            "local damage to internal finishes",
            "accelerated deterioration of connection components"
        ],
        recommendedActions: [
            "Document sill/flashing detail with moisture mapping.",
            "Correlate leakage timing with weather events.",
            "Prioritize targeted detail verification before interventions."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "air-leakage",
        cause: "air leakage",
        classification: "air-tightness hypothesis",
        keywords: ["air leakage", "draught", "draft", "air infiltration", "air path", "whistling"],
        supportingIndicators: [
            "reported draught or air movement at opening interfaces",
            "air-tightness concerns linked to frame or sash closure",
            "occupant comfort complaints associated with leakage"
        ],
        contradictingIndicators: [
            "no indicator of air movement or draught",
            "symptoms only moisture-related without air leakage evidence"
        ],
        requiredVerification: [
            "Verify air leakage pathway with targeted inspection.",
            "Do not infer air leakage from condensation alone.",
            "Inspect gaskets, closure pressure, and joint continuity."
        ],
        potentialConsequences: [
            "reduced comfort near openings",
            "higher local energy demand",
            "possible moisture interaction under certain conditions"
        ],
        recommendedActions: [
            "Document leakage location and operating conditions.",
            "Review seal compression and closure alignment.",
            "Plan corrective measures only after path confirmation."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "water-penetration-through-window-connection",
        cause: "water penetration through window connection",
        classification: "weather-tightness hypothesis",
        keywords: ["water penetration", "window connection leak", "ingress at frame", "leak at reveal", "weather-tightness"],
        supportingIndicators: [
            "moisture pattern follows window connection zones",
            "rain-related ingress reports at opening interface",
            "staining and dampness at frame-reveal transition"
        ],
        contradictingIndicators: [
            "no rain-correlated ingress pattern",
            "symptoms are strictly interior condensation without connection ingress indicators"
        ],
        requiredVerification: [
            "Correlate moisture pattern with weather exposure and connection details.",
            "Do not infer failed installation from water staining alone.",
            "Use specialist inspection where concealed layers are not visible."
        ],
        potentialConsequences: [
            "continued moisture ingress and finish damage",
            "recurring occupant complaints",
            "expanded repair scope if untreated"
        ],
        recommendedActions: [
            "Document ingress points and moisture spread.",
            "Inspect connection detail transitions and seal interfaces.",
            "Prioritize targeted weather-tightness verification."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    },
    {
        id: "thermal-bridge-at-window-installation",
        cause: "thermal bridge at window installation",
        classification: "thermal bridge hypothesis",
        keywords: ["thermal bridge", "cold edge", "cold reveal", "cold frame", "installation thermal break"],
        supportingIndicators: [
            "cold-zone pattern around installation interface",
            "surface cooling concentrated at opening details",
            "repeat localized condensation in thermal weak points"
        ],
        contradictingIndicators: [
            "no localized cold-edge pattern",
            "symptoms explained by unrelated glazing damage only"
        ],
        requiredVerification: [
            "Inspect installation geometry for thermal weak points.",
            "Do not infer thermal bridge from condensation alone.",
            "Use targeted thermal diagnostic review where needed."
        ],
        potentialConsequences: [
            "localized comfort issues",
            "higher condensation susceptibility at cold details",
            "repeat maintenance demand"
        ],
        recommendedActions: [
            "Map affected cold-edge zones.",
            "Review installation detail continuity and insulation alignment.",
            "Plan interventions after diagnostic confirmation."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "distorted-frame-or-sash",
        cause: "distorted frame or sash",
        classification: "frame distortion hypothesis",
        keywords: ["distorted frame", "warped frame", "misaligned sash", "out of square", "binding sash"],
        supportingIndicators: [
            "operation issues suggest frame or sash deformation",
            "misaligned sash or warped frame observed",
            "binding sash during operation",
            "visible misalignment in opening geometry",
            "uneven closure pressure around the sash"
        ],
        contradictingIndicators: [
            "frame geometry appears stable and aligned",
            "issue limited to isolated hardware fault"
        ],
        requiredVerification: [
            "Check frame plumb, level, and sash alignment.",
            "Assess opening/closing behavior across full operation cycle.",
            "Confirm whether distortion is primary or secondary to hardware settings."
        ],
        potentialConsequences: [
            "reduced sealing performance",
            "operability complaints",
            "accelerated wear of closure components"
        ],
        recommendedActions: [
            "Document alignment deviations and operation symptoms.",
            "Inspect surrounding structure for interface movement influences.",
            "Plan corrective adjustment after verification."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "defective-hardware-or-adjustment",
        cause: "defective hardware or adjustment",
        classification: "hardware hypothesis",
        keywords: ["hardware", "hinge", "lock", "latch", "handle", "adjustment", "roller"],
        supportingIndicators: [
            "opening hardware shows malfunction or misadjustment",
            "closure mechanism does not seal correctly",
            "operational resistance or incomplete locking"
        ],
        contradictingIndicators: [
            "hardware operates normally under inspection",
            "symptoms clearly linked to glazing-only defect"
        ],
        requiredVerification: [
            "Inspect hinges, locks, handles, and adjustment points.",
            "Verify closure pressure and latch engagement consistency.",
            "Differentiate hardware settings from frame distortion effects."
        ],
        potentialConsequences: [
            "persistent operation and sealing issues",
            "higher wear of moving components",
            "possible security or weather-tightness concerns"
        ],
        recommendedActions: [
            "Document failed operations and affected components.",
            "Perform targeted adjustment and functional recheck.",
            "Escalate to specialist hardware review if unresolved."
        ],
        riskRelevance: "medium",
        capexRelevance: "low",
        valuationRelevance: "medium"
    },
    {
        id: "failed-weather-seals",
        cause: "failed weather seals",
        classification: "weather seal hypothesis",
        keywords: ["weather seal", "gasket", "seal profile", "compressed seal", "brittle seal"],
        supportingIndicators: [
            "gasket or weather strip deterioration visible",
            "seal compression appears insufficient at closure line",
            "weather exposure symptoms at sealing profile"
        ],
        contradictingIndicators: [
            "weather seals appear intact and uniformly compressed",
            "symptoms isolated to glass body damage"
        ],
        requiredVerification: [
            "Inspect weather-seal continuity and elasticity around closure line.",
            "Verify contact pressure during locking cycle.",
            "Confirm whether leakage aligns with failed seal segments."
        ],
        potentialConsequences: [
            "increased air and water leakage susceptibility",
            "comfort and durability complaints",
            "recurring local repair needs"
        ],
        recommendedActions: [
            "Map failed seal segments and compression gaps.",
            "Review compatibility of replacement seal profiles.",
            "Reassess performance after targeted seal remediation."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "glazing-damage",
        cause: "glazing damage",
        classification: "glazing damage hypothesis",
        keywords: ["cracked glass", "chipped glass", "broken pane", "glazing damage", "glass fracture"],
        supportingIndicators: [
            "cracked glass or broken pane visible",
            "glass fracture at pane edge or corner",
            "visible damage to glazing surface or edge",
            "impact or stress-related glass distress indicators",
            "localized damage not inherently linked to frame failure"
        ],
        contradictingIndicators: [
            "no visible glazing damage",
            "symptoms are solely frame-operation related"
        ],
        requiredVerification: [
            "Inspect extent and location of glazing damage.",
            "Do not infer frame failure from glazing damage alone.",
            "Assess safety and operational implications at the damaged pane."
        ],
        potentialConsequences: [
            "safety and weather-tightness concerns",
            "progressive damage under further stress",
            "potential occupant complaints"
        ],
        recommendedActions: [
            "Document crack/chip geometry and location.",
            "Secure immediate risk areas where necessary.",
            "Plan glazing intervention after condition verification."
        ],
        riskRelevance: "high",
        capexRelevance: "medium",
        valuationRelevance: "high"
    },
    {
        id: "condensation-on-glazing-or-frame",
        cause: "condensation on glazing or frame",
        classification: "condensation hypothesis",
        keywords: ["condensation", "surface moisture", "fogging", "cold glazing", "cold frame", "high humidity"],
        supportingIndicators: [
            "surface moisture pattern consistent with condensation behavior",
            "episodes linked to humidity and temperature differentials",
            "localized moisture without direct rain-ingress path"
        ],
        contradictingIndicators: [
            "clear rain-driven ingress path at connection interfaces",
            "air leakage proven by direct leakage indicators independent of condensation"
        ],
        requiredVerification: [
            "Correlate condensation timing with humidity and temperature conditions.",
            "Do not infer air leakage or thermal bridge from condensation alone.",
            "Differentiate interior condensation from external penetration mechanisms."
        ],
        potentialConsequences: [
            "recurring surface moisture and comfort complaints",
            "localized finish deterioration",
            "possible mould-prone conditions at persistent cold points"
        ],
        recommendedActions: [
            "Document condensation distribution and recurrence timing.",
            "Review ventilation and usage patterns near openings.",
            "Use targeted diagnostics if mechanism remains unclear."
        ],
        riskRelevance: "medium",
        capexRelevance: "low",
        valuationRelevance: "medium"
    },
    {
        id: "age-related-deterioration",
        cause: "age-related deterioration",
        classification: "aging hypothesis",
        keywords: ["age-related", "aged", "weathered", "long-term wear", "service life", "older window"],
        supportingIndicators: [
            "overall condition indicates long-term degradation",
            "multiple minor defects consistent with aging",
            "material wear without one isolated trigger"
        ],
        contradictingIndicators: [
            "condition appears new with isolated recent damage only",
            "single event explains all observed symptoms"
        ],
        requiredVerification: [
            "Review age, maintenance, and replacement history of elements.",
            "Inspect whether deterioration is widespread or localized.",
            "Separate age-related wear from acute isolated defects."
        ],
        potentialConsequences: [
            "progressive decline in performance",
            "increasing maintenance frequency",
            "higher future intervention scope"
        ],
        recommendedActions: [
            "Document age-related wear indicators per element.",
            "Prioritize condition-based maintenance planning.",
            "Escalate targeted specialist checks for critical units."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "insufficient-maintenance",
        cause: "insufficient maintenance",
        classification: "maintenance hypothesis",
        keywords: ["insufficient maintenance", "deferred maintenance", "poor upkeep", "not maintained", "lack of servicing"],
        supportingIndicators: [
            "maintenance-sensitive components show avoidable deterioration",
            "operation/sealing issues consistent with missing periodic servicing",
            "multiple minor defects consistent with low upkeep"
        ],
        contradictingIndicators: [
            "recent documented maintenance and stable condition",
            "acute defect pattern unrelated to maintenance intervals"
        ],
        requiredVerification: [
            "Review maintenance logs and service history for affected elements.",
            "Inspect lubrication, adjustments, and seal-condition routines.",
            "Confirm whether defects persist after maintenance restoration."
        ],
        potentialConsequences: [
            "accelerated wear of components",
            "recurring operability and sealing complaints",
            "higher cumulative intervention costs"
        ],
        recommendedActions: [
            "Document missed maintenance indicators by component.",
            "Establish targeted maintenance recovery actions.",
            "Reassess condition after maintenance normalization."
        ],
        riskRelevance: "low",
        capexRelevance: "low",
        valuationRelevance: "medium"
    },
    {
        id: "defective-exterior-door-seal",
        cause: "defective exterior door seal",
        classification: "exterior door seal hypothesis",
        keywords: ["exterior door seal", "door weather strip", "threshold seal", "door gasket", "bottom seal"],
        supportingIndicators: [
            "air or water path around exterior door seal line",
            "visible deterioration at threshold or door perimeter sealing",
            "closure mismatch with seal compression loss"
        ],
        contradictingIndicators: [
            "door seals appear continuous and effective",
            "issue isolated to window elements only"
        ],
        requiredVerification: [
            "Inspect door perimeter and threshold seal condition.",
            "Verify closure compression and alignment at latch side.",
            "Confirm whether leakage correlates with failed door seal segments."
        ],
        potentialConsequences: [
            "recurring draught or moisture ingress at door locations",
            "comfort and durability complaints",
            "ongoing localized repair demand"
        ],
        recommendedActions: [
            "Document seal profile deterioration at door perimeter.",
            "Review threshold and weather-strip condition under operation.",
            "Implement targeted seal remediation after verification."
        ],
        riskRelevance: "medium",
        capexRelevance: "low",
        valuationRelevance: "medium"
    },
    {
        id: "installation-workmanship-defect",
        cause: "installation workmanship defect",
        classification: "workmanship hypothesis",
        keywords: ["workmanship", "poor installation", "installation defect", "improper fixing", "incorrect detailing"],
        supportingIndicators: [
            "detail quality indicates potential installation error",
            "multiple interface anomalies consistent with poor workmanship",
            "assembly defects at opening transitions"
        ],
        contradictingIndicators: [
            "installation details appear consistent and well-executed",
            "single isolated symptom without workmanship pattern"
        ],
        requiredVerification: [
            "Inspect installation detailing quality at representative locations.",
            "Treat workmanship issues as hypotheses pending targeted verification.",
            "Use specialist inspection where concealed installation layers cannot be checked visually."
        ],
        potentialConsequences: [
            "persistent recurring defects at opening interfaces",
            "higher repair complexity over time",
            "possible broader quality concerns"
        ],
        recommendedActions: [
            "Document workmanship-related anomalies with detail references.",
            "Review installation records and as-built details where available.",
            "Prioritize focused specialist verification before remedial scope decisions."
        ],
        riskRelevance: "high",
        capexRelevance: "high",
        valuationRelevance: "high"
    }
];

const COMPONENT_TERMS = [
    "window",
    "door",
    "glazing",
    "frame",
    "sash",
    "pane",
    "reveal",
    "sill",
    "threshold",
    "lintel",
    "hardware",
    "hinge",
    "lock",
    "handle"
];

const ISSUE_TERMS = [
    "defective",
    "seal",
    "joint",
    "flashing",
    "leak",
    "water",
    "air",
    "draught",
    "draft",
    "condensation",
    "thermal",
    "bridge",
    "distort",
    "warped",
    "misaligned",
    "binding",
    "warp",
    "adjustment",
    "misadjusted",
    "closing",
    "damage",
    "cracked",
    "fracture",
    "broken",
    "chipped",
    "maintenance",
    "workmanship"
];

const HYDRATION_TERMS = [
    "leak",
    "water ingress",
    "staining",
    "seepage",
    "rain"
];

export default class WindowsDoorsKnowledgeProvider {

    /**
     * Return deterministic knowledge for windows and doors findings.
     *
     * @param {Object} [input={}] - Knowledge input payload.
     * @returns {Object} Stable windows-doors knowledge contract.
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
            domain: "windows-doors",
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
        textOf(source.building.windowType).trim().length > 0 ||
        textOf(source.building.frameMaterial).trim().length > 0 ||
        textOf(source.building.glazingType).trim().length > 0 ||
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
        textOf(source.building.windowType),
        textOf(source.building.frameMaterial),
        textOf(source.building.glazingType)
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

    if (id === "defective-perimeter-seal") {
        if (containsAny(text, ["perimeter", "frame edge", "sealant", "joint seal"]) && containsAny(text, ["leak", "draught", "draft", "water", "air"])) {
            score += 9;
        }
    }

    if (id === "defective-glazing-seal") {
        if (containsAny(text, ["glazing edge", "edge seal", "spacer", "fogging between panes", "between panes"])) {
            score += 10;
        }
    }

    if (id === "failed-installation-joint") {
        if (containsAny(text, ["installation joint", "interface joint", "mounting joint"]) && containsAny(text, ["leak", "water", "air", "ingress"])) {
            score += 10;
        }

        if (containsAny(text, ["water staining", "staining"]) && !containsAny(text, ["installation joint", "interface joint", "mounting joint", "workmanship", "connection defect"])) {
            score -= 4;
        }
    }

    if (id === "defective-flashing-or-sill-connection") {
        if (containsAny(text, ["flashing", "sill", "sub-sill", "drip edge", "threshold"]) && containsAny(text, HYDRATION_TERMS)) {
            score += 11;
        }
    }

    if (id === "air-leakage") {
        if (containsAny(text, ["air leakage", "draught", "draft", "air infiltration", "whistling"])) {
            score += 12;
        }

        if (containsWord(text, "condensation") && !containsAny(text, ["draught", "draft", "air leakage", "air infiltration", "whistling"])) {
            score -= 5;
        }
    }

    if (id === "water-penetration-through-window-connection") {
        if (containsAny(text, ["window connection", "frame-reveal", "reveal", "connection leak", "ingress at frame"]) && containsAny(text, HYDRATION_TERMS)) {
            score += 12;
        }
    }

    if (id === "thermal-bridge-at-window-installation") {
        if (containsAny(text, ["thermal bridge", "cold reveal", "cold frame", "cold edge"])) {
            score += 11;
        }

        if (containsWord(text, "condensation") && !containsAny(text, ["thermal bridge", "cold reveal", "cold frame", "cold edge"])) {
            score -= 5;
        }
    }

    if (id === "distorted-frame-or-sash") {
        if (containsAny(text, ["distorted", "warped", "misaligned", "out of square", "binding sash"])) {
            score += 12;
        }
    }

    if (id === "defective-hardware-or-adjustment") {
        if (containsAny(text, ["hinge", "lock", "latch", "handle", "hardware", "adjustment", "roller"]) && containsAny(text, ["defective", "loose", "misadjusted", "stuck", "not closing"])) {
            score += 12;
        }
    }

    if (id === "failed-weather-seals") {
        if (containsAny(text, ["weather seal", "gasket", "weather strip", "seal profile", "brittle seal"])) {
            score += 10;
        }
    }

    if (id === "glazing-damage") {
        if (containsAny(text, ["cracked glass", "broken pane", "chipped glass", "glass fracture", "glazing damage"])) {
            score += 12;
        }

        if (containsAny(text, ["frame failure", "distorted frame"]) && !containsAny(text, ["cracked glass", "broken pane", "chipped glass", "glass fracture", "glazing damage"])) {
            score -= 4;
        }
    }

    if (id === "condensation-on-glazing-or-frame") {
        if (containsAny(text, ["condensation", "surface moisture", "fogging", "high humidity", "cold glazing", "cold frame"])) {
            score += 12;
        }
    }

    if (id === "age-related-deterioration") {
        if (containsAny(text, ["age-related", "aged", "weathered", "long-term wear", "older window", "older door"])) {
            score += 10;
        }
    }

    if (id === "insufficient-maintenance") {
        if (containsAny(text, ["insufficient maintenance", "deferred maintenance", "poor upkeep", "not maintained", "lack of servicing"])) {
            score += 11;
        }
    }

    if (id === "defective-exterior-door-seal") {
        if (containsAny(text, ["exterior door", "door seal", "threshold seal", "door weather strip", "bottom seal"]) && containsAny(text, ["leak", "draught", "draft", "air", "water"])) {
            score += 12;
        }
    }

    if (id === "installation-workmanship-defect") {
        if (containsAny(text, ["workmanship", "poor installation", "installation defect", "improper fixing", "incorrect detailing"])) {
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
