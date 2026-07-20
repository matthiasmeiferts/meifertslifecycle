import assert from "node:assert/strict";

import ExpertReasoningEngine from "../portal/core/ExpertReasoningEngine.js";
import KnowledgeDomainRouter from "../portal/core/reasoning/KnowledgeDomainRouter.js";

function runTest(name, fn) {
    try {
        fn();
        console.log(`✓ ${name}`);
    } catch (error) {
        console.error(`✗ ${name}`);
        throw error;
    }
}

function allCauses(result) {
    return [
        result.primaryHypothesis?.cause,
        ...result.alternativeHypotheses.map((hypothesis) => hypothesis.cause)
    ];
}

function assertHasCause(result, cause) {
    assert.ok(allCauses(result).includes(cause), `Expected cause: ${cause}`);
}

function assertReasoningContract(result) {
    assert.ok(result.primaryHypothesis);
    assert.ok(Array.isArray(result.alternativeHypotheses));
    assert.ok(Array.isArray(result.supportingEvidence));
    assert.ok(Array.isArray(result.missingEvidence));
    assert.ok(Array.isArray(result.requiredVerification));
    assert.ok(Array.isArray(result.potentialConsequences));
    assert.equal(typeof result.confidence, "number");
    assert.equal(result.primaryHypothesis.status, "hypothesis");
    assert.equal(Object.hasOwn(result, "severity"), false);
    assert.deepStrictEqual(Object.keys(result), [
        "primaryHypothesis",
        "alternativeHypotheses",
        "supportingEvidence",
        "missingEvidence",
        "requiredVerification",
        "potentialConsequences",
        "confidence"
    ]);
}

function assertPublicContractKeys(result) {
    assert.deepStrictEqual(Object.keys(result), [
        "primaryHypothesis",
        "alternativeHypotheses",
        "supportingEvidence",
        "missingEvidence",
        "requiredVerification",
        "potentialConsequences",
        "confidence"
    ]);
    assert.equal(Object.hasOwn(result, "severity"), false);
}

runTest(
    "structural finding selects structural-systems provider",
    () => {
        const input = {
            finding: {
                category: "structural",
                location: "load-bearing wall",
                description: "Removed load-bearing wall with structural opening and missing structural approval"
            }
        };
        const domains = KnowledgeDomainRouter.resolve(input);
        const result = ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(domains, ["structural-systems", "crack"]);
        assertHasCause(result, "possible structural alteration");
        assertReasoningContract(result);
    }
);

runTest(
    "first-success structural wins against crack",
    () => {
        const input = {
            finding: {
                category: "crack",
                location: "foundation wall",
                description: "Differential settlement with diagonal crack and foundation movement"
            },
            measurements: [{ type: "level survey", value: "differential level change" }]
        };
        const domains = KnowledgeDomainRouter.resolve(input);
        const result = ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(domains, ["structural-systems", "basement-waterproofing", "crack"]);
        assertHasCause(result, "possible settlement-related movement");
        assert.equal(result.primaryHypothesis.cause.includes("crack"), false);
    }
);

runTest(
    "first-success structural wins against concrete-corrosion when structural relevance is explicit",
    () => {
        const input = {
            finding: {
                category: "corrosion",
                location: "damaged column",
                description: "Structural corrosion with section loss, exposed reinforcement, rust staining, and spalling at damaged column"
            }
        };
        const domains = KnowledgeDomainRouter.resolve(input);
        const result = ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(domains, ["structural-systems", "concrete-corrosion"]);
        assertHasCause(result, "possible structural section loss");
    }
);

runTest(
    "non-structural concrete corrosion remains concrete-corrosion",
    () => {
        const input = {
            finding: {
                category: "corrosion",
                location: "concrete surface",
                description: "spalling with rust staining at concrete cover"
            }
        };

        assert.deepStrictEqual(KnowledgeDomainRouter.resolve(input), ["concrete-corrosion"]);
        assertHasCause(ExpertReasoningEngine.analyze(input), "reinforcement corrosion");
    }
);

runTest(
    "basement moisture without deformation remains existing domain",
    () => {
        const input = {
            finding: {
                category: "moisture",
                location: "basement wall",
                description: "wet crack and seepage at retaining wall without deformation"
            }
        };

        assert.deepStrictEqual(KnowledgeDomainRouter.resolve(input), ["basement-waterproofing", "moisture", "crack"]);
    }
);

runTest(
    "generic crack remains crack and does not aggregate",
    () => {
        const input = {
            finding: {
                category: "crack",
                location: "interior wall",
                description: "generic wall crack in bedroom"
            }
        };
        const result = ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(KnowledgeDomainRouter.resolve(input), ["crack"]);
        assertReasoningContract(result);
        assert.equal(Object.hasOwn(result, "candidateDomains"), false);
        assert.equal(Object.hasOwn(result, "secondaryDomains"), false);
    }
);

runTest(
    "legacy fallback remains reachable for unmapped neutral input",
    () => {
        const input = {
            finding: {
                category: "inspection",
                description: "neutral observation without mapped domain"
            }
        };
        const result = ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(KnowledgeDomainRouter.resolve(input), []);
        assert.equal(result.primaryHypothesis.id ?? null, null);
        assertPublicContractKeys(result);
    }
);

runTest(
    "deterministic output and immutable input",
    () => {
        const input = {
            finding: {
                category: "structural",
                location: "beam",
                description: "Excessive deflection and sagging beam with deflection measurement",
                observations: ["significant movement"]
            },
            measurements: [{ type: "deflection measurement", value: 25, unit: "mm" }]
        };
        const original = structuredClone(input);

        assert.deepStrictEqual(ExpertReasoningEngine.analyze(input), ExpertReasoningEngine.analyze(structuredClone(input)));
        assert.deepStrictEqual(input, original);
    }
);

console.log("StructuralSystems reasoning integration tests completed successfully.");
