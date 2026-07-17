import assert from "node:assert/strict";
import RecommendationGenerationEngine from "../portal/core/RecommendationGenerationEngine.js";

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
    "creates recommendation from assessment",
    () => {
        const result =
            RecommendationGenerationEngine.generateRecommendations(
                [
                    {
                        assessmentId: "roof-assessment",
                        category: "Roof",
                        risk: "high",
                        summary: "Roof condition is poor."
                    }
                ]
            );

        assert.equal(result.length, 1);
        assert.equal(
            result[0].category,
            "Roof"
        );
        assert.equal(
            result[0].priority,
            "high"
        );
        assert.equal(
            result[0].timeframe,
            "Within 30 days"
        );
        assert.equal(
            result[0].justification,
            "Roof condition is poor."
        );
        assert.deepEqual(
            result[0].assessmentIds,
            ["roof-assessment"]
        );
        assert.equal(
            result[0].generated,
            true
        );
    }
);

runTest(
    "critical risk creates immediate specialist action",
    () => {
        const result =
            RecommendationGenerationEngine.generateRecommendations(
                [
                    {
                        assessmentId:
                            "structure-assessment",
                        category: "Structure",
                        risk: "critical"
                    }
                ]
            );

        assert.equal(
            result[0].priority,
            "critical"
        );
        assert.equal(
            result[0].timeframe,
            "Immediately"
        );
        assert.equal(
            result[0].action,
            "Immediate specialist assessment required for Structure."
        );
    }
);

runTest(
    "high risk creates corrective action plan",
    () => {
        const result =
            RecommendationGenerationEngine.generateRecommendations(
                [
                    {
                        assessmentId:
                            "moisture-assessment",
                        category: "Moisture",
                        risk: "high"
                    }
                ]
            );

        assert.equal(
            result[0].action,
            "Prepare corrective action plan for Moisture."
        );
    }
);

runTest(
    "medium risk creates maintenance review",
    () => {
        const result =
            RecommendationGenerationEngine.generateRecommendations(
                [
                    {
                        assessmentId:
                            "facade-assessment",
                        category: "Facade",
                        risk: "medium"
                    }
                ]
            );

        assert.equal(
            result[0].priority,
            "medium"
        );
        assert.equal(
            result[0].timeframe,
            "Within 6 months"
        );
        assert.equal(
            result[0].action,
            "Schedule maintenance review for Facade."
        );
    }
);

runTest(
    "low risk creates routine monitoring recommendation",
    () => {
        const result =
            RecommendationGenerationEngine.generateRecommendations(
                [
                    {
                        assessmentId:
                            "interior-assessment",
                        category: "Interior",
                        risk: "low"
                    }
                ]
            );

        assert.equal(
            result[0].priority,
            "low"
        );
        assert.equal(
            result[0].timeframe,
            "Monitor"
        );
        assert.equal(
            result[0].action,
            "Continue routine monitoring of Interior."
        );
    }
);

runTest(
    "missing risk defaults to medium",
    () => {
        const result =
            RecommendationGenerationEngine.generateRecommendations(
                [
                    {
                        assessmentId:
                            "general-assessment",
                        category: "General"
                    }
                ]
            );

        assert.equal(
            result[0].priority,
            "medium"
        );
        assert.equal(
            result[0].timeframe,
            "Within 6 months"
        );
    }
);

runTest(
    "missing category defaults to General",
    () => {
        const result =
            RecommendationGenerationEngine.generateRecommendations(
                [
                    {
                        assessmentId:
                            "general-assessment",
                        risk: "low"
                    }
                ]
            );

        assert.equal(
            result[0].category,
            "General"
        );
        assert.equal(
            result[0].action,
            "Continue routine monitoring of General."
        );
    }
);

