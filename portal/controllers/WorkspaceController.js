import CaseManager from "../core/CaseManager.js";
import BuildingManager from "../core/BuildingManager.js";
import InspectionManager from "../core/InspectionManager.js";
import EvidenceManager from "../core/EvidenceManager.js";
import FindingManager from "../core/FindingManager.js";
import AssessmentManager from "../core/AssessmentManager.js";
import RecommendationManager from "../core/RecommendationManager.js";
import DecisionManager from "../core/DecisionManager.js";
import ReportManager from "../core/ReportManager.js";
import LanguageManager from "../core/LanguageManager.js";

export default class WorkspaceController {

    static safeValue(fn, fallback = 0) {
        try {
            const value = fn();
            return value ?? fallback;
        } catch (error) {
            console.warn("WorkspaceController unavailable value:", error);
            return fallback;
        }
    }

    static getActiveCase() {
        return this.safeValue(() => CaseManager.getCurrent(), null);
    }

    static getActiveCaseBuilding() {
        const currentCase = this.getActiveCase();
        if (!currentCase ?.buildingId) return null;
        return this.safeValue(() => BuildingManager.load(currentCase.buildingId), null);
    }

    static getActiveCaseInspection() {
        const currentCase = this.getActiveCase();
        if (!currentCase ?.inspectionId) return null;
        return this.safeValue(() => InspectionManager.load(currentCase.inspectionId), null);
    }

    static getActiveCaseId() {
        return this.getActiveCase()?.id || null;
    }

    static getScopedWorkflowCounts() {
        const caseId = this.getActiveCaseId();

        if (!caseId) {
            return {
                evidence: this.safeValue(() => EvidenceManager.count()),
                findings: this.safeValue(() => FindingManager.count()),
                assessments: this.safeValue(() => AssessmentManager.count()),
                recommendations: this.safeValue(() => RecommendationManager.count()),
                decisions: this.safeValue(() => DecisionManager.count()),
                reports: this.safeValue(() => ReportManager.count())
            };
        }

        return {
            evidence: this.safeValue(() => EvidenceManager.countByCase(caseId)),
            findings: this.safeValue(() => FindingManager.countByCase(caseId)),
            assessments: this.safeValue(() => AssessmentManager.countByCase(caseId)),
            recommendations: this.safeValue(() => RecommendationManager.countByCase(caseId)),
            decisions: this.safeValue(() => DecisionManager.countByCase(caseId)),
            reports: this.safeValue(() => ReportManager.getByCase(caseId).length)
        };
    }

    static getMetrics() {
        const currentCase = this.getActiveCase();
        const activeCaseBuilding = this.getActiveCaseBuilding();
        const activeCaseInspection = this.getActiveCaseInspection();
        const workflowCounts = this.getScopedWorkflowCounts();

        return [
            { title: LanguageManager.t("NavCases"), value: this.safeValue(() => CaseManager.getAll().length) },
            { title: LanguageManager.t("NavBuildings"), value: currentCase ? (activeCaseBuilding ? 1 : 0) : this.safeValue(() => BuildingManager.count()) },
            { title: LanguageManager.t("NavInspections"), value: currentCase ? (activeCaseInspection ? 1 : 0) : this.safeValue(() => InspectionManager.getAllInspections().length) },
            { title: LanguageManager.t("NavEvidence"), value: workflowCounts.evidence },
            { title: LanguageManager.t("NavFindings"), value: workflowCounts.findings },
            { title: LanguageManager.t("NavAssessments"), value: workflowCounts.assessments },
            { title: LanguageManager.t("NavRecommendations"), value: workflowCounts.recommendations },
            { title: LanguageManager.t("NavDecisions"), value: workflowCounts.decisions },
            { title: LanguageManager.t("NavReports"), value: workflowCounts.reports }
        ];
    }

    static getActiveCaseSummary() {
        const currentCase = this.getActiveCase();
        const building = this.getActiveCaseBuilding();
        const inspection = this.getActiveCaseInspection();

        let subtitle = LanguageManager.t("WorkspaceOpenCasePrompt");

        if (building && inspection) {
            subtitle = `${building.name || building.address} · ${inspection.title || inspection.inspectionType || inspection.id}`;
        } else if (building) {
            subtitle = `${building.name || building.address}`;
        } else if (inspection) {
            subtitle = `${inspection.title || inspection.inspectionType || inspection.id}`;
        }

        return {
            title: currentCase ?.name || currentCase ?.title || LanguageManager.t("WorkspaceNoActiveCase"),
            subtitle
        };
    }

    static getWorkflowState() {
        const currentCase = this.getActiveCase();
        const activeCaseBuilding = this.getActiveCaseBuilding();
        const activeCaseInspection = this.getActiveCaseInspection();
        const workflowCounts = this.getScopedWorkflowCounts();
        const evidence = workflowCounts.evidence;
        const findings = workflowCounts.findings;
        const assessments = workflowCounts.assessments;
        const recommendations = workflowCounts.recommendations;
        const decisions = workflowCounts.decisions;
        const reports = workflowCounts.reports;

        const steps = [
            { title: LanguageManager.t("WorkflowStepBuilding"), complete: currentCase ? activeCaseBuilding !== null : this.safeValue(() => BuildingManager.hasBuilding() ? 1 : 0) > 0 },
            { title: LanguageManager.t("WorkflowStepInspection"), complete: currentCase ? activeCaseInspection !== null : this.safeValue(() => InspectionManager.getAllInspections().length) > 0 },
            { title: LanguageManager.t("WorkflowStepEvidence"), complete: evidence > 0 },
            { title: LanguageManager.t("WorkflowStepFinding"), complete: findings > 0 },
            { title: LanguageManager.t("WorkflowStepAssessment"), complete: assessments > 0 },
            { title: LanguageManager.t("WorkflowStepRecommendation"), complete: recommendations > 0 },
            { title: LanguageManager.t("WorkflowStepDecision"), complete: decisions > 0 },
            { title: LanguageManager.t("WorkflowStepReport"), complete: reports > 0 }
        ];

        const completed = steps.filter(step => step.complete).length;
        const currentStep = Math.min(completed, steps.length - 1);
        const progress = Math.round((completed / steps.length) * 100);

        return {
            steps,
            currentStep,
            progress
        };
    }

    static getSignals() {
        const workflow = this.getWorkflowState();
        const workflowCounts = this.getScopedWorkflowCounts();

        return {
            riskScore: workflowCounts.reports > 0 ? LanguageManager.t("WorkspaceReadyForReview") : (workflowCounts.findings > 0 ? LanguageManager.t("WorkspaceInReview") : LanguageManager.t("WorkspacePending")),
            confidenceScore: workflowCounts.reports > 0 ? LanguageManager.t("WorkspaceHigh") : (workflowCounts.evidence > 0 ? LanguageManager.t("WorkspaceDeveloping") : LanguageManager.t("WorkspacePending")),
            coverageScore: `${workflow.progress}%`
        };
    }

}