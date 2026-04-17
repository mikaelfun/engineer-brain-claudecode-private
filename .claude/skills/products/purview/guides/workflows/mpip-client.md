# Purview MPIP 客户端 (AIP Client) — 排查工作流

**来源草稿**: `ado-wiki-a-decrypt-pst-with-powershell.md`, `ado-wiki-b-complianceutility-label-reset.md`, `ado-wiki-b-mpip-add-in-for-outlook.md`, `ado-wiki-b-mpip-client-co-authoring.md`, `ado-wiki-b-mpip-client-collect-analyze-log.md`, `ado-wiki-b-mpip-client-support-boundaries.md`, `ado-wiki-required-information-mpip-client.md`, `ado-wiki-unable-to-remove-label-right-click.md`, `ado-wiki-update-mpip-client.md`
**Kusto 引用**: 无
**场景数**: 47
**生成日期**: 2026-04-07

---

## Scenario 1: Introduction
> 来源: ado-wiki-a-decrypt-pst-with-powershell.md | 适用: 未标注

### 排查步骤
The Microsoft Purview Information Protection (MPIP) client includes a PowerShell module, `PurviewInformationProtection`. This module contains cmdlets that may remove protection from content contained in a PST.

PST files are containers. A PST file itself does not support being labeled. When properly configured, the `PurviewInformationProtection` cmdlets may affect the contents of the PST file.

> Note: These client PowerShell tools were never intended to be an enterprise level eDiscovery solution.

`[来源: ado-wiki-a-decrypt-pst-with-powershell.md]`

---

## Scenario 2: MIP Label Policy
> 来源: ado-wiki-a-decrypt-pst-with-powershell.md | 适用: 未标注

### 排查步骤
The following advanced label policy setting must be configured. This must be set on the **highest priority policy** published to the user running the cmdlets:

