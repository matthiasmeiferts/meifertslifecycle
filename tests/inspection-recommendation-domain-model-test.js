import assert from "node:assert/strict";
import fs from "node:fs";
import InspectionRecommendationDomainModel, * as InspectionRecommendationModule from "../portal/core/InspectionRecommendationDomainModel.js";

const EXPECTED_ERROR = "InspectionRecommendationDomainModel: invalid Inspection Recommendation.";
const VALID_INPUT = Object.freeze({
    recommendationId: "REC-1",
    assessmentId: "ASM-1",
    recommendation: "Arrange a specialist inspection of the documented condition.",
    createdAt: "2026-07-26T08:30:00.000Z"
});

let passed = 0;

function test(name, operation) {
    try {
        operation();
        passed += 1;
    } catch (error) {
        error.message = `${name}: ${error.message}`;
        throw error;
    }
}

function rejectsCreate(value) {
    assert.throws(
        () => InspectionRecommendationDomainModel.createRecommendation(value),
        (error) => error instanceof Error && error.message === EXPECTED_ERROR
    );
}

function rejectsValidate(value) {
    assert.throws(
        () => InspectionRecommendationDomainModel.validateRecommendation(value),
        (error) => error instanceof Error && error.message === EXPECTED_ERROR
    );
}

function instrumentRecord(target) {
    const counts = {
        getPrototypeOf: 0,
        ownKeys: 0,
        descriptors: new Map(),
        get: 0,
        has: 0,
        set: 0,
        defineProperty: 0
    };
    const proxy = new Proxy(target, {
        getPrototypeOf(value) {
            counts.getPrototypeOf += 1;
            return Reflect.getPrototypeOf(value);
        },
        ownKeys(value) {
            counts.ownKeys += 1;
            return Reflect.ownKeys(value);
        },
        getOwnPropertyDescriptor(value, key) {
            counts.descriptors.set(key, (counts.descriptors.get(key) || 0) + 1);
            return Reflect.getOwnPropertyDescriptor(value, key);
        },
        get() {
            counts.get += 1;
            throw new Error("unexpected get");
        },
        has(value, key) {
            counts.has += 1;
            return Reflect.has(value, key);
        },
        set(value, key, next, receiver) {
            counts.set += 1;
            return Reflect.set(value, key, next, receiver);
        },
        defineProperty(value, key, descriptor) {
            counts.defineProperty += 1;
            return Reflect.defineProperty(value, key, descriptor);
        }
    });

    return { proxy, counts };
}

function assertSingleCapture(counts, expectedKeys) {
    assert.equal(counts.getPrototypeOf, 1);
    assert.equal(counts.ownKeys, 1);
    assert.equal(counts.descriptors.size, expectedKeys.length);
    expectedKeys.forEach((key) => assert.equal(counts.descriptors.get(key), 1));
    assert.equal(counts.get, 0);
    assert.equal(counts.has, 0);
    assert.equal(counts.set, 0);
    assert.equal(counts.defineProperty, 0);
}

test("exports only the governed default public contract", () => {
    assert.deepEqual(Object.keys(InspectionRecommendationModule), ["default"]);
    assert.equal(InspectionRecommendationModule.default, InspectionRecommendationDomainModel);
    const publicMembers = Object.getOwnPropertyNames(InspectionRecommendationDomainModel)
        .filter((name) => !["length", "name", "prototype"].includes(name));
    assert.deepEqual(publicMembers, [
        "VERSION",
        "createRecommendation",
        "validateRecommendation"
    ]);
});

test("VERSION is exactly 1.0", () => {
    assert.equal(InspectionRecommendationDomainModel.VERSION, "1.0");
});

test("creates the exact canonical recommendation in canonical field order", () => {
    const result = InspectionRecommendationDomainModel.createRecommendation(VALID_INPUT);
    assert.deepEqual(Object.keys(result), [
        "version",
        "recommendationId",
        "assessmentId",
        "recommendation",
        "createdAt"
    ]);
    assert.deepEqual(result, { version: "1.0", ...VALID_INPUT });
});

