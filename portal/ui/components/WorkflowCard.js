import LanguageManager from "../../core/LanguageManager.js";
export default class WorkflowCard {

    static create(workflow = {}) {
        const card = document.createElement("section");
        card.className = "workflow-card";

        const steps = workflow.steps || [];
        const progress = workflow.progress ?? 0;
        const currentStep = workflow.currentStep ?? 0;

        card.innerHTML = `
            <div class="section-header">
                <div>
                    <p class="eyebrow">${LanguageManager.t("DashboardDecisionWorkflow")}</p>
                    <h2>${LanguageManager.t("DashboardEvidenceToReport")}</h2>
                </div>
                <span>${progress}%</span>
            </div>
            <div class="workflow-steps"></div>
        `;

        const container = card.querySelector(".workflow-steps");

        steps.forEach((step, index) => {
            const item = document.createElement("div");

            if (step.complete) {
                item.classList.add("completed");
                item.textContent = `✓ ${step.title}`;
            } else if (index === currentStep) {
                item.classList.add("active");
                item.textContent = `● ${step.title}`;
            } else {
                item.textContent = `○ ${step.title}`;
            }

            container.appendChild(item);
        });

        return card;
    }

}