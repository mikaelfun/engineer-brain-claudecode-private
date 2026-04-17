# Intune 应用部署通用问题 — 排查工作流

**来源草稿**: ado-wiki-Company-Portal-GCC-H.md, ado-wiki-a-Web-Company-Portal.md
**Kusto 引用**: app-install.md
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: Known Issue: GCC-H 无法从 Store 部署 Company Portal
> 来源: ado-wiki-Company-Portal-GCC-H.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

**症状**: 客户在 GCC-H Fairfax 租户中无法从 Microsoft Store 推送 Company Portal  
**根本原因**: GCC-H Fairfax 租户不支持新版 Microsoft Store

**解决方案**:

1. **使用商业账号**下载（⚠️ 不能用 GCC-H UPN，否则下载会被阻止）:
   ```
   winget download --id "9WZDNCRFJ3PZ" --source msstore
   ```
   > `--source msstore` 参数必须加，确保从 MS Store 而非 Winget 获取

2. 将下载的二进制文件打包为 **LOB 应用**，通过 Intune 推送

3. ⚠️ **维护注意**: 每次 Company Portal 有新版本更新时，需重复：下载 → 重打包 → 重部署

## 参考链接

- Wiki: https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FApp%20Management%2FWindows%2FCompany%20Portal%20for%20GCC-H

---

## Kusto 查询参考

### 查询 1: 查询设备上部署的所有应用

```kql
DeviceManagementProvider  
| where env_time >= ago(7d)
| where ActivityId == '{deviceId}'
| where (EventId == 5767 or EventId == 5766) 
| project env_time, EventId, TaskName, enforcementType, enforcementState, errorCode, 
    name, ['id'], typeAndCategory, applicablilityState, reportComplianceState, 
    EventMessage, message, env_cloud_name, ActivityId, tenantId, userId, 
    sessionId, relatedActivityId2, appPolicyId, platform, technology, devicePlatformType 
| order by ActivityId, env_time asc
```
`[来源: app-install.md]`

### 查询 2: 查询特定应用部署状态

```kql
DeviceManagementProvider  
| where env_time >= ago(2d)
| where ActivityId == '{deviceId}'
| where (['id'] contains '{appId}' or appPolicyId contains '{appId}' 
    or message contains '{appId}' or name contains '{appName}')  
| where (EventId == 5767 or EventId == 5766) 
| project env_time, EventId, TaskName, enforcementType, enforcementState, errorCode, 
    name, ['id'], typeAndCategory, applicablilityState, reportComplianceState, 
    EventMessage, message, env_cloud_name, ActivityId, tenantId, userId, 
    sessionId, relatedActivityId2, appPolicyId, platform, technology, devicePlatformType 
| order by ActivityId, env_time asc
```
`[来源: app-install.md]`

### 查询 3: 查询应用安装日志

```kql
DeviceManagementProvider
| where env_time >= ago(2d)
| where ActivityId == '{deviceId}'
| where message contains '{appName}' or EventMessage contains '{appName}'
| project env_time, message, EventMessage, aadDeviceId, ActivityId
```
`[来源: app-install.md]`

### 查询 4: 已安装/未安装应用对比

```kql
let devId='{deviceId}';

DeviceManagementProvider
| where SourceNamespace == "IntuneCNP"
| where env_time > ago(7d) and ActivityId == devId
| where EventId==5786
| project env_time, EventId, Level, name, type=typeAndCategory, compliance=reportComplianceState, EventMessage  
| where type=="AppModel;AppModel" and compliance=="NotInstalled"
| summarize lastNotInstalled=max(env_time) by name 
| join kind= leftouter (
    DeviceManagementProvider
    | where SourceNamespace == "IntuneCNP"
    | where env_time > ago(7d) and ActivityId == devId
    | where EventId==5786
    | project env_time, EventId, Level, name, type=typeAndCategory, compliance=reportComplianceState, EventMessage  
    | where type=="AppModel;AppModel" and compliance=="Installed"
    | summarize 1stInstalled=min(env_time) by name 
) on name 
| project name, lastNotInstalled, 1stInstalled, compliance = iff(isnull(1stInstalled), "NotInstalled", "Installed")
```
`[来源: app-install.md]`

