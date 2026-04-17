# Jarvis Diagnostics for Log Analytics Ingestion

> Source: OneNote - Mooncake POD Support Notebook / MONITOR / Log Analytics / Troubleshooting / Jarvis
> Quality: draft | Needs review before promotion

## Overview
Jarvis-based diagnostic steps for troubleshooting Log Analytics data ingestion issues, especially useful in Mooncake where ASC features are limited.

## Diagnostic Steps

### 1. Check InMem Worker Role Processing Events
- **Jarvis Link**: `https://jarvis-west.dc.ad.msft.net/C2A69DC6`
- Replace workspaceID in AnyField filter
- Shows real-time processing events for the workspace

### 2. Check If Logs Are Sent to OMS/ODS
- **Jarvis Link**: `https://jarvis-west.dc.ad.msft.net/DDF11900`
- Add filter: `workspaceId = "<workspace-id>"`
- **Key column**: `numberOfRecordsWritten`

#### Decision Tree
```
numberOfRecordsWritten > 0?
  YES → Data reaching ODS correctly
        → Next: verify ODS ingestion (see HT wiki links below)
  NO  → Issue sending data to ODS
        → Escalate to Azure Monitor Team via IcM
```

### 3. Check Ingestion Errors
- [HT: How to check for ingestion errors](https://supportability.visualstudio.com/AzureLogAnalytics/_wiki/wikis/Azure-Log-Analytics.wiki/414112/HT-How-to-check-for-ingestion-errors?anchor=check-ingestion-errors-using-jarvis---governance-clouds)

### 4. Check Agent Data Types Reaching ODS
- [HT: What Agent data types are reaching ODS](https://supportability.visualstudio.com/AzureLogAnalytics/_wiki/wikis/Azure-Log-Analytics.wiki/417841/HT-What-Agent-data-types-are-reaching-ODS)

## OMS Agent Log Collection
For container-related issues, collect logs via:
```bash
# Linux OMS Agent log collection
git clone https://github.com/Microsoft/OMS-Agent-for-Linux.git
cd OMS-Agent-for-Linux/tools/LogCollector
# Follow README for log collection
```

## When to Escalate
- If `numberOfRecordsWritten == 0` → IcM to Azure Monitor Team
- If data reaches ODS but not visible in portal → IcM to OMS team
- Always follow TSG for Azure Diagnostics Logs/Metrics before engaging Highlanders team

## 21v Applicability
Jarvis is the primary diagnostic tool for Mooncake Log Analytics troubleshooting due to ASC feature gaps.
