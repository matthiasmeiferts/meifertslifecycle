export default class QuestionPriorityEngine {

    static getOrderedQuestions(questions = [], context = {}) {
        if (!Array.isArray(questions)) {
            return [];
        }

        return questions
            .map((question, index) => {
                const priority = this.calculatePriority(
                    question,
                    context
                );

                return {
                    question,
                    score: priority.score,
                    reasons: priority.reasons,
                    originalIndex: index
                };
            })
            .sort((left, right) => {
                if (right.score !== left.score) {
                    return right.score - left.score;
                }

                return left.originalIndex - right.originalIndex;
            })
            .map(({ originalIndex, ...entry }) => entry);
    }

    static calculatePriority(question = {}, context = {}) {
        let score = 0;
        const reasons = [];

        if (question.required === true) {
            score += 1000;
            reasons.push("required");
        }

        const explicitPriority = this.normalizePriority(
            question.priority
        );

        if (explicitPriority > 0) {
            score += explicitPriority;
            reasons.push("priority");
        }

        if (question.highlighted === true) {
            score += 500;
            reasons.push("manually_highlighted");
        }

        if (!this.isAnswered(question, context)) {
            score += 200;
            reasons.push("unanswered");
        } else {
            reasons.push("answered");
        }

        const dependencies = Array.isArray(question.dependencies)
            ? question.dependencies
            : [];

        if (dependencies.length > 0) {
            if (
                this.areDependenciesSatisfied(
                    dependencies,
                    context
                )
            ) {
                score += 100;
                reasons.push("dependencies_satisfied");
            } else {
                reasons.push("dependencies_not_satisfied");
            }
        }

        return {
            score,
            reasons
        };
    }

    static normalizePriority(value) {
        if (
            typeof value !== "number" ||
            !Number.isFinite(value)
        ) {
            return 0;
        }

        return Math.max(
            0,
            Math.min(999, Math.trunc(value))
        );
    }

    static isAnswered(question = {}, context = {}) {
        const questionId = question.id;

        if (
            typeof questionId !== "string" ||
            questionId.length === 0
        ) {
            return false;
        }

        const answer = this.findAnswer(
            questionId,
            context.answers
        );

        if (answer === undefined || answer === null) {
            return false;
        }

        if (
            typeof answer === "object" &&
            Object.prototype.hasOwnProperty.call(
                answer,
                "value"
            )
        ) {
            return (
                answer.value !== undefined &&
                answer.value !== null &&
                answer.value !== ""
            );
        }

        return answer !== "";
    }

    static areDependenciesSatisfied(
        dependencies = [],
        context = {}
    ) {
        return dependencies.every((dependency) => {
            if (typeof dependency === "string") {
                return this.hasAnsweredValue(
                    dependency,
                    context.answers
                );
            }

            if (
                !dependency ||
                typeof dependency !== "object" ||
                typeof dependency.questionId !== "string"
            ) {
                return false;
            }

            const answer = this.findAnswer(
                dependency.questionId,
                context.answers
            );

            if (
                Object.prototype.hasOwnProperty.call(
                    dependency,
                    "equals"
                )
            ) {
                return (
                    this.extractAnswerValue(answer) ===
                    dependency.equals
                );
            }

            return this.hasAnsweredValue(
                dependency.questionId,
                context.answers
            );
        });
    }

    static hasAnsweredValue(questionId, answers) {
        const answer = this.findAnswer(
            questionId,
            answers
        );

        const value = this.extractAnswerValue(answer);

        return (
            value !== undefined &&
            value !== null &&
            value !== ""
        );
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

    static findAnswer(questionId, answers) {
        if (Array.isArray(answers)) {
            const answer = answers.find((item) => {
                return (
                    item &&
                    typeof item === "object" &&
                    (
                        item.questionId === questionId ||
                        item.id === questionId
                    )
                );
            });

            return answer;
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
}
