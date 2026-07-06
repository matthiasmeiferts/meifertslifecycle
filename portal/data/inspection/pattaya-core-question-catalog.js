/**
 * MEIFERTS Building Intelligence
 * Pattaya Core Question Catalog
 *
 * First operational question set for Thailand / Pattaya field use.
 * German is primary. English fields are prepared for later translation.
 */
const pattayaCoreQuestionCatalog = [
    {
        id: "TH-PATTAYA-LOCATION-001",
        module: "Standort & Objektprofil",
        category: "Standort",
        question: {
            de: "Befindet sich das Objekt in küstennaher Lage mit erhöhter Korrosions- oder Feuchtebelastung?",
            en: null
        },
        helpText: {
            de: "Küstenlage, Meeresnähe, offene Lage, Windseite und sichtbare Salz-/Feuchtebelastung erfassen.",
            en: null
        },
        priority: "high",
        answerType: "status",
        answerOptions: {
            de: ["i.O.", "Auffällig", "Nicht prüfbar", "Hinweis"],
            en: null
        },
        appliesTo: {
            countries: ["TH"],
            propertyTypes: ["condominium_unit", "condominium_building", "villa", "townhouse"],
            timeModes: ["red_flags", "short", "standard", "full"],
            climateTags: ["coastal_corrosion", "tropical_humidity"]
        },
        requires: {
            photo: true,
            measurement: false,
            document: false,
            photoIf: ["Auffällig", "Nicht prüfbar"],
            measurementIf: [],
            documentIf: []
        },
        riskTags: ["coastal_corrosion", "moisture", "capex"],
        severityHint: "medium",
        capexRelevance: "medium",
        reportSection: "Location Risk",
        reviewStatus: "auto_draft"
    },
    {
        id: "TH-PATTAYA-BALCONY-001",
        module: "Balkon & Abdichtung",
        category: "Balkonabdichtung",
        question: {
            de: "Sind Balkonboden, Gefälle, Abläufe und Wandanschlüsse sichtbar intakt?",
            en: null
        },
        helpText: {
            de: "Auf stehendes Wasser, Risse, offene Fugen, fehlendes Gefälle, defekte Abläufe und Feuchtespuren achten.",
            en: null
        },
        priority: "critical",
        answerType: "status",
        answerOptions: {
            de: ["i.O.", "Auffällig", "Nicht prüfbar", "Hinweis"],
            en: null
        },
        appliesTo: {
            countries: ["TH"],
            propertyTypes: ["condominium_unit", "condominium_building", "villa", "townhouse"],
            timeModes: ["red_flags", "short", "standard", "full"],
            climateTags: ["heavy_rain", "tropical_humidity"]
        },
        requires: {
            photo: true,
            measurement: false,
            document: false,
            photoIf: ["Auffällig", "Nicht prüfbar"],
            measurementIf: ["Auffällig"],
            documentIf: []
        },
        followUpIf: {
            "Auffällig": ["TH-PATTAYA-MOISTURE-001", "TH-PATTAYA-BALCONY-002"],
            "Nicht prüfbar": ["TH-PATTAYA-LIMITATION-001"]
        },
        riskTags: ["balcony_waterproofing", "moisture", "waterproofing", "capex"],
        severityHint: "high",
        capexRelevance: "high",
        reportSection: "Balcony / Waterproofing",
        reviewStatus: "auto_draft"
    },
    {
        id: "TH-PATTAYA-BALCONY-002",
        module: "Balkon & Abdichtung",
        category: "Türanschluss",
        question: {
            de: "Sind Türschwelle, Anschlussfugen und angrenzende Innenbereiche frei von Feuchte- oder Verfärbungsspuren?",
            en: null
        },
        helpText: {
            de: "Innen direkt hinter Balkon-/Terrassentüren prüfen. Auf Quellungen, Verfärbungen, Geruch und weiche Stellen achten.",
            en: null
        },
        priority: "high",
        answerType: "status",
        answerOptions: {
            de: ["i.O.", "Auffällig", "Nicht prüfbar", "Hinweis"],
            en: null
        },
        appliesTo: {
            countries: ["TH"],
            propertyTypes: ["condominium_unit", "villa", "townhouse"],
            timeModes: ["short", "standard", "full"],
            climateTags: ["heavy_rain", "tropical_humidity"]
        },
        requires: {
            photo: true,
            measurement: true,
            document: false,
            photoIf: ["Auffällig", "Nicht prüfbar"],
            measurementIf: ["Auffällig"],
            documentIf: []
        },
        followUpIf: {
            "Auffällig": ["TH-PATTAYA-DAMAGE-MOISTURE-HYPOTHESIS-001"]
        },
        riskTags: ["moisture", "balcony_waterproofing", "interior_damage"],
        severityHint: "high",
        capexRelevance: "medium",
        reportSection: "Moisture / Interior",
        reviewStatus: "auto_draft"
    },
    {
        id: "TH-PATTAYA-MOISTURE-001",
        module: "Feuchte & Schimmel",
        category: "Feuchteindikatoren",
        question: {
            de: "Sind Feuchteflecken, Schimmel, Geruch, Verfärbungen oder aufgequollene Bauteile sichtbar?",
            en: null
        },
        helpText: {
            de: "Innenwände, Decken, Sockelbereiche, Einbauschränke, Nassräume und Bereiche an Außenwänden prüfen.",
            en: null
        },
        priority: "critical",
        answerType: "status",
        answerOptions: {
            de: ["i.O.", "Auffällig", "Nicht prüfbar", "Hinweis"],
            en: null
        },
        appliesTo: {
            countries: ["TH"],
            propertyTypes: ["condominium_unit", "villa", "townhouse"],
            timeModes: ["red_flags", "short", "standard", "full"],
            climateTags: ["tropical_humidity"]
        },
        requires: {
            photo: true,
            measurement: true,
            document: false,
            photoIf: ["Auffällig", "Nicht prüfbar"],
            measurementIf: ["Auffällig"],
            documentIf: []
        },
        followUpIf: {
            "Auffällig": ["TH-PATTAYA-DAMAGE-MOISTURE-HYPOTHESIS-001", "TH-PATTAYA-AC-001"]
        },
        riskTags: ["moisture", "mold", "water_ingress", "health_relevance", "capex"],
        severityHint: "high",
        capexRelevance: "high",
        reportSection: "Moisture / Mold",
        reviewStatus: "auto_draft"
    },
    {
        id: "TH-PATTAYA-AC-001",
        module: "Klima & Kondensat",
        category: "Klimaanlage",
        question: {
            de: "Sind Klimagerät, Kondensatleitung und angrenzende Wand-/Deckenbereiche frei von Leckage- oder Kondensatspuren?",
            en: null
        },
        helpText: {
            de: "Auf Tropfspuren, Verfärbungen, Schimmel, offene Leitungsführung und ungedämmte kalte Leitungen achten.",
            en: null
        },
        priority: "high",
        answerType: "status",
        answerOptions: {
            de: ["i.O.", "Auffällig", "Nicht prüfbar", "Hinweis"],
            en: null
        },
        appliesTo: {
            countries: ["TH"],
            propertyTypes: ["condominium_unit", "villa", "townhouse"],
            timeModes: ["red_flags", "short", "standard", "full"],
            climateTags: ["air_conditioning_condensate", "tropical_humidity"]
        },
        requires: {
            photo: true,
            measurement: true,
            document: false,
            photoIf: ["Auffällig", "Nicht prüfbar"],
            measurementIf: ["Auffällig"],
            documentIf: []
        },
        followUpIf: {
            "Auffällig": ["TH-PATTAYA-DAMAGE-AC-HYPOTHESIS-001"]
        },
        riskTags: ["air_conditioning_condensate", "moisture", "mold"],
        severityHint: "medium",
        capexRelevance: "medium",
        reportSection: "Air Conditioning / Condensate",
        reviewStatus: "auto_draft"
    },
    {
        id: "TH-PATTAYA-FACADE-001",
        module: "Fassade & Beton",
        category: "Fassade",
        question: {
            de: "Sind Risse, Abplatzungen, Hohllagen, Verfärbungen oder Feuchtespuren an Fassade oder Balkonuntersichten sichtbar?",
            en: null
        },
        helpText: {
            de: "Besonders Balkonuntersichten, Kanten, Stützen, Deckenanschlüsse und beschichtete Außenflächen prüfen.",
            en: null
        },
        priority: "critical",
        answerType: "status",
        answerOptions: {
            de: ["i.O.", "Auffällig", "Nicht prüfbar", "Hinweis"],
            en: null
        },
        appliesTo: {
            countries: ["TH"],
            propertyTypes: ["condominium_unit", "condominium_building", "villa", "townhouse"],
            timeModes: ["red_flags", "short", "standard", "full"],
            climateTags: ["coastal_corrosion", "heavy_rain", "uv_exposure"]
        },
        requires: {
            photo: true,
            measurement: false,
            document: false,
            photoIf: ["Auffällig", "Nicht prüfbar"],
            measurementIf: [],
            documentIf: []
        },
        followUpIf: {
            "Auffällig": ["TH-PATTAYA-CORROSION-001", "TH-PATTAYA-DAMAGE-FACADE-HYPOTHESIS-001"]
        },
        riskTags: ["facade_cracks", "concrete_corrosion", "moisture", "capex"],
        severityHint: "high",
        capexRelevance: "high",
        reportSection: "Facade / Concrete",
        reviewStatus: "auto_draft"
    },
    {
        id: "TH-PATTAYA-CORROSION-001",
        module: "Korrosion",
        category: "Metall & Beton",
        question: {
            de: "Sind Korrosionsspuren an Geländern, Befestigungen, Stahlteilen oder Betonbauteilen sichtbar?",
            en: null
        },
        helpText: {
            de: "Auf Rost, Abplatzungen, freiliegende Bewehrung, verfärbte Ablaufspuren und angegriffene Beschichtungen achten.",
            en: null
        },
        priority: "critical",
        answerType: "status",
        answerOptions: {
            de: ["i.O.", "Auffällig", "Nicht prüfbar", "Hinweis"],
            en: null
        },
        appliesTo: {
            countries: ["TH"],
            propertyTypes: ["condominium_unit", "condominium_building", "villa", "townhouse"],
            timeModes: ["red_flags", "short", "standard", "full"],
            climateTags: ["coastal_corrosion", "salt_air"]
        },
        requires: {
            photo: true,
            measurement: false,
            document: false,
            photoIf: ["Auffällig", "Nicht prüfbar"],
            measurementIf: [],
            documentIf: []
        },
        followUpIf: {
            "Auffällig": ["TH-PATTAYA-DAMAGE-CORROSION-HYPOTHESIS-001"]
        },
        riskTags: ["coastal_corrosion", "concrete_corrosion", "safety_relevance", "capex"],
        severityHint: "high",
        capexRelevance: "high",
        reportSection: "Corrosion / Coastal Exposure",
        reviewStatus: "auto_draft"
    },
    {
        id: "TH-PATTAYA-SANITARY-001",
        module: "Sanitär & Entwässerung",
        category: "Nassräume",
        question: {
            de: "Sind Nassräume, Silikonfugen, Bodenabläufe und angrenzende Wand-/Bodenbereiche ohne sichtbare Feuchte- oder Undichtigkeitsspuren?",
            en: null
        },
        helpText: {
            de: "Dusche, WC, Waschtisch, Bodenablauf, Fugen, Sockelbereiche und angrenzende Räume prüfen.",
            en: null
        },
        priority: "high",
        answerType: "status",
        answerOptions: {
            de: ["i.O.", "Auffällig", "Nicht prüfbar", "Hinweis"],
            en: null
        },
        appliesTo: {
            countries: ["TH"],
            propertyTypes: ["condominium_unit", "villa", "townhouse"],
            timeModes: ["short", "standard", "full"],
            climateTags: ["tropical_humidity"]
        },
        requires: {
            photo: true,
            measurement: true,
            document: false,
            photoIf: ["Auffällig", "Nicht prüfbar"],
            measurementIf: ["Auffällig"],
            documentIf: []
        },
        followUpIf: {
            "Auffällig": ["TH-PATTAYA-MOISTURE-001"]
        },
        riskTags: ["moisture", "water_ingress", "sanitary", "capex"],
        severityHint: "medium",
        capexRelevance: "medium",
        reportSection: "Sanitary / Drainage",
        reviewStatus: "auto_draft"
    },
    {
        id: "TH-PATTAYA-ELECTRICAL-001",
        module: "Elektro",
        category: "Sichtprüfung Elektro",
        question: {
            de: "Sind sichtbare Elektroinstallationen, Verteiler, Steckdosen und Leitungsführungen ohne offensichtliche Sicherheitsauffälligkeiten?",
            en: null
        },
        helpText: {
            de: "Nur Sichtprüfung. Keine VDE-Prüfung. Auf offene Leitungen, Brandspuren, Feuchte, lose Abdeckungen und unsachgemäße Installationen achten.",
            en: null
        },
        priority: "critical",
        answerType: "status",
        answerOptions: {
            de: ["i.O.", "Auffällig", "Nicht prüfbar", "Hinweis"],
            en: null
        },
        appliesTo: {
            countries: ["TH"],
            propertyTypes: ["condominium_unit", "villa", "townhouse"],
            timeModes: ["red_flags", "short", "standard", "full"]
        },
        requires: {
            photo: true,
            measurement: false,
            document: false,
            photoIf: ["Auffällig", "Nicht prüfbar"],
            measurementIf: [],
            documentIf: []
        },
        followUpIf: {
            "Auffällig": ["TH-PATTAYA-LIMITATION-001"]
        },
        riskTags: ["electrical", "safety_relevance", "limitation"],
        severityHint: "critical",
        capexRelevance: "medium",
        reportSection: "Electrical / Safety",
        reviewStatus: "auto_draft"
    },
    {
        id: "TH-PATTAYA-FIRE-001",
        module: "Brandschutz & Sicherheit",
        category: "Fluchtwege",
        question: {
            de: "Sind Fluchtwege, Treppenräume, Notausgänge und sichtbare Brandschutzeinrichtungen frei zugänglich und ohne offensichtliche Auffälligkeiten?",
            en: null
        },
        helpText: {
            de: "Nur sichtbare Plausibilitätsprüfung. Keine behördliche oder technische Brandschutzprüfung.",
            en: null
        },
        priority: "critical",
        answerType: "status",
        answerOptions: {
            de: ["i.O.", "Auffällig", "Nicht prüfbar", "Hinweis"],
            en: null
        },
        appliesTo: {
            countries: ["TH"],
            propertyTypes: ["condominium_building", "condominium_unit", "villa", "townhouse"],
            timeModes: ["red_flags", "short", "standard", "full"]
        },
        requires: {
            photo: true,
            measurement: false,
            document: false,
            photoIf: ["Auffällig", "Nicht prüfbar"],
            measurementIf: [],
            documentIf: []
        },
        riskTags: ["fire_safety", "safety_relevance", "limitation"],
        severityHint: "critical",
        capexRelevance: "medium",
        reportSection: "Fire Safety / Escape Routes",
        reviewStatus: "auto_draft"
    },
    {
        id: "TH-PATTAYA-LIFT-001",
        module: "Aufzug & Gemeinschaftstechnik",
        category: "Aufzug",
        question: {
            de: "Wirkt der Aufzug sichtbar gepflegt, funktionsfähig und ohne offensichtliche Betriebs- oder Sicherheitsauffälligkeiten?",
            en: null
        },
        helpText: {
            de: "Nur Sicht- und Nutzungseindruck. Keine technische Aufzugsprüfung. Auf Geräusche, Ruckeln, Zustand Kabine, Türen und Anzeigen achten.",
            en: null
        },
        priority: "high",
        answerType: "status",
        answerOptions: {
            de: ["i.O.", "Auffällig", "Nicht prüfbar", "Hinweis"],
            en: null
        },
        appliesTo: {
            countries: ["TH"],
            propertyTypes: ["condominium_building", "condominium_unit"],
            timeModes: ["short", "standard", "full"]
        },
        requires: {
            photo: true,
            measurement: false,
            document: false,
            photoIf: ["Auffällig", "Nicht prüfbar"],
            measurementIf: [],
            documentIf: []
        },
        riskTags: ["lift_condition", "maintenance_evidence", "capex"],
        severityHint: "medium",
        capexRelevance: "high",
        reportSection: "Lift / Common Systems",
        reviewStatus: "auto_draft"
    },
    {
        id: "TH-PATTAYA-DRAINAGE-001",
        module: "Außenbereich & Entwässerung",
        category: "Entwässerung",
        question: {
            de: "Sind Grundstücks-/Gebäudeentwässerung, Abläufe und tiefliegende Bereiche ohne sichtbare Rückstau-, Überflutungs- oder Feuchterisiken?",
            en: null
        },
        helpText: {
            de: "Auf Gefälle, Ablaufpunkte, tiefliegende Zufahrten, Keller-/Technikbereiche und Spuren früherer Überflutung achten.",
            en: null
        },
        priority: "high",
        answerType: "status",
        answerOptions: {
            de: ["i.O.", "Auffällig", "Nicht prüfbar", "Hinweis"],
            en: null
        },
        appliesTo: {
            countries: ["TH"],
            propertyTypes: ["condominium_building", "villa", "townhouse"],
            timeModes: ["short", "standard", "full"],
            climateTags: ["heavy_rain"]
        },
        requires: {
            photo: true,
            measurement: false,
            document: false,
            photoIf: ["Auffällig", "Nicht prüfbar"],
            measurementIf: [],
            documentIf: []
        },
        riskTags: ["drainage", "flooding", "moisture", "capex"],
        severityHint: "high",
        capexRelevance: "high",
        reportSection: "Drainage / Flooding",
        reviewStatus: "auto_draft"
    },
    {
        id: "TH-PATTAYA-DOC-AVAILABILITY-001",
        module: "Dokumenten-Verfügbarkeit",
        category: "Verfügbarkeitscheck",
        question: {
            de: "Wurden Wartungsinformationen, Instandhaltungsnachweise oder Angaben zu größeren Maßnahmen nur als verfügbar/nicht verfügbar erfasst?",
            en: null
        },
        helpText: {
            de: "Thailand: keine Dokumentenprüfung. Nur erfassen, ob Informationen vorliegen, angefordert wurden oder nicht verfügbar sind.",
            en: null
        },
        priority: "medium",
        answerType: "status",
        answerOptions: {
            de: ["Verfügbar", "Nicht verfügbar", "Angefordert", "Nicht geprüft"],
            en: null
        },
        appliesTo: {
            countries: ["TH"],
            propertyTypes: ["condominium_unit", "condominium_building", "villa", "townhouse"],
            timeModes: ["standard", "full"]
        },
        requires: {
            photo: false,
            measurement: false,
            document: true,
            photoIf: [],
            measurementIf: [],
            documentIf: ["Verfügbar", "Angefordert"]
        },
        riskTags: ["maintenance_evidence", "document_availability", "limitation"],
        severityHint: "medium",
        capexRelevance: "medium",
        reportSection: "Document Availability Check",
        reviewStatus: "auto_draft",
        countryPolicy: {
            TH: {
                documentMode: "availability_check_only",
                forbiddenClaims: ["validated", "legally_checked", "financially_verified", "complete_governance_review"]
            }
        }
    },
    {
        id: "TH-PATTAYA-CAPEX-001",
        module: "CAPEX & Wartungsstau",
        category: "CAPEX-Frühwarnung",
        question: {
            de: "Gibt es sichtbare Hinweise auf mittelfristigen Investitionsbedarf an Fassade, Abdichtung, Technik, Aufzug oder gemeinschaftlichen Anlagen?",
            en: null
        },
        helpText: {
            de: "Nur technische Frühwarnung. Keine Kostenschätzung und keine rechtlich belastbare CAPEX-Prognose.",
            en: null
        },
        priority: "high",
        answerType: "status",
        answerOptions: {
            de: ["i.O.", "Auffällig", "Nicht prüfbar", "Hinweis"],
            en: null
        },
        appliesTo: {
            countries: ["TH"],
            propertyTypes: ["condominium_unit", "condominium_building", "villa", "townhouse"],
            timeModes: ["short", "standard", "full"]
        },
        requires: {
            photo: true,
            measurement: false,
            document: false,
            photoIf: ["Auffällig", "Nicht prüfbar"],
            measurementIf: [],
            documentIf: []
        },
        riskTags: ["capex", "maintenance_backlog", "decision_support"],
        severityHint: "high",
        capexRelevance: "high",
        reportSection: "CAPEX Early Warning",
        reviewStatus: "auto_draft"
    },
    {
        id: "TH-PATTAYA-LIMITATION-001",
        module: "Prüfgrenzen",
        category: "Limitation",
        question: {
            de: "Muss ein Prüfbereich wegen fehlendem Zugang, fehlender Sichtbarkeit oder fehlender Unterlagen ausdrücklich als Einschränkung dokumentiert werden?",
            en: null
        },
        helpText: {
            de: "Prüfgrenzen klar erfassen. Keine verdeckte Konstruktion, keine zerstörende Prüfung, keine rechtliche Dokumentenprüfung.",
            en: null
        },
        priority: "high",
        answerType: "status",
        answerOptions: {
            de: ["Nein", "Ja", "Nicht prüfbar", "Hinweis"],
            en: null
        },
        appliesTo: {
            countries: ["TH"],
            propertyTypes: ["condominium_unit", "condominium_building", "villa", "townhouse"],
            timeModes: ["red_flags", "short", "standard", "full"]
        },
        requires: {
            photo: false,
            measurement: false,
            document: false,
            photoIf: [],
            measurementIf: [],
            documentIf: []
        },
        riskTags: ["limitation", "confidence"],
        severityHint: "medium",
        capexRelevance: "unknown",
        reportSection: "Scope and Limitations",
        reviewStatus: "auto_draft"
    }
];

export default pattayaCoreQuestionCatalog;
