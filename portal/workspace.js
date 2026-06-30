import WorkspaceController from "./controllers/WorkspaceController.js";
import WorkspaceRouter from "./router/WorkspaceRouter.js";

function renderWorkspace() {
    const container = document.getElementById("workspace-page");

    WorkspaceRouter.render(container);
    updateSignals();
    updateActiveNavigation();
}

function updateSignals() {
    const signals = WorkspaceController.getSignals();

    const riskScore = document.getElementById("risk-score");
    const confidenceScore = document.getElementById("confidence-score");
    const coverageScore = document.getElementById("coverage-score");

    if (riskScore) riskScore.textContent = signals.riskScore;
    if (confidenceScore) confidenceScore.textContent = signals.confidenceScore;
    if (coverageScore) coverageScore.textContent = signals.coverageScore;
}

function updateActiveNavigation() {
    const route = WorkspaceRouter.getCurrentRoute();

    document.querySelectorAll("#workspace-nav a").forEach(link => {
        const isActive = link.dataset.route === route;
        link.classList.toggle("active", isActive);
    });
}

function initWorkspace() {
    renderWorkspace();

    window.addEventListener("hashchange", () => {
        renderWorkspace();
    });
}

initWorkspace();