---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Windows 365 Frontline/Frontline Dedicated/CPC Optimization"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FFeatures%2FWindows%20365%20Frontline%2FFrontline%20Dedicated%2FCPC%20Optimization"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Troubleshoot Failed Device Actions from COGS Optimization Scenarios

## Overview
Troubleshooting guide for failed Cloud PC device actions triggered from CPC Optimization (COGS) scenarios.

Multiple device actions may be involved in COGS Optimization Scenarios.

## Common Errors (applicable to multiple actions)

All common errors are internal service errors. If the failure may cause the machine to become inaccessible:
1. Ask customer to Restart the machine and see if it helps
2. If Restart does not help, request for lockbox and call OCE API to Deallocate/Stop then Start the machine

## Specific Errors per Device Action Type

If the failure may cause the machine to become inaccessible:
1. Ask customer to Restart the machine
2. If Restart does not help, request lockbox and call OCE API to Deallocate/Stop then Start
3. If the device cannot be started from a hibernated state, involve "CloudPC Service / Cloud PC Cost Optimization" team for further investigation

## How To Cancel Scheduled But Not Yet Run COGS Optimization Workflow Items
Raise an IcM and assign to "CloudPC Service / Cloud PC Cost Optimization" team.

## How To Exclude Tenant(s) From COGS Optimization Scenarios
Raise an IcM and assign to "CloudPC Service / Cloud PC Cost Optimization" team.

Escalation path:
- CSS → Open ICM with SaaF team after initial investigation
- SaaF → Triage the ICM and engage CloudPC Service / Cloud PC Cost Optimization

## FAQ

**Q: Is hibernate-resume a customer facing feature for Windows 365?**
A: NO. Windows 365 leverages hibernate-resume as an internal capability to optimize COGS. Customers do NOT have visibility or control into COGS optimizations.

**Q: What message to use if asked about hibernate-resume or Cloud PCs running 24/7?**
A: Communicate that as a SaaS solution, Microsoft undertakes infrastructure optimizations for capacity, resiliency, performance, and reliability without disrupting user experience. Do not talk about hibernate-resume specifically. Share: https://learn.microsoft.com/en-us/office365/servicedescriptions/windows-365-service-description/windows-365-service-description#service-responsibility

**Q: Why do stop-start given state will be lost?**
A: Not all Cloud PCs are hibernate capable. For non-hibernate-capable Cloud PCs, ONLY IF zero utilization in last 28 days AND no active/disconnected session, stop-start is performed (no impact as no session state to preserve).

**Q: How is IT admin not impacted?**
A: Cloud PCs run at least 10 hours/day for Intune sync. If 2 IT admin actions triggered when Cloud PC is hibernated in last 30 days → Cloud PC excluded from COGS operations next 30 days.

**Q: How is end user not impacted?**
A: Multiple guardrails: user presence check before COGS operations; 2 admin/end-user/OCE start actions in last 30 days → automatic exclusion for next 30 days.

**Q: Are 3rd party client users included?**
A: Customers using 3rd party clients are excluded from COGS operations in current phase2 rollout.

**Q: Can we exclude customers?**
A: Yes, contact COGS v-team.

**Q: Is restart a COGS issue?**
A: Deallocation only on zero utilization devices (no login for 30+ days). COGS should not cause loss of state. Assume restart issues are not COGS related until proven otherwise.

**Q: Can customers disable hibernation within Cloud PC?**
A: Advise customers NOT to disable hibernation. The hiberfile.sys is necessary for normal service operation.
