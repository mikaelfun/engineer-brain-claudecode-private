---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Kusto Query Repository/Intune Kusto Cluster Reference"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FKusto%20Query%20Repository%2FIntune%20Kusto%20Cluster%20Reference"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

**Page Owner:** Leon Zhu (yihzhu@microsoft.com)

## About Intune Kusto Cluster (intune.kusto.windows.net)

This page provides a comprehensive reference for the **Intune standard Kusto cluster** (`https://intune.kusto.windows.net`). It contains **66 KQL queries** organized by troubleshooting topic, covering enrollment, device management, policy deployment, certificates, compliance, and more.

> :ledger: **NOTE**: This reference covers the **standard Intune cluster** only. Snapshot cluster queries (e.g., `Device_Snapshot`, `Account_Snapshot`) are excluded as they require special permissions and use separate clusters.

### Cluster Information

| Property | Value |
|----------|-------|
| **Cluster URL** | `https://intune.kusto.windows.net` |
| **Access** | Standard Intune Kusto access |
| **Data Retention** | 30 days |
| **Total Queries Available** | 66 |
| **Primary Audience** | CSS Support Engineers |

### Snapshot Clusters (Excluded)

| Cluster | Region | URL |
|---------|--------|-----|
| Non-EU | West US 2 | `https://qrybkradxus01pe.westus2.kusto.windows.net` |
| EU | North Europe | `https://qrybkradxeu01pe.northeurope.kusto.windows.net` |

> :warning: **WARNING**: Snapshot cluster queries are not included in this reference. They require special permissions and are not available through standard Intune Kusto JIT access.

---

## Table Usage Reference

| Table Name | Usage Count | Purpose |
|------------|-------------|---------|
| `IntuneEvent` | 27 queries | Event-driven telemetry: device actions, APNS, scripts, apps, effective groups, certificate connectors |
| `DeviceManagementProvider` | 12 queries | Device management operations, MDM sync, policy status |
| `DeviceLifecycle` | 9 queries | Enrollment, retirement, wipe events |
| `HttpSubsystem` | 4 queries | HTTP requests, API calls, Graph API logs |
| `CMService` | 2 queries | Configuration management service operations |
| `EnrollmentService` | 2 queries | Device enrollment operations |
| `IOSEnrollmentService` | 2 queries | iOS-specific enrollment |
| `PushNotificationProvider` | 2 queries | WNS/APNS push notifications |
| `IntuneAuditLogs` | 1 query | Audit trail, user actions |
| `IWService` | 1 query | Terms and Conditions service |
| `VppFeatureTelemetry` | 1 query | Apple VPP sync and license events |
| `DeviceComplianceStatusChangesByDeviceId` | 1 query | Compliance status changes with rule details |

---

## Common Parameters Reference

| Parameter | Description | Example Format |
|-----------|-------------|----------------|
| **AccountID** | Intune Tenant Account ID | `[AccountID]` |
| **DeviceID** | Intune Device ID (GUID) | `[DeviceID]` |
| **UserID** | Azure AD User ID (GUID) | `[UserID]` |
| **ActivityId** | Activity/Correlation ID | GUID from logs or portal trace |
| **PolicyID** | Policy Configuration ID | `[ObjectID]` |
| **TransactionId** | SCEP Transaction ID | String value from NDES logs |
| **Activity_ID** | UI/Graph Correlation ID | GUID from portal network trace |
| **ScaleUnit** | Intune Scale Unit/Tenant Location | `SHAMSUA01`, `NAMSUA01`, `EAMSUA01` |
| **Serialnumber** | Device Serial Number | String value |
| **_startTime** | Query start time | `ago(7d)`, `datetime(2026-01-01)` |
| **_endTime** | Query end time | `now()`, `datetime(2026-01-06)` |

---

## Application Management

### Query \#1  IME Installed Version

**Required Parameters**: `DeviceID`, `_endTime`, `_startTime`

```kql
DeviceManagementProvider  
| where env_time between (['_startTime'] .. ['_endTime'])  
| where ActivityId == ['DeviceID']  
| where message contains "AgentVersion"  
| parse message with * "AgentVersion=" av  
| project env_time, IMEVersion=av  
| sort by env_time desc  
| take 1
```

### Query \#2  Search Graph Call by Correlation ID

**Required Parameters**: `Activity_ID`, `_endTime`, `_startTime`

```kql
HttpSubsystem 
| where env_time between (['_startTime'] .. ['_endTime']) 
| where ActivityId == ['Activity_ID']
| project env_time, clientIpAddress, ActivityId, sessionId, httpVerb, url, statusCode, elapsedTicks, scenarioType, errorCode, uniqueRequestId, collectionName, contentType 
| take 100
```

---

## Audit & Logging

### Query \#3  UI Error

**Required Parameters**: `Activity_ID`, `_endTime`, `_startTime`

```kql
HttpSubsystem 
| where env_time between (['_startTime'] .. ['_endTime'])
| where ActivityId == ['Activity_ID']
| project env_time, clientIpAddress,ActivityId,sessionId, httpVerb, url, statusCode, elapsedTicks, scenarioType,errorCode, uniqueRequestId, collectionName, contentType 
| take 100
```

### Query \#4  RBAC Role

**Required Parameters**: `AccountID`, `_endTime`, `_startTime`

```kql
IntuneAuditLogs 
| where AccountId == ['AccountID']
| where env_time between (['_startTime'] .. ['_endTime'])  
| project env_time, Caller, ActivityType, Actor, Application, Activity, ActivityResult, ActivityOperationType, Targets, CorrelationId
| take 100
```

### Query \#5  Activity Event

**Required Parameters**: `Activity_ID`, `_endTime`, `_startTime`

```kql
IntuneAuditLogs  
| where CorrelationId == ['Activity_ID']
| where env_time between (['_startTime'] .. ['_endTime'])  
| project env_time, Caller, ActivityType, Actor, Application, Activity, ActivityResult, ActivityOperationType, Targets, CorrelationId
| take 100
```

### Query \#6  Audit Logs per Account

**Required Parameters**: `AccountID`, `_endTime`, `_startTime`

```kql
HttpSubsystem
| where env_time between (['_startTime'] .. ['_endTime']) 
| where EventId == 2711
| where contentType !contains "image" and contentType !contains "font" 
| where I_Srv == "StatelessAdminConsole"  
| where sessionId == ['AccountID']
| project env_time, clientIpAddress,ActivityId,sessionId, httpVerb, url, statusCode, elapsedTicks, scenarioType,errorCode, uniqueRequestId, collectionName, contentType 
| take 100
```

### Query \#7  Graph API Event

**Required Parameters**: `AccountID`, `_endTime`, `_startTime`

```kql
HttpSubsystem
| where env_time between (['_startTime'] .. ['_endTime']) 
| where EventId == 2711
| where contentType !contains "image" and contentType !contains "font" 
| where url contains "graphapi" or I_Srv in ("StatelessGraphApiService")
| where sessionId == ['AccountID']
| project env_time, clientIpAddress,ActivityId,sessionId, httpVerb, url, statusCode, elapsedTicks, scenarioType,errorCode, uniqueRequestId, collectionName, contentType 
| take 100
```

---

## Certificate & SCEP

### Query \#8  SCEP Validation Per Account ID

**Required Parameters**: `AccountID`, `_endTime`, `_startTime`

```kql
IntuneEvent
| where env_time between (['_startTime'] .. ['_endTime'])
| where SourceNamespace == "IntunePE" 
| where ServiceName == "StatelessScepRequestValidationService" 
| where AccountId == ['AccountID']
| project ActivityId, env_time, ComponentName, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, AccountId, UserId, DeviceId
```

### Query \#9  SCEP by TransactionId

**Required Parameters**: `_endTime`, `_startTime`, `transactionId`

```kql
IntuneEvent
| where env_time between (['_startTime'] .. ['_endTime'])
| where SourceNamespace == "IntunePE" 
| where ServiceName == "StatelessScepRequestValidationService" 
| where Col1 == ['transactionId']
| project ActivityId, env_time, ComponentName, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, AccountId, UserId, DeviceId
```

