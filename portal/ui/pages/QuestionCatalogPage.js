
import QuestionCatalogManager from "../../core/QuestionCatalogManager.js";

import AdaptiveInspectionProfileEngine from "../../core/AdaptiveInspectionProfileEngine.js";

import AdaptiveFollowUpQuestionEngine from "../../core/AdaptiveFollowUpQuestionEngine.js";

import AdaptiveInspectionPreviewBridge from "../../core/AdaptiveInspectionPreviewBridge.js";
import AdaptiveScopeDraftEngine from "../../core/AdaptiveScopeDraftEngine.js";
import AdaptiveInspectionSessionSandbox from "../../core/AdaptiveInspectionSessionSandbox.js";
import InspectionHumanWorkLayer from "../../core/InspectionHumanWorkLayer.js";
import AnswerInteractionSandbox from "../../core/AnswerInteractionSandbox.js";

import LanguageManager from "../../core/LanguageManager.js";

import SectionHeader from "../components/SectionHeader.js";

import MetricCard from "../components/MetricCard.js";

import EmptyState from "../components/EmptyState.js";

export default class QuestionCatalogPage {

    static selectedChapter = "01";

    static searchTerm = "";

    static isLoading = false;

    static loadError = null;

    static render() {

        const fragment = document.createDocumentFragment();

        fragment.appendChild(this.createHeader());

        if (!QuestionCatalogManager.count()) {

            this.loadCatalog();

            fragment.appendChild(this.createLoadingState());

            return fragment;

        }

        const summary = QuestionCatalogManager.getSummary();
        this.ensureSelectedChapter();

        fragment.appendChild(this.createInspectionHumanWorkLayerView());

        fragment.appendChild(this.createWorkModeSupportPanel(summary));

        return fragment;

    }

    static createHeader() {

        return SectionHeader.create({

            eyebrow: "Question Catalog",

            title: "Technical Due Diligence Catalog",

            description: "Read-only diagnostic view for the imported MEIFERTS question catalog.",

            actions: [

                {

                    id: "reload-question-catalog",

                    label: "Reload catalog",

                    onClick: () => this.reloadCatalog()

                }

            ]

        });

    }

    static createLoadingState() {

        if (this.loadError) {

            return EmptyState.create({

                eyebrow: "Question Catalog",

                title: "Catalog could not be loaded",

                description: this.loadError,

                actionLabel: "Try again",

                onAction: () => this.reloadCatalog()

            });

        }

        return EmptyState.create({

            eyebrow: "Question Catalog",

            title: "Loading catalog",

            description: "The imported MEIFERTS question catalog is being loaded from the repository data package."

        });

    }

    static createMetrics(summary) {

        const grid = document.createElement("section");

        grid.className = "metric-grid";

        grid.appendChild(MetricCard.create("Catalog items", String(summary.totalItems)));

        grid.appendChild(MetricCard.create("Chapters", String(summary.chapterCount)));

        grid.appendChild(MetricCard.create("Validation", summary.validationStatus));

        grid.appendChild(MetricCard.create("Duplicates", String(summary.duplicateQuestionIds)));

        return grid;

    }

    static createControls() {

        const wrapper = document.createElement("section");

        wrapper.className = "workflow-card";

        const chapters = QuestionCatalogManager.getChapters();

        const chapterOptions = chapters

            .map(chapter => {

                const selected = chapter.chapterNumber === this.selectedChapter ? "selected" : "";

                return `<option value="${this.escapeHtml(chapter.chapterNumber)}" ${selected}>

                    ${this.escapeHtml(chapter.chapterNumber)} · ${this.escapeHtml(chapter.chapterTitle)} (${chapter.count})

                </option>`;

            })

            .join("");

        wrapper.innerHTML = `

            <div class="settings-cleanup__header">

                <div>

                    <p class="eyebrow">Catalog Browser</p>

                    <h3>Read-only catalog diagnostics</h3>

                    <p>Filter by chapter or search across question text, building system, inspection area and references.</p>

                </div>

            </div>

            <div class="settings-cleanup__grid">

                <label>

                    <span class="eyebrow">Chapter</span>

                    <select data-question-catalog-chapter>

                        ${chapterOptions}

                    </select>

                </label>

                <label>

                    <span class="eyebrow">Search</span>

                    <input data-question-catalog-search type="search" value="${this.escapeHtml(this.searchTerm)}" placeholder="Search catalog">

                </label>

            </div>

        `;

        const chapterSelect = wrapper.querySelector("[data-question-catalog-chapter]");

        const searchInput = wrapper.querySelector("[data-question-catalog-search]");

        chapterSelect?.addEventListener("change", event => {

            this.selectedChapter = event.target.value;

            this.renderIntoWorkspace();

        });

        searchInput?.addEventListener("input", event => {

            this.searchTerm = event.target.value;

            this.renderIntoWorkspace();

        });

        return wrapper;

    }

