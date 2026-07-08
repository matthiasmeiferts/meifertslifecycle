/**
 * MEIFERTS Building Intelligence
 * Sandbox Answer State Engine
 * Foundation 2.3-C.1
 *
 * Simulates temporary answer state inside an inspection sandbox.
 * Does not persist answers and does not create evidence, findings,
 * assessments or reports.
 */

export default class SandboxAnswerStateEngine {

    static createInitialState(sandboxSession = {}, options = {}) {
        const modules = Array.isArray(sandboxSession.modules)
            ? sandboxSession.modules
            : [];

        const questions = this.flattenQuestions(modules);

        return {
            stateMode: "sandbox_answer_state_read_only",
            sandboxId: sandboxSession.sandboxId || options.sandboxId || "sandbox-answer-state",
            sourceSessionMode: sandboxSession.sessionMode || "unknown",
            profile: sandboxSession.profile || {},
            totalQuestions: questions.length,
            currentQuestionIndex: 0,
            answers: {},
            answeredQuestionIds: [],
            skippedQuestionIds: [],
            pendingQuestionIds: questions.map(question => question.questionId).filter(Boolean),
            progress: this.createProgress(questions, {}),
            currentQuestion: questions[0] || null,
            nextQuestion: questions[1] || null,
            safetyBoundary: this.createSafetyBoundary(),
            questions
        };
    }

    static applyAnswer(state = {}, answerValue = "", options = {}) {
        const questions = Array.isArray(state.questions) ? state.questions : [];
        const currentIndex = Number.isInteger(options.currentQuestionIndex)
            ? options.currentQuestionIndex
            : Number.isInteger(state.currentQuestionIndex)
                ? state.currentQuestionIndex
                : 0;

        const currentQuestion = questions[currentIndex] || null;

        if (!currentQuestion || !currentQuestion.questionId) {
            return this.createRejectedState(state, "No current question available");
        }

        const normalizedAnswer = this.normalizeAnswer(answerValue);

        if (!normalizedAnswer) {
            return this.createRejectedState(state, "Unknown answer option");
        }

        const nextAnswers = {
            ...(state.answers || {})
        };

        const isLater = normalizedAnswer.value === "later";

        if (isLater) {
            delete nextAnswers[currentQuestion.questionId];
        } else {
            nextAnswers[currentQuestion.questionId] = {
                questionId: currentQuestion.questionId,
                answerValue: normalizedAnswer.value,
                answerLabel: normalizedAnswer.label,
                answeredAt: options.timestamp || new Date().toISOString(),
                persisted: false,
                previewOnly: true
            };
        }

        const answeredQuestionIds = Object.keys(nextAnswers);

        const skippedQuestionIds = isLater
            ? Array.from(new Set([...(state.skippedQuestionIds || []), currentQuestion.questionId]))
            : (state.skippedQuestionIds || []).filter(questionId => questionId !== currentQuestion.questionId);

        const nextQuestionIndex = this.resolveNextQuestionIndex(
            questions,
            currentIndex,
            answeredQuestionIds,
            skippedQuestionIds
        );

        const pendingQuestionIds = questions
            .map(question => question.questionId)
            .filter(Boolean)
            .filter(questionId => !answeredQuestionIds.includes(questionId));

        return {
            ...state,
            stateMode: "sandbox_answer_state_read_only",
            lastInteraction: {
                interactionMode: "sandbox_answer_state_preview",
                status: "preview_only",
                answerPersisted: false,
                selectedAnswer: normalizedAnswer,
                questionId: currentQuestion.questionId,
                questionText: currentQuestion.questionText || "",
                evidenceCreated: false,
                findingCreated: false
            },
            currentQuestionIndex: nextQuestionIndex,
            answers: nextAnswers,
            answeredQuestionIds,
            skippedQuestionIds,
            pendingQuestionIds,
            progress: this.createProgress(questions, nextAnswers),
            currentQuestion: questions[nextQuestionIndex] || null,
            nextQuestion: questions[nextQuestionIndex + 1] || null,
            safetyBoundary: this.createSafetyBoundary(),
            questions
        };
    }

    static flattenQuestions(modules = []) {
        return modules.flatMap((module, moduleIndex) => {
            const questions = Array.isArray(module.questions)
                ? module.questions
                : [];

            return questions.map((question, questionIndex) => ({
                ...question,
                moduleIndex,
                moduleNumber: module.chapterNumber || module.moduleNumber || "",
                moduleTitle: module.chapterTitle || module.moduleTitle || "",
                questionIndex
            }));
        });
    }

    static normalizeAnswer(answerValue = "") {
        const options = {
            ok: {
                value: "ok",
                label: "OK"
            },
            finding: {
                value: "finding",
                label: "Auffällig"
            },
            not_verifiable: {
                value: "not_verifiable",
                label: "Nicht prüfbar"
            },
            later: {
                value: "later",
                label: "Später"
            }
        };

        return options[answerValue] || null;
    }

    static resolveNextQuestionIndex(questions = [], currentIndex = 0, answeredQuestionIds = [], skippedQuestionIds = []) {
        const nextUnansweredIndex = questions.findIndex((question, index) => {
            return index > currentIndex
                && question.questionId
                && !answeredQuestionIds.includes(question.questionId);
        });

        if (nextUnansweredIndex >= 0) {
            return nextUnansweredIndex;
        }

        const firstUnansweredIndex = questions.findIndex((question) => {
            return question.questionId
                && !answeredQuestionIds.includes(question.questionId)
                && !skippedQuestionIds.includes(question.questionId);
        });

        if (firstUnansweredIndex >= 0) {
            return firstUnansweredIndex;
        }

        const firstSkippedIndex = questions.findIndex((question) => {
            return question.questionId
                && !answeredQuestionIds.includes(question.questionId)
                && skippedQuestionIds.includes(question.questionId);
        });

        if (firstSkippedIndex >= 0) {
            return firstSkippedIndex;
        }

        return Math.min(currentIndex + 1, Math.max(questions.length - 1, 0));
    }

    static createProgress(questions = [], answers = {}) {
        const totalQuestions = questions.length;
        const answeredQuestions = Object.keys(answers).length;
        const unansweredQuestions = Math.max(totalQuestions - answeredQuestions, 0);
        const completionRate = totalQuestions > 0
            ? Math.round((answeredQuestions / totalQuestions) * 100)
            : 0;

        return {
            totalQuestions,
            answeredQuestions,
            unansweredQuestions,
            completionRate,
            previewOnly: true
        };
    }

    static createRejectedState(state = {}, reason = "Rejected") {
        return {
            ...state,
            stateMode: "sandbox_answer_state_rejected",
            reason,
            safetyBoundary: this.createSafetyBoundary()
        };
    }

    static createSafetyBoundary() {
        return {
            sandboxOnly: true,
            answerPersisted: false,
            inspectionCreated: false,
            evidenceCreated: false,
            findingCreated: false,
            assessmentCreated: false,
            reportCreated: false
        };
    }
}
