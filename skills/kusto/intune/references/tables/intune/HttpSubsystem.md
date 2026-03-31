---
name: HttpSubsystem
database: intune
cluster: https://intunecn.chinanorth2.kusto.chinacloudapi.cn
description: HTTP 子系统日志，用于追踪 MAM 应用操作的 HTTP 请求
status: active
columns: 89
related_tables:
  - IntuneEvent
---

# HttpSubsystem

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://intunecn.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | intune |
| 列数 | 89 |
| 状态 | ✅ 可用 |

## 用途

记录 HTTP 请求日志，主要用于追踪 MAM (移动应用管理) 操作的 HTTP 请求详情。包括请求 URL、HTTP 方法、状态码等信息，用于排查 MAM 相关问题。

## 关键字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| env_time | datetime | 事件时间 | 2026-01-14T00:00:00Z |
| ActivityId | string | 活动 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| accountId | string | Intune 账户 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| TaskName | string | 任务名称 | HttpRequest |
| httpVerb | string | HTTP 方法 | GET / POST / PUT / DELETE / PATCH |
| url | string | 请求 URL | /api/v1/applications/... |
| collectionName | string | 集合名称 | Actions / ApplicationInstances |
| statusCode | int | HTTP 状态码 | 200 / 400 / 401 / 403 / 500 |
| I_Srv | string | 服务名称 | MAM 服务标识 |
| I_BuildVer | string | 构建版本 | 服务版本号 |

## 常用操作类型

| collectionName | httpVerb | 说明 |
|----------------|----------|------|
| Actions | GetLink | Check-in 操作 |
| ApplicationInstances | Create | 应用注册 (Enroll) |
| ApplicationInstances | Delete | 应用注销 (Unenroll) |
| ApplicationInstances | Get | 获取应用实例 |
| ApplicationInstances | Patch | 更新应用实例 |

## 常用筛选字段

- `ActivityId` - 按活动 ID 筛选
- `accountId` - 按 Intune 账户筛选
- `collectionName` - 按操作集合筛选
- `httpVerb` - 按 HTTP 方法筛选
- `statusCode` - 按状态码筛选

## 典型应用场景

1. **MAM 注册失败诊断** - 查询 ApplicationInstances/Create 失败
2. **HTTP 错误分析** - 分析 4xx/5xx 状态码
3. **操作追踪** - 追踪特定 MAM 操作的请求流程
4. **性能分析** - 分析请求响应时间

## 示例查询

### 查询 MAM 操作
```kql
HttpSubsystem
| where env_time > ago(7d)
| where accountId == '{accountId}'
| project env_time, ActivityId, httpVerb, collectionName, url, statusCode
| order by env_time desc
| take 100
```

### 查询失败请求
```kql
HttpSubsystem
| where env_time > ago(7d)
| where accountId == '{accountId}'
| where statusCode >= 400
| project env_time, ActivityId, httpVerb, collectionName, url, statusCode
| order by env_time desc
```

### 查询应用注册
```kql
HttpSubsystem
| where env_time > ago(7d)
| where collectionName == 'ApplicationInstances'
| where httpVerb == 'Create'
| project env_time, ActivityId, accountId, url, statusCode
| summarize Count=count() by statusCode
```

### 按操作类型统计
```kql
HttpSubsystem
| where env_time > ago(1d)
| where accountId == '{accountId}'
| summarize Count=count() by collectionName, httpVerb
| order by Count desc
```

## 关联表

- [IntuneEvent.md](./IntuneEvent.md) - 详细事件日志

## 注意事项

- 主要用于 MAM 场景的 HTTP 请求追踪
- `statusCode` 可用于快速筛选失败请求
- 可与 `IntuneEvent` 结合使用 `ActivityId` 进行关联查询
- URL 中可能包含敏感信息，分析时注意隐私
