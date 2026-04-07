# AKS Fleet Manager -- Comprehensive Troubleshooting Guide

**Entries**: 1 | **Draft sources**: 6 | **Kusto queries**: 1
**Source drafts**: ado-wiki-aks-fleet-manager-debug-gates-approvals.md, ado-wiki-aks-fleet-manager-geneva-actions.md, ado-wiki-aks-fleet-manager-overview.md, ado-wiki-b-aks-fleet-manager-kusto-tables.md, ado-wiki-b-aks-fleet-manager-support-tools.md, ado-wiki-b-fleet-manager-faq.md
**Kusto references**: extension-manager.md
**Generated**: 2026-04-07

---

## Phase 1: Gate 和 update run 是独立资源，approve gate 后通过 ServiceBu

### aks-448: AKS Fleet Manager 中客户 approve 了 Gate 后 update run 仍然显示 pending 状态

**Root Cause**: Gate 和 update run 是独立资源，approve gate 后通过 ServiceBus 异步发送 GateDoneEvent 来更新 update run 状态，客户在 approve 后立即查询 update run 状态时尚未完成异步处理。

**Solution**:
1) 告知客户 approve 后等待几秒再查询 update run 状态；2) 若仍有问题，查询 FleetAsyncContextActivityEvents 表（where messageType == "GateDoneEvent"）排查异步处理错误。

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/pages?path=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%20Fleet%20Manager%2FTSG%2FDebug%20Gates%20and%20Approvals)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS Fleet Manager 中客户 approve 了 Gate 后 update run 仍然显示 pending 状态 | Gate 和 update run 是独立资源，approve gate 后通过 ServiceBus 异步发送 Gat... | 1) 告知客户 approve 后等待几秒再查询 update run 状态；2) 若仍有问题，查询 FleetAsyn... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/pages?path=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%20Fleet%20Manager%2FTSG%2FDebug%20Gates%20and%20Approvals) |
