import InspectionManager from "../../core/InspectionManager.js";
import EvidenceManager from "../../core/EvidenceManager.js";
import CaseManager from "../../core/CaseManager.js";
import BuildingManager from "../../core/BuildingManager.js";
import InspectionScopeManager from "../../core/InspectionScopeManager.js";
import InspectionQuestionCatalog from "../../core/InspectionQuestionCatalog.js";
import InspectionQuestionEngine from "../../core/InspectionQuestionEngine.js";
import ExpertIntelligenceRuntimeManager from "../../core/ExpertIntelligenceRuntimeManager.js";
import HumanReviewRuntimeManager from "../../core/HumanReviewRuntimeManager.js";
import WorkflowContextBanner from "../components/WorkflowContextBanner.js";
import SectionHeader from "../components/SectionHeader.js";
import ActionBar from "../components/ActionBar.js";
import EmptyState from "../components/EmptyState.js";
import DetailPanel from "../components/DetailPanel.js";
import Notification from "../components/Notification.js";
import IntelligenceEngine from "../../core/IntelligenceEngine.js";
import LanguageManager from "../../core/LanguageManager.js";

export default class InspectionPage {

    static profileStorageKey = "mbi:inspectionProfile";

    static expertIntelligenceAuditItemLimit = 20;

    static getInspectionProfile() {
        return localStorage.getItem(this.profileStorageKey) || "default";
    }

    static setInspectionProfile(profile = "default") {
        const normalized = profile === "pattaya" ? "pattaya" : "default";
        localStorage.setItem(this.profileStorageKey, normalized);
        return normalized;
    }

    static getCatalogOptions() {
        const profile = this.getInspectionProfile();

        if (profile === "pattaya") {
            return {
                profile: "pattaya",
                country: "TH",
                region: "Pattaya / Chonburi"
            };
        }

        return {};
    }

    static getEffectiveCatalogOptions(activeScope = null) {
        const selectedProfile = this.getInspectionProfile();

        if (selectedProfile === "pattaya" || activeScope?.profile === "pattaya") {
            return {
                profile: "pattaya",
                country: "TH",
                region: "Pattaya / Chonburi"
            };
        }

        return {};
    }

    static isScopeCatalogMismatch(activeScope = null, catalogOptions = {}) {
        if (!activeScope || !Array.isArray(activeScope.questions)) {
            return false;
        }

        const selectedProfile = this.getInspectionProfile();
        const isPattaya = selectedProfile === "pattaya" || catalogOptions.profile === "pattaya" || activeScope.profile === "pattaya";
        const hasPattayaQuestions = activeScope.questions.some(question =>
            String(question.id || "").startsWith("TH-PATTAYA-")
        );

        const hasDefaultQuestions = activeScope.questions.some(question =>
            ["SCOPE-", "ROOF-", "FACADE-", "BASEMENT-", "ELECTRICAL-", "FIRE-", "DOCUMENTS-", "CAPEX-"]
                .some(prefix => String(question.id || "").startsWith(prefix))
        );

        return isPattaya && (!hasPattayaQuestions || hasDefaultQuestions);
    }

    static getEffectiveScopeQuestions(activeScope = null, catalogOptions = {}) {
        if (!activeScope) {
            return InspectionQuestionCatalog.getStarterScopeQuestions(catalogOptions);
        }

        if (this.isScopeCatalogMismatch(activeScope, catalogOptions)) {
            const scopeData = InspectionQuestionCatalog.createStarterScopeData(catalogOptions);
            const resyncedScope = InspectionScopeManager.update({
                ...activeScope,
                ...scopeData,
                profile: catalogOptions.profile || activeScope.profile || "default",
                country: catalogOptions.country || activeScope.country || null,
                region: catalogOptions.region || activeScope.region || null,
                answers: {},
                evidenceRequirements: [],
                riskFlags: [],
                limitations: [],
                status: "Draft"
            });

            InspectionScopeManager.set(resyncedScope || {
                ...activeScope,
                ...scopeData,
                profile: catalogOptions.profile || activeScope.profile || "default",
                country: catalogOptions.country || activeScope.country || null,
                region: catalogOptions.region || activeScope.region || null,
                answers: {},
                evidenceRequirements: [],
                riskFlags: [],
                limitations: [],
                status: "Draft"
            });

            return scopeData.questions;
        }

        return activeScope.questions || InspectionQuestionCatalog.getStarterScopeQuestions(catalogOptions);
    }

    static getModuleSummaries(questions = []) {
        const grouped = new Map();

        questions.forEach(question => {
            const moduleId = question.module || "Inspection";
            const current = grouped.get(moduleId) || {
                id: moduleId,
                label: moduleId,
                riskCategory: question.riskCategory || question.category || "Technical Review",
                count: 0
            };

            current.count += 1;
            grouped.set(moduleId, current);
        });

        return [...grouped.values()];
    }

    static createInspectionProfileControl(activeScope = null) {
        const currentProfile = this.getInspectionProfile();

        const panel = document.createElement("div");
        panel.className = "inspection-scope-editorial__profile";
        panel.style.cssText = [
            "display:block",
            "margin-top:16px",
            "padding:16px",
            "border:1px solid rgba(184,153,104,0.55)",
            "border-radius:14px",
            "background:#f3eee2",
            "color:#1b2b45",
            "max-width:420px",
            "box-shadow:0 10px 28px rgba(27,43,69,0.12)"
        ].join(";");
        panel.innerHTML = `
            <span>${LanguageManager.t("InspectionProfileLabel")}</span>
            <select aria-label="${LanguageManager.t("InspectionProfileAriaLabel")}" style="display:block;width:100%;margin-top:8px;padding:10px;border-radius:10px;border:1px solid rgba(27,43,69,0.25);background:white;color:#1b2b45;">
                <option value="default"${currentProfile === "default" ? " selected" : ""}>${LanguageManager.t("InspectionDefaultGermanyProfileLabel")}</option>
                <option value="pattaya"${currentProfile === "pattaya" ? " selected" : ""}>${LanguageManager.t("InspectionThailandPattayaProfileLabel")}</option>
            </select>
            <p>${currentProfile === "pattaya"
                ? LanguageManager.t("InspectionThailandProfileActive")
                : LanguageManager.t("InspectionDefaultStarterCatalogActive")}</p>
        `;

        const select = panel.querySelector("select");

        select.addEventListener("change", event => {
            const selectedProfile = this.setInspectionProfile(event.target.value);
            const catalogOptions = this.getCatalogOptions();

            if (activeScope) {
                const scopeData = InspectionQuestionCatalog.createStarterScopeData(catalogOptions);
                const updatedScope = InspectionScopeManager.update({
                    ...activeScope,
                    ...scopeData,
                    profile: selectedProfile,
                    country: catalogOptions.country || null,
                    region: catalogOptions.region || null,
                    answers: {},
                    status: "Draft"
                });

                InspectionScopeManager.set(updatedScope || {
                    ...activeScope,
                    ...scopeData,
                    profile: selectedProfile,
                    country: catalogOptions.country || null,
                    region: catalogOptions.region || null,
                    answers: {},
                    status: "Draft"
                });

                Notification.info(LanguageManager.t("InspectionProfileChangedScopeReset"));
                this.refresh();
                return;
            }

            Notification.info(LanguageManager.t("InspectionProfileUpdated"));
            this.refresh();
        });

        return panel;
    }

    static getInspectionIntelligence(inspection = {}, data = {}) {
        const inspectionId = inspection.id || inspection.inspectionId;
        const buildingId = inspection.buildingId || inspection.linkedBuildingId;

        const filterByInspection = (items = []) => {
            if (!Array.isArray(items)) {
                return [];
            }

            if (!inspectionId && !buildingId) {
                return items;
            }

            return items.filter((item) =>
                item.inspectionId === inspectionId ||
                item.linkedInspectionId === inspectionId ||
                item.inspection === inspectionId ||
                item.buildingId === buildingId ||
                item.linkedBuildingId === buildingId
            );
        };

        const evidence = filterByInspection(data.evidence || data.evidences || []);
        const findings = filterByInspection(data.findings || []);
        const assessments = filterByInspection(data.assessments || []);

        const counts = {
            inspection: inspectionId || inspection.title || inspection.name ? 1 : 0,
            evidence: evidence.length,
            finding: findings.length,
            assessment: assessments.length
        };

        const stageKeys = this.intelligenceStages.map((stage) => stage.key);
        const readiness = IntelligenceEngine.getStageReadiness(counts, stageKeys);
        const evidenceCoverage = readiness.percent;
        const completedStages = readiness.completedStages;
        const totalStages = readiness.totalStages;

        const technicalSignals =
            counts.evidence +
            counts.finding +
            counts.assessment;

        const confidenceScore = IntelligenceEngine.getConfidenceScore({
            readinessPercent: evidenceCoverage,
            primarySignals: counts.evidence,
            downstreamSignals: counts.finding + counts.assessment,
            outputSignals: 0,
            weights: {
                readiness: 0.65,
                primary: 4,
                downstream: 3,
                output: 0
            }
        });

        let signalDensity = {
            label: LanguageManager.t("InspectionLowSignalDensityLabel"),
            description: LanguageManager.t("InspectionLowSignalDensityDescription"),
            tone: "draft"
        };

        if (technicalSignals >= 10) {
            signalDensity = {
                label: LanguageManager.t("InspectionHighSignalDensityLabel"),
                description: LanguageManager.t("InspectionHighSignalDensityDescription"),
                tone: "ready"
            };
        } else if (technicalSignals >= 5) {
            signalDensity = {
                label: LanguageManager.t("InspectionModerateSignalDensityLabel"),
                description: LanguageManager.t("InspectionModerateSignalDensityDescription"),
                tone: "active"
            };
        }

        const firstOpenStage = this.intelligenceStages.find((stage) => counts[stage.key] === 0);

        const nextAction = firstOpenStage
            ? {
                label: `${LanguageManager.t("InspectionStrengthenStagePrefix")} ${firstOpenStage.label}`,
                description: `${firstOpenStage.label} ${LanguageManager.t("InspectionMissingStageDescriptionSuffix")}`,
                tone: "active"
            }
            : {
                label: LanguageManager.t("FinalReviewInspectionOutput"),
                description: LanguageManager.t("FoundationInspectionReviewConsistency"),
                tone: "ready"
            };

        return {
            counts,
            completedStages,
            totalStages,
            evidenceCoverage,
            confidenceScore,
            signalDensity,
            nextAction,
            label: evidenceCoverage >= 100
                ? LanguageManager.t("InspectionWorkflowCompleteLabel")
                : evidenceCoverage >= 50
                    ? LanguageManager.t("InspectionWorkflowDevelopingLabel")
                    : LanguageManager.t("InspectionWorkflowEarlyLabel")
        };
    }

