/**
 * MBLS Expert Intelligence Layer
 * Knowledge Reasoning Mapper
 *
 * Maps deterministic provider knowledge into the stable expert-reasoning
 * result contract used by ExpertReasoningEngine.
 */

export default class KnowledgeReasoningMapper {

    /**
     * Map provider knowledge into the expert reasoning contract.
     *
     * @param {Object} options - Mapping input.
     * @param {Object} options.knowledge - Provider knowledge payload.
     * @param {Object} options.input - Original analysis input.
     * @returns {Object|null} Stable reasoning contract or null when no match exists.
     */
    static map({ knowledge = {}, input = {} } = {}) {
        const source = normalizeInput(input);
        const hypotheses = cloneArray(knowledge.hypotheses);

        if (!hypotheses.length) {
            return null;
        }

        const ranked = hypotheses
            .map((hypothesis) => ({
                hypothesis,
                score: scoreHypothesis(hypothesis, source)
            }))
            .sort((left, right) => {
                if (right.score !== left.score) {
                    return right.score - left.score;
                }

                return String(left.hypothesis.id).localeCompare(String(right.hypothesis.id));
            });

        if (ranked.length === 0 || ranked[0].score === 0) {
            return null;
        }

        const primary = ranked[0].hypothesis;
        const supportingEvidence = collectSupportingEvidence(primary, source);

        return {
            primaryHypothesis: mapHypothesis(primary, source),
            alternativeHypotheses: ranked
                .slice(1)
                .filter((entry) => entry.score > 0)
                .map((entry) => mapHypothesis(entry.hypothesis, source)),
            supportingEvidence,
            missingEvidence: collectMissingEvidence(primary, supportingEvidence),
            requiredVerification: cloneArray(primary.requiredVerification),
            potentialConsequences: cloneArray(primary.potentialConsequences),
            confidence: calculateConfidence(supportingEvidence, primary)
        };
    }

}

function scoreHypothesis(hypothesis = {}, source = {}) {
    const text = buildCombinedText(source);

    return cloneArray(hypothesis.supportingIndicators).reduce((total, indicator) => {
        return total + (matches(text, indicator) ? 1 : 0);
    }, 0);
}

function collectSupportingEvidence(hypothesis = {}, source = {}) {
    const text = buildCombinedText(source);

    return cloneArray(hypothesis.supportingIndicators)
        .filter((indicator) => matches(text, indicator))
        .map((indicator) => indicator);
}

function collectMissingEvidence(hypothesis = {}, supportingEvidence = []) {
    const missingEvidence = cloneArray(hypothesis.contradictingIndicators);

    if (supportingEvidence.length === 0) {
        missingEvidence.push("No supporting indicators matched the available knowledge.");
    }

    return missingEvidence;
}

function calculateConfidence(supportingEvidence = [], hypothesis = {}) {
    const totalIndicators = cloneArray(hypothesis.supportingIndicators).length || 1;
    const confidence = supportingEvidence.length / totalIndicators;

    return Math.max(0, Math.min(1, Number(confidence.toFixed(2))));
}

function mapHypothesis(hypothesis = {}, source = {}) {
    const supportingEvidence = collectSupportingEvidence(hypothesis, source);

    return {
        id: hypothesis.id,
        label: hypothesis.cause,
        cause: hypothesis.cause,
        classification: hypothesis.classification,
        structuralRelevance: hypothesis.structuralRelevance,
        supportingIndicators: cloneArray(hypothesis.supportingIndicators),
        contradictingIndicators: cloneArray(hypothesis.contradictingIndicators),
        requiredVerification: buildVerification(hypothesis, supportingEvidence),
        potentialConsequences: cloneArray(hypothesis.potentialConsequences),
        recommendedActions: cloneArray(hypothesis.recommendedActions),
        riskRelevance: hypothesis.riskRelevance,
        capexRelevance: hypothesis.capexRelevance,
        valuationRelevance: hypothesis.valuationRelevance,
        status: "hypothesis"
    };
}

function buildVerification(hypothesis = {}, supportingEvidence = []) {
    const verification = cloneArray(hypothesis.requiredVerification);

    if (supportingEvidence.length === 0) {
        verification.push("Confirm the available indicators before concluding.");
    }

    return verification;
}

function buildCombinedText(source = {}) {
    return [
        textOf(source.finding?.category),
        textOf(source.finding?.location),
        textOf(source.finding?.description),
        textOf(source.finding?.observations),
        textOf(source.building?.constructionType),
        textOf(source.building?.constructionYear),
        textOf(source.building?.numberOfStoreys),
        source.building?.basementPresent === true ? "basement present" : "",
        ...cloneArray(source.measurements).map((entry) => textOf(entry))
    ].join(" ").toLowerCase();
}

function matches(text, phrase) {
    const normalizedText = String(text).toLowerCase();
    const normalizedPhrase = String(phrase).toLowerCase();

    if (normalizedText.includes(normalizedPhrase)) {
        return true;
    }

    return normalizedPhrase
        .split(/[^a-z0-9]+/)
        .filter((token) => token.length >= 4)
        .some((token) => normalizedText.includes(token));
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

function normalizeInput(input) {
    const source = cloneObject(input);

    return {
        finding: cloneObject(source.finding),
        building: cloneObject(source.building),
        measurements: cloneArray(source.measurements)
    };
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
