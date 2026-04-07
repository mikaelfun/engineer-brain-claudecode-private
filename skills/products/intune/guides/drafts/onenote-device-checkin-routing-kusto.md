# Device Check-in Routing & APNS Troubleshooting Kusto Queries

## Scenario
Troubleshoot macOS/iOS device check-in failures, routing issues, and APNS notification problems.

## Kusto Queries

### 1. DmpLogs - Session Tracking
```kusto
DmpLogs
| where env_cloud_name == "CNPASU01"
| where accountId == "<account-id>"
| where ActivityId == "<device-id>"
| where message startswith "New Session"
| project env_time, message, scenarioInstanceId
```

### 2. HttpSubsystem - Device Check-in Routing to SLDM
```kusto
HttpSubsystem
| where env_cloud_name == "CNPASU01"
| where env_time between (datetime(<start>) .. datetime(<end>))
| where accountId == "<account-id>"
| where ActivityId == "<device-id>"
| where sourceServiceName == "DeviceCheckinRoutingService"
| where I_Srv == "SLDMService"
| project env_time, url, statusCode, depthTag, TaskName
```

### 3. IntuneOperation - MDMCheckIn Scenario
```kusto
IntuneOperation
| where env_cloud_name == "CNPXSUCPCN01"
| where env_time between (datetime(<start>) .. datetime(<end>))
| where AccountId == "<account-id>"
| where DeviceId == "<device-id>"
| where ScenarioType == "DeviceSync/MacMDM"
| where operationName == "MDMCheckIn"
| project env_time, env_cloud_role, ServiceName, ApplicationName, operationType, resultType, resourceType, durationMs, targetEndpointAddress
| order by env_time asc
```

### 4. IntuneEvent - APNS DeviceNotificationResult
```kusto
IntuneEvent
| where env_time > ago(30d)
| where ServiceName == "AppleNotificationRelayService"
| where EventUniqueName == "DeviceNotificationResult"
| where DeviceId == "<device-id>"
| project env_time, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6
| take 1
```

## Key Indicators
- **InvalidDeviceCredentials (1211)**: Management profile certificate mismatch. Device needs re-enrollment or certificate renewal.
- **DeviceCheckinRoutingService to SLDMService**: Confirms routing path for device sync sessions.
- **ScenarioType == "DeviceSync/MacMDM"**: macOS-specific MDM check-in flow.

## Source
Case 2308100060001116
