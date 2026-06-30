/**
 * MEIFERTS Building Intelligence
 * Building Manager
 * Version: 1.1.0
 */

export default class BuildingManager {

    static storageKey = "mbi:buildings";
    static currentKey = "mbi:currentBuilding";
    static currentBuilding = null;

    static getAll() {
        const raw = localStorage.getItem(this.storageKey);

        if (!raw) return [];

        try {
            return JSON.parse(raw);
        } catch {
            return [];
        }
    }

    static saveAll(buildings = []) {
        localStorage.setItem(this.storageKey, JSON.stringify(buildings));
    }

    static create(data = {}) {
        const building = {
            id: data.id || `building-${Date.now()}`,
            name: data.name || "Untitled Building",
            address: data.address || "",
            type: data.type || "Residential",
            status: data.status || "Draft",
            yearBuilt: data.yearBuilt || "",
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const buildings = this.getAll();

        buildings.push(building);

        this.saveAll(buildings);
        this.set(building);

        return building;
    }

    static update(data = {}) {
        if (!data.id) {
            throw new Error("BuildingManager: id is required");
        }

        const buildings = this.getAll();

        const updatedBuildings = buildings.map(building =>
            building.id === data.id
                ? {
                    ...building,
                    ...data,
                    updatedAt: new Date().toISOString()
                }
                : building
        );

        this.saveAll(updatedBuildings);

        const updated = updatedBuildings.find(building => building.id === data.id);

        if (updated) {
            this.set(updated);
        }

        return updated;
    }

    static delete(id) {
        const buildings = this.getAll();
        const filtered = buildings.filter(building => building.id !== id);

        this.saveAll(filtered);

        const current = this.get();

        if (current && current.id === id) {
            this.clear();
        }

        return true;
    }

    static load(id) {
        return this.getAll().find(building => building.id === id) || null;
    }

    static set(building) {
        this.currentBuilding = building;
        localStorage.setItem(this.currentKey, JSON.stringify(building));
        return building;
    }

    static get() {
        if (this.currentBuilding) return this.currentBuilding;

        const raw = localStorage.getItem(this.currentKey);

        if (!raw) return null;

        try {
            this.currentBuilding = JSON.parse(raw);
            return this.currentBuilding;
        } catch {
            return null;
        }
    }

    static clear() {
        this.currentBuilding = null;
        localStorage.removeItem(this.currentKey);
    }

    static hasBuilding() {
        return this.get() !== null;
    }

    static count() {
        return this.getAll().length;
    }

}