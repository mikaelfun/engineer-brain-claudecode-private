# Intune 证书通用问题与 Cloud PKI — 排查工作流

**来源草稿**: ado-wiki-PKCS-Certificate-Troubleshooting.md, ado-wiki-View-Certificates.md, mslearn-troubleshoot-scep-certificate-delivery.md, mslearn-troubleshoot-scep-certificate-deployment.md, mslearn-troubleshoot-scep-certificate-profiles.md
**Kusto 引用**: certificate.md
**场景数**: 35
**生成日期**: 2026-04-07

---

## Portal 路径

- `Intune > Connector > Enterprise CA)`

## Scenario 1: About PKCS Certificate Troubleshooting
> 来源: ado-wiki-PKCS-Certificate-Troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

This page provides comprehensive guidance for troubleshooting PKCS certificate deployment issues in Microsoft Intune, including Certificate Connector errors, processing delays, and platform-specific behaviors.

> **NOTE**: PKCS certificate deployment involves multiple components (Device > Intune > Connector > Enterprise CA). Delays can occur at any point in this chain.

## Scenario 2: Complete Flow
> 来源: ado-wiki-PKCS-Certificate-Troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. **Device Check-in**: Device → Intune: Request certificate profile. Intune creates PfxCertificate entity (Status=0, Pending)
2. **Connector Download (DownloadNewMessages)**: Connector → Intune: Poll for new certificate requests (PfxCertificates where Status eq 0)
3. **Connector Local Processing**: Connector → CA: Submit certificate request. CA → Connector: Return issued certificate. Potential failure point: NullReferenceException, CA errors
4. **Connector Upload**: Connector → Intune: Upload issued certificate. Intune: Update PfxCertificate (Status=1, Issued). HTTP Response: 204 No Content (Success)
5. **Device Notification**: Intune → APNs/WNS/FCM: Push notification to device. Device: Receive and install certificate

## Scenario 3: PfxCertificate Status Values
> 来源: ado-wiki-PKCS-Certificate-Troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Status | Value | Description |
|--------|-------|-------------|
| Pending | 0 | Waiting for Connector to process |
| Issued | 1 | Certificate issued and uploaded |
| Failed | 2 | Certificate issuance failed |
| Revoked | 3 | Certificate revoked |

## Scoping Questions

1. What is the device platform? (Windows/iOS/Android/macOS)
2. How long has the certificate been in "Pending" status?
3. Are other devices/users able to receive certificates successfully?
4. Is this a new deployment or was it previously working?
5. Has anything changed recently? (Connector update, CA changes, network changes)
6. Is the certificate linked to a VPN profile? (especially important for iOS)
7. When was the Connector service last restarted?

## Scenario 4: Troubleshooting Workflow
> 来源: ado-wiki-PKCS-Certificate-Troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```
1. Check Intune received request
   Search: "Processing request of DownloadNewMessages"
     Not found → Network/Connector connectivity issue
     Found → Continue to step 2

2. Check pending certificates found
   Search: "Searching for pending PfxCertificates...returned"
     returned 0 → No pending requests, check device sync
     returned X → Continue to step 3

3. Check Connector uploaded result
   Search: "Processing request of Upload"
     Not found → Check Connector Event Log for errors
     Found → Continue to step 4

4. Check Upload success
   Search: "statusCode: 204"
     Not found → Upload failed, check TraceLevel for errors
     Found → Certificate issued, check device sync

5. If no Upload, check Connector Event Log
   Search: NullReferenceException, RPC_S_SERVER_UNAVAILABLE
     NullReferenceException → Connector bug, restart service
     RPC error → Check CA connectivity
     No errors → Check CA processing time
```

## Kusto Queries

## Scenario 5: Query 1: Check Connector Operations (Download/Upload)
> 来源: ado-wiki-PKCS-Certificate-Troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
IntuneEvent
| where env_time between (datetime(['_startTime']) .. datetime(['_endTime']))
| where AccountId == "['AccountID']"
| where Col2 contains "Processing request of"
| project env_time, ServiceName, EventUniqueName, Col2
| order by env_time asc
```

> **TIP**: Look for `DownloadNewMessages` followed by `Upload`. Multiple downloads without uploads indicates a Connector issue.

## Scenario 6: Query 2: Verify Upload Success
> 来源: ado-wiki-PKCS-Certificate-Troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
IntuneEvent
| where env_time between (datetime(['_startTime']) .. datetime(['_endTime']))
| where AccountId == "['AccountID']"
| where Col2 contains "PfxCertificate individual patch statusCode"
| project env_time, Col2
```