    static createWorkModeSupportPanel(summary = {}) {

        const wrapper = document.createElement("div");

        wrapper.className = "work-mode-support-panel";

        const catalogDetails = document.createElement("details");

        catalogDetails.className = "workflow-card work-mode-support-panel__details";

        catalogDetails.innerHTML = `

            <summary>

                <div>

                    <p class="eyebrow">Catalog Reference</p>

                    <h3>Question catalog and filters</h3>

                    <p>Open only when you need to inspect the imported catalog, validation status or visible question list.</p>

                </div>

                <span class="tag">${this.escapeHtml(summary.totalQuestions || 0)} items</span>

            </summary>

        `;

        const catalogContent = document.createElement("div");

        catalogContent.className = "work-mode-support-panel__content";

        catalogContent.appendChild(this.createMetrics(summary));

        catalogContent.appendChild(this.createControls());

        catalogContent.appendChild(this.createCatalogContent());

        catalogDetails.appendChild(catalogContent);

        const diagnosticsDetails = document.createElement("details");

        diagnosticsDetails.className = "workflow-card work-mode-support-panel__details";

        diagnosticsDetails.innerHTML = `

            <summary>

                <div>

                    <p class="eyebrow">Developer Diagnostics</p>

                    <h3>Adaptive engine details</h3>

                    <p>Profile selection, follow-up simulation, scope draft and sandbox diagnostics. Hidden during normal inspection work.</p>

                </div>

                <span class="tag">Engine</span>

            </summary>

        `;

        const diagnosticsContent = document.createElement("div");

        diagnosticsContent.className = "work-mode-support-panel__content";

        diagnosticsContent.appendChild(this.createAdaptiveProfileDiagnostic());

        diagnosticsContent.appendChild(this.createAdaptiveFollowUpDiagnostic());

        diagnosticsContent.appendChild(this.createAdaptiveInspectionPreviewDiagnostic());

        diagnosticsContent.appendChild(this.createAdaptiveScopeDraftDiagnostic());

        diagnosticsContent.appendChild(this.createAdaptiveInspectionSandboxDiagnostic());

        diagnosticsDetails.appendChild(diagnosticsContent);

        wrapper.appendChild(catalogDetails);

        wrapper.appendChild(diagnosticsDetails);

        return wrapper;

    }

    static createAdaptiveProfileDiagnostic() {

        const section = document.createElement("section");

        section.className = "workflow-card";

        const profile = {
            country: "Thailand",
            buildingType: "Condominium",
            useType: "Residential",
            ageBand: "Existing",
            climateZone: "Tropical",
            locationContext: "Coastal",
            legalContext: "Ownership",
            inspectionPurpose: "Acquisition"
        };

        const result = AdaptiveInspectionProfileEngine.createStartQuestionSet(
            profile,
            QuestionCatalogManager.getAll(),
            { limit: 25 }
        );

        section.innerHTML = `

            <div class="settings-cleanup__header">

                <div>

                    <p class="eyebrow">Adaptive Profile Diagnostic</p>

                    <h3>${result.selectedCount} suggested start questions</h3>

                    <p>Profile: Thailand · Condominium · Residential · Existing · Tropical · Coastal · Ownership · Acquisition. Diagnostic only. No answers, evidence, findings or reports are created.</p>

                </div>

                <span class="tag">Rule Engine</span>

            </div>

        `;

        if (!result.questions.length) {

            const empty = document.createElement("p");

            empty.textContent = "No adaptive questions were selected for the current diagnostic profile.";

            section.appendChild(empty);

            return section;

        }

        const list = document.createElement("div");

        list.className = "question-catalog-list";

        result.questions.slice(0, 10).forEach(question => {

            list.appendChild(this.createAdaptiveQuestionRow(question));

        });

        section.appendChild(list);

        return section;

    }

    static createAdaptiveInspectionPreviewDiagnostic() {

        const section = document.createElement("section");

        section.className = "workflow-card adaptive-inspection-preview";

        const profile = {
            country: "Thailand",
            buildingType: "Condominium",
            useType: "Residential",
            ageBand: "Existing",
            climateZone: "Tropical",
            locationContext: "Coastal",
            legalContext: "Ownership",
            inspectionPurpose: "Acquisition"
        };

        const preview = AdaptiveInspectionPreviewBridge.createPreview(
            profile,
            QuestionCatalogManager.getAll(),
            {
                startLimit: 5,
                followUpLimit: 5
            }
        );

        section.innerHTML = `

            <div class="settings-cleanup__header">

                <div>

                    <p class="eyebrow">Adaptive Inspection Preview</p>

                    <h3>${preview.startQuestionCount} read-only preview questions</h3>

                    <p>Combines adaptive profile selection with follow-up simulation. Diagnostic only. No answers, evidence, findings, assessments or reports are created.</p>

                </div>

                <span class="tag">Preview Bridge</span>

            </div>

            <div class="adaptive-inspection-preview__boundary">

                ${this.createSafetyBoundaryBadges(preview.safetyBoundary)}

            </div>

        `;

        const list = document.createElement("div");

        list.className = "adaptive-inspection-preview__list";

        preview.previewQuestions.forEach((previewQuestion, index) => {

            list.appendChild(this.createAdaptiveInspectionPreviewRow(previewQuestion, index));

        });

        section.appendChild(list);

        return section;

    }