### Query \#10  Certificate Request Send to Cloud PKI Per Account

**Required Parameters**: `AccountID`, `_endTime`, `_startTime`

```kql
HttpSubsystem
| where env_time between (['_startTime'] .. ['_endTime'])
| where collectionName == "CloudPki"
| where url contains "TrafficGateway/PassThroughRoutingService/CloudPki/CloudPkiService/Scep/" and url contains ['AccountID']
| project env_time, env_cloud_name, clientIpAddress, ActivityId, sessionId, httpVerb, url, statusCode, elapsedTicks, uniqueRequestId, collectionName, contentType
| take 100
```

### Query \#13  Device Checking SCEP

**Required Parameters**: `DeviceID`, `_endTime`, `_startTime`

```kql
DeviceManagementProvider 
| where env_time between (['_startTime'] .. ['_endTime'])
| where ActivityId == ['DeviceID']
| where message contains "SCEP"
| project env_time, userId, ActivityId, TaskName, message
| sort by env_time
```

### Query \#18  Per Device Status of SCEP Cert from Cloud PKI

**Required Parameters**: `DeviceID`, `_endTime`, `_startTime`

```kql
IntuneEvent
| where env_time between (['_startTime'] .. ['_endTime']) 
| where DeviceId == ['DeviceID']		
| where ApplicationName == "CloudPki" or ApplicationName == "RACerts"
| where ComponentName !in ("ChallengePassword", "ChallengeController", "CmsListenerProvider")
| project env_time, ComponentName, ServiceName, ApplicationName, EventUniqueName, UserId, DeviceId, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, Message
| take 100
```

### Query \#55  Find AccountID by DeviceID

**Required Parameters**: `DeviceID`, `_startTime`, `_endTime`

```kql
// Method 1: Find AccountID from IntuneEvent (most reliable)
let deviceId = ['DeviceID'];
IntuneEvent
| where env_time between (['_startTime'] .. ['_endTime'])
| where DeviceId == deviceId
| where isnotempty(AccountId)
| project AccountId
| distinct AccountId
```

### Query \#59  Certificate Connector Health Status

**Required Parameters**: `AccountID`, `_startTime`, `_endTime`

```kql
IntuneEvent
| where env_time between (['_startTime'] .. ['_endTime'])
| where AccountId == ['AccountID']
| where ServiceName == "StatelessConnectorService"
| where EventUniqueName == "ConnectorInfoUploadHandler:Upsert:PatchingAgentDataEntity"
| extend AgentId = extract(@"AgentId: ([a-f0-9-]+)", 1, Col2)
| extend AgentType = extract(@"agentType: (\d+)", 1, Col2)
| extend ConnectorVersion = extract(@"connectorVersion: ([0-9.]+)", 1, Col2)
| extend ConnectorOS = extract(@"connectorOSVersion: ([^,]+)", 1, Col2)
| summarize 
    LastCheckIn = max(env_time),
    FirstCheckIn = min(env_time),
    CheckInCount = count(),
    ConnectorVersion = take_any(ConnectorVersion),
    ConnectorOS = take_any(ConnectorOS)
    by AgentId, AgentType
| extend AgentTypeName = case(
    AgentType == "7", "ImportPFXConnector (PKCS)",
    AgentType == "1", "NDESConnector (SCEP)",
    AgentType == "2", "ExchangeConnector",
    strcat("Unknown (", AgentType, ")")
)
| extend CheckInFrequencyMinutes = round(datetime_diff('minute', LastCheckIn, FirstCheckIn) / todouble(CheckInCount), 2)
| project AgentId, AgentTypeName, ConnectorVersion, ConnectorOS, LastCheckIn, FirstCheckIn, CheckInCount, CheckInFrequencyMinutes
| order by LastCheckIn desc
```

**Agent Type Reference**:

| AgentType | Name | Purpose |
|-----------|------|---------|
| 7 | ImportPFXConnector | Handles PKCS/PFX certificates |
| 1 | NDESConnector | Handles SCEP certificates |
| 2 | ExchangeConnector | Exchange on-premises connector |

### Query \#60  PFX Certificate Request Status

**Required Parameters**: `DeviceID`, `_startTime`, `_endTime`

```kql
IntuneEvent
| where env_time between (['_startTime'] .. ['_endTime'])
| where DeviceId == ['DeviceID']
| where ApplicationName == "RACerts"
| where EventUniqueName in (
    "CreatedRequest", 
    "NoRequestPresentLedToRequestCreation",
    "InvokingNotification",
    "GetOrCreatePfxCreateCertificateAsync_Get_Result",
    "GetCurrentRequestsAsyncResult",
    "FailingRequest",
    "LinkingCompletedChild"
)
| project env_time, EventUniqueName, 
    RequestId = Col1,
    Status = Col2,
    RequestType = Col3,
    PolicyId = Col4,
    PolicyHash = Col5,
    Scenario = Col6
| order by env_time desc
```

### Query \#61  Connector Pending Request Search Results

**Required Parameters**: `AccountID`, `_startTime`, `_endTime`

```kql
IntuneEvent
| where env_time between (['_startTime'] .. ['_endTime'])
| where AccountId == ['AccountID']
| where ServiceName == "StatelessConnectorService"
| where EventUniqueName == "PfxCertificateDownloadHandler:CreateDownloadMessageAsync:PendingPfxCertificateEntitySearchResults"
| extend SearchResults = extract(@"returned (\d+) entities", 1, Col2)
| extend AgentId = extract(@"AgentId: ([a-f0-9-]+)", 1, Col2)
| summarize 
    TotalSearches = count(),
    FoundRequests = countif(toint(SearchResults) > 0),
    ZeroResults = countif(toint(SearchResults) == 0),
    MaxEntitiesFound = max(toint(SearchResults)),
    LastSearch = max(env_time)
    by AgentId
| extend SuccessRate = round(100.0 * FoundRequests / TotalSearches, 2)
| project AgentId, TotalSearches, FoundRequests, ZeroResults, SuccessRate, MaxEntitiesFound, LastSearch
```

### Query \#62  PFX Certificate Download Handler Analysis

**Required Parameters**: `AccountID`, `_startTime`, `_endTime`

```kql
IntuneEvent
| where env_time between (['_startTime'] .. ['_endTime'])
| where AccountId == ['AccountID']
| where ServiceName == "StatelessConnectorService"
| where EventUniqueName startswith "PfxCertificateDownloadHandler"
| summarize count() by EventUniqueName
| order by count_ desc
```

### Query \#63  PFX Certificate Upload Handler Analysis

**Required Parameters**: `AccountID`, `_startTime`, `_endTime`

```kql
IntuneEvent
| where env_time between (['_startTime'] .. ['_endTime'])
| where AccountId == ['AccountID']
| where ServiceName == "StatelessConnectorService"
| where EventUniqueName startswith "PfxCertificateUploadHandler"
| project env_time, EventUniqueName, 
    Message = Col2,
    DeviceId = extract(@"deviceId: ([a-f0-9-]+)", 1, Col2),
    UserId = extract(@"UserId: ([a-f0-9-]+)", 1, Col2)
| order by env_time desc
| take 100
```

### Query \#64  Certificate Connector Error Analysis

**Required Parameters**: `AccountID`, `_startTime`, `_endTime`

```kql
IntuneEvent
| where env_time between (['_startTime'] .. ['_endTime'])
| where AccountId == ['AccountID']
| where ServiceName == "StatelessConnectorService"
| where EventUniqueName has "Error" 
    or EventUniqueName has "Fail" 
    or EventUniqueName has "Exception"
    or EventUniqueName == "PacketCorrelationError"
    or EventUniqueName == "CannotWriteResult"
| project env_time, EventUniqueName, Col1, Col2
| order by env_time desc
| take 100
```

### Query \#65  PKCS Policy CA/Template Configuration

**Required Parameters**: `AccountID`, `DeviceID`, `_startTime`, `_endTime`

