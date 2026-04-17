# Intune 设备合规策略 — 排查工作流

**来源草稿**: ado-wiki-Compliance-Calculation.md, ado-wiki-Device-Compliance.md, ado-wiki-MDE-Compliance.md, onenote-partner-compliance-kusto.md
**Kusto 引用**: compliance.md, policy-status.md
**场景数**: 23
**生成日期**: 2026-04-07

---

## Portal 路径

- `Intune > Endpoint Security > Microsoft Defender for Endpoint >`

## Scenario 1: 1. Check SSP / Company Portal
> 来源: ado-wiki-Compliance-Calculation.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Tap "Check Compliance" → initiates check-in → 2-minute timeout → result. If spinning endlessly → device can't contact DMS.

## Scenario 2: 2. Check Assist365
> 来源: ado-wiki-Compliance-Calculation.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

EU: https://eu.assist.microsoft.com/ | Global: https://assist.microsoft.com/
Navigate to Action → Applications → Troubleshooting → Device → enter identifiers

## Scenario 3: 3. Kusto: Compliance Status Changes
> 来源: ado-wiki-Compliance-Calculation.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
_DeviceComplianceStatusChangesByDeviceId("deviceId", datetime(start), datetime(end), 1000)
```

## Scenario 4: 4. Verify device is checking in
> 来源: ado-wiki-Compliance-Calculation.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
let IntuneDeviceId = "";
DmpLogs
| where env_time > ago(7d)
| where deviceId == IntuneDeviceId
| where isnotempty(message)
| project ActivityId, env_time, message
| summarize DMS_Messages=count() by DeviceId = IntuneDeviceId
| join kind = rightouter (
    union DeviceService_Device, DeviceService_Device_Ctip, DeviceService_Device_OneDF
    | where DeviceId == IntuneDeviceId
    | summarize arg_max(Lens_IngestionTime, CreatedDate, LastContactNotification, LastContact, IsManaged, GraphDeviceIsManaged, MDMStatus, GraphDeviceIsCompliant, ReferenceId, CertExpirationDate, EnrolledByUser) by DeviceId, ScaleUnitName
) on DeviceId
```

