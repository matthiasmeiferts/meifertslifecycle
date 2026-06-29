/**
 * ==========================================================
 * MEIFERTS Building Intelligence
 * Integration Test Suite
 * Sprint 6.7 Core Engine
 * ==========================================================
 *
 * Complete workflow integration test covering:
 * Building → Inspection → Evidence → Finding → Assessment
 * → Recommendation → Decision → Report
 *
 * Tests:
 * - Object creation with proper IDs
 * - Relationships and linking
 * - Data persistence (localStorage)
 * - Report generation
 * - Status workflows
 */

// ==================== LOCALSTORAGE MOCK (Node.js compatibility) ====================

if (typeof global !== "undefined" && !global.localStorage) {
    global.localStorage = {
        data: {},
        getItem(key) {
            return this.data[key] || null;
        },
        setItem(key, value) {
            this.data[key] = String(value);
        },
        removeItem(key) {
            delete this.data[key];
        },
        clear() {
            this.data = {};
        }
    };
}

import CaseManager from "../portal/core/CaseManager.js";
import BuildingManager from "../portal/core/BuildingManager.js";
import InspectionManager from "../portal/core/InspectionManager.js";
import EvidenceManager from "../portal/core/EvidenceManager.js";
import FindingManager from "../portal/core/FindingManager.js";
import AssessmentManager from "../portal/core/AssessmentManager.js";
import RecommendationManager from "../portal/core/RecommendationManager.js";
import DecisionManager from "../portal/core/DecisionManager.js";
import ReportManager from "../portal/core/ReportManager.js";
import IdGenerator from "../portal/core/utils/IdGenerator.js";
import StorageManager from "../portal/core/storage/StorageManager.js";

// ==================== TEST UTILITIES ====================

let testsPassed = 0;
let testsFailed = 0;
const results = [];

function pass(message) {
    testsPassed++;
    results.push(`✓ PASS: ${message}`);
    console.log(`✓ PASS: ${message}`);
}

function fail(message, error = "") {
    testsFailed++;
    results.push(`✗ FAIL: ${message}${error ? " - " + error : ""}`);
    console.error(`✗ FAIL: ${message}${error ? " - " + error : ""}`);
}

function section(title) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`  ${title}`);
    console.log(`${"=".repeat(60)}`);
}

function summary() {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`FINAL RESULTS`);
    console.log(`${"=".repeat(60)}`);
    console.log(`Passed: ${testsPassed}`);
    console.log(`Failed: ${testsFailed}`);
    console.log(`Total:  ${testsPassed + testsFailed}`);
    console.log(`Status: ${testsFailed === 0 ? "✓ ALL TESTS PASSED" : "✗ SOME TESTS FAILED"}`);
    console.log(`${"=".repeat(60)}\n`);
}

// ==================== TEST DATA ====================

const caseId = IdGenerator.generate("CASE");
const buildingId = IdGenerator.generate("BLD");
const inspectionId = IdGenerator.generate("INSP");
const evidenceIds = [
    IdGenerator.generate("EVD"),
    IdGenerator.generate("EVD")
];
const findingIds = [
    IdGenerator.generate("FND"),
    IdGenerator.generate("FND")
];
const assessmentIds = [
    IdGenerator.generate("ASS"),
    IdGenerator.generate("ASS")
];
const recommendationIds = [
    IdGenerator.generate("REC"),
    IdGenerator.generate("REC")
];
const decisionIds = [
    IdGenerator.generate("DEC"),
    IdGenerator.generate("DEC")
];
const reportId = IdGenerator.generate("REP");

// ==================== STEP 1: CASE & BUILDING SETUP ====================

section("STEP 1: Case & Building Setup");

let testCase = null;

try {
    testCase = CaseManager.create({
        id: caseId,
        title: "Integration Test Case",
        clientId: "CLIENT-001",
        propertyAddress: "123 Test Street"
    });
    
    if (testCase && testCase.id === caseId) {
        pass("Case created with correct ID");
    } else {
        fail("Case created but ID mismatch", `expected ${caseId}, got ${testCase?.id}`);
    }
} catch (error) {
    fail("Case creation failed", error.message);
}

