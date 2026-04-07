---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Replication/Workflow:  Verify | Determine Replication Health and Status/Determine AD replication Status | Health in the Forest | Domain/Use Repadmin to Determine Forest Wide Replication Health"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/AD%20Replication/Workflow%3A%20%20Verify%20%7C%20Determine%20Replication%20Health%20and%20Status/Determine%20AD%20replication%20Status%20%7C%20Health%20in%20the%20Forest%20%7C%20Domain/Use%20Repadmin%20to%20Determine%20Forest%20Wide%20Replication%20Health"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/436319&Instance=436319&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/436319&Instance=436319&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This guide outlines how to use repadmin.exe to check the replication health of Active Directory across a forest, and how to export the results to a CSV file for analysis. The steps include running the repadmin command, opening the CSV file in Excel, and filtering the data to identify replication errors.

In this task, you will use repadmin.exe to display the Active Directory (AD) replication results and output them to a CSV file for later analysis. Repadmin is installed along with the Active Directory Domain Services (AD DS) tools (present on domain controllers or within the Remote Server Administration Tools (RSAT) AD DS tools).

This is the public content for these steps: [Using Repadmin to retrieve replication status](https://learn.microsoft.com/windows-server/identity/ad-ds/manage/troubleshoot/troubleshooting-active-directory-replication-problems#using-repadmin-to-retrieve-replication-status)

 
*Displays the replication status when the specified domain controller last attempted to inbound replicate Active Directory partitions. Status is reported for each source domain controller that the destination has an inbound connection object from, grouped by partition. SHOWREPL helps administrators understand the replication topology and replication failures. The REPADMIN console must have RPC network connectivity to all domain controllers targeted by the DCLIST parameter.*

Use the **Repadmin /showrepl** command to display replication status for one or more domain controllers specified with the DSA_LIST parameter.  
Use **Repadmin /listhelp** from a command prompt, or see this section in the appendix for details about DSA_LIST options. 

### Repadmin /showrepl usage examples:  
- Return replication status for DC1:  
  - Repadmin /showrepl DC1  
- Return replication status for all domain controllers that reside in the Boulder site:  
  - Repadmin /showrepl site:Boulder  
- Return replication status for all domain controllers in the forest and output to a CSV format into a file called showrepl.csv:  
  - Repadmin /showrepl * /csv >showrepl.csv 

Open a command prompt and type the following command, and then press ENTER:  
````
repadmin /showrepl * /csv >showrepl.csv 
````
Take note of any errors reported on-screen. You will typically see an **LDAP error 81** for any domain controller the tool is unable to collect replication results from. Since two LDAP errors are displayed on screen, we failed to collect data from two domain controllers.  
- At the command prompt, type **showrepl.csv** to open the showrepl.csv file in Microsoft Excel.  
- Within Microsoft Excel: from the **Home** menu, click **Format as Table** in the Styles section and click any of the table designs.  
- Hide column **A** and column **G** by right-clicking the column headers and selecting **Hide**.  
- Reduce the width of other columns so that column K, **Last Failure Status**, is visible.  
- In the **Last Failure Time** column, click the down arrow and deselect 0.  
- This filters the spreadsheet so just the replication errors are displayed.  
- **What replication errors are present?**  
  - (Use column K)  
- **When was replication last successful?**  
  - (Use column J)  

For more detailed steps and troubleshooting information, you can visit the official documentation at [this link](https://docs.microsoft.com/en-us/windows-server/identity/ad-ds/manage/troubleshoot/troubleshooting-active-directory-replication-problems#using-repadmin-to-retrieve-replication-status).