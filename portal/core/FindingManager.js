/**
 * ==========================================================
 * MEIFERTS Building Intelligence
 * FindingManager
 * Version 2.0.0 Phase 1
 * Sprint 6.7
 * Status: Production
 * ==========================================================
 * 
 * Finding management system with validation, status workflow,
 * and relationship tracking. Phase 1 focuses on core features.
 * 
 * BACKWARD COMPATIBLE: All v1.0.0 methods preserved.
 * NEW FEATURES: Validation, status workflow, relationships.
 */

import StorageManager from "./storage/StorageManager.js";
import CaseManager from "./CaseManager.js";
import EventBus from "./events/EventBus.js";

export default class FindingManager {

    static collection = "findings";
    static activeKey = "activeFindingId";

    static defaultCreator = "System";

    // ==================== CONSTANTS ====================

    /**
     * Finding workflow statuses
     * Workflow: Draft → Under Review → Accepted/Rejected → Closed
     */
    static STATUSES = {
        DRAFT: 'Draft',
        UNDER_REVIEW: 'Under Review',
        ACCEPTED: 'Accepted',
        CLOSED: 'Closed',
        REJECTED: 'Rejected'
    };

    /**
     * Severity levels for findings
     */
    static SEVERITIES = {
        UNRATED: 'Unrated',
        LOW: 'Low',
        MEDIUM: 'Medium',
        HIGH: 'High',
        CRITICAL: 'Critical'
    };

    /**
     * Priority levels for findings
     */
    static PRIORITIES = {
        LOW: 'Low',
        MEDIUM: 'Medium',
        HIGH: 'High',
        CRITICAL: 'Critical'
    };

    // ==================== CORE CRUD METHODS ====================

