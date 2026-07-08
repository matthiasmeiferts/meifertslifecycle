/**
 * MEIFERTS Building Intelligence
 * Inspection Human Work Layer
 * Foundation 2.3-A
 *
 * Purpose:
 * Transform a sandbox inspection session into a calm, human-friendly work view.
 *
 * Scope:
 * - Human work view only
 * - No inspection persistence
 * - No answer persistence
 * - No evidence creation
 * - No finding creation
 * - No assessment creation
 * - No report generation
 */

export default class InspectionHumanWorkLayer {

    static createWorkView(sandboxSession = {}, options = {}) {
        const modules = Array.isArray(sandboxSession.modules)
            ? sandboxSession.modules
            : [];

        const currentModuleIndex = Number.isInteger(options.currentModuleIndex)
            ? options.currentModuleIndex
            : 0;

        const currentQuestionIndex = Number.isInteger(options.currentQuestionIndex)
            ? options.currentQuestionIndex
            : 0;

        const currentModule = modules[currentModuleIndex] || modules[0] || null;
        const questions = currentModule && Array.isArray(currentModule.questions)
            ? currentModule.questions
            : [];

        const currentQuestion = questions[currentQuestionIndex] || questions[0] || null;

        return {
            workMode: "human_read_only",
            sourceSessionMode: sandboxSession.sessionMode || "unknown",
            profile: sandboxSession.profile || {},
            currentModule: this.createModuleContext(currentModule, currentModuleIndex),
            currentQuestion: this.createQuestionContext(currentQuestion, currentQuestionIndex),
            progress: this.createProgress(sandboxSession, currentModuleIndex, currentQuestionIndex),
            answerOptions: this.createAnswerOptions(),
            guidance: this.createGuidance(currentQuestion),
            safetyBoundary: {
                humanLayerOnly: true,
                inspectionCreated: false,
                answersPersisted: false,
                evidenceCreated: false,
                findingsCreated: false,
                assessmentsCreated: false,
                reportsCreated: false
            }
        };
    }

    static createModuleContext(module = null, index = 0) {
        if (!module) {
            return {
                moduleIndex: 0,
                chapterNumber: "",
                chapterTitle: "No module selected",
                buildingSystem: "n/a",
                questionCount: 0
            };
        }

        return {
            moduleIndex: index + 1,
            chapterNumber: module.chapterNumber || "",
            chapterTitle: module.chapterTitle || "Unassigned",
            buildingSystem: module.buildingSystem || "n/a",
            questionCount: module.questionCount || 0
        };
    }

    static createQuestionContext(question = null, index = 0) {
        if (!question) {
            return {
                questionIndex: 0,
                questionId: "",
                questionText: "No question selected.",
                sectionTitle: "",
                evidenceRequiredIfFinding: false,
                findingPreparedIfFinding: false
            };
        }

        return {
            questionIndex: index + 1,
            questionId: question.questionId || "",
            questionText: question.questionText || "",
            sectionTitle: question.sectionTitle || "",
            evidenceRequiredIfFinding: Boolean(question.evidenceState?.required),
            findingPreparedIfFinding: Boolean(question.findingState?.prepared)
        };
    }

    static createProgress(sandboxSession = {}, currentModuleIndex = 0, currentQuestionIndex = 0) {
        const totalQuestions = sandboxSession.progress?.totalQuestions || sandboxSession.questionCount || 0;
        const answeredQuestions = sandboxSession.progress?.answeredQuestions || 0;
        const unansweredQuestions = sandboxSession.progress?.unansweredQuestions ?? totalQuestions;

        return {
            totalQuestions,
            answeredQuestions,
            unansweredQuestions,
            completionRate: sandboxSession.progress?.completionRate || 0,
            currentModuleIndex: currentModuleIndex + 1,
            currentQuestionIndex: currentQuestionIndex + 1
        };
    }

    static createAnswerOptions() {
        return [
            {
                value: "ok",
                label: "OK",
                tone: "positive",
                description: "No relevant issue observed."
            },
            {
                value: "finding",
                label: "Auffällig",
                tone: "warning",
                description: "Issue observed. Evidence and expert review may be required."
            },
            {
                value: "not_verifiable",
                label: "Nicht prüfbar",
                tone: "neutral",
                description: "Could not be verified during inspection."
            },
            {
                value: "later",
                label: "Später",
                tone: "neutral",
                description: "Return to this question later."
            }
        ];
    }

    static createGuidance(question = null) {
        if (!question) {
            return {
                primary: "Select a question to continue.",
                evidenceHint: "",
                nextStep: "Select module"
            };
        }

        const evidenceRequired = Boolean(question.evidenceState?.required);

        return {
            primary: "Answer the current inspection question.",
            evidenceHint: evidenceRequired
                ? "If marked auffällig, add photo and comment during the evidence step."
                : "No evidence required unless an issue is observed.",
            nextStep: "Choose answer"
        };
    }
}
