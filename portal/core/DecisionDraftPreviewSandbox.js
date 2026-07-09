/**
 * MEIFERTS Building Intelligence
 * Decision Draft Preview Sandbox
 * Foundation 2.3-I.1
 *
 * Creates a read-only decision draft preview from a recommendation draft.
 * This layer is sandbox-only and must not persist or create real decisions,
 * reports or workflow records.
 */

export default class DecisionDraftPreviewSandbox {

    static createDraft(recommendationDraft = {}, options = {}) {

        const canPrepareDecision = Boolean(
            recommendationDraft
            && recommendationDraft.draftMode === "recommendation_draft_preview_sandbox_read_only"
            && recommendationDraft.recommendationPrepared === true
        );

        const sourceQuestionId =
            recommendationDraft.recommendation?.sourceQuestionId
            || recommendationDraft.question?.questionId
            || options.questionId
            || "sandbox-question";

        const linkedRiskLevel =
            recommendationDraft.recommendation?.linkedRiskLevel
            || recommendationDraft.assessment?.riskLevel
            || "medium";

        const decisionRoute = this.resolveDecisionRoute(linkedRiskLevel, recommendationDraft.recommendationTone);

        const decisionPrepared = canPrepareDecision;

        return {
            draftMode: "decision_draft_preview_sandbox_read_only",
            sourceDraftMode: recommendationDraft?.draftMode || "unknown",
            sandboxOnly: true,
            canPrepareDecision,
            decisionPrepared,
            question: {
                questionId: sourceQuestionId,
                moduleId: recommendationDraft.question?.moduleId || "sandbox-module",
                moduleTitle: recommendationDraft.question?.moduleTitle || "Sandbox module"
            },
            recommendation: {
                title: recommendationDraft.recommendation?.title || "Sandbox recommendation",
                tone: recommendationDraft.recommendationTone || "balanced",
                linkedRiskLevel,
                nextAction: recommendationDraft.recommendation?.nextAction || "",
                expertRecommendation: recommendationDraft.recommendation?.expertRecommendation || ""
            },
            decision: decisionPrepared
                ? this.createDecision(recommendationDraft, decisionRoute, sourceQuestionId)
                : null,
            decisionRoute,
            governanceImpact: decisionPrepared
                ? this.createGovernanceImpact(recommendationDraft, linkedRiskLevel)
                : null,
            guidance: this.createGuidance(decisionPrepared, decisionRoute),
            safetyBoundary: this.createSafetyBoundary()
        };

    }

    static resolveDecisionRoute(riskLevel = "medium", tone = "balanced") {

        if (riskLevel === "critical" || riskLevel === "high" || tone === "protective") {
            return "hold_decision";
        }

        if (riskLevel === "elevated" || tone === "risk_control") {
            return "conditional_decision";
        }

        if (riskLevel === "low" || tone === "monitor") {
            return "document_and_monitor";
        }

        return "expert_review";

    }

    static createDecision(recommendationDraft = {}, decisionRoute = "expert_review", sourceQuestionId = "sandbox-question") {

        return {
            title: `Decision draft · ${sourceQuestionId}`,
            route: decisionRoute,
            summary: this.createDecisionSummary(recommendationDraft, decisionRoute),
            proposedDecision: this.createProposedDecision(decisionRoute),
            requiredCondition: this.createRequiredCondition(decisionRoute),
            sourceQuestionId,
            persisted: false,
            previewOnly: true
        };

    }

    static createDecisionSummary(recommendationDraft = {}, decisionRoute = "expert_review") {

        const nextAction = recommendationDraft.recommendation?.nextAction || "Review before decision.";
        const decisionImpact = recommendationDraft.decisionSupport?.decisionImpact || "Decision impact requires expert review.";

        return `${decisionRoute}: ${nextAction} ${decisionImpact}`;

    }

    static createProposedDecision(decisionRoute = "expert_review") {

        if (decisionRoute === "hold_decision") {
            return "Do not proceed until the issue has been technically clarified.";
        }

        if (decisionRoute === "conditional_decision") {
            return "Proceed only under documented conditions, risk allocation and CAPEX review.";
        }

        if (decisionRoute === "document_and_monitor") {
            return "Proceed with documentation and future monitoring.";
        }

        return "Request expert review before final decision.";

    }

    static createRequiredCondition(decisionRoute = "expert_review") {

        if (decisionRoute === "hold_decision") {
            return "Technical clarification required before decision release.";
        }

        if (decisionRoute === "conditional_decision") {
            return "Expert review, CAPEX consideration and transaction risk note required.";
        }

        if (decisionRoute === "document_and_monitor") {
            return "Document item in inspection file and maintenance planning.";
        }

        return "Expert validation required.";

    }

    static createGovernanceImpact(recommendationDraft = {}, riskLevel = "medium") {

        return {
            decisionImpact: recommendationDraft.decisionSupport?.decisionImpact || "Decision impact requires expert review.",
            requiresExpertReview: Boolean(recommendationDraft.decisionSupport?.requiresExpertReview),
            requiresCapexReview: Boolean(recommendationDraft.decisionSupport?.requiresCapexReview),
            requiresDecisionNote: riskLevel === "elevated" || riskLevel === "high" || riskLevel === "critical",
            recommendationReference: recommendationDraft.recommendation?.title || "Sandbox recommendation"
        };

    }

    static createGuidance(decisionPrepared = false, decisionRoute = "expert_review") {

        if (!decisionPrepared) {
            return {
                title: "Decision draft not ready",
                primary: "Prepare recommendation draft first.",
                detail: "No decision preview is created until the recommendation draft is prepared."
            };
        }

        return {
            title: "Decision draft ready",
            primary: "Decision preview prepared for expert review.",
            detail: `Sandbox-only decision preview generated with ${decisionRoute} route.`
        };

    }

    static createSafetyBoundary() {

        return {
            sandboxOnly: true,
            decisionDraftPersisted: false,
            recommendationDraftPersisted: false,
            assessmentDraftPersisted: false,
            findingDraftPersisted: false,
            evidencePersisted: false,
            decisionCreated: false,
            reportCreated: false,
            workflowCreated: false
        };

    }

}
