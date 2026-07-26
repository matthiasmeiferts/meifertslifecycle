import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import FoundationChainValidator from "../portal/core/FoundationChainValidator.js";
import InspectionCaseDomainModel from "../portal/core/InspectionCaseDomainModel.js";
import InspectionSessionDomainModel from "../portal/core/InspectionSessionDomainModel.js";
import InspectionAreaDomainModel from "../portal/core/InspectionAreaDomainModel.js";
import InspectionObservationDomainModel from "../portal/core/InspectionObservationDomainModel.js";
import InspectionEvidenceDomainModel from "../portal/core/InspectionEvidenceDomainModel.js";
import InspectionFindingDomainModel from "../portal/core/InspectionFindingDomainModel.js";
import InspectionAssessmentDomainModel from "../portal/core/InspectionAssessmentDomainModel.js";
import InspectionRecommendationDomainModel from "../portal/core/InspectionRecommendationDomainModel.js";
import InspectionDecisionDomainModel from "../portal/core/InspectionDecisionDomainModel.js";
import InspectionReportDomainModel from "../portal/core/InspectionReportDomainModel.js";

const CREATED_AT = "2026-07-26T12:00:00.000Z";
let passed = 0;

function group(name, callback) {
    callback();
    passed += 1;
    console.log(`PASS ${name}`);
}

function emptyChain() {
    return {
        cases: [],
        sessions: [],
        areas: [],
        observations: [],
        evidence: [],
        findings: [],
        assessments: [],
        recommendations: [],
        decisions: [],
        reports: []
    };
}

function fullChain(suffix = "1") {
    const chain = emptyChain();

    chain.cases.push(InspectionCaseDomainModel.createCase({
        caseId: `case-${suffix}`,
        title: `Case ${suffix}`,
        inspectionType: "DEFECT_INSPECTION",
        createdAt: CREATED_AT
    }));
    chain.sessions.push(InspectionSessionDomainModel.createSession({
        sessionId: `session-${suffix}`,
        caseId: `case-${suffix}`,
        createdAt: CREATED_AT
    }));
    chain.areas.push(InspectionAreaDomainModel.createArea({
        areaId: `area-${suffix}`,
        sessionId: `session-${suffix}`,
        name: `Area ${suffix}`,
        createdAt: CREATED_AT
    }));
    chain.observations.push(InspectionObservationDomainModel.createObservation({
        observationId: `observation-${suffix}`,
        areaId: `area-${suffix}`,
        text: `Observation ${suffix}`,
        createdAt: CREATED_AT
    }));
    chain.evidence.push(InspectionEvidenceDomainModel.createEvidence({
        evidenceId: `evidence-${suffix}`,
        observationId: `observation-${suffix}`,
        reference: `reference-${suffix}`,
        createdAt: CREATED_AT
    }));
    chain.findings.push(InspectionFindingDomainModel.createFinding({
        findingId: `finding-${suffix}`,
        evidenceIds: [`evidence-${suffix}`],
        description: `Finding ${suffix}`,
        createdAt: CREATED_AT
    }));
    chain.assessments.push(InspectionAssessmentDomainModel.createAssessment({
        assessmentId: `assessment-${suffix}`,
        findingId: `finding-${suffix}`,
        assessment: `Assessment ${suffix}`,
        createdAt: CREATED_AT
    }));
    chain.recommendations.push(InspectionRecommendationDomainModel.createRecommendation({
        recommendationId: `recommendation-${suffix}`,
        assessmentId: `assessment-${suffix}`,
        recommendation: `Recommendation ${suffix}`,
        createdAt: CREATED_AT
    }));
    chain.decisions.push(InspectionDecisionDomainModel.createDecision({
        decisionId: `decision-${suffix}`,
        recommendationId: `recommendation-${suffix}`,
        decision: `Decision ${suffix}`,
        createdAt: CREATED_AT
    }));
    chain.reports.push(InspectionReportDomainModel.createReport({
        reportId: `report-${suffix}`,
        decisionId: `decision-${suffix}`,
        report: `Report ${suffix}`,
        createdAt: CREATED_AT
    }));

    return chain;
}

