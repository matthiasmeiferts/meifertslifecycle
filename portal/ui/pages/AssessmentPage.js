import AssessmentManager from "../../core/AssessmentManager.js";
import FindingManager from "../../core/FindingManager.js";
import CaseManager from "../../core/CaseManager.js";
import BuildingManager from "../../core/BuildingManager.js";
import InspectionManager from "../../core/InspectionManager.js";
import RecommendationManager from "../../core/RecommendationManager.js";
import IntelligenceEngine from "../../core/IntelligenceEngine.js";
import WorkspaceActionGovernanceManager from "../../core/WorkspaceActionGovernanceManager.js";
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

export default class AssessmentPage {

    static flowSteps = [
        {
            key: "assessment",
            label: LanguageManager.t("WorkflowStepAssessment"),
            description: LanguageManager.t("AssessmentRiskAssessmentDefined")
        },
        {
            key: "recommendation",
            label: LanguageManager.t("AssessmentWorkflowRecommendation"),
            description: LanguageManager.t("AssessmentActionRecommendationDerived")
        }
    ];

    static statusLabels = {
        draft: LanguageManager.t("AssessmentStatusDraft"),
        assessed: LanguageManager.t("AssessmentStatusAssessed"),
        recommended: LanguageManager.t("AssessmentStatusRecommended"),
        reviewed: LanguageManager.t("AssessmentStatusReviewed"),
        blocked: LanguageManager.t("AssessmentStatusBlocked")
    };

    static render() {
        const fragment = document.createDocumentFragment();
        const assessments = this.getAssessments();
        const activeAssessment = AssessmentManager.get();

        fragment.appendChild(this.createHeader(activeAssessment));
        const currentCase = CaseManager.getCurrent();
        fragment.appendChild(WorkflowContextBanner.create(currentCase));
        fragment.appendChild(WorkflowProgressPanel.create(currentCase, "assessments"));
        const assessmentOverview = document.createElement("section");
        assessmentOverview.className = "assessment-polish-stack";
        assessmentOverview.appendChild(this.createFlowIndicator(activeAssessment));
        assessmentOverview.appendChild(this.createNextActionPanel(activeAssessment));

        fragment.appendChild(assessmentOverview);
        fragment.appendChild(this.createAssessmentIntelligenceSnapshot(activeAssessment));
        fragment.appendChild(this.createMetrics(assessments));
        fragment.appendChild(this.createToolbar());
        fragment.appendChild(this.createMainLayout(assessments, activeAssessment));

        return fragment;
    }

    static getFlowState(assessment = {}) {
        assessment = assessment || {};
        const hasRecommendationLink =
            Boolean(assessment.recommendationId) ||
            Boolean(assessment.linkedRecommendationId) ||
            Boolean(assessment.recommendation) ||
            Boolean(assessment.hasRecommendation);

        return {
            assessment: "active",
            recommendation: hasRecommendationLink ? "complete" : "next"
        };
    }

