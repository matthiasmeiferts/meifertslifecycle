import ReviewQueueManager from "./ReviewQueueManager.js";

export default class WorkflowValidationGateManager {

    static intendedUses = {
        decision: "decision",
        report: "report",
        external: "external"
    };

    static validate(options = {}) {
        const caseId = options.caseId || null;
        const intendedUse = options.intendedUse || this.intendedUses.report;
        const allowWarnings = options.allowWarnings === true;

        const summary = caseId
            ? ReviewQueueManager.getSummary({ caseId })
            : ReviewQueueManager.getSummary();

        const queue = caseId
            ? ReviewQueueManager.getByCase(caseId)
            : ReviewQueueManager.getQueue();

        const blockingItems = this.getBlockingItems(queue, intendedUse);
        const warningItems = this.getWarningItems(queue, intendedUse);

        const canProceed = blockingItems.length === 0 && (allowWarnings || warningItems.length === 0);

        return {
            canProceed,
            status: canProceed ? "passed" : blockingItems.length ? "blocked" : "warning",
            intendedUse,
            caseId,
            totalReviewItems: queue.length,
            blockingItems,
            warningItems,
            highestPriority: summary.highestPriority,
            hasBlockedItems: summary.hasBlockedItems,
            message: this.getValidationMessage({
                canProceed,
                intendedUse,
                blockingItems,
                warningItems,
                summary
            })
        };
    }

    static validateForDecision(caseId = null, options = {}) {
        return this.validate({
            ...options,
            caseId,
            intendedUse: this.intendedUses.decision
        });
    }

    static validateForReport(caseId = null, options = {}) {
        return this.validate({
            ...options,
            caseId,
            intendedUse: this.intendedUses.report
        });
    }

    static validateForExternalUse(caseId = null, options = {}) {
        return this.validate({
            ...options,
            caseId,
            intendedUse: this.intendedUses.external
        });
    }

    static getBlockingItems(queue = [], intendedUse = this.intendedUses.report) {
        return queue.filter(item => {
            const status = ReviewQueueManager.normalize(item.status);
            const reviewStatus = ReviewQueueManager.normalize(item.reviewStatus);
            const priority = ReviewQueueManager.normalize(item.priority);

            if (status === "blocked" || reviewStatus === "blocked") {
                return true;
            }

            if (reviewStatus === "requires expert check") {
                return true;
            }

            if (item.sourceExpertReviewRequired === true && intendedUse !== this.intendedUses.decision) {
                return true;
            }

            if (item.expertReviewRequired === true && intendedUse === this.intendedUses.external) {
                return true;
            }

            if (["critical", "high"].includes(priority) && item.expertReviewRequired === true) {
                return true;
            }

            return false;
        });
    }

    static getWarningItems(queue = [], intendedUse = this.intendedUses.report) {
        const blockingIds = new Set(this.getBlockingItems(queue, intendedUse).map(item => item.id));

        return queue.filter(item => {
            if (blockingIds.has(item.id)) {
                return false;
            }

            const status = ReviewQueueManager.normalize(item.status);
            const reviewStatus = ReviewQueueManager.normalize(item.reviewStatus);

            return (
                status === "draft" ||
                status === "under review" ||
                reviewStatus === "needs review" ||
                reviewStatus === "in review" ||
                item.expertReviewRequired === true ||
                item.sourceExpertReviewRequired === true
            );
        });
    }

    static getValidationMessage(data = {}) {
        const blockingCount = data.blockingItems?.length || 0;
        const warningCount = data.warningItems?.length || 0;

        if (data.canProceed) {
            return "Workflow validation passed.";
        }

        if (blockingCount) {
            return `${blockingCount} blocking review item${blockingCount === 1 ? "" : "s"} must be resolved before ${data.intendedUse} use.`;
        }

        if (warningCount) {
            return `${warningCount} review warning${warningCount === 1 ? "" : "s"} should be reviewed before ${data.intendedUse} use.`;
        }

        return "Workflow validation requires review.";
    }
}
