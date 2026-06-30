export default class SectionHeader {

    static create({
        eyebrow = "Workspace",
        title = "Section",
        description = "",
        actions = []
    } = {}) {
        const header = document.createElement("section");
        header.className = "hero-card section-header";

        const actionMarkup = actions.map(action => `
            <button class="button" type="button" data-action="${action.id}">
                ${action.label}
            </button>
        `).join("");

        header.innerHTML = `
            <div>
                <p class="eyebrow">${eyebrow}</p>
                <h2>${title}</h2>
                ${description ? `<p>${description}</p>` : ""}
            </div>

            ${actionMarkup ? `<div class="section-actions">${actionMarkup}</div>` : ""}
        `;

        actions.forEach(action => {
            const button = header.querySelector(`[data-action="${action.id}"]`);

            if (button && typeof action.onClick === "function") {
                button.addEventListener("click", action.onClick);
            }
        });

        return header;
    }

}