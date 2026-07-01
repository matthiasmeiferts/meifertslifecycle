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
        const bottleneckIndicator = this.createWorkflowBottleneckIndicator();
        const qualitySummary = this.createWorkflowQualitySummary();
        const workflow = WorkflowCard.create(
            WorkspaceController.getWorkflowState()
        );

        fragment.appendChild(hero);
        fragment.appendChild(metrics);
        fragment.appendChild(readinessOverview);
        fragment.appendChild(readinessCards);
        fragment.appendChild(bottleneckIndicator);
        fragment.appendChild(qualitySummary);
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

    static getWorkflowBottleneck(data = {}) {
        const readiness = this.getWorkflowReadiness
            ? this.getWorkflowReadiness(data)
            : {
                counts: {},
                percent: 0,
                isComplete: false
            };

        if (readiness.isComplete) {
            return {
                key: "complete",
                label: "Workflow Complete",
                description: "All workflow stages contain data. Review final output quality and completeness.",
                tone: "ready"
            };
        }

        const firstOpenStage = this.workflowStages.find((stage) => {
            const count = readiness.counts[stage.key] || 0;
            return count === 0;
        });

        if (!firstOpenStage) {
            return {
                key: "review",
                label: "Review workflow",
                description: "Workflow data is present. Review stage quality before moving forward.",
                tone: "linked"
            };
        }

        return {
            key: firstOpenStage.key,
            label: `Next attention: ${firstOpenStage.label}`,
            description: `${firstOpenStage.description} is still missing or not yet represented in the workflow.`,
            tone: "active"
        };
    }

    static renderWorkflowBottleneckIndicator(data = {}) {
        const bottleneck = this.getWorkflowBottleneck(data);

        return `
            <section class="next-action next-action--${bottleneck.tone}" aria-label="Workflow bottleneck">
                <div>
                    <span class="next-action__eyebrow">Workflow Bottleneck</span>
                    <strong>${bottleneck.label}</strong>
                    <p>${bottleneck.description}</p>
                </div>
            </section>
        `;
    }

    static createWorkflowBottleneckIndicator(data = {}) {
        const container = document.createElement("section");
        container.innerHTML = this.renderWorkflowBottleneckIndicator(data);
        return container;
    }

    static getWorkflowQualitySummary(data = {}) {
        const readiness = this.getWorkflowReadiness
            ? this.getWorkflowReadiness(data)
            : {
                completedStages: 0,
                totalStages: 6,
                percent: 0
            };

        if (readiness.percent >= 100) {
            return {
                label: "Complete workflow coverage",
                description: "All workflow stages are represented. Focus on review quality, consistency and final report confidence.",
                score: "High",
                tone: "ready"
            };
        }

        if (readiness.percent >= 67) {
            return {
                label: "Strong workflow progress",
                description: "Most workflow stages are represented. Remaining gaps should be closed before final decision or report output.",
                score: "Medium High",
                tone: "linked"
            };
        }

        if (readiness.percent >= 34) {
            return {
                label: "Partial workflow coverage",
                description: "The workflow is active but still incomplete. Continue linking evidence, findings and downstream decisions.",
                score: "Medium",
                tone: "active"
            };
        }

        return {
            label: "Early workflow stage",
            description: "Only the first workflow stages are represented. Start with evidence capture and finding creation.",
            score: "Low",
            tone: "draft"
        };
    }

    static renderWorkflowQualitySummary(data = {}) {
        const summary = this.getWorkflowQualitySummary(data);

        return `
            <section class="next-action next-action--${summary.tone}" aria-label="Workflow quality summary">
                <div>
                    <span class="next-action__eyebrow">Workflow Quality</span>
                    <strong>${summary.label}</strong>
                    <p>${summary.description}</p>
                </div>
                <span class="evidence-status evidence-status--${summary.tone}">
                    ${summary.score}
                </span>
            </section>
        `;
    }

    static createWorkflowQualitySummary(data = {}) {
        const container = document.createElement("section");
        container.innerHTML = this.renderWorkflowQualitySummary(data);
        return container;
    }