    static renderInspectionIntelligenceSnapshot(inspection = {}, data = {}) {
        const intelligence = this.getInspectionIntelligence(inspection, data);

        return `
            <section class="inspection-intelligence intelligence-snapshot" aria-label="${LanguageManager.t("InspectionIntelligenceLabel")}">
                <div class="inspection-intelligence__header intelligence-snapshot__header">
                    <div>
                        <span class="inspection-intelligence__eyebrow intelligence-snapshot__eyebrow">${LanguageManager.t("InspectionIntelligenceLabel")}</span>
                        <strong>${intelligence.label}</strong>
                        <p>${intelligence.completedStages}/${intelligence.totalStages} ${LanguageManager.t("InspectionChecksCompleted")}</p>
                    </div>
                    <span class="inspection-intelligence__score intelligence-snapshot__score">${intelligence.confidenceScore}%</span>
                </div>

                <div class="inspection-intelligence__grid intelligence-snapshot__grid">
                    <article class="inspection-intelligence__card intelligence-snapshot__card">
                        <span>${LanguageManager.t("InspectionEvidenceCoverage")}</span>
                        <strong>${intelligence.evidenceCoverage}%</strong>
                        <p>${LanguageManager.t("InspectionEvidenceCoverageDescription")}</p>
                    </article>

                    <article class="inspection-intelligence__card intelligence-snapshot__card inspection-intelligence__card--${intelligence.signalDensity.tone} intelligence-snapshot__card--${intelligence.signalDensity.tone}">
                        <span>${LanguageManager.t("InspectionTechnicalSignalDensityLabel")}</span>
                        <strong>${intelligence.signalDensity.label}</strong>
                        <p>${intelligence.signalDensity.description}</p>
                    </article>

                    <article class="inspection-intelligence__card intelligence-snapshot__card inspection-intelligence__card--${intelligence.nextAction.tone} intelligence-snapshot__card--${intelligence.nextAction.tone}">
                        <span>${LanguageManager.t("InspectionNextActionLabel")}</span>
                        <strong>${intelligence.nextAction.label}</strong>
                        <p>${intelligence.nextAction.description}</p>
                    </article>
                </div>
            </section>
        `;
    }

    static createInspectionIntelligenceSnapshot(inspection = null, data = null) {
        const currentInspection = inspection || InspectionManager.getInspection();

        if (!currentInspection) {
            return null;
        }

        const inspectionData = data || {};
        const container = document.createElement("section");
        container.innerHTML = this.renderInspectionIntelligenceSnapshot(currentInspection, inspectionData);
        return container;
    }

    static intelligenceStages = [
        {
            key: "inspection",
            label: LanguageManager.t("InspectionStageInspectionLabel")
        },
        {
            key: "evidence",
            label: LanguageManager.t("FinalEvidenceLabel")
        },
        {
            key: "finding",
            label: LanguageManager.t("InspectionStageFindingLabel")
        },
        {
            key: "assessment",
            label: LanguageManager.t("InspectionStageAssessmentLabel")
        }
    ];

    static render() {
        const fragment = document.createDocumentFragment();
        const inspections = InspectionManager.getAllInspections();
        const activeInspection = InspectionManager.getInspection();

        fragment.appendChild(this.createHeader(activeInspection));
        fragment.appendChild(WorkflowContextBanner.create(CaseManager.getCurrent()));
        fragment.appendChild(this.createInspectionScopeOverview(activeInspection));
        fragment.appendChild(this.createExpertIntelligenceRuntimePanel(activeInspection));
        fragment.appendChild(this.createExpertIntelligenceExecutionHistory(activeInspection));
        fragment.appendChild(this.createHumanReviewRuntimePanel(activeInspection));
        fragment.appendChild(this.createMetrics(inspections));
        fragment.appendChild(this.createMainLayout(inspections, activeInspection));

        return fragment;
    }

    static createExpertIntelligenceRuntimePanel(activeInspection = null) {
        const panel = document.createElement("section");
        panel.className = "workflow-card expert-intelligence-runtime";
        panel.dataset.expertIntelligenceRuntime = "";

        const header = document.createElement("div");
        header.className = "platform-intelligence__header";

        const heading = document.createElement("div");
        const eyebrow = document.createElement("span");
        eyebrow.className = "platform-intelligence__eyebrow";
        eyebrow.textContent = "Expert Intelligence Runtime";

        const title = document.createElement("strong");
        title.textContent = activeInspection
            ? "Governed reasoning for the selected inspection"
            : "Select an inspection before running Expert Intelligence";

        const description = document.createElement("p");
        description.textContent = "Deterministic hypotheses and Risk Relevance interpretation remain subject to human expert review. No Building Risk Score or automatic diagnosis is produced.";

        heading.appendChild(eyebrow);
        heading.appendChild(title);
        heading.appendChild(description);
        header.appendChild(heading);

        const action = document.createElement("button");
        action.type = "button";
        action.className = "button";
        action.dataset.action = "run-expert-intelligence";
        action.textContent = "Run Expert Intelligence";
        action.disabled = !activeInspection;

        header.appendChild(action);
        panel.appendChild(header);

        if (!activeInspection) {
            const empty = document.createElement("p");
            empty.dataset.expertIntelligenceStatus = "not_run";
            empty.textContent = "Expert Intelligence has not been run because no inspection is selected.";
            panel.appendChild(empty);
            return panel;
        }

        const state = ExpertIntelligenceRuntimeManager.getExecutionState(activeInspection.id);
        panel.appendChild(this.createExpertIntelligenceRuntimeSummary(state));

        action.addEventListener("click", async () => {
            action.disabled = true;
            action.textContent = "Running Expert Intelligence…";
            panel.dataset.runtimeStatus = "running";

            const status = panel.querySelector("[data-expert-intelligence-status]");
            if (status) {
                status.textContent = "Expert Intelligence is running.";
            }

            await Promise.resolve();

            try {
                ExpertIntelligenceRuntimeManager.executeForInspection(activeInspection.id);
            } catch (error) {
                Notification.warning(error.message || "Expert Intelligence execution failed.");
            }

            this.refresh();
        });

        return panel;
    }

    static createExpertIntelligenceRuntimeSummary(state = {}) {
        const wrapper = document.createElement("div");
        wrapper.className = "expert-intelligence-runtime__summary";
        const status = state.status || "not_run";
        wrapper.dataset.expertIntelligenceStatus = status;

        if (state.corruption?.detected) {
            const corruption = document.createElement("p");
            corruption.className = "platform-intelligence__note";
            corruption.dataset.expertIntelligenceCorruption = "true";
            corruption.textContent = `${state.corruption.count} malformed Expert Intelligence execution record${state.corruption.count === 1 ? " was" : "s were"} excluded. Human review of local execution history is required.`;
            wrapper.appendChild(corruption);
        }

        if (!state.latest) {
            const empty = document.createElement("p");
            empty.textContent = "Expert Intelligence has not been run for this inspection.";
            wrapper.appendChild(empty);
            return wrapper;
        }

        const summary = ExpertIntelligenceRuntimeManager.createSummary(state.latest);
        const statusHeading = document.createElement("strong");
        statusHeading.textContent = this.formatExpertIntelligenceStatus(status);
        wrapper.appendChild(statusHeading);

        if (state.stale) {
            const stale = document.createElement("p");
            stale.className = "platform-intelligence__note";
            stale.dataset.expertIntelligenceStale = "true";
            stale.textContent = "This execution is stale because persisted inspection source data has changed. Run Expert Intelligence again before relying on it.";
            wrapper.appendChild(stale);
        }

        const grid = document.createElement("dl");
        grid.className = "detail-panel";

        [
            ["Execution", summary.executionId],
            ["Selected domain / provider", summary.selectedDomain
                ? `${summary.selectedDomain} / ${summary.selectedProvider}`
                : "No successful provider contract"],
            ["Matched indicators", summary.matchedIndicatorCount],
            ["Supporting evidence", summary.evidenceCount],
            ["Missing evidence", summary.missingEvidenceCount],
            ["Confidence", summary.confidence],
            ["Risk Relevance value", summary.riskRelevanceValue || "Not present"],
            ["Risk Relevance value state", summary.riskRelevanceValueState],
            ["Risk Relevance source version", summary.riskRelevanceVersion || "Not present"],
            ["Risk Relevance version state", summary.riskRelevanceVersionState],
            ["Interpretation state", summary.interpretationState],
            ["Interpretation eligible", summary.interpretationEligible ? "Yes" : "No"],
            ["Conflicts preserved", summary.conflictCount],
            ["Limitations", summary.limitationCount],
            ["Human review required", summary.humanReviewRequired ? "Yes" : "No"]
        ].forEach(([label, value]) => {
            const row = document.createElement("div");
            const term = document.createElement("dt");
            const detail = document.createElement("dd");
            term.textContent = label;
            detail.textContent = value === null || value === undefined || value === "" ? "Not available" : String(value);
            row.appendChild(term);
            row.appendChild(detail);
            grid.appendChild(row);
        });

        wrapper.appendChild(grid);

        if (summary.errorMessage) {
            const error = document.createElement("p");
            error.className = "platform-intelligence__note";
            error.dataset.expertIntelligenceError = "";
            error.textContent = summary.errorMessage;
            wrapper.appendChild(error);
        }

        const limitations = document.createElement("div");
        limitations.className = "expert-intelligence-runtime__limitations";
        const limitationTitle = document.createElement("strong");
        limitationTitle.textContent = "Preserved limitations";
        limitations.appendChild(limitationTitle);

        const list = document.createElement("ul");
        const entries = state.latest.limitations || [];

        if (!entries.length) {
            const item = document.createElement("li");
            item.textContent = "No additional limitation was recorded.";
            list.appendChild(item);
        } else {
            entries.forEach((entry) => {
                const item = document.createElement("li");
                item.textContent = typeof entry === "string"
                    ? entry
                    : entry.reason || entry.message || JSON.stringify(entry);
                list.appendChild(item);
            });
        }

        limitations.appendChild(list);
        wrapper.appendChild(limitations);
        return wrapper;
    }

