---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Support Topics/Configure and Manage Log Analytics tables/Running search jobs and restoring archive logs operation"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FSupport%20Topics%2FConfigure%20and%20Manage%20Log%20Analytics%20tables%2FRunning%20search%20jobs%20and%20restoring%20archive%20logs%20operation"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]


# Scenario
---
The purpose of this workflow is to guide you to troubleshoot issues with restoring and searching archived logs.  


# Understanding the issue
---
Make sure to fully understand the issue, know as many details as possible, including all the relevant error messages and repro steps, as this will help you to deliver a better First Quality Response (**FQR**). 




##Minimum information needed
* Subscription ID 
* Time window of when the issue occurred
* Issue type:
     * Issues restoring archived data
     * Cannot query restored data
     * Unable to dismiss\delete the restored data
     * Cannot create a search job
     * Unable to delete a search job
     * Issue querying the table created by the search job
     * Other
* Error message (if applicable)
* Workspace name or URI
* Workspace region
* Name(s) of the table(s)