function validate(chain) {
    return FoundationChainValidator.validate(chain);
}

function assertError(result, code, modelType, field = undefined) {
    const error = result.errors.find((candidate) => candidate.code === code
        && candidate.modelType === modelType
        && (field === undefined || candidate.field === field));

    assert.ok(error, `${code} for ${modelType}${field ? `.${field}` : ""}`);
    return error;
}

group("exposes exactly one public validation method", () => {
    const members = Object.getOwnPropertyNames(FoundationChainValidator)
        .filter((name) => !["length", "name", "prototype"].includes(name));

    assert.deepEqual(members, ["validate"]);
});

group("accepts ten empty formal collections", () => {
    assert.deepEqual(validate(emptyChain()), {
        valid: true,
        errors: [],
        summary: {
            collectionCount: 10,
            recordCount: 0,
            errorCount: 0,
            collections: {
                cases: 0,
                sessions: 0,
                areas: 0,
                observations: 0,
                evidence: 0,
                findings: 0,
                assessments: 0,
                recommendations: 0,
                decisions: 0,
                reports: 0
            }
        }
    });
});

group("accepts a single Case and a Case to Session partial chain", () => {
    const caseOnly = fullChain();
    Object.keys(caseOnly).slice(1).forEach((key) => { caseOnly[key] = []; });
    assert.equal(validate(caseOnly).valid, true);

    const caseAndSession = fullChain();
    Object.keys(caseAndSession).slice(2).forEach((key) => { caseAndSession[key] = []; });
    assert.equal(validate(caseAndSession).valid, true);
});

group("accepts the complete A1 to A10 chain", () => {
    const result = validate(fullChain());

    assert.equal(result.valid, true);
    assert.equal(result.summary.recordCount, 10);
    assert.deepEqual(result.errors, []);
});

group("accepts valid later-step absence without requiring a complete chain", () => {
    const chain = fullChain();
    chain.assessments = [];
    chain.recommendations = [];
    chain.decisions = [];
    chain.reports = [];

    assert.equal(validate(chain).valid, true);
});

group("accepts multiple independent Cases and complete chains", () => {
    const first = fullChain("1");
    const second = fullChain("2");
    const combined = emptyChain();

    Object.keys(combined).forEach((key) => combined[key].push(...first[key], ...second[key]));
    assert.equal(validate(combined).valid, true);
});

group("accepts multiple Sessions under one Case", () => {
    const chain = fullChain();
    chain.sessions.push(InspectionSessionDomainModel.createSession({
        sessionId: "session-2",
        caseId: "case-1",
        createdAt: CREATED_AT
    }));

    assert.equal(validate(chain).valid, true);
});

group("accepts multiple Evidence records under one Observation", () => {
    const chain = fullChain();
    chain.evidence.push(InspectionEvidenceDomainModel.createEvidence({
        evidenceId: "evidence-2",
        observationId: "observation-1",
        reference: "reference-2",
        createdAt: CREATED_AT
    }));
    chain.findings = [InspectionFindingDomainModel.createFinding({
        findingId: "finding-1",
        evidenceIds: ["evidence-1", "evidence-2"],
        description: "Finding 1",
        createdAt: CREATED_AT
    })];

    assert.equal(validate(chain).valid, true);
});

group("accepts multiple Findings referencing the same Evidence", () => {
    const chain = fullChain();
    chain.findings.push(InspectionFindingDomainModel.createFinding({
        findingId: "finding-2",
        evidenceIds: ["evidence-1"],
        description: "Finding 2",
        createdAt: CREATED_AT
    }));

    assert.equal(validate(chain).valid, true);
});

group("returns detached deterministic deeply frozen results", () => {
    const chain = fullChain();
    const first = validate(chain);
    const second = validate(chain);

    assert.deepEqual(second, first);
    assert.notEqual(second, first);
    assert.notEqual(second.errors, first.errors);
    assert.equal(Object.isFrozen(first), true);
    assert.equal(Object.isFrozen(first.errors), true);
    assert.equal(Object.isFrozen(first.summary), true);
    assert.equal(Object.isFrozen(first.summary.collections), true);
});

