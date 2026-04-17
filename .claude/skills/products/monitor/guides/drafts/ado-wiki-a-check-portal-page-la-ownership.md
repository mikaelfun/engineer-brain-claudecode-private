---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/How-To Guides/General/How to: Check if a portal page is supported by Log Analytics team"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FHow-To%20Guides%2FGeneral%2FHow%20to%3A%20Check%20if%20a%20portal%20page%20is%20supported%20by%20Log%20Analytics%20team"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
---
In Azure Portal there are many different experiences and pages. Sometimes it is hard to determine which team owns a certain page and experience. In this article we will explain how to determine if a given Azure Portal page is owned and supported by Log Analytics.


# How to check if a page is supported by Log Analytics team
---
1. On the affected Azure Portal page, type the following keyboard combination:
**CTRL+ALT+D**
This should prompt one\more yellow banners.

2. Looking at the affected part of the page where the issue is on and check for the Title of the yellow banner.
For example, in this screenshot, it is _**Microsoft_OperationsManagementSuite_Workspace**_
![image.png](/.attachments/image-eab494cf-269f-49a3-b85e-53b7b9d5f985.png)

3. Access the following URL and search for the title fetched on step 2:
https://extensionanalyzer.azure-test.net/products
![image.png](/.attachments/image-a2867546-18d4-43ad-b6d2-e9296efe6be1.png)

As you can see, the same title was found under the category of **Azure Log Analytics**
This means that this is supported by the Log Analytics team.

Else, this is not supported by the Log Analytics and should be addressed further by the team which owns the relevant Extension as per the result in Extension Analyzer search.

# If the extension is owned by Log Analytics, Which Log Analytics product group supports it?
---
Most of the Log Analytics Azure Portal Extensions are supported by Logs Portal product team, See: [Escalating issues to the Log Analytics Portal team](/Log-Analytics/Collaboration-Guides/Escalating-to-the-Azure-Log-Analytics-product-group/Escalating-issues-to-the-Log-Analytics-Portal-team)
In case of any doubt, please reach out to a Log Analytics SME\TA\STA\EEE.