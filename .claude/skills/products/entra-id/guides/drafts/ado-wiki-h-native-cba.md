---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/Azure AD Native Certificate Based Authentication"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/StrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)/Azure%20AD%20Native%20Certificate%20Based%20Authentication"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Azure AD Native Certificate Based Authentication (CBA)

## Summary
Native cloud CBA allows authentication using X.509 certificates against Enterprise PKI, eliminating dependency on federated environments (ADFS). Supports SSO after initial CBA sign-in.

## BREAKING CHANGE: Issuer Hints Endpoint Change
Enabling **Issuer Hints** changes endpoint from `certauth.login.microsoftonline.com` to `t{tenantId}.certauth.login.microsoftonline.com`. Organizations with TLS inspection MUST add wildcard exception `*.certauth.login.microsoftonline.com` before enabling.

## Enable CBA
1. Entra Portal → Protection → Authentication methods → Certificate-based authentication
2. Enable and Target tab: All users or Select groups
3. Configure tab: Issuer hints, Protection level, Affinity Binding, Username bindings

## Key Configuration

### Authentication Binding
- **Protection level**: Single-factor or Multi-factor (default binding)
- **Required Affinity Binding**: High or Low (default=Low). ⚠️ Changing to High without proper certificateUserIds locks out entire tenant.
- Custom rules: Bind by issuerSubject, policyOID, or both

### Username Binding
| Certificate Field | User Attributes | Affinity |
|:---|:---|:---:|
| PrincipalName | userPrincipalName, onPremisesUserPrincipalName, certificateUserIds | Low |
| RFC822Name | userPrincipalName, onPremisesUserPrincipalName, certificateUserIds | Low |
| SKI | certificateUserIds | High |
| SHA1PublicKey | certificateUserIds | High |
| IssuerAndSerialNumber | certificateUserIds | High |
| IssuerAndSubject | certificateUserIds | Low |
| Subject | certificateUserIds | Low |

### certificateUserIds Formats
```
X509:<PN>user@contoso.com
X509:<RFC822>user@contoso.com
X509:<SKI>123456789abcdef
X509:<SHA1-PUKEY>123456789abcdef
X509:<I>DC=com,DC=contoso,CN=CA<SR>serialInReverse
X509:<I>DC=com,DC=contoso,CN=CA<S>DC=com,DC=contoso,CN=user
X509:<S>DC=com,DC=contoso,CN=user
```
⚠️ Issuer/Subject/SerialNumber must be in **reverse order** of certificate. Remove spaces after comma delimiters.

## Feature Updates (GA Sep 2022)
1. CRL validation of up to 5 CAs in chain
2. Windows interactive login: Win10 20H1+, Win11 21H2+, Server 2019+ (AADJ and HAADJ with PRT)
3. Non-routable UPN support via certificateUserIds
4. High affinity binding (SKI, SHA1PublicKey)
5. CRL size limit increase (20MB/45MB foreground, 45MB/150MB background)
6. MRU authentication method
7. Improved user account lookup (UPN-based, not certificate-based)
8. Error handling fixes
9. Sign-in log improvements

## CBA Staged Rollout
For federated→managed migration: Enable Certificate-based Authentication in Azure AD Connect → Staged Rollout features. Add groups to participate.

## Mobile Support (Android/iOS)
First party apps, ActiveSync clients, native browsers supported. Microsoft Authenticator required for iOS Office apps.

## Enforcement Logic
- `x509CertificateMultiFactor` does NOT trigger 2FA at sign-in unless resource requires MFA
- If cert doesn't satisfy MFA, SAS tries other registered MFA methods
- policyOID takes priority over issuerSubject
- Conflict between policyOIDs (single vs multi factor) → single factor enforced (most conservative)
- Intermediate CA binding takes precedence over root CA binding

## Trusted CAs Management
- Portal: Security → Certificate authorities → Upload (.cer)
- PowerShell: `Get-AzureADTrustedCertificateAuthority`, `New-AzureADTrustedCertificateAuthority`
- Set CRL and delta CRL distribution points for each CA
