---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/MPIP Client/Troubleshooting Scenarios: MPIP Client/Scenario: Unable to remove Sensitivity label or Encryption from files using PowerShell"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FMPIP%20Client%2FTroubleshooting%20Scenarios%3A%20MPIP%20Client%2FScenario%3A%20Unable%20to%20remove%20Sensitivity%20label%20or%20Encryption%20from%20files%20using%20PowerShell"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Scenario

User is unable to remove Sensitivity label or encryption from files using Microsoft Information Protection PowerShell command:

- Unable to remove classification label
- Unable to remove encryption label
- Unable to remove label and encryption from emails inside PST file.

# Step-By-Step Instructions

## Step 1: Is the MPIP Client PowerShell module installed and registered correctly?
- Refer [How to: Check MPIP Client PowerShell module is installed](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/11384/How-to-Check-MPIP-Client-PowerShell-module-is-installed)

## Step 2: Is the syntax correct for the Remove-FileLabel command?
- Refer [Remove-FileLabel](https://learn.microsoft.com/en-us/powershell/module/purviewinformationprotection/remove-filelabel?view=azureipps)
- If the file is encrypted, check whether the user has Full control permission:
  - Edit the label from Purview portal and confirm whether the user has Owner right (Full control). If not, user cannot remove or change the label.
  - Refer [Configure usage rights](https://learn.microsoft.com/en-us/azure/information-protection/configure-usage-rights#usage-rights-and-descriptions)
- If user does not have Owner/Full control, set up an AIP Super User account. Refer [Configure super users](https://learn.microsoft.com/en-us/azure/information-protection/configure-super-users)
- Collect MPIP client log for error analysis.

## Step 3: Removing encryption from PST or MSG files?
- Use `Remove-FileLabel C:\path\file.pst -RemoveProtection`
- Enable EnableContainerSupport in LabelPolicy Advanced setting for .zip, .rar, .7z, and emails inside PST. Refer [EnableContainerSupport](https://learn.microsoft.com/en-us/powershell/exchange/client-advanced-settings?view=exchange-ps#enablecontainersupport)

## Step 4: Get Assistance
If the steps above do not resolve your issue, get assistance and provide Required Information: MPIP Client.
