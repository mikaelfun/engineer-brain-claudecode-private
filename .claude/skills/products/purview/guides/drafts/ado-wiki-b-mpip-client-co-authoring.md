---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/MPIP Client/Learn: MPIP Client/Learn: Co-Authoring"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FMPIP%20Client%2FLearn%3A%20MPIP%20Client%2FLearn%3A%20Co-Authoring"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Learn: MPIP Client Co-Authoring for Sensitivity Labels

Official documentation: https://learn.microsoft.com/en-us/purview/sensitivity-labels-coauthoring

> ⚠️ **Support guidance**: Do NOT recommend customers to enable co-authoring. This is a **tenant-wide setting** with many prerequisites and significant consequences regarding metadata location changes. Always ensure customers fully understand the implications before proceeding.

## What is Co-Authoring?

Co-authoring for files encrypted with sensitivity labels enables real-time collaboration on labeled/encrypted Office documents. Enabling this setting changes the **metadata format and location** for Word, Excel, and PowerPoint files.

## How enabling co-authoring affects existing documents

- **Newly labeled files**: Only the new format and location is used for labeling metadata
- **Already labeled files**: The next time the file is opened and saved, metadata in old format/location is copied to the new format/location

> Reference: [Upcoming Changes to Microsoft Information Protection Metadata Storage](https://techcommunity.microsoft.com/t5/security-compliance-and-identity/upcoming-changes-to-microsoft-information-protection-metadata/ba-p/1904418)

## How to check if co-authoring is enabled on the tenant

Co-Authoring setting is visible in the tenant's policy in the Purview Compliance portal.

**Check via PowerShell:**
```powershell
Get-PolicyConfig | fl EnableLabelCoauth
```

**In the MPIP client logs**, search for co-authoring state:

| Co-authoring state | Meaning |
|-------------------|---------|
| `NotEnabled` | Co-authoring turned off by policy or `EnableCoAuthoring` advanced property is false |
| `NotSupported` | Office version not compatible — bootstrap will fail, user will not see labels |
| `Initialized` | Co-Authoring mode is active |

## How to check if the Office version supports Co-Authoring

Validate against the Office prerequisites: https://learn.microsoft.com/en-us/microsoft-365/compliance/sensitivity-labels-coauthoring?view=o365-worldwide#prerequisites

- **Compatible Office version** → logs show co-authoring state as `Initialized`
- **Incompatible Office version** → logs show `NotSupported`

## EnableCoAuthoring advanced property

- `EnableCoAuthoring` is set to **true** by default
- This property exists to disable co-authoring in case of catastrophic failure
- **Internal only** — do NOT turn it off unless instructed by dev team

## How to disable (opt-out) co-authoring

> **Note: Opt-out is support-guided self-service. No DLP OCE involvement expected unless cmdlet failures observed.**

```powershell
# Disable co-authoring
Set-PolicyConfig -EnableLabelCoauth $False

# Re-enable
Set-PolicyConfig -EnableLabelCoauth $True

# Check current setting
Get-PolicyConfig | fl EnableLabelCoauth
```

> ⚠️ **Warning from Office team**: This change is very disruptive. May cause customer documents to appear unlabeled or show different labels across Office Clients, Web Apps, SPO, etc. This behavior may repeat if co-auth is re-enabled after disabling. **Always work with support to understand all implications before proceeding.** Reference: https://docs.microsoft.com/en-us/microsoft-365/compliance/sensitivity-labels-coauthoring?view=o365-worldwide#how-to-enable-co-authoring-for-files-with-sensitivity-labels
