/**
 * ==========================================================
 * MEIFERTS Building Intelligence
 * RecommendationManager
 * Version 2.0.0
 * Sprint 6.7
 * Status: Production
 * ==========================================================
 *
 * Phase 1 additions over v1.0.0:
 *   - Constants: STATUSES, PRIORITIES, TIMEFRAMES, DECISION_IMPACTS
 *   - Validation: validate(), isValidStatus(), isValidPriority(),
 *                 isValidTimeframe(), canTransition()
 *   - Status management: updateStatus(), getByStatus(), getByPriority()
 *   - Query: getByBuilding(), getByInspection(), getByFinding()
 *   - Relationships: addFinding(), removeFinding(), getLinkedFindings(),
 *                    addAssessment(), removeAssessment(), getLinkedAssessments()
 *   - update() now auto-stamps updatedAt
 *
 * Backward compatible: all 11 v1.0.0 methods preserved with identical signatures.
 * ==========================================================
 */

import StorageManager from "./storage/StorageManager.js";
import CaseManager from "./CaseManager.js";
import EventBus from "./events/EventBus.js";

export default class RecommendationManager {

    static collection = "recommendations";

    static activeKey = "activeRecommendationId";

    static defaultCreator = "System";

    // ==================== CONSTANTS ====================

    static STATUSES = {
        DRAFT:        'Draft',
        UNDER_REVIEW: 'Under Review',
        ACCEPTED:     'Accepted',
        CLOSED:       'Closed',
        REJECTED:     'Rejected'
    };

    static PRIORITIES = {
        LOW:      'Low',
        MEDIUM:   'Medium',
        HIGH:     'High',
        CRITICAL: 'Critical'
    };

    static TIMEFRAMES = {
        IMMEDIATE:  'Immediate',
        SHORT_TERM: 'Short Term',
        PLANNED:    'Planned',
        DEFERRED:   'Deferred'
    };

    static DECISION_IMPACTS = {
        LOW:      'Low',
        MEDIUM:   'Medium',
        HIGH:     'High',
        CRITICAL: 'Critical'
    };

    // ==================== CORE CRUD ====================

