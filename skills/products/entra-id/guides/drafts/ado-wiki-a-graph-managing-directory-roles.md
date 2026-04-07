---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/PowerShell Scenarios/Scripts/Microsoft Graph Managing Directory Roles"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FPowerShell%20Scenarios%2FScripts%2FMicrosoft%20Graph%20Managing%20Directory%20Roles"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Scripts to help manage directory role scenarios

## Generate directory roles status report

Shows admin roles assigned to each user in the tenant.

```powershell
Connect-MgGraph -Scopes "User.Read.All", "Directory.Read.All"

$ExportCSV = "C:\Temp\DirectoryRolesReport_$(Get-Date -Format 'yyyyMMdd_HHmm').csv"
$Results = @()

$users = Get-MgUser -All

foreach ($user in $users){
    $upn = $user.UserPrincipalName
    $displayName = $user.DisplayName

    write-host "Processing '$displayName'"

    $roles = Invoke-MgGraphRequest -Method GET -Uri "https://graph.microsoft.com/v1.0/users/$($user.Id)/memberOf/microsoft.graph.directoryRole"

    $roleNames = ""
    foreach ($role in $roles.value) {
        if ($roleNames -ne "") { $roleNames += ", " }
        $roleNames += $role.displayName
    }

    $isAdmin = $roles.value.Count -gt 0

    $Results += [PSCustomObject]@{
        DisplayName       = $displayName
        UserPrincipalName = $upn
        IsAdmin           = if ($isAdmin) { "True" } else { "False" }
        AdminRoles        = if ($roleNames) { $roleNames } else { "No roles" }
    }
}

$Results | Export-Csv -Path $ExportCSV -NoTypeInformation
Write-Host "Directory roles report exported to: $ExportCSV"
```
