import ReportManager from "../../core/ReportManager.js";
import CaseManager from "../../core/CaseManager.js";
import BuildingManager from "../../core/BuildingManager.js";
import InspectionManager from "../../core/InspectionManager.js";
import DecisionManager from "../../core/DecisionManager.js";
import AssessmentManager from "../../core/AssessmentManager.js";
import DemoDatasetManager from "../../core/DemoDatasetManager.js";
import IntelligenceEngine from "../../core/IntelligenceEngine.js";
import ReportOutputGovernanceManager from "../../core/ReportOutputGovernanceManager.js";
import ReportFinalizationLockManager from "../../core/ReportFinalizationLockManager.js";
import LanguageManager from "../../core/LanguageManager.js";
import SectionHeader from "../components/SectionHeader.js";
import WorkflowContextBanner from "../components/WorkflowContextBanner.js";
import WorkflowProgressPanel from "../components/WorkflowProgressPanel.js";
import ActionBar from "../components/ActionBar.js";
import EmptyState from "../components/EmptyState.js";
import DetailPanel from "../components/DetailPanel.js";
import ReviewAuditTrailFields from "../components/ReviewAuditTrailFields.js";
import MetricCard from "../components/MetricCard.js";
import StatusBadge from "../components/StatusBadge.js";
import Notification from "../components/Notification.js";
import FormDialog from "../components/FormDialog.js";

export default class ReportPage {

    static outputSteps = [
        {
            key: "decision",
            label: "Decision",
            description: "Governance decision confirmed"
        },
        {
            key: "report",
            label: "Report",
            description: "Draft report output prepared"
        }
    ];

    static getStatusLabels() {
        return {
            draft: "Draft",
            prepared: LanguageManager.t("ReportDraftPrepared"),
            preparedOutput: LanguageManager.t("ReportDraftPrepared"),
            reviewed: "Reviewed",
            finalized: "Finalized",
            blocked: "Blocked"
        };
    }

    static getActiveReport() {
        const activeReport = ReportManager.get();

        if (activeReport?.id === "DEMO-RPT-001") {
            return ReportManager.load("DEMO-RPT-001") || activeReport;
        }

        return activeReport;
    }

    static render() {
        const fragment = document.createDocumentFragment();
        const reports = this.getReports();
        const activeReport = this.getActiveReport();

        fragment.appendChild(this.createHeader(activeReport));
        const currentCase = CaseManager.getCurrent();
        fragment.appendChild(WorkflowContextBanner.create(currentCase));
        fragment.appendChild(WorkflowProgressPanel.create(currentCase, "reports"));
        fragment.appendChild(this.createMetrics(reports));
        fragment.appendChild(this.createDemoReviewState(activeReport));
        const reportOverview = document.createElement("section");
        reportOverview.className = "report-polish-stack";
        reportOverview.appendChild(this.createFinalOutputState(activeReport));
        reportOverview.appendChild(this.createCompletionPanel(activeReport));

        fragment.appendChild(reportOverview);

        if (activeReport) {
            fragment.appendChild(this.createReportIntelligenceSnapshot(activeReport));
        }

        fragment.appendChild(this.createToolbar());

        if (activeReport) {
            fragment.appendChild(this.createReportPreview(activeReport));
        }

        fragment.appendChild(this.createMainLayout(reports, activeReport));

        return fragment;
    }

    static createHeader(activeReport = null) {
        return SectionHeader.create({
            eyebrow: "Report Workspace",
            title: LanguageManager.t("FinalReportsLabel"),
            description: activeReport
                ? `Active report: ${this.getDisplayTitle(activeReport)}`
                : "Prepare professional Technical Due Diligence report output for review.",
            actions: [
                {
                    id: "new-report",
                    label: LanguageManager.t("ReportNewReportAction"),
                    onClick: () => this.createSampleReport()
                }
            ]
        });
    }

    static createMetrics(reports = this.getReports()) {
        const draftCount = reports.filter(item => item.status === "Draft").length;
        const approvedCount = reports.filter(item => item.status === "Approved").length;
        const archivedCount = reports.filter(item => item.status === "Archived").length;

        const grid = document.createElement("section");
        grid.className = "metrics-grid";

        grid.appendChild(MetricCard.create(LanguageManager.t("FinalReportsLabel"), reports.length));
        grid.appendChild(MetricCard.create("Drafts", draftCount));
        grid.appendChild(MetricCard.create("Approved", approvedCount));
        grid.appendChild(MetricCard.create("Archived", archivedCount));

        return grid;
    }

    static createDemoReviewState(activeReport = null) {
        const status = DemoDatasetManager.getStatus();

        if (!activeReport || activeReport.id !== "DEMO-RPT-001" || !status.isActive) {
            return document.createDocumentFragment();
        }

        const integrityLabel = status.integrity?.isValid
            ? "Workflow links valid"
            : "Workflow links incomplete";

        const container = document.createElement("section");
        container.className = "workflow-card report-demo-review";
        container.innerHTML = `
            <div>
                <span class="report-demo-review__eyebrow">Controlled Demo Report</span>
                <strong>Ready for professional review</strong>
                <p>${status.completeRecords} of ${status.totalRecords} demo records available. ${integrityLabel}.</p>
            </div>
            <div class="report-demo-review__actions">
                <span class="report-demo-review__status">${status.percent}%</span>
                <button type="button" class="report-demo-review__print" data-demo-report-print>
                    Print / Save PDF
                </button>
            </div>
        `;

        const printButton = container.querySelector("[data-demo-report-print]");
        if (printButton) {
            printButton.addEventListener("click", () => {
                this.printOrSavePdf(activeReport);
            });
        }

        return container;
    }

    static getOutputState(report = {}) {
        report = report || {};
        const hasDecisionLink =
            (Array.isArray(report.decisionIds) && report.decisionIds.length > 0) ||
            Boolean(report.decisionId) ||
            Boolean(report.linkedDecisionId) ||
            Boolean(report.decision) ||
            Boolean(report.hasDecision);

        const isFinalized =
            Boolean(report.finalized) ||
            Boolean(report.approved) ||
            report.status === "final" ||
            report.status === "finalized" ||
            report.status === "approved";

        return {
            decision: hasDecisionLink ? "complete" : "next",
            report: isFinalized ? "complete" : "active"
        };
    }