## Scenario 5: 5. Check CA targeting
> 来源: ado-wiki-Compliance-Calculation.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
let LookupUserId = "";
CAPolicyTargeting
| where UserId == LookupUserId
```

## Scenario 6: 6. View Policy Compliances
> 来源: ado-wiki-Compliance-Calculation.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

From StatelessDeviceService: `PolicyCompliances?$top=1000&$filter=GuidKey2 eq guid'<DeviceId>'`

- Count should match unique compliance policy assignments
- Less = issue in flow from check-in to writing policy compliances
- More = stale entries (cleaned by consistency checker)
- Check ComplianceState: 2 (noncompliant) or 3 (error) → read ComplianceDetails

## Scenario 7: Email Profile causing Unknown compliance (iOS)
> 来源: ado-wiki-Compliance-Calculation.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Compliance policy referencing Email Profile CI, but policies targeted to different groups → DMS never gets Email Profile → device stuck Unknown.

Fix: Target both policies to same group.

```kusto
let IntuneAccountId = "accountId";
DmpLogs
| where env_time > ago(5d)
| where deviceId in ("deviceId1", "deviceId2")
| where message startswith "Failed to evaluate rule CIExpression - Referred CI not found:"
| project Error = "Found targeting issue, might be e-mail profile", deviceId, message, env_time
```

## Scenario 8: Account-level changes cause 30-min compliance flip-flop
> 来源: ado-wiki-Compliance-Calculation.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

DQCache per service instance → old vs new values. Impacted: Compliance Validity Period, Require Assigned Compliance Policy. Wait ~30 min.

## Compliance SLA Alert Investigation

```kusto
let ScaleUnitFromAlert = "AMSUB0101";
IntuneEvent
| where env_time between (MonitorDateStartTime .. MonitorDateEndTime)
| where env_cloud_name == ScaleUnitFromAlert
| where ComponentName == "StatelessComplianceDetailProvider"
| where EventUniqueName == "ComplianceDetail-GetComplianceDetailsForDeviceAction-FinalResult"
| where Col2 == "Failed"
| extend exception = Col3
| extend exceptionType = extract("(.*?):", 1, exception)
```

Common exception types: DeviceNotFound, MultiUserThrownOut, SecurityTokenValidationException, FabricTransientException, RequestRateTooLargeException

## Jarvis Actions

1. StatelessDeviceService: `Devices(GuidKey1=guid'<AccountId>', GuidKey2=guid'<DeviceId>')`
2. If no IDs: StatelessUserService `Users?$top=10&$filter=UPN eq '<UPN>'` → get UserId → `Users(guid'<UserId>')/Devices`
3. Check LastContact field

## Windows CSP Dependencies (as of 1903)

DeviceStatus, DevDetail, HealthAttestation, DevInfo, Firewall, Policy, RemoteWipe, WindowsLicensing

## Service Dependencies

QMS, DMS, Device Service, Policy Compliance Provider, Office Azure Library, AAD

## Scenario 9: Why targeted to Users?
> 来源: ado-wiki-Device-Compliance.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

During enrollment, device-targeted policies can't evaluate because UDA doesn't exist yet. With Secure by Default enabled, device targeting is now supported for devices with a primary user.

## Scenario 10: Secure by Default
> 来源: ado-wiki-Device-Compliance.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Enrolled devices targeted by CA requiring compliant device AND not targeted by any compliance policy → marked non-compliant and blocked. O365 MDM enrolled devices cannot consume Intune compliance policies → fail Secure by Default.

## Scenario 11: Multi-User Compliance
> 来源: ado-wiki-Device-Compliance.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Windows: uses last logged-on user's evaluation to report status
- Other platforms: only the enrolling user's AAD device record is updated
- Other users accessing O365 get null device ID from workplace join

## Scoping Questions

1. UPN of the user?
2. Platform (iOS, Windows, Android)?
3. Enrollment method (Auto-enroll, Autopilot, Bulk, BYOD, Co-management, DEM)?
4. User affinity or without?
5. Android Enterprise: Work Profile or other?
6. MDM authority set to Intune? (O365 MDM won't evaluate Intune compliance)
7. Is user a DEM user?
8. Using MTD (Lookout, etc.)?
9. Device Overview → Compliant?
10. Device Compliance tab → policies showing compliant?
11. Hardware tab → AAD record compliant?

## Kusto Queries

## Scenario 12: Full device check-in logs
> 来源: ado-wiki-Device-Compliance.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
let IntuneDeviceId = "<intune device ID>";
DeviceManagementProvider
| where env_time > ago(1d)
| where ActivityId == IntuneDeviceId
| where isnotempty(message)
| project env_time, message
```

## Scenario 13: Final compliance results per CI
> 来源: ado-wiki-Device-Compliance.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
let IntuneDeviceId = "<intune device ID>";
DeviceManagementProvider
| where env_time > ago(1d)
| where ActivityId == IntuneDeviceId
| where isnotempty(message)
| project env_time, message
| where message startswith "Saving report for CI"
| extend CI = extract("Saving report for CI (.*)/(\\d+) with state (\\w+) (\\w+)", 1, message)
| extend CIVersion = extract("Saving report for CI (.*)/(\\d+) with state (\\w+) (\\w+)", 2, message)
| extend Applicability = extract("Saving report for CI (.*)/(\\d+) with state (\\w+) (\\w+)", 3, message)
| extend ComplianceState = extract("Saving report for CI (.*)/(\\d+) with state (\\w+) (\\w+)", 4, message)
```

## Scenario 14: All compliance logs for device
> 来源: ado-wiki-Device-Compliance.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
let TheIntuneDeviceID = "<intune device ID>";
IntuneEvent
| where env_time > ago(7d)
| where ComponentName == "StatelessComplianceDetailProvider"
| where Col1 contains TheIntuneDeviceID
| project env_time, ComponentName, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, Message
```

