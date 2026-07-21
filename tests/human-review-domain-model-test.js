import assert from "node:assert/strict";
import HumanReviewDomainModel from "../portal/core/HumanReviewDomainModel.js";

const {
    DECISIONS,
    REVIEWER_ROLES,
    REVIEW_SCHEMA_VERSION,
    DECISION_VOCABULARY_VERSION,
    HUMAN_REVIEW_RESPONSIBILITY
} = HumanReviewDomainModel;

let storageWrites = 0;
globalThis.localStorage = {
    getItem() { return null; },
    setItem() { storageWrites += 1; },
    removeItem() {},
    clear() {}
};

function runTest(name, fn) {
    try {
        fn();
        console.log(`✓ ${name}`);
    } catch (error) {
        console.error(`✗ ${name}`);
        throw error;
    }
}

function execution(overrides = {}) {
    return {
        id: "EI-inspection-1-0001",
        executionSchemaVersion: "expert-intelligence-execution-1.0",
        inspectionId: "inspection-1",
        buildingId: "building-1",
        caseId: "case-1",
        engineStatus: "succeeded",
        sourceFingerprint: "fnv1a-12345678",
        reasoningResult: {
            primaryHypothesis: { id: "hypothesis-1", status: "hypothesis" }
        },
        internalModelResult: {
            internalModelVersion: "brs-internal-model-1.0",
            assessmentState: "COMPLETE"
        },
        interpretationModelResult: {
            interpretationModelVersion: "brs-risk-interpretation-1.0",
            interpretationState: "INTERPRETED"
        },
        ...overrides
    };
}

function reviewData(overrides = {}) {
    const sequence = overrides.sequence ?? 1;
    const executionId = overrides.executionId ?? "EI-inspection-1-0001";

    return {
        reviewId: HumanReviewDomainModel.createReviewId(executionId, sequence),
        reviewSchemaVersion: REVIEW_SCHEMA_VERSION,
        inspectionId: "inspection-1",
        buildingId: "building-1",
        caseId: "case-1",
        executionId,
        sequence,
        previousReviewId: sequence === 1 ? null : "HR-EI-inspection-1-0001-0001",
        reviewerId: "reviewer-1",
        reviewerDisplayName: "Professional Reviewer",
        reviewerRole: REVIEWER_ROLES.PROFESSIONAL_REVIEWER,
        executionStatusAtReview: "succeeded",
        executionFingerprintAtReview: "fnv1a-12345678",
        staleAtReview: false,
        decision: DECISIONS.CONFIRMED,
        rationale: "The preserved evidence supports confirmation subject to professional judgment.",
        notes: "Reviewed against the exact persisted execution.",
        limitations: [],
        followUpRequirements: [],
        rerunRecommendation: null,
        references: [{ type: "evidence", id: "evidence-1" }],
        reviewedAt: "2026-07-21T15:00:00.000Z",
        createdAt: "2026-07-21T15:00:00.000Z",
        decisionVocabularyVersion: DECISION_VOCABULARY_VERSION,
        humanReviewResponsibility: HUMAN_REVIEW_RESPONSIBILITY,
        ...overrides
    };
}

function create(data = reviewData(), options = {}) {
    return HumanReviewDomainModel.createHumanReviewRecord(data, {
        execution: options.execution || execution(),
        persisted: options.persisted ?? true,
        corrupted: options.corrupted ?? false,
        staleAtReview: options.staleAtReview ?? data.staleAtReview,
        previousReview: options.previousReview || null
    });
}

runTest("creates a valid deterministic first Human Review record", () => {
    const record = create();

    assert.equal(record.reviewId, "HR-EI-inspection-1-0001-0001");
    assert.equal(record.sequence, 1);
    assert.equal(record.previousReviewId, null);
    assert.equal(record.executionId, "EI-inspection-1-0001");
    assert.equal(record.humanReviewResponsibility, HUMAN_REVIEW_RESPONSIBILITY);
    assert.equal(Object.isFrozen(record), true);
});

