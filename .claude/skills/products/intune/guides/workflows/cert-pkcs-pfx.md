# Intune PKCS / PFX 证书部署 — 排查工作流

**来源草稿**: ado-wiki-PKCS-Overview.md, onenote-PFX-PKCS-Configuration-Troubleshooting.md, onenote-pfx-pkcs-configuration.md
**Kusto 引用**: certificate.md
**场景数**: 11
**生成日期**: 2026-04-07

---

## Portal 路径

- `Intune > Device Configuration > Certification Connectors > Add > Download`
- `Intune > CertificateConnector > Operational`

## Scenario 1: S/MIME Scenarios
> 来源: ado-wiki-PKCS-Overview.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- PKCS supports authentication, S/MIME email signing, and S/MIME email encryption
- Signing and encryption typically use separate certificates
- Active Directory CS: Exchange Signature Only (signing) + Exchange User (encryption)
- Connectors required:
  - Microsoft Intune Certificate Connector (authentication + signing)
  - PFX Certificate Connector (encryption)
  - Both can be on same server

## User vs Device Certificate
- User certs: contain both user and device attributes in Subject/SAN
- Device certs: only device attributes. Use for kiosks, shared devices

## Scenario 2: Known Behavior
> 来源: ado-wiki-PKCS-Overview.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- PKCS: profile/assignment changes → re-push existing cert (NOT new cert)
- SCEP: profile/assignment changes → issue new cert
- To get new PKCS cert: re-enroll device or deploy new PKCS profile

## Scoping Questions
1. Profile types? Sub CA? Pushing Sub CA cert to device?
2. Affected platform? (Android/iOS/Windows/macOS)
3. Enrollment type?
4. New or existing setup? When did it stop working? Recent changes?
5. How many devices affected? (xxx of YYY total)
6. Profiles targeted to same groups?
7. Root/Sub CA showing on devices?
8. Intune device ID + UPN of affected user?
9. Names of Trusted cert and PKCS profiles
10. Collect from Connector server: Event Viewer > Applications and Services > Microsoft > Intune > CertificateConnector > Operational + Admin
11. Any errors in Failed Requests on issuing CA?

## Support Boundaries
- Intune scope: policy configuration and delivery to device
- Collaborate with Windows Directory Services for:
  - NDES role installation failures
  - CRL availability issues
  - NDES application pool crashes
  - NDES URL returning 500 instead of 403
- Third-party SCEP solutions: involve vendor

## Scenario 3: Prerequisites
> 来源: onenote-PFX-PKCS-Configuration-Troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Active Directory domain (all servers joined)
- Enterprise CA (AD CS) - not standalone CA
- Client machine to connect to Enterprise CA
- Exported root certificate (.cer)
- Intune Certificate Connector (NDES Certificate Connector)

## Configuration Tasks

## Scenario 4: Task A: Configure Certificate Templates on CA
> 来源: onenote-PFX-PKCS-Configuration-Troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Open Certificate Templates snap-in on issuing CA
2. Create new custom template or copy existing (e.g., User template)
3. Key settings:
   - **Subject Name**: "Supply in the request"
   - **Extensions**: Include "Client Authentication" in Application Policies
   - **Request Handling**: Purpose = "Signature and Encryption", enable "Allow private key to be exported"
   - **Security**: SYSTEM needs Read + Enroll; add NDES connector computer account with Read + Enroll
4. Publish template: Certificate Templates node > Action > New > Certificate Template to Issue
5. Ensure connector computer has Enroll permission on CA Security tab

**Note**: For certificate revocation, SYSTEM needs "Issue and Manage Certificates" rights per template.

## Scenario 5: Task B: Install and Configure Intune Certificate Connector
> 来源: onenote-PFX-PKCS-Configuration-Troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Download from: Intune > Device Configuration > Certification Connectors > Add > Download
2. Run `ndesconnectorssetup.exe` as admin on machine that can reach the CA
3. Choose **PFX Distribution** option
4. Sign in with **Global Admin** (must have Intune license)
5. Restart Intune Connector Service: `services.msc` > right-click > Restart