## Scenario 15: Compliance evaluation results
> 来源: ado-wiki-Device-Compliance.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
let deviceGuid = "<intune device ID>";
let startTime = ago(7d);
let endTime = now();
IntuneEvent
| where env_time between (startTime .. endTime)
| where ServiceName == "StatelessComplianceCalculationService"
| where EventUniqueName == "ComplianceDetail-GetComplianceDetailsForDeviceAction-FinalResult"
    or EventUniqueName == "ComplianceDetail-ComplianceUpdateDevicePatcher-DeviceCompliantChangedDetails"
| where Col1 contains deviceGuid
| extend complianceState = iff(EventUniqueName == "ComplianceDetail-ComplianceUpdateDevicePatcher-DeviceCompliantChangedDetails", Col3,
    extract("ComplianceState:(.*?);", 1, iff(ColMetadata == "InstanceId;taskStatus;exceptionThrown;ElapsedTicks;complianceResult;", Col5, Col2)))
| extend complianceDetails = extract("RuleDetails:(.*)", 1, iff(ColMetadata == "InstanceId;taskStatus;exceptionThrown;ElapsedTicks;complianceResult;", Col5, Col2))
| extend accountId = extract("AccountId=(.*?);DeviceId=(.*?);User=(.*?);DeviceIdSource=(.*?);", 1, Col1)
| extend deviceId = extract("AccountId=(.*?);DeviceId=(.*?);User=(.*?);DeviceIdSource=(.*?);", 2, Col1)
| extend userId = extract("AccountId=(.*?);DeviceId=(.*?);User=(.*?);DeviceIdSource=(.*?);", 3, Col1)
| project ASU=env_cloud_name, env_time, complianceState, complianceDetails, deviceId, userId, accountId
```

## Support Boundaries

- 3P MDM vendor compliance reporting issues → case with 3P vendor team
- See [Partner Compliance Wiki](https://supportability.visualstudio.com/Intune/_wiki/wikis/Intune/1349493/Partner-Compliance) for details

## Partner Compliance

Third-party device compliance partners can add compliance state data to AAD. Setup requires:
1. Configure Intune to work with compliance partner
2. Configure partner to send data to Intune
3. Enroll iOS/Android devices to the partner

Prerequisites: Intune subscription + compliance partner subscription.

## Scenario 16: Prerequisites
> 来源: ado-wiki-MDE-Compliance.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- MDE Supportability Entitlement: CoreIdentity (mtpkustosupp-mwdt)
- MDE Scrubbed Clusters: CoreIdentity (mtpscrubbedk-x5ze)
- Intune Events: CoreIdentity (intunekustop-iav4)
- Cluster: https://wcdprod.kusto.windows.net/
- Cluster: https://intune.kusto.windows.net/Intune

## Scenario 17: Step 1 - Confirm notification sent from MDE to Intune
> 来源: ado-wiki-MDE-Compliance.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
cluster('wcdprod').database('Geneva').
IntuneDeviceStateUpdates
| where AadDeviceId == ""
| where OrgId == ""
| project UploadTime, DeviceState, MdeDeviceId, AadDeviceId, AadTenantId, UploadGuid, UploadSource
```

Key fields: UploadTime, UploadStatus, UploadGUID (cross-reference in Intune).

**DeviceState values:**
- **Secured** — device fits compliance, signal received within threshold
- **Deactivated** — device exceeded compliance grace period (7 or 14 days). Requires deeper investigation into device health from MDE perspective.

Threshold configured in: Intune > Endpoint Security > Microsoft Defender for Endpoint > "Number of days until partner is unresponsive"

## Scenario 18: Step 2A (Deactivated) - Investigating device heartbeat to MDE
> 来源: ado-wiki-MDE-Compliance.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
let _MACHINEIDVAR = "";
let _ORGIDVAR = "";
macro-expand WcdScrubbedData as X (
    X.MachineInfoEvents
    | where MachineId == _MACHINEIDVAR
    | where OrgId == _ORGIDVAR)
