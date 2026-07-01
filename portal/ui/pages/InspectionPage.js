import InspectionManager from "../../core/InspectionManager.js";
import SectionHeader from "../components/SectionHeader.js";
import ActionBar from "../components/ActionBar.js";
import EmptyState from "../components/EmptyState.js";
import DetailPanel from "../components/DetailPanel.js";
import Notification from "../components/Notification.js";

export default class InspectionPage {

    static render() {
        const fragment = document.createDocumentFragment();
        const inspections = InspectionManager.getAll();
        const activeInspection = InspectionManager.get();

        fragment.appendChild(this.createHeader());
        fragment.appendChild(this.createMetrics(inspections));
        fragment.appendChild(this.createToolbar());
        fragment.appendChild(this.createMainLayout(inspections, activeInspection));

        return fragment;
    }

    static createHeader() {
        return SectionHeader.create({
            eyebrow: "Inspection Workspace",
            title: "Inspections",
            description: "Plan, document, and manage technical inspections linked to buildings, cases, and evidence.",
            actions: [
                {
                    id: "new-inspection",
                    label: "+ New Inspection",
                    onClick: () => this.createSampleInspection()
                }
            ]
        });
    }

    static createMetrics(inspections = []) {
        const grid = document.createElement("section");
        grid.className = "metrics-grid";

        const draftCount = inspections.filter(inspection => inspection.status === "draft").length;
        const progressCount = inspections.filter(inspection => inspection.status === "in_progress").length;
        const completedCount = inspections.filter(inspection => inspection.status === "completed").length;

        grid.appendChild(this.createMetricCard("Inspections", inspections.length));
        grid.appendChild(this.createMetricCard("Draft", draftCount));
        grid.appendChild(this.createMetricCard("In Progress", progressCount));
        grid.appendChild(this.createMetricCard("Completed", completedCount));

        return grid;
    }

    static createMetricCard(label, value) {
        const card = document.createElement("article");
        card.className = "metric-card";

        const valueElement = document.createElement("strong");
        valueElement.textContent = value;

        const labelElement = document.createElement("span");
        labelElement.textContent = label;

        card.appendChild(valueElement);
        card.appendChild(labelElement);

        return card;
    }

    static createToolbar() {
        const wrapper = document.createElement("section");
        wrapper.className = "workflow-card";

        wrapper.appendChild(ActionBar.create([
            {
                id: "refresh",
                label: "Refresh",
                onClick: () => this.refresh()
            },
            {
                id: "inspection-template",
                label: "Inspection Template",
                onClick: () => this.createSampleInspection()
            }
        ]));

        return wrapper;
    }

    static createMainLayout(inspections = [], activeInspection = null) {
        const layout = document.createElement("section");
        layout.className = "case-workspace-layout";

        layout.appendChild(this.createContent(inspections));
        layout.appendChild(this.createDetailPanel(activeInspection));

        return layout;
    }

    static createContent(inspections = []) {
        if (!inspections.length) {
            return EmptyState.create({
                eyebrow: "Inspection Workspace",
                title: "No inspections available",
                description: "Inspection records will connect buildings, technical observations, evidence, and follow-up findings.",
                actionLabel: "+ New Inspection",
                onAction: () => this.createSampleInspection()
            });
        }

        const wrapper = document.createElement("section");
        wrapper.className = "workflow-card";

        inspections.forEach(inspection => {
            wrapper.appendChild(this.createInspectionRow(inspection));
        });

        return wrapper;
    }

    static createInspectionRow(inspection) {
        const row = document.createElement("button");
        row.type = "button";
        row.className = "task-row";
        row.addEventListener("click", () => {
            InspectionManager.set(inspection);
            this.refresh();
        });

        const content = document.createElement("div");

        const title = document.createElement("strong");
        title.textContent = inspection.title || "Technical Property Review";

        const meta = document.createElement("p");
        meta.textContent = [
            inspection.location || "Location pending",
            inspection.inspector || "Inspector pending",
            inspection.status || "draft"
        ].join(" · ");

        const badge = document.createElement("span");
        badge.className = "tag";
        badge.textContent = inspection.status || "draft";

        content.appendChild(title);
        content.appendChild(meta);
        row.appendChild(content);
        row.appendChild(badge);

        return row;
    }

    static createDetailPanel(activeInspection = null) {
        if (!activeInspection) {
            return DetailPanel.create("Inspection Context", [
                { label: "Current Inspection", value: "Not selected" },
                { label: "Inspection Status", value: "Not started" },
                { label: "Next Step", value: "Create or select an inspection" }
            ]);
        }

        return DetailPanel.create("Inspection Context", [
            { label: "Current Inspection", value: activeInspection.title || activeInspection.id },
            { label: "Inspection Status", value: activeInspection.status || "draft" },
            { label: "Building ID", value: activeInspection.buildingId || "Not linked" },
            { label: "Inspector", value: activeInspection.inspector || "Not assigned" }
        ]);
    }

    static refresh() {
        const container = document.getElementById("workspace-page");

        if (!container) return;

        container.innerHTML = "";
        container.appendChild(this.render());
    }

    static createSampleInspection() {
        const inspection = InspectionManager.create({
            buildingId: "demo-building",
            caseId: "demo-case",
            title: "Technical Property Review",
            location: "Demo Property",
            notes: "Initial inspection record created from the workspace."
        });

        Notification.success("Inspection created.");
        InspectionManager.set(inspection);
        this.refresh();
    }

    static showPendingFeature(feature = "This feature") {
        Notification.info(`${feature} will be added in the next foundation step.`);
    }

}
