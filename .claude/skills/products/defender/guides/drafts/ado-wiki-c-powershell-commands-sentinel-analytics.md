---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Analytics/PowerShell Commands"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=%2FMicrosoft%20Sentinel%20Wiki%2FAnalytics%2FPowerShell%20Commands"
importDate: "2026-04-07"
type: troubleshooting-guide
---

**Note** As the entity mappings have changed recently, it seems that some of the PowerShell commands have also changed. Therefore, I'm creating this sub-section to provide info from different commands we may need to use accordingly to PG.

#New-AzSentinelAlertRule

[ICM of Reference](https://portal.microsofticm.com/imp/v3/incidents/details/360264116/home)

**Scheduled Rule with Entities**

How to create new analytic rule with entities, the idea is to use JSON format, then convert this to PS as a Hash table to feed into the command like so:

$json = '[
                              {
                                  "EntityType": "IP",
                                  "FieldMapping":  [
                                                       {
                                                           "ColumnName":  "FileHashCustomEntity",
                                                           "Identifier":  "Address"
                                                       }
                                                   ]
                              }
                          ]'

 $entities = $json | ConvertFrom-Json -AsHashTable

New-AzSentinelAlertRule   -ResourceGroupName "myResourceGroupName" -WorkspaceName myWorkspaceName"  -QueryFrequency 1:00:00   -QueryPeriod 1:00:00 -DisplayName "TesS-2"   -Kind Scheduled   -Query "SecurityAlert | where TimeGenerated == '99'"   -Severity Low    -TriggerOperator GreaterThan -TriggerThreshold 10 -EntityMapping $entities



**Example for Fusion**

`New-AzSentinelAlertRule -ResourceGroupName "myResourceGroupName" -WorkspaceName myWorkspaceName"  -AlertRuleTemplate "f71aba3d-28fb-450b-b192-4e76a83015c8" -kind Fusion`

**Example for ML**

`New-AzSentinelAlertRule -ResourceGroupName "myResourceGroupName" -WorkspaceName myWorkspaceName"  -AlertRuleTemplate "fa118b98-de46-4e94-87f9-8e6d5060b60b" -kind MlBehaviorAnalytics`

**Templates information** [GitHub Repository](https://github.com/Azure/Azure-Sentinel/tree/master/Detections) containing the templates. The "Id" field is the name for each of the templates.

#  Updating Tactics & Techniques in Microsoft Sentinel Alert Rules (via Azure CLI)

As per the [az sentinel alert-rule | Microsoft Learn](https://learn.microsoft.com/en-us/cli/azure/sentinel/alert-rule),

we have to use the following command to update the tactics and techniques columns: `az sentinel alert-rule update --subscription <subid> -g <resourcegroupname> --workspace-name <LAname> --rule-name <ruleID> --add techniques "T1021" --add tactics "LateralMovement"`.

We updated the Sentinel extension to version 0.2.0, which allowed us to successfully update the techniques column.

The command used for the extension update is: `az extension update --name sentinel`.

However, the sub-techniques column cannot be updated with the existing Sentinel extension, as the parameter for sub-techniques is not currently available.

For reference, see IcM Incident-597386113.
