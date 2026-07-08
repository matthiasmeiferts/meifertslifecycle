/**
 * MEIFERTS Building Intelligence
 * Question Catalog Manager
 * Foundation 2.2-B
 */

export default class QuestionCatalogManager {
    static catalog = [];
    static lastValidation = null;

    static defaultCatalogPath = "data/question-catalog/meiferts-question-catalog-import-ready.v2.7.json";

    static requiredFields = [
        "questionId",
        "chapterNumber",
        "chapterTitle",
        "sectionTitle",
        "itemNumber",
        "questionText",
        "buildingSystem",
        "inspectionArea",
        "answerType"
    ];

    static normalizeChapterNumber(chapterNumber = "") {
        return String(chapterNumber || "").padStart(2, "0");
    }

    static normalizeText(value = "") {
        return String(value || "").trim().toLowerCase();
    }

    static clone(item) {
        return item ? JSON.parse(JSON.stringify(item)) : null;
    }

    static loadFromData(data = [], options = {}) {
        const items = Array.isArray(data)
            ? data
            : Array.isArray(data?.items)
                ? data.items
                : [];

        this.catalog = items.map(item => ({ ...item }));
        this.lastValidation = this.validate(this.catalog);

        if (options.throwOnInvalid !== false && !this.lastValidation.isValid) {
            throw new Error("Question catalog validation failed.");
        }

        return this.getSummary();
    }

    static async load(catalogPath = this.defaultCatalogPath, fetcher = globalThis.fetch) {
        if (typeof fetcher !== "function") {
            throw new Error("QuestionCatalogManager.load requires a fetch function.");
        }

        const response = await fetcher(catalogPath);

        if (!response.ok) {
            throw new Error(`Question catalog load failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return this.loadFromData(data);
    }

    static clear() {
        this.catalog = [];
        this.lastValidation = null;
    }

    static getAll() {
        return this.catalog.map(item => ({ ...item }));
    }

    static count() {
        return this.catalog.length;
    }

    static getById(questionId = "") {
        return this.clone(this.catalog.find(item => item.questionId === questionId));
    }

    static has(questionId = "") {
        return Boolean(this.catalog.find(item => item.questionId === questionId));
    }

    static getChapters() {
        const chapters = new Map();

        this.catalog.forEach(item => {
            const chapterNumber = this.normalizeChapterNumber(item.chapterNumber);
            const key = `${chapterNumber}|${item.chapterTitle || ""}`;

            if (!chapters.has(key)) {
                chapters.set(key, {
                    chapterNumber,
                    chapterTitle: item.chapterTitle || "",
                    count: 0
                });
            }

            chapters.get(key).count += 1;
        });

        return Array.from(chapters.values()).sort((a, b) => {
            return a.chapterNumber.localeCompare(b.chapterNumber);
        });
    }

    static getByChapter(chapterNumber = "") {
        const normalized = this.normalizeChapterNumber(chapterNumber);

        return this.catalog
            .filter(item => this.normalizeChapterNumber(item.chapterNumber) === normalized)
            .map(item => ({ ...item }));
    }

    static getByBuildingSystem(buildingSystem = "") {
        const normalized = this.normalizeText(buildingSystem);

        return this.catalog
            .filter(item => this.normalizeText(item.buildingSystem) === normalized)
            .map(item => ({ ...item }));
    }

    static getByInspectionArea(inspectionArea = "") {
        const normalized = this.normalizeText(inspectionArea);

        return this.catalog
            .filter(item => this.normalizeText(item.inspectionArea) === normalized)
            .map(item => ({ ...item }));
    }

    static getByAnswerType(answerType = "") {
        const normalized = this.normalizeText(answerType);

        return this.catalog
            .filter(item => this.normalizeText(item.answerType) === normalized)
            .map(item => ({ ...item }));
    }

    static getEvidenceRelevant() {
        return this.catalog
            .filter(item => Boolean(item.evidenceRelevant))
            .map(item => ({ ...item }));
    }

    static getFindingRelevant() {
        return this.catalog
            .filter(item => Boolean(item.findingRelevant))
            .map(item => ({ ...item }));
    }

    static getAssessmentRelevant() {
        return this.catalog
            .filter(item => Boolean(item.assessmentRelevant))
            .map(item => ({ ...item }));
    }

    static getUploadRelevant() {
        return this.catalog
            .filter(item => Boolean(item.uploadRelevant))
            .map(item => ({ ...item }));
    }

    static getCapexRelevant() {
        return this.catalog
            .filter(item => Boolean(item.capexRelevant))
            .map(item => ({ ...item }));
    }

    static search(term = "") {
        const normalized = this.normalizeText(term);

        if (!normalized) {
            return [];
        }

        return this.catalog
            .filter(item => {
                return [
                    item.questionId,
                    item.chapterTitle,
                    item.sectionTitle,
                    item.questionText,
                    item.buildingSystem,
                    item.component,
                    item.inspectionArea,
                    item.answerType,
                    item.normReference
                ]
                    .map(value => this.normalizeText(value))
                    .some(value => value.includes(normalized));
            })
            .map(item => ({ ...item }));
    }

    static validate(data = this.catalog) {
        const items = Array.isArray(data)
            ? data
            : Array.isArray(data?.items)
                ? data.items
                : [];

        const seen = new Set();
        const duplicateQuestionIds = [];
        const missingRequiredFields = [];
        const chapterCounts = {};
        const answerTypeCounts = {};

        items.forEach(item => {
            const questionId = item.questionId || "";

            if (seen.has(questionId)) {
                duplicateQuestionIds.push(questionId);
            }

            if (questionId) {
                seen.add(questionId);
            }

            const missing = this.requiredFields.filter(field => {
                return item[field] === undefined || item[field] === null || item[field] === "";
            });

            if (missing.length) {
                missingRequiredFields.push({
                    questionId,
                    missing
                });
            }

            const chapterKey = `${this.normalizeChapterNumber(item.chapterNumber)} ${item.chapterTitle || ""}`.trim();
            chapterCounts[chapterKey] = (chapterCounts[chapterKey] || 0) + 1;

            const answerType = item.answerType || "unknown";
            answerTypeCounts[answerType] = (answerTypeCounts[answerType] || 0) + 1;
        });

        return {
            isValid: duplicateQuestionIds.length === 0 && missingRequiredFields.length === 0,
            totalItems: items.length,
            duplicateQuestionIds,
            missingRequiredFields,
            chapterCounts,
            answerTypeCounts
        };
    }

    static getSummary() {
        const validation = this.lastValidation || this.validate(this.catalog);

        return {
            totalItems: this.catalog.length,
            chapterCount: this.getChapters().length,
            validationStatus: validation.isValid ? "pass" : "review_required",
            duplicateQuestionIds: validation.duplicateQuestionIds.length,
            missingRequiredFieldItems: validation.missingRequiredFields.length,
            chapterCounts: validation.chapterCounts,
            answerTypeCounts: validation.answerTypeCounts
        };
    }
}
