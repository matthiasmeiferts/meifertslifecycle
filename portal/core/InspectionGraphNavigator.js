import QuestionVisibilityEngine from "./QuestionVisibilityEngine.js";
import QuestionPriorityEngine from "./QuestionPriorityEngine.js";

export default class InspectionGraphNavigator {

    static getNextQuestion(questions = [], context = {}) {
        const navigation = this.getNavigationState(
            questions,
            context
        );

        if (!navigation.nextQuestion) {
            return {
                question: null,
                navigationReason: navigation.navigationReason,
                remainingQuestionCount:
                    navigation.remainingQuestionCount,
                visibleQuestionCount:
                    navigation.visibleQuestionCount
            };
        }

        return {
            question: navigation.nextQuestion.question,
            score: navigation.nextQuestion.score,
            priorityReasons:
                navigation.nextQuestion.reasons,
            navigationReason:
                navigation.navigationReason,
            remainingQuestionCount:
                navigation.remainingQuestionCount,
            visibleQuestionCount:
                navigation.visibleQuestionCount
        };
    }

    static getNavigationState(questions = [], context = {}) {
        if (!Array.isArray(questions)) {
            return {
                nextQuestion: null,
                orderedQuestions: [],
                visibleQuestions: [],
                visibleQuestionCount: 0,
                remainingQuestionCount: 0,
                navigationReason:
                    "invalid_question_collection"
            };
        }

        const visibleQuestions = questions.filter(
            (question) => {
                return QuestionVisibilityEngine.isVisible(
                    question,
                    context
                ).visible;
            }
        );

        const orderedQuestions =
            QuestionPriorityEngine.getOrderedQuestions(
                visibleQuestions,
                context
            );

        const remainingQuestions =
            orderedQuestions.filter((entry) => {
                return !QuestionPriorityEngine.isAnswered(
                    entry.question,
                    context
                );
            });

        if (visibleQuestions.length === 0) {
            return {
                nextQuestion: null,
                orderedQuestions,
                visibleQuestions,
                visibleQuestionCount: 0,
                remainingQuestionCount: 0,
                navigationReason:
                    "no_visible_questions"
            };
        }

        if (remainingQuestions.length === 0) {
            return {
                nextQuestion: null,
                orderedQuestions,
                visibleQuestions,
                visibleQuestionCount:
                    visibleQuestions.length,
                remainingQuestionCount: 0,
                navigationReason:
                    "inspection_complete"
            };
        }

        return {
            nextQuestion: remainingQuestions[0],
            orderedQuestions,
            visibleQuestions,
            visibleQuestionCount:
                visibleQuestions.length,
            remainingQuestionCount:
                remainingQuestions.length,
            navigationReason:
                "highest_priority_visible_unanswered"
        };
    }
}
