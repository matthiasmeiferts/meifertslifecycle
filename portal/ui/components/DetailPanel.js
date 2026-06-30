export default class DetailPanel {

    static create(title = "No Case Selected", fields = []) {

        const panel = document.createElement("section");
        panel.className = "detail-panel";

        panel.innerHTML = `
            <p class="eyebrow">Case Details</p>
            <h2>${title}</h2>
        `;

        fields.forEach(field => {

            const row = document.createElement("div");
            row.className = "detail-row";

            row.innerHTML = `
                <span>${field.label}</span>
                <strong>${field.value ?? "—"}</strong>
            `;

            panel.appendChild(row);

        });

        return panel;

    }

}