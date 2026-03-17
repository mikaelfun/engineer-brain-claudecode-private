---
name: CapacityTraces
database: armmc
cluster: https://armmcadx.chinaeast2.kusto.chinacloudapi.cn
description: ARM 容量检查追踪日志
status: active
related_tables:
  - EventServiceEntries
schema_verified: 2026-01-14
---

# CapacityTraces

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 (Mooncake) | https://armmcadx.chinaeast2.kusto.chinacloudapi.cn |
| 集群 (Public) | https://armprodgbl.eastus.kusto.windows.net (使用 Unionizer) |
| 数据库 | armmc / ARMProd |
| 状态 | ✅ 可用 |
| Schema 验证时间 | 2026-01-14 |

## 用途

记录 ARM 容量检查操作的追踪日志。用于排查容量相关的分配失败、配额问题。

## 完整字段列表

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TIMESTAMP | datetime | 时间戳 |
| PreciseTimeStamp | datetime | 精确时间戳 |
| Deployment | string | 部署实例 |
| Role | string | 角色 |
| RoleInstance | string | 角色实例 |
| Level | long | ETW 日志级别 |
| ProviderGuid | string | 提供程序 GUID |
| ProviderName | string | 提供程序名称 |
| EventId | long | 事件 ID |
| Pid | long | 进程 ID |
| Tid | long | 线程 ID |
| TaskName | string | 任务名称 |
| subscriptionId | string | 订阅 ID |
| correlationId | string | 关联 ID |
| operationName | string | 操作名称 |
| tenantId | string | 租户 ID |
| providerNamespace | string | 资源提供程序命名空间 |
| resourceType | string | 资源类型 |
| resourceId | string | 资源 ID |
| skuName | string | SKU 名称 |
| skuTier | string | SKU 层级 |
| skuSize | string | SKU 大小 |
| skuFamily | string | SKU 系列 |
| skuCapacity | long | SKU 容量 |
| location | string | 位置 |
| status | string | 状态 |
| resourceCount | long | 资源数量 |
| totalBudgetRules | long | 总预算规则数 |
| failedBudgetRules | long | 失败预算规则数 |
| quotaId | string | 配额 ID |
| message | string | 消息 |
| exception | string | 异常信息 |
| latencyInMilliseconds | long | 延迟（毫秒） |
| customerSegment | string | 客户细分 |
| additionalProperties | string | 附加属性 |
| SourceNamespace | string | 源命名空间 |
| SourceMoniker | string | 源标识 |
| SourceVersion | string | 源版本 |
| RoleLocation | string | 角色位置 |
| ReleaseVersion | string | 发布版本 |
| dataBoundary | string | 数据边界 |

## 常用筛选字段

- `subscriptionId` - 按订阅筛选
- `correlationId` - 按关联 ID 筛选
- `skuName` - 按 SKU 筛选
- `location` - 按位置筛选
- `status` - 按状态筛选
- `TIMESTAMP` - 按时间筛选

## 典型应用场景

1. **排查容量分配失败** - 查看容量检查结果
2. **分析配额问题** - 检查 quotaId 和相关信息
3. **追踪 SKU 可用性** - 按 SKU 和位置查询

## 示例查询

### 按 correlationId 查询
```kql
cluster('armmcadx.chinaeast2').database('armmc').CapacityTraces
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where correlationId == "{correlationId}"
| project TIMESTAMP, providerNamespace, resourceType, skuName, location, status, message
| order by TIMESTAMP asc
```

### 查询失败的容量检查
```kql
cluster('armmcadx.chinaeast2').database('armmc').CapacityTraces
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where status != "Succeeded"
| project TIMESTAMP, skuName, location, status, message, quotaId
| order by TIMESTAMP desc
```

### 按 SKU 统计
```kql
cluster('armmcadx.chinaeast2').database('armmc').CapacityTraces
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| summarize count() by skuName, location, status
| order by count_ desc
```

### Public Cloud 查询（使用 Unionizer）
```kql
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("General","CapacityTraces")
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where correlationId == "{correlationId}"
| project TIMESTAMP, skuName, location, status, message
```

## 关联表

- [EventServiceEntries.md](./EventServiceEntries.md) - 操作事件

## 注意事项

- 容量检查是资源创建前的预检步骤
- `status` 字段指示容量检查结果
- Public Cloud 使用 `Unionizer("General","CapacityTraces")` 查询
