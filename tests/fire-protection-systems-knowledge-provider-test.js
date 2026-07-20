import assert from "node:assert/strict";
import FireProtectionSystemsKnowledgeProvider from "../portal/core/knowledge/FireProtectionSystemsKnowledgeProvider.js";
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
    return FireProtectionSystemsKnowledgeProvider.getKnowledge({
        finding: {
            category: "fire protection",
            location: "fire protection equipment",
            description,
            observations: []
        },
        building: {
            fireProtectionSystemType: "mixed active and passive fire protection"
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
    return /legal|regulatory|code violation|compliance|non-compliance|certification|approval|system failure|confirmed failure|repair required|replacement required|must be repaired|must be replaced/i;
}

function assertHasCause(result, cause) {
    assert.equal(result.domain, "fire-protection-systems");
    assert.ok(causes(result).includes(cause), `Expected cause ${cause} in ${causes(result).join(", ")}`);
}

runTest(
    "stable empty contract for empty input",
    () => {
        assert.deepStrictEqual(FireProtectionSystemsKnowledgeProvider.getKnowledge(), {
            domain: "fire-protection-systems",
            hypotheses: []
        });
        assert.deepStrictEqual(FireProtectionSystemsKnowledgeProvider.getKnowledge({}), {
            domain: "fire-protection-systems",
            hypotheses: []
        });
    }
);

runTest(
    "irrelevant input returns empty contract",
    () => {
        const result = FireProtectionSystemsKnowledgeProvider.getKnowledge({
            finding: {
                category: "interior",
                location: "lobby",
                description: "General discussion about fire insurance text without observed fire protection component defect."
            }
        });

        assert.deepStrictEqual(result, {
            domain: "fire-protection-systems",
            hypotheses: []
        });
    }
);

runTest(
    "metadata-only fire protection input returns empty contract",
    () => {
        const result = FireProtectionSystemsKnowledgeProvider.getKnowledge({
            building: {
                fireProtectionSystemType: "sprinkler and alarm system",
                fireAlarmSystemType: "addressable",
                maintenanceStatus: "unknown"
            }
        });

        assert.deepStrictEqual(result, {
            domain: "fire-protection-systems",
            hypotheses: []
        });
    }
);

runTest(
    "portable fire equipment context is recognized conservatively",
    () => {
        const result = getKnowledge("Damaged fire extinguisher and obstructed extinguisher cabinet with missing extinguisher sign.");

        assertHasCause(result, "damaged or obstructed portable fire protection equipment");
        assert.equal(ids(result)[0], "damaged-or-obstructed-portable-fire-equipment");
        assert.equal(/confirmed fire safety failure|system is unsafe|immediate replacement required/i.test(allHypothesisText(result)), false);
    }
);

runTest(
    "risk relevance source version is emitted without safety legal or escalation fields",
    () => {
        const result = getKnowledge("Damaged fire door, painted sprinkler head, blocked escape route, and unsealed penetration.");
        const forbiddenFields = [
            "immediateDanger",
            "evacuationRequired",
            "occupancyRestriction",
            "authorityNotification",
            "operationalShutdown",
            "legalAssessment",
            "complianceDecision",
            "diagnosis",
            "decision"
        ];

        assert.ok(result.hypotheses.length > 0);
        result.hypotheses.forEach((hypothesis) => {
            assert.equal(typeof hypothesis.riskRelevance, "string");
            assert.equal(hypothesis.riskRelevanceVersion, RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION);
            forbiddenFields.forEach((field) => {
                assert.equal(Object.hasOwn(hypothesis, field), false);
            });
        });
    }
);

runTest(
    "sprinkler component context is recognized",
    () => {
        const result = getKnowledge("Painted sprinkler head with displaced sprinkler head and leaking sprinkler pipe.");

        assertHasCause(result, "visible condition affecting sprinkler component");
        assert.equal(/sprinkler testing|system has failed|fire protection is ineffective/i.test(allHypothesisText(result)), false);
    }
);

runTest(
    "detection and alarm component context is recognized",
    () => {
        const result = getKnowledge("Damaged smoke detector and manual call point missing cover near fire alarm panel.");

        assertHasCause(result, "visible condition affecting fire detection or alarm component");
        assert.equal(/detector functionality|alarm testing|system has failed/i.test(allHypothesisText(result)), false);
    }
);

runTest(
    "fire door context is recognized without compliance conclusion",
    () => {
        const result = getKnowledge("Damaged fire door with damaged closer and damaged fire door seal.");

        assertHasCause(result, "visible condition affecting fire or smoke control door");
        assert.equal(/confirmed non-compliance|code violation|legally defective/i.test(allHypothesisText(result)), false);
    }
);

runTest(
    "escape route and emergency wayfinding context is recognized",
    () => {
        const result = getKnowledge("Blocked escape route with missing exit sign and damaged emergency lighting.");

        assertHasCause(result, "escape route or emergency wayfinding obstruction");
        assert.equal(/evacuation is not possible|evacuation certification/i.test(allHypothesisText(result)), false);
    }
);

runTest(
    "compartmentation and penetration seal context is recognized",
    () => {
        const result = getKnowledge("Unsealed penetration and missing penetration seal at fire compartment wall.");

        assertHasCause(result, "visible fire compartmentation or penetration seal condition");
    }
);

runTest(
    "fire damper context is recognized without function conclusion",
    () => {
        const result = getKnowledge("Damaged fire damper with obstructed access and loose fire damper component.");

        assertHasCause(result, "visible condition affecting fire or smoke damper");
        assert.equal(/system has failed|fire protection is ineffective/i.test(allHypothesisText(result)), false);
    }
);

runTest(
    "corrosion and deterioration context is recognized",
    () => {
        const result = getKnowledge("Corroded fire protection component with missing cover and visible deterioration.");

        assertHasCause(result, "visible corrosion or deterioration of fire protection component");
    }
);

runTest(
    "false-positive certification and maintenance context remains empty",
    () => {
        const result = getKnowledge("Functional certification, maintenance validity, and legal compliance text without observed condition.");

        assert.equal(result.hypotheses.length, 0);
    }
);

runTest(
    "false-positive fire discussion remains empty",
    () => {
        const result = FireProtectionSystemsKnowledgeProvider.getKnowledge({
            finding: {
                category: "document",
                location: "tenant file",
                description: "General fire brigade reference and insurance text without visible defect."
            }
        });

        assert.equal(result.hypotheses.length, 0);
    }
);

runTest(
    "false-positive fireplace context remains empty",
    () => {
        const result = FireProtectionSystemsKnowledgeProvider.getKnowledge({
            finding: {
                category: "interior",
                location: "living room",
                description: "Domestic stove and fireplace product catalogue without defect."
            }
        });

        assert.equal(result.hypotheses.length, 0);
    }
);

runTest(
    "measurements can contribute text without invented test results",
    () => {
        const result = FireProtectionSystemsKnowledgeProvider.getKnowledge({
            finding: {
                category: "fire protection",
                location: "corridor",
                description: "Visible damage at fire protection equipment."
            },
            measurements: [
                {
                    type: "visual observation",
                    value: "painted sprinkler head and displaced sprinkler head",
                    location: "corridor sprinkler head"
                }
            ]
        });

        assertHasCause(result, "visible condition affecting sprinkler component");
        assert.equal(/pressure test|alarm test|sprinkler test|certification valid|flow rate measured/i.test(allHypothesisText(result)), false);
    }
);

runTest(
    "stable public provider contract",
    () => {
        const result = getKnowledge("Damaged fire extinguisher with obstructed access.");

        assert.equal(result.domain, "fire-protection-systems");
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
                "riskRelevanceVersion",
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
                category: "fire protection",
                location: "corridor",
                description: "Damaged fire door, missing exit sign, and unsealed penetration at fire compartment wall."
            }
        };

        const first = FireProtectionSystemsKnowledgeProvider.getKnowledge(input);
        const second = FireProtectionSystemsKnowledgeProvider.getKnowledge(input);

        assert.deepStrictEqual(first, second);
        assert.deepStrictEqual(ids(first).slice(0, 3), [
            "fire-door-or-smoke-control-door-visible-condition",
            "escape-route-or-emergency-wayfinding-obstruction",
            "fire-compartmentation-or-penetration-seal-condition"
        ]);
    }
);

