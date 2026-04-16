# Purview MPIP / AIP Scanner — 排查工作流

**来源草稿**: `ado-wiki-b-collect-mpip-scanner-logs.md`, `ado-wiki-b-enable-trace-level-logging.md`, `ado-wiki-b-learn-mpip-scanner.md`, `ado-wiki-b-read-scanner-reports.md`, `ado-wiki-b-required-information-mpip-scanner.md`, `ado-wiki-b-support-boundaries-mpip-scanner.md`
**Kusto 引用**: 无
**场景数**: 17
**生成日期**: 2026-04-07

---

## Scenario 1: Introduction
> 来源: ado-wiki-b-collect-mpip-scanner-logs.md | 适用: 未标注

### 排查步骤
This is the way to collect MPIP Scanner logs.

`[来源: ado-wiki-b-collect-mpip-scanner-logs.md]`

---

## Scenario 2: Steps
> 来源: ado-wiki-b-collect-mpip-scanner-logs.md | 适用: 未标注

### 排查步骤
Provide the following link to the customer to collect logs using the `Export-DebugLogs` PowerShell cmdlet:

```
https://learn.microsoft.com/en-us/powershell/module/purviewinformationprotection/export-debuglogs
```

The `Export-DebugLogs` cmdlet bundles all MPIP Scanner diagnostic logs into a ZIP archive for analysis.

`[来源: ado-wiki-b-collect-mpip-scanner-logs.md]`

---

## Scenario 3: Introduction
> 来源: ado-wiki-b-enable-trace-level-logging.md | 适用: 未标注

### 排查步骤
How to enable Trace level logging for MPIP Scanner. Trace-level logs write significantly more detail to the `msipscanner.iplog` file and are useful for diagnosing complex Scanner issues.

`[来源: ado-wiki-b-enable-trace-level-logging.md]`

---

## Scenario 4: Step-by-Step Instructions
> 来源: ado-wiki-b-enable-trace-level-logging.md | 适用: 未标注

### 排查步骤
1. Log into the Scanner server with the **Scanner service account**
2. Open **Registry Editor** (`regedit`)
3. Navigate to:
   ```
   HKEY_CURRENT_USER\Software\Microsoft\MSIP
   ```
4. Add the following registry value:

   | Field | Value |
   |-------|-------|
   | Name  | `LogLevel` |
   | Type  | `REG_SZ` |
   | Value | `Trace` |

5. Restart the **Microsoft Purview Information Protection Scanner** service

`[来源: ado-wiki-b-enable-trace-level-logging.md]`

---

## Scenario 5: Result
> 来源: ado-wiki-b-enable-trace-level-logging.md | 适用: 未标注

### 排查步骤
Once this key is inserted, subsequent scanner runs will write more verbose data into `msipscanner.iplog`. Remember to remove or reset the `LogLevel` value after capturing diagnostic logs to avoid excessive log file growth.

`[来源: ado-wiki-b-enable-trace-level-logging.md]`

---

## Scenario 6: Learn: MPIP Scanner — Public Documentation Index
> 来源: ado-wiki-b-learn-mpip-scanner.md | 适用: 未标注

### 排查步骤
Quick reference for official Microsoft Purview Information Protection Scanner documentation.

`[来源: ado-wiki-b-learn-mpip-scanner.md]`

---

## Scenario 7: Public Docs
> 来源: ado-wiki-b-learn-mpip-scanner.md | 适用: 未标注