**Success Indicator**: `statusCode: 204`

## Scenario 7: Query 3: Check VPN Dependency (iOS)
> 来源: ado-wiki-PKCS-Certificate-Troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
DeviceManagementProvider
| where env_time between (datetime(['_startTime']) .. datetime(['_endTime']))
| where ActivityId == '['DeviceID']'
| where message contains "Dependent payload" or message contains "Issuing certificate profile"
| project env_time, TaskName, message
| sort by env_time asc
```

## Scenario 8: Query 4: Check NotNow Responses (iOS Device Busy)
> 来源: ado-wiki-PKCS-Certificate-Troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
DeviceManagementProvider
| where env_time between (datetime(['_startTime']) .. datetime(['_endTime']))
| where ActivityId == '['DeviceID']'
| where message contains "NotNow"
| project env_time, TaskName, message
| sort by env_time asc
```

## Scenario 9: Query 5: Certificate Delivery Time Analysis
> 来源: ado-wiki-PKCS-Certificate-Troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
let accountId = "['AccountID']";
let startTime = ago(7d);

IntuneEvent
| where env_time > startTime
| where AccountId == accountId
| where ApplicationName == "RACerts"
| where EventUniqueName contains "PfxCertificate"
| extend
    isRequest = iff(EventUniqueName contains "Processing", 1, 0),
    isComplete = iff(EventUniqueName contains "PatchComplete", 1, 0)
| summarize
    RequestTime = minif(env_time, isRequest == 1),
    CompleteTime = maxif(env_time, isComplete == 1)
    by DeviceId
| extend DeliveryTimeMinutes = datetime_diff('minute', CompleteTime, RequestTime)
| where isnotnull(DeliveryTimeMinutes)
| summarize
    AvgDeliveryTime = avg(DeliveryTimeMinutes),
    MaxDeliveryTime = max(DeliveryTimeMinutes),
    MinDeliveryTime = min(DeliveryTimeMinutes),
    Count = count()
```

## Connector Event Log Analysis

## Scenario 10: Log Location
> 来源: ado-wiki-PKCS-Certificate-Troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Event Viewer: `Applications and Services Logs` > `Microsoft` > `Intune` > `CertificateConnectors` > `Operational`

## Scenario 11: Key Event IDs
> 来源: ado-wiki-PKCS-Certificate-Troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Event ID | Level | Description |
|----------|-------|-------------|
| **1000** | Info | PKCS certificate successfully processed |
| **1001** | Error | PKCS certificate processing failed |
| 1002 | Info | Successfully downloaded requests from Intune |
| **1020** | Info | Specific request downloaded |
| **1050** | Info | CA successfully issued certificate |
| 1051 | Warning | CA issue failed, retrying |
| **1052** | Error | CA permanently failed to issue |
| 1100 | Info | Successfully uploaded to Intune |
| **1101** | Error | Failed to upload to Intune |
| **1102** | Info | Specific request uploaded |
| 2 | Error | General exception (NullReferenceException) |

## Scenario 12: PowerShell Commands
> 来源: ado-wiki-PKCS-Certificate-Troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```powershell
# Check Connector service status
Get-Service | Where-Object { $_.Name -like "*Intune*" -or $_.Name -like "*PFX*" }

# Restart Connector services
Get-Service | Where-Object { $_.Name -like "*Intune*" -or $_.Name -like "*PFX*" } | Restart-Service

# Export Connector Event Log
wevtutil epl "Microsoft-Intune-CertificateConnectors/Operational" "C:\temp\connector.evtx"

# Query recent errors
Get-WinEvent -LogName "Microsoft-Intune-CertificateConnectors/Operational" -MaxEvents 100 |
    Where-Object { $_.Level -le 2 } |
    Format-List TimeCreated, Id, Message
