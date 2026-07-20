import IntelligenceEngine from "./IntelligenceEngine.js";
import ReviewQueueManager from "./ReviewQueueManager.js";
import WorkflowValidationGateManager from "./WorkflowValidationGateManager.js";

export default class CaseWorkflowProgressManager {

    static stages = [
        "evidence",
        "finding",
        "assessment",
        "recommendation",
        "decision",
        "report"
    ];

    /**
     * Creates a read-only workflow progress model for one case.
     *
     * The model reports workflow coverage and review governance.
     * It does not change case status, record status or stored progress.
     */
    static create(caseItem = {}, data = {}) {
        const caseId = caseItem.id || caseItem.caseId || null;

        const relatedData = this.getRelatedData(caseId, data);
        const counts = IntelligenceEngine.getWorkflowCounts(relatedData);

        const readiness = IntelligenceEngine.getStageReadiness(
            counts,
            this.stages
        );

        const representedStages = this.stages.filter(
            stage => (counts[stage] || 0) > 0
        );

        const missingStages = this.stages.filter(
            stage => (counts[stage] || 0) === 0
        );

        const currentStage = this.getCurrentStage(counts);
        const nextStage = IntelligenceEngine.getFirstOpenStage(
            counts,
            this.stages
        );

        const reviewSummary = caseId
            ? ReviewQueueManager.getSummary({ caseId })
            : {
                total: 0,
                byStage: {},
                highestPriority: null,
                hasBlockedItems: false
            };

        const validation = caseId
            ? WorkflowValidationGateManager.validateForReport(caseId)
            : {
                canProceed: false,
                status: "unavailable",
                blockingItems: [],
                warningItems: []
            };

        const blockingReviewItemCount = validation.blockingItems.length;
        const warningReviewItemCount = validation.warningItems.length;
        const isWorkflowRepresented = readiness.isComplete;
        const canProceedToReport = validation.canProceed;

        return {
            caseId,
            counts,
            representedStages,
            missingStages,
            representedStageCount: readiness.completedStages,
            totalStages: readiness.totalStages,
            readinessPercent: readiness.percent,
            isWorkflowRepresented,
            currentStage,
            nextStage,
            reviewItemCount: reviewSummary.total,
            reviewItemsByStage: reviewSummary.byStage,
            blockingReviewItemCount,
            warningReviewItemCount,
            hasReviewBlockers: blockingReviewItemCount > 0,
            hasReviewWarnings: warningReviewItemCount > 0,
            validationStatus: validation.status,
            canProceedToReport,
            isReviewReady: isWorkflowRepresented && canProceedToReport
        };
    }

    static getRelatedData(caseId = null, data = {}) {
        return {
            inspections: IntelligenceEngine.filterByRelation(
                data.inspections,
                { caseId }
            ),
            evidence: IntelligenceEngine.filterByRelation(
                data.evidence || data.evidences,
                { caseId }
            ),
            findings: IntelligenceEngine.filterByRelation(
                data.findings,
                { caseId }
            ),
            assessments: IntelligenceEngine.filterByRelation(
                data.assessments,
                { caseId }
            ),
            recommendations: IntelligenceEngine.filterByRelation(
                data.recommendations,
                { caseId }
            ),
            decisions: IntelligenceEngine.filterByRelation(
                data.decisions,
                { caseId }
            ),
            reports: IntelligenceEngine.filterByRelation(
                data.reports,
                { caseId }
            )
        };
    }

    static getCurrentStage(counts = {}) {
        const firstMissingIndex = this.stages.findIndex(
            stage => (counts[stage] || 0) === 0
        );

        if (firstMissingIndex === 0) {
            return null;
        }

        if (firstMissingIndex === -1) {
            return this.stages[this.stages.length - 1];
        }

        return this.stages[firstMissingIndex - 1];
    }
}
