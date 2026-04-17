---
name: DownloadService
database: intune
cluster: https://intunecn.chinanorth2.kusto.chinacloudapi.cn
description: 下载服务表，记录应用下载状态
status: active
columns: 133
related_tables:
  - DeviceManagementProvider
  - IntuneEvent
---

# DownloadService

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://intunecn.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | intune |
| 列数 | 133 |
| 状态 | ✅ 可用 |

## 用途

记录应用下载服务的状态和事件，包括应用包下载进度、状态、错误等信息。用于排查应用安装过程中的下载问题。

## 关键字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| env_time | datetime | 事件时间 | 2026-01-14T00:00:00Z |
| SourceNamespace | string | 源命名空间 | DownloadService |
| accountId | string | Intune 账户 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| deviceId | string | 设备 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| userId | string | 用户 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| TaskName | string | 任务名称 | DownloadApp / CheckStatus |
| EventId | int | 事件 ID | 事件类型标识 |
| status | string | 状态 | Downloading / Completed / Failed |
| platform | string | 平台 | Windows / iOS / Android |
| statusCode | string | 状态码 | 0 / 错误代码 |
| exception | string | 异常信息 | 详细错误消息 |
| errorEventId | string | 错误事件 ID | 错误类型标识 |
| result | string | 结果 | Success / Failure |
| EventMessage | string | 事件消息 | 操作描述 |

## 常用状态 (status)

| status | 说明 |
|--------|------|
| Downloading | 正在下载 |
| Completed | 下载完成 |
| Failed | 下载失败 |
| Pending | 等待下载 |
| Cancelled | 已取消 |

## 常用筛选字段

- `deviceId` - 按设备筛选
- `accountId` - 按 Intune 账户筛选
- `status` - 按下载状态筛选
- `platform` - 按平台筛选
- `result` - 按结果筛选

## 典型应用场景

1. **下载失败诊断** - 查询 status='Failed' 分析失败原因
2. **下载进度追踪** - 追踪应用下载状态变化
3. **平台统计** - 按平台统计下载情况
4. **错误分析** - 分析 exception 字段获取详细错误

## 示例查询

### 查询设备下载事件
```kql
DownloadService
| where env_time > ago(7d)
| where deviceId has '{deviceId}'
| project env_time, TaskName, status, result, statusCode, exception
| order by env_time desc
```

### 查询下载失败
```kql
DownloadService
| where env_time > ago(7d)
| where accountId == '{accountId}'
| where status == 'Failed' or result == 'Failure'
| project env_time, deviceId, TaskName, statusCode, exception, EventMessage
| order by env_time desc
```

### 按状态统计
```kql
DownloadService
| where env_time > ago(1d)
| where accountId == '{accountId}'
| summarize Count=count() by status
```

### 按平台统计下载
```kql
DownloadService
| where env_time > ago(7d)
| where accountId == '{accountId}'
| where status == 'Completed'
| summarize Count=count() by platform
```

## 关联表

- [DeviceManagementProvider.md](./DeviceManagementProvider.md) - 应用部署状态
- [IntuneEvent.md](./IntuneEvent.md) - 详细事件日志

## 注意事项

- 下载失败时 `exception` 字段包含详细错误信息
- `statusCode` 可能是字符串格式的错误代码
- 可与 `DeviceManagementProvider` 的应用部署事件 (EventId 5766/5767) 关联分析
