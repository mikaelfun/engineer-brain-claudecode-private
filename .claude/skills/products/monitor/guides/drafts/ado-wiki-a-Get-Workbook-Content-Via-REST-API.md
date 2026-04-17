---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Workbooks/How-To/Programmatically get Workbook Content Via REST API"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Insights%2C%20Workbooks%20and%20Managed%20Products/Workbooks/How-To/Programmatically%20get%20Workbook%20Content%20Via%20REST%20API"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]
# Instructions
---
In this How-To we'll use the REST API to fetch the content of a Workbook. Using the standard command, it will only obtain the JSON but by adding in the 'canFetchContent' parameter you can retrieve the entire Workbook which can then be used to deploy in other locations.

# Process
- Using the 2nd link below you can run REST API commands against your subscription. The Workbooks GET REST API command looks like this:
`GET https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Insights/workbooks/{resourceName}?api-version=2021-08-01&canFetchContent={canFetchContent}`

- Replace the portions of this call with the Resource ID of your Workbook, then in the {canFetchContent} section replace this with 'TRUE'
    - You can find the Resource ID of the Workbook by navigating to the Overview page of the Workbook in the Azure Portal.

- Highlight the command and hit ctrl+s to run it, the result should produce the JSON of the Workbook! Using the canFetchContent section allows you to obtain the serialized data which is all the contents of the Workbook.

# Resources
[Azure Workbooks | REST API](https://learn.microsoft.com/rest/api/application-insights/workbooks/get?tabs=HTTP)
[Run REST API Commands](https://resources.azure.com/raw/)