test("sets version internally and rejects version in creation input", () => {
    assert.equal(
        InspectionRecommendationDomainModel.createRecommendation(VALID_INPUT).version,
        "1.0"
    );
    rejectsCreate({ version: "1.0", ...VALID_INPUT });
});

test("requires all four creation fields", () => {
    Object.keys(VALID_INPUT).forEach((field) => {
        const input = { ...VALID_INPUT };
        delete input[field];
        rejectsCreate(input);
    });
});

test("rejects all excluded architectural and unknown fields", () => {
    [
        "id", "assessmentIds", "assessment", "findingId", "findingIds",
        "evidenceId", "evidenceIds", "observationId", "caseId", "sessionId",
        "areaId", "title", "description", "summary", "rationale", "conclusion",
        "action", "technicalImplication", "category", "classification", "severity",
        "confidence", "probability", "likelihood", "impact", "consequence",
        "urgency", "priority", "risk", "riskLevel", "riskScore", "condition",
        "conditionRating", "status", "reviewStatus", "expertReviewRequired",
        "generated", "generationReason", "previewOnly", "persisted", "metadata",
        "decisionId", "decisionIds", "createdBy", "updatedBy", "updatedAt",
        "unknownField"
    ].forEach((field) => rejectsCreate({ ...VALID_INPUT, [field]: "forbidden" }));
});

test("rejects symbol non-enumerable and accessor properties without execution", () => {
    rejectsCreate({ ...VALID_INPUT, [Symbol("hidden")]: true });

    const hidden = { ...VALID_INPUT };
    Object.defineProperty(hidden, "hidden", { value: true });
    rejectsCreate(hidden);

    let getterCalls = 0;
    let setterCalls = 0;
    const accessor = { ...VALID_INPUT };
    Object.defineProperty(accessor, "recommendation", {
        enumerable: true,
        get() {
            getterCalls += 1;
            return VALID_INPUT.recommendation;
        },
        set() {
            setterCalls += 1;
        }
    });
    rejectsCreate(accessor);
    assert.equal(getterCalls, 0);
    assert.equal(setterCalls, 0);
});

test("accepts ordinary and null-prototype roots", () => {
    assert.deepEqual(InspectionRecommendationDomainModel.createRecommendation(VALID_INPUT), {
        version: "1.0",
        ...VALID_INPUT
    });
    const input = Object.assign(Object.create(null), VALID_INPUT);
    assert.deepEqual(InspectionRecommendationDomainModel.createRecommendation(input), {
        version: "1.0",
        ...VALID_INPUT
    });
});

test("rejects primitive array function and custom-prototype roots", () => {
    [null, undefined, true, false, 1, 1n, "record", Symbol("record"), [], () => {}]
        .forEach((value) => rejectsCreate(value));
    rejectsCreate(Object.create({ custom: true }));
});

test("string fields preserve unicode whitespace and recommendation line breaks", () => {
    const input = {
        recommendationId: "  REC-Ä-一  ",
        assessmentId: "  ASM-é-二  ",
        recommendation: "  Empfohlene Maßnahme – unverändert.\n第二行  ",
        createdAt: VALID_INPUT.createdAt
    };
    const result = InspectionRecommendationDomainModel.createRecommendation(input);
    assert.equal(result.recommendationId, input.recommendationId);
    assert.equal(result.assessmentId, input.assessmentId);
    assert.equal(result.recommendation, input.recommendation);
});

test("all string fields reject the complete invalid type matrix", () => {
    const invalidValues = [
        "", " ", "\t\n", 0, 1, NaN, Infinity, true, false, null, undefined,
        Symbol("value"), 1n, new String("wrapped"), [], {}, () => {}
    ];
    ["recommendationId", "assessmentId", "recommendation"].forEach((field) => {
        invalidValues.forEach((value) => rejectsCreate({ ...VALID_INPUT, [field]: value }));
    });
});

