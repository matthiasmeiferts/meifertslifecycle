import StorageManager from "../../core/storage/StorageManager.js";
import InspectionScopeManager from "../../core/InspectionScopeManager.js";
import EvidenceManager from "../../core/EvidenceManager.js";
import FindingManager from "../../core/FindingManager.js";
import AssessmentManager from "../../core/AssessmentManager.js";
import RecommendationManager from "../../core/RecommendationManager.js";
import DecisionManager from "../../core/DecisionManager.js";
import ReportManager from "../../core/ReportManager.js";
import DemoDatasetManager from "../../core/DemoDatasetManager.js";
import SectionHeader from "../components/SectionHeader.js";
import MetricCard from "../components/MetricCard.js";
import Notification from "../components/Notification.js";

export default class SettingsPage {

    static workflowCollections = [
        { key: "inspectionScopes", label: "Inspection Scopes" },
        { key: "evidence", label: "Evidence" },
        { key: "findings", label: "Findings" },
        { key: "assessments", label: "Assessments" },
        { key: "recommendations", label: "Recommendations" },
        { key: "decisions", label: "Decisions" },
        { key: "reports", label: "Reports" }
    ];

    static preservedCollections = [
        { key: "cases", label: "Cases" },
        { key: "buildings", label: "Buildings" },
        { key: "inspections", label: "Inspections" }
    ];

    static render() {
        const fragment = document.createDocumentFragment();

        fragment.appendChild(SectionHeader.create({
            eyebrow: "Workspace Settings",
            title: "Settings",
            description: "Control local workspace data without deleting the active case, building, or inspection context."
        }));

        fragment.appendChild(this.createMetrics());
        fragment.appendChild(this.createCleanupPanel());
        fragment.appendChild(this.createDemoDatasetPanel());
        fragment.appendChild(this.createPreservedPanel());

        return fragment;
    }

    static createMetrics() {
        const grid = document.createElement("section");
        grid.className = "metrics-grid";

        const workflowCount = this.workflowCollections
            .reduce((sum, item) => sum + StorageManager.count(item.key), 0);

        const preservedCount = this.preservedCollections
            .reduce((sum, item) => sum + StorageManager.count(item.key), 0);

        grid.appendChild(MetricCard.create("Workflow Records", workflowCount));
        grid.appendChild(MetricCard.create("Preserved Records", preservedCount));
        grid.appendChild(MetricCard.create("Reset Scope", this.workflowCollections.length));
        grid.appendChild(MetricCard.create("Storage Mode", "Local"));

        return grid;
    }

    static createCleanupPanel() {
        const panel = document.createElement("section");
        panel.className = "workflow-card settings-cleanup";

        const counts = this.workflowCollections.map(item => ({
            ...item,
            count: StorageManager.count(item.key)
        }));

        panel.innerHTML = `
            <div class="settings-cleanup__header">
                <div>
                    <p class="eyebrow">Workflow Test Data</p>
                    <h3>Clear generated workflow records</h3>
                    <p>This removes generated inspection scope, evidence, findings, assessments, recommendations, decisions, and reports. Cases, buildings, and inspections stay available.</p>
                </div>
                <button type="button" class="button settings-cleanup__danger" data-action="clear-workflow">
                    Clear Workflow Test Data
                </button>
            </div>
            <div class="settings-cleanup__grid">
                ${counts.map(item => `
                    <article>
                        <span>${item.label}</span>
                        <strong>${item.count}</strong>
                    </article>
                `).join("")}
            </div>
        `;

        panel.querySelector("[data-action='clear-workflow']")
            .addEventListener("click", () => this.clearWorkflowTestData());

        return panel;
    }

    static createDemoDatasetPanel() {
        const panel = document.createElement("section");
        panel.className = "workflow-card settings-cleanup settings-cleanup--demo";

        panel.innerHTML = `
            <div class="settings-cleanup__header">
                <div>
                    <p class="eyebrow">Controlled Demo Dataset</p>
                    <h3>Create a clean end-to-end demo case</h3>
                    <p>This creates one controlled demo chain from inspection scope to report. Existing workflow test data will be replaced, while cases, buildings, and inspections remain available.</p>
                </div>
                <button type="button" class="button" data-action="create-demo-dataset">
                    Create Controlled Demo Dataset
                </button>
            </div>
        `;

        panel.querySelector("[data-action='create-demo-dataset']")
            .addEventListener("click", () => this.createControlledDemoDataset());

        return panel;
    }

    static createPreservedPanel() {
        const panel = document.createElement("section");
        panel.className = "workflow-card settings-cleanup settings-cleanup--preserved";

        const counts = this.preservedCollections.map(item => ({
            ...item,
            count: StorageManager.count(item.key)
        }));

        panel.innerHTML = `
            <div class="settings-cleanup__header">
                <div>
                    <p class="eyebrow">Preserved Context</p>
                    <h3>Kept during workflow cleanup</h3>
                    <p>These records are intentionally preserved so the active working context remains stable.</p>
                </div>
            </div>
            <div class="settings-cleanup__grid">
                ${counts.map(item => `
                    <article>
                        <span>${item.label}</span>
                        <strong>${item.count}</strong>
                    </article>
                `).join("")}
            </div>
        `;

        return panel;
    }

    static createControlledDemoDataset() {
        const confirmed = window.confirm(
            "Create a controlled demo dataset? Existing workflow test data will be replaced. Cases, buildings, and inspections will be preserved."
        );

        if (!confirmed) {
            return;
        }

        const dataset = DemoDatasetManager.create();

        Notification.success("Controlled demo dataset created.");
        window.setTimeout(() => {
            window.location.hash = "reports";
            window.location.reload();
        }, 250);

        return dataset;
    }

    static clearWorkflowTestData() {
        const total = this.workflowCollections
            .reduce((sum, item) => sum + StorageManager.count(item.key), 0);

        if (!total) {
            Notification.info("No workflow test data to clear.");
            return;
        }

        const confirmed = window.confirm(
            `Clear ${total} workflow records? Cases, buildings, and inspections will be preserved.`
        );

        if (!confirmed) {
            return;
        }

        this.workflowCollections.forEach(item => {
            StorageManager.clear(item.key);
        });

        InspectionScopeManager.clear();
        EvidenceManager.clear();
        FindingManager.clear();
        AssessmentManager.clear();
        RecommendationManager.clear();
        DecisionManager.clear();
        ReportManager.clear();

        Notification.success("Workflow test data cleared.");
        window.setTimeout(() => window.location.reload(), 250);
    }
}
