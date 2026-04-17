---
name: RDOperation
database: WVD
cluster: https://rdskmc.chinaeast2.kusto.chinacloudapi.cn
description: AVD 操作信息表，包含健康检查结果和各组件操作记录
status: active
---

# RDOperation

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://rdskmc.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | WVD |
| 状态 | ✅ 可用 |

## 用途

记录 AVD 事务中单个组件的操作信息。一个诊断事务可能跨越多个操作。主要用于健康检查结果查询和 MSIX App Attach 操作分析。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TIMESTAMP | datetime | 时间戳 |
| PreciseTimeStamp | datetime | 精确时间戳 |
| ActivityId | string | 活动 ID |
| Name | string | 操作名称（健康检查名称） |
| ResType | string | 结果类型 (Success, Error, Warning) |
| ResSignature | string | 结果签名/错误代码 |
| ResDesc | string | 结果描述 |
| DurationMs | long | 操作耗时（毫秒） |
| Role | string | 组件角色 |
| HostInstance | string | Session Host FQDN |
| HostPool | string | 主机池名称 |
| RDTenant | string | RD 租户 |
| UserName | string | 用户名 |
| AADTenantId | string | AAD 租户 ID |
| Props | string | 附加属性 (JSON) |
| Env | string | 环境 |
| Ring | string | 部署环 |
| Region | string | 区域 |

## 常见健康检查名称 (Name)

| 检查名称 | 说明 |
|----------|------|
| SxSStackListenerCheck | SxS Stack 监听器检查 |
| DomainReachableHealthCheck | 域控制器可达性检查 |
| DomainTrustCheckHealthCheck | 域信任检查 |
| DomainJoinedCheck | 域加入状态检查 |
| FSLogixHealthCheck | FSLogix 健康检查 |
| MonitoringAgentCheck | 监控代理检查 |
| SessionHostCanAccessUrlsCheck | URL 访问检查 |
| RDAgentCanReachRDGatewayURL | Gateway URL 可达性 |
| RdInfraAgentConnectToRdBroker | Broker 连接检查 |
| WebRTCRedirectorHealthCheck | WebRTC 重定向检查 |
| ProcessMsixPackage | MSIX 包处理 |
| StageMsixPackages | MSIX 暂存 |
| RegisterMsixPackages | MSIX 注册 |
| DeregisterMsixPackages | MSIX 注销 |

## 典型应用场景

1. **健康检查分析** - 查询 Session Host 的健康检查状态
2. **MSIX App Attach 诊断** - 分析 MSIX 包的 Staging/Registration
3. **操作耗时分析** - 分析各操作的执行时间

## 示例查询

### 按 Session Host 查询健康检查

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDOperation
| where HostInstance has "{SessionHostName}"
| where TIMESTAMP >= ago(1d)
| where Name endswith "Check"
| project TIMESTAMP, Name, ResType, ResSignature, ResDesc
| order by TIMESTAMP desc
```

### 查询健康检查失败

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDOperation
| where AADTenantId == "{AADTenantId}"
| where TIMESTAMP >= ago(1d)
| where Name endswith "Check"
| where ResType != "Success"
| project TIMESTAMP, HostInstance, Name, ResType, ResSignature, ResDesc
| order by TIMESTAMP desc
```

### 汇总所有 Session Host 健康检查状态

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDOperation
| where PreciseTimeStamp > ago(1d)
| where Role == 'RDAgent'
| where Name endswith "Check"
| where AADTenantId != ""
| summarize arg_max(PreciseTimeStamp, ResType) by Env, Ring, HostPool, HostInstance, Name, AADTenantId
| order by Env, Ring, HostPool, HostInstance
```

### MSIX App Attach 状态

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDOperation
| where TIMESTAMP >= ago(24h)
| where Name contains "msix" or Name contains "Msix"
| where HostPool == "{HostPoolName}"
| project TIMESTAMP, UserName, Name, ResType, ResSignature, ResDesc, Props
| order by TIMESTAMP desc
```

## 关联表

- [RDInfraTrace.md](./RDInfraTrace.md) - 通过 HostInstance/ActivityId 关联
- [ShoeboxAgentHealth.md](./ShoeboxAgentHealth.md) - 健康检查的另一数据源

## 注意事项

- 推荐查询模式：使用 `macro-expand isfuzzy=true AVD_MC as T ( T.RDOperation | <query> )` 进行跨表查询
- 健康检查结果通过 Name 字段筛选，通常以 "Check" 结尾
- Props 字段包含 JSON 格式的附加信息，可使用 parse_json() 解析
