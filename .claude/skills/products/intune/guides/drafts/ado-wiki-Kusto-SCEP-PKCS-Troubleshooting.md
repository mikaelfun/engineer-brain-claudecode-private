---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Device Config Certificates Email VPN Wifi/Kusto Queries You Need for SCEP and PKCS Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Config%20Certificates%20Email%20VPN%20Wifi%2FKusto%20Queries%20You%20Need%20for%20SCEP%20and%20PKCS%20Troubleshooting"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Kusto Queries for SCEP & PKCS Troubleshooting

## 1. Check Intune Certificate Connector Version

```kusto
let Account_ID = "<AccountID>";
let start_time = datetime(YYYY-MM-DD HH:MM:SS);
let End_time = datetime(YYYY-MM-DD HH:MM:SS);
let AMSU=toscalar(DeviceManagementProvider | where accountId == Account_ID | project env_cloud_name | take 1);
IntuneEvent
| where env_time between (start_time .. End_time)
| where SourceNamespace == "IntunePE"
| where env_cloud_name == AMSU
| where AccountId == Account_ID
| where ApplicationName == "RACerts"
| where ServiceName == "StatelessPkiConnectorService"
| where EventUniqueName == "UploadConnectorHealthLogs"
| where ColMetadata == "AgentId;MessageType;Parameters;InstanceId;PkiConnectorRole;"
| where Col2 == "AgentInformation"
| extend Connector_version = extract('ConnectorVersion":"(.+?)"}', 1, Col3)
| extend Enrolled_Date = extract('EnrolledDate":"(.+?)","EncryptionKeyConfigured', 1, Col3)
| project env_time, Connector_ID = Col1, Connector_version, Enrolled_Date
| order by env_time asc
```

## 2. Profile Deployment Status

### Option A: HighLevelCheckin
```kusto
HighLevelCheckin("<IntuneDeviceID>", ago(5d))
| where PolicyType == "ClientAuthCertificate"
| project env_time, PolicyName, PolicyApplicability, PolicyCompliance, PolicyType, PolicyId
```

### Option B: DeviceManagementProvider
```kusto
DeviceManagementProvider
| where env_time >= ago(15d)
| where typeAndCategory == "ConfigurationPolicy;ClientAuthCertificate" or typeAndCategory == "ConfigurationPolicy;TrustedRootCertificate"
| where deviceId == "<IntuneDeviceID>"
| where applicablilityState == "Applicable"
| project env_time, userId, PolicyName=name, PolicyType=typeAndCategory, Applicability=applicablilityState, Compliance=reportComplianceState, deviceId=ActivityId, PolicyID=['id'], message, TaskName, name
| order by env_time desc
```

## 3. Policy Assignment & Intent Validation (Cross-cluster)
Use Deployment_Snapshot + DeploymentStatus_Snapshot + CMPolicyAssignment_Snapshot with AccountID and PolicyID to verify assignment across EU and Non-EU clusters.

## 4. Android Fully Managed/Dedicated (No DMP data)
```kusto
IntuneEvent
| where DeviceId == "<IntuneDeviceID>"
| project env_time, ComponentName, ApplicationName, EventUniqueName, Message, ColMetadata, Col1, Col2, Col3
```

## 5. Transaction ID Deep Dive
```kusto
IntuneEvent
| where env_time > ago(2d)
| where SourceNamespace == "IntunePE"
| where ServiceName == "StatelessScepRequestValidationService"
| where Col1 == "<TransactionID>"
| project ActivityId, env_time, ComponentName, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, AccountId, UserId, DeviceId
```
- Col3: EKU details from SCEP config
- Col4: Certificate thumbprint

## 6. SCEP Events by Device ID (without Transaction ID)
```kusto
IntuneEvent
| where env_time > ago(9d)
| where ApplicationName == 'RACerts'
| where ServiceName == "StatelessCertDeliveryService"
| where DeviceId == "<IntuneDeviceID>"
| where * contains "SCEP"
| project env_time, ComponentName, DeviceId, Message, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, ActivityId, ScenarioInstanceId
```

## 7. Verify & Notify Requests (Account-wide)
```kusto
IntuneEvent
| where env_time between (datetime(start)..datetime(end))
| where SourceNamespace == "IntunePE"
| where AccountId == "<AccountID>"
| where ApplicationName == "RACerts"
| where ColMetadata startswith_cs "transactionId;callerInfo"
| project env_time, ComponentName, EventUniqueName, Col1, Col2, Col3, Col4, DeviceId, UserId, RelatedActivityId, cV
```

## 8. Mac Devices Approaching SCEP Cert Expiry
```kusto
DeviceManagementProvider
| where env_time > ago(1d)
| where accountId == "<AccountID>"
| where message contains "Finishing SCEP expiration threshold calculation with threshold = '24'" or message contains "threshold = '23'" or message contains "threshold = '22'" or message contains "threshold = '21'"
| distinct deviceId
| join kind=inner Device_Snapshot on $left.deviceId == $right.DeviceId
| where Model contains "Mac"
| distinct DeviceId, Manufacturer, Model
```

## 9. Android Fully Managed SCEP Deployment
```kusto
IntuneEvent
| where env_time > ago(9d)
| where ApplicationName == 'AndroidSync'
| where ComponentName in ("StatelessAndroidSyncService", "StatelessGooglePolicyService")
| where DeviceId == "<IntuneDeviceID>"
| where Col1 startswith "SCEP" or Col1 startswith "GetScepEncryptedCertRequestToken" or Col1 startswith "GetEncryptedCertRequestToken" or Col1 contains "PolicyDeploymentMessage" or Col1 endswith "PublicKeyCert."
| project env_time, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, AccountId, DeviceId, UserId, Pid, BuildVersion, env_cloud_name, cV, env_cv, ServiceName, ActivityId
```

## 10. SN/SAN Resolution Validation

### Step 1: Check dynamic values before resolution
```kusto
IntuneEvent
| where env_time > datetime(start)
| where AccountId == "<AccountID>"
| where DeviceId contains_cs "<DeviceID>"
| where ApplicationName == "RACerts"
| where EventUniqueName in ("GenerateMachineSubjectNameAsync-PrintSAN","ResolveScepRequestVariables","ScepGetConfigurationProfileSync","GetStringHash")
| extend SubjectName_DynamicValue = iff(Col1 startswith_cs "Resolving SCEP", extract("(SubjectNameFormat: .+), SubjectAlternativeNameFormatType",1,Col1),"")
| extend SubjectAlternativeName_ActualValue = iff(Col1 startswith_cs "Formatted SAN:", extract("Formatted SAN: (.+)",1,Col1),"")
| project env_time, Col1, SubjectName_DynamicValue, SubjectAlternativeName_ActualValue, DeviceId, UserId, EventUniqueName, cV
```

### Step 2: Check resolution errors by cV
```kusto
IntuneEvent
| where env_time between (datetime(start)..datetime(end))
| where cV == "<cV_value>"
| project env_time, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, DeviceId, UserId, EventUniqueName, ComponentName
```

## Key Notes
- Always verify Trusted Root profile is also targeted when SCEP/PKCS fails
- Multiple connectors: check ConnectorID to identify which server handles the request
- VPN/WiFi profile dependencies may affect certificate delivery if targeting differs
