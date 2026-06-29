import WorkspaceController from "../../controllers/WorkspaceController.js";
import MetricCard from "../components/MetricCard.js";
import WorkflowCard from "../components/WorkflowCard.js";
import StatusBadge from "../components/StatusBadge.js";
import ProgressBar from "../components/ProgressBar.js";

export default class CasePage {

    static render() {
        const fragment = document.createDocumentFragment();

        fragment.appendChild(this.createHero());
        fragment.appendChild(this.createCaseMetrics());
        fragment.appendChild(WorkflowCard.create(WorkspaceController.getWorkflowState()));
        fragment.appendChild(this.createNextAction());

        return fragment;
    }

    static createHero() {
        const summary = WorkspaceController.getActiveCaseSummary();
        const workflow = WorkspaceController.getWorkflowState();

        const hero = document.createElement("section");
        hero.className = "hero-card";

        const badge = StatusBadge.create("Foundation Case", "warning");
        const progress = ProgressBar.create(workflow.progress);

        hero.innerHTML = `
            <p class="eyebrow">Case Workspace</p>
            <h2>${summary.title}</h2>
            <p>${summary.subtitle}</p>
            <div class="case-progress-label">
                <span>Case Progress</span>
                <strong>${workflow.progress}%</strong>
            </div>
        `;

        hero.appendChild(progress);
        hero.appendChild(badge);

        return hero;
    }

    static createCaseMetrics() {
        const workflow = WorkspaceController.getWorkflowState();
        const metrics = [
            ["Workflow Steps", workflow.steps.length],
            ["Completed", workflow.steps.filter(step => step.complete).length],
            ["Open Steps", workflow.steps.filter(step => !step.complete).length],
            ["Progress", `${workflow.progress}%`]
        ];

        const grid = document.createElement("section");
        grid.className = "metrics-grid";

        metrics.forEach(([title, value]) => {
            grid.appendChild(MetricCard.create(title, value));
        });

        return grid;
    }

    static createNextAction() {
        const workflow = WorkspaceController.getWorkflowState();
        const nextStep = workflow.steps.find(step => !step.complete);

        const card = document.createElement("section");
        card.className = "workflow-card";

        card.innerHTML = `
            <div class="section-header">
                <div>
                    <p class="eyebrow">Next Recommended Action</p>
                    <h2>${nextStep ? nextStep.title : "Report Ready"}</h2>
                </div>
            </div>
            <p class="next-action-text">
                ${
                    nextStep
                        ? `Continue with ${nextStep.title} to move the case forward.`
                        : "All workflow steps are complete. The case is ready for report finalization."
                }
            </p>
        `;

        return card;
    }

}