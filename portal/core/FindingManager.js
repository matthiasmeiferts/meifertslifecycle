/**
 * ==========================================================
 * MEIFERTS Building Intelligence
 * FindingManager
 * Version 1.0.0
 * Sprint 6.6
 * Status: Production
 * ==========================================================
 */

import StorageManager from "./storage/StorageManager.js";
import EventBus from "./events/EventBus.js";

export default class FindingManager {

    static collection = "findings";

    static create(data) {

        if (!data || !data.id) {
            throw new Error("FindingManager: finding with id is required");
        }

        if (!data.caseId) {
            throw new Error("FindingManager: caseId is required");
        }

        const finding = {
            id: data.id,
            caseId: data.caseId,
            buildingId: data.buildingId || null,
            inspectionId: data.inspectionId || null,

            evidenceIds: data.evidenceIds || [],

            title: data.title || "Untitled Finding",
            description: data.description || "",
            category: data.category || "General",
            buildingSystem: data.buildingSystem || "",
            location: data.location || "",

            severity: data.severity || "Unrated",
            probability: data.probability || "Unrated",
            urgency: data.urgency || "Unrated",
            confidence: data.confidence || null,

            status: data.status || "Draft",
            source: data.source || "Expert Review",

            recommendationIds: data.recommendationIds || [],
            assessmentIds: data.assessmentIds || [],

            createdBy: data.createdBy || "System",
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const saved = StorageManager.upsert(this.collection, finding);

        EventBus.emit("finding:created", saved);
        EventBus.emit("finding:changed", saved);

        console.log("Finding created:", saved);

        return saved;
    }

    static load(id) {
        return StorageManager.load(this.collection, id);
    }

    static getAll() {
        return StorageManager.loadAll(this.collection);
    }

    static getByCase(caseId) {
        return this.getAll().filter(finding => finding.caseId === caseId);
    }

    static getByEvidence(evidenceId) {
        return this.getAll().filter(finding =>
            finding.evidenceIds.includes(evidenceId)
        );
    }

    static update(data) {

        if (!data || !data.id) {
            throw new Error("FindingManager: finding with id is required");
        }

        const updated = StorageManager.update(this.collection, data);

        EventBus.emit("finding:updated", updated);
        EventBus.emit("finding:changed", updated);

        return updated;
    }

    static upsert(data) {

        if (!data || !data.id) {
            throw new Error("FindingManager: finding with id is required");
        }

        const saved = StorageManager.upsert(this.collection, data);

        EventBus.emit("finding:saved", saved);
        EventBus.emit("finding:changed", saved);

        return saved;
    }

    static delete(id) {

        const result = StorageManager.delete(this.collection, id);

        EventBus.emit("finding:deleted", { id });
        EventBus.emit("finding:changed", { id });

        return result;
    }

    static countByCase(caseId) {
        return this.getByCase(caseId).length;
    }

}