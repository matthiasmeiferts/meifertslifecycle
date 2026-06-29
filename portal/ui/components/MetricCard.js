export default class MetricCard {

    static create(title, value) {

        const card = document.createElement("article");
        card.className = "metric-card";

        card.innerHTML = `
            <span>${title}</span>
            <strong>${value}</strong>
        `;

        return card;
    }

}