try {
    CaseManager.setCurrent(testCase);
    const current = CaseManager.getCurrent();
    if (current && current.id === caseId) {
        pass("Case set as current and retrieved");
    } else {
        fail("Case current get/set failed");
    }
} catch (error) {
    fail("Case current management failed", error.message);
}

try {
    const building = {
        id: buildingId,
        name: "Test Building",
        address: "123 Test Street",
        city: "Test City",
        country: "Test Country"
    };
    BuildingManager.set(building);
    const current = BuildingManager.get();
    if (current && current.id === buildingId) {
        pass("Building set and retrieved");
    } else {
        fail("Building get/set failed");
    }
} catch (error) {
    fail("Building management failed", error.message);
}

// ==================== STEP 2: INSPECTION CREATION ====================

section("STEP 2: Inspection Creation");

let inspection = null;

try {
    inspection = InspectionManager.createInspection({
        buildingId: buildingId,
        inspectionType: "technical_due_diligence",
        title: "Technical Property Review",
        inspector: "Test Inspector"
    });
    
    if (inspection && inspection.id) {
        pass(`Inspection created: ${inspection.id}`);
    } else {
        fail("Inspection creation: missing ID");
    }
    
    if (inspection.buildingId === buildingId) {
        pass("Inspection linked to building");
    } else {
        fail("Inspection building link failed", `expected ${buildingId}, got ${inspection?.buildingId}`);
    }
} catch (error) {
    fail("Inspection creation failed", error.message);
}

try {
    const loaded = InspectionManager.getInspection(inspection.id);
    if (loaded && loaded.id === inspection.id) {
        pass("Inspection persisted and retrieved from localStorage");
    } else {
        fail("Inspection persistence check failed");
    }
} catch (error) {
    fail("Inspection persistence test failed", error.message);
}

// ==================== STEP 3: EVIDENCE CREATION & LINKING ====================

section("STEP 3: Evidence Creation & Linking");

const createdEvidence = [];

for (let i = 0; i < evidenceIds.length; i++) {
    try {
        const evidence = EvidenceManager.create({
            id: evidenceIds[i],
            caseId: caseId,
            buildingId: buildingId,
            inspectionId: inspection.id,
            type: "photo",
            title: `Test Evidence ${i + 1}`,
            category: "Structural",
            severity: "Medium"
        });
        
        if (evidence && evidence.id === evidenceIds[i]) {
            pass(`Evidence ${i + 1} created: ${evidence.id}`);
            createdEvidence.push(evidence);
        } else {
            fail(`Evidence ${i + 1} creation: ID mismatch`);
        }
    } catch (error) {
        fail(`Evidence ${i + 1} creation failed`, error.message);
    }
}

try {
    const allEvidence = EvidenceManager.getByCase(caseId);
    if (allEvidence.length === evidenceIds.length) {
        pass(`Evidence: ${allEvidence.length} items retrieved by case`);
    } else {
        fail(`Evidence retrieval: expected ${evidenceIds.length}, got ${allEvidence.length}`);
    }
} catch (error) {
    fail("Evidence retrieval failed", error.message);
}

// ==================== STEP 4: FINDING CREATION & LINKING ====================

section("STEP 4: Finding Creation & Linking");

const createdFindings = [];

for (let i = 0; i < findingIds.length; i++) {
    try {
        const finding = FindingManager.create({
            id: findingIds[i],
            caseId: caseId,
            buildingId: buildingId,
            inspectionId: inspection.id,
            title: `Test Finding ${i + 1}`,
            description: `Test finding description ${i + 1}`,
            severity: "High",
            priority: "High",
            evidenceIds: [evidenceIds[i]]
        });
        
        if (finding && finding.id === findingIds[i]) {
            pass(`Finding ${i + 1} created: ${finding.id}`);
            createdFindings.push(finding);
        } else {
            fail(`Finding ${i + 1} creation: ID mismatch`);
        }
        
        if (finding.evidenceIds && finding.evidenceIds.includes(evidenceIds[i])) {
            pass(`Finding ${i + 1} linked to evidence`);
        } else {
            fail(`Finding ${i + 1} evidence link failed`);
        }
    } catch (error) {
        fail(`Finding ${i + 1} creation failed`, error.message);
    }
}

