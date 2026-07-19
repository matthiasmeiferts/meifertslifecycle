const WINDOWS_DOORS_TERMINOLOGY = Object.freeze({
    components: Object.freeze([
        "window", "windows", "external door", "exterior door", "entrance door", "balcony door", "patio door",
        "glazing", "glass pane", "frame", "sash", "sill", "threshold", "hardware", "hinge", "lock", "handle",
        "fenster", "fensterrahmen", "fensterfluegel", "fensterflügel", "tuer", "tür", "aussentuer", "außentür",
        "eingangstuer", "eingangstür", "balkontuer", "balkontür", "terrassentuer", "terrassentür",
        "verglasung", "glasscheibe", "scheibe", "rahmen", "fluegel", "flügel", "fensterbank", "schwelle",
        "beschlag", "scharnier", "griff"
    ]),
    issues: Object.freeze([
        "defective", "seal", "joint", "flashing", "leak", "water", "air", "draught", "draft", "condensation",
        "thermal bridge", "distorted", "warped", "misaligned", "binding", "adjustment", "damage", "cracked",
        "fracture", "broken", "chipped", "maintenance", "workmanship", "operation", "operability",
        "surface temperature", "cold surface", "defekt", "undicht", "undichtigkeit", "leckage", "wassereintritt",
        "feuchtigkeit", "zugluft", "dichtung", "tuerdichtung", "türdichtung", "aussentuerdichtung",
        "außentürdichtung", "anschlussfuge", "fuge", "riss", "gerissen", "beschaedigt", "beschädigt",
        "verzogen", "fehlstellung", "kondensation", "tauwasser", "waermebruecke", "wärmebrücke", "wartung",
        "instandhaltung", "bedienung", "beschlag", "temperatur", "oberflaechentemperatur", "oberflächentemperatur",
        "montagefehler", "ausfuehrungsmangel", "ausführungsmangel"
    ]),
    signals: Object.freeze({
        "defective-perimeter-seal": Object.freeze([
            "perimeter seal", "frame perimeter", "sealant", "joint seal", "perimeter seal draught", "perimeter seal draft",
            "rahmendichtung", "anschlussfuge", "fensterfuge", "dichtung undicht", "undichte dichtung", "undichte seal",
            "seal with draught", "zugluft am rahmen", "fuge undicht"
        ]),
        "defective-glazing-seal": Object.freeze([
            "glazing seal", "edge seal", "fogging between panes", "glazing edge", "dichtung verglasung", "randverbund",
            "beschlag zwischen scheiben"
        ]),
        "failed-installation-joint": Object.freeze([
            "installation joint", "mounting joint", "interface joint", "installation boundary", "montagefuge", "anschlussfuge", "einbaufuge"
        ]),
        "defective-flashing-or-sill-connection": Object.freeze([
            "flashing", "sill connection", "sill detail", "window sill", "threshold", "fensterbank", "anschlussblech", "schwelle"
        ]),
        "air-leakage": Object.freeze([
            "air leakage", "draught", "draft", "air infiltration", "zugluft", "luftundicht", "luftundichtigkeit"
        ]),
        "water-penetration-through-window-connection": Object.freeze([
            "water penetration", "water ingress", "ingress at frame", "rain-related ingress", "wassereintritt", "wassereintritt fenster",
            "feuchtigkeit fenster", "feuchtigkeit am fensteranschluss", "leckage am fensteranschluss"
        ]),
        "thermal-bridge-at-window-installation": Object.freeze([
            "thermal bridge", "cold edge", "cold reveal", "surface temperature", "waermebruecke", "wärmebrücke", "kalte laibung",
            "kalter rahmen", "oberflaechentemperatur", "oberflächentemperatur"
        ]),
        "distorted-frame-or-sash": Object.freeze([
            "distorted frame", "warped frame", "misaligned sash", "binding sash", "frame distortion", "verzogener rahmen",
            "fehlstellung", "klemmender fluegel", "klemmender flügel"
        ]),
        "defective-hardware-or-adjustment": Object.freeze([
            "hardware", "hinge", "lock", "handle", "adjustment", "beschlag", "scharnier", "griff", "einstellung", "verriegelung"
        ]),
        "failed-weather-seals": Object.freeze([
            "weather seal", "gasket", "seal profile", "compressed seal", "dichtungsprofil", "gummidichtung", "anschlagdichtung"
        ]),
        "glazing-damage": Object.freeze([
            "cracked glass", "broken pane", "glass fracture", "glasscheibe gerissen", "glasbruch", "scheibe beschaedigt", "scheibe beschädigt"
        ]),
        "condensation-on-glazing-or-frame": Object.freeze([
            "condensation", "surface moisture", "fogging", "kondensation", "tauwasser", "oberflaechenfeuchte", "oberflächenfeuchte"
        ]),
        "age-related-deterioration": Object.freeze([
            "age-related", "aged", "weathered", "service life", "alterung", "altersbedingt", "verwittert", "nutzungsdauer"
        ]),
        "insufficient-maintenance": Object.freeze([
            "insufficient maintenance", "deferred maintenance", "poor upkeep", "maintenance", "wartung", "instandhaltung",
            "wartungsrueckstand", "wartungsrückstand"
        ]),
        "defective-exterior-door-seal": Object.freeze([
            "exterior door seal", "threshold seal", "bottom seal", "aussentuerdichtung", "außentürdichtung", "tuerdichtung",
            "türdichtung", "schwellendichtung"
        ]),
        "installation-workmanship-defect": Object.freeze([
            "workmanship", "poor installation", "installation defect", "incorrect detailing", "montagefehler", "ausfuehrungsmangel",
            "ausführungsmangel", "fehlerhafte montage"
        ])
    })
});

const REGISTRY = Object.freeze({
    "windows-doors": WINDOWS_DOORS_TERMINOLOGY
});

export default class ExpertIntelligenceTerminologyRegistry {

    static getDomainTerminology(domainId) {
        return REGISTRY[domainId] || null;
    }

    static hasDomainEvidence(domainId, input = {}) {
        const terminology = this.getDomainTerminology(domainId);

        if (!terminology) {
            return false;
        }

        const text = normalizeText(textOf(input));

        return hasAnyTerm(text, terminology.components) &&
            hasAnyTerm(text, terminology.issues) &&
            hasAnySignal(text, terminology.signals);
    }

    static hasSignal(domainId, signalId, text) {
        return this.countSignals(domainId, signalId, text) > 0;
    }

    static countSignals(domainId, signalId, text) {
        const terminology = this.getDomainTerminology(domainId);
        const signals = terminology?.signals?.[signalId] || [];

        return countTerms(normalizeText(text), signals);
    }

}

function hasAnyTerm(text, terms = []) {
    return terms.some((term) => matchesTerm(text, term));
}

function hasAnySignal(text, signals = {}) {
    return Object.values(signals).some((terms) => hasAnyTerm(text, terms));
}

function countTerms(text, terms = []) {
    return terms.filter((term) => matchesTerm(text, term)).length;
}

function matchesTerm(text, term) {
    const normalizedTerm = normalizeText(term);

    return new RegExp(`(^|[^a-z0-9])${escapeRegex(normalizedTerm)}([^a-z0-9]|$)`).test(text);
}

function normalizeText(value) {
    return String(value)
        .toLowerCase()
        .replace(/ä/g, "ae")
        .replace(/ö/g, "oe")
        .replace(/ü/g, "ue")
        .replace(/ß/g, "ss");
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

    return Object.values(value).map((entry) => textOf(entry)).join(" ");
}

function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}