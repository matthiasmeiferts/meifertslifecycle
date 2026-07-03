import EvidenceManager from "../../core/EvidenceManager.js";
import FindingManager from "../../core/FindingManager.js";
import AssessmentManager from "../../core/AssessmentManager.js";
import RecommendationManager from "../../core/RecommendationManager.js";
import DecisionManager from "../../core/DecisionManager.js";
import ReportManager from "../../core/ReportManager.js";

export default class WorkflowProgressPanel {

    static steps = [
        { key: "evidence", label: "Evidence", manager: EvidenceManager },
        { key: "findings", label: "Findings", manager: FindingManager },
        { key: "assessments", label: "Assessments", manager: AssessmentManager },
        { key: "recommendations", label: "Recommendations", manager: RecommendationManager },
        { key: "decisions", label: "Decisions", manager: DecisionManager },
        { key: "reports", label: "Reports", manager: ReportManager }
    ];

    static create(currentCase = null, currentStep = "") {
        const wrapper = document.createElement("section");
        wrapper.className = "workflow-progress-panel";

        const header = document.createElement("div");
        header.className = "workflow-progress-panel__header";

        const title = document.createElement("strong");
        title.textContent = "Workflow Progress";

        const meta = document.createElement("span");
        meta.textContent = currentCase
            ? "Active case decision path"
            : "Select a case to activate progress tracking";

        header.appendChild(title);
        header.appendChild(meta);

        const list = document.createElement("div");
        list.className = "workflow-progress-panel__steps";

        this.steps.forEach(step => {
            const count = currentCase ? this.countByCase(step.manager, currentCase.id) : 0;
            const item = document.createElement("div");
            const state = currentCase ? (count > 0 ? "ready" : "empty") : "inactive";

            item.className = [
                "workflow-progress-panel__step",
                `workflow-progress-panel__step--${state}`,
                currentStep === step.key ? "workflow-progress-panel__step--current" : ""
            ].filter(Boolean).join(" ");

            const label = document.createElement("span");
            label.className = "workflow-progress-panel__label";
            label.textContent = step.label;

            const status = document.createElement("span");
            status.className = "workflow-progress-panel__status";
            status.textContent = currentCase
                ? (count > 0 ? `${count} Ready` : "Empty")
                : "No active case";

            item.appendChild(label);
            item.appendChild(status);
            list.appendChild(item);
        });

        wrapper.appendChild(header);
        wrapper.appendChild(list);

        return wrapper;
    }

    static countByCase(manager, caseId) {
        if (!manager || !caseId) {
            return 0;
        }

        if (typeof manager.countByCase === "function") {
            return manager.countByCase(caseId);
        }

        if (typeof manager.getByCase === "function") {
            return manager.getByCase(caseId).length;
        }

        if (typeof manager.getAll === "function") {
            return manager.getAll().filter(item => item.caseId === caseId).length;
        }

        return 0;
    }

}