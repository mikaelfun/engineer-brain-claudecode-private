# INTUNE 设备操作（擦除/锁定/重置等） — 已知问题详情

**条目数**: 72 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: Device unexpectedly disappears from Intune device list. Customer did not manually retire or wipe the device. No admin action found in Intune audit ...
**Solution**: Confirm auto-removal in Kusto: `IntuneEvent | where ComponentName == "StatelessDeviceOverflowService" | where EventUniqueName == "DeviceRemovalRuleAudit" | where AccountId == "<accountId>" | where * has "<deviceId>"`. Advise customer to review and adjust Device Cleanup Rules in Intune portal (Devices > Device cleanup rules). Re-enroll device if needed.
`[Source: onenote, Score: 9.5]`

### Step 2: Device selectively wiped or retired from Intune but continues to access Exchange/O365 resources for several hours
**Solution**: Expected behavior due to Exchange caching. Implement additional data protection measures for retired devices. Access revoked automatically after cache period (~6 hours).
`[Source: ado-wiki, Score: 9.0]`

### Step 3: CritSit: 客户意外从 Intune 控制台或通过 Graph API 批量删除了设备，需要恢复
**Solution**: 1. 确认 Entra ID 设备记录是否仍存在（不存在则无法恢复，需重新注册）；2. 立即关闭所有受影响设备防止重新 check-in；3. 收集已删除设备的 Intune Device ID CSV；4. 获取 Global Admin 或 Intune Admin 的书面邮件授权；5. 与 TL/TA 立即升级到 IET，附上授权邮件 + CSV + 影响摘要；6. 使用专用 ICM 模板（Sev 3 自动触发 CxE OCE 24/7）
`[Source: ado-wiki, Score: 9.0]`

### Step 4: Device Wipe 操作在 Intune 门户显示 Pending 状态持续不变，但设备实际已被擦除
**Solution**: 确认设备已成功擦除后，从 Intune 服务中手动删除该设备记录
`[Source: ado-wiki, Score: 9.0]`

### Step 5: Android Device Admin 注册设备的 Reset Passcode 操作灰显不可用
**Solution**: 这是 Google 的平台限制，Android 7.0+ Device Admin 设备无法通过 MDM 重置密码；建议迁移到 Android Enterprise 管理模式
`[Source: ado-wiki, Score: 9.0]`

### Step 6: iOS/iPadOS 设备 Disable Activation Lock 代码不显示或操作灰显
**Solution**: 1. 确保设备为 Supervised 模式且启用了 Activation Lock 限制策略；2. 通过 Graph API 检查代码：GET /beta/deviceManagement/manageddevices('{id}')?$select=activationLockBypassCode；3. 点击 Disable Activation Lock 后立即复制代码（15 天内有效），在 Wipe 前使用
`[Source: ado-wiki, Score: 9.0]`

### Step 7: 执行 Retire 操作后应用未被卸载
**Solution**: 确认应用是否为 Intune 受管应用（Required 部署或通过 Company Portal 安装的 Available 应用）；非受管应用需手动卸载
`[Source: ado-wiki, Score: 9.0]`

