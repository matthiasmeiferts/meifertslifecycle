export default class DetailPanel {

    static create(title = "No Case Selected", fields = []) {

        const panel = document.createElement("section");
        panel.className = "detail-panel";

        const eyebrow = document.createElement("p");
        eyebrow.className = "eyebrow";
        eyebrow.textContent = "Context Details";

        const headline = document.createElement("h2");
        headline.textContent = title;

        panel.appendChild(eyebrow);
        panel.appendChild(headline);

        fields.forEach(field => {
            const row = document.createElement("div");
            row.className = this.getRowClass(field);

            const label = document.createElement("span");
            label.textContent = field.label || "Field";

            const value = document.createElement("strong");

            if (field.value instanceof Node) {
                value.appendChild(field.value);
            } else {
                value.textContent = this.formatValue(field.value);
            }

            row.appendChild(label);
            row.appendChild(value);
            panel.appendChild(row);
        });

        return panel;
    }

    static formatValue(value) {
        if (value === null || value === undefined || value === "") {
            return "—";
        }

        if (Array.isArray(value)) {
            return value.length ? value.join(", ") : "—";
        }

        return String(value);
    }

    static getRowClass(field = {}) {
        const label = String(field.label || "");
        const value = this.formatValue(field.value);
        const classes = ["detail-row"];

        if (
            label.includes("ID") ||
            label.includes("IDs") ||
            value.includes("EV-") ||
            value.includes("FIN-") ||
            value.includes("ASM-") ||
            value.includes("REC-") ||
            value.includes("DEC-") ||
            value.includes("REP-")
        ) {
            classes.push("detail-row--id");
        }

        if (
            value.length > 80 ||
            label.toLowerCase().includes("summary") ||
            label.toLowerCase().includes("description") ||
            label.toLowerCase().includes("selected")
        ) {
            classes.push("detail-row--long");
        }

        if (value === "—" || value === "None" || value === "Not linked") {
            classes.push("detail-row--empty");
        }

        return classes.join(" ");
    }

}
