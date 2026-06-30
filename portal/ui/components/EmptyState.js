export default class EmptyState {

    static create({
        eyebrow = "Empty State",
        title = "No records yet",
        description = "Create your first record to begin.",
        actionLabel = null,
        onAction = null
    } = {}) {
        const section = document.createElement("section");
        section.className = "hero-card empty-state";

        section.innerHTML = `
            <p class="eyebrow">${eyebrow}</p>
            <h2>${title}</h2>
            <p>${description}</p>
            ${actionLabel ? `<button class="button" type="button">${actionLabel}</button>` : ""}
        `;

        const button = section.querySelector("button");

        if (button && typeof onAction === "function") {
            button.addEventListener("click", onAction);
        }

        return section;
    }

}