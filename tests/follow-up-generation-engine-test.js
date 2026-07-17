import assert from "node:assert/strict";
import FollowUpGenerationEngine from "../portal/core/FollowUpGenerationEngine.js";

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
    "generates follow-up when answer equals expected value",
    () => {
        const questions = [
            {
                id: "q-moisture",
                followUps: [
                    {
                        equals: "yes",
                        question: {
                            id: "q-moisture-location",
                            text: "Where was moisture detected?"
                        }
                    }
                ]
            }
        ];

        const result =
            FollowUpGenerationEngine.generateFollowUps(
                questions,
                {
                    answers: {
                        "q-moisture": {
                            value: "yes"
                        }
                    }
                }
            );

        assert.equal(result.length, 1);
        assert.equal(
            result[0].question.id,
            "q-moisture-location"
        );
        assert.equal(
            result[0].sourceQuestionId,
            "q-moisture"
        );
        assert.equal(
            result[0].generationReason,
            "answer_equals"
        );
        assert.equal(
            result[0].question.generated,
            true
        );
        assert.equal(
            result[0].question.generatedFromQuestionId,
            "q-moisture"
        );
    }
);

runTest(
    "does not generate follow-up when answer differs",
    () => {
        const questions = [
            {
                id: "q-moisture",
                followUps: [
                    {
                        equals: "yes",
                        question: {
                            id: "q-moisture-location"
                        }
                    }
                ]
            }
        ];

        const result =
            FollowUpGenerationEngine.generateFollowUps(
                questions,
                {
                    answers: {
                        "q-moisture": {
                            value: "no"
                        }
                    }
                }
            );

        assert.deepEqual(result, []);
    }
);

runTest(
    "generates follow-up for oneOf match",
    () => {
        const questions = [
            {
                id: "q-crack",
                followUps: [
                    {
                        oneOf: [
                            "moderate",
                            "severe"
                        ],
                        question: {
                            id: "q-crack-width"
                        }
                    }
                ]
            }
        ];

        const result =
            FollowUpGenerationEngine.generateFollowUps(
                questions,
                {
                    answers: {
                        "q-crack": {
                            value: "severe"
                        }
                    }
                }
            );

        assert.equal(result.length, 1);
        assert.equal(
            result[0].generationReason,
            "answer_matches_one_of"
        );
    }
);

runTest(
    "false and zero count as meaningful answered values",
    () => {
        const questions = [
            {
                id: "q-false",
                followUps: [
                    {
                        answered: true,
                        question: {
                            id: "q-false-follow-up"
                        }
                    }
                ]
            },
            {
                id: "q-zero",
                followUps: [
                    {
                        answered: true,
                        question: {
                            id: "q-zero-follow-up"
                        }
                    }
                ]
            }
        ];

        const result =
            FollowUpGenerationEngine.generateFollowUps(
                questions,
                {
                    answers: {
                        "q-false": {
                            value: false
                        },
                        "q-zero": {
                            value: 0
                        }
                    }
                }
            );

        assert.deepEqual(
            result.map(
                (entry) => entry.question.id
            ),
            [
                "q-false-follow-up",
                "q-zero-follow-up"
            ]
        );
    }
);

runTest(
    "generates unanswered follow-up only when source has no meaningful answer",
    () => {
        const questions = [
            {
                id: "q-source",
                followUps: [
                    {
                        answered: false,
                        question: {
                            id: "q-source-reminder"
                        }
                    }
                ]
            }
        ];

        const missingResult =
            FollowUpGenerationEngine.generateFollowUps(
                questions,
                {
                    answers: {}
                }
            );

        const emptyResult =
            FollowUpGenerationEngine.generateFollowUps(
                questions,
                {
                    answers: {
                        "q-source": {
                            value: ""
                        }
                    }
                }
            );

        const answeredResult =
            FollowUpGenerationEngine.generateFollowUps(
                questions,
                {
                    answers: {
                        "q-source": {
                            value: "complete"
                        }
                    }
                }
            );

        assert.equal(missingResult.length, 1);
        assert.equal(emptyResult.length, 1);
        assert.equal(answeredResult.length, 0);
        assert.equal(
            missingResult[0].generationReason,
            "source_unanswered"
        );
    }
);

