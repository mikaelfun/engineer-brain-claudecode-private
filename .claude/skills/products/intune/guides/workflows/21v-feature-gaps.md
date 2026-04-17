# Intune 21V 功能差异与不支持特性 — 排查工作流

**来源草稿**: onenote-android-app-store-china.md, onenote-android-in-china.md, onenote-autopilot-v2-setup-21v.md, onenote-china-intune-feature-gaps.md, onenote-intune-21v-kusto-access.md
**Kusto 引用**: (无)
**场景数**: 18
**生成日期**: 2026-04-07

---

## Portal 路径

- `intune.microsoftonline.cn > Groups > New group`
- `Intune portal > Devices > Enrollment > Corporate device identifiers > Upload CSV`
- `Intune portal > Devices > Enrollment > Device preparation policies > Create`

## Scenario 1: Company Portal
> 来源: onenote-android-app-store-china.md | 适用: Mooncake ✅

### 排查步骤

- 官方文档：[在中国安装 Intune 公司门户应用](https://learn.microsoft.com/en-us/mem/intune/user-help/install-company-portal-android-china)
- 通过国内主流应用商店（豌豆荚、应用宝等）分发

## Scenario 2: Outlook for Android
> 来源: onenote-android-app-store-china.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- 参考：[Outlook for iOS and Android in Exchange Online: FAQ](https://learn.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/outlook-for-ios-and-android/outlook-for-ios-and-android-faq)
- 通过国内主流应用商店分发

## Scenario 3: Microsoft Teams
> 来源: onenote-android-app-store-china.md | 适用: Mooncake ✅

### 排查步骤

- 参考：[Get clients for Microsoft Teams](https://learn.microsoft.com/en-us/microsoftteams/get-clients)
- 通过国内主流应用商店分发

## 注意事项

- Android 在中国只支持 **DA (Device Administrator)** 模式，不支持 Android Enterprise / AOSP（依赖 Google Mobile Services）
- 21v 不支持 SafetyNet Device Attestation（依赖 GMS）
- ARCore 支持设备列表：https://developers.google.com/ar/discover/supported-devices#android_china

## Scenario 4: LOB 应用部署
> 来源: onenote-android-app-store-china.md | 适用: Mooncake ✅

### 排查步骤

对于企业自定义 LOB 应用，通过 Intune 直接推送 APK（不依赖 Google Play）。注意：
- 在中国大陆蜂窝网络上下载大 APK 可能失败（HTTP 499）→ 建议使用 Wi-Fi 或点击"同步"重试

## Scenario 5: Push Notification Delay
> 来源: onenote-android-in-china.md | 适用: Mooncake ✅

### 排查步骤

- Intune uses Google Play Services for push notifications to Android devices
- In China, GMS is blocked, so push notifications do not work
- Devices will still check in every **8 hours** on their own without push notifications
- Policy application may be delayed up to 8 hours (vs near-instant in other regions)
- Unlike iOS (which depends on APNS), Android can still function without push — just delayed

## Scenario 6: Company Portal Sync vs Check Device Settings
> 来源: onenote-android-in-china.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **Sync** = policy update — Company Portal syncs policy settings with Intune check-in service
- **Check Device Settings** = current device status refresh — pulls reported compliance status from Intune

## OEM-Specific Configuration (Critical)

## Scenario 7: Huawei Devices
> 来源: onenote-android-in-china.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

To prevent battery optimization from killing Company Portal:
1. **Auto-start**: Settings > More Settings > Permission Management > Permission > Auto Start > Startup > enable Company Portal
2. **Battery optimization**: Device settings > battery optimization > disable for Company Portal and Outlook
3. **Phone Manager**: Configure Company Portal auto-launch in Huawei Phone Manager
4. **Restart the device** after all changes

Chinese instructions:
1. 打开公司门户并登录
2. 点击设备 > 选择当前设备 > 点击检查设备设置
3. 完成之后请再次点击检查设备设置
4. 点击左上角的菜单按钮 > 点击设置 > 点击同步
5. 等大概5-10分钟，去Intune网站查看设备的合规情况

Battery optimization (华为):
1. 在系统设置中搜索电池优化 > 找到公司门户 > 选择不允许
2. 打开手机管家 > 应用启动管理 > 找到公司门户 > 选择手动管理 > 允许以下3项

## Scenario 8: Related Known Issues
> 来源: onenote-android-in-china.md | 适用: Mooncake ❌ (Global-only)

### 排查步骤

- intune-onenote-030: Android enrollment/MAM not working in China (GMS)
- intune-onenote-031: MAM policy not enforced intermittently
- intune-onenote-066: Huawei battery optimization kills Company Portal
- intune-onenote-067: OPPO app optimization blocks MAM

## Source
- OneNote: Mooncake POD Support Notebook/POD/VMSCIM/4. Services/Intune/## Android TSG/Android in China.md

## Scenario 9: Step 1: Create Intune Provisioning Client Service Principal (21v)
> 来源: onenote-autopilot-v2-setup-21v.md | 适用: Mooncake ✅

### 排查步骤

```powershell
Install-Module AzureAD
Connect-AzureAD -AzureEnvironmentName AzureChinaCloud
New-AzureADServicePrincipal -AppId f1346770-5b25-470b-88bd-d5744ab7952c
```

## Scenario 10: Step 2: Corporate Device Identifier (Optional)
> 来源: onenote-autopilot-v2-setup-21v.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Get device info:
```powershell
Get-WmiObject -Class Win32_ComputerSystem | FL Manufacturer, Model
Get-WmiObject -Class Win32_BIOS | FL SerialNumber
```
Create CSV format: `Manufacturer,Model,Serialnumber`

Upload: Intune portal > Devices > Enrollment > Corporate device identifiers > Upload CSV

**Important**: Wait for identifiers to be processed before enrolling. Error 80180014 occurs if enrollment is attempted too quickly while personal device enrollment is blocked.

## Scenario 11: Step 3: Create Security Group for ETG
> 来源: onenote-autopilot-v2-setup-21v.md | 适用: Mooncake ✅

### 排查步骤

1. Portal: intune.microsoftonline.cn > Groups > New group
2. Type: Security, Membership: Assigned
3. Add **Intune Provisioning Client** (f1346770-5b25-470b-88bd-d5744ab7952c) as Owner

## Scenario 12: Step 4: Create Device Preparation Profile
> 来源: onenote-autopilot-v2-setup-21v.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Intune portal > Devices > Enrollment > Device preparation policies > Create
2. Select ETG security group (must have Intune Provisioning Client as owner)
3. Configure deployment settings (standard user option available)
4. Add up to 10 applications (optional)
5. Add up to 10 PowerShell scripts (optional)
6. Assign to user group

## Scenario 13: Step 5: Deploy
> 来源: onenote-autopilot-v2-setup-21v.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. OOBE: select "work or school"
2. Login with corporate credentials
3. No org branding during login (by design - profile loaded post-login, unlike V1)
4. On Pro OS: additional prompts shown (hidden on Enterprise)
5. Configure WHfB if policies in place

## Scenario 14: Step 6: Monitor
> 来源: onenote-autopilot-v2-setup-21v.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Device should auto-join ETG security group
- Devices > Monitor > Windows Autopilot device preparation deployments
- Verify enrollment completed status

## Scenario 15: Network Requirements (21v China)
> 来源: onenote-autopilot-v2-setup-21v.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

See known-issue intune-onenote-406 for required URL whitelist.

## Scenario 16: Workaround Summary
> 来源: onenote-china-intune-feature-gaps.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Unsupported Feature | Recommended Workaround |
|--------------------|----------------------|
| Android Enterprise | Use Android DA (supports up to Android 15) |
| Google Play Store | LOB (.apk) sideloading via Intune; MCVKB Android App Store guide |
| Microsoft Tunnel VPN | Third-party VPN apps + Per-App VPN profile |
| New Microsoft Store / winget | Win32 (.intunewin) app packaging |
| Windows Feature/Quality Update | WSUS or third-party patch management |
| Cloud PKI | On-premises ADCS + NDES + Intune Certificate Connector (SCEP) |
| On-Premises Exchange Connector | Use Modern Authentication / Hybrid Exchange |

## Scenario 17: Prerequisites
> 来源: onenote-intune-21v-kusto-access.md | 适用: Mooncake ✅

### 排查步骤

1. Request **IntuneKusto-CSSMoncake** permission via MyAccess:
   https://coreidentity.microsoft.com/manage/Entitlement/entitlement/intunekustoc-ftdh

2. A smart card (physical or virtual) is required for Mooncake Kusto connection.

3. Use **REDMOND credentials** (not CME).

## Connection Settings

| Setting | Value |
|---------|-------|
| Data Source | `https://intunecn.chinanorth2.kusto.chinacloudapi.cn` |
| Connection Alias | `Intunecn` |
| Client Security | `dSTS-Federated` |

Close and reopen Kusto Explorer after permission grant to refresh.

Reference: https://www.intunewiki.com/wiki/Enable_Kusto_in_Mooncake

## Scenario 18: Sample Query: Policy Deployment Status (21V)
> 来源: onenote-intune-21v-kusto-access.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kql
// Count overall deployment status for a specific policy
DeviceManagementProvider  
| where env_time >= ago(7h)
| where EventId == 5786
| project PreciseTimeStamp, ActivityId, PolicyName=name, PolicyType=typeAndCategory,
          Applicability=applicablilityState, Compliance=reportComplianceState,
          deviceId=ActivityId, PolicyID=['id'] 
| where PolicyID in ("AC_{accountId}/LogicalName_{policyId}/1")
| where Applicability=="Applicable"
| summarize Success=(count(Compliance=="Compliant")>0),
            Pending=(count(Compliance=="Compliant")==0),
            Error=(count(Compliance=="Error")>0) by ActivityId, PolicyName, PolicyType
| summarize SuccessCount=sum(Success), PendingCount=sum(Pending),
            ErrorCount=sum(Error) by PolicyName, PolicyType
| order by PolicyName desc
```
`[来源: onenote-intune-21v-kusto-access.md]`

**How to get PolicyID**: `AC_{accountId}/LogicalName_{policyId}/number`

You can also retrieve PolicyID from device logs:
```kql
DeviceManagementProvider 
| where env_time > ago(10d) 
| where ActivityId == "{deviceId}"
| project env_time, userId, accountId, DeviceID=ActivityId, PolicyName=name,
          PolicyType=typeAndCategory, Applicability=applicablilityState,
          Compliance=reportComplianceState, TaskName, EventId, EventMessage, message 
| order by env_time asc
```
`[来源: onenote-intune-21v-kusto-access.md]`

---

## 判断逻辑参考

### Feature Availability Table

| Feature | Available in 21v Intune | Comments |
|---------|------------------------|----------|
| Co-management | ✅ Yes (partial) | No CMG available in 21v; only Hybrid AADJ + co-management supported; CmClient can only auth with local AD |
| Microsoft Tunnel | ❌ No | Requires MDE; China law only allows 3 major telecoms to operate VPN services |
| Microsoft Endpoint Manager / Endpoint Analytics / Log Analytics | ❌ No | |
| Tenant Attach | ❌ No | |
| Derived Credentials | ❌ No | |
| On-Premises Exchange Connector | ❌ No | EOL on Global in CY22; will **never** GA for 21v Intune |
| Mobile Threat Defense (MTD) Connector | ✅ Yes | https://learn.microsoft.com/en-us/mem/intune/fundamentals/whats-new#21vianet-support-for-mobile-threat-defense-connectors |
| Windows Autopilot | ✅ Yes | Autopilot v2 GA in 21v from Sept 2024 (PM: juanita.baptiste@microsoft.com) |
| Microsoft Store (new) / winget | ❌ No | Will not support for Mooncake; compliance issue with winget; DCR-M365-5114 |
| SafetyNet Device Attestation | ❌ No | Google Mobile Services dependency |
| Managing apps from Google Play Store | ❌ No | Google Mobile Services dependency |
| Android Enterprise (Work Profile / COBO / COPE / COSU) | ❌ No | Google Mobile Services dependency |
| Android (AOSP) management for corporate devices | ❌ No | Depends on OEM AOSP support; Feature 14514386; DCR-M365-6783 |
| Jamf partner integration for macOS | ❌ No | Depends on Jamf Apple Management |
| Fencing | ❌ No | |
| Enterprise Application | ❌ No | Azure feature |
| Microsoft Edge Sign In | ❌ No | AAD related |
| Apple Business Manager (ABM) with 21v AAD Federation | ❌ No | ABM app not available in 21v AAD |
| Microsoft Defender for Endpoint (including Tamper Protection) | ❌ No | Depends on MDE |
| Windows AutoPatch | ❌ No | |
| Cloud PKI | ❌ No | No Intune Suite & Cloud PKI add-on license; Feature 27029020 |
| AVD Enrollment with 21v Intune | ❌ No | Feature 15571094 |
| Windows Feature & Quality Update (WUfB) | ❌ No | Dev team confirms no plan (2024-06); DCR-M365-4825 |
| Windows Remediation | ❓ Unknown | |
| Windows Update for Business Report | ❌ No | DCR-M365-6907 |

### Workaround Summary

| Unsupported Feature | Recommended Workaround |
|--------------------|----------------------|
| Android Enterprise | Use Android DA (supports up to Android 15) |
| Google Play Store | LOB (.apk) sideloading via Intune; MCVKB Android App Store guide |
| Microsoft Tunnel VPN | Third-party VPN apps + Per-App VPN profile |
| New Microsoft Store / winget | Win32 (.intunewin) app packaging |
| Windows Feature/Quality Update | WSUS or third-party patch management |
| Cloud PKI | On-premises ADCS + NDES + Intune Certificate Connector (SCEP) |
| On-Premises Exchange Connector | Use Modern Authentication / Hybrid Exchange |

### Sample Query: Policy Deployment Status (21V)

| where env_time >= ago(7h)
| where EventId == 5786
| project PreciseTimeStamp, ActivityId, PolicyName=name, PolicyType=typeAndCategory,

### Sample Query: Policy Deployment Status (21V)

| where PolicyID in ("AC_{accountId}/LogicalName_{policyId}/1")
| where Applicability=="Applicable"
| summarize Success=(count(Compliance=="Compliant")>0),

### Sample Query: Policy Deployment Status (21V)

| summarize SuccessCount=sum(Success), PendingCount=sum(Pending),

---

> ⚠️ **21V (Mooncake) 注意**: 本主题包含 21V 特有的限制或配置，请注意区分 Global 与 21V 环境差异。