runTest(
    "creates automatic recommendation ids",
    () => {
        const result =
            RecommendationGenerationEngine.generateRecommendations(
                [
                    {
                        assessmentId: "a-one",
                        risk: "low"
                    },
                    {
                        assessmentId: "a-two",
                        risk: "medium"
                    }
                ]
            );

        assert.deepEqual(
            result.map(
                (entry) =>
                    entry.recommendationId
            ),
            [
                "recommendation-1",
                "recommendation-2"
            ]
        );
    }
);

runTest(
    "uses explicit recommendation id",
    () => {
        const result =
            RecommendationGenerationEngine.generateRecommendations(
                [
                    {
                        assessmentId:
                            "roof-assessment",
                        recommendationId:
                            "replace-roof",
                        category: "Roof",
                        risk: "high"
                    }
                ]
            );

        assert.equal(
            result[0].recommendationId,
            "replace-roof"
        );
    }
);

runTest(
    "duplicate recommendation ids are ignored",
    () => {
        const result =
            RecommendationGenerationEngine.generateRecommendations(
                [
                    {
                        assessmentId: "a-one",
                        recommendationId:
                            "shared-recommendation",
                        category: "Roof",
                        risk: "high"
                    },
                    {
                        assessmentId: "a-two",
                        recommendationId:
                            "shared-recommendation",
                        category: "Facade",
                        risk: "medium"
                    }
                ]
            );

        assert.equal(result.length, 1);
        assert.equal(
            result[0].category,
            "Roof"
        );
    }
);

runTest(
    "missing assessment id creates empty assessment id list",
    () => {
        const result =
            RecommendationGenerationEngine.generateRecommendations(
                [
                    {
                        category: "Roof",
                        risk: "high"
                    }
                ]
            );

        assert.deepEqual(
            result[0].assessmentIds,
            []
        );
    }
);

runTest(
    "ignores invalid assessment entries",
    () => {
        const result =
            RecommendationGenerationEngine.generateRecommendations(
                [
                    null,
                    undefined,
                    "invalid",
                    {
                        assessmentId:
                            "valid-assessment",
                        category: "Roof",
                        risk: "low"
                    }
                ]
            );

        assert.equal(result.length, 1);
        assert.deepEqual(
            result[0].assessmentIds,
            ["valid-assessment"]
        );
    }
);

runTest(
    "empty assessment collection returns empty result",
    () => {
        assert.deepEqual(
            RecommendationGenerationEngine.generateRecommendations(
                []
            ),
            []
        );
    }
);

runTest(
    "invalid assessment collection returns empty result",
    () => {
        assert.deepEqual(
            RecommendationGenerationEngine.generateRecommendations(
                null
            ),
            []
        );

        assert.deepEqual(
            RecommendationGenerationEngine.generateRecommendations(
                {}
            ),
            []
        );
    }
);

runTest(
    "preserves recommendation order",
    () => {
        const result =
            RecommendationGenerationEngine.generateRecommendations(
                [
                    {
                        assessmentId: "first",
                        category: "Roof",
                        risk: "critical"
                    },
                    {
                        assessmentId: "second",
                        category: "Facade",
                        risk: "low"
                    }
                ]
            );

        assert.deepEqual(
            result.map(
                (entry) =>
                    entry.assessmentIds[0]
            ),
            [
                "first",
                "second"
            ]
        );
    }
);

runTest(
    "does not modify assessments or context",
    () => {
        const assessments = [
            {
                assessmentId:
                    "roof-assessment",
                category: "Roof",
                risk: "high",
                summary:
                    "Roof condition is poor."
            }
        ];

        const context = {
            profile: {
                country: "Thailand"
            }
        };

        const assessmentsBefore =
            JSON.stringify(assessments);
        const contextBefore =
            JSON.stringify(context);

        RecommendationGenerationEngine.generateRecommendations(
            assessments,
            context
        );

        assert.equal(
            JSON.stringify(assessments),
            assessmentsBefore
        );
        assert.equal(
            JSON.stringify(context),
            contextBefore
        );
    }
);

console.log(
    "RecommendationGenerationEngine tests completed successfully."
);
