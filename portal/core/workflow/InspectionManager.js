import IdGenerator from "../utils/IdGenerator.js";
import StorageManager from "../storage/StorageManager.js";
import EventBus from "../events/EventBus.js";

export default class InspectionManager {

    static collection = "inspections";

    static createInspection(data = {}) {
        if (!data.buildingId) {
            throw new Error("InspectionManager: buildingId is required");
        }

        const inspection = {
            id: IdGenerator.generate("INSP"),
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

    static getInspection(id) {
        return StorageManager.load(this.collection, id);
    }

    static getAllInspections() {
        return StorageManager.loadAll(this.collection);
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