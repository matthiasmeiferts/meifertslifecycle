import StorageManager from "./storage/StorageManager.js";
import BuildingManager from "./BuildingManager.js";
import CaseManager from "./CaseManager.js";
import InspectionManager from "./InspectionManager.js";
import InspectionScopeManager from "./InspectionScopeManager.js";
import InspectionQuestionCatalog from "./InspectionQuestionCatalog.js";
import EvidenceManager from "./EvidenceManager.js";
import FindingManager from "./FindingManager.js";
import AssessmentManager from "./AssessmentManager.js";
import RecommendationManager from "./RecommendationManager.js";
import DecisionManager from "./DecisionManager.js";
import ReportManager from "./ReportManager.js";

export default class DemoDatasetManager {

    static demoDatasetId = "controlled-demo-dataset";

    static workflowCollections = [
        "inspectionScopes",
        "evidence",
        "findings",
        "assessments",
        "recommendations",
        "decisions",
        "reports"
    ];

    static demoRecords = [
        { collection: "buildings", id: "DEMO-BLD-001", label: "Building" },
        { collection: "inspections", id: "DEMO-INSP-001", label: "Inspection" },
        { collection: "cases", id: "DEMO-CASE-001", label: "Case" },
        { collection: "inspectionScopes", id: "DEMO-SCOPE-001", label: "Inspection Scope" },
        { collection: "evidence", id: "DEMO-EVD-001", label: "Evidence" },
        { collection: "findings", id: "DEMO-FND-001", label: "Finding" },
        { collection: "assessments", id: "DEMO-ASM-001", label: "Assessment" },
        { collection: "recommendations", id: "DEMO-REC-001", label: "Recommendation" },
        { collection: "decisions", id: "DEMO-DEC-001", label: "Decision" },
        { collection: "reports", id: "DEMO-RPT-001", label: "Report" }
    ];

    static demoLinks = [
        {
            fromCollection: "cases",
            fromId: "DEMO-CASE-001",
            field: "evidenceIds",
            toId: "DEMO-EVD-001",
            label: "Case links to Evidence"
        },
        {
            fromCollection: "evidence",
            fromId: "DEMO-EVD-001",
            field: "caseId",
            toId: "DEMO-CASE-001",
            label: "Evidence links to Case"
        },
        {
            fromCollection: "findings",
            fromId: "DEMO-FND-001",
            field: "evidenceIds",
            toId: "DEMO-EVD-001",
            label: "Finding links to Evidence"
        },
        {
            fromCollection: "assessments",
            fromId: "DEMO-ASM-001",
            field: "findingIds",
            toId: "DEMO-FND-001",
            label: "Assessment links to Finding"
        },
        {
            fromCollection: "recommendations",
            fromId: "DEMO-REC-001",
            field: "assessmentIds",
            toId: "DEMO-ASM-001",
            label: "Recommendation links to Assessment"
        },
        {
            fromCollection: "decisions",
            fromId: "DEMO-DEC-001",
            field: "recommendationIds",
            toId: "DEMO-REC-001",
            label: "Decision links to Recommendation"
        },
        {
            fromCollection: "reports",
            fromId: "DEMO-RPT-001",
            field: "decisionIds",
            toId: "DEMO-DEC-001",
            label: "Report links to Decision"
        }
    ];

    static getIntegrityStatus() {
        const checks = this.demoLinks.map(link => {
            const source = StorageManager.load(link.fromCollection, link.fromId);
            const value = source ? source[link.field] : null;
            const valid = Array.isArray(value)
                ? value.includes(link.toId)
                : value === link.toId;

            return {
                ...link,
                valid,
                sourceExists: Boolean(source)
            };
        });

        const validLinks = checks.filter(check => check.valid).length;
        const totalLinks = checks.length;
        const invalidLinks = checks.filter(check => !check.valid);

        return {
            validLinks,
            totalLinks,
            invalidLinks,
            isValid: validLinks === totalLinks,
            percent: totalLinks > 0
                ? Math.round((validLinks / totalLinks) * 100)
                : 0
        };
    }

    static rebuild() {
        return this.create();
    }

