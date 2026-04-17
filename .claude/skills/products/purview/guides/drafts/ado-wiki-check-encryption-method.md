---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/Purview Message Encryption/How to: Purview Message Encryption/How To: Check Encryption Method"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=/Purview%20Message%20Encryption/How%20to%3A%20Purview%20Message%20Encryption/How%20To%3A%20Check%20Encryption%20Method"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How To: Check Encryption Method

**Purpose**: Help engineers understand the various encryption methods used within Microsoft Information Protection (MIP) and know what to collect and troubleshoot when working encryption-related cases.

## Encryption Methods Summary

- **Manual Encryption** (Client Side only)
  - Via "Sensitivity" Button / Bar
  - Via "Encrypt" Button (Outlook/OWA only - uses Templates, not Labels)
  - Via File > Info > Encrypt (Desktop apps only)

- **Non-Manual Encryption**
  - Default Label (Client + Server Side)
  - Exchange Transport Rule / ETR (Server Side only)
  - DLP (Server Side for encryption)
  - Auto Labeling
    - Client-side: condition set on the label itself, applied/recommended in client apps
    - Server-side: condition set via Auto Labeling Policy, applied in transit/on upload

## How to Check Each Method

### Manual Encryption
- Check `msip_labels` header in message headers for Labels (look for "Privileged" = manual)
- For Templates (EO/DNF): Check `X-MS-Exchange-Organization-OmeEncryptionMethod` header
- Template ID: `Microsoft.Exchange.RMSApaAgent.ProtectionTemplateId` header

### Default Label
- Run `(Get-LabelPolicy TestPolicy).Settings` to see default labels per workload:
  - `outlookdefaultlabel` — Outlook
  - `defaultlabelid` — Files
  - `siteandgroupdefaultlabelid` — Sites/Groups
  - `powerbidefaultlabelid` — PowerBI
  - `teamworkdefaultlabelid` — Meetings
- If default label not applied: collect Label & Policy config, compare across apps, check with HAR/Fiddler trace

### ETR Encryption
- Collect Extended Message Trace (EMT)
- Search for `S:TRA=` in custom data field
- If ETR not applying encryption:
  - Check rule conditions
  - Check encryption service enabled: `Get-AipServiceConfiguration | FL *functionalState*` (both Enabled)
  - Check EXO: `Get-IRMConfiguration | FL *LicensingEnabled*` (all True)

### DLP Encryption
- Collect EMT, search `S:TRA=`, look for DLP action entries
- If DLP not encrypting:
  - Check policy scope/restrictions (PowerShell)
  - Check SIT confidence level and count vs EMT data
  - Test content against SIT in Purview Portal > DLP > Classifiers

### Auto Labeling
- **Client-side**: Condition set on label's "Auto-labeling for files and emails" section
  - Published via normal Label Policy, applied in client when condition met
- **Server-side**: Condition set in Auto Labeling Policy
  - Applied in transport (EXO) or on file upload/indexing (SPO)

## Key Distinctions
- Labels vs Templates: Labels are sensitivity labels; Templates (EO, DNF) are the encryption component within labels
- Client-side vs Server-side: Client = applied in the app; Server = applied in transit/on server
- Transport rules cannot use Labels directly — they use Templates
