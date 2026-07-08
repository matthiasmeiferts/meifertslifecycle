import DashboardPage from "../ui/pages/DashboardPage.js";
import CasePage from "../ui/pages/CasePage.js";
import BuildingPage from "../ui/pages/BuildingPage.js";
import InspectionPage from "../ui/pages/InspectionPage.js";
import EvidencePage from "../ui/pages/EvidencePage.js";
import FindingPage from "../ui/pages/FindingPage.js";
import AssessmentPage from "../ui/pages/AssessmentPage.js";
import RecommendationPage from "../ui/pages/RecommendationPage.js";
import DecisionPage from "../ui/pages/DecisionPage.js";
import ReportPage from "../ui/pages/ReportPage.js";
import QuestionCatalogPage from "../ui/pages/QuestionCatalogPage.js";
import SettingsPage from "../ui/pages/SettingsPage.js";

export default class WorkspaceRouter {

    static routes = {
        dashboard: DashboardPage,
        cases: CasePage,
        buildings: BuildingPage,
        inspections: InspectionPage,
        evidence: EvidencePage,
        findings: FindingPage,
        assessments: AssessmentPage,
        recommendations: RecommendationPage,
        decisions: DecisionPage,
        reports: ReportPage,
        settings: SettingsPage
    };

    static fallbackRoute = "dashboard";

    static getCurrentRoute() {
        const route = window.location.hash.replace("#", "").trim().toLowerCase();
        return route || this.fallbackRoute;
    }

    static getPage(route) {
        return this.routes[route] || this.routes[this.fallbackRoute];
    }

    static navigate(route) {
        if (!route || !this.routes[route]) {
            route = this.fallbackRoute;
        }

        window.location.hash = route;
    }

    static render(container) {

        if (!container) return;

        container.innerHTML = "";

        const route = this.getCurrentRoute();
        const Page = this.getPage(route);

        try {

            const page = Page.render();

            if (page instanceof Node) {
                container.appendChild(page);
            } else {
                container.innerHTML = String(page ?? "");
            }

        } catch (error) {

            console.error("WorkspaceRouter:", error);

            container.innerHTML = `
                <section class="hero-card">
                    <p class="eyebrow">Workspace Error</p>
                    <h2>${route}</h2>
                    <p>${error.message}</p>
                </section>
            `;
        }
    }

}