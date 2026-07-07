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
import LanguageManager from "../../core/LanguageManager.js";

export default class BuildingPage {

    static searchQuery = "";

    static formatBuildingValue(value) {
        const map = {
            Draft: LanguageManager.t("BuildingStatusDraft"),
            Active: LanguageManager.t("BuildingStatusActive"),
            active: LanguageManager.t("BuildingStatusActiveLower"),
            Review: LanguageManager.t("BuildingStatusReview"),
            Archived: LanguageManager.t("BuildingStatusArchived"),
            Residential: LanguageManager.t("BuildingTypeResidential"),
            Office: LanguageManager.t("BuildingTypeOffice"),
            Retail: LanguageManager.t("BuildingTypeRetail"),
            "Mixed Use": LanguageManager.t("BuildingTypeMixedUse"),
            Industrial: LanguageManager.t("BuildingTypeIndustrial"),
            Hotel: LanguageManager.t("BuildingTypeHotel"),
            Other: LanguageManager.t("BuildingTypeOther"),
            building: LanguageManager.t("BuildingTypeBuilding")
        };

        return map[value] || value;
    }


    static intelligenceStages = [
        {
            key: "inspection",
            label: "Inspection"
        },
        {
            key: "evidence",
            label: LanguageManager.t("FinalEvidenceLabel")
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
            eyebrow: LanguageManager.t("BuildingWorkspaceTitle"),
            title: LanguageManager.t("BuildingTitlePlural"),
            description: current
                ? `${LanguageManager.t("BuildingActivePrefix")}: ${current.name}`
                : LanguageManager.t("BuildingHeaderDescription"),
            actions: [
                {
                    id: "new-building",
                    label: LanguageManager.t("BuildingNewAction"),
                    onClick: () => this.createBuilding()
                }
            ]
        });
    }

    static createToolbar() {
        const wrapper = document.createElement("section");
        wrapper.className = "workflow-card";

        wrapper.appendChild(SearchBar.create({
            placeholder: LanguageManager.t("BuildingSearchPlaceholder"),
            onSearch: value => {
                this.searchQuery = value.toLowerCase();
                this.refresh();
            }
        }));

        wrapper.appendChild(ActionBar.create([
            {
                id: "refresh",
                label: LanguageManager.t("BuildingRefreshAction"),
                onClick: () => this.refresh()
            },
            {
                id: "close-building",
                label: LanguageManager.t("BuildingCloseAction"),
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
        layout.className = "case-workspace-layout building-workspace-layout";

        const primaryColumn = document.createElement("div");
        primaryColumn.className = "workspace-primary-column";

        const secondaryColumn = document.createElement("div");
        secondaryColumn.className = "workspace-secondary-column";

        const intelligenceSnapshot = this.createBuildingIntelligenceSnapshot();
        if (intelligenceSnapshot) {
            primaryColumn.appendChild(intelligenceSnapshot);
        }

        secondaryColumn.appendChild(this.createContent());
        secondaryColumn.appendChild(this.createDetailPanel());

        layout.appendChild(primaryColumn);
        layout.appendChild(secondaryColumn);

        return layout;
    }

    static createContent() {
        const buildings = this.getFilteredBuildings();

        if (!buildings.length) {
            return EmptyState.create({
                eyebrow: LanguageManager.t("BuildingWorkspaceTitle"),
                title: LanguageManager.t("BuildingEmptyTitle"),
                description: LanguageManager.t("BuildingEmptyDescription"),
                actionLabel: LanguageManager.t("BuildingNewAction"),
                onAction: () => this.createBuilding()
            });
        }

        return WorkspaceTable.create({
            columns: [
                { key: "name", label: LanguageManager.t("BuildingColumnName") },
                { key: "address", label: LanguageManager.t("BuildingColumnAddress") },
                { key: "type", label: LanguageManager.t("BuildingColumnType"), render: row => this.formatBuildingValue(row.type || "Residential") },
                {
                    key: "status",
                    label: LanguageManager.t("BuildingColumnStatus"),
                    render: row => StatusBadge.create(this.formatBuildingValue(row.status || "Draft"), "warning")
                },
                {
                    key: "yearBuilt",
                    label: LanguageManager.t("BuildingColumnYear"),
                    render: row => row.yearBuilt || "—"
                },
                {
                    key: "updatedAt",
                    label: LanguageManager.t("BuildingColumnUpdated"),
                    render: row => this.formatDate(row.updatedAt)
                },
                {
                    key: "actions",
                    label: LanguageManager.t("BuildingColumnActions"),
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
            return DetailPanel.create(LanguageManager.t("BuildingNoSelectionTitle"), [
                { label: LanguageManager.t("BuildingColumnStatus"), value: LanguageManager.t("BuildingNoActiveBuilding") },
                { label: LanguageManager.t("BuildingNextStepLabel"), value: LanguageManager.t("BuildingCreateOrOpen") }
            ]);
        }

        return DetailPanel.create(current.name, [
            { label: LanguageManager.t("BuildingColumnStatus"), value: this.formatBuildingValue(current.status || "Draft") },
            { label: LanguageManager.t("BuildingColumnAddress"), value: current.address || "—" },
            { label: LanguageManager.t("BuildingColumnType"), value: this.formatBuildingValue(current.type || "Residential") },
            { label: LanguageManager.t("BuildingYearBuiltField"), value: current.yearBuilt || "—" },
            { label: LanguageManager.t("BuildingColumnUpdated"), value: this.formatDate(current.updatedAt) }
        ]);
    }

    static createActionButtons(row) {
        const wrapper = document.createElement("div");
        wrapper.className = "table-actions";

        [
            ["open", LanguageManager.t("BuildingOpenAction")],
            ["edit", LanguageManager.t("BuildingEditAction")],
            ["delete", LanguageManager.t("BuildingDeleteAction")]
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
            label: LanguageManager.t("BuildingLowTechnicalSignal"),
            description: LanguageManager.t("BuildingLowTechnicalSignalDescription"),
            tone: "draft"
        };

        if (technicalSignals >= 10) {
            technicalRisk = {
                label: LanguageManager.t("BuildingHighTechnicalSignal"),
                description: LanguageManager.t("BuildingHighTechnicalSignalDescription"),
                tone: "ready"
            };
        } else if (technicalSignals >= 5) {
            technicalRisk = {
                label: LanguageManager.t("BuildingModerateTechnicalSignal"),
                description: LanguageManager.t("BuildingModerateTechnicalSignalDescription"),
                tone: "active"
            };
        }

        const firstOpenStage = this.intelligenceStages.find((stage) => counts[stage.key] === 0);

        const nextAction = firstOpenStage
            ? {
                label: `${LanguageManager.t("BuildingStrengthenStagePrefix")} ${firstOpenStage.label}`,
                description: `${firstOpenStage.label} ${LanguageManager.t("BuildingMissingStageDescriptionSuffix")}`,
                tone: "active"
            }
            : {
                label: LanguageManager.t("BuildingReviewLifecycleOutput"),
                description: LanguageManager.t("BuildingReviewLifecycleOutputDescription"),
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
                ? LanguageManager.t("BuildingLifecycleComplete")
                : lifecycleReadiness >= 50
                    ? LanguageManager.t("BuildingLifecycleDeveloping")
                    : LanguageManager.t("BuildingLifecycleEarly")
        };
    }

    static renderBuildingIntelligenceSnapshot(building = {}, data = {}) {
        const intelligence = this.getBuildingIntelligence(building, data);

        return `
            <section class="building-intelligence intelligence-snapshot" aria-label="${LanguageManager.t("BuildingIntelligenceLabel")}">
                <div class="building-intelligence__header intelligence-snapshot__header">
                    <div>
                        <span class="building-intelligence__eyebrow intelligence-snapshot__eyebrow">${LanguageManager.t("BuildingIntelligenceLabel")}</span>
                        <strong>${intelligence.label}</strong>
                        <p>${intelligence.completedStages}/${intelligence.totalStages} ${LanguageManager.t("BuildingLifecycleStagesRepresented")}</p>
                    </div>
                    <span class="building-intelligence__score intelligence-snapshot__score">${intelligence.confidenceScore}%</span>
                </div>

                <div class="building-intelligence__grid intelligence-snapshot__grid">
                    <article class="building-intelligence__card intelligence-snapshot__card">
                        <span>${LanguageManager.t("BuildingLifecycleReadiness")}</span>
                        <strong>${intelligence.lifecycleReadiness}%</strong>
                        <p>${LanguageManager.t("BuildingLifecycleReadinessDescription")}</p>
                    </article>

                    <article class="building-intelligence__card intelligence-snapshot__card building-intelligence__card--${intelligence.technicalRisk.tone} intelligence-snapshot__card--${intelligence.technicalRisk.tone}">
                        <span>${LanguageManager.t("BuildingTechnicalRiskSignalLabel")}</span>
                        <strong>${intelligence.technicalRisk.label}</strong>
                        <p>${intelligence.technicalRisk.description}</p>
                    </article>

                    <article class="building-intelligence__card intelligence-snapshot__card building-intelligence__card--${intelligence.nextAction.tone} intelligence-snapshot__card--${intelligence.nextAction.tone}">
                        <span>${LanguageManager.t("BuildingNextActionLabel")}</span>
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
            title: LanguageManager.t("BuildingNewTitle"),
            fields: this.getBuildingFields(),
            values: {
                type: "Residential",
                status: "Draft"
            },
            submitLabel: LanguageManager.t("BuildingCreateAction"),
            onSubmit: (values, dialog) => {
                const name = String(values.name || "").trim();

                if (!name) {
                    Notification.warning(LanguageManager.t("BuildingNameRequired"));
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
                Notification.success(LanguageManager.t("BuildingCreatedNotification"));
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
            title: LanguageManager.t("BuildingEditTitle"),
            fields: this.getBuildingFields(),
            values: building,
            submitLabel: LanguageManager.t("BuildingSaveAction"),
            onSubmit: (values, dialog) => {
                const name = String(values.name || "").trim();

                if (!name) {
                    Notification.warning(LanguageManager.t("BuildingNameRequired"));
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
                Notification.success(LanguageManager.t("BuildingUpdatedNotification"));
                this.refresh();
            }
        });
    }

    static deleteBuilding(building) {
        if (!building) return;

        const content = document.createElement("div");
        content.className = "modal-body";

        const message = document.createElement("p");
        message.textContent = `${LanguageManager.t("BuildingDeleteConfirmPrefix")} "${building.name}"? ${LanguageManager.t("BuildingDeleteConfirmSuffix")}`;

        const footer = document.createElement("div");
        footer.className = "modal-footer";

        const cancelButton = document.createElement("button");
        cancelButton.className = "button";
        cancelButton.type = "button";
        cancelButton.textContent = LanguageManager.t("BuildingCancelAction");

        const deleteButton = document.createElement("button");
        deleteButton.className = "button";
        deleteButton.type = "button";
        deleteButton.textContent = LanguageManager.t("BuildingDeleteAction");

        footer.appendChild(cancelButton);
        footer.appendChild(deleteButton);
        content.appendChild(message);
        content.appendChild(footer);

        const dialog = ModalDialog.create(LanguageManager.t("BuildingDeleteTitle"), content);
        document.body.appendChild(dialog);

        cancelButton.addEventListener("click", () => dialog.remove());

        deleteButton.addEventListener("click", () => {
            BuildingManager.delete(building.id);
            dialog.remove();
            Notification.success(LanguageManager.t("BuildingDeletedNotification"));
            this.refresh();
        });
    }

    static getBuildingFields() {
        return [
            {
                id: "name",
                label: LanguageManager.t("BuildingNameField"),
                type: "text",
                placeholder: LanguageManager.t("BuildingNamePlaceholder")
            },
            {
                id: "address",
                label: LanguageManager.t("BuildingAddressField"),
                type: "text",
                placeholder: LanguageManager.t("BuildingAddressPlaceholder")
            },
            {
                id: "type",
                label: LanguageManager.t("BuildingTypeField"),
                type: "select",
                options: [
                    { value: "Residential", label: LanguageManager.t("BuildingTypeResidential") },
                    { value: "Office", label: LanguageManager.t("BuildingTypeOffice") },
                    { value: "Retail", label: LanguageManager.t("BuildingTypeRetail") },
                    { value: "Mixed Use", label: LanguageManager.t("BuildingTypeMixedUse") },
                    { value: "Industrial", label: LanguageManager.t("BuildingTypeIndustrial") },
                    { value: "Hotel", label: LanguageManager.t("BuildingTypeHotel") },
                    { value: "Other", label: LanguageManager.t("BuildingTypeOther") }
                ]
            },
            {
                id: "yearBuilt",
                label: LanguageManager.t("BuildingYearBuiltField"),
                type: "text",
                placeholder: LanguageManager.t("BuildingYearBuiltPlaceholder")
            },
            {
                id: "status",
                label: LanguageManager.t("BuildingColumnStatus"),
                type: "select",
                options: [
                    { value: "Draft", label: LanguageManager.t("BuildingStatusDraft") },
                    { value: "Active", label: LanguageManager.t("BuildingStatusActive") },
                    { value: "Review", label: LanguageManager.t("BuildingStatusReview") },
                    { value: "Archived", label: LanguageManager.t("BuildingStatusArchived") }
                ]
            }
        ];
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