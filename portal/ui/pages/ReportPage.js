import ReportManager from "../../core/ReportManager.js";
import CaseManager from "../../core/CaseManager.js";
import BuildingManager from "../../core/BuildingManager.js";
import InspectionManager from "../../core/InspectionManager.js";
import DecisionManager from "../../core/DecisionManager.js";
import IntelligenceEngine from "../../core/IntelligenceEngine.js";
import SectionHeader from "../components/SectionHeader.js";
import WorkflowContextBanner from "../components/WorkflowContextBanner.js";
import ActionBar from "../components/ActionBar.js";
import EmptyState from "../components/EmptyState.js";
import DetailPanel from "../components/DetailPanel.js";
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
            description: "Final report output prepared"
        }
    ];

    static statusLabels = {
        draft: "Draft",
        prepared: "Prepared",
        generated: "Generated",
        reviewed: "Reviewed",
        finalized: "Finalized",
        blocked: "Blocked"
    };

    static render() {
        const fragment = document.createDocumentFragment();
        const reports = this.getReports();
        const activeReport = ReportManager.get();

        fragment.appendChild(this.createHeader(activeReport));
        fragment.appendChild(WorkflowContextBanner.create(CaseManager.getCurrent()));
        fragment.appendChild(this.createMetrics(reports));
        const reportOverview = document.createElement("section");
        reportOverview.className = "report-polish-stack";
        reportOverview.appendChild(this.createFinalOutputState(activeReport));
        reportOverview.appendChild(this.createCompletionPanel(activeReport));

        fragment.appendChild(reportOverview);

        if (activeReport) {
            fragment.appendChild(this.createReportIntelligenceSnapshot(activeReport));
        }

        fragment.appendChild(this.createToolbar());
        fragment.appendChild(this.createMainLayout(reports, activeReport));

        return fragment;
    }

    static createHeader(activeReport = null) {
        return SectionHeader.create({
            eyebrow: "Report Workspace",
            title: "Reports",
            description: activeReport
                ? `Active report: ${activeReport.title || activeReport.id}`
                : "Generate professional Technical Due Diligence reports, executive summaries, and Building Intelligence documents.",
            actions: [
                {
                    id: "new-report",
                    label: "+ New Report",
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

        grid.appendChild(MetricCard.create("Reports", reports.length));
        grid.appendChild(MetricCard.create("Drafts", draftCount));
        grid.appendChild(MetricCard.create("Approved", approvedCount));
        grid.appendChild(MetricCard.create("Archived", archivedCount));

        return grid;
    }

    static getOutputState(report = {}) {
        report = report || {};
        const hasDecisionLink =
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
                    <span class="workspace-flow__eyebrow">Final Output</span>
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
            </section>
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
        const hasOutput = Boolean(
            report.generated ||
            report.generatedAt ||
            report.fileUrl ||
            report.pdfUrl
        );
        const isReviewed = Boolean(report.reviewed || report.status === "reviewed");
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
                description: "Report contains decision context, prepared content, generated output and final approval.",
                tone: "ready"
            };
        } else if (hasContent && hasDecisionLink) {
            outputQualitySignal = {
                label: "Developing output quality",
                description: "Report has meaningful content and decision context, but output generation or finalization may still be missing.",
                tone: "active"
            };
        }

        const nextAction = isFinalized
            ? {
                label: "Archive or publish report",
                description: "Report is finalized. Confirm publication, export or archive workflow.",
                tone: "ready"
            }
            : hasOutput
                ? {
                    label: "Review and finalize report",
                    description: "Report output exists. Complete final review and approval.",
                    tone: "active"
                }
                : hasContent && hasDecisionLink
                    ? {
                        label: "Generate report output",
                        description: "Report content and decision context are available. Generate the final output.",
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
                    ? "Report intelligence developing"
                    : "Report intelligence early"
        };
    }

    static getCompletionState(report = {}) {
        report = report || {};
        const hasTitle = Boolean(report.title || report.name);
        const hasReportType = Boolean(report.reportType || report.type || report.template);
        const hasDecisionLink = Boolean(
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
        const hasOutput = Boolean(
            report.generated ||
            report.generatedAt ||
            report.fileUrl ||
            report.pdfUrl
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
                label: "Report identified",
                complete: hasTitle
            },
            {
                key: "type",
                label: "Report type defined",
                complete: hasReportType
            },
            {
                key: "decision",
                label: "Decision linked",
                complete: hasDecisionLink
            },
            {
                key: "content",
                label: "Content prepared",
                complete: hasContent
            },
            {
                key: "output",
                label: "Output generated",
                complete: hasOutput
            },
            {
                key: "final",
                label: "Report finalized",
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
            ? "Final Report Complete"
            : completion.isReadyForFinalReview
                ? "Ready for Final Review"
                : "Needs more report data";

        return `
            <section class="completion-panel" aria-label="Report completion">
                <div class="completion-panel__header">
                    <div>
                        <span class="completion-panel__eyebrow">Completion</span>
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
                        <span class="report-intelligence__eyebrow intelligence-snapshot__eyebrow">Report Intelligence</span>
                        <strong>${intelligence.label}</strong>
                        <p>${intelligence.completed}/${intelligence.total} report intelligence checks completed</p>
                    </div>
                    <span class="report-intelligence__score intelligence-snapshot__score">${intelligence.confidenceScore}%</span>
                </div>

                <div class="report-intelligence__grid intelligence-snapshot__grid">
                    <article class="report-intelligence__card intelligence-snapshot__card">
                        <span>Final Review Readiness</span>
                        <strong>${intelligence.readinessPercent}%</strong>
                        <p>Readiness based on identity, report type, decision link, content, output, review and finalization.</p>
                    </article>

                    <article class="report-intelligence__card intelligence-snapshot__card report-intelligence__card--${intelligence.outputQualitySignal.tone} intelligence-snapshot__card--${intelligence.outputQualitySignal.tone}">
                        <span>Output Quality Signal</span>
                        <strong>${intelligence.outputQualitySignal.label}</strong>
                        <p>${intelligence.outputQualitySignal.description}</p>
                    </article>

                    <article class="report-intelligence__card intelligence-snapshot__card report-intelligence__card--${intelligence.nextAction.tone} intelligence-snapshot__card--${intelligence.nextAction.tone}">
                        <span>Next Report Action</span>
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
            report.generated ||
            report.generatedAt ||
            report.fileUrl ||
            report.pdfUrl ||
            report.status === "generated"
        ) {
            return "generated";
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
        const label = this.statusLabels[status] || "Draft";

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
                label: "Refresh",
                onClick: () => this.refresh()
            },
            {
                id: "close-report",
                label: "Close Report",
                onClick: () => {
                    ReportManager.clear();
                    this.refresh();
                }
            },
            {
                id: "generate-report",
                label: "Generate Report",
                onClick: () => this.generateReportOutput()
            },
            {
                id: "export-pdf",
                label: "Export PDF",
                onClick: () => this.exportPdf()
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
                title: "No reports available",
                description: "Reports will compile evidence, findings, assessments, recommendations, and decisions into a professional output.",
                actionLabel: "+ New Report",
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
        title.textContent = report.title || report.id || "Report Item";

        const meta = document.createElement("span");
        meta.textContent = `${report.reportType || "Technical Due Diligence"} · ${report.status || "Draft"}`;

        const statusContainer = document.createElement("span");
        statusContainer.innerHTML = this.renderReportStatusBadge(report);

        content.appendChild(title);
        content.appendChild(meta);
        content.appendChild(statusContainer);

        const actions = document.createElement("div");
        actions.className = "evidence-row__actions";

        [
            ["open", "Open"],
            ["edit", "Edit"],
            ["delete", "Delete"]
        ].forEach(([action, label]) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "button";
            button.textContent = label;

            button.addEventListener("click", event => {
                event.stopPropagation();

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

    static createDetailPanel(activeReport = ReportManager.get(), reports = this.getReports()) {
        if (!activeReport) {
            return DetailPanel.create("Report Context", [
                { label: "Reports", value: String(reports.length) },
                { label: "Selected Report", value: "Not selected" },
                { label: "Executive Summary", value: reports.length ? "Available in draft" : "Pending" },
                { label: "Next Step", value: "Create or select a report" }
            ]);
        }

        return DetailPanel.create("Report Context", [
            { label: "Selected Report", value: activeReport.title || activeReport.id },
            { label: "Report Status", value: activeReport.status || "Draft" },
            { label: "Generated", value: activeReport.generatedAt ? new Date(activeReport.generatedAt).toLocaleString() : "Not generated" },
            { label: "Report Type", value: activeReport.reportType || "Technical Due Diligence" },
            { label: "Export Format", value: activeReport.exportFormat || "PDF pending" },
            { label: "Export Requested", value: activeReport.exportRequestedAt ? new Date(activeReport.exportRequestedAt).toLocaleString() : "Not requested" }
        ]);
    }

    static getReports() {
        return ReportManager.getAll();
    }

    static generateReportOutput() {
        const existingReport = ReportManager.get();
        const sourceReport = existingReport || this.createSampleReport({ silent: true });

        const report = ReportManager.update({
            ...sourceReport,
            status: "generated",
            generated: true,
            generatedAt: new Date().toISOString(),
            executiveSummary: sourceReport.executiveSummary || "Generated Building Intelligence report output.",
            scope: sourceReport.scope || "Technical due diligence report scope.",
            methodology: sourceReport.methodology || "Evidence-first Building Intelligence workflow review."
        });

        ReportManager.set(report);
        Notification.success("Report generated.");
        this.refresh();
    }

    static exportPdf() {
        const report = ReportManager.get();

        if (!report) {
            Notification.warning("Generate or select a report first.");
            return;
        }

        const updated = ReportManager.update({
            ...report,
            exportFormat: "PDF",
            exportRequestedAt: new Date().toISOString()
        });

        ReportManager.set(updated);
        Notification.info("PDF export hook prepared. Premium PDF pipeline follows in the next report foundation step.");
        this.refresh();
    }

    static createSampleReport(options = {}) {
        const currentCase = CaseManager.getCurrent();
        const currentBuilding = BuildingManager.get();
        const currentInspection = InspectionManager.get();
        const activeDecision = DecisionManager.get();

        if (!currentCase && !activeDecision) {
            Notification.info("Open a case or decision before creating a report.");
            return;
        }

        const createReport = (values = {}) => {
            const report = ReportManager.create({
                caseId: activeDecision?.caseId || currentCase.id,
                buildingId: activeDecision?.buildingId || currentBuilding?.id || null,
                inspectionId: activeDecision?.inspectionId || currentInspection?.id || null,
                decisionIds: activeDecision ? [activeDecision.id] : [],
                title: values.title || "Building Intelligence Report",
                reportType: values.reportType || "Technical Due Diligence",
                version: values.version || "1.0.0",
                executiveSummary: values.executiveSummary || "",
                scope: values.scope || "",
                methodology: values.methodology || "Evidence-based workflow review.",
                status: values.status || "Draft"
            });

            ReportManager.set(report);

            if (!options.silent) {
                Notification.success("Report created.");
            }

            this.refresh();
        };

        if (options.silent) {
            createReport({
                title: "Sample Building Intelligence Report",
                reportType: "Technical Due Diligence",
                version: "1.0.0",
                executiveSummary: "Initial report record created from the workspace.",
                scope: "Demo technical due diligence scope.",
                methodology: "Evidence-based workflow review.",
                status: "Draft"
            });
            return;
        }

        FormDialog.open({
            title: "New Report",
            submitLabel: "Create Report",
            values: {
                title: activeDecision?.title ? `Report from ${activeDecision.title}` : "Building Intelligence Report",
                reportType: "Technical Due Diligence",
                version: "1.0.0",
                executiveSummary: activeDecision?.description || "",
                scope: "Decision-based technical due diligence report.",
                methodology: "Evidence-based workflow review.",
                status: "Draft"
            },
            fields: [
                { id: "title", label: "Report title" },
                {
                    id: "reportType",
                    label: "Report type",
                    type: "select",
                    options: ["Technical Due Diligence", "Building Intelligence Report", "Condition Assessment", "CAPEX Review"]
                },
                { id: "version", label: "Version" },
                { id: "executiveSummary", label: "Executive summary" },
                { id: "scope", label: "Scope" },
                { id: "methodology", label: "Methodology" },
                {
                    id: "status",
                    label: "Status",
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
            Notification.info("Select a report before editing.");
            return;
        }

        FormDialog.open({
            title: "Edit Report",
            submitLabel: "Save Report",
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
                { id: "title", label: "Report title" },
                {
                    id: "reportType",
                    label: "Report type",
                    type: "select",
                    options: ["Technical Due Diligence", "Building Intelligence Report", "Condition Assessment", "CAPEX Review"]
                },
                { id: "version", label: "Version" },
                { id: "executiveSummary", label: "Executive summary" },
                { id: "scope", label: "Scope" },
                { id: "methodology", label: "Methodology" },
                {
                    id: "status",
                    label: "Status",
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
                Notification.success("Report updated.");
                this.refresh();
            }
        });
    }

    static deleteReport(item) {
        if (!window.confirm(`Delete report "${item.title || item.id}"?`)) {
            return;
        }

        ReportManager.delete(item.id);

        if (ReportManager.get()?.id === item.id) {
            ReportManager.clear();
        }

        Notification.success("Report deleted.");
        this.refresh();
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