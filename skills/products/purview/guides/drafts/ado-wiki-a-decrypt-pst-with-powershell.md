---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/MPIP Client/How to: MPIP Client/How To: Decrypt a PST with PowerShell"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FMPIP%20Client%2FHow%20to%3A%20MPIP%20Client%2FHow%20To%3A%20Decrypt%20a%20PST%20with%20PowerShell"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# How To: Decrypt a PST with PowerShell

## Introduction

The Microsoft Purview Information Protection (MPIP) client includes a PowerShell module, `PurviewInformationProtection`. This module contains cmdlets that may remove protection from content contained in a PST.

PST files are containers. A PST file itself does not support being labeled. When properly configured, the `PurviewInformationProtection` cmdlets may affect the contents of the PST file.

> Note: These client PowerShell tools were never intended to be an enterprise level eDiscovery solution.

## Prerequisites

There are MIP label policy configuration requirements and AIP service requirements.
- See [Remove-FileLabel documentation](https://learn.microsoft.com/en-us/powershell/module/purviewinformationprotection/remove-filelabel?view=azureipps#-removeprotection)

### MIP Label Policy

The following advanced label policy setting must be configured. This must be set on the **highest priority policy** published to the user running the cmdlets:

`EnableContainerSupport` — See the [documentation](https://learn.microsoft.com/en-us/powershell/exchange/client-advanced-settings?view=exchange-ps#enablecontainersupport) for setting this.

### AIP Service

The user attempting to remove the protection must have rights to do so. Configure an [AIP Service Super User](https://learn.microsoft.com/en-us/azure/information-protection/configure-super-users) for this purpose.

When configuring this, add the user's UPN address to the feature.

## Remove-FileLabel

Use the `Remove-FileLabel` cmdlet with the [-RemoveProtection](https://learn.microsoft.com/en-us/powershell/module/purviewinformationprotection/remove-filelabel?view=azureipps#-removeprotection) parameter.

```powershell
Remove-FileLabel C:\Projects\Analysis.docx -RemoveProtection

FileName                   Status Comment
--------                   ------ ------------
C:\Projects\Analysis.docx  Success
```

In this case the file would be the PST.

## Limitations

- The maximum supported PST file size is **5 GB**.
- An AIP Service super user may only decrypt content protected by **its own tenant**. Emails encrypted by external tenants cannot be decrypted.
