import assert from "node:assert/strict";
import InspectionGraphNavigator from "../portal/core/InspectionGraphNavigator.js";

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
    "returns highest-priority visible unanswered question",
    () => {
        const questions = [
            {
                id: "q-low",
                priority: 10
            },
            {
                id: "q-high",
                required: true
            },
            {
                id: "q-medium",
                highlighted: true
            }
        ];

        const result =
            InspectionGraphNavigator.getNextQuestion(
                questions,
                {
                    answers: {}
                }
            );

        assert.equal(result.question.id, "q-high");
        assert.equal(
            result.navigationReason,
            "highest_priority_visible_unanswered"
        );
        assert.equal(result.remainingQuestionCount, 3);
        assert.equal(result.visibleQuestionCount, 3);
    }
);

runTest(
    "ignores invisible questions",
    () => {
        const questions = [
            {
                id: "q-hidden",
                required: true,
                visibility: {
                    countries: ["Thailand"]
                }
            },
            {
                id: "q-visible",
                priority: 50,
                visibility: {
                    countries: ["Germany"]
                }
            }
        ];

        const result =
            InspectionGraphNavigator.getNextQuestion(
                questions,
                {
                    profile: {
                        country: "Germany"
                    },
                    answers: {}
                }
            );

        assert.equal(result.question.id, "q-visible");
        assert.equal(result.visibleQuestionCount, 1);
        assert.equal(result.remainingQuestionCount, 1);
    }
);

runTest(
    "skips answered questions",
    () => {
        const questions = [
            {
                id: "q-answered",
                required: true
            },
            {
                id: "q-open",
                priority: 100
            }
        ];

        const result =
            InspectionGraphNavigator.getNextQuestion(
                questions,
                {
                    answers: {
                        "q-answered": {
                            value: "complete"
                        }
                    }
                }
            );

        assert.equal(result.question.id, "q-open");
        assert.equal(result.remainingQuestionCount, 1);
        assert.equal(result.visibleQuestionCount, 2);
    }
);

runTest(
    "returns no visible questions state",
    () => {
        const questions = [
            {
                id: "q-thailand",
                visibility: {
                    countries: ["Thailand"]
                }
            }
        ];

        const result =
            InspectionGraphNavigator.getNextQuestion(
                questions,
                {
                    profile: {
                        country: "Germany"
                    },
                    answers: {}
                }
            );

        assert.equal(result.question, null);
        assert.equal(
            result.navigationReason,
            "no_visible_questions"
        );
        assert.equal(result.visibleQuestionCount, 0);
        assert.equal(result.remainingQuestionCount, 0);
    }
);

runTest(
    "returns inspection complete when all visible questions are answered",
    () => {
        const questions = [
            {
                id: "q-one"
            },
            {
                id: "q-two"
            }
        ];

        const result =
            InspectionGraphNavigator.getNextQuestion(
                questions,
                {
                    answers: {
                        "q-one": {
                            value: "yes"
                        },
                        "q-two": {
                            value: false
                        }
                    }
                }
            );

        assert.equal(result.question, null);
        assert.equal(
            result.navigationReason,
            "inspection_complete"
        );
        assert.equal(result.visibleQuestionCount, 2);
        assert.equal(result.remainingQuestionCount, 0);
    }
);

runTest(
    "returns invalid collection state",
    () => {
        const result =
            InspectionGraphNavigator.getNextQuestion(
                null,
                {}
            );

        assert.deepEqual(result, {
            question: null,
            navigationReason:
                "invalid_question_collection",
            remainingQuestionCount: 0,
            visibleQuestionCount: 0
        });
    }
);

runTest(
    "navigation state exposes ordered and visible questions",
    () => {
        const questions = [
            {
                id: "q-first",
                priority: 20
            },
            {
                id: "q-second",
                required: true
            },
            {
                id: "q-hidden",
                priority: 999,
                visibility: {
                    buildingTypes: ["Office"]
                }
            }
        ];

        const result =
            InspectionGraphNavigator.getNavigationState(
                questions,
                {
                    profile: {
                        buildingType: "Condominium"
                    },
                    answers: {}
                }
            );

        assert.equal(
            result.nextQuestion.question.id,
            "q-second"
        );

        assert.deepEqual(
            result.visibleQuestions.map(
                (question) => question.id
            ),
            [
                "q-first",
                "q-second"
            ]
        );

        assert.deepEqual(
            result.orderedQuestions.map(
                (entry) => entry.question.id
            ),
            [
                "q-second",
                "q-first"
            ]
        );

        assert.equal(result.visibleQuestionCount, 2);
        assert.equal(result.remainingQuestionCount, 2);
    }
);

runTest(
    "equal priority preserves original order",
    () => {
        const questions = [
            {
                id: "q-first",
                priority: 100
            },
            {
                id: "q-second",
                priority: 100
            }
        ];

        const result =
            InspectionGraphNavigator.getNextQuestion(
                questions,
                {
                    answers: {}
                }
            );

        assert.equal(result.question.id, "q-first");
    }
);

console.log(
    "InspectionGraphNavigator tests completed successfully."
);
