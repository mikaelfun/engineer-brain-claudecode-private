---
name: RDClientTrace
database: WVD
cluster: https://rdskmc.chinaeast2.kusto.chinacloudapi.cn
description: AVD 客户端跟踪日志，记录远程桌面客户端的活动
status: active
---

# RDClientTrace

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://rdskmc.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | WVD |
| 状态 | ✅ 可用 |

## 用途

记录 AVD 客户端的跟踪日志，包含客户端类型、操作系统、IP 地址等信息。通过 ActivityId 字段可与其他表关联。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TIMESTAMP | datetime | 时间戳 |
| Env | string | 环境 |
| ClientType | string | 客户端类型 (Windows, macOS, iOS, Android, Web) |
| ClientInstance | string | 客户端实例标识 |
| Level | long | 日志级别 |
| Pid | long | 进程 ID |
| Tid | long | 线程 ID |
| EventId | long | 事件 ID |
| TaskName | string | 任务名称 |
| ChannelName | string | 通道名称 |
| ActivityId | string | 活动 ID（关联字段） |
| Msg | string | 日志消息 |
| Ex | string | 异常信息 |
| ClientOS | string | 客户端操作系统 |
| ClientIP | string | 客户端 IP 地址 |

## 常用筛选字段

- `ActivityId` - 按活动 ID 筛选（关联连接）
- `ClientType` - 按客户端类型筛选
- `ClientOS` - 按客户端操作系统筛选

## 典型应用场景

1. **客户端问题诊断** - 分析客户端侧的错误和异常
2. **连接追踪** - 结合 ActivityId 追踪客户端到服务端的完整链路
3. **Gateway 信息获取** - 从客户端日志中获取 Gateway 连接信息

## 示例查询

### 按 ActivityId 查询客户端日志

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDClientTrace
| where ActivityId == "{ActivityId}"
| where TIMESTAMP > ago(3d)
| project TIMESTAMP, TaskName, ChannelName, ClientOS, ClientType, Msg
| order by TIMESTAMP asc
```

### 获取 Gateway 信息

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDClientTrace
| where ActivityId == "{ActivityId}"
| where Msg has "rdgateway"
| project TIMESTAMP, ClientOS, ClientType, ClientInstance, ClientIP, Msg
```

## 关联表

- [DiagActivity.md](./DiagActivity.md) - 通过 ActivityId 关联
- [RDInfraTrace.md](./RDInfraTrace.md) - 通过 ActivityId 关联

## 注意事项

- 推荐查询模式：使用 `macro-expand isfuzzy=true AVD_MC as T ( T.RDClientTrace | <query> )` 进行跨表查询
- ClientIP 可能经过 NAT 转换，不一定是真实客户端 IP
