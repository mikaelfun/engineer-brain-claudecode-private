---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/PowerShell Scenarios/Scripts/Microsoft Graph Common Requested Reports"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FPowerShell%20Scenarios%2FScripts%2FMicrosoft%20Graph%20Common%20Requested%20Reports"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Commonly Requested Reports using Microsoft Graph PowerShell

[[_TOC_]]

## Get Sign-in Logs

```powershell
# Connect to MS Graph
Connect-MgGraph -scopes Reports.Read.All,Organization.Read.All

# First get the logs
$logs = Get-MgAuditLogSignIn | ConvertTo-Json -Depth 99 | ConvertFrom-Json
# $logs = Get-MgAuditLogSignIn -All | ConvertTo-Json -Depth 99 | ConvertFrom-Json

$members = $logs | Get-Member | where{$_.MemberType -eq 'NoteProperty'}

# Multiple results
If($logs.count -gt 0) {
    for($i = 0;$i -lt $logs.count;$i++) {
        Foreach ($member in $members) {
            if($logs[$i].$($member.Name) -ne $null) {
                $logs[$i].$($member.Name) = ($logs[$i].$($member.Name) | ConvertTo-Json -Depth 2).replace('"','')
            }
            else {
                $logs[$i].$($member.Name) = $null
            }
        }
    }
} Else {
    Foreach ($member in $members) {
        $logs.$($member.Name) = ($logs.$($member.Name) | ConvertTo-Json -Depth 2).replace('"','')
    }
}

$logs | Export-Csv -NoTypeInformation -Path results.csv
```

## Get Users signInActivity

```powershell
# Install Microsoft Graph PowerShell Module
Install-Module Microsoft.Graph

# CONFIGURATION
$utc = (Get-Date).ToUniversalTime()
$FilterlastSignInDateTime = Get-Date ($utc).AddDays(-30) -Format o

# Connect to Microsoft Graph
Connect-MgGraph -Scopes "User.Read.All","AuditLog.Read.All, Organization.Read.All"

# Filter by guest users
$graphUsers = Get-MgUser -filter "userType eq 'guest'" -select "userPrincipalName,signInActivity,userType,accountEnabled" -All | Select userPrincipalName,signInActivity,userType,accountEnabled

# Filter by signInActivity (alternative)
# $graphUsers = Get-MgUser -filter "signInActivity/lastSignInDateTime le $FilterlastSignInDateTime or signInActivity/lastNonInteractiveSignInDateTime le $FilterlastSignInDateTime" -select "userPrincipalName,signInActivity,userType,accountEnabled" -All | Select userPrincipalName,signInActivity,userType,accountEnabled

$users = $graphUsers | ConvertTo-Json -Depth 99 -Compress | ConvertFrom-Json

$results = @()
Foreach ($user in $users) {
    if ($user.userPrincipalName) {
        # Determine users last sign-in datetime (interactive or non-interactive)
        if($user.signInActivity.lastSignInDateTime -gt $user.signInActivity.lastNonInteractiveSignInDateTime) {
            $lastSignIn = $user.signInActivity.lastSignInDateTime
        } else {
            $lastSignIn = $user.signInActivity.lastNonInteractiveSignInDateTime
        }

        # PowerShell filter
        if ($lastSignIn -lt $FilterlastSignInDateTime -and $user.userType -eq "guest") {
            $detail = [pscustomobject]@{
                UserName = $user.userPrincipalName
                LastSignIn = $lastSignIn
                lastSignInDateTime = $user.signInActivity.lastSignInDateTime
                lastNonInteractiveSignInDateTime = $user.signInActivity.lastNonInteractiveSignInDateTime
            }
            $results += $detail
        }
    }
}

$results
```

## Get Users MFA Status

```powershell
Import-Module Microsoft.Graph.Reports

Get-MgReportCredentialUserRegistrationDetail -Filter "userPrincipalName eq 'user@contoso.onmicrosoft.com'"

# Look for specific default type
$UsersRegistrationDetails = Get-MgReportAuthenticationMethodUserRegistrationDetail
$UsersRegistrationDetails | where {$_.defaultMfaMethod -eq "mobilePhone" -or $_.defaultMfaMethod -eq "officePhone" -or $_.defaultMfaMethod -eq "alternateMobilePhone"} | select userPrincipalName, defaultMfaMethod
```