```kql
IntuneEvent
| where env_time between (['_startTime'] .. ['_endTime'])
| where AccountId == ['AccountID']
| where DeviceId == ['DeviceID']
| where ApplicationName == "RACerts"
| where EventUniqueName in ("ComputeHash_WithoutCert", "ComputeHash_WithCert")
| extend CAServer = Col2,
         CertificateTemplate = Col3,
         SubjectNameLength = toint(Col4),
         SANLength = toint(Col5)
| project env_time, DeviceId, EventUniqueName, CAServer, CertificateTemplate, SubjectNameLength, SANLength, PolicyId
| order by env_time desc
| take 20
```

**Certificate Troubleshooting Workflow**:
```
Certificate Issue?
  
SCEP: #8 (account overview)  #9 (transaction)  #13 (device-level)
  
PKCS: #59 (connector health)  #60 (request status)  #61 (pending search)
  
#62 (download)  #63 (upload)  #64 (errors)  #65 (CA/Template config)
```

---

## Device Management & Status

### Query \#11  Device Message

**Required Parameters**: `DeviceID`, `_endTime`, `_startTime`

```kql
DeviceManagementProvider 
| where env_time >= ['_startTime'] and env_time <= ['_endTime']
| where ActivityId == ['DeviceID']
| where EventId != "5786"
| project env_time, userId, EventId, message
| sort by env_time
```

### Query \#12  Device Compliance Status

**Required Parameters**: `DeviceID`, `_endTime`, `_startTime`

```kql
DeviceComplianceStatusChangesByDeviceId(['DeviceID'], ['_startTime'], ['_endTime'], 100)
```

### Query \#14  Account Enrollment/Wipe Status Per Account ID

**Description**: Comprehensive enrollment lifecycle query showing all enrollment, wipe, retire, and management state changes for a tenant.

**Required Parameters**: `AccountID`, `_startTime`, `_endTime`

```kql
let EnrollmentFailureReason = dynamic(["Unknown", "AuthenticationFailed", "AccountValidation", "UserValidation", "DeviceCap", "Onboarding", "AuthorizationFailed", "DeviceNotSupported", "InvalidDeviceState", "NotInRenewalWindow", "InvalidTermsOfUse", "InMaintenance", "InternalError", "BadRequest", "FeatureNotSupported", "ClientRenewalIssue", "EnrollmentCriteriaNotMet", "SCCM"]); 
let DeviceEnrollmentType = dynamic(["Unknown", "UserPersonal", "UserPersonalWithAAD", "UserCorporate", "UserCorporateWithAAD", "UserLessCorporate", "EnrollmentManager", "UserLessCorporateWithCertificate", "DepUserLessCorporate", "DepUserCorporate", "AutoEnrollment"]); 
let DevicePlatform = dynamic(["Unknown", "WindowsRT", "Windows81", "Windows10", "WindowsPhone8", "WindowsPhone81", "WindowsPhone10", "IPhone", "IPad", "IPod", "Osx", "Android", "HoloLens", "SurfaceHub", "AndroidForWork"]); 
let ManageState = dynamic(["Managed", "RetirePending", "RetireFailed", "WipePending", "WipeFailed", "Unhealthy", "DeletePending", "RetireIssued", "WipeIssued", "WipeCanceled", "RetireCanceled", "Discovered"]); 
let WorkplaceJoinStat = dynamic(["Unknown", "Succeeded", "FailureToGetScepMetadata", "FailureToGetScepChallenge", "DeviceFailureToInstallScepCommand", "DeviceFailureToGetCertificate", "DeviceScepPending", "DeviceScepFailed", "AADValidationFailed"]); 
let ClientRegStatus = dynamic(["NotRegistered", "SMSIDConflict", "Registered", "Revoked", "KeyConflict", "ApprovalPending", "ResetCert", "NotRegisteredPendingEnrollment", "Unknown"]); 
let RemovalReasonEnum = dynamic(["Unknown", "Checkout", "Wipe", "Retire", "AgedOut"]); 
let DeviceInitiator = dynamic(["Unknown", "Admin", "User", "DataProcessor", "MSUProxy", "O365", "Operations", "TargetingService"]);
let ReplaceEnum = (c:int, t:dynamic, d:int) { iff(c < 0 or c >= arraylength(t), tostring(t[d]), tostring(t[c])) }; 

DeviceLifecycle 
| where EventId in (46804, 46805, 46811, 46822, 46823, 46826, 46827, 46841, 46842, 46824, 46861, 46862, 46863, 46865, 46864, 46806, 46807, 46801, 46843) 
| where env_time between (['_startTime'] .. ['_endTime'])
| where accountId == ['AccountID']
| extend PlatformType = ReplaceEnum(platform, DevicePlatform, 0) 
| extend Initiator = ReplaceEnum(initiator, DeviceInitiator, 0) 
| extend EnrollmentType = ReplaceEnum(['type'], DeviceEnrollmentType, 0) 
| extend EnrollmentFailure = ReplaceEnum(failureReason, EnrollmentFailureReason, 0) 
| extend OldManagedState = ReplaceEnum(oldManagementState, ManageState, 0) 
| extend NewManagedState = ReplaceEnum(newManagementState, ManageState, 0) 
| extend OldRegistrationStatus = ReplaceEnum(oldRegistrationState, ClientRegStatus, 0) 
| extend NewRegistrationStatus = ReplaceEnum(newRegistrationState, ClientRegStatus, 0) 
| extend RemoveReason = ReplaceEnum(removalReason, RemovalReasonEnum, 0) 
| project PreciseTimeStamp, deviceId, userId, EventId, TaskName, OldManagedState, NewManagedState, 
    OldRegistrationStatus, NewRegistrationStatus, oldVersion, newVersion, PlatformType, 
    EnrollmentType, Initiator, workplaceJoinFailureReason, 
    registrationFailureReason, RemoveReason, EnrollmentFailure, ['details'], registrationReason, EventMessage 
| take 200
```

<details>
<summary>EventId Reference</summary>

| EventId | Description |
|---------|-------------|
| 46804 | Enrollment Failure |
| 46805 | Enrollment Success |
| 46806 | Registration State Change |
| 46807 | Management State Change |
| 46811 | Workplace Join |
| 46822 | Device Discovered |
| 46823 | Device Removal |
| 46824 | Wipe Operation |
| 46826 | Retire Operation |
| 46827 | Wipe/Retire Completion |
| 46841 | Registration Failure |
| 46842 | Registration Success |
| 46843 | Enrollment Attempt |

</details>

### Query \#15  iOS/macOS DDM OS Update Status

**Description**: Query iOS and macOS Declarative Device Management (DDM) OS update logs.

**Required Parameters**: `DeviceID`, `_endTime`, `_startTime`

```kql
DeviceManagementProvider 
| where env_time between (['_startTime'] .. ['_endTime'])
| where ActivityId == ['DeviceID']
| where commandType == "AvailableOSUpdates" 
    or commandType == "ScheduleOSUpdate"  
    or message contains "iOSPlugin[HandleCommandError]" 
    or message contains "ScheduleOSUpdateCommand" 
    or message contains "set OS version" 
    or message contains "<string>iOSUpdate" 
    or message contains "AvailableOSUpdates"
| project env_time, message, EventMessage, commandType, commandResultStatus, errorCode
| order by env_time asc
| take 200
```

### Query \#16  Custom Compliance Status

**Required Parameters**: `DeviceID`, `_endTime`, `_startTime`

```kql
IntuneEvent  
| where env_time between (['_startTime'] .. ['_endTime'])
| where ComponentName == "CustomComplianceEvaluator" or ComponentName == "StatelessCustomCompliancePolicyEvaluationProvider" 
| where EventUniqueName contains "EvaluateAndGenerateReports" or EventUniqueName == "EvaluatePolicyForDeviceUser"
| where DeviceId == ['DeviceID']
| project env_time, env_cloud_name, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, Message, cV, ScenarioType, AccountId, DeviceId, UserId
```

### Query \#17  DHA Check-in Status

**Required Parameters**: `DeviceID`, `_endTime`, `_startTime`

```kql
IntuneEvent
| where env_time between (['_startTime'] .. ['_endTime']) 
| where (EventUniqueName == "ValidateHealthAttestation" and ColMetadata == "Response from HAS;") or (EventUniqueName == "ValidateHealthAttestation-GetResponseAsync" and ColMetadata == "HAS Validation error response;")
| where ActivityId == ['DeviceID']
| project env_time, ColMetadata, Col1
```

