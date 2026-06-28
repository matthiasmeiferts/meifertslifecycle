/**
 * MEIFERTS Building Intelligence
 * Building Manager
 * Version: 1.0.0
 */

export default class BuildingManager {

    static currentBuilding = null;

    static set(building) {
        this.currentBuilding = building;
    }

    static get() {
        return this.currentBuilding;
    }

    static clear() {
        this.currentBuilding = null;
    }

    static hasBuilding() {
        return this.currentBuilding !== null;
    }

}