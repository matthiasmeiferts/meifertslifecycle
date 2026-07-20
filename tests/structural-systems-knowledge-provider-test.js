import assert from "node:assert/strict";

import StructuralSystemsKnowledgeProvider from "../portal/core/knowledge/StructuralSystemsKnowledgeProvider.js";
import { RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION } from "../portal/core/risk/RiskRelevanceGovernanceRegistry.js";

function runTest(name, fn) {
    try {
        fn();
        console.log(`✓ ${name}`);
    } catch (error) {
        console.error(`✗ ${name}`);
        throw error;
    }
}

function getKnowledge(description, overrides = {}) {
    return StructuralSystemsKnowledgeProvider.getKnowledge({
        finding: {
            category: "structural",
            location: "main structure",
            description,
            observations: []
        },
        ...overrides
    });
}

function ids(result) {
    return result.hypotheses.map((hypothesis) => hypothesis.id);
}

function allHypothesisText(result) {
    return JSON.stringify(result.hypotheses);
}

function assertHasId(result, id) {
    assert.equal(result.domain, "structural-systems");
    assert.ok(ids(result).includes(id), `Expected hypothesis ${id} in ${ids(result).join(", ")}`);
}

runTest(
    "unknown input returns stable empty contract",
    () => {
        assert.deepStrictEqual(StructuralSystemsKnowledgeProvider.getKnowledge(), {
            domain: "structural-systems",
            hypotheses: []
        });
        assert.deepStrictEqual(StructuralSystemsKnowledgeProvider.getKnowledge({}), {
            domain: "structural-systems",
            hypotheses: []
        });
    }
);

runTest(
    "strong structural signal produces stable contract",
    () => {
        const result = getKnowledge("Structural damage at load-bearing wall with structural engineer review required.");

        assert.equal(result.domain, "structural-systems");
        assert.ok(result.hypotheses.length > 0);
        assert.ok(result.hypotheses.every((hypothesis) => hypothesis.classification.includes("hypothesis") || hypothesis.classification.includes("verification")));
    }
);

runTest(
    "risk relevance version is emitted next to every structural risk relevance value",
    () => {
        const result = getKnowledge("Structural damage at load-bearing wall with excessive deflection and missing structural approval.");
        const hypothesesWithRiskRelevance = result.hypotheses.filter((hypothesis) => Object.hasOwn(hypothesis, "riskRelevance"));

        assert.ok(hypothesesWithRiskRelevance.length > 0);
        hypothesesWithRiskRelevance.forEach((hypothesis) => {
            assert.equal(hypothesis.riskRelevance, "high");
            assert.equal(hypothesis.riskRelevanceVersion, RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION);
        });
    }
);

runTest(
    "empty structural result does not receive risk relevance version metadata",
    () => {
        const result = getKnowledge("Cosmetic crack in plaster finish.");

        assert.deepStrictEqual(result, {
            domain: "structural-systems",
            hypotheses: []
        });
        assert.equal(JSON.stringify(result).includes("riskRelevanceVersion"), false);
    }
);

runTest(
    "foundation settlement creates settlement and foundation hypotheses",
    () => {
        const result = getKnowledge("Differential settlement and foundation movement with step crack at foundation wall.");

        assertHasId(result, "possible-settlement-related-movement");
        assertHasId(result, "possible-foundation-movement");
    }
);

runTest(
    "deflection with beam or slab context is recognized",
    () => {
        const result = getKnowledge("Excessive deflection and sagging beam with slab deflection measurement.");

        assertHasId(result, "possible-excessive-deflection");
    }
);

runTest(
    "removed load-bearing wall creates structural alteration hypothesis",
    () => {
        const result = getKnowledge("Removed load-bearing wall with structural opening and missing structural approval.");

        assertHasId(result, "possible-structural-alteration");
    }
);

runTest(
    "structural corrosion with load-bearing member creates section-loss hypothesis",
    () => {
        const result = getKnowledge("Structural corrosion with section loss and exposed reinforcement at damaged column.");

        assertHasId(result, "possible-structural-section-loss");
    }
);

runTest(
    "connection deterioration is recognized",
    () => {
        const result = getKnowledge("Damaged connection and anchor deterioration at structural connection support.");

        assertHasId(result, "possible-connection-deterioration");
    }
);

runTest(
    "lateral stability and roof structure hypotheses are recognized",
    () => {
        assertHasId(getKnowledge("Missing bracing with structural instability and significant misalignment."), "possible-lateral-stability-deficiency");
        assertHasId(getKnowledge("Damaged roof truss with rafter deformation and missing roof bracing."), "possible-roof-structure-distress");
    }
);

runTest(
    "fire and water structural degradation remain verification-dependent",
    () => {
        assertHasId(getKnowledge("Fire damage to structure with fire exposed beam and steel deformation after fire."), "possible-fire-related-structural-degradation");
        assertHasId(getKnowledge("Water damage to structure with rot in structural timber and moisture damage to beam."), "possible-water-related-structural-degradation");
    }
);

runTest(
    "cosmetic crack and pure moisture do not create structural hypotheses",
    () => {
        assert.equal(getKnowledge("Cosmetic crack in plaster finish.").hypotheses.length, 0);
        assert.equal(getKnowledge("Damp moisture staining and mould at basement wall.").hypotheses.length, 0);
    }
);

runTest(
    "concrete corrosion without structural relevance does not create structural hypotheses",
    () => {
        assert.equal(getKnowledge("Concrete corrosion and rust staining at surface finish without structural member context.").hypotheses.length, 0);
    }
);

runTest(
    "guardrails avoid confirmed safety or capacity statements",
    () => {
        const result = getKnowledge("Excessive deflection at load-bearing beam with structural engineer review required.");
        const text = allHypothesisText(result);

        assert.equal(/standsicherheit confirmed|structural safety confirmed|load capacity confirmed|tragfähigkeit confirmed|collapse risk confirmed|capacity is insufficient/i.test(text), false);
        assert.ok(/structural engineer review|qualified structural engineer review/i.test(text));
        assert.ok(result.hypotheses.every((hypothesis) => hypothesis.cause.startsWith("possible")));
    }
);

runTest(
    "deterministic output and immutable input",
    () => {
        const input = {
            finding: {
                category: "structural",
                location: "foundation wall",
                description: "Foundation settlement with diagonal crack and level survey",
                observations: ["step crack"]
            },
            measurements: [{ type: "crack width", value: 3, unit: "mm" }]
        };
        const original = structuredClone(input);

        assert.deepStrictEqual(StructuralSystemsKnowledgeProvider.getKnowledge(input), StructuralSystemsKnowledgeProvider.getKnowledge(structuredClone(input)));
        assert.deepStrictEqual(input, original);
    }
);

runTest(
    "no public result fields are introduced by provider contract",
    () => {
        const result = getKnowledge("Removed load-bearing wall with structural approval missing.");
        const forbiddenHypothesisFields = ["score", "priority", "severity", "criticality", "reviewPriority", "riskClass", "resultClassification"];

        assert.deepStrictEqual(Object.keys(result), ["domain", "hypotheses"]);
        assert.equal(Object.hasOwn(result, "severity"), false);
        result.hypotheses.forEach((hypothesis) => {
            forbiddenHypothesisFields.forEach((field) => {
                assert.equal(Object.hasOwn(hypothesis, field), false);
            });
        });
    }
);

console.log("StructuralSystemsKnowledgeProvider tests completed successfully.");
