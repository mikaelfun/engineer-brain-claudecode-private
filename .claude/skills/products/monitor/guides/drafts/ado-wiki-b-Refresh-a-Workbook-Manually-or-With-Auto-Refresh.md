---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Workbooks/How-To/Refresh a Workbook Manually or With Auto Refresh"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Insights%2C%20Workbooks%20and%20Managed%20Products/Workbooks/How-To/Refresh%20a%20Workbook%20Manually%20or%20With%20Auto%20Refresh"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]
# Instructions
---
This article will cover how to refresh a Workbook manually or via auto-refresh.

# Process
1. Navigate to an Azure Workbook, the refresh icons will show up in the top bar:
![image.png](/.attachments/image-3919d0cd-52ee-4cd9-821e-a6b46aa22493.png)

2. The first icon highlighted in the top bar is the manual refresh button which will rerun all of the visible queries for the Workbook (Note: If you want to refresh queries in a tab you aren't in you'll have to navigate to that tab).

3. The second icon in the top screenshot is the auto refresh, this will allow you to set a timer for the auto refresh of data as low as 5 minutes up to one day:
![image.png](/.attachments/image-77719d9a-1461-490c-8d93-ef87efed6c58.png)

4. Other ways to refresh.
- Refresh the browser page, F5 keyboard shortcut.
- Delete cookies/cache and reload browser.
- Attempt in alternative browser or in private mode (this will allow loading without any extensions loading).

# Resources
[Move Workbooks Auto Refresh](https://learn.microsoft.com/azure/azure-monitor/visualize/workbooks-manage#set-up-auto-refresh)