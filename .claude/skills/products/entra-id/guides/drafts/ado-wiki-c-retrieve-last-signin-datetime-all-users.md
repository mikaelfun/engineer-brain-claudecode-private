---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/ACE Identity TSGs/Identity Technical Wiki/Useful PowerShell Scripts for AAD/Retrieve the Last Sign-In Date Time for All Users in Azure AD Using Microsoft Graph"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FACE%20Identity%20TSGs%2FIdentity%20Technical%20Wiki%2FUseful%20PowerShell%20Scripts%20for%20AAD%2FRetrieve%20the%20Last%20Sign-In%20Date%20Time%20for%20All%20Users%20in%20Azure%20AD%20Using%20Microsoft%20Graph"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Retrieve the Last Sign-In Date Time for All Users in Azure AD Using Microsoft Graph

Use this guide to export last sign-in date/time for all users (or filtered by type) to identify inactive accounts.

## Prerequisites

- Azure AD tenant
- Global administrator privileges
- PowerShell with Microsoft Graph PowerShell module installed

---

## Step 1: Connect to Microsoft Graph

```powershell
Connect-MgGraph -Scopes Directory.Read.All, AuditLog.Read.All
```

## Step 2: Select Microsoft Graph Beta Profile

```powershell
Select-MgProfile -Name beta
```

## Step 3: Export User Data with lastSignInDateTime to CSV

### For ALL users:

```powershell
Get-MgUser -All -Property 'UserPrincipalName','SignInActivity','Mail','DisplayName' |
    Select-Object `
        @{N='UserPrincipalName'; E={$_.UserPrincipalName}},
        @{N='DisplayName';       E={$_.DisplayName}},
        @{N='LastSignInDate';    E={$_.SignInActivity.LastSignInDateTime}} |
    Export-Csv -Path C:\usersSignIn.csv -NoTypeInformation -NoClobber
```

### For MEMBER users only:

```powershell
Get-MgUser -All -Filter "UserType eq 'Member'" -Property 'UserPrincipalName','SignInActivity','Mail','DisplayName' |
    Select-Object `
        @{N='UserPrincipalName'; E={$_.UserPrincipalName}},
        @{N='DisplayName';       E={$_.DisplayName}},
        @{N='LastSignInDate';    E={$_.SignInActivity.LastSignInDateTime}} |
    Export-Csv -Path C:\usersSignIn.csv -NoTypeInformation -NoClobber
```

### For GUEST users only:

```powershell
Get-MgUser -All -Filter "UserType eq 'Guest'" -Property 'UserPrincipalName','SignInActivity','Mail','DisplayName' |
    Select-Object `
        @{N='UserPrincipalName'; E={$_.UserPrincipalName}},
        @{N='DisplayName';       E={$_.DisplayName}},
        @{N='LastSignInDate';    E={$_.SignInActivity.LastSignInDateTime}} |
    Export-Csv -Path C:\usersSignIn.csv -NoTypeInformation -NoClobber
```

---

## Notes

- `SignInActivity` requires the **AuditLog.Read.All** permission and the **beta** Graph profile.
- Accounts with `null` `LastSignInDate` have either never signed in or the data is not yet available (sign-in data retention is typically 30 days for free tenants, up to 90 days for P1/P2).
- Use the exported CSV to identify inactive accounts for disablement or deletion.