    static renderFinalOutputState(report = {}) {
        report = report || {};
        const outputState = this.getOutputState(report);

        return `
            <section class="workspace-flow" aria-label="Final output state">
                <div class="workspace-flow__header">
                    <span class="workspace-flow__eyebrow">${LanguageManager.t("ReportFinalOutputLabel")}</span>
                    <strong>Decision → Report</strong>
                </div>

                <div class="workspace-flow__steps">
                    ${this.outputSteps.map((step) => `
                        <div class="workspace-flow__step workspace-flow__step--${outputState[step.key]}">
                            <div class="workspace-flow__marker"></div>
                            <div>
                                <strong>${step.label}</strong>
                                <span>${step.description}</span>
                            </div>
                        </div>
                    `).join("")}
                </div>
                            ${this.renderOutputGovernanceState(report)}
            </section>
        `;
    }

    static renderOutputGovernanceState(report = {}) {
        const draftOutput = ReportOutputGovernanceManager.validateDraftOutput(report);
        const finalOutput = ReportOutputGovernanceManager.validateFinalOutput(report);
        const externalOutput = ReportOutputGovernanceManager.validateExternalOutput(report);

        const items = [
            {
                label: LanguageManager.t("ReportOutputGovernanceDraftStatusLabel"),
                result: draftOutput
            },
            {
                label: LanguageManager.t("ReportOutputGovernanceFinalStatusLabel"),
                result: finalOutput
            },
            {
                label: LanguageManager.t("ReportOutputGovernanceExternalStatusLabel"),
                result: externalOutput
            }
        ];

        return `
            <div class="workflow-context__meta report-output-governance-state">
                <strong>${LanguageManager.t("ReportOutputGovernanceStateLabel")}</strong>
                ${items.map(item => `
                    <span>
                        ${item.label}: ${item.result.canProceed
                            ? LanguageManager.t("ReportOutputGovernancePassedLabel")
                            : LanguageManager.t("ReportOutputGovernanceBlockedLabel")}
                    </span>
                    <small>${LanguageManager.t("ReportOutputGovernanceReasonLabel")}: ${item.result.reason}</small>
                `).join("")}
            </div>
        `;
    }

    static createFinalOutputState(report = {}) {
        const container = document.createElement("section");
        container.className = "workflow-card";
        container.innerHTML = this.renderFinalOutputState(report);
        return container;
    }

    static getReportIntelligence(report = {}) {
        const hasIdentity = Boolean(report.title || report.name);
        const hasReportType = Boolean(report.reportType || report.type || report.template);
        const hasDecisionLink = Boolean(
            (Array.isArray(report.decisionIds) && report.decisionIds.length > 0) ||
            report.decisionId ||
            report.linkedDecisionId ||
            report.decision ||
            report.hasDecision
        );
        const hasContent = Boolean(
            report.summary ||
            report.executiveSummary ||
            report.content ||
            report.sections
        );
        const isPrepared = report.status === "Prepared" || report.status === "prepared";
        const hasOutput = Boolean(
            report.prepared ||
            report.preparedAt ||
            report.fileUrl ||
            report.pdfUrl ||
            report.status === "Prepared" ||
            report.status === "prepared" ||
             report.status === "prepared"
        );
        const isReviewed = Boolean(
            report.reviewed ||
            report.status === "reviewed" ||
            (isPrepared && hasContent && hasDecisionLink)
        );
        const isFinalized = Boolean(
            report.finalized ||
            report.approved ||
            report.status === "final" ||
            report.status === "finalized" ||
            report.status === "approved"
        );

        const checks = [
            hasIdentity,
            hasReportType,
            hasDecisionLink,
            hasContent,
            hasOutput,
            isReviewed,
            isFinalized
        ];

        const readiness = IntelligenceEngine.getReadinessFromChecks(checks);
        const completed = readiness.completed;
        const total = readiness.total;
        const readinessPercent = readiness.percent;

        const confidenceScore = IntelligenceEngine.getConfidenceScore({
            readinessPercent,
            primarySignals:
                (hasContent ? 1 : 0) +
                (hasDecisionLink ? 1 : 0),
            downstreamSignals: hasOutput ? 1 : 0,
            outputSignals: isFinalized ? 1 : 0,
            weights: {
                readiness: 0.64,
                primary: 9,
                downstream: 8,
                output: 10
            }
        });

        let outputQualitySignal = {
            label: "Low output quality",
            description: "Report output is still incomplete. Prepare content, link decision and generate output.",
            tone: "draft"
        };

        if (hasContent && hasDecisionLink && hasOutput && isFinalized) {
            outputQualitySignal = {
                label: "Strong output quality",
                description: "Report contains decision context, prepared content, draft output and final approval.",
                tone: "ready"
            };
        } else if (hasContent && hasDecisionLink) {
            outputQualitySignal = {
                label: "Developing output quality",
                description: "Report has meaningful content and decision context. Draft output or expert finalization may still be pending.",
                tone: "active"
            };
        }

        const nextAction = isFinalized
            ? {
                label: "Archive approved report",
                description: "Report is finalized. Confirm approved export or archive workflow.",
                tone: "ready"
            }
            : hasOutput
                ? {
                    label: "Review draft report",
                    description: "Draft output exists. Complete expert review before final use.",
                    tone: "active"
                }
                : hasContent && hasDecisionLink
                    ? {
                        label: LanguageManager.t("ReportPrepareDraftReportOutput"),
                        description: LanguageManager.t("ReportPrepareDraftReportOutputDescription"),
                        tone: "active"
                    }
                    : {
                        label: "Prepare report content",
                        description: "Add report content, type and decision context before generating output.",
                        tone: "draft"
                    };

        return {
            completed,
            total,
            readinessPercent,
            confidenceScore,
            outputQualitySignal,
            nextAction,
            label: readinessPercent >= 100
                ? "Report intelligence complete"
                : readinessPercent >= 50
                    ? LanguageManager.t("ReportIntelligenceDeveloping")
                    : "Report intelligence early"
        };
    }

