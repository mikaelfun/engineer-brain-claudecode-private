# 表结构定义 (tables/)

本目录存放 Kusto 表结构定义文件，每个文件对应一个表。

> 更新时间：2026-01-14  
> 表验证状态：✅ 已通过集群验证

## 表索引

### intune 数据库 (主要设备管理日志)

| 表名 | 用途 | 列数 | 文件 |
|------|------|------|------|
| DeviceManagementProvider | 策略应用状态、合规状态、设备管理事件 | 115 | [DeviceManagementProvider.md](./DeviceManagementProvider.md) |
| DeviceLifecycle | 设备注册、状态变更、生命周期事件 | 93 | [DeviceLifecycle.md](./DeviceLifecycle.md) |
| IntuneEvent | 通用事件日志（MAM、合规、Check-in 等）| 71 | [IntuneEvent.md](./IntuneEvent.md) |
| IntuneOperation | 设备操作（同步、签入）| 56 | [IntuneOperation.md](./IntuneOperation.md) |
| IntuneScenarioHealth | 场景健康状态（Autopilot、注册等）| 52 | [IntuneScenarioHealth.md](./IntuneScenarioHealth.md) |
| IOSEnrollmentService | iOS ADE 注册事件 | 90 | [IOSEnrollmentService.md](./IOSEnrollmentService.md) |
| HttpSubsystem | HTTP 请求日志（MAM 操作追踪）| 89 | [HttpSubsystem.md](./HttpSubsystem.md) |
| DownloadService | 应用下载状态 | 133 | [DownloadService.md](./DownloadService.md) |
| VppFeatureTelemetry | Apple VPP 令牌同步 | 77 | [VppFeatureTelemetry.md](./VppFeatureTelemetry.md) |
| CMService | Comanagement 服务日志 | - | [CMService.md](./CMService.md) |

### MSODS 数据库 (许可证审计日志)

| 表名 | 用途 | 列数 | 文件 |
|------|------|------|------|
| IfxAuditLoggingCommon | MSODS 审计日志（许可证操作）| 63 | [IfxAuditLoggingCommon.md](./IfxAuditLoggingCommon.md) |

---

## 集群与数据库

| 集群 | URI | 数据库 | 说明 |
|------|-----|--------|------|
| Intune China | https://intunecn.chinanorth2.kusto.chinacloudapi.cn | intune | 设备管理、策略、应用日志 |
| MSODS Mooncake | https://msodsmooncake.chinanorth2.kusto.chinacloudapi.cn | MSODS | MSODS 审计日志（许可证操作）|

> ⚠️ **注意**: MSODS 数据库名称为大写 `MSODS`

## 访问权限

- **CME 卡**: 有直接访问权限
- **权限申请**: [Intunekusto-CSSMooncake](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/intunekustoc-ftdh)

---

## 已弃用的表

### ~~DmpLogs~~

> ⚠️ **注意**: DmpLogs 表在 Mooncake intune 集群中不存在。原文档中的 DmpLogs 查询可能来自其他环境或已被移除。
> 
> **替代方案**: 使用 `DeviceManagementProvider` 表的 message 字段获取会话信息，或使用 `IntuneEvent` 表查询 Check-in 相关事件。

---

## 文件命名规范

```
{TableName}.md
```

使用表的实际名称，如：
- `DeviceManagementProvider.md`
- `IntuneEvent.md`
- `IfxAuditLoggingCommon.md`

## 文件格式

每个表定义文件使用以下格式：

```markdown
---
name: TableName
database: DatabaseName
cluster: cluster_uri
description: 表描述
status: active|deprecated
columns: 列数
related_tables:
  - RelatedTable1
  - RelatedTable2
---

# TableName

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://intunecn.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | intune |
| 列数 | XX |
| 状态 | ✅ 可用 / ⚠️ 已弃用 |

## 用途

描述此表的主要用途和适用场景。

## 关键字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| env_time | datetime | 事件时间 | 2026-01-14T00:00:00Z |
| deviceId | string | 设备 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |

## 典型应用场景

1. **场景 1**: 描述
2. **场景 2**: 描述

## 示例查询

\```kql
TableName
| where env_time > ago(7d)
| project env_time, field1, field2
\```

## 关联表

- [RelatedTable1.md](./RelatedTable1.md) - 关联说明

## 注意事项

- 注意事项 1
- 注意事项 2
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

---

## 常用过滤条件

### 环境过滤
```kql
| where env_cloud_name == 'CNPASU01'  // 中国区环境
```

### 策略状态过滤
```kql
| where applicablilityState == 'Applicable'
| where reportComplianceState in ('Compliant', 'Error', 'Pending')
```

### 应用类型过滤
```kql
| where ApplicationName == 'SideCar'  // Win32/LOB 应用管理
| where ServiceName startswith "StatelessApplicationManagementService"  // MAM
```

### 事件 ID 过滤
```kql
| where EventId == 5786  // 策略应用状态
| where EventId in (5766, 5767)  // 应用部署事件
```

---

## 相关资源

- [Intune Wiki](https://www.intunewiki.com/wiki/)
- [Supportability Intune Wiki](https://supportability.visualstudio.com/Intune/_wiki/wikis/Intune/1321070/Welcome)
- [查询示例](../queries/README.md)
