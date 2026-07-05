import CaseManager from "../core/CaseManager.js";
import BuildingManager from "../core/BuildingManager.js";
import InspectionManager from "../core/InspectionManager.js";
import EvidenceManager from "../core/EvidenceManager.js";
import FindingManager from "../core/FindingManager.js";
import AssessmentManager from "../core/AssessmentManager.js";
import RecommendationManager from "../core/RecommendationManager.js";
import DecisionManager from "../core/DecisionManager.js";
import ReportManager from "../core/ReportManager.js";

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

    static getActiveCaseId() {
        return this.safeValue(() => CaseManager.getCurrent()?.id, null);
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
        const workflowCounts = this.getScopedWorkflowCounts();

        return [
            { title: "Cases", value: this.safeValue(() => CaseManager.getAll().length) },
            { title: "Buildings", value: this.safeValue(() => BuildingManager.count()) },
            { title: "Inspections", value: this.safeValue(() => InspectionManager.getAllInspections().length) },
            { title: "Evidence", value: workflowCounts.evidence },
            { title: "Findings", value: workflowCounts.findings },
            { title: "Assessments", value: workflowCounts.assessments },
            { title: "Recommendations", value: workflowCounts.recommendations },
            { title: "Decisions", value: workflowCounts.decisions },
            { title: "Reports", value: workflowCounts.reports }
        ];
    }

    static getActiveCaseSummary() {
        const currentCase = this.safeValue(() => CaseManager.getCurrent(), null);
        const activeBuilding = this.safeValue(() => BuildingManager.get(), null);
        const building = activeBuilding || (currentCase?.buildingId
            ? this.safeValue(() => BuildingManager.load(currentCase.buildingId), null)
            : null);
        const activeInspection = this.safeValue(() => InspectionManager.get(), null);
        const inspection = activeInspection || (currentCase?.inspectionId
            ? this.safeValue(() => InspectionManager.load(currentCase.inspectionId), null)
            : null);

        let subtitle = "Create or open a case to begin the decision workflow.";

        if (building && inspection) {
            subtitle = `${building.name || building.address} · ${inspection.title || inspection.inspectionType || inspection.id}`;
        } else if (building) {
            subtitle = `${building.name || building.address}`;
        } else if (inspection) {
            subtitle = `${inspection.title || inspection.inspectionType || inspection.id}`;
        }

        return {
            title: currentCase?.name || currentCase?.title || "No active case",
            subtitle
        };
    }

    static getWorkflowState() {
        const workflowCounts = this.getScopedWorkflowCounts();
        const evidence = workflowCounts.evidence;
        const findings = workflowCounts.findings;
        const assessments = workflowCounts.assessments;
        const recommendations = workflowCounts.recommendations;
        const decisions = workflowCounts.decisions;
        const reports = workflowCounts.reports;

        const steps = [
            { title: "Building", complete: this.safeValue(() => BuildingManager.hasBuilding() ? 1 : 0) > 0 },
            { title: "Inspection", complete: this.safeValue(() => InspectionManager.getAllInspections().length) > 0 },
            { title: "Evidence", complete: evidence > 0 },
            { title: "Finding", complete: findings > 0 },
            { title: "Assessment", complete: assessments > 0 },
            { title: "Recommendation", complete: recommendations > 0 },
            { title: "Decision", complete: decisions > 0 },
            { title: "Report", complete: reports > 0 }
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
        const findings = this.safeValue(() => FindingManager.count());
        const evidence = this.safeValue(() => EvidenceManager.count());

        return {
            riskScore: findings > 0 ? "Pending model" : "Pending",
            confidenceScore: evidence > 0 ? "Basic" : "Pending",
            coverageScore: `${workflow.progress}%`
        };
    }

}