    static createAdaptiveScopeDraftDiagnostic() {

        const section = document.createElement("section");

        section.className = "workflow-card adaptive-scope-draft";

        const profile = {
            country: "Thailand",
            buildingType: "Condominium",
            useType: "Residential",
            ageBand: "Existing",
            climateZone: "Tropical",
            locationContext: "Coastal",
            legalContext: "Ownership",
            inspectionPurpose: "Acquisition"
        };

        const preview = AdaptiveInspectionPreviewBridge.createPreview(
            profile,
            QuestionCatalogManager.getAll(),
            {
                startLimit: 5,
                followUpLimit: 5
            }
        );

        const draft = AdaptiveScopeDraftEngine.createScopeDraft(preview);

        section.innerHTML = `

            <div class="settings-cleanup__header">

                <div>

                    <p class="eyebrow">Adaptive Scope Draft</p>

                    <h3>${draft.questionCount} draft questions · ${draft.moduleCount} draft modules</h3>

                    <p>Read-only scope draft derived from the adaptive inspection preview. Diagnostic only. No inspection, answers, evidence, findings, assessments or reports are created.</p>

                </div>

                <span class="tag">Scope Draft Engine</span>

            </div>

            <div class="adaptive-inspection-preview__boundary">

                ${this.createSafetyBoundaryBadges(draft.safetyBoundary)}

            </div>

            <div class="adaptive-scope-draft__summary">

                <div>
                    <span>Catalog items</span>
                    <strong>${this.escapeHtml(draft.totalCatalogItems)}</strong>
                </div>

                <div>
                    <span>Draft questions</span>
                    <strong>${this.escapeHtml(draft.questionCount)}</strong>
                </div>

                <div>
                    <span>Draft modules</span>
                    <strong>${this.escapeHtml(draft.moduleCount)}</strong>
                </div>

                <div>
                    <span>Evidence types</span>
                    <strong>${this.escapeHtml(draft.evidenceRequirements.length)}</strong>
                </div>

            </div>

            <div class="adaptive-scope-draft__chips">

                ${draft.evidenceRequirements.map(requirement => `
                    <span>${this.escapeHtml(requirement)}</span>
                `).join("")}

            </div>

            <div class="adaptive-scope-draft__signals">

                ${draft.signalSummary.map(item => `
                    <span>${this.escapeHtml(item.signal)} · ${this.escapeHtml(item.count)}</span>
                `).join("")}

            </div>

        `;

        const list = document.createElement("div");

        list.className = "adaptive-scope-draft__modules";

        draft.modules.forEach((module, index) => {

            list.appendChild(this.createAdaptiveScopeDraftModuleRow(module, index));

        });

        section.appendChild(list);

        return section;

    }

    static createAdaptiveScopeDraftModuleRow(module, index = 0) {

        const row = document.createElement("article");

        row.className = "adaptive-scope-draft__module";

        row.innerHTML = `

            <div class="adaptive-scope-draft__module-header">

                <div>

                    <span class="adaptive-diagnostic-row__eyebrow">Draft module ${index + 1}</span>

                    <strong>${this.escapeHtml(module.chapterNumber)} ${this.escapeHtml(module.chapterTitle)}</strong>

                    <p>${this.escapeHtml(module.buildingSystem || "n/a")}</p>

                </div>

                <span class="adaptive-diagnostic-row__score">${this.escapeHtml(module.questionCount)} questions</span>

            </div>

            <div class="adaptive-scope-draft__module-grid">

                <div>
                    <span>Candidate follow-ups</span>
                    <strong>${this.escapeHtml(module.candidateFollowUpCount)}</strong>
                </div>

                <div>
                    <span>Finding route</span>
                    <strong>${this.escapeHtml(module.findingFollowUpCount)}</strong>
                </div>

                <div>
                    <span>OK skip route</span>
                    <strong>${this.escapeHtml(module.okSkipCount)}</strong>
                </div>

                <div>
                    <span>Evidence</span>
                    <strong>${this.escapeHtml(module.evidenceRequirements.length)}</strong>
                </div>

            </div>

            <div class="adaptive-scope-draft__question-list">

                ${module.questions.map(question => `
                    <div>
                        <span>${this.escapeHtml(question.questionId)}</span>
                        <p>${this.escapeHtml(question.questionText)}</p>
                    </div>
                `).join("")}

            </div>

        `;

        return row;

    }

