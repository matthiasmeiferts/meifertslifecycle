import StatusBadge from "./StatusBadge.js";

export default class InternalFinalizationReviewPreview {

    static create(review = null, {
        onAddNote = null,
        onApprove = null,
        onReject = null
    } = {}) {

        const status = review?.status || "unknown";
        const notes = Array.isArray(review?.notes) ? review.notes : [];
        const hasNote = notes.length > 0;
        const isReady = status === "internal_review_required";

        const preview = document.createElement("section");
        preview.className = [
            "internal-finalization-review-preview",
            status === "internal_review_required" ? "is-required" : "",
            status === "internally_approved" ? "is-approved" : "",
            status === "internally_rejected" ? "is-rejected" : "",
            status === "blocked_pending_finalization_gate" ? "is-blocked" : ""
        ].filter(Boolean).join(" ");

        preview.dataset.internalFinalizationReviewPreview = "";

        const header = document.createElement("div");
        header.className = "internal-finalization-review-preview__header";

        const headingGroup = document.createElement("div");

        const kicker = document.createElement("p");
        kicker.className = "section-kicker";
        kicker.textContent = "Internal Finalization Review";

        const title = document.createElement("h3");
        title.textContent = "Internal Finalization Review";

        const description = document.createElement("p");
        description.textContent = "Controlled internal review before export preparation. Export and workflow finalization remain locked.";

        headingGroup.appendChild(kicker);
        headingGroup.appendChild(title);
        headingGroup.appendChild(description);

        header.appendChild(headingGroup);
        header.appendChild(StatusBadge.create(status));
        preview.appendChild(header);

        const metadata = document.createElement("dl");
        metadata.className = "internal-finalization-review-preview__summary";

        metadata.appendChild(
            this.createMetadataRow("Review ID", review?.reviewId)
        );

        metadata.appendChild(
            this.createMetadataRow("Status", status)
        );

        metadata.appendChild(
            this.createMetadataRow("Notes", notes.length)
        );

        preview.appendChild(metadata);
        preview.appendChild(this.createNotePreview(review, notes));
        preview.appendChild(this.createSafetyBoundary(review));

        const actions = document.createElement("div");
        actions.className = "internal-finalization-review-preview__actions";

        const blockedTitle = "Expert Review approval required first.";
        const noteRequiredTitle = "Internal finalization note required first.";

        actions.appendChild(
            this.createButton({
                label: !isReady
                    ? "Internal note locked"
                    : hasNote
                        ? "Internal note added"
                        : "Add internal note",
                dataKey: "addInternalReviewNote",
                disabled: !isReady || hasNote,
                title: !isReady ? blockedTitle : "",
                onClick: onAddNote
            })
        );

        actions.appendChild(
            this.createButton({
                label: !isReady ? "Approval locked" : "Approve internal review",
                dataKey: "approveInternalReview",
                disabled: !isReady || !hasNote,
                title: !isReady
                    ? blockedTitle
                    : hasNote
                        ? ""
                        : noteRequiredTitle,
                onClick: onApprove
            })
        );

        actions.appendChild(
            this.createButton({
                label: !isReady ? "Reject locked" : "Reject internal review",
                dataKey: "rejectInternalReview",
                disabled: !isReady || !hasNote,
                title: !isReady
                    ? blockedTitle
                    : hasNote
                        ? ""
                        : noteRequiredTitle,
                onClick: onReject
            })
        );

        preview.appendChild(actions);

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

    static createNotePreview(review = null, notes = []) {

        const container = document.createElement("div");
        container.className = "internal-finalization-review-preview__note";

        if (!notes.length) {
            const empty = document.createElement("p");
            empty.textContent = review?.status === "blocked_pending_finalization_gate"
                ? "Expert Review approval required first."
                : "No internal finalization note added yet.";

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
            decision.className = "internal-finalization-review-preview__decision";

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

    static createSafetyBoundary(review = null) {

        const safety = document.createElement("small");
        safety.className = "internal-finalization-review-preview__safety";
        safety.textContent = [
            `canExport: ${String(review?.permissions?.canExport === true)}`,
            `canCreateClientDocument: ${String(review?.permissions?.canCreateClientDocument === true)}`,
            `canFinalizeWorkflow: ${String(review?.permissions?.canFinalizeWorkflow === true)}`
        ].join(" · ");

        return safety;

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