    static getCompletionState(report = {}) {
        report = report || {};
        const hasTitle = Boolean(report.title || report.name);
        const hasReportType = Boolean(report.reportType || report.type || report.template);
        const hasDecisionLink = Boolean(
            (Array.isArray(report.decisionIds) && report.decisionIds.length > 0) ||
            report.decisionId ||
            report.linkedDecisionId ||
            report.decision ||
            report.hasDecision
        );
        const hasContent = Boolean(
            report.summary ||
            report.executiveSummary ||
            report.content ||
            report.sections
        );
        const isPrepared = report.status === "Prepared" || report.status === "prepared";
        const hasOutput = Boolean(
            report.prepared ||
            report.preparedAt ||
            report.fileUrl ||
            report.pdfUrl ||
            isPrepared ||
             report.status === "prepared"
        );
        const isFinalized = Boolean(
            report.finalized ||
            report.approved ||
            report.status === "final" ||
            report.status === "finalized" ||
            report.status === "approved"
        );

        const checks = [
            {
                key: "identity",
                label: LanguageManager.t("ReportIdentified"),
                complete: hasTitle
            },
            {
                key: "type",
                label: LanguageManager.t("ReportTypeDefined"),
                complete: hasReportType
            },
            {
                key: "decision",
                label: LanguageManager.t("ReportDecisionLinked"),
                complete: hasDecisionLink
            },
            {
                key: "content",
                label: LanguageManager.t("ReportContentPrepared"),
                complete: hasContent
            },
            {
                key: "output",
                label: LanguageManager.t("ReportDraftOutputPrepared"),
                complete: hasOutput
            },
            {
                key: "final",
                label: LanguageManager.t("ReportFinalizationPending"),
                complete: isFinalized
            }
        ];

        const completed = checks.filter((check) => check.complete).length;
        const total = checks.length;

        return {
            checks,
            completed,
            total,
            ratio: total > 0 ? completed / total : 0,
            isReadyForFinalReview: hasTitle && hasReportType && hasDecisionLink && hasContent,
            isComplete: completed === total
        };
    }

    static renderCompletionPanel(report = {}) {
        report = report || {};
        const completion = this.getCompletionState(report);
        const percent = Math.round(completion.ratio * 100);
        const readinessLabel = completion.isComplete
            ? LanguageManager.t("ReportFinalReportComplete")
            : completion.isReadyForFinalReview
                ? LanguageManager.t("ReportReadyForExpertReview")
                : LanguageManager.t("ReportNeedsMoreData");

        return `
            <section class="completion-panel" aria-label="Report completion">
                <div class="completion-panel__header">
                    <div>
                        <span class="completion-panel__eyebrow">${LanguageManager.t("ReportCompletionLabel")}</span>
                        <strong>${readinessLabel}</strong>
                    </div>
                    <span class="completion-panel__score">${percent}%</span>
                </div>

                <div class="completion-panel__bar" aria-hidden="true">
                    <div class="completion-panel__bar-fill" style="width: ${percent}%"></div>
                </div>

                <div class="completion-panel__checks">
                    ${completion.checks.map((check) => `
                        <div class="completion-panel__check ${check.complete ? "is-complete" : "is-open"}">
                            <span class="completion-panel__check-marker"></span>
                            <span>${check.label}</span>
                        </div>
                    `).join("")}
                </div>
            </section>
        `;
    }

    static createCompletionPanel(report = {}) {
        const container = document.createElement("section");
        container.className = "workflow-card";
        container.innerHTML = this.renderCompletionPanel(report);
        return container;
    }

    static renderReportIntelligenceSnapshot(report = {}) {
        report = report || {};
        const intelligence = this.getReportIntelligence(report);

        return `
            <section class="report-intelligence intelligence-snapshot" aria-label="Report intelligence snapshot">
                <div class="report-intelligence__header intelligence-snapshot__header">
                    <div>
                        <span class="report-intelligence__eyebrow intelligence-snapshot__eyebrow">${LanguageManager.t("ReportIntelligenceLabel")}</span>
                        <strong>${intelligence.label}</strong>
                        <p>${intelligence.completed}/${intelligence.total} ${LanguageManager.t("ReportIntelligenceChecksCompleted")}</p>
                    </div>
                    <span class="report-intelligence__score intelligence-snapshot__score">${intelligence.confidenceScore}%</span>
                </div>

                <div class="report-intelligence__grid intelligence-snapshot__grid">
                    <article class="report-intelligence__card intelligence-snapshot__card">
                        <span>${LanguageManager.t("ReportFinalReviewReadinessLabel")}</span>
                        <strong>${intelligence.readinessPercent}%</strong>
                        <p>${LanguageManager.t("ReportFinalReviewReadinessDescription")}</p>
                    </article>

                    <article class="report-intelligence__card intelligence-snapshot__card report-intelligence__card--${intelligence.outputQualitySignal.tone} intelligence-snapshot__card--${intelligence.outputQualitySignal.tone}">
                        <span>${LanguageManager.t("ReportOutputQualitySignalLabel")}</span>
                        <strong>${intelligence.outputQualitySignal.label}</strong>
                        <p>${intelligence.outputQualitySignal.description}</p>
                    </article>

                    <article class="report-intelligence__card intelligence-snapshot__card report-intelligence__card--${intelligence.nextAction.tone} intelligence-snapshot__card--${intelligence.nextAction.tone}">
                        <span>${LanguageManager.t("ReportNextReportActionLabel")}</span>
                        <strong>${intelligence.nextAction.label}</strong>
                        <p>${intelligence.nextAction.description}</p>
                    </article>
                </div>
            </section>
        `;
    }

    static createReportIntelligenceSnapshot(report = {}) {
        const container = document.createElement("section");
        container.className = "workflow-card";
        container.innerHTML = this.renderReportIntelligenceSnapshot(report);
        return container;
    }

    static getReportStatus(report = {}) {
        if (report.blocked || report.status === "blocked") {
            return "blocked";
        }

        if (
            report.finalized ||
            report.approved ||
            report.status === "final" ||
            report.status === "finalized" ||
            report.status === "approved"
        ) {
            return "finalized";
        }

        if (report.reviewed || report.status === "reviewed") {
            return "reviewed";
        }

        if (
            report.prepared ||
            report.preparedAt ||
            report.fileUrl ||
            report.pdfUrl ||
            report.status === "prepared"
        ) {
            return "prepared";
        }

        if (
            report.prepared ||
            report.title ||
            report.name ||
            report.reportType ||
            report.template ||
            report.status === "prepared"
        ) {
            return "prepared";
        }

        return "draft";
    }

    static renderReportStatusBadge(report = {}) {
        report = report || {};
        const status = this.getReportStatus(report);
        const label = this.getStatusLabels()[status] || "Draft";

        return `
            <span class="evidence-status evidence-status--${status}">
                ${label}
            </span>
        `;
    }

