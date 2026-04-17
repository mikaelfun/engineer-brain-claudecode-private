# Blocking PowerShell Access via Conditional Access (Non-GUI App IDs)

## Summary
Conditional Access GUI does not natively support targeting Azure AD PowerShell (AppId: `1b730954-1685-4b74-9bfd-dac224a7b894`). However, you can use programmatic methods to create CA policies that block PowerShell modules like `Connect-AzureAD` and `Connect-MsolService`.

## Key App IDs
| Module/API | App ID |
|---|---|
| AAD Graph API | `00000002-0000-0000-c000-000000000000` |
| Azure Management | `797f4846-ba00-4fd7-ba43-dac1f8f63013` |
| Microsoft Graph | `00000003-0000-0000-c000-000000000000` |
| Azure AD PowerShell | `1b730954-1685-4b74-9bfd-dac224a7b894` |

## Method 1: CA Policy via REST API
Use `login-azurermaccount` to get a token, exchange it for a token targeting `74658136-14ec-4630-ad9b-26e160ff0fc6`, then POST to `https://main.iam.ad.ext.azure.com/api/Policies/` with a JSON payload that includes the PowerShell App ID in `servicePrincipals.included.ids`.

## Method 2: Require User Assignment
From Microsoft's EDU documentation:
1. Ensure the PowerShell service principal exists: `Get-AzureADServicePrincipal -Filter "appId eq '1b730954-1685-4b74-9bfd-dac224a7b894'"`
2. If not, create it: `New-AzureADServicePrincipal -AppId $appId`
3. Set assignment required: `Set-AzureADServicePrincipal -ObjectId $sp.ObjectId -AppRoleAssignmentRequired $true`
4. Assign admin users via `New-AzureADServiceAppRoleAssignment`

## Caveats
- Targeting "Azure Management" in CA GUI only blocks `login-azurermaccount`, NOT `Connect-AzureAD` or `Connect-MsolService`
- Targeting "All Cloud Apps" blocks everything but is overly broad
- Test carefully before applying broadly — Autopilot enrollment still works after blocking PowerShell

## Source
- Blog: https://call4cloud.nl/2020/11/the-conditional-access-experiment/
- MS Docs: https://docs.microsoft.com/en-us/schooldatasync/blocking-powershell-for-edu
