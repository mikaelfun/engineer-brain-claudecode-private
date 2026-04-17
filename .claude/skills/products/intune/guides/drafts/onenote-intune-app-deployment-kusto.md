# Intune App Deployment Kusto Queries

## Win32 App Installation Status

> Note: Win32 App can only query IME-deployed success via these queries.

### Installation Events (EventId 5767/5766)
```kql
// 5767 = Start install, 5766 = enforcement status
DeviceManagementProvider  
| where env_time >= ago(2d)
| where ActivityId == "{activityId}"
| where (id contains "{appPolicyId}" or appPolicyId contains "{appPolicyId}" 
         or message contains "{appPolicyId}" or name contains "{appPolicyId}")  
  and (EventId == 5767 or EventId == 5766) 
| project env_time, EventId, TaskName, enforcementType, enforcementState, errorCode, 
          name, id, typeAndCategory, applicablilityState, reportComplianceState, 
          EventMessage, message, env_cloud_name, ActivityId, tenantId, userId
| order by ActivityId, env_time asc
```

### Overall Policy Deployment Status Count
```kql
DeviceManagementProvider  
| where env_time between (datetime({start})..datetime({end}))
| where EventId == 5786
| project env_time, ActivityId, PolicyName=name, PolicyType=typeAndCategory, 
          Applicability=applicablilityState, Compliance=reportComplianceState, 
          deviceId=ActivityId, PolicyID=id
| where PolicyID in ("{scopeId}")
| summarize Installed=(count(Compliance=="Installed")>0), 
            Pending=(count(Compliance=="Installed")==0) by ActivityId, PolicyName
```

### App Download Byte Transfer Analysis
```kql
let startTime = ago(9d);
let endTime = ago(4d);
let scaleUnit = "{scaleUnit}";
let inputAccountId = "{accountId}";
let correlationTable = IntuneEvent 
| where env_time >= startTime and env_time <= endTime
| where env_cloud_name == scaleUnit
| where ComponentName == "DownloadService"
| where EventUniqueName == "AppRequestCorrelation"
| where AccountId == inputAccountId
| project env_time, ActivityId, RelatedActivityId, AccountId, UserId, DeviceId, 
          ApplicationId = Col1, ContentId = Col2, FileId = Col3;
correlationTable
| summarize by RelatedActivityId, ApplicationId, ContentId, FileId
| join (    
  DownloadService    
  | where env_time >= startTime and env_time <= endTime and EventId == 13796    
  | where env_cloud_name == scaleUnit    
  | where accountId == inputAccountId     
  | project env_time, RelatedActivityId = relatedActivityId2, DeviceId = deviceId, 
            bytesDelivered, bytesRequested, timeElapsed
) on RelatedActivityId 
| summarize bytesTransfered = sum(bytesDelivered) by ApplicationId, bin(env_time, 1h)
| order by bytesTransfered desc
| render timechart
```

### App Size Info
```kql
AppService_AppMetadata
| where ApplicationId == "{appId}" 
| where InternalVersion == {version}
| project Title, Size
```

## Source
- OneNote: Mooncake POD Support Notebook/POD/VMSCIM/4. Services/Intune/## Kusto Query/App deployment.md
