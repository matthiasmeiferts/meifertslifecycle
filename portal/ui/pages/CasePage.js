import CaseManager from "../../core/CaseManager.js";
import EvidenceManager from "../../core/EvidenceManager.js";
import FindingManager from "../../core/FindingManager.js";
import AssessmentManager from "../../core/AssessmentManager.js";
import RecommendationManager from "../../core/RecommendationManager.js";
import DecisionManager from "../../core/DecisionManager.js";
import ReportManager from "../../core/ReportManager.js";
import LanguageManager from "../../core/LanguageManager.js";
import SectionHeader from "../components/SectionHeader.js";
import SearchBar from "../components/SearchBar.js";
import ActionBar from "../components/ActionBar.js";
import WorkspaceTable from "../components/WorkspaceTable.js";
import EmptyState from "../components/EmptyState.js";
import StatusBadge from "../components/StatusBadge.js";
import FormDialog from "../components/FormDialog.js";
import DetailPanel from "../components/DetailPanel.js";
import IntelligenceEngine from "../../core/IntelligenceEngine.js";

export default class CasePage {

    static searchQuery = "";

    static intelligenceStages = [
        {
            key: "evidence",
            label: LanguageManager.t("NavEvidence"),
            labelKey: "NavEvidence"
        },
        {
            key: "finding",
            label: "Finding",
            labelKey: "WorkflowStepFinding"
        },
        {
            key: "assessment",
            label: "Assessment",
            labelKey: "WorkflowStepAssessment"
        },
        {
            key: "recommendation",
            label: "Recommendation",
            labelKey: "WorkflowStepRecommendation"
        },
        {
            key: "decision",
            label: "Decision",
            labelKey: "WorkflowStepDecision"
        },
        {
            key: "report",
            label: "Report",
            labelKey: "WorkflowStepReport"
        }
    ];

    static render() {
        const fragment = document.createDocumentFragment();

        fragment.appendChild(this.createHeader());
        fragment.appendChild(this.createMainLayout());

        setTimeout(() => this.bindActions(), 0);

        return fragment;
    }

    static createHeader() {
        const current = CaseManager.getCurrent();

        return SectionHeader.create({
            eyebrow: LanguageManager.t("CaseWorkspaceTitle"),
            title: LanguageManager.t("NavCases"),
            description: current
                ? `${LanguageManager.t("CaseActiveCasePrefix")}: ${current.title}`
                : LanguageManager.t("CaseCreateManageDescription"),
            actions: [
                {
                    id: "new-case",
                    label: LanguageManager.t("CaseNewCaseAction"),
                    onClick: () => this.createCase()
                }
            ]
        });
    }

    static createToolbar() {
        const wrapper = document.createElement("section");
        wrapper.className = "workflow-card case-toolbar";

        wrapper.appendChild(
            SearchBar.create({
                placeholder: LanguageManager.t("FoundationCaseSearchPlaceholder"),
                value: this.getSearchQuery(),
                buttonLabel: "Suchen",
                onSearch: value => {
                    this.searchQuery = (value || "").trim().toLowerCase();
                    window.sessionStorage.setItem("mbi:caseSearchQuery", this.searchQuery);
                    this.refresh();
                }
            })
        );

        wrapper.appendChild(
            ActionBar.create([
                {
                    id: "refresh",
                    label: LanguageManager.t("CaseRefreshAction"),
                    onClick: () => this.refresh()
                },
                {
                    id: "close-case",
                    label: "Close Case",
                    onClick: () => {
                        CaseManager.close();
                        this.refresh();
                    }
                }
            ])
        );

        return wrapper;
    }

    static createMainLayout() {
        const layout = document.createElement("section");
        layout.className = "case-workspace-layout case-workspace-layout--cases";

        const primaryColumn = document.createElement("div");
        primaryColumn.className = "workspace-primary-column";

        const toolbar = this.createToolbar();
        toolbar.classList.add("workspace-full-width");

        const intelligenceSnapshot = this.createCaseIntelligenceSnapshot();
        primaryColumn.appendChild(this.createContent());

        if (intelligenceSnapshot) {
            primaryColumn.appendChild(intelligenceSnapshot);
        }

        primaryColumn.appendChild(this.createWorkflowActions());

        layout.appendChild(toolbar);
        layout.appendChild(primaryColumn);
        layout.appendChild(this.createDetailPanel());

        return layout;
    }

