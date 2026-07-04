import StorageManager from "./storage/StorageManager.js";
import EventBus from "./events/EventBus.js";

export default class DecisionManager {

    static collection = "decisions";

    static activeKey = "activeDecisionId";

    static defaultCreator = "System";

    static STATUSES = {
        DRAFT: "Draft",
        UNDER_REVIEW: "Under Review",
        APPROVED: "Approved",
        CLOSED: "Closed",
        REJECTED: "Rejected"
    };

    static RISK_LEVELS = {
        LOW: "Low",
        MEDIUM: "Medium",
        HIGH: "High",
        CRITICAL: "Critical"
    };

    static DECISION_TYPES = {
        ACQUISITION: "Acquisition",
        HOLD: "Hold",
        REJECT: "Reject",
        DEFER: "Defer",
        MONITOR: "Monitor"
    };

    static create(data = {}) {
        if (!data.caseId) {
            throw new Error("DecisionManager: caseId is required");
        }

        const decision = {
            id: data.id || this.createId(),
            caseId: data.caseId,
            buildingId: data.buildingId || null,
            inspectionId: data.inspectionId || null,

            evidenceIds: data.evidenceIds || [],
            findingIds: data.findingIds || [],
            assessmentIds: data.assessmentIds || [],
            recommendationId: data.recommendationId || null,
              recommendationIds: data.recommendationIds || [],

            title: data.title || "Decision",
            description: data.description || "",
            decisionType: data.decisionType || "Monitor",
            rationale: data.rationale || "",

            source: data.source || "Recommendation Review",
            buildingSystem: data.buildingSystem || "",
            riskScore: data.riskScore || 0,
            decisionImpact: data.decisionImpact || "",

            riskLevel: data.riskLevel || "Medium",
            confidence: data.confidence || null,
            status: data.status || "Draft",

            approvedBy: data.approvedBy || "",
            approvedAt: data.approvedAt || null,

            createdBy: data.createdBy || this.defaultCreator,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const saved = StorageManager.upsert(this.collection, decision);
        this.set(saved);
        EventBus.emit("decision:created", saved);
        EventBus.emit("decision:changed", saved);

        return saved;
    }

    static load(id) {
        return StorageManager.load(this.collection, id);
    }

    static getAll() {
        return StorageManager.loadAll(this.collection);
    }

    static getByCase(caseId) {
        return this.getAll().filter(decision => decision.caseId === caseId);
    }

    static update(data = {}) {
        if (!data.id) {
            throw new Error("DecisionManager: id is required for update");
        }

        const existing = this.load(data.id);

        if (!existing) {
            throw new Error(`DecisionManager: decision not found: ${data.id}`);
        }

        const updated = StorageManager.update(this.collection, {
            ...existing,
            ...data,
            id: data.id,
            updatedAt: new Date().toISOString()
        });

        this.set(updated);
        EventBus.emit("decision:updated", updated);
        EventBus.emit("decision:changed", updated);

        return updated;
    }

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

    static delete(id) {
        StorageManager.delete(this.collection, id);

        if (this.get()?.id === id) {
            this.clear();
        }

        EventBus.emit("decision:deleted", { id });
        EventBus.emit("decision:changed", { id });

        return true;
    }

    static count() {
        return this.getAll().length;
    }

    static set(decision) {
        if (!decision || !decision.id) {
            return null;
        }

        localStorage.setItem(this.activeKey, decision.id);
        EventBus.emit("decision:selected", decision);

        return decision;
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
        EventBus.emit("decision:cleared", null);
    }

    static createId() {
        return `DEC-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    }

    static countByCase(caseId) {
        return this.getByCase(caseId).length;
    }

    static createFromRecommendation(recommendation) {
        return this.create({
            caseId: recommendation.caseId,
            buildingId: recommendation.buildingId,
            inspectionId: recommendation.inspectionId,
            recommendationId: recommendation.id,
            recommendationIds: [recommendation.id],
            assessmentIds: recommendation.assessmentIds || [],
            findingIds: recommendation.findingIds || [],
            title: recommendation.title,
            description: "Decision generated from recommendation.",
            decisionType: "Monitor",
            rationale: recommendation.action || recommendation.description || "",
            riskLevel: recommendation.decisionImpact || recommendation.priority || "Medium",
            confidence: null,
            status: "Draft",
            createdBy: this.defaultCreator
        });
    }

    static validate(data) {
        const errors = [];

        if (!data) {
            errors.push("Decision data is required");
            return errors;
        }

        if (!data.id) errors.push("Decision ID will be generated automatically");
        if (!data.caseId) errors.push("Case ID is required");
        if (!data.title || data.title.trim() === "") errors.push("Title is required");

        if (data.status && !this.isValidStatus(data.status)) {
            errors.push(`Invalid status: ${data.status}`);
        }

        if (data.riskLevel && !this.isValidRiskLevel(data.riskLevel)) {
            errors.push(`Invalid risk level: ${data.riskLevel}`);
        }

        if (data.decisionType && !this.isValidDecisionType(data.decisionType)) {
            errors.push(`Invalid decision type: ${data.decisionType}`);
        }

        if (data.confidence !== null && data.confidence !== undefined) {
            if (typeof data.confidence !== "number" || data.confidence < 0 || data.confidence > 100) {
                errors.push("Confidence must be a number between 0 and 100");
            }
        }

        return errors;
    }

    static isValidStatus(status) {
        return Object.values(this.STATUSES).includes(status);
    }

    static isValidRiskLevel(riskLevel) {
        return Object.values(this.RISK_LEVELS).includes(riskLevel);
    }

    static isValidDecisionType(decisionType) {
        return Object.values(this.DECISION_TYPES).includes(decisionType);
    }

    static canTransition(fromStatus, toStatus) {
        const workflow = {
            "Draft": ["Under Review", "Draft"],
            "Under Review": ["Approved", "Rejected", "Draft", "Under Review"],
            "Approved": ["Closed", "Under Review", "Approved"],
            "Rejected": ["Closed", "Draft", "Rejected"],
            "Closed": ["Closed"]
        };

        return (workflow[fromStatus] || []).includes(toStatus);
    }

    static updateStatus(id, newStatus) {
        const decision = this.load(id);

        if (!decision) {
            throw new Error(`DecisionManager: decision not found: ${id}`);
        }

        if (!this.isValidStatus(newStatus)) {
            throw new Error(`DecisionManager: invalid status: ${newStatus}`);
        }

        if (!this.canTransition(decision.status, newStatus)) {
            throw new Error(`DecisionManager: invalid transition ${decision.status} -> ${newStatus}`);
        }

        const updated = this.update({
            id,
            status: newStatus
        });

        EventBus.emit("decision:status-changed", { id, status: newStatus });

        return updated;
    }

    static approve(id, approvedBy = "") {
        return this.update({
            id,
            status: "Approved",
            approvedBy,
            approvedAt: new Date().toISOString()
        });
    }

    static close(id) {
        return this.update({
            id,
            status: "Closed"
        });
    }

    static getByStatus(status) {
        return this.getAll().filter(decision => decision.status === status);
    }

    static getByRiskLevel(riskLevel) {
        return this.getAll().filter(decision => decision.riskLevel === riskLevel);
    }

    static getByBuilding(buildingId) {
        return this.getAll().filter(decision => decision.buildingId === buildingId);
    }

    static getByInspection(inspectionId) {
        return this.getAll().filter(decision => decision.inspectionId === inspectionId);
    }

    static getByFinding(findingId) {
        return this.getAll().filter(decision => (decision.findingIds || []).includes(findingId));
    }

    static addEvidence(decisionId, evidenceId) {
        const decision = this.load(decisionId);

        if (!decision) {
            throw new Error(`DecisionManager: decision not found: ${decisionId}`);
        }

        if (!(decision.evidenceIds || []).includes(evidenceId)) {
            return this.update({
                ...decision,
                evidenceIds: [...(decision.evidenceIds || []), evidenceId]
            });
        }

        return decision;
    }

    static removeEvidence(decisionId, evidenceId) {
        const decision = this.load(decisionId);

        if (!decision) {
            throw new Error(`DecisionManager: decision not found: ${decisionId}`);
        }

        return this.update({
            ...decision,
            evidenceIds: (decision.evidenceIds || []).filter(id => id !== evidenceId)
        });
    }

    static getLinkedEvidence(decisionId) {
        const decision = this.load(decisionId);
        return decision ? (decision.evidenceIds || []) : [];
    }

    static addFinding(decisionId, findingId) {
        const decision = this.load(decisionId);

        if (!decision) {
            throw new Error(`DecisionManager: decision not found: ${decisionId}`);
        }

        if (!(decision.findingIds || []).includes(findingId)) {
            return this.update({
                ...decision,
                findingIds: [...(decision.findingIds || []), findingId]
            });
        }

        return decision;
    }

    static removeFinding(decisionId, findingId) {
        const decision = this.load(decisionId);

        if (!decision) {
            throw new Error(`DecisionManager: decision not found: ${decisionId}`);
        }

        return this.update({
            ...decision,
            findingIds: (decision.findingIds || []).filter(id => id !== findingId)
        });
    }

    static getLinkedFindings(decisionId) {
        const decision = this.load(decisionId);
        return decision ? (decision.findingIds || []) : [];
    }

    static addAssessment(decisionId, assessmentId) {
        const decision = this.load(decisionId);

        if (!decision) {
            throw new Error(`DecisionManager: decision not found: ${decisionId}`);
        }

        if (!(decision.assessmentIds || []).includes(assessmentId)) {
            return this.update({
                ...decision,
                assessmentIds: [...(decision.assessmentIds || []), assessmentId]
            });
        }

        return decision;
    }

    static removeAssessment(decisionId, assessmentId) {
        const decision = this.load(decisionId);

        if (!decision) {
            throw new Error(`DecisionManager: decision not found: ${decisionId}`);
        }

        return this.update({
            ...decision,
            assessmentIds: (decision.assessmentIds || []).filter(id => id !== assessmentId)
        });
    }

    static getLinkedAssessments(decisionId) {
        const decision = this.load(decisionId);
        return decision ? (decision.assessmentIds || []) : [];
    }

    static addRecommendation(decisionId, recommendationId) {
        const decision = this.load(decisionId);

        if (!decision) {
            throw new Error(`DecisionManager: decision not found: ${decisionId}`);
        }

        if (!(decision.recommendationIds || []).includes(recommendationId)) {
            return this.update({
                ...decision,
                recommendationIds: [...(decision.recommendationIds || []), recommendationId]
            });
        }

        return decision;
    }

    static removeRecommendation(decisionId, recommendationId) {
        const decision = this.load(decisionId);

        if (!decision) {
            throw new Error(`DecisionManager: decision not found: ${decisionId}`);
        }

        return this.update({
            ...decision,
            recommendationIds: (decision.recommendationIds || []).filter(id => id !== recommendationId)
        });
    }

    static getLinkedRecommendations(decisionId) {
        const decision = this.load(decisionId);
        return decision ? (decision.recommendationIds || []) : [];
    }

}