    /**
     * Create a new finding
     * 
     * @param {Object} data - Finding data
     * @param {string} data.id - Unique finding ID (required)
     * @param {string} data.caseId - Parent case ID (required)
     * @param {string} data.title - Finding title
     * @param {string} data.buildingId - Optional building reference
     * @param {string} data.inspectionId - Optional inspection reference
     * @param {Array} data.evidenceIds - Optional evidence IDs
     * @returns {Object} Created finding
     * @throws {Error} If id or caseId missing
     */
    static create(data) {

        if (!data) {
            throw new Error("FindingManager: data is required");
        }

        if (!data.caseId) {
            throw new Error("FindingManager: caseId is required");
        }

        const finding = {
            id: data.id || this.createId(),
            caseId: data.caseId,
            buildingId: data.buildingId || null,
            inspectionId: data.inspectionId || null,

            evidenceIds: data.evidenceIds || [],
            sourceEvidenceIds: data.sourceEvidenceIds || data.evidenceIds || [],

            title: data.title || "Untitled Finding",
            description: data.description || "",
            category: data.category || "General",
            buildingSystem: data.buildingSystem || "",
            location: data.location || "",

            sourceQuestionId: data.sourceQuestionId || "",
            sourceQuestion: data.sourceQuestion || "",
            sourceModule: data.sourceModule || "",
            sourceCategory: data.sourceCategory || "",
            sourcePolicy: data.sourcePolicy || "",
            sourceRequiredEvidenceRaw: data.sourceRequiredEvidenceRaw || "",

            profile: data.profile || "",
            country: data.country || "",
            region: data.region || "",

            severity: data.severity || "Unrated",
            probability: data.probability || "Unrated",
            urgency: data.urgency || "Unrated",
            priority: data.priority || "Medium",
            confidence: data.confidence || null,

            status: data.status || "Draft",
            reviewStatus: data.reviewStatus || "Draft",
            expertReviewRequired: data.expertReviewRequired !== undefined
                ? data.expertReviewRequired
                : true,
            source: data.source || "Expert Review",

            recommendationIds: data.recommendationIds || [],
            assessmentIds: data.assessmentIds || [],

            createdBy: data.createdBy || this.defaultCreator,
            updatedBy: data.updatedBy || data.createdBy || this.defaultCreator,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const saved = StorageManager.upsert(this.collection, finding);

        EventBus.emit("finding:created", saved);
        EventBus.emit("finding:changed", saved);

        return saved;
    }

    /**
     * Load finding by ID
     * 
        * @param {string} id - Finding ID
     * @returns {Object|null} Finding object or null if not found
     */
    static load(id) {
        return StorageManager.load(this.collection, id);
    }

    /**
     * Get all findings
     * 
     * @returns {Array} Array of all findings
     */
    static getAll() {
        return StorageManager.loadAll(this.collection);
    }

    /**
     * Get findings for a case
     * 
     * @param {string} caseId - Case ID
     * @returns {Array} Findings for case
     */
    static getByCase(caseId) {
        return this.getAll().filter(finding => finding.caseId === caseId);
    }

    /**
     * Get findings linked to evidence
     * 
     * @param {string} evidenceId - Evidence ID
     * @returns {Array} Findings linked to evidence
     */
    static getByEvidence(evidenceId) {
        return this.getAll().filter(finding =>
            finding.evidenceIds.includes(evidenceId)
        );
    }

    /**
     * Update finding
     * 
     * @param {Object} data - Finding data with id
     * @returns {Object} Updated finding
     * @throws {Error} If finding not found
     */
    static update(data) {

        if (!data || !data.id) {
            throw new Error("FindingManager: finding with id is required");
        }

        const existing = this.load(data.id);

        if (!existing) {
            throw new Error(`FindingManager: finding not found: ${data.id}`);
        }

        const updated = StorageManager.update(this.collection, {
            ...existing,
            ...data,
            id: data.id,
            updatedAt: new Date().toISOString()
        });

        EventBus.emit("finding:updated", updated);
        EventBus.emit("finding:changed", updated);

        return updated;
    }

    /**
     * Save or update finding
     * 
     * @param {Object} data - Finding data
     * @returns {Object} Saved finding
     * @throws {Error} If id missing
     */
    static upsert(data) {

        if (!data || !data.id) {
            throw new Error("FindingManager: finding with id is required");
        }

        const saved = StorageManager.upsert(this.collection, data);

        EventBus.emit("finding:saved", saved);
        EventBus.emit("finding:changed", saved);

        return saved;
    }

    /**
     * Delete finding
     * 
     * @param {string} id - Finding ID
     * @returns {boolean} True if deleted
     */
    static delete(id) {

        const result = StorageManager.delete(this.collection, id);
        if (this.get()?.id === id) {
            this.clear();
        }

        EventBus.emit("finding:deleted", { id });
        EventBus.emit("finding:changed", { id });

        return result;
    }

    /**
     * Count findings for a case
     * 
     * @param {string} caseId - Case ID
     * @returns {number} Finding count
     */
    static countByCase(caseId) {
        return this.getByCase(caseId).length;
    }

    /**
     * Count all findings
     * 
     * @returns {number} Total finding count
     */
    static count() {
        return StorageManager.count(this.collection);
    }

    static set(finding) {
        if (!finding || !finding.id) {
            return null;
        }

        const currentCase = CaseManager.getCurrent();

        if (currentCase && finding.caseId && finding.caseId !== currentCase.id) {
            localStorage.removeItem(this.activeKey);
            return null;
        }

        localStorage.setItem(this.activeKey, finding.id);
        EventBus.emit("finding:selected", finding);

        return finding;
    }

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

    static clear() {
        localStorage.removeItem(this.activeKey);
        EventBus.emit("finding:cleared", null);
    }

    static createId() {
        return `FND-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    }

    // ==================== VALIDATION METHODS ====================

    /**
     * Validate complete finding object
     * 
     * @param {Object} data - Finding data to validate
     * @returns {Array} Array of validation errors (empty if valid)
     */
    static validate(data) {
        const errors = [];

        if (!data) {
            errors.push("Finding data is required");
            return errors;
        }

        if (!data.id) errors.push("Finding ID will be generated automatically");
        if (!data.caseId) errors.push("Case ID is required");
        if (!data.title || data.title.trim() === "") {
            errors.push("Title is required");
        }
        if (data.status && !Object.values(this.STATUSES).includes(data.status)) {
            errors.push(`Invalid status: ${data.status}`);
        }
        if (data.severity && !Object.values(this.SEVERITIES).includes(data.severity)) {
            errors.push(`Invalid severity: ${data.severity}`);
        }
        if (data.priority && !Object.values(this.PRIORITIES).includes(data.priority)) {
            errors.push(`Invalid priority: ${data.priority}`);
        }
        if (data.confidence !== null && data.confidence !== undefined &&
            (typeof data.confidence !== 'number' || data.confidence < 0 || data.confidence > 100)) {
            errors.push("Confidence must be between 0-100");
        }

        return errors;
    }

    /**
     * Check if status is valid
     * 
     * @param {string} status - Status to validate
     * @returns {boolean} True if valid
     */
    static isValidStatus(status) {
        return Object.values(this.STATUSES).includes(status);
    }

    /**
     * Check if severity is valid
     * 
     * @param {string} severity - Severity to validate
     * @returns {boolean} True if valid
     */
    static isValidSeverity(severity) {
        return Object.values(this.SEVERITIES).includes(severity);
    }

    /**
     * Check if priority is valid
     * 
     * @param {string} priority - Priority to validate
     * @returns {boolean} True if valid
     */
    static isValidPriority(priority) {
        return Object.values(this.PRIORITIES).includes(priority);
    }

    /**
     * Check if status transition is allowed
     * 
     * @param {string} fromStatus - Current status
     * @param {string} toStatus - New status
     * @returns {boolean} True if transition allowed
     */
    static canTransition(fromStatus, toStatus) {
        const workflow = {
            'Draft': ['Under Review', 'Draft'],
            'Under Review': ['Accepted', 'Rejected', 'Draft', 'Under Review'],
            'Accepted': ['Closed', 'Under Review', 'Accepted'],
            'Rejected': ['Closed', 'Draft', 'Rejected'],
            'Closed': ['Closed']
        };

        return (workflow[fromStatus] || []).includes(toStatus);
    }

    // ==================== STATUS MANAGEMENT ====================

    /**
     * Update finding status with validation
     * 
     * @param {string} findingId - Finding ID
     * @param {string} newStatus - New status
     * @returns {Object} Updated finding
     * @throws {Error} If status invalid or transition not allowed
     */
    static updateStatus(findingId, newStatus) {
        const finding = this.load(findingId);
        if (!finding) {
            throw new Error(`Finding ${findingId} not found`);
        }

        if (!this.isValidStatus(newStatus)) {
            throw new Error(`Invalid status: ${newStatus}`);
        }

        if (!this.canTransition(finding.status, newStatus)) {
            throw new Error(
                `Cannot transition from ${finding.status} to ${newStatus}`
            );
        }

        finding.status = newStatus;
        finding.updatedAt = new Date().toISOString();

        const updated = this.update(finding);
        EventBus.emit("finding:status-changed", { id: findingId, status: newStatus });

        return updated;
    }

    /**
     * Get findings by status
     * 
     * @param {string} status - Status to filter
     * @returns {Array} Findings with status
     */
    static getByStatus(status) {
        return this.getAll().filter(finding => finding.status === status);
    }

    /**
     * Get findings by severity
     * 
     * @param {string} severity - Severity to filter
     * @returns {Array} Findings with severity
     */
    static getBySeverity(severity) {
        return this.getAll().filter(finding => finding.severity === severity);
    }

    /**
     * Get findings by priority
     * 
     * @param {string} priority - Priority to filter
     * @returns {Array} Findings with priority
     */
    static getByPriority(priority) {
        return this.getAll().filter(finding => finding.priority === priority);
    }

    /**
     * Get findings by building
     * 
     * @param {string} buildingId - Building ID
     * @returns {Array} Findings for building
     */
    static getByBuilding(buildingId) {
        return this.getAll().filter(finding => finding.buildingId === buildingId);
    }

    /**
     * Get findings by inspection
     * 
     * @param {string} inspectionId - Inspection ID
     * @returns {Array} Findings for inspection
     */
    static getByInspection(inspectionId) {
        return this.getAll().filter(finding => finding.inspectionId === inspectionId);
    }

    // ==================== RELATIONSHIP MANAGEMENT ====================

    /**
     * Link evidence to finding
     * 
     * @param {string} findingId - Finding ID
     * @param {string} evidenceId - Evidence ID to link
     * @returns {Object} Updated finding
     * @throws {Error} If finding not found
     */
    static addEvidence(findingId, evidenceId) {
        const finding = this.load(findingId);
        if (!finding) throw new Error(`Finding ${findingId} not found`);

        if (!finding.evidenceIds.includes(evidenceId)) {
            finding.evidenceIds.push(evidenceId);
        }

        finding.updatedAt = new Date().toISOString();
        return this.update(finding);
    }

    /**
     * Remove evidence from finding
     * 
     * @param {string} findingId - Finding ID
     * @param {string} evidenceId - Evidence ID to remove
     * @returns {Object} Updated finding
     * @throws {Error} If finding not found
     */
    static removeEvidence(findingId, evidenceId) {
        const finding = this.load(findingId);
        if (!finding) throw new Error(`Finding ${findingId} not found`);

        finding.evidenceIds = finding.evidenceIds.filter(id => id !== evidenceId);
        finding.updatedAt = new Date().toISOString();

        return this.update(finding);
    }

    /**
     * Get evidence linked to finding
     * 
     * @param {string} findingId - Finding ID
     * @returns {Array} Evidence IDs
     */
    static getLinkedEvidence(findingId) {
        const finding = this.load(findingId);
        return finding ? (finding.evidenceIds || []) : [];
    }

    /**
     * Link recommendation to finding
     * 
     * @param {string} findingId - Finding ID
     * @param {string} recommendationId - Recommendation ID to link
     * @returns {Object} Updated finding
     * @throws {Error} If finding not found
     */
    static addRecommendation(findingId, recommendationId) {
        const finding = this.load(findingId);
        if (!finding) throw new Error(`Finding ${findingId} not found`);

        if (!finding.recommendationIds.includes(recommendationId)) {
            finding.recommendationIds.push(recommendationId);
        }

        finding.updatedAt = new Date().toISOString();
        return this.update(finding);
    }

    /**
     * Remove recommendation from finding
     * 
     * @param {string} findingId - Finding ID
     * @param {string} recommendationId - Recommendation ID to remove
     * @returns {Object} Updated finding
     * @throws {Error} If finding not found
     */
    static removeRecommendation(findingId, recommendationId) {
        const finding = this.load(findingId);
        if (!finding) throw new Error(`Finding ${findingId} not found`);

        finding.recommendationIds = finding.recommendationIds.filter(id => id !== recommendationId);
        finding.updatedAt = new Date().toISOString();

        return this.update(finding);
    }

    /**
     * Get recommendations linked to finding
     * 
     * @param {string} findingId - Finding ID
     * @returns {Array} Recommendation IDs
     */
    static getLinkedRecommendations(findingId) {
        const finding = this.load(findingId);
        return finding ? (finding.recommendationIds || []) : [];
    }

    /**
     * Link assessment to finding
     * 
     * @param {string} findingId - Finding ID
     * @param {string} assessmentId - Assessment ID to link
     * @returns {Object} Updated finding
     * @throws {Error} If finding not found
     */
    static addAssessment(findingId, assessmentId) {
        const finding = this.load(findingId);
        if (!finding) throw new Error(`Finding ${findingId} not found`);

        if (!finding.assessmentIds.includes(assessmentId)) {
            finding.assessmentIds.push(assessmentId);
        }

        finding.updatedAt = new Date().toISOString();
        return this.update(finding);
    }

    /**
     * Remove assessment from finding
     * 
     * @param {string} findingId - Finding ID
     * @param {string} assessmentId - Assessment ID to remove
     * @returns {Object} Updated finding
     * @throws {Error} If finding not found
     */
    static removeAssessment(findingId, assessmentId) {
        const finding = this.load(findingId);
        if (!finding) throw new Error(`Finding ${findingId} not found`);

        finding.assessmentIds = finding.assessmentIds.filter(id => id !== assessmentId);
        finding.updatedAt = new Date().toISOString();

        return this.update(finding);
    }

    /**
     * Get assessments linked to finding
     * 
     * @param {string} findingId - Finding ID
     * @returns {Array} Assessment IDs
     */
    static getLinkedAssessments(findingId) {
        const finding = this.load(findingId);
        return finding ? (finding.assessmentIds || []) : [];
    }

}