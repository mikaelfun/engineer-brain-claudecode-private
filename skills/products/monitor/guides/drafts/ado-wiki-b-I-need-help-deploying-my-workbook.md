---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Workbooks/Support Topics/Issue with managing workbooks/I need help deploying my workbook"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Insights%2C%20Workbooks%20and%20Managed%20Products/Workbooks/Support%20Topics/Issue%20with%20managing%20workbooks/I%20need%20help%20deploying%20my%20workbook"
importDate: "2026-04-07"
type: troubleshooting-guide
---

::: template /.templates/Common-Header.md
:::

[[_TOC_]]

# Scenario
---
_Any issues related to deploying an Azure Workbook._

- This topic is not about creating a custom Workbook for a customer, please see [Workbooks support boundaries](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/480532/Support-Boundaries?anchor=workbooks) for more details.
- User is asking about how they can deploy Workbooks, whether programmatically (ARM, Bicep, Terraform, etc.) or through the Azure Portal.

# Workflow
---
1. Scope out the customers ask, what is the end goal?
2. Check the Known Issues section below and see if there are any related issues.
3. Review the Workbooks documentation (see 'Relevant Documentation' section) to see if there are any examples of what the customer wishes to do.
4. Check the Wiki How-To section to see if there is an article that relates to the customer scenario.

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
1. How are they trying to deploy the Workbook? Can we try to deploy it another way to see if it succeeds?
2. Are there any specific errors occurring while deploying?
3. Ask for the customers Workbook template to import into your own environment [Import Workbook for Analysis](https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/862915/Import-Customer-Workbook-Into-The-Portal-For-Analysis).
3. Is it just this Workbook that won't deploy? Can try to deploy a sample Workbook to ensure the issue isn't in the JSON format.

# Known Issues
---
N/A

# Relevant Documentation
---
[Public Doc | Azure Workbooks Overview](https://learn.microsoft.com/azure/azure-monitor/visualize/workbooks-overview)
[Public Doc | Create a Workbook](https://learn.microsoft.com/azure/azure-monitor/visualize/workbooks-create-workbook#create-a-new-azure-workbook)
[Public Doc | Programmatically Manage Workbooks](https://learn.microsoft.com/azure/azure-monitor/visualize/workbooks-automate)
[Public Doc | Sample Workbooks](https://learn.microsoft.com/azure/azure-monitor/visualize/workbooks-samples)