---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/ALDO Support Processes/Kusto Endpoints"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Disconnected%20Operations/ALDO%20Support%20Processes/Kusto%20Endpoints"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Kusto Endpoints for Azure Local Disconnected Operations (ALDO)

As part of the normal troubleshooting process for ALDO, you will need to analyze a variety of different Kusto databases.

## Getting Access

The authoritative guide is [Accessing Kusto & DGREP | ArcA Observability](https://eng.ms/docs/cloud-ai-platform/azure-edge-platform-aep/aep-edge/azure-stack-hub/winfield/arca-observability/resources/kustodgrep/accessingkustodgrep#prerequisites), but the details below apply specifically to the CSS Beta/support team.

* Access to PPE and Telemetry can leverage your CORP account.
* Access to the production Kusto clusters is locked down to your SAW + AME accounts.

In order to get appropriate access, request access to the following groups.

| Environment | Group | Role | Account | Notes |
|---|---|---|---|---|
| PPE Diagnostics | [azureedgeobs-kguy](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/azureedgeobs-kguy) | ARCA-PPE-ReadOnly | CORP | |
| PROD Diagnostics | [azureedgeobs-kguy](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/azureedgeobs-kguy) | ARCA-PROD-ReadOnly | CORP | |
| PROD Diagnostics | [cId-ArcAObs-Prod-ReadOnly](https://oneidentity.core.windows.net/Group) | Member | AME | |

### CoreIdentity Groups (CORP Account)
1. Navigate to https://coreidentity.microsoft.com/manage/Entitlement/entitlement/azureedgeobs-kguy
2. Click 'Request Membership' and select 'For Myself'
3. Select the role and provide justification.
> NOTE: Submit separate requests for each group. Permissions may take several hours to propagate after approval.

### OneIdentity Groups (SAW + AME Account)
1. Using a SAW device, navigate to https://oneidentity.core.windows.net/Group
2. Select Domain (AME) and Group Name, press **Next**
3. Scroll down to member list, enter AME alias, press Add Members
4. Fill out the form with an owner and justification.

> NOTE: Team members in China subject to [Executive Order 14117](https://microsoft.sharepoint.com/teams/CAIEO14117/SitePages/Overview-EO-14117.aspx) restrictions cannot join groups designated as "Access to Customer Data" (effective April 14, 2025).

## Kusto Endpoints

### PPE (CloudTest VMs / CI Stamps)
- **Telemetry:** https://arcappetelemetry.eastus.kusto.windows.net
- **Diagnostics:**
  - East US: https://arcappeeastus.eastus.kusto.windows.net
  - West Europe: https://arcappewesteurope.westeurope.kusto.windows.net

### Prod (Customer Stamps)
- **Telemetry:** https://arcaprodtelemetry.eastus.kusto.windows.net
- **Diagnostics:**
  - East US: https://arcaprodeastus.eastus.kusto.windows.net
  - West Europe: https://arcaprodwesteurope.westeurope.kusto.windows.net

## DGREP Endpoints

### PPE (CloudTest VMs / CI Stamps)
- Telemetry: https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&ep=Diagnostics%20PROD&ns=arcappetelemetry
