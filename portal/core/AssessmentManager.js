/**
 * ==========================================================
 * MEIFERTS Building Intelligence
 * AssessmentManager
 * Version 2.0.0
 * Sprint 6.7
 * Status: Production
 * ==========================================================
 *
 * Phase 1 additions over v1.0.0:
 *   - Constants: STATUSES, SEVERITIES, PROBABILITIES, CONSEQUENCES, PRIORITIES
 *   - Validation: validate(), isValidStatus(), isValidSeverity(),
 *                 isValidPriority(), canTransition()
 *   - Status management: updateStatus(), getByStatus(), getBySeverity()
 *   - Query: getByBuilding(), getByInspection()
 *   - Relationships: addFinding(), removeFinding(), getLinkedFindings(),
 *                    addEvidence(), removeEvidence(), getLinkedEvidence()
 *   - Data: evidenceIds[] field added (backward compatible, defaults to [])
 *   - Bug fixes: template literal in createFromFinding(), removed console.log
 *
 * Backward compatible: all 12 v1.0.0 methods preserved with identical signatures.
 * ==========================================================
 */

import StorageManager from "./storage/StorageManager.js";
import CaseManager from "./CaseManager.js";
import EventBus from "./events/EventBus.js";

export default class AssessmentManager {

    static collection = "assessments";

    static activeKey = "activeAssessmentId";

    static defaultCreator = "System";

    // ==================== CONSTANTS ====================

    static STATUSES = {
        DRAFT:        'Draft',
        UNDER_REVIEW: 'Under Review',
        ACCEPTED:     'Accepted',
        CLOSED:       'Closed',
        REJECTED:     'Rejected'
    };

    static SEVERITIES = {
        UNRATED:  'Unrated',
        LOW:      'Low',
        MEDIUM:   'Medium',
        HIGH:     'High',
        CRITICAL: 'Critical'
    };

    static PROBABILITIES = {
        UNRATED:  'Unrated',
        LOW:      'Low',
        MEDIUM:   'Medium',
        HIGH:     'High',
        CRITICAL: 'Critical'
    };

    static CONSEQUENCES = {
        UNRATED:  'Unrated',
        LOW:      'Low',
        MEDIUM:   'Medium',
        HIGH:     'High',
        CRITICAL: 'Critical'
    };

    static PRIORITIES = {
        LOW:      'Low',
        MEDIUM:   'Medium',
        HIGH:     'High',
        CRITICAL: 'Critical'
    };

    // ==================== CORE CRUD ====================

