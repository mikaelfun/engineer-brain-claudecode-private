# Intune PKCS / PFX 证书部署 — 综合排查指南

**条目数**: 29 | **草稿融合数**: 3 | **Kusto 查询融合**: 1
**来源草稿**: ado-wiki-PKCS-Overview.md, onenote-PFX-PKCS-Configuration-Troubleshooting.md, onenote-pfx-pkcs-configuration.md
**Kusto 引用**: certificate.md
**生成日期**: 2026-04-07

---

## ⚠️ 已知矛盾 (7 条)

- **solution_conflict** (high): intune-ado-wiki-274 vs intune-contentidea-kb-713 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **solution_conflict** (high): intune-contentidea-kb-451 vs intune-mslearn-057 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **solution_conflict** (high): intune-contentidea-kb-713 vs intune-mslearn-060 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **rootCause_conflict** (medium): intune-contentidea-kb-255 vs intune-mslearn-056 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **rootCause_conflict** (medium): intune-contentidea-kb-255 vs intune-mslearn-060 — context_dependent: 不同来源给出不同方案，可能适用不同场景

## 排查流程

### Phase 1: Pkcs Overview
> 来源: ADO Wiki — [ado-wiki-PKCS-Overview.md](../drafts/ado-wiki-PKCS-Overview.md)

**PKCS (PFX) Certificate Overview & Troubleshooting**
**PKCS Communication Flow**
1. Admin creates PKCS certificate profile in Intune
2. Intune requests Certificate Connector to create new cert
3. Connector sends PFX Blob and Request to CA
4. CA issues and returns PFX User Certificate to Connector
5. Connector uploads encrypted PFX to Intune

**S/MIME Scenarios**
- PKCS supports authentication, S/MIME email signing, and S/MIME email encryption
- Signing and encryption typically use separate certificates
- Active Directory CS: Exchange Signature Only (signing) + Exchange User (encryption)
- Connectors required:
  - Microsoft Intune Certificate Connector (authentication + signing)
  - PFX Certificate Connector (encryption)
  - Both can be on same server

**User vs Device Certificate**
- User certs: contain both user and device attributes in Subject/SAN
- Device certs: only device attributes. Use for kiosks, shared devices

**Known Behavior**
- PKCS: profile/assignment changes → re-push existing cert (NOT new cert)
- SCEP: profile/assignment changes → issue new cert
- To get new PKCS cert: re-enroll device or deploy new PKCS profile

**Scoping Questions**
1. Profile types? Sub CA? Pushing Sub CA cert to device?
2. Affected platform? (Android/iOS/Windows/macOS)
3. Enrollment type?
... (详见原始草稿)

### Phase 2: Pfx Pkcs Configuration Troubleshooting
> 来源: OneNote — [onenote-PFX-PKCS-Configuration-Troubleshooting.md](../drafts/onenote-PFX-PKCS-Configuration-Troubleshooting.md)

**Configuring and Troubleshooting PFX/PKCS Certificates in Intune**
**Overview**
**Prerequisites**
- Active Directory domain (all servers joined)
- Enterprise CA (AD CS) - not standalone CA
- Client machine to connect to Enterprise CA
- Exported root certificate (.cer)
- Intune Certificate Connector (NDES Certificate Connector)

**Configuration Tasks**

**Task A: Configure Certificate Templates on CA**
1. Open Certificate Templates snap-in on issuing CA
2. Create new custom template or copy existing (e.g., User template)
3. Key settings:
   - **Subject Name**: "Supply in the request"
   - **Extensions**: Include "Client Authentication" in Application Policies
   - **Request Handling**: Purpose = "Signature and Encryption", enable "Allow private key to be exported"
   - **Security**: SYSTEM needs Read + Enroll; add NDES connector computer account with Read + Enroll
4. Publish template: Certificate Templates node > Action > New > Certificate Template to Issue
5. Ensure connector computer has Enroll permission on CA Security tab

**Task B: Install and Configure Intune Certificate Connector**
1. Download from: Intune > Device Configuration > Certification Connectors > Add > Download
2. Run `ndesconnectorssetup.exe` as admin on machine that can reach the CA
3. Choose **PFX Distribution** option
4. Sign in with **Global Admin** (must have Intune license)
5. Restart Intune Connector Service: `services.msc` > right-click > Restart