| project MachineId, OrgId, ReportArrivalTimeUtc
```

Look for gaps in ReportArrivalTimeUTC to identify periods of inactivity.

## Scenario 19: Step 2B (Secured) - Investigating compliance data received by Intune
> 来源: ado-wiki-MDE-Compliance.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
IntuneEvent
| where env_cloud_name == cloudName
| where env_time between (startTime .. endTime)
| where ComponentName == "PartnerAPI"
| where Col3 startswith "Received data upload message [{\"EntityType\":1,\""
| where Col3 contains aadDeviceId
| project env_time, Col1, Col3
```

Compare Col1 (MessageID) with UploadGuid from Step 1.

## Scenario 20: Step 3 - Checking device compliance status
> 来源: ado-wiki-MDE-Compliance.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
IntuneEvent
| where env_cloud_name == "cloudName"
| where env_time between (startTime .. endTime)
| where ServiceName == "StatelessComplianceCalculationService"
| where EventUniqueName == "ComplianceDetail-GetComplianceDetailsForDeviceAction-FinalResult"
| where DeviceId == "deviceId"
| project env_time, ServiceName, ComponentName, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, Message, cV, ScenarioType, TraceLevel, ActivityId
```

## Scenario 21: Step 4 - Verifying Entra compliance patching
> 来源: ado-wiki-MDE-Compliance.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
IntuneEvent
| where env_cloud_name == "cloudName"
| where env_time between (startTime .. endTime)
| where ComponentName == "MSGraphHelper"
| where EventUniqueName == "MSGraphUpdateDeviceSuccessfully"
| where AccountId == intuneAccountId
| where DeviceId contains aadDeviceId
| project env_time, Col1, Col2, Col3, Col4, cV, ActivityId, ScenarioType
```

Col3 shows: IsCompliant, ComplianceExpirationDateTime, IsManaged, MdmAppId

## Scenario 22: Step 1: Find MessageId via GraphApiProxyLibrary
> 来源: onenote-partner-compliance-kusto.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

If the partner provides a MessageId, use it directly as `scenarioInstanceId`.

```kql
GraphApiProxyLibrary
| where env_cloud_name == "<cloud_name>"  // e.g. "AMSUC0101"
| where url contains "<AAD device id>"
| where contextId == '<Tenant id>'
// | where scenarioInstanceId == "<Partner Message id>"
| where responseBody contains "isCompliant"
| project env_time, url, requestBody, httpVerb, httpStatusCode, responseBody, 
          env_cloud_name, ActivityId, contextId, scenarioInstanceId, requestIds, TaskName
| order by env_time asc
```
`[来源: onenote-partner-compliance-kusto.md]`

## Scenario 23: Step 2: Detailed Event Trace via IntuneEvent
> 来源: onenote-partner-compliance-kusto.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kql
IntuneEvent
| where env_time > ago(10d)
| where env_cloud_name == "<cloud_name>"
| where ScenarioInstanceId == "<messageId from step 1>"
| where ActivityId == "<activityId from step 1>"
| project env_time, AccountId, UserId, DeviceId, ComponentName, 
          ActivityId, RelatedActivityId, ApplicationName, EventUniqueName, 
          ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6
```
`[来源: onenote-partner-compliance-kusto.md]`

## Key Components in Trace

| Component | Purpose |
|---|---|
| GraphHttpProxy | Graph API calls to patch device compliance |
| StatelessComplianceDetailProvider | Compliance calculation details |
| WorkplaceJoin | Device compliance patch to AAD |
| StatelessDeviceProvider | Device property sync |

## Important Notes

- **HeartBeat ≠ Compliance Report**: A successful heartbeat message from the partner does NOT mean compliance status was actually reported
- The `deviceManagementAppId` field identifies which MDM partner reported:
  - `0000000a-0000-0000-c000-000000000000` = Microsoft Intune
  - Other GUIDs = third-party partners (e.g., MobileIron, VMware, etc.)
- `isCompliant: false` with `complianceExpiryTime: null` means device is marked non-compliant with no grace period

---

## Kusto 查询参考

### 查询 1: 查询单个设备合规状态

```kql
let deviceGuid = '{deviceId}';
let startTime = datetime({startTime});
let endTime = datetime({endTime});
let maxRows = 1000;

