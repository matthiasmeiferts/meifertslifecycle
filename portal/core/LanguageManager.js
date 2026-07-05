export default class LanguageManager {

    static storageKey = "mbi:interfaceLanguage";

    static defaultLanguage = "en";

    static supportedLanguages = [
        { code: "en", label: "English", status: "Active" },
        { code: "de", label: "Deutsch", status: "Prepared" }
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

    static getLanguageLabel(language = this.getLanguage()) {
        const selected = this.supportedLanguages.find(item => item.code === language);

        return selected?.label || this.getLanguageLabel(this.defaultLanguage);
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