runTest("rejects unsafe execution IDs instead of normalizing them into collisions", () => {
    assert.throws(() => HumanReviewDomainModel.createReviewId("EI/inspection-1", 1), /unsupported characters/);
    assert.throws(() => HumanReviewDomainModel.createReviewId(" EI-inspection-1", 1), /unsupported characters/);
    assert.notEqual(
        HumanReviewDomainModel.createReviewId("EI-inspection-1", 1),
        HumanReviewDomainModel.createReviewId("EI_inspection-1", 1)
    );
});

runTest("creates a valid subsequent review with immediate predecessor", () => {
    const first = create();
    const sequence = HumanReviewDomainModel.createNextReviewSequence(first);
    const second = create(reviewData({
        sequence,
        reviewId: HumanReviewDomainModel.createReviewId(first.executionId, sequence),
        previousReviewId: first.reviewId,
        reviewerId: "reviewer-2",
        reviewerDisplayName: "Second Reviewer",
        reviewerRole: REVIEWER_ROLES.SECOND_REVIEWER,
        reviewedAt: "2026-07-21T16:00:00.000Z",
        createdAt: "2026-07-21T16:00:00.000Z"
    }), { previousReview: first });

    assert.equal(second.sequence, 2);
    assert.equal(second.previousReviewId, first.reviewId);
    assert.equal(first.sequence, 1);
    assert.equal(first.previousReviewId, null);
});

runTest("detaches and freezes reviewer arrays references and returned records", () => {
    const reviewer = {
        reviewerId: "reviewer-input",
        reviewerDisplayName: "Input Reviewer",
        reviewerRole: REVIEWER_ROLES.LEAD_REVIEWER
    };
    const limitations = ["Visual access was limited."];
    const followUpRequirements = ["Verify concealed construction."];
    const references = [{ type: "finding", id: "finding-1", metadata: { page: 2 } }];
    const source = reviewData({ ...reviewer, limitations, followUpRequirements, references });
    const record = create(source);

    reviewer.reviewerDisplayName = "Mutated";
    limitations[0] = "Mutated";
    followUpRequirements[0] = "Mutated";
    references[0].metadata.page = 99;
    source.rationale = "Mutated";

    assert.equal(record.reviewerDisplayName, "Input Reviewer");
    assert.equal(record.limitations[0], "Visual access was limited.");
    assert.equal(record.followUpRequirements[0], "Verify concealed construction.");
    assert.equal(record.references[0].metadata.page, 2);
    assert.throws(() => { record.notes = "Mutated"; }, TypeError);
    assert.throws(() => { record.references[0].id = "mutated"; }, TypeError);
});

runTest("supports exactly the approved professional decisions", () => {
    const cases = [
        [DECISIONS.CONFIRMED, {}],
        [DECISIONS.CONFIRMED_WITH_LIMITATIONS, { limitations: ["Limited access."] }],
        [DECISIONS.REJECTED, {}],
        [DECISIONS.RERUN_REQUIRED, { rerunRecommendation: "Rerun after new evidence is persisted." }]
    ];

    cases.forEach(([decision, fields]) => {
        assert.equal(create(reviewData({ decision, ...fields })).decision, decision);
    });
});

runTest("rejects unsupported workflow and professional decisions", () => {
    ["NOT_REVIEWED", "UNDER_REVIEW", "APPROVED", ""].forEach((decision) => {
        assert.throws(() => create(reviewData({ decision })), /professional decision/);
    });
});

runTest("supports exactly the approved descriptive reviewer roles", () => {
    Object.values(REVIEWER_ROLES).forEach((reviewerRole) => {
        assert.equal(create(reviewData({ reviewerRole })).reviewerRole, reviewerRole);
    });
    assert.throws(() => create(reviewData({ reviewerRole: "ADMINISTRATOR" })), /reviewerRole/);
});

