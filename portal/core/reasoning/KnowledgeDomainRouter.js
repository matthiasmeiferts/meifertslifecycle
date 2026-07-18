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
    "windows-doors",
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

        if (isWindowsDoorsFinding(source)) {
            domains.push("windows-doors");
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

    const hasMoistureSignal = /moisture|damp|\bwet\b|leak|water|condensation|humidity|rising damp|plumbing|roof|facade|ventilation|thermal bridge|drainage|grading/.test(findingText);
    const hasNegatedMoistureOnly = /\b(no|without|not)\s+(any\s+)?(moisture|damp|\bwet\b|wetting|leak(age)?|water ingress|seepage|condensation)\b/.test(findingText) &&
        !/\b(moisture|damp|\bwet\b|leak|water|seepage|condensation|humidity)\b/.test(findingText.replace(/\b(no|without|not)\s+(any\s+)?(moisture|damp|\bwet\b|wetting|leak(age)?|water ingress|seepage|condensation)\b/g, " "));

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

    return categoryText.includes("crack") || (detailText.trim().length > 0 && hasCrackSignal && !hasNegatedCrackOnly);
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
        "facade",
        "fa\u00e7ade",
        "balcony",
        "terrace",
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

    const windowsDoorsContext = isWindowsDoorsFinding(source);

    if (windowsDoorsContext && !/roof|facade|fa\u00e7ade|balcony|terrace|parapet|upstand|flashing|sill|threshold|reveal/.test(findingText)) {
        return false;
    }

    return categoryTerms.some((term) => matchesWholeWord(categoryText, term)) || (
        moistureTerms.some((term) => matchesWholeWord(findingText, term)) &&
        categoryTerms.some((term) => matchesWholeWord(findingText, term))
    );
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
        "concrete cover",
        "hollow sounding",
        "delamination",
        "spalling"
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

    if (hasConcreteDamageSignal) {
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
