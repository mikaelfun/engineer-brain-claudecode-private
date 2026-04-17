# Purview 敏感度标签可见性与策略 — 排查工作流

**来源草稿**: `ado-wiki-a-msoaid-gather-fiddler.md`, `ado-wiki-a-verify-mip-pdf.md`, `ado-wiki-b-identify-ownership-sensitivity-label-issues.md`, `ado-wiki-b-required-information-sensitivity-labels.md`, `ado-wiki-b-see-sensitivity-label.md`, `ado-wiki-b-support-boundaries-sensitivity-labels.md`, `ado-wiki-b-when-to-reproduce-sensitivity-label-issues.md`, `ado-wiki-unable-to-remove-sensitivity-label-powershell.md`
**Kusto 引用**: 无
**场景数**: 30
**生成日期**: 2026-04-07

---

## Scenario 1: Introduction
> 来源: ado-wiki-a-msoaid-gather-fiddler.md | 适用: 未标注

### 排查步骤
Microsoft provides the [Microsoft Office Authentication/Identity Diagnostic (MSOAID)](https://learn.microsoft.com/en-us/microsoft-365/troubleshoot/diagnostic-logs/use-msoaid-for-authentication-issues). This tool gathers a Fiddler trace and PSR without the customer needing to install/configure Fiddler separately.

`[来源: ado-wiki-a-msoaid-gather-fiddler.md]`

---

## Scenario 2: Download and Extract
> 来源: ado-wiki-a-msoaid-gather-fiddler.md | 适用: 未标注

### 排查步骤
1. [Download MSOAID](https://aka.ms/msoaid).
2. Extract the contents to some location.

`[来源: ado-wiki-a-msoaid-gather-fiddler.md]`

---

## Scenario 3: Gather Data
> 来源: ado-wiki-a-msoaid-gather-fiddler.md | 适用: 未标注

### 排查步骤
In most cases use the defaults for this tool.

1. Go to the extracted MSOAID content location.
2. Right-click `MSOAID-Win.exe` and _Run as administrator_.
3. In the first dialog choose `Next`.
4. The next dialog has all the options selected. Keep all checked. Note the second option is Fiddler with HTTPS decryption.
5. Note the output path results (and change, if desired).
6. The Fiddler certificate installation prompt will appear. Choose 'Yes'.
7. Once all the MSOAID diagnostics are enabled, the dialog with the `Finish` button appears. **NOTE**: There will be prompts opening/closing and the PSR app opens.
8. Reproduce the issue. When done, press `Finish`. The Fiddler certification deletion prompt appears. Choose `Yes`.
9. The final dialog provides the path to the gathered data.

`[来源: ado-wiki-a-msoaid-gather-fiddler.md]`

---

## Scenario 4: Introduction
> 来源: ado-wiki-a-verify-mip-pdf.md | 适用: 未标注

### 排查步骤
There may be times when one needs to determine the encryption state of a PDF file. PDF files are not as easy to inspect as Office documents.

`[来源: ado-wiki-a-verify-mip-pdf.md]`

---

## Scenario 5: The Easy Way: Get-FileStatus
> 来源: ado-wiki-a-verify-mip-pdf.md | 适用: 未标注

### 排查步骤
As long as a user has at least `view` rights to the content, the Microsoft Purview Information Protection (MPIP) client PowerShell cmdlet `Get-FileStatus` will show encryption information.

- The `RMSOwner` field shows the account that applied the protection.
- Works for both SharePoint Online and on-premises SharePoint (via RMS Connector) protected PDFs.

`[来源: ado-wiki-a-verify-mip-pdf.md]`

---

## Scenario 6: SharePoint Online vs On-Premises Comparison
> 来源: ado-wiki-a-verify-mip-pdf.md | 适用: 未标注

### 排查步骤
| Area | SharePoint Server (On-Premises) | SharePoint Online |
|------|------|------|
| RMS backend | AD RMS or RMS Connector | Azure Rights Management (Purview Information Protection) |
| Encryption model | Legacy Microsoft IRM PDF encryption | Modern ISO-standard PDF IRM v2 |
| PDF format | `%PDF-1.7` with Microsoft-specific IRM filter embedded directly | `%PDF-2.0` wrapper PDF with RMS-encrypted PDF embedded as Associated File |

`[来源: ado-wiki-a-verify-mip-pdf.md]`

---

## Scenario 7: SharePoint Online (Modern) Verification
> 来源: ado-wiki-a-verify-mip-pdf.md | 适用: 未标注

### 排查步骤
1. Right-click the PDF file → Open with → Notepad.
2. Look for: `%PDF-2.0`, `/AF` + `/EmbeddedFiles`, `MicrosoftIRMServices Protected PDF.pdf`
3. These alone confirm the file is RMS-protected by SPO.

`[来源: ado-wiki-a-verify-mip-pdf.md]`

---

## Scenario 8: On-Premises SharePoint (Legacy) Verification
> 来源: ado-wiki-a-verify-mip-pdf.md | 适用: 未标注

### 排查步骤
1. Open PDF in Notepad.
2. **Step 1**: Confirm `%PDF-1.7` header (standard ISO 32000-1 format).
3. **Step 2**: Search for `/Encrypt` → confirms document-level encryption.
4. **Step 3**: Find the referenced encryption object (e.g., `55 0 obj`).
5. **Step 4**: Look for `/Filter /MicrosoftIRMServices`, `/MicrosoftIRMVersion 1`, `/PublishingLicense`.

If all present → file is definitively RMS-protected.

`[来源: ado-wiki-a-verify-mip-pdf.md]`

---

## Scenario 9: Key Notes
> 来源: ado-wiki-a-verify-mip-pdf.md | 适用: 未标注

### 排查步骤
- **Edge may fail to open RMS-protected PDFs** from a different organization. This is expected behavior, not corruption.
- **RMS licensing URL is NOT stored in readable form** inside the PDF. Tenant/licensing info is resolved dynamically at open time and cannot be extracted offline.
- An **RMS-enabled PDF viewer with network access** is required to determine the licensing authority.

`[来源: ado-wiki-a-verify-mip-pdf.md]`

---

## Scenario 10: Introduction
> 来源: ado-wiki-b-identify-ownership-sensitivity-label-issues.md | 适用: 未标注

### 排查步骤
Identify if the issue should be handled by the DLP team or is this an issue for a different team.

`[来源: ado-wiki-b-identify-ownership-sensitivity-label-issues.md]`

---

## Scenario 11: Step 0: Run the Sensitivity Label diagnostic in the Purview Portal
> 来源: ado-wiki-b-identify-ownership-sensitivity-label-issues.md | 适用: 未标注

### 排查步骤
The diagnostic "A user can't find the sensitivity label they need. Does the label policy apply to them?" will query the Labels API for the given user to see if the label is correctly configured.

- If the label is correctly configured according to this diagnostic → the API is functioning correctly, the client/app is not showing the label as it should
- If the label or label policy settings are NOT showing correctly → the label is NOT configured properly → owned by Purview\Sensitivity Labels IcM team

`[来源: ado-wiki-b-identify-ownership-sensitivity-label-issues.md]`

---

## Scenario 12: Step 1: Is this an AIP client issue?
> 来源: ado-wiki-b-identify-ownership-sensitivity-label-issues.md | 适用: 未标注

### 排查步骤
- What is [AIP Client](https://learn.microsoft.com/en-us/purview/information-protection-client-relnotes)?
- Check for issue ownership to determine how to investigate and where to escalate
- See AIP TSG, if needed - escalate to AIP team or open a DCR

`[来源: ado-wiki-b-identify-ownership-sensitivity-label-issues.md]`

---

## Scenario 13: Step 2: Is this a Retention Label issue?
> 来源: ado-wiki-b-identify-ownership-sensitivity-label-issues.md | 适用: 未标注

### 排查步骤
- Retention Labels are handled by the Data Lifecycle Management team

`[来源: ado-wiki-b-identify-ownership-sensitivity-label-issues.md]`

---

## Scenario 14: Step 3: Is this a Client Team Issue?
> 来源: ado-wiki-b-identify-ownership-sensitivity-label-issues.md | 适用: 未标注

### 排查步骤
If the issue is specific to **only one** application and not another, the client team will need to investigate.

`[来源: ado-wiki-b-identify-ownership-sensitivity-label-issues.md]`

---

## Scenario 15: Ownership Table
> 来源: ado-wiki-b-identify-ownership-sensitivity-label-issues.md | 适用: 未标注

### 排查步骤
| Scenario | Owning Escalation Team |
|----------|----------------------|
| Issues in Sensitivity Labels Purview Portal (creation, configuration) | Purview\Sensitivity Labels |
| Issues with Sensitivity Labels cmdlets (*-Label, *-LabelPolicy) | Purview\Sensitivity Labels |
| Label not showing in OWA | Purview\Sensitivity Labels |
| Label showing in OWA, but not working correctly | OWA |
| Server Side Auto Labeling | Purview\Server Side Auto Labeling |
| Sensitivity Label Encryption | Purview\Sensitivity Labels |
| Visibility of labels in a _single_ client | The client team (Word, Outlook, SharePoint, etc.) |
| Visibility of labels in _all_ clients | Purview\Sensitivity Labels |
| Email Content marking not working | Purview\Sensitivity Labels |
| Non-Email Content Marking not working in client apps | The client team |

`[来源: ado-wiki-b-identify-ownership-sensitivity-label-issues.md]`

---

## Scenario 16: Required Information: Sensitivity Labels
> 来源: ado-wiki-b-required-information-sensitivity-labels.md | 适用: 未标注

### 排查步骤
When creating an escalation, collect the following information:

- The affected Label and Policy name and details:
  - `Get-Label | FL`
  - `Get-LabelPolicy | FL`
- The affected user UPN/Email
- A screenshot of the issue
- The list of affected clients
- A network trace (HAR), if the issue is on the portal (make sure to refresh the page after starting HAR trace to get complete log)

`[来源: ado-wiki-b-required-information-sensitivity-labels.md]`

---

## Scenario 17: Easy Way - MPIP Client PowerShell
> 来源: ado-wiki-b-see-sensitivity-label.md | 适用: 未标注

### 排查步骤
When the Microsoft Purview Information Protection (MPIP) client is installed, use PowerShell:

```powershell
Get-FileStatus <filepath>
```

See [Get-FileStatus docs](https://learn.microsoft.com/en-us/powershell/module/purviewinformationprotection/get-filestatus?view=azureipps).

`[来源: ado-wiki-b-see-sensitivity-label.md]`

---

## Scenario 18: Non-CoAuth Enabled Tenant
> 来源: ado-wiki-b-see-sensitivity-label.md | 适用: 未标注

### 排查步骤
1. Open document in Word/Excel/PowerPoint
2. Navigate to `File` > `Info` > `Properties` > `Advanced Properties`
3. Go to `Custom` tab - the label will be in custom properties

`[来源: ado-wiki-b-see-sensitivity-label.md]`

---

## Scenario 19: CoAuth Enabled Tenant
> 来源: ado-wiki-b-see-sensitivity-label.md | 适用: 未标注

### 排查步骤
Note: Does not work with encrypted files.
1. Copy the document, rename extension to `.zip`
2. Open the .zip file
3. Navigate to `docMetadata` folder
4. Open `LabelInfo.xml` to see label data

`[来源: ado-wiki-b-see-sensitivity-label.md]`

---

## Scenario 20: Office Metadata Encryption (DRMEncryptProperty)
> 来源: ado-wiki-b-see-sensitivity-label.md | 适用: 未标注

### 排查步骤
If `DRMEncryptProperty` is enabled, metadata is encrypted and labels are not visible outside Office:

```
HKCU\Software\Microsoft\Office\16.0\Common\Security
Name:  DRMEncryptProperty
Type:  DWORD
Value: 0 (plaintext, default) or 1 (encrypted)
```

**Impact**: If DRMEncryptProperty=1:
- DLP Endpoint cannot see the label
- DLP EXO/SPO/ODB and Auto Labeling may have difficulties detecting it
- This setting is NOT compatible with MIP Labels

`[来源: ado-wiki-b-see-sensitivity-label.md]`

---

## Scenario 21: Email Label Identification
> 来源: ado-wiki-b-see-sensitivity-label.md | 适用: 未标注

### 排查步骤
1. Download and open the .msg or .eml file in Outlook Desktop
2. Click `File` > `Properties`
3. Look for `msip_labels:` property
4. Alternative: Open in text editor and search for `msip_labels:`

`[来源: ado-wiki-b-see-sensitivity-label.md]`

---

## Scenario 22: Support Area Paths (SAP)
> 来源: ado-wiki-b-support-boundaries-sensitivity-labels.md | 适用: 未标注

### 排查步骤
| Support Topic | Workload | Support Owner | SAP | Comments |
|--------------|----------|--------------|-----|----------|
| Sensitivity Labels | Microsoft Purview Information Protection | Compliance | Security/Microsoft Purview Compliance/Sensitivity Labels | General sensitivity label issues, classification, protection, content markings (headers, footers, watermarks) |
| Sensitivity Labels - Service | Microsoft Purview Information Protection | Compliance | Security/Microsoft Purview Compliance/Sensitivity Labels/Service | Service-level issues (Teams, SharePoint, OneDrive access control) |
| Sensitivity Labels - Client | Microsoft Purview Information Protection | Compliance | Security/Microsoft Purview Compliance/Sensitivity Labels/Client | Client-side issues (Word, Excel, PowerPoint, Outlook desktop/mobile) |

`[来源: ado-wiki-b-support-boundaries-sensitivity-labels.md]`

---

## Scenario 23: AIP and MIP Support Boundaries
> 来源: ado-wiki-b-support-boundaries-sensitivity-labels.md | 适用: 未标注

### 排查步骤
| Support Scenario | Support Team | PG Escalation | SAP |
|-----------------|-------------|--------------|-----|
| Label Configuration and Management | MIP (SCIM Compliance Team) | ICM via Escalation Process | Security/Microsoft Purview Compliance/Labels |
| General questions on label implementation | MIP (SCIM Compliance Team) | ICM via Escalation Process | Security/Microsoft Purview Compliance/Labels |

`[来源: ado-wiki-b-support-boundaries-sensitivity-labels.md]`

---

## Scenario 24: When to Reproduce Sensitivity Label Issues
> 来源: ado-wiki-b-when-to-reproduce-sensitivity-label-issues.md | 适用: 未标注

### 排查步骤
Reproduce issues only if the process can be completed within three days:

- **Day 1:** Collect logs
- **Day 2:** Wait for distribution
- **Day 3:** Test
- **Exception:** For SPO scenarios, repro may take up to seven days

`[来源: ado-wiki-b-when-to-reproduce-sensitivity-label-issues.md]`

---

## Scenario 25: Scenario Guidelines
> 来源: ado-wiki-b-when-to-reproduce-sensitivity-label-issues.md | 适用: 未标注

### 排查步骤
| Scenario | Reproduce? | Notes |
|----------|-----------|-------|
| Label missing in a specific client | Skip | Normally needs client-side assistance or transfer. Check support boundaries. |
| Label missing everywhere | Skip | Start by checking distribution and overall configuration. |
| Issues with label watermark | Yes | Fairly easy and fast repro, provides insights on client behaviors. |
| Label encryption (assign permissions now) | Yes | Repro recommended. |
| Label encryption (assign permissions later) | Yes | Try to repro. |
| Label encryption (OME) | Yes | Repro recommended. |
| Label encryption (DKE) | Skip | Too complex. |
| Label inheritance | Yes | Strongly suggest trying to reproduce. |
| Different label behavior between clients | Yes | Quick repro before involving client teams to check if reproducible. |
| PDFs | Judgement | Depends on PDF client vs configs. Troubleshooting is limited. |
| S/MIME & labels | Skip | Not worth the effort. |
| Co-authoring | Judgement | Some scenarios worth repro, others too complicated. |
| Auto-labelling (simple) | Yes | Easy scenarios (1-2 policies, few locations). |
| Auto-labelling (complex) | Skip | Complex scenarios/difficult workloads may not be worth it. |

`[来源: ado-wiki-b-when-to-reproduce-sensitivity-label-issues.md]`

---

## Scenario 26: Scenario
> 来源: ado-wiki-unable-to-remove-sensitivity-label-powershell.md | 适用: 未标注

### 排查步骤
User is unable to remove Sensitivity label or encryption from files using Microsoft Information Protection PowerShell command:

- Unable to remove classification label
- Unable to remove encryption label
- Unable to remove label and encryption from emails inside PST file.

`[来源: ado-wiki-unable-to-remove-sensitivity-label-powershell.md]`

---

## Scenario 27: Step 1: Is the MPIP Client PowerShell module installed and registered correctly?
> 来源: ado-wiki-unable-to-remove-sensitivity-label-powershell.md | 适用: 未标注

### 排查步骤
- Refer [How to: Check MPIP Client PowerShell module is installed](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/11384/How-to-Check-MPIP-Client-PowerShell-module-is-installed)

`[来源: ado-wiki-unable-to-remove-sensitivity-label-powershell.md]`

---

## Scenario 28: Step 2: Is the syntax correct for the Remove-FileLabel command?
> 来源: ado-wiki-unable-to-remove-sensitivity-label-powershell.md | 适用: 未标注

### 排查步骤
- Refer [Remove-FileLabel](https://learn.microsoft.com/en-us/powershell/module/purviewinformationprotection/remove-filelabel?view=azureipps)
- If the file is encrypted, check whether the user has Full control permission:
  - Edit the label from Purview portal and confirm whether the user has Owner right (Full control). If not, user cannot remove or change the label.
  - Refer [Configure usage rights](https://learn.microsoft.com/en-us/azure/information-protection/configure-usage-rights#usage-rights-and-descriptions)
- If user does not have Owner/Full control, set up an AIP Super User account. Refer [Configure super users](https://learn.microsoft.com/en-us/azure/information-protection/configure-super-users)
- Collect MPIP client log for error analysis.

`[来源: ado-wiki-unable-to-remove-sensitivity-label-powershell.md]`

---

## Scenario 29: Step 3: Removing encryption from PST or MSG files?
> 来源: ado-wiki-unable-to-remove-sensitivity-label-powershell.md | 适用: 未标注

### 排查步骤
- Use `Remove-FileLabel C:\path\file.pst -RemoveProtection`
- Enable EnableContainerSupport in LabelPolicy Advanced setting for .zip, .rar, .7z, and emails inside PST. Refer [EnableContainerSupport](https://learn.microsoft.com/en-us/powershell/exchange/client-advanced-settings?view=exchange-ps#enablecontainersupport)

`[来源: ado-wiki-unable-to-remove-sensitivity-label-powershell.md]`

---

## Scenario 30: Step 4: Get Assistance
> 来源: ado-wiki-unable-to-remove-sensitivity-label-powershell.md | 适用: 未标注

### 排查步骤
If the steps above do not resolve your issue, get assistance and provide Required Information: MPIP Client.

`[来源: ado-wiki-unable-to-remove-sensitivity-label-powershell.md]`

---
