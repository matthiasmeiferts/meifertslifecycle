import BuildingManager from "../../core/BuildingManager.js";
import SectionHeader from "../components/SectionHeader.js";
import SearchBar from "../components/SearchBar.js";
import ActionBar from "../components/ActionBar.js";
import WorkspaceTable from "../components/WorkspaceTable.js";
import EmptyState from "../components/EmptyState.js";
import DetailPanel from "../components/DetailPanel.js";
import StatusBadge from "../components/StatusBadge.js";
import FormDialog from "../components/FormDialog.js";
import ModalDialog from "../components/ModalDialog.js";
import Notification from "../components/Notification.js";
import IntelligenceEngine from "../../core/IntelligenceEngine.js";

export default class BuildingPage {

    static searchQuery = "";

    static intelligenceStages = [
        {
            key: "inspection",
            label: "Inspection"
        },
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
        fragment.appendChild(this.createToolbar());
        fragment.appendChild(this.createMainLayout());

        setTimeout(() => this.bindActions(), 0);

        return fragment;
    }

    static createHeader() {
        const current = BuildingManager.get();

        return SectionHeader.create({
            eyebrow: "Building Workspace",
            title: "Buildings",
            description: current
                ? `Active building: ${current.name}`
                : "Create and manage building master data.",
            actions: [
                {
                    id: "new-building",
                    label: "+ New Building",
                    onClick: () => this.createBuilding()
                }
            ]
        });
    }

    static createToolbar() {
        const wrapper = document.createElement("section");
        wrapper.className = "workflow-card";

        wrapper.appendChild(SearchBar.create({
            placeholder: "Search buildings...",
            onSearch: value => {
                this.searchQuery = value.toLowerCase();
                this.refresh();
            }
        }));

        wrapper.appendChild(ActionBar.create([
            {
                id: "refresh",
                label: "Refresh",
                onClick: () => this.refresh()
            },
            {
                id: "close-building",
                label: "Close Building",
                onClick: () => {
                    BuildingManager.clear();
                    this.refresh();
                }
            }
        ]));

        return wrapper;
    }

    static createMainLayout() {
        const layout = document.createElement("section");
        layout.className = "case-workspace-layout";

        const intelligenceSnapshot = this.createBuildingIntelligenceSnapshot();
        if (intelligenceSnapshot) {
            layout.appendChild(intelligenceSnapshot);
        }

        layout.appendChild(this.createContent());
        layout.appendChild(this.createDetailPanel());

        return layout;
    }

    static createContent() {
        const buildings = this.getFilteredBuildings();

        if (!buildings.length) {
            return EmptyState.create({
                eyebrow: "Building Workspace",
                title: "No buildings available",
                description: "Create your first building to begin building intelligence mapping.",
                actionLabel: "+ New Building",
                onAction: () => this.createBuilding()
            });
        }

        return WorkspaceTable.create({
            columns: [
                { key: "name", label: "Building" },
                { key: "address", label: "Address" },
                { key: "type", label: "Type" },
                {
                    key: "status",
                    label: "Status",
                    render: row => StatusBadge.create(row.status || "Draft", "warning")
                },
                {
                    key: "yearBuilt",
                    label: "Year",
                    render: row => row.yearBuilt || "—"
                },
                {
                    key: "updatedAt",
                    label: "Updated",
                    render: row => this.formatDate(row.updatedAt)
                },
                {
                    key: "actions",
                    label: "Actions",
                    render: row => this.createActionButtons(row)
                }
            ],
            rows: buildings,
            onRowClick: row => this.openBuilding(row)
        });
    }

    static createDetailPanel() {
        const current = BuildingManager.get();

        if (!current) {
            return DetailPanel.create("No Building Selected", [
                { label: "Status", value: "No active building" },
                { label: "Next Step", value: "Create or open a building" }
            ]);
        }

        return DetailPanel.create(current.name, [
            { label: "Status", value: current.status || "Draft" },
            { label: "Address", value: current.address || "—" },
            { label: "Type", value: current.type || "Residential" },
            { label: "Year Built", value: current.yearBuilt || "—" },
            { label: "Updated", value: this.formatDate(current.updatedAt) }
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

            button.dataset.buildingAction = action;
            button.dataset.id = row.id;

            button.setAttribute("data-stop-row-click", "true");

            wrapper.appendChild(button);
        });

        return wrapper;
    }

