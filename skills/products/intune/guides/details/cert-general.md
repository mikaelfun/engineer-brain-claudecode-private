# Intune 证书通用问题与 Cloud PKI — 综合排查指南

**条目数**: 43 | **草稿融合数**: 5 | **Kusto 查询融合**: 1
**来源草稿**: ado-wiki-PKCS-Certificate-Troubleshooting.md, ado-wiki-View-Certificates.md, mslearn-troubleshoot-scep-certificate-delivery.md, mslearn-troubleshoot-scep-certificate-deployment.md, mslearn-troubleshoot-scep-certificate-profiles.md
**Kusto 引用**: certificate.md
**生成日期**: 2026-04-07

---

## ⚠️ 已知矛盾 (3 条)

- **solution_conflict** (high): intune-contentidea-kb-062 vs intune-mslearn-116 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **rootCause_conflict** (medium): intune-ado-wiki-301 vs intune-onenote-185 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **rootCause_conflict** (medium): intune-contentidea-kb-062 vs intune-mslearn-004 — context_dependent: 不同来源给出不同方案，可能适用不同场景

## 排查流程

### Phase 1: Pkcs Certificate Troubleshooting
> 来源: ADO Wiki — [ado-wiki-PKCS-Certificate-Troubleshooting.md](../drafts/ado-wiki-PKCS-Certificate-Troubleshooting.md)

**About PKCS Certificate Troubleshooting**
**How PKCS Certificate Deployment Works**
**Complete Flow**
1. **Device Check-in**: Device → Intune: Request certificate profile. Intune creates PfxCertificate entity (Status=0, Pending)
2. **Connector Download (DownloadNewMessages)**: Connector → Intune: Poll for new certificate requests (PfxCertificates where Status eq 0)
3. **Connector Local Processing**: Connector → CA: Submit certificate request. CA → Connector: Return issued certificate. Potential failure point: NullReferenceException, CA errors
4. **Connector Upload**: Connector → Intune: Upload issued certificate. Intune: Update PfxCertificate (Status=1, Issued). HTTP Response: 204 No Content (Success)
5. **Device Notification**: Intune → APNs/WNS/FCM: Push notification to device. Device: Receive and install certificate

**PfxCertificate Status Values**

**Scoping Questions**
1. What is the device platform? (Windows/iOS/Android/macOS)
2. How long has the certificate been in "Pending" status?
3. Are other devices/users able to receive certificates successfully?
4. Is this a new deployment or was it previously working?
5. Has anything changed recently? (Connector update, CA changes, network changes)

**Troubleshooting Workflow**
```
1. Check Intune received request
2. Check pending certificates found
3. Check Connector uploaded result
4. Check Upload success
5. If no Upload, check Connector Event Log
```

**Kusto Queries**

**Query 1: Check Connector Operations (Download/Upload)**
```kusto
```

**Query 2: Verify Upload Success**
```kusto
```

**Query 3: Check VPN Dependency (iOS)**
```kusto
```

**Query 4: Check NotNow Responses (iOS Device Busy)**
```kusto
```

**Query 5: Certificate Delivery Time Analysis**
```kusto
```

**Connector Event Log Analysis**

**Log Location**

**Key Event IDs**

**PowerShell Commands**
```powershell

**Check Connector service status**

**Restart Connector services**

**Export Connector Event Log**

**Query recent errors**
```

**Reference Codes**

**ServiceName Values**

**Col2 Search Keywords**

**Connector Event Log Search Keywords**

**FAQ**
- **Normal processing time**: 1-5 minutes. If pending >15 minutes, investigate.
- **Hours in Pending**: Common causes include Connector bugs (NullReferenceException), CA processing delays, or device sync intervals (default 8 hours).
- **Speed up iOS delivery**: Manual sync from Settings > General > VPN & Device Management > Sync.
- **Restart Connector**: Yes, often resolves transient issues like NullReferenceException.

