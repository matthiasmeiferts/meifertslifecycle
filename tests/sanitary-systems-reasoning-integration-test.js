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

function analyzeAsSanitary(input) {
    const originalResolve = KnowledgeDomainRouter.resolve;

    KnowledgeDomainRouter.resolve = () => ["sanitary-systems"];

    try {
        return ExpertReasoningEngine.analyze(input);
    } finally {
        KnowledgeDomainRouter.resolve = originalResolve;
    }
}

runTest(
    "sanitary finding selects sanitary provider when routed",
    () => {
        const input = {
            finding: {
                category: "sanitary",
                location: "wash basin",
                description: "Visible leakage at wash basin trap with dripping from sanitary fitting."
            }
        };
        const result = analyzeAsSanitary(input);

        assertHasCause(result, "visible leakage around sanitary component");
        assertReasoningContract(result);
    }
);

runTest(
    "damaged fixture finding reaches sanitary provider",
    () => {
        const result = analyzeAsSanitary({
            finding: {
                category: "sanitary",
                location: "toilet",
                description: "Damaged toilet and loose fixture at sanitary connection."
            }
        });

        assertHasCause(result, "damaged or loose sanitary fixture");
    }
);

runTest(
    "blocked drain finding reaches sanitary provider",
    () => {
        const result = analyzeAsSanitary({
            finding: {
                category: "sanitary",
                location: "floor drain",
                description: "Blocked drain with slow drainage and water backing up."
            }
        });

        assertHasCause(result, "possible drainage restriction indicator");
    }
);

runTest(
    "odour finding reaches sanitary provider",
    () => {
        const result = analyzeAsSanitary({
            finding: {
                category: "sanitary",
                location: "floor drain",
                description: "Unpleasant odour at floor drain and trap odour near shower."
            }
        });

        assertHasCause(result, "unpleasant odour near sanitary drainage component");
    }
);

runTest(
    "missing seal finding reaches sanitary provider",
    () => {
        const result = analyzeAsSanitary({
            finding: {
                category: "sanitary",
                location: "toilet connection",
                description: "Missing seal and damaged seal at toilet connection."
            }
        });

        assertHasCause(result, "missing or damaged sanitary seal");
    }
);

runTest(
    "unsupported pipe finding reaches sanitary provider",
    () => {
        const result = analyzeAsSanitary({
            finding: {
                category: "sanitary",
                location: "drain pipe",
                description: "Unsupported pipe with poor support and damaged pipe insulation."
            }
        });

        assertHasCause(result, "poor support or protection of sanitary pipework");
    }
);

runTest(
    "unrelated finding does not select sanitary provider through current router",
    () => {
        const input = {
            finding: {
                category: "document",
                location: "tenant file",
                description: "Water bill and drinking water discussion without visible sanitary defect."
            }
        };
        const domains = KnowledgeDomainRouter.resolve(input);

        assert.equal(domains.includes("sanitary-systems"), false);
    }
);

runTest(
    "output remains deterministic and input remains unchanged",
    () => {
        const input = {
            finding: {
                category: "sanitary",
                location: "wash basin",
                description: "Visible leakage, water staining, and missing seal at wash basin trap.",
                observations: ["slow drainage at sink"]
            },
            building: {
                sanitarySystemType: "domestic sanitary installation"
            },
            measurements: [
                {
                    type: "visual observation",
                    value: "leakage at trap and moisture around fixture",
                    location: "wash basin trap"
                }
            ]
        };
        const original = structuredClone(input);

        assert.deepStrictEqual(analyzeAsSanitary(input), analyzeAsSanitary(structuredClone(input)));
        assert.deepStrictEqual(input, original);
    }
);

runTest(
    "public reasoning contract remains unchanged",
    () => {
        const result = analyzeAsSanitary({
            finding: {
                category: "sanitary",
                location: "wash basin trap",
                description: "Visible leakage at wash basin trap."
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

console.log("SanitarySystems reasoning integration tests completed successfully.");