    static createExpertIntelligenceExecutionHistory(activeInspection = null) {
        const panel = document.createElement("section");
        panel.className = "workflow-card expert-intelligence-history";
        panel.dataset.expertIntelligenceHistory = "";

        const heading = document.createElement("div");
        heading.className = "platform-intelligence__header";
        const title = document.createElement("h3");
        title.textContent = "Expert Intelligence Execution History";
        const description = document.createElement("p");
        description.textContent = "Persisted executions are shown in their released history order. History visibility does not approve, rank, rerun, or reinterpret an execution.";
        heading.appendChild(title);
        heading.appendChild(description);
        panel.appendChild(heading);

        if (!activeInspection?.id) {
            panel.dataset.expertIntelligenceHistoryState = "NO_INSPECTION";
            const empty = document.createElement("p");
            empty.textContent = "Select an inspection to view its Expert Intelligence execution history.";
            panel.appendChild(empty);
            return panel;
        }

        let executions;
        let state;

        try {
            executions = ExpertIntelligenceRuntimeManager.getByInspection(activeInspection.id);
            state = ExpertIntelligenceRuntimeManager.getExecutionState(activeInspection.id);
        } catch (error) {
            panel.dataset.expertIntelligenceHistoryState = "UNAVAILABLE";
            const unavailable = document.createElement("p");
            unavailable.className = "platform-intelligence__note";
            unavailable.textContent = "Expert Intelligence execution history is unavailable. No history record was inferred or reconstructed.";
            panel.appendChild(unavailable);
            return panel;
        }

        if (!Array.isArray(executions) || !state || typeof state !== "object") {
            panel.dataset.expertIntelligenceHistoryState = "UNAVAILABLE";
            const unavailable = document.createElement("p");
            unavailable.className = "platform-intelligence__note";
            unavailable.textContent = "Expert Intelligence execution history is unavailable because the released runtime contract returned an unsupported result.";
            panel.appendChild(unavailable);
            return panel;
        }

        const corruption = state.corruption && typeof state.corruption === "object"
            ? state.corruption
            : { detected: false, count: 0, records: [] };
        const hasCorruption = corruption.detected === true;
        const presentationDiagnostics = [];
        panel.dataset.expertIntelligenceHistoryState = executions.length
            ? (hasCorruption ? "AVAILABLE_WITH_UNSCOPED_CORRUPTION" : "AVAILABLE")
            : (hasCorruption ? "UNSCOPED_CORRUPTION_ONLY" : "EMPTY");

        if (hasCorruption) {
            const warning = document.createElement("p");
            warning.className = "platform-intelligence__note";
            warning.dataset.expertIntelligenceHistoryCorruption = "unscoped";
            warning.textContent = `${corruption.count || 0} malformed Expert Intelligence execution record${corruption.count === 1 ? " was" : "s were"} excluded at repository level. Released diagnostics do not attribute malformed records to an inspection, so this warning is intentionally unscoped.`;
            panel.appendChild(warning);

            if (executions.length) {
                const scope = document.createElement("p");
                scope.textContent = "The valid persisted executions returned by the released B1 history API are shown below. This view does not claim that the persisted history is complete.";
                panel.appendChild(scope);
            }
        }

        if (!executions.length) {
            const empty = document.createElement("p");
            empty.dataset.expertIntelligenceHistoryEmpty = "";
            empty.textContent = hasCorruption
                ? "No valid persisted Expert Intelligence execution is available for this inspection."
                : "No persisted Expert Intelligence execution exists for this inspection.";
            panel.appendChild(empty);
        } else {
            const list = document.createElement("ol");
            list.dataset.expertIntelligenceHistoryList = "";
            const currentExecutionId = state.latest?.id || null;

            executions.forEach((execution) => {
                const executionId = this.getExpertIntelligenceHistoryScalar(execution?.id);

                if (typeof executionId !== "string" || !executionId) {
                    presentationDiagnostics.push("An execution-history entry could not be presented because its stable execution identifier was unavailable.");
                    return;
                }

                const item = document.createElement("li");
                item.dataset.expertIntelligenceExecutionId = executionId;
                const isCurrent = Boolean(currentExecutionId && executionId === currentExecutionId);
                item.dataset.expertIntelligenceCurrent = isCurrent ? "true" : "false";

                const itemTitle = document.createElement("strong");
                itemTitle.textContent = isCurrent ? "Current execution" : "Previous execution";
                item.appendChild(itemTitle);

                let summary;

                try {
                    summary = ExpertIntelligenceRuntimeManager.createSummary(execution);

                    if (!summary || typeof summary !== "object" || Array.isArray(summary)) {
                        throw new Error("Unsupported execution summary projection.");
                    }
                } catch (error) {
                    const unavailable = document.createElement("p");
                    unavailable.className = "platform-intelligence__note";
                    unavailable.dataset.expertIntelligenceHistoryEntryUnavailable = "";
                    unavailable.textContent = "Summary metadata is unavailable for this persisted execution. No metadata was inferred or reconstructed.";
                    item.appendChild(unavailable);
                    this.appendExpertIntelligenceHistoryStaleState(item, isCurrent, state.stale);
                    list.appendChild(item);
                    return;
                }

                const details = document.createElement("dl");
                details.className = "detail-panel";
                [
                    ["Execution", this.getExpertIntelligenceHistoryScalar(summary.executionId) || executionId],
                    ["Sequence", execution?.sequence],
                    ["Executed at", execution?.executedAt],
                    ["Execution schema version", execution?.executionSchemaVersion],
                    ["Source fingerprint", execution?.sourceFingerprint],
                    ["Status", summary.status],
                    ["Selected domain", summary.selectedDomain],
                    ["Selected provider", summary.selectedProvider],
                    ["Human review required", typeof summary.humanReviewRequired === "boolean"
                        ? (summary.humanReviewRequired ? "Yes" : "No")
                        : null]
                ].forEach(([label, value]) => {
                    const scalarValue = this.getExpertIntelligenceHistoryScalar(value);

                    if (scalarValue === null || scalarValue === "") return;

                    const row = document.createElement("div");
                    const term = document.createElement("dt");
                    const detail = document.createElement("dd");
                    term.textContent = label;
                    detail.textContent = String(scalarValue);
                    row.appendChild(term);
                    row.appendChild(detail);
                    details.appendChild(row);
                });
                item.appendChild(details);

                try {
                    const auditDetails = this.createExpertIntelligenceExecutionAuditDetails(execution, summary);

                    if (auditDetails) item.appendChild(auditDetails);
                } catch (error) {
                    const unavailable = document.createElement("p");
                    unavailable.className = "platform-intelligence__note";
                    unavailable.dataset.expertIntelligenceAuditDetailUnavailable = "";
                    unavailable.textContent = "Some execution audit details could not be presented.";
                    item.appendChild(unavailable);
                }

                this.appendExpertIntelligenceHistoryStaleState(item, isCurrent, state.stale);

                list.appendChild(item);
            });

            panel.appendChild(list);
        }

        const repositoryDiagnostics = hasCorruption && Array.isArray(corruption.records)
            ? corruption.records
            : [];

        if (presentationDiagnostics.length || repositoryDiagnostics.length) {
            const diagnosticSection = document.createElement("section");
            diagnosticSection.dataset.expertIntelligenceHistoryDiagnosticRegion = "";
            const diagnosticHeading = document.createElement("h4");
            diagnosticHeading.textContent = "Execution-history diagnostics";
            diagnosticSection.appendChild(diagnosticHeading);

            if (presentationDiagnostics.length) {
                const diagnostics = document.createElement("ul");
                diagnostics.dataset.expertIntelligenceHistoryPresentationDiagnostics = "";
                presentationDiagnostics.forEach((message) => {
                    const item = document.createElement("li");
                    item.textContent = message;
                    diagnostics.appendChild(item);
                });
                diagnosticSection.appendChild(diagnostics);
            }

            if (repositoryDiagnostics.length) {
                const diagnostics = document.createElement("ul");
                diagnostics.dataset.expertIntelligenceHistoryDiagnostics = "unscoped";
                repositoryDiagnostics.forEach((record) => {
                    const item = document.createElement("li");
                    item.textContent = typeof record?.reason === "string"
                        ? record.reason
                        : (typeof record?.state === "string" ? record.state : "Malformed execution record excluded.");
                    diagnostics.appendChild(item);
                });
                diagnosticSection.appendChild(diagnostics);
            }

            panel.appendChild(diagnosticSection);
        }

        return panel;
    }

