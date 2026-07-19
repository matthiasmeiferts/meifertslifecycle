import assert from "node:assert/strict";

import ExpertReasoningEngine from "../portal/core/ExpertReasoningEngine.js";

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
    "valid contract and deterministic output",
    () => {

        const input = {
            finding: {
                id: "f-1",
                category: "Moisture",
                summary: "Visible damp staining near the balcony door"
            },
            building: {
                type: "Condominium",
                age: 12
            },
            measurements: [
                {
                    name: "Relative humidity",
                    value: 78
                }
            ],
            context: {
                notes: "Coastal exposure"
            }
        };

        const result1 =
            ExpertReasoningEngine.analyze(input);

        const result2 =
            ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(
            result1,
            result2
        );

        assert.ok(
            result1 &&
            typeof result1 === "object"
        );

        assert.ok(result1.primaryHypothesis);
        assert.ok(Array.isArray(result1.alternativeHypotheses));
        assert.ok(Array.isArray(result1.supportingEvidence));
        assert.ok(Array.isArray(result1.missingEvidence));
        assert.ok(Array.isArray(result1.requiredVerification));
        assert.ok(Array.isArray(result1.potentialConsequences));
        assert.equal(typeof result1.confidence, "number");

    }
);

runTest(
    "immutable inputs",
    () => {

        const input = {
            finding: {
                id: "f-2",
                summary: "Crack line at the facade"
            },
            building: {
                type: "Apartment"
            },
            measurements: [
                {
                    name: "Crack width",
                    value: 1.2
                }
            ],
            context: {
                notes: "Inspection note"
            }
        };

        const original =
            structuredClone(input);

        ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(
            input,
            original
        );

    }
);

runTest(
    "empty input returns stable contract",
    () => {

        const result =
            ExpertReasoningEngine.analyze();

        assert.ok(result.primaryHypothesis);
        assert.ok(Array.isArray(result.alternativeHypotheses));
        assert.ok(Array.isArray(result.supportingEvidence));
        assert.ok(Array.isArray(result.missingEvidence));
        assert.ok(Array.isArray(result.requiredVerification));
        assert.ok(Array.isArray(result.potentialConsequences));
        assert.equal(typeof result.confidence, "number");

    }
);

runTest(
    "multiple hypotheses are returned",
    () => {

        const result =
            ExpertReasoningEngine.analyze({
                finding: {
                    summary: "Water stain and moisture around a crack"
                },
                measurements: [
                    {
                        name: "Humidity",
                        value: 81
                    }
                ]
            });

        assert.ok(result.alternativeHypotheses.length >= 2);

    }
);

runTest(
    "confidence stays within range",
    () => {

        const result =
            ExpertReasoningEngine.analyze({
                finding: {
                    summary: "Moisture stain with supporting measurements"
                },
                building: {
                    type: "Condominium"
                },
                measurements: [
                    {
                        name: "Humidity",
                        value: 79
                    },
                    {
                        name: "Surface temperature",
                        value: 24
                    }
                ]
            });

        assert.ok(result.confidence >= 0);
        assert.ok(result.confidence <= 100);

    }
);

runTest(
    "language option is outside technical input and omitted language remains English",
    () => {

        const input = {
            language: "de",
            finding: {
                category: "window",
                location: "frame perimeter",
                description: "defective perimeter seal and draught"
            },
            building: {
                frameMaterial: "aluminum"
            }
        };

        const result = ExpertReasoningEngine.analyze(input);

        assert.equal(result.primaryHypothesis.id, "defective-perimeter-seal");
        assert.equal(result.primaryHypothesis.cause, "defective perimeter seal");

    }
);

runTest(
    "explicit German option renders windows-doors output without changing IDs",
    () => {

        const input = {
            finding: {
                category: "window",
                location: "frame perimeter",
                description: "defective perimeter seal and draught"
            },
            building: {
                frameMaterial: "aluminum"
            }
        };

        const english = ExpertReasoningEngine.analyze(input, { language: "en" });
        const german = ExpertReasoningEngine.analyze(input, { language: "de" });

        assert.equal(english.primaryHypothesis.id, german.primaryHypothesis.id);
        assert.equal(english.primaryHypothesis.cause, "defective perimeter seal");
        assert.equal(german.primaryHypothesis.cause, "mangelhafte Anschlussdichtung");

    }
);

runTest(
    "unsupported language option falls back to English",
    () => {

        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "window",
                location: "frame perimeter",
                description: "defective perimeter seal and draught"
            },
            building: {
                frameMaterial: "aluminum"
            }
        }, { language: "fr" });

        assert.equal(result.primaryHypothesis.cause, "defective perimeter seal");

    }
);

runTest(
    "five-path API compatibility for omitted empty English and unsupported language options",
    () => {
        const cases = [
            {
                finding: { category: "window", location: "frame perimeter", description: "defective perimeter seal and draught" },
                building: { frameMaterial: "aluminum" }
            },
            {
                finding: { category: "moisture", location: "basement wall", description: "damp staining and salt marks" },
                building: { basementPresent: true }
            },
            {
                finding: { category: "crack", location: "window opening", description: "diagonal crack from opening corner" }
            },
            {
                finding: { category: "hvac", location: "plant room", description: "corroded heating pipe insulation and leaking valve" }
            },
            {
                finding: { category: "inspection note", description: "general observation without defect" }
            }
        ];

        cases.forEach((input) => {
            const omitted = ExpertReasoningEngine.analyze(input);
            const emptyOptions = ExpertReasoningEngine.analyze(input, {});
            const english = ExpertReasoningEngine.analyze(input, { language: "en" });
            const unsupported = ExpertReasoningEngine.analyze(input, { language: "fr" });

            assert.deepStrictEqual(omitted, emptyOptions);
            assert.deepStrictEqual(emptyOptions, english);
            assert.deepStrictEqual(unsupported, english);
        });
    }
);

runTest(
    "input and options isolation for language and canonical context",
    () => {
        const input = {
            language: "de",
            finding: {
                category: "window",
                location: "frame perimeter",
                description: "defective perimeter seal and draught",
                observations: ["sealant issue"]
            },
            building: {
                frameMaterial: "aluminum"
            },
            measurements: [
                { type: "note", value: "draught", location: "frame" }
            ]
        };
        const options = { language: "de" };
        const originalInput = structuredClone(input);
        const originalOptions = structuredClone(options);
        const inputLanguageResult = ExpertReasoningEngine.analyze(input);
        const optionsLanguageResult = ExpertReasoningEngine.analyze(input, options);

        assert.equal(inputLanguageResult.primaryHypothesis.cause, "defective perimeter seal");
        assert.equal(optionsLanguageResult.primaryHypothesis.cause, "mangelhafte Anschlussdichtung");
        assert.deepStrictEqual(input, originalInput);
        assert.deepStrictEqual(input.finding, originalInput.finding);
        assert.deepStrictEqual(input.measurements, originalInput.measurements);
        assert.deepStrictEqual(options, originalOptions);
        assert.equal(JSON.stringify(input).includes("expertIntelligenceCanonicalContext"), false);
        assert.equal(JSON.stringify(optionsLanguageResult).includes("expertIntelligenceCanonicalContext"), false);
        assert.equal(JSON.stringify(optionsLanguageResult).includes('"language"'), false);
        assert.equal(globalThis.LanguageManager, undefined);
    }
);

console.log(
    "ExpertReasoningEngine tests completed successfully."
);