---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/Cert Based Auth/CBA: Data analysis"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/StrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)/Cert%20Based%20Auth/CBA:%20Data%20analysis"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# CBA: Data Analysis

## Approach
Analysis depends on the scenario:
- **Admin issues** (configuring policies in Entra): Review Kusto logs for Graph/Entra portal
- **End user issues** (sign-in/MFA): Review sign-in activity, ASC diagnostics
- **Client-side issues**: Depends on platform (Windows auth scripts vs mobile logs)

Always collect **correlation ID** and **timestamp** for browser-based flow errors.

## Troubleshooting Steps (Native & Federated CBA)

1. Have user close all apps on the device
2. Go to https://myaccount.microsoft.com → **Sign out everywhere**
3. Admin: Azure AD Portal → user account → **Authentication methods** → **Revoke MFA sessions**
4. Admin: PowerShell to invalidate all tokens:
```powershell
Connect-MgGraph User.ReadWrite.All, User.RevokeSessions.All
Revoke-MgUserSignInSession -UserId <userId>
```
5. Wait 5 minutes for replication
6. Check **Audit log** for "Update StsRefreshTokenValidFrom Timestamp"
7. Have user launch app → sign in with certificate
8. Check **Sign-in logs** → filter by Status=Interrupted → check **Authentication Details** tab
9. Examine sign-in event in ASC

## ASC Analysis

### Certificate User IDs
Found on **User Properties** tab → **Credentials** anchor → `certificateUserIds` array.

### X509Certificate Auth Method Policy
Found on **X509Certificate** tab under **Sign-ins** → **Authentication Methods** tab.

### Sign-In Event Analysis
Query using Date (UTC) and Correlation ID. Key sections:

**authenticationDetails**: Shows X.509 Certificate was used
```json
{
  "authenticationMethod": "X.509 Certificate",
  "succeeded": false,
  "authenticationStepResultDetail": "Other"
}
```

**authenticationProcessingDetails**: Shows certificate properties (subject, issuer, serial, thumbprint, binding, auth level)

## Distinguishing Native vs Federated CBA

### PerRequestLogs

| Property | Native CBA | Federated CBA |
|:---|:---|:---|
| ActionId | CertAuth | OrgIdFederation |
| AuthMethods | X509, MultiFactor | X509, X509Federated |
| Call | CertAuth:certauth | OrgIdWsFederation:federation |
| CredValidationMthd | CertAuth or ExchangeActiveSync | N/A |
| OriginalHost | **certauth**.login.microsoftonline.com | login.microsoftonline.com |
| ScenarioId | CertAuth | OrgIdFederation |
| SpecialFlow | CertBasedAuth | Not present |

### Diagnostic Logs - Key Checks

**DataForConditionEvaluation**: 
- Native: `"IsFederatedCertAuthDone":false`
- Federated: `"IsFederatedCertAuthDone":true`

**CRL Checking**: Look in `Login:login` Call diagnostic logs for:
- Certificate thumbprint validation
- Chain validation status
- CRL download from configured paths
- Revocation check results

### User Certificate Verification
Serial number visible in **Login:login** diagnostic logs under "Revocation Check ID" message.

## HTTPS Browser Tracing
- Prefer HAR file over Fiddler
- Use https://hartool.azurewebsites.net/ for HAR analysis
- Fiddler only if requested by SME (follow client cert instructions carefully)
