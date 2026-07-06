import WorkspaceController from "../../controllers/WorkspaceController.js";
import MetricCard from "../components/MetricCard.js";
import WorkflowCard from "../components/WorkflowCard.js";
import IntelligenceEngine from "../../core/IntelligenceEngine.js";
import DemoDatasetManager from "../../core/DemoDatasetManager.js";
import ReportManager from "../../core/ReportManager.js";
import CaseManager from "../../core/CaseManager.js";
import InspectionManager from "../../core/InspectionManager.js";
import EvidenceManager from "../../core/EvidenceManager.js";
import FindingManager from "../../core/FindingManager.js";
import AssessmentManager from "../../core/AssessmentManager.js";
import RecommendationManager from "../../core/RecommendationManager.js";
import DecisionManager from "../../core/DecisionManager.js";

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
        const demoDatasetStatus = this.createDemoDatasetStatus();
        const metrics = this.createMetrics();
        const readinessOverview = this.createWorkflowReadinessOverview();
        const readinessCards = this.createWorkspaceReadinessCards();
        const bottleneckIndicator = this.createWorkflowBottleneckIndicator();
        const qualitySummary = this.createWorkflowQualitySummary();
        const platformIntelligence = this.createPlatformIntelligence();
        const workflow = WorkflowCard.create(
            WorkspaceController.getWorkflowState()
        );

        fragment.appendChild(hero);
    fragment.appendChild(demoDatasetStatus);
        fragment.appendChild(metrics);
        fragment.appendChild(readinessOverview);
        fragment.appendChild(readinessCards);
        fragment.appendChild(bottleneckIndicator);
        fragment.appendChild(qualitySummary);
        fragment.appendChild(platformIntelligence);
        fragment.appendChild(workflow);

        // Bind navigation events after appending to DOM
        setTimeout(() => {
            this.bindReadinessCardActions();
        }, 0);

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

    static createDemoDatasetStatus() {
        const status = DemoDatasetManager.getStatus();

        if (!status.isActive) {
            const banner = document.createElement("section");
            banner.className = "dashboard-demo-status dashboard-demo-status--active";
            banner.innerHTML = `
                <div>
                    <span>Controlled Demo Dataset</span>
                    <strong>Not loaded</strong>
                    <p>Load the controlled demo dataset to review the complete evidence-to-report workflow.</p>
                </div>
                <button type="button" class="dashboard-demo-status__action" data-demo-load>
                    Load Controlled Demo Dataset
                </button>
            `;

            const loadButton = banner.querySelector("[data-demo-load]");
            if (loadButton) {
                loadButton.addEventListener("click", () => {
                    DemoDatasetManager.rebuild();
                    ReportManager.set(ReportManager.load("DEMO-RPT-001"));
                    window.location.hash = "dashboard";
                    window.location.reload();
                });
            }

            return banner;
        }

        const tone = status.isComplete ? "ready" : "active";
        const label = status.isComplete ? "Complete" : "Incomplete";
        const integrityLabel = status.integrity?.isValid
            ? "Workflow links valid"
            : "Workflow links incomplete";

        const banner = document.createElement("section");
        banner.className = `dashboard-demo-status dashboard-demo-status--${tone}`;
        banner.innerHTML = `
            <div>
                <span>Controlled Demo Dataset</span>
                <strong>${label} · ${status.percent}%</strong>
                <p>${status.completeRecords} of ${status.totalRecords} demo records are available. ${integrityLabel}.</p>
            </div>
            <div class="dashboard-demo-status__actions">
                <button type="button" class="dashboard-demo-status__action" data-demo-load>
                    Reload Controlled Demo Dataset
                </button>
                <button type="button" class="dashboard-demo-status__action" data-demo-review>
                    Review Demo Report
                </button>
            </div>
        `;

        const loadButton = banner.querySelector("[data-demo-load]");
        if (loadButton) {
            loadButton.addEventListener("click", () => {
                DemoDatasetManager.rebuild();
                ReportManager.set(ReportManager.load("DEMO-RPT-001"));
                window.location.hash = "dashboard";
                window.location.reload();
            });
        }

        const reviewButton = banner.querySelector("[data-demo-review]");
        if (reviewButton) {
            reviewButton.addEventListener("click", () => {
                ReportManager.set(ReportManager.load("DEMO-RPT-001"));
                window.location.hash = "reports";
            });
        }

        return banner;
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

    static getLiveWorkflowData() {
        const currentCase = CaseManager.getCurrent();

        if (currentCase) {
            return {
                inspections: currentCase.inspectionId ? [InspectionManager.load(currentCase.inspectionId)].filter(Boolean) : [],
                evidence: EvidenceManager.getByCase(currentCase.id),
                findings: FindingManager.getByCase(currentCase.id),
                assessments: AssessmentManager.getByCase(currentCase.id),
                recommendations: RecommendationManager.getByCase(currentCase.id),
                decisions: DecisionManager.getByCase(currentCase.id),
                reports: ReportManager.getByCase(currentCase.id)
            };
        }

        return {
            inspections: InspectionManager.getAllInspections(),
            evidence: EvidenceManager.getAll(),
            findings: FindingManager.getAll(),
            assessments: AssessmentManager.getAll(),
            recommendations: RecommendationManager.getAll(),
            decisions: DecisionManager.getAll(),
            reports: ReportManager.getAll()
        };
    }

    static getWorkflowReadiness(data = {}) {
        const workflowData = Object.keys(data).length ? data : this.getLiveWorkflowData();
        const counts = IntelligenceEngine.getWorkflowCounts(workflowData);
        const stageKeys = this.workflowStages.map((stage) => stage.key);
        const readiness = IntelligenceEngine.getStageReadiness(counts, stageKeys);

        return {
            counts,
            completedStages: readiness.completedStages,
            totalStages: readiness.totalStages,
            ratio: readiness.totalStages > 0
                ? readiness.completedStages / readiness.totalStages
                : 0,
            percent: readiness.percent,
            isComplete: readiness.isComplete
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
                actionLabel: isActive ? "Review workspace" : "Start workspace",
                route: this.getWorkspaceRoute(stage.key)
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
                            <button
                                type="button"
                                class="dashboard-readiness-card__action"
                                data-workspace-route="${card.route}"
                            >
                                ${card.actionLabel}
                            </button>
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

    static getWorkspaceRoute(stageKey = "") {
        const routes = {
            evidence: "evidence",
            finding: "findings",
            assessment: "assessments",
            recommendation: "recommendations",
            decision: "decisions",
            report: "reports"
        };

        return routes[stageKey] || "dashboard";
    }

    static bindReadinessCardActions() {
        document.querySelectorAll("[data-workspace-route]").forEach((button) => {
            button.addEventListener("click", (event) => {
                const route = event.currentTarget.dataset.workspaceRoute;

                if (!route) {
                    return;
                }

                window.location.hash = route;
            });
        });
    }

    static getPlatformIntelligence(data = {}) {
        const readiness = this.getWorkflowReadiness
            ? this.getWorkflowReadiness(data)
            : {
                counts: {},
                percent: 0,
                completedStages: 0,
                totalStages: 6,
                isComplete: false
            };

        const counts = readiness.counts || {};
        const riskInputs = [
            counts.finding || 0,
            counts.assessment || 0,
            counts.recommendation || 0,
            counts.decision || 0
        ];

        const downstreamCoverage = ["assessment", "recommendation", "decision", "report"]
            .filter((key) => (counts[key] || 0) > 0).length;

        const evidenceDepth = counts.evidence || 0;
        const findingDepth = counts.finding || 0;
        const reportDepth = counts.report || 0;

        const confidenceScore = IntelligenceEngine.getConfidenceScore({
            readinessPercent: readiness.percent,
            primarySignals: evidenceDepth + findingDepth,
            downstreamSignals: downstreamCoverage,
            outputSignals: reportDepth,
            weights: {
                readiness: 0.55,
                primary: 3,
                downstream: 10,
                output: 4
            }
        });

        const riskSignalScore = riskInputs.reduce((sum, value) => sum + value, 0);

        let riskSignal = {
            label: "Low signal density",
            description: "Risk logic is still light. More findings and assessments are needed before strong conclusions.",
            tone: "draft"
        };

        if (riskSignalScore >= 8) {
            riskSignal = {
                label: "High signal density",
                description: "Multiple downstream risk signals are present. Review consistency before decision output.",
                tone: "ready"
            };
        } else if (riskSignalScore >= 4) {
            riskSignal = {
                label: "Moderate signal density",
                description: "The workflow contains usable risk signals, but decision confidence depends on review quality.",
                tone: "active"
            };
        }

        let confidence = {
            label: "Low confidence",
            description: "The workflow is not yet sufficiently connected for reliable decision support.",
            score: confidenceScore,
            tone: "draft"
        };

        if (confidenceScore >= 80) {
            confidence = {
                label: "High confidence",
                description: "The workflow is strongly represented and ready for executive-level review.",
                score: confidenceScore,
                tone: "ready"
            };
        } else if (confidenceScore >= 55) {
            confidence = {
                label: "Developing confidence",
                description: "The platform has enough structure for directional insight, but key gaps may remain.",
                score: confidenceScore,
                tone: "active"
            };
        }

        const nextStrategicAction = readiness.isComplete
            ? {
                label: "Review executive output",
                description: "All workflow stages are represented. Focus on final report quality, consistency and decision confidence.",
                tone: "ready"
            }
            : this.getWorkflowBottleneck
                ? this.getWorkflowBottleneck(data)
                : {
                    label: "Complete workflow chain",
                    description: "Continue building the workflow from evidence through report.",
                    tone: "active"
                };

        return {
            readiness,
            confidence,
            riskSignal,
            nextStrategicAction,
            executiveSummary: {
                label: readiness.isComplete
                    ? "Decision workflow is fully represented."
                    : "Decision workflow is still developing.",
                description: readiness.isComplete
                    ? "The platform has enough cross-workspace coverage to support final review and reporting."
                    : "The platform should continue closing workflow gaps before relying on the output for final decisions."
            }
        };
    }

    static renderPlatformIntelligence(data = {}) {
        const intelligence = this.getPlatformIntelligence(data);

        return `
            <section class="platform-intelligence" aria-label="Workspace intelligence">
                <div class="platform-intelligence__header">
                    <div>
                        <span class="platform-intelligence__eyebrow">Workspace Intelligence</span>
                        <strong>${intelligence.executiveSummary.label}</strong>
                        <p>${intelligence.executiveSummary.description}</p>
                    </div>
                    <span class="platform-intelligence__score">${intelligence.confidence.score}%</span>
                </div>

                <div class="platform-intelligence__grid">
                    <article class="platform-intelligence__card platform-intelligence__card--${intelligence.confidence.tone}">
                        <span>Workflow Confidence</span>
                        <strong>${intelligence.confidence.label}</strong>
                        <p>${intelligence.confidence.description}</p>
                    </article>

                    <article class="platform-intelligence__card platform-intelligence__card--${intelligence.riskSignal.tone}">
                        <span>Risk Signal Overview</span>
                        <strong>${intelligence.riskSignal.label}</strong>
                        <p>${intelligence.riskSignal.description}</p>
                    </article>

                    <article class="platform-intelligence__card platform-intelligence__card--${intelligence.nextStrategicAction.tone}">
                        <span>Next Strategic Action</span>
                        <strong>${intelligence.nextStrategicAction.label}</strong>
                        <p>${intelligence.nextStrategicAction.description}</p>
                    </article>
                </div>
            </section>
        `;
    }

    static createPlatformIntelligence(data = {}) {
        const container = document.createElement("section");
        container.innerHTML = this.renderPlatformIntelligence(data);
        return container;
    }
}