---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD MFA/Azure MFA Source of MFA"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Authentication/Azure%20AD%20MFA/Azure%20MFA%20Source%20of%20MFA"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Sources of MFA

## Summary

Logging will provide an explanation of why MFA was prompted for interactively (expiry of current MFA) or MFA was satisfied (with no interactive prompt).

These values can be seen in the ASC Authentication Troubleshooter when viewing the "PerRequestLogs" table under the "Expert View".

### SourcesOfMfaExpiry

This field will indicate why a passed MFA claim was not valid to suffice the MFA requirement.

| Value | Description |
|---|---|
| CompanyStrongAuthenticationDetails | Remember MFA |
| TenantTokenLifetimePolicy | Configurable token life time policy - per app |
| AudienceTokenLifetimePolicy | Configurable token life time policy - tenant level policy |
| SignInFrequency | Conditional Access signin frequency |

### MFA Status

| Log Message | Explanation |
|---|---|
| RequireMfaInCloud = 1 | MFA prompt served by ESTS. "MFA required in Azure AD" |
| RequireMfaAtExtIdP = 2 | ESTS redirected to external IdP to satisfy MFA. "Redirected to external identity provider for MFA" |
| MfaDoneInCloud = 3 | MFA requirement served by ESTS. "MFA completed in Azure AD" |
| MfaDoneAtExtIdP = 4 | MFA satisfied by external IdP claim. "MFA requirement satisfied with a claim provided by external identity provider" |
| SkipMfaDueToIcn = 9 | MFA skipped because ADFS issued InsideCorpNet claim and tenant configured to skip MFA if present |
| SkipMfaDueToIP = 10 | MFA skipped because user IP was whitelisted for MFA |

### SourcesOfMfaRequirement

| Value | Description |
|---|---|
| MsLogonSetting | MFA required for Sign In (per user MFA Enabled/Enforced) |
| MSLoginRiskPolicy | MFA required by Azure AD Identity Protection - Sign In Risk Policy |
| MSAppRule | MFA required by MSOnline module or Conditional Access Policy |

### SourcesOfMfaSatisfied

| Value | Description |
|---|---|
| SuccessfullyCompletedMfa_Cloud_Phone | MFA completed via Phone Call |
| SuccessfullyCompletedMfa_Cloud_SMS | MFA completed via SMS OTP |
| SuccessfullyCompletedMfa_Cloud_PhoneApp_Notification | MFA completed via Authenticator Push |
| SuccessfullyCompletedMfa_Cloud_PhoneApp_OTP | MFA completed via Authenticator OTP |
| SuccessfullyCompletedMfa_ExtIdP_Federated | MFA completed via external IdP |
| SuccessfullyCompletedMfa_Cloud_HardwareOath | MFA completed via Hardware OATH Token |
