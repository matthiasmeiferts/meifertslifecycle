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
import LanguageManager from "../../core/LanguageManager.js";

export default class DashboardPage {

    static workflowStages = [
        {
            key: "evidence",
            labelKey: "NavEvidence",
            descriptionKey: "DashboardCapturedInspectionEvidence"
        },
        {
            key: "finding",
            labelKey: "WorkflowStepFinding",
            descriptionKey: "DashboardTechnicalFindingsIdentified"
        },
        {
            key: "assessment",
            labelKey: "WorkflowStepAssessment",
            descriptionKey: "DashboardRiskAssessmentsCompleted"
        },
        {
            key: "recommendation",
            labelKey: "WorkflowStepRecommendation",
            descriptionKey: "DashboardActionsRecommended"
        },
        {
            key: "decision",
            labelKey: "WorkflowStepDecision",
            descriptionKey: "DashboardGovernanceDecisionsConfirmed"
        },
        {
            key: "report",
            labelKey: "WorkflowStepReport",
            descriptionKey: "DashboardFinalOutputPrepared"
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
            <p class="eyebrow">${LanguageManager.t("DashboardActiveCase")}</p>
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
                    <span>${LanguageManager.t("DashboardControlledDemoDataset")}</span>
                    <strong>${LanguageManager.t("DashboardDemoNotLoaded")}</strong>
                    <p>${LanguageManager.t("DashboardDemoLoadDescription")}</p>
                </div>
                <button type="button" class="dashboard-demo-status__action" data-demo-load>
                    ${LanguageManager.t("DashboardLoadControlledDemoDataset")}
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
        const label = status.isComplete ? LanguageManager.t("DashboardDemoComplete") : LanguageManager.t("DashboardDemoIncomplete");
        const integrityLabel = status.integrity?.isValid
            ? LanguageManager.t("DashboardWorkflowLinksValid")
            : LanguageManager.t("DashboardWorkflowLinksIncomplete");

        const banner = document.createElement("section");
        banner.className = `dashboard-demo-status dashboard-demo-status--${tone}`;
        banner.innerHTML = `
            <div>
                <span>${LanguageManager.t("DashboardControlledDemoDataset")}</span>
                <strong>${label} · ${status.percent}%</strong>
                <p>${status.completeRecords} ${LanguageManager.t("DashboardOf")} ${status.totalRecords} ${LanguageManager.t("DashboardDemoRecordsAvailable")}. ${integrityLabel}.</p>
            </div>
            <div class="dashboard-demo-status__actions">
                <button type="button" class="dashboard-demo-status__action" data-demo-load>
                    ${LanguageManager.t("DashboardReloadControlledDemoDataset")}
                </button>
                <button type="button" class="dashboard-demo-status__action" data-demo-review>
                    ${LanguageManager.t("DashboardReviewDemoReport")}
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
            <section class="completion-panel" aria-label="${LanguageManager.t("DashboardWorkflowReadiness")}">
                <div class="completion-panel__header">
                    <div>
                        <span class="completion-panel__eyebrow">${LanguageManager.t("DashboardWorkflowReadiness")}</span>
                        <strong>${readiness.isComplete ? LanguageManager.t("DashboardWorkflowComplete") : LanguageManager.t("DashboardWorkflowInProgress")}</strong>
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
                                <span>${LanguageManager.t(stage.labelKey)}: ${count}</span>
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
                label: LanguageManager.t(stage.labelKey),
                description: LanguageManager.t(stage.descriptionKey),
                count,
                status: isActive ? "active" : "open",
                actionLabel: isActive ? LanguageManager.t("DashboardReviewWorkspace") : LanguageManager.t("DashboardStartWorkspace"),
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
                            <span class="dashboard-readiness-card__eyebrow">${card.status === "active" ? LanguageManager.t("DashboardActiveStatus") : LanguageManager.t("DashboardOpenStatus")}</span>
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
                label: LanguageManager.t("DashboardWorkflowComplete"),
                description: LanguageManager.t("DashboardAllStagesContainData"),
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
                label: LanguageManager.t("DashboardReviewWorkflow"),
                description: LanguageManager.t("DashboardWorkflowDataPresent"),
                tone: "linked"
            };
        }

        return {
            key: firstOpenStage.key,
            label: `${LanguageManager.t("DashboardNextAttention")}: ${LanguageManager.t(firstOpenStage.labelKey)}`,
            description: `${LanguageManager.t(firstOpenStage.descriptionKey)} ${LanguageManager.t("DashboardStageMissingSuffix")}`,
            tone: "active"
        };
    }

    static renderWorkflowBottleneckIndicator(data = {}) {
        const bottleneck = this.getWorkflowBottleneck(data);

        return `
            <section class="next-action next-action--${bottleneck.tone}" aria-label="${LanguageManager.t("DashboardWorkflowBottleneck")}">
                <div>
                    <span class="next-action__eyebrow">${LanguageManager.t("DashboardWorkflowBottleneck")}</span>
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
                label: LanguageManager.t("DashboardCompleteWorkflowCoverage"),
                description: LanguageManager.t("DashboardCompleteWorkflowCoverageDescription"),
                score: LanguageManager.t("WorkspaceHigh"),
                tone: "ready"
            };
        }

