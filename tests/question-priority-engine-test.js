import assert from "node:assert/strict";
import QuestionPriorityEngine from "../portal/core/QuestionPriorityEngine.js";

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
    "required question receives required score",
    () => {
        const result =
            QuestionPriorityEngine.calculatePriority(
                {
                    id: "q-required",
                    required: true
                },
                {
                    answers: {}
                }
            );

        assert.equal(result.score, 1200);
        assert.deepEqual(
            result.reasons,
            [
                "required",
                "unanswered"
            ]
        );
    }
);

runTest(
    "explicit priority contributes to score",
    () => {
        const result =
            QuestionPriorityEngine.calculatePriority(
                {
                    id: "q-priority",
                    priority: 350
                },
                {
                    answers: {}
                }
            );

        assert.equal(result.score, 550);
        assert.deepEqual(
            result.reasons,
            [
                "priority",
                "unanswered"
            ]
        );
    }
);

runTest(
    "priority is limited to maximum 999",
    () => {
        const result =
            QuestionPriorityEngine.calculatePriority(
                {
                    id: "q-priority-max",
                    priority: 5000
                },
                {
                    answers: {}
                }
            );

        assert.equal(result.score, 1199);
        assert.deepEqual(
            result.reasons,
            [
                "priority",
                "unanswered"
            ]
        );
    }
);

runTest(
    "invalid priority values are ignored",
    () => {
        const stringResult =
            QuestionPriorityEngine.calculatePriority(
                {
                    id: "q-string-priority",
                    priority: "900"
                },
                {
                    answers: {}
                }
            );

        const negativeResult =
            QuestionPriorityEngine.calculatePriority(
                {
                    id: "q-negative-priority",
                    priority: -100
                },
                {
                    answers: {}
                }
            );

        assert.equal(stringResult.score, 200);
        assert.equal(negativeResult.score, 200);
    }
);

runTest(
    "manually highlighted question receives highlight score",
    () => {
        const result =
            QuestionPriorityEngine.calculatePriority(
                {
                    id: "q-highlighted",
                    highlighted: true
                },
                {
                    answers: {}
                }
            );

        assert.equal(result.score, 700);
        assert.deepEqual(
            result.reasons,
            [
                "manually_highlighted",
                "unanswered"
            ]
        );
    }
);

runTest(
    "answered question does not receive unanswered score",
    () => {
        const result =
            QuestionPriorityEngine.calculatePriority(
                {
                    id: "q-answered"
                },
                {
                    answers: {
                        "q-answered": {
                            value: "yes"
                        }
                    }
                }
            );

        assert.equal(result.score, 0);
        assert.deepEqual(
            result.reasons,
            ["answered"]
        );
    }
);

runTest(
    "false and zero are valid answered values",
    () => {
        const falseResult =
            QuestionPriorityEngine.calculatePriority(
                {
                    id: "q-false"
                },
                {
                    answers: {
                        "q-false": {
                            value: false
                        }
                    }
                }
            );

        const zeroResult =
            QuestionPriorityEngine.calculatePriority(
                {
                    id: "q-zero"
                },
                {
                    answers: {
                        "q-zero": {
                            value: 0
                        }
                    }
                }
            );

        assert.equal(falseResult.score, 0);
        assert.equal(zeroResult.score, 0);
        assert.deepEqual(
            falseResult.reasons,
            ["answered"]
        );
        assert.deepEqual(
            zeroResult.reasons,
            ["answered"]
        );
    }
);

runTest(
    "empty answer value remains unanswered",
    () => {
        const result =
            QuestionPriorityEngine.calculatePriority(
                {
                    id: "q-empty"
                },
                {
                    answers: {
                        "q-empty": {
                            value: ""
                        }
                    }
                }
            );

        assert.equal(result.score, 200);
        assert.deepEqual(
            result.reasons,
            ["unanswered"]
        );
    }
);

runTest(
    "string dependency is satisfied by answered question",
    () => {
        const result =
            QuestionPriorityEngine.calculatePriority(
                {
                    id: "q-dependent",
                    dependencies: [
                        "q-parent"
                    ]
                },
                {
                    answers: {
                        "q-parent": {
                            value: "yes"
                        }
                    }
                }
            );

        assert.equal(result.score, 300);
        assert.deepEqual(
            result.reasons,
            [
                "unanswered",
                "dependencies_satisfied"
            ]
        );
    }
);

runTest(
    "equals dependency is satisfied by matching answer",
    () => {
        const result =
            QuestionPriorityEngine.calculatePriority(
                {
                    id: "q-dependent",
                    dependencies: [
                        {
                            questionId: "q-parent",
                            equals: "critical"
                        }
                    ]
                },
                {
                    answers: {
                        "q-parent": {
                            value: "critical"
                        }
                    }
                }
            );

        assert.equal(result.score, 300);
        assert.deepEqual(
            result.reasons,
            [
                "unanswered",
                "dependencies_satisfied"
            ]
        );
    }
);

runTest(
    "dependency remains unsatisfied when answer does not match",
    () => {
        const result =
            QuestionPriorityEngine.calculatePriority(
                {
                    id: "q-dependent",
                    dependencies: [
                        {
                            questionId: "q-parent",
                            equals: "critical"
                        }
                    ]
                },
                {
                    answers: {
                        "q-parent": {
                            value: "normal"
                        }
                    }
                }
            );

        assert.equal(result.score, 200);
        assert.deepEqual(
            result.reasons,
            [
                "unanswered",
                "dependencies_not_satisfied"
            ]
        );
    }
);

runTest(
    "array-based answers are supported",
    () => {
        const result =
            QuestionPriorityEngine.calculatePriority(
                {
                    id: "q-array-answer"
                },
                {
                    answers: [
                        {
                            questionId: "q-array-answer",
                            value: "complete"
                        }
                    ]
                }
            );

        assert.equal(result.score, 0);
        assert.deepEqual(
            result.reasons,
            ["answered"]
        );
    }
);

runTest(
    "questions are ordered by descending score",
    () => {
        const questions = [
            {
                id: "q-low",
                priority: 10
            },
            {
                id: "q-required",
                required: true
            },
            {
                id: "q-highlighted",
                highlighted: true
            }
        ];

        const result =
            QuestionPriorityEngine.getOrderedQuestions(
                questions,
                {
                    answers: {}
                }
            );

        assert.deepEqual(
            result.map((entry) => entry.question.id),
            [
                "q-required",
                "q-highlighted",
                "q-low"
            ]
        );

        assert.deepEqual(
            result.map((entry) => entry.score),
            [
                1200,
                700,
                210
            ]
        );
    }
);

runTest(
    "equal scores preserve original question order",
    () => {
        const questions = [
            {
                id: "q-first",
                priority: 100
            },
            {
                id: "q-second",
                priority: 100
            },
            {
                id: "q-third",
                priority: 100
            }
        ];

        const result =
            QuestionPriorityEngine.getOrderedQuestions(
                questions,
                {
                    answers: {}
                }
            );

        assert.deepEqual(
            result.map((entry) => entry.question.id),
            [
                "q-first",
                "q-second",
                "q-third"
            ]
        );
    }
);

runTest(
    "invalid question collection returns empty result",
    () => {
        assert.deepEqual(
            QuestionPriorityEngine.getOrderedQuestions(
                null,
                {}
            ),
            []
        );

        assert.deepEqual(
            QuestionPriorityEngine.getOrderedQuestions(
                {},
                {}
            ),
            []
        );
    }
);

console.log(
    "QuestionPriorityEngine tests completed successfully."
);
