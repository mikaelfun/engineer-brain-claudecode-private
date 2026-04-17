---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Automation/Automation Rules and Playbooks/Isolate endpoint - MDE playbook"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Microsoft%20Sentinel%20Wiki/Automation/Automation%20Rules%20and%20Playbooks/Isolate%20endpoint%20-%20MDE%20playbook"
importDate: "2026-04-07"
type: troubleshooting-guide
---

This playbook will isolate (full) the machine in Microsoft Defender for Endpoint.

# Prerequisites

1. Grant Machine.Isolate permissions to the managed identity. Run the following command in cloud shell.

```powershell
$MIGuid = "enter the managed identity id here"
$MI = Get-AzureADServicePrincipal -ObjectId $MIGuid

$MDEAppId = "fc780465-2017-40d4-a0c5-307022471b92"
$PermissionName = "Machine.Isolate"

$MDEServicePrincipal = Get-AzureADServicePrincipal -Filter "appId eq '$MDEAppId'"
$AppRole = $MDEServicePrincipal.AppRoles | Where-Object {$_.Value -eq $PermissionName -and $_.AllowedMemberTypes -contains "Application"}
New-AzureAdServiceAppRoleAssignment -ObjectId $MI.ObjectId -PrincipalId $MI.ObjectId `
-ResourceId $MDEServicePrincipal.ObjectId -Id $AppRole.Id
```

# Deployment

Instructions on [how to deploy](https://github.com/Azure/Azure-Sentinel/tree/master/Solutions/MicrosoftDefenderForEndpoint/Playbooks/Isolate-MDEMachine)
