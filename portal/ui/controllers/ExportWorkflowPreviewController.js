import DraftWorkspaceManager from "../../core/DraftWorkspaceManager.js";
import ExportPreparationGatePreview from "../components/ExportPreparationGatePreview.js";
import ExportPreparationReviewPreview from "../components/ExportPreparationReviewPreview.js";
import ExportAuthorizationGatePreview from "../components/ExportAuthorizationGatePreview.js";
import ReportExportPreparationPackagePreview from "../components/ReportExportPreparationPackagePreview.js";
import ReportExportAssemblyPreview from "../components/ReportExportAssemblyPreview.js";

export default class ExportWorkflowPreviewController {

    constructor({
        exportPreparationGateNode,
        exportPreparationReviewNode,
        exportAuthorizationGateNode,
        reportExportPreparationPackageNode,
        reportExportAssemblyNode,
        reviewer = "Matthias Meiferts",
        now = () => new Date().toISOString()
    } = {}) {

        this.nodes = {
            exportPreparationGateNode,
            exportPreparationReviewNode,
            exportAuthorizationGateNode,
            reportExportPreparationPackageNode,
            reportExportAssemblyNode
        };

        this.reviewer = reviewer;
        this.now = now;

        this.currentExportPreparationGate = null;
        this.currentExportPreparationReview = null;
        this.currentExportAuthorizationGate = null;
        this.currentReportExportPreparationPackage = null;
        this.currentReportExportAssemblyPreview = null;

    }

    isReady() {

        return Object.values(this.nodes).every(Boolean);

    }

    startFromInternalReview(internalReview = {}) {

        if (!this.isReady()) {
            return null;
        }

        const createdAt = this.now();

        this.currentExportPreparationGate =
            DraftWorkspaceManager.createExportPreparationGate(
                internalReview,
                { createdAt }
            );

        this.currentExportPreparationReview =
            DraftWorkspaceManager.createExportPreparationReview(
                this.currentExportPreparationGate,
                {
                    reviewer: this.reviewer,
                    createdAt
                }
            );

        this.renderExportPreparationGate();
        this.renderExportPreparationReview();

        return this.getState();

    }

    renderExportPreparationGate() {

        if (!this.currentExportPreparationGate) {
            return;
        }

        this.nodes.exportPreparationGateNode.replaceChildren(
            ExportPreparationGatePreview.create(
                this.currentExportPreparationGate
            )
        );

    }

    renderExportPreparationReview() {

        if (!this.currentExportPreparationReview) {
            return;
        }

        this.nodes.exportPreparationReviewNode.replaceChildren(
            ExportPreparationReviewPreview.create(
                this.currentExportPreparationReview,
                {
                    onAddNote: () => this.addReviewNote(),
                    onApprove: () => this.approveReview(),
                    onReject: () => this.rejectReview()
                }
            )
        );

        this.renderExportAuthorizationGate();

    }

    addReviewNote() {

        const review = this.currentExportPreparationReview;

        if (
            !review
            || review.notes.length > 0
            || review.status !== "review_required"
        ) {
            return this.getState();
        }

        this.currentExportPreparationReview =
            DraftWorkspaceManager.addExportPreparationReviewNote(
                review,
                {
                    text: "Export preparation review note added in browser preview.",
                    author: this.reviewer,
                    category: "export-preparation"
                },
                {
                    createdAt: this.now()
                }
            );

        this.renderExportPreparationReview();

        return this.getState();

    }

    approveReview() {

        const review = this.currentExportPreparationReview;

        if (
            !review
            || review.notes.length === 0
            || review.status !== "review_required"
        ) {
            return this.getState();
        }

        this.currentExportPreparationReview =
            DraftWorkspaceManager.approveExportPreparationReview(
                review,
                {
                    comment: "Export preparation review approved in browser preview. Export remains locked.",
                    decidedBy: this.reviewer
                },
                {
                    updatedAt: this.now()
                }
            );

        this.renderExportPreparationReview();

        return this.getState();

    }

    rejectReview() {

        const review = this.currentExportPreparationReview;

        if (
            !review
            || review.notes.length === 0
            || review.status !== "review_required"
        ) {
            return this.getState();
        }

        this.currentExportPreparationReview =
            DraftWorkspaceManager.rejectExportPreparationReview(
                review,
                {
                    comment: "Export preparation review rejected in browser preview. Export remains locked.",
                    decidedBy: this.reviewer
                },
                {
                    updatedAt: this.now()
                }
            );

        this.renderExportPreparationReview();

        return this.getState();

    }

    renderExportAuthorizationGate() {

        if (!this.currentExportPreparationReview) {
            return;
        }

        this.currentExportAuthorizationGate =
            DraftWorkspaceManager.createExportAuthorizationGate(
                this.currentExportPreparationReview,
                {
                    createdAt: this.now()
                }
            );

        this.nodes.exportAuthorizationGateNode.replaceChildren(
            ExportAuthorizationGatePreview.create(
                this.currentExportAuthorizationGate
            )
        );

        this.renderReportExportPreparationPackage();

    }

    renderReportExportPreparationPackage() {

        this.currentReportExportPreparationPackage =
            DraftWorkspaceManager.createReportExportPreparationPackage(
                this.currentExportAuthorizationGate || {},
                {
                    createdAt: this.now()
                }
            );

        this.nodes.reportExportPreparationPackageNode.replaceChildren(
            ReportExportPreparationPackagePreview.create(
                this.currentReportExportPreparationPackage
            )
        );

        this.currentReportExportAssemblyPreview =
            DraftWorkspaceManager.createReportExportAssemblyPreview(
                this.currentReportExportPreparationPackage,
                {
                    createdAt: this.now()
                }
            );

        this.nodes.reportExportAssemblyNode.replaceChildren(
            ReportExportAssemblyPreview.create(
                this.currentReportExportAssemblyPreview
            )
        );

    }

    getState() {

        return {
            exportPreparationGate: this.currentExportPreparationGate,
            exportPreparationReview: this.currentExportPreparationReview,
            exportAuthorizationGate: this.currentExportAuthorizationGate,
            reportExportPreparationPackage:
                this.currentReportExportPreparationPackage,
            reportExportAssemblyPreview:
                this.currentReportExportAssemblyPreview
        };

    }

}
