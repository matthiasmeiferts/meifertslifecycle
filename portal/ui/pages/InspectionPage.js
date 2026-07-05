import InspectionManager from "../../core/InspectionManager.js";
import EvidenceManager from "../../core/EvidenceManager.js";
import CaseManager from "../../core/CaseManager.js";
import BuildingManager from "../../core/BuildingManager.js";
import InspectionScopeManager from "../../core/InspectionScopeManager.js";
import InspectionQuestionCatalog from "../../core/InspectionQuestionCatalog.js";
import InspectionQuestionEngine from "../../core/InspectionQuestionEngine.js";
import WorkflowContextBanner from "../components/WorkflowContextBanner.js";
import SectionHeader from "../components/SectionHeader.js";
import ActionBar from "../components/ActionBar.js";
import EmptyState from "../components/EmptyState.js";
import DetailPanel from "../components/DetailPanel.js";
import Notification from "../components/Notification.js";
import IntelligenceEngine from "../../core/IntelligenceEngine.js";
import WorkspaceRouter from "../../router/WorkspaceRouter.js";

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
        const currentInspection = inspection || InspectionManager.getInspection();

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
        const inspections = InspectionManager.getAllInspections();
        const activeInspection = InspectionManager.getInspection();

        fragment.appendChild(this.createHeader(activeInspection));
        fragment.appendChild(WorkflowContextBanner.create(CaseManager.getCurrent()));
        fragment.appendChild(this.createInspectionScopeOverview(activeInspection));
        fragment.appendChild(this.createMetrics(inspections));
        fragment.appendChild(this.createMainLayout(inspections, activeInspection));

        return fragment;
    }

    static createHeader(activeInspection = null) {
        return SectionHeader.create({
            eyebrow: "Inspection Workspace",
            title: "Inspections",
            description: activeInspection
                ? `Active inspection: ${activeInspection.title || activeInspection.id}`
                : "Plan, document, and manage technical inspections linked to buildings, cases, and evidence.",
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


    static getActiveScope(activeInspection = null) {
        const currentCase = CaseManager.getCurrent();
        const activeScope = InspectionScopeManager.get();

        if (activeScope) {
            if (activeInspection && activeScope.inspectionId === activeInspection.id) {
                return activeScope;
            }

            if (!activeInspection && currentCase && activeScope.caseId === currentCase.id) {
                return activeScope;
            }
        }

        if (activeInspection) {
            return InspectionScopeManager.getByInspection(activeInspection.id)[0] || null;
        }

        if (currentCase) {
            return InspectionScopeManager.getByCase(currentCase.id)[0] || null;
        }

        return null;
    }

    static createInspectionScopeOverview(activeInspection = null) {
        const activeScope = this.getActiveScope(activeInspection);
        const modules = InspectionQuestionCatalog.getModules();
        const questions = activeScope?.questions || InspectionQuestionCatalog.getStarterScopeQuestions();
        const answers = activeScope?.answers || {};
        const coverage = activeScope
            ? InspectionScopeManager.createCoverageSummary(questions, answers)
            : InspectionScopeManager.createCoverageSummary(questions, answers);
        const currentQuestion = this.getCurrentScopeQuestion(activeScope, questions, answers);
        const currentEvaluation = currentQuestion
            ? InspectionQuestionEngine.evaluate(currentQuestion, answers[currentQuestion.id])
            : null;

        const wrapper = document.createElement("section");
        wrapper.className = activeScope
            ? "inspection-scope-editorial inspection-scope-editorial--active"
            : "inspection-scope-editorial";

        const hero = document.createElement("div");
        hero.className = "inspection-scope-editorial__hero";

        const heroCopy = document.createElement("div");
        heroCopy.className = "inspection-scope-editorial__copy";

        const eyebrow = document.createElement("span");
        eyebrow.className = "inspection-scope-editorial__eyebrow";
        eyebrow.textContent = "Object Inspection Scope";

        const title = document.createElement("strong");
        title.textContent = activeScope ? "Adaptive Scope Active." : "Adaptive Scope Review.";

        const description = document.createElement("p");
        description.textContent = activeScope
            ? "The inspection scope is connected to this case and inspection. Answers now drive evidence requirements, skipped questions, risk flags and report limitations."
            : "Define what must be inspected before evidence is collected. The scope engine turns answers into required evidence, risk signals and limitations.";

        const status = document.createElement("span");
        status.className = activeScope
            ? "inspection-scope-editorial__status inspection-scope-editorial__status--active"
            : "inspection-scope-editorial__status";
        status.textContent = activeScope ? "Scope Active" : "Not Started";

        heroCopy.appendChild(eyebrow);
        heroCopy.appendChild(title);
        heroCopy.appendChild(description);
        heroCopy.appendChild(status);

        const actionPanel = document.createElement("aside");
        actionPanel.className = "inspection-scope-editorial__action-panel";

        const actionLabel = document.createElement("span");
        actionLabel.textContent = "Scope Control";

        const actionButton = document.createElement("button");
        actionButton.type = "button";
        actionButton.className = "button inspection-scope-editorial__action";
        actionButton.textContent = activeScope ? "Scope Active" : "Start Scope";
        actionButton.onclick = () => this.startAdaptiveScope(activeInspection);

        const actionMeta = document.createElement("p");
        actionMeta.textContent = activeScope
            ? `${coverage.inspected}/${coverage.total} inspected · ${coverage.riskFlagged} risk flags`
            : `${coverage.total} adaptive questions ready`;

        actionPanel.appendChild(actionLabel);
        actionPanel.appendChild(actionButton);
        actionPanel.appendChild(actionMeta);

        hero.appendChild(heroCopy);
        hero.appendChild(actionPanel);

        const body = document.createElement("div");
        body.className = "inspection-scope-editorial__body";

        const modulePanel = document.createElement("section");
        modulePanel.className = "inspection-scope-editorial__modules";

        const moduleHeader = document.createElement("div");
        moduleHeader.className = "inspection-scope-editorial__section-header";
        moduleHeader.innerHTML = "<span>Inspection Modules</span><strong>Building systems review</strong>";
        modulePanel.appendChild(moduleHeader);

        modules.forEach((module, index) => {
            const moduleQuestions = InspectionQuestionCatalog.getByModule(module.id);
            const item = document.createElement("article");
            item.className = "inspection-scope-editorial__module";

            const number = document.createElement("span");
            number.textContent = String(index + 1).padStart(2, "0");

            const content = document.createElement("div");
            const label = document.createElement("strong");
            label.textContent = module.label;

            const meta = document.createElement("p");
            meta.textContent = `${moduleQuestions.length} questions · ${module.riskCategory}`;

            content.appendChild(label);
            content.appendChild(meta);
            item.appendChild(number);
            item.appendChild(content);
            modulePanel.appendChild(item);
        });

        const workPanel = document.createElement("section");
        workPanel.className = "inspection-scope-editorial__work";

        const workHeader = document.createElement("div");
        workHeader.className = "inspection-scope-editorial__section-header";
        workHeader.innerHTML = "<span>Current Question</span><strong>Inspection decision path</strong>";

        const questionCard = document.createElement("article");
        questionCard.className = "inspection-scope-editorial__question";

        const questionText = document.createElement("strong");
        questionText.textContent = currentQuestion?.question || "No inspection question available.";

        const questionMeta = document.createElement("p");
        questionMeta.textContent = currentQuestion
            ? `${currentQuestion.module} · ${currentQuestion.category} · ${currentEvaluation.coverageStatus}`
            : "Question catalog is empty.";

        const questionHint = document.createElement("div");
        questionHint.className = "inspection-scope-editorial__hint";
        questionHint.textContent = activeScope
            ? "Choose an answer. The scope engine will update coverage, evidence requirements, risk flags and limitations."
            : "Start the adaptive scope to connect this question set to the active case and inspection.";

        questionCard.appendChild(questionText);
        questionCard.appendChild(questionMeta);
        questionCard.appendChild(questionHint);
        questionCard.appendChild(this.createAnswerControls(activeInspection, activeScope, currentQuestion));

        const coveragePanel = document.createElement("div");
        coveragePanel.className = "inspection-scope-editorial__coverage";

        [
            ["Questions", coverage.total],
            ["Open", coverage.open],
            ["Inspected", coverage.inspected],
            ["Evidence", coverage.evidenceRequired],
            ["Risk", coverage.riskFlagged],
            ["Limits", coverage.limitations]
        ].forEach(([label, value]) => {
            const item = document.createElement("div");
            const number = document.createElement("strong");
            number.textContent = String(value);
            const text = document.createElement("span");
            text.textContent = label;
            item.appendChild(number);
            item.appendChild(text);
            coveragePanel.appendChild(item);
        });

        workPanel.appendChild(workHeader);
        workPanel.appendChild(questionCard);
        workPanel.appendChild(this.createScopeSignalPanel(activeScope));
        workPanel.appendChild(coveragePanel);

        body.appendChild(modulePanel);
        body.appendChild(workPanel);

        wrapper.appendChild(hero);
        wrapper.appendChild(body);

        return wrapper;
    }


    static getCurrentScopeQuestion(activeScope = null, questions = [], answers = {}) {
        const visibleQuestions = questions.filter(question =>
            InspectionQuestionEngine.shouldAsk(question, answers)
        );

        const unanswered = visibleQuestions.find(question => !answers[question.id]);

        return unanswered || visibleQuestions[0] || questions[0] || null;
    }

    static getAnswerOptions(question = {}) {
        const type = question.answerType || "yes_no_unknown";

        if (type.includes("not_accessible")) {
            return [
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
                { value: "not_accessible", label: "Not Accessible" }
            ];
        }

        return [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
            { value: "unknown", label: "Unknown" }
        ];
    }

    static createAnswerControls(activeInspection = null, activeScope = null, question = null) {
        const controls = document.createElement("div");
        controls.className = "inspection-scope-editorial__answers";

        if (!question) {
            return controls;
        }

        if (!activeScope) {
            const note = document.createElement("span");
            note.textContent = "Start the scope to answer this question.";
            controls.appendChild(note);
            return controls;
        }

        this.getAnswerOptions(question).forEach(option => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = `inspection-scope-editorial__answer inspection-scope-editorial__answer--${option.value}`;
            button.textContent = option.label;
            button.addEventListener("click", () => {
                this.answerScopeQuestion(activeInspection, question, option.value);
            });

            controls.appendChild(button);
        });

        return controls;
    }

    static answerScopeQuestion(activeInspection = null, question = null, value = "") {
        const activeScope = this.getActiveScope(activeInspection);

        if (!activeScope || !question || !value) {
            Notification.info("Start the adaptive scope before answering questions.");
            return;
        }

        InspectionScopeManager.answerQuestion(activeScope.id, question, value);
        Notification.success("Inspection answer saved.");
        this.refresh();
    }

    static createScopeSignalPanel(activeScope = null) {
        const panel = document.createElement("section");
        panel.className = "inspection-scope-editorial__signals";

        const evidenceRequirements = activeScope?.evidenceRequirements || [];
        const riskFlags = activeScope?.riskFlags || [];
        const limitations = activeScope?.limitations || [];

        [
            {
                label: "Evidence Required",
                value: evidenceRequirements.length,
                detail: evidenceRequirements.length
                    ? `${evidenceRequirements.length} inspection question(s) require evidence.`
                    : "No evidence requirements triggered yet."
            },
            {
                label: "Risk Flags",
                value: riskFlags.length,
                detail: riskFlags.length
                    ? riskFlags.map(item => item.reason).slice(0, 2).join(" · ")
                    : "No risk flags triggered yet."
            },
            {
                label: "Limitations",
                value: limitations.length,
                detail: limitations.length
                    ? limitations.map(item => item.reason).slice(0, 2).join(" · ")
                    : "No limitations recorded yet."
            }
        ].forEach(signal => {
            const item = document.createElement("article");

            const value = document.createElement("strong");
            value.textContent = String(signal.value);

            const label = document.createElement("span");
            label.textContent = signal.label;

            const detail = document.createElement("p");
            detail.textContent = signal.detail;

            item.appendChild(value);
            item.appendChild(label);
            item.appendChild(detail);
            panel.appendChild(item);
        });

        if (evidenceRequirements.length) {
            panel.appendChild(this.createEvidenceRequirementList(activeScope, evidenceRequirements));
        }

        return panel;
    }

    static createEvidenceRequirementList(activeScope = null, evidenceRequirements = []) {
        const wrapper = document.createElement("div");
        wrapper.className = "inspection-scope-editorial__requirements";

        const header = document.createElement("div");
        header.className = "inspection-scope-editorial__requirements-header";

        const eyebrow = document.createElement("span");
        eyebrow.textContent = "Evidence Actions";

        const title = document.createElement("strong");
        title.textContent = "Required evidence by inspection answer";

        header.appendChild(eyebrow);
        header.appendChild(title);
        wrapper.appendChild(header);

        evidenceRequirements.forEach(requirement => {
            const question = InspectionQuestionCatalog.getById(requirement.questionId);
            const item = document.createElement("article");
            item.className = "inspection-scope-editorial__requirement";

            const content = document.createElement("div");

            const questionTitle = document.createElement("strong");
            questionTitle.textContent = question?.question || requirement.questionId;

            const meta = document.createElement("p");
            meta.textContent = [
                `Question: ${requirement.questionId}`,
                `Case: ${activeScope?.caseId || "not linked"}`,
                `Inspection: ${activeScope?.inspectionId || "not linked"}`
            ].join(" · ");

            const tags = document.createElement("div");
            tags.className = "inspection-scope-editorial__requirement-tags";

            (requirement.requiredEvidence || []).forEach(type => {
                const tag = document.createElement("span");
                tag.textContent = type;
                tags.appendChild(tag);
            });

            content.appendChild(questionTitle);
            content.appendChild(meta);
            content.appendChild(tags);

            const action = document.createElement("button");
            action.type = "button";
            action.className = "button inspection-scope-editorial__requirement-action";
            action.textContent = "Create Evidence";
            action.addEventListener("click", () => {
                this.createEvidenceFromRequirement(activeScope, requirement);
            });

            item.appendChild(content);
            item.appendChild(action);
            wrapper.appendChild(item);
        });

        return wrapper;
    }


    static createEvidenceFromRequirement(activeScope = null, requirement = null) {
        if (!activeScope || !requirement || !requirement.questionId) {
            Notification.info("Select an evidence requirement first.");
            return;
        }

        const question = InspectionQuestionCatalog.getById(requirement.questionId);

        if (!question) {
            Notification.warning("Inspection question could not be found.");
            return;
        }

        const evidenceType = (requirement.requiredEvidence || ["note"])[0];
        const answer = activeScope.answers?.[question.id] || null;

        const evidence = EvidenceManager.create({
            caseId: activeScope.caseId,
            buildingId: activeScope.buildingId || null,
            inspectionId: activeScope.inspectionId || null,
            type: evidenceType,
            category: question.category || "Inspection Scope",
            title: `${this.formatEvidenceType(evidenceType)} required · ${question.question}`,
            description: [
                "Evidence requirement generated from adaptive inspection scope.",
                `Question: ${question.id}`,
                `Module: ${question.module}`,
                `Category: ${question.category}`,
                `Component: ${question.component || "Not specified"}`
            ].join("\n"),
            buildingSystem: question.module || "",
            componentId: question.component || null,
            source: "Inspection Scope",
            sourceType: "inspection-scope",
            sourceQuestionId: question.id,
            sourceQuestion: question.question,
            sourceModule: question.module || "",
            sourceCategory: question.category || "",
            sourceRequiredEvidence: requirement.requiredEvidence || [],
            scopeId: activeScope.id,
            status: "Open",
            tags: [
                "inspection-scope",
                question.id,
                ...(requirement.requiredEvidence || [])
            ]
        });

        EvidenceManager.set(evidence);

        const updatedAnswers = {
            ...(activeScope.answers || {}),
            [question.id]: {
                ...(answer || {}),
                questionId: question.id,
                caseId: activeScope.caseId,
                buildingId: activeScope.buildingId || null,
                inspectionId: activeScope.inspectionId || null,
                value: answer?.value || answer?.answer || "yes",
                evidenceIds: [...new Set([...(answer?.evidenceIds || []), evidence.id])],
                updatedAt: new Date().toISOString()
            }
        };

        const updatedScope = {
            ...activeScope,
            answers: updatedAnswers,
            evidenceRequirements: (activeScope.evidenceRequirements || [])
                .filter(item => item.questionId !== question.id),
            coverage: InspectionScopeManager.createCoverageSummary(
                activeScope.questions || [],
                updatedAnswers
            ),
            updatedAt: new Date().toISOString()
        };

        InspectionScopeManager.update(updatedScope);

        Notification.success("Evidence created from inspection scope.");
        sessionStorage.setItem("workspaceScrollTarget", "evidence-list");
        WorkspaceRouter.navigate("evidence");
    }

    static formatEvidenceType(type = "note") {
        return String(type)
            .replace(/_/g, " ")
            .replace(/\b\w/g, character => character.toUpperCase());
    }

    static startAdaptiveScope(activeInspection = null) {
        try {
            const currentCase = CaseManager.getCurrent();
            const currentBuilding = currentCase?.buildingId
                ? BuildingManager.load(currentCase.buildingId)
                : BuildingManager.get();
            const inspection = activeInspection || InspectionManager.getInspection();

            if (!currentCase) {
                Notification.info("Open a case before starting an inspection scope.");
                return;
            }

            if (!inspection) {
                Notification.info("Create or select an inspection before starting the adaptive scope.");
                return;
            }

            const existing = this.getActiveScope(inspection);

            if (existing) {
                InspectionScopeManager.set(existing);
                Notification.info("Adaptive inspection scope is already active.");
                this.refresh();
                return;
            }

            const scope = InspectionScopeManager.create({
                ...InspectionQuestionCatalog.createStarterScopeData(),
                caseId: currentCase.id,
                buildingId: inspection.buildingId || currentBuilding?.id || currentCase.buildingId || null,
                inspectionId: inspection.id,
                title: `Inspection Scope · ${inspection.title || inspection.id}`,
                status: "Draft"
            });

            InspectionScopeManager.set(scope);
            Notification.success("Adaptive inspection scope started.");
            this.refresh();
        } catch (error) {
            console.error("Inspection scope start failed:", error);
            Notification.warning("Inspection scope could not be started.");
        }
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
                id: "close-inspection",
                label: "Close Inspection",
                onClick: () => {
                    InspectionManager.clear();
                    this.refresh();
                }
            }
        ]));

        return wrapper;
    }

    static createMainLayout(inspections = [], activeInspection = null) {
        const layout = document.createElement("section");
        layout.className = "case-workspace-layout inspection-workspace-layout";

        const primaryColumn = document.createElement("div");
        primaryColumn.className = "workspace-primary-column";

        const intelligenceSnapshot = this.createInspectionIntelligenceSnapshot(activeInspection);
        if (intelligenceSnapshot) {
            primaryColumn.appendChild(intelligenceSnapshot);
        }

        primaryColumn.appendChild(this.createContent(inspections));

        const toolbar = this.createToolbar();
        toolbar.classList.add("workspace-full-width");

        layout.appendChild(toolbar);
        layout.appendChild(primaryColumn);
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
        const currentCase = CaseManager.getCurrent();
        const currentBuilding = currentCase?.buildingId
            ? BuildingManager.load(currentCase.buildingId)
            : BuildingManager.get();

        if (!currentCase) {
            Notification.info("Open a case before creating an inspection.");
            return;
        }

        const inspection = InspectionManager.create({
            buildingId: currentBuilding?.id || currentCase.buildingId || null,
            caseId: currentCase.id,
            title: "Technical Property Review",
            location: "Demo Property",
            notes: "Initial inspection record created from the workspace."
        });

        Notification.success("Inspection created.");
        InspectionManager.set(inspection);
        this.refresh();
    }

    static showPendingFeature(feature = "This feature") {
        Notification.info(`${feature} is reserved for a later workspace release.`);
    }

}
