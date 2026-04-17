# Intune 设备配置通用问题 — 排查工作流

**来源草稿**: (无)
**Kusto 引用**: policy-error.md, policy-status.md
**场景数**: 0
**生成日期**: 2026-04-07

---

## Kusto 查询参考

### 查询 1: 发现策略错误概览

```kql
let intuneDeviceId = '{deviceId}';

DeviceManagementProvider  
| where env_time > ago(15d)
| where EventId == 5786
| where deviceId == intuneDeviceId
| where reportComplianceState == 'Error'
| summarize 
    LastError=max(env_time),
    FirstError=min(env_time),
    ErrorCount=count(),
    Compliant=countif(reportComplianceState=='Compliant')
  by PolicyName=name, PolicyId=id, PolicyType=typeAndCategory
| extend SuccessRate = round(100.0 * Compliant / (Compliant + ErrorCount), 1)
| where ErrorCount > 0
| order by ErrorCount desc, LastError desc
| limit 20
```
`[来源: policy-error.md]`

### 查询 2: 查看错误详细消息

```kql
let intuneDeviceId = '{deviceId}';
let problemPolicyId = '{policyId}';

DeviceManagementProvider  
| where env_time > ago(15d)
| where deviceId == intuneDeviceId
| where reportComplianceState == 'Error'
| where id contains problemPolicyId
| project env_time, PolicyID=id, PolicyType=typeAndCategory, EventMessage, message
| take 5
```
`[来源: policy-error.md]`

### 查询 3: 评估影响范围

```kql
let accountId = '{accountId}';
let problemPolicy = '{policyId}';

DeviceManagementProvider  
| where env_time > ago(15d)
| where accountId == accountId
| where id contains problemPolicy
| where reportComplianceState == 'Error'
| summarize 
    ErrorCount=count(),
    FirstError=min(env_time),
    LastError=max(env_time),
    AffectedDevices=dcount(deviceId)
  by accountId, PolicyType=typeAndCategory
| project accountId, AffectedDevices, ErrorCount, FirstError, LastError, PolicyType
```
`[来源: policy-error.md]`

### 查询 4: 错误时间线分析

```kql
let intuneDeviceId = '{deviceId}';

DeviceManagementProvider  
| where env_time > ago(7d)
| where deviceId == intuneDeviceId
| where EventId == 5786
| summarize 
    ErrorCount=countif(reportComplianceState == 'Error'),
    CompliantCount=countif(reportComplianceState == 'Compliant'),
    PendingCount=countif(reportComplianceState == 'Pending')
  by bin(env_time, 1h)
| order by env_time asc
```
`[来源: policy-error.md]`

### 查询 5: 查询已撤销的策略

```kql
DeviceManagementProvider
| where SourceNamespace == "IntuneCNP" 
| where env_time >= now(-10d)
| where EventMessage contains "Tattoo removed for - AccountID: '{accountId}'; DeviceID: '{deviceId}'" 
| project env_time, EventMessage
```
`[来源: policy-error.md]`

### 查询 6: Tattoo 状态检查

```kql
DeviceManagementProvider
| where env_time >= ago(1d)
| where ActivityId == '{deviceId}'
| where message contains "Tattoo"
| project env_time, ActivityId, cV, message
```
`[来源: policy-error.md]`

### 查询 7: Tattoo 相关事件 (IntuneEvent)

```kql
IntuneEvent
| where env_time > ago(1d)
| where ActivityId contains '{deviceId}'
| where * contains "Tattoo"
| project ActivityId, env_time, ComponentName, EventUniqueName, 
    ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, AccountId, UserId, DeviceId
```
`[来源: policy-error.md]`

### 查询 1: 基础策略状态查询

```kql
DeviceManagementProvider
| where env_time between(datetime({startTime})..datetime({endTime}))
| where deviceId =~ '{deviceId}'
| project env_time, DeviceID=ActivityId, PolicyName=name, PolicyType=typeAndCategory, 
    Applicability=applicablilityState, Compliance=reportComplianceState, 
    TaskName, EventId, EventMessage, message, tenantContextId, tenantId
| order by env_time asc
| limit 1000
```
`[来源: policy-status.md]`

### 查询 2: 查询设备收到的所有策略

```kql
DeviceManagementProvider 
| where env_time > ago(7d) 
| where ActivityId == '{deviceId}'
| where EventId == 5786
| project env_time, DeviceID=ActivityId, policyId, PolicyName=name, PolicyType=typeAndCategory, 
    Applicability=applicablilityState, Compliance=reportComplianceState, 
    TaskName, EventId, EventMessage, message 
| order by env_time asc
```
`[来源: policy-status.md]`

### 查询 3: 查询特定策略的部署状态

```kql
DeviceManagementProvider 
| where env_time > ago(3d)
| where EventId == 5786
| where ActivityId == '{deviceId}'
| extend PolicyId = extract("PolicyID: '(.*?)';", 1, EventMessage)
| where PolicyId == '{policyId}'
| project env_time, DeviceID=ActivityId, PolicyName=name, PolicyId, PolicyType=typeAndCategory, 
    Applicability=applicablilityState, Compliance=reportComplianceState, 
    TaskName, EventId, EventMessage, message
| order by env_time asc
```
`[来源: policy-status.md]`

### 查询 4: 策略整体状态统计

```kql
DeviceManagementProvider  
| where env_time > ago(3d)
| where EventId == 5786
| where deviceId == '{deviceId}'
| where id has '{policyId}'
| project ActivityId, PolicyName=name, PolicyType=typeAndCategory, 
    Applicability=applicablilityState, Compliance=reportComplianceState, 
    deviceId=ActivityId, PolicyID=['id'], env_time, policyId
| summarize 
    Success=(count(Compliance=='Compliant')>0), 
    Pending=(count(Compliance=='Compliant')==0), 
    Error=(count(Compliance=='Error')>0),
    LastSeen=max(env_time)
  by ActivityId, PolicyName, PolicyType, PolicyID, Applicability, policyId
| summarize 
    SuccessCount=sum(Success), 
    PendingCount=sum(Pending), 
    ErrorCount=sum(Error) 
  by PolicyName, PolicyType, ActivityId, PolicyID, Applicability, LastSeen, policyId
| project policyId, PolicyType, Applicability, SuccessCount, PendingCount, ErrorCount, LastSeen
| order by Applicability asc, LastSeen asc
```
`[来源: policy-status.md]`

### 查询 5: 通过 CIID 或 PolicyId 查询策略状态

```kql
let starttime = ago(30d);
let endtime = now();
let deviceid = '{deviceId}';
let accountid = '{accountId}';
let policyid = '{policyId}';
let ciid = '{ciid}';

DeviceManagementProvider 
| where env_time between (starttime .. endtime)
| where accountId == accountid
| where ActivityId contains deviceid
| extend rawciid = iff(ciid <> '', ciid, iff(policyid <> '', replace_regex(policyid,'-','_'), ''))
| where EventId == 5786
| parse EventMessage with * "PolicyID: '" parsedPolicyId "';" * "CIId: '" parsedCIID "';" *
| where parsedCIID contains rawciid or parsedPolicyId == policyid
| project env_time, userId, deviceId, policyId=parsedPolicyId, CIID=parsedCIID, 
    PolicyType=typeAndCategory, Applicability=applicablilityState, 
    Compliance=reportComplianceState, TaskName, EventMessage, PolicyName=name 
| order by env_time asc
```
`[来源: policy-status.md]`
