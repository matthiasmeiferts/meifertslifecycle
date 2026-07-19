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

const SANITARY_SYSTEMS_TERMINOLOGY = Object.freeze({
    components: Object.freeze([
        "sanitary", "sanitary system", "sanitary component", "water supply pipe", "drinking water pipe",
        "waste water pipe", "wastewater pipe", "drain pipe", "soil stack", "vent pipe", "sanitary fixture",
        "wash basin", "basin", "sink", "toilet", "urinal", "shower", "bathtub", "bath tub", "floor drain",
        "trap", "valve", "fitting", "pipe support", "pipe insulation", "pipework", "sanitary pipe", "drain",
        "fixture", "sanitaer", "sanitaerinstallation", "sanitär", "sanitärinstallation",
        "sanitaerkomponente", "sanitärkomponente", "trinkwasserleitung", "abwasserleitung", "rohrleitung",
        "sanitaerleitung", "sanitärleitung", "anschluss", "armatur", "waschtisch", "waschbecken", "wc",
        "toilette", "dusche", "badewanne", "siphon", "geruchsverschluss", "ablauf", "bodenablauf",
        "rohrhalterung", "rohrschelle", "dichtung"
    ]),
    issues: Object.freeze([
        "visible leakage", "leakage", "leaking", "water leak", "dripping", "corrosion", "corroded", "rust",
        "staining", "moisture", "damaged", "damage", "broken", "cracked", "loose", "blocked", "slow drainage",
        "slow draining", "unpleasant odour", "unpleasant odor", "odour", "odor", "missing seal", "damaged seal",
        "seal gap", "backflow", "backing up", "overflow", "damaged connection", "poor support", "unsupported",
        "sagging", "visible deterioration", "deteriorated", "defect", "defective", "sichtbar undicht", "undicht",
        "tropfend", "tropft", "leckagespur", "feuchtespur", "korrosion", "rostspur", "verfaerbung", "verfärbung",
        "lose", "locker", "beschaedigt", "beschädigt", "gebrochen", "langsamer ablauf", "rueckstauanzeichen",
        "rückstauanzeichen", "rueckstau", "rückstau", "unangenehmer geruch", "geruch", "fehlende dichtung",
        "beschaedigte dichtung", "beschädigte dichtung", "unzureichende befestigung", "beschaedigter anschluss",
        "beschädigter anschluss", "verschlechterter anschlusszustand"
    ]),
    signals: Object.freeze({
        "visible-leakage-at-sanitary-component": Object.freeze([
            "visible leakage", "leaking pipe", "leaking valve", "leaking fitting", "water leak", "dripping",
            "active drip", "leakage at trap", "leakage at connection", "sichtbar undicht", "siphon undicht",
            "anschluss undicht", "armatur tropft", "tropfende armatur", "tropfender siphon", "leckage am siphon",
            "leckage am anschluss", "leckagespur", "feuchtespur am siphon"
        ]),
        "visible-corrosion-staining-or-moisture": Object.freeze([
            "corrosion", "corroded pipe", "rust staining", "staining", "water staining", "moisture around sanitary",
            "moisture around pipe", "moisture around fixture", "damp around trap", "korrosion", "rostspur",
            "rostspuren", "verfaerbung", "verfärbung", "wasserfleck", "feuchtespur", "feuchte am rohr",
            "feuchte an armatur", "feuchte am siphon"
        ]),
        "damaged-or-loose-sanitary-fixture": Object.freeze([
            "damaged fixture", "damaged wash basin", "damaged sink", "damaged toilet", "damaged urinal",
            "damaged shower", "damaged bathtub", "cracked basin", "cracked toilet", "loose fixture", "loose toilet",
            "loose basin", "loose sink", "beschaedigter waschtisch", "beschädigter waschtisch", "beschaedigtes waschbecken",
            "beschädigtes waschbecken", "beschaedigte toilette", "beschädigte toilette", "beschaedigtes wc", "beschädigtes wc",
            "lose toilette", "lockere toilette", "lose armatur", "lockere armatur", "gebrochenes waschbecken"
        ]),
        "possible-drainage-restriction-indicator": Object.freeze([
            "blocked drain", "slow drainage", "slow draining", "standing water in fixture", "water backing up",
            "gurgling drain", "floor drain blocked", "trap blocked", "drain obstruction", "ablauf verstopft",
            "bodenablauf verstopft", "siphon verstopft", "langsamer ablauf", "wasser laeuft langsam ab",
            "wasser läuft langsam ab", "wasser staut sich", "rueckstau am ablauf", "rückstau am ablauf"
        ]),
        "unpleasant-odour-near-sanitary-drainage": Object.freeze([
            "unpleasant odour", "unpleasant odor", "sewer odour", "sewer odor", "drain smell", "odour at floor drain",
            "odor at floor drain", "trap odour", "trap odor", "unangenehmer geruch", "geruch am ablauf",
            "geruch am bodenablauf", "geruch aus siphon", "geruchsverschluss geruch", "kanalgeruch", "abwassergeruch"
        ]),
        "missing-or-damaged-sanitary-seal": Object.freeze([
            "missing seal", "damaged seal", "failed seal", "seal gap", "sealant missing", "sealant damaged",
            "damaged connection seal", "missing trap seal", "fehlende dichtung", "dichtung fehlt", "beschaedigte dichtung",
            "beschädigte dichtung", "dichtung beschaedigt", "dichtung beschädigt", "dichtungsfuge fehlt", "dichtungsluecke",
            "dichtungslücke"
        ]),
        "possible-backflow-indication": Object.freeze([
            "backflow indication", "backflow at drain", "water backing up", "wastewater backing up", "reverse flow",
            "overflow from floor drain", "floor drain overflow", "toilet backing up", "rueckstauanzeichen", "rückstauanzeichen",
            "rueckstau am ablauf", "rückstau am ablauf", "abwasser staut zurueck", "abwasser staut zurück",
            "wasser tritt aus bodenablauf aus", "bodenablauf laeuft ueber", "bodenablauf läuft über"
        ]),
        "poor-support-or-protection-of-sanitary-pipework": Object.freeze([
            "poor support", "unsupported pipe", "loose pipe support", "missing pipe support", "sagging pipe",
            "damaged pipe insulation", "missing pipe insulation", "poorly supported drain pipe", "pipe support damaged",
            "unzureichende befestigung", "rohr unzureichend befestigt", "rohrhalterung lose", "rohrschelle lose",
            "fehlende rohrhalterung", "fehlende rohrschelle", "durchhaengende leitung", "durchhängende leitung",
            "beschaedigte rohrdaemmung", "beschädigte rohrdämmung"
        ]),
        "visible-deterioration-at-sanitary-connection": Object.freeze([
            "damaged connection", "loose connection", "deteriorated connection", "visible deterioration", "deteriorated fitting",
            "damaged fitting", "damaged valve", "loose valve", "corroded fitting", "beschaedigter anschluss",
            "beschädigter anschluss", "loser anschluss", "lockerer anschluss", "verschlechterter anschlusszustand",
            "beschaedigte armatur", "beschädigte armatur", "beschaedigtes ventil", "beschädigtes ventil", "korrodierter anschluss"
        ])
    })
});

