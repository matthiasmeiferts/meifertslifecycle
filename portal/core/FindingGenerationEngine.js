export default class FindingGenerationEngine {

    static generateFindings(
        questions = [],
        generatedFollowUps = [],
        evidence = [],
        context = {}
    ) {
        if (!Array.isArray(questions)) {
            return [];
        }

        const allQuestions = [
            ...questions,
            ...this.extractGeneratedQuestions(
                generatedFollowUps
            )
        ];

        const findings = [];
        const findingIds = new Set();

        allQuestions.forEach((question) => {
            if (
                !question ||
                typeof question !== "object"
            ) {
                return;
            }

            const rules = Array.isArray(
                question.findingRules
            )
                ? question.findingRules
                : [];

            const answer = this.findAnswer(
                question.id,
                context.answers
            );

            const answerValue =
                this.extractAnswerValue(answer);

            rules.forEach((rule, index) => {
                if (
                    !this.matchesRule(
                        rule,
                        answerValue,
                        evidence,
                        context
                    )
                ) {
                    return;
                }

                const finding =
                    this.createFinding(
                        question,
                        rule,
                        evidence,
                        index
                    );

                if (
                    !finding ||
                    findingIds.has(
                        finding.findingId
                    )
                ) {
                    return;
                }

                findingIds.add(
                    finding.findingId
                );

                findings.push(finding);
            });
        });

        return findings;
    }

    static matchesRule(
        rule = {},
        answerValue,
        evidence = [],
        context = {}
    ) {
        if (
            !rule ||
            typeof rule !== "object"
        ) {
            return false;
        }

        if (
            Object.prototype.hasOwnProperty.call(
                rule,
                "equals"
            ) &&
            answerValue !== rule.equals
        ) {
            return false;
        }

        if (
            Array.isArray(rule.oneOf) &&
            !rule.oneOf.includes(answerValue)
        ) {
            return false;
        }

        if (
            Object.prototype.hasOwnProperty.call(
                rule,
                "answered"
            )
        ) {
            const answered =
                this.hasMeaningfulValue(
                    answerValue
                );

            if (
                rule.answered === true &&
                !answered
            ) {
                return false;
            }

            if (
                rule.answered === false &&
                answered
            ) {
                return false;
            }
        }

        if (
            rule.context &&
            !this.matchesContext(
                rule.context,
                context
            )
        ) {
            return false;
        }

        if (
            Array.isArray(
                rule.requiredEvidenceIds
            ) &&
            !this.hasRequiredEvidence(
                rule.requiredEvidenceIds,
                evidence
            )
        ) {
            return false;
        }

        return true;
    }

    static createFinding(
        sourceQuestion = {},
        rule = {},
        evidence = [],
        index = 0
    ) {
        const sourceQuestionId =
            typeof sourceQuestion.id === "string" &&
            sourceQuestion.id.length > 0
                ? sourceQuestion.id
                : "unknown";

        const findingId =
            typeof rule.findingId === "string" &&
            rule.findingId.length > 0
                ? rule.findingId
                : `${sourceQuestionId}-finding-${index + 1}`;

        const sourceQuestionIds =
            this.normalizeStringArray(
                rule.sourceQuestionIds
            );

        if (
            !sourceQuestionIds.includes(
                sourceQuestionId
            )
        ) {
            sourceQuestionIds.unshift(
                sourceQuestionId
            );
        }

        const evidenceIds =
            this.resolveEvidenceIds(
                rule,
                evidence
            );

        return {
            findingId,
            category:
                rule.category ??
                sourceQuestion.category ??
                "General",

            severity:
                rule.severity ??
                "medium",

            confidence:
                rule.confidence ??
                (
                    evidenceIds.length > 0
                        ? "supported"
                        : "preliminary"
                ),

            summary:
                rule.summary ??
                sourceQuestion.text ??
                "Inspection finding generated.",

            sourceQuestionIds,
            evidenceIds,

            generated: true,

            generationReason:
                this.getGenerationReason(
                    rule
                )
        };
    }

    static extractGeneratedQuestions(
        generatedFollowUps = []
    ) {
        if (
            !Array.isArray(
                generatedFollowUps
            )
        ) {
            return [];
        }

        return generatedFollowUps
            .map((entry) => {
                if (
                    entry &&
                    typeof entry === "object" &&
                    entry.question &&
                    typeof entry.question === "object"
                ) {
                    return entry.question;
                }

                return entry;
            })
            .filter((question) => {
                return (
                    question &&
                    typeof question === "object"
                );
            });
    }

    static hasRequiredEvidence(
        requiredEvidenceIds = [],
        evidence = []
    ) {
        if (!Array.isArray(evidence)) {
            return false;
        }

        const availableEvidenceIds =
            new Set(
                evidence
                    .map((entry) => {
                        if (
                            typeof entry === "string"
                        ) {
                            return entry;
                        }

                        return entry?.evidenceId;
                    })
                    .filter(Boolean)
            );

        return requiredEvidenceIds.every(
            (evidenceId) =>
                availableEvidenceIds.has(
                    evidenceId
                )
        );
    }

    static resolveEvidenceIds(
        rule = {},
        evidence = []
    ) {
        const explicitEvidenceIds =
            this.normalizeStringArray(
                rule.evidenceIds
            );

        if (
            explicitEvidenceIds.length > 0
        ) {
            return explicitEvidenceIds;
        }

        if (
            Array.isArray(
                rule.requiredEvidenceIds
            )
        ) {
            return this.normalizeStringArray(
                rule.requiredEvidenceIds
            );
        }

        if (!Array.isArray(evidence)) {
            return [];
        }

        return evidence
            .filter((entry) => {
                return (
                    entry &&
                    typeof entry === "object" &&
                    (
                        !rule.sourceEvidenceQuestionId ||
                        entry.sourceQuestionId ===
                            rule.sourceEvidenceQuestionId
                    )
                );
            })
            .map(
                (entry) =>
                    entry.evidenceId
            )
            .filter(Boolean);
    }

    static matchesContext(
        requirements = {},
        context = {}
    ) {
        return Object.entries(
            requirements
        ).every(([path, expectedValue]) => {
            const actualValue =
                this.getValueByPath(
                    context,
                    path
                );

            if (
                Array.isArray(
                    expectedValue
                )
            ) {
                return expectedValue.includes(
                    actualValue
                );
            }

            return (
                actualValue ===
                expectedValue
            );
        });
    }

    static findAnswer(
        questionId,
        answers
    ) {
        if (
            typeof questionId !== "string" ||
            questionId.length === 0
        ) {
            return undefined;
        }

        if (Array.isArray(answers)) {
            return answers.find(
                (answer) => {
                    return (
                        answer &&
                        typeof answer ===
                            "object" &&
                        (
                            answer.questionId ===
                                questionId ||
                            answer.id ===
                                questionId
                        )
                    );
                }
            );
        }

        if (
            answers &&
            typeof answers === "object" &&
            Object.prototype.hasOwnProperty.call(
                answers,
                questionId
            )
        ) {
            return answers[questionId];
        }

        return undefined;
    }

    static extractAnswerValue(answer) {
        if (
            answer &&
            typeof answer === "object" &&
            Object.prototype.hasOwnProperty.call(
                answer,
                "value"
            )
        ) {
            return answer.value;
        }

        return answer;
    }

    static hasMeaningfulValue(value) {
        return (
            value !== undefined &&
            value !== null &&
            value !== ""
        );
    }

    static normalizeStringArray(
        values
    ) {
        if (!Array.isArray(values)) {
            return [];
        }

        return [
            ...new Set(
                values.filter(
                    (value) =>
                        typeof value ===
                            "string" &&
                        value.length > 0
                )
            )
        ];
    }

    static getGenerationReason(
        rule = {}
    ) {
        if (
            Array.isArray(
                rule.requiredEvidenceIds
            )
        ) {
            return "required_evidence_available";
        }

        if (
            Object.prototype.hasOwnProperty.call(
                rule,
                "equals"
            )
        ) {
            return "answer_equals";
        }

        if (Array.isArray(rule.oneOf)) {
            return "answer_matches_one_of";
        }

        if (
            Object.prototype.hasOwnProperty.call(
                rule,
                "answered"
            )
        ) {
            return rule.answered === true
                ? "source_answered"
                : "source_unanswered";
        }

        if (rule.context) {
            return "context_match";
        }

        return "unconditional_finding";
    }

    static getValueByPath(
        source,
        path
    ) {
        if (
            !source ||
            typeof path !== "string" ||
            path.length === 0
        ) {
            return undefined;
        }

        return path
            .split(".")
            .reduce(
                (value, key) => {
                    if (
                        value === undefined ||
                        value === null
                    ) {
                        return undefined;
                    }

                    return value[key];
                },
                source
            );
    }
}