IntuneEvent
| where env_time between (startTime .. endTime)
| where ServiceName == "StatelessComplianceCalculationService"
| where EventUniqueName == "ComplianceDetail-GetComplianceDetailsForDeviceAction-FinalResult"
    or EventUniqueName == "ComplianceDetail-ComplianceUpdateDevicePatcher-DeviceCompliantChangedDetails"
| where Col1 contains deviceGuid
| extend complianceState = iff(EventUniqueName == "ComplianceDetail-ComplianceUpdateDevicePatcher-DeviceCompliantChangedDetails", Col3, extract("ComplianceState:(.*?);", 1, Col2))
| extend complianceDetails = extract("RuleDetails:(.*)", 1, Col2)
| extend accountId = extract("AccountId=(.*?);DeviceId=(.*?);User=(.*?);DeviceIdSource=(.*?);", 1, Col1)
| extend deviceId = extract("AccountId=(.*?);DeviceId=(.*?);User=(.*?);DeviceIdSource=(.*?);", 2, Col1)
| extend userId = extract("AccountId=(.*?);DeviceId=(.*?);User=(.*?);DeviceIdSource=(.*?);", 3, Col1)
| extend deviceSource = extract("AccountId=(.*?);DeviceId=(.*?);User=(.*?);DeviceIdSource=(.*?);", 4, Col1)
| project ASU=env_cloud_name, env_time, complianceState, complianceDetails, deviceId, userId, accountId
| limit maxRows
```
`[来源: compliance.md]`

### 查询 2: 统计从不合规变为合规的设备数量

```kql
let accountGuid = '{accountId}';
let startTime = datetime({startTime});
let endTime = datetime({endTime});

IntuneEvent 
| where env_time between (startTime .. endTime) 
| where ServiceName == "StatelessComplianceCalculationService" 
| where EventUniqueName == "ComplianceDetail-ComplianceUpdateDevicePatcher-DeviceCompliantChangedDetails" 
| where Col1 contains accountGuid 
| extend complianceState = Col3
| where complianceState contains "now: Compliant"
| extend accountId = extract("AccountId=(.*?);DeviceId=(.*?);User=(.*?);DeviceIdSource=(.*?);", 1, Col1) 
| extend deviceId = extract("AccountId=(.*?);DeviceId=(.*?);User=(.*?);DeviceIdSource=(.*?);", 2, Col1) 
| extend userId = extract("AccountId=(.*?);DeviceId=(.*?);User=(.*?);DeviceIdSource=(.*?);", 3, Col1) 
| project ASU=env_cloud_name, env_time, complianceState, EventUniqueName, deviceId, userId, accountId, Col2
```
`[来源: compliance.md]`

### 查询 3: 合规策略操作查询

```kql
IntuneEvent
| where env_time >= ago(3d)
| where ColMetadata == "AADDId;AADTrustType;Authority;EnrollType;ClientCertificate;Message;"
| where ActivityId contains '{activityId}'
| distinct DeviceId
```
`[来源: compliance.md]`

### 查询 4: 通用设备日志查询

```kql
let deviceid = '{deviceId}';

IntuneEvent
| where env_time > ago(3d)
| where ActivityId == deviceid or DeviceId == deviceid
| project env_time, ActivityId, RelatedActivityId, EventUniqueName, ColMetadata, 
    Col1, Col2, Col3, Col4, Col5, Col6, Message
| extend metakeys = todynamic(split(trim_end(';',ColMetadata),';'))
| extend metavalues = pack(tostring(metakeys[0]), Col1, tostring(metakeys[1]), Col2, 
    tostring(metakeys[2]), Col3, tostring(metakeys[3]), Col4, 
    tostring(metakeys[4]), Col5, tostring(metakeys[5]), Col6) 
