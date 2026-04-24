---
source: mslearn
sourceRef: null
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-storage/blobs/performance/diagnose-high-cpu-disk-perfinsights
importDate: 2026-04-21
type: guide-draft
---

# Using PerfInsights to Diagnose High CPU or Disk Usage

## Data Collection Steps

1. Start PerfInsights, enter MS Support request number
2. Select **Custom configuration** > **Performance Diagnostics**
3. Wait for system info collection
4. Click OK when issue persists (starts trace)
5. Wait several minutes for data capture
6. Click OK to stop - results in CollectedData_DateTime.zip

## Analyzing the Report

### Top CPU Consumers Tab
- **High CPU Usage Periods**: Table showing all periods with >30% CPU usage
- **ProcessorsHighCPUUsageBreakdown**: Per-logical-processor usage
- **Top long-running CPU consumers**: Processes consuming most CPU
- **Top spike CPU consumers**: Short burst high-usage processes

### Top Disk Consumers Tab
- **High Disk Usage Periods**: Per-physical-disk usage breakdown
- **Top long-running disk consumers**: Processes with most disk IOs and average IOPS
- **Top spike disk consumers**: Short burst high-disk processes

## Next Steps
- Own services: Use profiler for deep analysis
- Third-party: Disable/uninstall or contact vendor
- Review IOPS and throughput against VM/disk limits
