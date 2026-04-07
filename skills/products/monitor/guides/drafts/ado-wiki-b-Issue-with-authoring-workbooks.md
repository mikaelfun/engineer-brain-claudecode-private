---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Workbooks/Support Topics/Issue with authoring workbooks"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Insights%2C%20Workbooks%20and%20Managed%20Products/Workbooks/Support%20Topics/Issue%20with%20authoring%20workbooks"
importDate: "2026-04-07"
type: troubleshooting-guide
---

::: template /.templates/Common-Header.md
:::

[[_TOC_]]

# Scenario
---
_Any issues related to editing a custom Workbook or a copy of a built in Workbook._

- This topic is not about creating a custom Workbook for a customer, please see [Workbooks support boundaries](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/480532/Support-Boundaries?anchor=workbooks) for more details.
- User is asking about how to visualize their data in a particular way.
- User is asking about how to customize their workbook (for example, merge queries, change visualization, etc.).

# Workflow
---
1. Scope out the customers ask, what is the end goal?
2. Check the Known Issues section below and see if there are any related issues.
3. Review the Workbooks documentation to see if there are any examples of what the customer wishes to do. If there are no direct examples, you can also check out the built-in Workbooks under the 'Monitor > Workbooks' section in the Azure Portal.
4. Check the Wiki How-To section to see if there is an article that relates to the customer scenario.
5. If you find an example, share it with the customer (also might be good to try in a lab scenario if you are able).

## What next?
- If the issue is **not** resolved and you need further assistance please follow this list for assistance in preferred order:
    - Swarming
    - Case Triage
    - TA/SME
    - ICM
- If the issue is resolved, update your case notes and symptom/cause/resolution section, send your LQR and close the case after picking the appropriate root cause.
- If there is a gap or you feel there could be improvements to this wiki material please use the feedback button at the top right to let us know to help improve things.

# Data Collection
---
1. Is the user modifying their own custom Workbook or a copy of a built in Workbook (for example, Sentinel Workbook, Entra Workbook, etc.), ask for a copy to [Import to your Azure subscription](https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/862915/Import-Customer-Workbook-Into-The-Portal-For-Analysis).
2. Is the operation the user is trying to do possible?

# Known Issues
---
N/A

# Relevant Documentation
---
[Public Doc | Create or Edit a Workbook](https://learn.microsoft.com/azure/azure-monitor/visualize/workbooks-create-workbook)
[Public Doc | Azure Workbooks Overview](https://learn.microsoft.com/azure/azure-monitor/visualize/workbooks-overview)