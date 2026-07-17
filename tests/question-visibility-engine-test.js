import assert from "node:assert/strict";
import QuestionVisibilityEngine from "../portal/core/QuestionVisibilityEngine.js";

function runTest(name, testFunction) {
    try {
        testFunction();
        console.log(`✓ ${name}`);
    } catch (error) {
        console.error(`✗ ${name}`);
        throw error;
    }
}

runTest(
    "question without visibility rules is visible",
    () => {
        const result = QuestionVisibilityEngine.isVisible(
            {},
            {}
        );

        assert.deepEqual(result, {
            visible: true,
            reasons: [],
            matchedRules: []
        });
    }
);

runTest(
    "question is visible when country matches",
    () => {
        const result = QuestionVisibilityEngine.isVisible(
            {
                visibility: {
                    countries: ["Thailand", "Germany"]
                }
            },
            {
                profile: {
                    country: "Thailand"
                }
            }
        );

        assert.equal(result.visible, true);
        assert.deepEqual(result.reasons, []);
        assert.deepEqual(result.matchedRules, ["countries"]);
    }
);

runTest(
    "question is hidden when country does not match",
    () => {
        const result = QuestionVisibilityEngine.isVisible(
            {
                visibility: {
                    countries: ["Thailand"]
                }
            },
            {
                profile: {
                    country: "Germany"
                }
            }
        );

        assert.equal(result.visible, false);
        assert.deepEqual(
            result.reasons,
            ["countries_not_supported"]
        );
        assert.deepEqual(result.matchedRules, []);
    }
);

runTest(
    "question is visible when all configured rules match",
    () => {
        const result = QuestionVisibilityEngine.isVisible(
            {
                visibility: {
                    countries: ["Thailand"],
                    buildingTypes: ["Condominium"],
                    useTypes: ["Residential"],
                    climateZones: ["Tropical"],
                    ageBands: ["2000-2010"]
                }
            },
            {
                profile: {
                    country: "Thailand",
                    buildingType: "Condominium",
                    useType: "Residential",
                    climateZone: "Tropical",
                    ageBand: "2000-2010"
                }
            }
        );

        assert.equal(result.visible, true);
        assert.deepEqual(result.reasons, []);
        assert.deepEqual(
            result.matchedRules,
            [
                "countries",
                "buildingTypes",
                "useTypes",
                "climateZones",
                "ageBands"
            ]
        );
    }
);

runTest(
    "question returns all visibility failures",
    () => {
        const result = QuestionVisibilityEngine.isVisible(
            {
                visibility: {
                    countries: ["Thailand"],
                    buildingTypes: ["Condominium"],
                    useTypes: ["Residential"],
                    climateZones: ["Tropical"],
                    ageBands: ["2000-2010"]
                }
            },
            {
                profile: {
                    country: "Germany",
                    buildingType: "Office",
                    useType: "Commercial",
                    climateZone: "Temperate",
                    ageBand: "Before-1950"
                }
            }
        );

        assert.equal(result.visible, false);
        assert.deepEqual(
            result.reasons,
            [
                "countries_not_supported",
                "buildingTypes_not_supported",
                "useTypes_not_supported",
                "climateZones_not_supported",
                "ageBands_not_supported"
            ]
        );
        assert.deepEqual(result.matchedRules, []);
    }
);

runTest(
    "empty rule arrays do not restrict visibility",
    () => {
        const result = QuestionVisibilityEngine.isVisible(
            {
                visibility: {
                    countries: [],
                    buildingTypes: []
                }
            },
            {
                profile: {
                    country: "Germany",
                    buildingType: "Office"
                }
            }
        );

        assert.deepEqual(result, {
            visible: true,
            reasons: [],
            matchedRules: []
        });
    }
);

runTest(
    "missing profile value hides a restricted question",
    () => {
        const result = QuestionVisibilityEngine.isVisible(
            {
                visibility: {
                    countries: ["Thailand"]
                }
            },
            {
                profile: {}
            }
        );

        assert.equal(result.visible, false);
        assert.deepEqual(
            result.reasons,
            ["countries_not_supported"]
        );
    }
);

console.log(
    "QuestionVisibilityEngine tests completed successfully."
);