### 查询 5: 应用下载状态查询

```kql
DownloadService
| where SourceNamespace == "IntuneCNP"
| where env_time > ago(1d)
| where EventId in (13796)
| where deviceId == '{deviceId}' 
| project env_time, SourceNamespace, accountId, deviceId, userId, TaskName, 
    EventId, status, platform, statusCode, exception, errorEventId, result, EventMessage
```
`[来源: app-install.md]`

### 查询 6: SideCar (Win32 App) 事件查询

```kql
IntuneEvent
| where env_time >= ago(3d)
| where ApplicationName == 'SideCar'
| where ActivityId == '{deviceId}'
| project env_time, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, 
    ComponentName, RelatedActivityId, SessionId
```
`[来源: app-install.md]`

### 查询 7: 获取 Win32 App 策略详情

```kql
IntuneEvent
| where env_time >= ago(24h)
| where ApplicationName == 'SideCar'
| where ActivityId == '{deviceId}'
| extend Policy = split(Col3, ',')
| extend PolicyId = split(Policy[0],':')[1]
| extend PolicyType = split(Policy[1],':')[1]
| extend PolicyVersion = split(Policy[2],':')[1]
| extend PolicyBody = split(Policy[5],'":\"')[1]
| project PolicyId, PolicyType, PolicyVersion, PolicyBody
```
`[来源: app-install.md]`

### 查询 8: 检查 IME Agent 是否安装

```kql
DeviceManagementProvider
| where env_time >= ago(30d)
| where * contains '{deviceId}'
| where * contains 'IntuneWindowsAgent'
| project env_time, name, applicablilityState, reportComplianceState  
| summarize max(env_time) by name, applicablilityState, reportComplianceState
```
`[来源: app-install.md]`

### 查询 9: 应用下载事件关联查询（DownloadService + IntuneEvent）

```kql
let starttime = datetime({startTime});
let endtime = datetime({endTime});
let deviceid = '{deviceId}';
let inputAccountId = '{accountId}';
let ApplicationId = '{appId}';

let correlationTable = cluster('intunecn.chinanorth2.kusto.chinacloudapi.cn').database('intune').
IntuneEvent
| where env_time between (starttime..endtime)
| where DeviceId contains deviceid
| where ComponentName == 'DownloadService'
| where EventUniqueName == 'AppRequestCorrelation'
| where AccountId == inputAccountId
| project env_time, env_seqNum, env_cloud_name, env_cloud_role, env_cloud_roleInstance, ApplicationName, BuildVersion, Pid, Tid, ActivityId, RelatedActivityId,
Level = TraceLevel, EventUniqueName, AccountId, ContextId, UserId, DeviceId, ApplicationId = Col1, ContentId = Col2, FileId = Col3, HttpVerb = Col4, cV, Exception = Message;

correlationTable
| summarize by RelatedActivityId, ApplicationId, ContextId
| join (
    DownloadService
    | where env_time between (starttime..endtime) and EventId == 13796
    | where accountId =~ inputAccountId
    | project env_time, env_seqNum, env_cloud_name, env_cloud_role, env_cloud_roleInstance, ApplicationName = I_App,
    BuildVersion = I_BuildVer, Pid, Tid, ActivityId,
    RelatedActivityId = relatedActivityId2, Level, EventUniqueName = TaskName, AccountId = accountId, UserId = userId, DeviceId = deviceId, exceptionType,
    platform, requestedRange, statusCode, bytesDelivered, bytesRequested, timeElapsed, cV, Message = EventMessage
) on RelatedActivityId
| project-away RelatedActivityId1
| order by env_time asc, env_seqNum asc
| summarize MegabytesTransfered = sum(bytesDelivered)/1024/1024 by ApplicationId, AccountId, DeviceId, bin(env_time, 10m)
| order by MegabytesTransfered desc
| limit 1000
```
`[来源: app-install.md]`

---

## 判断逻辑参考

### Device Compliance Status

| Status | Meaning |
|--------|---------|
| Can access company resources | Device is compliant |
| Checking access | Compliance is being evaluated |
| Can't access company resources | Device is non-compliant; user must take action |
