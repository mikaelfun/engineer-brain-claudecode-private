---
name: VppFeatureTelemetry
database: intune
cluster: https://intunecn.chinanorth2.kusto.chinacloudapi.cn
description: VPP 功能遥测表，记录 Apple VPP 令牌同步状态
status: active
columns: 77
related_tables:
  - DeviceManagementProvider
---

# VppFeatureTelemetry

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://intunecn.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | intune |
| 列数 | 77 |
| 状态 | ✅ 可用 |

## 用途

记录 Apple Volume Purchase Program (VPP) 功能的遥测数据，包括令牌同步状态、应用许可证分配等。用于排查 Apple VPP 令牌和应用许可证相关问题。

## 关键字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| env_time | datetime | 事件时间 | 2026-01-14T00:00:00Z |
| env_cloud_name | string | 云环境名称 | CNPASU01 |
| TaskName | string | 任务名称 | SyncVppToken / AssignLicense |
| ActivityId | string | 活动 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| accountId | string | Intune 账户 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| tokenId | string | VPP 令牌 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| applications | string | 应用列表 | JSON 格式的应用信息 |
| userId | string | 用户 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| ex | string | 异常信息 | 错误详情 |
| tokenState | string | 令牌状态 | Valid / Expired / Invalid |

## 常用 TaskName

| TaskName | 说明 |
|----------|------|
| SyncVppToken | 同步 VPP 令牌 |
| AssignLicense | 分配许可证 |
| RevokeLicense | 撤销许可证 |
| GetTokenInfo | 获取令牌信息 |

## 令牌状态 (tokenState)

| tokenState | 说明 |
|------------|------|
| Valid | 令牌有效 |
| Expired | 令牌已过期 |
| Invalid | 令牌无效 |
| Syncing | 正在同步 |

## 常用筛选字段

- `accountId` - 按 Intune 账户筛选
- `tokenId` - 按 VPP 令牌筛选
- `TaskName` - 按任务类型筛选
- `tokenState` - 按令牌状态筛选
- `env_cloud_name` - 按云环境筛选

## 典型应用场景

1. **VPP 令牌同步问题** - 查询令牌同步状态和错误
2. **许可证分配失败** - 追踪 AssignLicense 任务结果
3. **令牌过期检查** - 查询 tokenState='Expired' 的令牌
4. **应用许可证统计** - 分析 applications 字段

## 示例查询

### 查询 VPP 令牌事件
```kql
VppFeatureTelemetry
| where env_time > ago(7d)
| where env_cloud_name == 'CNPASU01'
| where accountId == '{accountId}'
| project env_time, TaskName, tokenId, tokenState, ex
| order by env_time desc
```

### 查询令牌同步错误
```kql
VppFeatureTelemetry
| where env_time > ago(7d)
| where accountId == '{accountId}'
| where TaskName == 'SyncVppToken'
| where isnotempty(ex)
| project env_time, tokenId, tokenState, ex
| order by env_time desc
```

### 查询过期令牌
```kql
VppFeatureTelemetry
| where env_time > ago(1d)
| where accountId == '{accountId}'
| where tokenState == 'Expired'
| project env_time, tokenId, TaskName
| summarize LastSeen=max(env_time) by tokenId
```

### 许可证分配统计
```kql
VppFeatureTelemetry
| where env_time > ago(7d)
| where accountId == '{accountId}'
| where TaskName == 'AssignLicense'
| summarize 
    Total=count(),
    Success=countif(isempty(ex)),
    Failed=countif(isnotempty(ex))
```

## 关联表

- [DeviceManagementProvider.md](./DeviceManagementProvider.md) - 应用部署状态

## 注意事项

- VPP 令牌有效期为 1 年，需要定期续订
- `ex` 字段包含错误详情，为空表示成功
- 中国区使用 `env_cloud_name == 'CNPASU01'` 筛选
- `applications` 字段为 JSON 格式，需要 parse_json 解析
