export default class StatusBadge {

    static create(text = "", type = "default") {

        const badge = document.createElement("span");

        badge.className = `status-badge ${type}`;

        badge.textContent = text;

        return badge;

    }

}