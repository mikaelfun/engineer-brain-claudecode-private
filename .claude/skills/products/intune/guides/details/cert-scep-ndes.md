# Intune SCEP / NDES 证书部署与排查 — 综合排查指南

**条目数**: 62 | **草稿融合数**: 15 | **Kusto 查询融合**: 1
**来源草稿**: ado-wiki-Kusto-SCEP-PKCS-Troubleshooting.md, ado-wiki-NDES-SCEP-Overview.md, ado-wiki-SCEP-Android-Troubleshooting.md, ado-wiki-SCEP-Apple-Troubleshooting.md, ado-wiki-SCEP-Windows-Troubleshooting.md, onenote-SCEP-NDES-Workflow.md, onenote-macos-scep-renewal-kusto.md, onenote-ndes-scep-configuration-guide.md, onenote-ndes-scep-configuration.md, onenote-ndes-scep-lab-setup.md
**Kusto 引用**: certificate.md
**生成日期**: 2026-04-07

---

## ⚠️ 已知矛盾 (85 条)

- **solution_conflict** (high): intune-ado-wiki-248 vs intune-contentidea-kb-133 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **solution_conflict** (high): intune-ado-wiki-248 vs intune-contentidea-kb-370 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **solution_conflict** (high): intune-ado-wiki-248 vs intune-contentidea-kb-528 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **solution_conflict** (high): intune-ado-wiki-250 vs intune-contentidea-kb-240 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **solution_conflict** (high): intune-ado-wiki-250 vs intune-contentidea-kb-354 — context_dependent: 不同来源给出不同方案，可能适用不同场景

## 排查流程

### Phase 1: Kusto Scep Pkcs Troubleshooting
> 来源: ADO Wiki — [ado-wiki-Kusto-SCEP-PKCS-Troubleshooting.md](../drafts/ado-wiki-Kusto-SCEP-PKCS-Troubleshooting.md)

**Kusto Queries for SCEP & PKCS Troubleshooting**
**1. Check Intune Certificate Connector Version**
```kusto
```
**2. Profile Deployment Status**
**Option A: HighLevelCheckin**
```kusto
```
**Option B: DeviceManagementProvider**
```kusto
```
**3. Policy Assignment & Intent Validation (Cross-cluster)**
**4. Android Fully Managed/Dedicated (No DMP data)**
```kusto
```
**5. Transaction ID Deep Dive**
```kusto
```
- Col3: EKU details from SCEP config
- Col4: Certificate thumbprint

**6. SCEP Events by Device ID (without Transaction ID)**
```kusto
```

**7. Verify & Notify Requests (Account-wide)**
```kusto
```

**8. Mac Devices Approaching SCEP Cert Expiry**
```kusto
```

**9. Android Fully Managed SCEP Deployment**
```kusto
```

**10. SN/SAN Resolution Validation**

**Step 1: Check dynamic values before resolution**
```kusto
```

**Step 2: Check resolution errors by cV**
```kusto
```

**Key Notes**
- Always verify Trusted Root profile is also targeted when SCEP/PKCS fails
- Multiple connectors: check ConnectorID to identify which server handles the request
- VPN/WiFi profile dependencies may affect certificate delivery if targeting differs

### Phase 2: Ndes Scep Overview
> 来源: ADO Wiki — [ado-wiki-NDES-SCEP-Overview.md](../drafts/ado-wiki-NDES-SCEP-Overview.md)

**About NDES and SCEP**
**Overview**
- **SCEP** (Simple Certificate Enrollment Protocol) — deploys authentication certificates to devices for VPN/Wi-Fi/app access.
- **NDES** (Network Device Enrollment Service) — on-premises server that requests certificates from CA on behalf of devices.
- **Microsoft Intune Certificate Connector** — bridges NDES and Intune service.

**Architecture Flow**
1. SCEP policy sent to device
2. Device requests GetCACert and GetCACaps from NDES URL
3. Device generates keypair, sends CSR with challenge password
4. MSCEP-RA certs encrypt/sign the request
5. Certificate Connector validates CSR with Intune service

