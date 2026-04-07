---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Workbooks/How-To/Determine if Issue is Workbooks Platform Issue or a Resource Provider Issue"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Insights%2C%20Workbooks%20and%20Managed%20Products/Workbooks/How-To/Determine%20if%20Issue%20is%20Workbooks%20Platform%20Issue%20or%20a%20Resource%20Provider%20Issue"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]
# Instructions
---

# Explanation
While we own the platform service of Azure Workbooks many times, we'll receive cases related to Workbooks that other teams have created. This Wiki will help you determine if the issue is Workbook platform related or if it needs to go to another team for investigation. For more information, please review Azure Workbooks Support Boundaries from the link located at the bottom of the page.

# Process
1. Many teams in various orgs use Workbooks for various things, some examples:
    - Some teams have built-in Workbook template-based insights that appear in Azure Monitor.
    - Azure Sentinel team has created their own repository of templates in its own location.
    - Microsoft Entra ID (Formerly Azure Active Directory) team has reporting infrastructure built on top of Workbooks.
    - Intune has reporting infrastructure built on top of Workbooks.

2. In all cases, the team that owns the template that the customer is using should be the first investigator. In which case the first step is identifying who owns the Workbook that the customer is utilizing.
    - If it's an Azure Sentinel Workbook, this will need to be routed to the Azure Sentinel team.
    - If it's another built-in template you can ask the customer which template or Workbook they are using.
        - For built-in templates they are in the form of 'Community-Workbooks[path/to/workbook]'. The link to the list of 
          these Workbooks are here (https://github.com/microsoft/Application-Insights-Workbooks/tree/master/Workbooks).
    - If the customer has a custom Workbook, it's possible that they might have saved a copy of one of the built-in 
      Workbooks, in which case you can ask the customer what template this started with.

3. In general, the Resource Provider will own the investigation into the Workbooks. If it's determined that the issue is simply an issue with Workbooks in general, then our team can investigate further.

# Resources
[Workbooks Support Boundaries](https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/480532/Support-Boundaries?anchor=workbooks)
