/**
 * ==========================================================
 * MEIFERTS Building Intelligence
 * CaseManager
 * Version 1.3.0
 * Sprint 6.9
 * Status: Production
 * ==========================================================
 */

import StorageManager from "./storage/StorageManager.js";
import EventBus from "./events/EventBus.js";

export default class CaseManager {

    static collection = "cases";
    static currentKey = "mbi:currentCase";
    static currentCase = null;

    static setCurrent(caseData) {
        this.currentCase = caseData;
        localStorage.setItem(this.currentKey, JSON.stringify(caseData));
        EventBus.emit("case:opened", caseData);
        return caseData;
    }

    static getCurrent() {
        if (this.currentCase) return this.currentCase;

        const raw = localStorage.getItem(this.currentKey);

        if (!raw) return null;

        try {
            this.currentCase = JSON.parse(raw);
            return this.currentCase;
        } catch {
            return null;
        }
    }

    static create(caseData) {
        if (!caseData || !caseData.id) {
            throw new Error("CaseManager: case with id is required");
        }

        const newCase = {
            id: caseData.id,
            title: caseData.title || "Untitled Case",
            clientId: caseData.clientId || null,
            buildingId: caseData.buildingId || null,
            inspectionId: caseData.inspectionId || null,
            status: caseData.status || "Draft",
            type: caseData.type || "Technical Property Review",
            riskScore: caseData.riskScore || 0,
            progress: caseData.progress || 0,
            evidenceIds: caseData.evidenceIds || [],
            findingIds: caseData.findingIds || [],
            assessmentIds: caseData.assessmentIds || [],
            recommendationIds: caseData.recommendationIds || [],
            decisionIds: caseData.decisionIds || [],
            reportIds: caseData.reportIds || [],
            createdAt: caseData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const saved = StorageManager.upsert(this.collection, newCase);

        EventBus.emit("case:created", saved);

        return this.setCurrent(saved);
    }

    static open(caseData) {
        if (!caseData || !caseData.id) {
            throw new Error("CaseManager: case with id is required");
        }

        const saved = StorageManager.upsert(this.collection, caseData);

        return this.setCurrent(saved);
    }

    static load(id) {
        const found = StorageManager.load(this.collection, id);

        if (!found) return null;

        return this.setCurrent(found);
    }

    static save() {
        const current = this.getCurrent();

        if (!current) return false;

        const saved = StorageManager.upsert(this.collection, current);

        return this.setCurrent(saved);
    }

    static getAll() {
        return StorageManager.loadAll(this.collection);
    }

    static hasOpenCase() {
        return this.getCurrent() !== null;
    }

    static close() {
        const closedCase = this.currentCase;

        this.currentCase = null;
        localStorage.removeItem(this.currentKey);

        EventBus.emit("case:closed", closedCase);
    }

    static delete(id) {
        const current = this.getCurrent();

        if (current && current.id === id) {
            this.close();
        }

        const result = StorageManager.delete(this.collection, id);

        EventBus.emit("case:deleted", { id });

        return result;
    }

}