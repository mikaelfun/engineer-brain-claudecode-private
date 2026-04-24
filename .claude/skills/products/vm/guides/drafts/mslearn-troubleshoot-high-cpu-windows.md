---
source: mslearn
sourceRef: null
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-high-cpu-issues-azure-windows-vm"
importDate: "2026-04-24"
type: guide-draft
---

# Troubleshoot High CPU Issues on Azure Windows VMs

## Common Factors
1. Recent code change/deployment (IIS, SharePoint, SQL Server, third-party apps)
2. Recent OS/application update
3. Query change or outdated indexes (SQL Server, Oracle)
4. Azure VM-specific: RDAgent, Monitoring Agent, MMA agent, Security client extensions

## Azure Caveats
- B (Burst Mode) Series VMs: limited CPU credits in production
- Underestimated vCPU count vs workload needs
- Known applications (SQL, IIS, RDS, SharePoint) have Azure best practices for minimal config

## Scoping Questions
1. Pattern? Time-of-day, weekly, monthly?
2. Started after code change or Windows update?
3. Workload increase (users, data, reports)?
4. After redeployment/restart/SKU change/new extension/LB changes?

## Recommended Tools
1. **PerfInsights** (Azure-recommended) - best practices + CPU/Memory/IO tabs
2. **Perfmon** - traditional Windows performance monitoring
3. **Process Explorer** - real-time process CPU usage
4. **Xperf/WPR** - kernel-level tracing

## Diagnostic Steps
1. Run PerfInsights via Azure portal (Performance diagnostics extension)
2. Or install PerfInsights manually inside VM
3. Check Task Manager / Resource Monitor for top CPU consumers
4. For SQL Server: identify top queries by CPU time
5. For IIS: check application pool recycling and request queue
