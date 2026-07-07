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
import LanguageManager from "../../core/LanguageManager.js";

export default class InspectionPage {

    static profileStorageKey = "mbi:inspectionProfile";

    static getInspectionProfile() {
        return localStorage.getItem(this.profileStorageKey) || "default";
    }

    static setInspectionProfile(profile = "default") {
        const normalized = profile === "pattaya" ? "pattaya" : "default";
        localStorage.setItem(this.profileStorageKey, normalized);
        return normalized;
    }

    static getCatalogOptions() {
        const profile = this.getInspectionProfile();

        if (profile === "pattaya") {
            return {
                profile: "pattaya",
                country: "TH",
                region: "Pattaya / Chonburi"
            };
        }

        return {};
    }

    static getEffectiveCatalogOptions(activeScope = null) {
        const selectedProfile = this.getInspectionProfile();

        if (selectedProfile === "pattaya" || activeScope?.profile === "pattaya") {
            return {
                profile: "pattaya",
                country: "TH",
                region: "Pattaya / Chonburi"
            };
        }

        return {};
    }

    static isScopeCatalogMismatch(activeScope = null, catalogOptions = {}) {
        if (!activeScope || !Array.isArray(activeScope.questions)) {
            return false;
        }

        const selectedProfile = this.getInspectionProfile();
        const isPattaya = selectedProfile === "pattaya" || catalogOptions.profile === "pattaya" || activeScope.profile === "pattaya";
        const hasPattayaQuestions = activeScope.questions.some(question =>
            String(question.id || "").startsWith("TH-PATTAYA-")
        );

        const hasDefaultQuestions = activeScope.questions.some(question =>
            ["SCOPE-", "ROOF-", "FACADE-", "BASEMENT-", "ELECTRICAL-", "FIRE-", "DOCUMENTS-", "CAPEX-"]
                .some(prefix => String(question.id || "").startsWith(prefix))
        );

        return isPattaya && (!hasPattayaQuestions || hasDefaultQuestions);
    }

    static getEffectiveScopeQuestions(activeScope = null, catalogOptions = {}) {
        if (!activeScope) {
            return InspectionQuestionCatalog.getStarterScopeQuestions(catalogOptions);
        }

        if (this.isScopeCatalogMismatch(activeScope, catalogOptions)) {
            const scopeData = InspectionQuestionCatalog.createStarterScopeData(catalogOptions);
            const resyncedScope = InspectionScopeManager.update({
                ...activeScope,
                ...scopeData,
                profile: catalogOptions.profile || activeScope.profile || "default",
                country: catalogOptions.country || activeScope.country || null,
                region: catalogOptions.region || activeScope.region || null,
                answers: {},
                evidenceRequirements: [],
                riskFlags: [],
                limitations: [],
                status: "Draft"
            });

            InspectionScopeManager.set(resyncedScope || {
                ...activeScope,
                ...scopeData,
                profile: catalogOptions.profile || activeScope.profile || "default",
                country: catalogOptions.country || activeScope.country || null,
                region: catalogOptions.region || activeScope.region || null,
                answers: {},
                evidenceRequirements: [],
                riskFlags: [],
                limitations: [],
                status: "Draft"
            });

            return scopeData.questions;
        }

        return activeScope.questions || InspectionQuestionCatalog.getStarterScopeQuestions(catalogOptions);
    }

    static getModuleSummaries(questions = []) {
        const grouped = new Map();

        questions.forEach(question => {
            const moduleId = question.module || "Inspection";
            const current = grouped.get(moduleId) || {
                id: moduleId,
                label: moduleId,
                riskCategory: question.riskCategory || question.category || "Technical Review",
                count: 0
            };

            current.count += 1;
            grouped.set(moduleId, current);
        });

        return [...grouped.values()];
    }

