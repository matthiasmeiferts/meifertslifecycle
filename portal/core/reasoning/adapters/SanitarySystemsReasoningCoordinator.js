import SanitarySystemsKnowledgeProvider from "../../knowledge/SanitarySystemsKnowledgeProvider.js";
import KnowledgeReasoningMapper from "../KnowledgeReasoningMapper.js";

const FALLBACK_INPUTS_BY_SIGNAL = Object.freeze({
    "visible-leakage-at-sanitary-component": Object.freeze({ finding: { category: "sanitary", location: "wash basin trap", description: "visible leakage at trap and dripping from sanitary fitting" } }),
    "visible-corrosion-staining-or-moisture": Object.freeze({ finding: { category: "sanitary", location: "waste water pipe", description: "corrosion water staining and moisture around pipe" } }),
    "damaged-or-loose-sanitary-fixture": Object.freeze({ finding: { category: "sanitary fixture", location: "toilet", description: "damaged toilet and loose fixture" } }),
    "possible-drainage-restriction-indicator": Object.freeze({ finding: { category: "sanitary", location: "floor drain", description: "blocked drain slow drainage and water backing up" } }),
    "unpleasant-odour-near-sanitary-drainage": Object.freeze({ finding: { category: "sanitary", location: "floor drain", description: "unpleasant odour at floor drain and trap odour" } }),
    "missing-or-damaged-sanitary-seal": Object.freeze({ finding: { category: "sanitary", location: "toilet connection", description: "missing seal and damaged seal at sanitary connection" } }),
    "possible-backflow-indication": Object.freeze({ finding: { category: "sanitary", location: "floor drain", description: "backflow indication at drain and wastewater backing up" } }),
    "poor-support-or-protection-of-sanitary-pipework": Object.freeze({ finding: { category: "sanitary", location: "drain pipe", description: "unsupported pipe poor support and damaged pipe insulation" } }),
    "visible-deterioration-at-sanitary-connection": Object.freeze({ finding: { category: "sanitary", location: "wash basin connection", description: "damaged connection loose valve and deteriorated fitting" } })
});

export default class SanitarySystemsReasoningCoordinator {

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

        SanitarySystemsKnowledgeProvider.getKnowledge(input).hypotheses.forEach((hypothesis) => {
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