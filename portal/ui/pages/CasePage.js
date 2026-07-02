import CaseManager from "../../core/CaseManager.js";
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
                        wrapper.className = "case-title-cell";

                        const title = document.createElement("strong");
                        title.textContent = row.title || "Untitled case";

                        const meta = document.createElement("div");
                        meta.className = "case-title-meta";
                        meta.appendChild(StatusBadge.create(row.status || "Draft", "warning"));

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