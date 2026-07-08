
import QuestionCatalogManager from "../../core/QuestionCatalogManager.js";

import AdaptiveInspectionProfileEngine from "../../core/AdaptiveInspectionProfileEngine.js";

import AdaptiveFollowUpQuestionEngine from "../../core/AdaptiveFollowUpQuestionEngine.js";

import AdaptiveInspectionPreviewBridge from "../../core/AdaptiveInspectionPreviewBridge.js";

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

        fragment.appendChild(this.createMetrics(summary));

        fragment.appendChild(this.createControls());

        fragment.appendChild(this.createAdaptiveProfileDiagnostic());

        fragment.appendChild(this.createAdaptiveFollowUpDiagnostic());

        fragment.appendChild(this.createAdaptiveInspectionPreviewDiagnostic());

        fragment.appendChild(this.createCatalogContent());

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

