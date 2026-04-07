---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Conditional Access Policy/Azure AD Continuous Access Evaluation"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Conditional%20Access%20Policy%2FAzure%20AD%20Continuous%20Access%20Evaluation"
importDate: "2026-04-05"
type: troubleshooting-guide
contentNote: "Original wiki page is 83K chars. Key sections preserved below."
---

# Continuous Access Evaluation (CAE)

## Summary
CAE extends access token (AT) lifetimes to 24 hours without compromising security by leveraging CA policy signals to dynamically adjust session lifetime. If a critical change occurs, the user is redirected back to ESTS for re-evaluation.

### Instant Enforcement Critical Signals
- User account deleted or disabled
- Password changed or reset
- MFA enabled for user
- Admin explicitly revokes all refresh tokens
- Elevated user risk (Identity Protection)

### Supported Services
| Non-Premium | Premium |
|-------------|---------|
| Exchange, SharePoint, Teams, Viva Insights, M365 Admin Center | Exchange, SharePoint, Viva Insights, M365 Admin Center |

### Supported Clients
- Outlook (PC, Mac, iOS, Android) - Build 12624+
- Outlook Web Access, Teams (all platforms), Office (Word/Excel/PowerPoint), SharePoint Online

## Access Token Lifetime Jittering
- Default AT lifetime: variable 60-90 minutes (non-CAE), 20-28 hours (CAE-enabled)
- CTL can override jittering, but CAE overwrites CTL when ON

## Strict Enforcement of Location Policies
Session control: "Strictly enforce location policies" — if RP sees IP not in CA allowed range, RP blocks access.

### Configuration
1. Locations: Include "Any location", Exclude selected trusted locations
2. Grant: Block Access
3. Session: Customize continuous access evaluation → Strictly enforce location policies

### Troubleshooting Strict Enforcement
- Sign-in logs: Check "IP address (seen by Resource)" vs "IP address"
- Logsminer: Look for `SLEv2` in CaAdhoc field → proves strict enforcement blocked sign-in
- ASC: Session control shows `Mode: strictLocation`

## CAE for Service Principals (Workload Identities)
- Opt-in via xms_cc optional claim with value "cp1"
- Opt-out: Don't send xms_cc claim, or create CA policy to disable CAE for SP
- Currently only MS Graph as resource provider
- Feature flag `IssueShortCaeTokenForSP` prevents LLT for SPs during preview

## CAE Migration to CA Policy
- Old "Continuous Access Evaluation (Preview)" blade deprecated
- New: "Customize continuous access evaluation" session control in CA policy
- Migration scenarios depend on prior CAE configuration state

## Case Handling
| Scenario | Support Team | Escalation |
|----------|-------------|------------|
| AT lifetime issues (Free tenant) | AAD Authentication | ICM to ESTS PG |
| LLT failure (AADP tenant) | AAD Authentication | ICM to ESTS PG |
| Resource incorrectly revoked session | AAD Auth + Resource team | ICM to Resource PG |
| Critical change should have blocked but didn't | AAD Auth + Resource team | ICM to Resource PG |

## Kusto Diagnostics
```kql
// PII logs for dynamic rule evaluation
cluster("estswus2").database("ESTSPII").VerboseTracesSecureIfx
| where env_time >= ago(1d)
| where RequestId == "<request-id>"
| project Message
```
Access request: https://aadwiki.windows-int.net/index.php?title=JIT_eSTS_Telemetry_PII_Reader_Access

## Outlook CAE Flight Check
Under File > Options > Experiment, verify these flights are true:
- Microsoft.Office.Identity.RefreshtokenSilentlywithClaims
- Microsoft.Office.Identity.LongLivedTokenSupport
- Microsoft.Office.Identity.ParseClaimsChallenge
- Microsoft.Office.Identity.ServerAuthInfoCacheGate
