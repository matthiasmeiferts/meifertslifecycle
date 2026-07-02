import IdGenerator from "./utils/IdGenerator.js";
import StorageManager from "./storage/StorageManager.js";
import EventBus from "./events/EventBus.js";

export default class InspectionManager {

    static collection = "inspections";
    static currentKey = "mbi:currentInspection";
    static currentInspection = null;

    static createInspection(data = {}) {
        if (!data.buildingId) {
            throw new Error("InspectionManager: buildingId is required");
        }

        const inspection = {
            id: data.id || "INSP-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
            type: "inspection",
            status: "draft",
            buildingId: data.buildingId,
            inspectionType: data.inspectionType || "technical_due_diligence",
            title: data.title || "Technical Property Review",
            location: data.location || "",
            inspector: data.inspector || "Matthias Meiferts",
            scheduledAt: data.scheduledAt || null,
            startedAt: null,
            completedAt: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        StorageManager.save(this.collection, inspection);
        EventBus.emit("inspection.created", inspection);

        return inspection;
    }

    static create(data = {}) {
        return this.createInspection(data);
    }

    static getInspection(id = null) {
        if (id) {
            return StorageManager.load(this.collection, id);
        }

        return this.get();
    }

    static set(inspection) {
        this.currentInspection = inspection;
        localStorage.setItem(this.currentKey, JSON.stringify(inspection));
        return inspection;
    }

    static get() {
        if (this.currentInspection) return this.currentInspection;

        const raw = localStorage.getItem(this.currentKey);

        if (!raw) return null;

        try {
            this.currentInspection = JSON.parse(raw);
            return this.currentInspection;
        } catch {
            return null;
        }
    }

    static clear() {
        this.currentInspection = null;
        localStorage.removeItem(this.currentKey);
    }

    static load(id) {
        return this.getInspection(id);
    }

    static getAllInspections() {
        return StorageManager.loadAll(this.collection);
    }

    static getAll() {
        return this.getAllInspections();
    }

    static getInspectionsByBuilding(buildingId) {
        return this.getAllInspections()
            .filter(inspection => inspection.buildingId === buildingId);
    }

    static updateInspection(id, updates = {}) {
        const existing = this.getInspection(id);

        if (!existing) {
            throw new Error(`InspectionManager: inspection not found: ${id}`);
        }

        const updated = StorageManager.update(this.collection, {
            ...existing,
            ...updates,
            id,
            updatedAt: new Date().toISOString()
        });

        EventBus.emit("inspection.updated", updated);

        return updated;
    }

    static deleteInspection(id) {
        StorageManager.delete(this.collection, id);
        EventBus.emit("inspection.deleted", { id });
        return true;
    }

}