    static createInspectionProfileControl(activeScope = null) {
        const currentProfile = this.getInspectionProfile();

        const panel = document.createElement("div");
        panel.className = "inspection-scope-editorial__profile";
        panel.style.cssText = [
            "display:block",
            "margin-top:16px",
            "padding:16px",
            "border:1px solid rgba(184,153,104,0.55)",
            "border-radius:14px",
            "background:#f3eee2",
            "color:#1b2b45",
            "max-width:420px",
            "box-shadow:0 10px 28px rgba(27,43,69,0.12)"
        ].join(";");
        panel.innerHTML = `
            <span>${LanguageManager.t("InspectionProfileLabel")}</span>
            <select aria-label="Inspection profile" style="display:block;width:100%;margin-top:8px;padding:10px;border-radius:10px;border:1px solid rgba(27,43,69,0.25);background:white;color:#1b2b45;">
                <option value="default"${currentProfile === "default" ? " selected" : ""}>Default / Germany</option>
                <option value="pattaya"${currentProfile === "pattaya" ? " selected" : ""}>Thailand / Pattaya</option>
            </select>
            <p>${currentProfile === "pattaya"
                ? LanguageManager.t("InspectionThailandProfileActive")
                : "Default starter catalog active."}</p>
        `;

        const select = panel.querySelector("select");

        select.addEventListener("change", event => {
            const selectedProfile = this.setInspectionProfile(event.target.value);
            const catalogOptions = this.getCatalogOptions();

            if (activeScope) {
                const scopeData = InspectionQuestionCatalog.createStarterScopeData(catalogOptions);
                const updatedScope = InspectionScopeManager.update({
                    ...activeScope,
                    ...scopeData,
                    profile: selectedProfile,
                    country: catalogOptions.country || null,
                    region: catalogOptions.region || null,
                    answers: {},
                    status: "Draft"
                });

                InspectionScopeManager.set(updatedScope || {
                    ...activeScope,
                    ...scopeData,
                    profile: selectedProfile,
                    country: catalogOptions.country || null,
                    region: catalogOptions.region || null,
                    answers: {},
                    status: "Draft"
                });

                Notification.info("Inspection profile changed. Active scope was reset for the selected catalog.");
                this.refresh();
                return;
            }

            Notification.info("Inspection profile updated.");
            this.refresh();
        });

        return panel;
    }

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
                label: `${LanguageManager.t("InspectionStrengthenStagePrefix")} ${firstOpenStage.label}`,
                description: `${firstOpenStage.label} ${LanguageManager.t("InspectionMissingStageDescriptionSuffix")}`,
                tone: "active"
            }
            : {
                label: LanguageManager.t("FinalReviewInspectionOutput"),
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
            <section class="inspection-intelligence intelligence-snapshot" aria-label="${LanguageManager.t("InspectionIntelligenceLabel")}">
                <div class="inspection-intelligence__header intelligence-snapshot__header">
                    <div>
                        <span class="inspection-intelligence__eyebrow intelligence-snapshot__eyebrow">${LanguageManager.t("InspectionIntelligenceLabel")}</span>
                        <strong>${intelligence.label}</strong>
                        <p>${intelligence.completedStages}/${intelligence.totalStages} ${LanguageManager.t("InspectionChecksCompleted")}</p>
                    </div>
                    <span class="inspection-intelligence__score intelligence-snapshot__score">${intelligence.confidenceScore}%</span>
                </div>

                <div class="inspection-intelligence__grid intelligence-snapshot__grid">
                    <article class="inspection-intelligence__card intelligence-snapshot__card">
                        <span>${LanguageManager.t("InspectionEvidenceCoverage")}</span>
                        <strong>${intelligence.evidenceCoverage}%</strong>
                        <p>${LanguageManager.t("InspectionEvidenceCoverageDescription")}</p>
                    </article>

                    <article class="inspection-intelligence__card intelligence-snapshot__card inspection-intelligence__card--${intelligence.signalDensity.tone} intelligence-snapshot__card--${intelligence.signalDensity.tone}">
                        <span>Technical Signal Density</span>
                        <strong>${intelligence.signalDensity.label}</strong>
                        <p>${intelligence.signalDensity.description}</p>
                    </article>

                    <article class="inspection-intelligence__card intelligence-snapshot__card inspection-intelligence__card--${intelligence.nextAction.tone} intelligence-snapshot__card--${intelligence.nextAction.tone}">
                        <span>${LanguageManager.t("InspectionNextActionLabel")}</span>
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
            label: LanguageManager.t("FinalEvidenceLabel")
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
            eyebrow: LanguageManager.t("InspectionWorkspaceTitle"),
            title: LanguageManager.t("InspectionTitlePlural"),
            description: activeInspection
                ? `${LanguageManager.t("InspectionActivePrefix")}: ${activeInspection.title || activeInspection.id}`
                : "Plan, document, and manage technical inspections linked to buildings, cases, and evidence.",
            actions: [
                {
                    id: "new-inspection",
                    label: LanguageManager.t("InspectionNewAction"),
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

        grid.appendChild(this.createMetricCard(LanguageManager.t("InspectionTitlePlural"), inspections.length));
        grid.appendChild(this.createMetricCard(LanguageManager.t("InspectionMetricDraft"), draftCount));
        grid.appendChild(this.createMetricCard("In Progress", progressCount));
        grid.appendChild(this.createMetricCard(LanguageManager.t("InspectionMetricCompleted"), completedCount));

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
        const catalogOptions = this.getEffectiveCatalogOptions(activeScope);
        const questions = this.getEffectiveScopeQuestions(activeScope, catalogOptions);
        const refreshedScope = activeScope?.id ? (InspectionScopeManager.load(activeScope.id) || activeScope) : activeScope;
        const modules = this.getModuleSummaries(questions);
        const answers = refreshedScope?.answers || {};
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
        title.textContent = activeScope ? LanguageManager.t("InspectionAdaptiveScopeActiveTitle") : "Adaptive Scope Review.";

        const description = document.createElement("p");
        description.textContent = activeScope
            ? LanguageManager.t("InspectionAdaptiveScopeActiveDescription")
            : "Define what must be inspected before evidence is collected. The scope engine turns answers into required evidence, risk signals and limitations.";

        const status = document.createElement("span");
        status.className = activeScope
            ? "inspection-scope-editorial__status inspection-scope-editorial__status--active"
            : "inspection-scope-editorial__status";
        status.textContent = activeScope ? LanguageManager.t("InspectionScopeActiveBadge") : "Not Started";

        heroCopy.appendChild(eyebrow);
        heroCopy.appendChild(title);
        heroCopy.appendChild(description);
        heroCopy.appendChild(status);
        heroCopy.appendChild(this.createInspectionProfileControl(activeScope));

        const actionPanel = document.createElement("aside");
        actionPanel.className = "inspection-scope-editorial__action-panel";

        const actionLabel = document.createElement("span");
        actionLabel.textContent = "Scope Control";

        const actionButton = document.createElement("button");
        actionButton.type = "button";
        actionButton.className = "button inspection-scope-editorial__action";
        actionButton.textContent = activeScope ? LanguageManager.t("InspectionScopeActiveBadge") : "Start Scope";
        actionButton.onclick = () => this.startAdaptiveScope(activeInspection);

        const actionMeta = document.createElement("p");
        actionMeta.textContent = activeScope
            ? `${coverage.inspected}/${coverage.total} ${LanguageManager.t("InspectionInspectedLabel")} · ${coverage.riskFlagged} ${LanguageManager.t("InspectionRiskFlagsLabel")}`
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
        moduleHeader.innerHTML = `<span>${LanguageManager.t("InspectionModulesLabel")}</span><strong>${LanguageManager.t("InspectionBuildingSystemsReview")}</strong>`;
        modulePanel.appendChild(moduleHeader);

        modules.forEach((module, index) => {
            const moduleQuestions = questions.filter(question => question.module === module.id);
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
        workHeader.innerHTML = `<span>${LanguageManager.t("InspectionCurrentQuestionLabel")}</span><strong>${LanguageManager.t("InspectionDecisionPathTitle")}</strong>`;

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
            ? LanguageManager.t("InspectionChooseAnswerDescription")
            : "Start the adaptive scope to connect this question set to the active case and inspection.";

        questionCard.appendChild(questionText);
        questionCard.appendChild(questionMeta);
        questionCard.appendChild(questionHint);
        questionCard.appendChild(this.createAnswerControls(activeInspection, activeScope, currentQuestion));

        const coveragePanel = document.createElement("div");
        coveragePanel.className = "inspection-scope-editorial__coverage";

        [
            ["Questions", coverage.total],
            [LanguageManager.t("InspectionOpenLabel"), coverage.open],
            ["Inspected", coverage.inspected],
            [LanguageManager.t("InspectionCoverageEvidenceLabel"), coverage.evidenceRequired],
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
        workPanel.appendChild(this.createScopeSignalPanel(refreshedScope, questions));
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
        const questionId = String(question.id || "");
        const isPattayaQuestion = questionId.startsWith("TH-PATTAYA-");

        if (isPattayaQuestion) {
            if (
                questionId.includes("-DOC-") ||
                String(question.module || "").toLowerCase().includes("dokument")
            ) {
                return [
                    { value: "Verfügbar", label: "Verfügbar" },
                    { value: "Nicht verfügbar", label: "Nicht verfügbar" },
                    { value: "Angefragt", label: "Angefragt" },
                    { value: "Nicht geprüft", label: "Nicht geprüft" }
                ];
            }

            return [
                { value: "i.O.", label: "i.O." },
                { value: "Auffällig", label: "Auffällig" },
                { value: "Nicht prüfbar", label: "Nicht prüfbar" },
                { value: "Hinweis", label: "Hinweis" }
            ];
        }

        if (Array.isArray(question.answerOptions) && question.answerOptions.length) {
            return question.answerOptions.map(option => {
                if (typeof option === "object") {
                    return {
                        value: option.value || option.label || "",
                        label: option.label || option.value || ""
                    };
                }

                return {
                    value: option,
                    label: option
                };
            });
        }

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

    static createScopeSignalPanel(activeScope = null, questions = []) {
        const panel = document.createElement("section");
        panel.className = "inspection-scope-editorial__signals";

        const activeQuestionIds = new Set((questions || []).map(question => question.id));
        const answeredQuestionIds = new Set(Object.keys(activeScope?.answers || {}));

        const isActiveAnsweredSignal = item =>
            activeQuestionIds.has(item.questionId) && answeredQuestionIds.has(item.questionId);

        const evidenceRequirements = (activeScope?.evidenceRequirements || [])
            .filter(isActiveAnsweredSignal);

        const riskFlags = (activeScope?.riskFlags || [])
            .filter(isActiveAnsweredSignal);

        const limitations = (activeScope?.limitations || [])
            .filter(isActiveAnsweredSignal);

        [
            {
                label: LanguageManager.t("InspectionEvidenceRequired"),
                value: evidenceRequirements.length,
                detail: evidenceRequirements.length
                    ? `${evidenceRequirements.length} ${LanguageManager.t("InspectionEvidenceRequiredSummary")}`
                    : "No evidence requirements triggered yet."
            },
            {
                label: "Risk Flags",
                value: riskFlags.length,
                detail: riskFlags.length
                    ? riskFlags.map(item => item.reason).slice(0, 2).join(" · ")
                    : LanguageManager.t("InspectionNoRiskFlagsYet")
            },
            {
                label: LanguageManager.t("InspectionLimitationsUpper"),
                value: limitations.length,
                detail: limitations.length
                    ? limitations.map(item => item.reason).slice(0, 2).join(" · ")
                    : LanguageManager.t("InspectionNoLimitationsYet")
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
        eyebrow.textContent = LanguageManager.t("InspectionEvidenceActions");

        const title = document.createElement("strong");
        title.textContent = "Required evidence by inspection answer";

        header.appendChild(eyebrow);
        header.appendChild(title);
        wrapper.appendChild(header);

        evidenceRequirements.forEach(requirement => {
            const question = InspectionQuestionCatalog.getById(requirement.questionId, activeScope?.profile === 'pattaya' || this.getInspectionProfile() === 'pattaya' ? { profile: 'pattaya', country: 'TH', region: 'Pattaya / Chonburi' } : {});
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

            const isDocumentAvailabilityRequirement = (requirement.requiredEvidence || [])
                .includes("document_availability_check") ||
                question?.reportSection === "Document Availability Check";

            if (isDocumentAvailabilityRequirement) {
                const policyNote = document.createElement("p");
                policyNote.textContent = "Availability check only. No legal, financial, technical or governance document review is performed.";
                content.appendChild(policyNote);
            }

            const action = document.createElement("button");
            action.type = "button";
            action.className = "button inspection-scope-editorial__requirement-action";
            action.textContent = LanguageManager.t("InspectionCreateEvidence");
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

        const catalogOptions = activeScope?.profile === "pattaya" || this.getInspectionProfile() === "pattaya"
            ? { profile: "pattaya", country: "TH", region: "Pattaya / Chonburi" }
            : {};

        const question = InspectionQuestionCatalog.getById(requirement.questionId, catalogOptions);

        if (!question) {
            Notification.warning("Inspection question could not be found.");
            return;
        }

        const rawEvidenceType = (requirement.requiredEvidence || ["note"])[0];
        const isDocumentAvailabilityCheck =
            rawEvidenceType === "document_availability_check" ||
            question.reportSection === "Document Availability Check" ||
            String(question.id || "").includes("-DOC-AVAILABILITY-");

        const evidenceType = rawEvidenceType === "document_availability_check"
            ? "document"
            : rawEvidenceType;

        const availabilityOnlyNotice = "Thailand document handling: availability check only. No legal, financial, technical or governance document review has been performed.";

        const answer = activeScope.answers?.[question.id] || null;

        const evidence = EvidenceManager.create({
            caseId: activeScope.caseId,
            buildingId: activeScope.buildingId || null,
            inspectionId: activeScope.inspectionId || null,
            type: evidenceType,
            category: isDocumentAvailabilityCheck ? "Document Availability Check" : (question.category || "Inspection Scope"),
            title: isDocumentAvailabilityCheck
                ? `Document availability check · ${question.question}`
                : `${this.formatEvidenceType(evidenceType)} required · ${question.question}`,
            description: [
                LanguageManager.t("InspectionEvidenceRequirementGenerated"),
                isDocumentAvailabilityCheck ? availabilityOnlyNotice : "",
                `Question: ${question.id}`,
                `Module: ${question.module}`,
                `Category: ${question.category}`,
                `Component: ${question.component || "Not specified"}`,
                isDocumentAvailabilityCheck ? "Review boundary: availability recorded only. Content, legal validity, financial adequacy and governance completeness are not assessed by this action." : ""
            ].filter(Boolean).join("\n"),
            buildingSystem: question.module || "",
            componentId: question.component || null,
            source: "Inspection Scope",
            sourceType: "inspection-scope",
            sourceQuestionId: question.id,
            sourceQuestion: question.question,
            sourceModule: question.module || "",
            sourceCategory: question.category || "",
            sourceRequiredEvidence: requirement.requiredEvidence || [],
            sourceRequiredEvidenceRaw: rawEvidenceType,
            sourcePolicy: isDocumentAvailabilityCheck ? "availability_check_only" : "",
            scopeId: activeScope.id,
            status: "Open",
            tags: [
                "inspection-scope",
                question.id,
                ...(requirement.requiredEvidence || []),
                ...(isDocumentAvailabilityCheck ? ["availability-check-only", "no-document-review"] : [])
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

        Notification.success(LanguageManager.t("InspectionEvidenceCreatedFromScope"));
        sessionStorage.setItem("workspaceScrollTarget", "evidence-list");
        window.location.hash = "evidence";
    }

    static formatEvidenceType(type = "note") {
        return String(type)
            .replace(/_/g, " ")
            .replace(/\b\w/g, character => character.toUpperCase());
    }

    static startAdaptiveScope(activeInspection = null) {
        try {
            const isPattayaProfile = this.getInspectionProfile() === "pattaya";

            let currentCase = CaseManager.getCurrent();
            let inspection = activeInspection || InspectionManager.getInspection();

            if (!currentCase && isPattayaProfile) {
                currentCase = CaseManager.getAll()[0] || null;

                if (currentCase) {
                    CaseManager.open(currentCase);
                }
            }

            if (!inspection && isPattayaProfile) {
                inspection = InspectionManager.getAllInspections()[0] || null;

                if (inspection) {
                    InspectionManager.set(inspection);
                }
            }

            const currentBuilding = currentCase?.buildingId
                ? BuildingManager.load(currentCase.buildingId)
                : BuildingManager.get();

            if (!currentCase) {
                Notification.info(LanguageManager.t("InspectionOpenCaseBeforeScope"));
                return;
            }

            if (!inspection) {
                Notification.info(LanguageManager.t("InspectionCreateOrSelectBeforeScope"));
                return;
            }

            const existing = this.getActiveScope(inspection);

            if (existing) {
                InspectionScopeManager.set(existing);
                Notification.info(LanguageManager.t("InspectionAdaptiveScopeAlreadyActive"));
                this.refresh();
                return;
            }

            const catalogOptions = this.getCatalogOptions();
            const scope = InspectionScopeManager.create({
                ...InspectionQuestionCatalog.createStarterScopeData(catalogOptions),
                caseId: currentCase.id,
                buildingId: inspection.buildingId || currentBuilding?.id || currentCase.buildingId || null,
                inspectionId: inspection.id,
                profile: this.getInspectionProfile(),
                country: catalogOptions.country || null,
                region: catalogOptions.region || null,
                title: `${LanguageManager.t("InspectionScopeTitlePrefix")} · ${inspection.title || inspection.id}`,
                status: "Draft"
            });

            InspectionScopeManager.set(scope);
            Notification.success(LanguageManager.t("InspectionAdaptiveScopeStarted"));
            this.refresh();
        } catch (error) {
            console.error(LanguageManager.t("InspectionScopeStartFailedLog"), error);
            Notification.warning(LanguageManager.t("InspectionScopeCouldNotStart"));
        }
    }

    static createToolbar() {
        const wrapper = document.createElement("section");
        wrapper.className = "workflow-card";

        wrapper.appendChild(ActionBar.create([
            {
                id: "refresh",
                label: LanguageManager.t("InspectionRefreshAction"),
                onClick: () => this.refresh()
            },
            {
                id: "close-inspection",
                label: LanguageManager.t("InspectionCloseAction"),
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
                eyebrow: LanguageManager.t("InspectionWorkspaceTitle"),
                title: LanguageManager.t("InspectionEmptyTitle"),
                description: LanguageManager.t("InspectionEmptyDescription"),
                actionLabel: LanguageManager.t("InspectionNewAction"),
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
        title.textContent = inspection.title || LanguageManager.t("InspectionTechnicalPropertyReviewFallback");

        const meta = document.createElement("p");
        meta.textContent = [
            inspection.location || LanguageManager.t("InspectionLocationPending"),
            inspection.inspector || LanguageManager.t("InspectionInspectorPending"),
            inspection.status || LanguageManager.t("InspectionStatusDraftLower")
        ].join(" · ");

        const badge = document.createElement("span");
        badge.className = "tag";
        badge.textContent = inspection.status || LanguageManager.t("InspectionStatusDraftLower");

        content.appendChild(title);
        content.appendChild(meta);
        row.appendChild(content);
        row.appendChild(badge);

        return row;
    }

    static createDetailPanel(activeInspection = null) {
        if (!activeInspection) {
            return DetailPanel.create(LanguageManager.t("InspectionContextTitle"), [
                { label: LanguageManager.t("InspectionCurrentLabel"), value: LanguageManager.t("InspectionNotSelected") },
                { label: LanguageManager.t("InspectionStatusLabel"), value: LanguageManager.t("InspectionNotStarted") },
                { label: LanguageManager.t("InspectionNextStepLabel"), value: LanguageManager.t("InspectionCreateOrSelect") }
            ]);
        }

        return DetailPanel.create(LanguageManager.t("InspectionContextTitle"), [
            { label: LanguageManager.t("InspectionCurrentLabel"), value: activeInspection.title || activeInspection.id },
            { label: "Inspection Status", value: activeInspection.status || "draft" },
            { label: LanguageManager.t("InspectionBuildingIdLabel"), value: activeInspection.buildingId || LanguageManager.t("InspectionNotLinked") },
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
            Notification.info(LanguageManager.t("InspectionOpenCaseBeforeCreating"));
            return;
        }

        const inspection = InspectionManager.create({
            buildingId: currentBuilding?.id || currentCase.buildingId || null,
            caseId: currentCase.id,
            title: LanguageManager.t("InspectionTechnicalPropertyReviewFallback"),
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