    static createContent() {
        const cases = this.getFilteredCases();
        const query = this.getSearchQuery();

        if (!cases.length && query) {
            return EmptyState.create({
                eyebrow: "Case Search",
                title: LanguageManager.t("FoundationCaseNoMatchingTitle"),
                description: 'No case matches "' + query + '". Clear the search or try another term.',
                actionLabel: "Clear Search",
                onAction: () => {
                    this.searchQuery = "";
                    window.sessionStorage.removeItem("mbi:caseSearchQuery");
                    this.refresh();
                }
            });
        }

        if (!cases.length) {
            return EmptyState.create({
                eyebrow: LanguageManager.t("CaseWorkspaceTitle"),
                title: LanguageManager.t("CaseEmptyTitle"),
                description: LanguageManager.t("CaseEmptyDescription"),
                actionLabel: LanguageManager.t("CaseNewCaseAction"),
                onAction: () => this.createCase()
            });
        }

        return WorkspaceTable.create({
            columns: [
                {
                    key: "title",
                    label: "Case",
                    render: row => {
                        const wrapper = document.createElement("div");
                        const currentCase = CaseManager.getCurrent();
                        const isActive = currentCase?.id === row.id;

                        wrapper.className = isActive
                            ? "case-title-cell is-active-case"
                            : "case-title-cell";
        const title = document.createElement("strong");
                        title.textContent = row.title || "Untitled case";

                        const meta = document.createElement("div");
                        meta.className = "case-title-meta";
                        meta.appendChild(StatusBadge.create(row.status || "Draft", "warning"));

                        if (isActive) {
                            const active = document.createElement("span");
                            active.className = "active-case-pill";
                            active.textContent = LanguageManager.t("CaseActiveBadge");
                            meta.appendChild(active);
                        }

                        wrapper.appendChild(title);
                        wrapper.appendChild(meta);
                        wrapper.appendChild(this.createActionButtons(row));

                        return wrapper;
                    }
                },
                {
                    key: "type",
                    label: LanguageManager.t("CaseTypeLabel")
                },
            ],
            rows: cases,
            onRowClick: row => this.openCase(row)
        });
    }

    static createDetailPanel() {
        const current = CaseManager.getCurrent();

        if (!current) {
            return DetailPanel.create("No Case Selected", [
                {
                    label: LanguageManager.t("CaseStatusLabel"),
                    value: LanguageManager.t("FoundationNoActiveCase")
                },
                {
                    label: LanguageManager.t("CaseNextStepLabel"),
                    value: LanguageManager.t("CaseCreateOrOpen")
                }
            ]);
        }

        return DetailPanel.create(current.title, [
            {
                label: LanguageManager.t("CaseIdLabel"),
                value: current.id || LanguageManager.t("CaseNotAvailable")
            },
            {
                label: LanguageManager.t("CaseStatusLabel"),
                value: current.status || "Draft"
            },
            {
                label: LanguageManager.t("CaseClientContextLabel"),
                value: current.clientName || current.client || LanguageManager.t("CaseNotSpecified")
            },
            {
                label: LanguageManager.t("CaseTypeLabel"),
                value: current.type || "Technical Property Review"
            },
            {
                label: LanguageManager.t("CaseProgressLabel"),
                value: `${current.progress || 0}%`
            },
            {
                label: LanguageManager.t("CaseBuildingLabel"),
                value: current.buildingId || LanguageManager.t("CaseNotLinked")
            },
            {
                label: LanguageManager.t("CaseInspectionLabel"),
                value: current.inspectionId || LanguageManager.t("CaseNotLinked")
            },
            {
                label: LanguageManager.t("NavEvidence"),
                value: current.evidenceIds?.length || 0
            },
            {
                label: LanguageManager.t("NavFindings"),
                value: current.findingIds?.length || 0
            },
            {
                label: LanguageManager.t("CaseUpdatedLabel"),
                value: this.formatDate(current.updatedAt)
            }
        ]);
    }

