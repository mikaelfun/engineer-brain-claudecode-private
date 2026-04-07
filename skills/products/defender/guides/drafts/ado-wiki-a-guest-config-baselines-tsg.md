---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Recommendations and remediation/Baselines (configure machines securely)/Guest Configuration Baselines (Security Configuration)/[Troubleshooting Guide] - Guest configuration baselines"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/Recommendations%20and%20remediation/Baselines%20%28configure%20machines%20securely%29/Guest%20Configuration%20Baselines%20%28Security%20Configuration%29/%5BTroubleshooting%20Guide%5D%20-%20Guest%20configuration%20baselines"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

Troubleshooting baseline results in Azure Resource Graph (ARG) and Microsoft Defender for Cloud (MDC)
=====================================================================================================

**AI-assisted content.** This article was partially created with the help of AI. An author reviewed and revised the content as needed. [Learn more](https://learn.microsoft.com/en-us/principles-for-ai-generated-content).

Summary
-------

This article provides troubleshooting steps and guidance when you encounter issues with baseline results not appearing as expected in Microsoft Defender for Cloud (MDC) recommendations. It also addresses scenarios where security configurations data is visible in the Azure Resource Graph (ARG) but not reflected in MDC.

Detailed Explanation
--------------------

### Issues with Baseline Results Not Appearing as Expected

To troubleshoot why baseline results are not appearing as expected in MDC recommendations, follow these steps:
1.  **Run a Query on ARG:**
    *   Go to the Azure Resource Graph (ARG) for your selected subscription.
        
    *   Run the following query to get detailed information about failed rules and machine status:
        > :memo: **note**: This query is the base query for the MDC�`Assessors`�service, and it returns failed rules detailed info as well as some general info regarding the machines.  

        
            Resources
            | where type =~ 'Microsoft.Compute/virtualMachines' or type =~ 'Microsoft.HybridCompute/machines'
            | extend IsMachineUpAndRunning = iif(type =~ 'Microsoft.Compute/virtualMachines',
               isempty(properties['extended']['instanceView']['powerState']['code']) == true or properties['extended']['instanceView']['powerState']['code'] =~ 'PowerState/running',
               isempty(properties['status']) == true or properties['status'] =~ 'Connected')
            | project id, MachineResourceId = tolower(id), type, tenantId, subscriptionId,
              osType = iif(type =~ 'Microsoft.Compute/virtualMachines', properties['storageProfile']['osDisk']['osType'], properties['osName']),
              IsMachineUpAndRunning = tostring(IsMachineUpAndRunning)
            | join kind=leftouter(
                Resources
                | where type =~ 'microsoft.compute/virtualmachines/extensions' or type =~ 'Microsoft.HybridCompute/machines/extensions'
                | extend MachineResourceId = tolower(substring(id, 0, indexof(id, '/extensions'))),
                  ExtensionName = tostring(properties['type'])
                | summarize extensions = make_list(ExtensionName) by MachineResourceId
              ) on MachineResourceId
            | join kind= leftouter (
                GuestConfigurationResources
                | where type == 'microsoft.guestconfiguration/guestconfigurationassignments'
                | where name has 'AzureWindowsBaseline' or name has 'AzureLinuxBaseline'
                | extend MachineResourceId = tolower(tostring(properties.targetResourceId))
                | extend ComplianceStatus = tostring(properties.complianceStatus)
                | extend LastComplianceStatusChecked = todatetime(properties.lastComplianceStatusChecked)
                | mvexpand properties.latestAssignmentReport.resources
                | summarize FailedBaselineRules = make_list_if(properties_latestAssignmentReport_resources, properties_latestAssignmentReport_resources.complianceStatus == false),
                          ComplianceStatus = any(ComplianceStatus), LastComplianceStatusChecked = any(LastComplianceStatusChecked) by MachineResourceId
              ) on MachineResourceId
                | project-away MachineResourceId1, MachineResourceId2, MachineResourceId
            
        
2.  **Analyze Query Results:**
    *   If no data exists:
        *   The Guest Configuration agent may not have sent a report.
        *   Check if relevant policies are disabled via MDC / Policy. If disabled, this behavior is valid by design.
        *   If policies are enabled but no data is reported to ARG, open an incident with the Guest Configuration team.
    *   If data exists but resource health is unexpected:
        *   This indicates a Guest Configuration issue.
        *   Open an incident with the Guest Configuration team.
    *   If data appears correctly in ARG but varies from MDC:
        *   This suggests an MDC issue.

### Security Configurations Data Visible in ARG but Not in MDC

If security configurations are visible in ARG but not reflected in MDC:
1.  **Open an Incident with MDC Guardians:** Include these items:
    1.  A snapshot of the relevant recommendation for the specific resource.
    2.  The ARG result for that resource.
2.  **Verify Reporting by Assessors Service:** Update your resource ID and run this query:
    > :memo: **note**: The resource was reported by the�`Assessors`�service to the Modeller. Update your resource id and run the below query. The result will be in the�`Data`�column, include that in the incident:

        let ResourceId = "<your affected resource id>";
        cluster('romelogs.kusto.windows.net').database('Rome3Prod').FabricServiceOE
        | where env_time > ago(1d)
        | where applicationName == "fabric:/AssessorsApp"
        | where serviceName has "AssessorsApp"
        | where operationName contains "LogSendResultsTelemetryPartition"
        | extend Data = todynamic(customData)
        | where Data contains ResourceId
    
3.  **Check Modeller Reception:** Run this query if Assessors report matches expectations:
      > :memo: **note**: If the�`Assessors`�report matches your expectation, check what was received by the Modeller, by running the below query (otherwise skip this and move to the next check), and share it in the incident as well:�**Make sure to use the relevant assessment key for Linux / Windows**    

        // let assessmentKey = "8c3d9ad0-3639-4686-9cd2-2b2ab2609bda" // Vulnerabilities in security configuration on your Windows machines should be remediated (powered by Guest Configuration)
        // let assessmentKey = "1f655fb7-63ca-4980-91a3-56dbc2b715c6" // Vulnerabilities in security configuration on your Linux machines should be remediated (powered by Guest Configuration)
        let assessmentKey = "8c3d9ad0-3639-4686-9cd2-2b2ab2609bda";
        let ResourceId = "<your resource id>";
        cluster("Romecore").database("Prod").ServiceFabricDynamicOE
        | where env_time > ago(5d)
        | where operationName == "CoreV2.AssessmentIngestionPipeline.AssessmentReceivedOperationSchema"
        | where customData has assessmentKey
        | where customData contains ResourceId
        
    

Related Articles
----------------

For further exploration of related topics, refer to additional articles and resources on Microsoft's official documentation website.

Date
----

Article created on January 16, 2022.

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::