    /**
     * Create a new assessment and persist to localStorage.
     * @param {Object} data - Assessment data
     * @param {string} data.id - Required unique ID
     * @param {string} data.caseId - Required case reference
     * @param {string} [data.buildingId] - Optional building reference
     * @param {string} [data.inspectionId] - Optional inspection reference
     * @param {Array}  [data.findingIds] - Linked finding IDs
     * @param {Array}  [data.evidenceIds] - Linked evidence IDs
     * @returns {Object} Saved assessment
     * @throws {Error} If data, id, or caseId is missing
     */
    static create(data) {

        if (!data) throw new Error("AssessmentManager: data required");
        if (!data.caseId) throw new Error("AssessmentManager: caseId required");

        const assessment = {

            id: data.id || this.createId(),

            caseId: data.caseId,
            buildingId: data.buildingId || null,
            inspectionId: data.inspectionId || null,

            findingIds:  data.findingIds  || [],
            evidenceIds: data.evidenceIds || [],
            sourceFindingIds: data.sourceFindingIds || data.findingIds || [],
            sourceEvidenceIds: data.sourceEvidenceIds || data.evidenceIds || [],

            title: data.title || "Assessment",

            description: data.description || "",

            category: data.category || "General",
            buildingSystem: data.buildingSystem || "",
            source: data.source || "Finding Review",

            sourceQuestionId: data.sourceQuestionId || "",
            sourceQuestion: data.sourceQuestion || "",
            sourceModule: data.sourceModule || "",
            sourceCategory: data.sourceCategory || "",
            sourcePolicy: data.sourcePolicy || "",
            sourceRequiredEvidenceRaw: data.sourceRequiredEvidenceRaw || "",

            // Foundation 1.1-D1: Evidence metadata trace from finding
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

            severity:    data.severity    || "Unrated",
            probability: data.probability || "Unrated",
            consequence: data.consequence || "Unrated",
            confidence:  data.confidence  || null,

            riskScore: data.riskScore || 0,

            priority: data.priority || "Medium",
            status:   data.status   || "Draft",
            reviewStatus: data.reviewStatus || "Draft",
            expertReviewRequired: data.expertReviewRequired !== undefined
                ? data.expertReviewRequired
                : true,

            recommendationIds: data.recommendationIds || [],

            createdBy: data.createdBy || this.defaultCreator,
            updatedBy: data.updatedBy || data.createdBy || this.defaultCreator,

            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const saved = StorageManager.upsert(this.collection, assessment);
        EventBus.emit("assessment:created", saved);
        EventBus.emit("assessment:changed", saved);
        return saved;
    }

    /**
     * Load one assessment by ID.
     * @param {string} id - Assessment ID
     * @returns {Object|null} Assessment or null
     */
    static load(id) {
        return StorageManager.load(this.collection, id);
    }

    /**
     * Load all assessments.
     * @returns {Array} All assessments
     */
    static getAll() {
        return StorageManager.loadAll(this.collection);
    }

    /**
     * Get all assessments for a specific case.
     * @param {string} caseId - Case ID
     * @returns {Array} Matching assessments
     */
    static getByCase(caseId) {
        return this.getAll().filter(a => a.caseId === caseId);
    }

    /**
     * Get all assessments linked to a specific finding.
     * @param {string} findingId - Finding ID
     * @returns {Array} Matching assessments
     */
    static getByFinding(findingId) {
        return this.getAll().filter(a => (a.findingIds || []).includes(findingId));
    }

    /**
     * Update an existing assessment.
     * @param {Object} data - Assessment data with id
     * @returns {Object} Updated assessment
     * @throws {Error} If id is missing
     */
    static update(data) {
        if (!data || !data.id) throw new Error("AssessmentManager: id required");

        const existing = this.load(data.id);

        if (!existing) {
            throw new Error(`AssessmentManager: assessment not found: ${data.id}`);
        }

        const updated = StorageManager.update(this.collection, {
            ...existing,
            ...data,
            id: data.id,
            updatedAt: new Date().toISOString()
        });

        EventBus.emit("assessment:updated", updated);
        EventBus.emit("assessment:changed", updated);
        return updated;
    }

    /**
     * Save or update an assessment.
     * @param {Object} data - Assessment data with id
     * @returns {Object} Saved assessment
     * @throws {Error} If id is missing
     */
    static upsert(data) {
        if (!data || !data.id) throw new Error("AssessmentManager: id required");
        const saved = StorageManager.upsert(this.collection, data);
        EventBus.emit("assessment:saved", saved);
        EventBus.emit("assessment:changed", saved);
        return saved;
    }

    /**
     * Delete an assessment by ID.
     * @param {string} id - Assessment ID
     * @returns {boolean} True on success
     */
    static delete(id) {
        StorageManager.delete(this.collection, id);
        if (this.get()?.id === id) {
            this.clear();
        }
        EventBus.emit("assessment:deleted", { id });
        EventBus.emit("assessment:changed", { id });
        return true;
    }

    /**
     * Count total assessments.
     * @returns {number}
     */
    static count() {
        return StorageManager.count(this.collection);
    }

    /**
     * Count assessments for a specific case.
     * @param {string} caseId - Case ID
     * @returns {number}
     */
    static countByCase(caseId) {
        return this.getByCase(caseId).length;
    }

    /**
     * Set the active assessment.
     * @param {Object} assessment - Assessment object
     * @returns {Object|null} The assessment if valid
     */
    static set(assessment) {
        if (!assessment || !assessment.id) {
            return null;
        }

        const currentCase = CaseManager.getCurrent();

        if (currentCase && assessment.caseId && assessment.caseId !== currentCase.id) {
            localStorage.removeItem(this.activeKey);
            return null;
        }

        localStorage.setItem(this.activeKey, assessment.id);
        EventBus.emit("assessment:selected", assessment);

        return assessment;
    }

    /**
     * Get the active assessment.
     * @returns {Object|null} Active assessment or null
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
     * Clear the active assessment.
     */
    static clear() {
        localStorage.removeItem(this.activeKey);
        EventBus.emit("assessment:cleared", null);
    }

    /**
     * Create a unique ID for a new assessment.
     * @returns {string} Generated ID
     */
    static createId() {
        return `ASM-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    }

    /**
     * Calculate risk score from severity, probability, and optional consequence.
     * Returns 0-100 scale score.
     * Backward compatible: consequence is optional.
     * @param {string} severity    - Severity level
     * @param {string} probability - Probability level
     * @param {string} [consequence] - Consequence level (optional)
     * @returns {number} Risk score (0–100)
     */
    static calculateRiskScore(severity, probability, consequence = null) {
        const scale = { "Unrated": 0, "Low": 1, "Medium": 2, "High": 3, "Critical": 4 };
        const s = scale[severity]    || 0;
        const p = scale[probability] || 0;
        const c = consequence ? (scale[consequence] || 0) : null;

        if (c !== null) {
            return Math.round(((s + p + c) / 12) * 100);
        }
        return Math.round((s * p) / 16 * 100);
    }

    /**
     * Create a quick assessment pre-filled from a finding object.
     * @param {Object} finding - Source finding
     * @returns {Object} Created assessment
     */
    static createFromFinding(finding) {
        return this.create({
            caseId:      finding.caseId,
            buildingId:  finding.buildingId,
            inspectionId: finding.inspectionId,
            findingIds:  [finding.id],
            title:       finding.title,
            description: finding.description,
            category:    finding.category,
            severity:    finding.severity,
            probability: finding.probability || "Medium",
            consequence: "Medium",
            confidence:  finding.confidence || null,
            riskScore:   this.calculateRiskScore(
                finding.severity,
                finding.probability || "Medium"
            ),
            priority:  "Medium",
            status:    "Draft",
            createdBy: this.defaultCreator
        });
    }

    // ==================== VALIDATION ====================

    /**
     * Validate assessment data. Returns an array of error strings.
     * @param {Object} data - Assessment data to validate
     * @returns {string[]} Validation errors (empty if valid)
     */
    static validate(data) {
        const errors = [];
        if (!data) { errors.push("Assessment data is required"); return errors; }
        if (!data.id) errors.push("Assessment ID will be generated automatically");
        if (!data.caseId) errors.push("Case ID is required");
        if (!data.title || data.title.trim() === "") errors.push("Title is required");
        if (data.status && !this.isValidStatus(data.status)) {
            errors.push(`Invalid status: ${data.status}`);
        }
        if (data.severity && !this.isValidSeverity(data.severity)) {
            errors.push(`Invalid severity: ${data.severity}`);
        }
        if (data.priority && !this.isValidPriority(data.priority)) {
            errors.push(`Invalid priority: ${data.priority}`);
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
     * Check if a severity value is valid.
     * @param {string} severity
     * @returns {boolean}
     */
    static isValidSeverity(severity) {
        return Object.values(this.SEVERITIES).includes(severity);
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
     * Update assessment status with workflow enforcement.
     * @param {string} id        - Assessment ID
     * @param {string} newStatus - Target status
     * @returns {Object} Updated assessment
     * @throws {Error} If assessment not found or transition is invalid
     */
    static updateStatus(id, newStatus) {
        const assessment = this.load(id);
        if (!assessment) throw new Error(`AssessmentManager: assessment not found: ${id}`);
        if (!this.isValidStatus(newStatus)) throw new Error(`AssessmentManager: invalid status: ${newStatus}`);
        if (!this.canTransition(assessment.status, newStatus)) {
            throw new Error(`AssessmentManager: invalid transition ${assessment.status} → ${newStatus}`);
        }
        const updated = StorageManager.update(this.collection, {
            ...assessment,
            status: newStatus,
            updatedAt: new Date().toISOString()
        });
        EventBus.emit("assessment:status-changed", { id, status: newStatus });
        EventBus.emit("assessment:changed", updated);
        return updated;
    }

    /**
     * Get all assessments with a specific status.
     * @param {string} status - Status to filter by
     * @returns {Array}
     */
    static getByStatus(status) {
        return this.getAll().filter(a => a.status === status);
    }

    /**
     * Get all assessments with a specific severity.
     * @param {string} severity - Severity to filter by
     * @returns {Array}
     */
    static getBySeverity(severity) {
        return this.getAll().filter(a => a.severity === severity);
    }

    // ==================== QUERY METHODS ====================

    /**
     * Get all assessments for a specific building.
     * @param {string} buildingId - Building ID
     * @returns {Array}
     */
    static getByBuilding(buildingId) {
        return this.getAll().filter(a => a.buildingId === buildingId);
    }

    /**
     * Get all assessments for a specific inspection.
     * @param {string} inspectionId - Inspection ID
     * @returns {Array}
     */
    static getByInspection(inspectionId) {
        return this.getAll().filter(a => a.inspectionId === inspectionId);
    }

    // ==================== RELATIONSHIP METHODS ====================

    /**
     * Add a finding ID to an assessment (with duplicate prevention).
     * @param {string} assessmentId - Assessment ID
     * @param {string} findingId    - Finding ID to add
     * @returns {Object} Updated assessment
     * @throws {Error} If assessment not found
     */
    static addFinding(assessmentId, findingId) {
        const assessment = this.load(assessmentId);
        if (!assessment) throw new Error(`AssessmentManager: assessment not found: ${assessmentId}`);
        if (!(assessment.findingIds || []).includes(findingId)) {
            assessment.findingIds = [...(assessment.findingIds || []), findingId];
            return this.update({ ...assessment, updatedAt: new Date().toISOString() });
        }
        return assessment;
    }

    /**
     * Remove a finding ID from an assessment.
     * @param {string} assessmentId - Assessment ID
     * @param {string} findingId    - Finding ID to remove
     * @returns {Object} Updated assessment
     * @throws {Error} If assessment not found
     */
    static removeFinding(assessmentId, findingId) {
        const assessment = this.load(assessmentId);
        if (!assessment) throw new Error(`AssessmentManager: assessment not found: ${assessmentId}`);
        assessment.findingIds = (assessment.findingIds || []).filter(id => id !== findingId);
        return this.update({ ...assessment, updatedAt: new Date().toISOString() });
    }

    /**
     * Get all finding IDs linked to an assessment.
     * @param {string} assessmentId - Assessment ID
     * @returns {string[]} Array of finding IDs
     */
    static getLinkedFindings(assessmentId) {
        const assessment = this.load(assessmentId);
        return assessment ? (assessment.findingIds || []) : [];
    }

    /**
     * Add an evidence ID to an assessment (with duplicate prevention).
     * @param {string} assessmentId - Assessment ID
     * @param {string} evidenceId   - Evidence ID to add
     * @returns {Object} Updated assessment
     * @throws {Error} If assessment not found
     */
    static addEvidence(assessmentId, evidenceId) {
        const assessment = this.load(assessmentId);
        if (!assessment) throw new Error(`AssessmentManager: assessment not found: ${assessmentId}`);
        if (!(assessment.evidenceIds || []).includes(evidenceId)) {
            assessment.evidenceIds = [...(assessment.evidenceIds || []), evidenceId];
            return this.update({ ...assessment, updatedAt: new Date().toISOString() });
        }
        return assessment;
    }

    /**
     * Remove an evidence ID from an assessment.
     * @param {string} assessmentId - Assessment ID
     * @param {string} evidenceId   - Evidence ID to remove
     * @returns {Object} Updated assessment
     * @throws {Error} If assessment not found
     */
    static removeEvidence(assessmentId, evidenceId) {
        const assessment = this.load(assessmentId);
        if (!assessment) throw new Error(`AssessmentManager: assessment not found: ${assessmentId}`);
        assessment.evidenceIds = (assessment.evidenceIds || []).filter(id => id !== evidenceId);
        return this.update({ ...assessment, updatedAt: new Date().toISOString() });
    }

    /**
     * Get all evidence IDs linked to an assessment.
     * @param {string} assessmentId - Assessment ID
     * @returns {string[]} Array of evidence IDs
     */
    static getLinkedEvidence(assessmentId) {
        const assessment = this.load(assessmentId);
        return assessment ? (assessment.evidenceIds || []) : [];
    }

}