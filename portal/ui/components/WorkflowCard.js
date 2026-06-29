export default class WorkflowCard {

    static create(steps = [], currentStep = 0) {

        const card = document.createElement("section");
        card.className = "workflow-card";

        const title = document.createElement("div");
        title.className = "section-header";
        title.innerHTML = `
            <div>
                <p class="eyebrow">Decision Workflow</p>
                <h2>Evidence → Report</h2>
            </div>
        `;

        const container = document.createElement("div");
        container.className = "workflow-steps";

        steps.forEach((step, index) => {

            const item = document.createElement("div");

            if (index < currentStep) {
                item.classList.add("completed");
                item.innerHTML = `✓ ${step}`;
            } else if (index === currentStep) {
                item.classList.add("active");
                item.innerHTML = `● ${step}`;
            } else {
                item.innerHTML = `○ ${step}`;
            }

            container.appendChild(item);

        });

        card.appendChild(title);
        card.appendChild(container);

        return card;

    }

}