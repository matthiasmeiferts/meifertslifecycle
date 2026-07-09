/**
 * MEIFERTS Building Intelligence
 * Recommendation Draft Preview Sandbox
 * Foundation 2.3-H.1
 *
 * Creates a read-only recommendation draft preview from an assessment draft.
 * This layer is sandbox-only and must not persist or create real recommendations,
 * decisions, reports or workflow records.
 */

export default class RecommendationDraftPreviewSandbox {

    static createDraft(assessmentDraft = {}, options = {}) {

        const canPrepareRecommendation = Boolean(
            assessmentDraft
            && assessmentDraft.draftMode === "assessment_draft_preview_sandbox_read_only"
            && assessmentDraft.assessmentPrepared === true
        );

        const sourceQuestionId =
            assessmentDraft.finding?.sourceQuestionId
            || assessmentDraft.question?.questionId
            || options.questionId
            || "sandbox-question";

        const riskLevel = assessmentDraft.riskPreview?.level || "medium";
        const recommendationTone = this.resolveRecommendationTone(riskLevel);

        const recommendationPrepared = canPrepareRecommendation;

        return {
            draftMode: "recommendation_draft_preview_sandbox_read_only",
            sourceDraftMode: assessmentDraft?.draftMode || "unknown",
            sandboxOnly: true,
            canPrepareRecommendation,
            recommendationPrepared,
            question: {
                questionId: sourceQuestionId,
                moduleId: assessmentDraft.question?.moduleId || assessmentDraft.question?.chapterId || "sandbox-module",
                moduleTitle: assessmentDraft.question?.moduleTitle || assessmentDraft.question?.chapterTitle || "Sandbox module"
            },
            assessment: {
                assessmentTitle: assessmentDraft.assessment?.assessmentTitle || "Sandbox assessment",
                riskLevel,
                technicalImplication: assessmentDraft.assessment?.technicalImplication || "",
                recommendedReview: assessmentDraft.assessment?.recommendedReview || ""
            },
            recommendation: recommendationPrepared
                ? this.createRecommendation(assessmentDraft, recommendationTone, sourceQuestionId)
                : null,
            recommendationTone,
            decisionSupport: recommendationPrepared
                ? this.createDecisionSupport(assessmentDraft, riskLevel)
                : null,
            guidance: this.createGuidance(recommendationPrepared, recommendationTone),
            safetyBoundary: this.createSafetyBoundary()
        };

    }

    static resolveRecommendationTone(riskLevel = "medium") {

        if (riskLevel === "critical" || riskLevel === "high") {
            return "protective";
        }

        if (riskLevel === "elevated") {
            return "risk_control";
        }

        if (riskLevel === "low") {
            return "monitor";
        }

        return "balanced";

    }

    static createRecommendation(assessmentDraft = {}, tone = "balanced", sourceQuestionId = "sandbox-question") {

        const riskLevel = assessmentDraft.riskPreview?.level || "medium";
        const technicalImplication = assessmentDraft.assessment?.technicalImplication || "Technical implication requires expert review.";
        const recommendedReview = assessmentDraft.assessment?.recommendedReview || "Expert review recommended before decision.";

        return {
            title: `Recommendation draft · ${sourceQuestionId}`,
            summary: this.createSummary(riskLevel, technicalImplication),
            expertRecommendation: this.createExpertRecommendation(tone, recommendedReview),
            nextAction: this.createNextAction(tone),
            linkedRiskLevel: riskLevel,
            sourceQuestionId,
            persisted: false,
            previewOnly: true
        };

    }

    static createSummary(riskLevel = "medium", technicalImplication = "") {

        return `Based on the assessment preview, the issue is classified as ${riskLevel}. ${technicalImplication}`;

    }

    static createExpertRecommendation(tone = "balanced", recommendedReview = "") {

        if (tone === "protective") {
            return `Do not proceed with the decision until the issue has been technically clarified. ${recommendedReview}`;
        }

        if (tone === "risk_control") {
            return `Proceed only with documented expert review, risk allocation and CAPEX consideration. ${recommendedReview}`;
        }

        if (tone === "monitor") {
            return `Record the item and monitor it during regular maintenance planning. ${recommendedReview}`;
        }

        return `Include the item in the technical decision file and review it before final commitment. ${recommendedReview}`;

    }

    static createNextAction(tone = "balanced") {

        if (tone === "protective") {
            return "Escalate to expert review before acquisition decision.";
        }

        if (tone === "risk_control") {
            return "Include in CAPEX review and transaction risk discussion.";
        }

        if (tone === "monitor") {
            return "Document and monitor in future inspection cycle.";
        }

        return "Review before final recommendation.";

    }

    static createDecisionSupport(assessmentDraft = {}, riskLevel = "medium") {

        return {
            decisionImpact: riskLevel === "elevated" || riskLevel === "high" || riskLevel === "critical"
                ? "May affect acquisition decision, negotiation position or CAPEX assumption."
                : "Supports technical documentation and maintenance planning.",
            requiresExpertReview: riskLevel === "elevated" || riskLevel === "high" || riskLevel === "critical",
            requiresCapexReview: riskLevel === "elevated" || riskLevel === "high" || riskLevel === "critical",
            assessmentReference: assessmentDraft.assessment?.assessmentTitle || "Sandbox assessment"
        };

    }

    static createGuidance(recommendationPrepared = false, tone = "balanced") {

        if (!recommendationPrepared) {
            return {
                title: "Recommendation draft not ready",
                primary: "Prepare assessment draft first.",
                detail: "No recommendation preview is created until the assessment draft is prepared."
            };
        }

        return {
            title: "Recommendation draft ready",
            primary: "Recommendation preview prepared for expert review.",
            detail: `Sandbox-only recommendation preview generated with ${tone} guidance.`
        };

    }

    static createSafetyBoundary() {

        return {
            sandboxOnly: true,
            recommendationDraftPersisted: false,
            assessmentDraftPersisted: false,
            findingDraftPersisted: false,
            evidencePersisted: false,
            recommendationCreated: false,
            decisionCreated: false,
            reportCreated: false,
            workflowCreated: false
        };

    }

}
