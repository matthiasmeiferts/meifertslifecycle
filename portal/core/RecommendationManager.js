/**
 * ==========================================================
 * MEIFERTS Building Intelligence
 * RecommendationManager
 * Version 1.0.0
 * Sprint 6.7
 * Status: Production
 * ==========================================================
 */

import StorageManager from "./storage/StorageManager.js";
import EventBus from "./events/EventBus.js";

export default class RecommendationManager {

    static collection = "recommendations";

    /**
     * Create recommendation
     */
    static create(data) {

        if (!data) {
            throw new Error("RecommendationManager: data required");
        }

        if (!data.id) {
            throw new Error("RecommendationManager: id required");
        }

        if (!data.caseId) {
            throw new Error("RecommendationManager: caseId required");
        }

        const recommendation = {

            id: data.id,

            caseId: data.caseId,
            buildingId: data.buildingId || null,
            inspectionId: data.inspectionId || null,

            assessmentIds: data.assessmentIds || [],
            findingIds: data.findingIds || [],

            title: data.title || "Recommendation",

            description: data.description || "",

            action: data.action || "",

            priority: data.priority || "Medium",

            timeframe: data.timeframe || "Short Term",

            estimatedCost: data.estimatedCost || 0,

            currency: data.currency || "EUR",

            responsible: data.responsible || "",

            status: data.status || "Draft",

            decisionImpact:
                data.decisionImpact || "Medium",

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

            recommendation

        );

        EventBus.emit(

            "recommendation:created",

            saved

        );

        EventBus.emit(

            "recommendation:changed",

            saved

        );

        return saved;

    }

    /**
     * Load recommendation
     */
    static load(id) {

        return StorageManager.load(

            this.collection,

            id

        );

    }

    /**
     * Load all recommendations
     */
    static getAll() {

        return StorageManager.loadAll(

            this.collection

        );

    }

    /**
     * Recommendations by case
     */
    static getByCase(caseId) {

        return this.getAll().filter(

            recommendation =>

                recommendation.caseId === caseId

        );

    }

    /**
     * Recommendations by assessment
     */
    static getByAssessment(assessmentId) {

        return this.getAll().filter(

            recommendation =>

                recommendation.assessmentIds.includes(

                    assessmentId

                )

        );

    }
    /**
     * Update recommendation
     */
    static update(data) {

        if (!data || !data.id) {
            throw new Error("RecommendationManager: id required");
        }

        const updated = StorageManager.update(
            this.collection,
            data
        );

        EventBus.emit("recommendation:updated", updated);
        EventBus.emit("recommendation:changed", updated);

        return updated;
    }

    /**
     * Save or update recommendation
     */
    static upsert(data) {

        if (!data || !data.id) {
            throw new Error("RecommendationManager: id required");
        }

        const saved = StorageManager.upsert(
            this.collection,
            data
        );

        EventBus.emit("recommendation:saved", saved);
        EventBus.emit("recommendation:changed", saved);

        return saved;
    }

    /**
     * Delete recommendation
     */
    static delete(id) {

        StorageManager.delete(
            this.collection,
            id
        );

        EventBus.emit("recommendation:deleted", { id });
        EventBus.emit("recommendation:changed", { id });

        return true;
    }

    /**
     * Count all recommendations
     */
    static count() {

        return StorageManager.count(
            this.collection
        );

    }

    /**
     * Count recommendations by case
     */
    static countByCase(caseId) {

        return this.getByCase(caseId).length;

    }

    /**
     * Create recommendation from assessment
     */
    static createFromAssessment(assessment) {

        return this.create({

            id: `recommendation-${Date.now()}`,

            caseId: assessment.caseId,
            buildingId: assessment.buildingId,
            inspectionId: assessment.inspectionId,

            assessmentIds: [assessment.id],
            findingIds: assessment.findingIds || [],

            title: assessment.title,

            description:
                "Recommendation generated from assessment.",

            action:
                "Review and implement corrective action.",

            priority:
                assessment.priority || "Medium",

            timeframe:
                assessment.riskScore >= 60
                    ? "Immediate"
                    : assessment.riskScore >= 30
                        ? "Short Term"
                        : "Planned",

            estimatedCost: 0,
            currency: "EUR",

            responsible: "Owner",

            decisionImpact:
                assessment.riskScore >= 60
                    ? "High"
                    : "Medium",

            status: "Draft",

            createdBy: "System"

        });

    }

}