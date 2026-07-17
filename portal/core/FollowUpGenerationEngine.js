export default class FollowUpGenerationEngine {

    static generateFollowUps(
        questions = [],
        context = {}
    ) {
        if (!Array.isArray(questions)) {
            return [];
        }

        const generated = [];
        const generatedIds = new Set();

        questions.forEach((question) => {
            const followUps = Array.isArray(
                question.followUps
            )
                ? question.followUps
                : [];

            if (followUps.length === 0) {
                return;
            }

            const answer = this.findAnswer(
                question.id,
                context.answers
            );

            const answerValue =
                this.extractAnswerValue(answer);

            followUps.forEach((definition, index) => {
                if (
                    !this.shouldGenerate(
                        definition,
                        answerValue,
                        context
                    )
                ) {
                    return;
                }

                const generatedQuestion =
                    this.createFollowUpQuestion(
                        question,
                        definition,
                        index
                    );

                if (
                    !generatedQuestion ||
                    generatedIds.has(
                        generatedQuestion.id
                    )
                ) {
                    return;
                }

                generatedIds.add(
                    generatedQuestion.id
                );

                generated.push({
                    question: generatedQuestion,
                    sourceQuestionId: question.id,
                    generationReason:
                        this.getGenerationReason(
                            definition
                        )
                });
            });
        });

        return generated;
    }

    static shouldGenerate(
        definition = {},
        answerValue,
        context = {}
    ) {
        if (
            !definition ||
            typeof definition !== "object"
        ) {
            return false;
        }

        if (
            Object.prototype.hasOwnProperty.call(
                definition,
                "equals"
            ) &&
            answerValue !== definition.equals
        ) {
            return false;
        }

        if (
            Array.isArray(definition.oneOf) &&
            !definition.oneOf.includes(answerValue)
        ) {
            return false;
        }

        if (
            Object.prototype.hasOwnProperty.call(
                definition,
                "answered"
            )
        ) {
            const isAnswered =
                this.hasMeaningfulValue(answerValue);

            if (
                definition.answered === true &&
                !isAnswered
            ) {
                return false;
            }

            if (
                definition.answered === false &&
                isAnswered
            ) {
                return false;
            }
        }

        if (
            definition.context &&
            !this.matchesContext(
                definition.context,
                context
            )
        ) {
            return false;
        }

        return true;
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

            if (Array.isArray(expectedValue)) {
                return expectedValue.includes(
                    actualValue
                );
            }

            return actualValue === expectedValue;
        });
    }

    static createFollowUpQuestion(
        sourceQuestion = {},
        definition = {},
        index = 0
    ) {
        const questionDefinition =
            definition.question &&
            typeof definition.question === "object"
                ? definition.question
                : definition;

        const sourceQuestionId =
            typeof sourceQuestion.id === "string" &&
            sourceQuestion.id.length > 0
                ? sourceQuestion.id
                : "unknown";

        const followUpId =
            typeof questionDefinition.id === "string" &&
            questionDefinition.id.length > 0
                ? questionDefinition.id
                : `${sourceQuestionId}-follow-up-${index + 1}`;

        return {
            ...questionDefinition,
            id: followUpId,
            generated: true,
            generatedFromQuestionId:
                sourceQuestionId
        };
    }

    static getGenerationReason(definition = {}) {
        if (
            Object.prototype.hasOwnProperty.call(
                definition,
                "equals"
            )
        ) {
            return "answer_equals";
        }

        if (Array.isArray(definition.oneOf)) {
            return "answer_matches_one_of";
        }

        if (
            Object.prototype.hasOwnProperty.call(
                definition,
                "answered"
            )
        ) {
            return definition.answered === true
                ? "source_answered"
                : "source_unanswered";
        }

        if (definition.context) {
            return "context_match";
        }

        return "unconditional_follow_up";
    }

    static findAnswer(questionId, answers) {
        if (
            typeof questionId !== "string" ||
            questionId.length === 0
        ) {
            return undefined;
        }

        if (Array.isArray(answers)) {
            return answers.find((answer) => {
                return (
                    answer &&
                    typeof answer === "object" &&
                    (
                        answer.questionId ===
                            questionId ||
                        answer.id === questionId
                    )
                );
            });
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
            .reduce((value, key) => {
                if (
                    value === undefined ||
                    value === null
                ) {
                    return undefined;
                }

                return value[key];
            }, source);
    }
}