    static create() {
        this.clearWorkflowData();

        const now = new Date().toISOString();
        const buildingId = "DEMO-BLD-001";
        const inspectionId = "DEMO-INSP-001";
        const caseId = "DEMO-CASE-001";

        const building = {
            id: buildingId,
            type: "building",
            status: "active",
            name: "Demo Asset Hamburg",
            address: "Neuer Wall 1",
            city: "Hamburg",
            country: "Germany",
            assetType: "Mixed-use commercial building",
            createdAt: now,
            updatedAt: now
        };

        StorageManager.upsert("buildings", building);
        BuildingManager.set(building);

        const inspection = {
            id: inspectionId,
            type: "inspection",
            status: "draft",
            buildingId,
            inspectionType: "technical_due_diligence",
            title: "Technical Property Review",
            location: "Demo Asset Hamburg",
            inspector: "Matthias Meiferts",
            scheduledAt: now,
            startedAt: now,
            completedAt: null,
            createdAt: now,
            updatedAt: now
        };

        StorageManager.upsert("inspections", inspection);
        InspectionManager.set(inspection);

        const currentCase = CaseManager.create({
            id: caseId,
            title: "Demo Case · Technical Due Diligence",
            buildingId,
            inspectionId,
            status: "Draft",
            type: "Technical Property Review",
            riskScore: 33,
            progress: 65
        });

        const questionId = "DOCUMENTS-CERTIFICATES-001";
        const question = InspectionQuestionCatalog.getById(questionId) || {
            id: questionId,
            question: "Are statutory certificates or required inspection documents complete?",
            module: "DOCUMENTS",
            category: "Compliance",
            component: "Certificates"
        };

        const scope = InspectionScopeManager.create({
            ...InspectionQuestionCatalog.createStarterScopeData(),
            id: "DEMO-SCOPE-001",
            caseId,
            buildingId,
            inspectionId,
            title: "Demo Inspection Scope",
            status: "Draft",
            answers: {
                [questionId]: {
                    id: "DEMO-ANSWER-001",
                    questionId,
                    caseId,
                    buildingId,
                    inspectionId,
                    value: "no",
                    requiredEvidence: ["document"],
                    evidenceIds: ["DEMO-EVD-001"],
                    updatedAt: now
                }
            },
            evidenceRequirements: [],
            riskFlags: [
                {
                    questionId,
                    reason: "Required statutory certificates are incomplete or unavailable.",
                    createdAt: now
                }
            ],
            limitations: [],
            updatedAt: now
        });

        InspectionScopeManager.set(scope);

        const evidence = EvidenceManager.create({
            id: "DEMO-EVD-001",
            caseId,
            buildingId,
            inspectionId,
            type: "document",
            category: question.category || "Compliance",
            title: `Document required · ${question.question}`,
            description: [
                "Evidence requirement generated from adaptive inspection scope.",
                `Question: ${question.id}`,
                `Module: ${question.module}`,
                `Category: ${question.category}`,
                `Component: ${question.component || "Not specified"}`,
                "Inspection scope trace:",
                `Question ID: ${question.id}`,
                `Question: ${question.question}`,
                "Required evidence: document",
                `Scope ID: ${scope.id}`
            ].join("\n"),
            buildingSystem: question.module || "DOCUMENTS",
            componentId: question.component || "Certificates",
            status: "Draft",
            source: "Inspection Scope",
            sourceType: "Inspection Scope",
            sourceQuestionId: question.id,
            sourceQuestion: question.question,
            sourceRequiredEvidence: ["document"],
            scopeId: scope.id,
            tags: ["demo-dataset", "inspection-scope", question.id, "document"]
        });

        EvidenceManager.set(evidence);

        const finding = FindingManager.create({
            id: "DEMO-FND-001",
            caseId,
            buildingId,
            inspectionId,
            evidenceIds: [evidence.id],
            title: `Finding: ${question.question}`,
            description: [
                evidence.description,
                "Finding trace:",
                `Evidence ID: ${evidence.id}`,
                `Source question: ${question.id}`
            ].join("\n"),
            category: question.category || "Compliance",
            buildingSystem: question.module || "DOCUMENTS",
            severity: "Medium",
            probability: "Medium",
            urgency: "Short Term",
            priority: "Medium",
            confidence: 80,
            status: "Open",
            source: "Inspection Scope Evidence"
        });

        FindingManager.set(finding);

        const assessment = AssessmentManager.create({
            id: "DEMO-ASM-001",
            caseId,
            buildingId,
            inspectionId,
            findingIds: [finding.id],
            evidenceIds: [evidence.id],
            title: `Assessment from ${finding.title}`,
            description: [
                finding.description,
                "Assessment trace:",
                `Assessment source: ${finding.source}`,
                `Finding IDs: ${finding.id}`,
                `Evidence IDs: ${evidence.id}`,
                "Risk score: 33"
            ].join("\n"),
            category: finding.category,
            buildingSystem: finding.buildingSystem,
            severity: "Medium",
            probability: "Medium",
            consequence: "Medium",
            riskScore: 33,
            priority: "Medium",
            status: "Draft",
            source: "Finding Review"
        });

        AssessmentManager.set(assessment);

        const recommendation = RecommendationManager.create({
            id: "DEMO-REC-001",
            caseId,
            buildingId,
            inspectionId,
            assessmentIds: [assessment.id],
            findingIds: [finding.id],
            evidenceIds: [evidence.id],
            title: "Request and verify statutory certificate package",
            description: [
                assessment.description,
                "Recommendation trace:",
                `Assessment IDs: ${assessment.id}`,
                `Finding IDs: ${finding.id}`,
                `Evidence IDs: ${evidence.id}`
            ].join("\n"),
            action: "Request missing statutory certificates, verify document completeness, and record any residual limitations before final decision.",
            priority: "Medium",
            timeframe: "Short Term",
            estimatedCost: 0,
            currency: "EUR",
            responsible: "Owner",
            decisionImpact: "Medium",
            riskScore: assessment.riskScore,
            buildingSystem: assessment.buildingSystem,
            status: "Draft",
            source: "Assessment Review"
        });

        RecommendationManager.set(recommendation);

        const decision = DecisionManager.create({
            id: "DEMO-DEC-001",
            caseId,
            buildingId,
            inspectionId,
            recommendationIds: [recommendation.id],
            assessmentIds: [assessment.id],
            findingIds: [finding.id],
            evidenceIds: [evidence.id],
            title: "Decision: certificate documentation requires follow-up",
            description: [
                recommendation.description,
                "Decision trace:",
                `Recommendation IDs: ${recommendation.id}`,
                `Assessment IDs: ${assessment.id}`,
                `Finding IDs: ${finding.id}`,
                `Evidence IDs: ${evidence.id}`
            ].join("\n"),
            decisionType: "Monitor",
            rationale: recommendation.action,
            riskLevel: "Medium",
            confidence: 75,
            status: "Draft",
            source: "Recommendation Review",
            decisionImpact: recommendation.decisionImpact,
            riskScore: assessment.riskScore,
            buildingSystem: assessment.buildingSystem
        });

        DecisionManager.set(decision);

        const report = ReportManager.create({
            id: "DEMO-RPT-001",
            caseId,
            buildingId,
            inspectionId,
            decisionIds: [decision.id],
            recommendationIds: [recommendation.id],
            assessmentIds: [assessment.id],
            findingIds: [finding.id],
            evidenceIds: [evidence.id],
            title: "Technical Due Diligence Report",
            sourceTitle: decision.title,
            reportType: "Technical Due Diligence",
            version: "1.0.0",
            executiveSummary: "This report summarizes the technical due diligence decision path for the selected demo case. It consolidates linked evidence, findings, assessments, recommendations and the final decision context for professional review.",
            scope: "Decision-based technical due diligence report.",
            methodology: "Evidence-first workflow chain review.",
            source: "Decision Review",
            buildingSystem: assessment.buildingSystem,
            riskScore: assessment.riskScore,
            decisionImpact: recommendation.decisionImpact,
            riskLevel: decision.riskLevel,
            status: "Draft"
        });

        ReportManager.set(report);

        StorageManager.upsert("demoDatasets", {
            id: this.demoDatasetId,
            label: "Controlled Demo Dataset",
            caseId,
            buildingId,
            inspectionId,
            status: "active",
            workflowRecords: this.workflowCollections.length,
            createdAt: now,
            updatedAt: now
        });

        CaseManager.setCurrent({
            ...currentCase,
            evidenceIds: [evidence.id],
            findingIds: [finding.id],
            assessmentIds: [assessment.id],
            recommendationIds: [recommendation.id],
            decisionIds: [decision.id],
            reportIds: [report.id],
            riskScore: assessment.riskScore,
            progress: 100,
            updatedAt: now
        });
        CaseManager.save();

        return {
            case: CaseManager.getCurrent(),
            building,
            inspection,
            scope,
            evidence,
            finding,
            assessment,
            recommendation,
            decision,
            report
        };
    }