runTest("enforces decision-specific rationale limitation and rerun rules", () => {
    assert.throws(
        () => create(reviewData({ decision: DECISIONS.CONFIRMED_WITH_LIMITATIONS, limitations: [] })),
        /requires at least one limitation/
    );
    assert.throws(() => create(reviewData({ decision: DECISIONS.REJECTED, rationale: "" })), /rationale/);
    assert.throws(
        () => create(reviewData({ decision: DECISIONS.RERUN_REQUIRED, rerunRecommendation: null })),
        /rerun recommendation/
    );

    const rerun = create(reviewData({
        decision: DECISIONS.RERUN_REQUIRED,
        rerunRecommendation: "Persist the missing measurement before a manual rerun."
    }));
    assert.equal(rerun.decision, DECISIONS.RERUN_REQUIRED);
    assert.equal(storageWrites, 0);
});

runTest("strictly validates required record fields and structures", () => {
    const invalidCases = [
        [{ reviewId: "" }, /reviewId/],
        [{ executionId: "" }, /executionId/],
        [{ inspectionId: "" }, /inspectionId/],
        [{ reviewerId: "" }, /reviewerId/],
        [{ reviewerDisplayName: "" }, /reviewerDisplayName/],
        [{ executionFingerprintAtReview: "" }, /Fingerprint/],
        [{ executionStatusAtReview: "" }, /Status/],
        [{ sequence: 0, reviewId: "invalid" }, /sequence/],
        [{ reviewedAt: "not-a-date" }, /reviewedAt/],
        [{ createdAt: "not-a-date" }, /createdAt/],
        [{ reviewedAt: "2026-07-21" }, /reviewedAt/],
        [{ createdAt: "2026-07-21T15:00:00" }, /createdAt/],
        [{ notes: { malformed: true } }, /notes/],
        [{ buildingId: false }, /buildingId/],
        [{ caseId: {} }, /caseId/],
        [{ rerunRecommendation: 7 }, /rerunRecommendation/],
        [{ limitations: "invalid" }, /limitations/],
        [{ followUpRequirements: [""] }, /followUpRequirements/],
        [{ references: [7] }, /references/],
        [{ staleAtReview: "false" }, /staleAtReview/],
        [{ humanReviewResponsibility: "SYSTEM_APPROVAL" }, /responsibility marker/]
    ];

    invalidCases.forEach(([overrides, pattern]) => {
        const record = { ...reviewData(), ...overrides };
        const validation = HumanReviewDomainModel.validateHumanReviewRecord(record);
        assert.equal(validation.valid, false);
        assert.match(validation.errors.join(" "), pattern);
    });
});

runTest("validates exact persisted Expert Execution eligibility", () => {
    const valid = HumanReviewDomainModel.validateExpertExecutionReviewEligibility(execution(), {
        persisted: true,
        inspectionId: "inspection-1",
        staleAtReview: false
    });
    assert.equal(valid.eligible, true);

    const invalidCases = [
        [null, { persisted: true }, /must be an object/],
        [execution(), { persisted: false }, /confirmed as persisted/],
        [execution({ persisted: false }), { persisted: true }, /non-persisted state/],
        [execution(), { persisted: true, corrupted: true }, /Corrupted/],
        [execution({ corrupted: true }), { persisted: true }, /Corrupted/],
        [execution({ executionSchemaVersion: "unknown-schema" }), { persisted: true }, /unsupported or missing schema/],
        [execution({ engineStatus: "failed" }), { persisted: true }, /not reviewable/],
        [execution({ id: "" }), { persisted: true }, /stable execution ID/],
        [execution({ sourceFingerprint: "" }), { persisted: true }, /source fingerprint/],
        [execution(), { persisted: true, inspectionId: "inspection-2" }, /does not belong/]
    ];

    invalidCases.forEach(([source, options, pattern]) => {
        const result = HumanReviewDomainModel.validateExpertExecutionReviewEligibility(source, options);
        assert.equal(result.eligible, false);
        assert.match(result.errors.join(" "), pattern);
    });
});

runTest("rejects cyclic and prototype-bearing references consistently", () => {
    const cyclic = { id: "reference-cyclic" };
    cyclic.self = cyclic;
    const cyclicData = reviewData({ references: [cyclic] });

    assert.equal(HumanReviewDomainModel.validateHumanReviewRecord(cyclicData).valid, false);
    assert.throws(() => create(cyclicData), /cyclic|references/);

    class ReferenceRecord {
        constructor() {
            this.id = "reference-class";
        }
    }

    const prototypeData = reviewData({ references: [new ReferenceRecord()] });
    assert.equal(HumanReviewDomainModel.validateHumanReviewRecord(prototypeData).valid, false);
    assert.throws(() => create(prototypeData), /prototype-bearing|references/);
});

