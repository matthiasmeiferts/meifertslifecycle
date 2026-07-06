/**
 * ==========================================================
 * MEIFERTS Building Intelligence
 * ReportManager
 * Version 2.0.0
 * Sprint 6.7
 * Status: Production
 * ==========================================================
 *
 * Phase 1 additions over v1.0.0:
 *   - Constants: STATUSES, REPORT_TYPES
 *   - Data: evidenceIds[], findingIds[], assessmentIds[],
 *           recommendationIds[], decisionIds[] (backward compatible)
 *   - Validation: validate(), isValidStatus(), isValidReportType(),
 *                 canTransition()
 *   - Status management: updateStatus(), getByStatus(), getByReportType()
 *   - Query: getByBuilding(), getByInspection()
 *   - Relationships: addEvidence/removeEvidence/getLinkedEvidence,
 *                    addFinding/removeFinding/getLinkedFindings,
 *                    addAssessment/removeAssessment/getLinkedAssessments,
 *                    addRecommendation/removeRecommendation/getLinkedRecommendations,
 *                    addDecision/removeDecision/getLinkedDecisions
 *
 * Backward compatible: all 17 v1.0.0 methods preserved with identical signatures.
 * Denormalized arrays (findings[], assessments[], etc.) kept alongside new ID arrays.
 * ==========================================================
 */

import StorageManager from "./storage/StorageManager.js";
import CaseManager from "./CaseManager.js";
import EventBus from "./events/EventBus.js";

export default class ReportManager {

    static collection = "reports";

    static activeKey = "activeReportId";

    static defaultPreparedBy = "MEIFERTS Building Intelligence";

    // ==================== CONSTANTS ====================

    static STATUSES = {
        DRAFT:        'Draft',
        UNDER_REVIEW: 'Under Review',
        APPROVED:     'Approved',
        ARCHIVED:     'Archived'
    };

    static REPORT_TYPES = {
        TECHNICAL_DUE_DILIGENCE:       'Technical Due Diligence',
        RISK_ASSESSMENT:               'Risk Assessment',
        LIFECYCLE_ASSESSMENT:          'Lifecycle Assessment',
        CONDITION_SURVEY:              'Condition Survey',
        INSPECTION_REPORT:             'Inspection Report',
        FULL_BUILDING_INTELLIGENCE:    'Full Building Intelligence Report'
    };

    // ==================== CORE CRUD ====================