    static getBuildingIntelligence(building = {}, data = {}) {
        const buildingId = building.id || building.buildingId;

        const filterByBuilding = (items = []) => {
            if (!Array.isArray(items)) {
                return [];
            }

            if (!buildingId) {
                return items;
            }

            return items.filter((item) =>
                item.buildingId === buildingId ||
                item.linkedBuildingId === buildingId ||
                item.building === buildingId
            );
        };

        const inspections = filterByBuilding(data.inspections || []);
        const evidence = filterByBuilding(data.evidence || data.evidences || []);
        const findings = filterByBuilding(data.findings || []);
        const assessments = filterByBuilding(data.assessments || []);
        const recommendations = filterByBuilding(data.recommendations || []);
        const decisions = filterByBuilding(data.decisions || []);
        const reports = filterByBuilding(data.reports || []);

        const counts = {
            inspection: inspections.length,
            evidence: evidence.length,
            finding: findings.length,
            assessment: assessments.length,
            recommendation: recommendations.length,
            decision: decisions.length,
            report: reports.length
        };

        const stageKeys = this.intelligenceStages.map((stage) => stage.key);
        const readiness = IntelligenceEngine.getStageReadiness(counts, stageKeys);
        const lifecycleReadiness = readiness.percent;
        const completedStages = readiness.completedStages;
        const totalStages = readiness.totalStages;

        const technicalSignals =
            counts.inspection +
            counts.evidence +
            counts.finding +
            counts.assessment;

        const downstreamSignals =
            counts.recommendation +
            counts.decision +
            counts.report;

        const confidenceScore = IntelligenceEngine.getConfidenceScore({
            readinessPercent: lifecycleReadiness,
            primarySignals: technicalSignals,
            downstreamSignals,
            outputSignals: counts.report,
            weights: {
                readiness: 0.58,
                primary: 3,
                downstream: 2,
                output: 2
            }
        });

        let technicalRisk = {
            label: "Low technical signal",
            description: "Building risk logic is still light. More inspection evidence and findings are needed.",
            tone: "draft"
        };

        if (technicalSignals >= 10) {
            technicalRisk = {
                label: "High technical signal",
                description: "Multiple technical signals are present. Review lifecycle impact before recommendation or decision.",
                tone: "ready"
            };
        } else if (technicalSignals >= 5) {
            technicalRisk = {
                label: "Moderate technical signal",
                description: "The building contains usable technical signals, but validation may still be needed.",
                tone: "active"
            };
        }

        const firstOpenStage = this.intelligenceStages.find((stage) => counts[stage.key] === 0);

        const nextAction = firstOpenStage
            ? {
                label: `Strengthen ${firstOpenStage.label}`,
                description: `${firstOpenStage.label} data is missing for this building. Complete this stage before relying on final lifecycle output.`,
                tone: "active"
            }
            : {
                label: "Review building lifecycle output",
                description: "All building intelligence stages are represented. Review consistency and final decision confidence.",
                tone: "ready"
            };

        return {
            counts,
            completedStages,
            totalStages,
            lifecycleReadiness,
            confidenceScore,
            technicalRisk,
            nextAction,
            label: lifecycleReadiness >= 100
                ? "Building lifecycle complete"
                : lifecycleReadiness >= 50
                    ? "Building lifecycle developing"
                    : "Building lifecycle early"
        };
    }

    static renderBuildingIntelligenceSnapshot(building = {}, data = {}) {
        const intelligence = this.getBuildingIntelligence(building, data);

        return `
            <section class="building-intelligence intelligence-snapshot" aria-label="Building intelligence snapshot">
                <div class="building-intelligence__header intelligence-snapshot__header">
                    <div>
                        <span class="building-intelligence__eyebrow intelligence-snapshot__eyebrow">Building Intelligence</span>
                        <strong>${intelligence.label}</strong>
                        <p>${intelligence.completedStages}/${intelligence.totalStages} lifecycle stages represented</p>
                    </div>
                    <span class="building-intelligence__score intelligence-snapshot__score">${intelligence.confidenceScore}%</span>
                </div>

                <div class="building-intelligence__grid intelligence-snapshot__grid">
                    <article class="building-intelligence__card intelligence-snapshot__card">
                        <span>Lifecycle Readiness</span>
                        <strong>${intelligence.lifecycleReadiness}%</strong>
                        <p>Coverage across Inspection, Evidence, Finding, Assessment, Recommendation, Decision and Report.</p>
                    </article>

                    <article class="building-intelligence__card intelligence-snapshot__card building-intelligence__card--${intelligence.technicalRisk.tone} intelligence-snapshot__card--${intelligence.technicalRisk.tone}">
                        <span>Technical Risk Signal</span>
                        <strong>${intelligence.technicalRisk.label}</strong>
                        <p>${intelligence.technicalRisk.description}</p>
                    </article>

                    <article class="building-intelligence__card intelligence-snapshot__card building-intelligence__card--${intelligence.nextAction.tone} intelligence-snapshot__card--${intelligence.nextAction.tone}">
                        <span>Next Building Action</span>
                        <strong>${intelligence.nextAction.label}</strong>
                        <p>${intelligence.nextAction.description}</p>
                    </article>
                </div>
            </section>
        `;
    }

