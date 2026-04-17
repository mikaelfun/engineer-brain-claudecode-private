---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/M365 Identity/M365 Admin Portal/Copilot/Copilot Usage Reports"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FM365%20Identity%2FM365%20Admin%20Portal%2FCopilot%2FCopilot%20Usage%20Reports"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## Related Links
- [Copilot SAPs and Support Boundaries](https://dev.azure.com/Supportability/Modern%20Workplace/_wiki/wikis/Modern%20Workplace/1485077)
- [Microsoft 365 reports in the Admin Center - Copilot for Microsoft 365 readiness and usage](https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/microsoft-365-copilot-usage?view=o365-worldwide)

## Copilot Usage Reports - Support Boundaries and SAPs

| Scenario | Non-Unified Support Team | Unified/Premier Support Team | Partner Support Team | DfM SAP | Comments/Resources |
|----------|--------------------------|------------------------------|----------------------|---------|-------------------|
| Copilot Usage Reports in M365 Admin Center | Amplify NPP | CSS | CSS | Microsoft 365/Microsoft 365 Copilot/Copilot Reporting/Copilot Usage Report | [M365 Product Update](https://aka.ms/m365pu?pageid=1010029) |
| AI Assistance in the Adoption Score report in M365 Admin Center | Amplify NPP | CSS | CSS | Microsoft 365/Microsoft 365 Copilot/Copilot Reporting/Copilot Adoption Report | [M365 Product Update](https://supportability.visualstudio.com/SCIMProductUpdates/_wiki/wikis/SCIMProductUpdates.wiki/1362272) |
| Copilot Dashboard powered by Viva | Amplify NPP | Amplify NPP | Amplify NPP | Microsoft 365/Microsoft 365 Copilot/Copilot Reporting/Copilot Dashboard powered by Viva | [M365 Product Update](https://aka.ms/m365pu?pageid=1362286) |

## Access requirements

| Reporting option | Required roles & access |
|---|---|
| Microsoft 365 admin center | AI Administrator: Accesses the Copilot reports. |
| Copilot Analytics, powered by Viva Insights | AI Administrator: Enables the Copilot Dashboard and delegates access. Global Administrator: Assigns Insights Analyst and Insights Administrator roles. |
| Microsoft Purview portal | Audit Reader: Searches the audit logs. |
| Power Platform admin center | System Administrator: Assigns the Copilot Studio authors role. License admin: Assigns Copilot Studio licenses. |
| Copilot Studio | Copilot Studio Author: Accesses analytics for agents they create. |

## Troubleshooting Scenarios

### Copilot usage report shows zeros (0's) - By Design
If last activity date of the user is beyond the report period range then you will see zeroes.
Reference ICM: 704544860

### Known Issues

**ICM:** [Incident51000000788611](https://portal.microsofticm.com/imp/v5/incidents/details/51000000788611/summary)
**Issue:** Licensed Microsoft 365 Copilot users who are using Personal Content Mode (PCM) are being misclassified in reporting, causing issues with usage not appearing in the Copilot Chat (nonlicensed) usage report. This occurs when the Copilot Chat graph grounding service plan is toggled off which activates the PCM capability. Current usage reporting logic relies on that specific service plan to attribute licensed Copilot Chat usage, causing licensed users to be reported as unlicensed when the plan is disabled.

**Status / Workaround:**
- **Status:** Microsoft has identified this as a reporting classification issue and is implementing a Microsoft-side fix. The usage reporting logic is being updated to correctly treat users as licensed if they have the M365 Copilot SKU with any service plan enabled, rather than requiring the Copilot Chat graph grounding plan specifically.
- **Progress:** Deployment of the fix is targeted for end of month (February 2026) for all tenants

## Escalating to Microsoft engineering

Prior to escalating to "Customer Insight and Analysis - Customer Escalations":
1. Run the [Telemetry Investigation Logging Tool (TILT)](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1985656) and gather logs from the customer
2. Use the [ICM Submission Process](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/589927) and select: **[ID] [M365] [MAC]** - Customer Insights and Analysis

### Required Information for Escalation
- TA Reviewer, SR#, TenantID, Data share (DTM) link
- Portal/Entry point (M365 Admin center, Teams admin center, API endpoints, Other)
- Report being consumed (Customer facing usage report, Adoption Score report)
- Category: RFC (feature questions), Issue (inaccurate/missing data), DCR (design change request with business justification)
- Time Period, Screenshot of metrics with problems, Repro steps
