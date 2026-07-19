import assert from "node:assert/strict";
import VerticalTransportationSystemsKnowledgeProvider from "../portal/core/knowledge/VerticalTransportationSystemsKnowledgeProvider.js";

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
    return VerticalTransportationSystemsKnowledgeProvider.getKnowledge({
        finding: {
            category: "vertical transportation",
            location: "lift landing",
            description,
            observations: []
        },
        building: {
            verticalTransportationSystemType: "elevator and escalator"
        },
        measurements: [],
        ...overrides
    });
}

function ids(result) {
    return result.hypotheses.map((hypothesis) => hypothesis.id);
}

function causes(result) {
    return result.hypotheses.map((hypothesis) => hypothesis.cause);
}

function allHypothesisText(result) {
    return result.hypotheses.flatMap((hypothesis) => [
        hypothesis.id,
        hypothesis.cause,
        hypothesis.classification,
        ...hypothesis.supportingIndicators,
        ...hypothesis.contradictingIndicators,
        ...hypothesis.requiredVerification,
        ...hypothesis.potentialConsequences,
        ...hypothesis.recommendedActions,
        hypothesis.riskRelevance,
        hypothesis.capexRelevance,
        hypothesis.valuationRelevance
    ]).join(" ");
}

function prohibitedCategoryPattern() {
    return /legal|regulatory|code violation|compliance|non-compliance|certification|approval|operational failure|safety failure|confirmed lift failure|confirmed safety failure|elevator is unsafe|escalator is unsafe|system is non-compliant|certification is invalid|immediate shutdown required|repair is required|replacement is required|continued operation is prohibited|system has failed|repair required|replacement required|must be repaired|must be replaced|safe-use guarantee/i;
}

function assertHasCause(result, cause) {
    assert.equal(result.domain, "vertical-transportation-systems");
    assert.ok(causes(result).includes(cause), `Expected cause ${cause} in ${causes(result).join(", ")}`);
}

runTest(
    "stable empty contract for empty input",
    () => {
        assert.deepStrictEqual(VerticalTransportationSystemsKnowledgeProvider.getKnowledge(), {
            domain: "vertical-transportation-systems",
            hypotheses: []
        });
        assert.deepStrictEqual(VerticalTransportationSystemsKnowledgeProvider.getKnowledge({}), {
            domain: "vertical-transportation-systems",
            hypotheses: []
        });
    }
);

runTest(
    "irrelevant input returns empty contract",
    () => {
        const result = VerticalTransportationSystemsKnowledgeProvider.getKnowledge({
            finding: {
                category: "interior",
                location: "lobby",
                description: "General building floor reference without elevator lift escalator or moving walkway component condition."
            }
        });

        assert.deepStrictEqual(result, {
            domain: "vertical-transportation-systems",
            hypotheses: []
        });
    }
);

runTest(
    "metadata-only vertical transportation input returns empty contract",
    () => {
        const result = VerticalTransportationSystemsKnowledgeProvider.getKnowledge({
            building: {
                verticalTransportationSystemType: "passenger elevator",
                elevatorType: "traction"
            }
        });

        assert.deepStrictEqual(result, {
            domain: "vertical-transportation-systems",
            hypotheses: []
        });
    }
);

runTest(
    "lift door and entrance context is recognized",
    () => {
        const result = getKnowledge("Damaged elevator landing door with damaged door sill and uneven alignment at lift entrance.");

        assertHasCause(result, "visible condition affecting lift entrance or door component");
        assert.equal(ids(result)[0], "lift-door-entrance-visible-condition");
    }
);

runTest(
    "lift car and cabin visible damage is recognized",
    () => {
        const result = getKnowledge("Elevator cabin damaged with damaged lift car panel and loose cabin panel.");

        assertHasCause(result, "visible damage or deterioration inside lift car or cabin");
    }
);

