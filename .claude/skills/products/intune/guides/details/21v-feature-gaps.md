# Intune 21V 功能差异与不支持特性 — 综合排查指南

**条目数**: 56 | **草稿融合数**: 5 | **Kusto 查询融合**: 0
**来源草稿**: onenote-android-app-store-china.md, onenote-android-in-china.md, onenote-autopilot-v2-setup-21v.md, onenote-china-intune-feature-gaps.md, onenote-intune-21v-kusto-access.md
**生成日期**: 2026-04-07

---

## ⚠️ 已知矛盾 (12 条)

- **solution_conflict** (high): intune-21v-gap-001 vs intune-onenote-020 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **solution_conflict** (high): intune-21v-gap-002 vs intune-onenote-020 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **solution_conflict** (high): intune-21v-gap-003 vs intune-onenote-400 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **solution_conflict** (high): intune-21v-gap-008 vs intune-onenote-020 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **solution_conflict** (high): intune-21v-gap-012 vs intune-onenote-018 — context_dependent: 不同来源给出不同方案，可能适用不同场景

## 排查流程

### Phase 1: Android App Store China
> 来源: OneNote — [onenote-android-app-store-china.md](../drafts/onenote-android-app-store-china.md)

**Android 应用分发 — 中国大陆（无 Google Play）**
**官方下载渠道**
**Company Portal**
- 官方文档：[在中国安装 Intune 公司门户应用](https://learn.microsoft.com/en-us/mem/intune/user-help/install-company-portal-android-china)
- 通过国内主流应用商店（豌豆荚、应用宝等）分发

**Outlook for Android**
- 参考：[Outlook for iOS and Android in Exchange Online: FAQ](https://learn.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/outlook-for-ios-and-android/outlook-for-ios-and-android-faq)
- 通过国内主流应用商店分发

**Microsoft Teams**
- 参考：[Get clients for Microsoft Teams](https://learn.microsoft.com/en-us/microsoftteams/get-clients)
- 通过国内主流应用商店分发

**注意事项**
- Android 在中国只支持 **DA (Device Administrator)** 模式，不支持 Android Enterprise / AOSP（依赖 Google Mobile Services）
- 21v 不支持 SafetyNet Device Attestation（依赖 GMS）
- ARCore 支持设备列表：https://developers.google.com/ar/discover/supported-devices#android_china

**LOB 应用部署**
- 在中国大陆蜂窝网络上下载大 APK 可能失败（HTTP 499）→ 建议使用 Wi-Fi 或点击"同步"重试

### Phase 2: Android In China
> 来源: OneNote — [onenote-android-in-china.md](../drafts/onenote-android-in-china.md)

**Intune Android Device Management in China**
**Overview**
**Key Limitations**
**Push Notification Delay**
- Intune uses Google Play Services for push notifications to Android devices
- In China, GMS is blocked, so push notifications do not work
- Devices will still check in every **8 hours** on their own without push notifications
- Policy application may be delayed up to 8 hours (vs near-instant in other regions)
- Unlike iOS (which depends on APNS), Android can still function without push — just delayed

**Company Portal Sync vs Check Device Settings**
- **Sync** = policy update — Company Portal syncs policy settings with Intune check-in service
- **Check Device Settings** = current device status refresh — pulls reported compliance status from Intune

**OEM-Specific Configuration (Critical)**

**Huawei Devices**
1. **Auto-start**: Settings > More Settings > Permission Management > Permission > Auto Start > Startup > enable Company Portal
2. **Battery optimization**: Device settings > battery optimization > disable for Company Portal and Outlook
3. **Phone Manager**: Configure Company Portal auto-launch in Huawei Phone Manager
4. **Restart the device** after all changes
1. 打开公司门户并登录
2. 点击设备 > 选择当前设备 > 点击检查设备设置
3. 完成之后请再次点击检查设备设置
4. 点击左上角的菜单按钮 > 点击设置 > 点击同步
5. 等大概5-10分钟，去Intune网站查看设备的合规情况
1. 在系统设置中搜索电池优化 > 找到公司门户 > 选择不允许
2. 打开手机管家 > 应用启动管理 > 找到公司门户 > 选择手动管理 > 允许以下3项

**Related Known Issues**
- intune-onenote-030: Android enrollment/MAM not working in China (GMS)
- intune-onenote-031: MAM policy not enforced intermittently
... (详见原始草稿)

### Phase 3: Autopilot V2 Setup 21V
> 来源: OneNote — [onenote-autopilot-v2-setup-21v.md](../drafts/onenote-autopilot-v2-setup-21v.md)

**How to Setup Autopilot V2 in 21Vianet China**
**Lab Environment**
**Step 1: Create Intune Provisioning Client Service Principal (21v)**
```powershell
```
**Step 2: Corporate Device Identifier (Optional)**
```powershell
```
**Step 3: Create Security Group for ETG**
1. Portal: intune.microsoftonline.cn > Groups > New group
2. Type: Security, Membership: Assigned
3. Add **Intune Provisioning Client** (f1346770-5b25-470b-88bd-d5744ab7952c) as Owner

**Step 4: Create Device Preparation Profile**
1. Intune portal > Devices > Enrollment > Device preparation policies > Create
2. Select ETG security group (must have Intune Provisioning Client as owner)
3. Configure deployment settings (standard user option available)
4. Add up to 10 applications (optional)
5. Add up to 10 PowerShell scripts (optional)

**Step 5: Deploy**
1. OOBE: select "work or school"
2. Login with corporate credentials
3. No org branding during login (by design - profile loaded post-login, unlike V1)
4. On Pro OS: additional prompts shown (hidden on Enterprise)
5. Configure WHfB if policies in place

**Step 6: Monitor**
- Device should auto-join ETG security group
- Devices > Monitor > Windows Autopilot device preparation deployments
- Verify enrollment completed status

**Network Requirements (21v China)**

### Phase 4: China Intune Feature Gaps
> 来源: OneNote — [onenote-china-intune-feature-gaps.md](../drafts/onenote-china-intune-feature-gaps.md)

**China (21v) Intune Feature Gaps — Reference Table**
**Feature Availability Table**
**ADO Work Items to Monitor**
**Workaround Summary**

### Phase 5: Intune 21V Kusto Access
> 来源: OneNote — [onenote-intune-21v-kusto-access.md](../drafts/onenote-intune-21v-kusto-access.md)

**Intune 21V (Mooncake) Kusto Access Guide**
**Prerequisites**
1. Request **IntuneKusto-CSSMoncake** permission via MyAccess:
2. A smart card (physical or virtual) is required for Mooncake Kusto connection.
3. Use **REDMOND credentials** (not CME).

**Connection Settings**

**Sample Query: Policy Deployment Status (21V)**
```kql
```
```kql
```

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Intune Android 设备管理在 21V 仅支持 DA 模式 | Android Enterprise 和 AOSP 不支持（依赖 GMS）；仅支持 Device Administrator (DA) 模式，包含 And... | 部分支持：使用 Android DA 模式注册设备；不配置 Android Enterprise Profile 或 AOSP；可管理到 Android 15 | 🟢 9.0 | 21V Gap |
| 2 | In dual-federation environment (same UPN in 21v and Global Azure AD), iOS PowerApps shows 'Org Da... | Intune SDK for iOS v16.0.0 (released 2022/05/25) changed device primary user ... | Short-term: (1) Create separate Edge web apps for PowerApps 21v and Global (uninstall native Powe... | 🟢 9.0 | OneNote |
| 3 | Handling Intune Sev A cases in China (Mooncake/21Vianet); need to know the most common Sev A scen... | Top Sev A Intune scenarios in Mooncake by frequency: (1) Device enrollment fa... | Mooncake-specific resources: Admin portal: https://intune.microsoftonline.cn/ \| Company Portal: ... | 🟢 9.0 | OneNote |
| 4 | Windows device enrollment fails with error 0x800706BE or 80010106. Event ID 1000 (app crash) seen... | dmenrollengine.dll attempts COM init with COINIT_MULTITHREADED but a third-pa... | Identify and uninstall or disable conflicting third-party UKEY or password agent software, then r... | 🟢 9.0 | OneNote |
| 5 | On Huawei devices, MAM-protected apps show org removed data or prompt to reinstall Company Portal... | Huawei battery optimization kills Company Portal background process, breaking... | Exempt CP and Outlook: (1) Phone Manager > Startup Manager enable auto-start/associated/backgroun... | 🟢 9.0 | OneNote |
| 6 | Company Portal (CP) unable to sign in on iOS/Android in 21Vianet (Mooncake) environment; error me... | User's domain was previously verified in Global Azure AD tenant. When CP atte... | Temporary workaround: have user first sign in with user@partner.onmschina.cn format, which redire... | 🟢 9.0 | OneNote |
| 7 | MAM diagnostic Kusto functions AmsActivityForUser() and AMS() are not available in 21v Mooncake; ... | AmsActivityForUser() and AMS() are convenience functions available only in Gl... | Use alternative queries based on IntuneEvent + HttpSubsystem tables directly. For MAM checkin: qu... | 🟢 9.0 | OneNote |
| 8 | Customer raises commerce/licensing ticket for 21V Intune; unclear which team handles it and what ... | 21V Intune commerce questions go through a different support chain than techn... | 21V Intune commerce flow: Customer raises ticket from portal.partner.microsoftonline.cn → 21V M36... | 🟢 9.0 | OneNote |
| 9 | Windows auto MDM enrollment fails with error 0x80010106 (Cannot change thread mode after it is se... | Third-party crypto provider (e.g. CFCA_UKEY_csp) at HKLM\SOFTWARE\Microsoft\C... | Uninstall CFCA UKEY-related software. Verify no third-party providers at HKLM\SOFTWARE\Microsoft\... | 🟢 9.0 | OneNote |
| 10 | 21v (Mooncake) 環境で Intune Endpoint Security > Antivirus > Windows Security Experience から Tamper P... | 21v では Tamper Protection が PG によりデプロイされていない。デバイスが Intune に登録されると ManagedDefen... | 1) MDE onboard で Tamper Protection を制御する 2) UI で手動管理する場合は ManagedDefenderProductType=0, SenseEnab... | 🟢 9.0 | OneNote |
| 11 | Intune VPN profile for Palo Alto GlobalProtect deployed successfully to iOS device but the Global... | Known issue: The standard GlobalProtect VPN identifier is com.paloaltonetwork... | Use a Custom VPN profile or create a custom profile with XML payload that uses the China-specific... | 🟢 9.0 | OneNote |
| 12 | Need to collect Intune diagnostic logs from iOS/Android device when user cannot directly upload l... | Standard log upload (Company Portal > Help > Email Support) requires network ... | iOS Outlook: Settings (avatar) > Privacy > disable Optional connected experiences > tap ? icon > ... | 🟢 9.0 | OneNote |
| 13 | User unable to login Company Portal to complete Intune enrollment. Error: invalid input parameter... | Customer domain was not in the ESTS ChinaDomainsToSkipRealmCacheLookup list, ... | Escalate to ESTS team (via ICM) to add customer domain to ChinaDomainsToSkipRealmCacheLookup list... | 🟢 9.0 | OneNote |
| 14 | Android device unable to enroll with Intune. Workplace Join (WPJ) failed during enrollment. | Customer domain was verified by both Global Azure AD and 21Vianet Azure AD. i... | Customer needs to remove the domain from the Global tenant. Having domain verified in both Global... | 🟢 9.0 | OneNote |
| 15 | After Teams Win32 deployment succeeds via Autopilot on Windows 24H2, end users cannot find Teams ... | Windows 24H2 image includes built-in MSTeams v1.0 which does not include CN r... | 1) Deprovision the built-in v1.0: teamsbootstrapper.exe -x. 2) Provision new Teams with offline M... | 🟢 9.0 | OneNote |
| 16 | Autopilot V2 (Windows Device Preparation) enrollment fails in China mainland due to network conne... | The official Intune China endpoints documentation is incomplete. Autopilot V2... | Whitelist required URLs: clientconfig.passport.net, config.edge.skype.com, www.msftconnecttest.co... | 🟢 8.5 | OneNote |
| 17 | Windows devices unexpectedly join or auto-enroll to wrong Intune tenant (Global vs 21v) in dual-f... | Service Connection Point (SCP) registry keys cloned from master/snapshot VDI ... | (1) Check SCP registry keys on affected device to verify they point to correct tenant; (2) For VD... | 🟢 8.0 | OneNote |
| 18 | Device check-in fails for multiple devices in Mooncake. Spike in 302 redirect failures observed o... | Service-side issue causing spike in 302 redirect failures on Mooncake Intune ... | Filed as LSI (Large Scale Incident), MC: IT717941. Service team resolved within 3 days. If simila... | 🟢 8.0 | OneNote |
| 19 | Android LOB app stuck in ERROR_APP_INSTALL_CANCELLED state. App download initiates but installati... | In China mainland, Google Play services are blocked by firewall. Android LOB ... | 1. During app download, manually switch to Company Portal Settings and click Sync button to trigg... | 🟢 8.0 | OneNote |
| 20 | Security Baseline last report time in Intune portal does not update in sync with device last chec... | By design, Security Baseline report data is copied every 24 hours. If there a... | This is expected behavior. Inform customer: (1) Report data refreshes every 24 hours; (2) If no c... | 🟢 8.0 | OneNote |
| 21 | iOS/iPadOS User Enrollment method is not available in 21v (Mooncake) Intune; attempting to config... | User Enrollment (as a distinct Apple enrollment type using managed Apple ID) ... | Use BYOD enrollment via Company Portal or ADE (Automated Device Enrollment) instead of User Enrol... | 🟢 8.0 | OneNote |
| 22 | Autopilot V2 Enrollment Time Grouping (ETG) fails to automatically add device to security group d... | The Intune Provisioning Client service principal (AppId: f1346770-5b25-470b-8... | Run: Install-Module AzureAD; Connect-AzureAD -AzureEnvironmentName AzureChinaCloud; New-AzureADSe... | 🟢 8.0 | OneNote |
| 23 | iOS devices fail to connect to Intune endpoints or enrollment/check-in fails with SSL/TLS handsha... | Intune 21v endpoints (e.g., fef.cnpasu01.manage.microsoftonline.cn, mam.manag... | Ensure client devices support TLS 1.2 or higher with modern cipher suites. Test endpoint connecti... | 🔵 7.5 | OneNote |
| 24 | Intune policy RemovableDiskDenyWriteAccess deployed successfully (registry value correct), but US... | Conflict with Audit removable storage policy. The Audit policy sets registry ... | Remove HotplugSecureOpen registry key and restart WPD services. Or remove the Audit removable sto... | 🔵 7.5 | OneNote |
| 25 | NDES Connector related services are all stopped. System event log shows the NDES service account ... | The service account used to run NDES-related services (Intune Connector Servi... | 1) Check System Event Log for 'unable to log on as service' error. 2) Open Local Security Policy ... | 🔵 7.5 | OneNote |
| 26 | Cannot access Intune Kusto cluster for Mooncake (intunecn.chinanorth2.kusto.chinacloudapi.cn) des... | IntuneKusto-CSS entitlement only grants access to Global Intune Kusto cluster... | Request the 'IntuneKusto-CSSMooncake' entitlement from CoreIdentity portal (https://coreidentity.... | 🔵 7.5 | OneNote |
| 27 | Intune 中 Microsoft Tunnel VPN 在 21V 环境无法使用 | Microsoft Tunnel 依赖 Microsoft Defender for Endpoint；国内 Tunnel VPN 只允许三大运营商做 V... | 不支持；改用第三方 VPN 方案，或改用 Always On VPN（RRAS/PPTP/IKEv2） | 🔵 7.0 | 21V Gap |
| 28 | Intune 中 Microsoft Endpoint Manager / Endpoint Analytics / Log Analytics 在 21V 无法使用 | Microsoft Endpoint Manager 及相关分析功能在 21V 未上线 | 不支持；无替代方案，跟踪 DCR 进展 | 🔵 7.0 | 21V Gap |
| 29 | Intune 中 Tenant Attach 在 21V 环境不可用 | Tenant Attach 功能在 21V 未上线 | 不支持；使用本地 SCCM 管理，不进行 Tenant Attach | 🔵 7.0 | 21V Gap |
| 30 | Intune 中 Derived Credentials 在 21V 无法配置 | Derived Credentials 功能在 21V 未上线 | 不支持；改用其他证书认证方案（如 SCEP/PKCS） | 🔵 7.0 | 21V Gap |
| 31 | Intune On-Premises Exchange Connector 在 21V 不可用 | Global 已于 CY22 EOL，PM 确认永不会 GA 到 21V | 不支持；迁移到 Exchange Online 或使用 Hybrid Modern Auth | 🔵 7.0 | 21V Gap |
| 32 | Intune 中 Microsoft Store（新版）应用部署在 21V 不可用 | 合规问题（win-get）；PM 确认不会支持 Mooncake | 不支持；改用 Win32 app 或 LOB app 部署方式 | 🔵 7.0 | 21V Gap |
| 33 | Android 设备通过 Intune 合规策略使用 SafetyNet Device Attestation 在 21V 无效 | SafetyNet Device Attestation 依赖 Google Mobile Services（GMS），在 21V 中国环境不可用 | 不支持；不要在 21V 合规策略中配置 SafetyNet 要求 | 🔵 7.0 | 21V Gap |
| 34 | Intune 无法在 21V 管理来自 Google App Store 的应用 | 依赖 Google Mobile Services（GMS），在 21V 中国环境不可用 | 不支持；改用 LOB 应用部署或侧载 APK | 🔵 7.0 | 21V Gap |
| 35 | Intune Android Enterprise 在 21V 无法注册或管理 | Android Enterprise 依赖 Google Mobile Services（GMS），在 21V 中国环境不可用 | 不支持；改用 Android Device Administrator (DA) 模式注册管理设备 | 🔵 7.0 | 21V Gap |
| 36 | Intune Android (AOSP) 企业设备管理在 21V 不可用 | 依赖 OEM 支持 AOSP；DCR-M365-6783 已提交但尚未完成 | 不支持；改用 Android DA 模式；跟踪 DCR-M365-6783 进展 | 🔵 7.0 | 21V Gap |
| 37 | Intune 通过 Jamf 管理 macOS 设备在 21V 不可用 | Partner device management integration with Jamf 依赖 Jamf Apple Management，在 21... | 不支持；改用 Intune 原生 MDM 直接注册 macOS 设备 | 🔵 7.0 | 21V Gap |
| 38 | Intune Fencing 功能在 21V 不可用 | Fencing 功能在 21V 未上线 | 不支持；使用其他地理围栏或条件访问策略替代 | 🔵 7.0 | 21V Gap |
| 39 | Intune 中 Enterprise Application 在 21V 不可用 | 依赖 Azure 功能，21V Azure 相关依赖未满足 | 不支持；改用 LOB 应用或 Win32 应用部署 | 🔵 7.0 | 21V Gap |
| 40 | Intune 中 Microsoft Edge 登录功能在 21V 不稳定或不可用 | Microsoft Edge Sign In 依赖 AAD 相关功能，21V AAD 依赖未完全满足 | 不支持；检查 AAD 设置及条件访问策略；Edge 可能需要单独配置 | 🔵 7.0 | 21V Gap |
| 41 | Apple Business Manager 与 21V Azure AD Federation 在 21V 无法使用 | ABM app 在 21V AAD 中不可用 | 不支持；不能在 21V 配置 ABM + Intune 自动注册联动 | 🔵 7.0 | 21V Gap |
| 42 | Intune Windows AutoPatch 在 21V 不可用 | Windows AutoPatch 功能在 21V 未上线 | 不支持；改用 Windows Update Ring 策略手动管理 patch | 🔵 7.0 | 21V Gap |
| 43 | Intune Cloud PKI 在 21V 无法使用 | 无 Intune Suite & Cloud PKI add-on 许可证；DCR 追踪中 | 不支持；改用 SCEP/PKCS（NDES + ADCS）方案部署证书 | 🔵 7.0 | 21V Gap |
| 44 | AVD (Azure Virtual Desktop) 设备无法通过 21V Intune 注册管理 | Feature 15571094 追踪中，尚未支持 | 不支持；暂时使用 GPO 或手动配置管理 AVD 设备；跟踪 Feature 15571094 | 🔵 7.0 | 21V Gap |
| 45 | Intune Windows Update for Business Report 在 21V 不可用 | DCR-M365-6907 已提交，尚未支持 | 不支持；改用 WSUS 报告或自建监控查看更新合规状态；跟踪 DCR-M365-6907 | 🔵 7.0 | 21V Gap |
| 46 | AVD (Azure Virtual Desktop) session hosts cannot be enrolled to Intune in Mooncake (21Vianet); th... | Intune management for AVD Azure AD-joined VMs is only supported in Azure Publ... | No officially supported enrollment path for AVD in 21v as of 2023-05. Workaround (unsupported): (... | 🔵 7.0 | OneNote |
| 47 | Customer requests Microsoft Tunnel VPN configuration via 21v Intune; Tunnel gateway or Tunnel con... | Microsoft Tunnel requires Microsoft Defender for Endpoint integration which i... | Use third-party VPN apps deployed via Intune App Protection or Per-App VPN profiles (e.g., Cisco ... | 🔵 7.0 | OneNote |
| 48 | Customer cannot set up Android Enterprise (Work Profile, Fully Managed/COBO, COPE, or Dedicated/C... | Android Enterprise requires Google Mobile Services (GMS) specifically Google ... | Use Android Device Administrator (DA) management mode instead. 21v Intune supports Android DA enr... | 🔵 7.0 | OneNote |
| 49 | Cannot deploy Microsoft Store (new) apps or winget-sourced application packages from 21v Intune; ... | Microsoft Store (new) app type relies on Windows Package Manager (winget). Mi... | Use Win32 app packaging (.intunewin format) for all custom Windows app deployments in 21v. Use Mi... | 🔵 7.0 | OneNote |
| 50 | Customer cannot use Intune Cloud PKI (cloud-based Certificate Authority) for certificate provisio... | Cloud PKI requires the Intune Suite or Cloud PKI add-on license which is not ... | Use on-premises ADCS (Active Directory Certificate Services) with NDES role and Intune Certificat... | 🔵 7.0 | OneNote |
| 51 | Windows devices stuck with managed name format (username_platform_timestamp) instead of actual de... | Enrollment did not complete fully. Device stayed in initial enrollment state ... | Collect MDM diagnostic logs (winevt, dsregcmd output). Check registry HKLM\SOFTWARE\Microsoft\Enr... | 🔵 7.0 | OneNote |
| 52 | SafetyNet device attestation and Verify Apps settings block users in regions without Google Play ... | SafetyNet and Verify Apps APIs require Google Play Services which is unavaila... | Do not target SafetyNet attestation or Verify Apps settings for users without Google Play Service... | 🔵 6.5 | ADO Wiki |
| 53 | Windows MAM 在 GCC-H 或 Mooncake (China) 环境中不可用 | 截至 2023年9月，Windows MAM 功能不支持 GCC-H 和 Mooncake (21Vianet) 云环境，存在阻止 FF/CN 环境的 bug | 1. 确认客户环境是否为 GCC-H 或 Mooncake；2. 如是，告知客户当前不支持，需等待产品团队修复；3. 建议使用替代方案如设备注册 + Conditional Access 设备合规策略 | 🔵 6.5 | ADO Wiki |
| 54 | Windows Backup for Organizations 功能在 GCC-H 或 Mooncake (21Vianet) 环境不可用 | Windows Backup for Organizations 目前不支持 GCC-H 和 Mooncake 环境，Portal 配置租户级设置时有明确提示 | 此功能在 GCC-H/Mooncake 暂不支持，计划 1Q26CY 支持。告知客户等待功能上线 | 🔵 6.5 | ADO Wiki |
| 55 | Mac enrollment fails with HTTP 404 error when installing management profile. MDM_Authenticate PUT... | PG confirmed this was a Node issue in the Mooncake (21Vianet) environment. Th... | 1. Collect macOS MDM client logs (mdmclient) to compare working vs non-working enrollment. 2. Che... | 🔵 6.5 | OneNote |
| 56 | Android DA device reported Noncompliant with rules: SecurityBlockJailbrokenDevices (rooted device... | Device is rooted OR SafetyNet attestation is failing — device does not pass G... | Use Kusto: `CalculationQueueLibrary \| where deviceId == '{deviceId}' \| project env_time, EventI... | 🔵 6.0 | OneNote |