    static createAdaptiveInspectionSandboxDiagnostic() {

        const section = document.createElement("section");

        section.className = "workflow-card adaptive-inspection-sandbox";

        const profile = {
            country: "Thailand",
            buildingType: "Condominium",
            useType: "Residential",
            ageBand: "Existing",
            climateZone: "Tropical",
            locationContext: "Coastal",
            legalContext: "Ownership",
            inspectionPurpose: "Acquisition"
        };

        const preview = AdaptiveInspectionPreviewBridge.createPreview(
            profile,
            QuestionCatalogManager.getAll(),
            {
                startLimit: 5,
                followUpLimit: 5
            }
        );

        const draft = AdaptiveScopeDraftEngine.createScopeDraft(preview);

        const sandbox = AdaptiveInspectionSessionSandbox.createSandboxSession(draft, {
            sandboxId: "sandbox-browser-diagnostic"
        });

        section.innerHTML = `

            <div class="settings-cleanup__header">

                <div>

                    <p class="eyebrow">Adaptive Inspection Sandbox</p>

                    <h3>${sandbox.questionCount} sandbox questions · ${sandbox.moduleCount} sandbox modules</h3>

                    <p>Read-only sandbox session prepared from the adaptive scope draft. Diagnostic only. No real inspection, answers, evidence, findings, assessments or reports are created.</p>

                </div>

                <span class="tag">Sandbox Session</span>

            </div>

            <div class="adaptive-inspection-preview__boundary">

                ${this.createSafetyBoundaryBadges(sandbox.safetyBoundary)}

            </div>

            <div class="adaptive-inspection-sandbox__summary">

                <div>
                    <span>Session mode</span>
                    <strong>${this.escapeHtml(this.formatSessionMode(sandbox.sessionMode))}</strong>
                </div>

                <div>
                    <span>Progress</span>
                    <strong>${this.escapeHtml(sandbox.progress.completionRate)}%</strong>
                </div>

                <div>
                    <span>Answered</span>
                    <strong>${this.escapeHtml(sandbox.progress.answeredQuestions)}</strong>
                </div>

                <div>
                    <span>Unanswered</span>
                    <strong>${this.escapeHtml(sandbox.progress.unansweredQuestions)}</strong>
                </div>

            </div>

            <div class="adaptive-inspection-sandbox__meta">

                <span>Sandbox ID · ${this.escapeHtml(sandbox.sandboxId)}</span>

                <span>Total catalog items · ${this.escapeHtml(sandbox.totalCatalogItems)}</span>

                <span>Evidence types · ${this.escapeHtml(sandbox.evidenceRequirements.length)}</span>

                <span>Prepared signals · ${this.escapeHtml(sandbox.signalSummary.length)}</span>

            </div>

        `;

        const list = document.createElement("div");

        list.className = "adaptive-inspection-sandbox__modules";

        sandbox.modules.forEach((module, index) => {

            list.appendChild(this.createAdaptiveInspectionSandboxModuleRow(module, index));

        });

        section.appendChild(list);

        return section;

    }

    static formatSessionMode(mode = "") {

        const labels = {
            sandbox_read_only: "Read-only sandbox"
        };

        return labels[mode] || String(mode).replaceAll("_", " ");

    }

    static createAdaptiveInspectionSandboxModuleRow(module, index = 0) {

        const row = document.createElement("article");

        row.className = "adaptive-inspection-sandbox__module";

        row.innerHTML = `

            <div class="adaptive-inspection-sandbox__module-header">

                <div>

                    <span class="adaptive-diagnostic-row__eyebrow">Sandbox module ${index + 1}</span>

                    <strong>${this.escapeHtml(module.chapterNumber)} ${this.escapeHtml(module.chapterTitle)}</strong>

                    <p>${this.escapeHtml(module.buildingSystem || "n/a")}</p>

                </div>

                <span class="adaptive-diagnostic-row__score">${this.escapeHtml(module.questionCount)} questions</span>

            </div>

            <div class="adaptive-inspection-sandbox__question-list">

                ${module.questions.map(question => `
                    <div>
                        <span>${this.escapeHtml(question.questionId)}</span>
                        <p>${this.escapeHtml(question.questionText)}</p>
                        <small>
                            Answer: ${this.escapeHtml(question.answerState.isAnswered ? "answered" : "not answered")}
                            · Persisted: ${this.escapeHtml(String(question.answerState.persisted))}
                            · Evidence created: ${this.escapeHtml(String(question.evidenceState.created))}
                            · Finding created: ${this.escapeHtml(String(question.findingState.created))}
                        </small>
                    </div>
                `).join("")}

            </div>

        `;

        return row;

    }