    static createExpertIntelligenceExecutionAuditDetails(execution, summary) {
        const executionId = this.getExpertIntelligenceHistoryScalar(execution?.id);

        if (typeof executionId !== "string" || !executionId) return null;

        const disclosure = document.createElement("details");
        disclosure.dataset.expertIntelligenceAuditDetails = executionId;
        const disclosureSummary = document.createElement("summary");
        disclosureSummary.textContent = "View execution audit details";
        disclosure.appendChild(disclosureSummary);
        const auditHeading = document.createElement("h4");
        auditHeading.textContent = "Execution audit details";
        disclosure.appendChild(auditHeading);
        let sectionCount = 0;
        let omittedDetail = false;

        const appendCollection = (title, values, formatter) => {
            if (values === undefined || values === null) return;

            if (!Array.isArray(values)) {
                omittedDetail = true;
                return;
            }

            const supported = [];
            values.forEach((value) => {
                let formatted = null;

                try {
                    formatted = formatter(value);
                } catch (error) {
                    formatted = null;
                }

                if (typeof formatted === "string" && formatted) {
                    supported.push(formatted);
                }
            });

            const persistedCount = values.length;
            const supportedCount = supported.length;
            const displayedCount = Math.min(supportedCount, this.expertIntelligenceAuditItemLimit);
            const unsupportedCount = persistedCount - supportedCount;

            if (!supportedCount && !unsupportedCount) return;

            const section = document.createElement("section");
            const heading = document.createElement("h5");
            heading.textContent = title;
            section.appendChild(heading);

            if (supportedCount) {
                const list = document.createElement("ul");
                supported.slice(0, this.expertIntelligenceAuditItemLimit).forEach((value) => {
                    const item = document.createElement("li");
                    item.textContent = value;
                    list.appendChild(item);
                });
                section.appendChild(list);
            }

            if (supportedCount > this.expertIntelligenceAuditItemLimit || unsupportedCount) {
                const bound = document.createElement("p");
                bound.dataset.expertIntelligenceAuditCollectionBound = "";

                if (!unsupportedCount) {
                    bound.textContent = `Showing ${displayedCount} of ${persistedCount} preserved items.`;
                } else if (!supportedCount) {
                    bound.textContent = `No supported items could be presented from ${persistedCount} preserved ${persistedCount === 1 ? "item" : "items"}. ${unsupportedCount} unsupported ${unsupportedCount === 1 ? "item was" : "items were"} omitted.`;
                } else {
                    bound.textContent = `Showing ${displayedCount} of ${supportedCount} supported ${supportedCount === 1 ? "item" : "items"} from ${persistedCount} preserved ${persistedCount === 1 ? "item" : "items"}. ${unsupportedCount} unsupported ${unsupportedCount === 1 ? "item was" : "items were"} omitted.`;
                }

                section.appendChild(bound);
            }

            disclosure.appendChild(section);
            sectionCount += 1;
        };

        const appendFacts = (title, facts) => {
            const supported = facts
                .map(([label, value]) => [label, this.getExpertIntelligenceHistoryScalar(value)])
                .filter(([, value]) => value !== null && value !== "");

            if (!supported.length) return;

            const section = document.createElement("section");
            const heading = document.createElement("h5");
            heading.textContent = title;
            section.appendChild(heading);
            const list = document.createElement("dl");
            supported.forEach(([label, value]) => {
                const row = document.createElement("div");
                const term = document.createElement("dt");
                const detail = document.createElement("dd");
                term.textContent = label;
                detail.textContent = String(value);
                row.appendChild(term);
                row.appendChild(detail);
                list.appendChild(row);
            });
            section.appendChild(list);
            disclosure.appendChild(section);
            sectionCount += 1;
        };

        appendCollection("Routing facts", execution.routedDomains, (value) => {
            return this.getExpertIntelligenceAuditText(value);
        });
        appendFacts("Provider facts", [
            ["Selected domain", summary.selectedDomain],
            ["Selected provider", summary.selectedProvider]
        ]);

        const reasoning = execution.reasoningResult;

        if (reasoning !== undefined && reasoning !== null
            && (typeof reasoning !== "object" || Array.isArray(reasoning))) {
            omittedDetail = true;
        } else if (reasoning) {
            const hypotheses = [];

            if (reasoning.primaryHypothesis !== undefined && reasoning.primaryHypothesis !== null) {
                hypotheses.push(reasoning.primaryHypothesis);
            }

            if (reasoning.alternativeHypotheses !== undefined
                && !Array.isArray(reasoning.alternativeHypotheses)) {
                omittedDetail = true;
            } else if (Array.isArray(reasoning.alternativeHypotheses)) {
                hypotheses.push(...reasoning.alternativeHypotheses);
            }

            appendCollection("Preserved hypotheses", hypotheses, (hypothesis) => {
                if (!hypothesis || typeof hypothesis !== "object" || Array.isArray(hypothesis)) return null;
                const label = this.getExpertIntelligenceAuditText(hypothesis.label)
                    || this.getExpertIntelligenceAuditText(hypothesis.cause);
                const status = this.getExpertIntelligenceAuditText(hypothesis.status);

                if (!label) return null;

                return status ? `${label} — Status: ${status}` : label;
            });
            appendCollection("Supporting evidence", reasoning.supportingEvidence, (value) => {
                return this.getExpertIntelligenceAuditText(value);
            });
            appendCollection("Missing evidence", reasoning.missingEvidence, (value) => {
                return this.getExpertIntelligenceAuditText(value);
            });
        }

        appendFacts("Stored confidence", [["Confidence", summary.confidence]]);
        appendFacts("Risk Relevance state", [
            ["Value", summary.riskRelevanceValue],
            ["Value state", summary.riskRelevanceValueState],
            ["Source version", summary.riskRelevanceVersion],
            ["Version state", summary.riskRelevanceVersionState]
        ]);
        appendFacts("Interpretation state", [
            ["State", summary.interpretationState],
            ["Eligible", typeof summary.interpretationEligible === "boolean"
                ? (summary.interpretationEligible ? "Yes" : "No")
                : null]
        ]);

        const conflicts = execution.internalModelResult?.conflicts;
        appendCollection("Preserved model conflicts", conflicts, (conflict) => {
            if (!conflict || typeof conflict !== "object" || Array.isArray(conflict)) return null;
            const type = this.getExpertIntelligenceAuditText(conflict.conflictType);
            const reference = this.getExpertIntelligenceAuditText(conflict.conflictReference);

            if (!type && !reference) return null;

            return [type, reference].filter(Boolean).join(" — ");
        });
        appendCollection("Preserved limitations", execution.limitations, (value) => {
            return this.getExpertIntelligenceAuditText(value);
        });

        const governance = execution.governanceVersions;

        if (governance !== undefined && governance !== null
            && (typeof governance !== "object" || Array.isArray(governance))) {
            omittedDetail = true;
        } else if (governance) {
            appendFacts("Governance versions", [
                ["Risk Relevance governance", governance.riskRelevanceGovernanceVersion],
                ["Risk Relevance supported source", governance.riskRelevanceSupportedSourceVersion],
                ["Internal model", governance.internalModelVersion],
                ["Interpretation model", governance.interpretationModelVersion]
            ]);
        }

        if (execution.errorState !== undefined && execution.errorState !== null) {
            if (typeof execution.errorState === "object" && !Array.isArray(execution.errorState)) {
                const section = document.createElement("section");
                const heading = document.createElement("h5");
                heading.textContent = "Execution error information";
                const message = document.createElement("p");
                message.textContent = "Execution error information was preserved for this execution.";
                section.appendChild(heading);
                section.appendChild(message);
                disclosure.appendChild(section);
                sectionCount += 1;
            } else {
                omittedDetail = true;
            }
        }

        if (omittedDetail) {
            const omission = document.createElement("p");
            omission.className = "platform-intelligence__note";
            omission.dataset.expertIntelligenceAuditDetailOmission = "";
            omission.textContent = "Some execution audit details could not be presented.";
            disclosure.appendChild(omission);
        }

        return sectionCount || omittedDetail ? disclosure : null;
    }

    static getExpertIntelligenceAuditText(value) {
        const scalar = this.getExpertIntelligenceHistoryScalar(value);

        return typeof scalar === "string" && scalar ? scalar : null;
    }

    static appendExpertIntelligenceHistoryStaleState(item, isCurrent, staleState) {
        if (!isCurrent || !staleState) return;

        const stale = document.createElement("p");
        stale.className = "platform-intelligence__note";
        stale.dataset.expertIntelligenceHistoryStale = "true";
        stale.textContent = "The current Expert Intelligence execution is marked stale because persisted inspection source data has changed.";
        item.appendChild(stale);
    }

    static getExpertIntelligenceHistoryScalar(value) {
        if (typeof value === "string" || typeof value === "boolean") {
            return value;
        }

        if (typeof value === "number" && Number.isFinite(value)) {
            return value;
        }

        return null;
    }

    static createHumanReviewRuntimePanel(activeInspection = null) {
        const panel = document.createElement("section");
        panel.className = "workflow-card human-review-runtime";
        panel.dataset.humanReviewRuntime = "";

        const heading = document.createElement("div");
        heading.className = "platform-intelligence__header";
        const title = document.createElement("strong");
        title.textContent = "Human Review";
        const description = document.createElement("p");
        description.textContent = "Professional decisions are recorded as append-only review data. Reviewer details are descriptive and do not establish identity assurance or external-use authority.";
        heading.appendChild(title);
        heading.appendChild(description);
        panel.appendChild(heading);

        if (!activeInspection) {
            panel.appendChild(this.createHumanReviewMessage(
                "Select an inspection to view its Human Review state.",
                "no_inspection"
            ));
            return panel;
        }

        const state = HumanReviewRuntimeManager.getHumanReviewStateForInspection(activeInspection.id);
        panel.appendChild(this.createHumanReviewRuntimeSummary(state));

        if (state.status === "REVIEW_STATE_AVAILABLE"
            && ["NOT_REVIEWED", "REVIEWED"].includes(state.reviewResolution?.status)) {
            panel.appendChild(this.createHumanReviewEntryForm(activeInspection.id, state));
        }

        if (state.reviewResolution) {
            panel.appendChild(this.createHumanReviewAuditTrail(state.reviewResolution));
        }

        return panel;
    }

