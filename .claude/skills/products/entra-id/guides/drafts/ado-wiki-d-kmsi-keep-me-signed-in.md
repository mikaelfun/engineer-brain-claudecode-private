---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Authentication General/KMSI (Keep me Signed in)"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Authentication%20General%2FKMSI%20(Keep%20me%20Signed%20in)"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# KMSI (Keep Me Signed In)

## Summary

Keep me signed in (KMSI) is a feature available for any modern authentication clients including web browsers. It is intended to improve the end user experience by minimizing prompts for authentication. The prompt to stay signed in appears to end users after authentication.

If a user responds with **Yes** to the KMSI prompt, most subsequent attempts to access Azure AD will not prompt for credentials during the existing browser session or a close/relaunch of the browser.

Exceptions where user will be prompted despite selecting KMSI:
- Password change invalidates session token
- Fresh logon required via `prompt=login` parameter (OAuth 2.0 authorization code flow)
- MFA session validity expires, and MFA needs to be done again

**Note**: This article covers KMSI in Azure AD only. AD FS KMSI and B2C KMSI are out of scope.

## What does KMSI do

When a user responds to a KMSI prompt with **YES**, a refresh token is saved as a session token. This lasts 90 days by default. Every time the user navigates back to Azure AD, the session token is extended with a new lifetime.

## How to configure

See [Configure the 'Stay signed in?' prompt for Azure AD accounts](https://docs.microsoft.com/en-us/azure/active-directory/fundamentals/keep-me-signed-in).

## When to disable KMSI

Scenarios that benefit from KMSI:
- No PRT available on device (pre-requisites for device registration not complete)
- Using third party browsers or apps that don't use PRT (e.g. Chrome/Brave without SSO extension)

Turning off KMSI is tenant-wide and impacts all users and all apps. A better alternative is using persistent browser session controls via Conditional Access to block KMSI for select users. See [Configure authentication session management with CA](https://docs.microsoft.com/en-us/azure/active-directory/conditional-access/howto-conditional-access-session-lifetime#policy-2-persistent-browser-session).

## KMSI in Sign-in Logs

KMSI prompt interaction is tracked as **error code 50140** in sign-in logs. This is not a real error — it's a stage in the authentication flow requiring user decision.

## KMSI Under the Covers

Use the **KMSIInterruptReason** and **KMSI** columns (from **PerRequestTableIfx**) to determine whether ESTS decided to show a KMSI prompt and the end user's response. Available via Kusto, LogsMiner, or ASC sign-in diagnostics tab.

### KMSI Flags Enum

| Flag | Value | Description |
|------|-------|-------------|
| KmsiCheckbox | 0x1 | User checked KMSI checkbox on AAD |
| IdpExp | 0x2 | IDP sent KMSI flags (MSA related) |
| Psso | 0x4 | IDP sent PSSO claim |
| InCorpNet | 0x8 | IDP sent Inside Corporate Network claim |
| Bsso | 0x10 | Sign-in due to BSSO |
| BrandingDisabled | 0x20 | KMSI disabled by tenant branding |
| SystemWebView | 0x40 | KMSI from SystemWebView on iOS/Android |
| KmsiInterrupt | 0x80 | KMSI interrupt shown |
| KmsiInterruptYes | 0x100 | User selected Yes on KMSI interrupt |
| KmsiInterruptNo | 0x200 | User selected No on KMSI interrupt |
| DontShowKMSIAgain | 0x400 | User selected "Don't show again" |

### KmsiInterruptReason Flags Enum

| Flag | Value | Description |
|------|-------|-------------|
| NoInterruptDueToDontShowKMSIAgain | 1 | "Don't show again" was selected previously |
| InterruptShown | 2 | KMSI interrupt shown, all conditions met |
| NoInterruptDueToNoCreds | 4 | No credentials in use |
| NoInterruptDueToSSO | 8 | SSO credential in use |
| NoInterruptDueToDSSO | 16 | DSSO credential in use |
| NoInterruptDueToWIA | 32 | WIA at ADFS |
| NoInterruptDueToGuestUser | 64 | User is guest |
| NoInterruptDueToRiskScore | 128 | User risk score >= RamActionSessionRiskMedium |
| NoInterruptShown | 256 | No KMSI interrupt shown |
| UserIdentifierInBrowserIdCookieDifferentFromCurrent | 512 | Different user in browser ID cookie |
| FirstLoginDiffNotSufficient | 1024 | First login less than configured min login diff |
| NoUserIdentifierInBrowserIdCookie | 2048 | No user in browser ID cookie → show interrupt |
| NoInterruptDueToConsent | 4096 | Consent credential in use |
| NoInterruptDueToAdminConsent | 8192 | Admin consent flow |
| NoInterruptDueToPersistentBrowserSessionMode | 16384 | Persistent browser session CA policy |
| NoInterruptDueToManagedBrowserPurposeToken | 32768 | SSO via Managed Browser purpose token |
| NoInterruptDueToMsaFederation | 65536 | MSA federation (has own KMSI logic) |

### Decoding KMSI values

- **256 (0x100)** = KmsiInterruptYes (user said Yes)
- **512 (0x200)** = KmsiInterruptNo (user said No)
- **1536 (0x600)** = DontShowKMSIAgain (0x400) + KmsiInterruptNo (0x200)

### Sample Kusto Query — Track KMSI History

```kql
// KMSI history for a user over last 30 days
// Cluster: estsam2.kusto.windows.net | DB: ESTS
AllPerRequestTable
| where env_time >= ago(30d)
| where PUID == "<PUID>"
| where Call == "kmsi:kmsi"
| project env_time, Call, CorrelationId, DevicePlatform, BrowserType,
    ApplicationDisplayName, ResourceDisplayName, KMSIInterruptReason, Kmsi, Result, UserAgent, ITData
```

### Session Token Verification

If KMSI was responded YES, subsequent requests will have **ITData** (incoming token data) in **PerRequestTableIfx** confirming session token receipt. In LogsMiner, check the **credentials** tab for session token use.

### Persistent Browser Session CA Policy Interaction

If CA policy "persistent browser session" is configured, it can influence KMSI behavior. The KMSI column will show **NoInterruptDueToPersistentBrowserSessionMode**.

## Troubleshooting Approach

1. Is the case about **not getting KMSI** or **getting KMSI when unexpected**? Note in case notes.
2. Can customer reproduce on demand? If yes, collect Fiddler trace.
3. Regardless of reproducibility, gather:
   - Impacted UPNs
   - Date/time (UTC) when KMSI prompt appeared or didn't
   - If Windows 10: does user have a PRT?
   - Impacted app: browser or rich client? (browser name, VPN client, etc.)
   - Platform: PC/Mac or mobile (Android/iOS)
   - If mobile: using Microsoft Authenticator or Company Portal as broker?
4. Review sign-in logs using ASC Diagnostic or LogsMiner.
5. If unable to resolve, involve TA/SME and escalate.

## Escalation

- Support Engineers: use [ICM template 83L3k1](https://portal.microsofticm.com/imp/v3/incidents/cri?tmpl=83L3k1)
- Technical Advisors forward ICM to:
  - **Owning Service**: ESTS
  - **Owning Team**: Incident Triage
