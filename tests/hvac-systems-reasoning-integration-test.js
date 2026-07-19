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

runTest(
    "HVAC finding selects the HVAC provider",
    () => {
        const input = {
            finding: {
                category: "HVAC",
                location: "mechanical room",
                description: "HVAC installation defect with unsupported duct and defective bracket"
            }
        };
        const domains = KnowledgeDomainRouter.resolve(input);
        const result = ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(domains, ["hvac-systems"]);
        assertHasCause(result, "HVAC installation defect indication");
        assertReasoningContract(result);
    }
);

runTest(
    "heating-related finding reaches the HVAC provider",
    () => {
        const input = {
            finding: {
                category: "heating",
                location: "radiator",
                description: "radiator remains cold and heating pressure low"
            }
        };
        const result = ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(KnowledgeDomainRouter.resolve(input), ["hvac-systems"]);
        assertHasCause(result, "heating system pressure-related indication");
        assertHasCause(result, "local heating emitter malfunction");
    }
);

runTest(
    "ventilation-related finding reaches the HVAC provider before moisture fallback",
    () => {
        const input = {
            finding: {
                category: "ventilation",
                location: "ventilation unit",
                description: "mechanical ventilation weak airflow with clogged ventilation filter"
            }
        };
        const domains = KnowledgeDomainRouter.resolve(input);
        const result = ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(domains, ["hvac-systems", "moisture"]);
        assertHasCause(result, "ventilation airflow restriction");
        assertHasCause(result, "ventilation filter contamination");
    }
);

runTest(
    "cooling-related finding reaches the HVAC provider",
    () => {
        const input = {
            finding: {
                category: "cooling",
                location: "indoor unit",
                description: "air conditioner not cooling and cooling performance reduced"
            }
        };
        const result = ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(KnowledgeDomainRouter.resolve(input), ["hvac-systems"]);
        assertHasCause(result, "insufficient cooling performance indication");
    }
);

runTest(
    "condensate-related finding reaches the HVAC provider",
    () => {
        const input = {
            finding: {
                category: "cooling",
                location: "indoor unit",
                description: "air-conditioning unit leaking water with blocked condensate drain"
            }
        };
        const domains = KnowledgeDomainRouter.resolve(input);
        const result = ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(domains, ["hvac-systems", "moisture"]);
        assertHasCause(result, "HVAC condensate drainage defect");
        assertHasCause(result, "condensate overflow or leakage");
    }
);

runTest(
    "non-HVAC finding retains its previous provider",
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
        const result = ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(KnowledgeDomainRouter.resolve(input), ["windows-doors"]);
        assertHasCause(result, "defective perimeter seal");
    }
);

runTest(
    "unrelated text does not incorrectly select HVAC",
    () => {
        const input = {
            finding: {
                category: "inspection",
                location: "living room",
                description: "room feels warm during hot weather"
            }
        };

        assert.equal(KnowledgeDomainRouter.resolve(input).includes("hvac-systems"), false);
    }
);

runTest(
    "output remains deterministic and input remains unchanged",
    () => {
        const input = {
            finding: {
                category: "HVAC",
                location: "plant room",
                description: "ventilation fan fault, blocked condensate drain, and radiator remains cold",
                observations: ["weak airflow"]
            },
            building: {
                heatingSystemType: "radiator heating",
                ventilationSystemType: "mechanical ventilation",
                coolingSystemType: "split air-conditioning"
            },
            measurements: [
                {
                    type: "observation",
                    value: "water below indoor unit",
                    location: "office ceiling"
                }
            ]
        };
        const original = structuredClone(input);

        assert.deepStrictEqual(ExpertReasoningEngine.analyze(input), ExpertReasoningEngine.analyze(structuredClone(input)));
        assert.deepStrictEqual(input, original);
    }
);

runTest(
    "public result contract remains unchanged",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "cooling",
                location: "indoor unit",
                description: "indoor unit icing and ice on cooling coil"
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
    "existing single-provider selection remains intact",
    () => {
        const input = {
            finding: {
                category: "ventilation",
                location: "ventilation unit",
                description: "ventilation control fault and stale air despite ventilation"
            }
        };
        const domains = KnowledgeDomainRouter.resolve(input);
        const result = ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(domains, ["hvac-systems", "moisture"]);
        assertHasCause(result, "ventilation control malfunction");
        assert.equal(result.primaryHypothesis.cause.includes("moisture"), false);
    }
);

console.log("HvacSystems reasoning integration tests completed successfully.");

