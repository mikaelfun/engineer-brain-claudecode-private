---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Windows 365 Government/Identify Government tenant type"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FFeatures%2FWindows%20365%20Government%2FIdentify%20Government%20tenant%20type"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Identify Windows 365 Government Tenant Type

## Assist 365 URLs

Access with your `microsoftsupport.com` account:
- **GCC and FedRAMP**: https://assist.microsoft.com/
- **GCCH**: https://assist.office365.us/

> If you access the case/tenant using the incorrect link, you will receive an error.

## Method 1: Check Licenses

In Assist 365: Tenant > Subscriptions > search for "Windows 365"

| Tenant Type | SKU Name Contains |
|-------------|------------------|
| GCCH | Windows 365 Government |
| GCC | Windows 365 Government (GCC) |
| FedRAMP | Windows 365 Enterprise for FedRAMP |

## Method 2: Check Tenant Details

In Assist 365: Tenant > Details > Configuration details

### GCCH
| Configuration | Value |
|--|--|
| Tenant type | GCC High |

### GCC
| Configuration | Value |
|--|--|
| Company tags | servicescope.microsoft.com/ServiceScope=GCC, gcc.microsoft.com/gcc=approved |
| Tenant type | Multi-Tenant |

### FedRAMP
| Configuration | Value |
|--|--|
| Company tags | windows365.microsoft.com/TenantSU=PRNA01, servicescope.microsoft.com/ServiceScope=GCC, gov.microsoft.com/gov=approved |
| Tenant type | Multi-Tenant |

## Government Support Rules (Internal)

- Enterprise only
- Windows 10 only until further notice (no upgrade path)
- **Escort Sessions**: Send to Dev via ICM to open escort session (not transferable). Bridge with OCE if needed.
- **GCCH**: Cannot paste Kusto data in notes, ICM, or email
- Gov Kusto queries cannot go into dashboard
- Do not tell/show customers about capacity issues or that "backend is broken"
- Never volunteer team member locations
- PME account setup: https://oneidentity.core.windows.net/User (from SAW)