### Query \#23  Android Enterprise Device Noncompliance Detail

**Required Parameters**: `DeviceID`, `_endTime`, `_startTime`

```kql
IntuneEvent
| where env_time between (['_startTime'] .. ['_endTime'])
| where SourceNamespace == "IntunePE"
| where DeviceId == ['DeviceID']
| where EventUniqueName == "GoogleDeviceCheckInReportingMessageProcessInfoEvent"
| where Col1 startswith "Parsing NonComplianceDetails"
| project env_time, ComponentName, EventUniqueName, Message, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, AccountId, ContextId, DeviceId, UserId, BuildVersion, env_cloud_name, env_cv, cV, ActivityId, RelatedActivityId
```

### Query \#44  Windows 10 SKU Version Detection

**Required Parameters**: `DeviceID`, `_startTime`, `_endTime`

```kql
DeviceManagementProvider
| where env_time between (['_startTime'] .. ['_endTime'])
| where ActivityId == ['DeviceID']
| where message contains "ClientProperties Data being saved" 
| extend W10Version = extractall(", deviceModel: (.*?),", message)
| project W10Version 
| limit 1
```

### Query \#45  Device Policy Status Overview

**Required Parameters**: `DeviceID`, `_startTime`, `_endTime`

```kql
DeviceManagementProvider
| where ActivityId == ['DeviceID']
| where env_time between (['_startTime'] .. ['_endTime'])
| project env_time, name, policyId, typeAndCategory, applicablilityState, 
    reportComplianceState, message, EventMessage, ['id'] 
| order by env_time desc
```

### Query \#46  Query Policy Status by Specific Setting

**Required Parameters**: `DeviceID`, `_startTime`, `_endTime`

**Optional Parameter**: `SearchTerm` (e.g., `bitlocker`, `password`, `compliance`, `duplicate`, `PinReset`, `Userless mode`)

```kql
DeviceManagementProvider
| where ActivityId == ['DeviceID']
| where env_time between (['_startTime'] .. ['_endTime'])
| where message contains ['SearchTerm'] 
| project env_time, TaskName, EventId, message, relatedActivityId2, userId
| order by env_time desc
```

### Query \#47  Device Check-in and Activity Summary

**Description**: Comprehensive device sync session analysis. Shows check-ins, commands, policy updates, and errors.

**Required Parameters**: `DeviceID`, `_startTime`, `_endTime`

```kql
DeviceManagementProvider 
| where env_time between (['_startTime'] .. ['_endTime'])
| where ActivityId == ['DeviceID']
| where EventMessage contains "UnReported CI's details" 
    or commandType <> "" 
    or message contains "New Session" 
    or message contains "HandleCommandError" 
    or Level == 2 
    or message contains "Session ending"
| parse message with * "InstallApplication and identifier" installedApp "with" * 
| parse message with * "[" channel "]" * 
| parse EventMessage with * "CIName: '" PolicyName "'" * "CIApplicablilityState: '" PolicyApplicability "'" * "CIComplianceState: '" PolicyCompliance "'" *
| parse EventMessage with * "CIId: '" * "/" PolicyScope "_" AppId "/" PolicyVer "';" * "CITypeAndCategory:" * ";" PolicyType "'" *
| where PolicyApplicability !contains "NotApplicable"
| where PolicyScope <> "DeploymentType"
| project env_time, accountId, channel, commandType, subType, commandResultStatus, 
    errorCode, installedApp, PolicyName, PolicyVer, PolicyApplicability, 
    PolicyCompliance, PolicyScope, PolicyType, AppId, message, Level, 
    env_cloud_name, I_BuildVer, I_App, EventMessage
| order by env_time desc
```

### Query \#48  Device Sync Session Details with Filtering

**Description**: Flexible DeviceManagementProvider query with common filters. Uncomment filters as needed.

**Required Parameters**: `DeviceID`, `_startTime`, `_endTime`

```kql
DeviceManagementProvider 
| where env_time between (['_startTime'] .. ['_endTime'])
| where ActivityId == ['DeviceID']
// === OPTIONAL FILTERS - Uncomment as needed ===
// | where message contains "encryption"
// | where message contains "compliance"
// | where message contains "duplicate"
// | where message contains "PinReset"
// | where EventId == "5786"    // Policy events
// | where Level == 2           // Errors only
// | where commandType <> ""    // Only command executions
| project env_time, userId, EventId, message, commandType, commandResultStatus, 
    errorCode, relatedActivityId2, Level, EventMessage
| order by env_time desc
| take 100
```

---

## Autopilot & Device Preparation

### Query \#19  Check Device AutopilotV2 Eligibility Results

**Description**: Checks if a device is eligible for AutopilotV2 based on OS version, enrollment type, Entra ID join, user-based enrollment, OOBE context, and device preparation profile configuration.

**Required Parameters**: `DeviceID`, `_endTime`, `_startTime`

```kql
let deviceId = ['DeviceID'];
let lookback = ago(['_endTime']-['_startTime']);
CheckAutopilotV2EligibilityForDevice(lookback, deviceId)
| take 50
```

### Query \#20  Get AutopilotV2 Related Events for Enrollment

**Required Parameters**: `DeviceID`, `_endTime`, `_startTime`

```kql
let deviceId = ['DeviceID'];
let lookback = ago(['_endTime']-['_startTime']);
GetAutopilotV2EnrollmentEventsForDevice(lookback, ['DeviceID'])
| take 50
```

### Query \#21  Check Per Device Status by Provider and Final Page Status

**Description**: Shows scenario health events to narrow down where a failure occurred during device preparation provisioning (e.g., Sidecar timeout, script/app failure, page timeout).

**Required Parameters**: `DeviceID`, `_endTime`, `_startTime`

```kql
let deviceId = ['DeviceID'];
let lookback = ago(['_endTime']-['_startTime']);
GetAutopilotV2ScenarioResultEventsForDevice(lookback, ['DeviceID'])
| take 200
```

### Query \#22  Get AutopilotV2 Related Events for Device Provisioning

**Required Parameters**: `DeviceID`, `_endTime`, `_startTime`

```kql
let deviceId = ['DeviceID'];
let lookback = ago(['_endTime']-['_startTime']);
GetAutopilotV2ProvisioningEventsForDevice(lookback, ['DeviceID'])
| take 200
```

### Query \#36  Check Device Preparation Profile Assignments

**Description**: Check if a device had an assigned device preparation profile during enrollment.

**Required Parameters**: `DeviceID`, `_endTime`, `_startTime`

```kql
let deviceId = ['DeviceID'];
let lookback = ago(['_endTime']-['_startTime']);
GetDevicePrepProfileAppliedToDevice(lookback, ['DeviceID'])
| take 5
```

### Query \#34  ESP Deployment

**Required Parameters**: `DeviceID`, `_endTime`, `_startTime`

```kql
IntuneEvent
| where env_time between (['_startTime'] .. ['_endTime'])
| where ComponentName == "ESPEnrollment"
| where EventUniqueName == "PublicOperationalEvent_ESPEnrollment"
| where Col1 contains ['DeviceID']
| extend col1ToJson = parse_json(Col1)
| project env_time, LogTimeStamp = col1ToJson.Timestamp, 
    Event = iff(col1ToJson.EventId == 46801, "EnrollmentSuccess", col1ToJson.EventId),
    EspPhase = col1ToJson.Scope, EspStage = col1ToJson.Stage,
    Status = col1ToJson.Status, AppId = col1ToJson.AppPolicyId, 
    AppName = iff(col1ToJson.ApplicationName == "05fcd9af-2f01-472a-9ac2-c9e0514643f2", "Sidecar", col1ToJson.ApplicationName),
    AppEnforcementState = col1ToJson.EnforcementState, AppErrorCode = col1ToJson.ErrorCode, 
    AppErrorDesc = col1ToJson.FailureMessage, EspTimeout = col1ToJson.TimeoutInMinutes,
    EnrollmentType = col1ToJson.EnrollmentType, UserId = col1ToJson.UserId, 
    DeviceName = col1ToJson.DeviceName, DeviceId = col1ToJson.DeviceId, 
    AadDeviceId = col1ToJson.AadDeviceId, DeviceSN = col1ToJson.ZtdDeviceSerialNumber, 
    OSVersion = col1ToJson.Version, IsAutopilot = col1ToJson.IsAutopilot, 
    AutopilotProfileName = col1ToJson.ZtdProfileName, EspPolicyName = col1ToJson.ESPPolicyName,
    PolicyApplicability = col1ToJson.CIApplicabilityState, PolicyState = col1ToJson.CIComplianceState, 
    PolicyId = col1ToJson.CIId, PolicyTypeCategory = col1ToJson.CITypeAndCategory
```

