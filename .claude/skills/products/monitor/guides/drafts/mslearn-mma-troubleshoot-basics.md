---
source: mslearn
sourceRef: null
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/azure-monitor-agent/windows-agents/mma-troubleshoot-basics"
importDate: "2026-04-23"
type: guide-draft
---

# Azure Log Analytics Monitoring Agent Troubleshooting Basics

## Basic Requirements
- Supported OS: See Log Analytics Agent supported operating systems
- Networking: TLS 1.2 required
- Workspace ID must be configured when connecting to Log Analytics workspace
- Monitoring Agent certificate must have correct server hostname (certlm.msc)
- Proxy: Configure through Log Analytics gateway or proxy server

## Finding Agent Version
- On VM/server: Control Panel > System and Security > Microsoft Monitoring Agent > Properties
- PowerShell: Get-WmiObject -Class Win32_Product -Filter Name=Microsoft Monitoring Agent
- Azure portal: Heartbeat | summarize arg_max(TimeGenerated, *) by Computer

## ETL Trace Collection
1. Navigate to %programfiles%\Microsoft Monitoring Agent\Agent\Tools
2. Run StopTracing.cmd
3. Run StartTracing.cmd INF (INF must be uppercase)
4. Reproduce the issue
5. Run StopTracing.cmd then FormatTracing.cmd
6. Collect *.log files from %windowsroot%\Logs\OpsMgrTrace

## FAQ
- Data cache duration: Max 8.5 hours, retries every 20s initially, exponential backoff up to 9 min
- Cache size: Default 100 MB (min 5 MB, max 1.5 GB), configurable via registry MaximumQueueSizeKb
- Connection unavailable: Agent backs off exponentially, discards oldest data when buffer full