| project env_time, ActivityId, RelatedActivityId, EventUniqueName, metavalues
| order by env_time asc
```
`[来源: compliance.md]`

### 查询 5: Compliance 计算完整查询（含 accountId 过滤）

```kql
let deviceGuid = '{deviceId}';
let accountid = '{accountId}';
let startTime = datetime({startTime});
let endTime = datetime({endTime});

IntuneEvent
| where env_time between (startTime .. endTime)
| where ServiceName == "StatelessComplianceCalculationService"
| where EventUniqueName == "ComplianceDetail-GetComplianceDetailsForDeviceAction-FinalResult"
    or EventUniqueName == "ComplianceDetail-ComplianceUpdateDevicePatcher-DeviceCompliantChangedDetails"
| where Col1 contains accountid and Col1 contains deviceGuid
| extend accountId = extract("AccountId=(.*?);DeviceId=(.*?);User=(.*?);DeviceIdSource=(.*?);", 1, Col1)
| extend deviceId = extract("AccountId=(.*?);DeviceId=(.*?);User=(.*?);DeviceIdSource=(.*?);", 2, Col1)
| extend userId = extract("AccountId=(.*?);DeviceId=(.*?);User=(.*?);DeviceIdSource=(.*?);", 3, Col1)
| extend deviceSource = extract("AccountId=(.*?);DeviceId=(.*?);User=(.*?);DeviceIdSource=(.*?);", 4, Col1)
| extend complianceState = iff(EventUniqueName == "ComplianceDetail-ComplianceUpdateDevicePatcher-DeviceCompliantChangedDetails", Col3, extract("ComplianceState:(.*?);", 1, Col5))
| extend complianceDetails = extract("RuleDetails:(.*)", 1, Col5)
| project env_time, complianceState, complianceDetails, deviceId, userId, deviceSource
| limit 1000
```
`[来源: compliance.md]`

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

### 查询 6: Tattoo 移除状态查询

```kql
DeviceManagementProvider
| where env_time >= ago(1d)
| where ActivityId == '{deviceId}'
| where message contains "Tattoo"
| project env_time, ActivityId, cV, message
```
`[来源: policy-status.md]`

### 查询 7: 查询已撤销的策略

```kql
DeviceManagementProvider
| where SourceNamespace == "IntuneCNP" 
| where env_time >= now(-10d)
| where EventMessage contains "Tattoo removed for - AccountID: '{accountId}'; DeviceID: '{deviceId}'" 
| project env_time, EventMessage
```
`[来源: policy-status.md]`

### 3. Kusto: Compliance Status Changes

```kql
_DeviceComplianceStatusChangesByDeviceId("deviceId", datetime(start), datetime(end), 1000)
```
`[来源: ado-wiki-Compliance-Calculation.md]`

### 4. Verify device is checking in

```kql
let IntuneDeviceId = "";
DmpLogs
| where env_time > ago(7d)
| where deviceId == IntuneDeviceId
| where isnotempty(message)
| project ActivityId, env_time, message
| summarize DMS_Messages=count() by DeviceId = IntuneDeviceId
| join kind = rightouter (
    union DeviceService_Device, DeviceService_Device_Ctip, DeviceService_Device_OneDF
    | where DeviceId == IntuneDeviceId
    | summarize arg_max(Lens_IngestionTime, CreatedDate, LastContactNotification, LastContact, IsManaged, GraphDeviceIsManaged, MDMStatus, GraphDeviceIsCompliant, ReferenceId, CertExpirationDate, EnrolledByUser) by DeviceId, ScaleUnitName
) on DeviceId
```
`[来源: ado-wiki-Compliance-Calculation.md]`

### 5. Check CA targeting

```kql
let LookupUserId = "";
CAPolicyTargeting
| where UserId == LookupUserId
```
`[来源: ado-wiki-Compliance-Calculation.md]`

### Email Profile causing Unknown compliance (iOS)

```kql
let IntuneAccountId = "accountId";
DmpLogs
| where env_time > ago(5d)
| where deviceId in ("deviceId1", "deviceId2")
| where message startswith "Failed to evaluate rule CIExpression - Referred CI not found:"
| project Error = "Found targeting issue, might be e-mail profile", deviceId, message, env_time
```
`[来源: ado-wiki-Compliance-Calculation.md]`

### Compliance SLA Alert Investigation

```kql
let ScaleUnitFromAlert = "AMSUB0101";
IntuneEvent
| where env_time between (MonitorDateStartTime .. MonitorDateEndTime)
| where env_cloud_name == ScaleUnitFromAlert
| where ComponentName == "StatelessComplianceDetailProvider"
| where EventUniqueName == "ComplianceDetail-GetComplianceDetailsForDeviceAction-FinalResult"
| where Col2 == "Failed"
| extend exception = Col3
| extend exceptionType = extract("(.*?):", 1, exception)
```
`[来源: ado-wiki-Compliance-Calculation.md]`

### Full device check-in logs

```kql
let IntuneDeviceId = "<intune device ID>";
DeviceManagementProvider
| where env_time > ago(1d)
| where ActivityId == IntuneDeviceId
| where isnotempty(message)
| project env_time, message
```
`[来源: ado-wiki-Device-Compliance.md]`

### All compliance logs for device

```kql
let TheIntuneDeviceID = "<intune device ID>";
IntuneEvent
| where env_time > ago(7d)
| where ComponentName == "StatelessComplianceDetailProvider"
| where Col1 contains TheIntuneDeviceID
| project env_time, ComponentName, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, Message
```
`[来源: ado-wiki-Device-Compliance.md]`

### Compliance evaluation results

```kql
let deviceGuid = "<intune device ID>";
let startTime = ago(7d);
let endTime = now();
IntuneEvent
| where env_time between (startTime .. endTime)
| where ServiceName == "StatelessComplianceCalculationService"
| where EventUniqueName == "ComplianceDetail-GetComplianceDetailsForDeviceAction-FinalResult"
    or EventUniqueName == "ComplianceDetail-ComplianceUpdateDevicePatcher-DeviceCompliantChangedDetails"
