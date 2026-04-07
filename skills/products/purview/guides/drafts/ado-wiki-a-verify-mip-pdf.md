---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/Sensitivity Labels/How to: Sensitivity Labels/How To: Verify Microsoft Information Protection of a PDF"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FSensitivity%20Labels%2FHow%20to%3A%20Sensitivity%20Labels%2FHow%20To%3A%20Verify%20Microsoft%20Information%20Protection%20of%20a%20PDF"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How To: Verify Microsoft Information Protection of a PDF

## Introduction

There may be times when one needs to determine the encryption state of a PDF file. PDF files are not as easy to inspect as Office documents.

## The Easy Way: Get-FileStatus

As long as a user has at least `view` rights to the content, the Microsoft Purview Information Protection (MPIP) client PowerShell cmdlet `Get-FileStatus` will show encryption information.

- The `RMSOwner` field shows the account that applied the protection.
- Works for both SharePoint Online and on-premises SharePoint (via RMS Connector) protected PDFs.

## The Harder Way: Manual Notepad Inspection

### SharePoint Online vs On-Premises Comparison

| Area | SharePoint Server (On-Premises) | SharePoint Online |
|------|------|------|
| RMS backend | AD RMS or RMS Connector | Azure Rights Management (Purview Information Protection) |
| Encryption model | Legacy Microsoft IRM PDF encryption | Modern ISO-standard PDF IRM v2 |
| PDF format | `%PDF-1.7` with Microsoft-specific IRM filter embedded directly | `%PDF-2.0` wrapper PDF with RMS-encrypted PDF embedded as Associated File |

### SharePoint Online (Modern) Verification

1. Right-click the PDF file → Open with → Notepad.
2. Look for: `%PDF-2.0`, `/AF` + `/EmbeddedFiles`, `MicrosoftIRMServices Protected PDF.pdf`
3. These alone confirm the file is RMS-protected by SPO.

### On-Premises SharePoint (Legacy) Verification

1. Open PDF in Notepad.
2. **Step 1**: Confirm `%PDF-1.7` header (standard ISO 32000-1 format).
3. **Step 2**: Search for `/Encrypt` → confirms document-level encryption.
4. **Step 3**: Find the referenced encryption object (e.g., `55 0 obj`).
5. **Step 4**: Look for `/Filter /MicrosoftIRMServices`, `/MicrosoftIRMVersion 1`, `/PublishingLicense`.

If all present → file is definitively RMS-protected.

## Key Notes

- **Edge may fail to open RMS-protected PDFs** from a different organization. This is expected behavior, not corruption.
- **RMS licensing URL is NOT stored in readable form** inside the PDF. Tenant/licensing info is resolved dynamically at open time and cannot be extracted offline.
- An **RMS-enabled PDF viewer with network access** is required to determine the licensing authority.
