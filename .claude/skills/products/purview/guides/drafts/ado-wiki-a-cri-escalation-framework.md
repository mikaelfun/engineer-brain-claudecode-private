---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/Processes/CRI Escalation Framework"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FProcesses%2FCRI%20Escalation%20Framework"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# CRI Escalation Framework

Ensures timely resolution of CRIs by defining clear escalation paths, responsibilities, and SLAs across CSS, EEE, and PG.

## Layer 1: CSS -> CSS Triages

**Objective:** Enable CSS to escalate unresolved cases internally before involving EEEs or PG.

**Process Steps:**
1. CSS engineers attempt resolution using AVA channels and Troubleshooting Guides (TSGs)
2. CRI creation must be approved by CSS SMEs when AVA fails or PG engagement is unavoidable

**Trigger for Escalation:**
- No AVA/CRI response within 48 hours or no resolution within 7 days
- For Sev-A cases, escalate immediately without waiting for AVA

**Mandatory details:**
- Case severity, Ticket and CRI number, Case Summary
- Full repro steps, Logs and diagnostics, Customer impact statement

## Layer 2: CSS Triages -> EEEs

**Objective:** Engage Embedded Escalation Engineers for advanced troubleshooting.

**Trigger for Escalation:**
- CSS Triages confirm case complexity or PG dependency
- CRI remains unresolved after 2 weeks post-creation
- No PG response for 48 hours after CSS Triage escalation

**EEE Responsibilities:**
- Perform deep technical analysis
- Partner with CSS SMEs for additional repro or logs
- Prepare escalation package for PG with all required context

**Expected Outcome:** Reduce aged CRIs (>30 days) by enforcing workaround or ETA within 1 month.

## Layer 3: EEEs -> PG/CSS MGMT

**Objective:** Secure Product Group engagement for fixes requiring code changes or roadmap decisions.

**Trigger for Escalation:**
- CRI exceeds 30 days without workaround or ETA
- Poor quality responses + 48 hours without PG response since CSS triage
- PG involvement is critical for resolution (e.g., bug fix, feature gap)

**SLA compliance:**
- PG response within 48 hours
- ETA or workaround within 30 days
- Discuss inclusion of unresolved CRIs in Known Issues documentation if ETA > 1 month