    static createWorkflowActions() {
        const current = CaseManager.getCurrent();

        const wrapper = document.createElement("section");
        wrapper.className = "workflow-card case-workflow-actions";

        const header = document.createElement("div");
        header.className = "case-workflow-actions__header";

        const eyebrow = document.createElement("span");
        eyebrow.className = "eyebrow";
        eyebrow.textContent = LanguageManager.t("CaseContinueWorkflow");

        const workflowData = current ? {
            evidence: EvidenceManager.getByCase(current.id),
            findings: FindingManager.getByCase(current.id),
            assessments: AssessmentManager.getByCase(current.id),
            recommendations: RecommendationManager.getByCase(current.id),
            decisions: DecisionManager.getByCase(current.id),
            reports: ReportManager.getByCase(current.id)
        } : null;
        const workflowComplete = current
            ? this.getCaseIntelligence(current, workflowData).readinessPercent >= 100
            : false;

        const title = document.createElement("strong");
        title.textContent = current
            ? workflowComplete
                ? LanguageManager.t("CaseReviewCompleteChain")
                : LanguageManager.t("CaseMoveThroughChain")
            : LanguageManager.t("CaseSelectToContinueWorkflow");

        const description = document.createElement("p");
        description.textContent = current
            ? workflowComplete
                ? LanguageManager.t("CaseAllStagesReviewLinks")
                : LanguageManager.t("CaseCreateReviewLinkedRecords")
            : LanguageManager.t("CaseOpenFirstThenContinue");

        header.appendChild(eyebrow);
        header.appendChild(title);
        header.appendChild(description);

        if (current) {
            const workflowTools = document.createElement("div");
            workflowTools.className = "case-workflow-actions__tools";

            const builderButton = document.createElement("button");
            builderButton.type = "button";
            builderButton.className = "button button--primary case-workflow-actions__primary";
            builderButton.textContent = workflowComplete ? LanguageManager.t("CaseReviewWorkflowChain") : LanguageManager.t("CaseCreateWorkflowChain");
            builderButton.addEventListener("click", () => this.createWorkflowChainBuilder());
            workflowTools.appendChild(builderButton);

            const maintenance = document.createElement("div");
            maintenance.className = "case-workflow-actions__maintenance";

            const maintenanceLabel = document.createElement("span");
            maintenanceLabel.className = "case-workflow-actions__maintenance-label";
            maintenanceLabel.textContent = LanguageManager.t("CaseMaintenanceLabel");
            maintenance.appendChild(maintenanceLabel);

            const repairButton = document.createElement("button");
            repairButton.type = "button";
            repairButton.className = "button button--secondary case-workflow-actions__maintenance-button";
            repairButton.textContent = LanguageManager.t("CaseRepairLinksAction");
            repairButton.addEventListener("click", () => this.repairWorkflowLinks());
            maintenance.appendChild(repairButton);

            const orphanButton = document.createElement("button");
            orphanButton.type = "button";
            orphanButton.className = "button button--secondary case-workflow-actions__maintenance-button";
            orphanButton.textContent = LanguageManager.t("CaseCleanOrphansAction");
            orphanButton.addEventListener("click", () => this.cleanOrphanWorkflowRecords());
            maintenance.appendChild(orphanButton);

            workflowTools.appendChild(maintenance);
            header.appendChild(workflowTools);
        }

        const actions = document.createElement("div");
        actions.className = "case-workflow-actions__grid";

        [
            {
                labelKey: "NavEvidence",
                route: "evidence",
                descriptionKey: "CaseWorkflowEvidenceDescription"
            },
            {
                labelKey: "NavFindings",
                route: "findings",
                descriptionKey: "CaseWorkflowFindingsDescription"
            },
            {
                labelKey: "NavAssessments",
                route: "assessments",
                descriptionKey: "CaseWorkflowAssessmentsDescription"
            },
            {
                labelKey: "NavRecommendations",
                route: "recommendations",
                descriptionKey: "CaseWorkflowRecommendationsDescription"
            },
            {
                labelKey: "NavDecisions",
                route: "decisions",
                descriptionKey: "CaseWorkflowDecisionsDescription"
            },
            {
                labelKey: "NavReports",
                route: "reports",
                descriptionKey: "CaseWorkflowReportsDescription"
            }
        ].forEach((item, index) => {
            const button = document.createElement("button");
            button.className = "case-workflow-action";
            button.type = "button";
            button.disabled = !current;

            const step = document.createElement("span");
            step.className = "case-workflow-action__step";
            step.textContent = String(index + 1).padStart(2, "0");

            const label = document.createElement("strong");
            label.textContent = LanguageManager.t(item.labelKey);

            const copy = document.createElement("p");
            copy.textContent = LanguageManager.t(item.descriptionKey);

            button.appendChild(step);
            button.appendChild(label);
            button.appendChild(copy);

            button.onclick = () => {
                if (!current) return;
                window.location.hash = item.route;
            };

            actions.appendChild(button);
        });

        wrapper.appendChild(header);
        wrapper.appendChild(actions);

        return wrapper;
    }

    static createActionButtons(row) {
        const wrapper = document.createElement("div");
        wrapper.className = "table-actions";

        [
            ["open", LanguageManager.t("ReportOpenAction")],
            ["edit", LanguageManager.t("ReportEditAction")],
            ["delete", LanguageManager.t("ReportDeleteAction")]
        ].forEach(([action, label]) => {

            const button = document.createElement("button");

            button.className = "button";
            button.type = "button";
            button.textContent = label;

            button.dataset.caseAction = action;
            button.dataset.id = row.id;

            button.setAttribute("data-stop-row-click", "true");

            wrapper.appendChild(button);

        });

        return wrapper;
    }

