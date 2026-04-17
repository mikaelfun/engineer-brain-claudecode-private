# AKS ACI 网络与 DNS — escalation -- Comprehensive Troubleshooting Guide

**Entries**: 5 | **Draft sources**: 2 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-aci-kusto-helpers.md, ado-wiki-b-aci-kusto-queries.md
**Generated**: 2026-04-07

---

## Phase 1: Backend issue prevents CG deletion (related to Eme

### aks-301: ACI Container Group deletion fails with Internal Error

**Root Cause**: Backend issue prevents CG deletion (related to Emerging Issue 97623).

**Solution**:
1) Validate via ASI detectors on CG page and caas page; 2) Escalate to EEE ACI/PG for ACIS Action ACI/Delete Container Group Skip Decryption.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FList%20of%20ACI%20issues%20where%20IcM%20is%20required)]`

## Phase 2: Log Uploader or Geneva Metric definitions issue pr

### aks-305: ACI Container Group logs or metrics missing

**Root Cause**: Log Uploader or Geneva Metric definitions issue preventing log/metric collection.

**Solution**:
1) Validate via ASI Metrics tab and Log Uploader Events tab; 2) Missing metrics: EEE checks Geneva Metric definitions; 3) Missing logs: EEE inspects SF cluster components, may transfer to PG.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FList%20of%20ACI%20issues%20where%20IcM%20is%20required)]`

## Phase 3: ACI 有专用的 ICM 模板，标准升级流程通过 ASC 提交；当 ASC 不可用时需要使用备用模板

### aks-296: ACI 问题需要升级 PG 时不知道如何提 ICM

**Root Cause**: ACI 有专用的 ICM 模板，标准升级流程通过 ASC 提交；当 ASC 不可用时需要使用备用模板。

**Solution**:
1) 标准流程：通过 ASC 创建 escalation，参考 wiki 流程文档；2) ASC 不可用时：使用 ICM 模板 https://aka.ms/CRI-ACI 提交 escalation；3) 联系 ACI SME: pkc@microsoft.com 或 ACTGlobal@microsoft.com。

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/pages?path=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI)]`

## Phase 4: Service Fabric fails to deactivate Code Package du

### aks-303: ACI Container Group stopped but containers/IPs still running (Ghost CG)

**Root Cause**: Service Fabric fails to deactivate Code Package due to node issues, causing stopped CG to still have backend caas running.

**Solution**:
1) Query SubscriptionDeployments table via Kusto to find running caas and IPs; 2) To fully stop CG, escalate to EEE for ACIS Action ACI/Stop Container Group; 3) If newer caas running normally, transfer to PG/SF PG.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FList%20of%20ACI%20issues%20where%20IcM%20is%20required)]`

## Phase 5: StandardSpotCores quota exceeded. Default limits: 

### aks-311: ACI Spot Container deployment fails with ContainerGroupQuotaReached for Standard...

**Root Cause**: StandardSpotCores quota exceeded. Default limits: EA subscription=100, Default subscription=10, all others=0. Quota is per-region.

**Solution**:
1) Check core availability per region on Capacity Jarvis dashboard; 2) Check subscription policy via Kusto: cluster('Accprod').database('accprod').SubscriptionPolicy | where subscriptionId == '<id>'; 3) Verify region resource availability at MS docs; 4) Request quota increase via ICM template (https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=w3B1J2) — select StandardSpotCores under Quota Type; 5) Requests ≤50 auto-approved by Geneva automation, >50 requires PG manual approval.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20ACI%20Spot%20Containers%20Quota%20Errors)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | ACI Container Group deletion fails with Internal Error | Backend issue prevents CG deletion (related to Emerging Issu... | 1) Validate via ASI detectors on CG page and caas page; 2) E... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FList%20of%20ACI%20issues%20where%20IcM%20is%20required) |
| 2 | ACI Container Group logs or metrics missing | Log Uploader or Geneva Metric definitions issue preventing l... | 1) Validate via ASI Metrics tab and Log Uploader Events tab;... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FList%20of%20ACI%20issues%20where%20IcM%20is%20required) |
| 3 | ACI 问题需要升级 PG 时不知道如何提 ICM | ACI 有专用的 ICM 模板，标准升级流程通过 ASC 提交；当 ASC 不可用时需要使用备用模板。 | 1) 标准流程：通过 ASC 创建 escalation，参考 wiki 流程文档；2) ASC 不可用时：使用 ICM... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/pages?path=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI) |
| 4 | ACI Container Group stopped but containers/IPs still running (Ghost CG) | Service Fabric fails to deactivate Code Package due to node ... | 1) Query SubscriptionDeployments table via Kusto to find run... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FList%20of%20ACI%20issues%20where%20IcM%20is%20required) |
| 5 | ACI Spot Container deployment fails with ContainerGroupQuotaReached for Standard... | StandardSpotCores quota exceeded. Default limits: EA subscri... | 1) Check core availability per region on Capacity Jarvis das... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20ACI%20Spot%20Containers%20Quota%20Errors) |
