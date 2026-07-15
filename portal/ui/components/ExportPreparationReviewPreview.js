import StatusBadge from "./StatusBadge.js";

export default class ExportPreparationReviewPreview {

    static create(review = null, {
        onAddNote = null,
        onApprove = null,
        onReject = null
    } = {}) {

        const status = review?.status || "unknown";
        const notes = Array.isArray(review?.notes) ? review.notes : [];
        const hasNote = notes.length > 0;
        const decisionLocked = !hasNote || status !== "review_required";

        const preview = document.createElement("section");
        preview.className = [
            "export-preparation-review-preview",
            status === "review_required" ? "is-required" : "",
            status === "approved" ? "is-approved" : "",
            status === "rejected" ? "is-rejected" : ""
        ].filter(Boolean).join(" ");

        preview.dataset.exportPreparationReviewCard = "";

        const header = document.createElement("div");
        header.className = "export-preparation-review-preview__header";

        const headingGroup = document.createElement("div");

        const kicker = document.createElement("p");
        kicker.className = "section-kicker";
        kicker.textContent = "Foundation 2.9-C Export Preparation Review Browser Preview";

        const title = document.createElement("h3");
        title.textContent = "Export Preparation Review";

        const description = document.createElement("p");
        description.textContent = "Internal review step after the Export Preparation Gate. No export file is created.";

        headingGroup.appendChild(kicker);
        headingGroup.appendChild(title);
        headingGroup.appendChild(description);

        header.appendChild(headingGroup);
        header.appendChild(StatusBadge.create(status));
        preview.appendChild(header);

        const metadata = document.createElement("dl");
        metadata.className = "export-preparation-review-preview__meta";

        metadata.appendChild(
            this.createMetadataRow("Review ID", review?.reviewId)
        );

        metadata.appendChild(
            this.createMetadataRow(
                "Source Export Gate",
                review?.sourceExportPreparationGateId || "not available"
            )
        );

        metadata.appendChild(
            this.createMetadataRow("Notes", notes.length)
        );

        metadata.appendChild(
            this.createMetadataRow(
                "Review Completed",
                review?.readiness?.exportPreparationReviewCompleted
                    ? "Yes"
                    : "No"
            )
        );

        preview.appendChild(metadata);
        preview.appendChild(this.createNotePreview(review, notes));
        preview.appendChild(this.createSafetyBoundary());
        preview.appendChild(this.createLocks(review));

        const actions = document.createElement("div");
        actions.className = "export-preparation-review-preview__actions";

        const addNoteButton = this.createButton({
            label: hasNote
                ? "Export preparation note added"
                : "Add export preparation review note",
            dataKey: "addExportPreparationReviewNote",
            disabled: hasNote || status !== "review_required",
            onClick: onAddNote
        });

        const approveButton = this.createButton({
            label: decisionLocked
                ? "Approval locked"
                : "Approve export preparation review",
            dataKey: "approveExportPreparationReview",
            disabled: decisionLocked,
            title: !hasNote
                ? "Export preparation review note required first."
                : "",
            onClick: onApprove
        });

        const rejectButton = this.createButton({
            label: decisionLocked
                ? "Reject locked"
                : "Reject export preparation review",
            dataKey: "rejectExportPreparationReview",
            disabled: decisionLocked,
            title: !hasNote
                ? "Export preparation review note required first."
                : "",
            onClick: onReject
        });

        actions.appendChild(addNoteButton);
        actions.appendChild(approveButton);
        actions.appendChild(rejectButton);
        preview.appendChild(actions);

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

    static createNotePreview(review = null, notes = []) {

        const container = document.createElement("div");
        container.className = "export-preparation-review-preview__note";

        if (!notes.length) {
            const empty = document.createElement("p");
            empty.textContent = "No export preparation review note added yet.";
            container.appendChild(empty);
        } else {
            const lastNote = notes[notes.length - 1];

            const category = document.createElement("small");
            category.textContent = this.formatValue(lastNote.category);

            const text = document.createElement("p");
            text.textContent = this.formatValue(lastNote.text);

            container.appendChild(category);
            container.appendChild(text);
        }

        if (review?.decision) {
            const decision = document.createElement("div");
            decision.className = "export-preparation-review-preview__decision";

            const label = document.createElement("small");
            label.textContent = "Decision";

            const comment = document.createElement("p");
            comment.textContent = this.formatValue(review.decision.comment);

            decision.appendChild(label);
            decision.appendChild(comment);
            container.appendChild(decision);
        }

        return container;

    }

    static createSafetyBoundary() {

        const safety = document.createElement("div");
        safety.className = "export-preparation-review-preview__safety";

        const title = document.createElement("strong");
        title.textContent = "Safety boundary";

        const text = document.createElement("span");
        text.textContent = "Export preparation review only. Export, client document creation and workflow finalization remain locked.";

        safety.appendChild(title);
        safety.appendChild(text);

        return safety;

    }

    static createLocks(review = null) {

        const locks = document.createElement("ul");
        locks.className = "export-preparation-review-preview__locks";

        [
            ["Can export", review?.permissions?.canExport],
            ["Can create client document", review?.permissions?.canCreateClientDocument],
            ["Can finalize workflow", review?.permissions?.canFinalizeWorkflow],
            ["Export file created", review?.safetyBoundary?.exportFileCreated]
        ].forEach(([label, value]) => {
            const item = document.createElement("li");
            item.textContent = `${label}: ${value === true ? "true" : "false"}`;
            locks.appendChild(item);
        });

        return locks;

    }

    static createButton({
        label,
        dataKey,
        disabled = false,
        title = "",
        onClick = null
    }) {

        const button = document.createElement("button");
        button.type = "button";
        button.className = "button secondary";
        button.textContent = label;
        button.disabled = disabled;
        button.title = title;
        button.dataset[dataKey] = "";

        if (!disabled && typeof onClick === "function") {
            button.addEventListener("click", onClick);
        }

        return button;

    }

    static formatValue(value) {

        if (value === null || value === undefined || value === "") {
            return "—";
        }

        return String(value);

    }

}