    static getCaseIntelligence(caseItem = {}, data = {}) {
        const caseId = caseItem.id || caseItem.caseId;

        const filterByCase = (items = []) => {
            if (!Array.isArray(items)) {
                return [];
            }

            if (!caseId) {
                return items;
            }

            return items.filter((item) =>
                item.caseId === caseId ||
                item.linkedCaseId === caseId ||
                item.case === caseId
            );
        };

        const evidence = filterByCase(data.evidence || data.evidences || []);
        const findings = filterByCase(data.findings || []);
        const assessments = filterByCase(data.assessments || []);
        const recommendations = filterByCase(data.recommendations || []);
        const decisions = filterByCase(data.decisions || []);
        const reports = filterByCase(data.reports || []);

        const counts = {
            evidence: evidence.length,
            finding: findings.length,
            assessment: assessments.length,
            recommendation: recommendations.length,
            decision: decisions.length,
            report: reports.length
        };

        const stageKeys = this.intelligenceStages.map((stage) => stage.key);
        const readiness = IntelligenceEngine.getStageReadiness(counts, stageKeys);
        const readinessPercent = readiness.percent;
        const completedStages = readiness.completedStages;
        const totalStages = readiness.totalStages;

        const downstreamSignals =
            counts.finding +
            counts.assessment +
            counts.recommendation +
            counts.decision;

        const confidenceScore = IntelligenceEngine.getConfidenceScore({
            readinessPercent,
            primarySignals: counts.evidence,
            downstreamSignals,
            outputSignals: counts.report,
            weights: {
                readiness: 0.6,
                primary: 4,
                downstream: 3,
                output: 4
            }
        });

        let riskSignal = {
            label: LanguageManager.t("CaseLowRiskSignal"),
            description: LanguageManager.t("CaseLowRiskSignalDescription"),
            tone: "draft"
        };

        if (downstreamSignals >= 8) {
            riskSignal = {
                label: LanguageManager.t("CaseHighRiskSignal"),
                description: LanguageManager.t("CaseHighRiskSignalDescription"),
                tone: "ready"
            };
        } else if (downstreamSignals >= 4) {
            riskSignal = {
                label: LanguageManager.t("CaseModerateRiskSignal"),
                description: LanguageManager.t("CaseModerateRiskSignalDescription"),
                tone: "active"
            };
        }

        const firstOpenStage = this.intelligenceStages.find((stage) => counts[stage.key] === 0);

        const nextAction = firstOpenStage
            ? {
                label: `${LanguageManager.t("CaseStrengthenPrefix")} ${LanguageManager.t(firstOpenStage.labelKey || firstOpenStage.label)}`,
                description: `${LanguageManager.t(firstOpenStage.labelKey || firstOpenStage.label)} ${LanguageManager.t("CaseStageMissingDescription")}`,
                tone: "active"
            }
            : {
                label: LanguageManager.t("CaseReviewOutput"),
                description: LanguageManager.t("CaseReviewOutputDescription"),
                tone: "ready"
            };

        return {
            counts,
            completedStages,
            totalStages,
            readinessPercent,
            confidenceScore,
            riskSignal,
            nextAction,
            label: readinessPercent >= 100
                ? LanguageManager.t("CaseWorkflowComplete")
                : readinessPercent >= 50
                    ? LanguageManager.t("CaseWorkflowDeveloping")
                    : LanguageManager.t("CaseWorkflowEarly")
        };
    }

    static renderCaseIntelligenceSnapshot(caseItem = {}, data = {}) {
        const intelligence = this.getCaseIntelligence(caseItem, data);
        const stageSummary = `${intelligence.completedStages}/${intelligence.totalStages}`;

        return `
            <section class="case-intelligence intelligence-snapshot case-intelligence--refined" aria-label="Case intelligence snapshot">
                <div class="case-intelligence__header intelligence-snapshot__header">
                    <div>
                        <span class="case-intelligence__eyebrow intelligence-snapshot__eyebrow">${LanguageManager.t("CaseIntelligenceLabel")}</span>
                        <strong>${intelligence.label}</strong>
                        <p>${LanguageManager.t("CaseIntelligenceDescription")}</p>
                    </div>
                    <span class="case-intelligence__score intelligence-snapshot__score">${intelligence.confidenceScore}%</span>
                </div>

                <div class="case-intelligence__summary">
                    <div>
                        <span>${LanguageManager.t("CaseReadinessLabel")}</span>
                        <strong>${intelligence.readinessPercent}%</strong>
                    </div>
                    <div>
                        <span>${LanguageManager.t("CaseConfidenceLabel")}</span>
                        <strong>${intelligence.confidenceScore}%</strong>
                    </div>
                    <div>
                        <span>${LanguageManager.t("CaseStagesLabel")}</span>
                        <strong>${stageSummary}</strong>
                    </div>
                </div>

                <div class="case-intelligence__grid intelligence-snapshot__grid">
                    <article class="case-intelligence__card intelligence-snapshot__card">
                        <span>${LanguageManager.t("CaseWorkflowCoverageLabel")}</span>
                        <strong>${intelligence.readinessPercent}% ${LanguageManager.t("CaseReadySuffix")}</strong>
                        <p>${stageSummary} ${LanguageManager.t("CaseStagesRepresented")}. ${intelligence.readinessPercent >= 100 ? LanguageManager.t("CaseAllStagesRepresented") : LanguageManager.t("CaseContinueMissingStage")}</p>
                    </article>

                    <article class="case-intelligence__card intelligence-snapshot__card case-intelligence__card--${intelligence.riskSignal.tone} intelligence-snapshot__card--${intelligence.riskSignal.tone}">
                        <span>${LanguageManager.t("CaseRiskSignalLabel")}</span>
                        <strong>${intelligence.riskSignal.label}</strong>
                        <p>${intelligence.riskSignal.description}</p>
                    </article>

                    <article class="case-intelligence__card intelligence-snapshot__card case-intelligence__card--${intelligence.nextAction.tone} intelligence-snapshot__card--${intelligence.nextAction.tone}">
                        <span>${LanguageManager.t("CaseNextActionLabel")}</span>
                        <strong>${intelligence.nextAction.label}</strong>
                        <p>${intelligence.nextAction.description}</p>
                    </article>
                </div>
            </section>
        `;
    }