group("does not mutate records arrays ordering or ownership", () => {
    const chain = structuredClone(fullChain());
    const before = structuredClone(chain);
    const records = Object.values(chain).flat();

    validate(chain);

    assert.deepEqual(chain, before);
    assert.equal(Object.isFrozen(chain), false);
    Object.values(chain).forEach((collection) => assert.equal(Object.isFrozen(collection), false));
    records.forEach((record) => assert.equal(Object.isFrozen(record), false));
});

group("rejects an invalid root and non-array or missing collections", () => {
    const root = validate(null);
    assertError(root, "FOUNDATION_INPUT_INVALID", "FoundationChain");

    const nonArray = emptyChain();
    nonArray.sessions = {};
    assertError(validate(nonArray), "FOUNDATION_COLLECTION_INVALID", "InspectionSession", "sessions");

    const missing = emptyChain();
    delete missing.areas;
    assertError(validate(missing), "FOUNDATION_COLLECTION_INVALID", "InspectionArea", "areas");
});

group("contains hostile Root and Collection proxy failures", () => {
    const hostileRoot = new Proxy({}, {
        getPrototypeOf() {
            throw new Error("hostile root");
        }
    });
    assertError(validate(hostileRoot), "FOUNDATION_INPUT_INVALID", "FoundationChain");

    const chain = emptyChain();
    chain.cases = new Proxy([], {
        ownKeys() {
            throw new Error("hostile collection");
        }
    });
    assertError(validate(chain), "FOUNDATION_COLLECTION_INVALID", "InspectionCase", "cases");
});

group("rejects a missing canonical ID without adding defaults", () => {
    const chain = emptyChain();
    const record = {
        version: "1.0",
        title: "Missing identifier",
        inspectionType: "DEFECT_INSPECTION",
        createdAt: CREATED_AT
    };
    chain.cases.push(record);

    const result = validate(chain);
    assertError(result, "FOUNDATION_RECORD_INVALID", "InspectionCase", "caseId");
    assert.equal(Object.hasOwn(record, "caseId"), false);
});

group("rejects duplicate IDs only within the affected Foundation type", () => {
    const chain = fullChain();
    chain.cases.push({ ...chain.cases[0] });
    chain.sessions[0] = { ...chain.sessions[0], sessionId: "case-1" };

    const result = validate(chain);
    assertError(result, "FOUNDATION_DUPLICATE_ID", "InspectionCase", "caseId");
    assert.equal(result.errors.some((error) => error.code === "FOUNDATION_DUPLICATE_ID"
        && error.modelType === "InspectionSession"), false);
});

group("reports missing direct parents for every typed relationship", () => {
    const cases = [
        ["sessions", "caseId", "InspectionSession"],
        ["areas", "sessionId", "InspectionArea"],
        ["observations", "areaId", "InspectionObservation"],
        ["evidence", "observationId", "InspectionEvidence"],
        ["findings", "evidenceIds", "InspectionFinding"],
        ["assessments", "findingId", "InspectionAssessment"],
        ["recommendations", "assessmentId", "InspectionRecommendation"],
        ["decisions", "recommendationId", "InspectionDecision"],
        ["reports", "decisionId", "InspectionReport"]
    ];

    cases.forEach(([collection, field, modelType]) => {
        const chain = fullChain();
        const record = structuredClone(chain[collection][0]);
        record[field] = field === "evidenceIds" ? ["missing-parent"] : "missing-parent";
        chain[collection][0] = record;
        const result = validate(chain);
        assertError(
            result,
            "PARENT_REFERENCE_MISSING",
            modelType,
            field === "evidenceIds" ? "evidenceIds[0]" : field
        );
    });
});

group("does not resolve a Parent ID from the wrong Foundation type", () => {
    const chain = fullChain();
    chain.sessions[0] = { ...chain.sessions[0], caseId: "area-1" };

    const error = assertError(
        validate(chain),
        "PARENT_REFERENCE_MISSING",
        "InspectionSession",
        "caseId"
    );
    assert.equal(error.referencedId, "area-1");
});

