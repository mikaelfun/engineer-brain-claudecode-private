---
name: comanagement
description: Intune Comanagement 查询
tables:
  - IntuneEvent
  - HttpSubsystem
  - CMService
parameters:
  - name: deviceId
    required: true
    description: 设备 ID
  - name: startTime
    required: false
    description: 开始时间
  - name: endTime
    required: false
    description: 结束时间
---

# Comanagement 查询

## 用途

查询 Comanagement 事件、HTTP 请求、CMService 日志等。

---

## 查询 1: Comanagement 事件查询

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {deviceId} | 是 | 设备 ID |
| {startTime} | 是 | 开始时间 |
| {endTime} | 是 | 结束时间 |

### 查询语句

```kql
IntuneEvent
| where * contains '{deviceId}'
| where env_time between (datetime({startTime})..datetime({endTime}))
| project env_time, ActivityId, DeviceId, EventUniqueName, ServiceName, 
    ComponentName, ColMetadata, Col1, Col2, Col3, Message
| order by env_time asc
```

---

## 查询 2: HttpSubsystem 查询

### 查询语句

```kql
HttpSubsystem
| where * contains '{deviceId}'
| where env_time between (datetime({startTime})..datetime({endTime}))
| project env_time, ActivityId, TaskName, httpVerb, url, statusCode, 
    collectionName, accountId
| order by env_time asc
```

---

## 查询 3: CMService 查询

### 查询语句

```kql
CMService
| where ActivityId == '{deviceId}'
| where env_time between (datetime({startTime})..datetime({endTime}))
| project env_time, ActivityId, *
| order by env_time asc
```

## 关联查询

- [device-checkin.md](./device-checkin.md) - 设备签入
- [policy-status.md](./policy-status.md) - 策略状态