    static createBuildingIntelligenceSnapshot(building = null, data = null) {
        const currentBuilding = building || BuildingManager.get();

        if (!currentBuilding) {
            return null;
        }

        const buildingData = data || {};
        const container = document.createElement("section");
        container.innerHTML = this.renderBuildingIntelligenceSnapshot(currentBuilding, buildingData);
        return container;
    }

    static bindActions() {
        document.querySelectorAll("[data-building-action]").forEach(button => {
            button.addEventListener("click", event => {
                event.stopPropagation();

                const action = button.dataset.buildingAction;
                const id = button.dataset.id;
                const item = BuildingManager.load(id);

                if (!item) return;

                if (action === "open") this.openBuilding(item);
                if (action === "edit") this.editBuilding(item);
                if (action === "delete") this.deleteBuilding(item);
            });
        });
    }

    static getFilteredBuildings() {
        const buildings = BuildingManager.getAll();

        if (!this.searchQuery) return buildings;

        return buildings.filter(item => {
            const text = `
                ${item.name || ""}
                ${item.address || ""}
                ${item.type || ""}
                ${item.status || ""}
            `.toLowerCase();

            return text.includes(this.searchQuery);
        });
    }

    static createBuilding() {
        FormDialog.open({
            title: "New Building",
            fields: this.getBuildingFields(),
            values: {
                type: "Residential",
                status: "Draft"
            },
            submitLabel: "Create Building",
            onSubmit: (values, dialog) => {
                const name = String(values.name || "").trim();

                if (!name) {
                    Notification.warning("Building name is required.");
                    return;
                }

                const building = BuildingManager.create({
                    name,
                    address: String(values.address || "").trim(),
                    type: values.type || "Residential",
                    yearBuilt: String(values.yearBuilt || "").trim(),
                    status: values.status || "Draft"
                });

                if (building && building.id) {
                    BuildingManager.set(building);
                }

                dialog.remove();
                Notification.success("Building created.");
                this.refresh();
            }
        });
    }

    static openBuilding(building) {
        BuildingManager.set(building);
        this.refresh();
    }

    static editBuilding(building) {
        if (!building) return;

        FormDialog.open({
            title: "Edit Building",
            fields: this.getBuildingFields(),
            values: building,
            submitLabel: "Save Building",
            onSubmit: (values, dialog) => {
                const name = String(values.name || "").trim();

                if (!name) {
                    Notification.warning("Building name is required.");
                    return;
                }

                BuildingManager.update({
                    ...building,
                    name,
                    address: String(values.address || "").trim(),
                    type: values.type || "Residential",
                    yearBuilt: String(values.yearBuilt || "").trim(),
                    status: values.status || building.status || "Draft"
                });

                dialog.remove();
                Notification.success("Building updated.");
                this.refresh();
            }
        });
    }

    static deleteBuilding(building) {
        if (!building) return;

        const content = document.createElement("div");
        content.className = "modal-body";

        const message = document.createElement("p");
        message.textContent = `Delete building "${building.name}"? This action cannot be undone.`;

        const footer = document.createElement("div");
        footer.className = "modal-footer";

        const cancelButton = document.createElement("button");
        cancelButton.className = "button";
        cancelButton.type = "button";
        cancelButton.textContent = "Cancel";

        const deleteButton = document.createElement("button");
        deleteButton.className = "button";
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";

        footer.appendChild(cancelButton);
        footer.appendChild(deleteButton);
        content.appendChild(message);
        content.appendChild(footer);

        const dialog = ModalDialog.create("Delete Building", content);
        document.body.appendChild(dialog);

        cancelButton.addEventListener("click", () => dialog.remove());

        deleteButton.addEventListener("click", () => {
            BuildingManager.delete(building.id);
            dialog.remove();
            Notification.success("Building deleted.");
            this.refresh();
        });
    }

    static getBuildingFields() {
        return [
            {
                id: "name",
                label: "Building Name",
                type: "text",
                placeholder: "Building name"
            },
            {
                id: "address",
                label: "Address",
                type: "text",
                placeholder: "Street, city, country"
            },
            {
                id: "type",
                label: "Building Type",
                type: "select",
                options: ["Residential", "Office", "Retail", "Mixed Use", "Industrial", "Hotel", "Other"]
            },
            {
                id: "yearBuilt",
                label: "Year Built",
                type: "text",
                placeholder: "e.g. 1920"
            },
            {
                id: "status",
                label: "Status",
                type: "select",
                options: ["Draft", "Active", "Review", "Archived"]
            }
        ];
    }

    static formatDate(value) {
        if (!value) return "—";

        return new Date(value).toLocaleDateString();
    }

}