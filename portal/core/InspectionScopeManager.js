/**
 * MEIFERTS Building Intelligence
 * Inspection Scope Manager
 * Foundation Framework 3.9-C
 *
 * Stores adaptive inspection scope answers by case and inspection.
 */

import StorageManager from "./storage/StorageManager.js";
import EventBus from "./events/EventBus.js";
import InspectionQuestionEngine from "./InspectionQuestionEngine.js";

export default class InspectionScopeManager {

    static collection = "inspectionScopes";

    static activeKey = "activeInspectionScopeId";

    static create(data = {}) {
        if (!data.caseId) {
            throw new Error("InspectionScopeManager: caseId is required");
        }

        const scope = {
            id: data.id || this.createId(),
            caseId: data.caseId,
            buildingId: data.buildingId || null,
            inspectionId: data.inspectionId || null,

            title: data.title || "Inspection Scope",
            scopeType: data.scopeType || "Visual Inspection",
            status: data.status || "Draft",

            modules: data.modules || [],
            questions: data.questions || [],
            answers: data.answers || {},

            coverage: data.coverage || {
                total: 0,
                inspected: 0,
                open: 0,
                notAccessible: 0,
                notApplicable: 0,
                evidenceRequired: 0,
                riskFlagged: 0,
                limitations: 0
            },

            evidenceRequirements: data.evidenceRequirements || [],
            riskFlags: data.riskFlags || [],
            limitations: data.limitations || [],

            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const saved = StorageManager.upsert(this.collection, scope);
        this.set(saved);
        EventBus.emit("inspectionScope:created", saved);
        EventBus.emit("inspectionScope:changed", saved);

        return saved;
    }

    static load(id) {
        return StorageManager.load(this.collection, id);
    }

    static getAll() {
        return StorageManager.loadAll(this.collection);
    }

    static getByCase(caseId) {
        return this.getAll().filter(scope => scope.caseId === caseId);
    }

    static getByInspection(inspectionId) {
        return this.getAll().filter(scope => scope.inspectionId === inspectionId);
    }

    static update(data = {}) {
        if (!data.id) {
            throw new Error("InspectionScopeManager: id is required for update");
        }

        const existing = this.load(data.id);

        if (!existing) {
            throw new Error(`InspectionScopeManager: scope not found: ${data.id}`);
        }

        const updated = StorageManager.update(this.collection, {
            ...existing,
            ...data,
            id: data.id,
            updatedAt: new Date().toISOString()
        });

        this.set(updated);
        EventBus.emit("inspectionScope:updated", updated);
        EventBus.emit("inspectionScope:changed", updated);

        return updated;
    }

    static upsert(data = {}) {
        if (!data.id) {
            return this.create(data);
        }

        const existing = this.load(data.id);

        if (!existing) {
            return this.create(data);
        }

        return this.update(data);
    }

    static delete(id) {
        StorageManager.delete(this.collection, id);

        if (this.get()?.id === id) {
            this.clear();
        }

        EventBus.emit("inspectionScope:deleted", { id });
        EventBus.emit("inspectionScope:changed", { id });

        return true;
    }

    static set(scope) {
        if (!scope || !scope.id) {
            return null;
        }

        localStorage.setItem(this.activeKey, scope.id);
        EventBus.emit("inspectionScope:selected", scope);

        return scope;
    }

    static get() {
        const id = localStorage.getItem(this.activeKey);

        if (!id) {
            return null;
        }

        return this.load(id);
    }

    static clear() {
        localStorage.removeItem(this.activeKey);
        EventBus.emit("inspectionScope:cleared", null);
    }

    static answerQuestion(scopeId, question, value, data = {}) {
        const scope = this.load(scopeId);

        if (!scope) {
            throw new Error(`InspectionScopeManager: scope not found: ${scopeId}`);
        }

        const answer = InspectionQuestionEngine.createAnswer(question, value, {
            caseId: scope.caseId,
            buildingId: scope.buildingId,
            inspectionId: scope.inspectionId,
            ...data
        });

        const evaluation = InspectionQuestionEngine.evaluate(question, answer);
        const answers = {
            ...(scope.answers || {}),
            [question.id]: answer
        };

        const updated = {
            ...scope,
            answers,
            evidenceRequirements: this.mergeByQuestionId(
                scope.evidenceRequirements || [],
                question.id,
                evaluation.requiredEvidence
            ),
            riskFlags: this.mergeRecords(scope.riskFlags || [], evaluation.riskFlags),
            limitations: this.mergeRecords(scope.limitations || [], evaluation.limitations),
            coverage: this.createCoverageSummary(scope.questions || [], answers),
            updatedAt: new Date().toISOString()
        };

        return this.update(updated);
    }

    static createCoverageSummary(questions = [], answers = {}) {
        const summary = {
            total: questions.length,
            inspected: 0,
            open: 0,
            notAccessible: 0,
            notApplicable: 0,
            evidenceRequired: 0,
            riskFlagged: 0,
            limitations: 0
        };

        questions.forEach(question => {
            const answer = answers[question.id];
            const evaluation = InspectionQuestionEngine.evaluate(question, answer);
            const status = evaluation.coverageStatus;

            if (status === InspectionQuestionEngine.COVERAGE.INSPECTED) summary.inspected += 1;
            if (status === InspectionQuestionEngine.COVERAGE.OPEN) summary.open += 1;
            if (status === InspectionQuestionEngine.COVERAGE.NOT_ACCESSIBLE) summary.notAccessible += 1;
            if (status === InspectionQuestionEngine.COVERAGE.NOT_APPLICABLE) summary.notApplicable += 1;
            if (status === InspectionQuestionEngine.COVERAGE.EVIDENCE_REQUIRED) summary.evidenceRequired += 1;
            if (status === InspectionQuestionEngine.COVERAGE.RISK_FLAGGED) summary.riskFlagged += 1;
            if (status === InspectionQuestionEngine.COVERAGE.LIMITATION) summary.limitations += 1;
        });

        return summary;
    }

    static mergeByQuestionId(existing = [], questionId, values = []) {
        const filtered = existing.filter(item => item.questionId !== questionId);

        if (!values.length) {
            return filtered;
        }

        return [
            ...filtered,
            {
                questionId,
                requiredEvidence: values
            }
        ];
    }

    static mergeRecords(existing = [], incoming = []) {
        const records = [...existing];

        incoming.forEach(item => {
            const exists = records.some(record =>
                record.questionId === item.questionId &&
                record.reason === item.reason
            );

            if (!exists) {
                records.push(item);
            }
        });

        return records;
    }

    static count() {
        return this.getAll().length;
    }

    static countByCase(caseId) {
        return this.getByCase(caseId).length;
    }

    static createId() {
        return `SCOPE-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    }

}
