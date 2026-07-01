import WorkspaceController from "../../controllers/WorkspaceController.js";
import MetricCard from "../components/MetricCard.js";
import WorkflowCard from "../components/WorkflowCard.js";

export default class DashboardPage {

    static workflowStages = [
        {
            key: "evidence",
            label: "Evidence",
            description: "Captured inspection evidence"
        },
        {
            key: "finding",
            label: "Finding",
            description: "Technical findings identified"
        },
        {
            key: "assessment",
            label: "Assessment",
            description: "Risk assessments completed"
        },
        {
            key: "recommendation",
            label: "Recommendation",
            description: "Actions recommended"
        },
        {
            key: "decision",
            label: "Decision",
            description: "Governance decisions confirmed"
        },
        {
            key: "report",
            label: "Report",
            description: "Final output prepared"
        }
    ];

    static render() {
        const fragment = document.createDocumentFragment();

        const hero = this.createHero();
        const metrics = this.createMetrics();
        const readinessOverview = this.createWorkflowReadinessOverview();
        const readinessCards = this.createWorkspaceReadinessCards();
        const workflow = WorkflowCard.create(
            WorkspaceController.getWorkflowState()
        );

        fragment.appendChild(hero);
        fragment.appendChild(metrics);
        fragment.appendChild(readinessOverview);
        fragment.appendChild(readinessCards);
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

    static getWorkflowReadiness(data = {}) {
        const evidence = data.evidence || data.evidences || [];
        const findings = data.findings || [];
        const assessments = data.assessments || [];
        const recommendations = data.recommendations || [];
        const decisions = data.decisions || [];
        const reports = data.reports || [];

        const counts = {
            evidence: Array.isArray(evidence) ? evidence.length : 0,
            finding: Array.isArray(findings) ? findings.length : 0,
            assessment: Array.isArray(assessments) ? assessments.length : 0,
            recommendation: Array.isArray(recommendations) ? recommendations.length : 0,
            decision: Array.isArray(decisions) ? decisions.length : 0,
            report: Array.isArray(reports) ? reports.length : 0
        };

        const completedStages = this.workflowStages.filter((stage) => counts[stage.key] > 0).length;
        const totalStages = this.workflowStages.length;
        const ratio = totalStages > 0 ? completedStages / totalStages : 0;

        return {
            counts,
            completedStages,
            totalStages,
            ratio,
            percent: Math.round(ratio * 100),
            isComplete: completedStages === totalStages
        };
    }

    static renderWorkflowReadinessOverview(data = {}) {
        const readiness = this.getWorkflowReadiness(data);

        return `
            <section class="completion-panel" aria-label="Workflow readiness overview">
                <div class="completion-panel__header">
                    <div>
                        <span class="completion-panel__eyebrow">Workflow Readiness</span>
                        <strong>${readiness.isComplete ? "Workflow Complete" : "Workflow In Progress"}</strong>
                    </div>
                    <span class="completion-panel__score">${readiness.percent}%</span>
                </div>

                <div class="completion-panel__bar" aria-hidden="true">
                    <div class="completion-panel__bar-fill" style="width: ${readiness.percent}%"></div>
                </div>

                <div class="completion-panel__checks">
                    ${this.workflowStages.map((stage) => {
                        const count = readiness.counts[stage.key] || 0;
                        const isComplete = count > 0;

                        return `
                            <div class="completion-panel__check ${isComplete ? "is-complete" : "is-open"}">
                                <span class="completion-panel__check-marker"></span>
                                <span>${stage.label}: ${count}</span>
                            </div>
                        `;
                    }).join("")}
                </div>
            </section>
        `;
    }

    static createWorkflowReadinessOverview(data = {}) {
        const container = document.createElement("section");
        container.className = "workflow-card";
        container.innerHTML = this.renderWorkflowReadinessOverview(data);
        return container;
    }

    static getWorkspaceReadinessCards(data = {}) {
        const readiness = this.getWorkflowReadiness
            ? this.getWorkflowReadiness(data)
            : {
                counts: {},
                completedStages: 0,
                totalStages: 6,
                percent: 0
            };

        return this.workflowStages.map((stage) => {
            const count = readiness.counts[stage.key] || 0;
            const isActive = count > 0;

            return {
                key: stage.key,
                label: stage.label,
                description: stage.description,
                count,
                status: isActive ? "active" : "open",
                actionLabel: isActive ? "Review workspace" : "Start workspace"
            };
        });
    }

    static renderWorkspaceReadinessCards(data = {}) {
        const cards = this.getWorkspaceReadinessCards(data);

        return `
            <section class="dashboard-readiness-cards" aria-label="Workspace readiness cards">
                ${cards.map((card) => `
                    <article class="dashboard-readiness-card dashboard-readiness-card--${card.status}">
                        <div>
                            <span class="dashboard-readiness-card__eyebrow">${card.status === "active" ? "Active" : "Open"}</span>
                            <strong>${card.label}</strong>
                            <p>${card.description}</p>
                        </div>

                        <div class="dashboard-readiness-card__footer">
                            <span class="dashboard-readiness-card__count">${card.count}</span>
                            <span class="dashboard-readiness-card__action">${card.actionLabel}</span>
                        </div>
                    </article>
                `).join("")}
            </section>
        `;
    }

    static createWorkspaceReadinessCards(data = {}) {
        const container = document.createElement("section");
        container.className = "dashboard-cards-wrapper";
        container.innerHTML = this.renderWorkspaceReadinessCards(data);
        return container;
    }