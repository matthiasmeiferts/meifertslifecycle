export default class SidebarCard {

    static create(title, value, subtitle = "") {
        const item = document.createElement("div");
        item.className = "context-item";

        item.innerHTML = `
            <span>${title}</span>
            <strong>${value}</strong>
            ${subtitle ? `<small>${subtitle}</small>` : ""}
        `;

        return item;
    }

}