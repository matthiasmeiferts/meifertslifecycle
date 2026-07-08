/**
 * MEIFERTS Building Intelligence
 * Adaptive Scope Draft Engine
 * Foundation 2.2-G
 *
 * Purpose:
 * Derive a read-only inspection scope draft from an adaptive inspection preview.
 *
 * Scope:
 * - Read-only draft
 * - No inspection persistence
 * - No answer persistence
 * - No evidence creation
 * - No finding creation
 * - No assessment creation
 * - No report generation
 */

export default class AdaptiveScopeDraftEngine {

    static createScopeDraft(preview = {}, options = {}) {
        const previewQuestions = Array.isArray(preview.previewQuestions)
            ? preview.previewQuestions
            : [];

        const modules = this.createModules(previewQuestions);
        const evidenceRequirements = this.collectEvidenceRequirements(previewQuestions);
        const signalSummary = this.collectSignals(previewQuestions);
        const questionCount = previewQuestions.length;

        return {
            draftMode: "read_only",
            profile: preview.profile || {},
            sourcePreviewMode: preview.previewMode || "unknown",
            totalCatalogItems: preview.totalCatalogItems || 0,
            questionCount,
            moduleCount: modules.length,
            modules,
            evidenceRequirements,
            signalSummary,
            safetyBoundary: {
                inspectionCreated: false,
                answersPersisted: false,
                evidenceCreated: false,
                findingsCreated: false,
                assessmentsCreated: false,
                reportsCreated: false
            }
        };
    }

    static createModules(previewQuestions = []) {
        const moduleMap = new Map();

        previewQuestions.forEach((previewQuestion) => {
            const question = previewQuestion.question || {};
            const key = this.getModuleKey(question);

            if (!moduleMap.has(key)) {
                moduleMap.set(key, {
                    key,
                    chapterNumber: question.chapterNumber || "",
                    chapterTitle: question.chapterTitle || "Unassigned",
                    buildingSystem: question.buildingSystem || "n/a",
                    questionCount: 0,
                    candidateFollowUpCount: 0,
                    findingFollowUpCount: 0,
                    okSkipCount: 0,
                    evidenceRequirements: [],
                    signals: [],
                    questions: []
                });
            }

            const module = moduleMap.get(key);

            module.questionCount += 1;
            module.candidateFollowUpCount += previewQuestion.candidateFollowUpCount || 0;
            module.findingFollowUpCount += previewQuestion.negativeSimulation?.followUpQuestionIds?.length || 0;
            module.okSkipCount += previewQuestion.positiveSimulation?.skippedQuestionIds?.length || 0;

            module.evidenceRequirements.push(
                ...(previewQuestion.negativeSimulation?.evidenceRequirements || [])
            );

            module.signals.push(
                ...(previewQuestion.negativeSimulation?.signals || []),
                ...(previewQuestion.positiveSimulation?.signals || [])
            );

            module.questions.push({
                questionId: question.questionId || "",
                questionText: question.questionText || "",
                sectionTitle: question.sectionTitle || "",
                adaptiveScore: question.adaptiveScore || 0,
                candidateFollowUpCount: previewQuestion.candidateFollowUpCount || 0,
                findingFollowUpCount: previewQuestion.negativeSimulation?.followUpQuestionIds?.length || 0,
                okSkipCount: previewQuestion.positiveSimulation?.skippedQuestionIds?.length || 0
            });
        });

        return Array.from(moduleMap.values())
            .map((module) => ({
                ...module,
                evidenceRequirements: this.unique(module.evidenceRequirements),
                signals: this.unique(module.signals)
            }))
            .sort((a, b) => {
                if (a.chapterNumber !== b.chapterNumber) {
                    return String(a.chapterNumber).localeCompare(String(b.chapterNumber));
                }

                return a.chapterTitle.localeCompare(b.chapterTitle);
            });
    }

    static collectEvidenceRequirements(previewQuestions = []) {
        const requirements = [];

        previewQuestions.forEach((previewQuestion) => {
            requirements.push(
                ...(previewQuestion.negativeSimulation?.evidenceRequirements || [])
            );
        });

        return this.unique(requirements);
    }

    static collectSignals(previewQuestions = []) {
        const counts = {};

        previewQuestions.forEach((previewQuestion) => {
            [
                ...(previewQuestion.negativeSimulation?.signals || []),
                ...(previewQuestion.positiveSimulation?.signals || [])
            ].forEach((signal) => {
                counts[signal] = (counts[signal] || 0) + 1;
            });
        });

        return Object.entries(counts)
            .map(([signal, count]) => ({
                signal,
                count
            }))
            .sort((a, b) => {
                if (b.count !== a.count) {
                    return b.count - a.count;
                }

                return a.signal.localeCompare(b.signal);
            });
    }

    static getModuleKey(question = {}) {
        return [
            question.chapterNumber || "00",
            question.chapterTitle || "Unassigned",
            question.buildingSystem || "n/a"
        ].join("|");
    }

    static unique(values = []) {
        return [...new Set(values.filter(Boolean))];
    }
}