    static createCaseIntelligenceSnapshot(caseItem = null, data = null) {
        const currentCase = caseItem || CaseManager.getCurrent();

        if (!currentCase) {
            return null;
        }

        const caseData = data || {
            evidence: EvidenceManager.getByCase(currentCase.id),
            findings: FindingManager.getByCase(currentCase.id),
            assessments: AssessmentManager.getByCase(currentCase.id),
            recommendations: RecommendationManager.getByCase(currentCase.id),
            decisions: DecisionManager.getByCase(currentCase.id),
            reports: ReportManager.getByCase(currentCase.id)
        };
        const container = document.createElement("section");
        container.innerHTML = this.renderCaseIntelligenceSnapshot(currentCase, caseData);
        return container;
    }

    static bindActions() {
        document
            .querySelectorAll("[data-case-action]")
            .forEach(button => {

                button.addEventListener("click", event => {

                    event.stopPropagation();

                    const action = button.dataset.caseAction;
                    const id = button.dataset.id;

                    const item = CaseManager.load(id);

                    if (!item) return;

                    switch (action) {

                        case "open":
                            this.openCase(item);
                            break;

                        case "edit":
                            this.editCase(item);
                            break;

                        case "delete":
                            this.deleteCase(item);
                            break;

                    }

                });

            });
    }

    static getSearchQuery() {
        return (this.searchQuery || window.sessionStorage.getItem("mbi:caseSearchQuery") || "").trim().toLowerCase();
    }

