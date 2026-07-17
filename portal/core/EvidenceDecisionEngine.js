export default class EvidenceDecisionEngine {

    static evaluateEvidence(
        questions = [],
        generatedFollowUps = [],
        context = {}
    ) {
        if (!Array.isArray(questions)) {
            return [];
        }

        const evidence = [];
        const evidenceIds = new Set();

        const followUpQuestions =
            Array.isArray(generatedFollowUps)
                ? generatedFollowUps
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
                    .filter(
                        (question) =>
                            question &&
                            typeof question === "object"
                    )
                : [];

        const evaluableQuestions = [
            ...questions,
            ...followUpQuestions
        ];

        evaluableQuestions.forEach((question) => {
            const rules = Array.isArray(
                question.evidenceRules
            )
                ? question.evidenceRules
                : [];

            const answer = this.findAnswer(
                question.id,
                context.answers
            );

            const value = this.extractValue(
                answer
            );

            rules.forEach((rule) => {
                if (
                    !this.matches(
                        rule,
                        value,
                        context
                    )
                ) {
                    return;
                }

                const entry = {
                    evidenceId:
                        rule.evidenceId ??
                        `${question.id}-evidence`,

                    priority:
                        rule.priority ?? "normal",

                    required:
                        rule.required ?? true,

                    reason:
                        rule.reason ?? "rule_match",

                    sourceQuestionId:
                        question.id
                };

                if (
                    evidenceIds.has(
                        entry.evidenceId
                    )
                ) {
                    return;
                }

                evidenceIds.add(
                    entry.evidenceId
                );

                evidence.push(entry);
            });
        });

        return evidence;
    }

    static matches(
        rule = {},
        value,
        context = {}
    ) {
        if (
            Object.prototype.hasOwnProperty.call(
                rule,
                "equals"
            ) &&
            value !== rule.equals
        ) {
            return false;
        }

        if (
            Array.isArray(rule.oneOf) &&
            !rule.oneOf.includes(value)
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
                value !== undefined &&
                value !== null &&
                value !== "";

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

        if (rule.context) {
            const matchesContext =
                Object.entries(
                    rule.context
                ).every(
                    ([path, expected]) => {
                        const actual =
                            this.getValueByPath(
                                context,
                                path
                            );

                        if (
                            Array.isArray(expected)
                        ) {
                            return expected.includes(
                                actual
                            );
                        }

                        return actual === expected;
                    }
                );

            if (!matchesContext) {
                return false;
            }
        }

        return true;
    }

    static findAnswer(
        id,
        answers
    ) {
        if (Array.isArray(answers)) {
            return answers.find((answer) => {
                return (
                    answer &&
                    (
                        answer.questionId === id ||
                        answer.id === id
                    )
                );
            });
        }

        return answers?.[id];
    }

    static extractValue(answer) {
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

    static getValueByPath(
        source,
        path
    ) {
        if (
            typeof path !== "string" ||
            path.length === 0
        ) {
            return undefined;
        }

        return path
            .split(".")
            .reduce(
                (value, key) =>
                    value?.[key],
                source
            );
    }
}
