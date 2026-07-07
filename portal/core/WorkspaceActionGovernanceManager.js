/**
 * MEIFERTS Professional Workspace
 * Workspace Action Governance Manager
 * Foundation 1.4-B
 */

export default class WorkspaceActionGovernanceManager {

    static lockedStatusValues = [
        "locked",
        "final",
        "finalized",
        "approved",
        "archived"
    ];

    static blockedStatusValues = [
        "blocked",
        "rejected",
        "cancelled"
    ];

    static reviewedStatusValues = [
        "reviewed",
        "approved",
        "final",
        "finalized"
    ];

    static getActionState(record = {}, options = {}) {
        record = record || {};
        options = options || {};

        const status = this.normalize(record.status);
        const reviewStatus = this.normalize(record.reviewStatus);

        const explicitlyLocked = Boolean(
            record.locked ||
            record.isLocked ||
            record.finalized ||
            record.archived ||
            options.locked
        );

        const explicitlyBlocked = Boolean(
            record.blocked ||
            record.isBlocked ||
            options.blocked
        );

        const statusLocked =
            this.lockedStatusValues.includes(status) ||
            this.lockedStatusValues.includes(reviewStatus);

        const statusBlocked =
            this.blockedStatusValues.includes(status) ||
            this.blockedStatusValues.includes(reviewStatus);

        const locked = explicitlyLocked || statusLocked;
        const blocked = explicitlyBlocked || statusBlocked;

        const openAllowed = options.allowOpen !== false;
        const editAllowed = openAllowed && !locked && !blocked && options.allowEdit !== false;
        const deleteAllowed = openAllowed && !locked && !blocked && options.allowDelete !== false;

        const downstreamAllowed =
            openAllowed &&
            !blocked &&
            options.allowDownstream !== false &&
            this.isDownstreamReady(record, options);

        return {
            openAllowed,
            editAllowed,
            deleteAllowed,
            downstreamAllowed,
            locked,
            blocked,
            reviewed: this.isReviewed(record),
            status,
            reviewStatus,
            reason: this.getReason({
                locked,
                blocked,
                downstreamAllowed,
                record,
                options
            })
        };
    }

    static canOpen(record = {}, options = {}) {
        return this.getActionState(record, options).openAllowed;
    }

    static canEdit(record = {}, options = {}) {
        return this.getActionState(record, options).editAllowed;
    }

    static canDelete(record = {}, options = {}) {
        return this.getActionState(record, options).deleteAllowed;
    }

    static canCreateDownstream(record = {}, options = {}) {
        return this.getActionState(record, options).downstreamAllowed;
    }

    static isReviewed(record = {}) {
        const status = this.normalize(record.status);
        const reviewStatus = this.normalize(record.reviewStatus);

        return Boolean(record.reviewed) ||
            this.reviewedStatusValues.includes(status) ||
            this.reviewedStatusValues.includes(reviewStatus);
    }

    static isDownstreamReady(record = {}, options = {}) {
        if (options.requireReview === true && !this.isReviewed(record)) {
            return false;
        }

        if (options.requireContent === true && !this.hasContent(record)) {
            return false;
        }

        return true;
    }

    static hasContent(record = {}) {
        return Boolean(
            record.title ||
            record.name ||
            record.description ||
            record.summary ||
            record.executiveSummary ||
            record.decision ||
            record.outcome
        );
    }

    static getReason({ locked = false, blocked = false, downstreamAllowed = true, record = {}, options = {} } = {}) {
        if (locked) {
            return options.lockedReason || "Record is locked by workspace governance.";
        }

        if (blocked) {
            return options.blockedReason || "Record is blocked by workspace governance.";
        }

        if (!downstreamAllowed) {
            if (options.requireReview === true && !this.isReviewed(record)) {
                return options.reviewRequiredReason || "Expert review is required before downstream use.";
            }

            if (options.requireContent === true && !this.hasContent(record)) {
                return options.contentRequiredReason || "Record content is required before downstream use.";
            }

            return options.downstreamBlockedReason || "Downstream action is not available.";
        }

        return options.readyReason || "Workspace action is available.";
    }

    static normalize(value = "") {
        return String(value || "").trim().toLowerCase();
    }
}
