import StatusBadge from "./StatusBadge.js";

export default class ExportPreparationGatePreview {

    static create(gate = null) {

        const status = gate?.status || "unknown";
        const isRequired = status === "export_preparation_review_required";

        const preview = document.createElement("section");
        preview.className = isRequired
            ? "export-preparation-gate-preview is-required"
            : "export-preparation-gate-preview is-blocked";

        preview.dataset.exportPreparationGateCard = "";

        const header = document.createElement("div");
        header.className = "export-preparation-gate-preview__header";

        const headingGroup = document.createElement("div");

        const kicker = document.createElement("p");
        kicker.className = "section-kicker";
        kicker.textContent = "Foundation 2.8-C Export Preparation Gate Browser Preview";

        const title = document.createElement("h3");
        title.textContent = "Export Preparation Gate";

        const description = document.createElement("p");
        description.textContent = "Controlled preparation checkpoint after internal finalization review. No export file is created.";

        headingGroup.appendChild(kicker);
        headingGroup.appendChild(title);
        headingGroup.appendChild(description);

        header.appendChild(headingGroup);
        header.appendChild(StatusBadge.create(status));
        preview.appendChild(header);

        const metadata = document.createElement("dl");
        metadata.className = "export-preparation-gate-preview__meta";

        metadata.appendChild(
            this.createMetadataRow("Gate ID", gate?.gateId)
        );

        metadata.appendChild(
            this.createMetadataRow(
                "Source Internal Review",
                gate?.sourceInternalReviewId || "not available"
            )
        );

        metadata.appendChild(
            this.createMetadataRow(
                "Internal Review Completed",
                gate?.readiness?.internalFinalizationReviewCompleted
                    ? "Yes"
                    : "No"
            )
        );

        metadata.appendChild(
            this.createMetadataRow(
                "Export Preparation Review",
                gate?.readiness?.exportPreparationReviewRequired
                    ? "Required"
                    : "Not ready"
            )
        );

        preview.appendChild(metadata);

        const safety = document.createElement("div");
        safety.className = "export-preparation-gate-preview__safety";

        const safetyTitle = document.createElement("strong");
        safetyTitle.textContent = "Safety boundary";

        const safetyText = document.createElement("span");
        safetyText.textContent = "Export preparation only. Export, client document creation and workflow finalization remain locked.";

        safety.appendChild(safetyTitle);
        safety.appendChild(safetyText);
        preview.appendChild(safety);

        const locks = document.createElement("ul");
        locks.className = "export-preparation-gate-preview__locks";

        [
            ["Can export", gate?.permissions?.canExport],
            ["Can create client document", gate?.permissions?.canCreateClientDocument],
            ["Can finalize workflow", gate?.permissions?.canFinalizeWorkflow],
            ["Export file created", gate?.safetyBoundary?.exportFileCreated]
        ].forEach(([label, value]) => {
            const item = document.createElement("li");
            item.textContent = `${label}: ${value === true ? "true" : "false"}`;
            locks.appendChild(item);
        });

        preview.appendChild(locks);

        return preview;

    }

    static createMetadataRow(label, value) {

        const row = document.createElement("div");

        const term = document.createElement("dt");
        term.textContent = label;

        const description = document.createElement("dd");
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
