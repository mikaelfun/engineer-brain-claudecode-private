---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/ACE Identity TSGs/Identity Technical Wiki/Useful PowerShell Scripts for AAD/Automatically Remove Stale or Pending Guest Users in Azure Active Directory after 30 Days"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FACE%20Identity%20TSGs%2FIdentity%20Technical%20Wiki%2FUseful%20PowerShell%20Scripts%20for%20AAD%2FAutomatically%20Remove%20Stale%20or%20Pending%20Guest%20Users%20in%20Azure%20Active%20Directory%20after%2030%20Days"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Automatically Remove Stale or Pending Guest Users in Azure AD after 30 Days

Guest users with **PendingAcceptance** state for 30+ days can create security risks and directory clutter. This guide provides PowerShell scripts to remove or quarantine them.

## Prerequisites

- Azure AD tenant with administrative access
- PowerShell installed
- Microsoft Graph PowerShell module: `Install-Module Microsoft.Graph`

---

## Script 1: Remove Pending Guest Users (30+ days old) using Delegated Auth

```powershell
# Get System Date and subtract 30 days
$Date = (Get-Date).adddays(-30).ToString('yyyy-MM-dd hh:mm:ss')

# Get all active guest users
$user = Get-MgUser -All $true -Filter "UserType eq 'Guest'"

# Foreach loop against all guest users
Foreach ($object in $user) {
    # Check if user is PendingAcceptance AND created more than 30 days ago
    if (($object.externalUserState -eq "PendingAcceptance") -and ($Object.createdDateTime -gt "$Date")) {
        $DeletedUser = Get-MgUser -UserId $object.UserPrincipalName | Select-Object `
            @{N='CreatedDateTime';E={$_.createdDateTime}},
            @{N='UserPrincipalName';E={$_.UserPrincipalName}},
            @{N='DisplayName';E={$_.DisplayName}},
            @{N='UserType';E={$_.UserType}},
            @{N='UserStateChangedOn';E={$_.UserStateChangedOn}}

        $DeletedUser | Export-Csv -Path C:/DeletedUsers.csv -NoTypeInformation -Append
        Remove-MgUser -UserId $object.id
        Write-Host "Removed user $($object.UserPrincipalName) with creation time $($object.createdDateTime)" -ForegroundColor Red
    } else {
        Write-Host "User $($Object.UserPrincipalName) accepted the invite on $($object.externalUserStateChangeDateTime)" -ForegroundColor Green
    }
}
```

---

## Script 2: Add Pending Guest Users to an Azure AD Group (using Service Principal)

Use this if you want to quarantine instead of delete:

```powershell
$TenantId = "Tenant ID goes here"
$AppClientId = "Application ID goes here"
$ClientSecret = "Client Secret goes here"

$RequestBody = @{
    client_id     = $AppClientId
    client_secret = $ClientSecret
    grant_type    = "client_credentials"
    scope         = "https://graph.microsoft.com/.default"
}

$OAuthResponse = Invoke-RestMethod -Method Post `
    -Uri "https://login.microsoftonline.com/$TenantId/oauth2/v2.0/token" `
    -Body $RequestBody

$AccessToken = $OAuthResponse.access_token
Connect-MgGraph -AccessToken $AccessToken
Select-MgProfile -Name beta

$group = Get-MGGroup -GroupId "20a56c74-42a1-49dc-b30f-04d95207536f"  # Replace with your group ID

$getuser = Get-MGUser -Filter "UserType eq 'Guest'"
Foreach ($object in $getuser) {
    if ($object.externalUserState -eq "PendingAcceptance") {
        New-MgGroupMember -GroupId $group.Id -DirectoryObjectId $object.Id
        Write-Host "Adding user $($object.DisplayName)"
    }
}
```

> **Note:** Test in a demo/staging environment before running in production.

---

## Automation Recommendation

Schedule the script to run periodically (e.g., via Azure Automation or a scheduled task) to keep the directory clean.
