import assert from "node:assert/strict";

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

runTest(
    "facade-only routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "facade",
                location: "external wall render",
                description: "coating deterioration on facade"
            }
        });

        assert.deepStrictEqual(domains, ["facade-wall-systems"]);
    }
);

runTest(
    "balconies-terraces-only routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "balcony",
                location: "balcony edge",
                description: "balcony workmanship defect"
            }
        });

        assert.deepStrictEqual(domains, ["balconies-terraces"]);
    }
);

runTest(
    "balcony threshold leakage overlap",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "balcony",
                location: "balcony door threshold",
                description: "leaking balcony door threshold with rain ingress"
            }
        });

        assert.deepStrictEqual(domains, ["balconies-terraces", "windows-doors", "roof-envelope", "moisture"]);
    }
);

runTest(
    "terrace waterproofing plus roof-envelope and moisture",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "terrace",
                location: "roof terrace",
                description: "terrace waterproofing leakage with rain ingress"
            }
        });

        assert.deepStrictEqual(domains, ["balconies-terraces", "roof-envelope", "moisture"]);
    }
);

runTest(
    "balcony concrete spalling overlap",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "balcony",
                location: "balcony edge",
                description: "balcony edge spalling with exposed reinforcement and rust"
            }
        });

        assert.deepStrictEqual(domains, ["concrete-corrosion", "balconies-terraces"]);
    }
);

runTest(
    "balcony wall connection plus facade overlap",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "balcony",
                location: "balcony wall connection",
                description: "balcony wall connection moisture and staining at facade junction"
            }
        });

        assert.deepStrictEqual(domains, ["balconies-terraces", "facade-wall-systems", "roof-envelope", "moisture"]);
    }
);

runTest(
    "basement terrace overlap",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "moisture",
                location: "sunken terrace",
                description: "basement terrace leakage with dampness"
            },
            building: {
                basementType: "full basement"
            }
        });

        assert.deepStrictEqual(domains, ["basement-waterproofing", "balconies-terraces", "moisture"]);
    }
);

runTest(
    "balcony thermal-bridge routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "balcony",
                location: "balcony connection",
                description: "thermal bridge at balcony connection"
            }
        });

        assert.deepStrictEqual(domains, ["balconies-terraces"]);
    }
);

runTest(
    "no false routing for internal tiles",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "tile",
                location: "internal floor",
                description: "interior floor tiles cracked"
            }
        });

        assert.equal(domains.includes("balconies-terraces"), false);
    }
);

runTest(
    "no false routing for generic railing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "railing",
                location: "handrail",
                description: "generic railing corrosion"
            }
        });

        assert.equal(domains.includes("balconies-terraces"), false);
    }
);

runTest(
    "no false routing for roof-only drainage",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "roof",
                location: "roof drain",
                description: "roof drainage outlet blockage"
            }
        });

        assert.equal(domains.includes("balconies-terraces"), false);
    }
);

runTest(
    "no false routing for generic frost damage",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "surface",
                location: "external surface",
                description: "generic frost damage"
            }
        });

        assert.equal(domains.includes("balconies-terraces"), false);
    }
);

runTest(
    "no false routing for generic standing water",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "surface",
                location: "courtyard",
                description: "generic standing water"
            }
        });

        assert.equal(domains.includes("balconies-terraces"), false);
    }
);

runTest(
    "rendered facade plus crack",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "facade",
                location: "rendered external wall",
                description: "cracked render on facade"
            }
        });

        assert.deepStrictEqual(domains, ["facade-wall-systems", "crack"]);
    }
);

runTest(
    "facade moisture plus roof-envelope plus moisture",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "facade",
                location: "facade sealant joint",
                description: "damp facade with failed sealant joint and rain ingress"
            }
        });

        assert.deepStrictEqual(domains, ["facade-wall-systems", "roof-envelope", "moisture"]);
    }
);

runTest(
    "ETICS window connection overlap",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "facade",
                location: "ETICS window connection",
                description: "ETICS moisture near window flashing with ingress"
            },
            building: {
                insulationSystem: "ETICS"
            }
        });

        assert.deepStrictEqual(domains, ["windows-doors", "facade-wall-systems", "roof-envelope", "moisture"]);
    }
);

runTest(
    "basement plinth overlap",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "moisture",
                location: "basement plinth external wall",
                description: "facade moisture and seepage at plinth"
            },
            building: {
                basementType: "full basement"
            }
        });

        assert.deepStrictEqual(domains, ["basement-waterproofing", "facade-wall-systems", "moisture"]);
    }
);

