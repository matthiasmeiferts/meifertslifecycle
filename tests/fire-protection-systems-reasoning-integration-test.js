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
    return /legal|regulatory|code violation|compliance|non-compliance|certification|approval|system failure|confirmed failure|repair required|replacement required|must be repaired|must be replaced/i;
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
    assert.equal(typeof result.primaryHypothesis.riskRelevance, "string");
    assert.equal(typeof result.primaryHypothesis.capexRelevance, "string");
    assert.equal(typeof result.primaryHypothesis.valuationRelevance, "string");
}

function analyzeAsFireProtection(input) {
    const originalResolve = KnowledgeDomainRouter.resolve;

    KnowledgeDomainRouter.resolve = () => ["fire-protection-systems"];

    try {
        return ExpertReasoningEngine.analyze(input);
    } finally {
        KnowledgeDomainRouter.resolve = originalResolve;
    }
}

runTest(
    "fire protection finding selects fire provider when routed",
    () => {
        const input = {
            finding: {
                category: "fire protection",
                location: "corridor sprinkler head",
                description: "Painted sprinkler head and displaced sprinkler head near fire protection equipment."
            }
        };
        const result = analyzeAsFireProtection(input);

        assertHasCause(result, "visible condition affecting sprinkler component");
        assertReasoningContract(result);
    }
);

runTest(
    "fire door finding reaches fire provider",
    () => {
        const result = analyzeAsFireProtection({
            finding: {
                category: "fire protection",
                location: "stairwell fire door",
                description: "Damaged fire door with damaged closer and missing fire door seal."
            }
        });

        assertHasCause(result, "visible condition affecting fire or smoke control door");
    }
);

runTest(
    "escape route finding reaches fire provider",
    () => {
        const result = analyzeAsFireProtection({
            finding: {
                category: "fire protection",
                location: "escape route",
                description: "Blocked escape route with missing exit sign and damaged emergency lighting."
            }
        });

        assertHasCause(result, "escape route or emergency wayfinding obstruction");
    }
);

runTest(
    "fire damper finding reaches fire provider",
    () => {
        const result = analyzeAsFireProtection({
            finding: {
                category: "fire protection",
                location: "duct riser",
                description: "Damaged fire damper with obstructed access and loose fire damper component."
            }
        });

        assertHasCause(result, "visible condition affecting fire or smoke damper");
    }
);

runTest(
    "unsupported generic fire text does not select fire provider through current router",
    () => {
        const input = {
            finding: {
                category: "document",
                location: "tenant file",
                description: "Fire insurance and fire brigade contact information without visible fire protection component defect."
            }
        };
        const domains = KnowledgeDomainRouter.resolve(input);

        assert.equal(domains.includes("fire-protection-systems"), false);
    }
);

runTest(
    "output remains deterministic and input remains unchanged",
    () => {
        const input = {
            finding: {
                category: "fire protection",
                location: "corridor",
                description: "Damaged fire door, missing exit sign, and unsealed penetration at fire compartment wall.",
                observations: ["painted sprinkler head near door"]
            },
            building: {
                fireProtectionSystemType: "mixed active and passive fire protection"
            },
            measurements: [
                {
                    type: "visual observation",
                    value: "damaged fire door and missing exit sign",
                    location: "corridor"
                }
            ]
        };
        const original = structuredClone(input);

        assert.deepStrictEqual(analyzeAsFireProtection(input), analyzeAsFireProtection(structuredClone(input)));
        assert.deepStrictEqual(input, original);
    }
);

runTest(
    "public reasoning contract remains unchanged",
    () => {
        const result = analyzeAsFireProtection({
            finding: {
                category: "fire protection",
                location: "extinguisher cabinet",
                description: "Damaged fire extinguisher with obstructed access."
            }
        });

        assertReasoningContract(result);
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
        const result = analyzeAsFireProtection({
            finding: {
                category: "fire protection",
                location: "corridor",
                description: "Damaged fire door, painted sprinkler head, blocked escape route, and unsealed penetration."
            }
        });

        assert.equal(/confirmed fire safety failure|confirmed non-compliance|code violation|system is unsafe|fire protection is ineffective|immediate replacement required|evacuation is not possible|system has failed|legally defective/i.test(allReasoningText(result)), false);
        assert.equal(prohibitedCategoryPattern().test(allReasoningText(result)), false);
    }
);

runTest(
    "existing single-provider behaviour remains unchanged",
    () => {
        const input = {
            finding: {
                category: "window",
                location: "window frame",
                description: "defective perimeter seal at frame edge"
            },
            building: {
                windowType: "casement"
            }
        };
        const domains = KnowledgeDomainRouter.resolve(input);
        const result = ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(domains, ["windows-doors"]);
        assertHasCause(result, "defective perimeter seal");
    }
);

console.log("FireProtectionSystems reasoning integration tests completed successfully.");