**Task C: Create and Deploy Certificate Profiles**
1. Export Trusted Root CA as .cer (no private key)
... (详见原始草稿)

### Phase 3: Pfx Pkcs Configuration
> 来源: OneNote — [onenote-pfx-pkcs-configuration.md](../drafts/onenote-pfx-pkcs-configuration.md)

**PFX/PKCS Certificate Configuration & Troubleshooting in Intune**
**Prerequisites**
- Active Directory domain (all servers joined)
- Enterprise Certification Authority (AD CS) — NOT standalone CA
- Client to connect to Enterprise CA
- Exported root certificate (.cer)
- Intune Certificate Connector (NDES Certificate Connector)

**Configuration Tasks**

**Task A: Configure Certificate Templates on CA**
1. Create/copy certificate template (e.g., User template)
2. Set **Compatibility Settings** appropriately
3. Subject Name → **Supply in the request**
4. Extensions → Include **Client Authentication**
5. Request Handling → Purpose: **Signature and Encryption**, enable **Allow private key to be exported**

**Task B: Install Intune Certificate Connector**
1. Download from Endpoint Management admin center → Device Configuration → Certification Connectors → Add
2. Run `ndesconnectorssetup.exe` as admin on CA-accessible machine
3. Choose **.PFX Distribution** option
4. Sign in with **Global Admin** (must have Intune license)
5. Restart **Intune Connector Service** via services.msc

**Task C: Deploy Certificate Profiles**
1. Export Trusted Root CA certificate as **.cer** (no private key)
2. Create **Trusted Certificate** profile (Android/iOS)
3. Create **.PFX certificate** profile:
   - **Certification Authority**: Internal FQDN of CA (e.g., `server1.domain.local`)
   - **Certification Authority Name**: As shown in CA MMC under **Certification Authority (Local)**
... (详见原始草稿)

