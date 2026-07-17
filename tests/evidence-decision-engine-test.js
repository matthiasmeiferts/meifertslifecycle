import assert from "node:assert/strict";
import EvidenceDecisionEngine from "../portal/core/EvidenceDecisionEngine.js";

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
    "creates evidence when answer equals expected value",
    () => {
        const questions = [
            {
                id: "q-moisture",
                evidenceRules: [
                    {
                        equals: "yes",
                        evidenceId: "moisture-measurement",
                        priority: "high",
                        required: true,
                        reason: "moisture_detected"
                    }
                ]
            }
        ];

        const result =
            EvidenceDecisionEngine.evaluateEvidence(
                questions,
                [],
                {
                    answers: {
                        "q-moisture": {
                            value: "yes"
                        }
                    }
                }
            );

        assert.equal(result.length, 1);
        assert.deepEqual(result[0], {
            evidenceId: "moisture-measurement",
            priority: "high",
            required: true,
            reason: "moisture_detected",
            sourceQuestionId: "q-moisture"
        });
    }
);

runTest(
    "does not create evidence when answer differs",
    () => {
        const questions = [
            {
                id: "q-moisture",
                evidenceRules: [
                    {
                        equals: "yes",
                        evidenceId: "moisture-measurement"
                    }
                ]
            }
        ];

        const result =
            EvidenceDecisionEngine.evaluateEvidence(
                questions,
                [],
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
    "creates evidence for oneOf match",
    () => {
        const questions = [
            {
                id: "q-crack",
                evidenceRules: [
                    {
                        oneOf: [
                            "moderate",
                            "severe"
                        ],
                        evidenceId: "crack-width-documentation"
                    }
                ]
            }
        ];

        const result =
            EvidenceDecisionEngine.evaluateEvidence(
                questions,
                [],
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
            result[0].evidenceId,
            "crack-width-documentation"
        );
    }
);

runTest(
    "answered true matches false and zero values",
    () => {
        const questions = [
            {
                id: "q-false",
                evidenceRules: [
                    {
                        answered: true,
                        evidenceId: "false-value-evidence"
                    }
                ]
            },
            {
                id: "q-zero",
                evidenceRules: [
                    {
                        answered: true,
                        evidenceId: "zero-value-evidence"
                    }
                ]
            }
        ];

        const result =
            EvidenceDecisionEngine.evaluateEvidence(
                questions,
                [],
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
                (entry) => entry.evidenceId
            ),
            [
                "false-value-evidence",
                "zero-value-evidence"
            ]
        );
    }
);

runTest(
    "answered false matches missing and empty answers",
    () => {
        const questions = [
            {
                id: "q-missing",
                evidenceRules: [
                    {
                        answered: false,
                        evidenceId: "missing-answer-evidence"
                    }
                ]
            },
            {
                id: "q-empty",
                evidenceRules: [
                    {
                        answered: false,
                        evidenceId: "empty-answer-evidence"
                    }
                ]
            }
        ];

        const result =
            EvidenceDecisionEngine.evaluateEvidence(
                questions,
                [],
                {
                    answers: {
                        "q-empty": {
                            value: ""
                        }
                    }
                }
            );

        assert.deepEqual(
            result.map(
                (entry) => entry.evidenceId
            ),
            [
                "missing-answer-evidence",
                "empty-answer-evidence"
            ]
        );
    }
);

runTest(
    "matches context rule",
    () => {
        const questions = [
            {
                id: "q-roof",
                evidenceRules: [
                    {
                        context: {
                            "profile.country": "Thailand",
                            "profile.buildingType":
                                "Condominium"
                        },
                        evidenceId:
                            "tropical-roof-inspection"
                    }
                ]
            }
        ];

        const result =
            EvidenceDecisionEngine.evaluateEvidence(
                questions,
                [],
                {
                    profile: {
                        country: "Thailand",
                        buildingType:
                            "Condominium"
                    }
                }
            );

        assert.equal(result.length, 1);
    }
);

runTest(
    "matches context array rule",
    () => {
        const questions = [
            {
                id: "q-climate",
                evidenceRules: [
                    {
                        context: {
                            "profile.climateZone": [
                                "Tropical",
                                "Subtropical"
                            ]
                        },
                        evidenceId:
                            "corrosion-documentation"
                    }
                ]
            }
        ];

        const result =
            EvidenceDecisionEngine.evaluateEvidence(
                questions,
                [],
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
    "does not match invalid context",
    () => {
        const questions = [
            {
                id: "q-climate",
                evidenceRules: [
                    {
                        context: {
                            "profile.climateZone":
                                "Tropical"
                        },
                        evidenceId:
                            "corrosion-documentation"
                    }
                ]
            }
        ];

        const result =
            EvidenceDecisionEngine.evaluateEvidence(
                questions,
                [],
                {
                    profile: {
                        climateZone:
                            "Temperate"
                    }
                }
            );

        assert.deepEqual(result, []);
    }
);

runTest(
    "uses default evidence values",
    () => {
        const questions = [
            {
                id: "q-source",
                evidenceRules: [
                    {
                        equals: "yes"
                    }
                ]
            }
        ];

        const result =
            EvidenceDecisionEngine.evaluateEvidence(
                questions,
                [],
                {
                    answers: {
                        "q-source": {
                            value: "yes"
                        }
                    }
                }
            );

        assert.deepEqual(result[0], {
            evidenceId:
                "q-source-evidence",
            priority: "normal",
            required: true,
            reason: "rule_match",
            sourceQuestionId: "q-source"
        });
    }
);

runTest(
    "preserves explicit required false",
    () => {
        const questions = [
            {
                id: "q-source",
                evidenceRules: [
                    {
                        equals: "yes",
                        evidenceId:
                            "optional-photo",
                        required: false
                    }
                ]
            }
        ];

        const result =
            EvidenceDecisionEngine.evaluateEvidence(
                questions,
                [],
                {
                    answers: {
                        "q-source": {
                            value: "yes"
                        }
                    }
                }
            );

        assert.equal(
            result[0].required,
            false
        );
    }
);

runTest(
    "prevents duplicate evidence ids",
    () => {
        const questions = [
            {
                id: "q-one",
                evidenceRules: [
                    {
                        evidenceId:
                            "shared-evidence"
                    }
                ]
            },
            {
                id: "q-two",
                evidenceRules: [
                    {
                        evidenceId:
                            "shared-evidence"
                    }
                ]
            }
        ];

        const result =
            EvidenceDecisionEngine.evaluateEvidence(
                questions,
                [],
                {}
            );

        assert.equal(result.length, 1);
        assert.equal(
            result[0].sourceQuestionId,
            "q-one"
        );
    }
);

runTest(
    "supports array-based answers",
    () => {
        const questions = [
            {
                id: "q-array",
                evidenceRules: [
                    {
                        equals: "critical",
                        evidenceId:
                            "critical-evidence"
                    }
                ]
            }
        ];

        const result =
            EvidenceDecisionEngine.evaluateEvidence(
                questions,
                [],
                {
                    answers: [
                        {
                            questionId:
                                "q-array",
                            value: "critical"
                        }
                    ]
                }
            );

        assert.equal(result.length, 1);
    }
);

runTest(
    "supports array answers using id",
    () => {
        const questions = [
            {
                id: "q-array-id",
                evidenceRules: [
                    {
                        equals: "yes",
                        evidenceId:
                            "array-id-evidence"
                    }
                ]
            }
        ];

        const result =
            EvidenceDecisionEngine.evaluateEvidence(
                questions,
                [],
                {
                    answers: [
                        {
                            id: "q-array-id",
                            value: "yes"
                        }
                    ]
                }
            );

        assert.equal(result.length, 1);
    }
);

runTest(
    "combines answer and context requirements",
    () => {
        const questions = [
            {
                id: "q-corrosion",
                evidenceRules: [
                    {
                        equals: "visible",
                        context: {
                            "profile.country":
                                "Thailand"
                        },
                        evidenceId:
                            "corrosion-close-up"
                    }
                ]
            }
        ];

        const matchingResult =
            EvidenceDecisionEngine.evaluateEvidence(
                questions,
                [],
                {
                    profile: {
                        country: "Thailand"
                    },
                    answers: {
                        "q-corrosion": {
                            value: "visible"
                        }
                    }
                }
            );

        const wrongContextResult =
            EvidenceDecisionEngine.evaluateEvidence(
                questions,
                [],
                {
                    profile: {
                        country: "Germany"
                    },
                    answers: {
                        "q-corrosion": {
                            value: "visible"
                        }
                    }
                }
            );

        assert.equal(
            matchingResult.length,
            1
        );
        assert.equal(
            wrongContextResult.length,
            0
        );
    }
);

runTest(
    "ignores questions without evidence rules",
    () => {
        const result =
            EvidenceDecisionEngine.evaluateEvidence(
                [
                    {
                        id: "q-empty"
                    }
                ],
                [],
                {}
            );

        assert.deepEqual(result, []);
    }
);

runTest(
    "does not modify questions or context",
    () => {
        const questions = [
            {
                id: "q-source",
                evidenceRules: [
                    {
                        equals: "yes",
                        evidenceId:
                            "source-evidence"
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

        EvidenceDecisionEngine.evaluateEvidence(
            questions,
            [],
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
            EvidenceDecisionEngine.evaluateEvidence(
                null,
                [],
                {}
            ),
            []
        );

        assert.deepEqual(
            EvidenceDecisionEngine.evaluateEvidence(
                {},
                [],
                {}
            ),
            []
        );
    }
);

console.log(
    "EvidenceDecisionEngine tests completed successfully."
);
