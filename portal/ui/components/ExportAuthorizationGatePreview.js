import StatusBadge from "./StatusBadge.js";

export default class ExportAuthorizationGatePreview {

    static create(gate = null) {

        const status = gate?.status || "unknown";
        const isRequired = status === "export_authorization_required";

        const preview = document.createElement("section");
        preview.className = isRequired
            ? "export-authorization-gate-preview is-required"
            : "export-authorization-gate-preview is-blocked";

        preview.dataset.exportAuthorizationGateCard = "";

        const header = document.createElement("div");
        header.className = "export-authorization-gate-preview__header";

        const headingGroup = document.createElement("div");

        const kicker = document.createElement("p");
        kicker.className = "section-kicker";
        kicker.textContent = "Foundation 3.0-C Controlled Export Authorization Gate Browser Preview";

        const title = document.createElement("h3");
        title.textContent = "Export Authorization Gate";

        const description = document.createElement("p");
        description.textContent = "Controlled gate after approved Export Preparation Review. No export file is created.";

        headingGroup.appendChild(kicker);
        headingGroup.appendChild(title);
        headingGroup.appendChild(description);

        const statusBadge = StatusBadge.create(status);

        header.appendChild(headingGroup);
        header.appendChild(statusBadge);
        preview.appendChild(header);

        const metadata = document.createElement("dl");
        metadata.className = "export-authorization-gate-preview__meta";

        metadata.appendChild(
            this.createMetadataRow("Gate ID", gate?.gateId)
        );

        metadata.appendChild(
            this.createMetadataRow(
                "Source Export Preparation Review",
                gate?.sourceExportPreparationReviewId || "not available"
            )
        );

        metadata.appendChild(
            this.createMetadataRow(
                "Export Preparation Review Completed",
                gate?.readiness?.exportPreparationReviewCompleted
                    ? "Yes"
                    : "No"
            )
        );

        metadata.appendChild(
            this.createMetadataRow(
                "Export Authorization",
                gate?.readiness?.exportAuthorizationRequired
                    ? "Required"
                    : "Not ready"
            )
        );

        preview.appendChild(metadata);

        const safety = document.createElement("div");
        safety.className = "export-authorization-gate-preview__safety";

        const safetyTitle = document.createElement("strong");
        safetyTitle.textContent = "Safety boundary";

        const safetyText = document.createElement("span");
        safetyText.textContent = "Controlled export authorization gate only. Export, client document creation and workflow finalization remain locked.";

        safety.appendChild(safetyTitle);
        safety.appendChild(safetyText);
        preview.appendChild(safety);

        const locks = document.createElement("ul");
        locks.className = "export-authorization-gate-preview__locks";

        [
            ["Can export", gate?.permissions?.canExport],
            ["Can create client document", gate?.permissions?.canCreateClientDocument],
            ["Can finalize workflow", gate?.permissions?.canFinalizeWorkflow],
            ["Export file created", gate?.safetyBoundary?.exportFileCreated]
        ].forEach(([label, value]) => {
            locks.appendChild(this.createLockItem(label, value));
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

    static createLockItem(label, value) {

        const item = document.createElement("li");
        item.textContent = `${label}: ${value === true ? "true" : "false"}`;

        return item;

    }

    static formatValue(value) {

        if (value === null || value === undefined || value === "") {
            return "—";
        }

        return String(value);

    }

}