**Additional Documentation**
- [PKCS certificate profiles in Intune](https://learn.microsoft.com/en-us/mem/intune/protect/certificates-pfx-configure)
... (详见原始草稿)

### Phase 2: View Certificates
> 来源: ADO Wiki — [ado-wiki-View-Certificates.md](../drafts/ado-wiki-View-Certificates.md)

**View Certificates**
**1. Android Personally Owned Work Profile (BYOD)**
**Trusted Certificates in Settings**
- Settings > search "Certificates" > View security certificates > User > Work

**Trusted/SCEP Certificates via X-509 app**
- Use "X509 Certificate Viewer Tool" (push via Managed Google Play Store for Enterprise enrollment)
- SCEP cert shows as `User{Thumbprint}` (e.g., UserF1EA2F39EA7ACEBA5E6DD8BCFF4DEB1F2B5001B6)

**2. Android Device Owner (DO)**

**Trusted Certificates in Settings**
- Settings > search "Certificates" > View security certificates > User

**SCEP via Settings**
- Settings > search "Certificates" > User certificates > shows as `User {policyID}`

**SCEP via X-509 app**
- Shows as `User {PolicyID}` (e.g., User 113122ab-xxxx-xxxx-xxxx-4cc5e955becd)

**3. iOS Profiles**

**Trusted Certificates**
- Settings > General > VPN & Device Management > Management Profile > More Details > Certificates
- Root: "Credential Profile - thumbprint"; Intermediate: "PKCS1 Credential Profile - thumbprint"

**SCEP Certificates**
- Settings > General > VPN & Device Management > Management Profile > More Details > SCEP DEVICE IDENTITY CERTIFICATES
- Look for certs issued by local CA (ignore Microsoft Intune / MS-Organization-Access)
- Note: iOS may show duplicate certificates for SCEP (one per dependent profile)

**4. macOS Profiles**

**Trusted Certificates in Management Profile**
- macOS 14 and below: Settings > Privacy & Security > Profiles
- macOS 15+: Settings > General > Device Management
- Root: "Credential Profile - thumbprint"; Intermediate: "PKCS1 Credential Profile - thumbprint"

**Trusted/SCEP Certificates in Keychain**
- Keychain Access > System > Certificates

**SCEP Certificate Chain**
- Select cert in Keychain > Keychain Access menu > Certificate Assistant > Evaluate > Generic > Continue > Done

**5. Windows Profiles**

**Trusted Certificates via MMC**
- mmc > File > Add/Remove Snap-in > Certificates > Computer Account
- Trusted Root: Certificates (Local Computer) > Trusted Root Certification Authorities > Certificates
- Intermediate: Certificates (Local Computer) > Intermediate Certification Authorities > Certificates

**SCEP Certificates via MMC**
- User cert: snap-in "My User Account" > Personal > Certificates
... (详见原始草稿)

### Phase 3: Troubleshoot Scep Certificate Delivery
> 来源: MS Learn — [mslearn-troubleshoot-scep-certificate-delivery.md](../drafts/mslearn-troubleshoot-scep-certificate-delivery.md)

**SCEP Certificate Delivery Troubleshooting (Step 5)**
**Verify on Certification Authority**
- Check CA for issued certificate entry after NDES processes the request

**Device-Side Verification**

**Android**
- Device administrator: notification prompts cert install
- Android Enterprise / Samsung Knox: automatic, silent install
- Use third-party cert viewing app to verify
- OMADM log key entries:
  - Root cert state: `CERT_INSTALL_REQUESTED → CERT_INSTALLING → CERT_INSTALL_SUCCESS`
  - SCEP cert state: `CERT_ENROLLED → CERT_INSTALL_REQUESTED → CERT_INSTALLING → CERT_ACCESS_REQUESTED → CERT_ACCESS_GRANTED`
  - GetCACert and GetCACaps requests should return `200 OK`

**iOS/iPadOS**
- Settings → General → Device Management → view certificate
- Debug log entries:
  - Synchronous URL requests to NDES (GetCACert, GetCACaps, PKIOperation)
  - `Profile 'www.windowsintune.com.SCEP...' installed.`

**Windows**
- Event Viewer → DeviceManagement-Enterprise-Diagnostic-Provider → Admin
- **Event 39**: "SCEP: Certificate installed successfully"
- certmgr.msc verification:
  - Trusted Root Certification Authorities → root cert present (Issued To = Issued By)
  - Personal → Certificates → SCEP cert present (Issued By = CA name)

**Troubleshooting Failures**
- **Android**: Review OMA DM log errors
- **iOS**: Review device debug log errors
- **Windows**: Check Event log; delivery errors typically related to Windows operations, not Intune
... (详见原始草稿)

### Phase 4: Troubleshoot Scep Certificate Deployment
> 来源: MS Learn — [mslearn-troubleshoot-scep-certificate-deployment.md](../drafts/mslearn-troubleshoot-scep-certificate-deployment.md)

**SCEP Certificate Profile Deployment Troubleshooting (Step 1)**
**Assignment Compatibility Matrix**
**Validation Steps (All Platforms)**
1. Intune admin center → Troubleshooting + Support → Troubleshoot
2. Set Assignments = Configuration profiles
3. Verify: correct user, group membership, last check-in time

**Platform-Specific Log Verification**

**Android**
- Check OMADM log for SyncML entries containing:
  - `CertificateStore/Root/{GUID}/EncodedCertificate`
  - `CertificateStore/Enroll/ModelName=AC_51...`
  - `NDESUrls` with NDES server URL

**iOS/iPadOS**
- Debug log entries with:
  - `Adding dependent ModelName=AC_51bad41f.../LogicalName_...`
  - `PayloadDependencyDomainCertificate`

**Windows**
- Event Viewer → DeviceManagement-Enterprise-Diagnostic-Provider → Admin
- **Event ID 306**: SCEP CspExecute entry
- Error code `0x2ab0003` = `DM_S_ACCEPTED_FOR_PROCESSING` (success)
- Non-successful codes indicate underlying problem

### Phase 5: Troubleshoot Scep Certificate Profiles
> 来源: MS Learn — [mslearn-troubleshoot-scep-certificate-profiles.md](../drafts/mslearn-troubleshoot-scep-certificate-profiles.md)

**SCEP Certificate Troubleshooting Overview**
**SCEP Communication Flow (6 Steps)**
1. **Deploy SCEP certificate profile** → Intune generates challenge string
2. **Device to NDES** → Device uses URI from profile to contact NDES server
3. **NDES to Policy Module** → NDES forwards challenge to Intune Certificate Connector policy module for validation
4. **NDES to CA** → NDES passes valid requests to Certification Authority
5. **Certificate delivery** → Certificate delivered to device

**Prerequisites**
- Root certificate deployed through trusted certificate profile
- Applies to Android, iOS/iPadOS, Windows (macOS info not available)

**Key Log Locations**

**Infrastructure (NDES Server)**
- **Intune Connector Logs**: Event Viewer → Applications and Services Logs → Microsoft → Intune → CertificateConnectors → Admin/Operational
- **IIS Logs**: `c:\inetpub\logs\LogFiles\W3SVC1`

**Android**
- BYOD (work profile): `OMADM.log`
- COPE/COBO/COSU: `CloudExtension.log`
- Enable Verbose Logging before collecting

**iOS/iPadOS**
- Console app on Mac → Include Info Messages + Debug Messages
- Company Portal log does NOT contain SCEP info

**Windows**
- Event Viewer → Applications and Services Logs → Microsoft → Windows → DeviceManagement-Enterprise-Diagnostics-Provider

**Related Troubleshooting Articles**
- SCEP profile deployment (Step 1)
- Device to NDES communication (Step 2)
- NDES to policy module (Step 3)
- NDES to CA (Step 4)
- Certificate delivery (Step 5)
... (详见原始草稿)

### Phase 6: Kusto 诊断查询

#### certificate.md
`[工具: Kusto skill — certificate.md]`

```kql
DeviceManagementProvider
| where env_time > ago(7d)
| where ActivityId contains '{deviceId}'
| where * contains "scep" or * contains "pkcs" or * contains "certificate"
| project env_time, accountId, userId, DeviceID=ActivityId, PolicyName=name, 
    PolicyType=typeAndCategory, Applicability=applicablilityState, 
    Compliance=reportComplianceState, EventMessage, message, TaskName
```

```kql
IntuneEvent
| where env_time > ago(3h)
| where DeviceId == '{deviceId}' or ActivityId == '{deviceId}'
| where * contains "scep"
| project env_time, ComponentName, DeviceId, Message, EventUniqueName, 
    ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, ActivityId
```

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

```kql
DeviceManagementProvider
| where env_time > ago(7d)
| where ActivityId == '{deviceId}' or userId == '{userId}'
| where message contains '{thumbprint}'
| project env_time, deviceId, ActivityId, message, EventId, userId, TaskName
| order by env_time
```

```kql
DeviceManagementProvider
| where env_time > ago(1d)
| where ActivityId contains '{deviceId}'
| where message contains "dependent profile"
| project env_time, ActivityId, cV, message
```

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


---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Windows device Intune sync fails with 'The sync could not be initiated' error after device has be... | The Microsoft Intune MDM certificate (Local Machine > Personal > Certificates... | Method 1 (with data loss): Disconnect work/school account via Settings > Accounts > Access work o... | 🟢 9.0 | OneNote |
| 2 | Windows Update scan fails with USO error 0x87c52200 (certificate error) during MoUpdateOrchestrat... | SSL/TLS inspection device replaces certificate for settings-win.data.microsof... | Exclude settings-win.data.microsoft.com from SSL inspection on proxy/firewall; verify certificate... | 🟢 9.0 | OneNote |
| 3 | iOS enrollment fails with APNSCertificateNotValid or AccountNotOnboarded error. Device cannot com... | APNs certificate was not properly configured (steps incomplete) or has expire... | 1. Check APNs cert expiry in Intune admin center. 2. RENEW (not replace) the APNs certificate - r... | 🟢 9.0 | OneNote |
| 4 | Newer Android devices (IQOO 15, Xiaomi 17, OPPO Reno14) cannot sign in to Outlook when Intune man... | ADFS server (behind Alibaba NLB) returns only the leaf certificate without th... | Fix the ADFS/NLB configuration to return the full certificate chain (leaf + intermediate certific... | 🟢 9.0 | OneNote |
| 5 | macOS LOB app (.pkg) fails to install via Intune. App shows NotInstalled in Kusto. Running .pkg l... | The .pkg file was not built as a distribution archive using productbuild. App... | 1. Build component package: pkgbuild --root <payload> --scripts <scripts> --version <version> --i... | 🟢 9.0 | OneNote |
| 6 | Cloud PKI SCEP 证书下发失败，设备无法访问 SCEP URI（*.manage.microsoft.com 被防火墙/代理拦截） | 客户防火墙或代理规则未放行 *.manage.microsoft.com，导致设备无法到达 Cloud PKI SCEP 端点 | 1. 在防火墙/代理中允许 *.manage.microsoft.com；2. 用浏览器测试 SCEP URI：追加 /?operation=GetCACaps 确认可达；3. 追加 /Cert... | 🟢 8.5 | ADO Wiki |
| 7 | 创建 Cloud PKI Issuing CA 时无法添加 Root CA 上未定义的 EKU，或选择 Any Purpose EKU 报错 | Root CA 的 EKU 是 Issuing CA 的超集限制，Issuing CA 只能选择 Root CA 已有的 EKU；Any Purpose ... | 1. 创建 Root CA 前规划好所有需要的 EKU（Root CA 创建后无法修改）；2. 不要使用 Any Purpose EKU；3. 如需添加新 EKU 只能重新创建 Root CA ... | 🟢 8.5 | ADO Wiki |
| 8 | Cloud PKI CA 创建失败，提示已达 6 个 CA 服务器上限 | 每个 Intune 租户最多 6 个 Cloud PKI CA 服务器（含 Root + Issuing + BYOCA 的任意组合） | 1. 规划 CA 层级在 6 台限制内（如 1 Root + 5 Issuing，或 2 Root + 2 Issuing 各）；2. 自 2407 起可删除不用的 CA：先 Pause → R... | 🟢 8.5 | ADO Wiki |
| 9 | SCEP/PKCS profile 部署报错，但未检查 Trusted Root profile 是否同时下发 | SCEP/PKCS profile 依赖 Trusted Root certificate profile 作为前置条件，如果 Trusted Root ... | 1. 确认 Trusted Root certificate profile 已部署到目标设备；2. 用 Kusto 查询 DeviceManagementProvider 同时过滤 Clien... | 🟢 8.5 | ADO Wiki |
| 10 | SCEP certificate deployment fails; IIS logs show only GetCACert request but no GetCACaps or PKIOp... | Certificate chain issue - device does not trust the NDES server certificate o... | Verify the trusted root certificate profile is deployed to device. Check IIS SSL binding certific... | 🟢 8.5 | ADO Wiki |
| 11 | Android Enterprise personally-owned work profile 部署 Trusted Certificate profile 时报错 -2016281112 (... | Trusted Certificate profile 中部署了非 Root 或非 Intermediate 证书。Intune 的 Trusted Ce... | 确保 Trusted Certificate profile 仅包含 root 或 intermediate 证书。移除非 root/intermediate 证书，重新部署。参考 Intune... | 🟢 8.5 | ADO Wiki |
| 12 | WHFB PIN sign-in fails with The request is not supported, DC System log Event ID 19/29 KDC cannot... | DC missing certificate with Kerberos Authentication EKU, or old certificate s... | 1) Verify 2016 DC has Kerberos Auth EKU cert 2) Import new cert to AD DS store and restart DC if ... | 🟢 8.5 | ADO Wiki |
| 13 | WHFB PIN sign-in fails with KDC certificate could not be validated, System Event ID 9 Kerberos | DC certificate chain validation failure (CRL revocation check or root trust i... | 1) Export DC cert as .cer 2) certutil -verify -urlfetch 3) Fix PKI CRL/root cert issues 4) Verify... | 🟢 8.5 | ADO Wiki |
| 14 | EPM automatic elevation rule Match=False for target file — elevation does not occur despite polic... | Certificate payload in the elevation rule does not match the actual certifica... | Check EpmServiceLogs (EpmService_YYYYMMDD_0.log) for 'Match=False;Message=' entries. The Message ... | 🟢 8.5 | ADO Wiki |
| 15 | macOS enrollment fails with HTTP 404 error during management profile installation. Device log sho... | Intune service Node issue (PG confirmed via ICM 388482221/473790930). During ... | 1. PG confirmed Node issue - escalate via ICM. 2. Verify enrollment service works: Kusto IOSEnrol... | 🟢 8.0 | OneNote |
| 16 | Cannot save corporate data in WIP-allowed apps (Word, Excel) on Hybrid Azure AD joined or co-mana... | The Encrypting File System (EFS) Data Recovery Agent (DRA) certificate in the... | 1) Export old DRA certificate and private key for decrypting existing files. 2) Create and verify... | 🔵 7.5 | MS Learn |
| 17 | Windows enrollment fails with error 0x8007064c The machine is already enrolled. Device was previo... | Previous enrollment certificate (Sc_Online_Issuing) and registry key HKLM SOF... | Delete the Intune cert issued by Sc_Online_Issuing from Local Computer Personal Certificates. Del... | 🔵 7.5 | MS Learn |
| 18 | There are advantages and disadvantages based on how a device is enrolled and seen in Intune. Whet... | There are a couple methods of enrolling a device in Intune. Computers running... | See the capability comparison chart: Windows PC management (Desktop) capabilities vs Mobile Devic... | 🔵 7.0 | ContentIdea KB |
| 19 | When trying to enroll and configure Windows phones into IBM MaaS360 Mobile Device Management, use... | This can occur if the Company Hub Certificate has expired. | To resolve this problem, renew the Company Hub Certificate by following the steps in this article... | 🔵 7.0 | ContentIdea KB |
| 20 | When adding or updating APN cert getting error Please specify an Apple ID in the format alias@dom... | Invalid character in the Apple ID used during cert upload | Ensure valid email format. Email is validated against regex. Use any valid format email since the... | 🔵 7.0 | ContentIdea KB |
| 21 | Android only (iOS and Windows still working) devices are not able to login to Company Portal, Out... | The Azure AD Connect process for Device Write back is not configured or is co... | Disable and Re-enable Device WritebackReference Article: https://docs.microsoft.com/en-us/azure/a... | 🔵 7.0 | ContentIdea KB |
| 22 |  | The error occurs when the Company Portal app checks our certificates on ADFS ... | Import the certs up the chain into the intermediate store on the ADFS Proxy Servers. So, launch t... | 🔵 7.0 | ContentIdea KB |
| 23 | When attempting to enroll a device in Intune, the device hangs at Checking Compliance. When the h... | This can occur due to various conditions. See the steps below for information... | 1. Have the customer cancel any enrollment in progress, then terminate the Company Portal app and... | 🔵 7.0 | ContentIdea KB |
| 24 | An end-user device is blocked by the Intune on-premises Exchange connector, however the condition... | The CAS that the Intune on-premises Exchange connector is pointing to has a c... | Navigate to the EWS URL of the CAS the Intune Exchange connector points to and verify certificate... | 🔵 7.0 | ContentIdea KB |
| 25 | When trying to deploy a PFX certificate to an iPhone enrolled into Intune; the trusted root certi... | The following error is seen in the connector logs: IssuePfx - The submission ... | Ensure that the machine account has access to the certificate template on the CA. | 🔵 7.0 | ContentIdea KB |
| 26 | When the customer has to update the certificate for the Cisco ISE App Registration in portal.azur... |  | &nbsp; &nbsp; a. Open the Azure Active Directory Blade and then open &quot;App Registration&quot;... | 🔵 7.0 | ContentIdea KB |
| 27 | Customer configures a Wi-Fi profile in the Azure Intune portal for Android devices. The Wi-Fi pro... | Wi-Fi profiles using certificates are not coming down to Android devices with... | Issue has been resolved | 🔵 7.0 | ContentIdea KB |
| 28 | When attempting to enroll a Windows computer using the Intune PC client software, the enrollment ... | This can occur if the PC client package being used is out of date. | To resolve this problem, download a new copy of the Intune PC client agent installer and try the ... | 🔵 7.0 | ContentIdea KB |
| 29 | When attempting to enroll a Windows computer using the Intune PC client software, the enrollment ... | This can occur if the certificate trust chain is broken due to a missing or e... | <Customer Facing Steps>Download a new enrollment package from the Admin Console at admin.manage.m... | 🔵 7.0 | ContentIdea KB |
| 30 | At the beginning of February, Microsoft publicly released the information that most of the custom... | This issue was encountered because the Keys mentioned in the documentation ar... | I managed to pre-configure the Outlook email profile settings by using the Keys from the below ta... | 🔵 7.0 | ContentIdea KB |
| 31 | This article only apples if the Enrollment profile is set to "Select where users must authenticat... | This has multiple causes: Username or password is actually wrong (typo) The u... | If using Azure AD MFA, the preferred solution would be D.2Solution A: Enter the correct informati... | 🔵 7.0 | ContentIdea KB |
| 32 | When attempting to enroll a MacOS device in Intune, the enrollment fails with error: Your Mac can... | This can occur if there are stale or corrupt Keychain entries related to Intu... | Make sure the user is a local administrator. Open Keychain Access, search for Microsoft, delete s... | 🔵 7.0 | ContentIdea KB |
| 33 | After setting up the Intune NDES connector, NDESConnectorUI shows a status of Connected and the d... | This can occur when the &quot;Sign In&quot; process cannot complete. For exam... | This can occur if you have &quot;Internet Explorer Enhanced Security Configuration&quot; (commonl... | 🔵 7.0 | ContentIdea KB |
| 34 | When trying to enroll a IOS device into Intune service you get the following error message Could ... | This caused by a problem with the Apple push notification certificate. If you... | To resolve the issue fix the issue with the Apple Push notification. In my customer case we remov... | 🔵 7.0 | ContentIdea KB |
| 35 | Android Devices get Missing Certificate when they try to enroll | This usually happens when they use ADFS and the intermediate certificate is n... | Follow these steps to have the Certificates install.                                   1. On the ... | 🔵 7.0 | ContentIdea KB |
| 36 | Error during sign in to Company Portal - &quot;Could not sign in. You will need to sign in again.... | The Intune Company Portal app only supports Forms Based Authentication | This error is occurring because the ADFS server is asking for a certificate-based authentication ... | 🔵 7.0 | ContentIdea KB |
| 37 | macOS devices are unexpectedly unenrolled from Microsoft Intune service or enrollment fails | MDM agent mishandles failed MDM certificate installations. When the MDM agent... | Re-enroll the affected macOS device. | 🔵 6.5 | MS Learn |
| 38 | iOS SCEP enrollment fails - IIS logs show good GetCACerts (200) but no GetCACaps request generate... | Trusted Root certificate profile in Intune uses a different cert than NDES se... | Reissue new Root and Intermediate certificates with supported signature algorithm (e.g. SHA256RSA... | 🔵 6.5 | MS Learn |
| 39 | Co-management: Hybrid AAD join fails 0x801c03f2. Public key user certificate not found. | UserCertificate attribute missing or not synced to Azure AD. | dsregcmd /leave, delete MS-Organization-Access cert, restart, verify cert on AD object, delta sync. | 🔵 6.5 | MS Learn |
| 40 | Email profile: Users repeatedly prompted for password. | Certificate profiles not assigned to same group type as email profile. | Assign all cert profiles to same group type (user or device) consistently. | 🔵 6.5 | MS Learn |
| 41 | Android device cannot sign in to Company Portal: missing required certificate. ADFS intermediate ... | ADFS server does not include intermediate certificates in SSL Server hello re... | Sol 1: User installs missing cert. Sol 2: Import intermediate certs into ADFS Personal cert store... | 🔵 6.5 | MS Learn |
| 42 | Intune client connectivity issues: devices cannot access Intune infrastructure, receive updates/p... | Automatic root certificate update mechanism disabled and Baltimore CyberTrust... | Install latest root certificates from Microsoft Update Catalog (search 'root update'); install on... | 🔵 5.5 | MS Learn |
| 43 | macOS enrollment fails with keychain error -25244 (errSecInvalidOwnerEdit); Company Portal logs s... | Stale or corrupted keychain entries related to Intune enrollment (workplace j... | Open Keychain Access as local admin; delete all 'workplace' keys; delete specific Microsoft/Compa... | 🔵 5.5 | MS Learn |