runTest(
    "generates context-dependent follow-up",
    () => {
        const questions = [
            {
                id: "q-roof",
                followUps: [
                    {
                        context: {
                            "profile.country": "Thailand",
                            "profile.buildingType":
                                "Condominium"
                        },
                        question: {
                            id: "q-roof-tropical-corrosion"
                        }
                    }
                ]
            }
        ];

        const result =
            FollowUpGenerationEngine.generateFollowUps(
                questions,
                {
                    profile: {
                        country: "Thailand",
                        buildingType:
                            "Condominium"
                    },
                    answers: {}
                }
            );

        assert.equal(result.length, 1);
        assert.equal(
            result[0].question.id,
            "q-roof-tropical-corrosion"
        );
        assert.equal(
            result[0].generationReason,
            "context_match"
        );
    }
);

runTest(
    "context arrays allow multiple accepted values",
    () => {
        const questions = [
            {
                id: "q-climate",
                followUps: [
                    {
                        context: {
                            "profile.climateZone": [
                                "Tropical",
                                "Subtropical"
                            ]
                        },
                        question: {
                            id: "q-corrosion-risk"
                        }
                    }
                ]
            }
        ];

        const result =
            FollowUpGenerationEngine.generateFollowUps(
                questions,
                {
                    profile: {
                        climateZone:
                            "Subtropical"
                    }
                }
            );

        assert.equal(result.length, 1);
    }
);

runTest(
    "creates automatic follow-up id when none is supplied",
    () => {
        const questions = [
            {
                id: "q-source",
                followUps: [
                    {
                        equals: "yes",
                        question: {
                            text: "Generated question"
                        }
                    }
                ]
            }
        ];

        const result =
            FollowUpGenerationEngine.generateFollowUps(
                questions,
                {
                    answers: {
                        "q-source": {
                            value: "yes"
                        }
                    }
                }
            );

        assert.equal(
            result[0].question.id,
            "q-source-follow-up-1"
        );
    }
);

runTest(
    "prevents duplicate generated question ids",
    () => {
        const questions = [
            {
                id: "q-one",
                followUps: [
                    {
                        question: {
                            id: "q-duplicate"
                        }
                    }
                ]
            },
            {
                id: "q-two",
                followUps: [
                    {
                        question: {
                            id: "q-duplicate"
                        }
                    }
                ]
            }
        ];

        const result =
            FollowUpGenerationEngine.generateFollowUps(
                questions,
                {}
            );

        assert.equal(result.length, 1);
        assert.equal(
            result[0].question.id,
            "q-duplicate"
        );
    }
);

runTest(
    "supports array-based answers",
    () => {
        const questions = [
            {
                id: "q-array",
                followUps: [
                    {
                        equals: "critical",
                        question: {
                            id: "q-array-follow-up"
                        }
                    }
                ]
            }
        ];

        const result =
            FollowUpGenerationEngine.generateFollowUps(
                questions,
                {
                    answers: [
                        {
                            questionId: "q-array",
                            value: "critical"
                        }
                    ]
                }
            );

        assert.equal(result.length, 1);
    }
);

runTest(
    "does not modify source questions or context",
    () => {
        const questions = [
            {
                id: "q-source",
                followUps: [
                    {
                        equals: "yes",
                        question: {
                            id: "q-follow-up",
                            text: "Follow-up"
                        }
                    }
                ]
            }
        ];

        const context = {
            answers: {
                "q-source": {
                    value: "yes"
                }
            }
        };

        const questionsBefore =
            JSON.stringify(questions);
        const contextBefore =
            JSON.stringify(context);

        FollowUpGenerationEngine.generateFollowUps(
            questions,
            context
        );

        assert.equal(
            JSON.stringify(questions),
            questionsBefore
        );
        assert.equal(
            JSON.stringify(context),
            contextBefore
        );
    }
);

runTest(
    "invalid question collection returns empty result",
    () => {
        assert.deepEqual(
            FollowUpGenerationEngine.generateFollowUps(
                null,
                {}
            ),
            []
        );

        assert.deepEqual(
            FollowUpGenerationEngine.generateFollowUps(
                {},
                {}
            ),
            []
        );
    }
);

console.log(
    "FollowUpGenerationEngine tests completed successfully."
);