    static createToolbar() {
        const wrapper = document.createElement("section");
        wrapper.className = "workflow-card";

        wrapper.appendChild(ActionBar.create([
            {
                id: "refresh",
                label: LanguageManager.t("ReportRefreshAction"),
                onClick: () => this.refresh()
            },
            {
                id: "close-report",
                label: LanguageManager.t("ReportCloseAction"),
                onClick: () => {
                    ReportManager.clear();
                    this.refresh();
                }
            },
            {
                id: "generate-report",
                label: LanguageManager.t("ReportPrepareAction"),
                onClick: () => this.generateReportOutput()
            },
            {
                id: "export-pdf",
                label: LanguageManager.t("ReportPrintSavePdfAction"),
                onClick: () => this.printOrSavePdf()
            }
        ]));

        return wrapper;
    }

    static createMainLayout(reports = this.getReports(), activeReport = ReportManager.get()) {
        const layout = document.createElement("section");
        layout.className = "case-workspace-layout";

        layout.appendChild(this.createContent(reports));
        layout.appendChild(this.createDetailPanel(activeReport, reports));

        return layout;
    }

    static createContent(reports = this.getReports()) {
        if (!reports.length) {
            return EmptyState.create({
                eyebrow: "Report Workspace",
                title: LanguageManager.t("ReportEmptyTitle"),
                description: LanguageManager.t("FoundationReportEmptyDescription"),
                actionLabel: LanguageManager.t("ReportNewReportAction"),
                onAction: () => this.createSampleReport()
            });
        }

        const list = document.createElement("section");
        list.className = "workflow-card evidence-list";

        reports.forEach(report => {
            list.appendChild(this.createReportRow(report));
        });

        return list;
    }

    static createReportRow(report) {
        const row = document.createElement("article");
        row.className = "evidence-row";
        row.addEventListener("click", () => {
            ReportManager.set(report);
            this.refresh();
        });

        const content = document.createElement("button");
        content.type = "button";
        content.className = "evidence-row__content";

        const title = document.createElement("strong");
        title.textContent = this.getDisplayTitle(report);

        const meta = document.createElement("span");
        meta.textContent = [
            report.reportType || "Technical Due Diligence",
            this.formatReportStatus(report),
            report.source || ""
        ].filter(Boolean).join(" · ");

        const statusContainer = document.createElement("span");
        statusContainer.innerHTML = this.renderReportStatusBadge(report);

        content.appendChild(title);
        content.appendChild(meta);
        content.appendChild(statusContainer);

        const actions = document.createElement("div");
        actions.className = "evidence-row__actions";

        const lockState = ReportFinalizationLockManager.getLockState(report);

        [
            ["open", LanguageManager.t("ReportOpenAction"), true],
            ["edit", LanguageManager.t("ReportEditAction"), lockState.canEdit],
            ["delete", LanguageManager.t("ReportDeleteAction"), lockState.canDelete]
        ].forEach(([action, label, isAllowed]) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = isAllowed ? "button" : "button secondary";
            button.textContent = isAllowed ? label : `${label} · ${LanguageManager.t("ReportLockedActionLabel")}`;
            button.disabled = !isAllowed;
            button.title = isAllowed ? "" : lockState.reason;

            button.addEventListener("click", event => {
                event.stopPropagation();

                if (!isAllowed) {
                    Notification.warning(LanguageManager.t("ReportLockedActionNotification"));
                    return;
                }

                if (action === "open") {
                    ReportManager.set(report);
                    this.refresh();
                    return;
                }

                if (action === "edit") {
                    ReportManager.set(report);
                    this.editSelectedReport();
                    return;
                }

                if (action === "delete") {
                    this.deleteReport(report);
                }
            });

            actions.appendChild(button);
        });

        row.appendChild(content);
        row.appendChild(actions);

