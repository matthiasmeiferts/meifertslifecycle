import assert from "node:assert/strict";

import ExpertIntelligenceReasoningRenderer from "../portal/core/reasoning/ExpertIntelligenceReasoningRenderer.js";

function runTest(name, fn) {
    try {
        fn();
        console.log(`✓ ${name}`);
    } catch (error) {
        console.error(`✗ ${name}`);
        throw error;
    }
}

function sampleReasoning() {
    return {
        primaryHypothesis: {
            id: "defective-perimeter-seal",
            label: "defective perimeter seal",
            cause: "defective perimeter seal",
            classification: "perimeter seal hypothesis",
            supportingIndicators: ["visible seal discontinuity around frame perimeter"],
            contradictingIndicators: ["no deterioration at perimeter sealing line"],
            requiredVerification: ["Inspect full perimeter seal continuity around the opening."],
            potentialConsequences: ["recurring local moisture ingress or air leakage"],
            recommendedActions: ["Document perimeter condition with close-up photos."],
            riskRelevance: "medium",
            capexRelevance: "medium",
            valuationRelevance: "medium",
            status: "hypothesis"
        },
        alternativeHypotheses: [],
        supportingEvidence: ["visible seal discontinuity around frame perimeter"],
        missingEvidence: [],
        requiredVerification: ["Inspect full perimeter seal continuity around the opening."],
        potentialConsequences: ["recurring local moisture ingress or air leakage"],
        confidence: 0.33
    };
}

runTest(
    "German rendering changes user-facing fields and preserves IDs",
    () => {
        const result = ExpertIntelligenceReasoningRenderer.render({
            domainId: "windows-doors",
            reasoning: sampleReasoning(),
            language: "de"
        });

        assert.equal(result.primaryHypothesis.id, "defective-perimeter-seal");
        assert.equal(result.primaryHypothesis.cause, "mangelhafte Anschlussdichtung");
        assert.equal(result.primaryHypothesis.label, "mangelhafte Anschlussdichtung");
        assert.equal(result.primaryHypothesis.classification, "Hypothese zur Anschlussdichtung");
        assert.equal(result.requiredVerification[0], "Kontinuität der Anschlussdichtung umlaufend am Öffnungselement prüfen.");
    }
);

runTest(
    "English rendering remains compatible",
    () => {
        const result = ExpertIntelligenceReasoningRenderer.render({
            domainId: "windows-doors",
            reasoning: sampleReasoning(),
            language: "en"
        });

        assert.equal(result.primaryHypothesis.cause, "defective perimeter seal");
        assert.equal(result.primaryHypothesis.classification, "perimeter seal hypothesis");
        assert.equal(result.requiredVerification[0], "Inspect full perimeter seal continuity around the opening.");
    }
);

runTest(
    "unsupported language falls back to English",
    () => {
        const result = ExpertIntelligenceReasoningRenderer.render({
            domainId: "windows-doors",
            reasoning: sampleReasoning(),
            language: "fr"
        });

        assert.equal(result.primaryHypothesis.cause, "defective perimeter seal");
    }
);

runTest(
    "rendering does not mutate the reasoning input",
    () => {
        const input = sampleReasoning();
        const original = structuredClone(input);

        ExpertIntelligenceReasoningRenderer.render({
            domainId: "windows-doors",
            reasoning: input,
            language: "de"
        });

        assert.deepStrictEqual(input, original);
    }
);

console.log("ExpertIntelligenceReasoningRenderer tests completed successfully.");