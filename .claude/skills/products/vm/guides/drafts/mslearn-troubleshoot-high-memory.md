# Troubleshoot High Memory on Azure Windows VMs

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/azure-windows-vm-memory-issue

## Scoping Questions
1. Is there a time pattern (daily/weekly/monthly)?
2. Did it start after a code change, OS update, or app deployment?
3. Did workload increase (more users, data, reports)?
4. Azure-specific: after redeployment, SKU change, new extension, LB change, VMSS scale event?

## Azure-Specific Considerations
- **Undersized SKU**: memory specs insufficient for workload
- **Multi-User (AVD)**: factor resources based on concurrent sessions
- **In-Memory apps**: MongoDB etc. require VM type matching memory needs
- **Memory-to-CPU ratio**: use memory-optimized VMs (E-series, M-series) for memory-intensive workloads

## Key Indicators
- **Available MBytes < 200 MB** = red flag for memory pressure
- **Event ID 2004** in System log = warning with top 3 consuming processes
- **Committed Memory %** high = memory exhaustion indicator

## Diagnostic Tools (Priority Order)

### 1. PerfInsights (Recommended)
- Install via Azure Portal > Performance diagnostics
- Or run: `PerfInsights /run advanced xp /d 900 /AcceptDisclaimerAndShareDiagnostics`
- Check **Findings** tab for High/Medium memory impact
- Check **Top Memory Consumers** tab:
  - High Memory Usage Periods (time bar + Committed Memory %)
  - Top Memory Consumers (process details sorted by avg memory)

### 2. Perfmon
- Key counter: `Memory > Available MBytes`
- Per-process: `Process > Working Set / Private Bytes / Virtual Bytes > All Instances`
- Look for gradual/steep rise indicating memory leak
- Use PAL Tool for automated .blg analysis

### 3. Additional Tools
- RAMMAP: detailed memory allocation view
- Procmon: process-level monitoring
- Resource Explorer
- xPerf Windows Toolkit

### 4. Azure Monitor
- VM > Metrics > Available Memory Bytes
- Set alerts for memory threshold
- Enable Guest metrics for granular counters

## Common Culprits
| Process | Next Steps |
|---------|-----------|
| sqlservr.exe | Check MaxServerMemory setting, query memory grants |
| w3wp.exe (IIS) | App pool recycling, check for memory leaks |
| WmiPrvSE / SvcHost | Ensure latest OS cumulative patch |
| RDAgent/OMS/Security | Ensure latest extension version |

## Reactive Troubleshooting
- Check Azure Monitor historical metrics for memory patterns
- For repeating patterns: schedule Perfmon with Logman
- One-time occurrence: correlate with Event ID 2004 in System log