```

## Reference Codes

## Scenario 13: ServiceName Values
> 来源: ado-wiki-PKCS-Certificate-Troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| ServiceName | Description |
|-------------|-------------|
| `StatelessConnectorService` | Connector communication service |
| `StatelessDeviceService` | Device service (PfxCertificates table) |
| `StatelessAccountService` | Account service (CICertificates table) |
| `StatelessCertificateAuthority` | Certificate authority service |
| `RTNService` | Remote notification service (APNs/WNS) |

## Scenario 14: Col2 Search Keywords
> 来源: ado-wiki-PKCS-Certificate-Troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Phase | Keyword | Description |
|-------|---------|-------------|
| Download | `Processing request of DownloadNewMessages` | Connector polling |
| Download | `Searching for pending PfxCertificates...returned` | Found pending certs |
| Upload | `Processing request of Upload` | Connector uploading result |
| Upload | `PfxCertificate individual patch statusCode: 204` | Success |

## Scenario 15: Connector Event Log Search Keywords
> 来源: ado-wiki-PKCS-Certificate-Troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Keyword | Indicates |
|---------|-----------|
| `NullReferenceException` | Connector bug |
| `UploadResults` | Upload phase failure |
| `RPC_S_SERVER_UNAVAILABLE` | CA unreachable |
| `0x800706BA` | RPC connection failure |

## FAQ

- **Normal processing time**: 1-5 minutes. If pending >15 minutes, investigate.
- **Hours in Pending**: Common causes include Connector bugs (NullReferenceException), CA processing delays, or device sync intervals (default 8 hours).
- **Speed up iOS delivery**: Manual sync from Settings > General > VPN & Device Management > Sync.
- **Restart Connector**: Yes, often resolves transient issues like NullReferenceException.

## Additional Documentation

- [PKCS certificate profiles in Intune](https://learn.microsoft.com/en-us/mem/intune/protect/certificates-pfx-configure)
- [Certificate Connector for Microsoft Intune](https://learn.microsoft.com/en-us/mem/intune/protect/certificate-connector-overview)
- [Troubleshoot PKCS certificate deployment](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/certificates/troubleshoot-pkcs-certificate-profiles)
- [iOS device is currently busy error (2016341112)](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/device-configuration/2016341112-ios-device-is-currently-busy)

## Scenario 16: Trusted Certificates in Settings
> 来源: ado-wiki-View-Certificates.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Settings > search "Certificates" > View security certificates > User > Work

## Scenario 17: Trusted/SCEP Certificates via X-509 app
> 来源: ado-wiki-View-Certificates.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Use "X509 Certificate Viewer Tool" (push via Managed Google Play Store for Enterprise enrollment)
- SCEP cert shows as `User{Thumbprint}` (e.g., UserF1EA2F39EA7ACEBA5E6DD8BCFF4DEB1F2B5001B6)

## 2. Android Device Owner (DO)

## Scenario 18: SCEP via Settings
> 来源: ado-wiki-View-Certificates.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Settings > search "Certificates" > User certificates > shows as `User {policyID}`

## Scenario 19: SCEP via X-509 app
> 来源: ado-wiki-View-Certificates.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Shows as `User {PolicyID}` (e.g., User 113122ab-xxxx-xxxx-xxxx-4cc5e955becd)

## 3. iOS Profiles

## Scenario 20: Trusted Certificates
> 来源: ado-wiki-View-Certificates.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Settings > General > VPN & Device Management > Management Profile > More Details > Certificates
- Root: "Credential Profile - thumbprint"; Intermediate: "PKCS1 Credential Profile - thumbprint"

## Scenario 21: SCEP Certificates
> 来源: ado-wiki-View-Certificates.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Settings > General > VPN & Device Management > Management Profile > More Details > SCEP DEVICE IDENTITY CERTIFICATES
- Look for certs issued by local CA (ignore Microsoft Intune / MS-Organization-Access)
- Note: iOS may show duplicate certificates for SCEP (one per dependent profile)

## 4. macOS Profiles

## Scenario 22: Trusted Certificates in Management Profile
> 来源: ado-wiki-View-Certificates.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- macOS 14 and below: Settings > Privacy & Security > Profiles
- macOS 15+: Settings > General > Device Management
- Root: "Credential Profile - thumbprint"; Intermediate: "PKCS1 Credential Profile - thumbprint"

## Scenario 23: SCEP Certificate Chain
> 来源: ado-wiki-View-Certificates.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Select cert in Keychain > Keychain Access menu > Certificate Assistant > Evaluate > Generic > Continue > Done

## 5. Windows Profiles

## Scenario 24: Trusted Certificates via MMC
> 来源: ado-wiki-View-Certificates.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- mmc > File > Add/Remove Snap-in > Certificates > Computer Account
- Trusted Root: Certificates (Local Computer) > Trusted Root Certification Authorities > Certificates
- Intermediate: Certificates (Local Computer) > Intermediate Certification Authorities > Certificates

## Scenario 25: SCEP Certificates via MMC
> 来源: ado-wiki-View-Certificates.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- User cert: snap-in "My User Account" > Personal > Certificates
- Device cert: snap-in "Computer Account" > Personal > Certificates
- Check: Issued to, Valid From, Subject, Subject Alternative Name, Thumbprint, Certification Path

## Scenario 26: Keywords to verify on all platforms
> 来源: ado-wiki-View-Certificates.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Subject Name / Issued to
- Validity Period / Valid From
- SHA-1 / Thumbprint
- Certification Path
- Subject Alternative Name (SCEP)

## Scenario 27: Android
> 来源: mslearn-troubleshoot-scep-certificate-delivery.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Device administrator: notification prompts cert install
- Android Enterprise / Samsung Knox: automatic, silent install
- Use third-party cert viewing app to verify
- OMADM log key entries:
  - Root cert state: `CERT_INSTALL_REQUESTED → CERT_INSTALLING → CERT_INSTALL_SUCCESS`
  - SCEP cert state: `CERT_ENROLLED → CERT_INSTALL_REQUESTED → CERT_INSTALLING → CERT_ACCESS_REQUESTED → CERT_ACCESS_GRANTED`
  - GetCACert and GetCACaps requests should return `200 OK`

## Scenario 28: iOS/iPadOS
> 来源: mslearn-troubleshoot-scep-certificate-delivery.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Settings → General → Device Management → view certificate
- Debug log entries:
  - Synchronous URL requests to NDES (GetCACert, GetCACaps, PKIOperation)
  - `Profile 'www.windowsintune.com.SCEP...' installed.`

## Scenario 29: Windows
> 来源: mslearn-troubleshoot-scep-certificate-delivery.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Event Viewer → DeviceManagement-Enterprise-Diagnostic-Provider → Admin
- **Event 39**: "SCEP: Certificate installed successfully"
- certmgr.msc verification:
  - Trusted Root Certification Authorities → root cert present (Issued To = Issued By)
  - Personal → Certificates → SCEP cert present (Issued By = CA name)

## Scenario 30: Troubleshooting Failures
> 来源: mslearn-troubleshoot-scep-certificate-delivery.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **Android**: Review OMA DM log errors
- **iOS**: Review device debug log errors
- **Windows**: Check Event log; delivery errors typically related to Windows operations, not Intune

## Scenario 31: Validation Steps (All Platforms)
> 来源: mslearn-troubleshoot-scep-certificate-deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Intune admin center → Troubleshooting + Support → Troubleshoot
2. Set Assignments = Configuration profiles
3. Verify: correct user, group membership, last check-in time

## Platform-Specific Log Verification

## Scenario 32: SCEP Communication Flow (6 Steps)
> 来源: mslearn-troubleshoot-scep-certificate-profiles.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. **Deploy SCEP certificate profile** → Intune generates challenge string
2. **Device to NDES** → Device uses URI from profile to contact NDES server
3. **NDES to Policy Module** → NDES forwards challenge to Intune Certificate Connector policy module for validation
4. **NDES to CA** → NDES passes valid requests to Certification Authority
5. **Certificate delivery** → Certificate delivered to device
6. **Reporting** → Intune Certificate Connector reports issuance event to Intune

## Scenario 33: Prerequisites
> 来源: mslearn-troubleshoot-scep-certificate-profiles.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Root certificate deployed through trusted certificate profile
- Applies to Android, iOS/iPadOS, Windows (macOS info not available)

## Key Log Locations

## Scenario 34: Infrastructure (NDES Server)
> 来源: mslearn-troubleshoot-scep-certificate-profiles.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **Intune Connector Logs**: Event Viewer → Applications and Services Logs → Microsoft → Intune → CertificateConnectors → Admin/Operational
- **IIS Logs**: `c:\inetpub\logs\LogFiles\W3SVC1`

## Scenario 35: Related Troubleshooting Articles
> 来源: mslearn-troubleshoot-scep-certificate-profiles.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- SCEP profile deployment (Step 1)
- Device to NDES communication (Step 2)
- NDES to policy module (Step 3)
- NDES to CA (Step 4)
- Certificate delivery (Step 5)
- Reporting (Step 6)
- NDES configuration verification

---

## Kusto 查询参考

### 查询 1: 证书部署状态查询

```kql
DeviceManagementProvider
| where env_time > ago(7d)
| where ActivityId contains '{deviceId}'
| where * contains "scep" or * contains "pkcs" or * contains "certificate"
| project env_time, accountId, userId, DeviceID=ActivityId, PolicyName=name, 
    PolicyType=typeAndCategory, Applicability=applicablilityState, 
    Compliance=reportComplianceState, EventMessage, message, TaskName