try {
    const allFindings = FindingManager.getByCase(caseId);
    if (allFindings.length === findingIds.length) {
        pass(`Findings: ${allFindings.length} items retrieved by case`);
    } else {
        fail(`Findings retrieval: expected ${findingIds.length}, got ${allFindings.length}`);
    }
} catch (error) {
    fail("Findings retrieval failed", error.message);
}

// ==================== STEP 5: ASSESSMENT CREATION & LINKING ====================

section("STEP 5: Assessment Creation & Linking");

const createdAssessments = [];

for (let i = 0; i < assessmentIds.length; i++) {
    try {
        const assessment = AssessmentManager.create({
            id: assessmentIds[i],
            caseId: caseId,
            buildingId: buildingId,
            inspectionId: inspection.id,
            title: `Test Assessment ${i + 1}`,
            description: `Test assessment description ${i + 1}`,
            severity: "Medium",
            probability: "Medium",
            consequence: "High",
            priority: "High",
            findingIds: [findingIds[i]]
        });
        
        if (assessment && assessment.id === assessmentIds[i]) {
            pass(`Assessment ${i + 1} created: ${assessment.id}`);
            createdAssessments.push(assessment);
        } else {
            fail(`Assessment ${i + 1} creation: ID mismatch`);
        }
        
        if (assessment.findingIds && assessment.findingIds.includes(findingIds[i])) {
            pass(`Assessment ${i + 1} linked to finding`);
        } else {
            fail(`Assessment ${i + 1} finding link failed`);
        }
    } catch (error) {
        fail(`Assessment ${i + 1} creation failed`, error.message);
    }
}

try {
    const allAssessments = AssessmentManager.getByCase(caseId);
    if (allAssessments.length === assessmentIds.length) {
        pass(`Assessments: ${allAssessments.length} items retrieved by case`);
    } else {
        fail(`Assessments retrieval: expected ${assessmentIds.length}, got ${allAssessments.length}`);
    }
} catch (error) {
    fail("Assessments retrieval failed", error.message);
}

// ==================== STEP 6: RECOMMENDATION CREATION & LINKING ====================

section("STEP 6: Recommendation Creation & Linking");

const createdRecommendations = [];

for (let i = 0; i < recommendationIds.length; i++) {
    try {
        const recommendation = RecommendationManager.create({
            id: recommendationIds[i],
            caseId: caseId,
            buildingId: buildingId,
            inspectionId: inspection.id,
            title: `Test Recommendation ${i + 1}`,
            description: `Test recommendation description ${i + 1}`,
            priority: "High",
            timeframe: "Immediate",
            assessmentIds: [assessmentIds[i]],
            findingIds: [findingIds[i]]
        });
        
        if (recommendation && recommendation.id === recommendationIds[i]) {
            pass(`Recommendation ${i + 1} created: ${recommendation.id}`);
            createdRecommendations.push(recommendation);
        } else {
            fail(`Recommendation ${i + 1} creation: ID mismatch`);
        }
        
        if (recommendation.assessmentIds && recommendation.assessmentIds.includes(assessmentIds[i])) {
            pass(`Recommendation ${i + 1} linked to assessment`);
        } else {
            fail(`Recommendation ${i + 1} assessment link failed`);
        }
    } catch (error) {
        fail(`Recommendation ${i + 1} creation failed`, error.message);
    }
}

