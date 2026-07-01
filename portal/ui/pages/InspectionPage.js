import InspectionManager from "../../core/InspectionManager.js";
import SectionHeader from "../components/SectionHeader.js";
import ActionBar from "../components/ActionBar.js";
import EmptyState from "../components/EmptyState.js";
import DetailPanel from "../components/DetailPanel.js";
import Notification from "../components/Notification.js";
import IntelligenceEngine from "../../core/IntelligenceEngine.js";

export default class InspectionPage {

    static getInspectionIntelligence(inspection = {}, data = {}) {
        const inspectionId = inspection.id || inspection.inspectionId;
        const buildingId = inspection.buildingId || inspection.linkedBuildingId;

        const filterByInspection = (items = []) => {
            if (!Array.isArray(items)) {
                return [];
            }

            if (!inspectionId && !buildingId) {
                return items;
            }

            return items.filter((item) =>
                item.inspectionId === inspectionId ||
                item.linkedInspectionId === inspectionId ||
                item.inspection === inspectionId ||
                item.buildingId === buildingId ||
                item.linkedBuildingId === buildingId
            );
        };

        const evidence = filterByInspection(data.evidence || data.evidences || []);
        const findings = filterByInspection(data.findings || []);
        const assessments = filterByInspection(data.assessments || []);

        const counts = {
            inspection: inspectionId || inspection.title || inspection.name ? 1 : 0,
            evidence: evidence.length,
            finding: findings.length,
            assessment: assessments.length
        };

        const stageKeys = this.intelligenceStages.map((stage) => stage.key);
        const readiness = IntelligenceEngine.getStageReadiness(counts, stageKeys);
        const evidenceCoverage = readiness.percent;
        const completedStages = readiness.completedStages;
        const totalStages = readiness.totalStages;

        const technicalSignals =
            counts.evidence +
            counts.finding +
            counts.assessment;

        const confidenceScore = IntelligenceEngine.getConfidenceScore({
            readinessPercent: evidenceCoverage,
            primarySignals: counts.evidence,
            downstreamSignals: counts.finding + counts.assessment,
            outputSignals: 0,
            weights: {
                readiness: 0.65,
                primary: 4,
                downstream: 3,
                output: 0
            }
        });

        let signalDensity = {
            label: "Low signal density",
            description: "Inspection output is still light. More evidence and findings are needed.",
            tone: "draft"
        };

        if (technicalSignals >= 10) {
            signalDensity = {
                label: "High signal density",
                description: "Inspection contains multiple technical signals. Review consistency before downstream assessment.",
                tone: "ready"
            };
        } else if (technicalSignals >= 5) {
            signalDensity = {
                label: "Moderate signal density",
                description: "Inspection contains useful technical signals, but further validation may still be needed.",
                tone: "active"
            };
        }

        const firstOpenStage = this.intelligenceStages.find((stage) => counts[stage.key] === 0);

        const nextAction = firstOpenStage
            ? {
                label: `Strengthen ${firstOpenStage.label}`,
                description: `${firstOpenStage.label} data is missing for this inspection. Complete this stage before relying on downstream assessment.`,
                tone: "active"
            }
            : {
                label: "Review inspection output",
                description: "Inspection evidence, findings and assessments are represented. Review consistency before recommendations.",
                tone: "ready"
            };

        return {
            counts,
            completedStages,
            totalStages,
            evidenceCoverage,
            confidenceScore,
            signalDensity,
            nextAction,
            label: evidenceCoverage >= 100
                ? "Inspection workflow complete"
                : evidenceCoverage >= 50
                    ? "Inspection workflow developing"
                    : "Inspection workflow early"
        };
    }

