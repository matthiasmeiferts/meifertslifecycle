/**
 * ==========================================================
 * MEIFERTS Building Intelligence
 * DecisionManager
 * Version 2.0.0
 * Sprint 6.7
 * Status: Production
 * ==========================================================
 *
 * Phase 1 additions over v1.0.0:
 *   - Constants: STATUSES, DECISIONS, RISK_LEVELS, ACQUISITION_OUTCOMES
 *   - Data: evidenceIds[], findingIds[] fields added (backward compatible)
 *   - Validation: validate(), isValidStatus(), isValidDecision(),
 *                 isValidRiskLevel(), canTransition()
 *   - Status management: updateStatus(), getByStatus(), getByRiskLevel()
 *   - Query: getByBuilding(), getByInspection(), getByFinding()
 *   - Relationships: addEvidence/removeEvidence/getLinkedEvidence,
 *                    addFinding/removeFinding/getLinkedFindings,
 *                    addAssessment/removeAssessment/getLinkedAssessments,
 *                    addRecommendation/removeRecommendation/getLinkedRecommendations
 *   - update() now auto-stamps updatedAt
 *
 * Backward compatible: all 10 v1.0.0 methods preserved with identical signatures.
 * ==========================================================
 */

import StorageManager from "./storage/StorageManager.js";
import EventBus from "./events/EventBus.js";

export default class DecisionManager {

    static collection = "decisions";

    // ==================== CONSTANTS ====================

    static STATUSES = {
        DRAFT:        'Draft',
        UNDER_REVIEW: 'Under Review',
        APPROVED:     'Approved',
        CLOSED:       'Closed',
        REJECTED:     'Rejected'
    };

    static DECISIONS = {
        PENDING:          'Pending',
        PROCEED:          'Proceed',
        REVIEW_REQUIRED:  'Review Required',
        DO_NOT_PROCEED:   'Do Not Proceed'
    };

    static RISK_LEVELS = {
        LOW:      'Low',
        MEDIUM:   'Medium',
        HIGH:     'High',
        CRITICAL: 'Critical'
    };

    static ACQUISITION_OUTCOMES = {
        SUITABLE:              'Suitable for Acquisition',
        CONDITIONAL:           'Conditional Acquisition',
        FURTHER_INVESTIGATION: 'Further Investigation Required',
        NOT_SUITABLE:          'Not Suitable for Acquisition'
    };

    // ==================== CORE CRUD ====================

