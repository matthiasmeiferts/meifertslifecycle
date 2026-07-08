/**
 * MEIFERTS Building Intelligence
 * Adaptive Inspection Preview Bridge
 * Foundation 2.2-F
 *
 * Purpose:
 * Combine adaptive profile question selection with adaptive follow-up simulation.
 *
 * Scope:
 * - Read-only preview
 * - No answer persistence
 * - No evidence creation
 * - No finding creation
 * - No assessment creation
 * - No report generation
 */

import AdaptiveInspectionProfileEngine from "./AdaptiveInspectionProfileEngine.js";
import AdaptiveFollowUpQuestionEngine from "./AdaptiveFollowUpQuestionEngine.js";

export default class AdaptiveInspectionPreviewBridge {

    static createPreview(profile = {}, catalogItems = [], options = {}) {
        const startLimit = Number.isInteger(options.startLimit) ? options.startLimit : 10;
        const followUpLimit = Number.isInteger(options.followUpLimit) ? options.followUpLimit : 5;
        const simulatedNegativeAnswer = options.simulatedNegativeAnswer || "finding";
        const simulatedPositiveAnswer = options.simulatedPositiveAnswer || "ok";

        const startQuestionSet = AdaptiveInspectionProfileEngine.createStartQuestionSet(
            profile,
            catalogItems,
            { limit: startLimit }
        );

        const previewQuestions = startQuestionSet.questions.map((question) => {
            const candidateFollowUps = this.getCandidateFollowUps(question, catalogItems);

            const negativeSimulation = AdaptiveFollowUpQuestionEngine.evaluateAnswer({
                ...question,
                answerValue: simulatedNegativeAnswer,
                profile,
                candidateFollowUps
            });

            const positiveSimulation = AdaptiveFollowUpQuestionEngine.evaluateAnswer({
                ...question,
                answerValue: simulatedPositiveAnswer,
                profile,
                candidateFollowUps
            });

            return {
                question,
                candidateFollowUpCount: candidateFollowUps.length,
                negativeSimulation: this.limitSimulation(negativeSimulation, followUpLimit),
                positiveSimulation: this.limitSimulation(positiveSimulation, followUpLimit)
            };
        });

        return {
            profile: startQuestionSet.profile,
            totalCatalogItems: startQuestionSet.totalCatalogItems,
            startQuestionCount: previewQuestions.length,
            startQuestionSet,
            previewQuestions,
            previewMode: "read_only",
            safetyBoundary: {
                answersPersisted: false,
                evidenceCreated: false,
                findingsCreated: false,
                assessmentsCreated: false,
                reportsCreated: false
            }
        };
    }

    static getCandidateFollowUps(mainQuestion = {}, catalogItems = []) {
        return catalogItems.filter((question) => {
            return question.questionId !== mainQuestion.questionId &&
                (
                    question.buildingSystem === mainQuestion.buildingSystem ||
                    question.inspectionArea === mainQuestion.inspectionArea ||
                    question.component === mainQuestion.component ||
                    question.chapterNumber === mainQuestion.chapterNumber
                );
        });
    }

    static limitSimulation(simulation = {}, limit = 5) {
        return {
            ...simulation,
            followUpQuestionIds: (simulation.followUpQuestionIds || []).slice(0, limit),
            skippedQuestionIds: (simulation.skippedQuestionIds || []).slice(0, limit),
            evidenceRequirements: [...new Set(simulation.evidenceRequirements || [])],
            signals: [...new Set(simulation.signals || [])]
        };
    }
}