runTest(
    "lift pit shaft and machinery leakage is recognized",
    () => {
        const result = getKnowledge("Hydraulic oil leakage and staining at lift pit with debris in lift pit near lift machinery.");

        assertHasCause(result, "visible leakage or contamination near lift pit shaft or machinery");
    }
);

runTest(
    "lift machinery and control panel context is recognized",
    () => {
        const result = getKnowledge("Lift control panel damaged with missing access cover and corroded lift machinery in machine room.");

        assertHasCause(result, "visible condition affecting lift machinery or control panel");
    }
);

runTest(
    "controls indicators and communication context is recognized",
    () => {
        const result = getKnowledge("Landing call button damaged with floor indicator damaged and emergency communication unit damaged.");

        assertHasCause(result, "visible condition affecting lift controls indicators or communication unit");
    }
);

runTest(
    "platform wheelchair stair goods and freight lift context is recognized",
    () => {
        const result = getKnowledge("Platform lift damaged with wheelchair lift missing cover and stair lift loose component.");

        assertHasCause(result, "visible condition affecting platform wheelchair or stair lift");
    }
);

runTest(
    "escalator and moving walkway context is recognized",
    () => {
        const result = getKnowledge("Escalator step damaged with escalator comb plate damaged and moving walkway belt damaged.");

        assertHasCause(result, "visible condition affecting escalator or moving walkway component");
    }
);

runTest(
    "vertical transportation handrail threshold and seal context is recognized",
    () => {
        const result = getKnowledge("Damaged escalator handrail with damaged lift threshold and damaged elevator seal.");

        assertHasCause(result, "visible condition affecting vertical transportation handrail threshold or seal");
    }
);

runTest(
    "false-positive records and test context remains empty",
    () => {
        const result = getKnowledge("Maintenance schedule, inspection record, load test, brake test, and functional acceptance text without observed condition.");

        assert.equal(result.hypotheses.length, 0);
    }
);

runTest(
    "false-positive lifting equipment context remains empty",
    () => {
        const result = VerticalTransportationSystemsKnowledgeProvider.getKnowledge({
            finding: {
                category: "site equipment",
                location: "yard",
                description: "Construction crane, forklift, vehicle lift, car jack, and warehouse lifting equipment noted without building lift condition."
            }
        });

        assert.equal(result.hypotheses.length, 0);
    }
);

runTest(
    "false-positive advertisement and brochure context remains empty",
    () => {
        const result = VerticalTransportationSystemsKnowledgeProvider.getKnowledge({
            finding: {
                category: "marketing",
                location: "brochure",
                description: "Lift advertisement and manufacturer brochure with model name only."
            }
        });

        assert.equal(result.hypotheses.length, 0);
    }
);

runTest(
    "ordinary stairs without lift or escalator evidence remain empty",
    () => {
        const result = VerticalTransportationSystemsKnowledgeProvider.getKnowledge({
            finding: {
                category: "stairs",
                location: "stairwell",
                description: "Ordinary stair handrail damaged without stair lift or escalator evidence."
            }
        });

        assert.equal(result.hypotheses.length, 0);
    }
);

runTest(
    "measurements can contribute text without invented test results",
    () => {
        const result = VerticalTransportationSystemsKnowledgeProvider.getKnowledge({
            finding: {
                category: "vertical transportation",
                location: "lift landing",
                description: "Visible damage at elevator equipment."
            },
            measurements: [
                {
                    type: "visual observation",
                    value: "damaged landing call button and floor indicator damaged",
                    location: "lift landing"
                }
            ]
        });

        assertHasCause(result, "visible condition affecting lift controls indicators or communication unit");
        assert.equal(/load test|brake test|door force test|electrical test|hydraulic pressure test/i.test(allHypothesisText(result)), false);
    }
);

