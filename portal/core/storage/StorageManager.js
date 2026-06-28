/**
 * ==========================================================
 * MEIFERTS Building Intelligence
 * StorageManager
 * Version 1.2.0
 * ==========================================================
 */

export default class StorageManager {

    static prefix = "mbi";

    static getKey(collection) {
        if (!collection) {
            throw new Error("StorageManager: collection is required");
        }

        return `${this.prefix}:${collection}`;
    }

    static loadAll(collection) {
        const raw = localStorage.getItem(this.getKey(collection));

        if (!raw) {
            return [];
        }

        try {
            return JSON.parse(raw);
        } catch (error) {
            console.error("StorageManager loadAll error:", error);
            return [];
        }
    }

    static save(collection, object) {
        if (!object || !object.id) {
            throw new Error("StorageManager: object with id is required");
        }

        const items = this.loadAll(collection);

        if (items.some(item => item.id === object.id)) {
            throw new Error(`StorageManager: object already exists: ${object.id}`);
        }

        object.createdAt = object.createdAt || new Date().toISOString();
        object.updatedAt = new Date().toISOString();

        items.push(object);

        localStorage.setItem(
            this.getKey(collection),
            JSON.stringify(items)
        );

        return object;
    }

    static load(collection, id) {
        return this.loadAll(collection)
            .find(item => item.id === id) || null;
    }

    static update(collection, object) {
        if (!object || !object.id) {
            throw new Error("StorageManager: object with id is required");
        }

        const items = this.loadAll(collection);

        const index = items.findIndex(
            item => item.id === object.id
        );

        if (index === -1) {
            throw new Error(`StorageManager: object not found: ${object.id}`);
        }

        items[index] = {
            ...items[index],
            ...object,
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem(
            this.getKey(collection),
            JSON.stringify(items)
        );

        return items[index];
    }

    /**
     * Save or update an object
     */
    static upsert(collection, object) {

        if (this.exists(collection, object.id)) {
            return this.update(collection, object);
        }

        return this.save(collection, object);
    }

    static delete(collection, id) {

        const items = this.loadAll(collection);

        const filtered = items.filter(
            item => item.id !== id
        );

        localStorage.setItem(
            this.getKey(collection),
            JSON.stringify(filtered)
        );

        return true;
    }

    static exists(collection, id) {
        return this.load(collection, id) !== null;
    }

    static count(collection) {
        return this.loadAll(collection).length;
    }

    static clear(collection) {

        if (!collection) {
            localStorage.clear();
            return true;
        }

        localStorage.removeItem(
            this.getKey(collection)
        );

        return true;
    }

}