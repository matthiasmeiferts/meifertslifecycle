/**
 * ==========================================================
 * MEIFERTS Building Intelligence
 * EvidenceManager
 * Version 2.0.0
 * Sprint 6.7
 * Status: Production
 * ==========================================================
 * 
 * Complete evidence management system for the MEIFERTS platform.
 * Handles evidence items (photos, documents, notes, measurements)
 * with full CRUD, validation, relationships, and batch operations.
 * 
 * BACKWARD COMPATIBLE: All existing methods from v1.0.1 preserved.
 * NEW FEATURES: Validation, relationships, batch ops, statistics.
 */

import StorageManager from "./storage/StorageManager.js";
import EventBus from "./events/EventBus.js";

export default class EvidenceManager {

    static collection = "evidence";
    static activeKey = "activeEvidenceId";

    static defaultCreator = "System";

    // ==================== CONSTANTS ====================

    /**
     * Evidence types
     */
    static TYPES = {
        PHOTO: 'photo',
        DOCUMENT: 'document',
        NOTE: 'note',
        MEASUREMENT: 'measurement'
    };

    /**
     * Workflow statuses for evidence
     * Workflow: Captured → Classified → Review → Assigned
     */
    static STATUSES = {
        CAPTURED: 'Captured',
        CLASSIFIED: 'Classified',
        REVIEW: 'Review',
        ASSIGNED: 'Assigned'
    };

    /**
     * Severity levels for evidence
     */
    static SEVERITIES = {
        UNRATED: 'Unrated',
        LOW: 'Low',
        MEDIUM: 'Medium',
        HIGH: 'High',
        CRITICAL: 'Critical'
    };

    /**
     * Evidence categories
     */
    static CATEGORIES = {
        GENERAL: 'General',
        STRUCTURAL: 'Structural',
        MECHANICAL: 'Mechanical',
        ELECTRICAL: 'Electrical',
        ENVELOPE: 'Envelope',
        INTERIOR: 'Interior',
        SITE: 'Site',
        GOVERNANCE: 'Governance'
    };

    // ==================== CORE CRUD METHODS ====================

