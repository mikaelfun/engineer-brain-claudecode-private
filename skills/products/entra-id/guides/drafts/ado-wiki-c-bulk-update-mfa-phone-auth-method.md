---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/ACE Identity TSGs/Identity Technical Wiki/Useful PowerShell Scripts for AAD/Bulk update MFA Phone Auth Method using PowerShell"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FACE%20Identity%20TSGs%2FIdentity%20Technical%20Wiki%2FUseful%20PowerShell%20Scripts%20for%20AAD%2FBulk%20update%20MFA%20Phone%20Auth%20Method%20using%20PowerShell"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Bulk Update MFA Phone Auth Method using PowerShell

Azure Portal only allows updating the MFA phone authentication method for a single user at a time. This script enables bulk updates from a CSV file using Microsoft Graph.

## Install Module

```powershell
Install-Module Microsoft.Graph
```

## CSV Format

```
"UPN","Number"
user1@contoso.com,+1 5551234567
user2@fabrikam.com,+91 9876543210
user3@contoso.com,+65 98765432
```

## Script

```powershell
Connect-MgGraph -Scopes UserAuthenticationMethod.ReadWrite.All
Select-MgProfile -Name beta

Write-Host "++++++++++ Updating MFA Authentication Methods for all users ++++++++++" `
    -ForegroundColor Black -BackgroundColor White

$csv = Import-Csv -Path C:\Users\YourUser\Desktop\AuthMethods.csv

Foreach ($line in $csv) {
    $UserInfo = Get-MgUserAuthenticationPhoneMethod -UserId $line.UPN | Select-Object *Phonenumber

    If ($UserInfo -ne $null) {
        Write-Host "User $($line.UPN) already has MFA Method registered as $UserInfo" -ForegroundColor Red
    } else {
        New-MgUserAuthenticationPhoneMethod -UserId $line.UPN -phoneType "mobile" -phoneNumber $line.Number | Out-Null
        Write-Host "Updated MFA Auth Method for user $($line.UPN) with value $($line.Number)" -ForegroundColor Green
    }
}

Write-Host "++++++++++ MFA Authentication Phone Method has been updated ++++++++++" `
    -ForegroundColor Black -BackgroundColor White
```

## Notes

- Script skips users who already have a phone method registered (logged in red).
- To **update** (not just add) an existing phone number, use `Update-MgUserAuthenticationPhoneMethod` instead.
- Reference: [Manage authentication methods for Azure AD MFA](https://docs.microsoft.com/en-us/azure/active-directory/authentication/howto-mfa-userdevicesettings)
