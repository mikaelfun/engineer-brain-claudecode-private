---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Advisor/How Tos/Find Out What Recommendations Are Shown To Customers_Advisor"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Advisor/How%20Tos/Find%20Out%20What%20Recommendations%20Are%20Shown%20To%20Customers_Advisor"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Summary
Methods to view Azure Advisor recommendations for a given subscription - both from the customer's perspective and from internal tooling.

## Customer-Facing Methods

### Azure Portal
Navigate to [Azure Advisor](https://portal.azure.com/?feature.customportal=false#blade/Microsoft_Azure_Expert/AdvisorMenuBlade/overview) and review recommendations by category (Cost, Security, Reliability, Operational Excellence, Performance).

### Azure PowerShell, CLI, or REST API
- **REST API:** [Recommendations - Get](https://docs.microsoft.com/en-us/rest/api/advisor/recommendations/get)
- **PowerShell:** [Get-AzAdvisorRecommendation](https://docs.microsoft.com/en-us/powershell/module/az.advisor/get-azadvisorrecommendation)
- **Azure CLI:** [az advisor recommendation list](https://docs.microsoft.com/en-us/cli/azure/advisor/recommendation)

### Azure Resource Graph Explorer
Query recommendations via Resource Graph: [Get cost recommendations using Resource Graph Explorer](https://learn.microsoft.com/en-us/azure/advisor/advisor-azure-resource-graph)

## Internal Methods

### Option 1: Advisor Tab in ASC
1. Open [ASC Resource Explorer](https://azuresupportcenter.msftcloudes.com/resourceexplorerv2)
2. Select the subscription ID from the left panel
3. Select the **Advisor Recommendations** tab
4. Use filters to narrow down by category, impact, or resource type

### Option 2: Power BI Advisor Report
1. Open the [Azure Advisor Power BI Report](https://aka.ms/advisordashboard)
2. Navigate to the **Catalog** page
3. Search by the recommendation name
4. Check **Service Owner** and **PM Contact** fields

### Option 3: ARG Query Editor Tab in ASC
1. Open [ASC Resource Explorer](https://azuresupportcenter.msftcloudes.com/resourceexplorerv2)
2. Select the subscription and use the ARG Query Editor tab to run custom queries