runTest(
    "stable public provider contract",
    () => {
        const result = getKnowledge("Damaged elevator landing door with damaged door sill.");

        assert.equal(result.domain, "vertical-transportation-systems");
        assert.ok(Array.isArray(result.hypotheses));
        assert.ok(result.hypotheses.length > 0);

        result.hypotheses.forEach((hypothesis) => {
            assert.deepStrictEqual(Object.keys(hypothesis), [
                "id",
                "cause",
                "classification",
                "supportingIndicators",
                "contradictingIndicators",
                "requiredVerification",
                "potentialConsequences",
                "recommendedActions",
                "riskRelevance",
                "capexRelevance",
                "valuationRelevance"
            ]);
            assert.equal(typeof hypothesis.id, "string");
            assert.equal(typeof hypothesis.cause, "string");
            assert.ok(Array.isArray(hypothesis.supportingIndicators));
            assert.ok(Array.isArray(hypothesis.contradictingIndicators));
            assert.ok(Array.isArray(hypothesis.requiredVerification));
            assert.ok(Array.isArray(hypothesis.potentialConsequences));
            assert.ok(Array.isArray(hypothesis.recommendedActions));
        });
    }
);

runTest(
    "deterministic output and stable hypothesis order",
    () => {
        const input = {
            finding: {
                category: "vertical transportation",
                location: "lift landing",
                description: "Damaged elevator landing door, hydraulic oil leakage, and damaged call button."
            }
        };

        const first = VerticalTransportationSystemsKnowledgeProvider.getKnowledge(input);
        const second = VerticalTransportationSystemsKnowledgeProvider.getKnowledge(input);

        assert.deepStrictEqual(first, second);
        assert.deepStrictEqual(ids(first).slice(0, 3), [
            "lift-door-entrance-visible-condition",
            "lift-pit-shaft-or-machinery-leakage",
            "lift-controls-indicators-or-communication-condition"
        ]);
    }
);

runTest(
    "input immutability",
    () => {
        const input = {
            finding: {
                category: "vertical transportation",
                location: "lift pit",
                description: "Hydraulic oil leakage and staining at lift pit."
            },
            building: {
                verticalTransportationSystemType: "hydraulic lift"
            },
            measurements: [
                {
                    type: "visual observation",
                    value: "staining at lift pit",
                    location: "lift pit"
                }
            ]
        };
        const before = JSON.stringify(input);

        VerticalTransportationSystemsKnowledgeProvider.getKnowledge(input);

        assert.equal(JSON.stringify(input), before);
    }
);

runTest(
    "fresh arrays are returned on each call",
    () => {
        const first = getKnowledge("Damaged elevator landing door with damaged door sill.");
        const second = getKnowledge("Damaged elevator landing door with damaged door sill.");

        assert.notEqual(first.hypotheses, second.hypotheses);
        assert.notEqual(first.hypotheses[0].supportingIndicators, second.hypotheses[0].supportingIndicators);
    }
);

runTest(
    "no prohibited diagnostic status or mandate language",
    () => {
        const result = getKnowledge("Damaged elevator landing door, hydraulic oil leakage, damaged call button, and damaged escalator handrail.");
        const text = allHypothesisText(result);

        assert.equal(prohibitedCategoryPattern().test(text), false);
    }
);

runTest(
    "hypothesis wording remains cautious and verification oriented",
    () => {
        const result = getKnowledge("Damaged elevator landing door and damaged escalator handrail.");
        const text = allHypothesisText(result);

        assert.equal(/may indicate|possible|visually observed|visual inspection alone|further specialist inspection may be appropriate|may be impaired|may affect intended performance|further technical assessment may be appropriate/i.test(text), true);
    }
);

runTest(
    "no duplicate hypothesis ids",
    () => {
        const result = getKnowledge("Damaged elevator landing door, hydraulic oil leakage, damaged call button, damaged escalator step, and damaged escalator handrail.");

        assert.equal(new Set(ids(result)).size, ids(result).length);
    }
);

console.log("VerticalTransportationSystemsKnowledgeProvider tests completed successfully.");