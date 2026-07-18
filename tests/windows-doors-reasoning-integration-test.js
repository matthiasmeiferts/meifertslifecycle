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

runTest(
    "leaking window joint routes to windows-doors, roof-envelope, and moisture",
    () => {
        const input = {
            finding: {
                category: "moisture",
                location: "window sill and reveal",
                description: "water penetration at window installation joint with flashing issue",
                observations: ["rain-related ingress"]
            },
            building: {
                constructionType: "apartment",
                windowType: "casement"
            }
        };

        const domains = KnowledgeDomainRouter.resolve(input);
        const result = ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(domains, ["windows-doors", "roof-envelope", "moisture"]);
        assert.ok(allCauses(result).includes("water penetration through window connection") || allCauses(result).includes("failed installation joint"));
    }
);

runTest(
    "basement window leakage preserves basement-waterproofing overlap",
    () => {
        const input = {
            finding: {
                category: "moisture",
                location: "basement window",
                description: "water penetration at window connection and flashing",
                observations: ["seepage at reveal"]
            },
            building: {
                basementType: "full basement",
                windowType: "fixed"
            }
        };

        const domains = KnowledgeDomainRouter.resolve(input);

        assert.deepStrictEqual(domains, ["basement-waterproofing", "windows-doors", "roof-envelope", "moisture"]);
    }
);

runTest(
    "perimeter seal defect produces corresponding hypothesis",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "window",
                location: "frame perimeter",
                description: "defective perimeter seal and draught",
                observations: ["cracked sealant"]
            },
            building: {
                frameMaterial: "aluminum"
            }
        });

        assert.ok(allCauses(result).includes("defective perimeter seal"));
    }
);

runTest(
    "glazing-edge condensation may produce glazing-seal or condensation hypothesis without confirmation",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "glazing",
                location: "glazing edge",
                description: "condensation and fogging near edge seal",
                observations: ["surface moisture"]
            },
            building: {
                glazingType: "insulated glazing unit"
            }
        });

        const causes = allCauses(result);

        assert.ok(causes.includes("defective glazing seal") || causes.includes("condensation on glazing or frame"));
        assert.ok(/confirmed|diagnosis|fact/i.test(JSON.stringify(result)) === false);
    }
);

runTest(
    "distorted frame produces frame or sash hypothesis",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "window",
                location: "sash",
                description: "misaligned sash and warped frame",
                observations: ["binding sash"]
            },
            building: {
                windowType: "casement"
            }
        });

        assert.ok(allCauses(result).includes("distorted frame or sash"));
    }
);

runTest(
    "defective hardware produces hardware or adjustment hypothesis",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "window",
                location: "hardware",
                description: "defective hinge and lock, handle misadjusted",
                observations: ["not closing correctly"]
            },
            building: {
                windowType: "tilt-turn"
            }
        });

        assert.ok(allCauses(result).includes("defective hardware or adjustment"));
    }
);

runTest(
    "sill connection leakage produces sill or flashing hypothesis",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "window",
                location: "window sill",
                description: "water staining and leakage below sill",
                observations: ["defective flashing"]
            },
            building: {
                windowType: "fixed"
            }
        });

        assert.ok(allCauses(result).includes("defective flashing or sill connection"));
    }
);

runTest(
    "air-leakage wording produces air-leakage hypothesis",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "window",
                location: "frame",
                description: "air leakage and draught at closure line",
                observations: ["whistling"]
            },
            building: {
                frameMaterial: "PVC"
            }
        });

        assert.ok(allCauses(result).includes("air leakage"));
    }
);

runTest(
    "exterior door seal defect produces door-seal hypothesis",
    () => {
        const input = {
            finding: {
                category: "door",
                location: "exterior door threshold",
                description: "defective exterior door seal",
                observations: ["draught at gasket"]
            }
        };

        const domains = KnowledgeDomainRouter.resolve(input);
        const result = ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(domains, ["windows-doors"]);
        assert.ok(allCauses(result).includes("defective exterior door seal"));
    }
);