## Scenario 6: Task C: Create and Deploy Certificate Profiles
> 来源: onenote-PFX-PKCS-Configuration-Troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Export Trusted Root CA as .cer (no private key)
2. Create **Trusted Certificate** profile (Root CA)
3. Create **PKCS #12 (.PFX)** profile:
   - **Certification Authority**: Internal FQDN (e.g., `server1.domain.local`)
   - **Certification Authority Name**: As displayed in CA MMC under "Certification Authority (Local)"
   - Verify with: `certutil -config - -ping`
4. Assign profiles to groups

## PFX Request Flow

1. Admin creates PFX certificate profile
2. Intune requests on-prem connector to create certificate
3. Connector sends PFX blob to on-prem CA
4. CA issues PFX user certificate back to connector
5. Connector uploads encrypted PFX to Intune
6. Intune re-encrypts for device using Device Management Certificate
7. Status reported back to Intune

## Key Log Files

| Log | Location | Viewer |
|-----|----------|--------|
| NDESConnector svclog | `C:\Program Files\Microsoft Intune\NDESConnectorSvc\Logs\Logs` | Service Trace Viewer (Windows SDK) |
| PFX Request files | `C:\Program Files\Microsoft Intune\PfxRequest\Succeed` | Text editor |
| iOS console logs | Mac Console app | Xcode / Console |
| Android logs | Company Portal (OMADMLOG) | Text editor |

## Scenario 7: Troubleshooting Tips
> 来源: onenote-PFX-PKCS-Configuration-Troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. **Most common issue**: Wrong Certification Authority or Certification Authority Name in profile. Verify with `certutil -config - -ping`
2. Check device logs (OMADMLOG for Android, Console for iOS)
3. Check `NDESConnector_Date.svclog` for errors
4. Check CA "Failed Requests" folder for errors
5. Check `\Microsoft Intune\PfxRequest` folders for failed/stuck requests

## Scenario 8: Task B: Install Intune Certificate Connector
> 来源: onenote-pfx-pkcs-configuration.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Download from Endpoint Management admin center → Device Configuration → Certification Connectors → Add
2. Run `ndesconnectorssetup.exe` as admin on CA-accessible machine
3. Choose **.PFX Distribution** option
4. Sign in with **Global Admin** (must have Intune license)
5. Restart **Intune Connector Service** via services.msc

## Scenario 9: Task C: Deploy Certificate Profiles
> 来源: onenote-pfx-pkcs-configuration.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Export Trusted Root CA certificate as **.cer** (no private key)
2. Create **Trusted Certificate** profile (Android/iOS)
3. Create **.PFX certificate** profile:
   - **Certification Authority**: Internal FQDN of CA (e.g., `server1.domain.local`)
   - **Certification Authority Name**: As shown in CA MMC under **Certification Authority (Local)**
   - Verify with: `certutil -config - -ping`
4. Assign profiles to groups

## Scenario 10: PFX Workflow
> 来源: onenote-pfx-pkcs-configuration.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Admin creates PFX certificate profile
2. Intune Service requests On-Prem Connector to create certificate
3. Connector sends PFX Blob + Request to On-Prem CA
4. CA issues PFX User Certificate → sends to Connector
5. Connector uploads encrypted PFX User Certificate to Intune
6. Intune re-encrypts for device using Device Management Certificate → sends to device
7. Certificate status reported back to Intune

## Key Log Files

| Log | Location |
|-----|----------|
| NDESConnector svclog | `C:\Program Files\Microsoft Intune\NDESConnectorSvc\Logs\Logs` |
| PFX Success | `C:\Program Files\Microsoft Intune\PfxRequest\Succeed` |
| PFX Failed | `C:\Program Files\Microsoft Intune\PfxRequest` (check subfolders) |
| iOS Console logs | Mac Console app → select iOS device |
| Android logs | Company Portal → OMADMLOG |

Use **Service Trace Viewer** (from Windows SDK) to read `.svclog` files.

## Scenario 11: Troubleshooting Checklist
> 来源: onenote-pfx-pkcs-configuration.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. **Verify profile settings** — most common issue. Check typos in CA FQDN and CA Name. Run `certutil -config - -ping` to confirm.
2. **Check device logs** — OMADMLOG (Android), Console logs (iOS)
3. **Check NDESConnector svclog** for errors
4. **Check CA → Failed Requests** folder for certificate issuance errors
5. **Check `\Microsoft Intune\PfxRequest`** folders for failed/stuck requests

---
*Source: OneNote — Configuring and Troubleshooting PFX/PKCS Certificates in Microsoft Intune*

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
