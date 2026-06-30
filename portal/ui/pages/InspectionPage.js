import SectionHeader from "../components/SectionHeader.js";
import ActionBar from "../components/ActionBar.js";
import EmptyState from "../components/EmptyState.js";
import DetailPanel from "../components/DetailPanel.js";
import Notification from "../components/Notification.js";

export default class InspectionPage {

    static render() {
        const fragment = document.createDocumentFragment();

        fragment.appendChild(this.createHeader());
        fragment.appendChild(this.createToolbar());
        fragment.appendChild(this.createMainLayout());

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
                    onClick: () => this.showPendingFeature("Inspection creation")
                }
            ]
        });
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
                onClick: () => this.showPendingFeature("Inspection templates")
            }
        ]));

        return wrapper;
    }

    static createMainLayout() {
        const layout = document.createElement("section");
        layout.className = "case-workspace-layout";

        layout.appendChild(this.createContent());
        layout.appendChild(this.createDetailPanel());

        return layout;
    }

    static createContent() {
        return EmptyState.create({
            eyebrow: "Inspection Workspace",
            title: "No inspections available",
            description: "Inspection records will connect buildings, technical observations, evidence, and follow-up findings.",
            actionLabel: "+ New Inspection",
            onAction: () => this.showPendingFeature("Inspection creation")
        });
    }

    static createDetailPanel() {
        return DetailPanel.create("Inspection Context", [
            { label: "Current Building", value: "Not selected" },
            { label: "Inspection Status", value: "Not started" },
            { label: "Next Step", value: "Create an inspection data manager" }
        ]);
    }

    static refresh() {
        const container = document.getElementById("workspace-page");

        if (!container) return;

        container.innerHTML = "";
        container.appendChild(this.render());
    }

    static showPendingFeature(feature = "This feature") {
        Notification.info(`${feature} will be added in the next foundation step.`);
    }

}