    static getStatus() {
        const checks = this.demoRecords.map(record => ({
            ...record,
            exists: StorageManager.exists(record.collection, record.id)
        }));

        const completeRecords = checks.filter(record => record.exists).length;
        const totalRecords = checks.length;
        const missingRecords = checks.filter(record => !record.exists);
        const metadata = StorageManager.load("demoDatasets", this.demoDatasetId);
        const integrity = this.getIntegrityStatus();

        return {
            id: this.demoDatasetId,
            label: "Controlled Demo Dataset",
            isActive: Boolean(metadata) || completeRecords > 0,
            isComplete: completeRecords === totalRecords,
            completeRecords,
            totalRecords,
            percent: totalRecords > 0
                ? Math.round((completeRecords / totalRecords) * 100)
                : 0,
            missingRecords,
            integrity,
            metadata
        };
    }

    static reset() {
        this.clearWorkflowData();
        return this.getStatus();
    }

    static clearWorkflowData() {
        this.workflowCollections.forEach(collection => {
            StorageManager.clear(collection);
        });

        StorageManager.clear("demoDatasets");

        InspectionScopeManager.clear();
        EvidenceManager.clear();
        FindingManager.clear();
        AssessmentManager.clear();
        RecommendationManager.clear();
        DecisionManager.clear();
        ReportManager.clear();
    }
}
