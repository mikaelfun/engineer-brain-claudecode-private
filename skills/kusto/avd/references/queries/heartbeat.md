---
name: heartbeat
description: Session Host 心跳检测查询
tables:
  - RDInfraTrace
parameters:
  - name: SessionHostName
    required: true
    description: Session Host 名称或 FQDN
---

# 心跳检测查询

## 用途

检查 Session Host 的心跳状态，判断 Agent 是否正常与 Broker 通信。

## 查询 1: 心跳日志

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {SessionHostName} | 是 | Session Host 名称 |

### 查询语句

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDInfraTrace
| where HostInstance has "{SessionHostName}"
| where PreciseTimeStamp > ago(8h)
| where Category contains "Heartbeat" or Msg contains "Heartbeat"
| where Category != "Microsoft.RDInfra.Diagnostics.DataSink.RestPipelineSink"
| project PreciseTimeStamp, Level, Category, Role, HostInstance, Msg
| order by PreciseTimeStamp desc
| take 100
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| PreciseTimeStamp | 心跳时间 |
| Level | 日志级别 |
| Category | 日志类别 |
| Role | 组件角色 |
| Msg | 消息内容 |

---

## 查询 2: 心跳间隔分析

### 查询语句

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDInfraTrace
| where HostInstance has "{SessionHostName}"
| where PreciseTimeStamp > ago(8h)
| where Category contains "Heartbeat"
| project PreciseTimeStamp, HostInstance
| order by PreciseTimeStamp asc
| extend PrevTime = prev(PreciseTimeStamp)
| extend Interval = datetime_diff('second', PreciseTimeStamp, PrevTime)
| where isnotnull(Interval)
| summarize 
    AvgInterval = avg(Interval),
    MaxInterval = max(Interval),
    MinInterval = min(Interval),
    HeartbeatCount = count()
    by bin(PreciseTimeStamp, 1h)
| order by PreciseTimeStamp desc
```

---

## 查询 3: 心跳错误和警告

### 查询语句

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDInfraTrace
| where HostInstance has "{SessionHostName}"
| where PreciseTimeStamp > ago(8h)
| where Category contains "Heartbeat" or Msg contains "Heartbeat"
| where Level <= 3  // Critical, Error, Warning
| project PreciseTimeStamp, Level, Category, Role, Msg
| order by PreciseTimeStamp desc
```

---

## 查询 4: Session Count 统计

### 查询语句

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDInfraTrace
| where HostInstance contains "{SessionHostName}"
| where PreciseTimeStamp > ago(8h)
| where Msg contains "sessionCount"
| extend json_str = substring(Msg, indexof(Msg, "{"))
| extend obj = parse_json(json_str)
| extend sessionCount = tostring(obj.CloudEvents[0].data.sessionCount)
| project PreciseTimeStamp, sessionCount, Role, HostInstance, HostPool
| order by PreciseTimeStamp desc
```

## 心跳状态判断

| 情况 | 状态 | 建议 |
|------|------|------|
| 心跳正常 (间隔 < 1 分钟) | ✅ 健康 | 无需处理 |
| 心跳间隔 1-5 分钟 | ⚠️ 警告 | 检查网络和 Agent |
| 无心跳超过 5 分钟 | ❌ 异常 | 检查 VM 和 Agent 服务 |
| 心跳中有错误日志 | ⚠️ 需关注 | 分析具体错误 |

## 关联查询

- [health-check.md](./health-check.md) - 完整健康检查状态
- [session-host.md](./session-host.md) - Session Host 信息
