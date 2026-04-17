---
source: onenote
sourceRef: "MCVKB/VM+SCIM/======= 13. Backup=======/13.7 Understanding DoS limits in Backup and Site R.md"
sourceUrl: null
importDate: "2026-04-04"
type: troubleshooting-guide
---

# Azure Backup / Site Recovery DoS Limit 排查指南

## 症状

操作被拦截，Azure Portal 显示：
> "Operation is blocked as you have reached the limit on number of operations permitted in 24 hours. Contact Microsoft support or retry after 24 hours."

## DoS Limit 类型

| 类型 | 描述 | 处理方式 |
|------|------|---------|
| **Soft Limit** | 操作频率限制，24 小时后自动重置 | 等待 24 小时后重试 |
| **Hard Limit** | 资源数量上限（如每订阅每区域最多 N 个 Recovery Services Vault） | 等待无效，需要调整架构或提交支持请求 |

## 排查步骤

### Step 1: 获取 ARM Correlation ID

从 Azure Portal 的操作日志或错误详情中获取 Request ID（即 ARM correlation ID）。

### Step 2: Kusto 查询 TraceLogMessage

**Mooncake MABKustoProd 集群**: `mabprodmc.kusto.chinacloudapi.cn/MABKustoProd`

```kusto
TraceLogMessage
| where TIMESTAMP > datetime(YYYY/MM/DD HH:MM) and TIMESTAMP < datetime(YYYY/MM/DD HH:MM)
| where RequestId == "<correlation_id_from_portal>"
| project TIMESTAMP, Message, TaskId, SubscriptionId, RequestId
```

如果只有 SubscriptionId：
```kusto
TraceLogMessage
| where TIMESTAMP > ago(24h)
| where SubscriptionId == "<subscription_id>"
| where Message contains "DoS" or Message contains "limit"
| project TIMESTAMP, Message, TaskId, SubscriptionId, RequestId
```

### Step 3: 或使用 Jarvis

Namespace: `MABRrpMds`，通过 Request ID 过滤查找操作名称。

### Step 4: 对照 DoS Limits 文档

找到 operation name 后，对照内部 DoS Limits 文档（Azure Backup Notebook SharePoint）确认：
- `RegionalResourceProviderCreateResource` → 每订阅每区域最大 RSV 数量（硬限制）
- 其他操作频率类限制 → 软限制，等待或分散操作

## 常见 Hard Limits

- Recovery Services Vault 数量：每订阅每区域有最大数量限制（具体数值查阅 DoS Limits 文档）

## 参考

- 内部 DoS Limits 文档（需 SharePoint 权限）：Azure Backup Notebook → DOSLimits.one
