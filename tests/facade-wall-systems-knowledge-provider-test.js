import assert from "node:assert/strict";

import FacadeWallSystemsKnowledgeProvider from "../portal/core/knowledge/FacadeWallSystemsKnowledgeProvider.js";

function runTest(name, fn) {
    try {
        fn();
        console.log(`✓ ${name}`);
    } catch (error) {
        console.error(`✗ ${name}`);
        throw error;
    }
}

function causes(result) {
    return result.hypotheses.map((hypothesis) => hypothesis.cause);
}

function ids(result) {
    return result.hypotheses.map((hypothesis) => hypothesis.id);
}

function hypothesisText(result) {
    return result.hypotheses.flatMap((hypothesis) => [
        hypothesis.cause,
        hypothesis.classification,
        ...hypothesis.supportingIndicators,
        ...hypothesis.contradictingIndicators,
        ...hypothesis.requiredVerification,
        ...hypothesis.potentialConsequences,
        ...hypothesis.recommendedActions
    ]).join(" ");
}

runTest(
    "render crack",
    () => {
        const result = FacadeWallSystemsKnowledgeProvider.getKnowledge({
            finding: {
                category: "facade",
                location: "rendered external wall",
                description: "visible render cracking and fissures at facade",
                observations: ["hairline render crack"]
            },
            building: {
                facadeType: "rendered facade"
            }
        });

        assert.ok(causes(result).includes("render cracking"));
    }
);

runTest(
    "detached render",
    () => {
        const result = FacadeWallSystemsKnowledgeProvider.getKnowledge({
            finding: {
                category: "facade",
                location: "south elevation render",
                description: "detached render with local debonded patches",
                observations: ["render delamination"]
            },
            building: {
                facadeType: "render"
            }
        });

        assert.ok(causes(result).includes("detached render"));
    }
);

runTest(
    "hollow render",
    () => {
        const result = FacadeWallSystemsKnowledgeProvider.getKnowledge({
            finding: {
                category: "external wall",
                location: "render zone near opening",
                description: "hollow sounding render with drummy spots",
                observations: ["hollow spot"]
            },
            building: {
                facadeType: "render"
            }
        });

        assert.ok(causes(result).includes("hollow render"));
    }
);

runTest(
    "facade moisture",
    () => {
        const result = FacadeWallSystemsKnowledgeProvider.getKnowledge({
            finding: {
                category: "facade",
                location: "west elevation",
                description: "facade moisture penetration after rain",
                observations: ["water ingress facade"]
            },
            building: {
                exposure: "wind-driven rain"
            }
        });

        assert.ok(causes(result).includes("facade moisture penetration"));
    }
);

runTest(
    "defective sealant joint",
    () => {
        const result = FacadeWallSystemsKnowledgeProvider.getKnowledge({
            finding: {
                category: "cladding facade",
                location: "vertical joint",
                description: "failed sealant with shrinkage and cracks",
                observations: ["joint sealant defect"]
            },
            building: {
                claddingType: "panel cladding"
            }
        });

        assert.ok(causes(result).includes("defective sealant joints"));
    }
);

runTest(
    "ETICS moisture",
    () => {
        const result = FacadeWallSystemsKnowledgeProvider.getKnowledge({
            finding: {
                category: "facade",
                location: "ETICS zone",
                description: "ETICS moisture with damp insulation area",
                observations: ["wet insulation"]
            },
            building: {
                insulationSystem: "ETICS"
            }
        });

        assert.ok(causes(result).includes("ETICS moisture damage"));
    }
);

runTest(
    "ETICS detachment",
    () => {
        const result = FacadeWallSystemsKnowledgeProvider.getKnowledge({
            finding: {
                category: "facade",
                location: "EIFS board area",
                description: "eifs detachment at insulation board edge",
                observations: ["detached eifs"]
            },
            building: {
                insulationSystem: "EIFS"
            }
        });

        assert.ok(causes(result).includes("ETICS detachment"));
    }
);

runTest(
    "algae growth",
    () => {
        const result = FacadeWallSystemsKnowledgeProvider.getKnowledge({
            finding: {
                category: "facade",
                location: "north facade",
                description: "algae and biological growth on external wall",
                observations: ["green facade staining"]
            },
            building: {
                exposure: "shaded"
            }
        });

        assert.ok(causes(result).includes("algae or biological growth"));
    }
);

runTest(
    "coating deterioration",
    () => {
        const result = FacadeWallSystemsKnowledgeProvider.getKnowledge({
            finding: {
                category: "facade coating",
                location: "east elevation",
                description: "coating deterioration with paint failure and peeling",
                observations: ["chalked coating"]
            },
            building: {
                facadeType: "coated render"
            }
        });

        assert.ok(causes(result).includes("coating deterioration"));
    }
);

runTest(
    "freeze-thaw wording",
    () => {
        const result = FacadeWallSystemsKnowledgeProvider.getKnowledge({
            finding: {
                category: "masonry facade",
                location: "parapet zone",
                description: "freeze-thaw and frost spalling deterioration",
                observations: ["frost damage"]
            },
            building: {
                exposure: "severe winter weather"
            }
        });

        assert.ok(causes(result).includes("freeze-thaw deterioration"));
    }
);