---

## Enrollment & Restrictions

### Query \#24  iOS Device Enrollment Event

**Required Parameters**: `AccountID`, `Serialnumber`, `_endTime`, `_startTime`

```kql
IntuneEvent
| where env_time between (['_startTime'] .. ['_endTime'])
| where AccountId == ['AccountID']
| where EventUniqueName == "ReportDeviceInfoRequestInfo"
| where ServiceName == "AppleEnrollmentService" or ServiceName == "AuthenticatedAppleEnrollmentService"
| where Col2 startswith "Serial:" and Col2 contains ['Serialnumber']
| project BuildVersion, env_time, env_cloud_name, ActivityId, UserId, DeviceId, AccountId, ServiceName, EventUniqueName, Message, ColMetadata, Col1, Col2, Col3, ContextId
```

### Query \#37  Check Tenant for All Enrollment Failures

**Required Parameters**: `AccountID`, `ScaleUnit`, `_startTime`, `_endTime`

```kql
GetEnrollmentDetailsByTimeAndScaleUnit(['_startTime'], ['_endTime'], ['ScaleUnit']) 
| where Status contains "Failure"
| where AccountContextId == ['AccountID']
| project env_time, ActivityId, Provider, SummarizedError, Status, PlatformType, EnrollmentType
| order by env_time desc
```

### Query \#38  Check for Specific Enrollment Failures

**Required Parameters**: `AccountID`, `_startTime`, `_endTime`

```kql
DeviceLifecycle
| where env_time between (['_startTime'] .. ['_endTime'])
| where SourceNamespace == "IntunePE"
| where accountContextId == ['AccountID']
| where EventId == 46804
| where failureReason in (0, 12)
| extend PlatformType = GetDeviceLifecyclePlatform(platform)
| extend EnrollmentType = GetDeviceLifecycleEnrollmentTypeFriendlyName(platform, ['type'])
| project env_time, ['details'], ActivityId, PlatformType, EnrollmentType, EventId, 
    EventMessage, SourceVersion, failureReason, userId, deviceId
| order by env_time desc
| take 100
```

### Query \#39  Query Enrollment Service Logs

**Required Parameters**: `AccountID`, `_startTime`, `_endTime`

```kql
// Generic Enrollment Service
EnrollmentService 
| where env_time between (['_startTime'] .. ['_endTime'])
| where accountId == ['AccountID']
| project env_time, ActivityId, Message, ErrorCode, Details
| order by env_time desc
| take 100
```

```kql
// iOS-specific Enrollment Service
IOSEnrollmentService 
| where env_time between (['_startTime'] .. ['_endTime'])
| where accountId == ['AccountID']
| project env_time, ActivityId, Message, ErrorCode, Details, DeviceId
| order by env_time desc
| take 100
```

### Query \#40  Check APNS Assignment for iOS Devices

**Required Parameters**: `AccountID`

```kql
PushNotificationProvider
| where accountId == ['AccountID']
| where adapter == "APNS"
| project env_time, accountId, adapter, responseCode, Message, ErrorCode
| summarize count() by responseCode, ErrorCode
| order by count_ desc
```

### Query \#41  Check Enrollment Restrictions Policy Assignment

**Required Parameters**: `policyID`, `_startTime`, `_endTime`

```kql
IntuneEvent 
| where env_time between (['_startTime'] .. ['_endTime'])
| where ComponentName == "DeviceEnrollmentConfigurationDeploymentListener"
| where SourceNamespace == "IntunePE" 
| where * contains ['policyID']
| project env_time, EventUniqueName, Col1, Col2, Col3, Col4, ComponentName, ActivityId
| order by env_time desc
| take 50
```

### Query \#42  Check Enrollment Restriction Violations in DeviceLifecycle

**Required Parameters**: `ActivityId`, `_startTime`, `_endTime`

```kql
DeviceLifecycle 
| where SourceNamespace == "IntunePE"  
| where env_time between (['_startTime'] .. ['_endTime'])
| where ActivityId == ['ActivityId']
| where EventId == 46804
| extend PlatformType = GetDeviceLifecyclePlatform(platform)
| project env_time, ActivityId, ['details'], userId, PlatformType, EventId, EventMessage
| order by env_time desc
```

```kql
// Cross-reference with IntuneEvent for detailed restriction check
let requested_Id = ['ActivityId'];
IntuneEvent
| where SourceNamespace == "IntunePE"
| where env_time between (['_startTime'] .. ['_endTime'])
| where ActivityId == requested_Id
| where EventUniqueName == "ConditionalEnrollmentCheck"
| project env_time, ServiceName, EventUniqueName, Message, ColMetadata, Col1, Col2, Col3, Col4
| order by env_time desc
```

**Common Enrollment Restriction Errors**:
- `"OS Version X lower/higher than Y"`  Device OS doesn't meet policy requirements
- `"Device Identifier not preregistered"`  Personal enrollment blocked
- `"Device Type Not Supported"`  Platform blocked by restriction policy
- `"Criteria not met"`  General restriction policy violation

### Query \#43  Check Terms and Conditions Acceptance Issues

**Required Parameters**: `Tenant` (Scale Unit), `_startTime`, `_endTime`

```kql
IWService
| where Tenant == ['Tenant']
| where env_time between (['_startTime'] .. ['_endTime'])
| where TaskName == "IWServiceProviderMDMMonitoringExceptionEvent"
| where name == "SearchCompanyTermsServerError"
| summarize Failures = count(1) by bin(env_time, 5m)
| render timechart
```

**Enrollment Troubleshooting Workflow**:
```
Enrollment Failure?
  
#14 (Account overview)  #37/#38 (Failure investigation)
  
#39 (Deep dive)  #40 (iOS specific)  #42 (Restrictions)
```

---

## MAM (Mobile App Management)

### Query \#25  User Check-in MAM Per User ID

**Required Parameters**: `UserID`, `_endTime`, `_startTime`

```kql
AmsActivityForUser(['UserID'], start=['_startTime'], end=['_endTime'])
| project env_time, ['type'], statusCode, AppId, Os, DeviceId, AppVersion, SdkVersion, ManagementLevel, AppFriendlyName, PolicyState, DeviceModel
```

---

## Policy Deployment & Assignment

### Query \#30  Per Device Policy Deployment Status (DCv1)

**Description**: DCv1 Configuration Policies only. Does not include Settings Catalog (DCv2), scripts, or apps.

**Required Parameters**: `DeviceID`, `_endTime`, `_startTime`

```kql
DeviceManagementProvider 
| where env_time between (['_startTime'] .. ['_endTime'])
| where ActivityId == ['DeviceID']
| where EventId == "5786"
| where applicablilityState == "Applicable"
| project env_time, PolicyName=name, PolicyType=typeAndCategory, 
    Applicability=applicablilityState, Compliance=reportComplianceState, 
    CIID=id, policyId, userId, EventMessage
| order by env_time asc
```

### Query \#31  Win32 App Deployment per Device

**Required Parameters**: `DeviceID`, `_endTime`, `_startTime`

```kql
IntuneEvent
| where env_time between (['_startTime'] .. ['_endTime'])
| where ApplicationName == "SideCar"
| where ActivityId == ['DeviceID']
| where ColMetadata == "AppPolicyId;ErrorCode;EnforcementType;EnforcementState;IsDuringEsp;ApplicationName;"
| project env_time, AppPolicyId=Col1, ErrorCode=Col2, EnforcementType=Col3, 
    EnforcementState=Col4, IsDuringEsp=Col5, AppName=Col6, 
    RelatedActivityId, SessionId
| order by env_time desc
```