### Phase 4: Kusto 诊断查询

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
| 1 | PKCS certificate deployed via Intune does not renew; modifying validity period in certificate pro... | PKCS certificates are the same certificate for the same device - Intune re-pu... | For PKCS renewal: must revoke/remove existing cert first then redeploy. To remove: unassign profi... | 🟢 9.0 | OneNote |
| 2 | PFX Certificate connector keeps contacting decommissioned old CA server instead of newly configur... | PFX connector caches unprocessed certificate requests in a 'processing' folde... | Delete contents of the PFX connector 'processing' folder to clear backlog of old CA requests. Con... | 🟢 9.0 | OneNote |
| 3 | Import-IntuneUserPfxCertificate 上传 PFX 证书时返回 (400) Bad Request 错误 | 目标用户无 Intune 许可证，或该用户已上传过相同证书 | 1. 确认用户已分配 Intune 许可证；2. 如用户已有证书，先用 Remove-IntuneUserPfxCertificate 删除旧证书后重新上传 | 🟢 8.5 | ADO Wiki |
| 4 | SCEP 证书部署失败，验证阶段 Subject Name (SN) 或 Subject Alternative Name (SAN) 动态变量（如 {{UserPrincipalName}}）... | SCEP 配置文件中的 SN/SAN 动态变量（如 {{UserName}}、{{EmailAddress}}）在后端解析时失败，可能因用户属性缺失或 A... | 1. 使用 Kusto 查询 IntuneEvent 检查 ResolveScepRequestVariables 事件确认 SN/SAN 解析结果；2. 通过 cV 值追踪 Step 2 查询... | 🟢 8.5 | ADO Wiki |
| 5 | PKCS (PFX) certificate shows only last SAN value for all fields (UPN, Email, DNS, URI) on all pla... | PKCS certificate behavior across all platforms (iOS, Android, Windows, macOS)... | By design for PKCS certificates on all platforms. Only the last SAN value of each type is used. I... | 🟢 8.5 | ADO Wiki |
| 6 | Microsoft Intune Certificate Connector certificate fails to auto-renew; SCEP/PFX certificates sto... | The service account used during Certificate Connector configuration does not ... | 1) Check connector service account permissions per https://learn.microsoft.com/en-us/mem/intune/p... | 🟢 8.5 | ADO Wiki |
| 7 | Intune 通过 SCEP/PKCS 颁发的证书缺少 Strong Mapping OID (1.3.6.1.4.1.311.25.2)，导致 certificate-based authen... | CA 模板使用 Compatibility 2012+ 或 Key Storage Provider (KSP) 时，msPKI-Enrollment-F... | 1) 先验证 Connector 是否发送 OID：在 CA 的 Issued Certs 中导出 Binary Request → 搜索 OID 1.3.6.1.4.1.311.25.2。2)... | 🟢 8.5 | ADO Wiki |
| 8 | 修改 PKCS profile 的 assignment 或配置后，设备收到的是旧证书而非新证书 | PKCS 设计行为：与 SCEP 不同，PKCS 在修改 assignments 或 profile 配置时只会重新推送之前已颁发的证书，不会触发新证书颁发 | By design。要触发新 PKCS 证书颁发，需重新注册设备或部署全新的 PKCS profile。SCEP 则会在修改 assignment 或 profile 时自动颁发新证书 | 🟢 8.5 | ADO Wiki |
| 9 | PKCS 证书长时间停留在 Pending 状态，Connector Event Log 显示 NullReferenceException at PkiCreateProcessor.Uplo... | Certificate Connector 的 PkiCreateProcessor.UploadResults 方法存在 bug，导致 NullRefe... | 1) 等待自动恢复（通常 2-4 小时），Connector 每 ~10 分钟重试。2) 重启 Connector 服务（立即修复）。3) 更新到最新版 Connector（永久修复）。Kust... | 🟢 8.5 | ADO Wiki |
| 10 | iOS 设备 PKCS 证书显示 Pending 或 Not Applicable，VPN profile 安装失败，日志报 Dependent payload not found 或错误 20... | iOS 上 PKCS 证书关联 VPN profile 时存在严格部署依赖：VPN App 必须先安装 → VPN Profile → PKCS Cert... | 1) 确保 VPN App 先安装在设备上。2) 检查设备日志中的 NotNow 响应。3) VPN App 安装后触发手动同步。4) 考虑将证书和 VPN profile 分开部署 | 🟢 8.5 | ADO Wiki |
| 11 | PKCS 证书长时间处于 Pending 状态，Connector Event Log 显示 PkiCreateProcessor.UploadResults NullReferenceExce... | Certificate Connector 的 PkiCreateProcessor.UploadResults 方法存在 bug，CA 成功签发证书后 ... | 1. 等待自动恢复（通常 2-4 小时）；2. 重启 Connector 服务可立即修复；3. 更新 Connector 到最新版本永久修复。Kusto 诊断：搜索 DownloadNewMes... | 🟢 8.5 | ADO Wiki |
| 12 | PKCS 证书 policy 已成功分配，设备已注册，但证书 Pending 数小时后才最终交付，Intune portal 无明显错误 | 多因素导致延迟：外部 CA 性能（负载/网络延迟）、Connector 服务器资源不足、设备 MDM 同步间隔（iOS/Android/Windows 默... | 1. 检查 Connector Event Log 中的处理延迟；2. 监控 Connector 服务器资源；3. 为 Connector 文件夹添加杀毒排除项；4. 考虑部署多个 Connec... | 🟢 8.5 | ADO Wiki |
| 13 | iOS 设备 PKCS 证书显示 Pending 或 Not Applicable，VPN profile 安装失败，设备日志报 Dependent payload not found 或 20... | iOS 上 PKCS 证书关联 VPN profile 时，Intune 强制执行部署依赖链：VPN App → VPN Profile → PKCS C... | 1. 确保 VPN App 先安装到设备；2. 检查设备日志中的 NotNow 响应；3. VPN App 安装后触发手动同步；4. 考虑将证书和 VPN profile 分开部署 | 🟢 8.5 | ADO Wiki |
| 14 | GCC High/DoD 环境 Imported PFX 配置需要修改 service endpoint（AuthURI 和 GraphURI） | GCC High/DoD 租户使用 .us 后缀的 endpoint，默认 .com 配置不适用 | 编辑 IntunePfxImport.psd1，将 AuthURI 改为 login.microsoftonline.us，GraphURI 改为 https://graph.microsoft.us | 🔵 7.5 | ADO Wiki |
| 15 | When deploying a wifi profile to an Android device, the PFX certificate never authenticates the p... | The Wifi profile is not authenticating against the PFX certificate because it... | Navigate to manage.microsoft.com, click on the Policy node and edit the configuration policy for ... | 🔵 7.0 | ContentIdea KB |
| 16 | Customer is using a PFX certificate to deploy a WiFi policy to an Android device. The WiFi policy... | Misconfigured certificate template (template created using wrong Windows vers... | Created a new      certificate template for Android devices  In the CA went to the Certificate Te... | 🔵 7.0 | ContentIdea KB |
| 17 | Customer is trying to deploy a PFX certificate to an iPhone enrolled into Intune. The trusted roo... | Customer's PKCS profile in Intune had the following fields populated incorrec... |  | 🔵 7.0 | ContentIdea KB |
| 18 | The deployment status of PFX Profile shows the errors:&nbsp; &quot;0x87D1FDE9&quot; and &quot;0x8... | There is&nbsp;a bug where the Subject Name Generation requires each user to h... | Go into the User_DISC table and make sure each user that needs a certificate as values in the Ema... | 🔵 7.0 | ContentIdea KB |
| 19 | When deploying PFX Profile in CONFIGMGR you see the following error in the crpctrl.log:ERROR: Ret... | Key Archival is not configured on the Certificate Authority. | - Configuration the option &quot;Archive the key&quot; on the &quot;Recovery Agents&quot; tab in ... | 🔵 7.0 | ContentIdea KB |
| 20 | When attempting to deploy PKCS certificates, the certificates are not deployed and the following ... | This can occur if the NDES computer is unable to locate a certificate enrollm... | To resolve this issue, configure the name of the policy server manually on the NDES computer. | 🔵 7.0 | ContentIdea KB |
| 21 | After installing Intune connector, devices never receive PKCS certificate. NDES connector log sho... | Intune PKCS profile misconfigured - wrong Certification authority name or SAN... | Correct PKCS profile configuration in Intune and target correct user group. Certificates will be ... | 🔵 7.0 | ContentIdea KB |
| 22 | After deploying a PKCS profile to issue certificates to mobile devices, the certificates are not ... | This can occur if the option �Set the request status to pending. The administ... | To resolve this issue, in the CA Properties under policy module -> Properties, change the option ... | 🔵 7.0 | ContentIdea KB |
| 23 | PKCS certificate deployment fails with error 0x800706BA RPC server unavailable; trusted root cert... | Cause 1: PKCS profile has wrong CA FQDN/name. Cause 2: CA cert renewed but Us... | Cause 1: Fix Certification authority and name in PKCS profile. Cause 2: Run certutil -setreg ca\U... | 🔵 6.5 | MS Learn |
| 24 | PKCS certificate fails with 0x80094015 enrollment policy server cannot be located | Connector host cannot locate certificate enrollment policy server | Run Add-CertificateEnrollmentPolicyServer PowerShell cmdlet on connector host. | 🔵 6.5 | MS Learn |
| 25 | PKCS submission pending: Taken Under Submission; PFX request in CA Pending Requests folder; devic... | CA Policy Module set to require admin to explicitly issue certificate | Change CA Policy Module to Follow the settings in the certificate template or automatically issue. | 🔵 6.5 | MS Learn |
| 26 | PKCS certificate fails with 0x80070057 parameter is incorrect; connector configured but devices g... | PKCS profile misconfigured: wrong CA name or SAN for email but user has no em... | Verify PKCS profile CA name, user group assignment, and that users have valid email addresses. | 🔵 6.5 | MS Learn |
| 27 | PKCS certificate denied by Policy Module; device gets trusted root but not PFX | Computer Account of connector server lacks Read and Enroll permissions on cer... | Add connector server Computer Account to cert template Security tab with Read + Enroll permission... | 🔵 6.5 | MS Learn |
| 28 | PKCS fails with -2146875374 CERTSRV_E_SUBJECT_EMAIL_REQUIRED: Email name unavailable cannot be ad... | Supply in the request option not enabled on certificate template Subject Name... | Open cert template Properties > Subject Name tab > select Supply in the request > re-issue template. | 🔵 6.5 | MS Learn |
| 29 | PKCS certificate profile stuck as Pending in Intune admin center; no obvious errors in logs | Cause 1: PfxRequest files stuck in Failed/Processing folders. Cause 2: Wrong ... | Check %programfiles%\Microsoft Intune\PfxRequest folders for errors. Verify trusted cert profile ... | 🔵 5.5 | MS Learn |
