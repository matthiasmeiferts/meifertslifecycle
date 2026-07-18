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

function allHypotheses(result) {
    return [
        result.primaryHypothesis,
        ...result.alternativeHypotheses
    ];
}

function allText(result) {
    return JSON.stringify(result);
}

function assertHasDomain(input, domain) {
    assert.ok(KnowledgeDomainRouter.resolve(input).includes(domain), `Expected domain: ${domain}`);
}

function assertNoDomain(input, domain) {
    assert.equal(KnowledgeDomainRouter.resolve(input).includes(domain), false, `Unexpected domain: ${domain}`);
}

function assertHasCause(result, cause) {
    assert.ok(allCauses(result).includes(cause), `Expected cause: ${cause}`);
}

function assertNoForbiddenConclusions(result) {
    const text = allText(result);

    assert.equal(/confirmed|diagnosed|proven|proves|definitive|certain/i.test(text), false);
    assert.equal(/roof-membrane failure|roof membrane failure|basement waterproofing failure|failed basement waterproofing|facade failure|foundation failure|structural failure|structural instability/i.test(text), false);
    assert.equal(/complete drainage-system replacement|complete drainage system replacement|replace the complete drainage system/i.test(text), false);
}

runTest(
    "blocked gutter routes to drainage-rainwater",
    () => {
        const input = {
            finding: {
                category: "drainage",
                location: "rainwater gutter",
                description: "blocked gutter with debris in gutter"
            }
        };
        const result = ExpertReasoningEngine.analyze(input);

        assertHasDomain(input, "drainage-rainwater");
        assertHasCause(result, "blocked rainwater gutter");
    }
);

runTest(
    "gutter overflow produces a drainage hypothesis without confirming insufficient capacity",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "drainage",
                location: "rainwater gutter",
                description: "gutter overflow at the rainwater gutter"
            }
        });

        assertHasCause(result, "insufficient gutter drainage");
        assert.equal(/confirmed insufficient capacity|capacity confirmed/i.test(allText(result)), false);
        assertNoForbiddenConclusions(result);
    }
);

runTest(
    "leaking gutter wetting facade preserves facade-wall-systems and moisture overlap",
    () => {
        const input = {
            finding: {
                category: "drainage",
                location: "facade gutter",
                description: "leaking gutter wetting facade with moisture staining"
            }
        };
        const result = ExpertReasoningEngine.analyze(input);
        const domains = KnowledgeDomainRouter.resolve(input);

        assert.deepStrictEqual(domains, ["drainage-rainwater", "facade-wall-systems", "moisture"]);
        assertHasCause(result, "defective rainwater gutter");
    }
);

runTest(
    "blocked downpipe routes to drainage-rainwater",
    () => {
        const input = {
            finding: {
                category: "drainage",
                location: "downpipe",
                description: "blocked downpipe with overflowing downpipe connection"
            }
        };
        const result = ExpertReasoningEngine.analyze(input);

        assertHasDomain(input, "drainage-rainwater");
        assertHasCause(result, "blocked downpipe");
    }
);

runTest(
    "defective downpipe discharging at basement wall preserves basement-waterproofing overlap",
    () => {
        const input = {
            finding: {
                category: "drainage",
                location: "basement wall",
                description: "defective downpipe discharging rainwater against basement wall"
            },
            building: {
                basementType: "full basement"
            }
        };
        const domains = KnowledgeDomainRouter.resolve(input);
        const result = ExpertReasoningEngine.analyze(input);

        assert.ok(domains.includes("basement-waterproofing"));
        assert.ok(domains.includes("drainage-rainwater"));
        assertNoForbiddenConclusions(result);
    }
);

runTest(
    "blocked roof outlet preserves roof-envelope overlap",
    () => {
        const input = {
            finding: {
                category: "roof",
                location: "roof outlet",
                description: "blocked roof outlet with ponding near roof outlet"
            }
        };
        const result = ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(KnowledgeDomainRouter.resolve(input), ["drainage-rainwater", "roof-envelope"]);
        assertHasCause(result, "blocked roof outlet");
    }
);

runTest(
    "roof ponding near outlet does not diagnose roof-membrane failure",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "roof",
                location: "roof outlet",
                description: "ponding near roof outlet"
            }
        });

        assertHasCause(result, "blocked roof outlet");
        assert.equal(/roof-membrane failure|roof membrane failure|membrane failure/i.test(allText(result)), false);
    }
);

runTest(
    "blocked emergency outlet produces emergency-drainage hypothesis",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "roof drainage",
                location: "emergency outlet",
                description: "blocked emergency outlet and emergency overflow defect"
            }
        });

        assertHasCause(result, "defective emergency drainage");
    }
);

runTest(
    "missing emergency drainage remains an indication requiring verification",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "roof drainage",
                location: "roof",
                description: "no visible emergency overflow and missing emergency drainage"
            }
        });
        const indication = allHypotheses(result).find((hypothesis) => hypothesis.cause === "missing emergency drainage indication");

        assert.ok(indication);
        assert.equal(/verification-required|indication/i.test(indication.classification), true);
    }
);

