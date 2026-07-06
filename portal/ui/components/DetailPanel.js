import LanguageManager from "../../core/LanguageManager.js";

export default class DetailPanel {

    static create(title = "No Case Selected", fields = []) {

        const panel = document.createElement("section");
        panel.className = "detail-panel";

        const eyebrow = document.createElement("p");
        eyebrow.className = "eyebrow";
        eyebrow.textContent = LanguageManager.t("DetailContextDetails");

        const headline = document.createElement("h2");
        headline.textContent = title;

        panel.appendChild(eyebrow);
        panel.appendChild(headline);

        fields.forEach(field => {
            const row = document.createElement("div");
            row.className = this.getRowClass(field);

            const label = document.createElement("span");
            label.textContent = field.label || "Field";

            const value = document.createElement("strong");

            if (field.value instanceof Node) {
                value.appendChild(field.value);
            } else {
                value.textContent = this.formatValue(field.value);
            }

            row.appendChild(label);
            row.appendChild(value);
            panel.appendChild(row);
        });

        return panel;
    }

    static createBoundaryBadges(record = {}) {
        const badges = [];

        if (record.expertReviewRequired !== false) {
            badges.push({ label: LanguageManager.t("DetailExpertReviewRequired"), tone: "warning" });
        }

        if (record.noAutomaticDecision) {
            badges.push({ label: LanguageManager.t("DetailNoAutomaticDecision"), tone: "critical" });
        }

        if (record.decisionSupportOnly) {
            badges.push({ label: LanguageManager.t("DetailDecisionSupportOnly"), tone: "info" });
        }

        if (record.reportPreparationOnly) {
            badges.push({ label: LanguageManager.t("DetailReportPreparationOnly"), tone: "info" });
        }

        if (record.noAutomaticFinalReport) {
            badges.push({ label: LanguageManager.t("DetailNoFinalReport"), tone: "critical" });
        }

        if (record.noAutomaticOpinion) {
            badges.push({ label: LanguageManager.t("DetailNoAutomaticOpinion"), tone: "critical" });
        }

        if (record.sourcePolicy === "availability_check_only") {
            badges.push({ label: LanguageManager.t("DetailDocumentAvailabilityOnly"), tone: "boundary" });
        }

        if (!badges.length) {
            badges.push({ label: LanguageManager.t("DetailStandardReview"), tone: "neutral" });
        }

        const container = document.createElement("div");
        container.className = "detail-boundary-badges";

        badges.forEach(item => {
            const badge = document.createElement("span");
            badge.className = `detail-boundary-badge detail-boundary-badge--${item.tone}`;
            badge.textContent = item.label;
            container.appendChild(badge);
        });

        return container;
    }

    static formatValue(value) {
        if (value === null || value === undefined || value === "") {
            return "—";
        }

        if (Array.isArray(value)) {
            return value.length ? value.join(", ") : "—";
        }

        return String(value);
    }

    static getRowClass(field = {}) {
        const label = String(field.label || "");
        const value = this.formatValue(field.value);
        const classes = ["detail-row"];

        if (
            label.includes("ID") ||
            label.includes("IDs") ||
            value.includes("EV-") ||
            value.includes("FIN-") ||
            value.includes("ASM-") ||
            value.includes("REC-") ||
            value.includes("DEC-") ||
            value.includes("REP-")
        ) {
            classes.push("detail-row--id");
        }

        if (
            value.length > 80 ||
            label.toLowerCase().includes("summary") ||
            label.toLowerCase().includes("description") ||
            label.toLowerCase().includes("selected")
        ) {
            classes.push("detail-row--long");
        }

        if (value === "—" || value === "None" || value === "Not linked" || value === "Keine" || value === "Nicht verknüpft") {
            classes.push("detail-row--empty");
        }

        return classes.join(" ");
    }

}
