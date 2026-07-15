import StatusBadge from "./StatusBadge.js";

export default class ExpertReviewPreview {

    static create(review = null, {
        onAddNote = null,
        onApprove = null,
        onReject = null
    } = {}) {

        const status = review?.status || "unknown";
        const notes = Array.isArray(review?.notes) ? review.notes : [];
        const hasNote = notes.length > 0;
        const isReviewRequired = status === "review_required";
        const decisionLocked = !hasNote || !isReviewRequired;

        const preview = document.createElement("section");
        preview.className = [
            "expert-review-preview",
            status === "approved" ? "is-approved" : "",
            status === "rejected" ? "is-rejected" : "",
            isReviewRequired ? "is-review-required" : "",
            isReviewRequired && !hasNote ? "is-note-required" : ""
        ].filter(Boolean).join(" ");

        preview.dataset.expertReviewPreview = "";

        const header = document.createElement("div");
        header.className = "expert-review-preview__header";

        const headingGroup = document.createElement("div");

        const kicker = document.createElement("p");
        kicker.className = "section-kicker";
        kicker.textContent = "Controlled Expert Review";

        const title = document.createElement("h3");
        title.textContent = "Expert Review";

        const description = document.createElement("p");
        description.textContent = "Expert review of the prepared workspace draft. Export and workflow finalization remain locked.";

        headingGroup.appendChild(kicker);
        headingGroup.appendChild(title);
        headingGroup.appendChild(description);

        header.appendChild(headingGroup);
        header.appendChild(StatusBadge.create(status));
        preview.appendChild(header);

        const metadata = document.createElement("dl");
        metadata.className = "expert-review-preview__summary";

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
        actions.className = "expert-review-preview__actions";

        actions.appendChild(
            this.createButton({
                label: hasNote ? "Review note added" : "Add review note",
                dataKey: "addReviewNote",
                disabled: hasNote || !isReviewRequired,
                title: !isReviewRequired
                    ? "Expert review decision already recorded."
                    : "",
                onClick: onAddNote
            })
        );

        actions.appendChild(
            this.createButton({
                label: decisionLocked ? "Approval locked" : "Approve review",
                dataKey: "approveReview",
                disabled: decisionLocked,
                title: !hasNote
                    ? "Expert review note required first."
                    : !isReviewRequired
                        ? "Expert review decision already recorded."
                        : "",
                onClick: onApprove
            })
        );

        actions.appendChild(
            this.createButton({
                label: decisionLocked ? "Reject locked" : "Reject review",
                dataKey: "rejectReview",
                disabled: decisionLocked,
                title: !hasNote
                    ? "Expert review note required first."
                    : !isReviewRequired
                        ? "Expert review decision already recorded."
                        : "",
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
        container.className = "expert-review-preview__note";

        if (!notes.length) {
            const empty = document.createElement("p");
            empty.textContent = "No review note added yet.";
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
            decision.className = "expert-review-preview__decision";

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
        safety.className = "expert-review-preview__safety";
        safety.textContent = [
            `canExport: ${String(review?.permissions?.canExport === true)}`,
            `canCreateClientDocument: ${String(review?.permissions?.canCreateClientDocument === true)}`,
            `canFinalizeWorkflow: ${String(review?.permissions?.canFinalizeWorkflow === true)}`,
            `expertApprovalGranted: ${String(review?.safetyBoundary?.expertApprovalGranted === true)}`
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