runTest(
    "glazing damage produces glazing-damage hypothesis without confirming frame failure",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "glazing",
                location: "window pane",
                description: "cracked glass at corner",
                observations: ["glass fracture"]
            },
            building: {
                glazingType: "double glazing"
            }
        });

        assert.ok(allCauses(result).includes("glazing damage"));
        assert.equal(result.primaryHypothesis.cause, "glazing damage");
        assert.equal(result.primaryHypothesis.cause === "distorted frame or sash", false);
    }
);

runTest(
    "installation-defect wording remains hypothetical",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "window",
                location: "installation interface",
                description: "detail quality indicates potential installation error with assembly defects at opening transitions",
                observations: ["poor installation workmanship", "incorrect detailing"]
            },
            building: {
                constructionYear: 2018
            }
        });

        assert.ok(allHypotheses(result).every((hypothesis) => hypothesis.status === "hypothesis"));
    }
);

runTest(
    "condensation does not automatically confirm thermal bridge",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "glazing",
                location: "window glazing",
                description: "condensation on glazing",
                observations: ["high humidity"]
            },
            building: {
                glazingType: "double glazing"
            }
        });

        assert.ok(result.primaryHypothesis.cause !== "thermal bridge at window installation" || allCauses(result).includes("condensation on glazing or frame"));
    }
);

runTest(
    "condensation does not automatically confirm air leakage",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "window",
                location: "window pane",
                description: "surface condensation on glazing",
                observations: ["high humidity"]
            },
            building: {
                windowType: "fixed"
            }
        });

        assert.ok(result.primaryHypothesis.cause !== "air leakage" || allCauses(result).includes("condensation on glazing or frame"));
    }
);

runTest(
    "no automatic replacement recommendation",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "window",
                location: "frame",
                description: "defective perimeter seal and leakage",
                observations: ["air leakage"]
            },
            building: {
                windowType: "casement"
            }
        });

        assert.ok(/replace all|full replacement|automatic replacement/i.test(JSON.stringify(result)) === false);
    }
);

runTest(
    "required verification is exposed",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "window",
                location: "window joint",
                description: "leak at installation joint"
            },
            building: {
                windowType: "fixed"
            }
        });

        assert.ok(Array.isArray(result.requiredVerification));
        assert.ok(result.requiredVerification.length > 0);
    }
);

runTest(
    "risk, CAPEX, and valuation relevance are exposed",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "door",
                location: "exterior door",
                description: "defective exterior door seal",
                observations: ["weather seal degradation"]
            }
        });

        assert.equal(typeof result.primaryHypothesis.riskRelevance, "string");
        assert.equal(typeof result.primaryHypothesis.capexRelevance, "string");
        assert.equal(typeof result.primaryHypothesis.valuationRelevance, "string");
    }
);

runTest(
    "deterministic output",
    () => {
        const input = {
            finding: {
                category: "window",
                location: "window sill and frame",
                description: "air leakage and water ingress",
                observations: ["seal damage"]
            },
            building: {
                windowType: "casement",
                frameMaterial: "aluminum"
            }
        };

        const result1 = ExpertReasoningEngine.analyze(input);
        const result2 = ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(result1, result2);
    }
);

runTest(
    "immutable input",
    () => {
        const input = {
            finding: {
                category: "window",
                location: "window frame",
                description: "perimeter seal issue"
            },
            building: {
                windowType: "fixed",
                frameMaterial: "PVC"
            },
            measurements: [
                {
                    type: "note",
                    value: "draught",
                    location: "frame edge"
                }
            ]
        };

        const original = structuredClone(input);

        ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(input, original);
    }
);

