# AKS Fleet Manager -- Quick Reference

**Sources**: 1 | **21V**: None | **Entries**: 1
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS Fleet Manager 中客户 approve 了 Gate 后 update run 仍然显示 pending 状态 | Gate 和 update run 是独立资源，approve gate 后通过 ServiceBus 异步发送 Gat... | 1) 告知客户 approve 后等待几秒再查询 update run 状态；2) 若仍有问题，查询 FleetAsyn... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/pages?path=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%20Fleet%20Manager%2FTSG%2FDebug%20Gates%20and%20Approvals) |

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/fleet-manager.md)
