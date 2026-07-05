import StorageManager from "../../core/storage/StorageManager.js";
import InspectionScopeManager from "../../core/InspectionScopeManager.js";
import EvidenceManager from "../../core/EvidenceManager.js";
import FindingManager from "../../core/FindingManager.js";
import AssessmentManager from "../../core/AssessmentManager.js";
import RecommendationManager from "../../core/RecommendationManager.js";
import DecisionManager from "../../core/DecisionManager.js";
import ReportManager from "../../core/ReportManager.js";
import DemoDatasetManager from "../../core/DemoDatasetManager.js";
import LanguageManager from "../../core/LanguageManager.js";
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
        fragment.appendChild(this.createLanguageReadinessPanel());
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

    static createLanguageReadinessPanel() {
        const panel = document.createElement("section");
        panel.className = "workflow-card settings-cleanup settings-cleanup--language";

        const currentLanguage = LanguageManager.getLanguage();
        const currentLanguageLabel = LanguageManager.getLanguageLabel(currentLanguage);
        const translationBoundary = LanguageManager.getTranslationBoundary();
        const supportedLanguages = LanguageManager.getSupportedLanguages()
            .map(item => item.label)
            .join(" · ");
        const terminology = translationBoundary.productTerms
            .slice(0, 6)
            .join(", ");

        panel.innerHTML = `
            <div class="settings-cleanup__header">
                <div>
                    <p class="eyebrow">Interface Language</p>
                    <h3>Language readiness</h3>
                    <p>The workspace is currently operated in English. German interface support is prepared for a later controlled rollout.</p>
                </div>
            </div>
            <div class="settings-cleanup__grid">
                <article>
                    <span>Current language</span>
                    <strong>${currentLanguageLabel}</strong>
                </article>
                <article>
                    <span>Supported languages</span>
                    <p>${supportedLanguages}</p>
                </article>
                <article>
                    <span>Product terminology</span>
                    <p>${terminology}</p>
                </article>
            </div>
            <div class="settings-cleanup__header">
                <div>
                    <p>Core product terms remain controlled to protect workflow consistency.</p>
                    <p>Translation boundary: core product terms are controlled; interface copy may be localized.</p>
                </div>
                <select class="button" data-action="set-language" aria-label="Interface language">
                    <option value="en" ${currentLanguage === "en" ? "selected" : ""}>English</option>
                    <option value="de" ${currentLanguage === "de" ? "selected" : ""}>Deutsch</option>
                </select>
            </div>
        `;

        panel.querySelector("[data-action='set-language']")
            .addEventListener("change", event => {
                LanguageManager.setLanguage(event.target.value);
                Notification.success("Interface language preference saved.");
                this.refresh();
            });

        return panel;
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
        const status = DemoDatasetManager.getStatus();
        const statusTone = status.isComplete
            ? "ready"
            : status.isActive
                ? "active"
                : "draft";
        const statusLabel = status.isComplete
            ? "Complete"
            : status.isActive
                ? "Incomplete"
                : "Not Created";
        const integrityLabel = status.integrity?.isValid
            ? "Workflow links valid"
            : "Workflow links incomplete";

        const integrityCount = status.integrity
            ? `${status.integrity.validLinks} of ${status.integrity.totalLinks} links valid`
            : "Integrity not checked";

        panel.innerHTML = `
            <div class="settings-cleanup__header">
                <div>
                    <p class="eyebrow">Controlled Demo Dataset</p>
                    <h3>Create a clean end-to-end demo case</h3>
                    <p>This creates one controlled demo chain from inspection scope to report. Existing workflow test data will be replaced, while cases, buildings, and inspections remain available.</p>
                </div>
                <div class="settings-demo-actions">
                    <button type="button" class="button" data-action="create-demo-dataset">
                        Rebuild Controlled Demo Dataset
                    </button>
                    <button type="button" class="button settings-cleanup__danger" data-action="reset-demo-dataset">
                        Reset Demo Workflow Data
                    </button>
                </div>
            </div>
            <div class="settings-demo-status settings-demo-status--${statusTone}">
                <div>
                    <span>Demo Dataset Status</span>
                    <strong>${statusLabel}</strong>
                    <p>${status.completeRecords} of ${status.totalRecords} controlled demo records available. ${integrityLabel} (${integrityCount}).</p>
                </div>
                <span class="settings-demo-status__score">${status.percent}%</span>
            </div>
        `;

        panel.querySelector("[data-action='create-demo-dataset']")
            .addEventListener("click", () => this.rebuildControlledDemoDataset());
        panel.querySelector("[data-action='reset-demo-dataset']")
            .addEventListener("click", () => this.resetControlledDemoDataset());

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

    static refresh() {
        const container = document.getElementById("workspace-page");

        if (!container) return;

        container.innerHTML = "";
        container.appendChild(this.render());
    }

    static rebuildControlledDemoDataset() {
        const confirmed = window.confirm(
            "Rebuild the controlled demo dataset? Existing workflow demo data will be replaced. Preserved cases, buildings, and inspections will remain available."
        );

        if (!confirmed) {
            return;
        }

        const dataset = DemoDatasetManager.rebuild();

        Notification.success("Controlled demo dataset rebuilt.");
        window.setTimeout(() => {
            window.location.hash = "reports";
            window.location.reload();
        }, 250);

        return dataset;
    }

    static createControlledDemoDataset() {
        return this.rebuildControlledDemoDataset();
    }

    static resetControlledDemoDataset() {
        const status = DemoDatasetManager.getStatus();

        if (!status.isActive) {
            Notification.info("No controlled demo dataset to reset.");
            return;
        }

        const confirmed = window.confirm(
            "Reset controlled demo workflow data? Cases, buildings, and inspections will be preserved."
        );

        if (!confirmed) {
            return;
        }

        DemoDatasetManager.reset();

        Notification.success("Controlled demo workflow data reset.");
        window.setTimeout(() => window.location.reload(), 250);
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

        DemoDatasetManager.clearWorkflowData();

        Notification.success("Workflow test data cleared.");
        window.setTimeout(() => window.location.reload(), 250);
    }
}
