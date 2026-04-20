---
title: MMA (Microsoft Monitoring Agent) Troubleshooting Basics
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/azure-monitor-agent/windows-agents/mma-troubleshoot-basics
product: monitor
date: 2026-04-18
---

# MMA Troubleshooting Basics

> Note: MMA (Log Analytics agent) was retired November 2024. Migrate to Azure Monitor Agent (AMA).

## Basic Requirements
- Supported Windows OS
- TLS 1.2 protocol
- Workspace ID configured
- Valid MMA certificate (certlm.msc > Microsoft Monitoring Agent > Certificates)
- Proxy settings via Log Analytics gateway or proxy server

## Find Agent Version
- Control Panel > Microsoft Monitoring Agent > Properties tab
- PowerShell: `Get-WmiObject -Class Win32_Product -Filter "Name='Microsoft Monitoring Agent'"`
- KQL: `Heartbeat | summarize arg_max(TimeGenerated, *) by Computer`

## Collect ETL Trace
1. Navigate to `%programfiles%\Microsoft Monitoring Agent\Agent\Tools`
2. `StopTracing.cmd`
3. `StartTracing.cmd INF` (INF must be uppercase)
4. Reproduce the issue
5. `StopTracing.cmd`
6. `FormatTracing.cmd`
7. Collect `*.log` from `%windowsroot%\Logs\OpsMgrTrace`

## Data Buffer Behavior
- Max cache: 8.5 hours, retry every 20s -> 30s -> 60s -> 120s -> up to 9 min
- Default buffer: 100 MB (min 5 MB, max 1.5 GB)
- Registry: `HKLM\SYSTEM\CurrentControlSet\Services\HealthService\Parameters\Management Groups\<ID>\MaximumQueueSizeKb`
- When disconnected: exponential backoff, discard oldest data at buffer limit
