import assert from "node:assert/strict";
import ReportDraftPreviewSandbox from "../portal/core/ReportDraftPreviewSandbox.js";

const preparedDecisionDraft = {
    draftMode: "decision_draft_preview_sandbox_read_only",
    decisionPrepared: true,
    question: {
        questionId: "DE-TDD-06-036",
        moduleId: "06",
        moduleTitle: "Keller & Abdichtung"
    },
    decisionRoute: "conditional_decision",
    decision: {
        title: "Decision draft · DE-TDD-06-036",
        route: "conditional_decision",
        summary: "conditional_decision: Include in CAPEX review and transaction risk discussion.",
        proposedDecision: "Proceed only under documented conditions, risk allocation and CAPEX review.",
        requiredCondition: "Expert review, CAPEX consideration and transaction risk note required.",
        sourceQuestionId: "DE-TDD-06-036",
        persisted: false,
        previewOnly: true
    },
    governanceImpact: {
        decisionImpact: "May affect acquisition decision, negotiation position or CAPEX assumption.",
        requiresExpertReview: true,
        requiresCapexReview: true,
        requiresDecisionNote: true
    },
    safetyBoundary: {
        decisionDraftPersisted: false,
        decisionCreated: false,
        reportCreated: false,
        workflowCreated: false
    }
};

const reportDraft = ReportDraftPreviewSandbox.createDraft(preparedDecisionDraft);

assert.equal(reportDraft.draftMode, "report_draft_preview_sandbox_read_only");
assert.equal(reportDraft.sourceDraftMode, "decision_draft_preview_sandbox_read_only");
assert.equal(reportDraft.sandboxOnly, true);
assert.equal(reportDraft.canPrepareReport, true);
assert.equal(reportDraft.reportPrepared, true);

assert.equal(reportDraft.question.questionId, "DE-TDD-06-036");
assert.equal(reportDraft.decision.route, "conditional_decision");
assert.equal(reportDraft.reportSection, "conditional_acquisition_note");

assert.ok(reportDraft.report.title.includes("DE-TDD-06-036"));
assert.equal(reportDraft.report.section, "conditional_acquisition_note");
assert.ok(reportDraft.report.executiveSummary.includes("Proceed only"));
assert.ok(reportDraft.report.technicalNarrative.includes("CAPEX"));
assert.ok(reportDraft.report.decisionNote.includes("conditional_decision"));
assert.equal(reportDraft.report.persisted, false);
assert.equal(reportDraft.report.previewOnly, true);
assert.equal(reportDraft.report.exported, false);

assert.equal(reportDraft.reportQuality.readyForExpertReview, true);
assert.equal(reportDraft.reportQuality.requiresSourceEvidence, true);
assert.equal(reportDraft.reportQuality.requiresCapexReference, true);
assert.equal(reportDraft.reportQuality.requiresDecisionNote, true);

assert.equal(reportDraft.safetyBoundary.sandboxOnly, true);
assert.equal(reportDraft.safetyBoundary.reportDraftPersisted, false);
assert.equal(reportDraft.safetyBoundary.reportCreated, false);
assert.equal(reportDraft.safetyBoundary.reportExported, false);
assert.equal(reportDraft.safetyBoundary.clientDocumentCreated, false);
assert.equal(reportDraft.safetyBoundary.workflowCreated, false);

const notReadyReport = ReportDraftPreviewSandbox.createDraft({
    draftMode: "decision_draft_preview_sandbox_read_only",
    decisionPrepared: false
});

assert.equal(notReadyReport.canPrepareReport, false);
assert.equal(notReadyReport.reportPrepared, false);
assert.equal(notReadyReport.report, null);
assert.equal(notReadyReport.guidance.title, "Report draft not ready");

console.log("ReportDraftPreviewSandbox core test passed");
console.log(`Report prepared: ${reportDraft.reportPrepared}`);
console.log(`Report section: ${reportDraft.reportSection}`);
console.log(`Executive summary: ${reportDraft.report.executiveSummary}`);
console.log(`Decision note: ${reportDraft.report.decisionNote}`);
console.log("Safety boundary:");
console.log(`- reportDraftPersisted: ${reportDraft.safetyBoundary.reportDraftPersisted}`);
console.log(`- reportCreated: ${reportDraft.safetyBoundary.reportCreated}`);
console.log(`- reportExported: ${reportDraft.safetyBoundary.reportExported}`);
console.log(`- clientDocumentCreated: ${reportDraft.safetyBoundary.clientDocumentCreated}`);
console.log(`- workflowCreated: ${reportDraft.safetyBoundary.workflowCreated}`);
