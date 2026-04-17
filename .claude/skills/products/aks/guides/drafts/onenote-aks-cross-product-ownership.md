# AKS Cross-Product Troubleshooting Ownership Matrix

> Draft extracted from PG Sync meeting notes (FY20). Subject to updates.

## Ownership Rules

| Cross-Product Scenario | Who Initiates Troubleshooting | Notes |
|---|---|---|
| AKS + Monitor (agent node insights/metrics on portal) | Monitor PG | Insights, metrics displayed on portal for agent nodes |
| AKS + Monitor (master node logs) | AKS PG | Control plane / master logs |
| AKS + Monitor (monitor-related pod issues) | AKS PG | e.g., omsagent pod crashes, log collection failures |
| AKS + AAD | AKS PG | Generally configuration issues; start with AKS PG |
| AKS + Networking (Calico network policy) | CSS initiates troubleshooting | CSS should start investigation, escalate to AKS PG if needed |
| AKS + Networking (Azure CNI / kubenet) | AKS PG or Networking PG | Depends on whether issue is AKS-managed or customer VNet config |

## Source

- PG Sync meeting: 2020-05-14
- Discussed in: Mooncake POD Support Notebook/POD/VMSCIM/4. Services/AKS/##Regular Sync up with PG/###FY20/20200514.md

## Key Takeaways

1. For monitor-related issues, distinguish between **agent node metrics** (Monitor PG) vs **master/control plane logs** (AKS PG)
2. AAD integration issues almost always start with AKS PG regardless of AAD team involvement
3. CSS engineers should attempt Calico network policy troubleshooting before escalating
4. Reference: https://docs.azure.cn/zh-cn/aks/use-network-policies