test("does not resolve assessments findings or evidence", () => {
    const result = InspectionRecommendationDomainModel.createRecommendation({
        ...VALID_INPUT,
        assessmentId: "NONEXISTENT-ASSESSMENT"
    });
    assert.equal(result.assessmentId, "NONEXISTENT-ASSESSMENT");
    ["findingId", "findingIds", "evidenceId", "evidenceIds"]
        .forEach((field) => assert.equal(Object.hasOwn(result, field), false));
});

test("accepts canonical timestamp calendar boundaries including year zero", () => {
    [
        "0000-02-29T00:00:00.000Z",
        "1900-02-28T23:59:59.999Z",
        "2000-02-29T00:00:00.000Z",
        "2024-02-29T12:30:45.123Z",
        "2026-04-30T23:59:59.999Z",
        "9999-12-31T23:59:59.999Z"
    ].forEach((createdAt) => {
        assert.equal(
            InspectionRecommendationDomainModel.createRecommendation({
                ...VALID_INPUT,
                createdAt
            }).createdAt,
            createdAt
        );
    });
});

test("rejects impossible calendar timestamps", () => {
    [
        "0001-02-29T00:00:00.000Z", "1900-02-29T00:00:00.000Z",
        "2100-02-29T00:00:00.000Z", "2026-00-01T00:00:00.000Z",
        "2026-13-01T00:00:00.000Z", "2026-01-00T00:00:00.000Z",
        "2026-01-32T00:00:00.000Z", "2026-02-30T00:00:00.000Z",
        "2026-04-31T00:00:00.000Z", "2026-11-31T00:00:00.000Z"
    ].forEach((createdAt) => rejectsCreate({ ...VALID_INPUT, createdAt }));
});

test("rejects noncanonical timestamp time precision zone and types", () => {
    [
        "2026-07-26T24:00:00.000Z", "2026-07-26T08:60:00.000Z",
        "2026-07-26T08:30:60.000Z", "2026-07-26T08:30:00.00Z",
        "2026-07-26T08:30:00.0000Z", "2026-07-26T08:30:00.000",
        "2026-07-26T08:30:00.000z", "2026-07-26T08:30:00.000+00:00",
        " 2026-07-26T08:30:00.000Z", "2026-07-26T08:30:00.000Z "
    ].forEach((createdAt) => rejectsCreate({ ...VALID_INPUT, createdAt }));
    [null, undefined, 0, true, {}, []]
        .forEach((createdAt) => rejectsCreate({ ...VALID_INPUT, createdAt }));
});

test("captures createRecommendation input exactly once", () => {
    const { proxy, counts } = instrumentRecord({ ...VALID_INPUT });
    assert.deepEqual(InspectionRecommendationDomainModel.createRecommendation(proxy), {
        version: "1.0",
        ...VALID_INPUT
    });
    assertSingleCapture(counts, Object.keys(VALID_INPUT));
});

test("captures validateRecommendation input exactly once", () => {
    const canonical = { version: "1.0", ...VALID_INPUT };
    const { proxy, counts } = instrumentRecord(canonical);
    assert.deepEqual(
        InspectionRecommendationDomainModel.validateRecommendation(proxy),
        { valid: true, errors: [] }
    );
    assertSingleCapture(counts, Object.keys(canonical));
});

test("maps reflection descriptor and revoked-proxy failures to the domain error", () => {
    ["getPrototypeOf", "ownKeys", "getOwnPropertyDescriptor"].forEach((trap) => {
        rejectsCreate(new Proxy({ ...VALID_INPUT }, {
            [trap]() {
                throw new Error(`${trap} failed`);
            }
        }));
    });
    const revoked = Proxy.revocable({ ...VALID_INPUT }, {});
    revoked.revoke();
    rejectsCreate(revoked.proxy);
    rejectsCreate(new Proxy({}, {
        ownKeys() {
            return ["recommendationId"];
        },
        getOwnPropertyDescriptor() {
            return undefined;
        }
    }));
});