try {
    const allRecommendations = RecommendationManager.getByCase(caseId);
    if (allRecommendations.length === recommendationIds.length) {
        pass(`Recommendations: ${allRecommendations.length} items retrieved by case`);
    } else {
        fail(`Recommendations retrieval: expected ${recommendationIds.length}, got ${allRecommendations.length}`);
    }
} catch (error) {
    fail("Recommendations retrieval failed", error.message);
}

// ==================== STEP 7: DECISION CREATION & LINKING ====================

section("STEP 7: Decision Creation & Linking");

const createdDecisions = [];

for (let i = 0; i < decisionIds.length; i++) {
    try {
        const decision = DecisionManager.create({
            id: decisionIds[i],
            caseId: caseId,
            buildingId: buildingId,
            inspectionId: inspection.id,
            title: `Test Decision ${i + 1}`,
            description: `Test decision description ${i + 1}`,
            decision: "Proceed",
            riskLevel: "Medium",
            acquisitionOutcome: "Suitable for Acquisition",
            recommendationIds: [recommendationIds[i]],
            findingIds: [findingIds[i]]
        });
        
        if (decision && decision.id === decisionIds[i]) {
            pass(`Decision ${i + 1} created: ${decision.id}`);
            createdDecisions.push(decision);
        } else {
            fail(`Decision ${i + 1} creation: ID mismatch`);
        }
        
        if (decision.recommendationIds && decision.recommendationIds.includes(recommendationIds[i])) {
            pass(`Decision ${i + 1} linked to recommendation`);
        } else {
            fail(`Decision ${i + 1} recommendation link failed`);
        }
    } catch (error) {
        fail(`Decision ${i + 1} creation failed`, error.message);
    }
}

try {
    const allDecisions = DecisionManager.getByCase(caseId);
    if (allDecisions.length === decisionIds.length) {
        pass(`Decisions: ${allDecisions.length} items retrieved by case`);
    } else {
        fail(`Decisions retrieval: expected ${decisionIds.length}, got ${allDecisions.length}`);
    }
} catch (error) {
    fail("Decisions retrieval failed", error.message);
}

// ==================== STEP 8: REPORT CREATION & AGGREGATION ====================

section("STEP 8: Report Creation & Aggregation");

let report = null;

try {
    report = ReportManager.create({
        id: reportId,
        caseId: caseId,
        buildingId: buildingId,
        inspectionId: inspection.id,
        reportType: "Full Building Intelligence Report",
        title: "Integration Test Report",
        evidenceIds: evidenceIds,
        findingIds: findingIds,
        assessmentIds: assessmentIds,
        recommendationIds: recommendationIds,
        decisionIds: decisionIds
    });
    
    if (report && report.id === reportId) {
        pass(`Report created: ${report.id}`);
    } else {
        fail("Report creation: ID mismatch");
    }
} catch (error) {
    fail("Report creation failed", error.message);
}

try {
    if (report.evidenceIds && report.evidenceIds.length === evidenceIds.length) {
        pass(`Report linked to ${report.evidenceIds.length} evidence items`);
    } else {
        fail(`Report evidence linking: expected ${evidenceIds.length}, got ${report?.evidenceIds?.length}`);
    }
} catch (error) {
    fail("Report evidence linking test failed", error.message);
}

try {
    if (report.findingIds && report.findingIds.length === findingIds.length) {
        pass(`Report linked to ${report.findingIds.length} findings`);
    } else {
        fail(`Report findings linking: expected ${findingIds.length}, got ${report?.findingIds?.length}`);
    }
} catch (error) {
    fail("Report findings linking test failed", error.message);
}

try {
    if (report.assessmentIds && report.assessmentIds.length === assessmentIds.length) {
        pass(`Report linked to ${report.assessmentIds.length} assessments`);
    } else {
        fail(`Report assessments linking: expected ${assessmentIds.length}, got ${report?.assessmentIds?.length}`);
    }
} catch (error) {
    fail("Report assessments linking test failed", error.message);
}

