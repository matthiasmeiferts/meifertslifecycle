
import QuestionCatalogManager from "../../core/QuestionCatalogManager.js";

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

        fragment.appendChild(this.createMetrics(summary));

        fragment.appendChild(this.createControls());

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

        row.className = "task-row question-catalog-row";

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