    static createHumanReviewRuntimeSummary(state = {}) {
        const summary = document.createElement("div");
        summary.className = "human-review-runtime__summary";
        summary.dataset.humanReviewStatus = state.status || "UNKNOWN";

        if (state.status === "NO_CURRENT_EXECUTION") {
            summary.appendChild(this.createHumanReviewMessage(
                "No current persisted Expert Intelligence execution is available for Human Review.",
                "no_current_execution"
            ));
            return summary;
        }

        if (state.status === "UNSUPPORTED_EXECUTION_STATE") {
            summary.appendChild(this.createHumanReviewMessage(
                state.errorMessage || "The current execution cannot be reviewed under the existing Human Review contract.",
                "unsupported_execution"
            ));
            return summary;
        }

        const resolution = state.reviewResolution || {};
        const current = resolution.effectiveReview || null;
        const grid = document.createElement("dl");
        grid.className = "detail-panel";
        [
            ["Current execution", state.executionId || "Not available"],
            ["Human review required", state.humanReviewRequired ? "Yes" : "No"],
            ["Review state", resolution.status || "Not available"],
            ["Safe review records", resolution.reviewCount ?? 0],
            ["Professional decision", current?.decision || "Not recorded"],
            ["Current rationale", current?.rationale || "Not recorded"],
            ["Stale when reviewed", current ? (current.staleAtReview ? "Yes" : "No") : "Not recorded"]
        ].forEach(([label, value]) => {
            const row = document.createElement("div");
            const term = document.createElement("dt");
            const detail = document.createElement("dd");
            term.textContent = label;
            detail.textContent = String(value);
            row.appendChild(term);
            row.appendChild(detail);
            grid.appendChild(row);
        });
        summary.appendChild(grid);

        if (state.executionStale) {
            summary.appendChild(this.createHumanReviewMessage(
                "The current execution is stale. Any review record must preserve that condition and provide the required rationale.",
                "stale_execution"
            ));
        }

        if (state.errorMessage) {
            summary.appendChild(this.createHumanReviewMessage(state.errorMessage, "error"));
        }

        return summary;
    }

    static createHumanReviewEntryForm(inspectionId, state) {
        const form = document.createElement("form");
        form.className = "human-review-runtime__form";
        form.dataset.humanReviewForm = "";

        const decision = this.createHumanReviewSelect("decision", "Professional decision", [
            "CONFIRMED",
            "CONFIRMED_WITH_LIMITATIONS",
            "REJECTED",
            "RERUN_REQUIRED"
        ]);
        const reviewerRole = this.createHumanReviewSelect("reviewerRole", "Reviewer role", [
            "PROFESSIONAL_REVIEWER",
            "SECOND_REVIEWER",
            "QUALITY_ASSURANCE_REVIEWER",
            "LEAD_REVIEWER"
        ]);
        const reviewerId = this.createHumanReviewInput("reviewerId", "Reviewer identifier");
        const reviewerName = this.createHumanReviewInput("reviewerDisplayName", "Reviewer display name");
        const rationale = this.createHumanReviewInput("rationale", "Professional rationale", "textarea");
        const notes = this.createHumanReviewInput("notes", "Notes", "textarea");
        const limitations = this.createHumanReviewInput("limitations", "Limitations, one per line", "textarea");
        const followUp = this.createHumanReviewInput("followUpRequirements", "Follow-up requirements, one per line", "textarea");
        const rerun = this.createHumanReviewInput("rerunRecommendation", "Rerun recommendation", "textarea");

        [
            decision,
            reviewerId,
            reviewerName,
            reviewerRole,
            rationale,
            notes,
            limitations,
            followUp,
            rerun
        ].forEach((field) => form.appendChild(field.wrapper));

        const error = document.createElement("p");
        error.className = "platform-intelligence__note";
        error.dataset.humanReviewError = "";
        error.hidden = true;
        form.appendChild(error);

        const submit = document.createElement("button");
        submit.type = "submit";
        submit.className = "button";
        submit.dataset.action = "record-human-review";
        submit.textContent = "Record Human Review";
        form.appendChild(submit);

        let submitting = false;
        form.addEventListener("submit", async event => {
            event.preventDefault();

            if (submitting) {
                return;
            }

            submitting = true;
            submit.disabled = true;
            error.hidden = true;
            const submittedAt = new Date().toISOString();
            const reviewData = {
                executionId: state.executionId,
                reviewerId: reviewerId.control.value,
                reviewerDisplayName: reviewerName.control.value,
                reviewerRole: reviewerRole.control.value,
                decision: decision.control.value,
                rationale: rationale.control.value,
                notes: notes.control.value,
                limitations: this.parseHumanReviewLines(limitations.control.value),
                followUpRequirements: this.parseHumanReviewLines(followUp.control.value),
                rerunRecommendation: rerun.control.value || null,
                references: [],
                staleAtReview: state.executionStale === true,
                reviewedAt: submittedAt,
                createdAt: submittedAt
            };

            await Promise.resolve();

            try {
                const result = HumanReviewRuntimeManager.recordHumanReviewForCurrentExecution(
                    inspectionId,
                    reviewData
                );

                if (result.status === "REVIEW_RECORDED") {
                    this.refresh();
                    return;
                }

                error.textContent = result.errorMessage
                    || "Human Review could not be recorded in the current state.";
                error.hidden = false;
            } catch (caught) {
                error.textContent = caught.message || "Human Review input is invalid.";
                error.hidden = false;
            } finally {
                submitting = false;
                submit.disabled = false;
            }
        });

        return form;
    }

    static createHumanReviewAuditTrail(resolution = {}) {
        const section = document.createElement("section");
        section.className = "human-review-runtime__audit-trail";
        section.dataset.humanReviewAuditTrail = "";

        const heading = document.createElement("h3");
        heading.textContent = "Human Review history";
        section.appendChild(heading);

        const records = Array.isArray(resolution.records) ? resolution.records : [];
        const effectiveReviewId = resolution.effectiveReview?.reviewId || null;

        if (resolution.status === "NOT_REVIEWED") {
            section.appendChild(this.createHumanReviewMessage(
                "No Human Review records have been recorded for the current Expert Intelligence execution.",
                "empty_history"
            ));
            return section;
        }

        if (["REVIEWED", "PARTIAL_WITH_CORRUPTION"].includes(resolution.status)) {
            const list = document.createElement("ol");
            list.dataset.humanReviewAuditRecords = "";
            records.forEach((record) => {
                list.appendChild(this.createHumanReviewAuditTrailEntry(
                    record,
                    Boolean(effectiveReviewId) && record?.reviewId === effectiveReviewId
                ));
            });
            section.appendChild(list);
        }

        if (resolution.status === "PARTIAL_WITH_CORRUPTION") {
            section.appendChild(this.createHumanReviewMessage(
                "Human Review history contains integrity issues. Only the integrity-safe portion of the history is shown. Additional persisted review data could not be validated.",
                "partial_history"
            ));
            section.appendChild(this.createHumanReviewDiagnostics(resolution.diagnostics));
        }

        if (resolution.status === "CORRUPT_HISTORY") {
            section.appendChild(this.createHumanReviewMessage(
                "Human Review history contains integrity issues. No integrity-safe Human Review history can be presented for the current execution.",
                "corrupt_history"
            ));
            section.appendChild(this.createHumanReviewDiagnostics(resolution.diagnostics));
        }

        return section;
    }

    static createHumanReviewAuditTrailEntry(record = {}, effective = false) {
        const entry = document.createElement("li");
        entry.dataset.humanReviewAuditRecord = record.reviewId || "";

        if (effective) {
            entry.dataset.humanReviewEffective = "";
            const marker = document.createElement("strong");
            marker.textContent = "Current effective review";
            entry.appendChild(marker);
        }

        const decisionLabels = {
            CONFIRMED: "Confirmed",
            CONFIRMED_WITH_LIMITATIONS: "Confirmed with limitations",
            REJECTED: "Rejected",
            RERUN_REQUIRED: "Rerun required"
        };
        const decision = decisionLabels[record.decision]
            ? `${decisionLabels[record.decision]} (${record.decision})`
            : record.decision;

        [
            ["Sequence", record.sequence],
            ["Professional decision", decision],
            ["Rationale", record.rationale],
            ["Reviewer", record.reviewerDisplayName],
            ["Reviewer role", record.reviewerRole],
            ["Reviewed at", record.reviewedAt],
            ["Previous review", record.previousReviewId]
        ].forEach(([label, value]) => {
            if (this.hasHumanReviewAuditValue(value)) {
                entry.appendChild(this.createHumanReviewAuditField(label, value));
            }
        });

        if (record.staleAtReview === true) {
            entry.appendChild(this.createHumanReviewMessage(
                "The Expert Intelligence execution was marked stale when this review was recorded.",
                "stale_at_review"
            ));
        }

        [
            ["Notes", record.notes],
            ["Limitations", record.limitations],
            ["Follow-up requirements", record.followUpRequirements],
            ["References", record.references],
            ["Rerun recommendation", record.rerunRecommendation]
        ].forEach(([label, value]) => {
            if (this.hasHumanReviewAuditValue(value)) {
                entry.appendChild(this.createHumanReviewAuditField(label, value));
            }
        });

        return entry;
    }

    static createHumanReviewAuditField(label, value) {
        const field = document.createElement("div");
        const term = document.createElement("strong");
        term.textContent = label;
        field.appendChild(term);

        if (Array.isArray(value)) {
            const list = document.createElement("ul");
            value.forEach((item) => {
                const entry = document.createElement("li");
                entry.textContent = this.formatHumanReviewAuditValue(item);
                list.appendChild(entry);
            });
            field.appendChild(list);
            return field;
        }

        const detail = document.createElement("span");
        detail.textContent = this.formatHumanReviewAuditValue(value);
        field.appendChild(detail);
        return field;
    }

    static createHumanReviewDiagnostics(diagnostics = []) {
        const wrapper = document.createElement("div");
        wrapper.dataset.humanReviewDiagnostics = "";
        const heading = document.createElement("strong");
        heading.textContent = "Integrity diagnostics";
        wrapper.appendChild(heading);
        const list = document.createElement("ul");
        (Array.isArray(diagnostics) ? diagnostics : []).forEach((diagnostic) => {
            const item = document.createElement("li");
            item.textContent = diagnostic?.reason || diagnostic?.state || "Human Review integrity issue.";
            list.appendChild(item);
        });
        wrapper.appendChild(list);
        return wrapper;
    }

    static hasHumanReviewAuditValue(value) {
        if (Array.isArray(value)) {
            return value.length > 0;
        }

        return value !== null && value !== undefined && value !== "";
    }

    static formatHumanReviewAuditValue(value) {
        if (value && typeof value === "object") {
            try {
                return JSON.stringify(value);
            } catch {
                return "Structured reference could not be displayed.";
            }
        }

        return String(value);
    }

