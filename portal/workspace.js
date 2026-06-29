import CaseManager from "./core/CaseManager.js";
import BuildingManager from "./core/BuildingManager.js";
import InspectionManager from "./core/InspectionManager.js";
import EvidenceManager from "./core/EvidenceManager.js";
import FindingManager from "./core/FindingManager.js";
import AssessmentManager from "./core/AssessmentManager.js";
import RecommendationManager from "./core/RecommendationManager.js";
import DecisionManager from "./core/DecisionManager.js";
import ReportManager from "./core/ReportManager.js";

import MetricCard from "./ui/components/MetricCard.js";

const metrics = [
    ["Cases", () => CaseManager.getAll().length],
    ["Buildings", () => BuildingManager.hasBuilding() ? 1 : 0],
    ["Inspections", () => InspectionManager.getAllInspections().length],
    ["Evidence", () => EvidenceManager.count()],
    ["Findings", () => FindingManager.count()],
    ["Assessments", () => AssessmentManager.count()],
    ["Recommendations", () => RecommendationManager.count()],
    ["Decisions", () => DecisionManager.count()],
    ["Reports", () => ReportManager.count()]
];

function safeValue(fn, fallback = 0) {
    try {
        const value = fn();
        return value ?? fallback;
    } catch (error) {
        console.warn("Workspace metric unavailable:", error);
        return fallback;
    }
}

function renderMetrics() {
    const grid = document.getElementById("metrics-grid");

    if (!grid) return;

    grid.innerHTML = "";

    metrics.forEach(([title, getter]) => {
        grid.appendChild(
            MetricCard.create(
                title,
                safeValue(getter)
            )
        );
    });
}

function renderActiveCase() {
    const currentCase = safeValue(() => CaseManager.getCurrent(), null);
    const building = safeValue(() => BuildingManager.get(), null);

    const titleElement = document.getElementById("active-case-title");
    const subtitleElement = document.getElementById("active-case-subtitle");

    if (!titleElement || !subtitleElement) return;

    titleElement.textContent =
        currentCase?.name ||
        currentCase?.title ||
        "No active case";

    subtitleElement.textContent =
        building?.name ||
        building?.address ||
        "Create or open a case to begin the decision workflow.";
}

function renderSignals() {
    const evidence = safeValue(() => EvidenceManager.count());
    const findings = safeValue(() => FindingManager.count());
    const reports = safeValue(() => ReportManager.count());

    const completedSignals =
        Number(evidence > 0) +
        Number(findings > 0) +
        Number(reports > 0);

    const progress = Math.min(
        100,
        Math.round((completedSignals / 3) * 100)
    );

    const workflowProgress = document.getElementById("workflow-progress");
    const riskScore = document.getElementById("risk-score");
    const confidenceScore = document.getElementById("confidence-score");
    const coverageScore = document.getElementById("coverage-score");

    if (workflowProgress) workflowProgress.textContent = `${progress}%`;
    if (riskScore) riskScore.textContent = findings > 0 ? "Pending model" : "Pending";
    if (confidenceScore) confidenceScore.textContent = evidence > 0 ? "Basic" : "Pending";
    if (coverageScore) coverageScore.textContent = `${progress}%`;
}

function initWorkspace() {
    renderMetrics();
    renderActiveCase();
    renderSignals();
}

initWorkspace();