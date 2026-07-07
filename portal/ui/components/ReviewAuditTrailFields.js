import LanguageManager from "../../core/LanguageManager.js";

export default class ReviewAuditTrailFields {

    static create(record = {}) {
        const reviewedBy = record.reviewedBy || record.reviewResolvedBy || "";
        const reviewedAt = record.reviewedAt || record.reviewResolvedAt || "";
        const reviewResolution = record.reviewResolution || "";
        const reviewNotes = record.reviewNotes || "";

        if (!reviewedBy && !reviewedAt && !reviewResolution && !reviewNotes) {
            return [];
        }

        return [
            {
                label: LanguageManager.t("DashboardReviewReviewedByLabel"),
                value: reviewedBy || LanguageManager.t("DashboardReviewAuditNotRecorded")
            },
            {
                label: LanguageManager.t("DashboardReviewReviewedAtLabel"),
                value: reviewedAt
                    ? this.formatDate(reviewedAt)
                    : LanguageManager.t("DashboardReviewAuditNotRecorded")
            },
            {
                label: LanguageManager.t("DashboardReviewResolutionLabel"),
                value: reviewResolution || LanguageManager.t("DashboardReviewAuditNotRecorded")
            },
            {
                label: LanguageManager.t("DashboardReviewNotesLabel"),
                value: reviewNotes || LanguageManager.t("DashboardReviewAuditNotRecorded")
            }
        ];
    }

    static formatDate(value = "") {
        if (!value) {
            return "";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleString();
    }
}