### 排查步骤
| Topic | Link |
|-------|------|
| Overview | [Learn about the Microsoft Purview Information Protection scanner](https://learn.microsoft.com/en-us/purview/deploy-scanner) |
| Prerequisites | [Get started with the information protection scanner](https://learn.microsoft.com/en-us/purview/deploy-scanner-prereqs) |
| Configure & Install | [Configure and install the information protection scanner](https://learn.microsoft.com/en-us/purview/deploy-scanner-configure-install) |
| Running the Scanner | [Running the Microsoft Purview Information Protection scanner](https://learn.microsoft.com/en-us/purview/deploy-scanner-manage) |
| Supported SITs | [Sensitive Information Types supported by MPIP Scanner](https://learn.microsoft.com/en-us/purview/deploy-scanner-supported-sits) |
| Upgrade / Migrate | [Upgrade the Microsoft Purview Information Protection scanner](https://learn.microsoft.com/en-us/purview/upgrade-scanner-migrate) |
| Troubleshooting | [Scanner Troubleshooting Guide](https://learn.microsoft.com/en-us/microsoft-365/troubleshoot/information-protection-scanner/resolve-deployment-issues) |

`[来源: ado-wiki-b-learn-mpip-scanner.md]`

---

## Scenario 8: Scenario
> 来源: ado-wiki-b-read-scanner-reports.md | 适用: 未标注

### 排查步骤
This guide explains how to interpret the MPIP Scanner report files (Summary and Detailed CSV).

`[来源: ado-wiki-b-read-scanner-reports.md]`

---

## Scenario 9: Summary Report Fields
> 来源: ado-wiki-b-read-scanner-reports.md | 适用: 未标注

### 排查步骤
| Field | Meaning |
|-------|---------|
| **Scanned Files** | Total files scanned, including successful, skipped, and failed |
| **Classified** | In discovery/what-if mode: files that have or would get a classification/protection label. In Enforce mode: files labeled |
| **Labeled** | Files that had a classification or protection label applied by the Scanner |
| **Remove Label** | Files that had their label removed by the Scanner |
| **Protected** | Files that had a label applied that enables protection. In discovery: what would be protected if Enforce were on |
| **Remove Protection** | Files that had their protection removed by the Scanner |
| **Files with matched information types** | Files matched with the information types defined in the scan job |
| **Skipped due to no match** | Files skipped because they didn't match scan/labeling conditions, or already had a label (e.g., no default label configured, or ran `Start-AIPScan -Reset`) |
| **Skipped due to not being supported** | Files skipped because their format doesn't support a classification label. Note: if a default label is configured for unsupported files, they count as "Skipped – no match found" |
| **Skipped due to already labeled** | Files skipped because they already had a label assigned (e.g., trying to apply a lower-sensitivity label when "Allow label downgrade" is off) |
| **Skipped due to already scanned** | (Delta scan only) Files unchanged since last scan — not re-scanned |
| **Skipped due to requesting justification** | Files skipped because the Scanner would need to justify a label sensitivity change |
| **Skipped due to unknown reason** | Files skipped due to other unrecognized errors |
| **Skipped due to Excluded** | Files whose extension was excluded in the content scan job |
| **Skipped due to Attribute** | Files skipped due to an advanced setting (e.g., read-only attribute skip) |
| **Failed** | Files that errored during scan (e.g., protected with non-RMS technology) |

> **Note:** To see *why* specific files were skipped, set the Scanner reporting level to **Debug**:
> `Set-ScannerConfiguration` — see [Microsoft Docs](https://learn.microsoft.com/en-us/powershell/module/purviewinformationprotection/set-scannerconfiguration?view=azureipps)

---

`[来源: ado-wiki-b-read-scanner-reports.md]`

---

## Scenario 10: Detailed Report Columns
> 来源: ado-wiki-b-read-scanner-reports.md | 适用: 未标注

### 排查步骤
| Column | Meaning |
|--------|---------|
| **Repository** | Path where the scanned file resided (e.g., `\\Company\FileShare`) |
| **File Name** | Name of the scanned file |
| **Status** | Action result: `Success`, `Fail`, or `Skipped` (Skipped only visible at Debug log level) |
| **Comment** | Additional info / error description (e.g., "No label or action to apply") |
| **Current Label** | Label already applied to the file before scan |
| **Current Label ID** | GUID of the pre-existing label |
| **Applied Label** | Label Scanner applied (or would apply in discovery mode) |
| **Applied Label ID** | GUID of the label applied by Scanner |
| **Condition Name** | Legacy field (AIP Classic Scanner only — not used in UL Scanner) |
| **Information Type Name** | Sensitive information type(s) detected by the Scanner |
| **Matched Information Types String** | Actual data in the document that matched the information type (if configured) |
| **Action** | Action taken by Scanner: `Labelled`, `Protected`, or `Skipped` |
| **Matched String** | Legacy field (AIP Classic Scanner only — not used in UL Scanner) |
| **Last Modified** | Date file was last modified |
| **Last Modified By** | Username that last accessed the file |
| **Protection Before Action** | Whether file was protected before scan (`True`/`False`) |
| **Protection After Action** | Whether file was protected after scan (`True`/`False`) |

---

`[来源: ado-wiki-b-read-scanner-reports.md]`

---

## Scenario 11: Getting Further Assistance
> 来源: ado-wiki-b-read-scanner-reports.md | 适用: 未标注

### 排查步骤
If report interpretation does not resolve the issue, check the [required information](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FMPIP%20Scanner%2FRequired%20Information%3A%20MPIP%20Scanner) and escalate via AIP Tech-Chat.

`[来源: ado-wiki-b-read-scanner-reports.md]`

---

## Scenario 12: Required Information: MPIP Scanner
> 来源: ado-wiki-b-required-information-mpip-scanner.md | 适用: 未标注

### 排查步骤
Checklist of information to collect before creating a Scanner escalation.

`[来源: ado-wiki-b-required-information-mpip-scanner.md]`

---

## Scenario 13: Before Escalating
> 来源: ado-wiki-b-required-information-mpip-scanner.md | 适用: 未标注

### 排查步骤
**Always check the AIP Tech-Chat first:**
[AIP Tech-Chat (Teams)](https://teams.microsoft.com/l/channel/19%3A849b72f90c0a4fda90faeb21fac6f258%40thread.tacv2/Tech%20Chat%20-%20AIP?groupId=2779d776-13f4-4e4f-a72e-1035aa299932&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47)

`[来源: ado-wiki-b-required-information-mpip-scanner.md]`

---

## Scenario 14: Required Information for Escalation
> 来源: ado-wiki-b-required-information-mpip-scanner.md | 适用: 未标注

### 排查步骤
When creating an escalation, collect:

1. **Full explanation** of the issue the customer is experiencing on the Scanner server
2. **Full MPIP Scanner logs** — collected while the Scanner service account is logged on, using the following command to export zipped logs:
   ```
   Export-DebugLogs
   ```
   Reference: https://learn.microsoft.com/en-us/powershell/module/purviewinformationprotection/export-debuglogs

`[来源: ado-wiki-b-required-information-mpip-scanner.md]`

---

## Scenario 15: Support Boundaries: MPIP Scanner
> 来源: ado-wiki-b-support-boundaries-mpip-scanner.md | 适用: 未标注

### 排查步骤
Routing reference for MPIP Scanner vs MPIP Client issues.

`[来源: ado-wiki-b-support-boundaries-mpip-scanner.md]`

---

## Scenario 16: Support Ownership Table
> 来源: ado-wiki-b-support-boundaries-mpip-scanner.md | 适用: 未标注

### 排查步骤
| Support Topic | Workload | Support Owner | DfM SAP | Scope | TSG Link |
|---------------|----------|---------------|---------|-------|----------|
| **MPIP Scanner** | Microsoft Purview Information Protection **Scanner** | MPIP (MIP Platform services) | `Security/Microsoft Purview Compliance/Microsoft Purview Information Protection/Scanner` | Scanner issues **only** | [MPIP Scanner TSG](https://aka.ms/MPIPScannerTSG) |
| **MPIP Client** | Microsoft Purview Information Protection **Client** | MPIP (MIP Platform services) | `Security/Microsoft Purview Compliance/Microsoft Purview Information Protection` | MPIP Viewer, right-click "Apply Sensitivity Label with Microsoft Purview", MPIP PowerShell | [MPIP Client TSG](https://aka.ms/MPIPClientTSG) |

`[来源: ado-wiki-b-support-boundaries-mpip-scanner.md]`

---

## Scenario 17: Key Routing Notes
> 来源: ado-wiki-b-support-boundaries-mpip-scanner.md | 适用: 未标注

### 排查步骤
- **Scanner issues** → use the `/Scanner` SAP suffix
- **Client issues** (Viewer, right-click label, PowerShell) → use the base MPIP SAP path (no `/Scanner`)
- Both are owned by the **MPIP (MIP Platform services)** team

`[来源: ado-wiki-b-support-boundaries-mpip-scanner.md]`

---
