import QuestionVisibilityEngine from "./QuestionVisibilityEngine.js";
import QuestionPriorityEngine from "./QuestionPriorityEngine.js";
import InspectionGraphNavigator from "./InspectionGraphNavigator.js";
import FollowUpGenerationEngine from "./FollowUpGenerationEngine.js";
import EvidenceDecisionEngine from "./EvidenceDecisionEngine.js";
import FindingGenerationEngine from "./FindingGenerationEngine.js";
import AssessmentGenerationEngine from "./AssessmentGenerationEngine.js";
import RecommendationGenerationEngine from "./RecommendationGenerationEngine.js";
import ReportAssemblyEngine from "./ReportAssemblyEngine.js";

export default class InspectionPipelineEngine {

    static run({
        questions = [],
        answers = {},
        context = {},
        graph = {}
    } = {}) {

        const safeQuestions =
            Array.isArray(questions)
                ? questions
                : [];

        const safeAnswers =
            this.normalizeAnswers(
                answers
            );

        const safeContext =
            this.normalizeContext(
                context
            );

        const inspectionContext = {
            ...safeContext,
            answers:
                this.cloneValue(
                    safeAnswers
                )
        };

        const visibleQuestions =
            safeQuestions.filter(
                (question) =>
                    QuestionVisibilityEngine.isVisible(
                        question,
                        inspectionContext
                    ).visible
            );

        const orderedQuestionEntries =
            QuestionPriorityEngine.getOrderedQuestions(
                visibleQuestions,
                inspectionContext
            );

        const prioritizedQuestions =
            orderedQuestionEntries
                .map((entry) => entry?.question)
                .filter(Boolean);

        const navigation =
            InspectionGraphNavigator.getNavigationState(
                safeQuestions,
                inspectionContext
            );

        const nextQuestion =
            InspectionGraphNavigator.getNextQuestion(
                safeQuestions,
                inspectionContext
            );

        const generatedFollowUps =
            FollowUpGenerationEngine.generateFollowUps(
                prioritizedQuestions,
                inspectionContext
            );

        const evidence =
            EvidenceDecisionEngine.evaluateEvidence(
                prioritizedQuestions,
                generatedFollowUps,
                inspectionContext
            );

        const findings =
            FindingGenerationEngine.generateFindings(
                prioritizedQuestions,
                generatedFollowUps,
                evidence,
                inspectionContext
            );

        const assessments =
            AssessmentGenerationEngine.generateAssessments(
                findings,
                inspectionContext
            );

        const recommendations =
            RecommendationGenerationEngine.generateRecommendations(
                assessments,
                inspectionContext
            );

        const report =
            ReportAssemblyEngine.assembleReport({
                context:
                    inspectionContext,
                findings,
                assessments,
                recommendations
            });

        return {
            input: {
                questions:
                    this.cloneValue(
                        safeQuestions
                    ),

                answers:
                    this.cloneValue(
                        safeAnswers
                    ),

                context:
                    this.cloneValue(
                        safeContext
                    ),

                graph:
                    this.cloneValue(
                        graph
                    )
            },

            inspectionContext:
                this.cloneValue(
                    inspectionContext
                ),

            visibleQuestions:
                [...visibleQuestions],

            orderedQuestionEntries:
                [...orderedQuestionEntries],

            prioritizedQuestions:
                [...prioritizedQuestions],

            navigation,

            nextQuestion,

            generatedFollowUps:
                [...generatedFollowUps],

            evidence:
                [...evidence],

            findings:
                [...findings],

            assessments:
                [...assessments],

            recommendations:
                [...recommendations],

            report
        };

    }

    static normalizeAnswers(
        answers
    ) {
        if (Array.isArray(answers)) {
            return this.cloneValue(
                answers
            );
        }

        if (
            answers &&
            typeof answers === "object"
        ) {
            return {
                ...answers
            };
        }

        return {};
    }

    static normalizeContext(
        context
    ) {
        if (
            !context ||
            typeof context !== "object" ||
            Array.isArray(context)
        ) {
            return {};
        }

        return {
            ...context
        };
    }

    static cloneValue(
        value
    ) {
        if (
            value === undefined
        ) {
            return undefined;
        }

        return JSON.parse(
            JSON.stringify(value)
        );
    }

}
