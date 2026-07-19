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

function sampleSanitaryReasoning() {
    return {
        primaryHypothesis: {
            id: "visible-leakage-at-sanitary-component",
            label: "visible leakage around sanitary component",
            cause: "visible leakage around sanitary component",
            classification: "visual sanitary hypothesis",
            supportingIndicators: ["visible leakage is reported at or near a sanitary component"],
            contradictingIndicators: ["reported water is confirmed to originate from a non-sanitary source"],
            requiredVerification: ["Document the affected component, location, and visible moisture extent."],
            potentialConsequences: ["possible local deterioration of adjacent finishes"],
            recommendedActions: ["Record visible leakage without treating it as pipe failure."],
            riskRelevance: "medium",
            capexRelevance: "medium",
            valuationRelevance: "medium",
            status: "hypothesis"
        },
        alternativeHypotheses: [],
        supportingEvidence: ["visible leakage is reported at or near a sanitary component"],
        missingEvidence: [],
        requiredVerification: ["Document the affected component, location, and visible moisture extent."],
        potentialConsequences: ["possible local deterioration of adjacent finishes"],
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

runTest(
    "German sanitary rendering changes user-facing fields and preserves IDs",
    () => {
        const result = ExpertIntelligenceReasoningRenderer.render({
            domainId: "sanitary-systems",
            reasoning: sampleSanitaryReasoning(),
            language: "de"
        });

        assert.equal(result.primaryHypothesis.id, "visible-leakage-at-sanitary-component");
        assert.equal(result.primaryHypothesis.cause, "sichtbare Leckage an einer Sanitärkomponente");
        assert.equal(result.primaryHypothesis.classification, "visuelle Sanitärhypothese");
        assert.equal(result.requiredVerification[0], "Betroffene Komponente, Lage und sichtbare Feuchteausdehnung dokumentieren.");
    }
);

console.log("ExpertIntelligenceReasoningRenderer tests completed successfully.");