import WorkspaceController from "./controllers/WorkspaceController.js";
import WorkspaceRouter from "./router/WorkspaceRouter.js";
import LanguageManager from "./core/LanguageManager.js";

function renderWorkspace() {
    const container = document.getElementById("workspace-page");

    updateShellLanguage();
    WorkspaceRouter.render(container);
    updateSignals();
    updateActiveNavigation();
}

function updateShellLanguage() {
    const language = LanguageManager.getLanguage();

    document.documentElement.lang = language;
    document.title = LanguageManager.t("WorkspaceDocumentTitle");

    document.querySelectorAll("[data-i18n]").forEach(element => {
        const key = element.dataset.i18n;
        element.textContent = LanguageManager.t(key);
    });
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

    window.addEventListener("mbi:language-changed", () => {
        renderWorkspace();
    });
}

initWorkspace();