**Configuration Resources**
- [Configure NDES for SCEP](https://learn.microsoft.com/en-us/mem/intune/protect/certificates-scep-configure)
- [Configure SCEP profile](https://learn.microsoft.com/en-us/mem/intune/protect/certificates-profile-scep)

**Scoping Questions**
- What profiles are being pushed? Sub CA involved?
- What platform? (Android, iOS, Windows, macOS)
- Enrollment type?
- How many devices affected?
- Fresh NDES setup or existing? When did it stop working?
- Are Root and SCEP profiles targeted to same groups?
- Profile status in portal? (Failed, Pending, Succeeded)
- Intune device ID and affected UPN?
- Profile names (Trusted cert and SCEP)?
- Company Portal logs from affected device?
... (详见原始草稿)

### Phase 3: Scep Android Troubleshooting
> 来源: ADO Wiki — [ado-wiki-SCEP-Android-Troubleshooting.md](../drafts/ado-wiki-SCEP-Android-Troubleshooting.md)

**Android SCEP Certificate Troubleshooting**
**1. Android Personally Owned Work Profile (BYOD)**
**Logs to Collect**
- Microsoft Intune Connector Logs: Event Viewer > Application and Services Logs > Microsoft > Intune > Certificate Connectors > Admin/Operational
- IIS Logs: `%SystemDrive%\inetpub\logs\LogFiles\W3SVC1\`
- Company Portal OMADM logs: Company Portal > Menu > Settings > Verbose Logging ON > Menu > Help > Send logs

**SCEP Deployment Steps (BYOD)**
- Must deploy Trusted Root + Intermediate certificates
- Android requires intermediates (see Google docs: Missing intermediate certificate authority)
- IMPORTANT: Trusted Certificate profile only supports root or intermediate certs. Non-root/intermediate → error `-2016281112 (Remediation failed)`
- Verify in OMADM log: search "IsInstalled" for thumbprints, "state changed from" for CERT_INSTALL_SUCCESS
```kusto
```
- OMADM log keywords: "Trying to enroll pending SCEP certificates for user", "Trying to enroll certificate request"
- Validate policyID via "LogicalName_{policyID}" (underscores in logs, dashes in Assist365)
- OMADM log keywords: "Sending GetCACaps(ca)", "Sending GetCACert(ca)"
- IIS log keywords: "GetCACert&message=ca", "GetCACaps&message=ca" (Android entries show as "Dalvik")
- Expect HTTP 200 status code
- If non-200: navigate to SCEP Server URL in browser → expected result: HTTP Error 403.0 Forbidden
- Connector Operational log: Event ID 4003 - ScepRequestReceived
- Connector Operational log: Event ID 4004 - ScepVerifySuccess
- Connector Operational log: Event ID 4006 - ScepIssuedSuccess
- OMADM log keywords: "pkiStatus=SUCCESS", "CERT_ACCESS_GRANTED"
- Kusto validation via IntuneEvent table, Col1: "Adding Cert value:"
- View cert on device: use X509 Certificate Viewer Tool (push via Managed Google Play)
- BYOD cert name format: User{Thumbprint}
... (详见原始草稿)

### Phase 4: Scep Apple Troubleshooting
> 来源: ADO Wiki — [ado-wiki-SCEP-Apple-Troubleshooting.md](../drafts/ado-wiki-SCEP-Apple-Troubleshooting.md)

**Apple SCEP Certificate Troubleshooting (iOS & macOS)**
**1. iOS Profiles**
**Logs to Collect**
- Intune Certificate Connector logs: Event Viewer > Application and Services Logs > Microsoft > Intune > Certificate Connectors > Admin/Operational
- IIS Logs: `%SystemDrive%\inetpub\logs\LogFiles\W3SVC1\`
- Company Portal logs do NOT contain certificate info for iOS
- Use Console logs (live capture during device sync):
  - Best: connect to macOS device for complete debug logs
  - Alternative: internal tool for Windows PC (limited)

**SCEP Deployment Steps (iOS)**
- iOS does NOT require full chain, but strongly recommended (especially for WiFi/Radius)
- Console log keyword: `'94 installed` for trusted cert thumbprints
- Root = `credentials`, Intermediate = `pkcs1credentials`
```kusto
```
- Console log keyword: "Beginning profile installation"
- Validate policyID: `LogicalName_{policyID}` (underscores in logs, dashes in Assist365)
- Console log keyword: "GetCACaps"
- IIS log: iOS entries show as "Darwin"
- Expect HTTP 200. If non-200: browse SCEP Server URL → expected: HTTP 403.0 Forbidden
- Connector: Event ID 4003 - ScepRequestReceived
- Connector: Event ID 4004 - ScepVerifySuccess
- Connector: Event ID 4006 - ScepIssuedSuccess
- Console log keyword: `'94 installed`
- View all profiles: keyword `Installed profiles`
- View cert on device: Settings > General > VPN & Device Management > Management Profile > More Details > SCEP DEVICE IDENTITY CERTIFICATES
... (详见原始草稿)

### Phase 5: Scep Windows Troubleshooting
> 来源: ADO Wiki — [ado-wiki-SCEP-Windows-Troubleshooting.md](../drafts/ado-wiki-SCEP-Windows-Troubleshooting.md)

**Windows SCEP Certificate Troubleshooting**
**Logs to Collect**
- Intune Certificate Connector logs: Event Viewer > Application and Services Logs > Microsoft > Intune > Certificate Connectors > Admin/Operational
- IIS Logs: `%SystemDrive%\inetpub\logs\LogFiles\W3SVC1\`
- Event Viewer: Application and Services > Microsoft > Windows > DeviceManagement-Enterprise-Diagnostics-Provider > Admin
- SyncMLViewer tool (real-time XML sync viewer): https://github.com/okieselbach/SyncMLViewer

**SCEP Deployment Steps**
- Windows does NOT require full chain but strongly recommended (WiFi/Radius)
- SyncML log keyword: "RootCATrustedCertificates" for thumbprints
- Root stored under `RootCATrustedCertificates/Root/`, Intermediate under `RootCATrustedCertificates/CA/`
- View on device: MMC > Certificates (Local Computer) > Trusted Root / Intermediate CAs
```kusto
```
- SyncML keyword: "ClientCertificateInstall" with full SCEP profile XML details
- Event Viewer keyword: Event 306 - "SCEP: CspExecute for UniqueId"
- Validate policyID: `LogicalName_{policyID}` (underscores in logs, dashes in Assist365)
- Event Viewer keyword: Event 36 - "SCEP: Certificate request generated successfully"
- IIS log: Windows entries show as "Mozilla/4.0+(compatible;+Win32;+NDES+client)"
- Expect HTTP 200. If non-200: browse SCEP Server URL → expected: HTTP 403.0 Forbidden
- Connector: Event ID 4003 - ScepRequestReceived
- Connector: Event ID 4004 - ScepVerifySuccess
- Connector: Event ID 4006 - ScepIssuedSuccess
- SyncML keyword: "ClientCertificateInstall...Enroll"
- Event Viewer keywords:
  - Event 39: "SCEP: Certificate installed successfully"
... (详见原始草稿)

### Phase 6: Scep Ndes Workflow
> 来源: OneNote — [onenote-SCEP-NDES-Workflow.md](../drafts/onenote-SCEP-NDES-Workflow.md)

**Intune SCEP/NDES Certificate Enrollment Workflow**
**Overview**
**Workflow Steps**
1. **Profile Creation & Assignment**: Admin creates a *SCEP certificate profile* and a *Trusted Certificate profile* in Intune console, assigns to device group.
   - Trusted Certificate profile delivers the actual root certificate
   - SCEP certificate profile tells the device *how* to request the certificate (not the certificate itself)
2. **Device Contacts NDES**: When device receives the SCEP profile, it contacts the NDES server on the customer's internal network (same PC with Intune Certificate Connector). Device locates NDES using the URI in the SCEP profile.
3. **Request Validation**: NDES Connector policy module (part of Intune Certificate Connector) validates the request is legitimate.
4. **Forward to CA**: If valid, NDES forwards the certificate request to the Certification Authority (CA).
5. **Certificate Issuance**: CA sends the SCEP certificate back to NDES, which forwards it to the requesting device. Device now has both:
   - Trusted root certificate
   - SCEP certificate
   - Together enabling certificate-based authentication to company resources

**Key Points for Troubleshooting**
- SCEP profile only contains enrollment instructions, not the certificate itself
- NDES server must be reachable from the device (check URI in SCEP profile)
- Connector policy module validates requests before forwarding to CA
- Both Trusted Root + SCEP profiles must be assigned to the same device group
- Check connector event logs if step 3 (validation) fails
- Check CA issued/failed certificates if step 4-5 fails

### Phase 7: Macos Scep Renewal Kusto
> 来源: OneNote — [onenote-macos-scep-renewal-kusto.md](../drafts/onenote-macos-scep-renewal-kusto.md)

**macOS SCEP Certificate Renewal Flow - Kusto Queries**
**Scenario**
**Kusto Queries**
**1. Verify SSL Client Certificate Authentication**
```kusto
```
**2. Track Certificate Renewal Events**
```kusto
```
**3. Track Certificate Issuance**
```kusto
```
**4. Verify Renewal Success**
```kusto
```
**Expected Renewal Flow**
1. Device connects with existing SSL client certificate (UDA cert)
2. `FabricAuthenticationModule` validates the certificate -> `UdaCertificateValidatedSuccessfully`
3. `CertificateAuthority` issues new certificate -> `IssueCertSuccess`
4. `EnrollmentSessionManager` processes SCEP renewal challenge -> `TryAddEnrollmentSessionStateDetails_WriteComplete`
5. `EnrollmentLibrary` confirms -> `DeviceRenewalSuccess`

**Key Fields**
- **CHALLENGETYPE**: `RenewalScep - 3` indicates renewal (not fresh enrollment)
- **ISRENEWAL**: `True` confirms this is a renewal flow
- **CURRENTCERTIFICATETHUMBPRINT**: The old cert being renewed
- **IssueCertSuccess Col4**: New certificate thumbprint

**Source**

### Phase 8: Ndes Scep Configuration Guide
> 来源: OneNote — [onenote-ndes-scep-configuration-guide.md](../drafts/onenote-ndes-scep-configuration-guide.md)

**NDES/SCEP Configuration Guide for Intune**
**Overview**
**1. NDES Service Account Setup**
1. Create a dedicated service account in AD (Active Directory Users and Computers)
2. Add the account to local group `IIS_IUSRS` on the NDES computer
3. Grant `Request Certificates` permission on the Enterprise CA Security tab
4. Set SPN: `setspn -s http/<NDES server computer name> <domain>\<NDES service account>`

**2. NDES Server Installation**
1. Add ADCS role via Server Manager → Add Roles and Features
2. Select Network Device Enrollment Service role
3. Post-installation: specify NDES service account and connect Enterprise CA
4. **CA and NDES must be on separate servers**

**3. NDES Server Configuration**

**IIS Configuration**
- Default Website → Request Filtering → Edit Feature Settings
- Set Maximum URL length and Maximum query string to accommodate large SCEP requests

**Registry Configuration**
- `HKLM\SYSTEM\CurrentControlSet\Services\HTTP\Parameters` - configure for large HTTP requests
- Without this, devices get: "Experiencing authentication issues" / "The portal is having issues getting authentication tokens"

**External Publishing**
- Publish NDES via Azure Application Proxy or Windows Application Proxy (WAP)
- Configure internal URL as NDES server FQDN
- Note the generated External URL for later use

**4. SSL Certificate Setup**
1. On Enterprise CA: duplicate `Web Server` template
2. Configure: client + server authentication under Extensions → Application Policies
3. Grant NDES server computer account Read + Enroll on Security tab
4. Subject Name tab: check "Supply in the request"
5. Issue the new template
... (详见原始草稿)

### Phase 9: Ndes Scep Configuration
> 来源: OneNote — [onenote-ndes-scep-configuration.md](../drafts/onenote-ndes-scep-configuration.md)

**NDES SCEP Configuration End-to-End Guide**
**Phase 1: NDES Server Installation**
**Service Account Setup**
1. Create AD service account in Active Directory Users and Computers
2. On NDES computer: add account to local **IIS_IUSRS** group (`compmgmt.msc`)
3. On Enterprise CA: add account with **Request Certificates** permission (Security tab)
4. Set SPN: `setspn -s http/<NDES-FQDN> <domain>\<service-account>`

**NDES Role Installation**
1. Server Manager → Add Roles and Features → AD CS → Network Device Enrollment Service
2. Post-install: Configure NDES → select service account → connect Enterprise CA
3. **CA and NDES must be on separate servers**

**Phase 2: NDES Server Configuration**

**IIS Long URL Support**
1. IIS Manager → Default Website → Request Filtering → Edit Feature Settings
   - If missing: `Install-WindowsFeature Web-Filtering`
2. Set Maximum URL length and Maximum query string to high values
3. Registry: `HKLM\SYSTEM\CurrentControlSet\Services\HTTP\Parameters` — edit URL/query limits

**Azure Application Proxy (for external access)**
1. Azure Portal → Enterprise Applications → Add → On-premises application
2. Internal URL = `https://<NDES-internal-FQDN>/certsrv/mscep/mscep.dll`
3. Note the generated External URL
4. **For 21v (Azure China)**: Install proxy agent with China cloud flag:
   ```cmd
   ```

**SSL Certificate**
1. On CA: duplicate **Web Server** template → name "NDES SSL certificate"
2. Extensions: include Client + Server Authentication
3. Security: NDES computer account → Read + Enroll
4. Subject Name: Supply in the request
5. On NDES: Request cert with CN = internal FQDN, SAN DNS = internal + external FQDN
... (详见原始草稿)

### Phase 10: Ndes Scep Lab Setup
> 来源: OneNote — [onenote-ndes-scep-lab-setup.md](../drafts/onenote-ndes-scep-lab-setup.md)

**NDES/SCEP Certificate Deployment Lab Setup Guide**
**Overview**
**Prerequisites**
1. **Hybrid Azure AD Join (HAADJ)** configured
2. **Intune** enrollment set up
3. **NDES Service Account**: Domain user account for running NDES service and requesting certs from CA
   - Create in AD DC (e.g., `NdesService@domain.com`)
4. **Users and Groups**: AD users synced to AAD, AAD group created, licenses assigned (users need location attribute)

**Step 1: Build and Configure CA**
1. Install CA on on-premises DC
   - Recommended: [Install CA (2016+)](https://learn.microsoft.com/en-us/windows-server/networking/core-network-guide/cncg/server-certs/install-the-certification-authority)
2. Configure CA for NDES per [Microsoft docs](https://learn.microsoft.com/en-us/mem/intune/protect/certificates-scep-configure#configure-the-certification-authority)
3. Create **SCEP Certificate Template** (for device certs — signing/encryption)
4. Create **Server Certificate Template** (optional, for IIS; can use 3rd-party cert instead)
5. Set certificate permissions for NDES service account
   ```cmd
   ```

**Step 2: Install and Configure NDES**
1. Set SPN for NDES service account:
   ```cmd
   ```
2. Add NDES role on the server
3. Install required IIS features (critical for Connector later):
   - See [Prerequisites](https://learn.microsoft.com/en-us/mem/intune/protect/certificate-connector-prerequisites#general-prerequisites)
4. Configure NDES service with the service account
5. Configure IIS bindings

**Step 3: Install Certificate Connector**
1. Download connector: https://go.microsoft.com/fwlink/?linkid=2168535
2. Install on NDES server
3. Connector UI path: `C:\Program Files\Microsoft Intune\PFXCertificateConnector\ConnectorUI\PFXCertificateConnectorUI.exe`
... (详见原始草稿)

### Phase 11: Scep Ndes Architecture
> 来源: OneNote — [onenote-scep-ndes-architecture.md](../drafts/onenote-scep-ndes-architecture.md)

**SCEP/NDES Architecture — How It Works**
**High-Level Workflow**
1. **Admin creates profiles**: A *SCEP certificate* profile and a *Trusted Certificate* profile are created in Intune and assigned to a device.
   - The Trusted Certificate profile delivers the actual root certificate
   - The SCEP certificate profile tells the device *how* to request the SCEP certificate (not the certificate itself)
2. **Device contacts NDES**: When the device receives the SCEP profile, it contacts the NDES server on the customer's internal network (same PC as the Intune Certificate Connector). The device finds the NDES server using the URI in the SCEP Certificate profile.
3. **Request validation**: The NDES Connector policy module (part of the Intune Certificate Connector) validates the request.
4. **Certificate request forwarding**: If valid, the NDES server forwards the certificate request to the Certification Authority (CA).
5. **Certificate delivery**: The CA sends the SCEP certificate back to the NDES server, which forwards it to the device. At this point the device has both:
   - The trusted root certificate
   - The SCEP certificate

**Key Points**
- NDES server and Intune Certificate Connector run on the **same machine**
- The SCEP URI in the profile must be reachable from the device
- Both Trusted Root CA and SCEP profiles must be deployed (Trusted Root first)
- Certificate-based auth requires both certs in the chain to be valid

### Phase 12: Scep Ndes Troubleshooting
> 来源: OneNote — [onenote-scep-ndes-troubleshooting.md](../drafts/onenote-scep-ndes-troubleshooting.md)

**Intune SCEP/NDES Certificate Troubleshooting Workflow**
**SCEP/NDES Architecture**
1. SCEP certificate profile + Trusted Certificate profile created in Intune, assigned to device
2. Device contacts NDES server (same PC as Microsoft Intune Certificate Connector) using URI in SCEP profile
3. NDES Connector policy module validates the request
4. NDES forwards valid request to Certification Authority (CA)
5. CA sends SCEP certificate back via NDES to device

**Connector Setup**
- Installed at: `C:\Program Files\Microsoft Intune\PFXCertificateConnector\ConnectorUI\PFXCertificateConnectorUI.exe`
- Must run as Admin
- Account used to sign in must have Intune admin permission AND Intune license
- NDES service account needs "Logon as a service" right
- .NET Framework 4.7.2 required

**Event Log Locations**
- **Connector logs**: Event Viewer > Application and Service Logs > Microsoft > Intune > Certificate Connectors
  - Admin: one log per request with final result
  - Operational: multiple logs per request with details
- **IIS logs**: `C:\inetpub\logs\LogFiles\W3SVC1\u_exlog`
- **Application log**: Event Viewer > Windows Logs > Application

**Event ID Ranges**

**Successful SCEP Flow (Event Log)**
1. **4003** - Successfully received SCEP request
2. **4006** - Successfully verified SCEP request
3. **4006** - Successfully issued for SCEP request
4. **4008** - Successfully notified SCEP request

**Kusto Query**
```kql
```

**Common Failure Scenarios**

**1. Connector Setup Failures**
- Missing admin privileges
... (详见原始草稿)

### Phase 13: Kusto 诊断查询

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
| 1 | NDES service stops issuing SCEP certificates after installing Windows Server update KB5014702 on ... | KB5014702 raises DCOM authentication level on the CA server (CVE-2021-26414 h... | Three options: 1) Install KB5014702 on the NDES server as well. 2) Uninstall KB5014702 from the C... | 🟢 9.0 | OneNote |
| 2 | NDES server stops issuing SCEP certificates and returns HTTP 500 error. Connector event log shows... | The root CA CRL (Certificate Revocation List) has expired. Even though NDES c... | 1. Check CRL status using PKIVIEW.msc on the CA jump server. 2. On the root CA, run 'certutil -cr... | 🟢 9.0 | OneNote |
| 3 | Intune NDES/SCEP connector fails to communicate with Intune service. Error: System.NotSupportedEx... | The Unified Intune Certificate Connector only supports proxy in URL format (h... | On NDES server, navigate to C:\Program Files\Microsoft Intune\PFXCertificateConnector\ConnectorUI... | 🟢 9.0 | OneNote |
| 4 | Windows clients fail to receive SCEP certificate. SCEP profile shows error -2016409340. NDES even... | The NDES service account password expired, causing RPC communication failure ... | Reset the NDES service account password. After password reset, SCEP certificates can be issued an... | 🟢 9.0 | OneNote |
| 5 | SCEP certificates cannot be issued to clients via NDES. Connector event log shows Event ID 2: 'Th... | TLS 1.2 is not enabled or properly configured in .NET Framework on the NDES s... | Enable TLS 1.2 on the NDES server: 1) Set registry keys HKLM\SOFTWARE\WOW6432Node\Microsoft\.NETF... | 🟢 9.0 | OneNote |
| 6 | Android Fully Managed/Dedicated 设备 SCEP 部署问题，DeviceManagementProvider 表无数据 | Android Fully Managed/Dedicated 设备不使用 DMP 表记录证书部署状态，需使用 IntuneEvent 表的 Androi... | 使用 IntuneEvent 查询 ApplicationName='AndroidSync' 和 ComponentName in ('StatelessAndroidSyncService'... | 🟢 8.5 | ADO Wiki |
| 7 | SCEP certificate deployment fails on iOS/macOS; certificate template has 'Signature is proof of o... | For iOS and macOS certificate templates, 'Signature is proof of origin' must ... | Edit the certificate template > Extensions tab > Key Usage > ensure 'Signature is proof of origin... | 🟢 8.5 | ADO Wiki |
| 8 | Certificate Connector installation fails or sign-in fails during NDES connector setup | Admin account used to sign into the connector does not have an Intune license... | Verify the Global Admin/Intune Admin account has an Intune license assigned before signing in. Fo... | 🟢 8.5 | ADO Wiki |
| 9 | SCEP requests fail; MaxFieldLength or MaxRequestBytes registry values not set correctly on NDES s... | HTTP parameters MaxFieldLength and MaxRequestBytes under HKLM\SYSTEM\CurrentC... | Set both MaxFieldLength and MaxRequestBytes to 65534 (DWORD, decimal) in registry. Also configure... | 🟢 8.5 | ADO Wiki |
| 10 | SCEP profile shows error; NDES URL not reachable (Can't reach this page / site can't be reached) | NDES URL misconfigured, NDES service not running, networking issues (firewall... | 1) Verify NDES URL spelling. 2) Check NDES service on server via https://localhost/certsrv/mscep/... | 🟢 8.5 | ADO Wiki |
| 11 | Intune SCEP certificate issuance fails with error: The revocation function was unable to check re... | Published Root CA CRL (.crl file) was expired. The CRL distribution point (CD... | 1) Untick Require SSL on the IIS site hosting the CRL distribution point; 2) Manually import/publ... | 🟢 8.5 | OneNote |
| 12 | iOS enrollment troubleshooting requires correlating Kusto data across DeviceLifecycle and IOSEnro... |  | Query DeviceLifecycle by userId to get scenarioType/ActivityId/managementState transitions, then ... | 🟢 8.0 | OneNote |
| 13 | Windows intermediate certificate deployment via Intune failed with error code 0x86000031. | Customer-side configuration issue. Resolved by Windows Engineering Escalation... | Engage Windows EE for investigation. Error 0x86000031 in certificate deployment is typically cust... | 🟢 8.0 | OneNote |
| 14 | Browsing NDES URL (https://<server>/certsrv/mscep/mscep.dll) shows certificate warning/insecure c... | IIS on the NDES server does not have a valid SSL certificate bound to the HTT... | Configure IIS SSL binding with a valid certificate: 1) Obtain trusted server certificate (from Di... | 🟢 8.0 | OneNote |
| 15 | Intune Certificate Connector installation or configuration fails on NDES server; connector setup ... | NDES server is missing required IIS role features that are prerequisites for ... | Install all required IIS prerequisites per Microsoft docs: https://learn.microsoft.com/en-us/mem/... | 🟢 8.0 | OneNote |
| 16 | NDES GetCACaps endpoint (mscep.dll?operation=GetCACaps) stops returning valid CA operations after... | IIS certificate binding was changed or lost after NDES reconfiguration. HTTPS... | 1) IIS Manager > Sites > Default Web Site > Bindings; 2) Verify HTTPS binding has valid cert; 3) ... | 🟢 8.0 | OneNote |
| 17 | SCEP certificate request fails on device with error 0x86000022. CspCreateInstance of Node fails d... | Error 0x86000022 indicates SCEP CSP instance creation failure on the device s... | Check device-side SCEP logs. Verify NDES URL is reachable from device. Ensure Trusted Root CA cer... | 🟢 8.0 | OneNote |
| 18 | SCEP certificate not delivered to devices. NDES URL returns HTTP 500 error. Event log shows RA ce... | Multiple compounding issues: (1) RA certificates were missing from NDES serve... | 1. Check RA certificates in NDES server cert store - if missing, reinstall NDES Role using Domain... | 🔵 7.5 | OneNote |
| 19 | SCEP certificates not delivered to devices despite NDES server and connector working. No /certsrv... | SCEP profile URL incorrectly configured in Intune. Devices never sent certifi... | Verify and correct SCEP profile URL in Intune to https://<NDES-FQDN>/certsrv/mscep/mscep.dll. Aft... | 🔵 7.5 | OneNote |
| 20 | NDES cannot process SCEP certificate requests; no SCEP requests appear in event logs; NDES extern... | IIS related service on the NDES server was stopped. | Restart the IIS related services on the NDES server. Verify NDES service URLs are accessible afte... | 🔵 7.5 | OneNote |
| 21 | SCEP certificate profile fails to install on some iOS devices despite root CA and intermediate ce... | Device has an old root CA certificate from a previous MDM installation, likel... | 1) On device: Settings > General > About > Certificate Trust Settings, disable the old root CA ce... | 🔵 7.5 | OneNote |
| 22 | NDES Connector related services (Intune Connector Service, PFX Certificate Connector) are stopped... | The service account configured for NDES/Intune Connector services is not gran... | Open Local Security Policy (secpol.msc) > Local Policies > User Rights Assignment > 'Log on as a ... | 🔵 7.5 | OneNote |
| 23 | NDES/SCEP certificate deployment fails or encounters security issues when NDES role is installed ... | Installing NDES on the same server as the issuing CA is an unsupported config... | Install NDES server role and Intune Certificate Connector on a dedicated, separate server from th... | 🔵 7.5 | OneNote |
| 24 | Intune Certificate Connector installation fails or does not complete properly; connector setup wi... | IntuneCertificateConnector.exe requires elevated (administrator) privileges t... | Right-click IntuneCertificateConnector.exe and select 'Run as administrator' before starting the ... | 🔵 7.5 | OneNote |
| 25 | After assigning a SCEP profile to a Windows 10 computer, if the device is unenrolled then the cer... | This is by design as of Windows 1809. The certificate is not removed when the... | This behavior is expected in 1809 but was scheduled to be addressed in a future release where the... | 🔵 7.0 | ContentIdea KB |
| 26 | All devices fail to receive a SCEP certificate profile. You will also find the following authenti... | These errors indicate that something is blocking the long URL (Challenge stin... | First, verify that the NDES server is properly configured to accept long URLs per the setup requi... | 🔵 7.0 | ContentIdea KB |
| 27 | When validating a NDES configuration, running NDESLongURLValidator seems to hang at Step 3 (NDESL... | This problem can occur if there is a Windows Application Proxy (WAP) between ... | To resolve this problem, install the December 2014 update rollup or the update in KB3011135 on th... | 🔵 7.0 | ContentIdea KB |
| 28 | Customer configures Azure AD Application Proxy to protect NDES when deploying SCEP certificates t... | Customer had this format listed as the external URL: https://FQDN.com/certsrv... | Delete the existing application from Azure and create a new app with the correct FQDN name in the... | 🔵 7.0 | ContentIdea KB |
| 29 | Unable to deliver SCEP certificates to some devices.Error: <insert error message and log file> | Old SCEP urls were not deleted from Intune when they were deleted from SCCM, ... | Solution:Complete the following steps in the SCCM database to sync the Ndes URLs between SCCM & I... | 🔵 7.0 | ContentIdea KB |
| 30 | SCEP requests for mobile devices stop at "Sending request to certificate registration point." in ... | NDES policy module is using a thumbprint from an expired client authenticatio... | 1) In regedit go to HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Cryptography\MSCEP\Modules\NDESPolicy. ... | 🔵 7.0 | ContentIdea KB |
| 31 | When issuing a SCEP Certificate to a Device Group, with the intent of the certificate authenticat... | Intune Standalone cannot issue Device-Type certificates. | This is considered by-design. As of now, Intune Standalone cannot issue certificates to devices i... | 🔵 7.0 | ContentIdea KB |
| 32 | Customer is trying to deploy a SCEP certificate to iOS and Android devices via an Email profile. ... | Looked up IIS status code 500.19 from IIS logs on the following website:   &n... | Grant Read permissions to the account accessing the Web.config file per   https://support.microso... | 🔵 7.0 | ContentIdea KB |
| 33 | Users report that �Per APP VPN� doesn�t work anymore on iOS devices because the certificates have... | This occurs because the certificates fail to automatically renew. In my case ... | The workaround is to create a new SCEP profile and accompanying VPN/Wifi profile.  Once complianc... | 🔵 7.0 | ContentIdea KB |
| 34 | This article describes a procedure to fix issues when MSCEP-RA expires. When you try to access th... | One of the following could be causing the described error: -The MSCEP-RA cert... | 1.- Checking Permissions on Managed Key On the NDES server, on the certificate that we created, p... | 🔵 7.0 | ContentIdea KB |
| 35 | IIS SCEP App Pool Crashing On Incoming Request.  The NDES Server Application Event Log will show ... | IIS permissions on the  �CertificateRegistrationSvc� application has  � Windo... | Enabled  �Anonymous Authentication� and Disabled �Windows Authentication� | 🔵 7.0 | ContentIdea KB |
| 36 | When installing the Microsoft Intune Connector  you saw the following errors: Microsoft Intune Co... | The Microsoft Intune Connector Setup can't create  log name 'Microsoft Intune... | Delete, the other Event Log entry that contains "Microsoft", | 🔵 7.0 | ContentIdea KB |
| 37 | IT Administrator has a SCEP, Wifi, and VPN Profiles deployed for iOS.&nbsp; On the iOS Device you... | The behavior is By Design. |  | 🔵 7.0 | ContentIdea KB |
| 38 | Continuous Issuance of SCEP Certificates to iOS Devices Every Few Minutes Over and Over.&nbsp;&nb... | &quot;Enable VPN On-Demand&quot; is enabled on the &quot;Automatic VPN&quot;&... | - Don�t use �Enable VPN on-demand� section for VPN profile deployments to iOS, as this setting is... | 🔵 7.0 | ContentIdea KB |
| 39 | Incoming SCEP Requests Show HTTP 500 Errors in IIS on the NDES Server,IIS Log will show an entry ... | The IIS_IURS group is missing from the &quot;Impersonate a client after authe... | Add the IIS_IURS group to Security Settings -->Local Policies --> User Rights Assignment -->Imper... | 🔵 7.0 | ContentIdea KB |
| 40 | SCEP Certificates are not being issued  IIS logs:  2017-12-04 08:43:09 10.13.33.233 POST /CMCerti... | Client authentication certificate that was used during ndesconnector installa... | Re-install policy module or ndesconnector with a new, valid client authentication certificate    ... | 🔵 7.0 | ContentIdea KB |
| 41 | SCEP Certificates are not being deployed to devices and the logs look like below:     In standalo... | In SA scenario: the crl is not reachable from the ndes serverIn hybrid scenar... | Enable IIS to download the CRL. To do this, follow these steps:    Delete any duplicate client ce... | 🔵 7.0 | ContentIdea KB |
| 42 | After deploying a SCEP profile, devices do not receive a certificate and the NDESPlugin log will ... | This can occur if the IP Address field in IIS is bound to an actual IP addres... | To resolve this problem, in IIS under Bindings, select HTTPS -> Edit and set IP address to "All u... | 🔵 7.0 | ContentIdea KB |
| 43 | User is unable to enroll a Mac into Intune. Each time the login is successful and prompts to inst... | Customer made changes to firewall/proxy settings that prevented the enrollmen... | Customer disabled the proxy and the device was able to enroll. | 🔵 7.0 | ContentIdea KB |
| 44 | After installing or updating the NDES connector, you may notice that many files get stuck in the ... | This can occur if the Intune Connector Service is either stopped or no longer... | To resolve this problem restart the Intune Connector Service and make sure it continues to run. T... | 🔵 7.0 | ContentIdea KB |
| 45 | Attempting to install ndesconnector.exe on a server using a V2 certificate fails with Microsoft I... | This can occur if the Default Web Site name has been changed to something els... | Change the site name back to the default which is Default Web Site. | 🔵 7.0 | ContentIdea KB |
| 46 | Consider the following scenario:The NDES connector and server are running normally and the SCEP U... | This can occur if the certificate uploaded to the Trusted Root (TR) profile i... | To resolve this problem, upload the current Trusted Root certificate from the CA to the Trusted R... | 🔵 7.0 | ContentIdea KB |
| 47 | The SCEP certificate request fails during the verification phase in the Certificate registration ... | This can occur if the registry keys responsible for verification of the certi... | We have identified two solutions to fix this certificate request verification issue.Solution 1:- ... | 🔵 7.0 | ContentIdea KB |
| 48 | IIS logs shows 400 error (bad request) when mobile device contacts the NDES server. | Handler Mappings in IIS are in the incorrect order | To fix this do the following 1) Open IIS 2) Select �Default Web Site� 3) Click �View Applications... | 🔵 7.0 | ContentIdea KB |
| 49 | When reading Mac console logs the 3rd SCEP request shows a 414 response error. | The 414 error is request size too big. This can happen if there are extra ina... | Check the Intune Admin console under Intune -> Device configuration -> Certification Authority an... | 🔵 7.0 | ContentIdea KB |
| 50 | The Intune Connector Service (NDESConnectorSvc) fails to start and you see one or more of the mes... | This can occur if the NDES computer cannot reach the Certificate Revocation L... | Engage the Certificate Authority team to assist in investigating and resolving the underlying CRL... | 🔵 7.0 | ContentIdea KB |
| 51 | Devices are unable to obtain certificates from the NDES server and the following errors are logge... | This can occur if the name of the template on the NDES computer does not matc... | To resolve this issue, verify that the values in the following registry map to the certificate te... | 🔵 7.0 | ContentIdea KB |
| 52 | SCEP certificate enrollment fails. Testing external NDES URL returns BadGateway error. Internal N... | Azure AD Application Proxy is misconfigured. When multiple web application pr... | Create an Application Proxy group in Azure AD > Application Proxy. Modify the NDES enterprise app... | 🔵 7.0 | OneNote |
| 53 | Personal Windows device users are unexpectedly enrolled in Intune MDM when adding a work or schoo... | When a work/school account is added to a personal Windows device, Windows dis... | Enable the 'Disable MDM enrollment when adding work or school account on Windows' setting in Intu... | 🔵 6.5 | ADO Wiki |
| 54 | Cannot assign SCEP certificates to devices after certificate renewal - NDESPlugin.log stops at 'S... | NDES policy module still uses the thumbprint from an expired client authentic... | On NDES server: find expired client auth cert in certlm.msc → renew with new key → reinstall Intu... | 🔵 6.5 | MS Learn |
| 55 | Intune Certificate Connector Setup Wizard ends prematurely; SetupMSI.log shows Error 0x80070002 S... | Default Web Site name in IIS Manager was renamed from its default value | Open IIS Manager, find site with ID=1, rename back to Default Web Site, restart NDESConnectorSetu... | 🔵 6.5 | MS Learn |
| 56 | NDES Connector UI sign-in error 0x80004003 unexpected error; svclog shows NDES Connector certific... | Sign-in account lacks valid Intune license | Assign valid Intune license to sign-in account (must be Intune Service Admin or Global Admin). | 🔵 6.5 | MS Learn |
| 57 | SCEP certificate profile shows Failed; IIS logs show HTTP 500 on /CertificateRegistrationSvc/Cert... | CertificateRegistrationSvc app pool account (e.g. Network Service) missing Wr... | Grant Write permission to Network Service on C:\Windows\Temp; ensure no policies remove it afterw... | 🔵 5.5 | MS Learn |
| 58 | Devices cannot obtain SCEP certificates; CA shows error 0x80094800 CERTSRV_E_UNSUPPORTED_CERT_TYP... | NDES registry template name mismatch - using friendly name instead of actual ... | Correct the registry values under HKLM\SOFTWARE\Microsoft\Cryptography\MSCEP to match the actual ... | 🔵 5.5 | MS Learn |
| 59 | SCEP certificate deployment fails to Windows 10 devices after CA certificate renewal; Event 32, 3... | RA certificates on NDES server still reference old CA certificate after CA re... | Reinstall both the NDES server role and Microsoft Intune Certificate Connector to reissue RA cert... | 🔵 5.5 | MS Learn |
| 60 | NDES connector installation fails with error 0x80090014 CryptAcquireContext failed in SetupMSI.lo... | NDES certificate template is not a v2 (or later) template; CryptAcquireContex... | Create the NDES certificate as a v2 template (Windows Server 2008 R2 or 2012 R2 template). Add Cl... | 🔵 5.5 | MS Learn |
| 61 | SCEP certificate request fails during CRP verification phase; Android/iOS devices do not receive ... | NDES connector registry keys under HKLM\Software\Microsoft\MicrosoftIntune\ND... | Solution 1: Restart Intune Connector Service and verify registry keys are created. Solution 2: Re... | 🔵 5.5 | MS Learn |
| 62 | SCEP certificate reporting phase fails: no new files appear in Succeed folder under CertificateRe... | Intune Connector Service not started on NDES server, or errors in Ndesconnect... | Verify Intune Connector Service is started. Check Ndesconnector.svclog for errors. Review IIS log... | 🔵 5.5 | MS Learn |
