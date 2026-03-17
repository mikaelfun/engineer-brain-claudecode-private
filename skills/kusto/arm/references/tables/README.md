# 表结构定义 (tables/)

本目录存放 ARM Kusto 表结构定义文件，每个文件对应一个表。

## 表索引

### armmc 数据库 (Mooncake)

#### 核心请求表

| 表名 | 用途 | 文件 |
|------|------|------|
| EventServiceEntries | ARM 事件服务条目（活动日志） | [EventServiceEntries.md](./EventServiceEntries.md) |
| HttpIncomingRequests | ARM 入站 HTTP 请求 | [HttpIncomingRequests.md](./HttpIncomingRequests.md) |
| HttpOutgoingRequests | ARM 出站 HTTP 请求（到 RP） | [HttpOutgoingRequests.md](./HttpOutgoingRequests.md) |
| ClientRequests | ARM 客户端请求 | [ClientRequests.md](./ClientRequests.md) |

#### 部署表

| 表名 | 用途 | 文件 |
|------|------|------|
| Deployments | ARM 模板部署记录 | [Deployments.md](./Deployments.md) |
| DeploymentOperations | ARM 部署操作详情 | [DeploymentOperations.md](./DeploymentOperations.md) |

#### 错误和追踪表

| 表名 | 用途 | 文件 |
|------|------|------|
| Errors | ARM 系统错误 | [Errors.md](./Errors.md) |
| Traces | ARM 追踪日志 | [Traces.md](./Traces.md) |
| ProviderErrors | 资源提供程序错误 | [ProviderErrors.md](./ProviderErrors.md) |
| ClientErrors | 客户端错误 | [ClientErrors.md](./ClientErrors.md) |

#### 作业表

| 表名 | 用途 | 文件 |
|------|------|------|
| JobOperations | 后台作业操作日志 | [JobOperations.md](./JobOperations.md) |
| JobErrors | 后台作业错误 | [JobErrors.md](./JobErrors.md) |

#### 容量表

| 表名 | 用途 | 文件 |
|------|------|------|
| CapacityTraces | 容量检查追踪 | [CapacityTraces.md](./CapacityTraces.md) |
| CapacityErrors | 容量检查错误 | [CapacityErrors.md](./CapacityErrors.md) |

---

## 文件命名规范

```
{TableName}.md
```

使用表的实际名称，如：
- `EventServiceEntries.md`
- `HttpIncomingRequests.md`
- `DeploymentOperations.md`

## 文件格式

每个表定义文件使用以下格式：

```markdown
---
name: TableName
database: armmc
cluster: https://armmcadx.chinaeast2.kusto.chinacloudapi.cn
description: 表描述
status: active|deprecated
---

# TableName

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://armmcadx.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | armmc |
| 状态 | ✅ 可用 / ⚠️ 已弃用 |

## 用途

描述此表的主要用途和适用场景。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TIMESTAMP | datetime | 时间戳 |
| subscriptionId | string | 订阅 ID |
| correlationId | string | 关联 ID |

## 常用筛选字段

- `subscriptionId` - 按订阅筛选
- `correlationId` - 按关联 ID 筛选
- `TIMESTAMP` - 按时间筛选

## 典型应用场景

1. **场景 1**: 描述
2. **场景 2**: 描述

## 示例查询

\```kql
cluster('armmcadx.chinaeast2').database('armmc').TableName
| where TIMESTAMP > ago(1d)
| where subscriptionId == "{subscription}"
| take 10
\```

## 关联表

- [RelatedTable.md](./RelatedTable.md) - 关联说明

## 注意事项

- 注意事项
```

## 字段类型

| 类型 | KQL 类型 | 说明 |
|------|----------|------|
| datetime | datetime | 日期时间 |
| string | string | 字符串 |
| int | int | 整数 |
| long | long | 长整数 |
| bool | bool | 布尔值 |
| dynamic | dynamic | JSON 对象 |
| guid | guid | GUID |

## 状态标记

| 状态 | 标记 | 说明 |
|------|------|------|
| 可用 | ✅ | 表正常可用 |
| 已弃用 | ⚠️ | 表已弃用，不建议使用 |
| 实验性 | 🧪 | 实验性表，可能变更 |
