/**
 * ==========================================================
 * MEIFERTS Building Intelligence
 * AssessmentManager
 * Version 1.0.0
 * Sprint 6.6
 * Status: Production
 * ==========================================================
 */

import StorageManager from "./storage/StorageManager.js";
import EventBus from "./events/EventBus.js";

export default class AssessmentManager {

    static collection = "assessments";

    /**
     * Create assessment
     */
    static create(data) {

        if (!data) {
            throw new Error("AssessmentManager: data required");
        }

        if (!data.id) {
            throw new Error("AssessmentManager: id required");
        }

        if (!data.caseId) {
            throw new Error("AssessmentManager: caseId required");
        }

        const assessment = {

            id: data.id,

            caseId: data.caseId,
            buildingId: data.buildingId || null,
            inspectionId: data.inspectionId || null,

            findingIds: data.findingIds || [],

            title: data.title || "Assessment",

            description: data.description || "",

            category: data.category || "General",

            severity: data.severity || "Unrated",

            probability: data.probability || "Unrated",

            consequence: data.consequence || "Unrated",

            confidence: data.confidence || null,

            riskScore: data.riskScore || 0,

            priority: data.priority || "Normal",

            status: data.status || "Draft",

            recommendationIds:
                data.recommendationIds || [],

            createdBy:
                data.createdBy || "System",

            createdAt:
                data.createdAt ||
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString()

        };

        const saved = StorageManager.upsert(

            this.collection,

            assessment

        );

        EventBus.emit(

            "assessment:created",

            saved

        );

        EventBus.emit(

            "assessment:changed",

            saved

        );

        console.log(

            "Assessment created:",

            saved

        );

        return saved;

    }

    /**
     * Load one assessment
     */
    static load(id) {

        return StorageManager.load(

            this.collection,

            id

        );

    }

    /**
     * Load all assessments
     */
    static getAll() {

        return StorageManager.loadAll(

            this.collection

        );

    }

    /**
     * Assessments by case
     */
    static getByCase(caseId) {

        return this.getAll().filter(

            assessment =>

                assessment.caseId === caseId

        );

    }

    /**
     * Assessments by finding
     */
    static getByFinding(findingId) {

        return this.getAll().filter(

            assessment =>

                assessment.findingIds.includes(

                    findingId

                )

        );

    }
    /**
     * Update assessment
     */
    static update(data) {

        if (!data || !data.id) {
            throw new Error("AssessmentManager: id required");
        }

        const updated = StorageManager.update(
            this.collection,
            data
        );

        EventBus.emit("assessment:updated", updated);
        EventBus.emit("assessment:changed", updated);

        return updated;
    }

    /**
     * Save or update assessment
     */
    static upsert(data) {

        if (!data || !data.id) {
            throw new Error("AssessmentManager: id required");
        }

        const saved = StorageManager.upsert(
            this.collection,
            data
        );

        EventBus.emit("assessment:saved", saved);
        EventBus.emit("assessment:changed", saved);

        return saved;
    }

    /**
     * Delete assessment
     */
    static delete(id) {

        StorageManager.delete(
            this.collection,
            id
        );

        EventBus.emit("assessment:deleted", { id });
        EventBus.emit("assessment:changed", { id });

        return true;
    }

    /**
     * Count all assessments
     */
    static count() {

        return StorageManager.count(
            this.collection
        );

    }

    /**
     * Count assessments for one case
     */
    static countByCase(caseId) {

        return this.getByCase(caseId).length;

    }

    /**
     * Calculate simple risk score
     * (temporary algorithm)
     */
    static calculateRiskScore(severity, probability) {

        const values = {
            "Unrated": 0,
            "Low": 1,
            "Medium": 2,
            "High": 3,
            "Critical": 4
        };

        return (
            (values[severity] || 0) *
            (values[probability] || 0)
        ) * 10;

    }

    /**
     * Create quick assessment from finding
     */
    static createFromFinding(finding) {

        return this.create({

            id: assessment-${Date.now()},

            caseId: finding.caseId,

            buildingId: finding.buildingId,

            inspectionId: finding.inspectionId,

            findingIds: [finding.id],

            title: finding.title,

            description: finding.description,

            category: finding.category,

            severity: finding.severity,

            probability: finding.probability || "Medium",

            consequence: "Medium",

            confidence: finding.confidence || null,

            riskScore: this.calculateRiskScore(
                finding.severity,
                finding.probability || "Medium"
            ),

            priority: "Normal",

            status: "Draft",

            createdBy: "System"

        });

    }

}