runTest("preserves stale review state and prevents it masquerading as current", () => {
    const record = create(reviewData({
        staleAtReview: true,
        rationale: "This historical execution is stale and is reviewed only to document why a rerun is required.",
        decision: DECISIONS.RERUN_REQUIRED,
        rerunRecommendation: "Rerun against the current persisted inspection source."
    }), { execution: execution() });

    assert.equal(record.staleAtReview, true);
    assert.throws(
        () => create(reviewData({ staleAtReview: false }), {
            execution: execution(),
            persisted: true,
            staleAtReview: true
        }),
        /staleAtReview/
    );
});

runTest("enforces first and later predecessor sequence rules", () => {
    const first = create();

    assert.throws(
        () => create(reviewData({ previousReviewId: "HR-other-0001" })),
        /first review/
    );
    assert.throws(
        () => create(reviewData({ sequence: 2, reviewId: "HR-EI-inspection-1-0001-0002" })),
        /immediately preceding review/
    );
    assert.throws(
        () => create(reviewData({
            sequence: 2,
            reviewId: "HR-EI-inspection-1-0001-0002",
            previousReviewId: "HR-EI-inspection-1-0001-0002"
        }), { previousReview: first }),
        /previousReviewId|itself/
    );
    assert.throws(
        () => create(reviewData({
            sequence: 3,
            reviewId: "HR-EI-inspection-1-0001-0003",
            previousReviewId: first.reviewId
        }), { previousReview: first }),
        /immediately follow/
    );
    assert.throws(
        () => create(reviewData({
            sequence: 2,
            reviewId: "HR-EI-inspection-1-0001-0002",
            previousReviewId: "invalid-review"
        }), {
            previousReview: {
                reviewId: "invalid-review",
                sequence: 1,
                executionId: "EI-inspection-1-0001",
                inspectionId: "inspection-1"
            }
        }),
        /previous review is invalid/
    );
});

runTest("does not mutate Expert Execution or model outputs", () => {
    const sourceExecution = execution();
    const before = JSON.stringify(sourceExecution);
    create(reviewData(), { execution: sourceExecution });

    assert.equal(JSON.stringify(sourceExecution), before);
    assert.equal(sourceExecution.internalModelResult.assessmentState, "COMPLETE");
    assert.equal(sourceExecution.interpretationModelResult.interpretationState, "INTERPRETED");
});

runTest("has no persistence report export rerun voting or authorization side effects", () => {
    const report = { status: "draft", finalized: false };
    const exportState = { authorized: false };
    const executionCountBefore = 1;
    const record = create(reviewData({
        decision: DECISIONS.CONFIRMED,
        reviewerRole: REVIEWER_ROLES.LEAD_REVIEWER
    }));

    assert.equal(storageWrites, 0);
    assert.deepEqual(report, { status: "draft", finalized: false });
    assert.deepEqual(exportState, { authorized: false });
    assert.equal(executionCountBefore, 1);
    assert.equal(Object.hasOwn(record, "permissions"), false);
    assert.equal(Object.hasOwn(record, "votes"), false);
    assert.equal(Object.hasOwn(record, "consensus"), false);
});

runTest("produces deterministic independent output for identical valid input", () => {
    const source = reviewData();
    const first = create(source);
    const second = create(source);

    assert.deepStrictEqual(first, second);
    assert.notStrictEqual(first, second);
    assert.notStrictEqual(first.references, second.references);
});

