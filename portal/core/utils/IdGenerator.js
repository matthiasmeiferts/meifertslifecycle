/**
 * ==========================================================
 * MEIFERTS Building Intelligence
 * IdGenerator
 * Version 1.0.0
 * ==========================================================
 */

export default class IdGenerator {

    static counters = {};

    /**
     * Generate a unique ID
     * Example:
     * BLD-202600001
     * EVD-202600015
     * REP-202600102
     */
    static generate(prefix = "OBJ") {

        const year = new Date().getFullYear();

        if (!this.counters[prefix]) {
            this.counters[prefix] = 1;
        }

        const number = String(this.counters[prefix]++)
            .padStart(7, "0");

        return `${prefix}-${year}${number}`;
    }

}