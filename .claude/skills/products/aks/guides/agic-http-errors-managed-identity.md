# AKS AGIC HTTP 错误码排查 — managed-identity -- Quick Reference

**Sources**: 1 | **21V**: All | **Entries**: 4
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AGIC pod logs show 'AuthorizationFailed' error when trying to fetch or apply con... | Missing required RBAC role assignments for AGIC identity. AG... | Create the missing role assignments: assign AGIC managed ide... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20AGIC%2F%5BTSG%5D%20AGIC%20Troubleshooting%20AGIC%20AppGw%20Integration%20Issues) |
| 2 | AGIC pod logs show AuthorizationFailed error when configuring Application Gatewa... | AGIC identity missing role assignments. Required: Contributo... | Assign Contributor role on AppGW resource and Reader role on... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/AKS%20Network%20Troubleshooting%20Methodology/%5BTSG%5D%20AGIC/%5BTSG%5D%20AGIC%20Troubleshooting%20AGIC%20AppGw%20Integration%20Issues) |
| 3 | AGIC pod 日志显示 AuthorizationFailed 错误，AGIC 无法获取或更新 Application Gateway 配置 | AGIC 使用的 Managed Identity 缺少必要的 RBAC 角色分配。需要 Contributor 角色在... | 为 AGIC identity 添加角色分配：1. 在 Application Gateway 上分配 Contribu... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20AGIC%2F%5BTSG%5D%20AGIC%20Troubleshooting%20AGIC%20AppGw%20Integration%20Issues) |
| 4 | AGIC pod logs show 'AuthorizationFailed' error when trying to configure Applicat... | AGIC identity missing required role assignments: Contributor... | Create role assignments: (1) Contributor to AGIC identity on... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20AGIC%2F%5BTSG%5D%20AGIC%20Troubleshooting%20AGIC%20AppGw%20Integration%20Issues) |

## Quick Troubleshooting Path

1. Check: Create the missing role assignments: assign AGIC managed identity as Contributor on the Application  `[source: ado-wiki]`
2. Check: Assign Contributor role on AppGW resource and Reader role on AppGW resource group to AGIC identity `[source: ado-wiki]`
3. Check: 为 AGIC identity 添加角色分配：1 `[source: ado-wiki]`