try {
    if (report.recommendationIds && report.recommendationIds.length === recommendationIds.length) {
        pass(`Report linked to ${report.recommendationIds.length} recommendations`);
    } else {
        fail(`Report recommendations linking: expected ${recommendationIds.length}, got ${report?.recommendationIds?.length}`);
    }
} catch (error) {
    fail("Report recommendations linking test failed", error.message);
}

try {
    if (report.decisionIds && report.decisionIds.length === decisionIds.length) {
        pass(`Report linked to ${report.decisionIds.length} decisions`);
    } else {
        fail(`Report decisions linking: expected ${decisionIds.length}, got ${report?.decisionIds?.length}`);
    }
} catch (error) {
    fail("Report decisions linking test failed", error.message);
}

// ==================== STEP 9: PERSISTENCE & RETRIEVAL ====================

section("STEP 9: Persistence & Retrieval");

try {
    const loadedReport = ReportManager.load(reportId);
    if (loadedReport && loadedReport.id === reportId) {
        pass("Report persisted and retrieved from localStorage");
    } else {
        fail("Report persistence: retrieval failed");
    }
} catch (error) {
    fail("Report persistence test failed", error.message);
}

try {
    const allReports = ReportManager.getAll();
    if (Array.isArray(allReports) && allReports.length > 0) {
        pass(`Reports: ${allReports.length} total reports in system`);
    } else {
        fail("Reports retrieval: getAll() failed or empty");
    }
} catch (error) {
    fail("Reports retrieval failed", error.message);
}

try {
    const caseReports = ReportManager.getByCase(caseId);
    if (Array.isArray(caseReports) && caseReports.length > 0) {
        pass(`Reports: ${caseReports.length} report(s) for this case`);
    } else {
        fail("Reports by case retrieval: none found");
    }
} catch (error) {
    fail("Reports by case retrieval failed", error.message);
}

// ==================== STEP 10: STATUS WORKFLOW ====================

section("STEP 10: Status Workflow");

try {
    const updatedRec = RecommendationManager.updateStatus(recommendationIds[0], "Under Review");
    if (updatedRec && updatedRec.status === "Under Review") {
        pass("Recommendation status updated to 'Under Review'");
    } else {
        fail("Recommendation status update failed");
    }
} catch (error) {
    fail("Recommendation status update test failed", error.message);
}

try {
    const updatedDec = DecisionManager.updateStatus(decisionIds[0], "Under Review");
    if (updatedDec && updatedDec.status === "Under Review") {
        pass("Decision status updated to 'Under Review'");
    } else {
        fail("Decision status update failed");
    }
} catch (error) {
    fail("Decision status update test failed", error.message);
}

try {
    const updatedRep = ReportManager.updateStatus(reportId, "Under Review");
    if (updatedRep && updatedRep.status === "Under Review") {
        pass("Report status updated to 'Under Review'");
    } else {
        fail("Report status update failed");
    }
} catch (error) {
    fail("Report status update test failed", error.message);
}

// ==================== STEP 11: RELATIONSHIP VERIFICATION ====================

section("STEP 11: Relationship Verification");

try {
    const findingsByInspection = FindingManager.getByInspection(inspection.id);
    if (Array.isArray(findingsByInspection) && findingsByInspection.length > 0) {
        pass(`Findings retrieved by inspection: ${findingsByInspection.length}`);
    } else {
        fail("Findings by inspection retrieval failed");
    }
} catch (error) {
    fail("Findings by inspection test failed", error.message);
}

try {
    const assessmentsByInspection = AssessmentManager.getByInspection(inspection.id);
    if (Array.isArray(assessmentsByInspection) && assessmentsByInspection.length > 0) {
        pass(`Assessments retrieved by inspection: ${assessmentsByInspection.length}`);
    } else {
        fail("Assessments by inspection retrieval failed");
    }
} catch (error) {
    fail("Assessments by inspection test failed", error.message);
}

