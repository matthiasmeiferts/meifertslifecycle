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
        result.primaryHypothesis.cause,
        ...result.alternativeHypotheses.map((hypothesis) => hypothesis.cause)
    ];
}

function allReasoningText(result) {
    return [
        result.primaryHypothesis.cause,
        result.primaryHypothesis.rationale,
        ...result.alternativeHypotheses.map((hypothesis) => `${hypothesis.cause} ${hypothesis.rationale}`),
        ...result.supportingEvidence,
        ...result.missingEvidence,
        ...result.requiredVerification,
        ...result.potentialConsequences
    ].join(" ");
}

function prohibitedCategoryPattern() {
    return /legal|regulatory|code violation|compliance|non-compliance|certification|approval|operational failure|safety failure|confirmed lift failure|confirmed safety failure|elevator is unsafe|escalator is unsafe|system is non-compliant|certification is invalid|immediate shutdown required|repair is required|replacement is required|continued operation is prohibited|system has failed|repair required|replacement required|must be repaired|must be replaced|safe-use guarantee/i;
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
}

function assertMappedReasoningContract(result) {
    assertReasoningContract(result);
    assert.equal(result.primaryHypothesis.status, "hypothesis");
    assert.equal(typeof result.primaryHypothesis.riskRelevance, "string");
    assert.equal(typeof result.primaryHypothesis.capexRelevance, "string");
    assert.equal(typeof result.primaryHypothesis.valuationRelevance, "string");
}

function analyzeAsVerticalTransportation(input) {
    const originalResolve = KnowledgeDomainRouter.resolve;

    KnowledgeDomainRouter.resolve = () => ["vertical-transportation-systems"];

    try {
        return ExpertReasoningEngine.analyze(input);
    } finally {
        KnowledgeDomainRouter.resolve = originalResolve;
    }
}

runTest(
    "vertical transportation finding selects provider when routed",
    () => {
        const result = analyzeAsVerticalTransportation({
            finding: {
                category: "vertical transportation",
                location: "elevator landing door",
                description: "Damaged elevator landing door with damaged door sill and uneven alignment."
            }
        });

        assertHasCause(result, "visible condition affecting lift entrance or door component");
    assertMappedReasoningContract(result);
    }
);

runTest(
    "escalator finding reaches vertical transportation provider",
    () => {
        const result = analyzeAsVerticalTransportation({
            finding: {
                category: "vertical transportation",
                location: "escalator",
                description: "Escalator step damaged with escalator comb plate damaged and damaged escalator handrail."
            }
        });

        assertHasCause(result, "visible condition affecting escalator or moving walkway component");
    }
);

runTest(
    "hydraulic leakage finding reaches vertical transportation provider",
    () => {
        const result = analyzeAsVerticalTransportation({
            finding: {
                category: "vertical transportation",
                location: "lift machinery",
                description: "Hydraulic oil leakage and staining at lift pit near lift machinery."
            }
        });

        assertHasCause(result, "visible leakage or contamination near lift pit shaft or machinery");
    }
);

runTest(
    "empty provider result falls back without changing public contract",
    () => {
        const result = analyzeAsVerticalTransportation({
            finding: {
                category: "document",
                location: "tenant file",
                description: "Maintenance schedule without observed lift or escalator condition."
            }
        });

        assertReasoningContract(result);
        assert.equal(result.primaryHypothesis.category, "general");
    }
);

runTest(
    "output remains deterministic and input remains unchanged",
    () => {
        const input = {
            finding: {
                category: "vertical transportation",
                location: "lift landing",
                description: "Damaged elevator landing door, damaged call button, and hydraulic oil leakage.",
                observations: ["staining at lift pit"]
            },
            building: {
                verticalTransportationSystemType: "passenger elevator"
            },
            measurements: [
                {
                    type: "visual observation",
                    value: "damaged landing door and damaged call button",
                    location: "lift landing"
                }
            ]
        };
        const original = structuredClone(input);

        assert.deepStrictEqual(analyzeAsVerticalTransportation(input), analyzeAsVerticalTransportation(structuredClone(input)));
        assert.deepStrictEqual(input, original);
    }
);

runTest(
    "public reasoning contract remains unchanged",
    () => {
        const result = analyzeAsVerticalTransportation({
            finding: {
                category: "vertical transportation",
                location: "landing call button",
                description: "Landing call button damaged with floor indicator damaged."
            }
        });

    assertMappedReasoningContract(result);
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
);

runTest(
    "mapped reasoning remains conservative",
    () => {
        const result = analyzeAsVerticalTransportation({
            finding: {
                category: "vertical transportation",
                location: "lift landing and escalator",
                description: "Damaged elevator landing door, hydraulic oil leakage, damaged call button, and damaged escalator handrail."
            }
        });

        assert.equal(prohibitedCategoryPattern().test(allReasoningText(result)), false);
    }
);

runTest(
    "existing single-provider behaviour remains unchanged",
    () => {
        const input = {
            finding: {
                category: "electrical",
                location: "switch",
                description: "damaged switch with loose switch component"
            }
        };
        const domains = KnowledgeDomainRouter.resolve(input);
        const result = ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(domains, ["electrical-systems"]);
        assertHasCause(result, "damaged socket or switch component");
    }
);

runTest(
    "no multi-domain aggregation is introduced",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "vertical transportation",
                location: "elevator landing door and lift control panel",
                description: "Damaged elevator landing door and lift control panel damaged."
            }
        });

        assertReasoningContract(result);
        assert.equal(Object.hasOwn(result, "domainResults"), false);
        assert.equal(Object.hasOwn(result, "aggregatedHypotheses"), false);
    }
);

console.log("VerticalTransportationSystems reasoning integration tests completed successfully.");