### Step 8: Android Enterprise Work Profile 设备的 Wipe 操作灰显不可用
**Solution**: 这是 Google 的预期限制，Work Profile 设备无法通过 Intune 执行 Wipe；如需完整擦除建议使用 Fully Managed 管理模式
`[Source: ado-wiki, Score: 9.0]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Device unexpectedly disappears from Intune device list. Customer did not manu... | Intune device cleanup rule (configured in Intune > Devices > Device cleanup r... | Confirm auto-removal in Kusto: `IntuneEvent / where ComponentName == "Statele... | 9.5 | onenote |
| 2 | Device selectively wiped or retired from Intune but continues to access Excha... | Exchange caches access rights for up to six hours. After selective wipe or re... | Expected behavior due to Exchange caching. Implement additional data protecti... | 9.0 | ado-wiki |
| 3 | CritSit: 客户意外从 Intune 控制台或通过 Graph API 批量删除了设备，需要恢复 | IT 管理员误操作在 Intune 门户手动删除设备，或自动化脚本通过 Graph API 触发了批量删除 | 1. 确认 Entra ID 设备记录是否仍存在（不存在则无法恢复，需重新注册）；2. 立即关闭所有受影响设备防止重新 check-in；3. 收集已删除... | 9.0 | ado-wiki |
| 4 | Device Wipe 操作在 Intune 门户显示 Pending 状态持续不变，但设备实际已被擦除 | 设备在重置开始前未能将状态报告回 Intune 服务，这是预期行为（时序问题） | 确认设备已成功擦除后，从 Intune 服务中手动删除该设备记录 | 9.0 | ado-wiki |
| 5 | Android Device Admin 注册设备的 Reset Passcode 操作灰显不可用 | Google 在 Android 7.0+ 的 Device Admin API 中移除了密码重置功能（防勒索软件措施） | 这是 Google 的平台限制，Android 7.0+ Device Admin 设备无法通过 MDM 重置密码；建议迁移到 Android Enter... | 9.0 | ado-wiki |
| 6 | iOS/iPadOS 设备 Disable Activation Lock 代码不显示或操作灰显 | (1) 代码已过期被服务清除（有效期 15 天）；(2) 设备未通过 Device Restriction Policy 设为 Supervised 模式... | 1. 确保设备为 Supervised 模式且启用了 Activation Lock 限制策略；2. 通过 Graph API 检查代码：GET /bet... | 9.0 | ado-wiki |
| 7 | 执行 Retire 操作后应用未被卸载 | 该应用不被视为 Managed Application——只有通过 Intune 服务部署的应用（Required 部署或 Available 部署后用户... | 确认应用是否为 Intune 受管应用（Required 部署或通过 Company Portal 安装的 Available 应用）；非受管应用需手动卸载 | 9.0 | ado-wiki |
| 8 | Android Enterprise Work Profile 设备的 Wipe 操作灰显不可用 | Google 不允许 MDM Provider 对 Work Profile 设备执行 Factory Reset，这是平台限制 | 这是 Google 的预期限制，Work Profile 设备无法通过 Intune 执行 Wipe；如需完整擦除建议使用 Fully Managed 管理模式 | 9.0 | ado-wiki |
| 9 | 对离线设备发起 Retire/Wipe 后设备一直处于 Pending 状态 | 设备离线无法接收 MDM 命令，需等待设备重新联网并与 Intune 服务同步 | 设备在 MDM 证书过期前上线即会执行操作；MDM 证书有效期 1 年（自动续期）；若设备在证书过期前未上线则无法同步；证书过期 180 天后设备会自动从... | 9.0 | ado-wiki |
| 10 | Android Enterprise Work Profile passcode reset fails; OMADMLog shows 'ResetPa... | The ResetPasswordToken has not been activated on the device. Android Work Pro... | Deploy Android Enterprise Device Restrictions profile (Work Profile Only) wit... | 8.0 | onenote |
| 11 | In Intune Mobile Application Management Policies, there are several options t... | By Design. | Although this option is listed in the Intune service, it actually requires th... | 7.5 | contentidea-kb |
| 12 | When iOS Device is unassigned from DEP Portal but after DEP Sync, Delete acti... | This is a code fault where if the table &quot;MDMCorpOwnedDevices&quot; has b... | There are two options for a work around on this problem for the customer whil... | 7.5 | contentidea-kb |
| 13 | There are situations where customers want to know how long a Remote Wipe issu... |  |  | 7.5 | contentidea-kb |
| 14 | Issue: SCCM does not permit selecting multiple devices and performing Remote ... |  |  | 7.5 | contentidea-kb |
| 15 | Intune Device RemovalBrowse to https://portal.azure.com/#blade/Microsoft_Intu... |  |  | 7.5 | contentidea-kb |
| 16 | How to capture a bug report from an Android device for diagnostic purposes. B... |  |  | 7.5 | contentidea-kb |
| 17 | When viewing the status of Device Actions in the Azure Intune portal, some ac... | This can occur if the Azure user account used to initiated the device action ... | Once this is done you can�t go back and fix it, because even if you add a lic... | 7.5 | contentidea-kb |
| 18 | When viewing the Audit Logs under Devices Actions in the Azure Intune portal,... | This can occur if the Azure user account used to initiated the device action ... | Once this is done you can�t go back and fix it, because even if you add a lic... | 7.5 | contentidea-kb |
| 19 | In the SCCM console the option to "Wipe the mobile device and retire it from ... | By design. In version 1710 the option to wipe non-corporate devices is no lon... | In order to remote wipe these devices, the device ownership category must be ... | 7.5 | contentidea-kb |
| 20 | When you attempt to enroll a Zebra device such as the TC75x in Intune you wil... | The issue is caused by a conflict between Intune and Zebra's MDM solution. | Zebra has released a hotfix on their website that should be in the latest Jan... | 7.5 | contentidea-kb |
| 21 | When a user is assigned an app protection policy for Skype for Business and i... | Expected Behavior | The product group states that this state occurs when clients attempt to sent ... | 7.5 | contentidea-kb |
| 22 | There are times when we need to know how a device became unenrolled. This art... | End User unenrollment | Here is an example to see if an end user has initiated a wipe from the Compan... | 7.5 | contentidea-kb |
| 23 | Users manually uninstall the Company Portal application from an enrolled Andr... |  |  | 7.5 | contentidea-kb |
| 24 | This article documents the current subject matter experts (SMEs) for the Intu... |  |  | 7.5 | contentidea-kb |
| 25 | After configuring and assigning a device restriction configuration profile re... | This can occur if the device has been enrolled as Device Owner. This is by de... | This is expected behavior.WorkAround:&nbsp;Note that you can still create a p... | 7.5 | contentidea-kb |
| 26 | When to use it  &nbsp;  Wipe  Wipe is synonymous with Factory Reset, so only ... | Many times customers will want to know the result of a retire/wipe action or ... | Microsoft Documentation  https://docs.microsoft.com/en-us/intune/devices-wipe... | 7.5 | contentidea-kb |
| 27 | The feedback process for RAVE has changed. In addition to the traditional ema... |  |  | 7.5 | contentidea-kb |
| 28 | On April 29, 2019, we sent a communication to customers letting them know the... |  |  | 7.5 | contentidea-kb |
| 29 | The customer is trying to wipe an Intune managed device from the Intune Porta... | The MDM authority of the user who enrolled in the device is Office 365 and no... | Assign an Intune license to the user. If the customer doesn’t want to assign ... | 7.5 | contentidea-kb |
| 30 | I have enabled the Factory reset protection emails policy and it is successfu... | This is the expected behavior from Google as these emails only apply when a n... | We recommend blocking Factory reset in this same policy as that will only all... | 7.5 | contentidea-kb |
| 31 | In the Lookout MTP Console, why is a device is not leaving the “Pending” state? | A device that is showing in the “Pending” States means the end user has not o... | Confirm that the user has opened the LookOut for Work application and selecte... | 7.5 | contentidea-kb |
| 32 | What if I want to move a device previously using Lookout MTP/Intune to anothe... |  |  | 7.5 | contentidea-kb |
| 33 | Before you begin troubleshooting a problem, be sure to check for known Emergi... |  |  | 7.5 | contentidea-kb |
| 34 | Customer scenario that sometimes we can face and even in our own environment,... |  |  | 7.5 | contentidea-kb |
| 35 | Microsoft DocumentationIntune: Top Questions and Answers for Intune Device Ac... |  |  | 7.5 | contentidea-kb |
| 36 | When to use itEnableLostMode is used when you recently have lost a Supervised... |  |  | 7.5 | contentidea-kb |
| 37 | Starting in 1907 the Intune Devices-All devices blade will display whether a ... |  |  | 7.5 | contentidea-kb |
| 38 | Create and assign update ringsSign in to&nbsp;Intune.Select&nbsp;Software upd... |  |  | 7.5 | contentidea-kb |
| 39 | What is the primary user?The primary user property is used to map a licensed ... |  |  | 7.5 | contentidea-kb |
| 40 | Description:You can erase all data from a macOS device, including the operati... |  |  | 7.5 | contentidea-kb |
| 41 | An Intune Device Cleanup rule will not remove any of the following devices:An... |  |  | 7.5 | contentidea-kb |
| 42 | Device Action to retire\wipe a device no longer removes the device from Azure... | In February of 2019, this process was changed by the Product Group. | Per result of IcM &quot;https://portal.microsofticm.com/imp/v3/incidents/deta... | 7.5 | contentidea-kb |
| 43 | Consider the following scenario:You issue&nbsp;a retire or wipe action to a d... | This is by design.&nbsp; | If the device hasn't checked in yet with the Intune service to receive the co... | 7.5 | contentidea-kb |
| 44 | This article documents the support collaboration process established and agre... |  |  | 7.5 | contentidea-kb |
| 45 | Google have made trainings available for their partners on Mindspace’s fathom... |  |  | 7.5 | contentidea-kb |
| 46 | Table&nbsp;DeviceLifecycle&nbsp;Scenario&nbsp;I will use this table when look... |  |  | 7.5 | contentidea-kb |
| 47 | Scenario &nbsp; I use this table to find Device Actions issued with a Graph c... |  |  | 7.5 | contentidea-kb |
| 48 | Currently it is not possible to collect Company Portal logs from the UI on Po... |  |  | 7.5 | contentidea-kb |
| 49 | Device enrollment limit restriction policy does not block device enrollment e... | This can occur if some of the devices are not counted as part of the device c... | Confirm whether the devices under the user are all eligible for being counted... | 7.5 | contentidea-kb |
| 50 | When One lock is enabled on an Android for Work (aka Android Enterprise) devi... | When one lock is enabled, if you perform “Reset work profile passcode”, it wi... | This is by-design. | 7.5 | contentidea-kb |
| 51 | When performing a &quot;Reset passcode&quot; action on a&nbsp;personally owne... | This can occur if the device does not meet the requirements for work profile ... | For Android BYOD work profile device, the device reset has some prerequisites... | 7.5 | contentidea-kb |
| 52 | Like all Azure services, Intune leverages Kusto to log user and system action... |  |  | 7.5 | contentidea-kb |
| 53 | Welcome to Intune's workflow for Android device configuration. Choose an area... |  |  | 7.5 | contentidea-kb |
| 54 | Use this template when posting a question to the Device Actions SME channel. ... |  | Case number: Intune DeviceId:&nbsp; What Device Action was used? See list: Ma... | 7.5 | contentidea-kb |
| 55 | When a user no longer needs to use devices managed by Microsoft Intune, there... |  |  | 7.5 | contentidea-kb |
| 56 | In this article you will find useful Kusto queries for the available Device A... | Troubleshooting/Break Fix issues A few behaviors to note: Deprovisioning a de... | Device Actions  ​For results in Col2, refer to the table in the &quot;More In... | 7.5 | contentidea-kb |
| 57 | This article contains Kusto queries to help you determine which user/admin in... |  |  | 7.5 | contentidea-kb |
| 58 | この記事では、次の方法について説明します Android Enterprise の登録に関する問題のトラブルシューティング。 手記：テナントとアカウント ... |  |  | 7.5 | contentidea-kb |
| 59 | Android allows for 2 types of deployment methods for OEMConfig, traditional a... |  |  | 7.5 | contentidea-kb |
| 60 | When executing the below query in a situation where you need to troubleshoot ... |  |  | 7.5 | contentidea-kb |
| 61 | Even a few years after the announcement of the deprecation of Android device ... |  |  | 7.5 | contentidea-kb |
| 62 | If you need to&nbsp;bulk retire all devices (e.g. Windows and Android) at onc... |  |  | 7.5 | contentidea-kb |
| 63 | Wipe or Retire action shows as Pending indefinitely in Intune console | Devices do not always report status back to Intune before reset/removal starts | Verify action succeeded on device then manually delete device record from Int... | 5.5 | mslearn |
| 64 | The feedback process for RAVE has changed. In addition to the traditional ema... |  |  | 4.5 | contentidea-kb |
| 65 | On April 29, 2019, we sent a communication to customers letting them know the... |  |  | 4.5 | contentidea-kb |
| 66 | In the Lookout MTP Console, why is a device is not leaving the “Pending” state? | A device that is showing in the “ Pending ” States means the end user has not... | Confirm that the user has opened the LookOut for Work application and selecte... | 4.5 | contentidea-kb |
| 67 | What if I want to move a device previously using Lookout MTP/Intune to anothe... |  |  | 4.5 | contentidea-kb |
| 68 | Before you begin troubleshooting a problem, be sure to check for known Emergi... |  |  | 4.5 | contentidea-kb |
| 69 | After configuring and assigning a device restriction configuration profile re... | This can occur if the device has been enrolled as Device Owner. This is by de... | This is expected behavior. WorkAround : Note that you can still create a pass... | 3.0 | contentidea-kb |
| 70 | When to use it Wipe Wipe is synonymous with Factory Reset, so only use this w... | Many times customers will want to know the result of a retire/wipe action or ... | Microsoft Documentation https://docs.microsoft.com/en-us/intune/devices-wipe ... | 3.0 | contentidea-kb |
| 71 | The customer is trying to wipe an Intune managed device from the Intune Porta... | The MDM authority of the user who enrolled in the device is Office 365 and no... | Assign an Intune license to the user. If the customer doesn’t want to assign ... | 3.0 | contentidea-kb |
| 72 | I have enabled the Factory reset protection emails policy and it is successfu... | This is the expected behavior from Google as these emails only apply when a n... | We recommend blocking Factory reset in this same policy as that will only all... | 3.0 | contentidea-kb |
