import CaseManager from "../../core/CaseManager.js";
import EvidenceManager from "../../core/EvidenceManager.js";
import FindingManager from "../../core/FindingManager.js";
import AssessmentManager from "../../core/AssessmentManager.js";
import RecommendationManager from "../../core/RecommendationManager.js";
import DecisionManager from "../../core/DecisionManager.js";
import ReportManager from "../../core/ReportManager.js";
import SectionHeader from "../components/SectionHeader.js";
import SearchBar from "../components/SearchBar.js";
import ActionBar from "../components/ActionBar.js";
import WorkspaceTable from "../components/WorkspaceTable.js";
import EmptyState from "../components/EmptyState.js";
import StatusBadge from "../components/StatusBadge.js";
import FormDialog from "../components/FormDialog.js";
import DetailPanel from "../components/DetailPanel.js";
import IntelligenceEngine from "../../core/IntelligenceEngine.js";
import WorkspaceRouter from "../../router/WorkspaceRouter.js";

export default class CasePage {

    static searchQuery = "";

    static intelligenceStages = [
        {
            key: "evidence",
            label: "Evidence"
        },
        {
            key: "finding",
            label: "Finding"
        },
        {
            key: "assessment",
            label: "Assessment"
        },
        {
            key: "recommendation",
            label: "Recommendation"
        },
        {
            key: "decision",
            label: "Decision"
        },
        {
            key: "report",
            label: "Report"
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
            eyebrow: "Case Workspace",
            title: "Cases",
            description: current
                ? `Active case: ${current.title}`
                : "Create or manage Technical Property Review cases.",
            actions: [
                {
                    id: "new-case",
                    label: "+ New Case",
                    onClick: () => this.createCase()
                }
            ]
        });
    }

    static createToolbar() {
        const wrapper = document.createElement("section");
        wrapper.className = "workflow-card";

        wrapper.appendChild(
            SearchBar.create({
                placeholder: "Search cases...",
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
                    label: "Refresh",
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
                title: "No matching cases found",
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
                eyebrow: "Case Workspace",
                title: "No cases available",
                description: "Create your first case to begin the Building Intelligence workflow.",
                actionLabel: "+ New Case",
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
                            active.textContent = "Active";
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
                    label: "Type"
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
                    label: "Status",
                    value: "No active case"
                },
                {
                    label: "Next Step",
                    value: "Create or open a case"
                }
            ]);
        }

        return DetailPanel.create(current.title, [
            {
                label: "Case ID",
                value: current.id || "Not available"
            },
            {
                label: "Status",
                value: current.status || "Draft"
            },
            {
                label: "Client / Context",
                value: current.clientName || current.client || "Not specified"
            },
            {
                label: "Type",
                value: current.type || "Technical Property Review"
            },
            {
                label: "Progress",
                value: `${current.progress || 0}%`
            },
            {
                label: "Building",
                value: current.buildingId || "Not linked"
            },
            {
                label: "Inspection",
                value: current.inspectionId || "Not linked"
            },
            {
                label: "Evidence",
                value: current.evidenceIds?.length || 0
            },
            {
                label: "Findings",
                value: current.findingIds?.length || 0
            },
            {
                label: "Updated",
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
        eyebrow.textContent = "Continue Workflow";

        const title = document.createElement("strong");
        title.textContent = current
            ? "Move this case through the intelligence chain"
            : "Select a case to continue the workflow";

        const description = document.createElement("p");
        description.textContent = current
            ? "Create or review linked records from Evidence to final Report."
            : "Open a case first, then continue with evidence, findings and decision output.";

        header.appendChild(eyebrow);
        header.appendChild(title);
        header.appendChild(description);

        if (current) {
            const builderButton = document.createElement("button");
            builderButton.type = "button";
            builderButton.className = "button button--primary";
            builderButton.textContent = "Create Workflow Chain";
            builderButton.addEventListener("click", () => this.createWorkflowChainBuilder());
            header.appendChild(builderButton);

            const repairButton = document.createElement("button");
            repairButton.type = "button";
            repairButton.className = "button";
            repairButton.textContent = "Repair Workflow Links";
            repairButton.addEventListener("click", () => this.repairWorkflowLinks());
            header.appendChild(repairButton);

            const orphanButton = document.createElement("button");
            orphanButton.type = "button";
            orphanButton.className = "button";
            orphanButton.textContent = "Clean Orphan Records";
            orphanButton.addEventListener("click", () => this.cleanOrphanWorkflowRecords());
            header.appendChild(orphanButton);
        }

        const actions = document.createElement("div");
        actions.className = "case-workflow-actions__grid";

        [
            {
                label: "Evidence",
                route: "evidence",
                description: "Collect photos, documents and inspection inputs."
            },
            {
                label: "Findings",
                route: "findings",
                description: "Turn evidence into technical observations."
            },
            {
                label: "Assessments",
                route: "assessments",
                description: "Evaluate relevance, severity and lifecycle impact."
            },
            {
                label: "Recommendations",
                route: "recommendations",
                description: "Define technical and commercial next steps."
            },
            {
                label: "Decisions",
                route: "decisions",
                description: "Prepare decision-ready conclusions."
            },
            {
                label: "Reports",
                route: "reports",
                description: "Generate structured output for review."
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
            label.textContent = item.label;

            const copy = document.createElement("p");
            copy.textContent = item.description;

            button.appendChild(step);
            button.appendChild(label);
            button.appendChild(copy);

            button.onclick = () => {
                if (!current) return;
                WorkspaceRouter.navigate(item.route);
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
            ["open", "Open"],
            ["edit", "Edit"],
            ["delete", "Delete"]
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
            label: "Low risk signal",
            description: "Case risk logic is still light. More evidence and findings are needed.",
            tone: "draft"
        };

        if (downstreamSignals >= 8) {
            riskSignal = {
                label: "High risk signal",
                description: "Multiple downstream risk signals are present. Review before recommendation or decision.",
                tone: "ready"
            };
        } else if (downstreamSignals >= 4) {
            riskSignal = {
                label: "Moderate risk signal",
                description: "The case contains usable risk signals, but downstream validation may still be needed.",
                tone: "active"
            };
        }

        const firstOpenStage = this.intelligenceStages.find((stage) => counts[stage.key] === 0);

        const nextAction = firstOpenStage
            ? {
                label: `Strengthen ${firstOpenStage.label}`,
                description: `${firstOpenStage.label} data is missing for this case. Complete this stage before relying on final output.`,
                tone: "active"
            }
            : {
                label: "Review case output",
                description: "All workflow stages are represented for this case. Review consistency and final report confidence.",
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
                ? "Case workflow complete"
                : readinessPercent >= 50
                    ? "Case workflow developing"
                    : "Case workflow early"
        };
    }

    static renderCaseIntelligenceSnapshot(caseItem = {}, data = {}) {
        const intelligence = this.getCaseIntelligence(caseItem, data);

        return `
            <section class="case-intelligence intelligence-snapshot" aria-label="Case intelligence snapshot">
                <div class="case-intelligence__header intelligence-snapshot__header">
                    <div>
                        <span class="case-intelligence__eyebrow intelligence-snapshot__eyebrow">Case Intelligence</span>
                        <strong>${intelligence.label}</strong>
                        <p>${intelligence.completedStages}/${intelligence.totalStages} workflow stages represented</p>
                    </div>
                    <span class="case-intelligence__score intelligence-snapshot__score">${intelligence.confidenceScore}%</span>
                </div>

                <div class="case-intelligence__grid intelligence-snapshot__grid">
                    <article class="case-intelligence__card intelligence-snapshot__card">
                        <span>Readiness</span>
                        <strong>${intelligence.readinessPercent}%</strong>
                        <p>Workflow coverage across Evidence, Finding, Assessment, Recommendation, Decision and Report.</p>
                    </article>

                    <article class="case-intelligence__card intelligence-snapshot__card case-intelligence__card--${intelligence.riskSignal.tone} intelligence-snapshot__card--${intelligence.riskSignal.tone}">
                        <span>Risk Signal</span>
                        <strong>${intelligence.riskSignal.label}</strong>
                        <p>${intelligence.riskSignal.description}</p>
                    </article>

                    <article class="case-intelligence__card intelligence-snapshot__card case-intelligence__card--${intelligence.nextAction.tone} intelligence-snapshot__card--${intelligence.nextAction.tone}">
                        <span>Next Case Action</span>
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

        const caseData = data || {};
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
            ["Evidence", EvidenceManager],
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
            window.alert("No orphan workflow records found.");
            return;
        }

        const summary = orphanRecords
            .map(record => `${record.label}: ${record.item.title || record.item.id} (${record.item.caseId})`)
            .join("\n");

        const confirmed = window.confirm(
            `Delete ${orphanRecords.length} orphan workflow records?\n\n${summary}`
        );

        if (!confirmed) return;

        orphanRecords.forEach(record => {
            record.manager.delete(record.item.id);
        });

        window.alert(`${orphanRecords.length} orphan workflow records deleted.`);
        this.refresh();
    }

    static repairWorkflowLinks() {
        const current = CaseManager.getCurrent();

        if (!current) {
            window.alert("Open a case before repairing workflow links.");
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

        window.alert("Workflow links repaired for active case.");
        this.refresh();
    }

    static createWorkflowChainBuilder() {
        const current = CaseManager.getCurrent();

        if (!current) {
            window.alert("Open a case before creating a workflow chain.");
            return;
        }

        FormDialog.open({
            title: "Create Workflow Chain",
            submitLabel: "Create Workflow Chain",
            values: {
                evidenceTitle: "Evidence input",
                evidenceDescription: "Initial evidence record.",
                evidenceType: "Photo / Document",
                findingTitle: "Technical finding",
                findingDescription: "Finding derived from evidence.",
                findingSeverity: "Medium",
                assessmentTitle: "Risk assessment",
                assessmentDescription: "Assessment derived from finding.",
                assessmentSeverity: "Medium",
                recommendationTitle: "Recommended action",
                recommendationDescription: "Recommendation derived from assessment.",
                recommendationPriority: "Medium",
                decisionTitle: "Decision record",
                decisionDescription: "Decision derived from recommendation.",
                decisionType: "Monitor",
                reportTitle: "Technical Due Diligence Report",
                reportDescription: "Report derived from decision.",
                reportType: "Technical Due Diligence"
            },
            fields: [
                { id: "evidenceTitle", label: "Evidence title" },
                { id: "evidenceDescription", label: "Evidence description" },
                { id: "evidenceType", label: "Evidence type" },
                { id: "findingTitle", label: "Finding title" },
                { id: "findingDescription", label: "Finding description" },
                { id: "findingSeverity", label: "Finding severity" },
                { id: "assessmentTitle", label: "Assessment title" },
                { id: "assessmentDescription", label: "Assessment description" },
                { id: "assessmentSeverity", label: "Assessment severity" },
                { id: "recommendationTitle", label: "Recommendation title" },
                { id: "recommendationDescription", label: "Recommendation description" },
                { id: "recommendationPriority", label: "Recommendation priority" },
                { id: "decisionTitle", label: "Decision title" },
                { id: "decisionDescription", label: "Decision description" },
                { id: "decisionType", label: "Decision type" },
                { id: "reportTitle", label: "Report title" },
                { id: "reportDescription", label: "Report description" },
                { id: "reportType", label: "Report type" }
            ],
            onSubmit: (values, dialog) => {
                const evidence = EvidenceManager.create({
                    caseId: current.id,
                    buildingId: current.buildingId || null,
                    inspectionId: current.inspectionId || null,
                    title: values.evidenceTitle || "Evidence input",
                    description: values.evidenceDescription || "",
                    evidenceType: values.evidenceType || "Photo / Document",
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
        const title = window.prompt("Case title:");

        if (!title) return;

        const clientName = window.prompt("Client / Property context:", "") || "";
        const type = window.prompt("Case type:", "Technical Property Review") || "Technical Property Review";
        const status = window.prompt("Status:", "Draft") || "Draft";
        const buildingId = window.prompt("Building ID / reference:", "") || null;
        const inspectionId = window.prompt("Inspection ID / reference:", "") || null;

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
            title: "Edit Case",
            submitLabel: "Save Case",
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
                    label: "Case title"
                },
                {
                    id: "clientName",
                    label: "Client / Property context"
                },
                {
                    id: "type",
                    label: "Case type"
                },
                {
                    id: "status",
                    label: "Status",
                    type: "select",
                    options: ["Draft", "In Progress", "Completed", "Archived"]
                },
                {
                    id: "buildingId",
                    label: "Building ID / reference"
                },
                {
                    id: "inspectionId",
                    label: "Inspection ID / reference"
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
                `Delete case "${caseData.title}"?`
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