```
`[来源: certificate.md]`

### 查询 2: SCEP 证书事件查询

```kql
IntuneEvent
| where env_time > ago(3h)
| where DeviceId == '{deviceId}' or ActivityId == '{deviceId}'
| where * contains "scep"
| project env_time, ComponentName, DeviceId, Message, EventUniqueName, 
    ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, ActivityId
```
`[来源: certificate.md]`

### 查询 3: 检查 SCEP/Trusted Root Profile 部署状态

```kql
let _deviceId = '{deviceId}';
let _startTime = datetime({startTime});
let _endTime = datetime({endTime});

DeviceManagementProvider 
| where env_time between (_startTime .. _endTime)
| where TaskName == "DeviceManagementProviderCIReportDataEvent" 
| where deviceId == _deviceId
| where typeAndCategory contains "TrustedRootCertificate" or typeAndCategory contains "ClientAuthCertificate"
| project env_time, policyId, typeAndCategory, applicablilityState, reportComplianceState, EventMessage
| order by env_time desc
```
`[来源: certificate.md]`

### 查询 4: 证书指纹查询

```kql
DeviceManagementProvider
| where env_time > ago(7d)
| where ActivityId == '{deviceId}' or userId == '{userId}'
| where message contains '{thumbprint}'
| project env_time, deviceId, ActivityId, message, EventId, userId, TaskName
| order by env_time
```
`[来源: certificate.md]`

### 查询 5: 依赖配置文件查询

```kql
DeviceManagementProvider
| where env_time > ago(1d)
| where ActivityId contains '{deviceId}'
| where message contains "dependent profile"
| project env_time, ActivityId, cV, message
```
`[来源: certificate.md]`

### 查询 6: 使用 IntuneEvent 查询证书过期 (推荐)

```kql
let accountId = '{accountId}';

