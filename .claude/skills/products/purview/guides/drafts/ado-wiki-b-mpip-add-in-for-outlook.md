---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/MPIP Client/Troubleshooting Scenarios: MPIP Client/Scenario: MPIP Add-in for Outlook issues"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=/MPIP%20Client/Troubleshooting%20Scenarios%3A%20MPIP%20Client/Scenario%3A%20MPIP%20Add-in%20for%20Outlook%20issues"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Microsoft Purview Information Protection Add-in for Outlook (MPIP Add-in for Outlook)

## Overview

The **Microsoft Purview Information Protection Add-in for Outlook** (MPIP Add-in) integrates with Classic Outlook for Windows to apply sensitivity labels from Microsoft Purview. It is supported for **Exchange On-Prem** configurations only. This installation package does **not** include labeling capabilities for Word, Excel, or PowerPoint.

## Prerequisites

### 1. Required licenses
- Microsoft 365 E3/A3/G3 or E5/A5/G5
- Enterprise Mobility + Security E3/E5
- Microsoft 365 F1/F3/F5 Compliance / F5 Sec+Comp

### 2. Minimum Office version
| Channel | Minimum Version |
|---------|----------------|
| Current Channel | 2504 (16.0.18730.20132) |
| Monthly Enterprise Channel | 2503 (16.0.18623.20242) |
| Semi-Annual Channel (Preview) | 2502 (16.0.18526.20330) |
| Semi-Annual Channel | 2408 (16.0.17928.20536) |

### 3. Microsoft Purview Information Protection client
- Version **3.0.105.0 or above**

### 4. Latest version of MPIP Add-in for Outlook
- Download from: https://microsoft.sharepoint.com/sites/MPIPPreviews/Shared%20Documents/Forms/AllItems.aspx?id=%2fsites%2fMPIPPreviews%2fShared%20Documents%2fMPIP%20Installation%20Package%2fMPIP%20Installation%20%5BDownload%5D

### 5. Role requirements
- Compliance administrator or Global administrator role in Entra ID portal

## Installation Instructions

1. **Get installation package** via the `AIPException@microsoft.com` alias — distributes:
   - `MPIP_Addin_Installation_Package.zip` (contains `PurviewInfoProtectionAddin.exe` and `.msi`)
   - `MPIP Add-in — Reference Guide`

2. **Upgrade Office apps** to the minimum supported version listed above.

3. **Install the Microsoft Purview Information Protection client** (removes AIP UL v2.x client prior to installation).
   - Download: https://www.microsoft.com/en-us/download/details.aspx?id=53018
   - Release notes: https://learn.microsoft.com/en-us/purview/information-protection-client-relnotes

4. **Configure registry keys**:

   - **Enable MPIP Add-in as default labeling solution for Outlook** (Exchange On-Prem users):
     ```
     HKCU:\Software\Microsoft\Office\16.0\Common\Security\Labels\AIPException = 1 (DWORD)
     ```

   - **Remove this key if present** (Exchange On-Prem users — this key overrides AIPException):
     ```
     HKCU:\Software\Microsoft\Office\16.0\Common\Security\Labels\UseOfficeForLabelling
     ```
     > Note: For users NOT on Exchange On-Prem, set `UseOfficeForLabelling = 1` to prefer MIP Native built-in labeling.

5. **Install MPIP Add-in** on the local machine.

## Verification

After installation, verify the add-in is working:

1. Select **Show Bar** in the Sensitivity icon dropdown to display the sensitivity label bar in Outlook.
2. Apply labels using either the sensitivity dropdown or the sensitivity label bar.
3. Confirm the client version in the Help dialog popup.
4. Go to **Control Panel → Programs and Features** and verify the latest MPIP Add-in version is installed.

## FAQ

**Q: Will existing custom configurations from AIP Add-in for Office be honored?**
- Yes. Custom configurations (AdvancedSettings) previously configured with the AIP Add-in for Office are honored because those settings are configured in the label service.

**Q: Can the MPIP Add-in and AIP Add-in be installed on the same machine?**
- No. Using both simultaneously is not supported.

**Q: No labels displayed in the sensitivity label dropdown or bar — why?**
- Confirm registry keys are configured as described in installation instructions. On a VM, refresh the application. If the issue persists, open a support case.

**Q: What is the difference between MPIP Add-in for Outlook and AIP Add-in for Office?**
- The MPIP Add-in for Outlook includes the Outlook functionality from AIP Add-in for Office but omits Word, Excel, PowerPoint integrations.

**Q: Is the MPIP Add-in supported with Office Perpetual or Office LTSC?**
- No. Supported for Microsoft 365 only. Migrate to M365 Apps for Enterprise first.

## Log Analysis

For data collection and log analysis:
- [How to: Collect and analyze MPIP Client log](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/11337/How-to-Collect-and-analyze-MPIP-Client-log)

If the MPIP Add-in is not loading at all in Outlook:
- Collect **Outlook Diagnostics logs**: Outlook → Help → Get Diagnostics
