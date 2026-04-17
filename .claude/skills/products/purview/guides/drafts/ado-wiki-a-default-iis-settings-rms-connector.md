---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/RMS Connector/Learn: RMS Connector/Learn - Default IIS Settings"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FRMS%20Connector%2FLearn%3A%20RMS%20Connector%2FLearn%20-%20Default%20IIS%20Settings"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Default IIS Settings for RMS Connector

## Introduction

When it comes to IIS and the RMS Connector, in a perfect world one would use the RMS Connector installer and let that configure IIS. After installation one may bind a certificate in IIS for SSL. Other than that, no one would ever change anything in IIS on the connector. Do not change the authentication settings.

## IIS Settings

### SSL Settings

In IIS, under _Default Web Site_, select `SSL Settings`.

Default settings:
- Require SSL: **Unchecked**
- Client Certificates: **Ignore**

### Authentication

The authentication settings start at the _Default Web Site_ and through the child objects under that.

| Level | Enabled Authentication |
|-------|----------------------|
| Default Web Site | Anonymous Authentication only |
| Bin | Windows Authentication only |
| Certification | Windows Authentication only |
| Licensing | Windows Authentication only |

## NTFS Permissions

**Never, ever, ever** alter the NTFS permissions on the RMS Connector's service files.

The most common files customers modify (based on old AD RMS documentation):
- `ServerCertification.asmx` in the Certification pipeline
- `License.asmx` in the Licensing pipeline

### Default file locations
- RMS Connector IIS files: `C:\Program Files\Microsoft Rights Management connector\Web Service`
- ServerCertification.asmx: `C:\Program Files\Microsoft Rights Management connector\Web Service\certification\ServerCertification.asmx`
- License.asmx: `C:\Program Files\Microsoft Rights Management connector\Web Service\licensing\License.asmx`

### Default NTFS Permissions
Both `ServerCertification.asmx` and `License.asmx` have the same file permissions:
- `ALL APPLICATION PACKAGES`, `ALL RESTRICTED APPLICATION PACKAGES`, and `Users` have `Read` and `Read & execute` permissions.
- `SYSTEM` and `Administrators` are granted more, as expected.
