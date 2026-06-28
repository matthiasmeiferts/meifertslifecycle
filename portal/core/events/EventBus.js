/**
 * ==========================================================
 * MEIFERTS Building Intelligence
 * EventBus
 * Version 1.0.0
 * ==========================================================
 */

export default class EventBus {

    static listeners = {};

    static on(eventName, callback) {

        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }

        this.listeners[eventName].push(callback);

    }

    static emit(eventName, data = {}) {

        if (!this.listeners[eventName]) {
            return;
        }

        this.listeners[eventName].forEach(callback => {
            callback(data);
        });

    }

    static off(eventName) {

        delete this.listeners[eventName];

    }

}