    static createAnswerInteractionSandboxPreview(interaction = {}) {

        if (interaction.interactionMode === "answer_sandbox_rejected") {
            return `

                <span>Sandbox interaction rejected</span>

                <p>${this.escapeHtml(interaction.reason || "Unknown answer option.")}</p>

            `;
        }

        return `

            <span>Sandbox interaction preview</span>

            <div class="inspection-human-work-layer__interaction-grid">

                <div>
                    <small>Selected answer</small>
                    <strong>${this.escapeHtml(interaction.selectedAnswer?.label || "n/a")}</strong>
                </div>

                <div>
                    <small>Progress preview</small>
                    <strong>${this.escapeHtml(interaction.progressPreview?.completionRate || 0)}%</strong>
                </div>

                <div>
                    <small>Next step</small>
                    <strong>${this.escapeHtml(interaction.guidance?.nextStep || "Preview only")}</strong>
                </div>

            </div>

            <p>${this.escapeHtml(interaction.guidance?.evidenceHint || "No action created.")}</p>

            <small>
                answerPersisted: ${this.escapeHtml(String(interaction.safetyBoundary?.answerPersisted))}
                · evidenceCreated: ${this.escapeHtml(String(interaction.safetyBoundary?.evidenceCreated))}
                · findingCreated: ${this.escapeHtml(String(interaction.safetyBoundary?.findingCreated))}
            </small>

        `;

    }

    static createInspectionHumanWorkLayerView() {

        const section = document.createElement("section");

        section.className = "workflow-card inspection-human-work-layer";

        const profile = {
            country: "Thailand",
            buildingType: "Condominium",
            useType: "Residential",
            ageBand: "Existing",
            climateZone: "Tropical",
            locationContext: "Coastal",
            legalContext: "Ownership",
            inspectionPurpose: "Acquisition"
        };

        const preview = AdaptiveInspectionPreviewBridge.createPreview(
            profile,
            QuestionCatalogManager.getAll(),
            {
                startLimit: 5,
                followUpLimit: 5
            }
        );

        const draft = AdaptiveScopeDraftEngine.createScopeDraft(preview);

        const sandbox = AdaptiveInspectionSessionSandbox.createSandboxSession(draft, {
            sandboxId: "sandbox-human-work-layer-browser"
        });

        const workView = InspectionHumanWorkLayer.createWorkView(sandbox, {
            currentModuleIndex: 0,
            currentQuestionIndex: 0
        });

        section.innerHTML = `

            <div class="inspection-human-work-layer__topline">

                <span>Inspection Work Mode</span>

                <strong>${this.escapeHtml(workView.progress.completionRate)}% complete</strong>

            </div>

            <div class="inspection-human-work-layer__hero">

                <div>

                    <p class="eyebrow">${this.escapeHtml(workView.currentModule.chapterNumber)} ${this.escapeHtml(workView.currentModule.chapterTitle)}</p>

                    <h3>${this.escapeHtml(workView.currentQuestion.questionText)}</h3>

                    <p>${this.escapeHtml(workView.guidance.primary)}</p>

                </div>

                <div class="inspection-human-work-layer__counter">

                    <span>Question</span>

                    <strong>${this.escapeHtml(workView.currentQuestion.questionIndex)} / ${this.escapeHtml(workView.progress.totalQuestions)}</strong>

                </div>

            </div>

            <div class="inspection-human-work-layer__context">

                <span>${this.escapeHtml(workView.currentQuestion.questionId)}</span>

                <span>${this.escapeHtml(workView.currentQuestion.sectionTitle || "No section")}</span>

                <span>${this.escapeHtml(workView.currentModule.buildingSystem)}</span>

            </div>

            <div class="inspection-human-work-layer__answers">

                ${workView.answerOptions.map(option => `
                    <button type="button" class="inspection-human-work-layer__answer is-${this.escapeHtml(option.tone)}" data-answer-value="${this.escapeHtml(option.value)}">
                        <strong>${this.escapeHtml(option.label)}</strong>
                        <span>${this.escapeHtml(option.description)}</span>
                    </button>
                `).join("")}

            </div>

            <div class="inspection-human-work-layer__hint">

                <span>Evidence hint</span>

                <p>${this.escapeHtml(workView.guidance.evidenceHint)}</p>

            </div>

            <div class="inspection-human-work-layer__progress">

                <div>
                    <span style="width: ${this.escapeHtml(workView.progress.completionRate)}%;"></span>
                </div>

                <p>${this.escapeHtml(workView.progress.answeredQuestions)} answered · ${this.escapeHtml(workView.progress.unansweredQuestions)} open</p>

            </div>

            <div class="inspection-human-work-layer__interaction-preview" data-answer-interaction-preview>

                <span>Sandbox interaction</span>

                <p>Select an answer to preview the next step. Nothing will be saved.</p>

            </div>

        `;

        section.querySelectorAll("[data-answer-value]").forEach((button) => {

            button.addEventListener("click", () => {

                const answerValue = button.getAttribute("data-answer-value");

                const interaction = AnswerInteractionSandbox.applyAnswer(workView, answerValue, {
                    interactionId: `answer-browser-${Date.now()}`
                });

                section.querySelectorAll("[data-answer-value]").forEach((item) => {
                    item.classList.remove("is-selected");
                });

                button.classList.add("is-selected");

                const previewNode = section.querySelector("[data-answer-interaction-preview]");

                if (previewNode) {
                    previewNode.innerHTML = this.createAnswerInteractionSandboxPreview(interaction);
                }

            });

        });

        return section;

    }