    static getFilteredCases() {
        const cases = CaseManager.getAll();
        const query = this.getSearchQuery();

        if (!query) return cases;

        return cases.filter(item => {
            const text = [
                item.id,
                item.title,
                item.name,
                item.client,
                item.clientName,
                item.type,
                item.status,
                item.buildingId,
                item.inspectionId,
                item.updatedAt
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return text.includes(query);
        });
    }


    static cleanOrphanWorkflowRecords() {
        const caseIds = new Set(CaseManager.getAll().map(item => item.id));
        const groups = [
            [LanguageManager.t("FinalEvidenceLabel"), EvidenceManager],
            ["Finding", FindingManager],
            ["Assessment", AssessmentManager],
            ["Recommendation", RecommendationManager],
            ["Decision", DecisionManager],
            ["Report", ReportManager]
        ];

        const orphanRecords = groups.flatMap(([label, manager]) =>
            manager.getAll()
                .filter(item => item.caseId && !caseIds.has(item.caseId))
                .map(item => ({ label, manager, item }))
        );

        if (!orphanRecords.length) {
            window.alert(LanguageManager.t("CaseNoOrphanRecords"));
            return;
        }

        const summary = orphanRecords
            .map(record => `${record.label}: ${record.item.title || record.item.id} (${record.item.caseId})`)
            .join("\n");

        const confirmed = window.confirm(
            `${LanguageManager.t("CaseDeleteOrphanPrefix")} ${orphanRecords.length} ${LanguageManager.t("CaseOrphanRecordsQuestion")}\n\n${summary}`
        );

        if (!confirmed) return;

        orphanRecords.forEach(record => {
            record.manager.delete(record.item.id);
        });

        window.alert(`${orphanRecords.length} ${LanguageManager.t("CaseOrphanRecordsDeleted")}`);
        this.refresh();
    }

    static repairWorkflowLinks() {
        const current = CaseManager.getCurrent();

        if (!current) {
            window.alert(LanguageManager.t("CaseOpenBeforeRepairing"));
            return;
        }

        const unique = values => [...new Set((values || []).filter(Boolean))];

        const evidenceItems = EvidenceManager.getByCase(current.id);
        const findingItems = FindingManager.getByCase(current.id);
        const assessmentItems = AssessmentManager.getByCase(current.id);
        const recommendationItems = RecommendationManager.getByCase(current.id);
        const decisionItems = DecisionManager.getByCase(current.id);
        const reportItems = ReportManager.getByCase(current.id);

        evidenceItems.forEach(evidence => {
            const linkedFindings = findingItems
                .filter(finding => (finding.evidenceIds || []).includes(evidence.id))
                .map(finding => finding.id);

            const linkedAssessments = assessmentItems
                .filter(assessment => (assessment.evidenceIds || []).includes(evidence.id))
                .map(assessment => assessment.id);

            EvidenceManager.set(EvidenceManager.update({
                ...evidence,
                findingIds: unique([...(evidence.findingIds || []), ...linkedFindings]),
                assessmentIds: unique([...(evidence.assessmentIds || []), ...linkedAssessments]),
                updatedAt: new Date().toISOString()
            }));
        });

        findingItems.forEach(finding => {
            const linkedAssessments = assessmentItems
                .filter(assessment => (assessment.findingIds || []).includes(finding.id))
                .map(assessment => assessment.id);

            const linkedRecommendations = recommendationItems
                .filter(recommendation => (recommendation.findingIds || []).includes(finding.id))
                .map(recommendation => recommendation.id);

            FindingManager.set(FindingManager.update({
                ...finding,
                assessmentIds: unique([...(finding.assessmentIds || []), ...linkedAssessments]),
                recommendationIds: unique([...(finding.recommendationIds || []), ...linkedRecommendations]),
                updatedAt: new Date().toISOString()
            }));
        });

        assessmentItems.forEach(assessment => {
            const linkedEvidenceIds = findingItems
                .filter(finding => (assessment.findingIds || []).includes(finding.id))
                .flatMap(finding => finding.evidenceIds || []);

            const linkedRecommendations = recommendationItems
                .filter(recommendation => (recommendation.assessmentIds || []).includes(assessment.id))
                .map(recommendation => recommendation.id);

            AssessmentManager.set(AssessmentManager.update({
                ...assessment,
                evidenceIds: unique([...(assessment.evidenceIds || []), ...linkedEvidenceIds]),
                recommendationIds: unique([...(assessment.recommendationIds || []), ...linkedRecommendations]),
                updatedAt: new Date().toISOString()
            }));
        });

        recommendationItems.forEach(recommendation => {
            const linkedFindingIds = assessmentItems
                .filter(assessment => (recommendation.assessmentIds || []).includes(assessment.id))
                .flatMap(assessment => assessment.findingIds || []);

            const linkedDecisions = decisionItems
                .filter(decision => (decision.recommendationIds || []).includes(recommendation.id))
                .map(decision => decision.id);

            RecommendationManager.set(RecommendationManager.update({
                ...recommendation,
                findingIds: unique([...(recommendation.findingIds || []), ...linkedFindingIds]),
                decisionIds: unique([...(recommendation.decisionIds || []), ...linkedDecisions]),
                updatedAt: new Date().toISOString()
            }));
        });

        decisionItems.forEach(decision => {
            const linkedAssessmentIds = recommendationItems
                .filter(recommendation => (decision.recommendationIds || []).includes(recommendation.id))
                .flatMap(recommendation => recommendation.assessmentIds || []);

            const linkedFindingIds = recommendationItems
                .filter(recommendation => (decision.recommendationIds || []).includes(recommendation.id))
                .flatMap(recommendation => recommendation.findingIds || []);

            const linkedReports = reportItems
                .filter(report => (report.decisionIds || []).includes(decision.id))
                .map(report => report.id);

            DecisionManager.set(DecisionManager.update({
                ...decision,
                assessmentIds: unique([...(decision.assessmentIds || []), ...linkedAssessmentIds]),
                findingIds: unique([...(decision.findingIds || []), ...linkedFindingIds]),
                reportIds: unique([...(decision.reportIds || []), ...linkedReports]),
                updatedAt: new Date().toISOString()
            }));
        });

        reportItems.forEach(report => {
            const linkedRecommendationIds = decisionItems
                .filter(decision => (report.decisionIds || []).includes(decision.id))
                .flatMap(decision => decision.recommendationIds || []);

            const linkedAssessmentIds = decisionItems
                .filter(decision => (report.decisionIds || []).includes(decision.id))
                .flatMap(decision => decision.assessmentIds || []);

            const linkedFindingIds = [
                ...decisionItems
                    .filter(decision => (report.decisionIds || []).includes(decision.id))
                    .flatMap(decision => decision.findingIds || []),
                ...assessmentItems
                    .filter(assessment => (report.assessmentIds || []).includes(assessment.id))
                    .flatMap(assessment => assessment.findingIds || [])
            ];

            ReportManager.set(ReportManager.update({
                ...report,
                recommendationIds: unique([...(report.recommendationIds || []), ...linkedRecommendationIds]),
                assessmentIds: unique([...(report.assessmentIds || []), ...linkedAssessmentIds]),
                findingIds: unique([...(report.findingIds || []), ...linkedFindingIds]),
                updatedAt: new Date().toISOString()
            }));
        });

        CaseManager.setCurrent({
            ...current,
            evidenceIds: unique([...(current.evidenceIds || []), ...evidenceItems.map(item => item.id)]),
            findingIds: unique([...(current.findingIds || []), ...findingItems.map(item => item.id)]),
            assessmentIds: unique([...(current.assessmentIds || []), ...assessmentItems.map(item => item.id)]),
            recommendationIds: unique([...(current.recommendationIds || []), ...recommendationItems.map(item => item.id)]),
            decisionIds: unique([...(current.decisionIds || []), ...decisionItems.map(item => item.id)]),
            reportIds: unique([...(current.reportIds || []), ...reportItems.map(item => item.id)]),
            updatedAt: new Date().toISOString()
        });
        CaseManager.save();

        window.alert(LanguageManager.t("CaseWorkflowLinksRepaired"));
        this.refresh();
    }

    static createWorkflowChainBuilder() {
        const current = CaseManager.getCurrent();

        if (!current) {
            window.alert(LanguageManager.t("CaseOpenBeforeCreatingChain"));
            return;
        }

        FormDialog.open({
            title: LanguageManager.t("CaseCreateWorkflowChain"),
            submitLabel: LanguageManager.t("CaseCreateWorkflowChain"),
            values: {
                evidenceTitle: LanguageManager.t("FoundationEvidenceInputTitle"),
                evidenceDescription: LanguageManager.t("FoundationEvidenceInputDescription"),
                evidenceType: LanguageManager.t("FoundationPhotoDocument"),
                findingTitle: "Technical finding",
                findingDescription: "Finding prepared from evidence.",
                findingSeverity: "Medium",
                assessmentTitle: "Risk assessment",
                assessmentDescription: "Assessment prepared from finding.",
                assessmentSeverity: "Medium",
                recommendationTitle: "Recommended action",
                recommendationDescription: "Recommendation prepared from assessment.",
                recommendationPriority: "Medium",
                decisionTitle: "Decision record",
                decisionDescription: "Decision prepared from recommendation.",
                decisionType: "Monitor",
                reportTitle: "Technical Due Diligence Report",
                reportDescription: "Report prepared from decision.",
                reportType: "Technical Due Diligence"
            },
            fields: [
                { id: "evidenceTitle", label: LanguageManager.t("CaseEvidenceTitleField") },
                { id: "evidenceDescription", label: LanguageManager.t("CaseEvidenceDescriptionField") },
                { id: "evidenceType", label: LanguageManager.t("CaseEvidenceTypeField") },
                { id: "findingTitle", label: LanguageManager.t("CaseFindingTitleField") },
                { id: "findingDescription", label: LanguageManager.t("CaseFindingDescriptionField") },
                { id: "findingSeverity", label: LanguageManager.t("CaseFindingSeverityField") },
                { id: "assessmentTitle", label: LanguageManager.t("CaseAssessmentTitleField") },
                { id: "assessmentDescription", label: LanguageManager.t("CaseAssessmentDescriptionField") },
                { id: "assessmentSeverity", label: LanguageManager.t("CaseAssessmentSeverityField") },
                { id: "recommendationTitle", label: LanguageManager.t("CaseRecommendationTitleField") },
                { id: "recommendationDescription", label: LanguageManager.t("CaseRecommendationDescriptionField") },
                { id: "recommendationPriority", label: LanguageManager.t("CaseRecommendationPriorityField") },
                { id: "decisionTitle", label: LanguageManager.t("CaseDecisionTitleField") },
                { id: "decisionDescription", label: LanguageManager.t("CaseDecisionDescriptionField") },
                { id: "decisionType", label: LanguageManager.t("CaseDecisionTypeField") },
                { id: "reportTitle", label: LanguageManager.t("ReportTitleFieldLabel") },
                { id: "reportDescription", label: LanguageManager.t("CaseReportDescriptionField") },
                { id: "reportType", label: LanguageManager.t("ReportTypeFieldLabel") }
            ],
            onSubmit: (values, dialog) => {
                const evidence = EvidenceManager.create({
                    caseId: current.id,
                    buildingId: current.buildingId || null,
                    inspectionId: current.inspectionId || null,
                    title: values.evidenceTitle || LanguageManager.t("FoundationEvidenceInputTitle"),
                    description: values.evidenceDescription || "",
                    evidenceType: values.evidenceType || LanguageManager.t("FoundationPhotoDocument"),
                    status: "Draft"
                });
                EvidenceManager.set(evidence);

                const finding = FindingManager.create({
                    caseId: current.id,
                    buildingId: current.buildingId || null,
                    inspectionId: current.inspectionId || null,
                    evidenceIds: [evidence.id],
                    title: values.findingTitle || "Technical finding",
                    description: values.findingDescription || "",
                    category: "General",
                    severity: values.findingSeverity || "Medium",
                    status: "Open"
                });
                FindingManager.set(finding);

                EvidenceManager.set(EvidenceManager.update({
                    ...evidence,
                    findingIds: [finding.id],
                    updatedAt: new Date().toISOString()
                }));

                const severity = values.assessmentSeverity || "Medium";
                const probability = "Medium";
                const consequence = "Medium";

                const assessment = AssessmentManager.create({
                    caseId: current.id,
                    buildingId: current.buildingId || null,
                    inspectionId: current.inspectionId || null,
                    findingIds: [finding.id],
                    evidenceIds: [evidence.id],
                    title: values.assessmentTitle || "Risk assessment",
                    description: values.assessmentDescription || "",
                    category: "General",
                    severity,
                    probability,
                    consequence,
                    riskScore: AssessmentManager.calculateRiskScore(severity, probability, consequence),
                    status: "Draft"
                });
                AssessmentManager.set(assessment);

                FindingManager.set(FindingManager.update({
                    ...finding,
                    assessmentIds: [assessment.id],
                    updatedAt: new Date().toISOString()
                }));

                const recommendation = RecommendationManager.create({
                    caseId: current.id,
                    buildingId: current.buildingId || null,
                    inspectionId: current.inspectionId || null,
                    assessmentIds: [assessment.id],
                    findingIds: [finding.id],
                    title: values.recommendationTitle || "Recommended action",
                    description: values.recommendationDescription || "",
                    action: values.recommendationDescription || "",
                    priority: values.recommendationPriority || "Medium",
                    timeframe: "Planned",
                    estimatedCost: 0,
                    currency: "EUR",
                    responsible: "Owner",
                    status: "Draft"
                });
                RecommendationManager.set(recommendation);

                AssessmentManager.set(AssessmentManager.update({
                    ...assessment,
                    recommendationIds: [recommendation.id],
                    updatedAt: new Date().toISOString()
                }));

                const decision = DecisionManager.create({
                    caseId: current.id,
                    buildingId: current.buildingId || null,
                    inspectionId: current.inspectionId || null,
                    recommendationIds: [recommendation.id],
                    assessmentIds: [assessment.id],
                    findingIds: [finding.id],
                    title: values.decisionTitle || "Decision record",
                    description: values.decisionDescription || "",
                    decisionType: values.decisionType || "Monitor",
                    rationale: values.decisionDescription || "",
                    riskLevel: recommendation.priority || "Medium",
                    confidence: 70,
                    status: "Draft"
                });
                DecisionManager.set(decision);

                RecommendationManager.set(RecommendationManager.update({
                    ...recommendation,
                    decisionIds: [decision.id],
                    updatedAt: new Date().toISOString()
                }));

                const report = ReportManager.create({
                    caseId: current.id,
                    buildingId: current.buildingId || null,
                    inspectionId: current.inspectionId || null,
                    decisionIds: [decision.id],
                    recommendationIds: [recommendation.id],
                    assessmentIds: [assessment.id],
                    findingIds: [finding.id],
                    title: values.reportTitle || "Technical Due Diligence Report",
                    reportType: values.reportType || "Technical Due Diligence",
                    version: "1.0.0",
                    executiveSummary: values.reportDescription || "",
                    scope: "Workflow chain report scope.",
                    methodology: "Evidence-based workflow review.",
                    status: "Draft"
                });
                ReportManager.set(report);

                DecisionManager.set(DecisionManager.update({
                    ...decision,
                    reportIds: [report.id],
                    updatedAt: new Date().toISOString()
                }));

                CaseManager.setCurrent({
                    ...current,
                    evidenceIds: [...new Set([...(current.evidenceIds || []), evidence.id])],
                    findingIds: [...new Set([...(current.findingIds || []), finding.id])],
                    assessmentIds: [...new Set([...(current.assessmentIds || []), assessment.id])],
                    recommendationIds: [...new Set([...(current.recommendationIds || []), recommendation.id])],
                    decisionIds: [...new Set([...(current.decisionIds || []), decision.id])],
                    reportIds: [...new Set([...(current.reportIds || []), report.id])],
                    updatedAt: new Date().toISOString()
                });
                CaseManager.save();

                dialog.remove();
                this.refresh();
            }
        });
    }

    static createCase() {
        const title = window.prompt(LanguageManager.t("CaseTitlePrompt"));

        if (!title) return;

        const clientName = window.prompt(LanguageManager.t("CaseClientContextPrompt"), "") || "";
        const type = window.prompt(LanguageManager.t("CaseTypePrompt"), "Technical Property Review") || "Technical Property Review";
        const status = window.prompt(LanguageManager.t("CaseStatusPrompt"), "Draft") || "Draft";
        const buildingId = window.prompt(LanguageManager.t("CaseBuildingReferencePrompt"), "") || null;
        const inspectionId = window.prompt(LanguageManager.t("CaseInspectionReferencePrompt"), "") || null;

        CaseManager.create({
            id: "case-" + Date.now(),
            title,
            clientName,
            type,
            status,
            buildingId,
            inspectionId,
            progress: 0
        });

        this.refresh();
    }

    static openCase(caseData) {

        CaseManager.setCurrent(caseData);

        this.refresh();

    }

    static editCase(caseData) {
        FormDialog.open({
            title: LanguageManager.t("CaseEditTitle"),
            submitLabel: LanguageManager.t("CaseSaveAction"),
            values: {
                title: caseData.title || "",
                clientName: caseData.clientName || "",
                type: caseData.type || "Technical Property Review",
                status: caseData.status || "Draft",
                buildingId: caseData.buildingId || "",
                inspectionId: caseData.inspectionId || ""
            },
            fields: [
                {
                    id: "title",
                    label: LanguageManager.t("CaseTitleFieldLabel")
                },
                {
                    id: "clientName",
                    label: LanguageManager.t("CaseClientContextFieldLabel")
                },
                {
                    id: "type",
                    label: LanguageManager.t("CaseTypeLabel")
                },
                {
                    id: "status",
                    label: LanguageManager.t("CaseStatusLabel"),
                    type: "select",
                    options: ["Draft", "In Progress", "Completed", "Archived"]
                },
                {
                    id: "buildingId",
                    label: LanguageManager.t("CaseBuildingReferenceFieldLabel")
                },
                {
                    id: "inspectionId",
                    label: LanguageManager.t("CaseInspectionReferenceFieldLabel")
                }
            ],
            onSubmit: (values, dialog) => {
                if (!values.title) return;

                CaseManager.open({
                    ...caseData,
                    title: values.title,
                    clientName: values.clientName,
                    type: values.type,
                    status: values.status,
                    buildingId: values.buildingId || null,
                    inspectionId: values.inspectionId || null,
                    updatedAt: new Date().toISOString()
                });

                dialog.remove();
                this.refresh();
            }
        });
    }

    static deleteCase(caseData) {

        if (
            !window.confirm(
                `${LanguageManager.t("CaseDeleteConfirmPrefix")} "${caseData.title}"?`
            )
        ) {
            return;
        }

        CaseManager.delete(caseData.id);

        this.refresh();

    }

    static refresh() {

        const container = document.getElementById("workspace-page");

        if (!container) return;

        container.innerHTML = "";

        container.appendChild(this.render());

    }

    static formatDate(value) {

        if (!value) return "—";

        return new Date(value).toLocaleDateString();

    }

}
