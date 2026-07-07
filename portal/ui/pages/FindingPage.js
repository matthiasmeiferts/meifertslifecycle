import WorkspaceController from "../../controllers/WorkspaceController.js";
import FindingManager from "../../core/FindingManager.js";
import EvidenceManager from "../../core/EvidenceManager.js";
import CaseManager from "../../core/CaseManager.js";
import BuildingManager from "../../core/BuildingManager.js";
import InspectionManager from "../../core/InspectionManager.js";
import AssessmentManager from "../../core/AssessmentManager.js";
import IntelligenceEngine from "../../core/IntelligenceEngine.js";
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

export default class FindingPage {

    static flowSteps = [
        {
            key: "finding",
            label: "Finding",
            description: "Technical finding identified"
        },
        {
            key: "assessment",
            label: LanguageManager.t("WorkflowStepAssessment"),
            description: "Risk assessment derived"
        }
    ];

    static statusLabels = {
        draft: LanguageManager.t("FindingStatusDraft"),
        open: LanguageManager.t("FindingStatusOpen"),
        identified: LanguageManager.t("FindingStatusIdentified"),
        assessed: LanguageManager.t("FindingStatusAssessed"),
        reviewed: LanguageManager.t("FindingStatusReviewed"),
        blocked: LanguageManager.t("FindingStatusBlocked")
    };

    static render() {
        const fragment = document.createDocumentFragment();
        const activeFinding = FindingManager.get();

        fragment.appendChild(this.createHeader(activeFinding));
        const currentCase = CaseManager.getCurrent();
        fragment.appendChild(WorkflowContextBanner.create(currentCase));
        fragment.appendChild(WorkflowProgressPanel.create(currentCase, "findings"));
        const findingOverview = document.createElement("section");
        findingOverview.className = "finding-polish-stack";
        findingOverview.appendChild(this.createFlowIndicator(activeFinding));
        findingOverview.appendChild(this.createNextActionPanel(activeFinding));
        findingOverview.appendChild(this.createCompletionPanel(activeFinding));

        fragment.appendChild(findingOverview);
        fragment.appendChild(this.createFindingIntelligenceSnapshot(activeFinding));
        fragment.appendChild(this.createMetrics());
        fragment.appendChild(this.createToolbar());
        fragment.appendChild(this.createMainLayout());

        return fragment;
    }

    static getFlowState(finding = {}) {
        finding = finding || {};

        const hasAssessmentLink =
            Boolean(finding.assessmentId) ||
            Boolean(finding.linkedAssessmentId) ||
            Boolean(finding.assessment) ||
            Boolean(finding.hasAssessment);

        return {
            finding: "active",
            assessment: hasAssessmentLink ? "complete" : "next"
        };
    }

