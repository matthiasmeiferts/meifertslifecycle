const SUPPORTED_LANGUAGES = Object.freeze(["en", "de"]);
const DEFAULT_LANGUAGE = "en";

export default class ExpertIntelligenceLanguage {

    static defaultLanguage = DEFAULT_LANGUAGE;

    static supportedLanguages = SUPPORTED_LANGUAGES;

    static normalize(language) {
        if (typeof language !== "string") {
            return DEFAULT_LANGUAGE;
        }

        const value = language.trim().toLowerCase();

        return SUPPORTED_LANGUAGES.includes(value) ? value : DEFAULT_LANGUAGE;
    }

}