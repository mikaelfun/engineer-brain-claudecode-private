---
name: CapacityErrors
database: armmc
cluster: https://armmcadx.chinaeast2.kusto.chinacloudapi.cn
description: ARM 容量检查错误日志
status: active
related_tables:
  - CapacityTraces
  - Errors
schema_verified: 2026-01-14
---

# CapacityErrors

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 (Mooncake) | https://armmcadx.chinaeast2.kusto.chinacloudapi.cn |
| 集群 (Public) | https://armprodgbl.eastus.kusto.windows.net (使用 Unionizer) |
| 数据库 | armmc / ARMProd |
| 状态 | ✅ 可用 |
| Schema 验证时间 | 2026-01-14 |

## 用途

记录 ARM 容量检查过程中的错误。用于诊断容量分配失败、配额超限等问题。

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
| ActivityId | string | 活动 ID |
| subscriptionId | string | 订阅 ID |
| correlationId | string | 关联 ID |
| principalOid | string | 主体对象 ID |
| principalPuid | string | 主体 PUID |
| tenantId | string | 租户 ID |
| operationName | string | 操作名称 |
| providerNamespace | string | 资源提供程序命名空间 |
| resourceType | string | 资源类型 |
| resourceId | string | 资源 ID |
| skuName | string | SKU 名称 |
| status | string | 状态 |
| resourceCount | long | 资源数量 |
| budgetRuleCount | long | 预算规则数 |
| message | string | 错误消息 |
| exception | string | 异常信息 |
| quotaId | string | 配额 ID |
| errorCode | string | 错误代码 |
| SourceNamespace | string | 源命名空间 |
| SourceMoniker | string | 源标识 |
| SourceVersion | string | 源版本 |
| location | string | 位置 |
| offerCategory | string | 服务类别 |
| RoleLocation | string | 角色位置 |
| ReleaseVersion | string | 发布版本 |
| Stamp | string | 戳记 |

## 常用筛选字段

- `subscriptionId` - 按订阅筛选
- `correlationId` - 按关联 ID 筛选
- `skuName` - 按 SKU 筛选
- `location` - 按位置筛选
- `errorCode` - 按错误代码筛选
- `quotaId` - 按配额 ID 筛选
- `TIMESTAMP` - 按时间筛选

## 典型应用场景

1. **诊断容量分配失败** - 分析 errorCode、message
2. **排查配额问题** - 检查 quotaId、resourceCount
3. **分析 SKU 可用性** - 按 skuName、location 筛选
4. **追踪特定资源容量问题** - 使用 resourceId

## 示例查询

### 按 correlationId 查询容量错误
```kql
cluster('armmcadx.chinaeast2').database('armmc').CapacityErrors
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where correlationId == "{correlationId}"
| project TIMESTAMP, providerNamespace, resourceType, skuName, location, errorCode, message, quotaId
| order by TIMESTAMP asc
```

### 按订阅查询容量错误
```kql
cluster('armmcadx.chinaeast2').database('armmc').CapacityErrors
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| project TIMESTAMP, skuName, location, errorCode, message
| order by TIMESTAMP desc
```

### 统计容量错误分布
```kql
cluster('armmcadx.chinaeast2').database('armmc').CapacityErrors
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| summarize count() by errorCode, skuName, location
| order by count_ desc
```

### 查询特定 SKU 的容量错误
```kql
cluster('armmcadx.chinaeast2').database('armmc').CapacityErrors
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where skuName contains "{skuName}"
| project TIMESTAMP, subscriptionId, location, errorCode, message, quotaId
| order by TIMESTAMP desc
```

### Public Cloud 查询
```kql
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("General","CapacityErrors")
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where correlationId == "{correlationId}"
| project TIMESTAMP, skuName, location, errorCode, message
```

## 关联表

- [CapacityTraces.md](./CapacityTraces.md) - 容量检查追踪
- [Errors.md](./Errors.md) - ARM 系统错误

## 常见错误代码

| 错误代码 | 说明 |
|----------|------|
| QuotaExceeded | 配额超限 |
| AllocationFailed | 分配失败 |
| SkuNotAvailable | SKU 不可用 |
| RegionNotAvailable | 区域不可用 |

## 注意事项

- 容量错误通常发生在资源创建/调整大小时
- `errorCode` 字段包含标准化错误代码
- `quotaId` 可用于追踪具体的配额限制
- 与 CapacityTraces 表配合使用可获得完整的容量检查视图
- Public Cloud 使用 `Unionizer("General","CapacityErrors")` 查询