runTest(
    "concrete facade spalling overlap",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "facade",
                location: "reinforced concrete facade",
                description: "spalling facade finish with exposed reinforcement and rust"
            }
        });

        assert.deepStrictEqual(domains, ["concrete-corrosion", "facade-wall-systems"]);
    }
);

runTest(
    "algae facade without automatic moisture domain",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "facade",
                location: "north facade",
                description: "algae on facade surface"
            }
        });

        assert.deepStrictEqual(domains, ["facade-wall-systems"]);
    }
);

runTest(
    "no false routing for internal plaster",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "internal wall",
                location: "living room",
                description: "internal wall plaster cracking"
            }
        });

        assert.equal(domains.includes("facade-wall-systems"), false);
    }
);

runTest(
    "no false routing for internal wall crack",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "crack",
                location: "internal wall",
                description: "generic wall crack in bedroom"
            }
        });

        assert.deepStrictEqual(domains, ["crack"]);
        assert.equal(domains.includes("facade-wall-systems"), false);
    }
);

runTest(
    "no false routing for roof cladding",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "roof",
                location: "roof cladding",
                description: "roof cladding weathering"
            }
        });

        assert.equal(domains.includes("facade-wall-systems"), false);
    }
);

runTest(
    "no false routing for generic algae",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "surface",
                location: "garden element",
                description: "algae growth visible"
            }
        });

        assert.equal(domains.includes("facade-wall-systems"), false);
    }
);

runTest(
    "concrete-only routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "concrete",
                location: "concrete beam",
                description: "durability concern in reinforced concrete"
            },
            building: {
                constructionType: "reinforced concrete"
            }
        });

        assert.deepStrictEqual(domains, ["concrete-corrosion"]);
    }
);

runTest(
    "crack-only routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "crack",
                location: "window opening",
                description: "diagonal crack from corner"
            }
        });

        assert.deepStrictEqual(domains, ["crack"]);
    }
);

runTest(
    "moisture-only routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "moisture",
                location: "interior wall",
                description: "surface dampness"
            }
        });

        assert.deepStrictEqual(domains, ["moisture"]);
    }
);

runTest(
    "windows-doors-only routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "window",
                location: "window frame",
                description: "defective perimeter seal at frame edge"
            },
            building: {
                windowType: "casement"
            }
        });

        assert.deepStrictEqual(domains, ["windows-doors"]);
    }
);

runTest(
    "window leakage plus roof-envelope plus moisture",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "moisture",
                location: "window sill and reveal",
                description: "water penetration at window connection with flashing issue",
                observations: ["rain-related ingress"]
            },
            building: {
                constructionType: "apartment"
            }
        });

        assert.deepStrictEqual(domains, ["windows-doors", "roof-envelope", "moisture"]);
    }
);

runTest(
    "basement window leakage overlap",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "moisture",
                location: "basement window",
                description: "water penetration at window connection and flashing",
                observations: ["seepage at reveal"]
            },
            building: {
                basementType: "full basement"
            }
        });

        assert.deepStrictEqual(domains, ["basement-waterproofing", "windows-doors", "roof-envelope", "moisture"]);
    }
);

runTest(
    "window condensation plus moisture",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "moisture",
                location: "window glazing",
                description: "condensation on glazing",
                observations: ["surface moisture"]
            }
        });

        assert.deepStrictEqual(domains, ["windows-doors", "moisture"]);
    }
);

runTest(
    "crack adjacent to window opening without connection relevance",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "crack",
                location: "wall near window opening",
                description: "diagonal crack in plaster adjacent to opening",
                observations: ["widening line"]
            }
        });

        assert.deepStrictEqual(domains, ["crack"]);
    }
);

runTest(
    "crack adjacent to window opening with connection relevance",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "crack",
                location: "window frame joint",
                description: "crack and leakage at window installation joint",
                observations: ["seal discontinuity"]
            }
        });

        assert.deepStrictEqual(domains, ["windows-doors", "moisture", "crack"]);
    }
);

runTest(
    "exterior door seal defect",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "door",
                location: "exterior door threshold",
                description: "defective exterior door seal",
                observations: ["draught at gasket"]
            }
        });

        assert.deepStrictEqual(domains, ["windows-doors"]);
    }
);

runTest(
    "basement-only routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "inspection",
                location: "basement wall",
                description: "below-grade tanking detail review"
            },
            building: {
                basementType: "full basement"
            }
        });

        assert.deepStrictEqual(domains, ["basement-waterproofing"]);
    }
);

