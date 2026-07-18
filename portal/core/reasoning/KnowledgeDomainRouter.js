/**
 * MBLS Expert Intelligence Layer
 * Knowledge Domain Router
 *
 * Resolves applicable reasoning domains from inspection input using stable,
 * deterministic precedence. Routing only: no mapping, confidence, or diagnosis.
 */

const DOMAIN_PRECEDENCE = [
    "concrete-corrosion",
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

    return /moisture|damp|wet|leak|water|condensation|humidity|rising damp|plumbing|roof|facade|ventilation|thermal bridge|drainage|grading/.test(findingText);
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

    return categoryText.includes("crack") || (detailText.trim().length > 0 && /crack|cracking|fracture|split|settlement|foundation|movement|displacement|opening|lintel|slab|masonry|corrosion|spalling|joint|load-bearing|bearing|widening|recurring/.test(`${categoryText} ${detailText}`));
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
        "window",
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

    const concreteTerms = [
        "concrete",
        "reinforced concrete",
        "reinforcement",
        "rebar",
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
        "durability",
        "corrosion",
        "rust",
        "rust staining"
    ];

    return concreteTerms.some((term) => matchesWholeWord(categoryText, term) || matchesWholeWord(findingText, term));
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