    /**
     * Create a new evidence item
     * 
     * @param {Object} data - Evidence data
     * @param {string} data.id - Unique evidence ID (required)
     * @param {string} data.caseId - Parent case ID (required)
     * @param {string} data.type - Type: photo|document|note|measurement
     * @param {string} data.title - Evidence title
     * @param {string} data.description - Detailed description
     * @param {string} data.location - Physical location
     * @param {string} data.buildingSystem - Building system category
     * @param {string} data.severity - Severity: Unrated|Low|Medium|High|Critical
     * @param {string} data.category - Category classification
     * @param {string} data.status - Status: Captured|Classified|Review|Assigned
     * @param {string} data.buildingId - Parent building ID
     * @param {string} data.inspectionId - Parent inspection ID
     * @param {Array} data.findingIds - Linked finding IDs
     * @param {Array} data.assessmentIds - Linked assessment IDs
     * @param {Array} data.tags - Search tags
     * @param {string} data.componentId - Building component reference
     * @param {number} data.confidence - Confidence level 0-100
     * @param {string} data.createdBy - Creator identifier
     * 
     * @returns {Object} Created evidence object
     * @throws {Error} If required fields missing
     */
    static create(data) {
        if (!data) throw new Error("EvidenceManager: data required");
        if (!data.caseId) throw new Error("EvidenceManager: caseId required");

        const evidence = {
            id: data.id || this.createId(),
            caseId: data.caseId,
            buildingId: data.buildingId || null,
            inspectionId: data.inspectionId || null,
            
            type: data.type || "photo",
            category: data.category || "General",
            title: data.title || "",
            description: data.description || "",
            location: data.location || "",
            buildingSystem: data.buildingSystem || "",
            
            severity: data.severity || "Unrated",
            status: data.status || "Captured",
            
            // NEW: Relationship tracking
            findingIds: data.findingIds || [],
            assessmentIds: data.assessmentIds || [],
            
            // NEW: Tagging and metadata
            tags: data.tags || [],
            componentId: data.componentId || null,

            source: data.source || "",
            sourceType: data.sourceType || "",
            sourceQuestionId: data.sourceQuestionId || "",
            sourceQuestion: data.sourceQuestion || "",
            sourceModule: data.sourceModule || "",
            sourceCategory: data.sourceCategory || "",
            sourceRequiredEvidence: data.sourceRequiredEvidence || [],
            scopeId: data.scopeId || null,

            confidence: data.confidence || null,
            
            createdBy: data.createdBy || this.defaultCreator,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const saved = StorageManager.upsert(this.collection, evidence);

        EventBus.emit("evidence:created", saved);
        EventBus.emit("evidence:changed", saved);

        return saved;
    }

    /**
     * Load evidence by ID
     * 
     * @param {string} id - Evidence ID
     * @returns {Object|null} Evidence object or null
     */
    static load(id) {
        return StorageManager.load(this.collection, id);
    }

    /**
     * Get all evidence items
     * 
     * @returns {Array} All evidence objects
     */
    static getAll() {
        return StorageManager.loadAll(this.collection);
    }

    /**
     * Get all evidence for a case
     * 
     * @param {string} caseId - Case ID
     * @returns {Array} Evidence items for case
     */
    static getByCase(caseId) {
        return this.getAll().filter(item => item.caseId === caseId);
    }

    /**
     * Update evidence
     * 
     * @param {Object} data - Evidence data with id
     * @returns {Object} Updated evidence object
     * @throws {Error} If evidence not found
     */
    static update(data) {
        if (!data || !data.id) {
            throw new Error("EvidenceManager: evidence with id is required");
        }

        const existing = this.load(data.id);

        if (!existing) {
            throw new Error(`EvidenceManager: evidence not found: ${data.id}`);
        }

        const updated = StorageManager.update(this.collection, {
            ...existing,
            ...data,
            id: data.id,
            updatedAt: new Date().toISOString()
        });

        EventBus.emit("evidence:updated", updated);
        EventBus.emit("evidence:changed", updated);

        return updated;
    }

    /**
     * Upsert evidence (create or update)
     * 
     * @param {Object} data - Evidence data
     * @returns {Object} Saved evidence object
     */
    static upsert(data) {
        if (!data || !data.id) {
            throw new Error("EvidenceManager: evidence with id is required");
        }

        const saved = StorageManager.upsert(this.collection, data);
        EventBus.emit("evidence:saved", saved);
        EventBus.emit("evidence:changed", saved);

        return saved;
    }

    /**
     * Delete evidence
     * 
     * @param {string} id - Evidence ID
     * @returns {boolean} True if deleted
     */
    static delete(id) {
        const result = StorageManager.delete(this.collection, id);
        EventBus.emit("evidence:deleted", { id });
        EventBus.emit("evidence:changed", { id });

        return result;
    }

    /**
     * Count all evidence
     * 
     * @returns {number} Total evidence count
     */
    static count() {
        return StorageManager.count(this.collection);
    }

    static set(evidence) {
        if (!evidence || !evidence.id) {
            return null;
        }

        localStorage.setItem(this.activeKey, evidence.id);
        EventBus.emit("evidence:selected", evidence);

        return evidence;
    }

    static get() {
        const id = localStorage.getItem(this.activeKey);

        if (!id) {
            return null;
        }

        return this.load(id);
    }

    static clear() {
        localStorage.removeItem(this.activeKey);
        EventBus.emit("evidence:cleared", null);
    }

    static createId() {
        return `EVD-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    }

    /**
     * Count evidence for a case
     * 
     * @param {string} caseId - Case ID
     * @returns {number} Evidence count for case
     */
    static countByCase(caseId) {
        return this.getByCase(caseId).length;
    }

    // ==================== VALIDATION METHODS ====================

    /**
     * Validate complete evidence object
     * 
     * @param {Object} data - Evidence data to validate
     * @returns {Array} Array of validation errors (empty if valid)
     */
    static validate(data) {
        const errors = [];

        if (!data) {
            errors.push("Evidence data is required");
            return errors;
        }

        if (!data.id) errors.push("Evidence ID will be generated automatically");
        if (!data.caseId) errors.push("Case ID is required");
        if (!data.type || !Object.values(this.TYPES).includes(data.type)) {
            errors.push(`Invalid type: ${data.type}`);
        }
        if (!data.title || data.title.trim() === "") {
            errors.push("Title is required");
        }
        if (data.status && !Object.values(this.STATUSES).includes(data.status)) {
            errors.push(`Invalid status: ${data.status}`);
        }
        if (data.severity && !Object.values(this.SEVERITIES).includes(data.severity)) {
            errors.push(`Invalid severity: ${data.severity}`);
        }
        if (data.confidence !== null && data.confidence !== undefined &&
            (typeof data.confidence !== 'number' || data.confidence < 0 || data.confidence > 100)) {
            errors.push("Confidence must be number between 0-100");
        }

        return errors;
    }

    /**
     * Validate evidence type
     * 
     * @param {string} type - Type to validate
     * @returns {boolean} True if valid type
     */
    static isValidType(type) {
        return Object.values(this.TYPES).includes(type);
    }

    /**
     * Validate evidence status
     * 
     * @param {string} status - Status to validate
     * @returns {boolean} True if valid status
     */
    static isValidStatus(status) {
        return Object.values(this.STATUSES).includes(status);
    }

    /**
     * Validate evidence severity
     * 
     * @param {string} severity - Severity to validate
     * @returns {boolean} True if valid severity
     */
    static isValidSeverity(severity) {
        return Object.values(this.SEVERITIES).includes(severity);
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
            'Captured': ['Classified', 'Captured'],
            'Classified': ['Review', 'Captured', 'Classified'],
            'Review': ['Assigned', 'Classified', 'Review'],
            'Assigned': ['Review', 'Assigned']
        };

        return (workflow[fromStatus] || []).includes(toStatus);
    }

    // ==================== QUERY METHODS ====================

    /**
     * Get all evidence by inspection
     * 
     * @param {string} inspectionId - Inspection ID
     * @returns {Array} Evidence items for inspection
     */
    static getByInspection(inspectionId) {
        return this.getAll().filter(item => item.inspectionId === inspectionId);
    }

    /**
     * Get all evidence by building
     * 
     * @param {string} buildingId - Building ID
     * @returns {Array} Evidence items for building
     */
    static getByBuilding(buildingId) {
        return this.getAll().filter(item => item.buildingId === buildingId);
    }

    /**
     * Get all evidence by type
     * 
     * @param {string} type - Evidence type (photo|document|note|measurement)
     * @returns {Array} Evidence items of type
     */
    static getByType(type) {
        return this.getAll().filter(item => item.type === type);
    }

    /**
     * Get all evidence by status
     * 
     * @param {string} status - Evidence status
     * @returns {Array} Evidence items with status
     */
    static getByStatus(status) {
        return this.getAll().filter(item => item.status === status);
    }

    /**
     * Get all evidence by category
     * 
     * @param {string} category - Evidence category
     * @returns {Array} Evidence items with category
     */
    static getByCategory(category) {
        return this.getAll().filter(item => item.category === category);
    }

    /**
     * Get all evidence by severity
     * 
     * @param {string} severity - Severity level
     * @returns {Array} Evidence items with severity
     */
    static getBySeverity(severity) {
        return this.getAll().filter(item => item.severity === severity);
    }

    /**
     * Get evidence with specific tag
     * 
     * @param {string} tag - Tag to search
     * @returns {Array} Evidence items with tag
     */
    static getByTag(tag) {
        return this.getAll().filter(item =>
            item.tags && item.tags.includes(tag)
        );
    }

    /**
     * Search evidence by title and description
     * 
     * @param {string} query - Search query
     * @returns {Array} Matching evidence items
     */
    static search(query) {
        const q = query.toLowerCase();
        return this.getAll().filter(item =>
            (item.title && item.title.toLowerCase().includes(q)) ||
            (item.description && item.description.toLowerCase().includes(q))
        );
    }

    /**
     * Filter evidence with custom predicate function
     * 
     * @param {Function} predicate - Filter function
     * @returns {Array} Filtered evidence items
     */
    static filter(predicate) {
        return this.getAll().filter(predicate);
    }

    /**
     * Get evidence count by type
     * 
     * @param {string} caseId - Optional case filter
     * @returns {Object} Count by type
     */
    static countByType(caseId = null) {
        const items = caseId ? this.getByCase(caseId) : this.getAll();
        const counts = {};

        Object.keys(this.TYPES).forEach(key => {
            counts[key] = items.filter(e => e.type === this.TYPES[key]).length;
        });

        return counts;
    }

    // ==================== RELATIONSHIP MANAGEMENT ====================

    /**
     * Link evidence to a finding
     * 
     * @param {string} evidenceId - Evidence ID
     * @param {string} findingId - Finding ID to link
     * @returns {Object} Updated evidence object
     * @throws {Error} If evidence not found
     */
    static addToFinding(evidenceId, findingId) {
        const evidence = this.load(evidenceId);
        if (!evidence) throw new Error(`Evidence ${evidenceId} not found`);

        if (!evidence.findingIds) evidence.findingIds = [];
        if (!evidence.findingIds.includes(findingId)) {
            evidence.findingIds.push(findingId);
        }

        evidence.updatedAt = new Date().toISOString();
        return this.update(evidence);
    }

    /**
     * Remove evidence from a finding
     * 
     * @param {string} evidenceId - Evidence ID
     * @param {string} findingId - Finding ID to unlink
     * @returns {Object} Updated evidence object
     * @throws {Error} If evidence not found
     */
    static removeFromFinding(evidenceId, findingId) {
        const evidence = this.load(evidenceId);
        if (!evidence) throw new Error(`Evidence ${evidenceId} not found`);

        if (evidence.findingIds) {
            evidence.findingIds = evidence.findingIds.filter(id => id !== findingId);
        }

        evidence.updatedAt = new Date().toISOString();
        return this.update(evidence);
    }

    /**
     * Link evidence to an assessment
     * 
     * @param {string} evidenceId - Evidence ID
     * @param {string} assessmentId - Assessment ID to link
     * @returns {Object} Updated evidence object
     * @throws {Error} If evidence not found
     */
    static addToAssessment(evidenceId, assessmentId) {
        const evidence = this.load(evidenceId);
        if (!evidence) throw new Error(`Evidence ${evidenceId} not found`);

        if (!evidence.assessmentIds) evidence.assessmentIds = [];
        if (!evidence.assessmentIds.includes(assessmentId)) {
            evidence.assessmentIds.push(assessmentId);
        }

        evidence.updatedAt = new Date().toISOString();
        return this.update(evidence);
    }

    /**
     * Remove evidence from an assessment
     * 
     * @param {string} evidenceId - Evidence ID
     * @param {string} assessmentId - Assessment ID to unlink
     * @returns {Object} Updated evidence object
     * @throws {Error} If evidence not found
     */
    static removeFromAssessment(evidenceId, assessmentId) {
        const evidence = this.load(evidenceId);
        if (!evidence) throw new Error(`Evidence ${evidenceId} not found`);

        if (evidence.assessmentIds) {
            evidence.assessmentIds = evidence.assessmentIds.filter(id => id !== assessmentId);
        }

        evidence.updatedAt = new Date().toISOString();
        return this.update(evidence);
    }

    /**
     * Get all finding IDs linked to evidence
     * 
     * @param {string} evidenceId - Evidence ID
     * @returns {Array} Array of finding IDs
     */
    static getLinkedFindings(evidenceId) {
        const evidence = this.load(evidenceId);
        if (!evidence || !evidence.findingIds) return [];

        return evidence.findingIds;
    }

    /**
     * Get all assessment IDs linked to evidence
     * 
     * @param {string} evidenceId - Evidence ID
     * @returns {Array} Array of assessment IDs
     */
    static getLinkedAssessments(evidenceId) {
        const evidence = this.load(evidenceId);
        if (!evidence || !evidence.assessmentIds) return [];

        return evidence.assessmentIds;
    }

    // ==================== WORKFLOW MANAGEMENT ====================

    /**
     * Update evidence status with validation
     * 
     * @param {string} id - Evidence ID
     * @param {string} newStatus - New status
     * @returns {Object} Updated evidence object
     * @throws {Error} If status invalid or transition not allowed
     */
    static updateStatus(id, newStatus) {
        const evidence = this.load(id);
        if (!evidence) throw new Error(`Evidence ${id} not found`);

        if (!this.isValidStatus(newStatus)) {
            throw new Error(`Invalid status: ${newStatus}`);
        }

        if (!this.canTransition(evidence.status, newStatus)) {
            throw new Error(
                `Cannot transition from ${evidence.status} to ${newStatus}`
            );
        }

        evidence.status = newStatus;
        evidence.updatedAt = new Date().toISOString();
        return this.update(evidence);
    }

    /**
     * Get evidence in a specific workflow stage
     * 
     * @param {string} status - Status to filter
     * @param {string} caseId - Optional case filter
     * @returns {Array} Evidence items with status
     */
    static getByWorkflowStatus(status, caseId = null) {
        const items = caseId ? this.getByCase(caseId) : this.getAll();
        return items.filter(item => item.status === status);
    }

    /**
     * Get workflow stage counts for a case
     * 
     * @param {string} caseId - Case ID
     * @returns {Object} Count by status
     */
    static getWorkflowStats(caseId) {
        const items = this.getByCase(caseId);
        const stats = {};

        Object.values(this.STATUSES).forEach(status => {
            stats[status] = items.filter(e => e.status === status).length;
        });

        return stats;
    }

    // ==================== BATCH OPERATIONS ====================

    /**
     * Create multiple evidence items
     * 
     * @param {Array} dataArray - Array of evidence data objects
     * @returns {Object} {created: Array, errors: Array}
     * @throws {Error} If input not an array
     */
    static createBatch(dataArray) {
        if (!Array.isArray(dataArray)) {
            throw new Error("createBatch requires an array");
        }

        const created = [];
        const errors = [];

        dataArray.forEach((data, index) => {
            try {
                const evidence = this.create(data);
                created.push(evidence);
            } catch (error) {
                errors.push({ index, error: error.message });
            }
        });

        return { created, errors };
    }

    /**
     * Update multiple evidence items
     * 
     * @param {Array} dataArray - Array of evidence data with id
     * @returns {Object} {updated: Array, errors: Array}
     * @throws {Error} If input not an array
     */
    static updateBatch(dataArray) {
        if (!Array.isArray(dataArray)) {
            throw new Error("updateBatch requires an array");
        }

        const updated = [];
        const errors = [];

        dataArray.forEach((data, index) => {
            try {
                const evidence = this.update(data);
                updated.push(evidence);
            } catch (error) {
                errors.push({ index, error: error.message });
            }
        });

        return { updated, errors };
    }

    /**
     * Delete multiple evidence items
     * 
     * @param {Array} idArray - Array of evidence IDs
     * @returns {Object} {deleted: number, total: number, errors: Array}
     * @throws {Error} If input not an array
     */
    static deleteBatch(idArray) {
        if (!Array.isArray(idArray)) {
            throw new Error("deleteBatch requires an array");
        }

        let deleted = 0;
        const errors = [];

        idArray.forEach((id, index) => {
            try {
                this.delete(id);
                deleted++;
            } catch (error) {
                errors.push({ id, error: error.message });
            }
        });

        return { deleted, total: idArray.length, errors };
    }

    /**
     * Delete all evidence for a case
     * 
     * @param {string} caseId - Case ID
     * @returns {Object} {deleted: number, total: number, errors: Array}
     */
    static deleteByCase(caseId) {
        const items = this.getByCase(caseId);
        const idArray = items.map(item => item.id);
        return this.deleteBatch(idArray);
    }

    /**
     * Delete all evidence for an inspection
     * 
     * @param {string} inspectionId - Inspection ID
     * @returns {Object} {deleted: number, total: number, errors: Array}
     */
    static deleteByInspection(inspectionId) {
        const items = this.getByInspection(inspectionId);
        const idArray = items.map(item => item.id);
        return this.deleteBatch(idArray);
    }

    // ==================== STATISTICS & AGGREGATION ====================

    /**
     * Get statistics for all evidence
     * 
     * @returns {Object} Statistics object
     */
    static getStats() {
        const all = this.getAll();

        const stats = {
            total: all.length,
            byType: {},
            byStatus: {},
            bySeverity: {},
            byCategory: {},
            averageConfidence: null,
            withTags: 0,
            linked: 0
        };

        // Count by type
        Object.keys(this.TYPES).forEach(key => {
            stats.byType[key] = all.filter(e => e.type === this.TYPES[key]).length;
        });

        // Count by status
        Object.keys(this.STATUSES).forEach(key => {
            stats.byStatus[key] = all.filter(e => e.status === this.STATUSES[key]).length;
        });

        // Count by severity
        Object.keys(this.SEVERITIES).forEach(key => {
            stats.bySeverity[key] = all.filter(e => e.severity === this.SEVERITIES[key]).length;
        });

        // Count by category
        Object.keys(this.CATEGORIES).forEach(key => {
            stats.byCategory[key] = all.filter(e => e.category === this.CATEGORIES[key]).length;
        });

        // Average confidence
        const withConfidence = all.filter(e => e.confidence !== null && e.confidence !== undefined);
        if (withConfidence.length > 0) {
            const sum = withConfidence.reduce((acc, e) => acc + e.confidence, 0);
            stats.averageConfidence = Math.round(sum / withConfidence.length);
        }

        // Count with tags
        stats.withTags = all.filter(e => e.tags && e.tags.length > 0).length;

        // Count with relationships
        stats.linked = all.filter(e =>
            (e.findingIds && e.findingIds.length > 0) ||
            (e.assessmentIds && e.assessmentIds.length > 0)
        ).length;

        return stats;
    }

    /**
     * Get statistics for a specific case
     * 
     * @param {string} caseId - Case ID
     * @returns {Object} Statistics object for case
     */
    static getStatsByCase(caseId) {
        const items = this.getByCase(caseId);

        const stats = {
            total: items.length,
            byType: {},
            byStatus: {},
            bySeverity: {},
            averageConfidence: null,
            readyForAnalysis: 0
        };

        // Count by type
        Object.keys(this.TYPES).forEach(key => {
            stats.byType[key] = items.filter(e => e.type === this.TYPES[key]).length;
        });

        // Count by status
        Object.keys(this.STATUSES).forEach(key => {
            stats.byStatus[key] = items.filter(e => e.status === this.STATUSES[key]).length;
        });

        // Count by severity
        Object.keys(this.SEVERITIES).forEach(key => {
            stats.bySeverity[key] = items.filter(e => e.severity === this.SEVERITIES[key]).length;
        });

        // Average confidence
        const withConfidence = items.filter(e => e.confidence !== null && e.confidence !== undefined);
        if (withConfidence.length > 0) {
            const sum = withConfidence.reduce((acc, e) => acc + e.confidence, 0);
            stats.averageConfidence = Math.round(sum / withConfidence.length);
        }

        // Ready for analysis (classified and ready)
        stats.readyForAnalysis = items.filter(e =>
            ['Review', 'Assigned', 'Classified'].includes(e.status)
        ).length;

        return stats;
    }

    /**
     * Get confidence distribution
     * 
     * @returns {Object} Confidence ranges with counts
     */
    static getConfidenceStats() {
        const all = this.getAll().filter(e => e.confidence !== null && e.confidence !== undefined);

        return {
            total: all.length,
            ranges: {
                '0-20%': all.filter(e => e.confidence <= 20).length,
                '21-40%': all.filter(e => e.confidence > 20 && e.confidence <= 40).length,
                '41-60%': all.filter(e => e.confidence > 40 && e.confidence <= 60).length,
                '61-80%': all.filter(e => e.confidence > 60 && e.confidence <= 80).length,
                '81-100%': all.filter(e => e.confidence > 80).length
            }
        };
    }
}