try {
    const recommendationsByInspection = RecommendationManager.getByInspection(inspection.id);
    if (Array.isArray(recommendationsByInspection) && recommendationsByInspection.length > 0) {
        pass(`Recommendations retrieved by inspection: ${recommendationsByInspection.length}`);
    } else {
        fail("Recommendations by inspection retrieval failed");
    }
} catch (error) {
    fail("Recommendations by inspection test failed", error.message);
}

try {
    const decisionsByInspection = DecisionManager.getByInspection(inspection.id);
    if (Array.isArray(decisionsByInspection) && decisionsByInspection.length > 0) {
        pass(`Decisions retrieved by inspection: ${decisionsByInspection.length}`);
    } else {
        fail("Decisions by inspection retrieval failed");
    }
} catch (error) {
    fail("Decisions by inspection test failed", error.message);
}

try {
    const reportsByInspection = ReportManager.getByInspection(inspection.id);
    if (Array.isArray(reportsByInspection) && reportsByInspection.length > 0) {
        pass(`Reports retrieved by inspection: ${reportsByInspection.length}`);
    } else {
        fail("Reports by inspection retrieval failed");
    }
} catch (error) {
    fail("Reports by inspection test failed", error.message);
}

// ==================== STEP 12: DATA INTEGRITY ====================

section("STEP 12: Data Integrity");

try {
    const evidence = EvidenceManager.load(evidenceIds[0]);
    const finding = FindingManager.load(findingIds[0]);
    
    if (evidence && finding && finding.evidenceIds.includes(evidence.id)) {
        pass("Finding correctly references Evidence");
    } else {
        fail("Finding-Evidence relationship corrupted");
    }
} catch (error) {
    fail("Finding-Evidence integrity check failed", error.message);
}

try {
    const finding = FindingManager.load(findingIds[0]);
    const assessment = AssessmentManager.load(assessmentIds[0]);
    
    if (finding && assessment && assessment.findingIds.includes(finding.id)) {
        pass("Assessment correctly references Finding");
    } else {
        fail("Assessment-Finding relationship corrupted");
    }
} catch (error) {
    fail("Assessment-Finding integrity check failed", error.message);
}

try {
    const assessment = AssessmentManager.load(assessmentIds[0]);
    const recommendation = RecommendationManager.load(recommendationIds[0]);
    
    if (assessment && recommendation && recommendation.assessmentIds.includes(assessment.id)) {
        pass("Recommendation correctly references Assessment");
    } else {
        fail("Recommendation-Assessment relationship corrupted");
    }
} catch (error) {
    fail("Recommendation-Assessment integrity check failed", error.message);
}

try {
    const recommendation = RecommendationManager.load(recommendationIds[0]);
    const decision = DecisionManager.load(decisionIds[0]);
    
    if (recommendation && decision && decision.recommendationIds.includes(recommendation.id)) {
        pass("Decision correctly references Recommendation");
    } else {
        fail("Decision-Recommendation relationship corrupted");
    }
} catch (error) {
    fail("Decision-Recommendation integrity check failed", error.message);
}

try {
    const loadedReport = ReportManager.load(reportId);
    
    const hasEvidence = loadedReport.evidenceIds && loadedReport.evidenceIds.length === evidenceIds.length;
    const hasFindings = loadedReport.findingIds && loadedReport.findingIds.length === findingIds.length;
    const hasAssessments = loadedReport.assessmentIds && loadedReport.assessmentIds.length === assessmentIds.length;
    const hasRecommendations = loadedReport.recommendationIds && loadedReport.recommendationIds.length === recommendationIds.length;
    const hasDecisions = loadedReport.decisionIds && loadedReport.decisionIds.length === decisionIds.length;
    
    if (hasEvidence && hasFindings && hasAssessments && hasRecommendations && hasDecisions) {
        pass("Report correctly aggregates all entity relationships");
    } else {
        fail("Report missing some entity relationships");
    }
} catch (error) {
    fail("Report integrity check failed", error.message);
}

// ==================== FINAL SUMMARY ====================

summary();

export { testsPassed, testsFailed, results };