    static renderInspectionIntelligenceSnapshot(inspection = {}, data = {}) {
        const intelligence = this.getInspectionIntelligence(inspection, data);

        return `
            <section class="inspection-intelligence intelligence-snapshot" aria-label="Inspection intelligence snapshot">
                <div class="inspection-intelligence__header intelligence-snapshot__header">
                    <div>
                        <span class="inspection-intelligence__eyebrow intelligence-snapshot__eyebrow">Inspection Intelligence</span>
                        <strong>${intelligence.label}</strong>
                        <p>${intelligence.completedStages}/${intelligence.totalStages} inspection stages represented</p>
                    </div>
                    <span class="inspection-intelligence__score intelligence-snapshot__score">${intelligence.confidenceScore}%</span>
                </div>

                <div class="inspection-intelligence__grid intelligence-snapshot__grid">
                    <article class="inspection-intelligence__card intelligence-snapshot__card">
                        <span>Evidence Coverage</span>
                        <strong>${intelligence.evidenceCoverage}%</strong>
                        <p>Coverage across Inspection, Evidence, Finding and Assessment.</p>
                    </article>

                    <article class="inspection-intelligence__card intelligence-snapshot__card inspection-intelligence__card--${intelligence.signalDensity.tone} intelligence-snapshot__card--${intelligence.signalDensity.tone}">
                        <span>Technical Signal Density</span>
                        <strong>${intelligence.signalDensity.label}</strong>
                        <p>${intelligence.signalDensity.description}</p>
                    </article>

                    <article class="inspection-intelligence__card intelligence-snapshot__card inspection-intelligence__card--${intelligence.nextAction.tone} intelligence-snapshot__card--${intelligence.nextAction.tone}">
                        <span>Next Inspection Action</span>
                        <strong>${intelligence.nextAction.label}</strong>
                        <p>${intelligence.nextAction.description}</p>
                    </article>
                </div>
            </section>
        `;
    }

    static createInspectionIntelligenceSnapshot(inspection = null, data = null) {
        const currentInspection = inspection || InspectionManager.get();

        if (!currentInspection) {
            return null;
        }

        const inspectionData = data || {};
        const container = document.createElement("section");
        container.innerHTML = this.renderInspectionIntelligenceSnapshot(currentInspection, inspectionData);
        return container;
    }

    static intelligenceStages = [
        {
            key: "inspection",
            label: "Inspection"
        },
        {
            key: "evidence",
            label: "Evidence"
        },
        {
            key: "finding",
            label: "Finding"
        },
        {
            key: "assessment",
            label: "Assessment"
        }
    ];

    static render() {
        const fragment = document.createDocumentFragment();
        const inspections = InspectionManager.getAll();
        const activeInspection = InspectionManager.get();

        fragment.appendChild(this.createHeader());
        fragment.appendChild(this.createMetrics(inspections));
        fragment.appendChild(this.createToolbar());
        fragment.appendChild(this.createMainLayout(inspections, activeInspection));

        return fragment;
    }

    static createHeader() {
        return SectionHeader.create({
            eyebrow: "Inspection Workspace",
            title: "Inspections",
            description: "Plan, document, and manage technical inspections linked to buildings, cases, and evidence.",
            actions: [
                {
                    id: "new-inspection",
                    label: "+ New Inspection",
                    onClick: () => this.createSampleInspection()
                }
            ]
        });
    }

    static createMetrics(inspections = []) {
        const grid = document.createElement("section");
        grid.className = "metrics-grid";

        const draftCount = inspections.filter(inspection => inspection.status === "draft").length;
        const progressCount = inspections.filter(inspection => inspection.status === "in_progress").length;
        const completedCount = inspections.filter(inspection => inspection.status === "completed").length;

        grid.appendChild(this.createMetricCard("Inspections", inspections.length));
        grid.appendChild(this.createMetricCard("Draft", draftCount));
        grid.appendChild(this.createMetricCard("In Progress", progressCount));
        grid.appendChild(this.createMetricCard("Completed", completedCount));

        return grid;
    }

