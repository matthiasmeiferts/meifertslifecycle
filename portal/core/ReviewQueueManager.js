import EvidenceManager from "./EvidenceManager.js";
import FindingManager from "./FindingManager.js";
import AssessmentManager from "./AssessmentManager.js";
import RecommendationManager from "./RecommendationManager.js";
import DecisionManager from "./DecisionManager.js";
import ReportManager from "./ReportManager.js";

export default class ReviewQueueManager {

    static stages = [
        { key: "evidence", label: "Evidence", manager: EvidenceManager },
        { key: "finding", label: "Finding", manager: FindingManager },
        { key: "assessment", label: "Assessment", manager: AssessmentManager },
        { key: "recommendation", label: "Recommendation", manager: RecommendationManager },
        { key: "decision", label: "Decision", manager: DecisionManager },
        { key: "report", label: "Report", manager: ReportManager }
    ];

    static reviewStatusTriggers = [
        "needs review",
        "in review",
        "requires expert check",
        "blocked",
        "draft",
        "under review"
    ];

    static reviewedStatusValues = [
        "reviewed",
        "approved",
        "complete",
        "completed",
        "final",
        "finalized"
    ];

    static getQueue(options = {}) {
        const caseId = options.caseId || null;

        return this.stages
            .flatMap(stage => this.getStageItems(stage, caseId))
            .filter(item => this.isReviewRequired(item.record))
            .sort((a, b) => {
                if (b.priorityScore !== a.priorityScore) {
                    return b.priorityScore - a.priorityScore;
                }

                return a.stageOrder - b.stageOrder;
            });
    }

    static getByCase(caseId) {
        return this.getQueue({ caseId });
    }

    static getStageItems(stage, caseId = null) {
        const records = caseId && typeof stage.manager.getByCase === "function"
            ? stage.manager.getByCase(caseId)
            : stage.manager.getAll();

        return (records || []).map(record => ({
            id: `${stage.key}:${record.id}`,
            recordId: record.id,
            caseId: record.caseId || "",
            buildingId: record.buildingId || "",
            inspectionId: record.inspectionId || "",
            stage: stage.key,
            stageLabel: stage.label,
            stageOrder: this.stages.findIndex(item => item.key === stage.key),
            title: record.title || record.name || record.id,
            status: record.status || "",
            reviewStatus: record.reviewStatus || "",
            expertReviewRequired: record.expertReviewRequired !== false,
            sourceExpertReviewRequired: record.sourceExpertReviewRequired === true,
            priority: record.priority || record.riskLevel || record.decisionImpact || "",
            priorityScore: this.getPriorityScore(record),
            reason: this.getReviewReason(record),
            record
        }));
    }

    static isReviewRequired(record = {}) {
        if (!record || !record.id) {
            return false;
        }

        const reviewStatus = this.normalize(record.reviewStatus);
        const status = this.normalize(record.status);

        const isReviewed =
            this.reviewedStatusValues.includes(reviewStatus) ||
            this.reviewedStatusValues.includes(status);

        const isBlocked =
            reviewStatus === "blocked" ||
            status === "blocked";

        if (isReviewed && !isBlocked) {
            return false;
        }

        if (record.expertReviewRequired === true) {
            return true;
        }

        if (record.sourceExpertReviewRequired === true) {
            return true;
        }

        if (this.reviewStatusTriggers.includes(reviewStatus)) {
            return true;
        }

        if (this.reviewStatusTriggers.includes(status)) {
            return true;
        }

        return false;
    }

    static getReviewReason(record = {}) {
        if (record.expertReviewRequired === true) {
            return "Expert review required";
        }

        if (record.sourceExpertReviewRequired === true) {
            return "Source evidence requires expert review";
        }

        if (record.reviewStatus) {
            return `Review status: ${record.reviewStatus}`;
        }

        if (record.status) {
            return `Status: ${record.status}`;
        }

        return "Review required";
    }

    static getPriorityScore(record = {}) {
        const values = [
            record.priority,
            record.riskLevel,
            record.decisionImpact,
            record.severity,
            record.reviewStatus,
            record.status
        ].map(value => this.normalize(value));

        if (values.some(value => ["critical", "blocked"].includes(value))) {
            return 100;
        }

        if (values.some(value => ["high", "requires expert check"].includes(value))) {
            return 80;
        }

        if (values.some(value => ["medium", "needs review", "in review", "under review"].includes(value))) {
            return 60;
        }

        if (values.some(value => ["low", "draft", "open"].includes(value))) {
            return 40;
        }

        return 20;
    }

    static countByStage(options = {}) {
        return this.getQueue(options).reduce((summary, item) => {
            summary[item.stage] = (summary[item.stage] || 0) + 1;
            return summary;
        }, {});
    }

    static getSummary(options = {}) {
        const queue = this.getQueue(options);
        const byStage = this.countByStage(options);

        return {
            total: queue.length,
            byStage,
            highestPriority: queue[0] || null,
            hasBlockedItems: queue.some(item => this.normalize(item.status) === "blocked" || this.normalize(item.reviewStatus) === "blocked")
        };
    }

    static normalize(value = "") {
        return String(value || "").trim().toLowerCase();
    }
}
