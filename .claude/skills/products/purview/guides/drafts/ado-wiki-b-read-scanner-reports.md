---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/MPIP Scanner/How to: MPIP Scanner/How to: Read Scanner Reports"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FMPIP%20Scanner%2FHow%20to%3A%20MPIP%20Scanner%2FHow%20to%3A%20Read%20Scanner%20Reports"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to: Read MPIP Scanner Reports

## Scenario

This guide explains how to interpret the MPIP Scanner report files (Summary and Detailed CSV).

## Prerequisites

- A copy of the Scanner report CSV file (and/or Summary.txt)

---

## Summary Report Fields

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

## Detailed Report Columns

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

## Getting Further Assistance

If report interpretation does not resolve the issue, check the [required information](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FMPIP%20Scanner%2FRequired%20Information%3A%20MPIP%20Scanner) and escalate via AIP Tech-Chat.