    static createSafetyBoundaryBadges(boundary = {}) {

        const labels = {
            answersPersisted: "Answers persisted",
            evidenceCreated: "Evidence created",
            findingsCreated: "Findings created",
            assessmentsCreated: "Assessments created",
            reportsCreated: "Reports created"
        };

        return Object.entries(boundary)
            .map(([key, value]) => {
                const label = labels[key] || key;
                const status = value ? "Yes" : "No";
                const tone = value ? "is-active" : "is-safe";

                return `<span class="${tone}">${this.escapeHtml(label)}: ${this.escapeHtml(status)}</span>`;
            })
            .join("");

    }

    static createAdaptiveInspectionPreviewRow(previewQuestion, index = 0) {

        const row = document.createElement("article");

        row.className = "adaptive-inspection-preview__row";

        const question = previewQuestion.question;

        row.innerHTML = `

            <div class="adaptive-inspection-preview__row-header">

                <div>

                    <span class="adaptive-diagnostic-row__eyebrow">Preview question ${index + 1}</span>

                    <strong>${this.escapeHtml(question.questionId)}</strong>

                    <p>${this.escapeHtml(question.questionText)}</p>

                </div>

                <span class="adaptive-diagnostic-row__score">Candidates ${this.escapeHtml(previewQuestion.candidateFollowUpCount)}</span>

            </div>

            <div class="adaptive-diagnostic-row__meta">

                <span>${this.escapeHtml(question.chapterNumber)}</span>

                <span>${this.escapeHtml(question.chapterTitle)}</span>

                <span>${this.escapeHtml(question.sectionTitle)}</span>

                <span>${this.escapeHtml(question.buildingSystem || "n/a")}</span>

            </div>

            <div class="adaptive-inspection-preview__simulation-grid">

                <div class="adaptive-follow-up-diagnostic__card adaptive-follow-up-diagnostic__card--finding">

                    <small>Simulated answer: finding</small>

                    <strong>Follow-up route</strong>

                    <p>Activates focused follow-up questions and prepares evidence / decision signals.</p>

                    <small>Activated follow-ups</small>

                    <div class="adaptive-diagnostic-row__signals">

                        ${this.createInlineBadges(previewQuestion.negativeSimulation.followUpQuestionIds)}

                    </div>

                    <small>Evidence requirements</small>

                    <div class="adaptive-diagnostic-row__signals">

                        ${this.createInlineBadges(previewQuestion.negativeSimulation.evidenceRequirements)}

                    </div>

                    <small>Signals</small>

                    <div class="adaptive-diagnostic-row__signals">

                        ${this.createInlineBadges(previewQuestion.negativeSimulation.signals)}

                    </div>

                </div>

                <div class="adaptive-follow-up-diagnostic__card adaptive-follow-up-diagnostic__card--ok">

                    <small>Simulated answer: ok</small>

                    <strong>Skip route</strong>

                    <p>Skips likely defect-detail questions after a positive answer.</p>

                    <small>Skipped questions</small>

                    <div class="adaptive-diagnostic-row__signals">

                        ${this.createInlineBadges(previewQuestion.positiveSimulation.skippedQuestionIds)}

                    </div>

                    <small>Signals</small>

                    <div class="adaptive-diagnostic-row__signals">

                        ${this.createInlineBadges(previewQuestion.positiveSimulation.signals)}

                    </div>

                </div>

            </div>

        `;

        return row;

    }

