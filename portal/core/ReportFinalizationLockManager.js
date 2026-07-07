import ReportOutputGovernanceManager from "./ReportOutputGovernanceManager.js";
import ReviewQueueManager from "./ReviewQueueManager.js";

export default class ReportFinalizationLockManager {

    static lockedStatusValues = [
        "approved",
        "final",
        "finalized",
        "archived"
    ];

    static getLockState(report = {}, options = {}) {
        const status = ReviewQueueManager.normalize(report.status);
        const reviewStatus = ReviewQueueManager.normalize(report.reviewStatus);
        const externalOutput = ReportOutputGovernanceManager.validateExternalOutput(report, {
            allowWarnings: options.allowWarnings === true
        });

        const statusLocked = this.lockedStatusValues.includes(status);
        const reviewLocked = this.lockedStatusValues.includes(reviewStatus);
        const explicitlyLocked = report.locked === true || report.finalizedLocked === true;
        const governanceLocked = externalOutput.canProceed === true && (statusLocked || reviewLocked);

        const locked = explicitlyLocked || governanceLocked || status === "archived";

        return {
            reportId: report.id || "",
            caseId: report.caseId || null,
            locked,
            statusLocked,
            reviewLocked,
            explicitlyLocked,
            governanceLocked,
            status: report.status || "",
            reviewStatus: report.reviewStatus || "",
            canEdit: !locked,
            canDelete: !locked && options.allowDelete !== false,
            canPrepareDraftOutput: !locked,
            canExportExternal: externalOutput.canProceed === true,
            externalOutput,
            reason: locked
                ? this.getLockedReason(report, externalOutput)
                : this.getUnlockedReason(report, externalOutput)
        };
    }

    static isLocked(report = {}, options = {}) {
        return this.getLockState(report, options).locked;
    }

    static canEdit(report = {}, options = {}) {
        return this.getLockState(report, options).canEdit;
    }

    static canDelete(report = {}, options = {}) {
        return this.getLockState(report, options).canDelete;
    }

    static canPrepareDraftOutput(report = {}, options = {}) {
        return this.getLockState(report, options).canPrepareDraftOutput;
    }

    static canExportExternal(report = {}, options = {}) {
        return this.getLockState(report, options).canExportExternal;
    }

    static getLockedReason(report = {}, externalOutput = {}) {
        const status = ReviewQueueManager.normalize(report.status);

        if (report.locked === true || report.finalizedLocked === true) {
            return "Report is explicitly locked.";
        }

        if (status === "archived") {
            return "Archived reports are locked.";
        }

        if (externalOutput.canProceed === true) {
            return "Report is final-output ready and locked against draft changes.";
        }

        return "Report is locked.";
    }

    static getUnlockedReason(report = {}, externalOutput = {}) {
        if (externalOutput.canProceed !== true) {
            return "Report remains editable because final output governance has not passed.";
        }

        return "Report remains editable.";
    }
}