group("rejects duplicate evidence references as a cardinality conflict", () => {
    const chain = fullChain();
    chain.findings[0] = {
        ...chain.findings[0],
        evidenceIds: ["evidence-1", "evidence-1"]
    };

    assertError(validate(chain), "CARDINALITY_CONFLICT", "InspectionFinding", "evidenceIds");
});

group("rejects invalid Foundation versions without conversion", () => {
    const chain = fullChain();
    chain.reports[0] = { ...chain.reports[0], version: "1.0.0" };

    const error = assertError(validate(chain), "VERSION_CONFLICT", "InspectionReport", "version");
    assert.equal(error.recordId, "report-1");
    assert.equal(chain.reports[0].version, "1.0.0");
});

group("reports ambiguous parents instead of selecting the first duplicate", () => {
    const chain = fullChain();
    chain.cases.push({ ...chain.cases[0] });

    const result = validate(chain);
    assertError(result, "FOUNDATION_DUPLICATE_ID", "InspectionCase", "caseId");
    assertError(result, "PARENT_REFERENCE_AMBIGUOUS", "InspectionSession", "caseId");
});

group("reports an invalid existing Parent as a broken chain", () => {
    const chain = fullChain();
    chain.areas[0] = { ...chain.areas[0], version: "2.0" };

    const result = validate(chain);
    assertError(result, "VERSION_CONFLICT", "InspectionArea", "version");
    assertError(result, "BROKEN_FOUNDATION_CHAIN", "InspectionObservation", "areaId");
});

group("reports direct and dependent violations for an interrupted multi-step chain", () => {
    const chain = fullChain();
    chain.observations[0] = { ...chain.observations[0], areaId: "area-missing" };

    const result = validate(chain);
    assertError(result, "PARENT_REFERENCE_MISSING", "InspectionObservation", "areaId");
    assertError(result, "BROKEN_FOUNDATION_CHAIN", "InspectionEvidence", "observationId");
    assert.equal(result.errors.filter((error) => error.modelType === "InspectionEvidence").length, 1);
});

group("preserves stable A1 to A10 input and reference error order", () => {
    const chain = fullChain();
    chain.sessions[0] = { ...chain.sessions[0], caseId: "missing-case" };
    chain.findings[0] = {
        ...chain.findings[0],
        evidenceIds: ["missing-evidence-1", "missing-evidence-2"]
    };
    const result = validate(chain);
    const positions = result.errors.map((error) => [error.modelType, error.field]);

    assert.deepEqual(positions.slice(0, 3), [
        ["InspectionSession", "caseId"],
        ["InspectionArea", "sessionId"],
        ["InspectionObservation", "areaId"]
    ]);
    const findingErrors = result.errors.filter((error) => error.modelType === "InspectionFinding");
    assert.deepEqual(findingErrors.map((error) => error.referencedId), [
        "missing-evidence-1",
        "missing-evidence-2"
    ]);
});

group("suppresses stack traces operational state and dynamic metadata", () => {
    const chain = fullChain();
    chain.decisions[0] = { ...chain.decisions[0], recommendationId: "missing" };
    const result = validate(chain);
    const serialized = JSON.stringify(result);

    ["stack", "status", "review", "authorization", "timestamp", "manager", "runtime"]
        .forEach((token) => assert.equal(serialized.toLowerCase().includes(token), false, token));
});

group("has only Foundation-domain production dependencies", () => {
    const source = readFileSync(
        new URL("../portal/core/FoundationChainValidator.js", import.meta.url),
        "utf8"
    );
    const imports = [...source.matchAll(/^import .* from "([^"]+)";/gm)]
        .map((match) => match[1]);

    assert.equal(imports.length, 10);
    imports.forEach((specifier) => assert.match(specifier, /^\.\/Inspection[A-Z][A-Za-z]+DomainModel\.js$/));
    [
        "Manager", "Storage", "Workspace", "Runtime", "Workflow", "Review",
        "Authorization", "Finalization", "Export", "ReportAssembly", "Legacy"
    ].forEach((token) => assert.equal(imports.some((specifier) => specifier.includes(token)), false));
});

console.log(`Foundation Chain Validator: ${passed}/${passed} groups passed.`);
