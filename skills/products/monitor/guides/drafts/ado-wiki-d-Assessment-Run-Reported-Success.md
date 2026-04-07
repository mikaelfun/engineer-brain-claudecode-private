---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/On-Demand Assessments/Assessment Run Reported Success"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FOn-Demand%20Assessments%2FAssessment%20Run%20Reported%20Success"
importDate: "2026-04-07"
type: troubleshooting-guide
---

[[_TOC_]]

# Scenario

There are cases where assessment run encounters problem but still reports success (that is in Log Search you see "Assessment execution was successful" when you search for something like `Operation | where Solution == "ADAssessment`

Follow the steps in this note to collect data to troubleshoot. Just looking at the logs would likely tell you what went wrong.

# Collecting Logs

1. Login to <Agent Computer>.

2. Go to registry key "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\HealthService\Parameters\Management Groups\<Management Group Name>\Solutions\<Solution Name>"
   a. Delete value LastExecuted. (This will force execute the assessment on HealthService restart)
   b. Create a new string value RetainTempFiles with data True. (This will prevent cleanup of all the temp files after assessment is completed)

3. Restart HealthService, this will start new assessment in a few minutes. Once assessment is done, go to C:\Program Files\Microsoft Monitoring Agent\Agent\Health Service State\Monitoring Host Temporary Files

Depending on the execution progress, you might not see all these files/folders. But you should at least find SironaLog_Advisor_xxxx.log, and under Logs folder, DiscoveryTrace_xxxxx.log

4. Zip up the entire folder and collect it securely from the customer (for example Use DTM). Note: Most of the time you should be able to identify what went wrong by just looking at these two log files. If you still can't figure it out, open a CRI IcM and escalate.

5. To revert the changes done in Step 2, delete the registry value RetainTempFiles to re-enable cleanup.