runTest(
    "stable domain ordering",
    () => {
        const input = {
            finding: {
                category: "corrosion",
                location: "reinforced concrete basement window frame crack",
                description: "water ingress with rust staining and spalling at window joint and flashing"
            },
            building: {
                basementType: "full basement",
                constructionType: "reinforced concrete",
                windowType: "fixed"
            }
        };

        const domains1 = KnowledgeDomainRouter.resolve(input);
        const domains2 = KnowledgeDomainRouter.resolve(input);

        assert.deepStrictEqual(domains1, domains2);
        assert.deepStrictEqual(domains1, ["concrete-corrosion", "basement-waterproofing", "windows-doors", "roof-envelope", "moisture", "crack"]);
    }
);

runTest(
    "stable unknown-input fallback",
    () => {
        const unknown1 = ExpertReasoningEngine.analyze({
            finding: {
                category: "inspection"
            }
        });
        const unknown2 = ExpertReasoningEngine.analyze({
            finding: {
                category: "inspection"
            }
        });

        assert.deepStrictEqual(unknown1, unknown2);
    }
);

runTest(
    "roof-only flashing does not route to windows-doors",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "roof-envelope",
                location: "roof flashing",
                description: "rain ingress at roof flashing"
            }
        });

        assert.deepStrictEqual(domains, ["roof-envelope", "moisture"]);
        assert.equal(domains.includes("windows-doors"), false);
    }
);

runTest(
    "generic indoor condensation does not route to windows-doors",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "moisture",
                location: "interior wall",
                description: "generic indoor condensation"
            }
        });

        assert.deepStrictEqual(domains, ["moisture"]);
    }
);

runTest(
    "cabinet door does not route to windows-doors",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "door",
                location: "cabinet door",
                description: "hinge issue"
            }
        });

        assert.deepStrictEqual(domains, []);
    }
);

runTest(
    "lift door does not route to windows-doors",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "door",
                location: "lift door",
                description: "panel misalignment"
            }
        });

        assert.deepStrictEqual(domains, []);
    }
);

runTest(
    "existing moisture behavior unchanged",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "moisture",
                location: "Basement wall",
                description: "Damp staining at the lower wall",
                observations: ["base of wall", "salt tide marks"]
            },
            building: {
                constructionYear: 1998,
                constructionType: "apartment",
                basementPresent: true
            }
        });

        assert.ok(result.confidence >= 0 && result.confidence <= 1);
    }
);

runTest(
    "existing crack behavior unchanged",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "crack",
                location: "Window opening",
                description: "Diagonal crack from the corner of the opening",
                observations: ["step crack", "widening line"]
            },
            building: {
                constructionYear: 2004,
                constructionType: "apartment",
                numberOfStoreys: 5,
                basementPresent: false
            }
        });

        assert.ok(["lintel or opening-related movement", "differential settlement", "foundation movement"].includes(result.primaryHypothesis.cause));
    }
);

runTest(
    "existing roof-envelope behavior unchanged",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "moisture",
                location: "roof penetration",
                description: "Moisture around a vent stack after rainfall",
                observations: ["staining near flashing"]
            },
            building: {
                constructionType: "apartment",
                roofType: "flat roof"
            }
        });

        assert.ok(allCauses(result).includes("failed flashing or penetration detail"));
    }
);

runTest(
    "existing concrete-corrosion behavior unchanged",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "corrosion",
                location: "beam soffit",
                description: "Exposed reinforcement with rust staining",
                observations: ["rebar visible", "spalling"]
            },
            building: {
                constructionType: "reinforced concrete",
                exposureClass: "coastal"
            }
        });

        assert.equal(result.primaryHypothesis.cause, "reinforcement corrosion");
    }
);

runTest(
    "existing basement-waterproofing behavior unchanged",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "moisture",
                location: "basement wall-floor junction",
                description: "dampness at wall slab joint",
                observations: ["wet wall-floor line"]
            },
            building: {
                basementType: "full basement"
            }
        });

        assert.ok(allCauses(result).includes("defective wall-floor junction"));
    }
);

console.log("Windows-doors reasoning integration test completed successfully.");
