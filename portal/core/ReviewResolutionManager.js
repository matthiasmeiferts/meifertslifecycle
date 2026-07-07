import EvidenceManager from "./EvidenceManager.js";
import FindingManager from "./FindingManager.js";
import AssessmentManager from "./AssessmentManager.js";
import RecommendationManager from "./RecommendationManager.js";
import DecisionManager from "./DecisionManager.js";
import ReportManager from "./ReportManager.js";
import ReviewQueueManager from "./ReviewQueueManager.js";

export default class ReviewResolutionManager {

    static stages = {
        evidence: {
            label: "Evidence",
            manager: EvidenceManager,
            resolvedStatus: "Reviewed"
        },
        finding: {
            label: "Finding",
            manager: FindingManager,
            resolvedStatus: "Reviewed"
        },
        assessment: {
            label: "Assessment",
            manager: AssessmentManager,
            resolvedStatus: "Reviewed"
        },
        recommendation: {
            label: "Recommendation",
            manager: RecommendationManager,
            resolvedStatus: "Reviewed"
        },
        decision: {
            label: "Decision",
            manager: DecisionManager,
            resolvedStatus: "Approved"
        },
        report: {
            label: "Report",
            manager: ReportManager,
            resolvedStatus: "Reviewed"
        }
    };

    static resolveQueueItem(queueItemId, data = {}) {
        const parsed = this.parseQueueItemId(queueItemId);

        if (!parsed) {
            return null;
        }

        return this.resolveRecord(parsed.stage, parsed.recordId, data);
    }

    static resolveRecord(stageKey, recordId, data = {}) {
        const stage = this.getStage(stageKey);

        if (!stage || !recordId) {
            return null;
        }

        const record = stage.manager.load(recordId);

        if (!record) {
            return null;
        }

        const resolvedAt = data.reviewedAt || new Date().toISOString();
        const reviewedBy = data.reviewedBy || data.resolvedBy || "MEIFERTS Building Intelligence";
        const reviewStatus = data.reviewStatus || "Reviewed";
        const status = data.status || stage.resolvedStatus;

        const updated = stage.manager.update({
            ...record,
            status,
            reviewStatus,
            expertReviewRequired: false,
            sourceExpertReviewRequired: false,
            reviewed: true,
            reviewedAt: resolvedAt,
            reviewedBy,
            reviewResolvedAt: resolvedAt,
            reviewResolvedBy: reviewedBy,
            reviewResolution: data.reviewResolution || "Resolved",
            reviewNotes: data.reviewNotes || data.notes || "",
            updatedAt: resolvedAt
        });

        return {
            stage: stageKey,
            stageLabel: stage.label,
            recordId,
            record: updated,
            resolvedAt,
            reviewedBy,
            reviewStatus,
            status
        };
    }

    static markInReview(queueItemId, data = {}) {
        const parsed = this.parseQueueItemId(queueItemId);

        if (!parsed) {
            return null;
        }

        return this.updateReviewState(parsed.stage, parsed.recordId, {
            status: data.status || "Under Review",
            reviewStatus: data.reviewStatus || "In review",
            expertReviewRequired: true,
            reviewNotes: data.reviewNotes || data.notes || ""
        });
    }

    static reopenQueueItem(queueItemId, data = {}) {
        const parsed = this.parseQueueItemId(queueItemId);

        if (!parsed) {
            return null;
        }

        return this.updateReviewState(parsed.stage, parsed.recordId, {
            status: data.status || "Draft",
            reviewStatus: data.reviewStatus || "Needs review",
            expertReviewRequired: true,
            reviewNotes: data.reviewNotes || data.notes || ""
        });
    }

    static updateReviewState(stageKey, recordId, data = {}) {
        const stage = this.getStage(stageKey);

        if (!stage || !recordId) {
            return null;
        }

        const record = stage.manager.load(recordId);

        if (!record) {
            return null;
        }

        const updatedAt = data.updatedAt || new Date().toISOString();

        const updated = stage.manager.update({
            ...record,
            ...data,
            updatedAt
        });

        return {
            stage: stageKey,
            stageLabel: stage.label,
            recordId,
            record: updated,
            updatedAt
        };
    }

    static getResolutionSummary(options = {}) {
        const beforeQueue = ReviewQueueManager.getQueue(options);

        return {
            openItems: beforeQueue.length,
            byStage: ReviewQueueManager.countByStage(options),
            highestPriority: beforeQueue[0] || null
        };
    }

    static parseQueueItemId(queueItemId = "") {
        const value = String(queueItemId || "").trim();

        if (!value.includes(":")) {
            return null;
        }

        const [stage, ...recordParts] = value.split(":");
        const recordId = recordParts.join(":");

        if (!stage || !recordId) {
            return null;
        }

        return {
            stage,
            recordId
        };
    }

    static getStage(stageKey) {
        return this.stages[stageKey] || null;
    }
}
