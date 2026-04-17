# Troubleshoot High CPU on Azure Windows VMs

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-high-cpu-issues-azure-windows-vm

## Scoping Questions
1. Is there a time pattern (daily/weekly/monthly)?
2. Did it start after a code change or OS update?
3. Did workload increase (more users, data, reports)?
4. Azure-specific: after redeployment, SKU change, new extension, LB change?

## Azure-Specific Considerations
- **B-series VMs**: CPU credits exhaust in sustained workloads, not for production
- **Undersized SKU**: vCPU count may be insufficient for workload
- **Known processes**: RDAgent, Monitoring Agent, MMA agent, Security client can cause high CPU

## Diagnostic Tools (Priority Order)

### 1. PerfInsights (Recommended)
- Install via Azure Portal > Performance diagnostics
- Or run from VM: `PerfInsights /run advanced xp /d 300 /AcceptDisclaimerAndShareDiagnostics`
- Check **Findings** tab for High/Medium impact processes
- Check **Top CPU Consumers** tab for per-core and per-process analysis
- Look at **Top Long Running CPU Consumers** for sustained issues

### 2. Perfmon
- Key counters: `Processor Information > %Processor Time > _Total`
- Per-process: `Process > %ProcessorTime > All Instances`
- Use Histogram view to quickly identify culprit processes
- Schedule long-term collection: `Logman create counter ...`

### 3. Azure Monitor
- Basic metrics: VM > Metrics > Percentage CPU
- Enable Guest metrics for Perfmon counters in portal
- Set up alerts for CPU threshold

## Common Culprits
| Process | Next Steps |
|---------|-----------|
| sqlservr.exe | Analyze query plans, check outdated indexes |
| w3wp.exe (IIS) | Check app code changes, worker process recycling |
| WMI/Lsass.exe | System process investigation |
| RDAgent/OMS/Security | Check for latest extension version, contact Azure Support |

## Reactive Troubleshooting
- If issue already passed: check Azure Monitor historical data
- For repeating patterns: schedule Perfmon collection during expected window
