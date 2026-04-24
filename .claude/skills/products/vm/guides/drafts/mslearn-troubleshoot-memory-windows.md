---
source: mslearn
sourceRef: null
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/azure-windows-vm-memory-issue"
importDate: "2026-04-24"
type: guide-draft
---

# Troubleshoot High Memory Issues on Azure Windows VMs

## What is Memory Pressure
- OS keeps adjusting active pages in RAM with swap file when physical RAM demand exceeds supply
- Memory leak: coding glitches cause OS to seek more allocations, leading to virtual memory exhaustion

## Common Factors
1. Recent code change/deployment (IIS, SharePoint, SQL Server, third-party apps)
2. Recent OS/application update
3. Query change or outdated indexes causing excessive data page loads
4. Azure VM-specific: RDAgent, Monitoring Agent, MMA agent, Security client
5. Multi-user setup (Azure Virtual Desktop) without proper memory factoring
6. In-memory apps (e.g., MongoDB) configured to use large amounts of RAM

## Azure Caveats
- VM SKU memory spec may be insufficient for workload
- Multi-user (AVD) scenarios need memory factored per session
- SQL Server MaxServerMemory setting critical
- Known apps have Azure best practices for minimal config

## Scoping Questions
1. Pattern? Time-of-day, weekly, monthly?
2. Started after code change, Windows update, or new app deployment?
3. Workload change (users, data, reports)?
4. After redeployment/restart/SKU change/new extension?
5. VMSS scale in/out causing invariable load?

## Recommended Tools
1. **PerfInsights** (Azure-recommended) - memory analysis tabs
2. **Perfmon** - Memory\Available MBytes, Pages/sec counters
3. **RAMMAP** (Sysinternals) - detailed memory allocation view
4. **Process Explorer** - per-process memory usage
5. **Azure Monitor** - Available Memory Bytes metric

## Key Perfmon Counters
- Memory\Available MBytes (< 300MB = critical)
- Memory\Pages/sec (sustained > 500 = pressure)
- Process(*)\Working Set (per-process memory)
- Paging File\% Usage
