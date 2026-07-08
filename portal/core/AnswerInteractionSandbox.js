/**
 * MEIFERTS Building Intelligence
 * Answer Interaction Sandbox
 * Foundation 2.3-B
 *
 * Purpose:
 * Apply a temporary, non-persistent answer interaction to a human work view.
 *
 * Scope:
 * - Sandbox interaction only
 * - No inspection persistence
 * - No answer persistence
 * - No evidence creation
 * - No finding creation
 * - No assessment creation
 * - No report generation
 */

export default class AnswerInteractionSandbox {

    static applyAnswer(workView = {}, answerValue = "", options = {}) {
        const option = this.findAnswerOption(workView.answerOptions, answerValue);

        if (!option) {
            return this.createRejectedInteraction(workView, answerValue);
        }

        const currentQuestion = workView.currentQuestion || {};
        const interaction = this.createInteractionState(workView, option, options);

        return {
            interactionMode: "answer_sandbox_read_only",
            workMode: workView.workMode || "unknown",
            selectedAnswer: {
                value: option.value,
                label: option.label,
                tone: option.tone,
                description: option.description
            },
            currentModule: workView.currentModule || {},
            currentQuestion,
            guidance: this.createPostAnswerGuidance(currentQuestion, option),
            progressPreview: this.createProgressPreview(workView.progress || {}, option),
            interaction,
            safetyBoundary: {
                sandboxOnly: true,
                answerPersisted: false,
                inspectionCreated: false,
                evidenceCreated: false,
                findingCreated: false,
                assessmentCreated: false,
                reportCreated: false
            }
        };
    }

    static findAnswerOption(answerOptions = [], answerValue = "") {
        if (!Array.isArray(answerOptions)) {
            return null;
        }

        return answerOptions.find((option) => option.value === answerValue) || null;
    }

    static createInteractionState(workView = {}, option = {}, options = {}) {
        return {
            interactionId: options.interactionId || this.createInteractionId(),
            status: "preview_only",
            timestamp: options.timestamp || null,
            questionId: workView.currentQuestion?.questionId || "",
            answerValue: option.value,
            answerLabel: option.label,
            persisted: false,
            evidenceCreated: false,
            findingCreated: false
        };
    }

    static createPostAnswerGuidance(question = {}, option = {}) {
        if (option.value === "finding") {
            return {
                primary: "Issue marked as auffällig.",
                evidenceHint: question.evidenceRequiredIfFinding
                    ? "Next step would require photo and comment. No evidence has been created in sandbox mode."
                    : "Review may be required. No evidence has been created in sandbox mode.",
                nextStep: "Preview evidence requirement"
            };
        }

        if (option.value === "not_verifiable") {
            return {
                primary: "Question marked as not verifiable.",
                evidenceHint: "Reason should be documented later. No answer has been persisted.",
                nextStep: "Preview documentation note"
            };
        }

        if (option.value === "later") {
            return {
                primary: "Question postponed.",
                evidenceHint: "The question remains open. No answer has been persisted.",
                nextStep: "Return later"
            };
        }

        return {
            primary: "Question marked as OK.",
            evidenceHint: "No issue recorded. No answer has been persisted.",
            nextStep: "Preview next question"
        };
    }

    static createProgressPreview(progress = {}, option = {}) {
        const totalQuestions = progress.totalQuestions || 0;
        const answeredQuestions = option.value === "later"
            ? (progress.answeredQuestions || 0)
            : (progress.answeredQuestions || 0) + 1;

        const unansweredQuestions = Math.max(totalQuestions - answeredQuestions, 0);
        const completionRate = totalQuestions
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

    static createRejectedInteraction(workView = {}, answerValue = "") {
        return {
            interactionMode: "answer_sandbox_rejected",
            workMode: workView.workMode || "unknown",
            rejectedAnswerValue: answerValue,
            reason: "Unknown answer option",
            safetyBoundary: {
                sandboxOnly: true,
                answerPersisted: false,
                inspectionCreated: false,
                evidenceCreated: false,
                findingCreated: false,
                assessmentCreated: false,
                reportCreated: false
            }
        };
    }

    static createInteractionId() {
        return `answer-sandbox-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }
}
