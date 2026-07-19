/**
 * MBLS Expert Intelligence Layer
 * Knowledge Domain Router
 *
 * Resolves applicable reasoning domains from inspection input using stable,
 * deterministic precedence. Routing only: no mapping, confidence, or diagnosis.
 */

const DOMAIN_PRECEDENCE = [
    "concrete-corrosion",
    "basement-waterproofing",
    "balconies-terraces",
    "drainage-rainwater",
    "fire-protection-systems",
    "sanitary-systems",
    "hvac-systems",
    "electrical-systems",
    "windows-doors",
    "facade-wall-systems",
    "roof-envelope",
    "moisture",
    "crack"
];

export default class KnowledgeDomainRouter {

    /**
     * Resolve applicable reasoning domains in explicit precedence order.
     *
     * @param {Object} [input={}] - Analysis input.
     * @returns {string[]} Ordered list of applicable domains.
     */
    static resolve(input = {}) {
        const source = normalizeInput(input);
        const domains = [];

        if (isConcreteCorrosionFinding(source)) {
            domains.push("concrete-corrosion");
        }

        if (isBasementWaterproofingFinding(source)) {
            domains.push("basement-waterproofing");
        }

        if (isBalconiesTerracesFinding(source)) {
            domains.push("balconies-terraces");
        }

        if (isDrainageRainwaterFinding(source)) {
            domains.push("drainage-rainwater");
        }

        if (isFireProtectionSystemsFinding(source)) {
            domains.push("fire-protection-systems");
        }

        if (isSanitarySystemsFinding(source)) {
            domains.push("sanitary-systems");
        }

        if (isHvacSystemsFinding(source)) {
            domains.push("hvac-systems");
        }

        if (isElectricalSystemsFinding(source)) {
            domains.push("electrical-systems");
        }

        if (isWindowsDoorsFinding(source)) {
            domains.push("windows-doors");
        }

        if (isFacadeWallSystemsFinding(source)) {
            domains.push("facade-wall-systems");
        }

        if (isRoofEnvelopeFinding(source)) {
            domains.push("roof-envelope");
        }

        if (isMoistureFinding(source)) {
            domains.push("moisture");
        }

        if (isCrackFinding(source)) {
            domains.push("crack");
        }

        return DOMAIN_PRECEDENCE.filter((domain) => domains.includes(domain));
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

function isMoistureFinding(source = {}) {
    const findingText = [
        textOf(source.finding?.category),
        textOf(source.finding?.location),
        textOf(source.finding?.description),
        textOf(source.finding?.observations)
    ].join(" ").toLowerCase();

    const hasMoistureSignal = /moisture|\bdamp\b|\bdampness\b|\bwet\b|leak|water|condensation|humidity|rising damp|plumbing|roof|ventilation|drainage|grading/.test(findingText);
    const hasNegatedMoistureOnly = /\b(no|without|not)\s+(any\s+)?(moisture|damp|dampness|\bwet\b|wetting|leak(age)?|water ingress|seepage|condensation)\b/.test(findingText) &&
        !/\b(moisture|damp|dampness|\bwet\b|leak|water|seepage|condensation|humidity)\b/.test(findingText.replace(/\b(no|without|not)\s+(any\s+)?(moisture|damp|dampness|\bwet\b|wetting|leak(age)?|water ingress|seepage|condensation)\b/g, " "));

    if (isDrainageRainwaterFinding(source) && !hasDirectMoistureEvidence(findingText)) {
        return false;
    }

    return hasMoistureSignal && !hasNegatedMoistureOnly;
}

function isCrackFinding(source = {}) {
    const categoryText = textOf(source.finding?.category).toLowerCase();
    const detailText = [
        textOf(source.finding?.location),
        textOf(source.finding?.description),
        textOf(source.finding?.observations),
        textOf(source.building?.constructionYear),
        textOf(source.building?.constructionType),
        textOf(source.building?.numberOfStoreys),
        source.building?.basementPresent === true ? "basement present" : "",
        ...cloneArray(source.measurements).map((measurement) => [
            textOf(measurement.type),
            textOf(measurement.value),
            textOf(measurement.unit),
            textOf(measurement.location)
        ].join(" "))
    ].join(" ").toLowerCase();

    const text = `${categoryText} ${detailText}`;
    const hasCrackSignal = /crack|cracking|fracture|split|settlement|foundation|movement|displacement|lintel|slab|masonry|load-bearing|bearing|widening|recurring/.test(text);
    const hasNegatedCrackOnly = /\b(no|without|not)\s+(visible\s+)?crack(s|ing)?\b/.test(text) &&
        !/\b(diagonal|widening|recurring|displacement|fracture|split|settlement|movement|foundation|step crack)\b/.test(text.replace(/\b(no|without|not)\s+(visible\s+)?crack(s|ing)?\b/g, " "));

    if (/\b(cracked|crack)\s+(rainwater\s+)?(downpipe|pipe)\b|\b(downpipe|pipe)\s+(crack|cracked)\b/.test(text) && !/wall|masonry|concrete|render|slab|foundation|load-bearing|bearing|settlement|movement|displacement|widening/.test(text)) {
        return false;
    }

    return categoryText.includes("crack") || (detailText.trim().length > 0 && hasCrackSignal && !hasNegatedCrackOnly);
}

function isDrainageRainwaterFinding(source = {}) {
    const findingText = [
        textOf(source.finding?.category),
        textOf(source.finding?.location),
        textOf(source.finding?.description),
        textOf(source.finding?.observations),
        ...cloneArray(source.measurements).map((measurement) => [
            textOf(measurement.type),
            textOf(measurement.value),
            textOf(measurement.unit),
            textOf(measurement.location)
        ].join(" "))
    ].join(" ").toLowerCase();

    if (findingText.trim().length === 0) {
        return false;
    }

    if (/address|marketing|listing|advertisement/.test(findingText)) {
        return false;
    }

    if (/indoor plumbing|sanitary pipe|sanitary drainage|internal floor drain|shower drain|sink drain|toilet drainage|wastewater pipe|swimming-pool|swimming pool|decorative water feature|landscape irrigation|street drainage/.test(findingText) && !/backwater|surcharge|external|rainwater|surface water|around building|building drain/.test(findingText)) {
        return false;
    }

    const componentTerms = [
        "gutter",
        "downpipe",
        "rainwater pipe",
        "rainwater discharge pipe",
        "roof outlet",
        "roof drain",
        "roof drainage",
        "emergency outlet",
        "emergency overflow",
        "emergency drainage",
        "balcony outlet",
        "terrace outlet",
        "courtyard drain",
        "yard drain",
        "external gully",
        "gully",
        "surface drain",
        "surface-water drain",
        "drainage channel",
        "channel drain",
        "trench drain",
        "external drain",
        "surface water",
        "site water",
        "site drainage",
        "site grading",
        "adverse grading",
        "negative grading",
        "runoff",
        "building base",
        "foundation",
        "backwater",
        "sewer surcharge",
        "drain surcharge",
        "backflow from drainage",
        "backwater valve",
        "backwater protection"
    ];
    const issueTerms = [
        "blocked",
        "clogged",
        "overflowing",
        "overflow",
        "leaking",
        "leakage",
        "defective",
        "damaged",
        "cracked",
        "sagging",
        "detached",
        "corroded",
        "ponding",
        "insufficient",
        "missing",
        "standing water",
        "water accumulation",
        "water flows toward",
        "directed toward",
        "against building",
        "discharge near",
        "backwater",
        "backing up",
        "water rising",
        "backflow",
        "absent",
        "defect",
        "not maintained",
        "not cleaned",
        "debris accumulation",
        "workmanship defect",
        "installation defect",
        "poor drainage installation",
        "incorrect drainage connection",
        "improper discharge arrangement",
        "age-related drainage deterioration"
    ];

    const hasComponent = componentTerms.some((term) => matchesWholeWord(findingText, term));
    const hasIssue = issueTerms.some((term) => matchesWholeWord(findingText, term));

    if (hasComponent && hasIssue) {
        return true;
    }

    return [
        "ground slopes toward building",
        "terrain slopes toward building",
        "water flows toward building",
        "runoff directed toward facade",
        "runoff directed toward basement",
        "runoff directed toward entrance",
        "surface water against building",
        "water accumulation at building base",
        "standing water around building",
        "ponding near building",
        "discharge near foundation",
        "missing backwater valve",
        "defective backwater valve",
        "backwater protection absent",
        "backwater protection defect"
    ].some((term) => matchesWholeWord(findingText, term));
}

function hasDirectMoistureEvidence(text = "") {
    return /moisture|\bdamp\b|\bdampness\b|\bwet\b|wetting|leakage|leaking|leak into|water ingress|ingress|seepage|staining|saturation|mould|mold|condensation|humidity/.test(String(text).toLowerCase());
}

function isSanitarySystemsFinding(source = {}) {
    const categoryText = textOf(source.finding?.category).toLowerCase();
    const text = [
        categoryText,
        textOf(source.finding?.location),
        textOf(source.finding?.description),
        textOf(source.finding?.observations),
        ...cloneArray(source.measurements).map((measurement) => [
            textOf(measurement.type),
            textOf(measurement.value),
            textOf(measurement.unit),
            textOf(measurement.location)
        ].join(" "))
    ].join(" ").toLowerCase();

    if (text.trim().length === 0) {
        return false;
    }

    if (/water quality|laboratory analysis|legionella|pressure testing|pressure test|cctv inspection|functional certification|utility bill|water bill|water tariff|energy consumption|plumbing company advertisement|plumbing advertisement|contractor address|address information|product specification|specification-only|specification only|marketing|advertisement|listing/.test(text)) {
        return false;
    }

    if (/drinking water discussion|drinking water/.test(text) && !/pipe|valve|fitting|leak|leaking|leakage|corrosion|staining|moisture|damaged|loose|deteriorated|defect/.test(text)) {
        return false;
    }

    if (/drinking water discussion|drinking water/.test(text) && /without\s+(visible\s+|observed\s+)?(defect|sanitary component condition)|no\s+(visible\s+|observed\s+)?(defect|sanitary component condition)/.test(text)) {
        return false;
    }

    if (categoryText === "moisture" && !/sanitary|water supply pipe|drinking water pipe|waste water pipe|wastewater pipe|drain pipe|soil stack|vent pipe|floor drain|trap|toilet|urinal|shower|bathtub|bath tub|wash basin|visible leakage|leaking|leakage|blocked drain|slow drainage|unpleasant odour|unpleasant odor|missing seal|damaged seal|backflow|unsupported pipe|damaged fixture|damaged connection|poor support/.test(text)) {
        return false;
    }

    const componentTerms = [
        "sanitary",
        "sanitary system",
        "water supply pipe",
        "drinking water pipe",
        "waste water pipe",
        "wastewater pipe",
        "drain pipe",
        "soil stack",
        "vent pipe",
        "sanitary fixture",
        "wash basin",
        "basin",
        "sink",
        "toilet",
        "urinal",
        "shower",
        "bathtub",
        "bath tub",
        "floor drain",
        "trap",
        "valve",
        "fitting",
        "pipe support",
        "pipe insulation"
    ];
    const issueTerms = [
        "visible leakage",
        "leakage",
        "leaking",
        "dripping",
        "corrosion",
        "corroded",
        "rust",
        "staining",
        "moisture around",
        "damaged",
        "broken",
        "cracked",
        "loose",
        "blocked drain",
        "blocked",
        "slow drainage",
        "slow draining",
        "unpleasant odour",
        "unpleasant odor",
        "drain smell",
        "missing seal",
        "damaged seal",
        "seal gap",
        "backflow indication",
        "backflow",
        "water backing up",
        "damaged connection",
        "poor support",
        "unsupported",
        "sagging",
        "visible deterioration",
        "deteriorated",
        "defect",
        "defective"
    ];

    const hasComponent = componentTerms.some((term) => matchesWholeWord(text, term));
    const hasIssue = issueTerms.some((term) => matchesWholeWord(text, term));

    if (hasComponent && hasIssue) {
        return true;
    }

    return [
        "visible leakage at trap",
        "leakage at wash basin",
        "blocked floor drain",
        "slow drainage at sink",
        "unpleasant odour at floor drain",
        "unpleasant odor at floor drain",
        "missing seal at toilet",
        "backflow at drain",
        "unsupported sanitary pipe",
        "damaged sanitary fixture"
    ].some((term) => matchesWholeWord(text, term));
}

function isFireProtectionSystemsFinding(source = {}) {
    const text = [
        textOf(source.finding?.category),
        textOf(source.finding?.location),
        textOf(source.finding?.description),
        textOf(source.finding?.observations),
        ...cloneArray(source.measurements).map((measurement) => [
            textOf(measurement.type),
            textOf(measurement.value),
            textOf(measurement.unit),
            textOf(measurement.location)
        ].join(" "))
    ].join(" ").toLowerCase();

    if (text.trim().length === 0) {
        return false;
    }

    if (/fireplace|domestic stove|wood stove|insurance|fire brigade|fire safety advertisement|product catalogue|product catalog|maintenance record|functional certification|regulatory compliance|legal compliance|code compliance|fire safety approval|evacuation certification|pressure testing|alarm testing|sprinkler testing|detector functionality|certification validity|maintenance validity|contractor address|address information|marketing|advertisement|listing|brand name|model name/.test(text)) {
        return false;
    }

    if (/\bfire\b/.test(text) && !/fire extinguisher|extinguisher cabinet|fire hose reel|fire hydrant|sprinkler head|sprinkler pipe|fire alarm detector|smoke detector|heat detector|manual call point|fire alarm panel|fire door|smoke control door|emergency exit door|escape route|exit sign|emergency lighting|fire compartment wall|fire stopping|penetration seal|fire damper|smoke damper|fire protection enclosure|fire-rated glazing|fire rated glazing|fire protection component|fire protection equipment/.test(text)) {
        return false;
    }

    const componentTerms = [
        "fire extinguisher",
        "extinguisher cabinet",
        "fire hose reel",
        "fire hydrant",
        "sprinkler head",
        "sprinkler pipe",
        "fire alarm detector",
        "smoke detector",
        "heat detector",
        "manual call point",
        "fire alarm panel",
        "fire door",
        "smoke control door",
        "emergency exit door",
        "escape route",
        "exit sign",
        "emergency lighting",
        "fire compartment wall",
        "fire stopping",
        "penetration seal",
        "fire damper",
        "smoke damper",
        "fire protection enclosure",
        "fire-rated glazing",
        "fire rated glazing",
        "fire protection component",
        "fire protection equipment"
    ];
    const issueTerms = [
        "visible damage",
        "damaged",
        "broken",
        "corrosion",
        "corroded",
        "missing cover",
        "missing sign",
        "obstructed access",
        "obstructed",
        "blocked escape route",
        "blocked",
        "wedged-open",
        "wedged open",
        "damaged closer",
        "damaged seal",
        "missing seal",
        "unsealed penetration",
        "displaced sprinkler head",
        "painted sprinkler head",
        "leaking sprinkler pipe",
        "loose component",
        "loose",
        "visible deterioration",
        "deteriorated",
        "missing",
        "defect",
        "defective"
    ];

    const hasComponent = componentTerms.some((term) => matchesWholeWord(text, term));
    const hasIssue = issueTerms.some((term) => matchesWholeWord(text, term));

    if (hasComponent && hasIssue) {
        return true;
    }

    return [
        "wedged open fire door",
        "unsealed penetration",
        "painted sprinkler head",
        "displaced sprinkler head",
        "leaking sprinkler pipe",
        "blocked escape route",
        "missing exit sign",
        "damaged fire damper",
        "damaged smoke detector"
    ].some((term) => matchesWholeWord(text, term));
}

function isHvacSystemsFinding(source = {}) {
    const text = [
        textOf(source.finding?.category),
        textOf(source.finding?.location),
        textOf(source.finding?.description),
        textOf(source.finding?.observations),
        ...cloneArray(source.measurements).map((measurement) => [
            textOf(measurement.type),
            textOf(measurement.value),
            textOf(measurement.unit),
            textOf(measurement.location)
        ].join(" "))
    ].join(" ").toLowerCase();

    if (text.trim().length === 0) {
        return false;
    }

    if (/hot weather|cold weather|summer temperature|winter temperature|drinking-water pressure|drinking water pressure|domestic hot-water circulation|domestic hot water circulation|sanitary ventilation pipe|roof ventilation|facade ventilation|natural window ventilation|decorative fan|computer fan|vehicle air conditioning|refrigerator cooling|refrigeration appliance|marketing|address/.test(text)) {
        return false;
    }

    if (/\b(room|space)\s+(warm|cold)\b/.test(text) && !/hvac|heating|radiator|underfloor|cooling|air conditioning|air-conditioning|thermostat|ventilation/.test(text)) {
        return false;
    }

    if (/\b(stale air|humidity|condensation|mould|mold|noise|vibration|corrosion|pressure|pump|filter|water leak|pipe leak|leakage)\b/.test(text) && !/hvac|heating|heat generator|boiler|heat pump|radiator|underfloor heating|thermostat|circulation pump|ventilation|ventilation unit|air duct|air outlet|supply-air|extract-air|cooling|air conditioning|air-conditioning|air conditioner|indoor unit|outdoor unit|evaporator|cooling coil|condensate|chiller/.test(text)) {
        return false;
    }

    const componentTerms = [
        "hvac",
        "heating",
        "heat generator",
        "boiler",
        "heat pump",
        "district heating",
        "burner",
        "radiator",
        "underfloor heating",
        "heating circuit",
        "heating manifold",
        "thermostat",
        "heating control",
        "circulation pump",
        "ventilation",
        "ventilation unit",
        "air duct",
        "air outlet",
        "supply-air",
        "extract-air",
        "cooling",
        "air conditioning",
        "air-conditioning",
        "air conditioner",
        "indoor unit",
        "outdoor unit",
        "evaporator",
        "cooling coil",
        "condensate",
        "chiller"
    ];
    const issueTerms = [
        "not working",
        "failure",
        "fault",
        "not operating",
        "intermittent",
        "switches off",
        "alarm",
        "error code",
        "malfunction",
        "cold",
        "uneven",
        "no circulation",
        "poor circulation",
        "noise",
        "noisy",
        "vibration",
        "gurgling",
        "stuck",
        "not responding",
        "pressure low",
        "pressure drops",
        "restricted",
        "blocked",
        "dirty",
        "contaminated",
        "clogged",
        "overdue",
        "not serviced",
        "not maintained",
        "leak",
        "leaking",
        "dripping",
        "overflowing",
        "icing",
        "damaged",
        "deteriorated",
        "corrosion",
        "loose",
        "unsupported",
        "defect",
        "defective",
        "poor installation",
        "incorrect connection",
        "reduced",
        "insufficient"
    ];

    const hasComponent = componentTerms.some((term) => matchesWholeWord(text, term));
    const hasIssue = issueTerms.some((term) => matchesWholeWord(text, term));

    if (hasComponent && hasIssue) {
        return true;
    }

    return [
        "no heat",
        "some rooms cold",
        "room not heating",
        "floor remains cold",
        "weak airflow",
        "no airflow",
        "stale air despite ventilation",
        "water below indoor unit",
        "water below ventilation unit",
        "condensate dripping",
        "condensate overflowing",
        "ice on cooling coil"
    ].some((term) => matchesWholeWord(text, term));
}

function isElectricalSystemsFinding(source = {}) {
    const text = [
        textOf(source.finding?.category),
        textOf(source.finding?.location),
        textOf(source.finding?.description),
        textOf(source.finding?.observations),
        ...cloneArray(source.measurements).map((measurement) => [
            textOf(measurement.type),
            textOf(measurement.value),
            textOf(measurement.unit),
            textOf(measurement.location)
        ].join(" "))
    ].join(" ").toLowerCase();

    if (text.trim().length === 0) {
        return false;
    }

    if (/electrical engineering degree|electrical contractor address|electricity price|electricity consumption|electricity bill|energy tariff|electric vehicle|electric car|electronic device|computer cable|network cable|telephone cable|marketing|advertisement|listing|equipment specification/.test(text)) {
        return false;
    }

    if (/decorative lighting/.test(text) && !/damaged|broken|cracked|missing|open|exposed|loose|corrosion|moisture|staining|scorching|discoloration|overheating|temporary|overloaded|unclear|deteriorated|aged|defect|defective/.test(text)) {
        return false;
    }

    if (/decorative switch|switch style/.test(text) && !/damaged switch|broken switch|cracked switch|loose switch|defective switch/.test(text)) {
        return false;
    }

    const componentTerms = [
        "electrical",
        "electrical installation",
        "distribution board",
        "electrical panel",
        "consumer unit",
        "fuse box",
        "circuit breaker",
        "residual current device",
        "rcd",
        "socket outlet",
        "power outlet",
        "switch",
        "electrical wiring",
        "cable",
        "junction box",
        "electrical enclosure",
        "grounding conductor",
        "earthing conductor",
        "bonding conductor"
    ];
    const issueTerms = [
        "damaged",
        "broken",
        "cracked",
        "missing cover",
        "open enclosure",
        "exposed conductor",
        "loose component",
        "corrosion",
        "moisture nearby",
        "staining",
        "scorching",
        "discoloration",
        "overheating marks",
        "poorly supported cable",
        "temporary wiring",
        "overloaded adapter",
        "multiple extension leads",
        "unclear labeling",
        "missing labeling",
        "deteriorated",
        "aged",
        "defect",
        "defective"
    ];

    const hasComponent = componentTerms.some((term) => matchesWholeWord(text, term));
    const hasIssue = issueTerms.some((term) => matchesWholeWord(text, term));

    if (hasComponent && hasIssue) {
        return true;
    }

    return [
        "bare wire",
        "exposed wire",
        "loose socket",
        "loose switch",
        "cracked socket cover",
        "cracked switch cover",
        "unlabeled circuit breaker",
        "unclear circuit labeling",
        "missing circuit labeling",
        "moisture near electrical equipment",
        "corrosion at electrical panel"
    ].some((term) => matchesWholeWord(text, term));
}

function isRoofEnvelopeFinding(source = {}) {
    const categoryText = textOf(source.finding?.category).toLowerCase();
    const findingText = [
        textOf(source.finding?.category),
        textOf(source.finding?.location),
        textOf(source.finding?.description),
        textOf(source.finding?.observations),
        textOf(source.building?.constructionType),
        textOf(source.building?.constructionYear),
        textOf(source.building?.numberOfStoreys),
        source.building?.basementPresent === true ? "basement present" : ""
    ].join(" ").toLowerCase();

    const categoryTerms = [
        "roof",
        "flat roof",
        "roofing",
        "roof covering",
        "roof membrane",
        "roof drainage",
        "gutter",
        "downpipe",
        "drainage",
        "drain",
        "scupper",
        "outlet",
        "penetration",
        "flashing",
        "sealant",
        "joint",
        "reveal",
        "sill",
        "threshold",
        "upstand",
        "parapet"
    ];
    const moistureTerms = [
        "moisture",
        "damp",
        "wet",
        "leak",
        "water",
        "overflow",
        "ponding",
        "staining",
        "ingress",
        "seepage",
        "rain",
        "weather"
    ];
    const balconyTerraceTerms = [
        "balcony",
        "balconies",
        "loggia",
        "loggias",
        "terrace",
        "terraces",
        "roof terrace",
        "balcony slab",
        "cantilever slab",
        "balcony door",
        "terrace door",
        "balcony wall connection",
        "terrace wall connection",
        "balcony outlet",
        "terrace outlet",
        "balcony joint",
        "terrace joint"
    ];

    const hasBalconyTerraceContext = balconyTerraceTerms.some((term) => matchesWholeWord(findingText, term) || matchesWholeWord(categoryText, term));
    const hasMoistureDetail = moistureTerms.some((term) => matchesWholeWord(findingText, term));

    const windowsDoorsContext = isWindowsDoorsFinding(source);

    if (windowsDoorsContext && !/roof|facade|fa\u00e7ade|balcony|terrace|parapet|upstand|flashing|sill|threshold|reveal/.test(findingText)) {
        return false;
    }

    if (isDrainageRainwaterFinding(source) && /backwater|sewer surcharge|drain surcharge|external drain|external gully|courtyard drain|yard drain|surface water|standing water around building|ponding near building/.test(findingText) && !/roof|gutter|downpipe|rainwater|roof outlet|roof drain|scupper|balcony|terrace|flashing|parapet|upstand/.test(findingText)) {
        return false;
    }

    if (isDrainageRainwaterFinding(source) && /runoff directed toward|water directed toward|water flows toward|surface water against/.test(findingText) && !/roof|gutter|downpipe|rainwater|roof outlet|roof drain|scupper|balcony|terrace|flashing|parapet|upstand/.test(findingText)) {
        return false;
    }

    if (isDrainageRainwaterFinding(source) && /gutter|downpipe|rainwater pipe|rainwater discharge pipe|balcony outlet|terrace outlet/.test(findingText) && !/roof outlet|roof drain|roof drainage|roof terrace|terrace drainage leakage|occupied space|flashing|parapet|upstand/.test(findingText)) {
        return false;
    }

    if (isHvacSystemsFinding(source) && !/\b(roof|facade|fa\u00e7ade|balcony|terrace|window|door|flashing|penetration|parapet|upstand|sill|threshold|reveal)\b/.test(findingText)) {
        return false;
    }

    if (/basement|below-grade|sunken/.test(findingText) && hasBalconyTerraceContext && !/roof|facade|fa\u00e7ade|parapet|upstand|flashing|sill|threshold|reveal/.test(findingText)) {
        return false;
    }

    if (hasBalconyTerraceContext) {
        return hasMoistureDetail && (
            /waterproofing|drainage|drain|outlet|overflow|ponding|standing water|leak|ingress|seepage|threshold|wall connection|joint|flashing|sealant|reveal|upstand|parapet|door/.test(findingText)
        );
    }

    return categoryTerms.some((term) => matchesWholeWord(categoryText, term)) || (
        moistureTerms.some((term) => matchesWholeWord(findingText, term)) &&
        categoryTerms.some((term) => matchesWholeWord(findingText, term))
    );
}

function isBalconiesTerracesFinding(source = {}) {
    const findingCategory = textOf(source.finding?.category).toLowerCase();
    const findingLocation = textOf(source.finding?.location).toLowerCase();
    const findingDescription = textOf(source.finding?.description).toLowerCase();
    const findingObservations = textOf(source.finding?.observations).toLowerCase();
    const buildingText = [
        textOf(source.building?.constructionYear),
        textOf(source.building?.balconyType),
        textOf(source.building?.terraceType),
        textOf(source.building?.waterproofingType),
        textOf(source.building?.railingType),
        textOf(source.building?.structuralSystem)
    ].join(" ").toLowerCase();
    const measurementText = cloneArray(source.measurements).map((measurement) => [
        textOf(measurement.type),
        textOf(measurement.value),
        textOf(measurement.unit),
        textOf(measurement.location)
    ].join(" ")).join(" ").toLowerCase();

    const text = [findingCategory, findingLocation, findingDescription, findingObservations, buildingText, measurementText].join(" ").trim();

    if (text.length === 0) {
        return false;
    }

    if (/address|marketing|listing|advertisement/.test(text) && !/balcony|balconies|loggia|loggias|terrace|terraces|roof terrace|balcony slab|cantilever balcony|cantilever slab/.test(text)) {
        return false;
    }

    if (/interior\s+floor\s+tile|internal\s+floor\s+tile|generic\s+tile/.test(text)) {
        return false;
    }

    if (/generic\s+railing|handrail\s+only/.test(text) && !/balcony|balconies|loggia|loggias|terrace|terraces|balustrade/.test(text)) {
        return false;
    }

    if (/generic\s+frost\s+damage/.test(text) && !/balcony|balconies|loggia|terrace|terraces/.test(text)) {
        return false;
    }

    if (/generic\s+standing\s+water/.test(text) && !/balcony|balconies|loggia|terrace|terraces/.test(text)) {
        return false;
    }

    const componentTerms = [
        "balcony",
        "balconies",
        "loggia",
        "loggias",
        "terrace",
        "terraces",
        "roof terrace",
        "balcony slab",
        "cantilever balcony",
        "cantilever slab",
        "balcony outlet",
        "terrace outlet",
        "wall connection",
        "balcony wall connection",
        "terrace wall connection",
        "balcony door threshold",
        "terrace door threshold",
        "balcony tiles",
        "terrace tiles",
        "railing anchor",
        "balustrade anchor",
        "balcony railing",
        "movement joint",
        "balcony joint",
        "terrace joint",
        "occupied-space leakage below balcony",
        "leakage below terrace",
        "thermal bridge at balcony connection"
    ];

    const issueTerms = [
        "waterproofing",
        "drainage",
        "outlet",
        "standing water",
        "ponding",
        "slope",
        "wall connection",
        "door threshold",
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

    const hasComponent = componentTerms.some((term) => matchesWholeWord(text, term));
    const hasIssue = issueTerms.some((term) => matchesWholeWord(text, term));

    if (!hasComponent || !hasIssue) {
        return false;
    }

    if (matchesWholeWord(text, "movement joint") && /interior|internal/.test(text) && !/balcony|terrace|loggia/.test(text)) {
        return false;
    }

    return true;
}

function isConcreteCorrosionFinding(source = {}) {
    const categoryText = textOf(source.finding?.category).toLowerCase();
    const findingText = [
        textOf(source.finding?.location),
        textOf(source.finding?.description),
        textOf(source.finding?.observations),
        textOf(source.building?.constructionYear),
        textOf(source.building?.constructionType),
        textOf(source.building?.exposureClass),
        textOf(source.building?.numberOfStoreys),
        ...cloneArray(source.measurements).map((measurement) => [
            textOf(measurement.type),
            textOf(measurement.value),
            textOf(measurement.unit),
            textOf(measurement.location)
        ].join(" "))
    ].join(" ").toLowerCase();

    const concreteContextTerms = [
        "reinforced concrete",
        "concrete",
        "reinforcement",
        "rebar",
        "concrete cover"
    ];
    const concreteDamageTerms = [
        "spalling",
        "delamination",
        "hollow sounding",
        "concrete cover",
        "carbonation",
        "chloride",
        "freeze-thaw",
        "frost damage",
        "asr",
        "alkali-silica",
        "durability"
    ];
    const corrosionTerms = [
        "corrosion",
        "rust",
        "rust staining"
    ];

    const hasConcreteContext = concreteContextTerms.some((term) => matchesWholeWord(categoryText, term) || matchesWholeWord(findingText, term));
    const hasConcreteDamageSignal = concreteDamageTerms.some((term) => matchesWholeWord(categoryText, term) || matchesWholeWord(findingText, term));
    const hasCorrosionSignal = corrosionTerms.some((term) => matchesWholeWord(categoryText, term) || matchesWholeWord(findingText, term));

    if (hasConcreteDamageSignal && (hasConcreteContext || hasCorrosionSignal)) {
        return true;
    }

    return hasConcreteContext && hasCorrosionSignal;
}

function isWindowsDoorsFinding(source = {}) {
    const text = [
        textOf(source.finding?.category),
        textOf(source.finding?.location),
        textOf(source.finding?.description),
        textOf(source.finding?.observations),
        textOf(source.building?.constructionType),
        textOf(source.building?.constructionYear),
        textOf(source.building?.windowType),
        textOf(source.building?.frameMaterial),
        textOf(source.building?.glazingType),
        ...cloneArray(source.measurements).map((measurement) => [
            textOf(measurement.type),
            textOf(measurement.value),
            textOf(measurement.unit),
            textOf(measurement.location)
        ].join(" "))
    ].join(" ").toLowerCase();

    if (text.trim().length === 0) {
        return false;
    }

    if (matchesWholeWord(text, "cabinet door") || matchesWholeWord(text, "lift door")) {
        return false;
    }

    if (matchesWholeWord(text, "fire door") && !/frame|seal|gasket|glazing|glass|hardware|hinge|handle|joint|sill|flashing|draught|draft|air leakage|condensation/.test(text)) {
        return false;
    }

    const openingComponents = [
        "window",
        "windows",
        "external door",
        "exterior door",
        "entrance door",
        "balcony door",
        "patio door",
        "glazing",
        "glass pane",
        "insulated glazing unit",
        "glazing edge",
        "frame",
        "sash",
        "window hardware",
        "door hardware",
        "hinges",
        "handle"
    ];
    const issueIndicators = [
        "perimeter seal",
        "weather seal",
        "gasket",
        "installation joint",
        "window joint",
        "door joint",
        "sill",
        "window sill",
        "flashing",
        "air leakage",
        "draught",
        "draft",
        "water penetration at window",
        "water penetration at door",
        "water directed toward entrance",
        "runoff directed toward entrance",
        "surface water against entrance",
        "surface water against door",
        "water against threshold",
        "condensation on glazing",
        "condensation on frame",
        "distorted frame",
        "distorted sash",
        "warped frame",
        "misaligned sash",
        "binding sash",
        "leak",
        "ingress",
        "seepage",
        "hardware",
        "seal",
        "glazing damage",
        "cracked glass",
        "glass fracture",
        "broken pane",
        "chipped glass",
        "installation defect",
        "installation error",
        "assembly defect",
        "poor installation workmanship",
        "incorrect detailing"
    ];

    const hasComponent = openingComponents.some((term) => matchesWholeWord(text, term));
    const hasIssue = issueIndicators.some((term) => matchesWholeWord(text, term));

    if (!hasComponent || !hasIssue) {
        return false;
    }

    if (matchesWholeWord(text, "roof flashing") && !/window|door|glazing|frame|sash/.test(text)) {
        return false;
    }

    if ((matchesWholeWord(text, "condensation") || matchesWholeWord(text, "humidity")) && !/window|door|glazing|frame|sash/.test(text)) {
        return false;
    }

    if (matchesWholeWord(text, "opening") && !/window|door|glazing|frame|sash|joint|seal|hardware/.test(text)) {
        return false;
    }

    return true;
}

function isFacadeWallSystemsFinding(source = {}) {
    const findingCategory = textOf(source.finding?.category).toLowerCase();
    const findingLocation = textOf(source.finding?.location).toLowerCase();
    const findingDescription = textOf(source.finding?.description).toLowerCase();
    const findingObservations = textOf(source.finding?.observations).toLowerCase();
    const buildingText = [
        textOf(source.building?.constructionYear),
        textOf(source.building?.constructionType),
        textOf(source.building?.facadeType),
        textOf(source.building?.insulationSystem),
        textOf(source.building?.claddingType),
        textOf(source.building?.exposure)
    ].join(" ").toLowerCase();
    const measurementText = cloneArray(source.measurements).map((measurement) => [
        textOf(measurement.type),
        textOf(measurement.value),
        textOf(measurement.unit),
        textOf(measurement.location)
    ].join(" ")).join(" ").toLowerCase();

    const text = [findingCategory, findingLocation, findingDescription, findingObservations, buildingText, measurementText].join(" ").trim();

    if (text.length === 0) {
        return false;
    }

    if (/internal\s+(wall|plaster|render|decorative\s+render|movement\s+joint)|interior\s+(wall|plaster|render|movement\s+joint)/.test(text)) {
        return false;
    }

    if (matchesWholeWord(text, "roof cladding") && !/facade|fa\u00e7ade|external wall|exterior wall|cladding anchor|facade panel/.test(text)) {
        return false;
    }

    if ((matchesWholeWord(text, "algae") || matchesWholeWord(text, "biological growth")) && !/facade|fa\u00e7ade|external wall|exterior wall|render|cladding|masonry/.test(text)) {
        return false;
    }

    if (matchesWholeWord(text, "anchor") && !/facade|fa\u00e7ade|cladding|external wall|exterior wall/.test(text)) {
        return false;
    }

    if (/crack|cracking/.test(text) && !/facade|fa\u00e7ade|external wall|exterior wall|render|stucco|plaster facade|masonry facade|brick facade|facing brick|cladding/.test(text)) {
        return false;
    }

    const facadeComponentTerms = [
        "facade",
        "fa\u00e7ade",
        "external wall",
        "exterior wall",
        "rendered wall",
        "render",
        "plaster facade",
        "stucco",
        "cladding",
        "facade panel",
        "masonry facade",
        "brick facade",
        "facing brick",
        "etics",
        "eifs",
        "external insulation",
        "insulation render system",
        "facade coating",
        "exterior coating",
        "facade joint",
        "sealant joint",
        "movement joint",
        "expansion joint",
        "facade anchor",
        "cladding anchor",
        "plinth"
    ];

    const facadeIssueTerms = [
        "hollow render",
        "detached render",
        "render delamination",
        "algae on facade",
        "biological growth on facade",
        "facade weathering",
        "facade moisture",
        "facade leakage",
        "spalling facade finish",
        "crack",
        "cracked",
        "cracking",
        "detachment",
        "hollow",
        "moisture",
        "wetting",
        "water",
        "runoff",
        "leakage",
        "ingress",
        "deterioration",
        "weathering",
        "freeze-thaw",
        "frost",
        "algae",
        "biological growth",
        "anchor",
        "movement joint",
        "sealant",
        "workmanship"
    ];

    const hasComponent = facadeComponentTerms.some((term) => matchesWholeWord(text, term));
    const hasIssue = facadeIssueTerms.some((term) => matchesWholeWord(text, term));

    if (!hasComponent || !hasIssue) {
        return false;
    }

    if ((matchesWholeWord(text, "facade joint") || matchesWholeWord(text, "sealant joint") || matchesWholeWord(text, "sealant line")) &&
        (matchesWholeWord(text, "moisture") || matchesWholeWord(text, "damp") || matchesWholeWord(text, "staining")) &&
        !/failed|defect|crack|open joint|detached|delamination|weathering|deterioration|movement joint|expansion joint|anchor|cladding|etics|eifs|render|stucco|masonry|spalling|workmanship/.test(text)) {
        return false;
    }

    if (text.includes("external wall insulation") &&
        textOf(source.finding?.category).trim().length === 0 &&
        textOf(source.finding?.location).trim().length === 0 &&
        textOf(source.finding?.description).trim().length === 0 &&
        textOf(source.finding?.observations).trim().length === 0) {
        return false;
    }

    return true;
}

function isBasementWaterproofingFinding(source = {}) {
    const text = [
        textOf(source.finding?.category),
        textOf(source.finding?.location),
        textOf(source.finding?.description),
        textOf(source.finding?.observations),
        textOf(source.building?.constructionType),
        textOf(source.building?.constructionYear),
        textOf(source.building?.basementType),
        textOf(source.building?.foundationType),
        textOf(source.building?.waterproofingType),
        textOf(source.building?.siteConditions),
        ...cloneArray(source.measurements).map((measurement) => [
            textOf(measurement.type),
            textOf(measurement.value),
            textOf(measurement.unit),
            textOf(measurement.location)
        ].join(" "))
    ].join(" ").toLowerCase();

    if (text.trim().length === 0) {
        return false;
    }

    if (isDrainageRainwaterFinding(source) && !/basement|cellar|below grade|below-grade|underground|foundation|retaining wall|earth-facing/.test(text)) {
        return false;
    }

    const anchorTerms = [
        "basement",
        "cellar",
        "below grade",
        "below-grade",
        "underground",
        "foundation",
        "retaining wall",
        "basement wall",
        "basement floor",
        "earth-facing"
    ];
    const basementSystemTerms = [
        "floor slab",
        "wall-floor junction",
        "wall floor junction",
        "construction joint",
        "service penetration",
        "pipe penetration",
        "tanking",
        "perimeter drainage",
        "groundwater",
        "hydrostatic pressure",
        "downpipe discharge",
        "rainwater discharge",
        "surface water",
        "courtyard drain",
        "external gully",
        "water accumulation at building base",
        "rising damp",
        "capillary moisture",
        "salt efflorescence",
        "basement condensation"
    ];
    const waterproofingTerms = [
        "waterproofing",
        "drainage"
    ];
    const moistureTerms = [
        "moisture",
        "damp",
        "wet",
        "water",
        "ingress",
        "seepage",
        "condensation",
        "efflorescence",
        "mould",
        "mold"
    ];
    const basementDistressTerms = [
        "spalling",
        "corrosion",
        "rust",
        "crack",
        "cracking",
        "seepage",
        "ingress"
    ];

    const hasAnchor = anchorTerms.some((term) => matchesWholeWord(text, term));
    const hasSystemTerm = basementSystemTerms.some((term) => matchesWholeWord(text, term));
    const hasWaterproofing = waterproofingTerms.some((term) => matchesWholeWord(text, term));
    const hasMoisture = moistureTerms.some((term) => matchesWholeWord(text, term));

    if (hasSystemTerm) {
        return true;
    }

    if (hasAnchor && hasMoisture) {
        return true;
    }

    if (hasAnchor && hasWaterproofing) {
        return true;
    }

    if (hasAnchor && basementDistressTerms.some((term) => matchesWholeWord(text, term))) {
        return true;
    }

    return false;
}

function matchesWholeWord(text, term) {
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
