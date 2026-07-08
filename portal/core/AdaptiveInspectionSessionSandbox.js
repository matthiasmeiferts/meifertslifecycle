/**
 * MEIFERTS Building Intelligence
 * Adaptive Inspection Session Sandbox
 * Foundation 2.2-H
 *
 * Purpose:
 * Prepare a read-only sandbox session structure from an adaptive scope draft.
 *
 * Scope:
 * - Sandbox only
 * - No inspection persistence
 * - No answer persistence
 * - No evidence creation
 * - No finding creation
 * - No assessment creation
 * - No report generation
 */

export default class AdaptiveInspectionSessionSandbox {

    static createSandboxSession(scopeDraft = {}, options = {}) {
        const modules = Array.isArray(scopeDraft.modules)
            ? scopeDraft.modules
            : [];

        const sessionModules = modules.map((module, index) => this.createSandboxModule(module, index));

        const questionCount = sessionModules.reduce((sum, module) => {
            return sum + module.questions.length;
        }, 0);

        return {
            sessionMode: "sandbox_read_only",
            sourceDraftMode: scopeDraft.draftMode || "unknown",
            sandboxId: options.sandboxId || this.createSandboxId(),
            profile: scopeDraft.profile || {},
            totalCatalogItems: scopeDraft.totalCatalogItems || 0,
            moduleCount: sessionModules.length,
            questionCount,
            evidenceRequirements: Array.isArray(scopeDraft.evidenceRequirements)
                ? [...scopeDraft.evidenceRequirements]
                : [],
            signalSummary: Array.isArray(scopeDraft.signalSummary)
                ? [...scopeDraft.signalSummary]
                : [],
            modules: sessionModules,
            progress: {
                totalQuestions: questionCount,
                answeredQuestions: 0,
                unansweredQuestions: questionCount,
                completionRate: 0
            },
            safetyBoundary: {
                sandboxOnly: true,
                inspectionCreated: false,
                answersPersisted: false,
                evidenceCreated: false,
                findingsCreated: false,
                assessmentsCreated: false,
                reportsCreated: false
            }
        };
    }

    static createSandboxModule(module = {}, index = 0) {
        const questions = Array.isArray(module.questions)
            ? module.questions
            : [];

        return {
            moduleIndex: index + 1,
            key: module.key || "",
            chapterNumber: module.chapterNumber || "",
            chapterTitle: module.chapterTitle || "Unassigned",
            buildingSystem: module.buildingSystem || "n/a",
            questionCount: questions.length,
            candidateFollowUpCount: module.candidateFollowUpCount || 0,
            findingFollowUpCount: module.findingFollowUpCount || 0,
            okSkipCount: module.okSkipCount || 0,
            evidenceRequirements: Array.isArray(module.evidenceRequirements)
                ? [...module.evidenceRequirements]
                : [],
            signals: Array.isArray(module.signals)
                ? [...module.signals]
                : [],
            questions: questions.map((question, questionIndex) => this.createSandboxQuestion(question, questionIndex))
        };
    }

    static createSandboxQuestion(question = {}, index = 0) {
        return {
            sandboxQuestionIndex: index + 1,
            questionId: question.questionId || "",
            questionText: question.questionText || "",
            sectionTitle: question.sectionTitle || "",
            adaptiveScore: question.adaptiveScore || 0,
            candidateFollowUpCount: question.candidateFollowUpCount || 0,
            findingFollowUpCount: question.findingFollowUpCount || 0,
            okSkipCount: question.okSkipCount || 0,
            answerState: {
                value: null,
                isAnswered: false,
                persisted: false
            },
            evidenceState: {
                required: question.findingFollowUpCount > 0,
                created: false,
                evidenceIds: []
            },
            findingState: {
                prepared: question.findingFollowUpCount > 0,
                created: false,
                findingIds: []
            }
        };
    }

    static createSandboxId() {
        return `sandbox-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }
}
