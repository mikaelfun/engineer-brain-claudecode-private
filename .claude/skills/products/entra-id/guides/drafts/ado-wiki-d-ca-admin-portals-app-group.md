---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Conditional Access Policy/Conditional Access 'Microsoft Admin Portals' app group"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Conditional%20Access%20Policy%2FConditional%20Access%20%27Microsoft%20Admin%20Portals%27%20app%20group"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Summary

A new application group called **Microsoft Admin Portals** is available in conditional access policy management wizard which protects the following Microsoft admin portals:

- Azure portal
- Exchange admin center
- Microsoft 365 admin center
- Microsoft 365 Defender portal
- Microsoft Entra admin center
- Microsoft Intune admin center
- Microsoft Purview compliance portal

Global Administrators and Conditional Access Administrators can configure this under **Target resources** when *Select what this policy applies to* is set to **Cloud apps**.

## Limitations

The **Microsoft Admin Portals** app group applies to interactive sign-ins to the listed admin portals only. Sign-ins to the underlying resources or services like Microsoft Graph or Azure Resource Manager APIs are NOT covered. Those resources are protected by the **Microsoft Azure Management** app.

## Application IDs included in the app group

| Display Name | Application ID | URL |
|-----------|-----------|-----------|
| Azure Portal | c44b4083-3bb0-49c1-b47d-974e53cbdf3c | https://portal.azure.com/ |
| Exchange Admin Center | 497effe9-df71-4043-a8bb-14cf78c4b63b | https://admin.exchange.microsoft.com/ |
| Microsoft 365 Admin Center | 00000006-0000-0ff1-ce00-000000000000 | https://admin.microsoft.com/ |
| Microsoft Intune admin center | | https://intune.microsoft.com/ or https://endpoint.microsoft.com/ |
| Microsoft Purview compliance portal | 80ccca67-54bd-44ab-8625-4b79c4dc7775 | https://compliance.microsoft.com/ or https://security.microsoft.com/ |
| Microsoft Entra Portal | c44b4083-3bb0-49c1-b47d-974e53cbdf3c | https://entra.microsoft.com |
| Microsoft 365 Defender portal | | https://sip.security.microsoft.com/ |

## Known Issues

### Issue 0: Azure Portal in govcloud not protected
During public preview the govcloud appid for Azure Portal was not covered. Fixed at GA (end of September 2023).

### Issue 1: Error AADSTS50076 accessing Security and Compliance
Users navigating to compliance.microsoft.com or security.microsoft.com encounter AADSTS50076 error when Microsoft Admin Portals app group is in CA policy.

**Root Cause**: Security and Microsoft Purview compliance portal (80ccca67) was not yet in the app group but requests a token for Microsoft Admin Center (00000006) which IS in the group, creating a dependency requiring CA evaluation.

**Workarounds**:
1. Have user click OK on the error (possibly twice due to retry bug) - user will then be prompted for MFA
2. Exclude user from the Microsoft Admin Portals CA policy until compliance portal deployment completes

**Permanent fix**: Deployed end of July 2023.

## Key Distinction: Admin Portals vs Azure Management

- **Microsoft Admin Portals** — protects portal UIs only (interactive sign-ins)
- **Microsoft Azure Management** — protects Azure Portal + Azure Resource Manager APIs
- If admin selects Azure Management when they intend to protect all admin portals, suggest using Admin Portals app group instead
