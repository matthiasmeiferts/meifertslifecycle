import assert from "node:assert/strict";

import WindowsDoorsKnowledgeProvider from "../portal/core/knowledge/WindowsDoorsKnowledgeProvider.js";

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
    "leaking window joint",
    () => {
        const result = WindowsDoorsKnowledgeProvider.getKnowledge({
            finding: {
                category: "window",
                location: "window connection",
                description: "leak at installation joint after rain",
                observations: ["water ingress at reveal"]
            },
            building: {
                windowType: "casement"
            }
        });

        assert.ok(causes(result).includes("water penetration through window connection") || causes(result).includes("failed installation joint"));
    }
);

runTest(
    "defective perimeter seal",
    () => {
        const result = WindowsDoorsKnowledgeProvider.getKnowledge({
            finding: {
                category: "window",
                location: "frame perimeter",
                description: "cracked perimeter sealant and draught",
                observations: ["gap at frame edge"]
            },
            building: {
                frameMaterial: "aluminum"
            }
        });

        assert.ok(causes(result).includes("defective perimeter seal"));
    }
);

runTest(
    "glazing condensation",
    () => {
        const result = WindowsDoorsKnowledgeProvider.getKnowledge({
            finding: {
                category: "glazing",
                location: "window pane",
                description: "condensation on glazing in cold mornings",
                observations: ["surface moisture", "high humidity"]
            },
            building: {
                glazingType: "double glazing"
            }
        });

        assert.ok(causes(result).includes("condensation on glazing or frame"));
    }
);

runTest(
    "glazing edge seal",
    () => {
        const result = WindowsDoorsKnowledgeProvider.getKnowledge({
            finding: {
                category: "glazing",
                location: "glass edge",
                description: "fogging between panes at edge seal",
                observations: ["failed edge seal"]
            },
            building: {
                glazingType: "insulated glazing"
            }
        });

        assert.ok(causes(result).includes("defective glazing seal"));
    }
);

runTest(
    "distorted frame",
    () => {
        const result = WindowsDoorsKnowledgeProvider.getKnowledge({
            finding: {
                category: "window",
                location: "sash",
                description: "misaligned sash and warped frame",
                observations: ["binding sash"]
            },
            building: {
                frameMaterial: "timber"
            }
        });

        assert.ok(causes(result).includes("distorted frame or sash"));
    }
);

runTest(
    "defective hardware",
    () => {
        const result = WindowsDoorsKnowledgeProvider.getKnowledge({
            finding: {
                category: "window",
                location: "hardware",
                description: "hinge and lock defective, handle not closing correctly",
                observations: ["misadjusted latch"]
            },
            building: {
                windowType: "tilt-turn"
            }
        });

        assert.ok(causes(result).includes("defective hardware or adjustment"));
    }
);

runTest(
    "defective sill connection",
    () => {
        const result = WindowsDoorsKnowledgeProvider.getKnowledge({
            finding: {
                category: "window",
                location: "sill",
                description: "water staining below sill connection after rain",
                observations: ["drip edge issue"]
            },
            building: {
                windowType: "fixed"
            }
        });

        assert.ok(causes(result).includes("defective flashing or sill connection"));
    }
);

runTest(
    "air leakage wording",
    () => {
        const result = WindowsDoorsKnowledgeProvider.getKnowledge({
            finding: {
                category: "window",
                location: "frame",
                description: "air leakage and draught at closure line",
                observations: ["whistling noise"]
            },
            building: {
                frameMaterial: "PVC"
            }
        });

        assert.ok(causes(result).includes("air leakage"));
    }
);

runTest(
    "exterior door seal defect",
    () => {
        const result = WindowsDoorsKnowledgeProvider.getKnowledge({
            finding: {
                category: "door",
                location: "exterior door threshold",
                description: "air and water leak at exterior door seal",
                observations: ["bottom seal damaged"]
            },
            building: {
                constructionType: "residential"
            }
        });

        assert.ok(causes(result).includes("defective exterior door seal"));
    }
);

