import assert from "node:assert/strict";
import FindingGenerationEngine from "../portal/core/FindingGenerationEngine.js";

function runTest(name, fn) {
    try {
        fn();
        console.log(`✓ ${name}`);
    } catch (err) {
        console.error(`✗ ${name}`);
        throw err;
    }
}

runTest("creates finding on equals rule", () => {
    const findings =
        FindingGenerationEngine.generateFindings(
            [{
                id: "q1",
                findingRules: [{
                    equals: "yes",
                    findingId: "f1",
                    category: "Moisture",
                    severity: "high",
                    summary: "Moisture detected."
                }]
            }],
            [],
            [],
            {
                answers: {
                    q1: { value: "yes" }
                }
            }
        );

    assert.equal(findings.length, 1);
    assert.equal(findings[0].findingId, "f1");
});

runTest("does not generate finding when answer differs", () => {
    const findings =
        FindingGenerationEngine.generateFindings(
            [{
                id: "q1",
                findingRules: [{
                    equals: "yes"
                }]
            }],
            [],
            [],
            {
                answers: {
                    q1: { value: "no" }
                }
            }
        );

    assert.equal(findings.length, 0);
});

runTest("matches oneOf rule", () => {
    const findings =
        FindingGenerationEngine.generateFindings(
            [{
                id: "q1",
                findingRules: [{
                    oneOf: ["moderate", "severe"]
                }]
            }],
            [],
            [],
            {
                answers: {
                    q1: { value: "severe" }
                }
            }
        );

    assert.equal(findings.length, 1);
});

runTest("requires evidence", () => {

    const evidence = [{
        evidenceId: "thermal-image"
    }];

    const findings =
        FindingGenerationEngine.generateFindings(
            [{
                id: "q1",
                findingRules: [{
                    requiredEvidenceIds: [
                        "thermal-image"
                    ]
                }]
            }],
            evidence,
            evidence,
            {}
        );

    assert.equal(findings.length, 1);

});

runTest("missing evidence blocks finding", () => {

    const findings =
        FindingGenerationEngine.generateFindings(
            [{
                id: "q1",
                findingRules: [{
                    requiredEvidenceIds: [
                        "thermal-image"
                    ]
                }]
            }],
            [],
            [],
            {}
        );

    assert.equal(findings.length, 0);

});

runTest("context rule works", () => {

    const findings =
        FindingGenerationEngine.generateFindings(
            [{
                id: "q1",
                findingRules: [{
                    context: {
                        "profile.country":
                            "Thailand"
                    }
                }]
            }],
            [],
            [],
            {
                profile: {
                    country: "Thailand"
                }
            }
        );

    assert.equal(findings.length, 1);

});

runTest("generated follow-up questions are evaluated", () => {

    const findings =
        FindingGenerationEngine.generateFindings(
            [],
            [{
                question: {
                    id: "followup",
                    findingRules: [{
                        answered: false
                    }]
                }
            }],
            [],
            {}
        );

    assert.equal(findings.length, 1);

});

runTest("duplicate finding ids are ignored", () => {

    const findings =
        FindingGenerationEngine.generateFindings(
            [{
                id: "q1",
                findingRules: [
                    { findingId: "same" },
                    { findingId: "same" }
                ]
            }],
            [],
            [],
            {}
        );

    assert.equal(findings.length, 1);

});

runTest("automatic ids are generated", () => {

    const findings =
        FindingGenerationEngine.generateFindings(
            [{
                id: "roof",
                findingRules: [{}]
            }],
            [],
            [],
            {}
        );

    assert.equal(
        findings[0].findingId,
        "roof-finding-1"
    );

});

runTest("false and zero count as answered", () => {

    const findings =
        FindingGenerationEngine.generateFindings(
            [
                {
                    id: "a",
                    findingRules: [{
                        answered: true
                    }]
                },
                {
                    id: "b",
                    findingRules: [{
                        answered: true
                    }]
                }
            ],
            [],
            [],
            {
                answers: {
                    a: { value: false },
                    b: { value: 0 }
                }
            }
        );

    assert.equal(findings.length, 2);

});

runTest("invalid collection returns empty", () => {

    assert.deepEqual(
        FindingGenerationEngine.generateFindings(
            null,
            [],
            [],
            {}
        ),
        []
    );

});

console.log(
    "FindingGenerationEngine tests completed successfully."
);
