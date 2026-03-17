---
name: EventServiceEntries
database: armmc
cluster: https://armmcadx.chinaeast2.kusto.chinacloudapi.cn
description: ARM 事件服务条目，记录所有资源操作的事件（等同于 Azure Portal 活动日志）
status: active
related_tables:
  - HttpIncomingRequests
  - HttpOutgoingRequests
schema_verified: 2026-01-14
---

# EventServiceEntries

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 (Mooncake) | https://armmcadx.chinaeast2.kusto.chinacloudapi.cn |
| 集群 (Public) | https://armprodgbl.eastus.kusto.windows.net (使用 Unionizer) |
| 数据库 | armmc / ARMProd |
| 状态 | ✅ 可用 |
| Schema 验证时间 | 2026-01-14 |

## 用途

记录 ARM 活动日志事件，等同于 Azure Portal 中的活动日志。用于追踪资源 CRUD 操作、识别操作发起者、查找失败操作等。

## 完整字段列表

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TIMESTAMP | datetime | 事件时间戳 |
| PreciseTimeStamp | datetime | 精确时间戳 |
| Deployment | string | 部署名称 |
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
| correlationId | string | 关联 ID（用于追踪完整操作链） |
| principalOid | string | 主体对象 ID |
| principalPuid | string | 主体 PUID |
| tenantId | string | 租户 ID |
| operationName | string | 操作名称（如 Microsoft.Compute/virtualMachines/write） |
| operationId | string | 操作 ID |
| eventSource | string | 事件源 |
| description | string | 描述 |
| resourceProvider | string | 资源提供程序 |
| resourceUri | string | 资源 URI |
| eventName | string | 事件名称 |
| eventInstanceId | string | 事件实例 ID |
| channels | long | 通道 |
| level | long | 事件级别 |
| status | string | 操作状态 (Succeeded/Failed/Started) |
| subStatus | string | 子状态 |
| claims | string | 声明（包含用户身份信息，JSON 格式） |
| authorization | string | 授权信息（JSON 格式） |
| httpRequest | string | HTTP 请求信息 |
| properties | string | 属性（JSON 格式，包含详细错误信息） |
| eventTimestamp | string | 事件时间戳 |
| audience | string | 受众 |
| issuer | string | 颁发者 |
| issuedAt | string | 颁发时间 |
| applicationId | string | 应用程序 ID |
| uniqueTokenId | string | 唯一令牌 ID |
| SourceNamespace | string | 源命名空间 |
| SourceMoniker | string | 源标识 |
| SourceVersion | string | 源版本 |
| armServiceRequestId | string | ARM 服务请求 ID |
| eventCategory | string | 事件类别 |
| RoleLocation | string | 角色位置 |
| ReleaseVersion | string | 发布版本 |
| jobId | string | 作业 ID |
| jobType | string | 作业类型 |
| customerOperationName | string | 客户操作名称 |
| dataBoundary | string | 数据边界 |

## 常用筛选字段

- `subscriptionId` - 按订阅筛选
- `correlationId` - 按关联 ID 筛选
- `resourceUri` - 按资源 URI 筛选
- `operationName` - 按操作类型筛选
- `status` - 按状态筛选（Failed/Succeeded）
- `TIMESTAMP` / `PreciseTimeStamp` - 按时间筛选

## 典型应用场景

1. **追踪资源 CRUD 操作** - 查看资源创建、更新、删除的历史
2. **查找 ARM 层失败的操作** - 筛选 status == "Failed"
3. **使用 correlationId 追踪完整操作链** - 关联多个表
4. **识别操作发起者** - 从 claims 解析用户信息
5. **排查内部服务器错误** - 分析 properties 字段

## 示例查询

### 查询失败操作
```kql
cluster('armmcadx.chinaeast2').database('armmc').EventServiceEntries
| where subscriptionId == "{subscription}"
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where status == "Failed"
| where properties notcontains "isComplianceCheck" and properties notcontains "OK"
| project PreciseTimeStamp, operationName, resourceProvider, correlationId, status, 
         subStatus, properties, resourceUri, claims
| sort by PreciseTimeStamp desc
```

### 按资源 URI 查询
```kql
cluster('armmcadx.chinaeast2').database('armmc').EventServiceEntries
| where PreciseTimeStamp > ago(3d)
| where resourceUri contains "/subscriptions/{subscription}/resourceGroups/{resourceGroup}"
| where operationName notcontains "Microsoft.Authorization/policies"
| project PreciseTimeStamp, operationName, correlationId, status, properties, resourceUri
| sort by PreciseTimeStamp asc
```

### 查找操作发起者
```kql
cluster('armmcadx.chinaeast2').database('armmc').EventServiceEntries
| where subscriptionId == "{subscription}"
| where resourceUri contains "{resourceName}"
| where PreciseTimeStamp > ago(1d)
// | where operationName contains "delete"
| project PreciseTimeStamp, claims, authorization, properties, resourceUri, operationName
| sort by PreciseTimeStamp desc
```

### Public Cloud 查询（使用 Unionizer）
```kql
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Requests","EventServiceEntries")
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where correlationId == "{correlationId}"
| project TIMESTAMP, resourceUri, operationName, status, level, properties, claims
| order by TIMESTAMP asc
```

## 关联表

- [HttpIncomingRequests.md](./HttpIncomingRequests.md) - ARM 入站请求详情
- [HttpOutgoingRequests.md](./HttpOutgoingRequests.md) - ARM 到 RP 的出站请求

## 注意事项

- `properties` 字段是 JSON 格式，需要使用 `parse_json()` 解析
- `claims` 字段包含用户身份信息，可解析获取 UPN、OID 等
- 排除策略审计操作：`operationName notcontains "Microsoft.Authorization/policies"`
- Public Cloud 使用 `Unionizer("Requests","EventServiceEntries")` 查询
