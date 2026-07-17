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
            answers &&
            typeof answers === "object" &&
            !Array.isArray(answers)
                ? answers
                : {};

        const safeContext =
            context &&
            typeof context === "object" &&
            !Array.isArray(context)
                ? context
                : {};

        const visibleQuestions =
            this.invokeEngine(
                QuestionVisibilityEngine,
                [
                    "filterVisibleQuestions",
                    "getVisibleQuestions",
                    "evaluateQuestions",
                    "evaluateVisibility",
                    "applyVisibility"
                ],
                [
                    safeQuestions,
                    safeAnswers,
                    safeContext
                ],
                safeQuestions
            );

        const prioritizedQuestions =
            this.invokeEngine(
                QuestionPriorityEngine,
                [
                    "prioritizeQuestions",
                    "sortQuestions",
                    "applyPriority",
                    "evaluatePriority"
                ],
                [
                    visibleQuestions,
                    safeAnswers,
                    safeContext
                ],
                visibleQuestions
            );

        const navigation =
            this.invokeEngine(
                InspectionGraphNavigator,
                [
                    "navigate",
                    "buildNavigation",
                    "resolveNavigation",
                    "createNavigation",
                    "generateNavigation"
                ],
                [
                    prioritizedQuestions,
                    graph,
                    safeAnswers,
                    safeContext
                ],
                prioritizedQuestions
            );

        const generatedFollowUps =
            this.invokeEngine(
                FollowUpGenerationEngine,
                [
                    "generateFollowUps",
                    "generate",
                    "createFollowUps",
                    "evaluateFollowUps"
                ],
                [
                    prioritizedQuestions,
                    safeAnswers,
                    safeContext,
                    navigation
                ],
                []
            );

        const evidence =
            this.invokeEngine(
                EvidenceDecisionEngine,
                [
                    "evaluateEvidence",
                    "generateEvidence",
                    "decideEvidence",
                    "resolveEvidence"
                ],
                [
                    prioritizedQuestions,
                    generatedFollowUps,
                    safeContext,
                    safeAnswers
                ],
                []
            );

        const findings =
            this.invokeEngine(
                FindingGenerationEngine,
                [
                    "generateFindings",
                    "generate",
                    "createFindings"
                ],
                [
                    prioritizedQuestions,
                    generatedFollowUps,
                    evidence,
                    safeContext,
                    safeAnswers
                ],
                []
            );

        const assessments =
            this.invokeEngine(
                AssessmentGenerationEngine,
                [
                    "generateAssessments",
                    "generate",
                    "createAssessments"
                ],
                [
                    findings,
                    safeContext
                ],
                []
            );

        const recommendations =
            this.invokeEngine(
                RecommendationGenerationEngine,
                [
                    "generateRecommendations",
                    "generate",
                    "createRecommendations"
                ],
                [
                    assessments,
                    safeContext
                ],
                []
            );

        const report =
            ReportAssemblyEngine.assembleReport({
                context: safeContext,
                findings,
                assessments,
                recommendations
            });

        return {
            input: {
                questions: [...safeQuestions],
                answers: { ...safeAnswers },
                context: { ...safeContext }
            },

            visibleQuestions:
                this.normalizeArray(
                    visibleQuestions
                ),

            prioritizedQuestions:
                this.normalizeArray(
                    prioritizedQuestions
                ),

            navigation,

            generatedFollowUps:
                this.normalizeArray(
                    generatedFollowUps
                ),

            evidence:
                this.normalizeArray(
                    evidence
                ),

            findings:
                this.normalizeArray(
                    findings
                ),

            assessments:
                this.normalizeArray(
                    assessments
                ),

            recommendations:
                this.normalizeArray(
                    recommendations
                ),

            report
        };

    }

    static invokeEngine(
        engine,
        methodNames,
        args,
        fallback
    ) {

        if (
            !engine ||
            typeof engine !== "function"
        ) {
            return fallback;
        }

        for (const methodName of methodNames) {

            if (
                typeof engine[methodName] ===
                "function"
            ) {

                const result =
                    engine[methodName](
                        ...args
                    );

                return result ??
                    fallback;

            }

        }

        return fallback;

    }

    static normalizeArray(
        value
    ) {

        return Array.isArray(value)
            ? [...value]
            : [];

    }

}
