/**
 * ==========================================================
 * MEIFERTS Building Intelligence
 * DecisionManager
 * Version 1.0.0
 * Sprint 6.8
 * Status: Production
 * ==========================================================
 */

import StorageManager from "./storage/StorageManager.js";
import EventBus from "./events/EventBus.js";

export default class DecisionManager {

    static collection = "decisions";

    static create(data) {

        if (!data) {
            throw new Error("DecisionManager: data required");
        }

        if (!data.id) {
            throw new Error("DecisionManager: id required");
        }

        if (!data.caseId) {
            throw new Error("DecisionManager: caseId required");
        }

        const decision = {

            id: data.id,

            caseId: data.caseId,
            buildingId: data.buildingId || null,
            inspectionId: data.inspectionId || null,

            recommendationIds:
                data.recommendationIds || [],

            assessmentIds:
                data.assessmentIds || [],

            title:
                data.title || "Decision",

            description:
                data.description || "",

            decision:

                data.decision || "Pending",

            confidence:

                data.confidence || 0,

            acquisitionRecommendation:

                data.acquisitionRecommendation ||

                "Further Investigation Required",

            riskLevel:

                data.riskLevel || "Medium",

            decisionReason:

                data.decisionReason || "",

            approvedBy:

                data.approvedBy || "",

            status:

                data.status || "Draft",

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

            decision

        );

        EventBus.emit(

            "decision:created",

            saved

        );

        EventBus.emit(

            "decision:changed",

            saved

        );

        console.log(

            "Decision created:",

            saved

        );

        return saved;

    }

    static load(id){

        return StorageManager.load(

            this.collection,

            id

        );

    }

    static getAll(){

        return StorageManager.loadAll(

            this.collection

        );

    }

    static getByCase(caseId){

        return this.getAll().filter(

            decision =>

                decision.caseId===caseId

        );

    }

        /**
     * Update decision
     */
    static update(data) {

        if (!data || !data.id) {
            throw new Error("DecisionManager: id required");
        }

        const updated = StorageManager.update(
            this.collection,
            data
        );

        EventBus.emit("decision:updated", updated);
        EventBus.emit("decision:changed", updated);

        return updated;
    }

    /**
     * Save or update decision
     */
    static upsert(data) {

        if (!data || !data.id) {
            throw new Error("DecisionManager: id required");
        }

        const saved = StorageManager.upsert(
            this.collection,
            data
        );

        EventBus.emit("decision:saved", saved);
        EventBus.emit("decision:changed", saved);

        return saved;
    }

    /**
     * Delete decision
     */
    static delete(id) {

        StorageManager.delete(
            this.collection,
            id
        );

        EventBus.emit("decision:deleted", { id });
        EventBus.emit("decision:changed", { id });

        return true;
    }

    /**
     * Count decisions
     */
    static count() {

        return StorageManager.count(
            this.collection
        );

    }

    /**
     * Count decisions by case
     */
    static countByCase(caseId) {

        return this.getByCase(caseId).length;

    }

    /**
     * Create decision from recommendations
     */
    static createFromRecommendations(
        caseId,
        recommendations = [],
        assessments = []
    ) {

        let highestPriority = "Low";
        let highestRisk = "Low";
        let confidence = 75;

        if (recommendations.some(r => r.priority === "High")) {
            highestPriority = "High";
        }

        if (assessments.some(a => a.riskScore >= 60)) {
            highestRisk = "High";
            confidence = 90;
        }

        return this.create({

            id: `decision-${Date.now()}`,

            caseId,

            recommendationIds:
                recommendations.map(r => r.id),

            assessmentIds:
                assessments.map(a => a.id),

            title: "Acquisition Decision",

            description:
                "Automatically generated decision based on current assessments and recommendations.",

            decision:
                highestRisk === "High"
                    ? "Review Required"
                    : "Proceed",

            acquisitionRecommendation:
                highestRisk === "High"
                    ? "Further Investigation Required"
                    : "Suitable for Acquisition",

            riskLevel: highestRisk,

            confidence,

            decisionReason:
                "Generated from Assessment and Recommendation modules.",

            approvedBy: "",

            status: "Draft",

            createdBy: "System"

        });

    }

}