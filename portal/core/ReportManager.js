/**
 * ==========================================================
 * MEIFERTS Building Intelligence
 * ReportManager
 * Version 1.0.0
 * Sprint 6.9
 * Status: Production
 * ==========================================================
 */

import StorageManager from "./storage/StorageManager.js";
import EventBus from "./events/EventBus.js";

export default class ReportManager {

    static collection = "reports";

    static create(data = {}) {
        if (!data.caseId) {
            throw new Error("ReportManager: caseId required");
        }

        const report = {
            id: data.id || `report-${Date.now()}`,

            caseId: data.caseId,
            buildingId: data.buildingId || null,
            inspectionId: data.inspectionId || null,

            title: data.title || "Professional Building Intelligence Report",
            reportType: data.reportType || "Technical Due Diligence",
            version: data.version || "1.0.0",

            executiveSummary: data.executiveSummary || "",
            scope: data.scope || "",
            methodology: data.methodology || "",

            findings: data.findings || [],
            assessments: data.assessments || [],
            recommendations: data.recommendations || [],
            decisions: data.decisions || [],
            evidence: data.evidence || [],

            riskSummary: data.riskSummary || this.createRiskSummary(data.assessments || []),
            capexSummary: data.capexSummary || this.createCapexSummary(data.recommendations || []),
            decisionSummary: data.decisionSummary || this.createDecisionSummary(data.decisions || []),

            status: data.status || "Draft",

            preparedBy: data.preparedBy || "MEIFERTS Building Intelligence",
            reviewedBy: data.reviewedBy || "",
            approvedBy: data.approvedBy || "",

            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const saved = StorageManager.upsert(this.collection, report);

        EventBus.emit("report:created", saved);
        EventBus.emit("report:changed", saved);

        return saved;
    }

    static load(id) {
        return StorageManager.load(this.collection, id);
    }

    static getAll() {
        return StorageManager.loadAll(this.collection);
    }

    static getByCase(caseId) {
        return this.getAll().filter(report => report.caseId === caseId);
    }

    static update(data = {}) {
        if (!data.id) {
            throw new Error("ReportManager: id required");
        }

        const saved = StorageManager.update(this.collection, {
            ...data,
            updatedAt: new Date().toISOString()
        });

        EventBus.emit("report:updated", saved);
        EventBus.emit("report:changed", saved);

        return saved;
    }

    static upsert(data = {}) {
        if (!data.id) {
            throw new Error("ReportManager: id required");
        }

        const saved = StorageManager.upsert(this.collection, {
            ...data,
            updatedAt: new Date().toISOString()
        });

        EventBus.emit("report:saved", saved);
        EventBus.emit("report:changed", saved);

        return saved;
    }

    static delete(id) {
        StorageManager.delete(this.collection, id);

        EventBus.emit("report:deleted", { id });
        EventBus.emit("report:changed", { id });

        return true;
    }

    static count() {
        return StorageManager.count(this.collection);
    }

    static createRiskSummary(assessments = []) {
        const scores = assessments
            .map(item => item.riskScore || 0)
            .filter(score => typeof score === "number");

        const highestRiskScore = scores.length ? Math.max(...scores) : 0;
        const averageRiskScore = scores.length
            ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
            : 0;

        return {
            assessmentCount: assessments.length,
            highestRiskScore,
            averageRiskScore,
            overallRiskLevel: this.getRiskLevel(highestRiskScore)
        };
    }

    static createCapexSummary(recommendations = []) {
        const capexMin = recommendations.reduce(
            (sum, item) => sum + (item.capexMin || 0),
            0
        );

        const capexMax = recommendations.reduce(
            (sum, item) => sum + (item.capexMax || 0),
            0
        );

        return {
            recommendationCount: recommendations.length,
            capexMin,
            capexMax,
            capexClass: this.getCapexClass(capexMax)
        };
    }

    static createDecisionSummary(decisions = []) {
        return {
            decisionCount: decisions.length,
            latestDecision: decisions.length
                ? decisions[decisions.length - 1].decision
                : "Pending",
            acquisitionRecommendation: decisions.length
                ? decisions[decisions.length - 1].acquisitionRecommendation
                : "Further Investigation Required"
        };
    }

    static generateExecutiveSummary(data = {}) {
        const riskLevel = data.riskSummary?.overallRiskLevel || "Medium";
        const acquisitionRecommendation =
            data.decisionSummary?.acquisitionRecommendation ||
            "Further Investigation Required";

        return `This report summarizes the technical due diligence findings, risk assessment, recommendations and decision support for the selected property. The current overall risk level is ${riskLevel}. The acquisition recommendation is: ${acquisitionRecommendation}.`;
    }

    static generateFromWorkflow(data = {}) {
        const report = {
            caseId: data.caseId,
            buildingId: data.buildingId || null,
            inspectionId: data.inspectionId || null,

            findings: data.findings || [],
            assessments: data.assessments || [],
            recommendations: data.recommendations || [],
            decisions: data.decisions || [],
            evidence: data.evidence || []
        };

        report.riskSummary = this.createRiskSummary(report.assessments);
        report.capexSummary = this.createCapexSummary(report.recommendations);
        report.decisionSummary = this.createDecisionSummary(report.decisions);
        report.executiveSummary = this.generateExecutiveSummary(report);

        return this.create(report);
    }

    static approve(id, approvedBy = "") {
        const report = this.load(id);

        return this.update({
            ...report,
            id,
            status: "Approved",
            approvedBy
        });
    }

    static archive(id) {
        const report = this.load(id);

        return this.update({
            ...report,
            id,
            status: "Archived"
        });
    }

    static getRiskLevel(score = 0) {
        if (score >= 90) return "Critical";
        if (score >= 75) return "High";
        if (score >= 50) return "Medium";
        if (score >= 25) return "Low";
        return "Informational";
    }

    static getCapexClass(capexMax = 0) {
        if (capexMax >= 100000) return "Critical";
        if (capexMax >= 50000) return "Major";
        if (capexMax >= 10000) return "Moderate";
        return "Minor";
    }

}   