const ELECTRICAL_SYSTEMS_TERMINOLOGY = Object.freeze({
    components: Object.freeze([
        "electrical", "electrical installation", "distribution board", "electrical panel", "consumer unit",
        "fuse box", "circuit breaker", "breaker", "residual current device", "rcd", "socket outlet",
        "power outlet", "socket", "switch", "electrical wiring", "wiring", "wire", "cable",
        "junction box", "electrical enclosure", "enclosure", "conductor", "grounding conductor",
        "earthing conductor", "bonding conductor", "extension lead", "extension leads", "adapter",
        "elektrik", "elektrisch", "elektroinstallation", "elektrische anlage", "unterverteilung",
        "verteilung", "sicherungskasten", "verteilerkasten", "schaltschrank", "stromkreis", "sicherung",
        "leitungsschutzschalter", "fi schalter", "fi-schalter", "rcd schalter", "steckdose", "schalter",
        "elektroleitung", "leitung", "kabel", "abzweigdose", "verteilerdose", "elektrogehaeuse",
        "elektrogehäuse", "gehaeuse", "gehäuse", "leiter", "schutzleiter", "erdungsleiter",
        "potentialausgleich", "potenzialausgleich", "verlaengerungskabel", "verlängerungskabel", "adapter"
    ]),
    issues: Object.freeze([
        "visible overheating", "overheating", "overheating marks", "thermal stress", "scorching", "scorch marks",
        "burn mark", "discoloration", "heat discoloration", "damaged", "damage", "broken", "cracked",
        "missing cover", "open enclosure", "open electrical panel", "exposed conductor", "visible bare wire",
        "bare conductor", "unprotected conductor", "open cable end", "cable insulation damaged", "loose component",
        "corrosion", "corroded", "rust", "moisture", "water marks", "condensation", "temporary wiring",
        "unsupported cable", "poor cable support", "hanging cable", "overloaded adapter", "multiple extension leads",
        "daisy chained extension", "missing circuit labeling", "unclear circuit labeling", "unlabeled circuit breaker",
        "missing label", "aged", "old", "deteriorated", "brittle", "missing bonding", "disconnected",
        "ueberhitzung", "überhitzung", "ueberhitzungsspuren", "überhitzungsspuren", "schmorspur",
        "schmorspuren", "brandspur", "verfaerbung", "verfärbung", "waermeverfaerbung", "wärmeverfärbung",
        "beschaedigt", "beschädigt", "gebrochen", "gerissen", "fehlende abdeckung", "offenes gehaeuse",
        "offenes gehäuse", "offene verteilung", "freiliegender leiter", "freiliegende leiter", "blanker draht",
        "blanke leitung", "offenes kabelende", "beschaedigte isolierung", "beschädigte isolierung", "locker",
        "lose", "korrosion", "rost", "feuchtigkeit", "wasserfleck", "kondensation", "provisorische verdrahtung",
        "provisorische verkabelung", "unzureichende befestigung", "haengendes kabel", "hängendes kabel",
        "ueberlasteter adapter", "überlasteter adapter", "mehrfachsteckdose ueberlastet", "mehrfachsteckdose überlastet",
        "mehrere verlaengerungskabel", "mehrere verlängerungskabel", "verkettete verlaengerung", "verkettete verlängerung",
        "fehlende beschriftung", "unklare beschriftung", "unbeschrifteter stromkreis", "alt", "gealtert",
        "verschlechtert", "bruechig", "brüchig", "fehlender potentialausgleich", "fehlender potenzialausgleich",
        "getrennt", "abgeklemmt"
    ]),
    signals: Object.freeze({
        "visible-thermal-stress-indication": Object.freeze([
            "visible overheating marks", "overheating marks", "scorching", "scorch marks", "heat discoloration",
            "thermal stress", "burn mark", "brown marks", "ueberhitzungsspuren", "überhitzungsspuren",
            "schmorspuren", "schmorspur", "brandspur", "waermeverfaerbung", "wärmeverfärbung",
            "verfaerbung an sicherung", "verfärbung an sicherung", "verfaerbung an verteilung", "verfärbung an verteilung"
        ]),
        "damaged-or-incomplete-electrical-enclosure": Object.freeze([
            "damaged cover", "missing cover", "missing enclosure cover", "damaged electrical enclosure",
            "open electrical panel", "broken consumer unit cover", "missing fuse box cover", "damaged distribution board cover",
            "fehlende abdeckung", "beschaedigte abdeckung", "beschädigte abdeckung", "offenes gehaeuse",
            "offenes gehäuse", "offene verteilung", "fehlende abdeckung am sicherungskasten",
            "beschaedigtes elektrogehaeuse", "beschädigtes elektrogehäuse"
        ]),
        "exposed-or-insufficiently-protected-conductors": Object.freeze([
            "exposed conductor", "exposed conductors", "visible bare wire", "bare conductor", "unprotected conductor",
            "open cable end", "cable insulation damaged", "damaged insulation on wiring", "freiliegender leiter",
            "freiliegende leiter", "blanker draht", "blanke leitung", "offenes kabelende", "beschaedigte isolierung",
            "beschädigte isolierung", "ungeschuetzter leiter", "ungeschützter leiter"
        ]),
        "moisture-or-corrosion-related-electrical-deterioration": Object.freeze([
            "corrosion in electrical panel", "corroded electrical component", "rust in fuse box", "moisture near electrical panel",
            "water marks near consumer unit", "condensation in electrical enclosure", "moisture proximity", "corroded junction box",
            "korrosion in verteilung", "korrosion am sicherungskasten", "rost im sicherungskasten", "feuchtigkeit an verteilung",
            "feuchtigkeit nahe elektroinstallation", "wasserfleck am sicherungskasten", "kondensation im elektrogehaeuse",
            "kondensation im elektrogehäuse", "korrodierte abzweigdose"
        ]),
        "temporary-or-poorly-supported-wiring": Object.freeze([
            "temporary wiring", "loose cable", "unsupported cable", "poor cable support", "hanging cable",
            "improvised wiring", "cable not supported", "temporary cable run", "provisorische verdrahtung",
            "provisorische verkabelung", "loses kabel", "locker befestigtes kabel", "unzureichende kabelbefestigung",
            "haengendes kabel", "hängendes kabel", "improvisierte verdrahtung"
        ]),
        "damaged-socket-or-switch-component": Object.freeze([
            "damaged socket", "cracked socket", "broken socket", "loose socket", "damaged switch", "cracked switch",
            "broken switch", "loose switch", "socket cover damaged", "switch cover damaged", "beschaedigte steckdose",
            "beschädigte steckdose", "gerissene steckdose", "lose steckdose", "lockere steckdose",
            "beschaedigter schalter", "beschädigter schalter", "gerissener schalter", "loser schalter",
            "lockerer schalter", "steckdosenabdeckung beschaedigt", "steckdosenabdeckung beschädigt"
        ]),
        "unclear-or-missing-circuit-labeling": Object.freeze([
            "missing circuit labeling", "unclear circuit labeling", "unlabeled circuit breaker", "unlabelled circuit breaker",
            "missing label", "unclear labels", "distribution board labeling missing", "fuse box labels missing",
            "fehlende stromkreisbeschriftung", "unklare stromkreisbeschriftung", "unbeschrifteter stromkreis",
            "unbeschriftete sicherung", "fehlende beschriftung", "unklare beschriftung", "beschriftung am sicherungskasten fehlt"
        ]),
        "aged-or-visibly-deteriorated-electrical-components": Object.freeze([
            "aged electrical component", "old fuse box", "old consumer unit", "aged wiring", "deteriorated wiring",
            "brittle cable", "old circuit breaker", "visible age-related deterioration", "gealterte elektrokomponente",
            "alter sicherungskasten", "alte unterverteilung", "gealterte verdrahtung", "verschlechterte leitung",
            "bruechiges kabel", "brüchiges kabel", "alter leitungsschutzschalter", "sichtbare altersbedingte verschlechterung"
        ]),
        "possible-overloaded-extension-or-adapter-arrangement": Object.freeze([
            "overloaded adapter", "overloaded extension", "multiple extension leads", "daisy chained extension",
            "many plugs in adapter", "extension lead cluster", "multi plug adapter overloaded", "temporary extension leads",
            "ueberlasteter adapter", "überlasteter adapter", "ueberlastete verlaengerung", "überlastete verlängerung",
            "mehrere verlaengerungskabel", "mehrere verlängerungskabel", "verkettete verlaengerung",
            "verkettete verlängerung", "viele stecker im adapter", "ueberlastete mehrfachsteckdose", "überlastete mehrfachsteckdose"
        ]),
        "visible-grounding-or-bonding-irregularity": Object.freeze([
            "loose grounding conductor", "loose earthing conductor", "missing bonding conductor", "bonding conductor disconnected",
            "grounding conductor damaged", "earthing conductor damaged", "visible bonding irregularity", "earth wire loose",
            "loser erdungsleiter", "lockerer erdungsleiter", "fehlender potentialausgleich", "fehlender potenzialausgleich",
            "potentialausgleich abgeklemmt", "potenzialausgleich abgeklemmt", "schutzleiter beschaedigt",
            "schutzleiter beschädigt", "sichtbare potentialausgleichsunregelmaessigkeit", "sichtbare potenzialausgleichsunregelmäßigkeit"
        ])
    })
});

const REGISTRY = Object.freeze({
    "windows-doors": WINDOWS_DOORS_TERMINOLOGY,
    "sanitary-systems": SANITARY_SYSTEMS_TERMINOLOGY,
    "electrical-systems": ELECTRICAL_SYSTEMS_TERMINOLOGY
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