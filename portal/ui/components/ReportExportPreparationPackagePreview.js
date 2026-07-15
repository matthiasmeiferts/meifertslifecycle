import StatusBadge from "./StatusBadge.js";

export default class ReportExportPreparationPackagePreview {

    static create(preparationPackage = null) {

        const status = preparationPackage?.status || "unknown";
        const isRequired = status === "report_export_preparation_required";

        const preview = document.createElement("section");
        preview.className = isRequired
            ? "report-export-preparation-package-preview is-required"
            : "report-export-preparation-package-preview is-blocked";

        preview.dataset.reportExportPreparationPackageCard = "";

        const header = document.createElement("div");
        header.className = "report-export-preparation-package-preview__header";

        const headingGroup = document.createElement("div");

        const kicker = document.createElement("p");
        kicker.className = "section-kicker";
        kicker.textContent = "Foundation 3.1-C Controlled Report Export Preparation Package Browser Preview";

        const title = document.createElement("h3");
        title.textContent = "Report Export Preparation Package";

        const description = document.createElement("p");
        description.textContent = "Controlled metadata-only preparation layer after the Export Authorization Gate. No export file, PDF, client document or workflow finalization is created.";

        headingGroup.appendChild(kicker);
        headingGroup.appendChild(title);
        headingGroup.appendChild(description);

        const statusBadge = StatusBadge.create(status);

        header.appendChild(headingGroup);
        header.appendChild(statusBadge);
        preview.appendChild(header);

        const metadata = document.createElement("dl");
        metadata.className = "report-export-preparation-package-preview__meta";

        metadata.appendChild(
            this.createMetadataRow(
                "Package ID",
                preparationPackage?.packageId
            )
        );

        metadata.appendChild(
            this.createMetadataRow(
                "Package Type",
                preparationPackage?.packageType || "not available"
            )
        );

        metadata.appendChild(
            this.createMetadataRow(
                "Source Export Authorization Gate",
                preparationPackage?.sourceExportAuthorizationGateId || "not available"
            )
        );

        metadata.appendChild(
            this.createMetadataRow(
                "Export Package Prepared",
                preparationPackage?.safetyBoundary?.exportPackagePrepared
                    ? "Yes"
                    : "No"
            )
        );

        preview.appendChild(metadata);

        const safety = document.createElement("div");
        safety.className = "report-export-preparation-package-preview__safety";

        const safetyTitle = document.createElement("strong");
        safetyTitle.textContent = "Safety boundary";

        const safetyText = document.createElement("span");
        safetyText.textContent = "Preparation package metadata only. Export, client document creation and workflow finalization remain locked.";

        safety.appendChild(safetyTitle);
        safety.appendChild(safetyText);
        preview.appendChild(safety);

        const locks = document.createElement("ul");
        locks.className = "report-export-preparation-package-preview__locks";

        [
            [
                "Can export",
                preparationPackage?.permissions?.canExport
            ],
            [
                "Can create client document",
                preparationPackage?.permissions?.canCreateClientDocument
            ],
            [
                "Can finalize workflow",
                preparationPackage?.permissions?.canFinalizeWorkflow
            ],
            [
                "Export file created",
                preparationPackage?.safetyBoundary?.exportFileCreated
            ],
            [
                "Report exported",
                preparationPackage?.safetyBoundary?.reportExported
            ]
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
