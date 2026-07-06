export default class LanguageManager {

    static storageKey = "mbi:interfaceLanguage";

    static defaultLanguage = "en";

    static supportedLanguages = [
        { code: "en", label: "English", status: "Active" },
        { code: "de", label: "Deutsch", status: "Active" }
    ];

    static getLanguage() {
        const stored = localStorage.getItem(this.storageKey);
        const isSupported = this.supportedLanguages.some(item => item.code === stored);

        return isSupported ? stored : this.defaultLanguage;
    }

    static setLanguage(language) {
        const isSupported = this.supportedLanguages.some(item => item.code === language);
        const selectedLanguage = isSupported ? language : this.defaultLanguage;

        localStorage.setItem(this.storageKey, selectedLanguage);

        return this.getLanguage();
    }

    static getSupportedLanguages() {
        return this.supportedLanguages;
    }

    static getProductTerms() {
        return [
            "Evidence",
            "Finding",
            "Assessment",
            "Recommendation",
            "Decision",
            "Report",
            "Building Intelligence",
            "Technical Due Diligence",
            "Technical Property Review",
            "Building Risk Score™",
            "Knowledge Coverage™",
            "CAPEX"
        ];
    }

    static getTranslatableGroups() {
        return [
            "Navigation labels",
            "Buttons and actions",
            "Empty states",
            "Notifications",
            "Form labels",
            "Detail panel labels",
            "Settings copy",
            "Report output copy"
        ];
    }

    static getTranslationBoundary() {
        return {
            productTerms: this.getProductTerms(),
            translatableGroups: this.getTranslatableGroups(),
            rule: "Core product terms remain controlled; general interface copy may be localized."
        };
    }

    static getLanguageLabel(language = this.getLanguage()) {
        const selected = this.supportedLanguages.find(item => item.code === language);

        return selected?.label || this.getLanguageLabel(this.defaultLanguage);
    }

    static getInterfaceCopy() {
        return {
            InterfaceLanguage: {
                en: "Interface Language",
                de: "Arbeitssprache"
            },
            LanguageReadiness: {
                en: "Language foundation",
                de: "Sprachgrundlage"
            },
            LanguageReadinessDescription: {
                en: "The workspace supports English and German as controlled working languages for international real estate due diligence.",
                de: "Der Workspace unterstützt Englisch und Deutsch als kontrollierte Arbeitssprachen für internationale Immobilien-Due-Diligence."
            },
            CurrentLanguage: {
                en: "Current language",
                de: "Aktuelle Sprache"
            },
            SupportedLanguages: {
                en: "Supported languages",
                de: "Unterstützte Sprachen"
            },
            ProductTerminology: {
                en: "Product terminology",
                de: "Produktterminologie"
            },
            CoreTermsRule: {
                en: "Core product terms remain controlled to protect workflow consistency.",
                de: "Zentrale Produktbegriffe bleiben kontrolliert, damit die Workflow-Logik konsistent bleibt."
            },
            TranslationBoundary: {
                en: "Translation boundary: core product terms are controlled; interface copy may be localized.",
                de: "Übersetzungsgrenze: zentrale Produktbegriffe bleiben kontrolliert; allgemeine Bedienoberfläche kann lokalisiert werden."
            },
            InterfaceLanguageSaved: {
                en: "Interface language preference saved.",
                de: "Arbeitssprache gespeichert."
            }
        };
    }

    static t(key, language = this.getLanguage()) {
        const copy = this.getInterfaceCopy();
        const entry = copy[key];

        if (!entry) {
            return key;
        }

        return entry[language] || entry.en || key;
    }

    static getTerminology() {
        return {
            Evidence: { en: "Evidence", de: "Evidence / Nachweise" },
            Finding: { en: "Finding", de: "Finding / technische Feststellung" },
            Assessment: { en: "Assessment", de: "Assessment / Bewertung" },
            Recommendation: { en: "Recommendation", de: "Recommendation / Handlungsempfehlung" },
            Decision: { en: "Decision", de: "Decision / Entscheidung" },
            Report: { en: "Report", de: "Report / Bericht" },
            BuildingIntelligence: { en: "Building Intelligence", de: "Building Intelligence" },
            TechnicalDueDiligence: { en: "Technical Due Diligence", de: "Technical Due Diligence" }
        };
    }

    static getTerm(key, language = this.getLanguage()) {
        const terminology = this.getTerminology();
        const term = terminology[key];

        if (!term) {
            return key;
        }

        return term[language] || term.en || key;
    }
}
