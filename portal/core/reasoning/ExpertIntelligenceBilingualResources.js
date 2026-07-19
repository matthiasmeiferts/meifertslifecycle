import windowsDoorsBilingualResources from "./resources/windowsDoorsBilingualResources.js";
import sanitarySystemsBilingualResources from "./resources/sanitarySystemsBilingualResources.js";

const RESOURCES = Object.freeze({
    "windows-doors": windowsDoorsBilingualResources,
    "sanitary-systems": sanitarySystemsBilingualResources
});

export default class ExpertIntelligenceBilingualResources {

    static getHypothesisResource(domainId, hypothesisId) {
        return RESOURCES[domainId]?.[hypothesisId] || null;
    }

    static resolveHypothesisField({ domainId, hypothesisId, field, language, fallback }) {
        const resource = this.getHypothesisResource(domainId, hypothesisId)?.[field];

        if (!resource) {
            return cloneValue(fallback);
        }

        return cloneValue(resource[language] ?? resource.en ?? fallback);
    }

}

function cloneValue(value) {
    if (value === undefined) {
        return undefined;
    }

    return JSON.parse(JSON.stringify(value));
}