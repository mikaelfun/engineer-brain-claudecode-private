# AKS DNS 解析排查 — dns-resolution — 排查工作流

**来源草稿**: ado-wiki-ampls-how-to-guide.md
**Kusto 引用**: 无
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: Azure Monitor Private Link Scope (AMPLS) How To Guide
> 来源: ado-wiki-ampls-how-to-guide.md | 适用: 适用范围未明确

### 排查步骤

#### Azure Monitor Private Link Scope (AMPLS) How To Guide

#### Overview

Azure Monitor Private Link Scope (AMPLS) enables secure, private connectivity from VNets to Azure Monitor resources:
- Log Analytics Workspaces (LAW)
- Data Collection Endpoints (DCE)
- Application Insights components
- Managed Prometheus ingestion endpoints

AMPLS ensures all monitoring traffic stays within Azure backbone, eliminates public exposure.

#### Prerequisites

- Contributor or Owner permissions on the resource group
- Monitoring Reader/Contributor for viewing data
- An existing VNet for Private Endpoint
- A Log Analytics Workspace or Data Collection Endpoint

#### Step 1: Create an AMPLS

1. Azure Portal -> Search "Azure Monitor Private Link Scopes" -> Create
2. Choose Subscription, Resource group, Name (e.g., `core-monitoring-ampls`)
3. Ingestion Access Mode: **Private Only** (recommended for secured environments)
4. Review + Create

#### Step 2: Connect Azure Monitor Resources to AMPLS

1. Open AMPLS -> Azure Monitor Resources -> Add
2. Select: Log Analytics Workspace, Application Insights, Data Collection Endpoints (DCE)
3. Apply

#### Step 3: Create a Private Endpoint for AMPLS

1. AMPLS blade -> Private Endpoint connections -> Add
2. Choose target VNet and subnet for private IP allocation
3. Complete wizard

This allocates multiple private IPs from VNet, maps them to internal ingestion/query FQDNs.

#### Step 4: Configure Private DNS

Private DNS zones (e.g., `privatelink.monitor.azure.com`) are automatically created/linked.

##### Custom DNS (on-prem / hybrid)
- Forward required Azure Monitor domains to Azure DNS, or
- Manually add conditional forwarders

#### Step 5: (Optional) Disable Public Network Access

For Log Analytics Workspace:
1. Go to Networking
2. Set Ingestion = Private
3. Set Query = Private
4. Save

#### Validation Checklist

From an AKS node or VM in the VNet:

```bash
nslookup <workspace-id>.ods.opinsights.azure.com
nslookup <workspace-id>.agentsvc.azure-automation.net
```

Verify private IPs are returned (10.x.x.x range).

---