test("rejects descriptor instability without executing accessors", () => {
    let invalidateAssessmentId = false;
    const proxy = new Proxy({ ...VALID_INPUT }, {
        getOwnPropertyDescriptor(target, key) {
            if (key === "recommendationId") {
                invalidateAssessmentId = true;
                return Reflect.getOwnPropertyDescriptor(target, key);
            }
            if (key === "assessmentId" && invalidateAssessmentId) {
                return {
                    configurable: true,
                    enumerable: true,
                    get() {
                        return target.assessmentId;
                    }
                };
            }
            return Reflect.getOwnPropertyDescriptor(target, key);
        }
    });
    rejectsCreate(proxy);
});

test("accepts a transparent proxy by observable record shape", () => {
    const target = { ...VALID_INPUT };
    const proxy = new Proxy(target, {
        ownKeys() {
            return Object.keys(VALID_INPUT);
        },
        getOwnPropertyDescriptor(value, key) {
            return Reflect.getOwnPropertyDescriptor(value, key);
        }
    });
    assert.deepEqual(InspectionRecommendationDomainModel.createRecommendation(proxy), {
        version: "1.0",
        ...VALID_INPUT
    });
});

test("preserves input and returns detached deeply frozen output", () => {
    const input = { ...VALID_INPUT };
    const before = { ...input };
    const result = InspectionRecommendationDomainModel.createRecommendation(input);
    assert.deepEqual(input, before);
    assert.equal(Object.isFrozen(input), false);
    assert.equal(Object.isFrozen(result), true);
    assert.notEqual(result, input);
});

test("is deterministic while returning separate root objects", () => {
    const first = InspectionRecommendationDomainModel.createRecommendation(VALID_INPUT);
    const second = InspectionRecommendationDomainModel.createRecommendation(VALID_INPUT);
    assert.deepEqual(first, second);
    assert.notEqual(first, second);
});

test("validates only the complete canonical contract with frozen success output", () => {
    const canonical = { version: "1.0", ...VALID_INPUT };
    const result = InspectionRecommendationDomainModel.validateRecommendation(canonical);
    assert.deepEqual(result, { valid: true, errors: [] });
    assert.equal(Object.isFrozen(result), true);
    assert.equal(Object.isFrozen(result.errors), true);
    assert.equal(Object.isFrozen(canonical), false);
});

test("validation creates no defaults and rejects contract drift", () => {
    const canonical = { version: "1.0", ...VALID_INPUT };
    Object.keys(canonical).forEach((field) => {
        const value = { ...canonical };
        delete value[field];
        rejectsValidate(value);
    });
    rejectsValidate({ ...canonical, version: "2.0" });
    rejectsValidate({ ...canonical, status: "APPROVED" });
});

test("production source has no forbidden dependencies or mechanisms", () => {
    const source = fs.readFileSync(
        new URL("../portal/core/InspectionRecommendationDomainModel.js", import.meta.url),
        "utf8"
    );
    const forbidden = [
        "InspectionCaseDomainModel", "InspectionSessionDomainModel",
        "InspectionAreaDomainModel", "InspectionObservationDomainModel",
        "InspectionEvidenceDomainModel", "InspectionFindingDomainModel",
        "InspectionAssessmentDomainModel", "RecommendationManager",
        "RecommendationGenerationEngine", "RecommendationDraftPreviewSandbox",
        "AssessmentManager", "AssessmentGenerationEngine", "CanonicalDataModel",
        "InspectionPipelineEngine", "PipelineIntegrityValidator",
        "ReportAssemblyEngine", "DecisionManager", "StorageManager",
        "localStorage", "sessionStorage", "EventBus", "Runtime", "Workflow",
        "Report", "Export", "Decision", "ExpertIntelligence", "KnowledgeProvider",
        "Temporal", "Intl", "Math.random", "crypto", "Crypto", "JSON.parse",
        "JSON.stringify", "structuredClone"
    ];
    forbidden.forEach((token) => assert.equal(source.includes(token), false, token));
    assert.equal(/^\s*import\s/m.test(source), false);
    assert.equal(/\bDate\b/.test(source), false);
});

console.log(`Inspection Recommendation Domain Model: ${passed}/${passed} groups passed.`);
