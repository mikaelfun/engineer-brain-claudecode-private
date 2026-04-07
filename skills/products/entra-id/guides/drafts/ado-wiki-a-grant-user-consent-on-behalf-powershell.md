---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/Application_Consent_Experiences/Labs/LAB - Granting user consent on behalf of another user using PowerShell"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FEntra%20ID%20App%20Management%2FApplication_Consent_Experiences%2FLabs%2FLAB%20-%20Granting%20user%20consent%20on%20behalf%20of%20another%20user%20using%20PowerShell"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Granting User Consent on Behalf of Another User Using PowerShell

## Objective

When admin consent is not an option, user consent becomes an alternative. Admins can grant user consent on behalf of another user via PowerShell or Microsoft Graph API.

> ⚠️ The Azure portal UI does **not** support granting user consent on behalf of another user.

## Prerequisites

- Access to Microsoft Entra ID
- PowerShell with Microsoft Graph module (`Install-Module Microsoft.Graph`)
- Role: Global Administrator / Privileged Role Administrator / Application Administrator / Cloud Application Administrator

## Required Data

| Item | Where to find |
|---|---|
| Client Application ID | App registration → Overview → Application (client) ID |
| API Permissions | The scopes the app needs (e.g., `openid profile offline_access User.Read User.ReadBasic.All`) |
| User Identifier | UPN or Object ID of the target user |

## Steps

1. Copy the PowerShell script from [Microsoft Learn — Grant consent on behalf of a single user](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/grant-consent-single-user?pivots=msgraph-powershell#grant-consent-on-behalf-of-a-single-user)

2. Modify variables:
   - `$clientAppId` → your application's client ID
   - `$permissions` → required permission scopes
   - `$userUpnOrId` → target user's UPN or Object ID

3. Run Step 0 — Connect to Microsoft Graph:
   - For granting consent for your admin account only: click **Accept** (no "Consent on behalf of your organization")
   - For org-wide admin consent: check **Consent on behalf of your organization** then **Accept**

4. Run Steps 1, 2, and 3 per the script.

## Verify Consent Was Granted

```powershell
New-MgServicePrincipalAppRoleAssignedTo -ServicePrincipalId $clientSp.Id | fl
```

**Via Azure Portal:**
1. Enterprise Applications → select the app
2. Permissions → User Consent tab
3. Click user count to see details

## Notes

- This approach allows consent for permissions that normally require admin consent (e.g., `Application.read.all`)
- Always verify via PowerShell or the portal after granting
