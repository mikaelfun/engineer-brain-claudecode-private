---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Support Topics/Solutions and Insights/Update Compliance (Windows Analytics)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FSupport%20Topics%2FSolutions%20and%20Insights%2FUpdate%20Compliance%20(Windows%20Analytics)"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Update Compliance (Windows Analytics) - Troubleshooting Guide

## Scenario

This workflow helps with issues related to the Update Compliance solution in Log Analytics.

## Data Collection

This initial block of information should be discoverable in the Verbatim section of the case and in Azure Support Center (ASC). Please check for this information and have the customer validate what you have found -- do not ask them for this information.

- Subscription ID
- Workspace name
- Workspace ID
- Region where the workspace is hosted

Additionally, you may need to ask the customer for their **commercialID**.

Generic asks for issues in this workflow:
- When did they onboard machines to the solution
- How did they onboard the machines (leveraging the onboarding script or other methods such as GPOs setting registry keys)

## Determining Which Team Should Handle the Case

Depending on the issue, the case may start with one of the three involved teams. Always check the support boundaries article first:
- [Support Boundaries: Update Compliance](/Log-Analytics/Support-Boundaries/Support-Boundaries:-Update-Compliance)

## Troubleshooting

If after collecting the minimum information and determining the case should start with Azure Monitor POD, leverage this troubleshooting guide:
- [Upgrade Readiness](/Sandbox/LACore/Deprecated-Content/Update-Compliance)

## Product Team Escalation

Any of the involved teams can escalate to the UC engineering team by raising an IcM to:
- **Team**: `Deployment Scheduling Service\Monitoring and Intelligence`

## Common Concepts

- [Crypto API 2.0 (CAPI2) Logging for MMA Agent and Upgrade Readiness Connectivity](/Log-Analytics/Common-Concepts/Crypto-API-2.0-(CAPI2)-Logging-for-MMA-Agent-and-Upgrade-Readiness-Connectivity)
- [Network Tracing for MMA and Upgrade Readiness](/Log-Analytics/Common-Concepts/Network-Tracing-for-MMA-and-Upgrade-Readiness)

## Useful Links

- [Get started with Update Compliance](https://learn.microsoft.com/windows/deployment/update/update-compliance-get-started)
- [Monitor Windows Updates with Update Compliance](https://learn.microsoft.com/windows/deployment/update/update-compliance-monitor)
- [Update Compliance Schema](https://learn.microsoft.com/windows/deployment/update/update-compliance-schema)
