---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/ACE Identity TSGs/Identity Technical Wiki/Useful PowerShell Scripts for AAD/Get MFA Auth Method with details for All or Group of users"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FACE%20Identity%20TSGs%2FIdentity%20Technical%20Wiki%2FUseful%20PowerShell%20Scripts%20for%20AAD%2FGet%20MFA%20Auth%20Method%20with%20details%20for%20All%20or%20Group%20of%20users"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Get MFA Auth Method Details for All Users or Users in a Group

Export MFA status and authentication method details for all users in the tenant or within a specific Azure AD group.

## Required Permissions

```powershell
connect-MgGraph -Scopes User.Read.All, UserAuthenticationMethod.ReadWrite.All
```

---

## Script 1: Export MFA Status for ALL Users

```powershell
$OutputPath = "NewOutput.csv"

connect-MgGraph -Scopes User.Read.All, UserAuthenticationMethod.ReadWrite.All

$users = Get-MgUser -All

$report = foreach ($user in $users) {
    $methods = Get-MgUserAuthenticationMethod -UserId $user.Id
    $methods = $methods | Where-Object {
        $_.AdditionalProperties.'@odata.type' -notmatch "passwordAuthenticationMethod"
    }

    [PSCustomObject]@{
        UserPrincipalName = $user.UserPrincipalName
        AccountDisabled   = $user.AccountEnabled -eq $false
        MFAStatus         = if ($methods) { "Enabled" } else { "Disabled" }
        MFAMethods        = ($methods | ForEach-Object {
            $_.AdditionalProperties.'@odata.type' -replace '#microsoft.graph.', ''
        }) -join ', '
        AuthEmail         = ($methods | Where-Object {
            $_.AdditionalProperties.'@odata.type' -like "*emailAuthenticationMethod"
        }).AdditionalProperties.emailAddress
        AuthPhone         = ($methods | Where-Object {
            $_.AdditionalProperties.'@odata.type' -like "*phoneAuthenticationMethod"
        }).AdditionalProperties.phoneNumber
        AuthDevice        = ($methods | Where-Object {
            $_.AdditionalProperties.'@odata.type' -like "*microsoftAuthenticatorAuthenticationMethod"
        }).AdditionalProperties.displayName
    }
}

$report | Export-Csv -Path $OutputPath -NoTypeInformation
```

---

## Script 2: Export MFA Status for Users in a Specific Group (by Group Object ID)

```powershell
$OutputPath = "NewOutput.csv"

connect-MgGraph -Scopes User.Read.All, UserAuthenticationMethod.ReadWrite.All

Write-Host "Export MFA Details for users in a Group" -ForegroundColor Green
$groupId = Read-Host -Prompt "Enter Group Object ID"
$members = Get-MgGroupMember -GroupId $groupId -Property id, assignedLicenses, userPrincipalName, usageLocation

$NEW = Foreach ($user in $members) {
    $methods = Get-MgUserAuthenticationMethod -UserId $user.Id
    $methods = $methods | Where-Object {
        $_.AdditionalProperties.'@odata.type' -notmatch "passwordAuthenticationMethod"
    }

    [PSCustomObject]@{
        UserPrincipalName = $user.AdditionalProperties.userPrincipalName
        UsageLocation     = $user.AdditionalProperties.usageLocation
        IsLicensed        = if ($user.AdditionalProperties.assignedLicenses) { $true } else { $false }
        MFAStatus         = if ($methods) { "Enabled" } else { "Disabled" }
        MFAMethods        = ($methods | ForEach-Object {
            $_.AdditionalProperties.'@odata.type' -replace '#microsoft.graph.', ''
        }) -join ', '
        AuthEmail         = ($methods | Where-Object {
            $_.AdditionalProperties.'@odata.type' -like "emailAuthenticationMethod"
        }).AdditionalProperties.emailAddress
        AuthPhone         = ($methods | Where-Object {
            $_.AdditionalProperties.'@odata.type' -like "phoneAuthenticationMethod"
        }).AdditionalProperties.phoneNumber
        AuthDevice        = ($methods | Where-Object {
            $_.AdditionalProperties.'@odata.type' -like "microsoftAuthenticatorAuthenticationMethod"
        }).AdditionalProperties.displayName
    }

    Write-Host "Checking MFA Details for $($user.AdditionalProperties.userPrincipalName)" `
        -ForegroundColor White -BackgroundColor Black
}

$NEW | Export-Csv -Path $OutputPath -NoTypeInformation
Write-Host "File exported to $OutputPath" -ForegroundColor Yellow
Read-Host -Prompt "Press Enter to exit"
```

---

## Output Fields

| Field | Description |
|-------|-------------|
| UserPrincipalName | User's UPN |
| AccountDisabled | Whether the account is disabled |
| MFAStatus | Enabled / Disabled |
| MFAMethods | All registered auth method types (comma-separated) |
| AuthEmail | Registered email auth address |
| AuthPhone | Registered phone number |
| AuthDevice | Registered Authenticator app device name |
