---
name: intune-events-general
description: 通用 IntuneEvent 和 DeviceManagementProvider 全量查询模板
tables:
  - IntuneEvent
  - DeviceManagementProvider
parameters:
  - name: deviceId
    required: false
    description: Intune 设备 ID
  - name: accountId
    required: true
    description: Intune 账户 ID
  - name: userId
    required: false
    description: 用户 ID
  - name: activityId
    required: false
    description: Activity ID
  - name: relatedActivityId
    required: false
    description: Related Activity ID
  - name: filterstring
    required: false
    description: 自由文本过滤字符串
  - name: startTime
    required: true
    description: 开始时间
  - name: endTime
    required: true
    description: 结束时间
---

# 通用事件查询

## 用途

通用的 IntuneEvent 和 DeviceManagementProvider 全量查询模板，用于灵活检索和过滤事件。支持按 deviceId、userId、activityId、relatedActivityId 等多维度定位，并可使用 filterstring 进行自由文本过滤。

---

## 查询 1: IntuneEvent 按设备/用户查询

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {accountId} | 是 | Intune 账户 ID |
| {startTime} | 是 | 开始时间 |
| {endTime} | 是 | 结束时间 |
| {deviceId} | 否 | 设备 ID（与 userId/activityId 至少提供一个）|
| {userId} | 否 | 用户 ID |
| {activityId} | 否 | Activity ID |
| {relatedActivityId} | 否 | Related Activity ID |
| {filterstring} | 否 | 自由文本过滤（如事件名、组件名等）|

### 查询语句

```kql
let starttime = datetime({startTime});
let endtime = datetime({endTime});
let accountid = '{accountId}';
let deviceid = '{deviceId}';
let userid = '{userId}';
let filterstring = '{filterstring}';
let relatedactivityid = '{relatedActivityId}';
let activityid = '{activityId}';

IntuneEvent
| where env_time between (starttime .. endtime)
| where AccountId == accountid
| extend targetid = iff(relatedactivityid <> '', relatedactivityid, iff(activityid <> '', activityid, iff(deviceid <> '', deviceid, iff(userid <> '', userid, ''))))
| where RelatedActivityId =~ targetid or ActivityId =~ targetid or DeviceId =~ targetid or UserId =~ targetid
| project env_time, ContextId, AccountId, DeviceId, UserId, ActivityId, RelatedActivityId, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, Message
| where * contains filterstring
| order by env_time desc
| limit 1000
| extend metakeys = todynamic(split(trim_end(';', ColMetadata), ';'))
| extend metavalues = pack(tostring(metakeys[0]), Col1, tostring(metakeys[1]), Col2, tostring(metakeys[2]), Col3, tostring(metakeys[3]), Col4, tostring(metakeys[4]), Col5, tostring(metakeys[5]), Col6)
| project env_time, EventUniqueName, metavalues, AccountId, DeviceId, UserId, ActivityId, RelatedActivityId
| sort by env_time asc
```

---

## 查询 2: IntuneEvent 关联事件查询（通过 RelatedActivityId 展开）

### 说明

先根据初始条件找到所有相关的 RelatedActivityId，再展开查询所有关联事件。适用于需要完整追踪某次操作的所有相关事件。

### 查询语句

```kql
let starttime = datetime({startTime});
let endtime = datetime({endTime});
let accountid = '{accountId}';
let deviceid = '{deviceId}';
let userid = '{userId}';
let relatedactivityid = '{relatedActivityId}';
let activityid = '{activityId}';
let filterstring = '{filterstring}';

let relatedactivityIds = IntuneEvent
| where env_time between (starttime .. endtime)
| where AccountId == accountid
| extend targetid = iff(relatedactivityid <> '', relatedactivityid, iff(activityid <> '', activityid, iff(deviceid <> '', deviceid, iff(userid <> '', userid, ''))))
| where RelatedActivityId =~ targetid or ActivityId =~ targetid or DeviceId =~ targetid or UserId =~ targetid
| sort by env_time asc
| summarize makeset(RelatedActivityId, 10000);

IntuneEvent
| where env_time between (starttime .. endtime)
| where RelatedActivityId in (relatedactivityIds)
| project env_time, ContextId, AccountId, DeviceId, UserId, ActivityId, RelatedActivityId, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, Message
| limit 5000
| extend metakeys = todynamic(split(trim_end(';', ColMetadata), ';'))
| extend metavalues = pack(tostring(metakeys[0]), Col1, tostring(metakeys[1]), Col2, tostring(metakeys[2]), Col3, tostring(metakeys[3]), Col4, tostring(metakeys[4]), Col5, tostring(metakeys[5]), Col6)
| project env_time, EventUniqueName, metavalues, DeviceId, ActivityId, RelatedActivityId
| where EventUniqueName contains filterstring or metavalues contains filterstring
| sort by env_time asc
| limit 5000
```

---

## 查询 3: DeviceManagementProvider 全量事件查询

### 说明

通过 ActivityId 或 relatedActivityId2 灵活检索设备管理事件。

### 查询语句

```kql
let starttime = datetime({startTime});
let endtime = datetime({endTime});
let accountid = '{accountId}';
let deviceid = '{deviceId}';
let relatedactivityid = '{relatedActivityId}';
let activityid = '{activityId}';
let filterstring = '{filterstring}';

DeviceManagementProvider
| where env_time between (starttime .. endtime)
| extend myactivity = iff(relatedactivityid <> '', relatedactivityid, iff(activityid <> '', activityid, iff(deviceid <> '', deviceid, 'non-exists')))
| where ActivityId =~ myactivity or relatedActivityId2 =~ myactivity
| order by env_time desc
| project env_time, message, EventMessage, EventId, ActivityId, relatedActivityId2, actionName, deviceId, accountId
| where * contains filterstring
| sort by env_time asc
| limit 5000
```

---

## 使用建议

- **优先使用具体场景查询**（如 device-checkin.md、policy-status.md）来获取结构化结果
- **当具体查询无法满足需求时**，使用本通用查询进行灵活检索
- `filterstring` 参数支持任意文本，可用于过滤特定事件名、组件名或错误信息
- 查询 2 的 RelatedActivityId 展开适用于需要完整操作链路追踪的场景

## 关联查询

- [device-checkin.md](./device-checkin.md) - 设备签到
- [policy-status.md](./policy-status.md) - 策略状态
- [policy-error.md](./policy-error.md) - 策略错误
