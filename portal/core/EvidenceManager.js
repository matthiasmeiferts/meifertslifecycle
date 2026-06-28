/**
 * MEIFERTS Building Intelligence
 * EvidenceManager
 * Version 1.0.1
 */

import StorageManager from "./storage/StorageManager.js";
import EventBus from "./events/EventBus.js";

export default class EvidenceManager {
    static collection = "evidence";

    static create(data) {
        if (!data) throw new Error("EvidenceManager: data required");
        if (!data.id) throw new Error("EvidenceManager: id required");
        if (!data.caseId) throw new Error("EvidenceManager: caseId required");

        const evidence = {
            id: data.id,
            caseId: data.caseId,
            buildingId: data.buildingId || null,
            inspectionId: data.inspectionId || null,
            type: data.type || "photo",
            category: data.category || "General",
            title: data.title || "",
            description: data.description || "",
            location: data.location || "",
            buildingSystem: data.buildingSystem || "",
            severity: data.severity || "Unrated",
            status: data.status || "Captured",
            createdBy: data.createdBy || "System",
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const saved = StorageManager.upsert(this.collection, evidence);

        EventBus.emit("evidence:created", saved);
        EventBus.emit("evidence:changed", saved);

        return saved;
    }

    static load(id) {
        return StorageManager.load(this.collection, id);
    }

    static getAll() {
        return StorageManager.loadAll(this.collection);
    }

    static getByCase(caseId) {
        return this.getAll().filter(item => item.caseId === caseId);
    }

    static update(data) {
        const updated = StorageManager.update(this.collection, data);
        EventBus.emit("evidence:updated", updated);
        EventBus.emit("evidence:changed", updated);
        return updated;
    }

    static delete(id) {
        StorageManager.delete(this.collection, id);
        EventBus.emit("evidence:deleted", { id });
        EventBus.emit("evidence:changed", { id });
        return true;
    }

    static count() {
        return StorageManager.count(this.collection);
    }

    static countByCase(caseId) {
        return this.getByCase(caseId).length;
    }
}
