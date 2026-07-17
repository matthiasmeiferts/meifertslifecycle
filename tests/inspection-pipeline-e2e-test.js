import assert
    from "node:assert/strict";

import InspectionPipelineEngine
    from "../portal/core/InspectionPipelineEngine.js";

function runTest(
    name,
    callback
) {
    try {
        callback();

        console.log(
            `✓ ${name}`
        );
    } catch (error) {
        console.error(
            `✗ ${name}`
        );

        throw error;
    }
}

const questions = [
    {
        id:
            "q-roof-condition",

        category:
            "Roof",

        required:
            true,

        priority:
            90,

        visibility: {
            countries: [
                "Thailand"
            ]
        },

        followUps: [
            {
                ruleId:
                    "fu-roof-damage",

                equals:
                    "damaged",

                question: {
                    id:
                        "q-roof-damage-detail",

                    category:
                        "Roof",

                    required:
                        true,

                    priority:
                        95,

                    evidenceRules: [
                        {
                            evidenceId:
                                "e-roof-damage",

                            answered:
                                true,

                            type:
                                "observation",

                            summary:
                                "Roof damage detail documented"
                        }
                    ],

                    findingRules: [
                        {
                            findingId:
                                "f-roof-damage",

                            answered:
                                true,

                            category:
                                "Roof",

                            severity:
                                "high",

                            summary:
                                "Roof damage requires corrective action",

                            evidenceRequired:
                                true,

                            evidenceIds: [
                                "e-roof-damage"
                            ]
                        }
                    ]
                }
            }
        ]
    },

    {
        id:
            "q-electrical-condition",

        category:
            "Electrical",

        required:
            true,

        priority:
            80,

        evidenceRules: [
            {
                evidenceId:
                    "e-electrical-risk",

                equals:
                    "unsafe",

                type:
                    "observation",

                summary:
                    "Unsafe electrical condition documented"
            }
        ],

        findingRules: [
            {
                findingId:
                    "f-electrical-risk",

                equals:
                    "unsafe",

                category:
                    "Electrical",

                severity:
                    "critical",

                summary:
                    "Unsafe electrical installation",

                evidenceRequired:
                    true,

                evidenceIds: [
                    "e-electrical-risk"
                ]
            }
        ]
    },

    {
        id:
            "q-pool-condition",

        category:
            "Pool",

        required:
            false,

        priority:
            50,

        visibility: {
            buildingTypes: [
                "Villa"
            ]
        }
    }
];

const context = {
    inspectionId:
        "inspection-e2e-1",

    profile: {
        country:
            "Thailand",

        buildingType:
            "Condominium"
    }
};

const answers = {
    "q-roof-condition":
        "damaged",

    "q-roof-damage-detail":
        "major membrane failure",

    "q-electrical-condition":
        "unsafe"
};

const result =
    InspectionPipelineEngine.run({
        questions,
        answers,
        context
    });

runTest(
    "returns a complete end-to-end pipeline result",
    () => {
        assert.ok(
            result
        );

        assert.ok(
            result.report
        );
    }
);

runTest(
    "filters invisible questions",
    () => {
        assert.equal(
            result.visibleQuestions.some(
                (question) =>
                    question.id ===
                    "q-pool-condition"
            ),
            false
        );
    }
);

runTest(
    "generates the expected roof follow-up",
    () => {
        assert.equal(
            result.generatedFollowUps.some(
                (entry) =>
                    entry.question?.id ===
                    "q-roof-damage-detail"
            ),
            true
        );
    }
);

runTest(
    "creates evidence from source and follow-up questions",
    () => {
        const evidenceIds =
            result.evidence.map(
                (item) =>
                    item.evidenceId
            );

        assert.equal(
            evidenceIds.includes(
                "e-roof-damage"
            ),
            true
        );

        assert.equal(
            evidenceIds.includes(
                "e-electrical-risk"
            ),
            true
        );
    }
);

runTest(
    "creates roof and electrical findings",
    () => {
        const findingIds =
            result.findings.map(
                (item) =>
                    item.findingId
            );

        assert.equal(
            findingIds.includes(
                "f-roof-damage"
            ),
            true
        );

        assert.equal(
            findingIds.includes(
                "f-electrical-risk"
            ),
            true
        );
    }
);

runTest(
    "creates category assessments",
    () => {
        const categories =
            result.assessments.map(
                (item) =>
                    item.category
            );

        assert.equal(
            categories.includes(
                "Roof"
            ),
            true
        );

        assert.equal(
            categories.includes(
                "Electrical"
            ),
            true
        );
    }
);

runTest(
    "creates recommendations for every assessment",
    () => {
        assert.equal(
            result.recommendations.length,
            result.assessments.length
        );
    }
);

runTest(
    "reports critical as the highest risk",
    () => {
        assert.equal(
            result.report.summary.highestRisk,
            "critical"
        );
    }
);

runTest(
    "preserves inspection context and answers",
    () => {
        assert.equal(
            result.report.context.inspectionId,
            "inspection-e2e-1"
        );

        assert.deepEqual(
            result.report.context.answers,
            answers
        );
    }
);

runTest(
    "maintains consistent cross-object references",
    () => {
        const findingIds =
            new Set(
                result.findings.map(
                    (item) =>
                        item.findingId
                )
            );

        for (
            const assessment
            of result.assessments
        ) {
            for (
                const findingId
                of assessment.findingIds
            ) {
                assert.equal(
                    findingIds.has(
                        findingId
                    ),
                    true
                );
            }
        }

        const assessmentIds =
            new Set(
                result.assessments.map(
                    (item) =>
                        item.assessmentId
                )
            );

        for (
            const recommendation
            of result.recommendations
        ) {
            for (
                const assessmentId
                of recommendation.assessmentIds
            ) {
                assert.equal(
                    assessmentIds.has(
                        assessmentId
                    ),
                    true
                );
            }
        }
    }
);


runTest(
    "passes complete pipeline integrity validation",
    () => {
        assert.equal(
            result.integrity.valid,
            true,
            JSON.stringify(
                result.integrity.errors,
                null,
                2
            )
        );

        assert.deepEqual(
            result.integrity.errors,
            []
        );
    }
);

console.log(
    "InspectionPipelineEngine end-to-end tests completed successfully."
);
