import StatusBadge from "./StatusBadge.js";

export default class FinalizationGatePreview {

    static create(gate = null) {

        const status = gate?.status || "unknown";
        const isReady = status === "ready_for_internal_finalization_review";

        const preview = document.createElement("section");
        preview.className = isReady
            ? "finalization-gate-preview is-ready"
            : "finalization-gate-preview is-blocked";

        preview.dataset.finalizationGatePreview = "";

        const header = document.createElement("div");
        header.className = "finalization-gate-preview__header";

        const headingGroup = document.createElement("div");

        const kicker = document.createElement("p");
        kicker.className = "section-kicker";
        kicker.textContent = "Controlled Finalization Gate";

        const title = document.createElement("h3");
        title.textContent = "Finalization Gate";

        const description = document.createElement("p");
        description.textContent = "Controlled checkpoint after expert review. Internal finalization review is required before export preparation.";

        headingGroup.appendChild(kicker);
        headingGroup.appendChild(title);
        headingGroup.appendChild(description);

        header.appendChild(headingGroup);
        header.appendChild(StatusBadge.create(status));
        preview.appendChild(header);

        const metadata = document.createElement("dl");
        metadata.className = "finalization-gate-preview__summary";

        metadata.appendChild(
            this.createMetadataRow("Gate ID", gate?.gateId)
        );

        metadata.appendChild(
            this.createMetadataRow("Status", status)
        );

        metadata.appendChild(
            this.createMetadataRow(
                "Expert Review Approved",
                gate?.readiness?.expertReviewApproved
                    ? "Yes"
                    : "No"
            )
        );

        metadata.appendChild(
            this.createMetadataRow(
                "Internal Review",
                gate?.readiness?.internalFinalizationReviewRequired
                    ? "Required"
                    : "Not ready"
            )
        );

        preview.appendChild(metadata);

        const safety = document.createElement("small");
        safety.className = "finalization-gate-preview__safety";
        safety.textContent = [
            `canExport: ${String(gate?.permissions?.canExport === true)}`,
            `canCreateClientDocument: ${String(gate?.permissions?.canCreateClientDocument === true)}`,
            `canFinalizeWorkflow: ${String(gate?.permissions?.canFinalizeWorkflow === true)}`
        ].join(" · ");

        preview.appendChild(safety);

        return preview;

    }

    static createMetadataRow(label, value) {

        const row = document.createElement("div");

        const term = document.createElement("small");
        term.textContent = label;

        const description = document.createElement("strong");
        description.textContent = this.formatValue(value);

        row.appendChild(term);
        row.appendChild(description);

        return row;

    }

    static formatValue(value) {

        if (value === null || value === undefined || value === "") {
            return "—";
        }

        return String(value);

    }

}