    static renderActiveFlowIndicator(assessment = {}) {
        assessment = assessment || {};
        const flowState = this.getFlowState(assessment);

        return `
            <section class="workspace-flow" aria-label="${LanguageManager.t("AssessmentActiveWorkflowStateLabel")}">
                <div class="workspace-flow__header">
                    <span class="workspace-flow__eyebrow">${LanguageManager.t("AssessmentActiveFlowLabel")}</span>
                    <strong>${LanguageManager.t("AssessmentToRecommendationLabel")}</strong>
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

    static createFlowIndicator(assessment = {}) {
        const container = document.createElement("section");
        container.className = "workflow-card";
        container.innerHTML = this.renderActiveFlowIndicator(assessment);
        return container;
    }

    static getAssessmentStatus(assessment = {}) {
        assessment = assessment || {};
        if (assessment.blocked || assessment.status === "blocked") {
            return "blocked";
        }

        if (assessment.reviewed || assessment.status === "reviewed") {
            return "reviewed";
        }

        if (
            assessment.recommendationId ||
            assessment.linkedRecommendationId ||
            assessment.recommendation ||
            assessment.hasRecommendation ||
            assessment.status === "recommended"
        ) {
            return "recommended";
        }

        if (
            assessment.assessed ||
            assessment.riskLevel ||
            assessment.riskScore ||
            assessment.severity ||
            assessment.probability ||
            assessment.impact ||
            assessment.status === "assessed"
        ) {
            return "assessed";
        }

        return "draft";
    }

    static renderAssessmentStatusBadge(assessment = {}) {
        assessment = assessment || {};
        const status = this.getAssessmentStatus(assessment);
        const label = this.statusLabels[status] || LanguageManager.t("AssessmentStatusDraft");

        return `<span class="evidence-status evidence-status--${status}">${label}</span>`;
    }

    static getNextAction(assessment = {}) {
        assessment = assessment || {};
        const status = this.getAssessmentStatus
            ? this.getAssessmentStatus(assessment)
            : "draft";

        if (status === "blocked") {
            return {
                label: LanguageManager.t("AssessmentResolveBlocker"),
                description: LanguageManager.t("AssessmentResolveBlockerDescription"),
                tone: "blocked"
            };
        }

        if (status === "reviewed") {
            return {
                label: LanguageManager.t("AssessmentCreateConfirmRecommendation"),
                description: LanguageManager.t("AssessmentReadyForRecommendation"),
                tone: "ready"
            };
        }

        if (status === "recommended") {
            return {
                label: LanguageManager.t("AssessmentReviewLinkedRecommendation"),
                description: LanguageManager.t("AssessmentAlreadyLinkedRecommendationDescription"),
                tone: "linked"
            };
        }

        if (status === "assessed") {
            return {
                label: LanguageManager.t("AssessmentCreateRecommendationShort"),
                description: LanguageManager.t("AssessmentCompleteEnoughForRecommendation"),
                tone: "active"
            };
        }

        return {
            label: LanguageManager.t("AssessmentCompleteAssessment"),
            description: LanguageManager.t("AssessmentCompleteAssessmentDescription"),
            tone: "draft"
        };
    }

    static renderNextActionPanel(assessment = {}) {
        assessment = assessment || {};
        const action = this.getNextAction(assessment);

        return `
            <section class="next-action next-action--${action.tone}" aria-label="${LanguageManager.t("AssessmentNextActionAriaLabel")}">
                <div>
                    <span class="next-action__eyebrow">${LanguageManager.t("AssessmentNextActionHeading")}</span>
                    <strong>${action.label}</strong>
                    <p>${action.description}</p>
                </div>
            </section>
        `;
    }

    static createNextActionPanel(assessment = {}) {
        const container = document.createElement("section");
        container.className = "workflow-card";
        container.innerHTML = this.renderNextActionPanel(assessment);
        return container;
    }

    static createHeader(activeAssessment = null) {
        return SectionHeader.create({
            eyebrow: LanguageManager.t("AssessmentWorkspaceTitle"),
            title: LanguageManager.t("AssessmentTitlePlural"),
            description: activeAssessment
                ? `${LanguageManager.t("AssessmentActivePrefix")}: ${activeAssessment.title || activeAssessment.id}`
                : LanguageManager.t("AssessmentHeaderDescription"),
            actions: [
                {
                    id: "new-assessment",
                    label: LanguageManager.t("AssessmentNewAction"),
                    onClick: () => this.createSampleAssessment()
                }
            ]
        });
    }

    static createMetrics(assessments = this.getAssessments()) {
        const highRiskCount = assessments.filter(item => item.severity === "High" || item.severity === "Critical").length;
        const acceptedCount = assessments.filter(item => String(item.status || "").toLowerCase() === "accepted").length;
        const highestRisk = assessments.length
            ? Math.max(...assessments.map(item => item.riskScore || 0))
            : 0;

        const grid = document.createElement("section");
        grid.className = "metrics-grid";

        grid.appendChild(MetricCard.create(LanguageManager.t("AssessmentTotalMetric"), assessments.length));
        grid.appendChild(MetricCard.create(LanguageManager.t("AssessmentHighRiskMetric"), highRiskCount));
        grid.appendChild(MetricCard.create(LanguageManager.t("AssessmentAcceptedMetric"), acceptedCount));
        grid.appendChild(MetricCard.create(LanguageManager.t("AssessmentLinkedRecommendationsMetric"), this.countRecommendationsLinkedToAssessment()));

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
                id: "close-assessment",
                label: LanguageManager.t("AssessmentCloseAction"),
                onClick: () => {
                    AssessmentManager.clear();
                    this.refresh();
                }
            },
            {
                id: "risk-model",
                label: LanguageManager.t("AssessmentCreateAction"),
                onClick: () => this.createSampleAssessment()
            },
            {
                id: "create-recommendation",
                label: LanguageManager.t("AssessmentCreateRecommendationAction"),
                onClick: () => this.createRecommendationFromSelectedAssessment()
            }
        ]));

        return wrapper;
    }

    static createMainLayout(assessments = this.getAssessments(), activeAssessment = AssessmentManager.get()) {
        const layout = document.createElement("section");
        layout.className = "case-workspace-layout";

        layout.appendChild(this.createContent(assessments));
        layout.appendChild(this.createDetailPanel(activeAssessment, assessments));

        return layout;
    }

    static createContent(assessments = this.getAssessments()) {
        if (!assessments.length) {
            return EmptyState.create({
                eyebrow: LanguageManager.t("AssessmentWorkspaceTitle"),
                title: LanguageManager.t("AssessmentEmptyTitle"),
                description: LanguageManager.t("AssessmentEmptyStateDescriptionLong"),
                actionLabel: LanguageManager.t("AssessmentNewAction"),
                onAction: () => this.createSampleAssessment()
            });
        }

        const list = document.createElement("section");
        list.className = "workflow-card evidence-list";

        assessments.forEach(assessment => {
            list.appendChild(this.createAssessmentRow(assessment));
        });

        return list;
    }

    static createAssessmentRow(assessment) {
        const row = document.createElement("article");
        row.className = "evidence-row";
        row.addEventListener("click", () => {
            AssessmentManager.set(assessment);
            this.refresh();
        });

        const content = document.createElement("button");
        content.type = "button";
        content.className = "evidence-row__content";

        const title = document.createElement("strong");
        title.textContent = assessment.title || assessment.id || LanguageManager.t("AssessmentItemFallback");

        const meta = document.createElement("span");
        meta.textContent = [
            assessment.category || "General",
            `${LanguageManager.t("AssessmentRiskPrefix")} ${assessment.riskScore || 0}`,
            assessment.source || ""
        ].filter(Boolean).join(" · ");

        const statusContainer = document.createElement("span");
        statusContainer.innerHTML = this.renderAssessmentStatusBadge(assessment);

        content.appendChild(title);
        content.appendChild(meta);
        content.appendChild(statusContainer);

        const actions = document.createElement("div");
        actions.className = "evidence-row__actions";

        const actionState = WorkspaceActionGovernanceManager.getActionState(assessment);

        [
            ["open", LanguageManager.t("AssessmentOpenAction"), actionState.openAllowed],
            ["edit", LanguageManager.t("AssessmentEditAction"), actionState.editAllowed],
            ["delete", LanguageManager.t("AssessmentDeleteAction"), actionState.deleteAllowed]
        ].forEach(([action, label, isAllowed]) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = isAllowed ? "button" : "button secondary";
            button.textContent = isAllowed ? label : `${label} · ${LanguageManager.t("AssessmentActionLockedLabel")}`;
            button.disabled = !isAllowed;
            button.title = isAllowed ? "" : actionState.reason;

            button.addEventListener("click", event => {
                event.stopPropagation();

                if (!isAllowed) {
                    Notification.warning(LanguageManager.t("AssessmentActionBlockedNotification"));
                    return;
                }

                if (action === "open") {
                    AssessmentManager.set(assessment);
                    this.refresh();
                    return;
                }

                if (action === "edit") {
                    AssessmentManager.set(assessment);
                    this.editSelectedAssessment();
                    return;
                }

                if (action === "delete") {
                    this.deleteAssessment(assessment);
                }
            });

            actions.appendChild(button);
        });

        row.appendChild(content);
        row.appendChild(actions);

        return row;
    }

    static createDetailPanel(activeAssessment = AssessmentManager.get(), assessments = this.getAssessments()) {
        if (!activeAssessment) {
            return DetailPanel.create(LanguageManager.t("AssessmentContextTitle"), [
                { label: LanguageManager.t("AssessmentTotalMetric"), value: String(assessments.length) },
                { label: LanguageManager.t("AssessmentSelectedLabel"), value: LanguageManager.t("AssessmentNotSelected") },
                { label: LanguageManager.t("AssessmentTechnicalRiskLabel"), value: assessments.length ? LanguageManager.t("AssessmentInReview") : LanguageManager.t("AssessmentPending") },
                { label: LanguageManager.t("AssessmentWorkspaceStatusLabel"), value: "—" },
                { label: LanguageManager.t("AssessmentNextStepLabel"), value: LanguageManager.t("AssessmentCreateOrSelect") }
            ]);
        }

        const statusLabel = this.statusLabels[this.getAssessmentStatus(activeAssessment)] || LanguageManager.t("AssessmentStatusDraft");

        return DetailPanel.create(LanguageManager.t("AssessmentContextTitle"), [
            { label: LanguageManager.t("AssessmentSelectedLabel"), value: activeAssessment.title || activeAssessment.id },
            { label: LanguageManager.t("AssessmentWorkspaceStatusLabel"), value: statusLabel },
            ...ReviewAuditTrailFields.create(activeAssessment),
            { label: LanguageManager.t("AssessmentSafetyBoundariesLabel"), value: DetailPanel.createBoundaryBadges(activeAssessment) },
            { label: LanguageManager.t("AssessmentSourceLabel"), value: activeAssessment.source || LanguageManager.t("AssessmentReviewSource") },
            { label: LanguageManager.t("AssessmentCaseIdLabel"), value: activeAssessment.caseId || LanguageManager.t("AssessmentNotLinked") },
            { label: LanguageManager.t("AssessmentBuildingIdLabel"), value: activeAssessment.buildingId || LanguageManager.t("AssessmentNotLinked") },
            { label: LanguageManager.t("AssessmentInspectionIdLabel"), value: activeAssessment.inspectionId || LanguageManager.t("AssessmentNotLinked") },
            { label: LanguageManager.t("AssessmentFindingIdsLabel"), value: (activeAssessment.findingIds || []).join(", ") || LanguageManager.t("AssessmentNone") },
            { label: LanguageManager.t("AssessmentEvidenceIdsLabel"), value: (activeAssessment.evidenceIds || []).join(", ") || LanguageManager.t("AssessmentNone") },
            { label: LanguageManager.t("AssessmentCategoryLabel"), value: activeAssessment.category || LanguageManager.t("AssessmentGeneral") },
            { label: LanguageManager.t("AssessmentBuildingSystemLabel"), value: activeAssessment.buildingSystem || LanguageManager.t("AssessmentNotLinked") },
            { label: LanguageManager.t("AssessmentSeverityLabel"), value: activeAssessment.severity || LanguageManager.t("AssessmentUnrated") },
            { label: LanguageManager.t("AssessmentProbabilityLabel"), value: activeAssessment.probability || LanguageManager.t("AssessmentUnrated") },
            { label: LanguageManager.t("AssessmentConsequenceLabel"), value: activeAssessment.consequence || LanguageManager.t("AssessmentUnrated") },
            { label: LanguageManager.t("AssessmentRiskScoreLabel"), value: String(activeAssessment.riskScore || 0) },
            { label: LanguageManager.t("AssessmentDescriptionField"), value: activeAssessment.description || LanguageManager.t("AssessmentNoDescription") },
            { label: LanguageManager.t("AssessmentRecommendationIdsLabel"), value: (activeAssessment.recommendationIds || []).join(", ") || LanguageManager.t("AssessmentNone") },
            { label: LanguageManager.t("AssessmentLinkedRecommendationsMetric"), value: String(this.countRecommendationsLinkedToAssessment(activeAssessment.id)) }
        ]);
    }

    static countRecommendationsLinkedToAssessment(assessmentId = null) {
        const targetAssessmentId = assessmentId || AssessmentManager.get()?.id;

        if (!targetAssessmentId) {
            return 0;
        }

        return RecommendationManager.getAll()
            .filter(recommendation => (recommendation.assessmentIds || []).includes(targetAssessmentId))
            .length;
    }

    static formatSourceMeasurement(assessment = {}) {
        if (
            assessment.sourceMeasurementValue === null ||
            assessment.sourceMeasurementValue === undefined ||
            assessment.sourceMeasurementValue === ""
        ) {
            return "None";
        }

        return `${assessment.sourceMeasurementValue}${assessment.sourceMeasurementUnit ? " " + assessment.sourceMeasurementUnit : ""}`;
    }

    static createRecommendationFromSelectedAssessment() {
        const assessment = AssessmentManager.get();
        const currentCase = CaseManager.getCurrent();

        if (!assessment) {
            Notification.warning(LanguageManager.t("AssessmentSelectFirstWarning"));
            return;
        }

        if (!assessment.caseId) {
            Notification.warning(LanguageManager.t("AssessmentNotLinkedCaseWarning"));
            return;
        }

        if (currentCase && currentCase.id !== assessment.caseId) {
            Notification.warning(LanguageManager.t("AssessmentBelongsOtherCaseWarning"));
            return;
        }

        const actionState = WorkspaceActionGovernanceManager.getActionState(assessment, {
            requireContent: true,
            blockedReason: LanguageManager.t("AssessmentBlockedActionReason"),
            contentRequiredReason: LanguageManager.t("AssessmentContentRequiredBeforeRecommendationReason")
        });

        if (!actionState.downstreamAllowed) {
            Notification.warning(LanguageManager.t("AssessmentDownstreamActionBlockedNotification"));
            return;
        }

        const isPattayaAssessment =
            assessment.profile === "pattaya" ||
            String(assessment.sourceQuestionId || "").startsWith("TH-PATTAYA-");

        const isAvailabilityCheckOnly = assessment.sourcePolicy === "availability_check_only";
        const riskScore = assessment.riskScore || 0;

        const recommendationTitle = assessment.title
            ? `${LanguageManager.t("AssessmentRecommendationDraftPrefix")}: ${assessment.title}`
            : `${LanguageManager.t("AssessmentRecommendationDraftFrom")} ${assessment.id}`;

        const actionText = isAvailabilityCheckOnly
            ? LanguageManager.t("AssessmentAvailabilityActionText")
            : LanguageManager.t("AssessmentDefaultActionText");

        const timeframe = isAvailabilityCheckOnly
            ? "Planned"
            : riskScore >= 60 ? "Immediate"
            : riskScore >= 30 ? "Short Term"
            : "Planned";

        const decisionImpact = isAvailabilityCheckOnly
            ? "Low"
            : riskScore >= 60 ? "High"
            : "Medium";

        const descriptionParts = [
            assessment.description || LanguageManager.t("AssessmentRecommendationPreparedFromSelected"),
            "",
            LanguageManager.t("AssessmentRecommendationStatusLabel"),
            LanguageManager.t("AssessmentDraftRecommendationCreatedLine"),
            LanguageManager.t("AssessmentExpertReviewBeforeDecisionLine"),
            LanguageManager.t("AssessmentNoAutomaticDecisionLine")
        ];

        if (isAvailabilityCheckOnly) {
            descriptionParts.push("");
            descriptionParts.push(LanguageManager.t("AssessmentReviewBoundaryLabel"));
            descriptionParts.push(LanguageManager.t("AssessmentAvailabilityBoundaryLine"));
            descriptionParts.push(LanguageManager.t("AssessmentRecommendationDraftBoundaryLine"));
        }

        if (isPattayaAssessment) {
            descriptionParts.push("");
            descriptionParts.push(LanguageManager.t("AssessmentThailandPattayaContextLabel"));
            descriptionParts.push(LanguageManager.t("AssessmentFieldReviewContextLine"));
        }

        descriptionParts.push("");
        descriptionParts.push(LanguageManager.t("AssessmentTraceLabel"));
        descriptionParts.push(`${LanguageManager.t("AssessmentIdTraceLabel")}: ${assessment.id}`);
        descriptionParts.push(`${LanguageManager.t("AssessmentSourceTraceLabel")}: ${assessment.source || LanguageManager.t("AssessmentReviewSource")}`);
        descriptionParts.push(`${LanguageManager.t("AssessmentFindingIdsLabel")}: ${(assessment.findingIds || []).join(", ") || LanguageManager.t("AssessmentNone")}`);
        descriptionParts.push(`${LanguageManager.t("AssessmentEvidenceIdsLabel")}: ${(assessment.evidenceIds || []).join(", ") || LanguageManager.t("AssessmentNone")}`);
        descriptionParts.push(`${LanguageManager.t("AssessmentSourceFindingIdsTraceLabel")}: ${(assessment.sourceFindingIds || []).join(", ") || LanguageManager.t("AssessmentNone")}`);
        descriptionParts.push(`${LanguageManager.t("AssessmentSourceEvidenceIdsTraceLabel")}: ${(assessment.sourceEvidenceIds || []).join(", ") || LanguageManager.t("AssessmentNone")}`);
        descriptionParts.push(`${LanguageManager.t("AssessmentSourcePolicyTraceLabel")}: ${assessment.sourcePolicy || LanguageManager.t("AssessmentNone")}`);
        descriptionParts.push(`${LanguageManager.t("AssessmentRiskScoreTraceLabel")}: ${riskScore}`);
        descriptionParts.push(`${LanguageManager.t("AssessmentExpertReviewRequiredTraceLabel")}: ${assessment.expertReviewRequired === false ? LanguageManager.t("AssessmentNo") : LanguageManager.t("AssessmentYes")}`);

        const hasEvidenceMetadataTrace = Boolean(
            assessment.sourceFileName ||
            assessment.sourceFileType ||
            assessment.sourceFileReference ||
            assessment.sourceCaptureMethod ||
            assessment.sourceLocationLabel ||
            assessment.sourceInspectionArea ||
            assessment.sourceMeasurementValue !== null && assessment.sourceMeasurementValue !== undefined ||
            assessment.sourceMeasurementUnit ||
            assessment.sourceReviewStatus
        );

        if (hasEvidenceMetadataTrace) {
            descriptionParts.push("");
            descriptionParts.push("Evidence metadata trace:");
            descriptionParts.push(`File name: ${assessment.sourceFileName || "None"}`);
            descriptionParts.push(`File type: ${assessment.sourceFileType || "None"}`);
            descriptionParts.push(`File reference: ${assessment.sourceFileReference || "None"}`);
            descriptionParts.push(`Capture method: ${assessment.sourceCaptureMethod || "None"}`);
            descriptionParts.push(`Location label: ${assessment.sourceLocationLabel || "None"}`);
            descriptionParts.push(`Inspection area: ${assessment.sourceInspectionArea || "None"}`);
            descriptionParts.push(`Measurement: ${this.formatSourceMeasurement(assessment)}`);
            descriptionParts.push(`Evidence review status: ${assessment.sourceReviewStatus || "None"}`);
            descriptionParts.push(`Expert review required: ${assessment.sourceExpertReviewRequired === false ? "No" : "Yes"}`);
        }

        const recommendation = RecommendationManager.create({
            caseId: assessment.caseId,
            buildingId: assessment.buildingId || currentCase?.buildingId || null,
            inspectionId: assessment.inspectionId || currentCase?.inspectionId || null,

            assessmentIds: [assessment.id],
            findingIds: assessment.findingIds || [],
            evidenceIds: assessment.evidenceIds || [],

            sourceAssessmentIds: [assessment.id],
            sourceFindingIds: assessment.sourceFindingIds || assessment.findingIds || [],
            sourceEvidenceIds: assessment.sourceEvidenceIds || assessment.evidenceIds || [],

            title: recommendationTitle,
            description: descriptionParts.join("\n"),
            action: actionText,
            source: assessment.source || LanguageManager.t("AssessmentReviewSource"),
            buildingSystem: assessment.buildingSystem || "",
            riskScore,

            priority: isAvailabilityCheckOnly ? "Medium" : (assessment.priority || "High"),
            timeframe,
            estimatedCost: 0,
            currency: "EUR",
            responsible: "Owner",
            decisionImpact,
            status: "Draft",
            reviewStatus: "Draft",
            expertReviewRequired: true,
            noAutomaticDecision: true,

            sourceQuestionId: assessment.sourceQuestionId || "",
            sourceQuestion: assessment.sourceQuestion || "",
            sourceModule: assessment.sourceModule || "",
            sourceCategory: assessment.sourceCategory || "",
            sourcePolicy: assessment.sourcePolicy || "",
            sourceRequiredEvidenceRaw: assessment.sourceRequiredEvidenceRaw || "",

            sourceFileName: assessment.sourceFileName || "",
            sourceFileType: assessment.sourceFileType || "",
            sourceFileReference: assessment.sourceFileReference || "",
            sourceCaptureMethod: assessment.sourceCaptureMethod || "",
            sourceLocationLabel: assessment.sourceLocationLabel || "",
            sourceInspectionArea: assessment.sourceInspectionArea || "",
            sourceMeasurementValue: assessment.sourceMeasurementValue ?? null,
            sourceMeasurementUnit: assessment.sourceMeasurementUnit || "",
            sourceReviewStatus: assessment.sourceReviewStatus || "",
            sourceExpertReviewRequired: assessment.sourceExpertReviewRequired !== undefined
                ? assessment.sourceExpertReviewRequired
                : true,

            profile: isPattayaAssessment ? "pattaya" : "",
            country: isPattayaAssessment ? "TH" : "",
            region: isPattayaAssessment ? "Pattaya / Chonburi" : "",

            createdBy: "System",
            updatedBy: "System"
        });

        RecommendationManager.set(recommendation);

        const activeCaseForSync = CaseManager.getCurrent();
        if (activeCaseForSync) {
            CaseManager.setCurrent({
                ...activeCaseForSync,
                recommendationIds: [...new Set([...(activeCaseForSync.recommendationIds || []), recommendation.id])],
                updatedAt: new Date().toISOString()
            });
            CaseManager.save();
        }

        const updatedAssessment = AssessmentManager.update({
            ...assessment,
            recommendationIds: [...new Set([...(assessment.recommendationIds || []), recommendation.id])],
            linkedRecommendationId: recommendation.id,
            hasRecommendation: true,
            updatedAt: new Date().toISOString()
        });

        AssessmentManager.set(updatedAssessment);

        Notification.success(LanguageManager.t("AssessmentRecommendationDraftCreated"));
        window.location.hash = "recommendations";
    }

    static getAssessments() {
        const currentCase = CaseManager.getCurrent();

        if (currentCase) {
            return AssessmentManager.getByCase(currentCase.id);
        }

        return AssessmentManager.getAll();
    }

    static createSampleAssessment() {
        const currentCase = CaseManager.getCurrent();
        const currentBuilding = currentCase?.buildingId
            ? BuildingManager.load(currentCase.buildingId)
            : BuildingManager.get();
        const currentInspection = currentCase?.inspectionId
            ? InspectionManager.load(currentCase.inspectionId)
            : InspectionManager.get();
        const activeFinding = FindingManager.get();

        if (!currentCase) {
            Notification.info(LanguageManager.t("AssessmentOpenCaseFirst"));
            return;
        }

        FormDialog.open({
            title: LanguageManager.t("AssessmentNewTitle"),
            submitLabel: LanguageManager.t("AssessmentCreateAction"),
            values: {
                title: "",
                description: "",
                category: activeFinding?.category || "General",
                severity: activeFinding?.severity || "Medium",
                probability: "Medium",
                consequence: "Medium",
                priority: "Medium",
                status: "Draft"
            },
            fields: [
                {
                    id: "title",
                    label: LanguageManager.t("AssessmentTitleField")
                },
                {
                    id: "description",
                    label: LanguageManager.t("AssessmentDescriptionField")
                },
                {
                    id: "category",
                    label: LanguageManager.t("AssessmentCategoryLabel"),
                    type: "select",
                    options: [
                            { value: "General", label: LanguageManager.t("AssessmentOptionGeneral") },
                            { value: "Envelope", label: LanguageManager.t("AssessmentOptionEnvelope") },
                            { value: "Roof", label: LanguageManager.t("AssessmentOptionRoof") },
                            { value: "Structure", label: LanguageManager.t("AssessmentOptionStructure") },
                            { value: "MEP", label: LanguageManager.t("AssessmentOptionMEP") },
                            { value: "Moisture", label: LanguageManager.t("AssessmentOptionMoisture") },
                            { value: "Fire Safety", label: LanguageManager.t("AssessmentOptionFireSafety") },
                            { value: "Other", label: LanguageManager.t("AssessmentOptionOther") }
                        ]
                },
                {
                    id: "severity",
                    label: LanguageManager.t("AssessmentSeverityLabel"),
                    type: "select",
                    options: [
                            { value: "Low", label: LanguageManager.t("AssessmentOptionLow") },
                            { value: "Medium", label: LanguageManager.t("AssessmentOptionMedium") },
                            { value: "High", label: LanguageManager.t("AssessmentOptionHigh") },
                            { value: "Critical", label: LanguageManager.t("AssessmentOptionCritical") }
                        ]
                },
                {
                    id: "probability",
                    label: LanguageManager.t("AssessmentProbabilityLabel"),
                    type: "select",
                    options: [
                            { value: "Low", label: LanguageManager.t("AssessmentOptionLow") },
                            { value: "Medium", label: LanguageManager.t("AssessmentOptionMedium") },
                            { value: "High", label: LanguageManager.t("AssessmentOptionHigh") }
                        ]
                },
                {
                    id: "consequence",
                    label: LanguageManager.t("AssessmentConsequenceLabel"),
                    type: "select",
                    options: [
                            { value: "Low", label: LanguageManager.t("AssessmentOptionLow") },
                            { value: "Medium", label: LanguageManager.t("AssessmentOptionMedium") },
                            { value: "High", label: LanguageManager.t("AssessmentOptionHigh") }
                        ]
                },
                {
                    id: "priority",
                    label: LanguageManager.t("AssessmentPriorityLabel"),
                    type: "select",
                    options: [
                            { value: "Low", label: LanguageManager.t("AssessmentOptionLow") },
                            { value: "Medium", label: LanguageManager.t("AssessmentOptionMedium") },
                            { value: "High", label: LanguageManager.t("AssessmentOptionHigh") },
                            { value: "Critical", label: LanguageManager.t("AssessmentOptionCritical") }
                        ]
                },
                {
                    id: "status",
                    label: LanguageManager.t("CaseStatusLabel"),
                    type: "select",
                    options: [
                            { value: "Draft", label: LanguageManager.t("AssessmentStatusDraft") },
                            { value: "Assessed", label: LanguageManager.t("AssessmentStatusAssessed") },
                            { value: "Recommended", label: LanguageManager.t("AssessmentStatusRecommended") },
                            { value: "Reviewed", label: LanguageManager.t("AssessmentStatusReviewed") },
                            { value: "Blocked", label: LanguageManager.t("AssessmentStatusBlocked") }
                        ]
                }
            ],
            onSubmit: (values, dialog) => {
                if (!values.title) return;

                if (!activeFinding) {
            Notification.info(LanguageManager.t("AssessmentSelectFindingBeforeCreating"));
            return;
        }

        const assessment = AssessmentManager.create({
                    caseId: activeFinding?.caseId || currentCase.id,
                    buildingId: activeFinding?.buildingId || currentBuilding?.id || null,
                    inspectionId: activeFinding?.inspectionId || currentInspection?.id || null,
                    findingIds: activeFinding ? [activeFinding.id] : [],
                    title: values.title,
                    description: values.description || "",
                    category: values.category || "General",
                    severity: values.severity || "Medium",
                    probability: values.probability || "Medium",
                    consequence: values.consequence || "Medium",
                    riskScore: AssessmentManager.calculateRiskScore(
                        values.severity || "Medium",
                        values.probability || "Medium",
                        values.consequence || "Medium"
                    ),
                    priority: values.priority || "Medium",
                    status: values.status || "Draft"
                });

                AssessmentManager.set(assessment);
                dialog.remove();
                Notification.success(LanguageManager.t("AssessmentCreatedNotification"));
                this.refresh();
            }
        });
    }

    static editSelectedAssessment() {
        const assessment = AssessmentManager.get();

        if (!assessment) {
            Notification.info(LanguageManager.t("AssessmentSelectBeforeEditing"));
            return;
        }

        const actionState = WorkspaceActionGovernanceManager.getActionState(assessment);

        if (!actionState.editAllowed) {
            Notification.warning(LanguageManager.t("AssessmentEditBlockedNotification"));
            return;
        }

        FormDialog.open({
            title: LanguageManager.t("AssessmentEditTitle"),
            submitLabel: LanguageManager.t("AssessmentSaveAction"),
            values: {
                title: assessment.title || "",
                description: assessment.description || "",
                category: assessment.category || "General",
                severity: assessment.severity || "Medium",
                probability: assessment.probability || "Medium",
                consequence: assessment.consequence || "Medium",
                priority: assessment.priority || "Medium",
                status: assessment.status || "Draft"
            },
            fields: [
                { id: "title", label: LanguageManager.t("AssessmentTitleField") },
                { id: "description", label: LanguageManager.t("AssessmentDescriptionField") },
                {
                    id: "category",
                    label: LanguageManager.t("AssessmentCategoryLabel"),
                    type: "select",
                    options: [
                            { value: "General", label: LanguageManager.t("AssessmentOptionGeneral") },
                            { value: "Envelope", label: LanguageManager.t("AssessmentOptionEnvelope") },
                            { value: "Roof", label: LanguageManager.t("AssessmentOptionRoof") },
                            { value: "Structure", label: LanguageManager.t("AssessmentOptionStructure") },
                            { value: "MEP", label: LanguageManager.t("AssessmentOptionMEP") },
                            { value: "Moisture", label: LanguageManager.t("AssessmentOptionMoisture") },
                            { value: "Fire Safety", label: LanguageManager.t("AssessmentOptionFireSafety") },
                            { value: "Other", label: LanguageManager.t("AssessmentOptionOther") }
                        ]
                },
                {
                    id: "severity",
                    label: LanguageManager.t("AssessmentSeverityLabel"),
                    type: "select",
                    options: [
                            { value: "Low", label: LanguageManager.t("AssessmentOptionLow") },
                            { value: "Medium", label: LanguageManager.t("AssessmentOptionMedium") },
                            { value: "High", label: LanguageManager.t("AssessmentOptionHigh") },
                            { value: "Critical", label: LanguageManager.t("AssessmentOptionCritical") }
                        ]
                },
                {
                    id: "probability",
                    label: LanguageManager.t("AssessmentProbabilityLabel"),
                    type: "select",
                    options: [
                            { value: "Low", label: LanguageManager.t("AssessmentOptionLow") },
                            { value: "Medium", label: LanguageManager.t("AssessmentOptionMedium") },
                            { value: "High", label: LanguageManager.t("AssessmentOptionHigh") }
                        ]
                },
                {
                    id: "consequence",
                    label: LanguageManager.t("AssessmentConsequenceLabel"),
                    type: "select",
                    options: [
                            { value: "Low", label: LanguageManager.t("AssessmentOptionLow") },
                            { value: "Medium", label: LanguageManager.t("AssessmentOptionMedium") },
                            { value: "High", label: LanguageManager.t("AssessmentOptionHigh") }
                        ]
                },
                {
                    id: "priority",
                    label: LanguageManager.t("AssessmentPriorityLabel"),
                    type: "select",
                    options: [
                            { value: "Low", label: LanguageManager.t("AssessmentOptionLow") },
                            { value: "Medium", label: LanguageManager.t("AssessmentOptionMedium") },
                            { value: "High", label: LanguageManager.t("AssessmentOptionHigh") },
                            { value: "Critical", label: LanguageManager.t("AssessmentOptionCritical") }
                        ]
                },
                {
                    id: "status",
                    label: LanguageManager.t("CaseStatusLabel"),
                    type: "select",
                    options: [
                            { value: "Draft", label: LanguageManager.t("AssessmentStatusDraft") },
                            { value: "Assessed", label: LanguageManager.t("AssessmentStatusAssessed") },
                            { value: "Recommended", label: LanguageManager.t("AssessmentStatusRecommended") },
                            { value: "Reviewed", label: LanguageManager.t("AssessmentStatusReviewed") },
                            { value: "Blocked", label: LanguageManager.t("AssessmentStatusBlocked") }
                        ]
                }
            ],
            onSubmit: (values, dialog) => {
                if (!values.title) return;

                const updated = AssessmentManager.update({
                    ...assessment,
                    title: values.title,
                    description: values.description || "",
                    category: values.category || "General",
                    severity: values.severity || "Medium",
                    probability: values.probability || "Medium",
                    consequence: values.consequence || "Medium",
                    riskScore: AssessmentManager.calculateRiskScore(
                        values.severity || "Medium",
                        values.probability || "Medium",
                        values.consequence || "Medium"
                    ),
                    priority: values.priority || "Medium",
                    status: values.status || "Draft",
                    updatedAt: new Date().toISOString()
                });

                AssessmentManager.set(updated);
                dialog.remove();
                Notification.success(LanguageManager.t("AssessmentUpdatedNotification"));
                this.refresh();
            }
        });
    }

    static deleteAssessment(item) {
        const actionState = WorkspaceActionGovernanceManager.getActionState(item);

        if (!actionState.deleteAllowed) {
            Notification.warning(LanguageManager.t("AssessmentDeleteBlockedNotification"));
            return;
        }

        if (!window.confirm(`${LanguageManager.t("AssessmentDeleteConfirmPrefix")} "${item.title || item.id}"?`)) {
            return;
        }

        AssessmentManager.delete(item.id);

        if (AssessmentManager.get()?.id === item.id) {
            AssessmentManager.clear();
        }

        Notification.success(LanguageManager.t("AssessmentDeletedNotification"));
        this.refresh();
    }

    static refresh() {
        const container = document.getElementById("workspace-page");

        if (!container) return;

        container.innerHTML = "";
        container.appendChild(this.render());
    }

    static showPendingFeature(feature = "This feature") {
        Notification.info(`${feature} ${LanguageManager.t("AssessmentPendingFeatureSuffix")}`);
    }

    static getAssessmentIntelligence(assessment = {}) {
        assessment = assessment || {};
        const hasIdentity = Boolean(assessment.title || assessment.name);
        const hasRiskLevel = Boolean(assessment.riskLevel || assessment.riskScore);
        const hasSeverity = Boolean(assessment.severity);
        const hasProbability = Boolean(assessment.probability);
        const hasImpact = Boolean(assessment.impact);
        const hasFindingLink = Boolean(
            assessment.findingId ||
            assessment.linkedFindingId ||
            assessment.finding ||
            assessment.hasFinding
        );
        const hasRecommendationLink = Boolean(
            assessment.recommendationId ||
            assessment.linkedRecommendationId ||
            assessment.recommendation ||
            assessment.hasRecommendation
        );
        const isReviewed = Boolean(assessment.reviewed || assessment.status === "reviewed");

        const checks = [
            hasIdentity,
            hasRiskLevel,
            hasSeverity,
            hasProbability,
            hasImpact,
            hasFindingLink,
            hasRecommendationLink,
            isReviewed
        ];

        const readiness = IntelligenceEngine.getReadinessFromChecks(checks);
        const completed = readiness.completed;
        const total = readiness.total;
        const readinessPercent = readiness.percent;

        const confidenceScore = IntelligenceEngine.getConfidenceScore({
            readinessPercent,
            primarySignals:
                (hasRiskLevel ? 1 : 0) +
                (hasSeverity && hasProbability && hasImpact ? 1 : 0),
            downstreamSignals: hasRecommendationLink ? 1 : 0,
            outputSignals: isReviewed ? 1 : 0,
            weights: {
                readiness: 0.62,
                primary: 11,
                downstream: 10,
                output: 6
            }
        });

        let riskLogicSignal = {
            label: LanguageManager.t("AssessmentLowRiskLogic"),
            description: LanguageManager.t("AssessmentLowRiskLogicDescription"),
            tone: "draft"
        };

        if (hasRiskLevel && hasSeverity && hasProbability && hasImpact && hasRecommendationLink) {
            riskLogicSignal = {
                label: LanguageManager.t("AssessmentStrongRiskLogic"),
                description: LanguageManager.t("AssessmentStrongRiskLogicDescription"),
                tone: "ready"
            };
        } else if (hasRiskLevel && (hasSeverity || hasProbability || hasImpact)) {
            riskLogicSignal = {
                label: LanguageManager.t("AssessmentDevelopingRiskLogic"),
                description: LanguageManager.t("AssessmentDevelopingRiskLogicDescription"),
                tone: "active"
            };
        }

        const nextAction = hasRecommendationLink
            ? {
                label: LanguageManager.t("AssessmentReviewLinkedRecommendation"),
                description: LanguageManager.t("AssessmentReviewLinkedRecommendationDescription"),
                tone: "ready"
            }
            : hasRiskLevel && hasSeverity && hasProbability && hasImpact
                ? {
                    label: LanguageManager.t("AssessmentCreateOrLinkRecommendation"),
                    description: LanguageManager.t("AssessmentCreateOrLinkRecommendationDescription"),
                    tone: "active"
                }
                : {
                    label: LanguageManager.t("AssessmentCompleteRiskLogic"),
                    description: LanguageManager.t("AssessmentCompleteRiskLogicDescription"),
                    tone: "draft"
                };

        return {
            completed,
            total,
            readinessPercent,
            confidenceScore,
            riskLogicSignal,
            nextAction,
            label: readinessPercent >= 100
                ? LanguageManager.t("AssessmentIntelligenceComplete")
                : readinessPercent >= 50
                    ? LanguageManager.t("AssessmentIntelligenceDeveloping")
                    : LanguageManager.t("AssessmentIntelligenceEarly")
        };
    }

    static renderAssessmentIntelligenceSnapshot(assessment = {}) {
        assessment = assessment || {};
        const intelligence = this.getAssessmentIntelligence(assessment);

        return `
            <section class="assessment-intelligence intelligence-snapshot" aria-label="${LanguageManager.t("AssessmentIntelligenceLabel")}">
                <div class="assessment-intelligence__header intelligence-snapshot__header">
                    <div>
                        <span class="assessment-intelligence__eyebrow intelligence-snapshot__eyebrow">${LanguageManager.t("AssessmentIntelligenceLabel")}</span>
                        <strong>${intelligence.label}</strong>
                        <p>${intelligence.completed}/${intelligence.total} ${LanguageManager.t("AssessmentChecksCompleted")}</p>
                    </div>
                    <span class="assessment-intelligence__score intelligence-snapshot__score">${intelligence.confidenceScore}%</span>
                </div>

                <div class="assessment-intelligence__grid intelligence-snapshot__grid">
                    <article class="assessment-intelligence__card intelligence-snapshot__card">
                        <span>${LanguageManager.t("AssessmentRecommendationReadiness")}</span>
                        <strong>${intelligence.readinessPercent}%</strong>
                        <p>${LanguageManager.t("AssessmentRecommendationReadinessDescription")}</p>
                    </article>

                    <article class="assessment-intelligence__card intelligence-snapshot__card assessment-intelligence__card--${intelligence.riskLogicSignal.tone} intelligence-snapshot__card--${intelligence.riskLogicSignal.tone}">
                        <span>${LanguageManager.t("AssessmentRiskLogicSignalLabel")}</span>
                        <strong>${intelligence.riskLogicSignal.label}</strong>
                        <p>${intelligence.riskLogicSignal.description}</p>
                    </article>

                    <article class="assessment-intelligence__card intelligence-snapshot__card assessment-intelligence__card--${intelligence.nextAction.tone} intelligence-snapshot__card--${intelligence.nextAction.tone}">
                        <span>${LanguageManager.t("AssessmentNextActionLabel")}</span>
                        <strong>${intelligence.nextAction.label}</strong>
                        <p>${intelligence.nextAction.description}</p>
                    </article>
                </div>
            </section>
        `;
    }

    static createAssessmentIntelligenceSnapshot(assessment = AssessmentManager.get()) {
        if (!assessment || !assessment.id) {
            return document.createElement("section");
        }

        const container = document.createElement("section");
        container.className = "workflow-card";
        container.innerHTML = this.renderAssessmentIntelligenceSnapshot(assessment);
        return container;
    }

}