<details>
<summary>EnforcementState Values</summary>

| State | Value | Meaning |
|-------|-------|---------|
| Unknown | 0 | Initial state |
| Installed | 1 | App successfully installed |
| NotInstalled | 2 | App not present |
| Installing | 3 | Installation in progress |
| PendingInstall | 4 | Queued for installation |
| Failed | 5 | Installation failed |
| Available | 6 | Available in Company Portal |
| Uninstalling | 7 | Removal in progress |
| PendingUninstall | 8 | Queued for removal |
| NotApplicable | 9 | Doesn't apply to device |
| Error | 10 | Generic error |

</details>

### Query \#32  Microsoft Tunnel Server Configuration

**Required Parameters**: `AccountID`, `_endTime`, `_startTime`

```kql
IntuneEvent
| where env_time between (['_startTime'] .. ['_endTime'])
| where AccountId == ['AccountID'] 
| where ServiceName == "MobileAccessBGService"
| project env_time, AccountId, ComponentName, EventUniqueName, timestamp=Col2, Info=Col3, ConfigId=Col4, SiteId=Col5, ServerId=Col6, Message
| sort by env_time
| limit 1000
```

### Query \#33  PowerShell Script Deployment

**Required Parameters**: `DeviceID`, `_endTime`, `_startTime`

```kql
IntuneEvent
| where env_time between (['_startTime'] .. ['_endTime'])
| where SourceNamespace == "IntunePE" 
| where ActivityId =~ ['DeviceID']
| where ComponentName == "EmsPolicyDecryption"
| where ColMetadata in ("Message;DecryptionResult;AgentVersion;PolicyId;PolicyResultType;PolicyExecutionResult;") 
| extend
    Message2 = Col1,
    DecryptionResult = Col2,
    AgentVersion = Col3,
    PolicyId = Col4,
    PolicyResultType = Col5,
    PolicyExecutionResult = Col6
| project env_time, Message, ColMetadata, Message2, DecryptionResult, AgentVersion, PolicyId, PolicyResultType, PolicyExecutionResult
| take 100
```

### Query \#51  Comprehensive Policy & Deployment Status (All Types)

**Description**: Combines DCv1, Settings Catalog (DCv2), PowerShell scripts, and Win32 app deployments in a unified view.

**Required Parameters**: `DeviceID`, `_startTime`, `_endTime`

```kql
let deviceId = ['DeviceID'];
let startTime = ['_startTime'];
let endTime = ['_endTime'];

// Part 1: DCv1 Configuration Policies
let DCv1Policies = DeviceManagementProvider
| where env_time between (startTime .. endTime)
| where ActivityId == deviceId
| where EventId == "5786"
| project 
    env_time,
    DeploymentType = "DCv1 Configuration Policy",
    Name = name,
    Type = typeAndCategory,
    PolicyId = policyId,
    Applicability = applicablilityState,
    Compliance = reportComplianceState,
    Status = case(
        reportComplianceState == "Compliant", "Success",
        reportComplianceState == "NonCompliant", "Failed",
        reportComplianceState == "Error", "Error",
        "Unknown"
    ),
    Details = EventMessage,
    CIID = id,
    UserId = userId;

// Part 2: PowerShell Script Deployments
let ScriptDeployments = IntuneEvent
| where env_time between (startTime .. endTime)
| where SourceNamespace == "IntunePE"
| where ActivityId =~ deviceId
| where ComponentName == "EmsPolicyDecryption"
| where ColMetadata == "Message;DecryptionResult;AgentVersion;PolicyId;PolicyResultType;PolicyExecutionResult;"
| project 
    env_time,
    DeploymentType = "PowerShell Script",
    Name = extract(@"DisplayName=([^,]+)", 1, Col1),
    Type = "Script",
    PolicyId = Col4,
    Applicability = "Applicable",
    Compliance = case(Col6 == "0", "Compliant", Col6 == "1", "NonCompliant", "Error"),
    Status = case(Col6 == "0", "Success", Col6 == "1", "Failed", "Error"),
    Details = strcat("DecryptionResult: ", Col2, ", AgentVersion: ", Col3, 
        ", PolicyResultType: ", Col5, ", ExecutionResult: ", Col6),
    CIID = Col4,
    UserId = "";

// Part 3: Win32 App Deployments
let AppDeployments = IntuneEvent
| where env_time between (startTime .. endTime)
| where ApplicationName == "SideCar"
| where ActivityId == deviceId
| where ColMetadata == "AppPolicyId;ErrorCode;EnforcementType;EnforcementState;IsDuringEsp;ApplicationName;"
| project 
    env_time,
    DeploymentType = "Win32 Application",
    Name = Col6,
    Type = "Application",
    PolicyId = Col1,
    Applicability = "Applicable",
    Compliance = case(Col4 == "1", "Compliant", Col4 == "2", "NonCompliant", Col4 == "3", "Error", "Unknown"),
    Status = case(Col4 == "1", "Success", Col4 == "2", "In Progress", Col4 == "3", "Error", Col4 == "4", "Not Installed", "Unknown"),
    Details = strcat("ErrorCode: ", Col2, ", EnforcementType: ", Col3, 
        ", EnforcementState: ", Col4, ", IsDuringEsp: ", Col5),
    CIID = Col1,
    UserId = "";

// Union all deployment types
union DCv1Policies, ScriptDeployments, AppDeployments
| order by env_time desc
| project env_time, DeploymentType, Name, Type, PolicyId, Applicability, 
    Compliance, Status, Details, CIID, UserId
```

### Query \#52  Effective Group Membership by Target (User/Device)

**Description**: Check effective group membership updates for a specific user or device. Essential for troubleshooting policy and app assignment issues.

**Required Parameters**: `TargetId` (UserID or DeviceID)

```kql
IntuneEvent
| where env_time > ago(30d)
| where EventUniqueName == "EffectiveGroupMembershipUpdated"
| where Col2 in (['TargetId'])
| summarize min(env_time) by Col1, Col2, Col5
| project min_env_time, EGId = Col1, TargetId = Col2, GroupsOfEG = Col5
```

### Query \#53  Device and User Effective Group Resolution

**Description**: Shows device EG, user EG, and primary user EG for a device. Critical for understanding assignment targeting.

**Required Parameters**: `DeviceID`

```kql
let _deviceId = ['DeviceID'];
IntuneEvent
| where env_time > ago(12d)
| where ActivityId == _deviceId
| where ServiceName == "SLDMService"
| where EventUniqueName == "EGResolution"
| project env_time, env_cloud_name, EventUniqueName, AccountId, DeviceId, UserId, 
    DeviceEG=Col1, UserEG=Col2, PrimaryUserEG=Col3, ScenarioInstanceId
```

### Query \#54  Overall Policy Deployment Status by CIID

**Description**: Shows Success/Pending/Error counts for a specific policy across all devices. CIID format: `AC_{AccountID}/LogicalName_{PolicyID_with_underscores}/{Version}`.

**Required Parameters**: `CIID`, `_startTime` (or `ago()`)

```kql
DeviceManagementProvider  
| where env_time >= ago(2d)
| where EventId == 5786
| project PreciseTimeStamp, ActivityId, PolicyName=name, PolicyType=typeAndCategory, 
    Applicability=applicablilityState, Compliance=reportComplianceState, 
    deviceId=ActivityId, PolicyID=['id'] 
| where PolicyID in (['CIID'])
| where Applicability == "Applicable"
| summarize 
    Success=(countif(Compliance == "Compliant") > 0), 
    Pending=(countif(Compliance == "Compliant") == 0), 
    Error=(countif(Compliance == "Error") > 0) 
    by ActivityId, PolicyName, PolicyType
| summarize 
    SuccessCount=sum(toint(Success)), 
    PendingCount=sum(toint(Pending)), 
    ErrorCount=sum(toint(Error)) 
    by PolicyName, PolicyType
| order by PolicyName desc
```