runTest(
    "basement plus moisture routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "moisture",
                location: "basement wall",
                description: "dampness and seepage"
            },
            building: {
                basementType: "full basement"
            }
        });

        assert.deepStrictEqual(domains, ["basement-waterproofing", "moisture"]);
    }
);

runTest(
    "basement plus crack plus moisture routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "moisture",
                location: "basement wall crack",
                description: "wet crack and seepage at retaining wall"
            },
            building: {
                basementType: "full basement"
            }
        });

        assert.deepStrictEqual(domains, ["basement-waterproofing", "moisture", "crack"]);
    }
);

runTest(
    "basement plus concrete-corrosion routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "corrosion",
                location: "reinforced concrete basement wall",
                description: "spalling and rust staining"
            },
            building: {
                basementType: "full basement",
                constructionType: "reinforced concrete"
            }
        });

        assert.deepStrictEqual(domains, ["concrete-corrosion", "basement-waterproofing"]);
    }
);

runTest(
    "roof-envelope category also routes moisture",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "roof-envelope",
                location: "roof penetration",
                description: "failed flashing detail"
            }
        });

        assert.deepStrictEqual(domains, ["roof-envelope", "moisture"]);
    }
);

runTest(
    "no false routing for roof-only findings",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "roof-envelope",
                location: "roof penetration",
                description: "water ingress near flashing"
            },
            building: {
                constructionType: "apartment"
            }
        });

        assert.deepStrictEqual(domains, ["roof-envelope", "moisture"]);
        assert.equal(domains.includes("basement-waterproofing"), false);
    }
);

runTest(
    "no false routing for generic indoor moisture",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "moisture",
                location: "interior wall",
                description: "condensation near cold corner"
            },
            building: {
                constructionType: "apartment"
            }
        });

        assert.deepStrictEqual(domains, ["moisture"]);
    }
);

runTest(
    "no false routing for cabinet door",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "door",
                location: "kitchen cabinet door",
                description: "cabinet door hinge loose"
            }
        });

        assert.deepStrictEqual(domains, []);
    }
);

runTest(
    "no false routing for lift door",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "door",
                location: "lift door",
                description: "lift door panel misalignment"
            }
        });

        assert.deepStrictEqual(domains, []);
    }
);

runTest(
    "no false routing for roof-only flashing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "roof-envelope",
                location: "roof flashing",
                description: "defective roof flashing with rain ingress"
            }
        });

        assert.deepStrictEqual(domains, ["roof-envelope", "moisture"]);
        assert.equal(domains.includes("windows-doors"), false);
    }
);

runTest(
    "overlapping crack and concrete routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "corrosion",
                location: "concrete slab",
                description: "spalling with crack and rust staining"
            }
        });

        assert.deepStrictEqual(domains, ["concrete-corrosion", "crack"]);
    }
);

runTest(
    "overlapping moisture and roof-envelope routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "moisture",
                location: "roof penetration",
                description: "water ingress near flashing"
            }
        });

        assert.deepStrictEqual(domains, ["roof-envelope", "moisture"]);
    }
);

runTest(
    "stable domain precedence",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "corrosion",
                location: "reinforced concrete basement external wall window frame crack",
                description: "water ingress with rust staining and spalling facade finish at window joint and flashing"
            }
        });

        assert.deepStrictEqual(domains, ["concrete-corrosion", "basement-waterproofing", "windows-doors", "facade-wall-systems", "roof-envelope", "moisture", "crack"]);
    }
);

runTest(
    "unknown input",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "inspection"
            }
        });

        assert.deepStrictEqual(domains, []);
    }
);

runTest(
    "deterministic output",
    () => {
        const input = {
            finding: {
                category: "corrosion",
                location: "concrete beam",
                description: "exposed reinforcement and rust staining"
            },
            building: {
                constructionType: "reinforced concrete"
            }
        };

        const result1 = KnowledgeDomainRouter.resolve(input);
        const result2 = KnowledgeDomainRouter.resolve(input);

        assert.deepStrictEqual(result1, result2);
    }
);

runTest(
    "immutable input",
    () => {
        const input = {
            finding: {
                category: "moisture",
                location: "roof penetration",
                description: "water ingress"
            },
            building: {
                constructionType: "apartment"
            },
            measurements: [
                {
                    type: "note",
                    value: "staining"
                }
            ]
        };

        const original = structuredClone(input);

        KnowledgeDomainRouter.resolve(input);

        assert.deepStrictEqual(input, original);
    }
);

console.log("KnowledgeDomainRouter tests completed successfully.");
