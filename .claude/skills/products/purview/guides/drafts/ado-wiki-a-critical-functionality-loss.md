---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/Processes/Critical Functionality Loss (CFL) (DRAFT)"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FProcesses%2FCritical%20Functionality%20Loss%20(CFL)%20(DRAFT)"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Critical Functionality Loss (CFL) - Governance

**UNDER REVIEW**

## Definition

**Critical Functionality Loss (CFL)** is a framework to determine when a **Severity 2 ICM** can be raised due to loss of critical, customer-impacting functionality. Focuses on loss of access, visibility, or enforcement of core Purview capabilities.

## Eligibility for CFL (Governance)

A CFL can be declared when one or more of the following conditions are met in **production environments**:

### Data Scanning & Connectivity
- Unable to scan a data source, including:
  - Integrated Runtime (IR) / Self-Hosted IR (SHIR) failures
  - Private Endpoint (PE) or Managed VNET / Managed CNET connectivity issues

### Purview Core Components
- Unable to access Purview portal components:
  - Data Map inaccessible
  - Assets disappearing
  - Domains disappearing

### Security & Access Control
- Security permissions not being applied
- Security updates not propagating
- Domain access failing or blocked unexpectedly

### High-Impact Customer Scenarios
- Any issue affecting production environment of:
  - S500 customers
  - Design partners

### High-Scale Scenarios
- 5+ Sev As
- 10+ Support Tickets

## Non-Eligibility for CFL (Governance)

The following do NOT qualify for CFL:
- Unable to register a new data source
- Unable to create a new connection (with or without PE/Managed VNET/CNET)
- Unable to view: Data Quality reports, Insights, Data Estate Health dashboards, UX/portal rendering problems

## CSS Leads Approval - Exception Process

In exceptional circumstances, a CFL may be approved even if criteria not strictly met:
- Extremely high political sensitivity
- Significant data-impacting scenarios
- Leadership Team (LT) escalations
- Situations with strong business or reputational risk

Requires Regional CSS Lead approval, case-by-case, with written justification in ICM.

## Severity 2.5

For engineering escalation blockers that are not CFL, Support can use 2.5 if:
1. All sev As that do not fall under CFL criteria
2. Any sev B with LT escalation

- Daily update required
- Support only during working hours on working days
- Target resolution: 3 working days

Reference: [Classification Escalation and Notification (CEN)](https://eng.ms/docs/cloud-ai-platform/azure-cxp/cxp-cre/crisis-management/azure-incident-management/azure-incident-management/cen/azurecen)
