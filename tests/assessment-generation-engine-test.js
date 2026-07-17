import assert from "node:assert/strict";
import AssessmentGenerationEngine from "../portal/core/AssessmentGenerationEngine.js";

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
    "groups findings by category",
    () => {
        const result =
            AssessmentGenerationEngine.generateAssessments(
                [
                    {
                        findingId: "f-moisture",
                        category: "Building Envelope",
                        severity: "high"
                    },
                    {
                        findingId: "f-crack",
                        category: "Structure",
                        severity: "medium"
                    }
                ]
            );

        assert.equal(result.length, 2);
        assert.equal(
            result[0].category,
            "Building Envelope"
        );
        assert.equal(
            result[1].category,
            "Structure"
        );
    }
);

runTest(
    "combines findings from the same category",
    () => {
        const result =
            AssessmentGenerationEngine.generateAssessments(
                [
                    {
                        findingId: "f-one",
                        category: "Moisture",
                        severity: "medium"
                    },
                    {
                        findingId: "f-two",
                        category: "Moisture",
                        severity: "high"
                    }
                ]
            );

        assert.equal(result.length, 1);
        assert.deepEqual(
            result[0].findingIds,
            [
                "f-one",
                "f-two"
            ]
        );
    }
);

runTest(
    "critical severity produces critical risk and condition",
    () => {
        const result =
            AssessmentGenerationEngine.generateAssessments(
                [
                    {
                        findingId: "f-critical",
                        category: "Structure",
                        severity: "critical"
                    }
                ]
            );

        assert.equal(
            result[0].risk,
            "critical"
        );
        assert.equal(
            result[0].condition,
            "critical"
        );
    }
);

runTest(
    "high severity produces high risk and poor condition",
    () => {
        const result =
            AssessmentGenerationEngine.generateAssessments(
                [
                    {
                        findingId: "f-high",
                        category: "Roof",
                        severity: "high"
                    }
                ]
            );

        assert.equal(
            result[0].risk,
            "high"
        );
        assert.equal(
            result[0].condition,
            "poor"
        );
    }
);

runTest(
    "medium severity produces medium risk and fair condition",
    () => {
        const result =
            AssessmentGenerationEngine.generateAssessments(
                [
                    {
                        findingId: "f-medium",
                        category: "Facade",
                        severity: "medium"
                    }
                ]
            );

        assert.equal(
            result[0].risk,
            "medium"
        );
        assert.equal(
            result[0].condition,
            "fair"
        );
    }
);

runTest(
    "low severity produces low risk and good condition",
    () => {
        const result =
            AssessmentGenerationEngine.generateAssessments(
                [
                    {
                        findingId: "f-low",
                        category: "Interior",
                        severity: "low"
                    }
                ]
            );

        assert.equal(
            result[0].risk,
            "low"
        );
        assert.equal(
            result[0].condition,
            "good"
        );
    }
);

runTest(
    "highest severity determines category risk",
    () => {
        const result =
            AssessmentGenerationEngine.generateAssessments(
                [
                    {
                        findingId: "f-low",
                        category: "Roof",
                        severity: "low"
                    },
                    {
                        findingId: "f-high",
                        category: "Roof",
                        severity: "high"
                    },
                    {
                        findingId: "f-medium",
                        category: "Roof",
                        severity: "medium"
                    }
                ]
            );

        assert.equal(
            result[0].risk,
            "high"
        );
        assert.equal(
            result[0].condition,
            "poor"
        );
    }
);

runTest(
    "confirmed finding makes assessment confirmed",
    () => {
        const result =
            AssessmentGenerationEngine.generateAssessments(
                [
                    {
                        findingId: "f-one",
                        category: "Moisture",
                        severity: "medium",
                        confidence: "supported"
                    },
                    {
                        findingId: "f-two",
                        category: "Moisture",
                        severity: "high",
                        confidence: "confirmed"
                    }
                ]
            );

        assert.equal(
            result[0].confidence,
            "confirmed"
        );
    }
);

runTest(
    "assessment is supported when no finding is confirmed",
    () => {
        const result =
            AssessmentGenerationEngine.generateAssessments(
                [
                    {
                        findingId: "f-one",
                        category: "Moisture",
                        severity: "medium",
                        confidence: "preliminary"
                    },
                    {
                        findingId: "f-two",
                        category: "Moisture",
                        severity: "low",
                        confidence: "supported"
                    }
                ]
            );

        assert.equal(
            result[0].confidence,
            "supported"
        );
    }
);

runTest(
    "creates stable assessment id",
    () => {
        const result =
            AssessmentGenerationEngine.generateAssessments(
                [
                    {
                        findingId: "f-one",
                        category:
                            "Building Envelope & Moisture",
                        severity: "high"
                    }
                ]
            );

        assert.equal(
            result[0].assessmentId,
            "building-envelope-moisture"
        );
    }
);

runTest(
    "uses General category when category is missing",
    () => {
        const result =
            AssessmentGenerationEngine.generateAssessments(
                [
                    {
                        findingId: "f-general",
                        severity: "medium"
                    }
                ]
            );

        assert.equal(
            result[0].category,
            "General"
        );
        assert.equal(
            result[0].assessmentId,
            "general"
        );
    }
);

runTest(
    "uses medium severity when severity is missing",
    () => {
        const result =
            AssessmentGenerationEngine.generateAssessments(
                [
                    {
                        findingId: "f-default",
                        category: "General"
                    }
                ]
            );

        assert.equal(
            result[0].risk,
            "medium"
        );
        assert.equal(
            result[0].condition,
            "fair"
        );
    }
);

runTest(
    "creates expected summary",
    () => {
        const result =
            AssessmentGenerationEngine.generateAssessments(
                [
                    {
                        findingId: "f-one",
                        category: "Roof",
                        severity: "medium"
                    },
                    {
                        findingId: "f-two",
                        category: "Roof",
                        severity: "high"
                    }
                ]
            );

        assert.equal(
            result[0].summary,
            "2 finding(s) assessed for Roof."
        );
    }
);

runTest(
    "ignores invalid finding entries",
    () => {
        const result =
            AssessmentGenerationEngine.generateAssessments(
                [
                    null,
                    undefined,
                    "invalid",
                    {
                        findingId: "f-valid",
                        category: "Roof",
                        severity: "low"
                    }
                ]
            );

        assert.equal(result.length, 1);
        assert.deepEqual(
            result[0].findingIds,
            ["f-valid"]
        );
    }
);

runTest(
    "empty findings return empty result",
    () => {
        assert.deepEqual(
            AssessmentGenerationEngine.generateAssessments(
                []
            ),
            []
        );
    }
);

runTest(
    "invalid findings collection returns empty result",
    () => {
        assert.deepEqual(
            AssessmentGenerationEngine.generateAssessments(
                null
            ),
            []
        );

        assert.deepEqual(
            AssessmentGenerationEngine.generateAssessments(
                {}
            ),
            []
        );
    }
);

runTest(
    "does not modify source findings or context",
    () => {
        const findings = [
            {
                findingId: "f-one",
                category: "Roof",
                severity: "high",
                confidence: "confirmed"
            }
        ];

        const context = {
            profile: {
                country: "Thailand"
            }
        };

        const findingsBefore =
            JSON.stringify(findings);
        const contextBefore =
            JSON.stringify(context);

        AssessmentGenerationEngine.generateAssessments(
            findings,
            context
        );

        assert.equal(
            JSON.stringify(findings),
            findingsBefore
        );
        assert.equal(
            JSON.stringify(context),
            contextBefore
        );
    }
);

console.log(
    "AssessmentGenerationEngine tests completed successfully."
);
