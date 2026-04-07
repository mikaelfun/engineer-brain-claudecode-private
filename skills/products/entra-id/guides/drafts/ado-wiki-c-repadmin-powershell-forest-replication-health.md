---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Replication/Workflow:  Verify | Determine Replication Health and Status/Determine AD replication Status | Health in the Forest | Domain/Use repadmin and PowerShell to view forest-wide AD replication health"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/AD%20Replication/Workflow%3A%20%20Verify%20%7C%20Determine%20Replication%20Health%20and%20Status/Determine%20AD%20replication%20Status%20%7C%20Health%20in%20the%20Forest%20%7C%20Domain/Use%20repadmin%20and%20PowerShell%20to%20view%20forest-wide%20AD%20replication%20health"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/436321&Instance=436321&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/436321&Instance=436321&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This guide provides steps to use `repadmin` and PowerShell to view and filter forest-wide Active Directory replication health status. It includes commands and criteria for filtering replication errors.

# **Task - Use repadmin and PowerShell to view forest-wide Active Directory (AD) replication health**

In this task, you will get replication status with repadmin and display it using PowerShell. This eliminates the need to use Microsoft Excel to display and filter the results.



## Steps

Open a PowerShell prompt and type the following commands, and then press ENTER:  

```powershell
Repadmin /showrepl * /csv | convertfrom-csv | out-gridview
```

It is a good idea to view an unfiltered report initially to see both what is working and not working. To filter the output to just replication errors:

1. Select **Add criteria** and check **Last Failure Status**. Select **Add**.
2. From the "and Last Failure Status contains" filter criteria, select the blue-underlined word "contains" and select **does not equal**.
3. Type `0` in the text box.

   ![Screenshot showing the use of repadmin and PowerShell to view forest-wide AD replication health](/.attachments/ADReplication/Use_repadmin_and_PowerShell_to_view_forest_wide_AD_replication_health_1.png)

   ![Another screenshot showing the use of repadmin and PowerShell to view forest-wide AD replication health](/.attachments/ADReplication/Use_repadmin_and_PowerShell_to_view_forest_wide_AD_replication_health_2.jpg)