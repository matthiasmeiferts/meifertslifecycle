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
        { key: "evidence", label: LanguageManager.t("FinalEvidenceLabel") },
        { key: "findings", label: LanguageManager.t("FinalFindingsLabel") },
        { key: "assessments", label: LanguageManager.t("FinalAssessmentsLabel") },
        { key: "recommendations", label: LanguageManager.t("FinalRecommendationsLabel") },
        { key: "decisions", label: LanguageManager.t("FinalDecisionsLabel") },
        { key: "reports", label: LanguageManager.t("FinalReportsLabel") }
    ];

    static preservedCollections = [
        { key: "cases", label: LanguageManager.t("FinalCasesLabel") },
        { key: "buildings", label: LanguageManager.t("FinalBuildingsLabel") },
        { key: "inspections", label: LanguageManager.t("FinalInspectionsLabel") }
    ];

    static render() {
        const fragment = document.createDocumentFragment();

        fragment.appendChild(SectionHeader.create({
            eyebrow: "Workspace Settings",
            title: "Settings",
            description: LanguageManager.t("FoundationSettingsDataDescription")
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
        const t = (key) => LanguageManager.t(key, currentLanguage);

        panel.innerHTML = `
            <div class="settings-cleanup__header">
                <div>
                    <p class="eyebrow">${t("InterfaceLanguage")}</p>
                    <h3>${t("LanguageReadiness")}</h3>
                    <p>${t("LanguageReadinessDescription")}</p>
                </div>
            </div>
            <div class="settings-cleanup__grid">
                <article>
                    <span>${t("CurrentLanguage")}</span>
                    <strong>${currentLanguageLabel}</strong>
                </article>
                <article>
                    <span>${t("SupportedLanguages")}</span>
                    <p>${supportedLanguages}</p>
                </article>
                <article>
                    <span>${t("ProductTerminology")}</span>
                    <p>${terminology}</p>
                </article>
            </div>
            <div class="settings-cleanup__header">
                <div>
                    <p>${t("CoreTermsRule")}</p>
                    <p>${t("TranslationBoundary")}</p>
                </div>
                <select class="button" data-action="set-language" aria-label="${t("InterfaceLanguage")}">
                    <option value="en" ${currentLanguage === "en" ? "selected" : ""}>English</option>
                    <option value="de" ${currentLanguage === "de" ? "selected" : ""}>Deutsch</option>
                </select>
            </div>
        `;

        panel.querySelector("[data-action='set-language']")
            .addEventListener("change", event => {
                const selectedLanguage = LanguageManager.setLanguage(event.target.value);

                window.dispatchEvent(new CustomEvent("mbi:language-changed", {
                    detail: {
                        language: selectedLanguage
                    }
                }));

                Notification.success(LanguageManager.t("InterfaceLanguageSaved", selectedLanguage));
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
                    <p>${LanguageManager.t("FoundationSettingsClearWorkflowText")}</p>
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
                    <p>${LanguageManager.t("FoundationSettingsDemoText")}</p>
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
            LanguageManager.t("FoundationSettingsRebuildConfirm")
        );

        if (!confirmed) {
            return;
        }

        const dataset = DemoDatasetManager.rebuild();

        Notification.success(LanguageManager.t("SettingsControlledDemoDatasetRebuilt"));
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
            Notification.info(LanguageManager.t("SettingsNoControlledDemoDatasetToReset"));
            return;
        }

        const confirmed = window.confirm(
            LanguageManager.t("FoundationSettingsResetConfirm")
        );

        if (!confirmed) {
            return;
        }

        DemoDatasetManager.reset();

        Notification.success(LanguageManager.t("SettingsControlledDemoWorkflowDataReset"));
        window.setTimeout(() => window.location.reload(), 250);
    }

    static clearWorkflowTestData() {
        const total = this.workflowCollections
            .reduce((sum, item) => sum + StorageManager.count(item.key), 0);

        if (!total) {
            Notification.info(LanguageManager.t("SettingsNoWorkflowTestDataToClear"));
            return;
        }

        const confirmed = window.confirm(
            `${LanguageManager.t("FoundationSettingsClearConfirmPrefix")} ${total} ${LanguageManager.t("FoundationSettingsClearConfirmSuffix")}`
        );

        if (!confirmed) {
            return;
        }

        DemoDatasetManager.clearWorkflowData();

        Notification.success(LanguageManager.t("SettingsWorkflowTestDataCleared"));
        window.setTimeout(() => window.location.reload(), 250);
    }
}