runTest(
    "blocked courtyard drain routes to drainage-rainwater",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "site drainage",
                location: "courtyard drain",
                description: "blocked courtyard drain"
            }
        });

        assertHasCause(result, "blocked courtyard drain");
    }
);

runTest(
    "blocked external gully routes to drainage-rainwater",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "external drainage",
                location: "external gully",
                description: "blocked external gully and clogged gully"
            }
        });

        assertHasCause(result, "blocked external gully");
    }
);

runTest(
    "defective drainage channel produces corresponding hypothesis",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "external drainage",
                location: "drainage channel",
                description: "defective drainage channel with damaged drainage channel grate"
            }
        });

        assertHasCause(result, "defective drainage channel");
    }
);

runTest(
    "adverse grading produces corresponding hypothesis",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "site grading",
                location: "external paving",
                description: "ground slopes toward building with adverse grading"
            }
        });

        assertHasCause(result, "adverse site grading");
    }
);

runTest(
    "water directed toward facade preserves facade-wall-systems overlap",
    () => {
        const input = {
            finding: {
                category: "site drainage",
                location: "facade",
                description: "runoff directed toward facade and water flows toward building"
            }
        };

        assert.deepStrictEqual(KnowledgeDomainRouter.resolve(input), ["drainage-rainwater", "facade-wall-systems"]);
    }
);

runTest(
    "water directed toward entrance preserves windows-doors overlap",
    () => {
        const input = {
            finding: {
                category: "site drainage",
                location: "entrance door threshold",
                description: "runoff directed toward entrance and water directed toward building"
            }
        };

        assert.deepStrictEqual(KnowledgeDomainRouter.resolve(input), ["drainage-rainwater", "windows-doors"]);
    }
);

runTest(
    "standing water around building does not automatically add moisture or basement-waterproofing",
    () => {
        const input = {
            finding: {
                category: "site drainage",
                location: "external paved area",
                description: "standing water around building"
            }
        };

        assert.deepStrictEqual(KnowledgeDomainRouter.resolve(input), ["drainage-rainwater"]);
    }
);

runTest(
    "uncontrolled discharge near foundation produces corresponding hypothesis without confirming waterproofing failure",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "drainage",
                location: "downpipe discharge",
                description: "uncontrolled discharge near foundation from rainwater downpipe"
            }
        });

        assertHasCause(result, "uncontrolled discharge near foundation");
        assertNoForbiddenConclusions(result);
    }
);

runTest(
    "blocked balcony outlet preserves balconies-terraces overlap",
    () => {
        const input = {
            finding: {
                category: "balcony",
                location: "balcony outlet",
                description: "blocked balcony outlet with overflow"
            }
        };

        assert.deepStrictEqual(KnowledgeDomainRouter.resolve(input), ["balconies-terraces", "drainage-rainwater"]);
    }
);

runTest(
    "terrace drainage leakage into occupied space preserves balconies-terraces, roof-envelope, and moisture overlap",
    () => {
        const input = {
            finding: {
                category: "terrace",
                location: "roof terrace outlet",
                description: "terrace drainage leakage into occupied space with moisture staining"
            }
        };

        assert.deepStrictEqual(KnowledgeDomainRouter.resolve(input), ["balconies-terraces", "drainage-rainwater", "roof-envelope", "moisture"]);
    }
);

runTest(
    "backwater indicator produces backwater-risk hypothesis",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "drainage",
                location: "external drain",
                description: "backwater from external building drain"
            }
        });

        assertHasCause(result, "backwater-related drainage risk");
    }
);

runTest(
    "backwater alone does not automatically add moisture",
    () => {
        const input = {
            finding: {
                category: "drainage",
                location: "external drain",
                description: "backwater from external building drain"
            }
        };

        assert.deepStrictEqual(KnowledgeDomainRouter.resolve(input), ["drainage-rainwater"]);
    }
);

runTest(
    "backwater affecting basement preserves basement-waterproofing overlap",
    () => {
        const input = {
            finding: {
                category: "drainage",
                location: "basement drain",
                description: "backwater from building drain affecting basement below-grade area"
            },
            building: {
                basementType: "full basement"
            }
        };

        assert.deepStrictEqual(KnowledgeDomainRouter.resolve(input), ["basement-waterproofing", "drainage-rainwater"]);
    }
);

runTest(
    "corroded gutter does not trigger concrete-corrosion",
    () => {
        const input = {
            finding: {
                category: "drainage",
                location: "gutter",
                description: "corroded gutter at rainwater gutter"
            }
        };

        assertHasDomain(input, "drainage-rainwater");
        assertNoDomain(input, "concrete-corrosion");
    }
);

runTest(
    "cracked downpipe does not automatically trigger crack",
    () => {
        const input = {
            finding: {
                category: "drainage",
                location: "downpipe",
                description: "cracked rainwater downpipe"
            }
        };

        assertHasDomain(input, "drainage-rainwater");
        assertNoDomain(input, "crack");
    }
);

runTest(
    "maintenance-related drainage defect produces corresponding hypothesis",
    () => {
        assertHasCause(ExpertReasoningEngine.analyze({
            finding: {
                category: "drainage",
                location: "gutter",
                description: "drainage not maintained with gutter not cleaned and debris accumulation"
            }
        }), "maintenance-related drainage defect");
    }
);

