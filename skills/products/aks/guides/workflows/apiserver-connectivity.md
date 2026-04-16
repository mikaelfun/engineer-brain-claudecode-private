# AKS API Server 连接与隧道 — 排查工作流

**来源草稿**: ado-wiki-b-aks-cluster-stuck-on-starting.md, onenote-aks-fault-domain-kusto.md, onenote-aks-kusto-queries-reference.md
**Kusto 引用**: 无
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: AKS Cluster Stuck on Starting
> 来源: ado-wiki-b-aks-cluster-stuck-on-starting.md | 适用: 适用范围未明确

### 排查步骤

#### AKS Cluster Stuck on Starting

#### Summary

Customer is trying to start a stopped AKS cluster and experiencing long startup times. AKS cluster stuck in Starting state for hours with worker nodes in `NodeNotReady` status.

> **Note**: The same behavior may be observed in CRUD operations, not just start operations. Any operation may fail and the AKS cluster may become stuck with worker nodes in NodeNotReady status indefinitely.

#### Possible Causes

- Internal operation errors
- Customer quota errors
- Connectivity errors (most common)
- Allocation constraints
- VNET/Subnet full errors
- SKU restrictions
- VMSS errors
- Expired SPN credentials
- Infrastructure issues (maintenance, incidents)

#### Investigation via ASI

Use Azure Service Insights (ASI) for recent issues (<15 days):

1. Check **State and Health Timelines** for errors
2. Filter by `StartManagedCluster` in the **Mutating Operations** timeline
3. Click tooltip for **Operation Details** popup

#### Investigation via Kusto

##### Check STOP/START Operations

```kql
union cluster("Aks").database("AKSprod").FrontEndContextActivity, cluster("Aks").database("AKSprod").AsyncContextActivity
| where subscriptionID == "<subId>"
| where resourceName contains "<clusterName>"
| where PreciseTimeStamp between (datetime(start) .. datetime(end))
| where msg contains "StopManagedClusterHandle" or msg contains "StartManagedClusterHandle"
| project PreciseTimeStamp, operationID, correlationID, level, suboperationName, msg
| sort by PreciseTimeStamp desc
```

#### Common Scenarios

##### Connectivity Errors (Most Common)

**Symptom**: Nodes cannot register with the API server.

**Kubelet log errors**:
```
Unable to register node with API server: Post "https://<fqdn>:443/api/v1/nodes": tls: failed to verify certificate: x509: certificate signed by unknown authority
```

And:
```
No valid client certificate is found but the server is not responsive. A restart may be necessary to retrieve new initial credentials.
```

**Root Cause**: Network/firewall issue preventing internal traffic from reaching the AKS API server. A route may be blocking traffic.

**Additional symptom**: `ImagePullBackOff` errors on all pods (especially system pods like ama-logs, csi-blob):
```
Back-off pulling image "mcr.microsoft.com/oss/kubernetes-csi/blob-csi:v1.20.2"
```

##### Resolution Steps

1. Check customer's UDR/route tables for routes that may intercept API server traffic
2. Verify NSG rules allow required AKS traffic
3. Check if firewall is blocking MCR endpoints
4. If certificate issue: may need cluster certificate rotation
5. For SPN expiry: rotate credentials via `az aks update-credentials`
6. For quota issues: request quota increase or use different VM SKU

#### General Mitigation

- Identify the specific error from ASI/Kusto operation details
- Address the root cause (network, quota, SPN, etc.)
- Trigger a reconcile or retry the start operation

---

## Scenario 2: Troubleshooting Flow
> 来源: onenote-aks-fault-domain-kusto.md | 适用: 适用范围未明确

### 排查步骤

1. Run query above, sort faultDomain ascending
2. Map Kusto faultDomain IDs to human-readable Fault Domain IDs (FD1, FD2, etc.)
3. Portal shows FaultDomain=1 as default - platform distributes VMSS instances across fault domains on best-effort basis

---

## Scenario 3: Troubleshooting Flow
> 来源: onenote-aks-kusto-queries-reference.md | 适用: 适用范围未明确

### 排查步骤

1. **IncomingRequestTrace** - Initial request arrives
2. **FrontEndQoSEvents** - Frontend processes request
3. **FrontEndContextActivity** - Frontend detailed logs (parse msg as JSON for error codes)
4. **AsyncQoSEvents** - Backend async processing
5. **AsyncContextActivity** - Backend detailed logs
6. **HcpSyncContextActivity** - HCP component called
7. **OverlaymgrEvents** - Overlay components readiness
8. **BlackboxMonitoringActivity** - Ongoing health monitoring

---