runTest(
    "masonry weathering",
    () => {
        const result = FacadeWallSystemsKnowledgeProvider.getKnowledge({
            finding: {
                category: "masonry facade",
                location: "brick wall",
                description: "masonry weathering with brick erosion and mortar weathering",
                observations: ["weathered masonry"]
            },
            building: {
                facadeType: "brick masonry"
            }
        });

        assert.ok(causes(result).includes("masonry weathering"));
    }
);

runTest(
    "facade anchor wording",
    () => {
        const result = FacadeWallSystemsKnowledgeProvider.getKnowledge({
            finding: {
                category: "cladding facade",
                location: "anchor line",
                description: "facade anchor deterioration with fixing distress",
                observations: ["anchor corrosion"]
            },
            building: {
                claddingType: "ventilated facade"
            }
        });

        assert.ok(causes(result).includes("facade anchor deterioration"));
    }
);

runTest(
    "movement joint defect",
    () => {
        const result = FacadeWallSystemsKnowledgeProvider.getKnowledge({
            finding: {
                category: "facade",
                location: "movement joint",
                description: "failed movement joint with restraint signs",
                observations: ["expansion joint defect"]
            },
            building: {
                facadeType: "render and masonry"
            }
        });

        assert.ok(causes(result).includes("facade movement joint defect"));
    }
);

runTest(
    "workmanship wording",
    () => {
        const result = FacadeWallSystemsKnowledgeProvider.getKnowledge({
            finding: {
                category: "external wall system",
                location: "facade detail transition",
                description: "poor workmanship and installation defect at terminations",
                observations: ["improper execution"]
            },
            building: {
                constructionYear: 2017,
                constructionType: "mixed-use"
            }
        });

        assert.ok(causes(result).includes("workmanship defect"));
    }
);

runTest(
    "unknown input",
    () => {
        const result1 = FacadeWallSystemsKnowledgeProvider.getKnowledge();
        const result2 = FacadeWallSystemsKnowledgeProvider.getKnowledge({});

        assert.deepStrictEqual(result1, {
            domain: "facade-wall-systems",
            hypotheses: []
        });

        assert.deepStrictEqual(result1, result2);
    }
);

runTest(
    "deterministic output",
    () => {
        const input = {
            finding: {
                category: "facade",
                location: "render and movement joint",
                description: "render cracking and failed movement joint",
                observations: ["open joint", "hairline render crack"]
            },
            building: {
                facadeType: "render",
                exposure: "wind-driven rain"
            },
            measurements: [
                {
                    type: "observation",
                    value: "localized cracking",
                    unit: "qualitative",
                    location: "joint line"
                }
            ]
        };

        const result1 = FacadeWallSystemsKnowledgeProvider.getKnowledge(input);
        const result2 = FacadeWallSystemsKnowledgeProvider.getKnowledge(input);

        assert.deepStrictEqual(result1, result2);
    }
);

runTest(
    "immutable input",
    () => {
        const input = {
            finding: {
                category: "facade",
                location: "ETICS zone",
                description: "ETICS moisture and local detachment",
                observations: ["wet insulation", "detached eifs"]
            },
            building: {
                constructionYear: 2015,
                constructionType: "residential",
                facadeType: "external insulation",
                insulationSystem: "ETICS",
                claddingType: "render",
                exposure: "north-west"
            },
            measurements: [
                {
                    type: "inspection",
                    value: "damp patch",
                    unit: "qualitative",
                    location: "north facade"
                }
            ]
        };

        const original = structuredClone(input);

        FacadeWallSystemsKnowledgeProvider.getKnowledge(input);

        assert.deepStrictEqual(input, original);
    }
);

runTest(
    "stable ordering",
    () => {
        const input = {
            finding: {
                category: "facade",
                location: "rendered wall and joint lines",
                description: "render cracking, hollow sounding, sealant defect and algae",
                observations: ["failed sealant", "green facade staining", "hollow render"]
            },
            building: {
                facadeType: "render",
                exposure: "north"
            }
        };

        const first = FacadeWallSystemsKnowledgeProvider.getKnowledge(input);
        const second = FacadeWallSystemsKnowledgeProvider.getKnowledge(input);

        assert.deepStrictEqual(ids(first), ids(second));
    }
);

runTest(
    "requiredVerification always present",
    () => {
        const result = FacadeWallSystemsKnowledgeProvider.getKnowledge({
            finding: {
                category: "facade",
                location: "sealant joint",
                description: "failed sealant and moisture penetration"
            },
            building: {
                facadeType: "cladding"
            }
        });

        assert.ok(result.hypotheses.length > 0);
        assert.ok(result.hypotheses.every((hypothesis) => Array.isArray(hypothesis.requiredVerification) && hypothesis.requiredVerification.length > 0));
    }
);

runTest(
    "no confirmed diagnosis wording",
    () => {
        const result = FacadeWallSystemsKnowledgeProvider.getKnowledge({
            finding: {
                category: "facade",
                location: "north elevation",
                description: "algae growth and sealant crack",
                observations: ["biological growth"]
            },
            building: {
                facadeType: "coated render"
            }
        });

        const text = hypothesisText(result);

        assert.equal(/confirmed/i.test(text), false);
        assert.equal(/diagnosis/i.test(text), false);
    }
);

console.log("FacadeWallSystemsKnowledgeProvider tests completed successfully.");
