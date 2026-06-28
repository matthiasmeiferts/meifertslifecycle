import IdGenerator from "../utils/IdGenerator.js";
import StorageManager from "../storage/StorageManager.js";
import EventBus from "../events/EventBus.js";

export default class BuildingManager {

    static collection = "buildings";

    static createBuilding(data = {}) {
        const building = {
            id: IdGenerator.generate("BLD"),
            type: "building",
            status: "draft",
            name: data.name || "Untitled Building",
            address: data.address || "",
            city: data.city || "",
            country: data.country || "",
            assetType: data.assetType || "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        StorageManager.save(this.collection, building);
        EventBus.emit("building.created", building);

        return building;
    }

    static getBuilding(id) {
        return StorageManager.load(this.collection, id);
    }

    static getAllBuildings() {
        return StorageManager.loadAll(this.collection);
    }

    static updateBuilding(id, updates = {}) {
        const existing = this.getBuilding(id);

        if (!existing) {
            throw new Error(`BuildingManager: building not found: ${id}`);
        }

        const updated = StorageManager.update(this.collection, {
            ...existing,
            ...updates,
            id,
            updatedAt: new Date().toISOString()
        });

        EventBus.emit("building.updated", updated);

        return updated;
    }

    static deleteBuilding(id) {
        StorageManager.delete(this.collection, id);
        EventBus.emit("building.deleted", { id });
        return true;
    }

}