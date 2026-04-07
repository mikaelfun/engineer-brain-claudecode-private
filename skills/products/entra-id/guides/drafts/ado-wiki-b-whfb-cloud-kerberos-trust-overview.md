---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/WHfB/WHFB: Cloud Kerberos Trust/Feature description"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FWindows%20Hello%20and%20Modern%20Credential%20Providers%2FWHfB%2FWHFB%3A%20Cloud%20Kerberos%20Trust%2FFeature%20description"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# WHfB Cloud Kerberos Trust (CKT) - Feature Overview

## Overview
Cloud Kerberos Trust (CKT) is a deployment model for Windows Hello for Business in Azure AD joined and Hybrid Azure AD joined environments. It uses the same authentication flow as FIDO2 security keys.

**Key Goals:**
- Converged deployment experience for enterprise passwordless features
- Simplified deployment (no PKI/certificate authority needed)
- Remove key-sync delay present in key trust deployments

## Background
WHfB supports three deployment models:
- **Key Trust**: RSA key pair provisioned, public key registered with AD and Azure AD
- **Certificate Trust**: Certificate enrolled for RSA key pair, cert-based auth for AD
- **Cloud Kerberos Trust (CKT)**: New model replacing key trust. Uses same architecture as FIDO2 security keys

**CKT uses the same flow as FIDO2** - most troubleshooting steps are equivalent.

## How Authentication Works
1. Azure AD prelogon is performed (front-loading Azure AD authentication)
2. A partial TGT is obtained from Azure AD
3. Partial TGT is exchanged for a full TGT via TGS_REQ to on-premises DC
4. This is equivalent to RODC TGT exchange (not AS_REQ as in key/cert trust)
5. No DC certificate validation required (removes PKI dependency)

**Important Notes:**
- Cloud Trust is opportunistic and will prioritize Key Trust certs if available
- For HAADJ: checks for partial TGT before provisioning (ensures Azure AD Kerberos is set up)
- For AADJ: partial TGT check is not done (not needed for unlock)
- Switching from key trust to cloud trust: first sign-in needs DC line of sight (cache not usable with new flow)
- Check OnPremTgt state (not Cloud TGT, which is for Azure Files only)

## Cached Login
- After initial authentication to DC, cache is hydrated for future authentications
- Unlock and sign-in use cache, then refresh PRT and TGT in background

## Infrastructure Requirements

| Requirement | Cloud Kerberos Trust |
|-------------|---------------------|
| Windows Version | Windows 10 21H2 + KB5010415; Windows 11 + KB5010414; or later |
| Schema Version | No specific requirement |
| Domain/Forest Level | Windows Server 2008 R2+ |
| DC Version | Windows Server 2016+ |
| Certificate Authority | N/A |
| AD FS | N/A |
| MFA | Azure MFA tenant, or AD FS with MFA adapter |
| Azure AD Connect | N/A |
| Azure AD License | Azure AD Premium (optional) |

## Supported Scenarios
- AADJ and WPJ logon + SSO to on-premises resources
- HAADJ logon + SSO to Azure resources
- Azure MFA / Conditional Access
- Secondary certificates (S/MIME, WIFI, VPN)
- WebAuthn Keys
- Destructive and non-destructive PIN reset

## Unsupported Scenarios
- Domain Joined only deployment (no plan to support)
- RDP on HAADJ devices
- Authentication Mechanism Assurance
- TLS Client Authentication (no plan to support)
- Password change using WHfB

## Limitations
- CKT is incompatible with certificate trust. If cert trust policies are set, they take precedence.
