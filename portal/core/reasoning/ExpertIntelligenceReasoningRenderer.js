import ExpertIntelligenceBilingualResources from "./ExpertIntelligenceBilingualResources.js";
import ExpertIntelligenceLanguage from "./ExpertIntelligenceLanguage.js";

export default class ExpertIntelligenceReasoningRenderer {

    static render({ domainId, reasoning, language } = {}) {
        const normalizedLanguage = ExpertIntelligenceLanguage.normalize(language);
        const result = cloneValue(reasoning);

        if (!domainId || !result) {
            return result;
        }

        const sourcePrimaryHypothesis = cloneValue(result.primaryHypothesis);

        result.primaryHypothesis = renderHypothesis(domainId, result.primaryHypothesis, normalizedLanguage);
        result.alternativeHypotheses = cloneArray(result.alternativeHypotheses)
            .map((hypothesis) => renderHypothesis(domainId, hypothesis, normalizedLanguage));

        if (result.primaryHypothesis) {
            result.supportingEvidence = renderEvidenceEntries({
                domainId,
                hypothesis: sourcePrimaryHypothesis,
                entries: result.supportingEvidence,
                field: "supportingIndicators",
                language: normalizedLanguage
            });
            result.missingEvidence = renderEvidenceEntries({
                domainId,
                hypothesis: sourcePrimaryHypothesis,
                entries: result.missingEvidence,
                field: "contradictingIndicators",
                language: normalizedLanguage
            });
            result.requiredVerification = cloneArray(result.primaryHypothesis.requiredVerification);
            result.potentialConsequences = cloneArray(result.primaryHypothesis.potentialConsequences);
        }

        return result;
    }

}

function renderHypothesis(domainId, hypothesis = {}, language) {
    if (!hypothesis || typeof hypothesis !== "object") {
        return hypothesis;
    }

    const rendered = cloneValue(hypothesis);
    const hypothesisId = rendered.id;
    const cause = ExpertIntelligenceBilingualResources.resolveHypothesisField({
        domainId,
        hypothesisId,
        field: "cause",
        language,
        fallback: rendered.cause
    });

    rendered.cause = cause;
    rendered.label = ExpertIntelligenceBilingualResources.resolveHypothesisField({
        domainId,
        hypothesisId,
        field: "label",
        language,
        fallback: rendered.label ?? cause
    });
    rendered.classification = ExpertIntelligenceBilingualResources.resolveHypothesisField({
        domainId,
        hypothesisId,
        field: "classification",
        language,
        fallback: rendered.classification
    });
    rendered.supportingIndicators = ExpertIntelligenceBilingualResources.resolveHypothesisField({
        domainId,
        hypothesisId,
        field: "supportingIndicators",
        language,
        fallback: rendered.supportingIndicators
    });
    rendered.contradictingIndicators = ExpertIntelligenceBilingualResources.resolveHypothesisField({
        domainId,
        hypothesisId,
        field: "contradictingIndicators",
        language,
        fallback: rendered.contradictingIndicators
    });
    rendered.requiredVerification = ExpertIntelligenceBilingualResources.resolveHypothesisField({
        domainId,
        hypothesisId,
        field: "requiredVerification",
        language,
        fallback: rendered.requiredVerification
    });
    rendered.potentialConsequences = ExpertIntelligenceBilingualResources.resolveHypothesisField({
        domainId,
        hypothesisId,
        field: "potentialConsequences",
        language,
        fallback: rendered.potentialConsequences
    });
    rendered.recommendedActions = ExpertIntelligenceBilingualResources.resolveHypothesisField({
        domainId,
        hypothesisId,
        field: "recommendedActions",
        language,
        fallback: rendered.recommendedActions
    });

    return rendered;
}

function renderEvidenceEntries({ domainId, hypothesis = {}, entries = [], field, language } = {}) {
    const englishValues = cloneArray(hypothesis[field]);
    const renderedValues = ExpertIntelligenceBilingualResources.resolveHypothesisField({
        domainId,
        hypothesisId: hypothesis.id,
        field,
        language,
        fallback: englishValues
    });

    return cloneArray(entries).map((entry) => {
        const index = englishValues.indexOf(entry);

        return index >= 0 ? cloneValue(renderedValues[index]) : cloneValue(entry);
    });
}

function cloneArray(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.map((entry) => cloneValue(entry));
}

function cloneValue(value) {
    if (value === undefined) {
        return undefined;
    }

    return JSON.parse(JSON.stringify(value));
}