// 获取 macOS 设备列表 (platform=10)
let macDevices = DeviceLifecycle
| where env_time > ago(90d)
| where accountId == accountId
| where platform == "10"  // 10=macOS, 7=iPhone, 8=iPad
| where deviceId != ""
| summarize by deviceId;

// 从 GetDeviceIdentityAsync 事件提取证书信息
IntuneEvent
| where env_time > ago(7d)
| where AccountId == accountId
| where DeviceId in (macDevices)
| where EventUniqueName == "GetDeviceIdentityAsync"
| where ColMetadata == "RegistrationStatus;EnrollCertStartTime;EnrollCertExpiryTime;"
| summarize arg_max(env_time, Col2, Col3) by DeviceId
| extend CertExpiryDate = todatetime(Col3)
| extend CertStartDate = todatetime(Col2)
| extend DaysUntilExpiry = datetime_diff('day', CertExpiryDate, now())
| project 
    DeviceId, 
    CertStartDate, 
    CertExpiryDate, 
    DaysUntilExpiry, 
    LastCheckedTime = env_time
| order by DaysUntilExpiry asc
| take 100
```
`[来源: certificate.md]`

### 查询 7: 使用 DeviceManagementProvider 查询证书过期

```kql
let accountId = '{accountId}';

let macDevices = DeviceLifecycle
| where env_time > ago(90d)
| where accountId == accountId
| where platform == "10"  // macOS
| where deviceId != ""
| summarize by deviceId;

DeviceManagementProvider
| where env_time > ago(14d)
| where accountId == accountId
| where ActivityId in (macDevices)
| where message contains "Enroll cert expiry time:"
| extend CertExpiryStr = extract("Enroll cert expiry time: ([0-9/]+ [0-9:]+ [AP]M)", 1, message)
| extend CertStartStr = extract("Enroll cert start time: ([0-9/]+ [0-9:]+ [AP]M)", 1, message)
| summarize arg_max(env_time, CertExpiryStr, CertStartStr) by DeviceId=ActivityId
| extend CertExpiryDate = todatetime(CertExpiryStr)
| extend CertStartDate = todatetime(CertStartStr)
| extend DaysUntilExpiry = datetime_diff('day', CertExpiryDate, now())
| project 
    DeviceId, 
    CertStartDate, 
    CertExpiryDate, 
    DaysUntilExpiry, 
    LastCheckedTime = env_time
