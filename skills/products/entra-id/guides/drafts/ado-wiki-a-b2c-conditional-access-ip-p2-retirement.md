---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD B2C/Azure AD B2C Conditional Access and Identity Protection"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20B2C%2FAzure%20AD%20B2C%20Conditional%20Access%20and%20Identity%20Protection"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure AD B2C - Conditional Access and Identity Protection (P2 Retirement)

## Retirement Timeline

| Date | Event |
|------|-------|
| May 1, 2025 | End of Sale: Azure AD External Identities P2 no longer available to new customers |
| March 15, 2026 | Full service retirement: Identity Protection / P2 license retired |
| March 16, 2026 | Risk signals no longer evaluated in CA policies |

## Impact on Conditional Access Policies

**Q: What happens to existing CA policies that use a P2 condition?**
> The policy will remain but the risk condition will no longer be evaluated. The policy may still trigger based on other (non-risk) conditions.

**Q: What will happen with a current user's risk level once retirement goes into effect?**
> Risk signals are no longer sent or evaluated.

**Q: What CA conditions are impacted?**
> Sign-in risk and user risk policies.

**Q: What happens on March 2026 to tenants actively using P2? Will it be removed or just stop working?**
> TBD (per wiki as of import date).

## PowerShell: Find CA Policies Using Risk Conditions

```powershell
# Connect to Microsoft Graph
Connect-MgGraph -Scopes "Policy.Read.All"

# Get all conditional access policies
$conditionalAccessPolicies = Get-MgIdentityConditionalAccessPolicy

# Filter policies using risky sign-in or user risk conditions
$riskPolicies = $conditionalAccessPolicies | Where-Object {
    $_.Conditions.UserRiskLevels -ne $null -or
    $_.Conditions.SignInRiskLevels -ne $null
}

if ($riskPolicies.Count -eq 0) {
    Write-Output "No conditional access policies found with risky sign-in or user risk conditions."
} else {
    $riskPolicies | ForEach-Object {
        Write-Output "Policy Name: $($_.DisplayName)"
        Write-Output "Policy ID: $($_.Id)"
        Write-Output "Sign-in Risk Level: $($_.Conditions.SignInRiskLevels)"
        Write-Output "User Risk Level: $($_.Conditions.UserRiskLevels)"
        Write-Output "----------------------------------------"
    }
}
```

## Migration Options

Microsoft recommends switching to partner identity verification providers before March 15, 2026:

| Partner | Specialty |
|---------|-----------|
| [Deduce](https://learn.microsoft.com/azure/active-directory-b2c/partner-deduce) | Account takeover & registration fraud prevention |
| [eID-Me](https://learn.microsoft.com/azure/active-directory-b2c/partner-eid-me) | Identity verification for Canadian citizens, IAL2/KYC |
| [Experian](https://learn.microsoft.com/azure/active-directory-b2c/partner-experian) | Risk-based user attribute verification, fraud prevention |
| [IDology](https://learn.microsoft.com/azure/active-directory-b2c/partner-idology) | ID verification, fraud prevention, compliance |
| [Jumio](https://learn.microsoft.com/azure/active-directory-b2c/partner-jumio) | Real-time automated ID verification |
| [LexisNexis](https://learn.microsoft.com/azure/active-directory-b2c/partner-lexisnexis) | Profiling & identity validation, risk assessment |
| [Onfido](https://learn.microsoft.com/azure/active-directory-b2c/partner-onfido) | Document ID & facial biometrics verification |

## Switching to P1 Only

If customer wants to stop using Identity Protection (P2) and switch to P1 billing:
- Follow docs: [Change your Microsoft Entra pricing tier](https://learn.microsoft.com/azure/active-directory-b2c/billing#change-your-microsoft-entra-pricing-tier)

## Public References

- [What's happening to Azure AD B2C and Azure AD External Identities?](https://learn.microsoft.com/en-us/entra/external-id/customers/faq-customers#whats-happening-to-azure-ad-b2c-and-azure-ad-external-identities)
- [B2C Partner Gallery - Identity Verification](https://learn.microsoft.com/azure/active-directory-b2c/partner-gallery#identity-verification-and-proofing)
