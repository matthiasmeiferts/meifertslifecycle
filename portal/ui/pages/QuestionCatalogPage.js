
import QuestionCatalogManager from "../../core/QuestionCatalogManager.js";

import AdaptiveInspectionProfileEngine from "../../core/AdaptiveInspectionProfileEngine.js";

import AdaptiveFollowUpQuestionEngine from "../../core/AdaptiveFollowUpQuestionEngine.js";

import AdaptiveInspectionPreviewBridge from "../../core/AdaptiveInspectionPreviewBridge.js";
import AdaptiveScopeDraftEngine from "../../core/AdaptiveScopeDraftEngine.js";
import AdaptiveInspectionSessionSandbox from "../../core/AdaptiveInspectionSessionSandbox.js";
import InspectionHumanWorkLayer from "../../core/InspectionHumanWorkLayer.js";
import AnswerInteractionSandbox from "../../core/AnswerInteractionSandbox.js";
import SandboxAnswerStateEngine from "../../core/SandboxAnswerStateEngine.js";
import EvidenceRequirementPreviewEngine from "../../core/EvidenceRequirementPreviewEngine.js";
import EvidenceCaptureDraftSandbox from "../../core/EvidenceCaptureDraftSandbox.js";
import FindingDraftPreviewSandbox from "../../core/FindingDraftPreviewSandbox.js";
import AssessmentDraftPreviewSandbox from "../../core/AssessmentDraftPreviewSandbox.js";
import RecommendationDraftPreviewSandbox from "../../core/RecommendationDraftPreviewSandbox.js";
import DecisionDraftPreviewSandbox from "../../core/DecisionDraftPreviewSandbox.js";
import ReportDraftPreviewSandbox from "../../core/ReportDraftPreviewSandbox.js";
import DraftWorkspaceManager from "../../core/DraftWorkspaceManager.js";

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

    static createAnswerInteractionSandboxPreview(interaction = {}, answerState = {}) {

        if (
            interaction.interactionMode === "answer_sandbox_rejected"
            || answerState.stateMode === "sandbox_answer_state_rejected"
        ) {
            return `

                <span>Sandbox interaction rejected</span>

                <p>${this.escapeHtml(interaction.reason || answerState.reason || "Unknown answer option.")}</p>

            `;
        }

        const progress = answerState.progress || interaction.progressPreview || {};
        const currentQuestion = answerState.currentQuestion || {};
        const selectedAnswer = answerState.lastInteraction?.selectedAnswer || interaction.selectedAnswer || {};
        const nextStep = currentQuestion.questionId
            ? `Next question prepared: ${currentQuestion.questionId}`
            : interaction.guidance?.nextStep || "Preview only";

        return `

            <span>Sandbox interaction preview</span>

            <div class="inspection-human-work-layer__interaction-grid">

                <div>
                    <small>Selected answer</small>
                    <strong>${this.escapeHtml(selectedAnswer.label || "n/a")}</strong>
                </div>

                <div>
                    <small>Progress preview</small>
                    <strong>${this.escapeHtml(progress.completionRate || 0)}%</strong>
                </div>

                <div>
                    <small>Next step</small>
                    <strong>${this.escapeHtml(nextStep)}</strong>
                </div>

            </div>

            <p>${this.escapeHtml(interaction.guidance?.evidenceHint || "Sandbox state moved to the next question. No action created.")}</p>

            <small>
                answerPersisted: ${this.escapeHtml(String(answerState.safetyBoundary?.answerPersisted ?? interaction.safetyBoundary?.answerPersisted))}
                · evidenceCreated: ${this.escapeHtml(String(answerState.safetyBoundary?.evidenceCreated ?? interaction.safetyBoundary?.evidenceCreated))}
                · findingCreated: ${this.escapeHtml(String(answerState.safetyBoundary?.findingCreated ?? interaction.safetyBoundary?.findingCreated))}
            </small>

        `;

    }

    static createEvidenceRequirementPreviewCard(evidencePreview = {}) {

        if (!evidencePreview || evidencePreview.previewMode !== "evidence_requirement_preview_read_only") {
            return `

                <span>Evidence requirement</span>

                <p>No evidence preview available yet.</p>

            `;
        }

        const requiredInputs = Array.isArray(evidencePreview.requiredInputs)
            ? evidencePreview.requiredInputs
            : [];

        if (!evidencePreview.evidenceRequired) {
            return `

                <span>Evidence requirement</span>

                <div class="evidence-requirement-preview__empty">
                    <strong>${this.escapeHtml(evidencePreview.guidance?.title || "No evidence required")}</strong>
                    <p>${this.escapeHtml(evidencePreview.guidance?.primary || "Continue to the next question.")}</p>
                </div>

                <small>
                    evidencePersisted: ${this.escapeHtml(String(evidencePreview.safetyBoundary?.evidencePersisted))}
                    · evidenceCreated: ${this.escapeHtml(String(evidencePreview.safetyBoundary?.evidenceCreated))}
                    · findingCreated: ${this.escapeHtml(String(evidencePreview.safetyBoundary?.findingCreated))}
                </small>

            `;
        }

        return `

            <span>Evidence requirement preview</span>

            <div class="evidence-requirement-preview__header">
                <div>
                    <small>Triggered by</small>
                    <strong>${this.escapeHtml(evidencePreview.answerLabel || "Auffällig")}</strong>
                </div>
                <div>
                    <small>Question</small>
                    <strong>${this.escapeHtml(evidencePreview.question?.questionId || "n/a")}</strong>
                </div>
                <div>
                    <small>Next step</small>
                    <strong>${this.escapeHtml(evidencePreview.nextStep || "Prepare evidence capture")}</strong>
                </div>
            </div>

            <p>${this.escapeHtml(evidencePreview.guidance?.detail || "Sandbox-only evidence capture preview.")}</p>

            <div class="evidence-requirement-preview__inputs">
                ${requiredInputs.map(input => `
                    <div class="evidence-requirement-preview__input">
                        <small>${this.escapeHtml(input.required ? "Required" : "Optional")}</small>
                        <strong>${this.escapeHtml(input.label)}</strong>
                        <p>${this.escapeHtml(input.description)}</p>
                    </div>
                `).join("")}
            </div>

            <small>
                evidencePersisted: ${this.escapeHtml(String(evidencePreview.safetyBoundary?.evidencePersisted))}
                · evidenceCreated: ${this.escapeHtml(String(evidencePreview.safetyBoundary?.evidenceCreated))}
                · findingCreated: ${this.escapeHtml(String(evidencePreview.safetyBoundary?.findingCreated))}
            </small>

        `;

    }

    static createEvidenceCaptureDraftCard(captureDraft = {}) {

        if (!captureDraft || captureDraft.draftMode !== "evidence_capture_draft_sandbox_read_only") {
            return `

                <span>Evidence capture draft</span>

                <p>No capture draft available yet.</p>

            `;
        }

        const fields = Array.isArray(captureDraft.fields)
            ? captureDraft.fields
            : [];

        if (!captureDraft.evidenceRequired) {
            return `

                <span>Evidence capture draft</span>

                <div class="evidence-capture-draft__empty">
                    <strong>${this.escapeHtml(captureDraft.captureGuidance?.title || "No capture draft required")}</strong>
                    <p>${this.escapeHtml(captureDraft.captureGuidance?.primary || "Continue inspection flow.")}</p>
                </div>

                <small>
                    captureDraftPersisted: ${this.escapeHtml(String(captureDraft.safetyBoundary?.captureDraftPersisted))}
                    · evidenceCreated: ${this.escapeHtml(String(captureDraft.safetyBoundary?.evidenceCreated))}
                    · findingCreated: ${this.escapeHtml(String(captureDraft.safetyBoundary?.findingCreated))}
                </small>

            `;
        }

        return `

            <span>Evidence capture draft sandbox</span>

            <div class="evidence-capture-draft__summary">
                <div>
                    <small>Completion</small>
                    <strong>${this.escapeHtml(captureDraft.completion?.completionRate || 0)}%</strong>
                </div>
                <div>
                    <small>Required fields</small>
                    <strong>${this.escapeHtml(captureDraft.completion?.filledRequiredFields || 0)} / ${this.escapeHtml(captureDraft.completion?.requiredFields || 0)}</strong>
                </div>
                <div>
                    <small>Ready for review</small>
                    <strong>${this.escapeHtml(captureDraft.completion?.readyForReview ? "Yes" : "No")}</strong>
                </div>
            </div>

            <p>${this.escapeHtml(captureDraft.captureGuidance?.detail || "Sandbox capture draft only.")}</p>

            <div class="evidence-capture-draft__fields">
                ${fields.map(field => `
                    <label class="evidence-capture-draft__field">
                        <small>${this.escapeHtml(field.required ? "Required" : "Optional")}</small>
                        <strong>${this.escapeHtml(field.label)}</strong>
                        <span>${this.escapeHtml(field.description)}</span>
                        <input
                            type="text"
                            data-capture-draft-field="${this.escapeHtml(field.type)}"
                            value="${this.escapeHtml(field.value || "")}"
                            placeholder="${this.escapeHtml(field.placeholder || "Draft value · not saved")}"
                        />
                    </label>
                `).join("")}
            </div>

            <button type="button" class="evidence-capture-draft__demo-fill" data-capture-draft-demo-fill>
                Fill sandbox draft
            </button>

            <small>
                captureDraftPersisted: ${this.escapeHtml(String(captureDraft.safetyBoundary?.captureDraftPersisted))}
                · evidencePersisted: ${this.escapeHtml(String(captureDraft.safetyBoundary?.evidencePersisted))}
                · evidenceCreated: ${this.escapeHtml(String(captureDraft.safetyBoundary?.evidenceCreated))}
                · findingCreated: ${this.escapeHtml(String(captureDraft.safetyBoundary?.findingCreated))}
            </small>

        `;

    }

    static createFindingDraftPreviewCard(findingDraft = {}) {

        if (!findingDraft || findingDraft.draftMode !== "finding_draft_preview_sandbox_read_only") {
            return `

                <span>Finding draft preview</span>

                <p>No finding draft available yet.</p>

            `;
        }

        if (!findingDraft.findingPrepared) {
            return `

                <span>Finding draft preview</span>

                <div class="finding-draft-preview__empty">
                    <strong>${this.escapeHtml(findingDraft.guidance?.title || "Finding draft not ready")}</strong>
                    <p>${this.escapeHtml(findingDraft.guidance?.primary || "Complete capture draft first.")}</p>
                </div>

                <small>
                    findingDraftPersisted: ${this.escapeHtml(String(findingDraft.safetyBoundary?.findingDraftPersisted))}
                    · findingCreated: ${this.escapeHtml(String(findingDraft.safetyBoundary?.findingCreated))}
                    · assessmentCreated: ${this.escapeHtml(String(findingDraft.safetyBoundary?.assessmentCreated))}
                </small>

            `;
        }

        return `

            <span>Finding draft preview sandbox</span>

            <div class="finding-draft-preview__summary">
                <div>
                    <small>Issue title</small>
                    <strong>${this.escapeHtml(findingDraft.finding?.title || "n/a")}</strong>
                </div>
                <div>
                    <small>Severity preview</small>
                    <strong>${this.escapeHtml(findingDraft.severityPreview?.level || "n/a")}</strong>
                </div>
                <div>
                    <small>Source question</small>
                    <strong>${this.escapeHtml(findingDraft.finding?.sourceQuestionId || findingDraft.question?.questionId || "n/a")}</strong>
                </div>
            </div>

            <div class="finding-draft-preview__wording">
                <small>Expert wording</small>
                <p>${this.escapeHtml(findingDraft.finding?.expertWording || "No wording prepared.")}</p>
            </div>

            <div class="finding-draft-preview__references">
                <small>Evidence references</small>
                <div>
                    ${(findingDraft.finding?.evidenceReferences || []).map(reference => `
                        <span>${this.escapeHtml(reference)}</span>
                    `).join("")}
                </div>
            </div>

            <p>${this.escapeHtml(findingDraft.guidance?.detail || "Sandbox-only finding draft preview.")}</p>

            <small>
                findingDraftPersisted: ${this.escapeHtml(String(findingDraft.safetyBoundary?.findingDraftPersisted))}
                · findingCreated: ${this.escapeHtml(String(findingDraft.safetyBoundary?.findingCreated))}
                · assessmentCreated: ${this.escapeHtml(String(findingDraft.safetyBoundary?.assessmentCreated))}
                · reportCreated: ${this.escapeHtml(String(findingDraft.safetyBoundary?.reportCreated))}
            </small>

        `;

    }

    static createAssessmentDraftPreviewCard(assessmentDraft = {}) {

        if (!assessmentDraft || assessmentDraft.draftMode !== "assessment_draft_preview_sandbox_read_only") {
            return `

                <span>Assessment draft preview</span>

                <p>No assessment draft available yet.</p>

            `;
        }

        if (!assessmentDraft.assessmentPrepared) {
            return `

                <span>Assessment draft preview</span>

                <div class="assessment-draft-preview__empty">
                    <strong>${this.escapeHtml(assessmentDraft.guidance?.title || "Assessment draft not ready")}</strong>
                    <p>${this.escapeHtml(assessmentDraft.guidance?.primary || "Prepare finding draft first.")}</p>
                </div>

                <small>
                    assessmentDraftPersisted: ${this.escapeHtml(String(assessmentDraft.safetyBoundary?.assessmentDraftPersisted))}
                    · assessmentCreated: ${this.escapeHtml(String(assessmentDraft.safetyBoundary?.assessmentCreated))}
                    · recommendationCreated: ${this.escapeHtml(String(assessmentDraft.safetyBoundary?.recommendationCreated))}
                </small>

            `;
        }

        return `

            <span>Assessment draft preview sandbox</span>

            <div class="assessment-draft-preview__summary">
                <div>
                    <small>Risk level</small>
                    <strong>${this.escapeHtml(assessmentDraft.riskPreview?.level || "n/a")}</strong>
                </div>
                <div>
                    <small>Confidence</small>
                    <strong>${this.escapeHtml(assessmentDraft.riskPreview?.confidence || "preview")}</strong>
                </div>
                <div>
                    <small>Source finding</small>
                    <strong>${this.escapeHtml(assessmentDraft.finding?.sourceQuestionId || assessmentDraft.question?.questionId || "n/a")}</strong>
                </div>
            </div>

            <div class="assessment-draft-preview__implication">
                <small>Technical implication</small>
                <p>${this.escapeHtml(assessmentDraft.assessment?.technicalImplication || "No implication prepared.")}</p>
            </div>

            <div class="assessment-draft-preview__review">
                <small>Recommended review</small>
                <p>${this.escapeHtml(assessmentDraft.assessment?.recommendedReview || "No review path prepared.")}</p>
            </div>

            <p>${this.escapeHtml(assessmentDraft.guidance?.detail || "Sandbox-only assessment preview.")}</p>

            <small>
                assessmentDraftPersisted: ${this.escapeHtml(String(assessmentDraft.safetyBoundary?.assessmentDraftPersisted))}
                · assessmentCreated: ${this.escapeHtml(String(assessmentDraft.safetyBoundary?.assessmentCreated))}
                · recommendationCreated: ${this.escapeHtml(String(assessmentDraft.safetyBoundary?.recommendationCreated))}
                · decisionCreated: ${this.escapeHtml(String(assessmentDraft.safetyBoundary?.decisionCreated))}
                · reportCreated: ${this.escapeHtml(String(assessmentDraft.safetyBoundary?.reportCreated))}
            </small>

        `;

    }

    static renderAssessmentDraftPreview(section, findingDraft = {}) {

        const assessmentDraftNode = section.querySelector("[data-assessment-draft-preview]");

        if (!assessmentDraftNode) {
            return;
        }

        const assessmentDraft = AssessmentDraftPreviewSandbox.createDraft(findingDraft);

        assessmentDraftNode.innerHTML = this.createAssessmentDraftPreviewCard(assessmentDraft);
        assessmentDraftNode.classList.toggle("has-assessment-draft", Boolean(assessmentDraft.assessmentPrepared));

        this.renderRecommendationDraftPreview(section, assessmentDraft);

        if (assessmentDraft.assessmentPrepared) {
            window.setTimeout(() => {
                assessmentDraftNode.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }, 140);
        }

    }

    static createRecommendationDraftPreviewCard(recommendationDraft = {}) {

        if (!recommendationDraft || recommendationDraft.draftMode !== "recommendation_draft_preview_sandbox_read_only") {
            return `

                <span>Recommendation draft preview</span>

                <p>No recommendation draft available yet.</p>

            `;
        }

        if (!recommendationDraft.recommendationPrepared) {
            return `

                <span>Recommendation draft preview</span>

                <div class="recommendation-draft-preview__empty">
                    <strong>${this.escapeHtml(recommendationDraft.guidance?.title || "Recommendation draft not ready")}</strong>
                    <p>${this.escapeHtml(recommendationDraft.guidance?.primary || "Prepare assessment draft first.")}</p>
                </div>

                <small>
                    recommendationDraftPersisted: ${this.escapeHtml(String(recommendationDraft.safetyBoundary?.recommendationDraftPersisted))}
                    · recommendationCreated: ${this.escapeHtml(String(recommendationDraft.safetyBoundary?.recommendationCreated))}
                    · decisionCreated: ${this.escapeHtml(String(recommendationDraft.safetyBoundary?.decisionCreated))}
                </small>

            `;
        }

        return `

            <span>Recommendation draft preview sandbox</span>

            <div class="recommendation-draft-preview__summary">
                <div>
                    <small>Tone</small>
                    <strong>${this.escapeHtml(recommendationDraft.recommendationTone || "n/a")}</strong>
                </div>
                <div>
                    <small>Linked risk</small>
                    <strong>${this.escapeHtml(recommendationDraft.recommendation?.linkedRiskLevel || recommendationDraft.assessment?.riskLevel || "n/a")}</strong>
                </div>
                <div>
                    <small>Source question</small>
                    <strong>${this.escapeHtml(recommendationDraft.question?.questionId || "n/a")}</strong>
                </div>
            </div>

            <div class="recommendation-draft-preview__recommendation">
                <small>Expert recommendation</small>
                <p>${this.escapeHtml(recommendationDraft.recommendation?.expertRecommendation || "No recommendation prepared.")}</p>
            </div>

            <div class="recommendation-draft-preview__next-action">
                <small>Next action</small>
                <p>${this.escapeHtml(recommendationDraft.recommendation?.nextAction || "No next action prepared.")}</p>
            </div>

            <div class="recommendation-draft-preview__decision-support">
                <small>Decision impact</small>
                <p>${this.escapeHtml(recommendationDraft.decisionSupport?.decisionImpact || "No decision support prepared.")}</p>
            </div>

            <p>${this.escapeHtml(recommendationDraft.guidance?.detail || "Sandbox-only recommendation preview.")}</p>

            <small>
                recommendationDraftPersisted: ${this.escapeHtml(String(recommendationDraft.safetyBoundary?.recommendationDraftPersisted))}
                · recommendationCreated: ${this.escapeHtml(String(recommendationDraft.safetyBoundary?.recommendationCreated))}
                · decisionCreated: ${this.escapeHtml(String(recommendationDraft.safetyBoundary?.decisionCreated))}
                · reportCreated: ${this.escapeHtml(String(recommendationDraft.safetyBoundary?.reportCreated))}
            </small>

        `;

    }

    static renderRecommendationDraftPreview(section, assessmentDraft = {}) {

        const recommendationDraftNode = section.querySelector("[data-recommendation-draft-preview]");

        if (!recommendationDraftNode) {
            return;
        }

        const recommendationDraft = RecommendationDraftPreviewSandbox.createDraft(assessmentDraft);

        recommendationDraftNode.innerHTML = this.createRecommendationDraftPreviewCard(recommendationDraft);
        recommendationDraftNode.classList.toggle("has-recommendation-draft", Boolean(recommendationDraft.recommendationPrepared));

        this.renderDecisionDraftPreview(section, recommendationDraft);

        if (recommendationDraft.recommendationPrepared) {
            window.setTimeout(() => {
                recommendationDraftNode.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }, 160);
        }

    }

    static createDecisionDraftPreviewCard(decisionDraft = {}) {

        if (!decisionDraft || decisionDraft.draftMode !== "decision_draft_preview_sandbox_read_only") {
            return `

                <span>Decision draft preview</span>

                <p>No decision draft available yet.</p>

            `;
        }

        if (!decisionDraft.decisionPrepared) {
            return `

                <span>Decision draft preview</span>

                <div class="decision-draft-preview__empty">
                    <strong>${this.escapeHtml(decisionDraft.guidance?.title || "Decision draft not ready")}</strong>
                    <p>${this.escapeHtml(decisionDraft.guidance?.primary || "Prepare recommendation draft first.")}</p>
                </div>

                <small>
                    decisionDraftPersisted: ${this.escapeHtml(String(decisionDraft.safetyBoundary?.decisionDraftPersisted))}
                    · decisionCreated: ${this.escapeHtml(String(decisionDraft.safetyBoundary?.decisionCreated))}
                    · reportCreated: ${this.escapeHtml(String(decisionDraft.safetyBoundary?.reportCreated))}
                </small>

            `;
        }

        return `

            <span>Decision draft preview sandbox</span>

            <div class="decision-draft-preview__summary">
                <div>
                    <small>Route</small>
                    <strong>${this.escapeHtml(decisionDraft.decisionRoute || "n/a")}</strong>
                </div>
                <div>
                    <small>Linked risk</small>
                    <strong>${this.escapeHtml(decisionDraft.recommendation?.linkedRiskLevel || "n/a")}</strong>
                </div>
                <div>
                    <small>Source question</small>
                    <strong>${this.escapeHtml(decisionDraft.question?.questionId || "n/a")}</strong>
                </div>
            </div>

            <div class="decision-draft-preview__decision">
                <small>Proposed decision</small>
                <p>${this.escapeHtml(decisionDraft.decision?.proposedDecision || "No decision prepared.")}</p>
            </div>

            <div class="decision-draft-preview__condition">
                <small>Required condition</small>
                <p>${this.escapeHtml(decisionDraft.decision?.requiredCondition || "No condition prepared.")}</p>
            </div>

            <div class="decision-draft-preview__governance">
                <small>Governance impact</small>
                <p>${this.escapeHtml(decisionDraft.governanceImpact?.decisionImpact || "No governance impact prepared.")}</p>
            </div>

            <p>${this.escapeHtml(decisionDraft.guidance?.detail || "Sandbox-only decision preview.")}</p>

            <small>
                decisionDraftPersisted: ${this.escapeHtml(String(decisionDraft.safetyBoundary?.decisionDraftPersisted))}
                · decisionCreated: ${this.escapeHtml(String(decisionDraft.safetyBoundary?.decisionCreated))}
                · reportCreated: ${this.escapeHtml(String(decisionDraft.safetyBoundary?.reportCreated))}
                · workflowCreated: ${this.escapeHtml(String(decisionDraft.safetyBoundary?.workflowCreated))}
            </small>

        `;

    }

    static renderDecisionDraftPreview(section, recommendationDraft = {}) {

        const decisionDraftNode = section.querySelector("[data-decision-draft-preview]");

        if (!decisionDraftNode) {
            return;
        }

        const decisionDraft = DecisionDraftPreviewSandbox.createDraft(recommendationDraft);

        decisionDraftNode.innerHTML = this.createDecisionDraftPreviewCard(decisionDraft);
        decisionDraftNode.classList.toggle("has-decision-draft", Boolean(decisionDraft.decisionPrepared));

        this.renderReportDraftPreview(section, decisionDraft);

        if (decisionDraft.decisionPrepared) {
            window.setTimeout(() => {
                decisionDraftNode.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }, 180);
        }

    }

    static createReportDraftPreviewCard(reportDraft = {}) {

        if (!reportDraft || reportDraft.draftMode !== "report_draft_preview_sandbox_read_only") {
            return `

                <span>Report draft preview</span>

                <p>No report draft available yet.</p>

            `;
        }

        if (!reportDraft.reportPrepared) {
            return `

                <span>Report draft preview</span>

                <div class="report-draft-preview__empty">
                    <strong>${this.escapeHtml(reportDraft.guidance?.title || "Report draft not ready")}</strong>
                    <p>${this.escapeHtml(reportDraft.guidance?.primary || "Prepare decision draft first.")}</p>
                </div>

                <small>
                    reportDraftPersisted: ${this.escapeHtml(String(reportDraft.safetyBoundary?.reportDraftPersisted))}
                    · reportCreated: ${this.escapeHtml(String(reportDraft.safetyBoundary?.reportCreated))}
                    · reportExported: ${this.escapeHtml(String(reportDraft.safetyBoundary?.reportExported))}
                </small>

            `;
        }

        return `

            <span>Report draft preview sandbox</span>

            <div class="report-draft-preview__summary">
                <div>
                    <small>Section</small>
                    <strong>${this.escapeHtml(reportDraft.reportSection || "n/a")}</strong>
                </div>
                <div>
                    <small>Decision route</small>
                    <strong>${this.escapeHtml(reportDraft.decision?.route || "n/a")}</strong>
                </div>
                <div>
                    <small>Source question</small>
                    <strong>${this.escapeHtml(reportDraft.question?.questionId || "n/a")}</strong>
                </div>
            </div>

            <div class="report-draft-preview__executive-summary">
                <small>Executive summary</small>
                <p>${this.escapeHtml(reportDraft.report?.executiveSummary || "No executive summary prepared.")}</p>
            </div>

            <div class="report-draft-preview__technical-narrative">
                <small>Technical narrative</small>
                <p>${this.escapeHtml(reportDraft.report?.technicalNarrative || "No technical narrative prepared.")}</p>
            </div>

            <div class="report-draft-preview__decision-note">
                <small>Decision note</small>
                <p>${this.escapeHtml(reportDraft.report?.decisionNote || "No decision note prepared.")}</p>
            </div>

            <div class="report-draft-preview__actions">
                <button class="button secondary" type="button" data-save-report-draft>
                    Save as workspace draft
                </button>
            </div>

            <div class="workspace-draft-preview" data-workspace-draft-preview>
                <span>Workspace draft</span>
                <p>No workspace draft created yet.</p>
            </div>

            <p>${this.escapeHtml(reportDraft.guidance?.detail || "Sandbox-only report preview.")}</p>

            <small>
                reportDraftPersisted: ${this.escapeHtml(String(reportDraft.safetyBoundary?.reportDraftPersisted))}
                · reportCreated: ${this.escapeHtml(String(reportDraft.safetyBoundary?.reportCreated))}
                · reportExported: ${this.escapeHtml(String(reportDraft.safetyBoundary?.reportExported))}
                · clientDocumentCreated: ${this.escapeHtml(String(reportDraft.safetyBoundary?.clientDocumentCreated))}
                · workflowCreated: ${this.escapeHtml(String(reportDraft.safetyBoundary?.workflowCreated))}
            </small>

        `;

    }

    static renderReportDraftPreview(section, decisionDraft = {}) {

        const reportDraftNode = section.querySelector("[data-report-draft-preview]");

        if (!reportDraftNode) {
            return;
        }

        const reportDraft = ReportDraftPreviewSandbox.createDraft(decisionDraft);

        reportDraftNode.innerHTML = this.createReportDraftPreviewCard(reportDraft);
        reportDraftNode.classList.toggle("has-report-draft", Boolean(reportDraft.reportPrepared));

        this.bindReportDraftWorkspaceSave(reportDraftNode, reportDraft);

        if (reportDraft.reportPrepared) {
            window.setTimeout(() => {
                reportDraftNode.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }, 200);
        }

    }

    static bindReportDraftWorkspaceSave(reportDraftNode, reportDraft = {}) {

        const saveButton = reportDraftNode.querySelector("[data-save-report-draft]");
        const workspaceDraftNode = reportDraftNode.querySelector("[data-workspace-draft-preview]");

        if (!saveButton || !workspaceDraftNode || !reportDraft.reportPrepared) {
            return;
        }

        saveButton.addEventListener("click", () => {
            const createdAt = new Date().toISOString();

            const draftRecord = DraftWorkspaceManager.createDraftRecord(reportDraft, {
                createdAt
            });

            const registry = DraftWorkspaceManager.createRegistry({
                registryId: "browser-draft-registry-preview",
                createdAt
            });

            const savedRegistry = DraftWorkspaceManager.addDraft(registry, draftRecord, {
                updatedAt: createdAt
            });

            const activeDrafts = DraftWorkspaceManager.listDrafts(savedRegistry, {
                status: "draft"
            });

            workspaceDraftNode.innerHTML = `
                <span>Workspace draft created</span>

                <div class="workspace-draft-preview__summary">
                    <div>
                        <small>Draft ID</small>
                        <strong>${this.escapeHtml(draftRecord.draftId)}</strong>
                    </div>
                    <div>
                        <small>Draft type</small>
                        <strong>${this.escapeHtml(draftRecord.draftType)}</strong>
                    </div>
                    <div>
                        <small>Status</small>
                        <strong>${this.escapeHtml(draftRecord.status)}</strong>
                    </div>
                </div>

                <small>
                    canExport: ${this.escapeHtml(String(draftRecord.permissions.canExport))}
                    · canCreateClientDocument: ${this.escapeHtml(String(draftRecord.permissions.canCreateClientDocument))}
                    · canFinalizeWorkflow: ${this.escapeHtml(String(draftRecord.permissions.canFinalizeWorkflow))}
                    · expertApprovalGranted: ${this.escapeHtml(String(draftRecord.safetyBoundary.expertApprovalGranted))}
                </small>

                <div class="workspace-draft-registry-preview" data-workspace-draft-registry-preview>
                    <span>Draft registry preview</span>

                    <div class="workspace-draft-registry-preview__summary">
                        <div>
                            <small>Registry ID</small>
                            <strong>${this.escapeHtml(savedRegistry.registryId)}</strong>
                        </div>
                        <div>
                            <small>Draft count</small>
                            <strong>${this.escapeHtml(String(savedRegistry.drafts.length))}</strong>
                        </div>
                        <div>
                            <small>Active drafts</small>
                            <strong>${this.escapeHtml(String(activeDrafts.length))}</strong>
                        </div>
                    </div>

                    <small>
                        registryPersisted: ${this.escapeHtml(String(savedRegistry.safetyBoundary.registryPersisted))}
                        · reportExported: ${this.escapeHtml(String(savedRegistry.safetyBoundary.reportExported))}
                        · clientDocumentCreated: ${this.escapeHtml(String(savedRegistry.safetyBoundary.clientDocumentCreated))}
                        · workflowFinalized: ${this.escapeHtml(String(savedRegistry.safetyBoundary.workflowFinalized))}
                    </small>
                </div>

                <div class="expert-review-preview" data-expert-review-preview>
                    <span>Expert review required</span>

                    <div class="expert-review-preview__summary">
                        <div>
                            <small>Review ID</small>
                            <strong data-review-id>Pending</strong>
                        </div>
                        <div>
                            <small>Status</small>
                            <strong data-review-status>review_required</strong>
                        </div>
                        <div>
                            <small>Notes</small>
                            <strong data-review-notes>0</strong>
                        </div>
                    </div>

                    <div class="expert-review-preview__actions">
                        <button class="button secondary" type="button" data-add-review-note>Add review note</button>
                        <button class="button secondary" type="button" data-approve-review>Approve review</button>
                        <button class="button secondary" type="button" data-reject-review>Reject review</button>
                    </div>

                    <div class="expert-review-preview__note" data-review-note-preview>
                        <p>No review note added yet.</p>
                    </div>

                    <small data-review-safety>
                        canExport: false · canCreateClientDocument: false · canFinalizeWorkflow: false · expertApprovalGranted: false
                    </small>

                    <div class="finalization-gate-preview" data-finalization-gate-preview>
                        <span>Finalization gate</span>

                        <div class="finalization-gate-preview__summary">
                            <div>
                                <small>Gate ID</small>
                                <strong data-gate-id>Pending</strong>
                            </div>
                            <div>
                                <small>Status</small>
                                <strong data-gate-status>blocked_pending_expert_approval</strong>
                            </div>
                            <div>
                                <small>Expert review approved</small>
                                <strong data-gate-expert-approved>false</strong>
                            </div>
                        </div>

                        <small data-gate-safety>
                            canExport: false · canCreateClientDocument: false · canFinalizeWorkflow: false
                        </small>
                    </div>
                </div>
            `;

            const expertReviewNode = workspaceDraftNode.querySelector("[data-expert-review-preview]");
            const expertReview = DraftWorkspaceManager.createExpertReview(draftRecord, {
                reviewer: "Matthias Meiferts",
                createdAt
            });

            this.bindExpertReviewPreview(expertReviewNode, expertReview);

            if (expertReviewNode) {
                window.setTimeout(() => {
                    expertReviewNode.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });
                }, 120);
            }

            workspaceDraftNode.classList.add("has-workspace-draft");
            saveButton.disabled = true;
            saveButton.textContent = "Workspace draft prepared";
        });

    }

    static bindEvidenceCaptureDraftInteractions(section, captureDraft = {}) {

        const draftNode = section.querySelector("[data-evidence-capture-draft]");

        if (!draftNode || !captureDraft.evidenceRequired) {
            return;
        }

        const updateDraftFromFields = () => {
            const values = {};

            draftNode.querySelectorAll("[data-capture-draft-field]").forEach((field) => {
                values[field.getAttribute("data-capture-draft-field")] = field.value;
            });

            captureDraft = EvidenceCaptureDraftSandbox.updateDraft(captureDraft, values, {
                timestamp: new Date().toISOString()
            });

            draftNode.innerHTML = this.createEvidenceCaptureDraftCard(captureDraft);

            const findingDraftNode = section.querySelector("[data-finding-draft-preview]");
            const findingDraft = FindingDraftPreviewSandbox.createDraft(captureDraft);

            if (findingDraftNode) {
                findingDraftNode.innerHTML = this.createFindingDraftPreviewCard(findingDraft);
                findingDraftNode.classList.toggle("has-finding-draft", Boolean(findingDraft.findingPrepared));

                if (findingDraft.findingPrepared) {
                    window.setTimeout(() => {
                        findingDraftNode.scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        });
                    }, 120);
                }
            }

            this.renderAssessmentDraftPreview(section, findingDraft);

            this.bindEvidenceCaptureDraftInteractions(section, captureDraft);
        };

        draftNode.querySelectorAll("[data-capture-draft-field]").forEach((field) => {
            field.addEventListener("input", updateDraftFromFields);
        });

        const demoFillButton = draftNode.querySelector("[data-capture-draft-demo-fill]");

        if (demoFillButton) {
            demoFillButton.addEventListener("click", () => {
                const values = {};

                draftNode.querySelectorAll("[data-capture-draft-field]").forEach((field) => {
                    const type = field.getAttribute("data-capture-draft-field");

                    if (type === "photo") {
                        values[type] = "sandbox-photo-placeholder.jpg";
                    } else if (type === "comment") {
                        values[type] = "Sandbox expert comment draft.";
                    } else if (type === "moisture_indicator") {
                        values[type] = "Optional moisture note.";
                    } else {
                        values[type] = "Sandbox draft value.";
                    }
                });

                captureDraft = EvidenceCaptureDraftSandbox.updateDraft(captureDraft, values, {
                    timestamp: new Date().toISOString()
                });

                draftNode.innerHTML = this.createEvidenceCaptureDraftCard(captureDraft);

                const findingDraftNode = section.querySelector("[data-finding-draft-preview]");
                const findingDraft = FindingDraftPreviewSandbox.createDraft(captureDraft);

                if (findingDraftNode) {
                    findingDraftNode.innerHTML = this.createFindingDraftPreviewCard(findingDraft);
                    findingDraftNode.classList.toggle("has-finding-draft", Boolean(findingDraft.findingPrepared));

                    if (findingDraft.findingPrepared) {
                        window.setTimeout(() => {
                            findingDraftNode.scrollIntoView({
                                behavior: "smooth",
                                block: "center"
                            });
                        }, 120);
                    }
                }

                this.renderAssessmentDraftPreview(section, findingDraft);

                this.bindEvidenceCaptureDraftInteractions(section, captureDraft);
            });
        }

    }

    static updateInspectionHumanWorkLayerView(section, answerState = {}) {

        const currentQuestion = answerState.currentQuestion || {};
        const progress = answerState.progress || {};
        const totalQuestions = progress.totalQuestions || answerState.totalQuestions || 0;
        const currentQuestionNumber = Math.min((answerState.currentQuestionIndex || 0) + 1, totalQuestions || 1);

        const progressLabel = section.querySelector("[data-work-progress-label]");
        const moduleLabel = section.querySelector("[data-current-module-label]");
        const questionText = section.querySelector("[data-current-question-text]");
        const questionCounter = section.querySelector("[data-current-counter]");
        const questionId = section.querySelector("[data-current-question-id]");
        const questionSection = section.querySelector("[data-current-section-title]");
        const questionSystem = section.querySelector("[data-current-building-system]");
        const progressBar = section.querySelector("[data-work-progress-bar]");
        const progressText = section.querySelector("[data-work-progress-text]");
        const transitionStatus = section.querySelector("[data-question-transition-status]");

        if (progressLabel) {
            progressLabel.textContent = `${progress.completionRate || 0}% complete`;
        }

        if (moduleLabel) {
            moduleLabel.textContent = `${currentQuestion.moduleNumber || ""} ${currentQuestion.moduleTitle || ""}`.trim();
        }

        if (questionText) {
            questionText.textContent = currentQuestion.questionText || "No question available";
        }

        if (questionCounter) {
            questionCounter.textContent = `${currentQuestionNumber} / ${totalQuestions}`;
        }

        if (questionId) {
            questionId.textContent = currentQuestion.questionId || "No question";
        }

        if (questionSection) {
            questionSection.textContent = currentQuestion.sectionTitle || "No section";
        }

        if (questionSystem) {
            questionSystem.textContent = currentQuestion.buildingSystem || currentQuestion.moduleTitle || "No system";
        }

        if (progressBar) {
            progressBar.style.width = `${progress.completionRate || 0}%`;
        }

        if (progressText) {
            progressText.textContent = `${progress.answeredQuestions || 0} answered · ${progress.unansweredQuestions || 0} open`;
        }

        if (transitionStatus) {
            transitionStatus.textContent = currentQuestion.questionId
                ? `Sandbox state advanced · Next question ready: ${currentQuestion.questionId}`
                : "Sandbox state advanced · No next question available";
        }

        section.classList.add("has-question-transition");

        window.setTimeout(() => {
            section.classList.remove("has-question-transition");
        }, 420);

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

        let answerState = SandboxAnswerStateEngine.createInitialState(sandbox, {
            sandboxId: "sandbox-human-work-layer-browser-state"
        });

        section.innerHTML = `

            <div class="inspection-human-work-layer__topline">

                <span>Inspection Work Mode</span>

                <strong data-work-progress-label>${this.escapeHtml(workView.progress.completionRate)}% complete</strong>

            </div>

            <div class="inspection-human-work-layer__hero">

                <div>

                    <p class="eyebrow" data-current-module-label>${this.escapeHtml(workView.currentModule.chapterNumber)} ${this.escapeHtml(workView.currentModule.chapterTitle)}</p>

                    <h3 data-current-question-text>${this.escapeHtml(workView.currentQuestion.questionText)}</h3>

                    <p>${this.escapeHtml(workView.guidance.primary)}</p>

                </div>

                <div class="inspection-human-work-layer__counter">

                    <span>Question</span>

                    <strong data-current-counter>${this.escapeHtml(workView.currentQuestion.questionIndex)} / ${this.escapeHtml(workView.progress.totalQuestions)}</strong>

                </div>

            </div>

            <div class="inspection-human-work-layer__context">

                <span data-current-question-id>${this.escapeHtml(workView.currentQuestion.questionId)}</span>

                <span data-current-section-title>${this.escapeHtml(workView.currentQuestion.sectionTitle || "No section")}</span>

                <span data-current-building-system>${this.escapeHtml(workView.currentModule.buildingSystem)}</span>

            </div>

            <div class="inspection-human-work-layer__transition-status" data-question-transition-status>
                Sandbox state ready · No answer saved
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
                    <span data-work-progress-bar style="width: ${this.escapeHtml(workView.progress.completionRate)}%;"></span>
                </div>

                <p data-work-progress-text>${this.escapeHtml(workView.progress.answeredQuestions)} answered · ${this.escapeHtml(workView.progress.unansweredQuestions)} open</p>

            </div>

            <div class="inspection-human-work-layer__interaction-preview" data-answer-interaction-preview>

                <span>Sandbox interaction</span>

                <p>Select an answer to preview the next step. Nothing will be saved.</p>

            </div>

            <div class="evidence-requirement-preview" data-evidence-requirement-preview>

                <span>Evidence requirement</span>

                <p>Evidence capture preview appears here when an issue is marked auffällig.</p>

            </div>

            <div class="evidence-capture-draft" data-evidence-capture-draft>

                <span>Evidence capture draft</span>

                <p>Capture draft appears here after an evidence requirement is prepared.</p>

            </div>

            <div class="finding-draft-preview" data-finding-draft-preview>

                <span>Finding draft preview</span>

                <p>Finding draft appears here once the capture draft is ready for review.</p>

            </div>

            <div class="assessment-draft-preview" data-assessment-draft-preview>

                <span>Assessment draft preview</span>

                <p>Assessment draft appears here once the finding draft is prepared.</p>

            </div>

            <div class="recommendation-draft-preview" data-recommendation-draft-preview>

                <span>Recommendation draft preview</span>

                <p>Recommendation draft appears here once the assessment draft is prepared.</p>

            </div>

            <div class="decision-draft-preview" data-decision-draft-preview>

                <span>Decision draft preview</span>

                <p>Decision draft appears here once the recommendation draft is prepared.</p>

            </div>

            <div class="report-draft-preview" data-report-draft-preview>

                <span>Report draft preview</span>

                <p>Report draft appears here once the decision draft is prepared.</p>

            </div>

        `;

        section.querySelectorAll("[data-answer-value]").forEach((button) => {

            button.addEventListener("click", () => {

                const answerValue = button.getAttribute("data-answer-value");

                const interaction = AnswerInteractionSandbox.applyAnswer(workView, answerValue, {
                    interactionId: `answer-browser-${Date.now()}`
                });

                answerState = SandboxAnswerStateEngine.applyAnswer(answerState, answerValue, {
                    timestamp: new Date().toISOString()
                });

                this.updateInspectionHumanWorkLayerView(section, answerState);

                section.querySelectorAll("[data-answer-value]").forEach((item) => {
                    item.classList.remove("is-selected");
                });

                button.classList.add("is-selected");

                window.setTimeout(() => {
                    button.classList.remove("is-selected");
                }, 360);

                const evidencePreview = EvidenceRequirementPreviewEngine.createPreview(answerState);
                const captureDraft = EvidenceCaptureDraftSandbox.createDraft(evidencePreview);

                const previewNode = section.querySelector("[data-answer-interaction-preview]");

                if (previewNode) {
                    previewNode.innerHTML = this.createAnswerInteractionSandboxPreview(interaction, answerState);
                }

                const evidencePreviewNode = section.querySelector("[data-evidence-requirement-preview]");

                if (evidencePreviewNode) {
                    evidencePreviewNode.innerHTML = this.createEvidenceRequirementPreviewCard(evidencePreview);
                    evidencePreviewNode.classList.toggle("has-evidence-required", Boolean(evidencePreview.evidenceRequired));
                }

                const captureDraftNode = section.querySelector("[data-evidence-capture-draft]");

                if (captureDraftNode) {
                    captureDraftNode.innerHTML = this.createEvidenceCaptureDraftCard(captureDraft);
                    captureDraftNode.classList.toggle("has-capture-draft", Boolean(captureDraft.evidenceRequired));
                    this.bindEvidenceCaptureDraftInteractions(section, captureDraft);

                    const findingDraftNode = section.querySelector("[data-finding-draft-preview]");
                    const findingDraft = FindingDraftPreviewSandbox.createDraft(captureDraft);

                    if (findingDraftNode) {
                        findingDraftNode.innerHTML = this.createFindingDraftPreviewCard(findingDraft);
                        findingDraftNode.classList.toggle("has-finding-draft", Boolean(findingDraft.findingPrepared));
                    }

                    this.renderAssessmentDraftPreview(section, findingDraft);

                    if (captureDraft.evidenceRequired) {
                        window.setTimeout(() => {
                            captureDraftNode.scrollIntoView({
                                behavior: "smooth",
                                block: "center"
                            });
                        }, 120);
                    }
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

    static bindExpertReviewPreview(expertReviewNode, expertReview = {}) {

        if (!expertReviewNode) {
            return;
        }

        let currentReview = expertReview;

        const reviewIdNode = expertReviewNode.querySelector("[data-review-id]");
        const reviewStatusNode = expertReviewNode.querySelector("[data-review-status]");
        const reviewNotesNode = expertReviewNode.querySelector("[data-review-notes]");
        const reviewNotePreviewNode = expertReviewNode.querySelector("[data-review-note-preview]");
        const reviewSafetyNode = expertReviewNode.querySelector("[data-review-safety]");
        const addNoteButton = expertReviewNode.querySelector("[data-add-review-note]");
        const approveButton = expertReviewNode.querySelector("[data-approve-review]");
        const rejectButton = expertReviewNode.querySelector("[data-reject-review]");
        const finalizationGateNode = expertReviewNode.querySelector("[data-finalization-gate-preview]");
        const gateIdNode = expertReviewNode.querySelector("[data-gate-id]");
        const gateStatusNode = expertReviewNode.querySelector("[data-gate-status]");
        const gateExpertApprovedNode = expertReviewNode.querySelector("[data-gate-expert-approved]");
        const gateSafetyNode = expertReviewNode.querySelector("[data-gate-safety]");

        const renderFinalizationGate = () => {
            if (!finalizationGateNode) {
                return;
            }

            const gate = DraftWorkspaceManager.createFinalizationGate(currentReview, {
                createdAt: new Date().toISOString()
            });

            gateIdNode.textContent = gate.gateId;
            gateStatusNode.textContent = gate.status;
            gateExpertApprovedNode.textContent = String(gate.readiness.expertReviewApproved);
            gateSafetyNode.textContent = `canExport: ${String(gate.permissions.canExport)} · canCreateClientDocument: ${String(gate.permissions.canCreateClientDocument)} · canFinalizeWorkflow: ${String(gate.permissions.canFinalizeWorkflow)}`;

            finalizationGateNode.classList.toggle("is-ready", gate.status === "ready_for_internal_finalization_review");
            finalizationGateNode.classList.toggle("is-blocked", gate.status === "blocked_pending_expert_approval");
        };

        const scrollToExpertReview = () => {
            window.requestAnimationFrame(() => {
                expertReviewNode.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            });
        };

        const scrollToFinalizationGate = () => {
            if (!finalizationGateNode) {
                return;
            }

            window.requestAnimationFrame(() => {
                finalizationGateNode.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            });
        };

        const renderReview = () => {
            reviewIdNode.textContent = currentReview.reviewId;
            reviewStatusNode.textContent = currentReview.status;
            reviewNotesNode.textContent = String(currentReview.notes.length);

            let noteMarkup = "<p>No review note added yet.</p>";

            if (currentReview.notes.length > 0) {
                const lastNote = currentReview.notes[currentReview.notes.length - 1];
                noteMarkup = `
                    <small>${this.escapeHtml(lastNote.category)}</small>
                    <p>${this.escapeHtml(lastNote.text)}</p>
                `;
            }

            if (currentReview.decision) {
                noteMarkup += `
                    <div class="expert-review-preview__decision">
                        <small>Decision</small>
                        <p>${this.escapeHtml(currentReview.decision.comment)}</p>
                    </div>
                `;
            }

            reviewNotePreviewNode.innerHTML = noteMarkup;

            reviewSafetyNode.textContent = `canExport: ${String(currentReview.permissions.canExport)} · canCreateClientDocument: ${String(currentReview.permissions.canCreateClientDocument)} · canFinalizeWorkflow: ${String(currentReview.permissions.canFinalizeWorkflow)} · expertApprovalGranted: ${String(currentReview.safetyBoundary.expertApprovalGranted)}`;

            expertReviewNode.classList.toggle("is-approved", currentReview.status === "approved");
            expertReviewNode.classList.toggle("is-rejected", currentReview.status === "rejected");
            expertReviewNode.classList.toggle("is-review-required", currentReview.status === "review_required");

            renderFinalizationGate();
        };

        addNoteButton.addEventListener("click", () => {
            if (currentReview.notes.length > 0) {
                return;
            }

            currentReview = DraftWorkspaceManager.addExpertReviewNote(currentReview, {
                text: "Review note added in browser preview.",
                author: "Matthias Meiferts",
                category: "expert-review"
            }, {
                createdAt: new Date().toISOString()
            });

            addNoteButton.disabled = true;
            addNoteButton.textContent = "Review note added";

            renderReview();
            scrollToExpertReview();
        });

        approveButton.addEventListener("click", () => {
            currentReview = DraftWorkspaceManager.approveExpertReview(currentReview, {
                comment: "Approved in browser preview.",
                decidedBy: "Matthias Meiferts"
            }, {
                updatedAt: new Date().toISOString()
            });

            renderReview();
            scrollToFinalizationGate();
        });

        rejectButton.addEventListener("click", () => {
            currentReview = DraftWorkspaceManager.rejectExpertReview(currentReview, {
                comment: "Rejected in browser preview.",
                decidedBy: "Matthias Meiferts"
            }, {
                updatedAt: new Date().toISOString()
            });

            renderReview();
            scrollToFinalizationGate();
        });

        renderReview();

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