runTest(
    "glazing damage",
    () => {
        const result = WindowsDoorsKnowledgeProvider.getKnowledge({
            finding: {
                category: "glazing",
                location: "window pane",
                description: "cracked glass at lower corner",
                observations: ["glass fracture"]
            },
            building: {
                glazingType: "double glazing"
            }
        });

        assert.ok(causes(result).includes("glazing damage"));
    }
);

runTest(
    "installation defect",
    () => {
        const result = WindowsDoorsKnowledgeProvider.getKnowledge({
            finding: {
                category: "window",
                location: "installation interface",
                description: "poor installation workmanship at opening detail",
                observations: ["incorrect detailing", "improper fixing"]
            },
            building: {
                constructionYear: 2018
            }
        });

        assert.ok(causes(result).includes("installation workmanship defect"));
    }
);

runTest(
    "unknown input",
    () => {
        const result1 = WindowsDoorsKnowledgeProvider.getKnowledge();
        const result2 = WindowsDoorsKnowledgeProvider.getKnowledge({});

        assert.deepStrictEqual(result1, {
            domain: "windows-doors",
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
                category: "window",
                location: "frame perimeter",
                description: "draught and water ingress at installation joint",
                observations: ["sealant crack"]
            },
            building: {
                windowType: "casement",
                frameMaterial: "aluminum"
            },
            measurements: [
                {
                    type: "note",
                    value: "visible gap",
                    unit: "qualitative",
                    location: "frame edge"
                }
            ]
        };

        const result1 = WindowsDoorsKnowledgeProvider.getKnowledge(input);
        const result2 = WindowsDoorsKnowledgeProvider.getKnowledge(input);

        assert.deepStrictEqual(result1, result2);
    }
);

runTest(
    "immutable input",
    () => {
        const input = {
            finding: {
                category: "window",
                location: "sill",
                description: "water staining below sill",
                observations: ["drip edge issue"]
            },
            building: {
                constructionYear: 2010,
                constructionType: "mixed use",
                windowType: "fixed",
                frameMaterial: "aluminum",
                glazingType: "double glazing"
            },
            measurements: [
                {
                    type: "observation",
                    value: "wet patch",
                    location: "below sill"
                }
            ]
        };

        const original = structuredClone(input);

        WindowsDoorsKnowledgeProvider.getKnowledge(input);

        assert.deepStrictEqual(input, original);
    }
);

runTest(
    "stable ordering",
    () => {
        const input = {
            finding: {
                category: "window",
                location: "window perimeter and sill",
                description: "air leakage, water ingress, failed edge seal and hardware issue",
                observations: ["draught", "fogging between panes", "defective lock"]
            },
            building: {
                windowType: "casement",
                frameMaterial: "timber",
                glazingType: "insulated glazing"
            }
        };

        const first = WindowsDoorsKnowledgeProvider.getKnowledge(input);
        const second = WindowsDoorsKnowledgeProvider.getKnowledge(input);

        assert.deepStrictEqual(ids(first), ids(second));
    }
);

runTest(
    "requiredVerification always present",
    () => {
        const result = WindowsDoorsKnowledgeProvider.getKnowledge({
            finding: {
                category: "window",
                location: "frame",
                description: "air leakage and perimeter seal issue"
            },
            building: {
                frameMaterial: "PVC"
            }
        });

        assert.ok(result.hypotheses.length > 0);
        assert.ok(result.hypotheses.every((hypothesis) => Array.isArray(hypothesis.requiredVerification) && hypothesis.requiredVerification.length > 0));
    }
);

runTest(
    "no confirmed diagnosis wording",
    () => {
        const result = WindowsDoorsKnowledgeProvider.getKnowledge({
            finding: {
                category: "window",
                location: "frame",
                description: "water ingress and draught",
                observations: ["seal deterioration"]
            },
            building: {
                windowType: "casement"
            }
        });

        const text = hypothesisText(result);

        assert.equal(/confirmed/i.test(text), false);
        assert.equal(/diagnosis/i.test(text), false);
    }
);

console.log("WindowsDoorsKnowledgeProvider tests completed successfully.");
