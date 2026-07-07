import WorkflowValidationGateManager from "./WorkflowValidationGateManager.js";
import ReviewQueueManager from "./ReviewQueueManager.js";

export default class ReportOutputGovernanceManager {

    static outputUses = {
        draft: "draft",
        final: "final",
        external: "external"
    };

    static finalStatusValues = [
        "approved",
        "final",
        "finalized",
        "archived"
    ];

    static reviewedStatusValues = [
        "reviewed",
        "approved",
        "final",
        "finalized"
    ];

    static validateDraftOutput(report = {}, options = {}) {
        const gate = WorkflowValidationGateManager.validateForReport(report.caseId || null, {
            allowWarnings: options.allowWarnings !== false
        });

        return this.createResult(report, gate, this.outputUses.draft, {
            canProceed: gate.status !== "blocked",
            reason: gate.status === "blocked"
                ? "Draft output is blocked by unresolved review items."
                : "Draft output may be prepared for expert review."
        });
    }

    static validateFinalOutput(report = {}, options = {}) {
        const gate = WorkflowValidationGateManager.validateForExternalUse(report.caseId || null, {
            allowWarnings: options.allowWarnings === true
        });

        const reviewCleared = this.isReviewCleared(report);
        const finalStatus = this.hasFinalStatus(report);
        const canProceed = gate.canProceed && reviewCleared && finalStatus;

        return this.createResult(report, gate, this.outputUses.final, {
            canProceed,
            reason: canProceed
                ? "Final output governance passed."
                : this.getFinalOutputBlockReason(report, gate)
        });
    }

    static validateExternalOutput(report = {}, options = {}) {
        const finalResult = this.validateFinalOutput(report, options);

        return {
            ...finalResult,
            outputUse: this.outputUses.external,
            reason: finalResult.canProceed
                ? "External output governance passed."
                : finalResult.reason
        };
    }

    static createResult(report = {}, gate = {}, outputUse = this.outputUses.draft, data = {}) {
        return {
            reportId: report.id || "",
            caseId: report.caseId || null,
            outputUse,
            canProceed: data.canProceed === true,
            status: data.canProceed === true ? "passed" : gate.status || "blocked",
            reason: data.reason || "Report output governance requires review.",
            reportStatus: report.status || "",
            reviewStatus: report.reviewStatus || "",
            expertReviewRequired: report.expertReviewRequired !== false,
            noAutomaticFinalReport: report.noAutomaticFinalReport === true,
            finalStatus: this.hasFinalStatus(report),
            reviewCleared: this.isReviewCleared(report),
            gate
        };
    }

    static isReviewCleared(report = {}) {
        const status = ReviewQueueManager.normalize(report.status);
        const reviewStatus = ReviewQueueManager.normalize(report.reviewStatus);

        if (report.expertReviewRequired === true) {
            return false;
        }

        if (report.noAutomaticFinalReport === true) {
            return false;
        }

        return (
            this.reviewedStatusValues.includes(reviewStatus) ||
            this.reviewedStatusValues.includes(status)
        );
    }

    static hasFinalStatus(report = {}) {
        const status = ReviewQueueManager.normalize(report.status);
        const reviewStatus = ReviewQueueManager.normalize(report.reviewStatus);

        return (
            this.finalStatusValues.includes(status) ||
            this.finalStatusValues.includes(reviewStatus)
        );
    }

    static getFinalOutputBlockReason(report = {}, gate = {}) {
        if (gate.status === "blocked") {
            return "Final output is blocked by unresolved review items.";
        }

        if (gate.status === "warning") {
            return "Final output has unresolved review warnings.";
        }

        if (report.noAutomaticFinalReport === true) {
            return "Report is marked as draft-only and cannot be used as final output.";
        }

        if (report.expertReviewRequired === true) {
            return "Expert review must be completed before final output.";
        }

        if (!this.hasFinalStatus(report)) {
            return "Report status is not final or approved.";
        }

        if (!this.isReviewCleared(report)) {
            return "Report review status is not cleared.";
        }

        return "Final output governance requires review.";
    }
}
