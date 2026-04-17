# Verify First-Party Microsoft Applications in Sign-in Reports

> Source: https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/governance/verify-first-party-apps-sign-in

## When to Use

When you see an unfamiliar application in sign-in reports and want to confirm it's a legitimate Microsoft first-party app.

## Method 1: Azure Portal

1. Open Enterprise Applications → All applications
2. Filter Application Type = **Microsoft Applications** → Apply
3. Search by Display Name or Application ID
4. Select app → Properties → verify message: "You can't delete this application because it's a Microsoft first party application"

## Method 2: PowerShell

### Microsoft Graph PowerShell SDK
```powershell
Import-Module Microsoft.Graph.Applications
Connect-MgGraph
$appDisplayName = '<display name>'
Get-MgServicePrincipal -Filter "DisplayName eq '$appDisplayName'" | Select-Object Id, DisplayName, SignInAudience, AppOwnerOrganizationId
```

### Microsoft Entra PowerShell
```powershell
Import-Module Microsoft.Entra
Connect-Entra
$appDisplayName = '<display name>'
Get-EntraServicePrincipal -SearchString $appDisplayName | Select-Object Id, DisplayName, SignInAudience, AppOwnerOrganizationId
```

**Key check**: If `AppOwnerOrganizationId` = `f8cdef31-a31e-4b4a-93e4-5f571e91255a`, it's the Microsoft Service tenant.

## Known Microsoft Tenant App IDs

Tenant ID: `72f988bf-86f1-41af-91ab-2d7cd011db47`

| Application | Application ID |
|---|---|
| Graph Explorer | `de8bc8b5-d9f9-48b1-a8ad-b748da725064` |
| Microsoft Graph Command Line Tools | `14d82eec-204b-4c2f-b7e8-296a70dab67e` |
| OutlookUserSettingsConsumer | `7ae974c5-1af7-4923-af3a-fb1fd14dcb7e` |
| Vortex [wsfed enabled] | `5572c4c0-d078-44ce-b81c-6cbf8d3ed39e` |
