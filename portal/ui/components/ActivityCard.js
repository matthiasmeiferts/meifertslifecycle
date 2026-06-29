export default class ActivityCard {

    static create(activity = {}) {

        const card = document.createElement("div");
        card.className = "activity-card";

        card.innerHTML = `
            <div class="activity-header">
                <strong>${activity.title || "Activity"}</strong>
                <span>${activity.time || ""}</span>
            </div>

            <div class="activity-body">
                ${activity.description || ""}
            </div>
        `;

        return card;

    }

}