| where Col1 contains deviceGuid
| extend complianceState = iff(EventUniqueName == "ComplianceDetail-ComplianceUpdateDevicePatcher-DeviceCompliantChangedDetails", Col3,
    extract("ComplianceState:(.*?);", 1, iff(ColMetadata == "InstanceId;taskStatus;exceptionThrown;ElapsedTicks;complianceResult;", Col5, Col2)))
| extend complianceDetails = extract("RuleDetails:(.*)", 1, iff(ColMetadata == "InstanceId;taskStatus;exceptionThrown;ElapsedTicks;complianceResult;", Col5, Col2))
| extend accountId = extract("AccountId=(.*?);DeviceId=(.*?);User=(.*?);DeviceIdSource=(.*?);", 1, Col1)
| extend deviceId = extract("AccountId=(.*?);DeviceId=(.*?);User=(.*?);DeviceIdSource=(.*?);", 2, Col1)
| extend userId = extract("AccountId=(.*?);DeviceId=(.*?);User=(.*?);DeviceIdSource=(.*?);", 3, Col1)
| project ASU=env_cloud_name, env_time, complianceState, complianceDetails, deviceId, userId, accountId
```
`[来源: ado-wiki-Device-Compliance.md]`

### Step 1 - Confirm notification sent from MDE to Intune

```kql
cluster('wcdprod').database('Geneva').
IntuneDeviceStateUpdates
| where AadDeviceId == ""
| where OrgId == ""
| project UploadTime, DeviceState, MdeDeviceId, AadDeviceId, AadTenantId, UploadGuid, UploadSource
```
`[来源: ado-wiki-MDE-Compliance.md]`

### Step 2A (Deactivated) - Investigating device heartbeat to MDE

```kql
let _MACHINEIDVAR = "";
let _ORGIDVAR = "";
macro-expand WcdScrubbedData as X (
    X.MachineInfoEvents
    | where MachineId == _MACHINEIDVAR
    | where OrgId == _ORGIDVAR)
