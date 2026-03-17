---
name: DiagError
database: WVD
cluster: https://rdskmc.chinaeast2.kusto.chinacloudapi.cn
description: AVD 诊断错误日志，记录活动的错误详情
status: active
---

# DiagError

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://rdskmc.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | WVD |
| 状态 | ✅ 可用 |

## 用途

记录 AVD 诊断事务的错误信息。必须与 DiagActivity 表通过 ActivityId 字段关联以获取完整的事务上下文。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TIMESTAMP | datetime | 时间戳 |
| PreciseTimeStamp | datetime | 精确时间戳 |
| env_time | datetime | 环境时间 |
| ActivityId | string | 活动 ID（与 DiagActivity.Id 关联） |
| ActId | string | 活动 ID（备用字段） |
| ErrorSource | string | 错误来源 (ServiceError, Client, SessionHost) |
| ErrorOperation | string | 发生错误的操作 |
| ErrorCode | string | 错误代码 |
| ErrorCodeSymbolic | string | 符号化错误代码（重要） |
| ErrorMessage | string | 错误消息 |
| ErrorInternal | string | 内部错误标识 |
| ReportedBy | string | 报告错误的组件 |
| ErrorDetectionTime | datetime | 错误检测时间 |
| Date | datetime | 日期 |

## 常用筛选字段

- `ActivityId` - 按活动 ID 筛选（关联 DiagActivity）
- `ErrorCodeSymbolic` - 按符号化错误代码筛选
- `ErrorSource` - 按错误来源筛选

## 常见错误代码 (ErrorCodeSymbolic)

| 错误代码 | 含义 | 说明 |
|----------|------|------|
| ConnectionFailedNoHealthyHost | 无可用健康主机 | 检查主机池容量和主机健康状态 |
| ConnectionFailedClientDisconnect | 客户端主动断开 | 检查客户端网络和配置 |
| ConnectionFailedServerDisconnect | 服务端断开连接 | 检查 Session Host 状态 |
| ConnectionFailedUserAuthentication | 用户认证失败 | 检查 AAD/条件访问策略 |
| ConnectionFailedReverseConnect | 反向连接失败 | 检查网络/防火墙配置 |
| ConnectionFailedVMNotFound | 找不到 VM | VM 可能已删除或不可用 |
| ConnectionFailedNoSessionAvailable | 无可用会话 | 会话数达到上限 |

## 典型应用场景

1. **错误分析** - 分析连接失败的具体原因
2. **问题分类** - 根据 ErrorSource 分类问题来源
3. **趋势分析** - 统计各类错误的发生频率

## 示例查询

### 按 ActivityId 查询错误详情

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').DiagError
| where ActivityId contains "{ActivityId}"
| where env_time > ago(6h)
| project env_time, ErrorSource, ReportedBy, ErrorOperation, 
          ErrorCode, ErrorCodeSymbolic, ErrorMessage
```

### 统计错误类型分布

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').DiagError
| where env_time >= ago(1d)
| summarize Count = count() by ErrorCodeSymbolic, ErrorSource
| order by Count desc
```

### 关联 DiagActivity 查询失败连接

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').DiagActivity
| where UserName contains "{UPN}"
| where env_time >= ago(1d)
| join kind=inner (
    cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').DiagError 
) on $left.Id == $right.ActivityId
| project env_time, UserName, SessionHostName, SessionHostPoolName,
          ErrorSource, ErrorCode, ErrorCodeSymbolic, ErrorMessage
| order by env_time desc
```

## 关联表

- [DiagActivity.md](./DiagActivity.md) - 通过 ActivityId = Id 关联（必需）

## 注意事项

- 推荐查询模式：使用 `macro-expand isfuzzy=true AVD_MC as T ( T.DiagError | <query> )` 进行跨表查询
- 必须与 DiagActivity 关联使用，单独查询 DiagError 缺少上下文
- ErrorCodeSymbolic 是分析错误类型的关键字段
