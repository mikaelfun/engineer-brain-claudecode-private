# Verify First-Party Microsoft Applications in Sign-in Reports

Source: https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/governance/verify-first-party-apps-sign-in

## Summary

How to identify and verify Microsoft first-party applications appearing in Entra sign-in reports.

## Verification Methods

### Via Azure Portal
1. Open Enterprise Applications in Entra ID
2. Select **All applications**
3. Filter **Application Type** → **Microsoft Applications**
4. Search by Display Name or Application ID
5. Select app → **Properties** → should show "You can't delete this application because it's a Microsoft first party application"

### Via Microsoft Graph PowerShell
```powershell
Import-Module Microsoft.Graph.Applications
Connect-MgGraph
$appDisplayName = '<display name>'
Get-MgServicePrincipal -Filter "DisplayName eq '$appDisplayName'" | Select-Object Id, DisplayName, SignInAudience, AppOwnerOrganizationId
```
- If `AppOwnerOrganizationId` = `f8cdef31-a31e-4b4a-93e4-5f571e91255a` → Microsoft first-party

### Via Microsoft Entra PowerShell
```powershell
Import-Module Microsoft.Entra
Connect-Entra
Get-EntraServicePrincipal -SearchString $appDisplayName | Select-Object Id, DisplayName, SignInAudience, AppOwnerOrganizationId
```

## Known Microsoft Tenant-Owned Apps (Tenant: 72f988bf-86f1-41af-91ab-2d7cd011db47)

| App Name | App ID |
|---|---|
| Graph Explorer | de8bc8b5-d9f9-48b1-a8ad-b748da725064 |
| Microsoft Graph Command Line Tools | 14d82eec-204b-4c2f-b7e8-296a70dab67e |
| OutlookUserSettingsConsumer | 7ae974c5-1af7-4923-af3a-fb1fd14dcb7e |
| Vortex [wsfed enabled] | 5572c4c0-d078-44ce-b81c-6cbf8d3ed39e |
