/**
 * MEIFERTS Building Intelligence
 * Draft Workspace Manager
 * Foundation 2.4-A
 *
 * Purpose:
 * Convert sandbox preview outputs into controlled draft workspace records.
 *
 * Safety:
 * - no client report creation
 * - no export
 * - no workflow finalization
 * - no expert approval
 */

export default class DraftWorkspaceManager {

    static createDraftRecord(sourceDraft = {}, options = {}) {

        const draftType = this.resolveDraftType(sourceDraft);
        const sourceQuestion = sourceDraft.question || sourceDraft.sourceQuestion || {};
        const sourceId = options.sourceId || sourceQuestion.questionId || "unknown-source";

        const draftRecord = {
            draftMode: "workspace_draft_controlled",
            draftType,
            draftId: options.draftId || this.createDraftId(draftType, sourceId),
            sourceId,
            sourceDraftMode: sourceDraft.draftMode || sourceDraft.previewMode || "unknown",
            createdAt: options.createdAt || new Date().toISOString(),
            updatedAt: options.updatedAt || options.createdAt || new Date().toISOString(),
            status: "draft",
            expertReviewStatus: "not_reviewed",
            sourceQuestion,
            payload: this.createPayload(sourceDraft, draftType),
            permissions: {
                canEdit: true,
                canDiscard: true,
                canRestore: true,
                canExport: false,
                canCreateClientDocument: false,
                canFinalizeWorkflow: false,
                requiresExpertApproval: true
            },
            safetyBoundary: this.createSafetyBoundary()
        };

        return draftRecord;

    }

    static resolveDraftType(sourceDraft = {}) {

        const mode = sourceDraft.draftMode || sourceDraft.previewMode || "";

        if (mode.includes("evidence_capture")) {
            return "evidence_capture_draft";
        }

        if (mode.includes("finding_draft")) {
            return "finding_draft";
        }

        if (mode.includes("assessment_draft")) {
            return "assessment_draft";
        }

        if (mode.includes("recommendation_draft")) {
            return "recommendation_draft";
        }

        if (mode.includes("decision_draft")) {
            return "decision_draft";
        }

        if (mode.includes("report_draft")) {
            return "report_draft";
        }

        return "unknown_draft";

    }

    static createDraftId(draftType, sourceId) {

        const safeType = String(draftType || "draft").replace(/[^a-z0-9_-]/gi, "-").toLowerCase();
        const safeSource = String(sourceId || "source").replace(/[^a-z0-9_-]/gi, "-").toLowerCase();

        return `${safeType}-${safeSource}`;

    }

    static createPayload(sourceDraft = {}, draftType = "unknown_draft") {

        if (draftType === "report_draft") {
            return {
                reportPrepared: Boolean(sourceDraft.reportPrepared),
                reportSection: sourceDraft.reportSection || null,
                report: sourceDraft.report || null,
                decision: sourceDraft.decision || null
            };
        }

        if (draftType === "decision_draft") {
            return {
                decisionPrepared: Boolean(sourceDraft.decisionPrepared),
                decisionRoute: sourceDraft.decisionRoute || null,
                decision: sourceDraft.decision || null
            };
        }

        if (draftType === "recommendation_draft") {
            return {
                recommendationPrepared: Boolean(sourceDraft.recommendationPrepared),
                recommendationTone: sourceDraft.recommendationTone || null,
                recommendation: sourceDraft.recommendation || null
            };
        }

        if (draftType === "assessment_draft") {
            return {
                assessmentPrepared: Boolean(sourceDraft.assessmentPrepared),
                riskLevel: sourceDraft.riskLevel || null,
                assessment: sourceDraft.assessment || null
            };
        }

        if (draftType === "finding_draft") {
            return {
                findingPrepared: Boolean(sourceDraft.findingPrepared),
                finding: sourceDraft.finding || null
            };
        }

        if (draftType === "evidence_capture_draft") {
            return {
                completion: sourceDraft.completion || null,
                evidence: sourceDraft.evidence || null
            };
        }

        return {
            raw: sourceDraft
        };

    }

    static createSafetyBoundary() {

        return {
            draftPersisted: false,
            clientDocumentCreated: false,
            reportExported: false,
            workflowFinalized: false,
            expertApprovalGranted: false
        };

    }

}