`EnableContainerSupport` — See the [documentation](https://learn.microsoft.com/en-us/powershell/exchange/client-advanced-settings?view=exchange-ps#enablecontainersupport) for setting this.

`[来源: ado-wiki-a-decrypt-pst-with-powershell.md]`

---

## Scenario 3: AIP Service
> 来源: ado-wiki-a-decrypt-pst-with-powershell.md | 适用: 未标注

### 排查步骤
The user attempting to remove the protection must have rights to do so. Configure an [AIP Service Super User](https://learn.microsoft.com/en-us/azure/information-protection/configure-super-users) for this purpose.

When configuring this, add the user's UPN address to the feature.

`[来源: ado-wiki-a-decrypt-pst-with-powershell.md]`

---

## Scenario 4: Remove-FileLabel
> 来源: ado-wiki-a-decrypt-pst-with-powershell.md | 适用: 未标注

### 排查步骤
Use the `Remove-FileLabel` cmdlet with the [-RemoveProtection](https://learn.microsoft.com/en-us/powershell/module/purviewinformationprotection/remove-filelabel?view=azureipps#-removeprotection) parameter.

```powershell
Remove-FileLabel C:\Projects\Analysis.docx -RemoveProtection

FileName                   Status Comment
--------                   ------ ------------
C:\Projects\Analysis.docx  Success
```

In this case the file would be the PST.

`[来源: ado-wiki-a-decrypt-pst-with-powershell.md]`

---

## Scenario 5: Limitations
> 来源: ado-wiki-a-decrypt-pst-with-powershell.md | 适用: 未标注

### 排查步骤
- The maximum supported PST file size is **5 GB**.
- An AIP Service super user may only decrypt content protected by **its own tenant**. Emails encrypted by external tenants cannot be decrypted.

`[来源: ado-wiki-a-decrypt-pst-with-powershell.md]`

---

## Scenario 6: How to: Use ComplianceUtility (UnifiedLabelingSupportTool) for Label Reset & Log Collection
> 来源: ado-wiki-b-complianceutility-label-reset.md | 适用: 未标注

### 排查步骤
**Scope**: Local Office desktop apps only (Word, Excel, PowerPoint, Outlook Classic). **Not applicable to New Outlook (Monarch).**

`[来源: ado-wiki-b-complianceutility-label-reset.md]`

---

## Scenario 7: What this tool does
> 来源: ado-wiki-b-complianceutility-label-reset.md | 适用: 未标注

### 排查步骤
- Reset local Sensitivity Label / Label Policy / Template cache → forces re-download from service
- Replicate issue while collecting diagnostic logs (MPIP client logs, fiddler-like captures)
- Useful when: Sensitivity button missing/greyed out, labels not showing, label info outdated

`[来源: ado-wiki-b-complianceutility-label-reset.md]`

---

## Scenario 8: Step 1: Install the Tool
> 来源: ado-wiki-b-complianceutility-label-reset.md | 适用: 未标注

### 排查步骤
```PowerShell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
Install-Module -Name ComplianceUtility -AllowClobber
```

Verify installation:
```PowerShell
ComplianceUtility
```

`[来源: ado-wiki-b-complianceutility-label-reset.md]`

---

## Scenario 9: Step 1A: Install Optional Modules (only needed for Collect operations)
> 来源: ado-wiki-b-complianceutility-label-reset.md | 适用: 未标注

### 排查步骤
```PowerShell
Install-Module AipService          # For AIP config/template/endpoint collection (requires admin)
Install-Module ExchangeOnlineManagement  # For label/DLP data collection (requires admin)
Install-Module -Name Microsoft.Graph     # For user license details (requires admin)
```

`[来源: ado-wiki-b-complianceutility-label-reset.md]`

---

## Scenario 10: Step 2: Perform a Client Reset
> 来源: ado-wiki-b-complianceutility-label-reset.md | 适用: 未标注

### 排查步骤
**When to use**: Sensitivity button missing/greyed out, labels not showing or outdated.

1. Close all Office apps (Teams can stay open unless issue is Teams-specific)
2. Run:
```PowerShell
ComplianceUtility -Reset Default
```
3. Confirm with 'Y' when prompted
4. Expected: "Success" status in green. If "Failed" (red): close ALL Office apps and retry.

> **Tip**: If also collecting a Fiddler trace — start Fiddler trace BEFORE opening Office apps after the reset.

`[来源: ado-wiki-b-complianceutility-label-reset.md]`

---

## Scenario 11: Step 3: Replicate Issue & Collect Logs
> 来源: ado-wiki-b-complianceutility-label-reset.md | 适用: 未标注

### 排查步骤
```PowerShell
ComplianceUtility -RecordProblem -CompressLogs
```

1. Close all Office apps, confirm with 'Y' (do NOT close PowerShell)
2. Open affected app, reproduce the issue
3. Close all Office apps again
4. Return to PowerShell and press `Enter` (MFA may be prompted)
5. Tool collects and compresses logs
6. Share compressed log files with support

`[来源: ado-wiki-b-complianceutility-label-reset.md]`

---

## Scenario 12: Quick Reference — Direct Command Parameters
> 来源: ado-wiki-b-complianceutility-label-reset.md | 适用: 未标注

### 排查步骤
| Parameter | Purpose |
|-----------|---------|
| `-Reset Default` | Reset local label/policy/template cache |
| `-RecordProblem -CompressLogs` | Collect logs during issue reproduction |
| `-CollectLabelsAndPolicies` | Export label and policy configuration (needs EXO module + admin) |
| `-CollectAIPServiceConfiguration` | Export AIP service configuration (needs AipService module + admin) |
| `-CollectProtectionTemplates` | Export RMS/AIP protection templates |
| `-CollectEndpointURLs` | Export AIP endpoint URLs |
| `-CollectDLPRulesAndPolicies` | Export DLP rules and policies |
| `-CollectUserLicenseDetails` | Export user license info (needs Graph module + admin) |

`[来源: ado-wiki-b-complianceutility-label-reset.md]`

---

## Scenario 13: Overview
> 来源: ado-wiki-b-mpip-add-in-for-outlook.md | 适用: 未标注

### 排查步骤
The **Microsoft Purview Information Protection Add-in for Outlook** (MPIP Add-in) integrates with Classic Outlook for Windows to apply sensitivity labels from Microsoft Purview. It is supported for **Exchange On-Prem** configurations only. This installation package does **not** include labeling capabilities for Word, Excel, or PowerPoint.

`[来源: ado-wiki-b-mpip-add-in-for-outlook.md]`

---

## Scenario 14: 1. Required licenses
> 来源: ado-wiki-b-mpip-add-in-for-outlook.md | 适用: 未标注

### 排查步骤
- Microsoft 365 E3/A3/G3 or E5/A5/G5
- Enterprise Mobility + Security E3/E5
- Microsoft 365 F1/F3/F5 Compliance / F5 Sec+Comp

`[来源: ado-wiki-b-mpip-add-in-for-outlook.md]`

---

## Scenario 15: 2. Minimum Office version
> 来源: ado-wiki-b-mpip-add-in-for-outlook.md | 适用: 未标注

### 排查步骤
| Channel | Minimum Version |
|---------|----------------|
| Current Channel | 2504 (16.0.18730.20132) |
| Monthly Enterprise Channel | 2503 (16.0.18623.20242) |
| Semi-Annual Channel (Preview) | 2502 (16.0.18526.20330) |
| Semi-Annual Channel | 2408 (16.0.17928.20536) |

`[来源: ado-wiki-b-mpip-add-in-for-outlook.md]`

---

## Scenario 16: 3. Microsoft Purview Information Protection client
> 来源: ado-wiki-b-mpip-add-in-for-outlook.md | 适用: 未标注

### 排查步骤
- Version **3.0.105.0 or above**

`[来源: ado-wiki-b-mpip-add-in-for-outlook.md]`

---

## Scenario 17: 4. Latest version of MPIP Add-in for Outlook
> 来源: ado-wiki-b-mpip-add-in-for-outlook.md | 适用: 未标注

### 排查步骤
- Download from: https://microsoft.sharepoint.com/sites/MPIPPreviews/Shared%20Documents/Forms/AllItems.aspx?id=%2fsites%2fMPIPPreviews%2fShared%20Documents%2fMPIP%20Installation%20Package%2fMPIP%20Installation%20%5BDownload%5D

`[来源: ado-wiki-b-mpip-add-in-for-outlook.md]`

---

## Scenario 18: 5. Role requirements
> 来源: ado-wiki-b-mpip-add-in-for-outlook.md | 适用: 未标注

### 排查步骤
- Compliance administrator or Global administrator role in Entra ID portal

`[来源: ado-wiki-b-mpip-add-in-for-outlook.md]`

---

## Scenario 19: Installation Instructions
> 来源: ado-wiki-b-mpip-add-in-for-outlook.md | 适用: 未标注

### 排查步骤
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

`[来源: ado-wiki-b-mpip-add-in-for-outlook.md]`

---

## Scenario 20: Verification
> 来源: ado-wiki-b-mpip-add-in-for-outlook.md | 适用: 未标注

### 排查步骤
After installation, verify the add-in is working:

1. Select **Show Bar** in the Sensitivity icon dropdown to display the sensitivity label bar in Outlook.
2. Apply labels using either the sensitivity dropdown or the sensitivity label bar.
3. Confirm the client version in the Help dialog popup.
4. Go to **Control Panel → Programs and Features** and verify the latest MPIP Add-in version is installed.

`[来源: ado-wiki-b-mpip-add-in-for-outlook.md]`

---

## Scenario 21: FAQ
> 来源: ado-wiki-b-mpip-add-in-for-outlook.md | 适用: 未标注

### 排查步骤
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

`[来源: ado-wiki-b-mpip-add-in-for-outlook.md]`

---

## Scenario 22: Log Analysis
> 来源: ado-wiki-b-mpip-add-in-for-outlook.md | 适用: 未标注

### 排查步骤
For data collection and log analysis:
- [How to: Collect and analyze MPIP Client log](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/11337/How-to-Collect-and-analyze-MPIP-Client-log)

If the MPIP Add-in is not loading at all in Outlook:
- Collect **Outlook Diagnostics logs**: Outlook → Help → Get Diagnostics

`[来源: ado-wiki-b-mpip-add-in-for-outlook.md]`

---

## Scenario 23: Learn: MPIP Client Co-Authoring for Sensitivity Labels
> 来源: ado-wiki-b-mpip-client-co-authoring.md | 适用: 未标注

### 排查步骤
Official documentation: https://learn.microsoft.com/en-us/purview/sensitivity-labels-coauthoring

> ⚠️ **Support guidance**: Do NOT recommend customers to enable co-authoring. This is a **tenant-wide setting** with many prerequisites and significant consequences regarding metadata location changes. Always ensure customers fully understand the implications before proceeding.

`[来源: ado-wiki-b-mpip-client-co-authoring.md]`

---

## Scenario 24: What is Co-Authoring?
> 来源: ado-wiki-b-mpip-client-co-authoring.md | 适用: 未标注

### 排查步骤
Co-authoring for files encrypted with sensitivity labels enables real-time collaboration on labeled/encrypted Office documents. Enabling this setting changes the **metadata format and location** for Word, Excel, and PowerPoint files.

`[来源: ado-wiki-b-mpip-client-co-authoring.md]`

---

## Scenario 25: How enabling co-authoring affects existing documents
> 来源: ado-wiki-b-mpip-client-co-authoring.md | 适用: 未标注

### 排查步骤
- **Newly labeled files**: Only the new format and location is used for labeling metadata
- **Already labeled files**: The next time the file is opened and saved, metadata in old format/location is copied to the new format/location

> Reference: [Upcoming Changes to Microsoft Information Protection Metadata Storage](https://techcommunity.microsoft.com/t5/security-compliance-and-identity/upcoming-changes-to-microsoft-information-protection-metadata/ba-p/1904418)

`[来源: ado-wiki-b-mpip-client-co-authoring.md]`

---

## Scenario 26: How to check if co-authoring is enabled on the tenant
> 来源: ado-wiki-b-mpip-client-co-authoring.md | 适用: 未标注

### 排查步骤
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

`[来源: ado-wiki-b-mpip-client-co-authoring.md]`

---

## Scenario 27: How to check if the Office version supports Co-Authoring
> 来源: ado-wiki-b-mpip-client-co-authoring.md | 适用: 未标注

### 排查步骤
Validate against the Office prerequisites: https://learn.microsoft.com/en-us/microsoft-365/compliance/sensitivity-labels-coauthoring?view=o365-worldwide#prerequisites

- **Compatible Office version** → logs show co-authoring state as `Initialized`
- **Incompatible Office version** → logs show `NotSupported`

`[来源: ado-wiki-b-mpip-client-co-authoring.md]`

---

## Scenario 28: EnableCoAuthoring advanced property
> 来源: ado-wiki-b-mpip-client-co-authoring.md | 适用: 未标注

### 排查步骤
- `EnableCoAuthoring` is set to **true** by default
- This property exists to disable co-authoring in case of catastrophic failure
- **Internal only** — do NOT turn it off unless instructed by dev team

`[来源: ado-wiki-b-mpip-client-co-authoring.md]`

---

## Scenario 29: How to disable (opt-out) co-authoring
> 来源: ado-wiki-b-mpip-client-co-authoring.md | 适用: 未标注

### 排查步骤
> **Note: Opt-out is support-guided self-service. No DLP OCE involvement expected unless cmdlet failures observed.**

```powershell

`[来源: ado-wiki-b-mpip-client-co-authoring.md]`

---

## Scenario 30: Disable co-authoring
> 来源: ado-wiki-b-mpip-client-co-authoring.md | 适用: 未标注

### 排查步骤
Set-PolicyConfig -EnableLabelCoauth $False

`[来源: ado-wiki-b-mpip-client-co-authoring.md]`

---

## Scenario 31: Re-enable
> 来源: ado-wiki-b-mpip-client-co-authoring.md | 适用: 未标注

### 排查步骤
Set-PolicyConfig -EnableLabelCoauth $True

`[来源: ado-wiki-b-mpip-client-co-authoring.md]`

---

## Scenario 32: Check current setting
> 来源: ado-wiki-b-mpip-client-co-authoring.md | 适用: 未标注

### 排查步骤
Get-PolicyConfig | fl EnableLabelCoauth
```

> ⚠️ **Warning from Office team**: This change is very disruptive. May cause customer documents to appear unlabeled or show different labels across Office Clients, Web Apps, SPO, etc. This behavior may repeat if co-auth is re-enabled after disabling. **Always work with support to understand all implications before proceeding.** Reference: https://docs.microsoft.com/en-us/microsoft-365/compliance/sensitivity-labels-coauthoring?view=o365-worldwide#how-to-enable-co-authoring-for-files-with-sensitivity-labels

`[来源: ado-wiki-b-mpip-client-co-authoring.md]`

---

## Scenario 33: How to: Collect and analyze MPIP Client log
> 来源: ado-wiki-b-mpip-client-collect-analyze-log.md | 适用: 未标注

### 排查步骤
Logging is by default enabled on MPIP client. Use this guide to analyze logs when investigating any MPIP client related issues.

`[来源: ado-wiki-b-mpip-client-collect-analyze-log.md]`

---

## Scenario 34: Step 1: Export and get the logs from the client machine
> 来源: ado-wiki-b-mpip-client-collect-analyze-log.md | 适用: 未标注

### 排查步骤
- Clear existing logs before collecting if the issue can be reproduced:
  - Open MPIP client → **Help and Feedback** → **Reset Settings**
  - Reproduce the issue
  - Go to **Help and Feedback** → **Export Logs** → saves to a compressed ZIP file
- Alternatively, manually copy all files from `%localappdata%\Microsoft\MSIP`

`[来源: ado-wiki-b-mpip-client-collect-analyze-log.md]`

---

## Scenario 35: Step 2: Extract and understand the ZIP structure
> 来源: ado-wiki-b-mpip-client-collect-analyze-log.md | 适用: 未标注

### 排查步骤
The exported ZIP contains:

| Folder | Contents |
|--------|----------|
| **MIP** | SDK logs and policy sqlite files for various applications used by MPIP client |
| **MSIP** | Extracted Policy.xml and MSIP logs for various applications |
| **MSIPC** | Encryption/decryption logs used by MSIPC-enabled apps (e.g., Office apps) |
| **Registry** | Registry export of MIP and MSIPC relevant configurations |
| **Windows Event Logs** | Application and System Event log exports |

`[来源: ado-wiki-b-mpip-client-collect-analyze-log.md]`

---

## Scenario 36: Step 3: Analyze logs using MSIPLogViewer
> 来源: ado-wiki-b-mpip-client-collect-analyze-log.md | 适用: 未标注

### 排查步骤
Start from logs under `\MSIP\Logs\`:

| Log file | Use when investigating |
|----------|----------------------|
| `MSIPViewer.iplog` | Opening encrypted file using AIP Viewer application |
| `MSIPApp.iplog` | Applying or removing label using MIP Client |
| `MSIPPowershell.iplog` | Applying, removing, or retrieving label using MIP Client PowerShell |

**Tips:**
- Use **Orange** and **Red** flags to quickly filter warnings and errors
- Search using the filename used to reproduce the issue
- Look at the **Message** column or bottom pane for detailed descriptions
- Verify these key events are successful:
  - `Acquired a token`
  - `Engine loaded for PolicyEngine`

`[来源: ado-wiki-b-mpip-client-collect-analyze-log.md]`

---

## Scenario 37: Analyzing policy loading issues (mip_sdk logs)
> 来源: ado-wiki-b-mpip-client-collect-analyze-log.md | 适用: 未标注

### 排查步骤
If there are policy loading issues, check the mip_sdk log:
- Located at: `..\MSIP\mip\<application>.exe\mip\logs\mip_sdk.miplog`
- Open with MSIPLogViewer
- Create filters for: `Sending HTTP request` and `Received HTTP response`
- Verify HTTP status codes in responses: **200, 301, 302, 304, 401** are expected; anything else is suspicious

`[来源: ado-wiki-b-mpip-client-collect-analyze-log.md]`

---

## Scenario 38: Step 4: Verify Policy Settings are retrieved correctly
> 来源: ado-wiki-b-mpip-client-collect-analyze-log.md | 适用: 未标注

### 排查步骤
- Open `Policy.xml` from `..\MSIP` folder (from the exported ZIP)
- Verify settings are correct and up-to-date as configured in the portal

`[来源: ado-wiki-b-mpip-client-collect-analyze-log.md]`

---

## Scenario 39: Support Boundaries: MPIP Client
> 来源: ado-wiki-b-mpip-client-support-boundaries.md | 适用: Mooncake ✅

### 排查步骤
> ⚠️ Note: DfM SAP paths below are for **Global (Worldwide)** support. 21V/Gallatin uses a different support structure.

| Support Topic | Workload | Support Owner | DfM Support Area Path (SAP) | Comments | Links / TSG |
|--------------|----------|---------------|----------------------------|----------|-------------|
| MPIP Client | Microsoft Purview Information Protection **Client** | MPIP (MIP Platform services) | Security/Microsoft Purview Compliance/Microsoft Purview Information Protection | **MPIP Client issues:** MPIP Viewer, MPIP right-click "Apply Sensitivity Label with Microsoft Purview", MPIP PowerShell | [MPIP Client TSG](https://aka.ms/MPIPClientTSG) |
| MPIP Scanner | Microsoft Purview Information Protection **Scanner** | MPIP (MIP Platform services) | Security/Microsoft Purview Compliance/Microsoft Purview Information Protection/Scanner | Scanner issues **only** | [MPIP Scanner TSG](https://aka.ms/MPIPScannerTSG) |

`[来源: ado-wiki-b-mpip-client-support-boundaries.md]`

---

## Scenario 40: Scenario
> 来源: ado-wiki-unable-to-remove-label-right-click.md | 适用: 未标注

### 排查步骤
User is unable to remove Sensitivity label from files using Right click > Apply Sensitivity Label with Microsoft Purview:

- Unable to remove classification label
- Unable to remove encryption label
- Unable to remove User protection label

`[来源: ado-wiki-unable-to-remove-label-right-click.md]`

---

## Scenario 41: Step 1: Is the Delete Label button grayed out?
> 来源: ado-wiki-unable-to-remove-label-right-click.md | 适用: 未标注

### 排查步骤
- Check whether Mandatory Labeling is enabled on the policy for the user.
- If Yes → by design. Cannot delete a label if mandatory labeling is enabled. User can only change to another label.
- Edit the highest priority Label policy scoped for the user to verify this setting.

`[来源: ado-wiki-unable-to-remove-label-right-click.md]`

---

## Scenario 42: Step 2: Is it a classification (non encryption) label?
> 来源: ado-wiki-unable-to-remove-label-right-click.md | 适用: 未标注

### 排查步骤
- Collect MPIP client log and check the error.

`[来源: ado-wiki-unable-to-remove-label-right-click.md]`

---

## Scenario 43: Step 3: Is it an encryption label?
> 来源: ado-wiki-unable-to-remove-label-right-click.md | 适用: 未标注

### 排查步骤
- Check whether the user has Full control permission:
  - Edit the label from Purview portal → confirm user has Owner right (Full control)
  - If not, user cannot remove or change the applied label
  - Refer [Configure usage rights](https://learn.microsoft.com/en-us/azure/information-protection/configure-usage-rights)
- If user does not have Owner/Full control, set up an AIP Super User. Refer [Configure super users](https://learn.microsoft.com/en-us/azure/information-protection/configure-super-users)

`[来源: ado-wiki-unable-to-remove-label-right-click.md]`

---

## Scenario 44: Step 4: Removing encryption from PST or MSG files?
> 来源: ado-wiki-unable-to-remove-label-right-click.md | 适用: 未标注

### 排查步骤
- Use PowerShell Remove-FileLabel command
- Refer the PowerShell scenario guide for details.

`[来源: ado-wiki-unable-to-remove-label-right-click.md]`

---

## Scenario 45: Step 5: Get Assistance
> 来源: ado-wiki-unable-to-remove-label-right-click.md | 适用: 未标注

### 排查步骤
Provide Required Information: MPIP Client.

`[来源: ado-wiki-unable-to-remove-label-right-click.md]`

---

## Scenario 46: Update Methods
> 来源: ado-wiki-update-mpip-client.md | 适用: 未标注

### 排查步骤
1. **Manual Download and Installation**
   - Download from [Microsoft Download Center](https://www.microsoft.com/en-us/download/details.aspx?id=53018)
   - Useful for testing or applying updates immediately

2. **Windows Update**
   - New versions published to Microsoft Update Catalog (~1 month after initial release)
   - Devices with automatic updates enabled will install automatically

3. **Enterprise Update Tools**
   - Deploy via WSUS, SCCM, Group Policy, or other third-party software update solutions

`[来源: ado-wiki-update-mpip-client.md]`

---

## Scenario 47: FAQ
> 来源: ado-wiki-update-mpip-client.md | 适用: 未标注

### 排查步骤
**Q: Can you prevent automatic MPIP client updates via Microsoft Update?**

A: No. The MPIP client does not provide an option to enable/disable automatic updates. Update behavior is entirely controlled by the Windows Update settings on the device.

Reference: [Extend sensitivity labeling on Windows](https://learn.microsoft.com/en-us/purview/information-protection-client)

`[来源: ado-wiki-update-mpip-client.md]`

---
