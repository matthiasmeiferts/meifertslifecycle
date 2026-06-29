import WorkspaceController from "./controllers/WorkspaceController.js";
import EvidencePage from "./ui/pages/EvidencePage.js";

function renderPage() {

    const main = document.querySelector(".workspace-main");

    if (!main) return;

    const header = main.querySelector(".workspace-header");

    main.innerHTML = "";

    if (header) {
        main.appendChild(header);
    }

    main.appendChild(
        EvidencePage.render()
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

    renderPage();
    renderSignals();

}

initWorkspace();