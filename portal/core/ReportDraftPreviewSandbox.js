/**
 * MEIFERTS Building Intelligence
 * Report Draft Preview Sandbox
 * Foundation 2.3-J.1
 *
 * Creates a read-only report draft preview from a decision draft.
 * This layer is sandbox-only and must not persist or create real reports,
 * exports, client documents or workflow records.
 */

export default class ReportDraftPreviewSandbox {

    static createDraft(decisionDraft = {}, options = {}) {

        const canPrepareReport = Boolean(
            decisionDraft
            && decisionDraft.draftMode === "decision_draft_preview_sandbox_read_only"
            && decisionDraft.decisionPrepared === true
        );

        const sourceQuestionId =
            decisionDraft.decision?.sourceQuestionId
            || decisionDraft.question?.questionId
            || options.questionId
            || "sandbox-question";

        const decisionRoute = decisionDraft.decisionRoute || "expert_review";
        const reportSection = this.resolveReportSection(decisionRoute);

        const reportPrepared = canPrepareReport;

        return {
            draftMode: "report_draft_preview_sandbox_read_only",
            sourceDraftMode: decisionDraft?.draftMode || "unknown",
            sandboxOnly: true,
            canPrepareReport,
            reportPrepared,
            question: {
                questionId: sourceQuestionId,
                moduleId: decisionDraft.question?.moduleId || "sandbox-module",
                moduleTitle: decisionDraft.question?.moduleTitle || "Sandbox module"
            },
            decision: {
                title: decisionDraft.decision?.title || "Sandbox decision",
                route: decisionRoute,
                proposedDecision: decisionDraft.decision?.proposedDecision || "",
                requiredCondition: decisionDraft.decision?.requiredCondition || ""
            },
            report: reportPrepared
                ? this.createReport(decisionDraft, reportSection, sourceQuestionId)
                : null,
            reportSection,
            reportQuality: reportPrepared
                ? this.createReportQuality(decisionDraft)
                : null,
            guidance: this.createGuidance(reportPrepared, reportSection),
            safetyBoundary: this.createSafetyBoundary()
        };

    }

    static resolveReportSection(decisionRoute = "expert_review") {

        if (decisionRoute === "hold_decision") {
            return "critical_decision_blocker";
        }

        if (decisionRoute === "conditional_decision") {
            return "conditional_acquisition_note";
        }

        if (decisionRoute === "document_and_monitor") {
            return "maintenance_monitoring_note";
        }

        return "expert_review_note";

    }

    static createReport(decisionDraft = {}, reportSection = "expert_review_note", sourceQuestionId = "sandbox-question") {

        return {
            title: `Report draft · ${sourceQuestionId}`,
            section: reportSection,
            executiveSummary: this.createExecutiveSummary(decisionDraft, reportSection),
            technicalNarrative: this.createTechnicalNarrative(decisionDraft),
            decisionNote: this.createDecisionNote(decisionDraft),
            sourceQuestionId,
            persisted: false,
            previewOnly: true,
            exported: false
        };

    }

    static createExecutiveSummary(decisionDraft = {}, reportSection = "expert_review_note") {

        const proposedDecision = decisionDraft.decision?.proposedDecision || "Decision requires expert review.";
        return `${reportSection}: ${proposedDecision}`;

    }

    static createTechnicalNarrative(decisionDraft = {}) {

        const requiredCondition = decisionDraft.decision?.requiredCondition || "Expert validation required.";
        const governanceImpact = decisionDraft.governanceImpact?.decisionImpact || "Governance impact requires review.";

        return `${requiredCondition} ${governanceImpact}`;

    }

    static createDecisionNote(decisionDraft = {}) {

        const route = decisionDraft.decisionRoute || "expert_review";
        const summary = decisionDraft.decision?.summary || "Decision summary not available.";

        return `Decision route ${route}. ${summary}`;

    }

    static createReportQuality(decisionDraft = {}) {

        return {
            readyForExpertReview: true,
            requiresSourceEvidence: Boolean(decisionDraft.governanceImpact?.requiresExpertReview),
            requiresCapexReference: Boolean(decisionDraft.governanceImpact?.requiresCapexReview),
            requiresDecisionNote: Boolean(decisionDraft.governanceImpact?.requiresDecisionNote),
            decisionReference: decisionDraft.decision?.title || "Sandbox decision"
        };

    }

    static createGuidance(reportPrepared = false, reportSection = "expert_review_note") {

        if (!reportPrepared) {
            return {
                title: "Report draft not ready",
                primary: "Prepare decision draft first.",
                detail: "No report preview is created until the decision draft is prepared."
            };
        }

        return {
            title: "Report draft ready",
            primary: "Report preview prepared for expert review.",
            detail: `Sandbox-only report preview generated for ${reportSection}.`
        };

    }

    static createSafetyBoundary() {

        return {
            sandboxOnly: true,
            reportDraftPersisted: false,
            decisionDraftPersisted: false,
            recommendationDraftPersisted: false,
            assessmentDraftPersisted: false,
            findingDraftPersisted: false,
            evidencePersisted: false,
            reportCreated: false,
            reportExported: false,
            clientDocumentCreated: false,
            workflowCreated: false
        };

    }

}
