---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Automation/Automation Rules and Playbooks/Get-MDEInvestigationPackage Playbook"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Microsoft%20Sentinel%20Wiki/Automation/Automation%20Rules%20and%20Playbooks/Get-MDEInvestigationPackage%20Playbook"
importDate: "2026-04-07"
type: troubleshooting-guide
---

This playbook will call the collect investigation package in MDE. It will then loop until thats complete, once complete it will add a comment to the incident and post a message in teams with the URL to download the package.

# Quick Deployment

Go to https://github.com/Azure/Azure-Sentinel/tree/master/Playbooks/Get-MDEInvestigationPackage

# Prerequisites

1. ## Get the Teams ID and Channel ID

Example: `https://teams.microsoft.com/l/channel/<channel id>/Alerts?groupId=<groupid>&tenantId=00000000-0000-0000-0000-00000000000`

2. ## Grant the following permissions to the managed identity by running the commands in the Cloud Shell.

### For Machine.CollectForensics permission

```powershell
$MIGuid = " enter managed identity here "
$MI = Get-AzureADServicePrincipal -ObjectId $MIGuid

$MDEAppId = "fc780465-2017-40d4-a0c5-307022471b92"
$PermissionName = "Machine.CollectForensics"

$MDEServicePrincipal = Get-AzureADServicePrincipal -Filter "appId eq '$MDEAppId'"
$AppRole = $MDEServicePrincipal.AppRoles | Where-Object {$_.Value -eq $PermissionName -and $_.AllowedMemberTypes -contains "Application"}
New-AzureAdServiceAppRoleAssignment -ObjectId $MI.ObjectId -PrincipalId $MI.ObjectId `
-ResourceId $MDEServicePrincipal.ObjectId -Id $AppRole.Id
```

### For Machine.ReadWrite.All permission

```powershell
$MIGuid = " enter managed identity here "
$MI = Get-AzureADServicePrincipal -ObjectId $MIGuid

$MDEAppId = "fc780465-2017-40d4-a0c5-307022471b92"
$PermissionName = "Machine.ReadWrite.All"

$MDEServicePrincipal = Get-AzureADServicePrincipal -Filter "appId eq '$MDEAppId'"
$AppRole = $MDEServicePrincipal.AppRoles | Where-Object {$_.Value -eq $PermissionName -and $_.AllowedMemberTypes -contains "Application"}
New-AzureAdServiceAppRoleAssignment -ObjectId $MI.ObjectId -PrincipalId $MI.ObjectId `
-ResourceId $MDEServicePrincipal.ObjectId -Id $AppRole.Id
```

### For Machine.Read.All permission

```powershell
$MIGuid = " enter managed identity here "
$MI = Get-AzureADServicePrincipal -ObjectId $MIGuid

$MDEAppId = "fc780465-2017-40d4-a0c5-307022471b92"
$PermissionName = "Machine.Read.All"

$MDEServicePrincipal = Get-AzureADServicePrincipal -Filter "appId eq '$MDEAppId'"
$AppRole = $MDEServicePrincipal.AppRoles | Where-Object {$_.Value -eq $PermissionName -and $_.AllowedMemberTypes -contains "Application"}
New-AzureAdServiceAppRoleAssignment -ObjectId $MI.ObjectId -PrincipalId $MI.ObjectId `
-ResourceId $MDEServicePrincipal.ObjectId -Id $AppRole.Id
```

3. ## Authorize teams-Get-MDEInvestigationPackage API connections

This ensures that the logic app will send the message to the Teams channel.

4. ## Apply Microsoft Sentinel Responder permissions to managed identity.

# How to use the logic app

1. Simulate a MDE or M365 Defender incident.
2. Click Actions - choose Run Playbook
3. Run the Get-MDEInvestigationPackage playbook.
4. Once the playbook triggered successfully, click the playbook name to view the status.
5. Please note that it will take about 2-3 minutes until it shows the result.
6. If it runs successfully, go to Teams and check the message in the channel.
7. Copy the URL and paste it on another tab to download the package.

# Common Issues

1. **Expired token when downloading investigation package**: The playbook generates a URI for downloading the package, but an expired token appears. The URI must be used immediately (within 1 minute). Reference: https://learn.microsoft.com/en-us/microsoft-365/security/defender-endpoint/get-package-sas-uri?view=o365-worldwide#response

2. **Missing permissions error**: The customer runs the playbook, but receives error "'message': 'The application does not have any of the required application permissions (Machine.Read.All, Machine.ReadWrite.All) to access the resource'". **Solution**: Ensure that the customer has added Machine.Read.All, Machine.ReadWrite.All permissions to the managed identity (see Prerequisites step 2).