    /**
     * Create a new report and persist to localStorage.
     * @param {Object} [data={}] - Report data
     * @param {string} data.caseId - Required case reference
     * @param {string} [data.id] - Optional ID (auto-generated if omitted)
     * @param {string} [data.buildingId] - Optional building reference
     * @param {string} [data.inspectionId] - Optional inspection reference
     * @param {Array}  [data.evidenceIds] - Linked evidence IDs
     * @param {Array}  [data.findingIds] - Linked finding IDs
     * @param {Array}  [data.assessmentIds] - Linked assessment IDs
     * @param {Array}  [data.recommendationIds] - Linked recommendation IDs
     * @param {Array}  [data.decisionIds] - Linked decision IDs
     * @returns {Object} Saved report
     * @throws {Error} If caseId is missing
     */
    static create(data = {}) {
        if (!data.caseId) {
            throw new Error("ReportManager: caseId required");
        }

        const report = {
            id: data.id || this.createId(),

            caseId: data.caseId,
            buildingId:  data.buildingId  || null,
            inspectionId: data.inspectionId || null,

            evidenceIds:       data.evidenceIds       || [],
            findingIds:        data.findingIds         || [],
            assessmentIds:     data.assessmentIds      || [],
            recommendationIds: data.recommendationIds  || [],
            decisionIds:       data.decisionIds        || [],

            sourceDecisionIds: data.sourceDecisionIds || data.decisionIds || [],
            sourceRecommendationIds: data.sourceRecommendationIds || data.recommendationIds || [],
            sourceAssessmentIds: data.sourceAssessmentIds || data.assessmentIds || [],
            sourceFindingIds: data.sourceFindingIds || data.findingIds || [],
            sourceEvidenceIds: data.sourceEvidenceIds || data.evidenceIds || [],

            title:      data.title      || "Professional Building Intelligence Report",
            sourceTitle: data.sourceTitle || "",
            reportType: data.reportType || "Technical Due Diligence",
            version:    data.version    || "1.0.0",

            source:         data.source         || "Decision Review",
            buildingSystem: data.buildingSystem || "",
            riskScore:      data.riskScore      || 0,
            decisionImpact: data.decisionImpact || "",
            riskLevel:      data.riskLevel      || "",

            sourceQuestionId: data.sourceQuestionId || "",
            sourceQuestion: data.sourceQuestion || "",
            sourceModule: data.sourceModule || "",
            sourceCategory: data.sourceCategory || "",
            sourcePolicy: data.sourcePolicy || "",
            sourceRequiredEvidenceRaw: data.sourceRequiredEvidenceRaw || "",

            profile: data.profile || "",
            country: data.country || "",
            region: data.region || "",

            executiveSummary: data.executiveSummary || "",
            scope:            data.scope            || "",
            methodology:      data.methodology      || "",

            findings:        data.findings        || [],
            assessments:     data.assessments     || [],
            recommendations: data.recommendations || [],
            decisions:       data.decisions       || [],
            evidence:        data.evidence        || [],

            riskSummary:     data.riskSummary     || this.createRiskSummary(data.assessments || []),
            capexSummary:    data.capexSummary     || this.createCapexSummary(data.recommendations || []),
            decisionSummary: data.decisionSummary  || this.createDecisionSummary(data.decisions || []),

            status: data.status || "Draft",
            reviewStatus: data.reviewStatus || "Draft",
            expertReviewRequired: data.expertReviewRequired !== undefined
                ? data.expertReviewRequired
                : true,
            reportPreparationOnly: data.reportPreparationOnly !== undefined
                ? data.reportPreparationOnly
                : true,
            noAutomaticFinalReport: data.noAutomaticFinalReport !== undefined
                ? data.noAutomaticFinalReport
                : true,
            noAutomaticOpinion: data.noAutomaticOpinion !== undefined
                ? data.noAutomaticOpinion
                : true,

            preparedBy: data.preparedBy || this.defaultPreparedBy,
            reviewedBy: data.reviewedBy || "",
            approvedBy: data.approvedBy || "",
            updatedBy: data.updatedBy || data.preparedBy || this.defaultPreparedBy,

            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const saved = StorageManager.upsert(this.collection, report);
        this.set(saved);
        EventBus.emit("report:created", saved);
        EventBus.emit("report:changed", saved);
        return saved;
    }

    /**
     * Load one report by ID.
     * @param {string} id - Report ID
     * @returns {Object|null} Report or null
     */
    static load(id) {
        return StorageManager.load(this.collection, id);
    }

    /**
     * Load all reports.
     * @returns {Array} All reports
     */
    static getAll() {
        return StorageManager.loadAll(this.collection);
    }

    /**
     * Get all reports for a specific case.
     * @param {string} caseId - Case ID
     * @returns {Array}
     */
    static getByCase(caseId) {
        return this.getAll().filter(report => report.caseId === caseId);
    }

    /**
     * Update an existing report.
     * @param {Object} [data={}] - Report data with id
     * @returns {Object} Updated report
     * @throws {Error} If id is missing
     */
    static update(data = {}) {
        if (!data.id) {
            throw new Error("ReportManager: id required");
        }

        const existing = this.load(data.id);

        if (!existing) {
            throw new Error(`ReportManager: report not found: ${data.id}`);
        }

        const saved = StorageManager.update(this.collection, {
            ...existing,
            ...data,
            id: data.id,
            updatedAt: new Date().toISOString()
        });

        this.set(saved);
        EventBus.emit("report:updated", saved);
        EventBus.emit("report:changed", saved);
        return saved;
    }

    /**
     * Save or update a report.
     * @param {Object} [data={}] - Report data with id
     * @returns {Object} Saved report
     * @throws {Error} If id is missing
     */
    static upsert(data = {}) {
        if (!data.id) {
            return this.create(data);
        }

        const existing = this.load(data.id);

        if (!existing) {
            return this.create(data);
        }

        return this.update(data);
    }

    /**
     * Delete a report by ID.
     * @param {string} id - Report ID
     * @returns {boolean} True on success
     */
    static delete(id) {
        StorageManager.delete(this.collection, id);
        if (this.get()?.id === id) {
            this.clear();
        }
        EventBus.emit("report:deleted", { id });
        EventBus.emit("report:changed", { id });
        return true;
    }

    /**
     * Count total reports.
     * @returns {number}
     */
    static count() {
        return this.getAll().length;
    }

    /**
     * Set the active report.
     * @param {Object} report - Report object
     * @returns {Object|null} The report if valid
     */
    static set(report) {
        if (!report || !report.id) {
            return null;
        }

        const currentCase = CaseManager.getCurrent();

        if (currentCase && report.caseId && report.caseId !== currentCase.id) {
            localStorage.removeItem(this.activeKey);
            return null;
        }

        localStorage.setItem(this.activeKey, report.id);
        EventBus.emit("report:selected", report);

        return report;
    }

    /**
     * Get the active report.
     * @returns {Object|null} Active report or null
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
     * Clear the active report.
     */
    static clear() {
        localStorage.removeItem(this.activeKey);
        EventBus.emit("report:cleared", null);
    }

    /**
     * Create a unique ID for a new report.
     * @returns {string} Generated ID
     */
    static createId() {
        return `RPT-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    }

    /**
     * Build a risk summary object from an array of assessment objects.
     * @param {Array} [assessments=[]] - Assessment objects with riskScore
     * @returns {Object} Risk summary
     */
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

    /**
     * Build a CAPEX summary object from an array of recommendation objects.
     * @param {Array} [recommendations=[]] - Recommendation objects with capexMin/capexMax
     * @returns {Object} CAPEX summary
     */
    static createCapexSummary(recommendations = []) {
        const capexMin = recommendations.reduce(
            (sum, item) => sum + (item.capexMin || 0), 0
        );
        const capexMax = recommendations.reduce(
            (sum, item) => sum + (item.capexMax || 0), 0
        );
        return {
            recommendationCount: recommendations.length,
            capexMin,
            capexMax,
            capexClass: this.getCapexClass(capexMax)
        };
}

    /**
     * Build a decision summary object from an array of decision objects.
     * @param {Array} [decisions=[]] - Decision objects
     * @returns {Object} Decision summary
     */
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

    /**
     * Generate a plain-text executive summary from a report data object.
     * @param {Object} [data={}] - Report data with riskSummary and decisionSummary
     * @returns {string} Executive summary text
     */
    static generateExecutiveSummary(data = {}) {
        const riskLevel = data.riskSummary?.overallRiskLevel || "Medium";
        const acquisitionRecommendation =
            data.decisionSummary?.acquisitionRecommendation ||
            "Further Investigation Required";

        return `This report summarizes the technical due diligence findings, risk assessment, recommendations and decision support for the selected property. The current overall risk level is ${riskLevel}. The acquisition recommendation is: ${acquisitionRecommendation}.`;
    }

    /**
     * Generate and persist a full report from workflow data.
     * @param {Object} [data={}] - Workflow data including caseId, findings, assessments, etc.
     * @returns {Object} Created report
     */
    static generateFromWorkflow(data = {}) {
        const report = {
            caseId:      data.caseId,
            buildingId:  data.buildingId  || null,
            inspectionId: data.inspectionId || null,
            findings:        data.findings        || [],
            assessments:     data.assessments     || [],
            recommendations: data.recommendations || [],
            decisions:       data.decisions       || [],
            evidence:        data.evidence        || []
        };

        report.riskSummary     = this.createRiskSummary(report.assessments);
        report.capexSummary    = this.createCapexSummary(report.recommendations);
        report.decisionSummary = this.createDecisionSummary(report.decisions);
        report.executiveSummary = this.generateExecutiveSummary(report);

        return this.create(report);
    }

    /**
     * Approve a report and record who approved it.
     * @param {string} id - Report ID
     * @param {string} [approvedBy=""] - Name of approver
     * @returns {Object} Updated report
     */
    static approve(id, approvedBy = "") {
        const report = this.load(id);
        if (!report) {
            throw new Error(`ReportManager: report not found: ${id}`);
        }
        return this.update({ ...report, id, status: "Approved", approvedBy });
    }

    /**
     * Archive a report.
     * @param {string} id - Report ID
     * @returns {Object} Updated report
     */
    static archive(id) {
        const report = this.load(id);
        if (!report) {
            throw new Error(`ReportManager: report not found: ${id}`);
        }
        return this.update({ ...report, id, status: "Archived" });
    }

    /**
     * Map a numeric risk score to a risk level label.
     * @param {number} [score=0] - Risk score (0–100)
     * @returns {string} Risk level label
     */
    static getRiskLevel(score = 0) {
        if (score >= 90) return "Critical";
        if (score >= 75) return "High";
        if (score >= 50) return "Medium";
        if (score >= 25) return "Low";
        return "Informational";
    }

    /**
     * Map a maximum CAPEX value to a CAPEX class label.
     * @param {number} [capexMax=0] - Maximum CAPEX value in EUR
     * @returns {string} CAPEX class label
     */
    static getCapexClass(capexMax = 0) {
        if (capexMax >= 100000) return "Critical";
        if (capexMax >= 50000)  return "Major";
        if (capexMax >= 10000)  return "Moderate";
        return "Minor";
    }

    // ==================== VALIDATION ====================

    /**
     * Validate report data. Returns an array of error strings.
     * @param {Object} data - Report data to validate
     * @returns {string[]} Validation errors (empty array if valid)
     */
    static validate(data) {
        const errors = [];
        if (!data) { errors.push("Report data is required"); return errors; }
        if (!data.caseId) errors.push("Case ID is required");
        if (data.status && !this.isValidStatus(data.status)) {
            errors.push(`Invalid status: ${data.status}`);
        }
        if (data.reportType && !this.isValidReportType(data.reportType)) {
            errors.push(`Invalid report type: ${data.reportType}`);
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
     * Check if a report type value is valid.
     * @param {string} reportType
     * @returns {boolean}
     */
    static isValidReportType(reportType) {
        return Object.values(this.REPORT_TYPES).includes(reportType);
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
            'Under Review': ['Approved', 'Draft', 'Under Review'],
            'Approved':     ['Archived', 'Approved'],
            'Archived':     ['Archived']
        };
        return (workflow[fromStatus] || []).includes(toStatus);
    }

    // ==================== STATUS MANAGEMENT ====================

    /**
     * Update report status with workflow enforcement.
     * @param {string} id        - Report ID
     * @param {string} newStatus - Target status
     * @returns {Object} Updated report
     * @throws {Error} If not found or transition is invalid
     */
    static updateStatus(id, newStatus) {
        const report = this.load(id);
        if (!report) throw new Error(`ReportManager: report not found: ${id}`);
        if (!this.isValidStatus(newStatus)) throw new Error(`ReportManager: invalid status: ${newStatus}`);
        if (!this.canTransition(report.status, newStatus)) {
            throw new Error(`ReportManager: invalid transition ${report.status} → ${newStatus}`);
        }
        const updated = StorageManager.update(this.collection, {
            ...report,
            status: newStatus,
            updatedAt: new Date().toISOString()
        });
        EventBus.emit("report:status-changed", { id, status: newStatus });
        EventBus.emit("report:changed", updated);
        return updated;
    }

    /**
     * Get all reports with a specific status.
     * @param {string} status
     * @returns {Array}
     */
    static getByStatus(status) {
        return this.getAll().filter(r => r.status === status);
    }

    /**
     * Get all reports of a specific type.
     * @param {string} reportType
     * @returns {Array}
     */
    static getByReportType(reportType) {
        return this.getAll().filter(r => r.reportType === reportType);
    }

    // ==================== QUERY METHODS ====================

    /**
     * Get all reports for a specific building.
     * @param {string} buildingId
     * @returns {Array}
     */
    static getByBuilding(buildingId) {
        return this.getAll().filter(r => r.buildingId === buildingId);
    }

    /**
     * Get all reports for a specific inspection.
     * @param {string} inspectionId
     * @returns {Array}
     */
    static getByInspection(inspectionId) {
        return this.getAll().filter(r => r.inspectionId === inspectionId);
    }

    // ==================== RELATIONSHIP METHODS ====================

    /**
     * Add an evidence ID to a report (with duplicate prevention).
     * @param {string} reportId   - Report ID
     * @param {string} evidenceId - Evidence ID to add
     * @returns {Object} Updated report
     * @throws {Error} If report not found
     */
    static addEvidence(reportId, evidenceId) {
        const report = this.load(reportId);
        if (!report) throw new Error(`ReportManager: report not found: ${reportId}`);
        if (!(report.evidenceIds || []).includes(evidenceId)) {
            report.evidenceIds = [...(report.evidenceIds || []), evidenceId];
            return this.update({ ...report, updatedAt: new Date().toISOString() });
        }
        return report;
    }

    /**
     * Remove an evidence ID from a report.
     * @param {string} reportId   - Report ID
     * @param {string} evidenceId - Evidence ID to remove
     * @returns {Object} Updated report
     * @throws {Error} If report not found
     */
    static removeEvidence(reportId, evidenceId) {
        const report = this.load(reportId);
        if (!report) throw new Error(`ReportManager: report not found: ${reportId}`);
        report.evidenceIds = (report.evidenceIds || []).filter(id => id !== evidenceId);
        return this.update({ ...report, updatedAt: new Date().toISOString() });
    }

    /**
     * Get all evidence IDs linked to a report.
     * @param {string} reportId - Report ID
     * @returns {string[]}
     */
    static getLinkedEvidence(reportId) {
        const report = this.load(reportId);
        return report ? (report.evidenceIds || []) : [];
    }

    /**
     * Add a finding ID to a report (with duplicate prevention).
     * @param {string} reportId  - Report ID
     * @param {string} findingId - Finding ID to add
     * @returns {Object} Updated report
     * @throws {Error} If report not found
     */
    static addFinding(reportId, findingId) {
        const report = this.load(reportId);
        if (!report) throw new Error(`ReportManager: report not found: ${reportId}`);
        if (!(report.findingIds || []).includes(findingId)) {
            report.findingIds = [...(report.findingIds || []), findingId];
            return this.update({ ...report, updatedAt: new Date().toISOString() });
        }
        return report;
    }

    /**
     * Remove a finding ID from a report.
     * @param {string} reportId  - Report ID
     * @param {string} findingId - Finding ID to remove
     * @returns {Object} Updated report
     * @throws {Error} If report not found
     */
    static removeFinding(reportId, findingId) {
        const report = this.load(reportId);
        if (!report) throw new Error(`ReportManager: report not found: ${reportId}`);
        report.findingIds = (report.findingIds || []).filter(id => id !== findingId);
        return this.update({ ...report, updatedAt: new Date().toISOString() });
    }

    /**
     * Get all finding IDs linked to a report.
     * @param {string} reportId - Report ID
     * @returns {string[]}
     */
    static getLinkedFindings(reportId) {
        const report = this.load(reportId);
        return report ? (report.findingIds || []) : [];
    }

    /**
     * Add an assessment ID to a report (with duplicate prevention).
     * @param {string} reportId     - Report ID
     * @param {string} assessmentId - Assessment ID to add
     * @returns {Object} Updated report
     * @throws {Error} If report not found
     */
    static addAssessment(reportId, assessmentId) {
        const report = this.load(reportId);
        if (!report) throw new Error(`ReportManager: report not found: ${reportId}`);
        if (!(report.assessmentIds || []).includes(assessmentId)) {
            report.assessmentIds = [...(report.assessmentIds || []), assessmentId];
            return this.update({ ...report, updatedAt: new Date().toISOString() });
        }
        return report;
    }

    /**
     * Remove an assessment ID from a report.
     * @param {string} reportId     - Report ID
     * @param {string} assessmentId - Assessment ID to remove
     * @returns {Object} Updated report
     * @throws {Error} If report not found
     */
    static removeAssessment(reportId, assessmentId) {
        const report = this.load(reportId);
        if (!report) throw new Error(`ReportManager: report not found: ${reportId}`);
        report.assessmentIds = (report.assessmentIds || []).filter(id => id !== assessmentId);
        return this.update({ ...report, updatedAt: new Date().toISOString() });
    }

    /**
     * Get all assessment IDs linked to a report.
     * @param {string} reportId - Report ID
     * @returns {string[]}
     */
    static getLinkedAssessments(reportId) {
        const report = this.load(reportId);
        return report ? (report.assessmentIds || []) : [];
    }

    /**
     * Add a recommendation ID to a report (with duplicate prevention).
     * @param {string} reportId        - Report ID
     * @param {string} recommendationId - Recommendation ID to add
     * @returns {Object} Updated report
     * @throws {Error} If report not found
     */
    static addRecommendation(reportId, recommendationId) {
        const report = this.load(reportId);
        if (!report) throw new Error(`ReportManager: report not found: ${reportId}`);
        if (!(report.recommendationIds || []).includes(recommendationId)) {
            report.recommendationIds = [...(report.recommendationIds || []), recommendationId];
            return this.update({ ...report, updatedAt: new Date().toISOString() });
        }
        return report;
    }

    /**
     * Remove a recommendation ID from a report.
     * @param {string} reportId         - Report ID
     * @param {string} recommendationId - Recommendation ID to remove
     * @returns {Object} Updated report
     * @throws {Error} If report not found
     */
    static removeRecommendation(reportId, recommendationId) {
        const report = this.load(reportId);
        if (!report) throw new Error(`ReportManager: report not found: ${reportId}`);
        report.recommendationIds = (report.recommendationIds || []).filter(id => id !== recommendationId);
        return this.update({ ...report, updatedAt: new Date().toISOString() });
    }

    /**
     * Get all recommendation IDs linked to a report.
     * @param {string} reportId - Report ID
     * @returns {string[]}
     */
    static getLinkedRecommendations(reportId) {
        const report = this.load(reportId);
        return report ? (report.recommendationIds || []) : [];
    }

    /**
     * Add a decision ID to a report (with duplicate prevention).
     * @param {string} reportId  - Report ID
     * @param {string} decisionId - Decision ID to add
     * @returns {Object} Updated report
     * @throws {Error} If report not found
     */
    static addDecision(reportId, decisionId) {
        const report = this.load(reportId);
        if (!report) throw new Error(`ReportManager: report not found: ${reportId}`);
        if (!(report.decisionIds || []).includes(decisionId)) {
            report.decisionIds = [...(report.decisionIds || []), decisionId];
            return this.update({ ...report, updatedAt: new Date().toISOString() });
        }
        return report;
    }

    /**
     * Remove a decision ID from a report.
     * @param {string} reportId   - Report ID
     * @param {string} decisionId - Decision ID to remove
     * @returns {Object} Updated report
     * @throws {Error} If report not found
     */
    static removeDecision(reportId, decisionId) {
        const report = this.load(reportId);
        if (!report) throw new Error(`ReportManager: report not found: ${reportId}`);
        report.decisionIds = (report.decisionIds || []).filter(id => id !== decisionId);
        return this.update({ ...report, updatedAt: new Date().toISOString() });
    }

    /**
     * Get all decision IDs linked to a report.
     * @param {string} reportId - Report ID
     * @returns {string[]}
     */
    static getLinkedDecisions(reportId) {
        const report = this.load(reportId);
        return report ? (report.decisionIds || []) : [];
    }

}