        if (readiness.percent >= 67) {
            return {
                label: LanguageManager.t("DashboardStrongWorkflowProgress"),
                description: LanguageManager.t("DashboardStrongWorkflowProgressDescription"),
                score: LanguageManager.t("DashboardMediumHigh"),
                tone: "linked"
            };
        }

        if (readiness.percent >= 34) {
            return {
                label: LanguageManager.t("DashboardPartialWorkflowCoverage"),
                description: "The workflow is active but still incomplete. Continue linking evidence, findings and downstream decisions.",
                score: LanguageManager.t("DashboardMedium"),
                tone: "active"
            };
        }

        return {
            label: LanguageManager.t("DashboardEarlyWorkflowStage"),
            description: LanguageManager.t("DashboardEarlyWorkflowStageDescription"),
            score: LanguageManager.t("DashboardLow"),
            tone: "draft"
        };
    }

    static renderWorkflowQualitySummary(data = {}) {
        const summary = this.getWorkflowQualitySummary(data);

        return `
            <section class="next-action next-action--${summary.tone}" aria-label="${LanguageManager.t("DashboardWorkflowQuality")}">
                <div>
                    <span class="next-action__eyebrow">${LanguageManager.t("DashboardWorkflowQuality")}</span>
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
            label: LanguageManager.t("DashboardLowSignalDensity"),
            description: LanguageManager.t("DashboardLowSignalDensityDescription"),
            tone: "draft"
        };

        if (riskSignalScore >= 8) {
            riskSignal = {
                label: LanguageManager.t("DashboardHighSignalDensity"),
                description: LanguageManager.t("DashboardHighSignalDensityDescription"),
                tone: "ready"
            };
        } else if (riskSignalScore >= 4) {
            riskSignal = {
                label: LanguageManager.t("DashboardModerateSignalDensity"),
                description: LanguageManager.t("DashboardModerateSignalDensityDescription"),
                tone: "active"
            };
        }

        let confidence = {
            label: LanguageManager.t("DashboardLowConfidence"),
            description: LanguageManager.t("DashboardLowConfidenceDescription"),
            score: confidenceScore,
            tone: "draft"
        };

        if (confidenceScore >= 80) {
            confidence = {
                label: LanguageManager.t("DashboardHighConfidence"),
                description: LanguageManager.t("DashboardHighConfidenceDescription"),
                score: confidenceScore,
                tone: "ready"
            };
        } else if (confidenceScore >= 55) {
            confidence = {
                label: LanguageManager.t("DashboardDevelopingConfidence"),
                description: LanguageManager.t("DashboardDevelopingConfidenceDescription"),
                score: confidenceScore,
                tone: "active"
            };
        }

        const nextStrategicAction = readiness.isComplete
            ? {
                label: LanguageManager.t("DashboardReviewExecutiveOutput"),
                description: LanguageManager.t("DashboardReviewExecutiveOutputDescription"),
                tone: "ready"
            }
            : this.getWorkflowBottleneck
                ? this.getWorkflowBottleneck(data)
                : {
                    label: LanguageManager.t("DashboardCompleteWorkflowChain"),
                    description: LanguageManager.t("DashboardCompleteWorkflowChainDescription"),
                    tone: "active"
                };

        return {
            readiness,
            confidence,
            riskSignal,
            nextStrategicAction,
            executiveSummary: {
                label: readiness.isComplete
                    ? LanguageManager.t("DashboardDecisionWorkflowComplete")
                    : LanguageManager.t("DashboardDecisionWorkflowDeveloping"),
                description: readiness.isComplete
                    ? LanguageManager.t("DashboardPlatformCoverageReady")
                    : LanguageManager.t("DashboardPlatformCoverageDeveloping")
            }
        };
    }

    static renderPlatformIntelligence(data = {}) {
        const intelligence = this.getPlatformIntelligence(data);

        return `
            <section class="platform-intelligence" aria-label="${LanguageManager.t("DashboardWorkspaceIntelligence")}">
                <div class="platform-intelligence__header">
                    <div>
                        <span class="platform-intelligence__eyebrow">${LanguageManager.t("DashboardWorkspaceIntelligence")}</span>
                        <strong>${intelligence.executiveSummary.label}</strong>
                        <p>${intelligence.executiveSummary.description}</p>
                    </div>
                    <span class="platform-intelligence__score">${intelligence.confidence.score}%</span>
                </div>

                <div class="platform-intelligence__grid">
                    <article class="platform-intelligence__card platform-intelligence__card--${intelligence.confidence.tone}">
                        <span>${LanguageManager.t("DashboardWorkflowConfidence")}</span>
                        <strong>${intelligence.confidence.label}</strong>
                        <p>${intelligence.confidence.description}</p>
                    </article>

                    <article class="platform-intelligence__card platform-intelligence__card--${intelligence.riskSignal.tone}">
                        <span>${LanguageManager.t("DashboardRiskSignalOverview")}</span>
                        <strong>${intelligence.riskSignal.label}</strong>
                        <p>${intelligence.riskSignal.description}</p>
                    </article>

                    <article class="platform-intelligence__card platform-intelligence__card--${intelligence.nextStrategicAction.tone}">
                        <span>${LanguageManager.t("DashboardNextStrategicAction")}</span>
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