| order by DaysUntilExpiry asc
| take 100
```
`[来源: certificate.md]`

### 查询 8: 查询即将过期的设备（60天内）

```kql
let accountId = '{accountId}';
let warningDays = 60;

let appleDevices = DeviceLifecycle
| where env_time > ago(90d)
| where accountId == accountId
| where platform in ("7", "8", "10")  // iPhone, iPad, macOS
| where deviceId != ""
| summarize by deviceId;

IntuneEvent
| where env_time > ago(7d)
| where AccountId == accountId
| where DeviceId in (appleDevices)
| where EventUniqueName == "GetDeviceIdentityAsync"
| where ColMetadata == "RegistrationStatus;EnrollCertStartTime;EnrollCertExpiryTime;"
| summarize arg_max(env_time, Col2, Col3) by DeviceId
| extend CertExpiryDate = todatetime(Col3)
| extend DaysUntilExpiry = datetime_diff('day', CertExpiryDate, now())
| where DaysUntilExpiry <= warningDays and DaysUntilExpiry >= 0
| project DeviceId, CertExpiryDate, DaysUntilExpiry, LastCheckedTime = env_time
| order by DaysUntilExpiry asc
```
`[来源: certificate.md]`

### Query 1: Check Connector Operations (Download/Upload)

```kql
IntuneEvent
| where env_time between (datetime(['_startTime']) .. datetime(['_endTime']))
| where AccountId == "['AccountID']"
| where Col2 contains "Processing request of"
| project env_time, ServiceName, EventUniqueName, Col2
| order by env_time asc
```
`[来源: ado-wiki-PKCS-Certificate-Troubleshooting.md]`

### Query 3: Check VPN Dependency (iOS)

```kql
DeviceManagementProvider
| where env_time between (datetime(['_startTime']) .. datetime(['_endTime']))
| where ActivityId == '['DeviceID']'
| where message contains "Dependent payload" or message contains "Issuing certificate profile"
| project env_time, TaskName, message
| sort by env_time asc
```
`[来源: ado-wiki-PKCS-Certificate-Troubleshooting.md]`

### Query 5: Certificate Delivery Time Analysis

```kql
let accountId = "['AccountID']";
let startTime = ago(7d);

IntuneEvent
| where env_time > startTime
| where AccountId == accountId
| where ApplicationName == "RACerts"
| where EventUniqueName contains "PfxCertificate"
| extend
    isRequest = iff(EventUniqueName contains "Processing", 1, 0),
    isComplete = iff(EventUniqueName contains "PatchComplete", 1, 0)
| summarize
    RequestTime = minif(env_time, isRequest == 1),
    CompleteTime = maxif(env_time, isComplete == 1)
    by DeviceId
| extend DeliveryTimeMinutes = datetime_diff('minute', CompleteTime, RequestTime)
| where isnotnull(DeliveryTimeMinutes)
| summarize
    AvgDeliveryTime = avg(DeliveryTimeMinutes),
    MaxDeliveryTime = max(DeliveryTimeMinutes),
    MinDeliveryTime = min(DeliveryTimeMinutes),
    Count = count()
```
`[来源: ado-wiki-PKCS-Certificate-Troubleshooting.md]`

---

## 判断逻辑参考

### PfxCertificate Status Values

| Status | Value | Description |
|--------|-------|-------------|
| Pending | 0 | Waiting for Connector to process |
| Issued | 1 | Certificate issued and uploaded |
| Failed | 2 | Certificate issuance failed |
| Revoked | 3 | Certificate revoked |

### Key Event IDs

| Event ID | Level | Description |
|----------|-------|-------------|
| **1000** | Info | PKCS certificate successfully processed |
| **1001** | Error | PKCS certificate processing failed |
| 1002 | Info | Successfully downloaded requests from Intune |
| **1020** | Info | Specific request downloaded |
| **1050** | Info | CA successfully issued certificate |
| 1051 | Warning | CA issue failed, retrying |
| **1052** | Error | CA permanently failed to issue |
| 1100 | Info | Successfully uploaded to Intune |
| **1101** | Error | Failed to upload to Intune |
| **1102** | Info | Specific request uploaded |
| 2 | Error | General exception (NullReferenceException) |

### Connector Event Log Search Keywords

| Keyword | Indicates |
|---------|-----------|
| `NullReferenceException` | Connector bug |
| `UploadResults` | Upload phase failure |
| `RPC_S_SERVER_UNAVAILABLE` | CA unreachable |
| `0x800706BA` | RPC connection failure |
