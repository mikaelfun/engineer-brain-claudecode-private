---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Windows 365 Government/Windows 365 Government Guidelines and Troubleshooting/Restricted and Unrestricted Data"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Windows%20365%20Government/Windows%20365%20Government%20Guidelines%20and%20Troubleshooting/Restricted%20and%20Unrestricted%20Data"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Restricted and Unrestricted Data for Government

It is not the responsibility of CSS personnel to define what data is restricted vs unrestricted. It's important to be aware of these differences because of the unique, secure process for accessing restricted data.

## Restricted Data

- **Customer content**: Data stored in cloud (mailbox content, Azure VM hard drive, Azure SQL data)
- **Customer Data from Fairfax**: Cannot be exposed (escort session or ACIS action) without explicit written customer consent
- **Access control data**: Secrets, passwords, certificates
- **EUII**: Log files, IP addresses, user names, CPC UPN, etc.

**Note**: Tenant ID is NOT restricted data (Microsoft-supplied).

## Unrestricted Data

Tenant level information and Microsoft generated GUIDs:
- Tenant ID, Device ID, User ID, Policy ID, AAD ID, Session ID, etc.

## Access Scenarios for Restricted Data

1. **Customer grants access directly** — e.g., customer submits log file or screenshot to Support Engineer
2. **Access via Escort Session** — Temporary access supervised by data trustee (Lockheed Martin for Azure Government), monitored for duration of support incident only

**IMPORTANT**: Escort sessions are NOT transferable. If an Escort session is needed, open an ICM for SaaF to escalate to Engineering. Engineering opens the session; we partner with them for customer info.

## ICM Rules for Government

- No attachments containing customer data
- No support data in ICM body
- No User Principal Names (UPN) or PII