        return row;
    }

    static escapeHtml(value = "") {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    static formatReportStatus(report = {}) {
        const status = this.getReportStatus(report);
        return this.getStatusLabels()[status] || report.status || "Draft";
    }

    static formatIdList(values = []) {
        return values.length ? values.join(", ") : LanguageManager.t("ReportLegacyNotLinked");
    }

    static getCleanExecutiveSummary(report = {}) {
        const rawSummary = String(report.executiveSummary || "").trim();
        const traceMarkers = [
            "Decision trace:",
            "Recommendation trace:",
            "Assessment trace:",
            "Finding trace:"
        ];

        if (traceMarkers.some(marker => rawSummary.includes(marker))) {
            return [
                LanguageManager.t("ReportSummaryTraceSentenceOne"),
                LanguageManager.t("ReportSummaryTraceSentenceTwo")
            ].join(" ");
        }

        return rawSummary || LanguageManager.t("ReportDefaultExecutiveSummary");
    }

    static getLocalizedScope(report = {}) {
        const scope = String(report.scope || "").trim();

        if (!scope) {
            return LanguageManager.t("ReportScopeFallback");
        }

        if (scope === "Report preparation based on document availability context only.") {
            return LanguageManager.t("ReportScopeDocumentAvailability");
        }

        return scope;
    }

    static getLocalizedMethodology(report = {}) {
        const methodology = String(report.methodology || "").trim();

        if (!methodology) {
            return LanguageManager.t("ReportMethodologyFallback");
        }

        if (methodology === "Evidence-first workflow chain review. Expert review required before final report use.") {
            return LanguageManager.t("ReportMethodologyExpertReview");
        }

        if (methodology === "Evidence-based workflow review.") {
            return LanguageManager.t("ReportMethodologyFallback");
        }

        return methodology;
    }

    static formatSourceMeasurement(report = {}) {
        if (
            report.sourceMeasurementValue === null ||
            report.sourceMeasurementValue === undefined ||
            report.sourceMeasurementValue === ""
        ) {
            return LanguageManager.t("ReportNone");
        }

        return `${report.sourceMeasurementValue}${report.sourceMeasurementUnit ? " " + report.sourceMeasurementUnit : ""}`;
    }

    static getReportTraceRows(report = {}) {
        return [
            [LanguageManager.t("ReportSourceLabel"), report.source || LanguageManager.t("ReportDecisionReview")],
            [LanguageManager.t("ReportBuildingIdLabel"), report.buildingId || LanguageManager.t("ReportNotLinked")],
            [LanguageManager.t("ReportInspectionIdLabel"), report.inspectionId || LanguageManager.t("ReportNotLinked")],
            [LanguageManager.t("ReportDecisionIdsLabel"), this.formatIdList(report.decisionIds || [])],
            [LanguageManager.t("ReportRecommendationIdsLabel"), this.formatIdList(report.recommendationIds || [])],
            [LanguageManager.t("ReportAssessmentIdsLabel"), this.formatIdList(report.assessmentIds || [])],
            [LanguageManager.t("ReportFindingIdsLabel"), this.formatIdList(report.findingIds || [])],
            [LanguageManager.t("ReportEvidenceIdsLabel"), this.formatIdList(report.evidenceIds || [])],
            [LanguageManager.t("ReportBuildingSystemLabel"), report.buildingSystem || LanguageManager.t("ReportNotLinked")],
            ["File name", report.sourceFileName || LanguageManager.t("ReportNone")],
            ["File type", report.sourceFileType || LanguageManager.t("ReportNone")],
            ["File reference", report.sourceFileReference || LanguageManager.t("ReportNone")],
            ["Capture method", report.sourceCaptureMethod || LanguageManager.t("ReportNone")],
            ["Location label", report.sourceLocationLabel || LanguageManager.t("ReportNone")],
            ["Inspection area", report.sourceInspectionArea || LanguageManager.t("ReportNone")],
            ["Measurement", this.formatSourceMeasurement(report)],
            ["Evidence review status", report.sourceReviewStatus || LanguageManager.t("ReportNone")],
            ["Expert review required", report.sourceExpertReviewRequired === false ? "No" : "Yes"],
            [LanguageManager.t("ReportRiskScoreLabel"), String(report.riskScore || 0)],
            [LanguageManager.t("ReportDecisionImpactLabel"), report.decisionImpact || "Medium"],
            [LanguageManager.t("ReportRiskLevelLabel"), report.riskLevel || "Medium"]
        ];
    }

    static isDraftPreparedForReview(report = {}) {
        return (
            this.getReportStatus(report) === "prepared" ||
            report.prepared ||
            report.preparedAt ||
            report.status === "Prepared" ||
            report.status === "prepared"
        );
    }

    static formatDraftExportFormat(report = {}) {
        if (report.exportFormat === "PDF") {
            return LanguageManager.t("ReportPrintSavePdfDraft");
        }

        return report.exportFormat || (this.isDraftPreparedForReview(report) ? LanguageManager.t("ReportPrintSavePdfDraft") : LanguageManager.t("ReportPending"));
    }

    static formatDraftPreparedValue(report = {}) {
        if (report.preparedAt) {
            return new Date(report.preparedAt).toLocaleString();
        }

        return this.isDraftPreparedForReview(report)
            ? LanguageManager.t("ReportDraftPreparedForExpertReview")
            : LanguageManager.t("ReportPending");
    }

    static getReportStatusRows(report = {}) {
        return [
            [LanguageManager.t("ReportExportFormatLabel"), this.formatDraftExportFormat(report)],
            [LanguageManager.t("ReportDraftPrepared"), this.formatDraftPreparedValue(report)]
        ];
    }

    static isWorkflowDraftTitle(value = "") {
        const title = String(value || "").trim();

        return [
            "Report Draft:",
            "Decision Draft:",
            "Recommendation Draft:",
            "Assessment Draft:",
            "Finding Draft:"
        ].some(prefix => title.startsWith(prefix) || title.includes(` ${prefix}`));
    }

    static isDocumentAvailabilityReview(report = {}) {
        const values = [
            report.sourcePolicy,
            report.source,
            report.buildingSystem,
            report.title,
            report.sourceTitle
        ].map(value => String(value || "").toLowerCase());

        return values.some(value =>
            value.includes("availability_check_only") ||
            value.includes("document availability") ||
            value.includes("dokumenten-verfügbarkeit") ||
            value.includes("inspection scope evidence")
        );
    }

    static getDisplayTitle(report = {}) {
        const title = String(report?.title || "").trim();

        if (!title || title.startsWith("Report from ")) {
            return "Technical Due Diligence Report";
        }

        if (this.isWorkflowDraftTitle(title)) {
            return LanguageManager.t("ReportTechnicalDueDiligenceDraft");
        }

        return title;
    }

    static getSourceTitle(report = {}) {
        const title = String(report?.title || "").trim();
        const sourceTitle = String(report?.sourceTitle || "").trim();

        if (this.isDocumentAvailabilityReview(report)) {
            return LanguageManager.t("ReportDocumentAvailabilityReview");
        }

        if (sourceTitle && !this.isWorkflowDraftTitle(sourceTitle)) {
            return sourceTitle;
        }

        if (title.startsWith("Report from ")) {
            return title.replace(/^Report from\s*/, "");
        }

        if (this.isWorkflowDraftTitle(title) || this.isWorkflowDraftTitle(sourceTitle)) {
            return "Technical Due Diligence Decision Path";
        }

        return "";
    }

    static getReportSafetyNoticeItems(report = {}) {
        const items = [];

        if (report.expertReviewRequired !== false) {
            items.push(LanguageManager.t("ReportExpertReviewRequiredBeforeFinalUse"));
        }

        if (report.reportPreparationOnly) {
            items.push(LanguageManager.t("ReportDraftPreparationOnly"));
        }

        if (report.noAutomaticFinalReport) {
            items.push(LanguageManager.t("ReportNoFinalReportCreated"));
        }

        if (report.noAutomaticOpinion) {
            items.push(LanguageManager.t("ReportNoAutomaticExpertOpinion"));
        }

        if (report.sourcePolicy === "availability_check_only") {
            items.push(LanguageManager.t("ReportDocumentAvailabilityOnly"));
        }

        if (!items.length) {
            items.push(LanguageManager.t("ReportReviewBeforeExternalUse"));
        }

        return items;
    }

    static renderReportSafetyNotice(report = {}) {
        const items = this.getReportSafetyNoticeItems(report);

        return `
            <section class="report-preview__section report-preview__safety-notice" aria-label="Report safety notice">
                <div>
                    <span class="report-preview__section-label">${LanguageManager.t("ReportExpertReviewNotice")}</span>
                    <strong>${LanguageManager.t("ReportDraftBoundary")}</strong>
                </div>
                <ul>
                    ${items.map(item => `<li>${this.escapeHtml(item)}</li>`).join("")}
                </ul>
            </section>
        `;
    }

    static createReportPreview(report = {}) {
        const section = document.createElement("section");
        section.className = "workflow-card report-preview";

        const traceRows = this.getReportTraceRows(report);
        const statusRows = this.getReportStatusRows(report);
        const executiveSummary = this.getCleanExecutiveSummary(report);
        const displayTitle = this.getDisplayTitle(report);
        const sourceTitle = this.getSourceTitle(report);

        section.innerHTML = `
            <article class="report-preview__document">
                <header class="report-preview__cover">
                    <div>
                        <span class="report-preview__eyebrow">MEIFERTS Building Intelligence</span>
                        <h2>${this.escapeHtml(displayTitle)}</h2>
                        <p>${this.escapeHtml(report.reportType || "Technical Due Diligence")}</p>
                        ${sourceTitle ? `<p class="report-preview__source-title">${LanguageManager.t("ReportDecisionBasisLabel")}: ${this.escapeHtml(sourceTitle)}</p>` : ""}
                    </div>
                    <div class="report-preview__status">
                        <span>Status</span>
                        <strong>${this.escapeHtml(this.formatReportStatus(report))}</strong>
                    </div>
                </header>

                  ${this.renderReportSafetyNotice(report)}

                <section class="report-preview__section report-preview__summary">
                    <span class="report-preview__section-label">${LanguageManager.t("ReportExecutiveSummaryLabel")}</span>
                    <p>${this.escapeHtml(executiveSummary)}</p>
                </section>

                <div class="report-preview__grid">
                    <section class="report-preview__section">
                        <span class="report-preview__section-label">${LanguageManager.t("ReportScopeLabel")}</span>
                        <p>${this.escapeHtml(this.getLocalizedScope(report))}</p>
                    </section>

                    <section class="report-preview__section">
                        <span class="report-preview__section-label">${LanguageManager.t("ReportMethodologyLabel")}</span>
                        <p>${this.escapeHtml(this.getLocalizedMethodology(report))}</p>
                    </section>
                </div>

                <section class="report-preview__section report-preview__trace">
                    <span class="report-preview__section-label">${LanguageManager.t("ReportWorkflowTraceabilityLabel")}</span>
                    <table class="report-preview__table">
                        <tbody>
                            ${traceRows.map(([label, value]) => `
                                <tr>
                                    <th>${this.escapeHtml(label)}</th>
                                    <td>${this.escapeHtml(value)}</td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </section>

                <section class="report-preview__section report-preview__status-table">
                    <span class="report-preview__section-label">${LanguageManager.t("ReportOutputStatusLabel")}</span>
                    <table class="report-preview__table">
                        <tbody>
                            ${statusRows.map(([label, value]) => `
                                <tr>
                                    <th>${this.escapeHtml(label)}</th>
                                    <td>${this.escapeHtml(value)}</td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </section>
            </article>
        `;

        return section;
    }

    static createDetailPanel(activeReport = ReportManager.get(), reports = this.getReports()) {
        if (!activeReport) {
            return DetailPanel.create(LanguageManager.t("ReportContextTitle"), [
                { label: LanguageManager.t("ReportReportsLabel"), value: String(reports.length) },
                { label: LanguageManager.t("ReportSelectedReportLabel"), value: LanguageManager.t("ReportNotSelected") },
                { label: LanguageManager.t("ReportExecutiveSummaryLabel"), value: reports.length ? LanguageManager.t("ReportAvailableInDraft") : LanguageManager.t("ReportPending") },
                { label: LanguageManager.t("ReportNextStepLabel"), value: LanguageManager.t("ReportCreateOrSelectReport") }
            ]);
        }

        return DetailPanel.create(LanguageManager.t("ReportContextTitle"), [
            { label: LanguageManager.t("ReportSelectedReportLabel"), value: this.getDisplayTitle(activeReport) },
            { label: LanguageManager.t("ReportSourceTitleLabel"), value: this.getSourceTitle(activeReport) || LanguageManager.t("ReportNotLinked") },
            { label: LanguageManager.t("ReportReportStatusLabel"), value: this.formatReportStatus(activeReport) },
            ...ReviewAuditTrailFields.create(activeReport),
            { label: LanguageManager.t("ReportSafetyBoundariesLabel"), value: DetailPanel.createBoundaryBadges(activeReport) },
            { label: LanguageManager.t("ReportSourceLabel"), value: activeReport.source || LanguageManager.t("ReportDecisionReview") },
            { label: LanguageManager.t("ReportCaseIdLabel"), value: activeReport.caseId || LanguageManager.t("ReportNotLinked") },
            { label: LanguageManager.t("ReportBuildingIdLabel"), value: activeReport.buildingId || LanguageManager.t("ReportNotLinked") },
            { label: LanguageManager.t("ReportInspectionIdLabel"), value: activeReport.inspectionId || LanguageManager.t("ReportNotLinked") },
            { label: LanguageManager.t("ReportDecisionIdsLabel"), value: (activeReport.decisionIds || []).join(", ") || LanguageManager.t("ReportNone") },
            { label: LanguageManager.t("ReportRecommendationIdsLabel"), value: (activeReport.recommendationIds || []).join(", ") || LanguageManager.t("ReportNone") },
            { label: LanguageManager.t("ReportAssessmentIdsLabel"), value: (activeReport.assessmentIds || []).join(", ") || LanguageManager.t("ReportNone") },
            { label: LanguageManager.t("ReportFindingIdsLabel"), value: (activeReport.findingIds || []).join(", ") || LanguageManager.t("ReportNone") },
            { label: LanguageManager.t("ReportEvidenceIdsLabel"), value: (activeReport.evidenceIds || []).join(", ") || LanguageManager.t("ReportNone") },
            { label: LanguageManager.t("ReportBuildingSystemLabel"), value: activeReport.buildingSystem || LanguageManager.t("ReportNotLinked") },
            { label: LanguageManager.t("ReportRiskScoreLabel"), value: String(activeReport.riskScore || 0) },
            { label: LanguageManager.t("ReportDecisionImpactLabel"), value: activeReport.decisionImpact || "Medium" },
            { label: LanguageManager.t("ReportRiskLevelLabel"), value: activeReport.riskLevel || "Medium" },
            { label: LanguageManager.t("ReportDraftPrepared"), value: this.formatDraftPreparedValue(activeReport) },
            { label: LanguageManager.t("ReportReportTypeLabel"), value: activeReport.reportType || "Technical Due Diligence" },
            { label: LanguageManager.t("ReportExecutiveSummaryLabel"), value: activeReport.executiveSummary || LanguageManager.t("ReportNoExecutiveSummary") },
            { label: LanguageManager.t("ReportExportFormatLabel"), value: this.formatDraftExportFormat(activeReport) },
            { label: LanguageManager.t("ReportExportRequestedLabel"), value: activeReport.exportRequestedAt ? new Date(activeReport.exportRequestedAt).toLocaleString() : LanguageManager.t("ReportNotRequested") }
        ]);
    }

    static getReports() {
        const currentCase = CaseManager.getCurrent();
        const reports = currentCase ? ReportManager.getByCase(currentCase.id) : ReportManager.getAll();

        if (reports.length) {
            return reports;
        }

        const demoStatus = DemoDatasetManager.getStatus();
        const demoReport = ReportManager.load("DEMO-RPT-001");

        if (demoStatus.isActive && demoReport) {
            return [demoReport];
        }

        return ReportManager.getAll();
    }

    static generateReportOutput() {
        const existingReport = ReportManager.get();
        const sourceReport = existingReport || this.createSampleReport({ silent: true });

        if (!sourceReport) {
            return;
        }

        const lockState = ReportFinalizationLockManager.getLockState(sourceReport);

        if (!lockState.canPrepareDraftOutput) {
            Notification.warning(LanguageManager.t("ReportLockedDraftOutputNotification"));
            return;
        }

        const draftOutputGate = ReportOutputGovernanceManager.validateDraftOutput(sourceReport);

        if (!draftOutputGate.canProceed) {
            Notification.warning(LanguageManager.t("ReportOutputGovernanceDraftBlockedNotification"));
            return;
        }

        if (draftOutputGate.gate?.status === "warning") {
            Notification.info(LanguageManager.t("ReportValidationGateWarningNotification"));
        }

        const report = ReportManager.update({
            ...sourceReport,
            status: "Prepared",
            prepared: true,
            preparedAt: new Date().toISOString(),
            executiveSummary: sourceReport.executiveSummary || LanguageManager.t("ReportOutputPreparedSummary"),
            scope: sourceReport.scope || LanguageManager.t("ReportTechnicalScopeDefault"),
            methodology: sourceReport.methodology || LanguageManager.t("ReportEvidenceFirstWorkflowReview")
        });

        ReportManager.set(report);
        Notification.success(LanguageManager.t("ReportPreparedForReviewNotification"));
        this.refresh();
    }

    static printOrSavePdf(report = null, options = {}) {
        const activeReport = report || this.getActiveReport();

        if (!activeReport) {
            Notification.warning(LanguageManager.t("ReportSelectReportFirstNotification"));
            return;
        }

        const externalOutputGate = ReportOutputGovernanceManager.validateExternalOutput(activeReport);

        if (!externalOutputGate.canProceed) {
            Notification.warning(LanguageManager.t("ReportOutputGovernanceExternalBlockedNotification"));
            return;
        }

        if (externalOutputGate.gate?.status === "warning") {
            Notification.info(LanguageManager.t("ReportValidationGateExternalWarningNotification"));
        }

        let printableReport = activeReport;

        if (options.markExportRequested !== false) {
            printableReport = ReportManager.update({
                ...activeReport,
                exportFormat: "PDF",
                exportRequestedAt: new Date().toISOString()
            });
            ReportManager.set(printableReport);
        }

        Notification.info(LanguageManager.t("ReportPrintDialogNotification"));

        setTimeout(() => {
            window.print();
        }, 150);

        return printableReport;
    }

    static exportPdf() {
        const report = this.getActiveReport();
        this.printOrSavePdf(report);
    }

    static createSampleReport(options = {}) {
        const currentCase = CaseManager.getCurrent();
        const currentBuilding = currentCase?.buildingId
            ? BuildingManager.load(currentCase.buildingId)
            : BuildingManager.get();
        const currentInspection = currentCase?.inspectionId
            ? InspectionManager.load(currentCase.inspectionId)
            : InspectionManager.get();
        const activeDecision = DecisionManager.get();

        if (!currentCase) {
            Notification.info(LanguageManager.t("ReportOpenCaseFirstNotification"));
            return;
        }

        if (activeDecision && activeDecision.caseId !== currentCase.id) {
            Notification.warning(LanguageManager.t("ReportActiveDecisionOtherCaseNotification"));
            return;
        }

        const createReport = (values = {}) => {
            const resolvedFindingIds = activeDecision?.findingIds?.length
                ? activeDecision.findingIds
                : (activeDecision?.assessmentIds || [])
                    .flatMap(id => AssessmentManager.load(id)?.findingIds || []);

            if (!activeDecision) {
                Notification.info(LanguageManager.t("ReportSelectDecisionFirstNotification"));
                return;
            }

            const report = ReportManager.create({
                caseId: activeDecision?.caseId || currentCase.id,
                buildingId: activeDecision?.buildingId || currentCase.buildingId || currentBuilding?.id || null,
                inspectionId: activeDecision?.inspectionId || currentCase.inspectionId || currentInspection?.id || null,
                decisionIds: activeDecision ? [activeDecision.id] : [],
                recommendationIds: activeDecision?.recommendationIds || [],
                assessmentIds: activeDecision?.assessmentIds || [],
                findingIds: [...new Set(resolvedFindingIds)],
                evidenceIds: activeDecision?.evidenceIds || [],
                sourceDecisionIds: activeDecision ? [activeDecision.id] : [],
                sourceRecommendationIds: activeDecision?.sourceRecommendationIds || activeDecision?.recommendationIds || [],
                sourceAssessmentIds: activeDecision?.sourceAssessmentIds || activeDecision?.assessmentIds || [],
                sourceFindingIds: activeDecision?.sourceFindingIds || [...new Set(resolvedFindingIds)],
                sourceEvidenceIds: activeDecision?.sourceEvidenceIds || activeDecision?.evidenceIds || [],
                source: activeDecision?.source || "Decision Review",
                buildingSystem: activeDecision?.buildingSystem || "",
                riskScore: activeDecision?.riskScore || 0,
                decisionImpact: activeDecision?.decisionImpact || "",
                riskLevel: activeDecision?.riskLevel || "",
                sourceQuestionId: activeDecision?.sourceQuestionId || "",
                sourceQuestion: activeDecision?.sourceQuestion || "",
                sourceModule: activeDecision?.sourceModule || "",
                sourceCategory: activeDecision?.sourceCategory || "",
                sourcePolicy: activeDecision?.sourcePolicy || "",
                sourceRequiredEvidenceRaw: activeDecision?.sourceRequiredEvidenceRaw || "",
                sourceFileName: activeDecision?.sourceFileName || "",
                sourceFileType: activeDecision?.sourceFileType || "",
                sourceFileReference: activeDecision?.sourceFileReference || "",
                sourceCaptureMethod: activeDecision?.sourceCaptureMethod || "",
                sourceLocationLabel: activeDecision?.sourceLocationLabel || "",
                sourceInspectionArea: activeDecision?.sourceInspectionArea || "",
                sourceMeasurementValue: activeDecision?.sourceMeasurementValue ?? null,
                sourceMeasurementUnit: activeDecision?.sourceMeasurementUnit || "",
                sourceReviewStatus: activeDecision?.sourceReviewStatus || "",
                sourceExpertReviewRequired: activeDecision?.sourceExpertReviewRequired !== undefined
                    ? activeDecision.sourceExpertReviewRequired
                    : true,
                title: values.title || "Building Intelligence Report",
                sourceTitle: activeDecision?.title || "",
                reportType: values.reportType || "Technical Due Diligence",
                version: values.version || "1.0.0",
                executiveSummary: values.executiveSummary || "",
                scope: values.scope || "",
                methodology: values.methodology || "Evidence-based workflow review.",
                status: values.status || "Draft"
            });

            ReportManager.set(report);

            if (!options.silent) {
                Notification.success(LanguageManager.t("ReportCreatedNotification"));
            }

            this.refresh();
        };

        if (options.silent) {
            createReport({
                title: "Building Intelligence Report",
                reportType: "Technical Due Diligence",
                version: "1.0.0",
                executiveSummary: LanguageManager.t("ReportInitialOutputPrepared"),
                scope: LanguageManager.t("ReportTechnicalScopeDefault"),
                methodology: "Evidence-based workflow review.",
                status: "Draft"
            });
            return;
        }

        FormDialog.open({
            title: LanguageManager.t("ReportNewReportTitle"),
            submitLabel: LanguageManager.t("ReportCreateReportAction"),
            values: {
                title: "Technical Due Diligence Report",
                reportType: "Technical Due Diligence",
                version: "1.0.0",
                executiveSummary: activeDecision?.description || "",
                scope: LanguageManager.t("ReportDecisionBasedScopeDefault"),
                methodology: "Evidence-based workflow review.",
                status: "Draft"
            },
            fields: [
                { id: "title", label: LanguageManager.t("ReportTitleFieldLabel") },
                {
                    id: "reportType",
                    label: LanguageManager.t("ReportTypeFieldLabel"),
                    type: "select",
                    options: ["Technical Due Diligence", "Building Intelligence Report", "Condition Assessment", "CAPEX Review"]
                },
                { id: "version", label: "Version" },
                { id: "executiveSummary", label: LanguageManager.t("ReportExecutiveSummaryFieldLabel") },
                { id: "scope", label: LanguageManager.t("ReportScopeLabel") },
                { id: "methodology", label: LanguageManager.t("ReportMethodologyLabel") },
                {
                    id: "status",
                    label: LanguageManager.t("ReportStatusLabel"),
                    type: "select",
                    options: ["Draft", "Prepared", "Reviewed", "Final", "Archived"]
                }
            ],
            onSubmit: (values, dialog) => {
                if (!values.title) return;

                createReport(values);
                dialog.remove();
            }
        });
    }

    static editSelectedReport() {
        const report = ReportManager.get();

        if (!report) {
            Notification.info(LanguageManager.t("ReportSelectReportBeforeEditingNotification"));
            return;
        }

        const lockState = ReportFinalizationLockManager.getLockState(report);

        if (!lockState.canEdit) {
            Notification.warning(LanguageManager.t("ReportLockedEditNotification"));
            return;
        }

        FormDialog.open({
            title: LanguageManager.t("ReportEditReportTitle"),
            submitLabel: LanguageManager.t("ReportSaveReportAction"),
            values: {
                title: report.title || "",
                reportType: report.reportType || "Technical Due Diligence",
                version: report.version || "1.0.0",
                executiveSummary: report.executiveSummary || "",
                scope: report.scope || "",
                methodology: report.methodology || "",
                status: report.status || "Draft"
            },
            fields: [
                { id: "title", label: LanguageManager.t("ReportTitleFieldLabel") },
                {
                    id: "reportType",
                    label: LanguageManager.t("ReportTypeFieldLabel"),
                    type: "select",
                    options: ["Technical Due Diligence", "Building Intelligence Report", "Condition Assessment", "CAPEX Review"]
                },
                { id: "version", label: "Version" },
                { id: "executiveSummary", label: LanguageManager.t("ReportExecutiveSummaryFieldLabel") },
                { id: "scope", label: LanguageManager.t("ReportScopeLabel") },
                { id: "methodology", label: LanguageManager.t("ReportMethodologyLabel") },
                {
                    id: "status",
                    label: LanguageManager.t("ReportStatusLabel"),
                    type: "select",
                    options: ["Draft", "Prepared", "Reviewed", "Final", "Archived"]
                }
            ],
            onSubmit: (values, dialog) => {
                if (!values.title) return;

                const updated = ReportManager.update({
                    ...report,
                    title: values.title,
                    reportType: values.reportType || "Technical Due Diligence",
                    version: values.version || "1.0.0",
                    executiveSummary: values.executiveSummary || "",
                    scope: values.scope || "",
                    methodology: values.methodology || "",
                    status: values.status || "Draft",
                    updatedAt: new Date().toISOString()
                });

                ReportManager.set(updated);
                dialog.remove();
                Notification.success(LanguageManager.t("ReportUpdatedNotification"));
                this.refresh();
            }
        });
    }

    static deleteReport(item) {
        const lockState = ReportFinalizationLockManager.getLockState(item);

        if (!lockState.canDelete) {
            Notification.warning(LanguageManager.t("ReportLockedDeleteNotification"));
            return;
        }

        if (!window.confirm(`${LanguageManager.t("ReportDeleteConfirmPrefix")} "${item.title || item.id}"?`)) {
            return;
        }

        ReportManager.delete(item.id);

        if (ReportManager.get()?.id === item.id) {
            ReportManager.clear();
        }

        Notification.success(LanguageManager.t("ReportDeletedNotification"));
        this.refresh();
    }

    static refresh() {
        const container = document.getElementById("workspace-page");

        if (!container) return;

        container.innerHTML = "";
        container.appendChild(this.render());
    }

    static showPendingFeature(feature = LanguageManager.t("ReportPendingFeatureFallback")) {
        Notification.info(`${feature} ${LanguageManager.t("ReportPendingFeatureReserved")}`);
    }

}
