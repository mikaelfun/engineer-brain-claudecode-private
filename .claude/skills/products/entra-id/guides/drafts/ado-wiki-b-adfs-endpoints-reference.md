---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/ADFS and WAP/ADFS Deep Dives - Features explained/ADFS Endpoints - Purpose"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FADFS%20and%20WAP%2FADFS%20Deep%20Dives%20-%20Features%20explained%2FADFS%20Endpoints%20-%20Purpose"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# ADFS Endpoints - Purpose and Reference

> **CRITICAL**: Endpoints disabled in Server 2016 carry over to Server 2019+ during FBL upgrade, potentially causing service outage (idpinitiatedsignon, WAP trust failure, Event ID 54).

## Protocol Types
| Type | Description |
|---|---|
| WS-Mex | Metadata exchange for WS-Trust clients |
| SAML 2.0/WS-Federation | Browser-based redirect flows |
| WS-Trust 1.3 | Current SOAP-based token issuance (no MFA - not browser based) |
| WS-Trust 2005 | Pre-standard SOAP token issuance |
| Federation Metadata | Standard metadata exchange format |
| OAuth | OpenID Connect / OAuth2 endpoints |

## Credential Types
| Type | Description |
|---|---|
| Windows | Kerberos or NTLM credential |
| Kerberos | Kerberos only |
| Password | Username/password (most common) |
| Client Certificate | Smartcard, software keys |
| Anonymous | No user auth or passive browser flows |

## Security Modes
| Mode | Description |
|---|---|
| Transport | Client creds at transport layer (SSL/TLS) |
| Mixed | Client creds in SOAP header, confidentiality via SSL/TLS |
| Message | HTTP with encrypted creds. **Disabled by default.** Avoid in production. |

## Required Endpoints for Server 2019+ (MUST be enabled)

| Path | Protocol | CredentialType | SecurityMode | Purpose |
|---|---|---|---|---|
| /adfs/services/trust/mex | WS-Mex | Anonymous | Transport | Metadata exchange, WS-Trust discovery |
| /adfs/ls/ | SAML 2.0/WS-Fed | Anonymous | Transport | Browser auth, Office/M365 authentication |
| /adfs/services/trust/2005/windowstransport | WS-Trust | Windows | Transport | Windows integrated auth, device registration |
| /adfs/services/trust/2005/windowsmixed | WS-Trust | Windows | Mixed | - |
| /adfs/services/trust/2005/certificatemixed | WS-Trust | ClientCert | Mixed | Certificate auth, federated PRT acquisition |
| /adfs/services/trust/2005/certificatetransport | WS-Trust | ClientCert | Transport | - |
| /adfs/services/trust/2005/usernamemixed | WS-Trust | Password | Mixed | Exchange Online with older Office clients |
| /adfs/services/trust/2005/kerberosmixed | WS-Trust | Kerberos | Mixed | - |
| /adfs/services/trust/13/windowstransport | WS-Trust 1.3 | Windows | Transport | - |
| /adfs/services/trust/13/certificatemixed | WS-Trust 1.3 | ClientCert | Mixed | - |
| /adfs/services/trust/13/usernamemixed | WS-Trust 1.3 | Password | Mixed | - |
| /adfs/services/trust/13/kerberosmixed | WS-Trust 1.3 | Kerberos | Mixed | - |

## Post-FBL Upgrade Checklist
1. Run `Get-AdfsEndpoint` to review all endpoints
2. Compare against Required column above
3. Enable any required endpoints that are disabled:
   ```powershell
   Set-AdfsEndpoint -TargetAddressPath "/adfs/ls/" -Proxy $true
   Enable-AdfsEndpoint -TargetAddressPath "/adfs/services/trust/mex"
   ```
4. Restart ADFS service after changes
