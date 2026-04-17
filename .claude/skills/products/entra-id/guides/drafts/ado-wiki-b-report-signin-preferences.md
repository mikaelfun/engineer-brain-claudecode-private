---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/PowerShell Scenarios/Scripts/Report of User Sign In Preferences Using Microsoft Graph (Beta)"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FPowerShell%20Scenarios%2FScripts%2FReport%20of%20User%20Sign%20In%20Preferences%20Using%20Microsoft%20Graph%20(Beta)"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Report of User Sign In Preferences Using Microsoft Graph (Beta)

## Overview
Retrieves user authentication preferences across all users in a tenant. Audits system-preferred authentication method status and user-selected preferred secondary authentication methods.

## Script
```powershell
Import-Module Microsoft.Graph.Beta.Users
Connect-MgGraph -Scopes "User.Read.All", "UserAuthenticationMethod.Read.All"

$users = Get-MgUser -All
$mfaReport = @()
$totalUsers = $users.Count
$progress = 0

foreach ($user in $users) {
    try {
        $progress++
        $percentComplete = [math]::Round(($progress / $totalUsers) * 100, 2)
        Write-Progress -Activity "Processing Users" -Status "$percentComplete% Complete" -PercentComplete $percentComplete

        $authResponse = Invoke-MgGraphRequest -Method GET -Uri "https://graph.microsoft.com/beta/users/$($user.Id)/authentication/signInPreferences"
        $isSystemPreferred = $authResponse.isSystemPreferredAuthenticationMethodEnabled
        $userPreferredMethod = $authResponse.userPreferredMethodForSecondaryAuthentication

        $userMfaStatus = [PSCustomObject]@{
            UserPrincipalName = $user.UserPrincipalName
            SystemPreferredAuthMethodEnabled = if ($isSystemPreferred -ne $null) { $isSystemPreferred } else { "Unknown" }
            UserPreferredMethod = if ($userPreferredMethod -ne $null) { $userPreferredMethod } else { "Not Set" }
        }
        $mfaReport += $userMfaStatus
    } catch {
        Write-Warning "Failed to retrieve MFA details for user: $($user.UserPrincipalName). Error: $_"
    }
    Start-Sleep -Milliseconds 100
}

$mfaReport | Format-Table -AutoSize
# Export: $mfaReport | Export-Csv -Path "SignInPreferencesReport.csv" -NoTypeInformation
```
