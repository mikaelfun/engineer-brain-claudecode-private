# AKS RBAC 与授权 — authorization — 排查工作流

**来源草稿**: ado-wiki-determining-subscription-for-public-ip.md
**Kusto 引用**: 无
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: Troubleshooting Flow
> 来源: ado-wiki-determining-subscription-for-public-ip.md | 适用: 适用范围未明确

### 排查步骤

##### Step 1 — Identify if IP is Azure-owned and its region

Use [azurewhois](https://github.com/joaguas/azurewhois) tool or [iplocation.net](https://www.iplocation.net/find-ip-address).

##### Step 2 — Get subscription ID via Jarvis

From a SAVM, open Jarvis link: https://portal.microsoftgeneva.com/72649BB5?genevatraceguid=cfedf803-c494-40b6-b64a-1e3360b4ce88

Fill in the IP details to get the subscription ID where the public IP resource resides.

##### Step 3 — Open subscription in ASC

Add the subscription in ASC. Note: If the IP belongs to an internal subscription, the name will be "AKS UNDERLAY - <REGION>".

##### Step 4 — Find the specific resource

In ASC: Resource provider → Microsoft.Network → publicIPAddresses → filter by the IP address. Open the resource to see all details.

---
