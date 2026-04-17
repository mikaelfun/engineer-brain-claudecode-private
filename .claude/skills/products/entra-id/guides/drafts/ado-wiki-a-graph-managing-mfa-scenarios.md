---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/PowerShell Scenarios/Scripts/Microsoft Graph Managing MFA Scenarios"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FPowerShell%20Scenarios%2FScripts%2FMicrosoft%20Graph%20Managing%20MFA%20Scenarios"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Scripts to help manage MFA scenarios

## Generate MFA status report

Shows each user's default MFA method, configured methods, per-user MFA state, license status, and sign-in status.

```powershell
Connect-MgGraph -Scopes "User.Read.All", "Directory.Read.All", "userauthenticationmethod.read.all, Policy.Read.All"

$ExportCSV = "C:\Temp\MFAStatusReport_$(Get-Date -Format 'yyyyMMdd_HHmm').csv"
$Results = @()

$users = Get-MgUser -All

foreach ($user in $users){
    $upn = $user.UserPrincipalName
    $userId = $user.Id
    $displayName = $user.DisplayName
    $isLicensed = $user.AssignedLicenses.Count -gt 0
    $signInAllowed = $user.AccountEnabled -eq $true

    write-host "Processing '$upn'"

    # Get MFA methods
    $methods = Get-MgUserAuthenticationMethod -UserId $user.Id

    # Get per-user MFA state
    $mfaEnabled = Invoke-MgGraphRequest -Method Get -Uri "https://graph.microsoft.com/beta/users/$userId/authentication/requirements"
    $mfaStatus = $mfaEnabled.perUserMfaState

    $methodTypes = ""
    foreach($method in $methods){
        if($methodTypes -ne ""){ $methodTypes += ", " }
        $methodTypes += $method['@odata.type'] -replace '#microsoft.graph.',''  
    }

    # Get sign-in preferences (system preferred method)
    $signInPreferences = Invoke-MgGraphRequest -Method GET -Uri "https://graph.microsoft.com/beta/users/$($user.Id)/authentication/signInPreferences"

    $Results += [PSCustomObject]@{
        DisplayName       = $displayName
        UserPrincipalName = $upn
        MFAStatus         = $mfaStatus
        DefaultMFAMethod  = $signInPreferences.systemPreferredAuthenticationMethod
        AllMFAMethods     = $methodTypes
        LicenseStatus     = if ($isLicensed) { "Licensed" } else { "Unlicensed" }
        SignInStatus      = if ($signInAllowed) { "Allowed" } else { "Denied" }
    }
}

$Results | Export-Csv -Path $ExportCSV -NoTypeInformation
Write-Host "MFA status report exported to: $ExportCSV"
```
