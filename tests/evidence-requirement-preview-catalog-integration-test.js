import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import QuestionCatalogManager from "../portal/core/QuestionCatalogManager.js";
import AdaptiveInspectionPreviewBridge from "../portal/core/AdaptiveInspectionPreviewBridge.js";
import AdaptiveScopeDraftEngine from "../portal/core/AdaptiveScopeDraftEngine.js";
import AdaptiveInspectionSessionSandbox from "../portal/core/AdaptiveInspectionSessionSandbox.js";
import SandboxAnswerStateEngine from "../portal/core/SandboxAnswerStateEngine.js";
import EvidenceRequirementPreviewEngine from "../portal/core/EvidenceRequirementPreviewEngine.js";

const catalogPath = "portal/data/question-catalog/meiferts-question-catalog-import-ready.v2.7.json";
const rawCatalog = JSON.parse(readFileSync(catalogPath, "utf8"));

QuestionCatalogManager.loadFromData(rawCatalog);

const catalogItems = QuestionCatalogManager.getAll();

const profile = {
    country: "Thailand",
    buildingType: "Condominium",
    useType: "Residential",
    ageBand: "Existing",
    climateZone: "Tropical",
    locationContext: "Coastal",
    legalContext: "Ownership",
    inspectionPurpose: "Acquisition"
};

const preview = AdaptiveInspectionPreviewBridge.createPreview(profile, catalogItems, {
    startLimit: 5,
    followUpLimit: 5
});

const draft = AdaptiveScopeDraftEngine.createScopeDraft(preview);

const sandbox = AdaptiveInspectionSessionSandbox.createSandboxSession(draft, {
    sandboxId: "evidence-preview-catalog-integration-001"
});

const initialState = SandboxAnswerStateEngine.createInitialState(sandbox);

const afterFinding = SandboxAnswerStateEngine.applyAnswer(initialState, "finding", {
    timestamp: "2026-07-08T14:00:00.000Z"
});

const evidencePreview = EvidenceRequirementPreviewEngine.createPreview(afterFinding);

const afterOk = SandboxAnswerStateEngine.applyAnswer(afterFinding, "ok", {
    timestamp: "2026-07-08T14:01:00.000Z"
});

const okEvidencePreview = EvidenceRequirementPreviewEngine.createPreview(afterOk);

assert.equal(catalogItems.length, 680);
assert.equal(preview.previewMode, "read_only");
assert.equal(draft.draftMode, "read_only");
assert.equal(sandbox.sessionMode, "sandbox_read_only");
assert.equal(initialState.stateMode, "sandbox_answer_state_read_only");

assert.equal(evidencePreview.previewMode, "evidence_requirement_preview_read_only");
assert.equal(evidencePreview.sourceStateMode, "sandbox_answer_state_read_only");
assert.equal(evidencePreview.answerValue, "finding");
assert.equal(evidencePreview.answerLabel, "Auffällig");
assert.equal(evidencePreview.evidenceRequired, true);
assert.equal(evidencePreview.captureState.prepared, true);
assert.equal(evidencePreview.captureState.persisted, false);
assert.equal(evidencePreview.captureState.evidenceCreated, false);
assert.equal(evidencePreview.captureState.findingCreated, false);
assert.ok(evidencePreview.question.questionId);
assert.ok(evidencePreview.question.questionText);
assert.ok(evidencePreview.requiredInputs.length >= 2);
assert.ok(evidencePreview.requiredInputs.some(input => input.type === "photo"));
assert.ok(evidencePreview.requiredInputs.some(input => input.type === "comment"));

assert.equal(okEvidencePreview.answerValue, "ok");
assert.equal(okEvidencePreview.evidenceRequired, false);
assert.equal(okEvidencePreview.requiredInputs.length, 0);
assert.equal(okEvidencePreview.captureState.prepared, false);

[
    evidencePreview,
    okEvidencePreview
].forEach((item) => {
    assert.equal(item.safetyBoundary.sandboxOnly, true);
    assert.equal(item.safetyBoundary.evidencePersisted, false);
    assert.equal(item.safetyBoundary.answerPersisted, false);
    assert.equal(item.safetyBoundary.inspectionCreated, false);
    assert.equal(item.safetyBoundary.evidenceCreated, false);
    assert.equal(item.safetyBoundary.findingCreated, false);
    assert.equal(item.safetyBoundary.assessmentCreated, false);
    assert.equal(item.safetyBoundary.reportCreated, false);

    assert.ok(!("evidenceId" in item));
    assert.ok(!("evidenceIds" in item));
    assert.ok(!("findingId" in item));
    assert.ok(!("findingIds" in item));
});

console.log("EvidenceRequirementPreviewEngine catalog integration test passed");
console.log(`Catalog items: ${catalogItems.length}`);
console.log(`Sandbox questions: ${sandbox.questionCount}`);
console.log(`Finding question: ${evidencePreview.question.questionId}`);
console.log(`Evidence required: ${evidencePreview.evidenceRequired}`);
console.log(`Required inputs: ${evidencePreview.requiredInputs.map(input => input.type).join(", ")}`);
console.log(`OK evidence required: ${okEvidencePreview.evidenceRequired}`);
console.log("Safety boundary:");
console.log(`- evidencePersisted: ${evidencePreview.safetyBoundary.evidencePersisted}`);
console.log(`- evidenceCreated: ${evidencePreview.safetyBoundary.evidenceCreated}`);
console.log(`- findingCreated: ${evidencePreview.safetyBoundary.findingCreated}`);
