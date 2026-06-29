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

    static getMetrics() {
        return [
            { title: "Cases", value: this.safeValue(() => CaseManager.getAll().length) },
            { title: "Buildings", value: this.safeValue(() => BuildingManager.hasBuilding() ? 1 : 0) },
            { title: "Inspections", value: this.safeValue(() => InspectionManager.getAllInspections().length) },
            { title: "Evidence", value: this.safeValue(() => EvidenceManager.count()) },
            { title: "Findings", value: this.safeValue(() => FindingManager.count()) },
            { title: "Assessments", value: this.safeValue(() => AssessmentManager.count()) },
            { title: "Recommendations", value: this.safeValue(() => RecommendationManager.count()) },
            { title: "Decisions", value: this.safeValue(() => DecisionManager.count()) },
            { title: "Reports", value: this.safeValue(() => ReportManager.count()) }
        ];
    }

    static getActiveCaseSummary() {
        const currentCase = this.safeValue(() => CaseManager.getCurrent(), null);
        const building = this.safeValue(() => BuildingManager.get(), null);

        return {
            title: currentCase?.name || currentCase?.title || "No active case",
            subtitle: building?.name || building?.address || "Create or open a case to begin the decision workflow."
        };
    }

    static getWorkflowState() {
        const evidence = this.safeValue(() => EvidenceManager.count());
        const findings = this.safeValue(() => FindingManager.count());
        const assessments = this.safeValue(() => AssessmentManager.count());
        const recommendations = this.safeValue(() => RecommendationManager.count());
        const decisions = this.safeValue(() => DecisionManager.count());
        const reports = this.safeValue(() => ReportManager.count());

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