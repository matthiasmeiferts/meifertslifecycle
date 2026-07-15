import StatusBadge from "./StatusBadge.js";

export default class ReportExportAssemblyPreview {

    static create(assemblyPreview = null) {

        const isPrepared = assemblyPreview?.assemblyPrepared === true;
        const sections = Array.isArray(assemblyPreview?.assemblySections)
            ? assemblyPreview.assemblySections
            : [];

        const preview = document.createElement("section");
        preview.className = isPrepared
            ? "hero-card report-export-assembly-preview report-export-assembly-preview--prepared"
            : "hero-card report-export-assembly-preview report-export-assembly-preview--blocked";

        const header = document.createElement("div");
        header.className = "report-export-assembly-preview__header";

        const headingGroup = document.createElement("div");

        const eyebrow = document.createElement("p");
        eyebrow.className = "eyebrow";
        eyebrow.textContent = "Report Export Assembly";

        const title = document.createElement("h2");
        title.textContent = "Assembly Preview";

        headingGroup.appendChild(eyebrow);
        headingGroup.appendChild(title);

        const statusBadge = StatusBadge.create(
            isPrepared
                ? "Assembly preview prepared"
                : "Assembly preview blocked",
            isPrepared ? "warning" : "critical"
        );

        header.appendChild(headingGroup);
        header.appendChild(statusBadge);
        preview.appendChild(header);

        const description = document.createElement("p");
        description.textContent = isPrepared
            ? "The report sections are prepared for assembly review. Direct export remains disabled."
            : "A valid report export preparation package is required before an assembly preview can be prepared.";

        preview.appendChild(description);

        const metadata = document.createElement("div");
        metadata.className = "report-export-assembly-preview__metadata";

        [
            {
                label: "Assembly ID",
                value: assemblyPreview?.assemblyId
            },
            {
                label: "Source package ID",
                value: assemblyPreview?.sourcePackageId
            },
            {
                label: "Source draft ID",
                value: assemblyPreview?.sourceDraftId
            },
            {
                label: "Status",
                value: assemblyPreview?.status
            }
        ].forEach(field => {
            metadata.appendChild(this.createDetailRow(field.label, field.value));
        });

        preview.appendChild(metadata);

        const sectionsHeading = document.createElement("h3");
        sectionsHeading.textContent = "Assembly sections";
        preview.appendChild(sectionsHeading);

        if (sections.length) {
            const sectionList = document.createElement("div");
            sectionList.className = "report-export-assembly-preview__sections";

            sections.forEach(section => {
                sectionList.appendChild(this.createAssemblySection(section));
            });

            preview.appendChild(sectionList);
        } else {
            const emptyMessage = document.createElement("p");
            emptyMessage.className = "report-export-assembly-preview__empty";
            emptyMessage.textContent = "No assembly sections are available.";
            preview.appendChild(emptyMessage);
        }

        const boundary = document.createElement("div");
        boundary.className = "report-export-assembly-preview__boundary";

        const boundaryTitle = document.createElement("strong");
        boundaryTitle.textContent = "Export safety boundary";

        const boundaryText = document.createElement("p");
        boundaryText.textContent = this.createBoundaryText(assemblyPreview);

        boundary.appendChild(boundaryTitle);
        boundary.appendChild(boundaryText);
        preview.appendChild(boundary);

        return preview;

    }

    static createDetailRow(label, value) {

        const row = document.createElement("div");
        row.className = "detail-row";

        const rowLabel = document.createElement("span");
        rowLabel.textContent = label;

        const rowValue = document.createElement("strong");
        rowValue.textContent = this.formatValue(value);

        row.appendChild(rowLabel);
        row.appendChild(rowValue);

        return row;

    }

    static createAssemblySection(section = {}) {

        const item = document.createElement("article");
        item.className = "report-export-assembly-preview__section";

        const label = document.createElement("strong");
        label.textContent = section.label || "Untitled section";

        const status = document.createElement("span");
        status.textContent = this.formatValue(section.status);

        const source = document.createElement("small");
        source.textContent = `Source draft: ${this.formatValue(section.sourceDraftId)}`;

        item.appendChild(label);
        item.appendChild(status);
        item.appendChild(source);

        return item;

    }

    static createBoundaryText(assemblyPreview = null) {

        const canExport = assemblyPreview?.permissions?.canExport === true;
        const canCreateClientDocument =
            assemblyPreview?.permissions?.canCreateClientDocument === true;
        const canFinalizeWorkflow =
            assemblyPreview?.permissions?.canFinalizeWorkflow === true;

        if (canExport || canCreateClientDocument || canFinalizeWorkflow) {
            return "The supplied preview contains permissions outside the assembly-preview safety boundary.";
        }

        return "Export, client-document creation and workflow finalization are disabled.";

    }

    static formatValue(value) {

        if (value === null || value === undefined || value === "") {
            return "—";
        }

        return String(value);

    }

}