    static createAdaptiveFollowUpDiagnostic() {

        const section = document.createElement("section");

        section.className = "workflow-card adaptive-follow-up-diagnostic";

        const profile = {
            country: "Thailand",
            buildingType: "Condominium",
            useType: "Residential",
            ageBand: "Existing",
            climateZone: "Tropical",
            locationContext: "Coastal",
            legalContext: "Ownership",
            inspectionPurpose: "Acquisition"
        };

        const catalogItems = QuestionCatalogManager.getAll();

        const startQuestionSet = AdaptiveInspectionProfileEngine.createStartQuestionSet(
            profile,
            catalogItems,
            { limit: 25 }
        );

        const mainQuestion = startQuestionSet.questions[0];

        section.innerHTML = `

            <div class="settings-cleanup__header">

                <div>

                    <p class="eyebrow">Adaptive Follow-up Diagnostic</p>

                    <h3>Simulated answer routing</h3>

                    <p>Diagnostic simulation only. No answers, evidence, findings, assessments or reports are created.</p>

                </div>

                <span class="tag">Follow-up Engine</span>

            </div>

        `;

        if (!mainQuestion) {

            const empty = document.createElement("p");

            empty.textContent = "No start question is available for follow-up simulation.";

            section.appendChild(empty);

            return section;

        }

        const candidateFollowUps = catalogItems.filter(question => {
            return question.questionId !== mainQuestion.questionId &&
                (
                    question.buildingSystem === mainQuestion.buildingSystem ||
                    question.inspectionArea === mainQuestion.inspectionArea ||
                    question.component === mainQuestion.component ||
                    question.chapterNumber === mainQuestion.chapterNumber
                );
        });

        const negativeResult = AdaptiveFollowUpQuestionEngine.evaluateAnswer({
            ...mainQuestion,
            answerValue: "finding",
            profile,
            candidateFollowUps
        });

        const positiveResult = AdaptiveFollowUpQuestionEngine.evaluateAnswer({
            ...mainQuestion,
            answerValue: "ok",
            profile,
            candidateFollowUps
        });

        const diagnostic = document.createElement("div");

        diagnostic.className = "adaptive-follow-up-diagnostic__grid";

        diagnostic.innerHTML = `

            <article class="adaptive-follow-up-diagnostic__card">

                <span class="adaptive-diagnostic-row__eyebrow">Main question</span>

                <strong>${this.escapeHtml(mainQuestion.questionId)}</strong>

                <p>${this.escapeHtml(mainQuestion.questionText)}</p>

                <div class="adaptive-diagnostic-row__meta">

                    <span>${this.escapeHtml(mainQuestion.chapterNumber)}</span>

                    <span>${this.escapeHtml(mainQuestion.chapterTitle)}</span>

                    <span>${this.escapeHtml(mainQuestion.sectionTitle)}</span>

                    <span>${this.escapeHtml(mainQuestion.buildingSystem || "n/a")}</span>

                </div>

                <small>Candidate follow-ups: ${this.escapeHtml(candidateFollowUps.length)}</small>

            </article>

            <article class="adaptive-follow-up-diagnostic__card adaptive-follow-up-diagnostic__card--finding">

                <span class="adaptive-diagnostic-row__eyebrow">Simulated answer</span>

                <strong>finding</strong>

                <p>Activates the most relevant follow-up questions and increases evidence requirements.</p>

                <small>Activated follow-ups</small>

                <div class="adaptive-diagnostic-row__signals">

                    ${this.createInlineBadges(negativeResult.followUpQuestionIds)}

                </div>

                <small>Evidence requirements</small>

                <div class="adaptive-diagnostic-row__signals">

                    ${this.createInlineBadges(negativeResult.evidenceRequirements)}

                </div>

                <small>Signals</small>

                <div class="adaptive-diagnostic-row__signals">

                    ${this.createInlineBadges(negativeResult.signals)}

                </div>

            </article>

            <article class="adaptive-follow-up-diagnostic__card adaptive-follow-up-diagnostic__card--ok">

                <span class="adaptive-diagnostic-row__eyebrow">Simulated answer</span>

                <strong>ok</strong>

                <p>Skips likely defect-detail questions that are not needed after a positive answer.</p>

                <small>Skipped questions</small>

                <div class="adaptive-diagnostic-row__signals">

                    ${this.createInlineBadges(positiveResult.skippedQuestionIds)}

                </div>

                <small>Signals</small>

                <div class="adaptive-diagnostic-row__signals">

                    ${this.createInlineBadges(positiveResult.signals)}

                </div>

            </article>

        `;

        section.appendChild(diagnostic);

        return section;

    }

    static createInlineBadges(items = []) {

        if (!items.length) {

            return `<span>None</span>`;

        }

        return items
            .map(item => `<span>${this.escapeHtml(item)}</span>`)
            .join("");

    }