    static createMetricCard(label, value) {
        const card = document.createElement("article");
        card.className = "metric-card";

        const valueElement = document.createElement("strong");
        valueElement.textContent = value;

        const labelElement = document.createElement("span");
        labelElement.textContent = label;

        card.appendChild(valueElement);
        card.appendChild(labelElement);

        return card;
    }

    static createToolbar() {
        const wrapper = document.createElement("section");
        wrapper.className = "workflow-card";

        wrapper.appendChild(ActionBar.create([
            {
                id: "refresh",
                label: "Refresh",
                onClick: () => this.refresh()
            },
            {
                id: "inspection-template",
                label: "Inspection Template",
                onClick: () => this.createSampleInspection()
            }
        ]));

        return wrapper;
    }

    static createMainLayout(inspections = [], activeInspection = null) {
        const layout = document.createElement("section");
        layout.className = "case-workspace-layout";

        const intelligenceSnapshot = this.createInspectionIntelligenceSnapshot(activeInspection);
        if (intelligenceSnapshot) {
            layout.appendChild(intelligenceSnapshot);
        }

        layout.appendChild(this.createContent(inspections));
        layout.appendChild(this.createDetailPanel(activeInspection));

        return layout;
    }

    static createContent(inspections = []) {
        if (!inspections.length) {
            return EmptyState.create({
                eyebrow: "Inspection Workspace",
                title: "No inspections available",
                description: "Inspection records will connect buildings, technical observations, evidence, and follow-up findings.",
                actionLabel: "+ New Inspection",
                onAction: () => this.createSampleInspection()
            });
        }

        const wrapper = document.createElement("section");
        wrapper.className = "workflow-card";

        inspections.forEach(inspection => {
            wrapper.appendChild(this.createInspectionRow(inspection));
        });

        return wrapper;
    }

    static createInspectionRow(inspection) {
        const row = document.createElement("button");
        row.type = "button";
        row.className = "task-row";
        row.addEventListener("click", () => {
            InspectionManager.set(inspection);
            this.refresh();
        });

        const content = document.createElement("div");

        const title = document.createElement("strong");
        title.textContent = inspection.title || "Technical Property Review";

        const meta = document.createElement("p");
        meta.textContent = [
            inspection.location || "Location pending",
            inspection.inspector || "Inspector pending",
            inspection.status || "draft"
        ].join(" · ");

        const badge = document.createElement("span");
        badge.className = "tag";
        badge.textContent = inspection.status || "draft";

        content.appendChild(title);
        content.appendChild(meta);
        row.appendChild(content);
        row.appendChild(badge);

        return row;
    }

    static createDetailPanel(activeInspection = null) {
        if (!activeInspection) {
            return DetailPanel.create("Inspection Context", [
                { label: "Current Inspection", value: "Not selected" },
                { label: "Inspection Status", value: "Not started" },
                { label: "Next Step", value: "Create or select an inspection" }
            ]);
        }

        return DetailPanel.create("Inspection Context", [
            { label: "Current Inspection", value: activeInspection.title || activeInspection.id },
            { label: "Inspection Status", value: activeInspection.status || "draft" },
            { label: "Building ID", value: activeInspection.buildingId || "Not linked" },
            { label: "Inspector", value: activeInspection.inspector || "Not assigned" }
        ]);
    }

    static refresh() {
        const container = document.getElementById("workspace-page");

        if (!container) return;

        container.innerHTML = "";
        container.appendChild(this.render());
    }

    static createSampleInspection() {
        const inspection = InspectionManager.create({
            buildingId: "demo-building",
            caseId: "demo-case",
            title: "Technical Property Review",
            location: "Demo Property",
            notes: "Initial inspection record created from the workspace."
        });

        Notification.success("Inspection created.");
        InspectionManager.set(inspection);
        this.refresh();
    }

    static showPendingFeature(feature = "This feature") {
        Notification.info(`${feature} will be added in the next foundation step.`);
    }

}
