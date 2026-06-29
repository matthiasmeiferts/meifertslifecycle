import WorkspaceController from "../../controllers/WorkspaceController.js";
import MetricCard from "../components/MetricCard.js";
import WorkflowCard from "../components/WorkflowCard.js";

export default class DashboardPage {

    static render() {
        const fragment = document.createDocumentFragment();

        const hero = this.createHero();
        const metrics = this.createMetrics();
        const workflow = WorkflowCard.create(
            WorkspaceController.getWorkflowState()
        );

        fragment.appendChild(hero);
        fragment.appendChild(metrics);
        fragment.appendChild(workflow);

        return fragment;
    }

    static createHero() {
        const summary = WorkspaceController.getActiveCaseSummary();

        const hero = document.createElement("section");
        hero.className = "hero-card";

        hero.innerHTML = `
            <p class="eyebrow">Active Case</p>
            <h2>${summary.title}</h2>
            <p>${summary.subtitle}</p>
        `;

        return hero;
    }

    static createMetrics() {
        const grid = document.createElement("section");
        grid.className = "metrics-grid";

        WorkspaceController.getMetrics().forEach(metric => {
            grid.appendChild(
                MetricCard.create(metric.title, metric.value)
            );
        });

        return grid;
    }

}