runTest(
    "input immutability",
    () => {
        const input = {
            finding: {
                category: "fire protection",
                location: "escape route",
                description: "Blocked escape route and missing exit sign."
            },
            building: {
                fireProtectionSystemType: "mixed active and passive fire protection"
            },
            measurements: [
                {
                    type: "visual observation",
                    value: "obstructed escape route",
                    location: "corridor"
                }
            ]
        };
        const before = JSON.stringify(input);

        FireProtectionSystemsKnowledgeProvider.getKnowledge(input);

        assert.equal(JSON.stringify(input), before);
    }
);

runTest(
    "fresh arrays are returned on each call",
    () => {
        const first = getKnowledge("Damaged fire extinguisher with obstructed access.");
        const second = getKnowledge("Damaged fire extinguisher with obstructed access.");

        assert.notEqual(first.hypotheses, second.hypotheses);
        assert.notEqual(first.hypotheses[0].supportingIndicators, second.hypotheses[0].supportingIndicators);
    }
);

runTest(
    "no prohibited diagnostic compliance or mandate language",
    () => {
        const result = getKnowledge("Damaged fire door, painted sprinkler head, blocked escape route, and unsealed penetration.");
        const text = allHypothesisText(result);

        assert.equal(/confirmed fire safety failure|confirmed non-compliance|code violation|system is unsafe|fire protection is ineffective|immediate replacement required|evacuation is not possible|system has failed|legally defective|replacement required|repair required/i.test(text), false);
        assert.equal(prohibitedCategoryPattern().test(text), false);
    }
);

runTest(
    "hypothesis wording remains cautious and verification oriented",
    () => {
        const result = getKnowledge("Damaged fire door and painted sprinkler head.");
        const text = allHypothesisText(result);

        assert.equal(/may indicate|possible|visually|visual inspection alone|further specialist inspection may be appropriate|may be impaired|may affect intended performance/i.test(text), true);
    }
);

runTest(
    "no duplicate hypothesis ids",
    () => {
        const result = getKnowledge("Damaged fire extinguisher, painted sprinkler head, damaged smoke detector, damaged fire door, and unsealed penetration.");

        assert.equal(new Set(ids(result)).size, ids(result).length);
    }
);

console.log("FireProtectionSystemsKnowledgeProvider tests completed successfully.");