| project MachineId, OrgId, ReportArrivalTimeUtc
```
`[来源: ado-wiki-MDE-Compliance.md]`

### Step 2B (Secured) - Investigating compliance data received by Intune

```kql
IntuneEvent
| where env_cloud_name == cloudName
| where env_time between (startTime .. endTime)
| where ComponentName == "PartnerAPI"
| where Col3 startswith "Received data upload message [{\"EntityType\":1,\""
| where Col3 contains aadDeviceId
| project env_time, Col1, Col3
```
`[来源: ado-wiki-MDE-Compliance.md]`

### Step 3 - Checking device compliance status

```kql
IntuneEvent
| where env_cloud_name == "cloudName"
| where env_time between (startTime .. endTime)
| where ServiceName == "StatelessComplianceCalculationService"
| where EventUniqueName == "ComplianceDetail-GetComplianceDetailsForDeviceAction-FinalResult"
| where DeviceId == "deviceId"
| project env_time, ServiceName, ComponentName, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, Message, cV, ScenarioType, TraceLevel, ActivityId
```
`[来源: ado-wiki-MDE-Compliance.md]`

---

## 判断逻辑参考

### MDMStatus Enum (ComplianceState)

| Value | State | Description |
|-------|-------|-------------|
| 0 | Unknown | Not yet checked in. Bug if persists after multiple check-ins. Could be conflicting policies from different consoles. |
| 1 | Compliant | Compliant with all assigned rules |
| 2 | Noncompliant | Noncompliant with any assigned rules. Details available via SSP/IWP/ViewPoint |
| 3 | Conflict | Available but unused by calculation library |
| 4 | Error | DMS reports error. 7-day tolerance for non-remediation errors before marking noncompliant. Remediation errors → immediately noncompliant |

### Final compliance results per CI

| where env_time > ago(1d)
| where ActivityId == IntuneDeviceId
| where isnotempty(message)
| project env_time, message
| where message startswith "Saving report for CI"
| extend CI = extract("Saving report for CI (.*)/(\\d+) with state (\\w+) (\\w+)", 1, message)
| extend CIVersion = extract("Saving report for CI (.*)/(\\d+) with state (\\w+) (\\w+)", 2, message)
| extend Applicability = extract("Saving report for CI (.*)/(\\d+) with state (\\w+) (\\w+)", 3, message)
| extend ComplianceState = extract("Saving report for CI (.*)/(\\d+) with state (\\w+) (\\w+)", 4, message)

### Compliance evaluation results

| where env_time between (startTime .. endTime)
| where ServiceName == "StatelessComplianceCalculationService"
| where EventUniqueName == "ComplianceDetail-GetComplianceDetailsForDeviceAction-FinalResult"

### Compliance evaluation results

| where Col1 contains deviceGuid
| extend complianceState = iff(EventUniqueName == "ComplianceDetail-ComplianceUpdateDevicePatcher-DeviceCompliantChangedDetails", Col3,

### Compliance evaluation results

| extend complianceDetails = extract("RuleDetails:(.*)", 1, iff(ColMetadata == "InstanceId;taskStatus;exceptionThrown;ElapsedTicks;complianceResult;", Col5, Col2))
| extend accountId = extract("AccountId=(.*?);DeviceId=(.*?);User=(.*?);DeviceIdSource=(.*?);", 1, Col1)
| extend deviceId = extract("AccountId=(.*?);DeviceId=(.*?);User=(.*?);DeviceIdSource=(.*?);", 2, Col1)
| extend userId = extract("AccountId=(.*?);DeviceId=(.*?);User=(.*?);DeviceIdSource=(.*?);", 3, Col1)
| project ASU=env_cloud_name, env_time, complianceState, complianceDetails, deviceId, userId, accountId