runTest(
    "workmanship-related drainage defect produces corresponding hypothesis",
    () => {
        assertHasCause(ExpertReasoningEngine.analyze({
            finding: {
                category: "drainage",
                location: "downpipe connection",
                description: "poor drainage installation and incorrect drainage connection"
            }
        }), "workmanship defect");
    }
);

runTest(
    "required verification and relevance fields are exposed",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "drainage",
                location: "roof outlet",
                description: "blocked roof outlet"
            }
        });

        assert.ok(Array.isArray(result.requiredVerification) && result.requiredVerification.length > 0);
        assert.equal(typeof result.primaryHypothesis.riskRelevance, "string");
        assert.equal(typeof result.primaryHypothesis.capexRelevance, "string");
        assert.equal(typeof result.primaryHypothesis.valuationRelevance, "string");
        assert.equal(result.primaryHypothesis.status, "hypothesis");
        assert.ok(result.confidence >= 0 && result.confidence <= 1);
    }
);

runTest(
    "deterministic output and immutable input",
    () => {
        const input = {
            finding: {
                category: "drainage",
                location: "roof outlet",
                description: "blocked roof outlet with ponding near roof outlet",
                observations: ["overflow"]
            },
            building: {
                roofType: "flat roof"
            },
            measurements: [
                {
                    type: "observation",
                    value: "blocked outlet",
                    location: "roof"
                }
            ]
        };
        const original = structuredClone(input);

        assert.deepStrictEqual(ExpertReasoningEngine.analyze(input), ExpertReasoningEngine.analyze(input));
        assert.deepStrictEqual(input, original);
    }
);

runTest(
    "stable domain ordering",
    () => {
        const input = {
            finding: {
                category: "corrosion",
                location: "reinforced concrete basement balcony outlet facade entrance door threshold crack",
                description: "blocked roof outlet with runoff directed toward entrance, wet facade staining, crack, rust staining, and spalling"
            },
            building: {
                basementType: "full basement",
                constructionType: "reinforced concrete"
            }
        };

        assert.deepStrictEqual(KnowledgeDomainRouter.resolve(input), [
            "concrete-corrosion",
            "basement-waterproofing",
            "balconies-terraces",
            "drainage-rainwater",
            "windows-doors",
            "facade-wall-systems",
            "roof-envelope",
            "moisture",
            "crack"
        ]);
    }
);

runTest(
    "stable unknown-input fallback",
    () => {
        assert.deepStrictEqual(KnowledgeDomainRouter.resolve({}), []);
        assert.deepStrictEqual(ExpertReasoningEngine.analyze(), ExpertReasoningEngine.analyze({}));
    }
);

runTest(
    "no automatic full drainage-system replacement or structural-failure conclusion",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "drainage",
                location: "gutter and downpipe",
                description: "blocked gutter and cracked downpipe"
            }
        });

        assertNoForbiddenConclusions(result);
    }
);

runTest(
    "no invented standards, thresholds, slopes, capacities, or probabilities",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "site drainage",
                location: "external paved area",
                description: "surface water accumulation and gutter overflow"
            }
        });

        assert.equal(/\b\d+\s*(mm|cm|m|%|l\/s|litres|liters)\b/i.test(allText(result)), false);
        assert.equal(/threshold|rainfall intensity|probability|statistical|capacity value|minimum slope|standard requires/i.test(allText(result)), false);
    }
);

runTest(
    "false-positive integration guards do not route drainage-rainwater",
    () => {
        const cases = [
            ["generic rain", "rainfall occurred yesterday"],
            ["weather description", "stormy weather and wind"],
            ["indoor plumbing leak", "indoor plumbing leakage below sink"],
            ["sanitary pipe leak", "sanitary pipe leakage in bathroom"],
            ["shower drain", "shower drain blockage in bathroom"],
            ["internal floor drain", "internal floor drain in laundry"],
            ["swimming-pool drainage", "swimming-pool drainage maintenance"],
            ["irrigation", "landscape irrigation pipe defect"],
            ["street drainage", "street drainage blocked outside unrelated road"],
            ["generic pipe corrosion", "generic pipe corrosion"],
            ["generic standing water", "generic standing water in a bucket"],
            ["generic slope wording", "sloped surface noted"],
            ["generic roof leakage", "generic roof leakage at ceiling"],
            ["generic basement moisture", "basement moisture on internal wall"],
            ["generic facade moisture", "facade moisture without rainwater context"],
            ["marketing wording", "marketing address: Rain Water Gutter Terrace Courtyard"],
            ["metadata only", ""]
        ];

        cases.forEach(([label, description]) => {
            const input = label === "metadata only"
                ? { building: { drainageSystem: "rainwater drainage", backwaterProtection: "present" } }
                : { finding: { category: "inspection", description } };

            assert.equal(KnowledgeDomainRouter.resolve(input).includes("drainage-rainwater"), false, label);
        });
    }
);

console.log("DrainageRainwater reasoning integration tests completed successfully.");