    static renderActiveFlowIndicator(finding = {}) {
        finding = finding || {};
        const flowState = this.getFlowState(finding);

        return `
            <section class="workspace-flow" aria-label="Active workflow state">
                <div class="workspace-flow__header">
                    <span class="workspace-flow__eyebrow">Active Flow</span>
                    <strong>${LanguageManager.t("FindingToAssessmentLabel")}</strong>
                </div>

                <div class="workspace-flow__steps">
                    ${this.flowSteps.map((step) => `
                        <div class="workspace-flow__step workspace-flow__step--${flowState[step.key]}">
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

    static createFlowIndicator(finding = {}) {
        const container = document.createElement("section");
        container.className = "workflow-card";
        container.innerHTML = this.renderActiveFlowIndicator(finding);
        return container;
    }

    static getFindingStatus(finding = {}) {
        finding = finding || {};
        if (finding.blocked || finding.status === "blocked") {
            return "blocked";
        }

        if (finding.reviewed || finding.status === "reviewed") {
            return "reviewed";
        }

        if (
            finding.assessmentId ||
            finding.linkedAssessmentId ||
            finding.assessment ||
            finding.hasAssessment ||
            finding.status === "assessed"
        ) {
            return "assessed";
        }

        if (
            finding.identified ||
            finding.title ||
            finding.name ||
            finding.description ||
            finding.severity ||
            finding.priority ||
            finding.status === "identified"
        ) {
            return "identified";
        }

        return "draft";
    }

    static renderFindingStatusBadge(finding = {}) {
        finding = finding || {};
        const status = this.getFindingStatus(finding);
        const label = this.statusLabels[status] || "Draft";

        return `<span class="evidence-status evidence-status--${status}">${label}</span>`;
    }

    static getNextAction(finding = {}) {
        finding = finding || {};
        const status = this.getFindingStatus
            ? this.getFindingStatus(finding)
            : "draft";

        if (status === "blocked") {
            return {
                label: "Resolve blocker",
                description: "This finding cannot move forward until the blocker is cleared.",
                tone: "blocked"
            };
        }

        if (status === "reviewed") {
            return {
                label: "Create or confirm assessment",
                description: "Finding is reviewed and ready to support a technical assessment.",
                tone: "ready"
            };
        }

        if (status === "assessed") {
            return {
                label: LanguageManager.t("FindingReviewLinkedAssessment"),
                description: "This finding is already connected to an assessment. Check risk logic and completeness.",
                tone: "linked"
            };
        }

        if (status === "identified") {
            return {
                label: "Assess finding",
                description: "The finding is identified and should now be assessed for severity, probability and risk impact.",
                tone: "active"
            };
        }

        return {
            label: "Identify finding",
            description: "Add a clear technical finding before moving into assessment.",
            tone: "draft"
        };
    }

    static renderNextActionPanel(finding = {}) {
        finding = finding || {};
        const action = this.getNextAction(finding);

        return `
            <section class="next-action next-action--${action.tone}" aria-label="Next action">
                <div>
                    <span class="next-action__eyebrow">Next Action</span>
                    <strong>${action.label}</strong>
                    <p>${action.description}</p>
                </div>
            </section>
        `;
    }

    static createNextActionPanel(finding = {}) {
        const container = document.createElement("section");
        container.className = "workflow-card";
        container.innerHTML = this.renderNextActionPanel(finding);
        return container;
    }

    static getCompletionState(finding = {}) {
        finding = finding || {};
        const hasTitle = Boolean(finding.title || finding.name);
        const hasCategory = Boolean(finding.category || finding.type);
        const hasSeverity = Boolean(finding.severity || finding.priority || finding.riskLevel);
        const hasDescription = Boolean(finding.description || finding.summary || finding.note);
        const hasEvidenceLink = Boolean(
            finding.evidenceId ||
            finding.linkedEvidenceId ||
            finding.evidence ||
            finding.evidenceIds ||
            finding.hasEvidence
        );
        const hasAssessmentLink = Boolean(
            finding.assessmentId ||
            finding.linkedAssessmentId ||
            finding.assessment ||
            finding.hasAssessment
        );

        const checks = [
            {
                key: "identity",
                label: "Finding identified",
                complete: hasTitle
            },
            {
                key: "classification",
                label: "Finding classified",
                complete: hasCategory
            },
            {
                key: "severity",
                label: LanguageManager.t("FindingSeverityDefined"),
                complete: hasSeverity
            },
            {
                key: "description",
                label: "Description captured",
                complete: hasDescription
            },
            {
                key: "evidence",
                label: LanguageManager.t("FindingEvidenceLinked"),
                complete: hasEvidenceLink
            },
            {
                key: "assessment",
                label: LanguageManager.t("FindingAssessmentConnection"),
                complete: hasAssessmentLink
            }
        ];

        const completed = checks.filter((check) => check.complete).length;
        const total = checks.length;

        return {
            checks,
            completed,
            total,
            ratio: total > 0 ? completed / total : 0,
            isReadyForAssessment: hasTitle && hasCategory && hasSeverity && hasDescription,
            isComplete: completed === total
        };
    }

    static renderCompletionPanel(finding = {}) {
        finding = finding || {};
        const completion = this.getCompletionState(finding);
        const percent = Math.round(completion.ratio * 100);
        const readinessLabel = completion.isReadyForAssessment
            ? LanguageManager.t("FindingReadyForAssessment")
            : "Needs more finding data";

        return `
            <section class="completion-panel" aria-label="Finding completion">
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

    static createCompletionPanel(finding = {}) {
        const container = document.createElement("section");
        container.className = "workflow-card";
        container.innerHTML = this.renderCompletionPanel(finding);
        return container;
    }

    static createHeader(activeFinding = null) {
        const summary = WorkspaceController.getActiveCaseSummary();

        return SectionHeader.create({
            eyebrow: LanguageManager.t("FindingWorkspaceTitle"),
            title: LanguageManager.t("FindingTechnicalFindingsTitle"),
            description: activeFinding
                ? `${LanguageManager.t("FindingActivePrefix")}: ${activeFinding.title || activeFinding.id}`
                : `${summary.title} · Convert verified evidence into structured findings.`,
            actions: [
                {
                    id: "new-finding",
                    label: LanguageManager.t("FindingNewAction"),
                    onClick: () => this.createSampleFinding()
                }
            ]
        });
    }

    static createMetrics() {
        const findings = this.getFindings();
        const findingCount = findings.length;
        const criticalCount = findings.filter(item => item.severity === "Critical").length;
        const reviewedCount = findings.filter(item => item.status === "Reviewed").length;

        const grid = document.createElement("section");
        grid.className = "metrics-grid";

        grid.appendChild(MetricCard.create(LanguageManager.t("FindingTotalMetric"), findingCount));
        grid.appendChild(MetricCard.create("Critical", criticalCount));
        grid.appendChild(MetricCard.create(LanguageManager.t("FindingOpenMetric"), findingCount - reviewedCount));
        grid.appendChild(MetricCard.create(LanguageManager.t("FindingLinkedAssessmentsMetric"), this.countAssessmentsLinkedToFinding()));

        return grid;
    }

    static createToolbar() {
        const wrapper = document.createElement("section");
        wrapper.className = "workflow-card";

        wrapper.appendChild(ActionBar.create([
            {
                id: "refresh",
                label: LanguageManager.t("FindingRefreshAction"),
                onClick: () => this.refresh()
            },
            {
                id: "close-finding",
                label: LanguageManager.t("FindingCloseAction"),
                onClick: () => {
                    FindingManager.clear();
                    this.refresh();
                }
            },
            {
                id: "link-evidence",
                label: LanguageManager.t("FindingLinkEvidenceAction"),
                onClick: () => this.createSampleFinding()
            },
            {
                id: "create-assessment",
                label: LanguageManager.t("FindingCreateAssessmentAction"),
                onClick: () => this.createAssessmentFromSelectedFinding()
            }
        ]));

        return wrapper;
    }

    static createMainLayout() {
        const findings = this.getFindings();
        const activeFinding = FindingManager.get();

        const layout = document.createElement("section");
        layout.className = "case-workspace-layout";

        layout.appendChild(this.createContent(findings));
        layout.appendChild(this.createDetailPanel(activeFinding, findings));

        return layout;
    }

    static createContent(findings = this.getFindings()) {
        if (!findings.length) {
            return EmptyState.create({
                eyebrow: LanguageManager.t("FindingWorkspaceTitle"),
                title: LanguageManager.t("FindingEmptyTitle"),
                description: "Select verified evidence and document the technical observation to begin the finding chain.",
                actionLabel: LanguageManager.t("FindingNewAction"),
                onAction: () => this.createSampleFinding()
            });
        }

        const list = document.createElement("section");
        list.className = "workflow-card evidence-list";

        findings.forEach(finding => {
            list.appendChild(this.createFindingRow(finding));
        });

        return list;
    }

    static createFindingRow(finding) {
        const row = document.createElement("article");
        row.className = "evidence-row";
        row.addEventListener("click", () => {
            FindingManager.set(finding);
            this.refresh();
        });

        const content = document.createElement("button");
        content.type = "button";
        content.className = "evidence-row__content";

        const title = document.createElement("strong");
        title.textContent = finding.title || finding.id || "Finding Item";

        const meta = document.createElement("span");
        meta.textContent = [
            finding.category || "General",
            finding.severity || "Medium",
            finding.source || ""
        ].filter(Boolean).join(" · ");

        const statusContainer = document.createElement("span");
        statusContainer.innerHTML = this.renderFindingStatusBadge(finding);

        content.appendChild(title);
        content.appendChild(meta);
        content.appendChild(statusContainer);

        const actions = document.createElement("div");
        actions.className = "evidence-row__actions";

        [
            ["open", LanguageManager.t("ReportOpenAction")],
            ["edit", LanguageManager.t("ReportEditAction")],
            ["delete", LanguageManager.t("ReportDeleteAction")]
        ].forEach(([action, label]) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "button";
            button.textContent = label;

            button.addEventListener("click", event => {
                event.stopPropagation();

                if (action === "open") {
                    FindingManager.set(finding);
                    this.refresh();
                    return;
                }

                if (action === "edit") {
                    FindingManager.set(finding);
                    this.editSelectedFinding();
                    return;
                }

                if (action === "delete") {
                    this.deleteFinding(finding);
                }
            });

            actions.appendChild(button);
        });

        row.appendChild(content);
        row.appendChild(actions);

        return row;
    }

    static createDetailPanel(activeFinding = FindingManager.get(), findings = this.getFindings()) {
        if (!activeFinding) {
            return DetailPanel.create(LanguageManager.t("FindingContextTitle"), [
                { label: LanguageManager.t("FindingTotalMetric"), value: String(findings.length) },
                { label: LanguageManager.t("FindingSelectedLabel"), value: LanguageManager.t("FindingNotSelected") },
                { label: LanguageManager.t("FindingStatusLabel"), value: findings.length ? LanguageManager.t("FindingInReview") : LanguageManager.t("FindingNotStarted") },
                { label: LanguageManager.t("FindingWorkspaceStatusLabel"), value: "—" },
                { label: LanguageManager.t("FindingNextStepLabel"), value: LanguageManager.t("FindingCreateOrSelect") }
            ]);
        }

        const statusLabel = this.statusLabels[this.getFindingStatus(activeFinding)] || "Draft";

        return DetailPanel.create(LanguageManager.t("FindingContextTitle"), [
            { label: LanguageManager.t("FindingSelectedLabel"), value: activeFinding.title || activeFinding.id },
            { label: LanguageManager.t("FindingWorkspaceStatusLabel"), value: statusLabel },
            ...ReviewAuditTrailFields.create(activeFinding),
            { label: LanguageManager.t("FindingSafetyBoundariesLabel"), value: DetailPanel.createBoundaryBadges(activeFinding) },
            { label: LanguageManager.t("FindingSourceLabel"), value: activeFinding.source || LanguageManager.t("FindingExpertReview") },
            { label: LanguageManager.t("FindingCaseIdLabel"), value: activeFinding.caseId || LanguageManager.t("FindingNotLinked") },
            { label: LanguageManager.t("FindingBuildingIdLabel"), value: activeFinding.buildingId || LanguageManager.t("FindingNotLinked") },
            { label: LanguageManager.t("FindingInspectionIdLabel"), value: activeFinding.inspectionId || LanguageManager.t("FindingNotLinked") },
            { label: LanguageManager.t("FindingEvidenceIdsLabel"), value: (activeFinding.evidenceIds || []).join(", ") || LanguageManager.t("FindingNone") },
            { label: LanguageManager.t("FindingCategoryLabel"), value: activeFinding.category || LanguageManager.t("FindingGeneral") },
            { label: LanguageManager.t("FindingBuildingSystemLabel"), value: activeFinding.buildingSystem || LanguageManager.t("FindingNotLinked") },
            { label: LanguageManager.t("FindingSeverityLabel"), value: activeFinding.severity || LanguageManager.t("FindingNormal") },
            { label: LanguageManager.t("FindingDescriptionLabel"), value: activeFinding.description || LanguageManager.t("FindingNoDescription") },
            { label: LanguageManager.t("FindingAssessmentIdsLabel"), value: (activeFinding.assessmentIds || []).join(", ") || LanguageManager.t("FindingNone") },
            { label: LanguageManager.t("FindingLinkedAssessmentsMetric"), value: String(this.countAssessmentsLinkedToFinding(activeFinding.id)) }
        ]);
    }

    static getFindings() {
        const currentCase = CaseManager.getCurrent();

        return WorkspaceController.safeValue(
            () => currentCase
                ? FindingManager.getByCase(currentCase.id)
                : FindingManager.getAll(),
            []
        );
    }

    static countAssessmentsLinkedToFinding(findingId = null) {
        const targetFindingId = findingId || FindingManager.get()?.id;

        if (!targetFindingId) {
            return 0;
        }

        const currentCase = CaseManager.getCurrent();
        const assessments = currentCase
            ? AssessmentManager.getByCase(currentCase.id)
            : AssessmentManager.getAll();

        return assessments
            .filter(assessment => (assessment.findingIds || []).includes(targetFindingId))
            .length;
    }

    static formatSourceMeasurement(finding = {}) {
        if (
            finding.sourceMeasurementValue === null ||
            finding.sourceMeasurementValue === undefined ||
            finding.sourceMeasurementValue === ""
        ) {
            return "None";
        }

        return `${finding.sourceMeasurementValue}${finding.sourceMeasurementUnit ? " " + finding.sourceMeasurementUnit : ""}`;
    }

    static createAssessmentFromSelectedFinding() {
        const finding = FindingManager.get();
        const currentCase = CaseManager.getCurrent();

        if (!finding) {
            Notification.warning(LanguageManager.t("FindingSelectFirstWarning"));
            return;
        }

        if (!finding.caseId) {
            Notification.warning(LanguageManager.t("FindingNotLinkedCaseWarning"));
            return;
        }

        if (currentCase && currentCase.id !== finding.caseId) {
            Notification.warning(LanguageManager.t("FindingBelongsOtherCaseWarning"));
            return;
        }

        const isPattayaFinding =
            finding.profile === "pattaya" ||
            String(finding.sourceQuestionId || "").startsWith("TH-PATTAYA-");

        const isAvailabilityCheckOnly = finding.sourcePolicy === "availability_check_only";

        const severity = isAvailabilityCheckOnly
            ? "Unrated"
            : (finding.severity || "Medium");

        const probability = isAvailabilityCheckOnly
            ? "Unrated"
            : (finding.probability || "Medium");

        const consequence = isAvailabilityCheckOnly
            ? "Unrated"
            : "Medium";

        const assessmentTitle = finding.title
            ? `Assessment Draft: ${finding.title}`
            : `Assessment Draft from ${finding.id}`;

        const descriptionParts = [
            finding.description || "Assessment prepared from selected finding.",
            "",
            "Assessment status:",
            "Draft assessment created from selected finding.",
            "Expert review required before recommendation, decision or report use."
        ];

        if (isAvailabilityCheckOnly) {
            descriptionParts.push("");
            descriptionParts.push("Review boundary:");
            descriptionParts.push("Document availability only. No legal, financial, technical or governance document review has been performed.");
            descriptionParts.push("This assessment draft records availability context only and must not be treated as document validation.");
        }

        if (isPattayaFinding) {
            descriptionParts.push("");
            descriptionParts.push("Thailand / Pattaya context:");
            descriptionParts.push("Field review context retained for downstream recommendation and reporting.");
        }

        descriptionParts.push("");
        descriptionParts.push("Finding trace:");
        descriptionParts.push(`Finding ID: ${finding.id}`);
        descriptionParts.push(`Finding source: ${finding.source || "Expert Review"}`);
        descriptionParts.push(`Evidence IDs: ${(finding.evidenceIds || []).join(", ") || "None"}`);
        descriptionParts.push(`Source Evidence IDs: ${(finding.sourceEvidenceIds || []).join(", ") || "None"}`);
        descriptionParts.push(`Source policy: ${finding.sourcePolicy || "None"}`);
        descriptionParts.push(`Expert review required: ${finding.expertReviewRequired === false ? "No" : "Yes"}`);

        const hasEvidenceMetadataTrace = Boolean(
            finding.sourceFileName ||
            finding.sourceFileType ||
            finding.sourceFileReference ||
            finding.sourceCaptureMethod ||
            finding.sourceLocationLabel ||
            finding.sourceInspectionArea ||
            finding.sourceMeasurementValue !== null && finding.sourceMeasurementValue !== undefined ||
            finding.sourceMeasurementUnit ||
            finding.sourceReviewStatus
        );

        if (hasEvidenceMetadataTrace) {
            descriptionParts.push("");
            descriptionParts.push("Evidence metadata trace:");
            descriptionParts.push(`File name: ${finding.sourceFileName || "None"}`);
            descriptionParts.push(`File type: ${finding.sourceFileType || "None"}`);
            descriptionParts.push(`File reference: ${finding.sourceFileReference || "None"}`);
            descriptionParts.push(`Capture method: ${finding.sourceCaptureMethod || "None"}`);
            descriptionParts.push(`Location label: ${finding.sourceLocationLabel || "None"}`);
            descriptionParts.push(`Inspection area: ${finding.sourceInspectionArea || "None"}`);
            descriptionParts.push(`Measurement: ${this.formatSourceMeasurement(finding)}`);
            descriptionParts.push(`Evidence review status: ${finding.sourceReviewStatus || "None"}`);
            descriptionParts.push(`Expert review required: ${finding.sourceExpertReviewRequired === false ? "No" : "Yes"}`);
        }

        const riskScore = isAvailabilityCheckOnly
            ? 0
            : AssessmentManager.calculateRiskScore(severity, probability, consequence);

        const assessment = AssessmentManager.create({
            caseId: finding.caseId,
            buildingId: finding.buildingId,
            inspectionId: finding.inspectionId,

            findingIds: [finding.id],
            evidenceIds: finding.evidenceIds || [],
            sourceFindingIds: [finding.id],
            sourceEvidenceIds: finding.sourceEvidenceIds || finding.evidenceIds || [],

            title: assessmentTitle,
            description: descriptionParts.join("\n"),
            category: finding.category || "General",
            buildingSystem: finding.buildingSystem || "",
            source: finding.source || "Finding Review",

            severity,
            probability,
            consequence,
            riskScore,
            priority: isAvailabilityCheckOnly ? "Medium" : (finding.priority || "High"),
            confidence: isAvailabilityCheckOnly ? 50 : (finding.confidence || 60),

            status: "Draft",
            reviewStatus: "Draft",
            expertReviewRequired: true,

            sourceQuestionId: finding.sourceQuestionId || "",
            sourceQuestion: finding.sourceQuestion || "",
            sourceModule: finding.sourceModule || "",
            sourceCategory: finding.sourceCategory || "",
            sourcePolicy: finding.sourcePolicy || "",
            sourceRequiredEvidenceRaw: finding.sourceRequiredEvidenceRaw || "",

            sourceFileName: finding.sourceFileName || "",
            sourceFileType: finding.sourceFileType || "",
            sourceFileReference: finding.sourceFileReference || "",
            sourceCaptureMethod: finding.sourceCaptureMethod || "",
            sourceLocationLabel: finding.sourceLocationLabel || "",
            sourceInspectionArea: finding.sourceInspectionArea || "",
            sourceMeasurementValue: finding.sourceMeasurementValue ?? null,
            sourceMeasurementUnit: finding.sourceMeasurementUnit || "",
            sourceReviewStatus: finding.sourceReviewStatus || "",
            sourceExpertReviewRequired: finding.sourceExpertReviewRequired !== undefined
                ? finding.sourceExpertReviewRequired
                : true,

            profile: isPattayaFinding ? "pattaya" : "",
            country: isPattayaFinding ? "TH" : "",
            region: isPattayaFinding ? "Pattaya / Chonburi" : "",

            createdBy: "System",
            updatedBy: "System"
        });

        AssessmentManager.set(assessment);

        const activeCaseForSync = CaseManager.getCurrent();
        if (activeCaseForSync) {
            CaseManager.setCurrent({
                ...activeCaseForSync,
                assessmentIds: [...new Set([...(activeCaseForSync.assessmentIds || []), assessment.id])],
                updatedAt: new Date().toISOString()
            });
            CaseManager.save();
        }

        const updatedFinding = FindingManager.update({
            ...finding,
            assessmentIds: [...new Set([...(finding.assessmentIds || []), assessment.id])],
            linkedAssessmentId: assessment.id,
            hasAssessment: true,
            updatedAt: new Date().toISOString()
        });

        FindingManager.set(updatedFinding);

        Notification.success(LanguageManager.t("FindingAssessmentDraftCreated"));
        window.location.hash = "assessments";
    }

    static editSelectedFinding() {
        const finding = FindingManager.get();

        if (!finding) {
            Notification.info(LanguageManager.t("FindingSelectBeforeEditing"));
            return;
        }

        FormDialog.open({
            title: LanguageManager.t("FindingEditTitle"),
            submitLabel: LanguageManager.t("FindingSaveAction"),
            values: {
                title: finding.title || "",
                description: finding.description || "",
                category: finding.category || "General",
                severity: finding.severity || "Medium",
                status: finding.status || "Open"
            },
            fields: [
                { id: "title", label: LanguageManager.t("FindingTitleField") },
                { id: "description", label: LanguageManager.t("FindingDescriptionLabel") },
                {
                    id: "category",
                    label: LanguageManager.t("FindingCategoryLabel"),
                    type: "select",
                    options: ["General", "Envelope", "Roof", "Structure", "MEP", "Moisture", "Fire Safety", "Other"]
                },
                {
                    id: "severity",
                    label: LanguageManager.t("FindingSeverityLabel"),
                    type: "select",
                    options: ["Low", "Medium", "High", "Critical"]
                },
                {
                    id: "status",
                    label: LanguageManager.t("CaseStatusLabel"),
                    type: "select",
                    options: ["Open", "Identified", "Assessed", "Reviewed", "Blocked"]
                }
            ],
            onSubmit: (values, dialog) => {
                if (!values.title) return;

                const updated = FindingManager.update({
                    ...finding,
                    title: values.title,
                    description: values.description || "",
                    category: values.category || "General",
                    severity: values.severity || "Medium",
                    status: values.status || "Open",
                    updatedAt: new Date().toISOString()
                });

                FindingManager.set(updated);
                dialog.remove();
                Notification.success(LanguageManager.t("FindingUpdatedNotification"));
                this.refresh();
            }
        });
    }

    static deleteFinding(item) {
        if (!window.confirm(`${LanguageManager.t("FindingDeleteConfirmPrefix")} "${item.title || item.id}"?`)) {
            return;
        }

        FindingManager.delete(item.id);

        if (FindingManager.get()?.id === item.id) {
            FindingManager.clear();
        }

        Notification.success(LanguageManager.t("FindingDeletedNotification"));
        this.refresh();
    }

    static refresh() {
        const container = document.getElementById("workspace-page");

        if (!container) return;

        container.innerHTML = "";
        container.appendChild(this.render());
    }

    static createSampleFinding() {

        const currentCase = CaseManager.getCurrent();

        const currentBuilding = currentCase?.buildingId
            ? BuildingManager.load(currentCase.buildingId)
            : BuildingManager.get();

        const currentInspection = currentCase?.inspectionId
            ? InspectionManager.load(currentCase.inspectionId)
            : InspectionManager.get();

        const activeEvidence = EvidenceManager.get();

        if (!currentCase) {

            Notification.info(LanguageManager.t("FindingOpenCaseFirst"));

            return;

        }

        FormDialog.open({

            title: LanguageManager.t("FindingNewTitle"),

            submitLabel: LanguageManager.t("FindingCreateAction"),

            values: {

                title: "",

                description: "",

                category: "General",

                severity: "Medium",

                status: "Open"

            },

            fields: [

                {

                    id: "title",

                    label: LanguageManager.t("FindingTitleField")

                },

                {

                    id: "description",

                    label: "Description"

                },

                {

                    id: "category",

                    label: LanguageManager.t("FindingCategoryLabel"),

                    type: "select",

                    options: ["General", "Envelope", "Roof", "Structure", "MEP", "Moisture", "Fire Safety", "Other"]

                },

                {

                    id: "severity",

                    label: LanguageManager.t("FindingSeverityLabel"),

                    type: "select",

                    options: ["Low", "Medium", "High", "Critical"]

                },

                {

                    id: "status",

                    label: LanguageManager.t("CaseStatusLabel"),

                    type: "select",

                    options: ["Open", "Identified", "Assessed", "Reviewed", "Blocked"]

                }

            ],

            onSubmit: (values, dialog) => {

                if (!values.title) return;

                if (!activeEvidence) {
            Notification.info(LanguageManager.t("FindingSelectEvidenceBeforeCreating"));
            return;
        }

        const finding = FindingManager.create({

                    caseId: activeEvidence?.caseId || currentCase.id,

                    buildingId: activeEvidence?.buildingId || currentBuilding?.id || null,

                    inspectionId: activeEvidence?.inspectionId || currentInspection?.id || null,

                    evidenceIds: activeEvidence ? [activeEvidence.id] : [],

                    title: values.title,

                    description: values.description || "",

                    category: values.category || "General",

                    severity: values.severity || "Medium",

                    status: values.status || "Open"

                });

                FindingManager.set(finding);

                dialog.remove();

                Notification.success(LanguageManager.t("FindingCreatedNotification"));

                this.refresh();

            }

        });

    }


    static showPendingFeature(feature = "This feature") {
        Notification.info(`${feature} ${LanguageManager.t("FindingPendingFeatureSuffix")}`);
    }

    static getFindingIntelligence(finding = {}) {
        finding = finding || {};
        const hasIdentity = Boolean(finding.title || finding.name);
        const hasCategory = Boolean(finding.category || finding.type);
        const hasSeverity = Boolean(finding.severity || finding.priority || finding.riskLevel);
        const hasDescription = Boolean(finding.description || finding.summary || finding.note);
        const hasEvidenceLink = Boolean(
            finding.evidenceId ||
            finding.linkedEvidenceId ||
            finding.evidence ||
            finding.evidenceIds ||
            finding.hasEvidence
        );
        const hasAssessmentLink = Boolean(
            finding.assessmentId ||
            finding.linkedAssessmentId ||
            finding.assessment ||
            finding.hasAssessment
        );
        const isReviewed = Boolean(finding.reviewed || finding.status === "reviewed");

        const checks = [
            hasIdentity,
            hasCategory,
            hasSeverity,
            hasDescription,
            hasEvidenceLink,
            hasAssessmentLink,
            isReviewed
        ];

        const readiness = IntelligenceEngine.getReadinessFromChecks(checks);
        const completed = readiness.completed;
        const total = readiness.total;
        const readinessPercent = readiness.percent;

        const confidenceScore = IntelligenceEngine.getConfidenceScore({
            readinessPercent,
            primarySignals: hasSeverity ? 1 : 0,
            downstreamSignals:
                (hasEvidenceLink ? 1 : 0) +
                (hasAssessmentLink ? 1 : 0),
            outputSignals: isReviewed ? 1 : 0,
            weights: {
                readiness: 0.66,
                primary: 10,
                downstream: 9,
                output: 6
            }
        });

        let severitySignal = {
            label: LanguageManager.t("FindingLowSeveritySignal"),
            description: LanguageManager.t("FindingLowSeveritySignalDescription"),
            tone: "draft"
        };

        if (hasSeverity && hasEvidenceLink && hasAssessmentLink) {
            severitySignal = {
                label: LanguageManager.t("FindingStrongSeveritySignal"),
                description: LanguageManager.t("FindingStrongSeveritySignalDescription"),
                tone: "ready"
            };
        } else if (hasSeverity && hasDescription) {
            severitySignal = {
                label: LanguageManager.t("FindingDevelopingSeveritySignal"),
                description: LanguageManager.t("FindingDevelopingSeveritySignalDescription"),
                tone: "active"
            };
        }

        const nextAction = hasAssessmentLink
            ? {
                label: LanguageManager.t("FindingReviewLinkedAssessment"),
                description: LanguageManager.t("FindingReviewLinkedAssessmentDescription"),
                tone: "ready"
            }
            : hasSeverity && hasDescription
                ? {
                    label: LanguageManager.t("FindingCreateOrLinkAssessment"),
                    description: LanguageManager.t("FindingCreateOrLinkAssessmentDescription"),
                    tone: "active"
                }
                : {
                    label: LanguageManager.t("FindingDefineSeverity"),
                    description: LanguageManager.t("FindingDefineSeverityDescription"),
                    tone: "draft"
                };

        return {
            completed,
            total,
            readinessPercent,
            confidenceScore,
            severitySignal,
            nextAction,
            label: readinessPercent >= 100
                ? LanguageManager.t("FindingIntelligenceComplete")
                : readinessPercent >= 50
                    ? LanguageManager.t("FindingIntelligenceDeveloping")
                    : LanguageManager.t("FindingIntelligenceEarly")
        };
    }

    static renderFindingIntelligenceSnapshot(finding = {}) {
        finding = finding || {};
        const intelligence = this.getFindingIntelligence(finding);

        return `
            <section class="finding-intelligence intelligence-snapshot" aria-label="${LanguageManager.t("FindingIntelligenceLabel")}">
                <div class="finding-intelligence__header intelligence-snapshot__header">
                    <div>
                        <span class="finding-intelligence__eyebrow intelligence-snapshot__eyebrow">${LanguageManager.t("FindingIntelligenceLabel")}</span>
                        <strong>${intelligence.label}</strong>
                        <p>${intelligence.completed}/${intelligence.total} ${LanguageManager.t("FindingChecksCompleted")}</p>
                    </div>
                    <span class="finding-intelligence__score intelligence-snapshot__score">${intelligence.confidenceScore}%</span>
                </div>

                <div class="finding-intelligence__grid intelligence-snapshot__grid">
                    <article class="finding-intelligence__card intelligence-snapshot__card">
                        <span>${LanguageManager.t("FindingAssessmentReadiness")}</span>
                        <strong>${intelligence.readinessPercent}%</strong>
                        <p>${LanguageManager.t("FindingAssessmentReadinessDescription")}</p>
                    </article>

                    <article class="finding-intelligence__card intelligence-snapshot__card finding-intelligence__card--${intelligence.severitySignal.tone} intelligence-snapshot__card--${intelligence.severitySignal.tone}">
                        <span>${LanguageManager.t("FindingSeveritySignalLabel")}</span>
                        <strong>${intelligence.severitySignal.label}</strong>
                        <p>${intelligence.severitySignal.description}</p>
                    </article>

                    <article class="finding-intelligence__card intelligence-snapshot__card finding-intelligence__card--${intelligence.nextAction.tone} intelligence-snapshot__card--${intelligence.nextAction.tone}">
                        <span>${LanguageManager.t("FindingNextActionLabel")}</span>
                        <strong>${intelligence.nextAction.label}</strong>
                        <p>${intelligence.nextAction.description}</p>
                    </article>
                </div>
            </section>
        `;
    }

    static createFindingIntelligenceSnapshot(finding = FindingManager.get()) {
        if (!finding || !finding.id) {
            return document.createElement("section");
        }

        const container = document.createElement("section");
        container.className = "workflow-card";
        container.innerHTML = this.renderFindingIntelligenceSnapshot(finding);
        return container;
    }

}
