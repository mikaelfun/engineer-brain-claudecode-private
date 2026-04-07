# AVD AVD Private Link - Quick Reference

**Entries**: 6 | **21V**: all applicable
**Keywords**: asc, azure-activity-log, connection, connection-failure, custom-image, feed, feed-failure, hostpool
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | AVD MSRDC 客户端 Feed 或 Web 客户端 Feed 在 Private Link 环境下无法加载 | Private Endpoint 配置了错误的 sub-resource type，或链接到了错误的资源（如链接到 hostpool 而非 workspace） | MSRDC Feed：PE 必须链接到 workspace，sub-resource type 为 'workspace'，取消勾选 'Allow end us... | 🔵 7.0 | ADO Wiki |
| 2 📋 | AVD 会话主机连接在 Private Link 环境下失败，用户无法通过私有网络连接到 Session Host | Private Endpoint 未链接到 hostpool 或 sub-resource type 配置错误；或未为订阅创建全局 PE sub-resourc... | MSRDC Connection：PE 必须链接到 hostpool，sub-resource type 为 'hostpool'，取消勾选 'Allow en... | 🔵 7.0 | ADO Wiki |
| 3 📋 | AVD connection refused with error: 'Connection was refused because you tried to ... | The host pool network access policy is set to private endpoint only (public acce... | 1) In ASC go to Host Pool > Connection tab, find the connection. 2) Copy activit... | 🔵 7.0 | ADO Wiki |
| 4 📋 | Workspace feed/subscription fails with error: 'The resource in <workspace name> ... | The workspace network access policy is configured to disallow connections from p... | 1) In ASC go to Workspace > Workspaces Feed tab and find the failed feed operati... | 🔵 7.0 | ADO Wiki |
| 5 📋 | Customer cannot configure or use AVD Private Link; Private Link option not avail... | Customer's Azure subscription has not been enrolled in the AVD Private Link Publ... | 1) In ASC select customer subscription > Azure Activity Logs. 2) Set appropriate... | 🔵 7.0 | ADO Wiki |
| 6 📋 | Custom image template fails with PrivateLinkService Network Policy not disabled ... | Private service policy enabled on subnet used by Azure Image Builder | Disable private service policy on the subnet | 🔵 6.0 | MS Learn |

## Quick Triage Path

1. Check: Private Endpoint 配置了错误的 sub-resource type，或链接到了错误的 `[Source: ADO Wiki]`
2. Check: Private Endpoint 未链接到 hostpool 或 sub-resource type `[Source: ADO Wiki]`
3. Check: The host pool network access policy is set to priv `[Source: ADO Wiki]`
4. Check: The workspace network access policy is configured `[Source: ADO Wiki]`
5. Check: Customer's Azure subscription has not been enrolle `[Source: ADO Wiki]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-private-link.md#troubleshooting-flow)