    static createHumanReviewSelect(name, label, values) {
        const wrapper = document.createElement("label");
        wrapper.textContent = label;
        const control = document.createElement("select");
        control.name = name;
        control.dataset.humanReviewField = name;
        values.forEach((value) => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            control.appendChild(option);
        });
        wrapper.appendChild(control);
        return { wrapper, control };
    }

    static createHumanReviewInput(name, label, type = "input") {
        const wrapper = document.createElement("label");
        wrapper.textContent = label;
        const control = document.createElement(type);
        control.name = name;
        control.dataset.humanReviewField = name;
        if (type === "input") {
            control.type = "text";
        }
        wrapper.appendChild(control);
        return { wrapper, control };
    }

    static createHumanReviewMessage(text, state) {
        const message = document.createElement("p");
        message.className = "platform-intelligence__note";
        message.dataset.humanReviewMessage = state;
        message.textContent = text;
        return message;
    }

    static parseHumanReviewLines(value = "") {
        return String(value).split("\n").filter((entry) => entry.trim().length > 0);
    }

    static formatExpertIntelligenceStatus(status = "not_run") {
        const labels = {
            not_run: "Expert Intelligence has not been run",
            running: "Expert Intelligence is running",
            succeeded: "Expert Intelligence execution succeeded",
            no_provider_contract: "No Knowledge Provider produced a supported reasoning contract",
            failed: "Expert Intelligence execution failed"
        };

        return labels[status] || `Expert Intelligence status: ${status}`;
    }

    static createHeader(activeInspection = null) {
        return SectionHeader.create({
            eyebrow: LanguageManager.t("InspectionWorkspaceTitle"),
            title: LanguageManager.t("InspectionTitlePlural"),
            description: activeInspection
                ? `${LanguageManager.t("InspectionActivePrefix")}: ${activeInspection.title || activeInspection.id}`
                : LanguageManager.t("FoundationInspectionPlanDescription"),
            actions: [
                {
                    id: "new-inspection",
                    label: LanguageManager.t("InspectionNewAction"),
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

        grid.appendChild(this.createMetricCard(LanguageManager.t("InspectionTitlePlural"), inspections.length));
        grid.appendChild(this.createMetricCard(LanguageManager.t("InspectionMetricDraft"), draftCount));
        grid.appendChild(this.createMetricCard(LanguageManager.t("InspectionMetricInProgress"), progressCount));
        grid.appendChild(this.createMetricCard(LanguageManager.t("InspectionMetricCompleted"), completedCount));

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


    static getActiveScope(activeInspection = null) {
        const currentCase = CaseManager.getCurrent();
        const activeScope = InspectionScopeManager.get();

        if (activeScope) {
            if (activeInspection && activeScope.inspectionId === activeInspection.id) {
                return activeScope;
            }

            if (!activeInspection && currentCase && activeScope.caseId === currentCase.id) {
                return activeScope;
            }
        }

        if (activeInspection) {
            return InspectionScopeManager.getByInspection(activeInspection.id)[0] || null;
        }

        if (currentCase) {
            return InspectionScopeManager.getByCase(currentCase.id)[0] || null;
        }

        return null;
    }

    static createInspectionScopeOverview(activeInspection = null) {
        const activeScope = this.getActiveScope(activeInspection);
        const catalogOptions = this.getEffectiveCatalogOptions(activeScope);
        const questions = this.getEffectiveScopeQuestions(activeScope, catalogOptions);
        const refreshedScope = activeScope?.id ? (InspectionScopeManager.load(activeScope.id) || activeScope) : activeScope;
        const modules = this.getModuleSummaries(questions);
        const answers = refreshedScope?.answers || {};
        const coverage = activeScope
            ? InspectionScopeManager.createCoverageSummary(questions, answers)
            : InspectionScopeManager.createCoverageSummary(questions, answers);
        const currentQuestion = this.getCurrentScopeQuestion(activeScope, questions, answers);
        const currentEvaluation = currentQuestion
            ? InspectionQuestionEngine.evaluate(currentQuestion, answers[currentQuestion.id])
            : null;

        const wrapper = document.createElement("section");
        wrapper.className = activeScope
            ? "inspection-scope-editorial inspection-scope-editorial--active"
            : "inspection-scope-editorial";

        const hero = document.createElement("div");
        hero.className = "inspection-scope-editorial__hero";

        const heroCopy = document.createElement("div");
        heroCopy.className = "inspection-scope-editorial__copy";

        const eyebrow = document.createElement("span");
        eyebrow.className = "inspection-scope-editorial__eyebrow";
        eyebrow.textContent = "Object Inspection Scope";

        const title = document.createElement("strong");
        title.textContent = activeScope ? LanguageManager.t("InspectionAdaptiveScopeActiveTitle") : "Adaptive Scope Review.";

        const description = document.createElement("p");
        description.textContent = activeScope
            ? LanguageManager.t("InspectionAdaptiveScopeActiveDescription")
            : LanguageManager.t("FoundationInspectionScopeDescription");

        const status = document.createElement("span");
        status.className = activeScope
            ? "inspection-scope-editorial__status inspection-scope-editorial__status--active"
            : "inspection-scope-editorial__status";
        status.textContent = activeScope ? LanguageManager.t("InspectionScopeActiveBadge") : "Not Started";

        heroCopy.appendChild(eyebrow);
        heroCopy.appendChild(title);
        heroCopy.appendChild(description);
        heroCopy.appendChild(status);
        heroCopy.appendChild(this.createInspectionProfileControl(activeScope));

        const actionPanel = document.createElement("aside");
        actionPanel.className = "inspection-scope-editorial__action-panel";

        const actionLabel = document.createElement("span");
        actionLabel.textContent = "Scope Control";

        const actionButton = document.createElement("button");
        actionButton.type = "button";
        actionButton.className = "button inspection-scope-editorial__action";
        actionButton.textContent = activeScope ? LanguageManager.t("InspectionScopeActiveBadge") : "Start Scope";
        actionButton.onclick = () => this.startAdaptiveScope(activeInspection);

        const actionMeta = document.createElement("p");
        actionMeta.textContent = activeScope
            ? `${coverage.inspected}/${coverage.total} ${LanguageManager.t("InspectionInspectedLabel")} · ${coverage.riskFlagged} ${LanguageManager.t("InspectionRiskFlagsLabel")}`
            : `${coverage.total} adaptive questions ready`;

        actionPanel.appendChild(actionLabel);
        actionPanel.appendChild(actionButton);
        actionPanel.appendChild(actionMeta);

        hero.appendChild(heroCopy);
        hero.appendChild(actionPanel);

        const body = document.createElement("div");
        body.className = "inspection-scope-editorial__body";

        const modulePanel = document.createElement("section");
        modulePanel.className = "inspection-scope-editorial__modules";

        const moduleHeader = document.createElement("div");
        moduleHeader.className = "inspection-scope-editorial__section-header";
        moduleHeader.innerHTML = `<span>${LanguageManager.t("InspectionModulesLabel")}</span><strong>${LanguageManager.t("InspectionBuildingSystemsReview")}</strong>`;
        modulePanel.appendChild(moduleHeader);

        modules.forEach((module, index) => {
            const moduleQuestions = questions.filter(question => question.module === module.id);
            const item = document.createElement("article");
            item.className = "inspection-scope-editorial__module";

            const number = document.createElement("span");
            number.textContent = String(index + 1).padStart(2, "0");

            const content = document.createElement("div");
            const label = document.createElement("strong");
            label.textContent = module.label;

            const meta = document.createElement("p");
            meta.textContent = `${moduleQuestions.length} questions · ${module.riskCategory}`;

            content.appendChild(label);
            content.appendChild(meta);
            item.appendChild(number);
            item.appendChild(content);
            modulePanel.appendChild(item);
        });

        const workPanel = document.createElement("section");
        workPanel.className = "inspection-scope-editorial__work";

        const workHeader = document.createElement("div");
        workHeader.className = "inspection-scope-editorial__section-header";
        workHeader.innerHTML = `<span>${LanguageManager.t("InspectionCurrentQuestionLabel")}</span><strong>${LanguageManager.t("InspectionDecisionPathTitle")}</strong>`;

        const questionCard = document.createElement("article");
        questionCard.className = "inspection-scope-editorial__question";

        const questionText = document.createElement("strong");
        questionText.textContent = currentQuestion?.question || "No inspection question available.";

        const questionMeta = document.createElement("p");
        questionMeta.textContent = currentQuestion
            ? `${currentQuestion.module} · ${currentQuestion.category} · ${currentEvaluation.coverageStatus}`
            : "Question catalog is empty.";

        const questionHint = document.createElement("div");
        questionHint.className = "inspection-scope-editorial__hint";
        questionHint.textContent = activeScope
            ? LanguageManager.t("InspectionChooseAnswerDescription")
            : LanguageManager.t("FoundationInspectionScopeStartDescription");

        questionCard.appendChild(questionText);
        questionCard.appendChild(questionMeta);
        questionCard.appendChild(questionHint);
        questionCard.appendChild(this.createAnswerControls(activeInspection, activeScope, currentQuestion));

        const coveragePanel = document.createElement("div");
        coveragePanel.className = "inspection-scope-editorial__coverage";

        [
            ["Questions", coverage.total],
            [LanguageManager.t("InspectionOpenLabel"), coverage.open],
            ["Inspected", coverage.inspected],
            [LanguageManager.t("InspectionCoverageEvidenceLabel"), coverage.evidenceRequired],
            ["Risk", coverage.riskFlagged],
            ["Limits", coverage.limitations]
        ].forEach(([label, value]) => {
            const item = document.createElement("div");
            const number = document.createElement("strong");
            number.textContent = String(value);
            const text = document.createElement("span");
            text.textContent = label;
            item.appendChild(number);
            item.appendChild(text);
            coveragePanel.appendChild(item);
        });

        workPanel.appendChild(workHeader);
        workPanel.appendChild(questionCard);
        workPanel.appendChild(this.createScopeSignalPanel(refreshedScope, questions));
        workPanel.appendChild(coveragePanel);

        body.appendChild(modulePanel);
        body.appendChild(workPanel);

        wrapper.appendChild(hero);
        wrapper.appendChild(body);

        return wrapper;
    }


    static getCurrentScopeQuestion(activeScope = null, questions = [], answers = {}) {
        const visibleQuestions = questions.filter(question =>
            InspectionQuestionEngine.shouldAsk(question, answers)
        );

        const unanswered = visibleQuestions.find(question => !answers[question.id]);

        return unanswered || visibleQuestions[0] || questions[0] || null;
    }

    static getAnswerDisplayLabel(label = "") {
        const normalized = String(label || "");
        const labelKeys = {
            Yes: "InspectionAnswerYes",
            No: "InspectionAnswerNo",
            Unknown: "InspectionAnswerUnknown",
            "Not Accessible": "InspectionAnswerNotAccessible"
        };

        return labelKeys[normalized]
            ? LanguageManager.t(labelKeys[normalized])
            : normalized;
    }

    static getAnswerOptions(question = {}) {
        const questionId = String(question.id || "");
        const isPattayaQuestion = questionId.startsWith("TH-PATTAYA-");

        if (isPattayaQuestion) {
            if (
                questionId.includes("-DOC-") ||
                String(question.module || "").toLowerCase().includes("dokument")
            ) {
                return [
                    { value: "Verfügbar", label: "Verfügbar" },
                    { value: "Nicht verfügbar", label: "Nicht verfügbar" },
                    { value: "Angefragt", label: "Angefragt" },
                    { value: "Nicht geprüft", label: "Nicht geprüft" }
                ];
            }

            return [
                { value: "i.O.", label: "i.O." },
                { value: "Auffällig", label: "Auffällig" },
                { value: "Nicht prüfbar", label: "Nicht prüfbar" },
                { value: "Hinweis", label: "Hinweis" }
            ];
        }

        if (Array.isArray(question.answerOptions) && question.answerOptions.length) {
            return question.answerOptions.map(option => {
                if (typeof option === "object") {
                    return {
                        value: option.value || option.label || "",
                        label: this.getAnswerDisplayLabel(option.label || option.value || "")
                    };
                }

                return {
                    value: option,
                    label: this.getAnswerDisplayLabel(option)
                };
            });
        }

        const type = question.answerType || "yes_no_unknown";

        if (type.includes("not_accessible")) {
            return [
                { value: "yes", label: LanguageManager.t("InspectionAnswerYes") },
                { value: "no", label: LanguageManager.t("InspectionAnswerNo") },
                { value: "not_accessible", label: LanguageManager.t("InspectionAnswerNotAccessible") }
            ];
        }

        return [
            { value: "yes", label: LanguageManager.t("InspectionAnswerYes") },
            { value: "no", label: LanguageManager.t("InspectionAnswerNo") },
            { value: "unknown", label: LanguageManager.t("InspectionAnswerUnknown") }
        ];
    }

    static createAnswerControls(activeInspection = null, activeScope = null, question = null) {
        const controls = document.createElement("div");
        controls.className = "inspection-scope-editorial__answers";

        if (!question) {
            return controls;
        }

        if (!activeScope) {
            const note = document.createElement("span");
            note.textContent = LanguageManager.t("InspectionStartScopeToAnswerQuestion");
            controls.appendChild(note);
            return controls;
        }

        this.getAnswerOptions(question).forEach(option => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = `inspection-scope-editorial__answer inspection-scope-editorial__answer--${option.value}`;
            button.textContent = option.label;
            button.addEventListener("click", () => {
                this.answerScopeQuestion(activeInspection, question, option.value);
            });

            controls.appendChild(button);
        });

        return controls;
    }

    static answerScopeQuestion(activeInspection = null, question = null, value = "") {
        const activeScope = this.getActiveScope(activeInspection);

        if (!activeScope || !question || !value) {
            Notification.info(LanguageManager.t("InspectionStartScopeBeforeAnswering"));
            return;
        }

        InspectionScopeManager.answerQuestion(activeScope.id, question, value);
        Notification.success(LanguageManager.t("InspectionAnswerSaved"));
        this.refresh();
    }

    static createScopeSignalPanel(activeScope = null, questions = []) {
        const panel = document.createElement("section");
        panel.className = "inspection-scope-editorial__signals";

        const activeQuestionIds = new Set((questions || []).map(question => question.id));
        const answeredQuestionIds = new Set(Object.keys(activeScope?.answers || {}));

        const isActiveAnsweredSignal = item =>
            activeQuestionIds.has(item.questionId) && answeredQuestionIds.has(item.questionId);

        const evidenceRequirements = (activeScope?.evidenceRequirements || [])
            .filter(isActiveAnsweredSignal);

        const riskFlags = (activeScope?.riskFlags || [])
            .filter(isActiveAnsweredSignal);

        const limitations = (activeScope?.limitations || [])
            .filter(isActiveAnsweredSignal);

        [
            {
                label: LanguageManager.t("InspectionEvidenceRequired"),
                value: evidenceRequirements.length,
                detail: evidenceRequirements.length
                    ? `${evidenceRequirements.length} ${LanguageManager.t("InspectionEvidenceRequiredSummary")}`
                    : LanguageManager.t("FoundationNoEvidenceRequirements")
            },
            {
                label: LanguageManager.t("InspectionRiskFlagsUpper"),
                value: riskFlags.length,
                detail: riskFlags.length
                    ? riskFlags.map(item => item.reason).slice(0, 2).join(" · ")
                    : LanguageManager.t("InspectionNoRiskFlagsYet")
            },
            {
                label: LanguageManager.t("InspectionLimitationsUpper"),
                value: limitations.length,
                detail: limitations.length
                    ? limitations.map(item => item.reason).slice(0, 2).join(" · ")
                    : LanguageManager.t("InspectionNoLimitationsYet")
            }
        ].forEach(signal => {
            const item = document.createElement("article");

            const value = document.createElement("strong");
            value.textContent = String(signal.value);

            const label = document.createElement("span");
            label.textContent = signal.label;

            const detail = document.createElement("p");
            detail.textContent = signal.detail;

            item.appendChild(value);
            item.appendChild(label);
            item.appendChild(detail);
            panel.appendChild(item);
        });

        if (evidenceRequirements.length) {
            panel.appendChild(this.createEvidenceRequirementList(activeScope, evidenceRequirements));
        }

        return panel;
    }

    static createEvidenceRequirementList(activeScope = null, evidenceRequirements = []) {
        const wrapper = document.createElement("div");
        wrapper.className = "inspection-scope-editorial__requirements";

        const header = document.createElement("div");
        header.className = "inspection-scope-editorial__requirements-header";

        const eyebrow = document.createElement("span");
        eyebrow.textContent = LanguageManager.t("InspectionEvidenceActions");

        const title = document.createElement("strong");
        title.textContent = LanguageManager.t("FoundationRequiredEvidenceByAnswer");

        header.appendChild(eyebrow);
        header.appendChild(title);
        wrapper.appendChild(header);

        evidenceRequirements.forEach(requirement => {
            const question = InspectionQuestionCatalog.getById(requirement.questionId, activeScope?.profile === 'pattaya' || this.getInspectionProfile() === 'pattaya' ? { profile: 'pattaya', country: 'TH', region: 'Pattaya / Chonburi' } : {});
            const item = document.createElement("article");
            item.className = "inspection-scope-editorial__requirement";

            const content = document.createElement("div");

            const questionTitle = document.createElement("strong");
            questionTitle.textContent = question?.question || requirement.questionId;

            const meta = document.createElement("p");
            meta.textContent = [
                `Question: ${requirement.questionId}`,
                `Case: ${activeScope?.caseId || "not linked"}`,
                `Inspection: ${activeScope?.inspectionId || "not linked"}`
            ].join(" · ");

            const tags = document.createElement("div");
            tags.className = "inspection-scope-editorial__requirement-tags";

            (requirement.requiredEvidence || []).forEach(type => {
                const tag = document.createElement("span");
                tag.textContent = type;
                tags.appendChild(tag);
            });

            content.appendChild(questionTitle);
            content.appendChild(meta);
            content.appendChild(tags);

            const isDocumentAvailabilityRequirement = (requirement.requiredEvidence || [])
                .includes("document_availability_check") ||
                question?.reportSection === "Document Availability Check";

            if (isDocumentAvailabilityRequirement) {
                const policyNote = document.createElement("p");
                policyNote.textContent = "Availability check only. No legal, financial, technical or governance document review is performed.";
                content.appendChild(policyNote);
            }

            const action = document.createElement("button");
            action.type = "button";
            action.className = "button inspection-scope-editorial__requirement-action";
            action.textContent = LanguageManager.t("InspectionCreateEvidence");
            action.addEventListener("click", () => {
                this.createEvidenceFromRequirement(activeScope, requirement);
            });

            item.appendChild(content);
            item.appendChild(action);
            wrapper.appendChild(item);
        });

        return wrapper;
    }


    static createEvidenceFromRequirement(activeScope = null, requirement = null) {
        if (!activeScope || !requirement || !requirement.questionId) {
            Notification.info(LanguageManager.t("FoundationSelectEvidenceRequirement"));
            return;
        }

        const catalogOptions = activeScope?.profile === "pattaya" || this.getInspectionProfile() === "pattaya"
            ? { profile: "pattaya", country: "TH", region: "Pattaya / Chonburi" }
            : {};

        const question = InspectionQuestionCatalog.getById(requirement.questionId, catalogOptions);

        if (!question) {
            Notification.warning(LanguageManager.t("InspectionQuestionNotFound"));
            return;
        }

        const rawEvidenceType = (requirement.requiredEvidence || ["note"])[0];
        const isDocumentAvailabilityCheck =
            rawEvidenceType === "document_availability_check" ||
            question.reportSection === "Document Availability Check" ||
            String(question.id || "").includes("-DOC-AVAILABILITY-");

        const evidenceType = rawEvidenceType === "document_availability_check"
            ? "document"
            : rawEvidenceType;

        const availabilityOnlyNotice = "Thailand document handling: availability check only. No legal, financial, technical or governance document review has been performed.";

        const answer = activeScope.answers?.[question.id] || null;

        const evidence = EvidenceManager.create({
            caseId: activeScope.caseId,
            buildingId: activeScope.buildingId || null,
            inspectionId: activeScope.inspectionId || null,
            type: evidenceType,
            category: isDocumentAvailabilityCheck ? "Document Availability Check" : (question.category || "Inspection Scope"),
            title: isDocumentAvailabilityCheck
                ? `Document availability check · ${question.question}`
                : `${this.formatEvidenceType(evidenceType)} ${LanguageManager.t("FoundationEvidenceRequiredSuffix")} · ${question.question}`,
            description: [
                LanguageManager.t("InspectionEvidenceRequirementGenerated"),
                isDocumentAvailabilityCheck ? availabilityOnlyNotice : "",
                `Question: ${question.id}`,
                `Module: ${question.module}`,
                `Category: ${question.category}`,
                `Component: ${question.component || "Not specified"}`,
                isDocumentAvailabilityCheck ? "Review boundary: availability recorded only. Content, legal validity, financial adequacy and governance completeness are not assessed by this action." : ""
            ].filter(Boolean).join("\n"),
            buildingSystem: question.module || "",
            componentId: question.component || null,
            source: "Inspection Scope",
            sourceType: "inspection-scope",
            sourceQuestionId: question.id,
            sourceQuestion: question.question,
            sourceModule: question.module || "",
            sourceCategory: question.category || "",
            sourceRequiredEvidence: requirement.requiredEvidence || [],
            sourceRequiredEvidenceRaw: rawEvidenceType,
            sourcePolicy: isDocumentAvailabilityCheck ? "availability_check_only" : "",
            scopeId: activeScope.id,
            status: "Open",
            tags: [
                "inspection-scope",
                question.id,
                ...(requirement.requiredEvidence || []),
                ...(isDocumentAvailabilityCheck ? ["availability-check-only", "no-document-review"] : [])
            ]
        });

        EvidenceManager.set(evidence);

        const updatedAnswers = {
            ...(activeScope.answers || {}),
            [question.id]: {
                ...(answer || {}),
                questionId: question.id,
                caseId: activeScope.caseId,
                buildingId: activeScope.buildingId || null,
                inspectionId: activeScope.inspectionId || null,
                value: answer?.value || answer?.answer || "yes",
                evidenceIds: [...new Set([...(answer?.evidenceIds || []), evidence.id])],
                updatedAt: new Date().toISOString()
            }
        };

        const updatedScope = {
            ...activeScope,
            answers: updatedAnswers,
            evidenceRequirements: (activeScope.evidenceRequirements || [])
                .filter(item => item.questionId !== question.id),
            coverage: InspectionScopeManager.createCoverageSummary(
                activeScope.questions || [],
                updatedAnswers
            ),
            updatedAt: new Date().toISOString()
        };

        InspectionScopeManager.update(updatedScope);

        Notification.success(LanguageManager.t("InspectionEvidenceCreatedFromScope"));
        sessionStorage.setItem("workspaceScrollTarget", "evidence-list");
        window.location.hash = "evidence";
    }

    static formatEvidenceType(type = "note") {
        return String(type)
            .replace(/_/g, " ")
            .replace(/\b\w/g, character => character.toUpperCase());
    }

    static startAdaptiveScope(activeInspection = null) {
        try {
            const isPattayaProfile = this.getInspectionProfile() === "pattaya";

            let currentCase = CaseManager.getCurrent();
            let inspection = activeInspection || InspectionManager.getInspection();

            if (!currentCase && isPattayaProfile) {
                currentCase = CaseManager.getAll()[0] || null;

                if (currentCase) {
                    CaseManager.open(currentCase);
                }
            }

            if (!inspection && isPattayaProfile) {
                inspection = InspectionManager.getAllInspections()[0] || null;

                if (inspection) {
                    InspectionManager.set(inspection);
                }
            }

            const currentBuilding = currentCase?.buildingId
                ? BuildingManager.load(currentCase.buildingId)
                : BuildingManager.get();

            if (!currentCase) {
                Notification.info(LanguageManager.t("InspectionOpenCaseBeforeScope"));
                return;
            }

            if (!inspection) {
                Notification.info(LanguageManager.t("InspectionCreateOrSelectBeforeScope"));
                return;
            }

            const existing = this.getActiveScope(inspection);

            if (existing) {
                InspectionScopeManager.set(existing);
                Notification.info(LanguageManager.t("InspectionAdaptiveScopeAlreadyActive"));
                this.refresh();
                return;
            }

            const catalogOptions = this.getCatalogOptions();
            const scope = InspectionScopeManager.create({
                ...InspectionQuestionCatalog.createStarterScopeData(catalogOptions),
                caseId: currentCase.id,
                buildingId: inspection.buildingId || currentBuilding?.id || currentCase.buildingId || null,
                inspectionId: inspection.id,
                profile: this.getInspectionProfile(),
                country: catalogOptions.country || null,
                region: catalogOptions.region || null,
                title: `${LanguageManager.t("InspectionScopeTitlePrefix")} · ${inspection.title || inspection.id}`,
                status: "Draft"
            });

            InspectionScopeManager.set(scope);
            Notification.success(LanguageManager.t("InspectionAdaptiveScopeStarted"));
            this.refresh();
        } catch (error) {
            console.error(LanguageManager.t("InspectionScopeStartFailedLog"), error);
            Notification.warning(LanguageManager.t("InspectionScopeCouldNotStart"));
        }
    }

    static createToolbar() {
        const wrapper = document.createElement("section");
        wrapper.className = "workflow-card";

        wrapper.appendChild(ActionBar.create([
            {
                id: "refresh",
                label: LanguageManager.t("InspectionRefreshAction"),
                onClick: () => this.refresh()
            },
            {
                id: "close-inspection",
                label: LanguageManager.t("InspectionCloseAction"),
                onClick: () => {
                    InspectionManager.clear();
                    this.refresh();
                }
            }
        ]));

        return wrapper;
    }

    static createMainLayout(inspections = [], activeInspection = null) {
        const layout = document.createElement("section");
        layout.className = "case-workspace-layout inspection-workspace-layout";

        const primaryColumn = document.createElement("div");
        primaryColumn.className = "workspace-primary-column";

        const intelligenceSnapshot = this.createInspectionIntelligenceSnapshot(activeInspection);
        if (intelligenceSnapshot) {
            primaryColumn.appendChild(intelligenceSnapshot);
        }

        primaryColumn.appendChild(this.createContent(inspections));

        const toolbar = this.createToolbar();
        toolbar.classList.add("workspace-full-width");

        layout.appendChild(toolbar);
        layout.appendChild(primaryColumn);
        layout.appendChild(this.createDetailPanel(activeInspection));

        return layout;
    }

    static createContent(inspections = []) {
        if (!inspections.length) {
            return EmptyState.create({
                eyebrow: LanguageManager.t("InspectionWorkspaceTitle"),
                title: LanguageManager.t("InspectionEmptyTitle"),
                description: LanguageManager.t("InspectionEmptyDescription"),
                actionLabel: LanguageManager.t("InspectionNewAction"),
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
        title.textContent = inspection.title || LanguageManager.t("InspectionTechnicalPropertyReviewFallback");

        const meta = document.createElement("p");
        meta.textContent = [
            inspection.location || LanguageManager.t("InspectionLocationPending"),
            inspection.inspector || LanguageManager.t("InspectionInspectorPending"),
            inspection.status || LanguageManager.t("InspectionStatusDraftLower")
        ].join(" · ");

        const badge = document.createElement("span");
        badge.className = "tag";
        badge.textContent = inspection.status || LanguageManager.t("InspectionStatusDraftLower");

        content.appendChild(title);
        content.appendChild(meta);
        row.appendChild(content);
        row.appendChild(badge);

        return row;
    }

    static createDetailPanel(activeInspection = null) {
        if (!activeInspection) {
            return DetailPanel.create(LanguageManager.t("InspectionContextTitle"), [
                { label: LanguageManager.t("InspectionCurrentLabel"), value: LanguageManager.t("InspectionNotSelected") },
                { label: LanguageManager.t("InspectionStatusLabel"), value: LanguageManager.t("InspectionNotStarted") },
                { label: LanguageManager.t("InspectionNextStepLabel"), value: LanguageManager.t("InspectionCreateOrSelect") }
            ]);
        }

        return DetailPanel.create(LanguageManager.t("InspectionContextTitle"), [
            { label: LanguageManager.t("InspectionCurrentLabel"), value: activeInspection.title || activeInspection.id },
            { label: LanguageManager.t("InspectionStatusLabel"), value: activeInspection.status || LanguageManager.t("InspectionStatusDraftLower") },
            { label: LanguageManager.t("InspectionBuildingIdLabel"), value: activeInspection.buildingId || LanguageManager.t("InspectionNotLinked") },
            { label: LanguageManager.t("InspectionInspectorLabel"), value: activeInspection.inspector || LanguageManager.t("InspectionNotAssigned") }
        ]);
    }

    static refresh() {
        const container = document.getElementById("workspace-page");

        if (!container) return;

        container.innerHTML = "";
        container.appendChild(this.render());
    }

    static createSampleInspection() {
        const currentCase = CaseManager.getCurrent();
        const currentBuilding = currentCase?.buildingId
            ? BuildingManager.load(currentCase.buildingId)
            : BuildingManager.get();

        if (!currentCase) {
            Notification.info(LanguageManager.t("InspectionOpenCaseBeforeCreating"));
            return;
        }

        const inspection = InspectionManager.create({
            buildingId: currentBuilding?.id || currentCase.buildingId || null,
            caseId: currentCase.id,
            title: LanguageManager.t("InspectionTechnicalPropertyReviewFallback"),
            location: "Demo Property",
            notes: "Initial inspection record created from the workspace."
        });

        Notification.success(LanguageManager.t("InspectionCreatedNotification"));
        InspectionManager.set(inspection);
        this.refresh();
    }

    static showPendingFeature(feature = "This feature") {
        Notification.info(`${feature} ${LanguageManager.t("InspectionPendingFeatureReserved")}`);
    }

}