    /**
     * Create a new decision and persist to localStorage.
     * @param {Object} data - Decision data
     * @param {string} data.id - Required unique ID
     * @param {string} data.caseId - Required case reference
     * @param {string} [data.buildingId] - Optional building reference
     * @param {string} [data.inspectionId] - Optional inspection reference
     * @param {Array}  [data.evidenceIds] - Linked evidence IDs
     * @param {Array}  [data.findingIds] - Linked finding IDs
     * @param {Array}  [data.assessmentIds] - Linked assessment IDs
     * @param {Array}  [data.recommendationIds] - Linked recommendation IDs
     * @returns {Object} Saved decision
     * @throws {Error} If data, id, or caseId is missing
     */
    static create(data) {
        if (!data) throw new Error("DecisionManager: data required");
        if (!data.id) throw new Error("DecisionManager: id required");
        if (!data.caseId) throw new Error("DecisionManager: caseId required");

        const decision = {
            id: data.id,
            caseId: data.caseId,
            buildingId:  data.buildingId  || null,
            inspectionId: data.inspectionId || null,

            evidenceIds:       data.evidenceIds       || [],
            findingIds:        data.findingIds         || [],
            assessmentIds:     data.assessmentIds      || [],
            recommendationIds: data.recommendationIds  || [],

            title:       data.title       || "Decision",
            description: data.description || "",

            decision:                data.decision                || "Pending",
            confidence:              data.confidence              || 0,
            acquisitionRecommendation: data.acquisitionRecommendation || "Further Investigation Required",
            riskLevel:               data.riskLevel               || "Medium",
            decisionReason:          data.decisionReason          || "",
            approvedBy:              data.approvedBy              || "",
            status:                  data.status                  || "Draft",

            createdBy: data.createdBy || "System",
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const saved = StorageManager.upsert(this.collection, decision);
        EventBus.emit("decision:created", saved);
        EventBus.emit("decision:changed", saved);
        return saved;
    }

    /**
     * Load one decision by ID.
     * @param {string} id - Decision ID
     * @returns {Object|null} Decision or null
     */
    static load(id) {
        return StorageManager.load(this.collection, id);
    }

    /**
     * Load all decisions.
     * @returns {Array} All decisions
     */
    static getAll() {
        return StorageManager.loadAll(this.collection);
    }

    /**
     * Get all decisions for a specific case.
     * @param {string} caseId - Case ID
     * @returns {Array}
     */
    static getByCase(caseId) {
        return this.getAll().filter(d => d.caseId === caseId);
    }

    /**
     * Update an existing decision.
     * @param {Object} data - Decision data with id
     * @returns {Object} Updated decision
     * @throws {Error} If id is missing
     */
    static update(data) {
        if (!data || !data.id) throw new Error("DecisionManager: id required");
        const updated = StorageManager.update(this.collection, { ...data, updatedAt: new Date().toISOString() });
        EventBus.emit("decision:updated", updated);
        EventBus.emit("decision:changed", updated);
        return updated;
    }

    /**
     * Save or update a decision.
     * @param {Object} data - Decision data with id
     * @returns {Object} Saved decision
     * @throws {Error} If id is missing
     */
    static upsert(data) {
        if (!data || !data.id) throw new Error("DecisionManager: id required");
        const saved = StorageManager.upsert(this.collection, data);
        EventBus.emit("decision:saved", saved);
        EventBus.emit("decision:changed", saved);
        return saved;
    }

    /**
     * Delete a decision by ID.
     * @param {string} id - Decision ID
     * @returns {boolean} True on success
     */
    static delete(id) {
        StorageManager.delete(this.collection, id);
        EventBus.emit("decision:deleted", { id });
        EventBus.emit("decision:changed", { id });
        return true;
    }

    /**
     * Count total decisions.
     * @returns {number}
     */
    static count() {
        return StorageManager.count(this.collection);
    }

    /**
     * Count decisions for a specific case.
     * @param {string} caseId - Case ID
     * @returns {number}
     */
    static countByCase(caseId) {
        return this.getByCase(caseId).length;
    }

    /**
     * Create a decision pre-filled from recommendation and assessment arrays.
     * Outcome and risk level are derived from the highest-risk inputs.
     * @param {string} caseId - Case ID
     * @param {Array}  [recommendations=[]] - Source recommendation objects
     * @param {Array}  [assessments=[]] - Source assessment objects
     * @returns {Object} Created decision
     */
    static createFromRecommendations(caseId, recommendations = [], assessments = []) {
        let highestRisk = "Low";
        let confidence = 75;

        if (recommendations.some(r => r.priority === "High")) {
            // highestPriority used for future expansion
        }

        if (assessments.some(a => a.riskScore >= 60)) {
            highestRisk = "High";
            confidence = 90;
        }

        return this.create({
            id:          `decision-${Date.now()}`,
            caseId,
            recommendationIds: recommendations.map(r => r.id),
            assessmentIds:     assessments.map(a => a.id),
            title:       "Acquisition Decision",
            description: "Automatically generated decision based on current assessments and recommendations.",
            decision:    highestRisk === "High" ? "Review Required" : "Proceed",
            acquisitionRecommendation: highestRisk === "High"
                ? "Further Investigation Required"
                : "Suitable for Acquisition",
            riskLevel:     highestRisk,
            confidence,
            decisionReason: "Generated from Assessment and Recommendation modules.",
            approvedBy: "",
            status:    "Draft",
            createdBy: "System"
        });
    }

    // ==================== VALIDATION ====================

    /**
     * Validate decision data. Returns an array of error strings.
     * @param {Object} data - Decision data to validate
     * @returns {string[]} Validation errors (empty array if valid)
     */
    static validate(data) {
        const errors = [];
        if (!data) { errors.push("Decision data is required"); return errors; }
        if (!data.id) errors.push("Decision ID is required");
        if (!data.caseId) errors.push("Case ID is required");
        if (!data.title || data.title.trim() === "") errors.push("Title is required");
        if (data.status && !this.isValidStatus(data.status)) {
            errors.push(`Invalid status: ${data.status}`);
        }
        if (data.decision && !this.isValidDecision(data.decision)) {
            errors.push(`Invalid decision outcome: ${data.decision}`);
        }
        if (data.riskLevel && !this.isValidRiskLevel(data.riskLevel)) {
            errors.push(`Invalid risk level: ${data.riskLevel}`);
        }
        if (data.confidence !== null && data.confidence !== undefined) {
            if (typeof data.confidence !== "number" || data.confidence < 0 || data.confidence > 100) {
                errors.push("Confidence must be a number between 0 and 100");
            }
        }
        return errors;
    }

    /**
     * Check if a status value is valid.
     * @param {string} status
     * @returns {boolean}
     */
    static isValidStatus(status) {
        return Object.values(this.STATUSES).includes(status);
    }

    /**
     * Check if a decision outcome value is valid.
     * @param {string} decision
     * @returns {boolean}
     */
    static isValidDecision(decision) {
        return Object.values(this.DECISIONS).includes(decision);
    }

    /**
     * Check if a risk level value is valid.
     * @param {string} riskLevel
     * @returns {boolean}
     */
    static isValidRiskLevel(riskLevel) {
        return Object.values(this.RISK_LEVELS).includes(riskLevel);
    }

    /**
     * Check if a status transition is allowed.
     * @param {string} fromStatus - Current status
     * @param {string} toStatus   - Target status
     * @returns {boolean}
     */
    static canTransition(fromStatus, toStatus) {
        const workflow = {
            'Draft':        ['Under Review', 'Draft'],
            'Under Review': ['Approved', 'Rejected', 'Draft', 'Under Review'],
            'Approved':     ['Closed', 'Under Review', 'Approved'],
            'Rejected':     ['Closed', 'Draft', 'Rejected'],
            'Closed':       ['Closed']
        };
        return (workflow[fromStatus] || []).includes(toStatus);
    }

    // ==================== STATUS MANAGEMENT ====================

    /**
     * Update decision status with workflow enforcement.
     * @param {string} id        - Decision ID
     * @param {string} newStatus - Target status
     * @returns {Object} Updated decision
     * @throws {Error} If not found or transition is invalid
     */
    static updateStatus(id, newStatus) {
        const decision = this.load(id);
        if (!decision) throw new Error(`DecisionManager: decision not found: ${id}`);
        if (!this.isValidStatus(newStatus)) throw new Error(`DecisionManager: invalid status: ${newStatus}`);
        if (!this.canTransition(decision.status, newStatus)) {
            throw new Error(`DecisionManager: invalid transition ${decision.status} → ${newStatus}`);
        }
        const updated = StorageManager.update(this.collection, {
            ...decision,
            status: newStatus,
            updatedAt: new Date().toISOString()
        });
        EventBus.emit("decision:status-changed", { id, status: newStatus });
        EventBus.emit("decision:changed", updated);
        return updated;
    }

    /**
     * Get all decisions with a specific status.
     * @param {string} status
     * @returns {Array}
     */
    static getByStatus(status) {
        return this.getAll().filter(d => d.status === status);
    }

    /**
     * Get all decisions with a specific risk level.
     * @param {string} riskLevel
     * @returns {Array}
     */
    static getByRiskLevel(riskLevel) {
        return this.getAll().filter(d => d.riskLevel === riskLevel);
    }

    // ==================== QUERY METHODS ====================

    /**
     * Get all decisions for a specific building.
     * @param {string} buildingId
     * @returns {Array}
     */
    static getByBuilding(buildingId) {
        return this.getAll().filter(d => d.buildingId === buildingId);
    }

    /**
     * Get all decisions for a specific inspection.
     * @param {string} inspectionId
     * @returns {Array}
     */
    static getByInspection(inspectionId) {
        return this.getAll().filter(d => d.inspectionId === inspectionId);
    }

    /**
     * Get all decisions linked to a specific finding.
     * @param {string} findingId
     * @returns {Array}
     */
    static getByFinding(findingId) {
        return this.getAll().filter(d => (d.findingIds || []).includes(findingId));
    }

    // ==================== RELATIONSHIP METHODS ====================

    /**
     * Add an evidence ID to a decision (with duplicate prevention).
     * @param {string} decisionId - Decision ID
     * @param {string} evidenceId - Evidence ID to add
     * @returns {Object} Updated decision
     * @throws {Error} If decision not found
     */
    static addEvidence(decisionId, evidenceId) {
        const decision = this.load(decisionId);
        if (!decision) throw new Error(`DecisionManager: decision not found: ${decisionId}`);
        if (!(decision.evidenceIds || []).includes(evidenceId)) {
            decision.evidenceIds = [...(decision.evidenceIds || []), evidenceId];
            return this.update({ ...decision, updatedAt: new Date().toISOString() });
        }
        return decision;
    }

    /**
     * Remove an evidence ID from a decision.
     * @param {string} decisionId - Decision ID
     * @param {string} evidenceId - Evidence ID to remove
     * @returns {Object} Updated decision
     * @throws {Error} If decision not found
     */
    static removeEvidence(decisionId, evidenceId) {
        const decision = this.load(decisionId);
        if (!decision) throw new Error(`DecisionManager: decision not found: ${decisionId}`);
        decision.evidenceIds = (decision.evidenceIds || []).filter(id => id !== evidenceId);
        return this.update({ ...decision, updatedAt: new Date().toISOString() });
    }

    /**
     * Get all evidence IDs linked to a decision.
     * @param {string} decisionId - Decision ID
     * @returns {string[]}
     */
    static getLinkedEvidence(decisionId) {
        const decision = this.load(decisionId);
        return decision ? (decision.evidenceIds || []) : [];
    }

    /**
     * Add a finding ID to a decision (with duplicate prevention).
     * @param {string} decisionId - Decision ID
     * @param {string} findingId  - Finding ID to add
     * @returns {Object} Updated decision
     * @throws {Error} If decision not found
     */
    static addFinding(decisionId, findingId) {
        const decision = this.load(decisionId);
        if (!decision) throw new Error(`DecisionManager: decision not found: ${decisionId}`);
        if (!(decision.findingIds || []).includes(findingId)) {
            decision.findingIds = [...(decision.findingIds || []), findingId];
            return this.update({ ...decision, updatedAt: new Date().toISOString() });
        }
        return decision;
    }

    /**
     * Remove a finding ID from a decision.
     * @param {string} decisionId - Decision ID
     * @param {string} findingId  - Finding ID to remove
     * @returns {Object} Updated decision
     * @throws {Error} If decision not found
     */
    static removeFinding(decisionId, findingId) {
        const decision = this.load(decisionId);
        if (!decision) throw new Error(`DecisionManager: decision not found: ${decisionId}`);
        decision.findingIds = (decision.findingIds || []).filter(id => id !== findingId);
        return this.update({ ...decision, updatedAt: new Date().toISOString() });
    }

    /**
     * Get all finding IDs linked to a decision.
     * @param {string} decisionId - Decision ID
     * @returns {string[]}
     */
    static getLinkedFindings(decisionId) {
        const decision = this.load(decisionId);
        return decision ? (decision.findingIds || []) : [];
    }

    /**
     * Add an assessment ID to a decision (with duplicate prevention).
     * @param {string} decisionId   - Decision ID
     * @param {string} assessmentId - Assessment ID to add
     * @returns {Object} Updated decision
     * @throws {Error} If decision not found
     */
    static addAssessment(decisionId, assessmentId) {
        const decision = this.load(decisionId);
        if (!decision) throw new Error(`DecisionManager: decision not found: ${decisionId}`);
        if (!(decision.assessmentIds || []).includes(assessmentId)) {
            decision.assessmentIds = [...(decision.assessmentIds || []), assessmentId];
            return this.update({ ...decision, updatedAt: new Date().toISOString() });
        }
        return decision;
    }

    /**
     * Remove an assessment ID from a decision.
     * @param {string} decisionId   - Decision ID
     * @param {string} assessmentId - Assessment ID to remove
     * @returns {Object} Updated decision
     * @throws {Error} If decision not found
     */
    static removeAssessment(decisionId, assessmentId) {
        const decision = this.load(decisionId);
        if (!decision) throw new Error(`DecisionManager: decision not found: ${decisionId}`);
        decision.assessmentIds = (decision.assessmentIds || []).filter(id => id !== assessmentId);
        return this.update({ ...decision, updatedAt: new Date().toISOString() });
    }

    /**
     * Get all assessment IDs linked to a decision.
     * @param {string} decisionId - Decision ID
     * @returns {string[]}
     */
    static getLinkedAssessments(decisionId) {
        const decision = this.load(decisionId);
        return decision ? (decision.assessmentIds || []) : [];
    }

    /**
     * Add a recommendation ID to a decision (with duplicate prevention).
     * @param {string} decisionId        - Decision ID
     * @param {string} recommendationId  - Recommendation ID to add
     * @returns {Object} Updated decision
     * @throws {Error} If decision not found
     */
    static addRecommendation(decisionId, recommendationId) {
        const decision = this.load(decisionId);
        if (!decision) throw new Error(`DecisionManager: decision not found: ${decisionId}`);
        if (!(decision.recommendationIds || []).includes(recommendationId)) {
            decision.recommendationIds = [...(decision.recommendationIds || []), recommendationId];
            return this.update({ ...decision, updatedAt: new Date().toISOString() });
        }
        return decision;
    }

    /**
     * Remove a recommendation ID from a decision.
     * @param {string} decisionId        - Decision ID
     * @param {string} recommendationId  - Recommendation ID to remove
     * @returns {Object} Updated decision
     * @throws {Error} If decision not found
     */
    static removeRecommendation(decisionId, recommendationId) {
        const decision = this.load(decisionId);
        if (!decision) throw new Error(`DecisionManager: decision not found: ${decisionId}`);
        decision.recommendationIds = (decision.recommendationIds || []).filter(id => id !== recommendationId);
        return this.update({ ...decision, updatedAt: new Date().toISOString() });
    }

    /**
     * Get all recommendation IDs linked to a decision.
     * @param {string} decisionId - Decision ID
     * @returns {string[]}
     */
    static getLinkedRecommendations(decisionId) {
        const decision = this.load(decisionId);
        return decision ? (decision.recommendationIds || []) : [];
    }

}