---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/Cert Based Auth/CBA: Cert Revocation Lists"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/StrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)/Cert%20Based%20Auth/CBA:%20Cert%20Revocation%20Lists"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# CBA: Certificate Revocation Lists (CRL)

## Overview
CBA uses CRL to validate certificate validity. Admins configure CRL and delta CRL URL paths for each CA. At logon, Entra ID builds a CA chain and checks CRL. If CRL paths are not configured, no revocation checks are performed (not recommended for production).

**No OCSP support** - CRLs are the only means of validating certificates.

## Key Rules
- CRL path must be HTTP based; LDAP is NOT supported
- CRL must be accessible anonymously (no authentication required)
- CRL paths must be manually configured in Entra ID (not auto-populated from CA cert CDP)
- CRL paths must be unique to each CA and signed by associated CA
- Each CA's own cert shows the CRL distribution point for its **issuer**, not its own

## CRL Size Limits

| Download Type | Cloud | Size Limit | Time Limit |
|:---:|:---:|:---:|:---:|
| Foreground | Public | 20MB | 11sec |
| Foreground | Sovereign (US Gov) | 45MB | 11sec |
| Background | Public | 45MB | 45sec |
| Background | Sovereign (US Gov) | 150MB | 45sec |

## CRL Download Behavior

### Foreground Downloads
- Occur when CRL is expired or not in Entra ID cache
- **Will cause login failure** if CRL exceeds size limit or download takes >11sec
- User must retry after failure

### Background Downloads
- Occur when cached CRL is still valid and "next CRL publish" field is available
- Preferred as it ensures cache is ready when user attempts logon
- Happens in the overlap period between "next CRL publish" and "next update"

### Timeline
```
[current time/This Update] ----> [next CRL publish] ----> [next update/expiry]
                                  ^                        ^
                                  |                        |
                           Background download      Foreground download needed
                           window opens              if cache expired
```

## Best Practices
1. Do NOT use short validity periods (shorter than a week) for CRL
2. Publish delta CRL for rapid/recent changes (revocations)
3. Stamp "next CRL publish" field in CRL (Windows Server PKI supports this; Intune Cloud PKI does not)
4. If no internet-accessible CRL for some CAs, leave path blank and use `exemptedCertificateAuthoritiesSubjectKeyIdentifiers` in `crlValidationConfiguration` to exclude specific CAs from CRL checks
