import StorageManager from "./storage/StorageManager.js";
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

    static workflowCollections = [
        "inspectionScopes",
        "evidence",
        "findings",
        "assessments",
        "recommendations",
        "decisions",
        "reports"
    ];

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

    static clearWorkflowData() {
        this.workflowCollections.forEach(collection => {
            StorageManager.clear(collection);
        });

        InspectionScopeManager.clear();
        EvidenceManager.clear();
        FindingManager.clear();
        AssessmentManager.clear();
        RecommendationManager.clear();
        DecisionManager.clear();
        ReportManager.clear();
    }
}
