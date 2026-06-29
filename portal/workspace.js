import WorkspaceController from "./controllers/WorkspaceController.js";
import MetricCard from "./ui/components/MetricCard.js";
import WorkflowCard from "./ui/components/WorkflowCard.js";

function renderMetrics() {
    const grid = document.getElementById("metrics-grid");

    if (!grid) return;

    grid.innerHTML = "";

    WorkspaceController.getMetrics().forEach(metric => {
        grid.appendChild(
            MetricCard.create(metric.title, metric.value)
        );
    });
}

function renderActiveCase() {
    const summary = WorkspaceController.getActiveCaseSummary();

    const titleElement = document.getElementById("active-case-title");
    const subtitleElement = document.getElementById("active-case-subtitle");

    if (!titleElement || !subtitleElement) return;

    titleElement.textContent = summary.title;
    subtitleElement.textContent = summary.subtitle;
}

function renderWorkflow() {
    const placeholder = document.getElementById("workflow-card-container");

    if (!placeholder) return;

    placeholder.innerHTML = "";
    placeholder.appendChild(
        WorkflowCard.create(
            WorkspaceController.getWorkflowState()
        )
    );
}

function renderSignals() {
    const signals = WorkspaceController.getSignals();

    const riskScore = document.getElementById("risk-score");
    const confidenceScore = document.getElementById("confidence-score");
    const coverageScore = document.getElementById("coverage-score");

    if (riskScore) riskScore.textContent = signals.riskScore;
    if (confidenceScore) confidenceScore.textContent = signals.confidenceScore;
    if (coverageScore) coverageScore.textContent = signals.coverageScore;
}

function initWorkspace() {
    renderMetrics();
    renderActiveCase();
    renderWorkflow();
    renderSignals();
}

initWorkspace();