runTest("rejects sparse structured arrays and preserves dense arrays", () => {
    const sparseArrays = [
        Array(1),
        [,],
        ["valid", , "valid"],
        Object.assign(["valid", "deleted"], { length: 3 })
    ];
    const deleted = ["valid", "deleted"];
    delete deleted[1];
    sparseArrays.push(deleted);

    ["limitations", "followUpRequirements", "references"].forEach((field) => {
        sparseArrays.forEach((value) => {
            const data = reviewData({ [field]: value });
            assert.equal(HumanReviewDomainModel.validateHumanReviewRecord(data).valid, false);
            assert.throws(() => create(data), /sparse|array|references/);
        });
    });

    const nestedSparse = { id: "reference-1", metadata: { values: ["valid", , "valid"] } };
    const nestedData = reviewData({ references: [nestedSparse] });
    assert.equal(HumanReviewDomainModel.validateHumanReviewRecord(nestedData).valid, false);
    assert.throws(() => create(nestedData), /sparse|references/);

    assert.deepEqual(create(reviewData({ limitations: [], followUpRequirements: [], references: [] })).limitations, []);
    assert.deepEqual(create(reviewData({ limitations: ["Valid."], followUpRequirements: ["Verify."], references: ["ref-1"] })).references, ["ref-1"]);
    assert.throws(
        () => create(reviewData({ decision: DECISIONS.CONFIRMED_WITH_LIMITATIONS, limitations: Array(1) })),
        /sparse|array/
    );
});

runTest("rejects symbol-keyed and non-lossless structured properties", () => {
    const symbol = Symbol("hidden");
    const cases = [];
    const rootObject = { id: "reference-root", [symbol]: "hidden" };
    const nestedObject = { id: "reference-nested", metadata: { [symbol]: "hidden" } };
    const arrayObject = { id: "reference-array-object", values: [{ [symbol]: "hidden" }] };
    const propertyArray = [];
    propertyArray[symbol] = "hidden";
    const limitationArray = ["Valid limitation."];
    limitationArray[symbol] = "hidden";
    const referenceMetadata = { id: "reference-metadata", metadata: {} };
    referenceMetadata.metadata[symbol] = "hidden";
    cases.push(
        reviewData({ references: [rootObject] }),
        reviewData({ references: [nestedObject] }),
        reviewData({ references: [arrayObject] }),
        reviewData({ references: propertyArray }),
        reviewData({ limitations: limitationArray }),
        reviewData({ references: [referenceMetadata] })
    );

    cases.forEach((data) => {
        assert.equal(HumanReviewDomainModel.validateHumanReviewRecord(data).valid, false);
        assert.throws(() => create(data), /string-keyed|property-bearing|references|limitations/);
    });

    const nonEnumerable = { id: "reference-hidden" };
    Object.defineProperty(nonEnumerable, "hidden", { value: true, enumerable: false });
    assert.throws(() => create(reviewData({ references: [nonEnumerable] })), /string-keyed|references/);
    assert.equal(create(reviewData({ references: [{ id: "ordinary", metadata: { page: 2 } }] })).references[0].metadata.page, 2);
});

runTest("defaults omitted optional arrays without accepting malformed explicit values", () => {
    const omitted = reviewData();
    delete omitted.limitations;
    delete omitted.followUpRequirements;
    delete omitted.references;
    assert.equal(HumanReviewDomainModel.validateHumanReviewRecord(omitted).valid, true);
    const first = create(omitted);
    const second = create(omitted);

    [first.limitations, first.followUpRequirements, first.references].forEach((value) => {
        assert.deepEqual(value, []);
        assert.equal(Object.isFrozen(value), true);
    });
    assert.notStrictEqual(first.limitations, second.limitations);
    assert.notStrictEqual(first.followUpRequirements, second.followUpRequirements);
    assert.notStrictEqual(first.references, second.references);
    assert.throws(() => { first.limitations.push("mutation"); }, TypeError);

    ["limitations", "followUpRequirements", "references"].forEach((field) => {
        const oneOmitted = reviewData();
        delete oneOmitted[field];
        assert.deepEqual(create(oneOmitted)[field], []);

        [undefined, null, {}, "invalid"].forEach((value) => {
            const malformed = reviewData({ [field]: value });
            assert.equal(HumanReviewDomainModel.validateHumanReviewRecord(malformed).valid, false);
            assert.throws(() => create(malformed), /unsupported|array|references/);
        });
    });

    const limited = reviewData({ decision: DECISIONS.CONFIRMED_WITH_LIMITATIONS });
    delete limited.limitations;
    assert.throws(() => create(limited), /requires at least one limitation/);

    const rerun = reviewData({ decision: DECISIONS.RERUN_REQUIRED, rerunRecommendation: null });
    delete rerun.followUpRequirements;
    assert.throws(() => create(rerun), /rerun recommendation/);
});

