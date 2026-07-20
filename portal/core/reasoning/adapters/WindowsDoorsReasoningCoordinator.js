import WindowsDoorsKnowledgeProvider from "../../knowledge/WindowsDoorsKnowledgeProvider.js";
import KnowledgeReasoningMapper from "../KnowledgeReasoningMapper.js";

const FALLBACK_INPUTS_BY_SIGNAL = Object.freeze({
    "defective-perimeter-seal": Object.freeze({ finding: { category: "window", location: "frame perimeter", description: "perimeter seal and draught", observations: ["sealant"] } }),
    "failed-installation-joint": Object.freeze({ finding: { category: "window", location: "installation interface", description: "installation joint water ingress" } }),
    "water-penetration-through-window-connection": Object.freeze({ finding: { category: "window", location: "frame reveal", description: "water penetration ingress at frame" } }),
    "defective-flashing-or-sill-connection": Object.freeze({ finding: { category: "window", location: "window sill", description: "flashing sill water ingress" } }),
    "failed-weather-seals": Object.freeze({ finding: { category: "window", location: "closure line", description: "weather seal gasket draught" } }),
    "defective-exterior-door-seal": Object.freeze({ finding: { category: "door", location: "exterior door threshold", description: "exterior door seal threshold seal draught" } }),
    "defective-glazing-seal": Object.freeze({ finding: { category: "glazing", location: "glazing edge", description: "glazing seal edge seal fogging between panes" } }),
    "glazing-damage": Object.freeze({ finding: { category: "glazing", location: "window pane", description: "cracked glass glass fracture" } }),
    "condensation-on-glazing-or-frame": Object.freeze({ finding: { category: "window", location: "glazing", description: "condensation surface moisture" } }),
    "thermal-bridge-at-window-installation": Object.freeze({ finding: { category: "window", location: "cold reveal", description: "thermal bridge cold edge" } }),
    "distorted-frame-or-sash": Object.freeze({ finding: { category: "window", location: "sash", description: "misaligned sash warped frame binding sash" } }),
    "defective-hardware-or-adjustment": Object.freeze({ finding: { category: "window", location: "hardware", description: "defective hinge lock handle adjustment not closing" } }),
    "installation-workmanship-defect": Object.freeze({ finding: { category: "window", location: "opening transition", description: "workmanship poor installation incorrect detailing" } }),
    "insufficient-maintenance": Object.freeze({ finding: { category: "window", location: "frame", description: "insufficient maintenance deferred maintenance" } }),
    "age-related-deterioration": Object.freeze({ finding: { category: "window", location: "frame", description: "age-related aged weathered older window" } }),
    "air-leakage": Object.freeze({ finding: { category: "window", location: "frame", description: "air leakage draught" } })
});

export default class WindowsDoorsReasoningCoordinator {

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
            missingEvidence: ["No supporting indicators matched the available knowledge."],
            requiredVerification: [
                ...cloneArray(primary.requiredVerification),
                "Confirm the available indicators before concluding."
            ],
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

        WindowsDoorsKnowledgeProvider.getKnowledge(input).hypotheses.forEach((hypothesis) => {
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
        requiredVerification: [
            ...cloneArray(hypothesis.requiredVerification),
            "Confirm the available indicators before concluding."
        ],
        potentialConsequences: cloneArray(hypothesis.potentialConsequences),
        recommendedActions: cloneArray(hypothesis.recommendedActions),
        riskRelevance: hypothesis.riskRelevance,
        ...(Object.hasOwn(hypothesis, "riskRelevanceVersion") ? { riskRelevanceVersion: hypothesis.riskRelevanceVersion } : {}),
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
