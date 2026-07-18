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
                location: "roof concrete slab with crack",
                description: "water ingress with rust staining and spalling"
            }
        });

        assert.deepStrictEqual(domains, ["concrete-corrosion", "roof-envelope", "moisture", "crack"]);
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
