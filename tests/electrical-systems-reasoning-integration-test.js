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

function analyzeAsElectrical(input) {
    const originalResolve = KnowledgeDomainRouter.resolve;

    KnowledgeDomainRouter.resolve = () => ["electrical-systems"];

    try {
        return ExpertReasoningEngine.analyze(input);
    } finally {
        KnowledgeDomainRouter.resolve = originalResolve;
    }
}

runTest(
    "electrical finding selects electrical provider when routed",
    () => {
        const input = {
            finding: {
                category: "electrical",
                location: "distribution board",
                description: "Distribution board has visible overheating marks and scorching near circuit breaker."
            }
        };
        const result = analyzeAsElectrical(input);

        assertHasCause(result, "visible thermal stress or overheating indicators");
        assertReasoningContract(result);
    }
);

runTest(
    "distribution board finding reaches electrical provider",
    () => {
        const result = analyzeAsElectrical({
            finding: {
                category: "electrical",
                location: "distribution board",
                description: "Distribution board labeling missing with unclear circuit labeling and unlabeled circuit breaker."
            }
        });

        assertHasCause(result, "unclear or missing circuit labeling");
    }
);

runTest(
    "socket finding reaches electrical provider",
    () => {
        const result = analyzeAsElectrical({
            finding: {
                category: "electrical",
                location: "socket outlet",
                description: "Damaged socket and cracked socket cover with loose socket at wall outlet."
            }
        });

        assertHasCause(result, "damaged socket or switch component");
    }
);

runTest(
    "switch finding reaches electrical provider",
    () => {
        const result = analyzeAsElectrical({
            finding: {
                category: "electrical",
                location: "switch",
                description: "Damaged switch with cracked switch cover and loose switch fixing."
            }
        });

        assertHasCause(result, "damaged socket or switch component");
    }
);

runTest(
    "exposed conductor finding reaches electrical provider",
    () => {
        const result = analyzeAsElectrical({
            finding: {
                category: "electrical",
                location: "junction box",
                description: "Junction box has exposed conductors and visible bare wire at open cable end."
            }
        });

        assertHasCause(result, "exposed or insufficiently protected conductors");
    }
);

runTest(
    "missing cover finding reaches electrical provider",
    () => {
        const result = analyzeAsElectrical({
            finding: {
                category: "electrical",
                location: "electrical panel",
                description: "Electrical panel missing cover with damaged electrical enclosure in service area."
            }
        });

        assertHasCause(result, "damaged or incomplete electrical enclosure");
    }
);

runTest(
    "unrelated finding does not select electrical provider through current router",
    () => {
        const input = {
            finding: {
                category: "interior",
                location: "living room",
                description: "Room wall paint discoloration near decorative switch style only."
            }
        };
        const domains = KnowledgeDomainRouter.resolve(input);

        assert.equal(domains.includes("electrical-systems"), false);
    }
);

runTest(
    "output remains deterministic and input remains unchanged",
    () => {
        const input = {
            finding: {
                category: "electrical",
                location: "consumer unit",
                description: "Missing cover, visible overheating marks, and exposed conductors at consumer unit.",
                observations: ["unclear circuit labeling"]
            },
            building: {
                electricalSystemType: "low-voltage building installation"
            },
            measurements: [
                {
                    type: "visual observation",
                    value: "scorch marks at electrical panel",
                    location: "distribution board"
                }
            ]
        };
        const original = structuredClone(input);

        assert.deepStrictEqual(analyzeAsElectrical(input), analyzeAsElectrical(structuredClone(input)));
        assert.deepStrictEqual(input, original);
    }
);

runTest(
    "public reasoning contract remains unchanged",
    () => {
        const result = analyzeAsElectrical({
            finding: {
                category: "electrical",
                location: "electrical panel",
                description: "Electrical panel missing cover with damaged electrical enclosure."
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

console.log("ElectricalSystems reasoning integration tests completed successfully.");
