---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Log (Kusto and Jarvis) access/Quick Kusto - Nanite using Purview URI"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FLog%20(Kusto%20and%20Jarvis)%20access%2FQuick%20Kusto%20-%20Nanite%20using%20Purview%20URI"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Quick Kusto - Nanite Tool for Purview

## Overview
Nanite allows quick Kusto log search by providing a Purview resource URI. It auto-detects the correct region and Kusto cluster.

## Features
- Auto-selects Kusto queries based on Purview account region
- Auto-fills subscription/account ID into queries
- Auto-fills scan, SHIR, and asset details
- Provides links to troubleshooting guides

## Steps to Use
1. Connect to MSVPN
2. Open PowerShell as Administrator
3. Set execution policy: `Set-ExecutionPolicy unrestricted`
4. Start Nanite: `\\ziz-backup01\case\nanite\startweb.bat` (takes a few minutes, sign-in popup)
5. Paste Purview resource URI into the field → click "Parse Resource URI"
6. For pre-populated queries → click "Run"
7. For queries needing scan details (e.g., {ScanRunId}, {ReportId}) → fill fields on left panel → click "Update" → then "Run"
