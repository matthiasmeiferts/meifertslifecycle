/**
 * MEIFERTS Building Intelligence
 * Case Manager
 * Version: 1.0.0
 */

export default class CaseManager {

    static currentCase = null;

    static open(caseData) {
        this.currentCase = caseData;
        console.log("Case opened:", caseData);
    }

    static getCurrent() {
        return this.currentCase;
    }

    static hasOpenCase() {
        return this.currentCase !== null;
    }

    static close() {
        this.currentCase = null;
        console.log("Case closed");
    }

}