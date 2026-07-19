import ElectricalSystemsKnowledgeProvider from "../../knowledge/ElectricalSystemsKnowledgeProvider.js";
import KnowledgeReasoningMapper from "../KnowledgeReasoningMapper.js";

const FALLBACK_INPUTS_BY_SIGNAL = Object.freeze({
    "visible-thermal-stress-indication": Object.freeze({ finding: { category: "electrical", location: "distribution board", description: "visible overheating marks scorching and heat discoloration near circuit breaker" } }),
    "damaged-or-incomplete-electrical-enclosure": Object.freeze({ finding: { category: "electrical", location: "electrical panel", description: "missing cover and damaged electrical enclosure" } }),
    "exposed-or-insufficiently-protected-conductors": Object.freeze({ finding: { category: "electrical", location: "junction box", description: "exposed conductors visible bare wire and open cable end" } }),
    "moisture-or-corrosion-related-electrical-deterioration": Object.freeze({ finding: { category: "electrical", location: "consumer unit", description: "corrosion in electrical panel water marks and moisture proximity" } }),
    "temporary-or-poorly-supported-wiring": Object.freeze({ finding: { category: "electrical installation", location: "service corridor", description: "temporary wiring unsupported cable and poor cable support" } }),
    "damaged-socket-or-switch-component": Object.freeze({ finding: { category: "electrical", location: "socket outlet", description: "damaged socket cracked socket cover loose switch" } }),
    "unclear-or-missing-circuit-labeling": Object.freeze({ finding: { category: "electrical", location: "consumer unit", description: "missing circuit labeling unclear circuit labeling and unlabeled circuit breaker" } }),
    "aged-or-visibly-deteriorated-electrical-components": Object.freeze({ finding: { category: "electrical", location: "fuse box", description: "old fuse box aged electrical component and visible age-related deterioration" } }),
    "possible-overloaded-extension-or-adapter-arrangement": Object.freeze({ finding: { category: "electrical", location: "office", description: "overloaded adapter multiple extension leads and daisy chained extension" } }),
    "visible-grounding-or-bonding-irregularity": Object.freeze({ finding: { category: "electrical", location: "plant room", description: "loose grounding conductor missing bonding conductor and earth wire loose" } })
});

export default class ElectricalSystemsReasoningCoordinator {

    static build({ providerKnowledge = {}, input = {}, canonicalContext = null } = {}) {
        const mapped = KnowledgeReasoningMapper.map({
            knowledge: providerKnowledge,
            input
        });

        if (!canonicalContext?.matchedSignalIds?.length) {
            return mapped;
        }

        if (mapped && mapped.primaryHypothesis?.id === canonicalContext.matchedSignalIds[0]) {
            return mapped;
        }

        const hypotheses = collectProviderHypotheses(canonicalContext.matchedSignalIds);

        if (!hypotheses.length) {
            return mapped;
        }

        const primary = hypotheses[0];

        return {
            primaryHypothesis: mapHypothesis(primary),
            alternativeHypotheses: hypotheses.slice(1).map((hypothesis) => mapHypothesis(hypothesis)),
            supportingEvidence: [],
            missingEvidence: cloneArray(primary.contradictingIndicators),
            requiredVerification: cloneArray(primary.requiredVerification),
            potentialConsequences: cloneArray(primary.potentialConsequences),
            confidence: 0
        };
    }

}

function collectProviderHypotheses(signalIds = []) {
    const byId = new Map();

    signalIds.forEach((signalId) => {
        const input = FALLBACK_INPUTS_BY_SIGNAL[signalId];

        if (!input) {
            return;
        }

        ElectricalSystemsKnowledgeProvider.getKnowledge(input).hypotheses.forEach((hypothesis) => {
            if (hypothesis.id === signalId && !byId.has(hypothesis.id)) {
                byId.set(hypothesis.id, hypothesis);
            }
        });
    });

    return signalIds.map((signalId) => byId.get(signalId)).filter(Boolean);
}

function mapHypothesis(hypothesis = {}) {
    return {
        id: hypothesis.id,
        label: hypothesis.cause,
        cause: hypothesis.cause,
        classification: hypothesis.classification,
        structuralRelevance: hypothesis.structuralRelevance,
        supportingIndicators: cloneArray(hypothesis.supportingIndicators),
        contradictingIndicators: cloneArray(hypothesis.contradictingIndicators),
        requiredVerification: cloneArray(hypothesis.requiredVerification),
        potentialConsequences: cloneArray(hypothesis.potentialConsequences),
        recommendedActions: cloneArray(hypothesis.recommendedActions),
        riskRelevance: hypothesis.riskRelevance,
        capexRelevance: hypothesis.capexRelevance,
        valuationRelevance: hypothesis.valuationRelevance,
        status: "hypothesis"
    };
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