    static createAdaptiveQuestionRow(question) {

        const row = document.createElement("article");

        row.className = "task-row question-catalog-row adaptive-diagnostic-row";

        const penaltyReasons = (question.adaptiveReasons || [])
            .filter(reason => this.normalize(reason).includes("penalty"));

        const primaryReasons = (question.adaptiveReasons || [])
            .filter(reason => !this.normalize(reason).includes("penalty"))
            .slice(0, 2);

        const signalBadges = (question.adaptiveSignals || [])
            .slice(0, 7)
            .map(signal => `<span>${this.escapeHtml(signal)}</span>`)
            .join("");

        const reasonItems = primaryReasons
            .map(reason => `<li>${this.escapeHtml(reason)}</li>`)
            .join("");

        const penaltyItems = penaltyReasons
            .map(reason => `<li>${this.escapeHtml(reason)}</li>`)
            .join("");

        row.innerHTML = `

            <div class="adaptive-diagnostic-row__content">

                <div class="adaptive-diagnostic-row__header">

                    <div>

                        <span class="adaptive-diagnostic-row__eyebrow">Adaptive question</span>

                        <strong>${this.escapeHtml(question.questionId)}</strong>

                        <p>${this.escapeHtml(question.questionText)}</p>

                    </div>

                    <span class="adaptive-diagnostic-row__score">Score ${this.escapeHtml(question.adaptiveScore)}</span>

                </div>

                <div class="adaptive-diagnostic-row__meta">

                    <span>${this.escapeHtml(question.chapterNumber)}</span>

                    <span>${this.escapeHtml(question.chapterTitle)}</span>

                    <span>${this.escapeHtml(question.sectionTitle)}</span>

                </div>

                <div class="adaptive-diagnostic-row__signals" aria-label="Adaptive signals">

                    ${signalBadges || `<span>No signals</span>`}

                </div>

                <div class="adaptive-diagnostic-row__reason-grid">

                    ${reasonItems ? `<div class="adaptive-diagnostic-row__reason-box"><small>Reasons</small><ul>${reasonItems}</ul></div>` : ""}

                    ${penaltyItems ? `<div class="adaptive-diagnostic-row__reason-box adaptive-diagnostic-row__reason-box--penalty"><small>Country / context adjustment</small><ul>${penaltyItems}</ul></div>` : ""}

                </div>

            </div>

        `;

        return row;

    }

    static createCatalogContent() {

        const section = document.createElement("section");

        section.className = "workflow-card";

        const questions = this.getVisibleQuestions();

        section.innerHTML = `

            <div class="settings-cleanup__header">

                <div>

                    <p class="eyebrow">Visible Questions</p>

                    <h3>${questions.length} catalog entries</h3>

                    <p>This view does not create evidence, findings, assessments or workflow records.</p>

                </div>

            </div>

        `;

        if (!questions.length) {

            const empty = document.createElement("p");

            empty.textContent = "No catalog questions match the current filter.";

            section.appendChild(empty);

            return section;

        }

        const list = document.createElement("div");

        list.className = "question-catalog-list";

        questions.forEach(question => {

            list.appendChild(this.createQuestionRow(question));

        });

        section.appendChild(list);

        return section;

    }

    static createQuestionRow(question) {

        const row = document.createElement("article");

        row.className = "task-row question-catalog-row adaptive-diagnostic-row";

        const flags = [

            question.evidenceRelevant ? "Evidence" : "",

            question.findingRelevant ? "Finding" : "",

            question.assessmentRelevant ? "Assessment" : "",

            question.capexRelevant ? "CAPEX" : "",

            question.uploadRelevant ? "Upload" : ""

        ].filter(Boolean);

        row.innerHTML = `

            <div>

                <strong>${this.escapeHtml(question.questionId)}</strong>

                <p>${this.escapeHtml(question.questionText)}</p>

                <small>

                    ${this.escapeHtml(question.chapterNumber)} ·

                    ${this.escapeHtml(question.chapterTitle)} ·

                    ${this.escapeHtml(question.sectionTitle)} ·

                    ${this.escapeHtml(question.buildingSystem || "n/a")} ·

                    ${this.escapeHtml(question.inspectionArea || "n/a")} ·

                    ${this.escapeHtml(question.answerType || "n/a")}

                </small>

            </div>

            <span class="tag">${this.escapeHtml(flags.join(" / ") || "Read-only")}</span>

        `;

        return row;

    }

    static ensureSelectedChapter() {
        const chapters = QuestionCatalogManager.getChapters();

        if (!chapters.length) {
            return;
        }

        const currentExists = chapters.some(chapter => {
            return chapter.chapterNumber === this.selectedChapter;
        });

        if (!currentExists) {
            this.selectedChapter = chapters[0].chapterNumber;
        }
    }

    static getVisibleQuestions() {

        const search = this.normalize(this.searchTerm);

        if (search) {

            return QuestionCatalogManager.search(search);

        }

        return QuestionCatalogManager.getByChapter(this.selectedChapter);

    }

    static async loadCatalog() {

        if (this.isLoading || QuestionCatalogManager.count()) {

            return;

        }

        this.isLoading = true;

        this.loadError = null;

        try {

            await QuestionCatalogManager.load();

        } catch (error) {

            this.loadError = error.message;

        } finally {

            this.isLoading = false;

            this.renderIntoWorkspace();

        }

    }

    static async reloadCatalog() {

        QuestionCatalogManager.clear();

        this.loadError = null;

        await this.loadCatalog();

    }

    static renderIntoWorkspace() {

        const container = document.getElementById("workspace-page");

        if (!container) {

            return;

        }

        container.innerHTML = "";

        container.appendChild(this.render());

    }

    static normalize(value = "") {

        return String(value || "").trim().toLowerCase();

    }

    static escapeHtml(value = "") {

        return String(value ?? "")

            .replaceAll("&", "&amp;")

            .replaceAll("<", "&lt;")

            .replaceAll(">", "&gt;")

            .replaceAll('"', "&quot;")

            .replaceAll("'", "&#039;");

    }

}