    /**
     * Create a new recommendation and persist to localStorage.
     * @param {Object} data - Recommendation data
     * @param {string} data.id - Required unique ID
     * @param {string} data.caseId - Required case reference
     * @param {string} [data.buildingId] - Optional building reference
     * @param {string} [data.inspectionId] - Optional inspection reference
     * @param {Array}  [data.assessmentIds] - Linked assessment IDs
     * @param {Array}  [data.findingIds] - Linked finding IDs
     * @returns {Object} Saved recommendation
     * @throws {Error} If data, id, or caseId is missing
     */
    static create(data) {
        if (!data) throw new Error("RecommendationManager: data required");
        if (!data.caseId) throw new Error("RecommendationManager: caseId required");

        const recommendation = {
            id: data.id || this.createId(),
            caseId: data.caseId,
            buildingId:  data.buildingId  || null,
            inspectionId: data.inspectionId || null,

            assessmentIds: data.assessmentIds || [],
            findingIds:    data.findingIds    || [],
            evidenceIds:   data.evidenceIds   || [],

            sourceAssessmentIds: data.sourceAssessmentIds || data.assessmentIds || [],
            sourceFindingIds: data.sourceFindingIds || data.findingIds || [],
            sourceEvidenceIds: data.sourceEvidenceIds || data.evidenceIds || [],

            title:       data.title       || "Recommendation",
            description: data.description || "",
            action:      data.action      || "",

            source:         data.source         || "Assessment Review",
            buildingSystem: data.buildingSystem || "",
            riskScore:      data.riskScore      || 0,

            sourceQuestionId: data.sourceQuestionId || "",
            sourceQuestion: data.sourceQuestion || "",
            sourceModule: data.sourceModule || "",
            sourceCategory: data.sourceCategory || "",
            sourcePolicy: data.sourcePolicy || "",
            sourceRequiredEvidenceRaw: data.sourceRequiredEvidenceRaw || "",

            // Foundation 1.1-D2: Evidence metadata trace from assessment
            sourceFileName: data.sourceFileName || "",
            sourceFileType: data.sourceFileType || "",
            sourceFileReference: data.sourceFileReference || "",
            sourceCaptureMethod: data.sourceCaptureMethod || "",
            sourceLocationLabel: data.sourceLocationLabel || "",
            sourceInspectionArea: data.sourceInspectionArea || "",
            sourceMeasurementValue: data.sourceMeasurementValue ?? null,
            sourceMeasurementUnit: data.sourceMeasurementUnit || "",
            sourceReviewStatus: data.sourceReviewStatus || "",
            sourceExpertReviewRequired: data.sourceExpertReviewRequired !== undefined
                ? data.sourceExpertReviewRequired
                : true,

            profile: data.profile || "",
            country: data.country || "",
            region: data.region || "",

            priority:       data.priority       || "Medium",
            timeframe:      data.timeframe      || "Short Term",
            estimatedCost:  data.estimatedCost  || 0,
            currency:       data.currency       || "EUR",
            responsible:    data.responsible    || "",
            status:         data.status         || "Draft",
            reviewStatus: data.reviewStatus || "Draft",
            expertReviewRequired: data.expertReviewRequired !== undefined
                ? data.expertReviewRequired
                : true,
            noAutomaticDecision: data.noAutomaticDecision !== undefined
                ? data.noAutomaticDecision
                : true,
            decisionImpact: data.decisionImpact || "Medium",

            createdBy: data.createdBy || this.defaultCreator,
            updatedBy: data.updatedBy || data.createdBy || this.defaultCreator,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const saved = StorageManager.upsert(this.collection, recommendation);
        EventBus.emit("recommendation:created", saved);
        EventBus.emit("recommendation:changed", saved);
        return saved;
    }

    /**
     * Load one recommendation by ID.
     * @param {string} id - Recommendation ID
     * @returns {Object|null} Recommendation or null
     */
    static load(id) {
        return StorageManager.load(this.collection, id);
    }

    /**
     * Load all recommendations.
     * @returns {Array} All recommendations
     */
    static getAll() {
        return StorageManager.loadAll(this.collection);
    }

    /**
     * Get all recommendations for a specific case.
     * @param {string} caseId - Case ID
     * @returns {Array}
     */
    static getByCase(caseId) {
        return this.getAll().filter(r => r.caseId === caseId);
    }

    /**
     * Get all recommendations linked to a specific assessment.
     * @param {string} assessmentId - Assessment ID
     * @returns {Array}
     */
    static getByAssessment(assessmentId) {
        return this.getAll().filter(r => (r.assessmentIds || []).includes(assessmentId));
    }

    /**
     * Update an existing recommendation.
     * @param {Object} data - Recommendation data with id
     * @returns {Object} Updated recommendation
     * @throws {Error} If id is missing
     */
    static update(data) {
        if (!data || !data.id) throw new Error("RecommendationManager: id required");

        const existing = this.load(data.id);

        if (!existing) {
            throw new Error(`RecommendationManager: recommendation not found: ${data.id}`);
        }

        const updated = StorageManager.update(this.collection, {
            ...existing,
            ...data,
            id: data.id,
            updatedAt: new Date().toISOString()
        });

        EventBus.emit("recommendation:updated", updated);
        EventBus.emit("recommendation:changed", updated);
        return updated;
    }

    /**
     * Save or update a recommendation.
     * @param {Object} data - Recommendation data with id
     * @returns {Object} Saved recommendation
     * @throws {Error} If id is missing
     */
    static upsert(data) {
        if (!data || !data.id) throw new Error("RecommendationManager: id required");
        const saved = StorageManager.upsert(this.collection, data);
        EventBus.emit("recommendation:saved", saved);
        EventBus.emit("recommendation:changed", saved);
        return saved;
    }

    /**
     * Delete a recommendation by ID.
     * @param {string} id - Recommendation ID
     * @returns {boolean} True on success
     */
    static delete(id) {
        StorageManager.delete(this.collection, id);
        if (this.get()?.id === id) {
            this.clear();
        }
        EventBus.emit("recommendation:deleted", { id });
        EventBus.emit("recommendation:changed", { id });
        return true;
    }

    /**
     * Count total recommendations.
     * @returns {number}
     */
    static count() {
        return StorageManager.count(this.collection);
    }

    /**
     * Count recommendations for a specific case.
     * @param {string} caseId - Case ID
     * @returns {number}
     */
    static countByCase(caseId) {
        return this.getByCase(caseId).length;
    }

    /**
     * Set the active recommendation.
     * @param {Object} recommendation - Recommendation object
     * @returns {Object|null} The recommendation if valid
     */
    static set(recommendation) {
        if (!recommendation || !recommendation.id) {
            return null;
        }

        const currentCase = CaseManager.getCurrent();

        if (currentCase && recommendation.caseId && recommendation.caseId !== currentCase.id) {
            localStorage.removeItem(this.activeKey);
            return null;
        }

        localStorage.setItem(this.activeKey, recommendation.id);
        EventBus.emit("recommendation:selected", recommendation);

        return recommendation;
    }

    /**
     * Get the active recommendation.
     * @returns {Object|null} Active recommendation or null
     */
    static get() {
        const id = localStorage.getItem(this.activeKey);
        const active = id ? this.load(id) : null;
        const currentCase = CaseManager.getCurrent();

        if (!currentCase) {
            return active;
        }

        if (active && active.caseId === currentCase.id) {
            return active;
        }

        const fallback = this.getByCase(currentCase.id)[0] || null;

        if (fallback) {
            localStorage.setItem(this.activeKey, fallback.id);
            return fallback;
        }

        localStorage.removeItem(this.activeKey);
        return null;
    }

    /**
     * Clear the active recommendation.
     */
    static clear() {
        localStorage.removeItem(this.activeKey);
        EventBus.emit("recommendation:cleared", null);
    }

    /**
     * Create a unique ID for a new recommendation.
     * @returns {string} Generated ID
     */
    static createId() {
        return `REC-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    }

    /**
     * Create a recommendation pre-filled from an assessment object.
     * Timeframe and decisionImpact are derived from the assessment risk score.
     * @param {Object} assessment - Source assessment
     * @returns {Object} Created recommendation
     */
    static createFromAssessment(assessment) {
        return this.create({
            caseId:      assessment.caseId,
            buildingId:  assessment.buildingId,
            inspectionId: assessment.inspectionId,
            assessmentIds: [assessment.id],
            findingIds:  assessment.findingIds || [],
            title:       assessment.title,
            description: "Recommendation generated from assessment.",
            action:      "Review and implement corrective action.",
            priority:    assessment.priority || "Medium",
            timeframe:   assessment.riskScore >= 60 ? "Immediate"
                       : assessment.riskScore >= 30 ? "Short Term"
                       : "Planned",
            estimatedCost:  0,
            currency:       "EUR",
            responsible:    "Owner",
            decisionImpact: assessment.riskScore >= 60 ? "High" : "Medium",
            status:    "Draft",
            createdBy: this.defaultCreator
        });
    }

    // ==================== VALIDATION ====================

    /**
     * Validate recommendation data. Returns an array of error strings.
     * @param {Object} data - Recommendation data to validate
     * @returns {string[]} Validation errors (empty array if valid)
     */
    static validate(data) {
        const errors = [];
        if (!data) { errors.push("Recommendation data is required"); return errors; }
        if (!data.id) errors.push("Recommendation ID will be generated automatically");
        if (!data.caseId) errors.push("Case ID is required");
        if (!data.title || data.title.trim() === "") errors.push("Title is required");
        if (data.status && !this.isValidStatus(data.status)) {
            errors.push(`Invalid status: ${data.status}`);
        }
        if (data.priority && !this.isValidPriority(data.priority)) {
            errors.push(`Invalid priority: ${data.priority}`);
        }
        if (data.timeframe && !this.isValidTimeframe(data.timeframe)) {
            errors.push(`Invalid timeframe: ${data.timeframe}`);
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
     * Check if a priority value is valid.
     * @param {string} priority
     * @returns {boolean}
     */
    static isValidPriority(priority) {
        return Object.values(this.PRIORITIES).includes(priority);
    }

    /**
     * Check if a timeframe value is valid.
     * @param {string} timeframe
     * @returns {boolean}
     */
    static isValidTimeframe(timeframe) {
        return Object.values(this.TIMEFRAMES).includes(timeframe);
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
            'Under Review': ['Accepted', 'Rejected', 'Draft', 'Under Review'],
            'Accepted':     ['Closed', 'Under Review', 'Accepted'],
            'Rejected':     ['Closed', 'Draft', 'Rejected'],
            'Closed':       ['Closed']
        };
        return (workflow[fromStatus] || []).includes(toStatus);
    }

    // ==================== STATUS MANAGEMENT ====================

    /**
     * Update recommendation status with workflow enforcement.
     * @param {string} id        - Recommendation ID
     * @param {string} newStatus - Target status
     * @returns {Object} Updated recommendation
     * @throws {Error} If not found or transition is invalid
     */
    static updateStatus(id, newStatus) {
        const recommendation = this.load(id);
        if (!recommendation) throw new Error(`RecommendationManager: recommendation not found: ${id}`);
        if (!this.isValidStatus(newStatus)) throw new Error(`RecommendationManager: invalid status: ${newStatus}`);
        if (!this.canTransition(recommendation.status, newStatus)) {
            throw new Error(`RecommendationManager: invalid transition ${recommendation.status} → ${newStatus}`);
        }
        const updated = StorageManager.update(this.collection, {
            ...recommendation,
            status: newStatus,
            updatedAt: new Date().toISOString()
        });
        EventBus.emit("recommendation:status-changed", { id, status: newStatus });
        EventBus.emit("recommendation:changed", updated);
        return updated;
    }

    /**
     * Get all recommendations with a specific status.
     * @param {string} status
     * @returns {Array}
     */
    static getByStatus(status) {
        return this.getAll().filter(r => r.status === status);
    }

    /**
     * Get all recommendations with a specific priority.
     * @param {string} priority
     * @returns {Array}
     */
    static getByPriority(priority) {
        return this.getAll().filter(r => r.priority === priority);
    }

    // ==================== QUERY METHODS ====================

    /**
     * Get all recommendations for a specific building.
     * @param {string} buildingId
     * @returns {Array}
     */
    static getByBuilding(buildingId) {
        return this.getAll().filter(r => r.buildingId === buildingId);
    }

    /**
     * Get all recommendations for a specific inspection.
     * @param {string} inspectionId
     * @returns {Array}
     */
    static getByInspection(inspectionId) {
        return this.getAll().filter(r => r.inspectionId === inspectionId);
    }

    /**
     * Get all recommendations linked to a specific finding.
     * @param {string} findingId
     * @returns {Array}
     */
    static getByFinding(findingId) {
        return this.getAll().filter(r => (r.findingIds || []).includes(findingId));
    }

    // ==================== RELATIONSHIP METHODS ====================

    /**
     * Add a finding ID to a recommendation (with duplicate prevention).
     * @param {string} recommendationId - Recommendation ID
     * @param {string} findingId        - Finding ID to add
     * @returns {Object} Updated recommendation
     * @throws {Error} If recommendation not found
     */
    static addFinding(recommendationId, findingId) {
        const recommendation = this.load(recommendationId);
        if (!recommendation) throw new Error(`RecommendationManager: recommendation not found: ${recommendationId}`);
        if (!(recommendation.findingIds || []).includes(findingId)) {
            recommendation.findingIds = [...(recommendation.findingIds || []), findingId];
            return this.update({ ...recommendation, updatedAt: new Date().toISOString() });
        }
        return recommendation;
    }

    /**
     * Remove a finding ID from a recommendation.
     * @param {string} recommendationId - Recommendation ID
     * @param {string} findingId        - Finding ID to remove
     * @returns {Object} Updated recommendation
     * @throws {Error} If recommendation not found
     */
    static removeFinding(recommendationId, findingId) {
        const recommendation = this.load(recommendationId);
        if (!recommendation) throw new Error(`RecommendationManager: recommendation not found: ${recommendationId}`);
        recommendation.findingIds = (recommendation.findingIds || []).filter(id => id !== findingId);
        return this.update({ ...recommendation, updatedAt: new Date().toISOString() });
    }

    /**
     * Get all finding IDs linked to a recommendation.
     * @param {string} recommendationId - Recommendation ID
     * @returns {string[]} Array of finding IDs
     */
    static getLinkedFindings(recommendationId) {
        const recommendation = this.load(recommendationId);
        return recommendation ? (recommendation.findingIds || []) : [];
    }

    /**
     * Add an assessment ID to a recommendation (with duplicate prevention).
     * @param {string} recommendationId - Recommendation ID
     * @param {string} assessmentId     - Assessment ID to add
     * @returns {Object} Updated recommendation
     * @throws {Error} If recommendation not found
     */
    static addAssessment(recommendationId, assessmentId) {
        const recommendation = this.load(recommendationId);
        if (!recommendation) throw new Error(`RecommendationManager: recommendation not found: ${recommendationId}`);
        if (!(recommendation.assessmentIds || []).includes(assessmentId)) {
            recommendation.assessmentIds = [...(recommendation.assessmentIds || []), assessmentId];
            return this.update({ ...recommendation, updatedAt: new Date().toISOString() });
        }
        return recommendation;
    }

    /**
     * Remove an assessment ID from a recommendation.
     * @param {string} recommendationId - Recommendation ID
     * @param {string} assessmentId     - Assessment ID to remove
     * @returns {Object} Updated recommendation
     * @throws {Error} If recommendation not found
     */
    static removeAssessment(recommendationId, assessmentId) {
        const recommendation = this.load(recommendationId);
        if (!recommendation) throw new Error(`RecommendationManager: recommendation not found: ${recommendationId}`);
        recommendation.assessmentIds = (recommendation.assessmentIds || []).filter(id => id !== assessmentId);
        return this.update({ ...recommendation, updatedAt: new Date().toISOString() });
    }

    /**
     * Get all assessment IDs linked to a recommendation.
     * @param {string} recommendationId - Recommendation ID
     * @returns {string[]} Array of assessment IDs
     */
    static getLinkedAssessments(recommendationId) {
        const recommendation = this.load(recommendationId);
        return recommendation ? (recommendation.assessmentIds || []) : [];
    }

}