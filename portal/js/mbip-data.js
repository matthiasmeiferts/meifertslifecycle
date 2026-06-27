const MBIP = {
  version: "0.1",
  activeCaseId: "case-001",

  cases: [
    {
      id: "case-001",
      title: "Coastal Residential Tower",
      type: "Technical Property Review",
      client: "Confidential Client",
      location: "Confidential Demo Location",
      status: "Evidence Capture",
      readiness: 67,
      riskScore: 68,
      confidence: 64,
      decision: "Proceed with conditions",
      reportStatus: "Draft"
    }
  ],

  components: [
    { id: "c-envelope", caseId: "case-001", name: "Building Envelope", risk: 72, status: "Open" },
    { id: "c-roof", caseId: "case-001", name: "Roofing", risk: 78, status: "Open" },
    { id: "c-mep", caseId: "case-001", name: "MEP Systems", risk: 61, status: "Review" },
    { id: "c-governance", caseId: "case-001", name: "Governance", risk: 70, status: "Pending" }
  ],

  evidence: [
    {
      id: "e-001",
      caseId: "case-001",
      componentId: "c-envelope",
      title: "Balcony moisture staining",
      type: "Photo",
      status: "Classified",
      confidence: 78,
      tags: ["Envelope", "Moisture", "CAPEX"]
    },
    {
      id: "e-002",
      caseId: "case-001",
      componentId: "c-governance",
      title: "Reserve fund statement",
      type: "Document",
      status: "Review",
      confidence: 61,
      tags: ["Governance", "Reserve Fund"]
    },
    {
      id: "e-003",
      caseId: "case-001",
      componentId: "c-roof",
      title: "Rooftop waterproofing note",
      type: "Note",
      status: "Assigned",
      confidence: 68,
      tags: ["Roof", "Waterproofing"]
    }
  ],

  aiSignals: [
    {
      id: "ai-001",
      caseId: "case-001",
      title: "Moisture staining at balcony edge",
      componentId: "c-envelope",
      priority: "Medium",
      confidence: 74,
      status: "Review"
    },
    {
      id: "ai-002",
      caseId: "case-001",
      title: "Missing roof waterproofing records",
      componentId: "c-roof",
      priority: "High",
      confidence: 68,
      status: "Evidence Gap"
    }
  ],

  findings: [
    {
      id: "f-001",
      caseId: "case-001",
      componentId: "c-envelope",
      title: "Moisture staining beneath balcony edge",
      severity: "Medium",
      likelihood: "Medium",
      risk: 72,
      status: "Open",
      reportStatus: "Draft"
    },
    {
      id: "f-002",
      caseId: "case-001",
      componentId: "c-roof",
      title: "Waterproofing documentation missing",
      severity: "High",
      likelihood: "Medium",
      risk: 78,
      status: "Review",
      reportStatus: "Pending"
    },
    {
      id: "f-003",
      caseId: "case-001",
      componentId: "c-governance",
      title: "Reserve fund statement requires clarification",
      severity: "Medium",
      likelihood: "Medium",
      risk: 70,
      status: "Pending",
      reportStatus: "Draft"
    }
  ],

  capex: [
    {
      id: "capex-001",
      caseId: "case-001",
      title: "Waterproofing specialist review",
      timeframe: "Short term",
      estimate: "Specialist review required",
      status: "Draft"
    }
  ],

  reports: [
    {
      id: "r-001",
      caseId: "case-001",
      title: "Decision Support Report",
      readiness: 67,
      status: "Draft"
    }
  ],

  getActiveCase() {
    return this.cases.find(c => c.id === this.activeCaseId);
  },

  getCaseItems(collection) {
    return this[collection].filter(item => item.caseId === this.activeCaseId);
  },

  getStats() {
    const activeCase = this.getActiveCase();
    const evidence = this.getCaseItems("evidence");
    const findings = this.getCaseItems("findings");
    const aiSignals = this.getCaseItems("aiSignals");
    const report = this.getCaseItems("reports")[0];

    return {
      activeCase,
      evidenceCount: evidence.length,
      findingsCount: findings.length,
      aiSignalsCount: aiSignals.length,
      highRiskCount: findings.filter(f => f.risk >= 75 || f.severity === "High").length,
      reportReadiness: report ? report.readiness : 0,
      riskScore: activeCase ? activeCase.riskScore : 0,
      confidence: activeCase ? activeCase.confidence : 0
    };
  }
};

window.MBIP = MBIP;