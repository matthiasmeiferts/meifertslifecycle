/**
 * MEIFERTS Building Intelligence
 * Intelligence Engine
 * Foundation Framework 3.0
 *
 * Centralizes reusable confidence, readiness and signal logic for dashboard,
 * case, building and workflow intelligence snapshots.
 */

export default class IntelligenceEngine {

    static defaultWorkflowStages = [
        "evidence",
        "finding",
        "assessment",
        "recommendation",
        "decision",
        "report"
    ];

    static buildingLifecycleStages = [
        "inspection",
        "evidence",
        "finding",
        "assessment",
        "recommendation",
        "decision",
        "report"
    ];

    static inspectionStages = [
        "inspection",
        "evidence",
        "finding",
        "assessment"
    ];

    static clampScore(value = 0) {
        const number = Number(value);

        if (Number.isNaN(number)) {
            return 0;
        }

        return Math.max(0, Math.min(100, Math.round(number)));
    }

    static getArray(value) {
        return Array.isArray(value) ? value : [];
    }

    static countItems(value) {
        return this.getArray(value).length;
    }

    static getWorkflowCounts(data = {}) {
        return {
            inspection: this.countItems(data.inspections),
            evidence: this.countItems(data.evidence || data.evidences),
            finding: this.countItems(data.findings),
            assessment: this.countItems(data.assessments),
            recommendation: this.countItems(data.recommendations),
            decision: this.countItems(data.decisions),
            report: this.countItems(data.reports)
        };
    }

    static getStageReadiness(counts = {}, stages = this.defaultWorkflowStages) {
        const totalStages = stages.length;
        const completedStages = stages.filter((stage) => (counts[stage] || 0) > 0).length;
        const percent = totalStages > 0
            ? this.clampScore((completedStages / totalStages) * 100)
            : 0;

        return {
            completedStages,
            totalStages,
            percent,
            isComplete: completedStages === totalStages
        };
    }

    static getConfidenceScore({
        readinessPercent = 0,
        primarySignals = 0,
        downstreamSignals = 0,
        outputSignals = 0,
        weights = {}
    } = {}) {
        const readinessWeight = weights.readiness ?? 0.6;
        const primaryWeight = weights.primary ?? 4;
        const downstreamWeight = weights.downstream ?? 3;
        const outputWeight = weights.output ?? 4;

        return this.clampScore(
            readinessPercent * readinessWeight +
            Math.min(primarySignals, 10) * primaryWeight +
            Math.min(downstreamSignals, 8) * downstreamWeight +
            Math.min(outputSignals, 4) * outputWeight
        );
    }

    static getSignalLevel(value = 0, thresholds = { moderate: 4, high: 8 }) {
        if (value >= thresholds.high) {
            return "ready";
        }

        if (value >= thresholds.moderate) {
            return "active";
        }

        return "draft";
    }

    static createSignal({
        value = 0,
        thresholds = { moderate: 4, high: 8 },
        low,
        moderate,
        high
    } = {}) {
        const tone = this.getSignalLevel(value, thresholds);

        if (tone === "ready") {
            return {
                tone,
                ...high
            };
        }

        if (tone === "active") {
            return {
                tone,
                ...moderate
            };
        }

        return {
            tone,
            ...low
        };
    }

    static getFirstOpenStage(counts = {}, stages = this.defaultWorkflowStages) {
        return stages.find((stage) => (counts[stage] || 0) === 0) || null;
    }

    static filterByRelation(items = [], relation = {}) {
        const list = this.getArray(items);
        const {
            caseId,
            buildingId,
            inspectionId
        } = relation;

        if (!caseId && !buildingId && !inspectionId) {
            return list;
        }

        return list.filter((item) => {
            const matchesCase =
                caseId &&
                (
                    item.caseId === caseId ||
                    item.linkedCaseId === caseId ||
                    item.case === caseId
                );

            const matchesBuilding =
                buildingId &&
                (
                    item.buildingId === buildingId ||
                    item.linkedBuildingId === buildingId ||
                    item.building === buildingId
                );

            const matchesInspection =
                inspectionId &&
                (
                    item.inspectionId === inspectionId ||
                    item.linkedInspectionId === inspectionId ||
                    item.inspection === inspectionId
                );

            return Boolean(matchesCase || matchesBuilding || matchesInspection);
        });
    }

    static getEntityId(entity = {}, key = "id") {
        return entity[key] || entity.id || "";
    }

    static hasAny(entity = {}, keys = []) {
        return keys.some((key) => Boolean(entity[key]));
    }

    static getReadinessFromChecks(checks = []) {
        const total = checks.length;
        const completed = checks.filter(Boolean).length;
        const percent = total > 0
            ? this.clampScore((completed / total) * 100)
            : 0;

        return {
            completed,
            total,
            percent,
            isComplete: completed === total
        };
    }

    static getReadinessLabel(percent = 0, labels = {}) {
        if (percent >= 100) {
            return labels.complete || "Intelligence complete";
        }

        if (percent >= 50) {
            return labels.developing || "Intelligence developing";
        }

        return labels.early || "Intelligence early";
    }
}