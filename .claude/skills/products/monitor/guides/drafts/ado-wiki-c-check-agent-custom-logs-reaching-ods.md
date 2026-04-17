---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/How-To Guides/Ingestion/HT: Check what agent's custom logs are reaching ODS"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FHow-To%20Guides%2FIngestion%2FHT%3A%20Check%20what%20agent%27s%20custom%20logs%20are%20reaching%20ODS"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]
# Scenario
---
Some times, data collected by the Log Analytics agents is not showing up on the workspace. After checking the agent's connectivity to the workspace, the next step might be to confirm if the data is actually reaching ODS. Please check the following page to understand the data flow: [Escalating issues to the Log Analytics Ingestion team](/Log-Analytics/Collaboration-Guides/Escalating-to-the-Azure-Log-Analytics-product-group/Escalating-issues-to-the-Log-Analytics-Ingestion-team)

# Pre-requisites
---
To be able to execute the following Jarvis queries you'll need access to the relevant Jarvis namespace, so please follow the process described on this page: [HT: Get access to ODS telemetry namespace in Jarvis](/Log-Analytics/How%2DTo-Guides/Jarvis/HT:-Get-access-to-ODS-telemetry-namespace-in-Jarvis)



#  Check custom log received from a specific agent
---
To check which custom logs have been sent by a specific agent, we will use a Jarvis query to do this. You can access the query using this link: https://jarvis-west.dc.ad.msft.net/D02B3EC0



Once you authenticate and the page loads, you will need to fill in the following details:
| ![image.png](/.attachments/image-19425909-6b62-43ff-81b1-791d58673055.png) |
|--|



1 - Workspace region
2 - Workspace ID
3 - Agent ID, Azure VM resourceID or Azure Arc enabled server resourceID
4 - Time range. Please select the shortest interval possible, due to the resultset size limitations. Also, please pay attention to the time zone and preferably always select UTC

## Interpreting the results
---
Once you successfully ran the query, you will see an output similar to this one, that will list the custom logs being sent by that agent:
| ![image.png](/.attachments/image-833f7ad8-e852-424c-b845-00ba1abf1fa3.png)|
|--|

| Column name | Description |
|--|--|
| TIMESTAMP | Time that data was processed |
| CustomLogName| The name of the custom log, which is the tablename |
| IngestionStatus | OverQuota means that the logs was not ingestion due to dailyquota being reached |
| AgentTypeandVersion | Operating System and Agent version| 
| FilenameRaw | The name of the actual filename where the data was collected from **|

** the regex used for this needs improvement 


#  Check custom logs received for a specific workspace (work in progress)
---
To check which custom logs have been sent from agents to a specific workspace, we will use a Jarvis query to do this. You can access the query using this link: https://jarvis-west.dc.ad.msft.net/ACD5DFFD


Once you authenticate and the page loads, you will need to fill in the following details:
| ![image.png](/.attachments/image-c596814c-8350-402d-961f-c8654d2bf70e.png)|
|--|



1 - Workspace region
2 - Workspace ID
3 - Time range. Please select the shortest interval possible, due to the resultset size limitations. Also, please pay attention to the time zone and preferably always select UTC

## Interpreting the results
---
Once you successfully ran the query, you will see an output similar to this one, that will provide a list with extensive information:
(please note this is a work in progress)

| ![image.png](/.attachments/image-3363707a-5a20-4296-95b3-a04c67e33124.png)|
|--|

| Column name | Description |
|--|--|
| TIMESTAMP | Time that data was processed |
| AgentID| The ID of direct agents or installed via Azure VM extension (2) |
| SCOMAgentID | The ID of the SCOM (if being used)  |
| SCOMManagementGroupId | The ID of the SCOM management group (if being used) (1)|
| CustomLogName| The name of the custom log, which is the tablename |
| IngestionStatus | OverQuota means that the logs was not ingestion due to dailyquota being reached |
| AgentTypeandVersion | Operating System and Agent version| 
| VMAzureRegion| Region of the VM is it's an Azure VM, otherwise will show 'OnPrem' for non-azure VMs and it will be blank from SCOM agents (2)| 
| AzureResourceId| Full ResourceURI of the Azure VM: will be blank for non-Azure VMs (2)| 
| FilenameRaw | The name of the actual filename where the data was collected from **|

(1) Might need further validation
(2) Need to check how Azure Arc for enabled servers will show up 
** the regex used for this needs improvement 

# Additional information
---
You might correlate the information from ODS with the information from the agent telemetry. For further details, check the [Windows Custom Logs upload delay](/Log-Analytics/Troubleshooting-Guides/Agent-%2D-Windows/Windows-Custom-Logs-upload-delay) page, under the 'Check agent telemetry for "BLOB_UPLOAD_NOTIFICATION"' section