**Policy Deployment Workflow**:
```
Policy Not Applying?
  
#53  Check EG Resolution (DeviceEG, UserEG, PrimaryUserEG)
  
Is device/user in expected group?
   NO  #52  Check group membership  Fix group assignment
   YES  #51  Check deployment status  Filter by Status = "Failed"
              
         DCv1  #30 | Script  #33 | App  #31 | ESP  #34
```

---

## Apple-Specific (DEP/APNS/VPP)

### Query \#35  DEP Sync Event and Profile Assignment per Account ID

**Required Parameters**: `AccountID`, `Serialnumber`, `_endTime`, `_startTime`

```kql
IntuneEvent
| where env_time between (['_startTime'] .. ['_endTime'])
| where AccountId == ['AccountID']
| where ComponentName == "AppleSyncService" or ComponentName == "DepFeatureTelemetry"
| where Col1 contains ['Serialnumber'] or Col2 contains ['Serialnumber']
| project env_time, ComponentName, ActivityId, ApplicationName, EventUniqueName, 
    ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6
| order by env_time desc
```

### Query \#49  Check APNS Certificate Status for Account

**Required Parameters**: `AccountID`, `_startTime`, `_endTime`

```kql
IntuneEvent
| where env_time between (['_startTime'] .. ['_endTime'])
| where ServiceName == "AppleNotificationRelayService"
| where AccountId == ['AccountID']
| where EventUniqueName == "RetrievedApnsSettingsForAccount"
| project env_time, ActivityId, ServiceName, Col1, AccountId, Message, 
    EventUniqueName, env_cloud_name, BuildVersion
| order by env_time desc
```

### Query \#50  Check APNS Push Notification Delivery Status

**Required Parameters**: `AccountID`, `ScaleUnit`, `_startTime`, `_endTime`

```kql
IntuneEvent
| where env_time between (['_startTime'] .. ['_endTime'])
| where env_cloud_name == ['ScaleUnit']
| where ServiceName == "StatelessPushNotificationService"
| where EventUniqueName == "ProcessedNotificationToDevice"
| where AccountId == ['AccountID']
| project env_time, AccountId, DeviceId, ActivityId, Col5, cV, 
    ServiceName, EventUniqueName, Message, env_cloud_name
| summarize count() by Col5
| order by count_ desc
```

### Query \#66  VPP Application Sync Events

**Required Parameters**: `AccountID`, `_startTime`, `_endTime`

```kql
VppFeatureTelemetry
| where accountId == ['AccountID']
| where env_time between (['_startTime'] .. ['_endTime'])
| where TaskName == "VppApplicationSyncEvent"
| project env_time, env_cloud_name, TaskName, ActivityId, accountId, tokenId, applications, userId, ex, clientContextIntune, clientContextExternalVppService, I_Srv, tokenState
| order by env_time desc
```

<details>
<summary>VPP Token State Reference</summary>

| State | Meaning | Action |
|-------|---------|--------|
| `Valid` | Token is healthy | No action |
| `ExpiringSoon` | Expires within 30 days | Renew token |
| `Expired` | Token has expired | Renew immediately |
| `Invalid` | Validation failed | Re-upload token |
| `Revoked` | Revoked in ABM | Create new token |

</details>

---

## Compliance & Custom Compliance

### Query \#56  Custom Compliance Script Evaluation Details

**Description**: See which script is linked to which compliance policy, what value the script discovered, and how it was evaluated against JSON rules.

**Required Parameters**: `DeviceID`, `_startTime`, `_endTime`

```kql
IntuneEvent
| where env_time between (['_startTime'] .. ['_endTime'])
| where DeviceId == ['DeviceID']
| where ComponentName == "CustomComplianceEvaluator"
| where EventUniqueName == "EvaluateAndGenerateReports"
| extend 
    ScriptId = Col1,
    PolicyId = Col2,
    EvaluationDetails = Col3,
    AdditionalInfo = Col4
| project 
    env_time,
    ScriptId,
    PolicyId,
    EvaluationDetails,
    AdditionalInfo,
    Message
| order by env_time desc
```

### Query \#57  Custom Compliance Script Type Verification

**Description**: Determine whether a script is configured as a **Remediation Script** or **Custom Compliance Detection Script**. Scripts configured as Remediation will NOT be used for custom compliance evaluation.

**Required Parameters**: `DeviceID`, `ScriptID`, `_startTime`, `_endTime`

```kql
let deviceId = ['DeviceID'];
let scriptId = ['ScriptID'];
let timeRange = (['_startTime'] .. ['_endTime']);

// Pattern 1: Remediation Script (SideCar/Health Scripts)
let remediation_script = IntuneEvent
| where env_time between (timeRange)
| where DeviceId == deviceId
| where ComponentName == "StatelessSideCarGatewayProvider"
| where EventUniqueName == "GetHealthScripts"
| where Message contains scriptId
| project 
    env_time, 
    ScriptType = "Remediation Script (NOT Custom Compliance)",
    ComponentName,
    EventUniqueName,
    Evidence = Message;

// Pattern 2: Custom Compliance Detection Script
let compliance_script = IntuneEvent
| where env_time between (timeRange)
| where DeviceId == deviceId
| where ComponentName == "CustomComplianceEvaluator"
| where Col1 == scriptId
| project 
    env_time,
    ScriptType = "Custom Compliance Detection Script",
    ComponentName,
    EventUniqueName,
    Evidence = strcat("ScriptId: ", Col1, " -> PolicyId: ", Col2);

union remediation_script, compliance_script
| order by env_time desc
```

> :warning: **WARNING**: A common misconfiguration is setting up a script as a **Remediation Script** instead of a **Custom Compliance Detection Script**:
>
> | Type | ComponentName | Used For |
> |------|---------------|----------|
> | Remediation Script | `StatelessSideCarGatewayProvider` | Proactive Remediation (runs via SideCar Agent) |
> | Custom Compliance Detection Script | `CustomComplianceEvaluator` | Custom Compliance policy evaluation |

### Query \#58  Compliance Status Changes with Rule Details

**Description**: Shows which compliance rules are failing, expected vs actual values, and remediation messages.

**Required Parameters**: `DeviceID`, `_startTime`, `_endTime`

```kql
DeviceComplianceStatusChangesByDeviceId(['DeviceID'], ['_startTime'], ['_endTime'], 100)
| extend 
    RuleInfo = parse_json(replace_regex(complianceDetails, @"[\r\n]", "")),
    ParsedDetails = extract_all(@"RuleId:([^;]+).*?ExpectedValue:([^;]*);ActualValue:([^;]*);.*?Title:\s*([^;]*);.*?Description:\s*([^;]*);", complianceDetails)
| mv-expand ParsedDetails
| extend 
    RuleId = tostring(ParsedDetails[0]),
    ExpectedValue = tostring(ParsedDetails[1]),
    ActualValue = tostring(ParsedDetails[2]),
    Title = tostring(ParsedDetails[3]),
    Description = tostring(ParsedDetails[4])
| project 
    env_time,
    complianceState,
    RuleId,
    ExpectedValue,
    ActualValue,
    Title,
    Description,
    DeviceId,
    UserId
| order by env_time desc
```

**Custom Compliance Troubleshooting Flow**:
```
Device shows "Noncompliant" for custom compliance?
  
#58  Check ExpectedValue vs ActualValue
  
Is ActualValue what you expect from script output?
   YES  Check JSON rules SettingName/Operand match
   NO  #57  Verify script type
           
       Is script in CustomComplianceEvaluator?
          YES  #56  Check evaluation details
          NO  Script is misconfigured as Remediation Script!
```

---

## Other / Specialized

### Query \#26  User Directory Role

**Required Parameters**: `UserID`, `_endTime`, `_startTime`

