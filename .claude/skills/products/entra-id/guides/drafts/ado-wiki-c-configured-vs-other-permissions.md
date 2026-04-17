---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/Application_and_Service_Principal_Object_Management/How to/App registration Configured vs Other Permissions and App Role Assignments in Entra ID"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FEntra%20ID%20App%20Management%2FApplication_and_Service_Principal_Object_Management%2FHow%20to%2FApp%20registration%20Configured%20vs%20Other%20Permissions%20and%20App%20Role%20Assignments%20in%20Entra%20ID"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# App Registration Configured vs Other Permissions and App Role Assignments in Entra ID

## Overview

In Entra ID, managing application permissions effectively requires a clear understanding of how permissions are stored and reflected between the **App Object** and the **Service Principal (SP) Object**.

This document explains:

1. The difference between **Configured permissions (RequiredResourceAccess)** and **Other permissions granted**
2. How **permissions behave across tenants** in multi-tenant apps
3. The relationship between **App Role assignments and the RequiredResourceAccess (RRA)** of the App Object

## Key Entities

### App Object
- Exists **only in the home tenant**
- Defines the application's metadata and **Required Resource Access (RRA)** list
- RRA includes all **predeclared permissions and app roles** the app requires
- Permissions in RRA are displayed in the portal under **Configured permissions**

### Service Principal (SP) Object
- Created **per tenant** when the app is used or consented to
- Represents the app in the local tenant context
- Stores actual **granted permissions and app role assignments**
- May include permissions **not listed in the App Object's RRA**

## Configured Permissions (RRA)

- These are **explicit permissions** defined by the app developer during app registration or later via scripting.
- Stored in the App Object's requiredResourceAccess property.
- Used by Microsoft Entra ID during admin consent and tenant onboarding.
- **Only permissions in the RRA are replicated to other tenants** in multi-tenant apps.
- If a permission is in the RRA and admin consent is granted, it appears under **Configured permissions** in the SP's API permissions tab.

## Other Permissions Granted

- Represent permissions **granted directly to the SP** but **not currently listed in the App Object's RRA**.
- Occur in these cases:
  - A permission was dynamically requested (e.g., via /authorize?...&scope=...)
  - The permission was previously in the RRA but later removed
  - Permissions were assigned manually via PowerShell or Graph
- These permissions are still **valid and usable** by the app in that tenant
- Appear in the Entra portal under **"Other permissions granted"**

**Note:** This distinction is important for multi-tenant apps — only RRA-defined permissions are consistently visible and transferable across tenants.

## App Role Assignments and RRA

- App roles are assigned **to a service principal** via PowerShell or Graph (e.g., using New-MgServicePrincipalAppRoleAssignment)
- However, if the app role is not defined in the RRA, it won't show up in **Configured permissions**
- To make app roles appear under **Configured permissions**, they must first be added to the RRA

### Example: Add App Roles to RRA via Microsoft Graph PowerShell SDK

```powershell
Install-Module Microsoft.Graph -Scope CurrentUser
Connect-MgGraph -Scopes "Application.ReadWrite.All", "AppRoleAssignment.ReadWrite.All", "Directory.ReadWrite.All"

$app = Get-MgApplication -ApplicationId "<your-client-app-id>"
$resource = Get-MgServicePrincipal -Filter "displayName eq 'Microsoft Graph'"

$resourceAccess = @(
  @{ Id = "<Permission or AppRole ID>"; Type = "Role" }
)

$requiredResourceAccess = @(
  @{ ResourceAppId = $resource.AppId; ResourceAccess = $resourceAccess }
)

Update-MgApplication -ApplicationId $app.Id -RequiredResourceAccess $requiredResourceAccess
```

### Example: Assign App Role via Microsoft Graph PowerShell SDK

```powershell
$clientSp = Get-MgServicePrincipal -Filter "appId eq '<your-client-app-id>'"
$resourceSp = Get-MgServicePrincipal -Filter "displayName eq 'Your API App Name'"

New-MgServicePrincipalAppRoleAssignment -PrincipalId $clientSp.Id `
  -ResourceId $resourceSp.Id `
  -AppRoleId "<AppRoleId>" `
  -DirectoryObjectId $clientSp.Id
```

## Summary Table

| Type | Defined In | Visible in Portal | Replicated Across Tenants | Revoked if Removed |
|------|-----------|-------------------|--------------------------|-------------------|
| Configured Permissions | App Object (RRA) | Yes (under Configured) | Yes | No (must remove manually) |
| Other Permissions Granted | SP Object only | Yes (under Other) | No | No (must remove manually) |
| App Role Assignments (RRA) | App Object + SP | Yes (if in RRA) | Yes | No (must remove manually) |