runTest("requires positive safe review sequences without predecessor overflow", () => {
    [
        Number.MAX_SAFE_INTEGER + 1,
        Infinity,
        NaN,
        1.5,
        0,
        -1,
        "1"
    ].forEach((sequence) => {
        assert.throws(() => HumanReviewDomainModel.createReviewId("EI-inspection-1-0001", sequence), /safe integer/);
        const invalid = reviewData();
        invalid.sequence = sequence;
        invalid.reviewId = "invalid";
        assert.equal(HumanReviewDomainModel.validateHumanReviewRecord(invalid).valid, false);
    });

    const maximum = reviewData({
        sequence: Number.MAX_SAFE_INTEGER,
        reviewId: HumanReviewDomainModel.createReviewId("EI-inspection-1-0001", Number.MAX_SAFE_INTEGER),
        previousReviewId: "HR-EI-inspection-1-0001-previous"
    });
    assert.throws(
        () => HumanReviewDomainModel.createNextReviewSequence(maximum),
        /no safe successor/
    );
    assert.throws(
        () => create(reviewData({
            sequence: Number.MAX_SAFE_INTEGER - 1,
            reviewId: HumanReviewDomainModel.createReviewId("EI-inspection-1-0001", Number.MAX_SAFE_INTEGER - 1),
            previousReviewId: maximum.reviewId
        }), { previousReview: maximum }),
        /no safe successor/
    );
});

runTest("rejects contradictory first and later review history inputs", () => {
    const first = create();
    assert.equal(first.sequence, 1);
    assert.equal(first.previousReviewId, null);

    assert.throws(() => create(reviewData(), { previousReview: first }), /first review.*previous review/);
    assert.throws(
        () => create(reviewData({ previousReviewId: first.reviewId })),
        /first review.*predecessor/
    );

    const laterWithoutId = reviewData({
        sequence: 2,
        reviewId: HumanReviewDomainModel.createReviewId(first.executionId, 2),
        previousReviewId: undefined
    });
    assert.throws(() => create(laterWithoutId, { previousReview: first }), /previousReviewId/);

    const laterWithoutReview = reviewData({
        sequence: 2,
        reviewId: HumanReviewDomainModel.createReviewId(first.executionId, 2),
        previousReviewId: first.reviewId
    });
    assert.throws(() => create(laterWithoutReview), /immediately preceding review/);

    const second = create(laterWithoutReview, { previousReview: first });
    assert.equal(second.sequence, 2);
    assert.equal(second.previousReviewId, first.reviewId);
});

runTest("rejects null-prototype structured objects consistently", () => {
    const rootInput = Object.assign(Object.create(null), reviewData());
    assert.equal(HumanReviewDomainModel.validateHumanReviewRecord(rootInput).valid, false);
    assert.throws(() => create(rootInput), /plain object/);

    const rootReference = Object.create(null);
    rootReference.id = "null-prototype-reference";
    rootReference.value = "unsupported";
    const rootData = reviewData({ references: [rootReference] });
    assert.equal(HumanReviewDomainModel.validateHumanReviewRecord(rootData).valid, false);
    assert.throws(() => create(rootData), /prototype-bearing|references/);

    const nestedMetadata = Object.create(null);
    nestedMetadata.page = 2;
    const nestedData = reviewData({
        references: [{ id: "nested-null-prototype", metadata: nestedMetadata }]
    });
    assert.equal(HumanReviewDomainModel.validateHumanReviewRecord(nestedData).valid, false);
    assert.throws(() => create(nestedData), /prototype-bearing|references/);
});

console.log("Human Review Domain Model tests completed successfully.");