```kql
IntuneEvent
| where SourceNamespace == "IntunePE"
| where EventUniqueName == "EffectiveUserPermissionClaimNotNeeded" 
| where UserId == ['UserID']
| where env_time between (['_startTime'] .. ['_endTime'])
| extend DirectoryRole = iif(Col2 in ("6cbc8403-656b-4f05-78d8-000000000001"), "Tenant Admin", iif(Col2 in ("e62fadbc-5ac9-43c2-a075-8ad6a59ecf24"), "Intune Service Admin", "Mapping not Specified"))
| union 
(
IntuneEvent
| where SourceNamespace == "IntunePE"
| where EventUniqueName == "ITProWithEffectiveUserPermissions" 
| where UserId == ['UserID'] 
| where env_time between (['_startTime'] .. ['_endTime'])
| extend DirectoryRole = "Standard User With RBAC Permissions (Intune IT Pro)"
)
| union 
(
IntuneEvent
| where SourceNamespace == "IntunePE"
| where EventUniqueName == "ITProNoEffectiveUserPermissions" 
| where UserId == ['UserID'] 
| where env_time between (['_startTime'] .. ['_endTime'])
| extend DirectoryRole = iif(Col1 in ("6cbc8403-656b-4f05-78d8-000000000009"), "Standard user with no RBAC Permissions", "RoleId with no RBAC permissions")
)
| union 
(
IntuneEvent
| where SourceNamespace == "IntunePE"
| where EventUniqueName == "NoAllowedRolesToGetTokenWithoutAnyUserLicenseAssigned" 
| where UserId == ['UserID'] 
| where env_time between (['_startTime'] .. ['_endTime'])
| extend DirectoryRole = Col4
)
| order by env_time desc nulls last 
| project UserId, DirectoryRole, env_time 
| limit 1
```

### Query \#27  Find if a Tenant is Onboarded to CoPilot Correctly

**Required Parameters**: `tenantId`

```kql
KnownTenants
| where TenantId contains ['tenantId']
```

### Query \#28  Find Evaluations Performed Based on Tenant ID

**Required Parameters**: `_endTime`, `_startTime`, `tenantId`

```kql
EvaluationsExpanded
| where EvaluationCreatedOn between (['_startTime'] .. ['_endTime'])
| join kind=leftouter (Global("Prompts")
| where Tenant == ['tenantId']
| distinct SessionId, PromptId, Experience=Source) on PromptId, SessionId
| project-away SessionId1, PromptId1
| where Experience == "immersive"
| project EvaluationCreatedOn, SessionId, PromptContent, EvaluationContent, PromptSkillName, PromptInputs, EvaluationResultType, SessionPromptCount, SkillsetNames
| take 200
```

### Query \#29  Firewall Rule Troubleshooter

**Description**: Identifies common Windows Defender Firewall rule configuration errors in Intune policies. Only the first erroring rule is reported (Windows limitation).

**Required Parameters**: `DeviceID`, `_endTime`, `_startTime`, `policyID`

> :warning: **WARNING**: Only the **first erroring rule** is reported back to Kusto. Fixing one error may reveal another. Set expectations with customer about iterative troubleshooting.

```kql
let deviceId = ['DeviceID'];
let policyId = ['policyID'];
let startTime = ['_startTime'];
let endTime = ['_endTime'];
let cleaned_guid = replace_string(policyId, "-", "");
let cspLookup = strcat("Atomic child command Set failed for ./Vendor/MSFT/Firewall/MdmStore/FirewallRules/", cleaned_guid);

DeviceManagementProvider
| where env_time between (startTime .. endTime)
| where ActivityId == deviceId
| where message startswith cspLookup
| extend Hint = case(
    message contains "LocalPortRanges", 
        "LOCAL PORT ERROR: Protocol MUST be TCP(6) or UDP(17) when Local Port Range is specified",
    message contains "RemotePortRanges", 
        "REMOTE PORT ERROR: Protocol MUST be TCP(6) or UDP(17) when Remote Port Range is specified",
    message contains "InterfaceTypes", 
        "INTERFACE ERROR: If 'All' interface type is selected, other types MUST NOT be selected",
    message contains "Name" and message contains "EdgeTraversal", 
        "EDGE TRAVERSAL ERROR: Rule direction MUST BE INBOUND when Edge Traversal is enabled",
    message contains "PolicyAppId" and message contains "ServiceName", 
        "CONFLICT ERROR: A rule CANNOT contain both a policy app ID AND a service name",
    message contains "IcmpTypesAndCodes", 
        "ICMP ERROR: Protocol MUST be 1 (ICMP) or 58 (IPv6-ICMP) when ICMP types/codes are specified",
    message contains "Enabled", 
        "GENERIC ERROR: At least one rule has an error. Review all rules or test individually.",
    "UNKNOWN ERROR: Review Telemetry_Response. Use SyncML trace to find rule name."
)
| project env_time, Hint, Telemetry_Response = message
| order by env_time desc
```

<details>
<summary>Common Firewall Rule Errors</summary>

| Error Type | Root Cause | Resolution |
|------------|------------|------------|
| LocalPortRanges | Port range without protocol | Set Protocol to TCP (6) or UDP (17) |
| RemotePortRanges | Port range without protocol | Set Protocol to TCP (6) or UDP (17) |
| InterfaceTypes | "All" mixed with specific types | Use "All" alone OR specific types only |
| EdgeTraversal | Edge Traversal on outbound rule | Change direction to Inbound |
| PolicyAppId + ServiceName | Conflicting app targeting | Use one or the other, not both |
| IcmpTypesAndCodes | ICMP codes without ICMP protocol | Set Protocol to ICMP (1) or IPv6-ICMP (58) |

</details>

---

## Best Practices

### Query Optimization

1. **Always use time filters**  Limit time range to reduce data processed
2. **Filter by AccountID first**  Most efficient way to narrow down results
3. **Use specific IDs when possible**  DeviceID, PolicyID, UserID filters improve performance
4. **Start broad, then narrow**  Use overview queries first, then drill into specifics

### Troubleshooting Workflow

```
Step 1: Identify Scope
   Use overview queries (#14, #45, #51, #54) for big picture

Step 2: Narrow Down
   Use device/policy specific queries with DeviceID or PolicyID

Step 3: Verify Timeline
   Check timestamps to understand sequence of events (#47, #48)

Step 4: Cross-Reference
   Compare data from multiple queries for complete picture
   Use EG queries (#52, #53) to verify targeting
```

---

## Scoping Questions

When working a case that requires Kusto queries, gather the following information first:

1. What is the **AccountID** (Tenant Account ID)?
2. What is the **DeviceID** of the affected device?
3. What is the **platform** (Windows, iOS, macOS, Android)?
4. What is the **approximate time** when the issue occurred?
5. Is this an **enrollment**, **policy deployment**, **compliance**, **certificate**, or **app** issue?
6. Does the customer have access to **Intune Admin Center** for correlation IDs?
7. Is this a **single device** or **tenant-wide** issue?

---

## Additional Documentation

- [Intune Kusto Clusters](https://supportability.visualstudio.com/Intune/_wiki/wikis/Intune/1345257/Kusto)
- [Kusto Dashboard](https://supportability.visualstudio.com/Intune/_wiki/wikis/Intune/2077930/Kusto-Dashboard)
- [SCEP/PKCS Kusto Queries](https://supportability.visualstudio.com/Intune/_wiki/wikis/Intune/7236a4e0/Kusto-Queries-You-Need-for-SCEP-and-PKCS-Troubleshooting)
- [KQL Quick Reference (Microsoft Learn)](https://learn.microsoft.com/azure/data-explorer/kql-quick-reference)
- [Kusto Query Language (Microsoft Learn)](https://learn.microsoft.com/azure/data-explorer/kusto/query/)
- [Intune Documentation (Microsoft Learn)](https://learn.microsoft.com/intune)

---

## How to Get Help with Cases

- If you need help with a Kusto query or are unsure which query to use, reach out to the **SME for the relevant topic area** via the [SME list](/Intune/Engineer-Reference/SMEs).
- Post questions in the relevant **Intune CSS Teams channels** for peer support.

---

## Change Log

| Date | Author | Changes |
|------|--------|---------|
| 2026-02-24 | Leon Zhu | Updated  Added all 66 KQL queries with actual code blocks organized by topic |
| 2026-02-24 | Leon Zhu | Initial creation  Intune Kusto cluster reference with tables, topics, workflows, and best practices |
