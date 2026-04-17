# INTUNE macOS 软件更新 / DDM — 已知问题详情

**条目数**: 14 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: macOS Software Update policy InstallLater action not working on macOS 13 devices; update not scheduled for installation.
**Solution**: For macOS 13, use InstallAction:Default instead of InstallLater. Do not set Priority for major version updates. Consider DDM for macOS 14+/iOS 17+.
`[Source: onenote, Score: 9.5]`

### Step 2: 无法将 iOS/iPadOS 应用的管理类型从 MDM 切换到 DDM（或反之），创建后选项灰显不可更改
**Solution**: 必须创建一个新的应用条目并选择目标管理类型（DDM 或 MDM），无法修改现有应用的管理类型
`[Source: ado-wiki, Score: 9.0]`

### Step 3: DDM StatusReport 显示 Valid: Invalid，错误代码 Error.ConfigurationCannotBeApplied
**Solution**: 1. 检查 DDM 策略中配置的目标 OS 版本；2. 更新策略使目标版本不低于设备当前版本；3. 使用 Kusto 查询 DDMHighLevelCheckin 函数检查 StatusReportRequest 中的错误详情
`[Source: ado-wiki, Score: 9.0]`

### Step 4: macOS Platform SSO password synchronization silently fails — local password not updated to match Entra ID password
**Solution**: Ensure password complexity requirements between local machine passcode policy (MDM) and Microsoft Entra ID password policy are aligned. Intune password/compliance policy must match Entra ID password policy.
`[Source: ado-wiki, Score: 9.0]`

### Step 5: macOS legacy MDM-based software update policies deprecated, replaced by DDM
**Solution**: Migrate to DDM-based policies at https://aka.ms/Intune/Apple-DDM-software-updates. Existing legacy policies remain active
`[Source: ado-wiki, Score: 9.0]`

### Step 6: DDM (Declarative Device Management) policy assigned to all users but some devices do not show the policy under device configuration.
**Solution**: Verify enrollment mechanism and device readiness prerequisites before broad DDM policy deployment. Do not deploy policies en masse until enrollment and device state are fully confirmed.
`[Source: onenote, Score: 8.5]`

### Step 7: updates.log shows Agent sync failed, error = 0x80CF000E. WARNING: Updates client failed Searching for update with error 0x80cf000e
**Solution**: If authority is set to Office and customer has an Intune subscription then see this article to enable coexistence
`[Source: contentidea-kb, Score: 7.5]`

### Step 8: Tried to enable the Teamviewer connection for devices but in the last step, after logging in to TV site and allowing the Teamviewer permissions, we...
**Solution**: Use a company administrator
     admin that has Intune license
 Use an admin with Update
     Remote Assistance permission
`[Source: contentidea-kb, Score: 7.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | macOS Software Update policy InstallLater action not working on macOS 13 devi... | macOS 13 does not support InstallLater action (nor DownloadOnly, NotifyOnly, ... | For macOS 13, use InstallAction:Default instead of InstallLater. Do not set P... | 9.5 | onenote |
| 2 | 无法将 iOS/iPadOS 应用的管理类型从 MDM 切换到 DDM（或反之），创建后选项灰显不可更改 | Intune 设计限制：应用创建时选择的管理类型（DDM 或 MDM）为不可变属性 | 必须创建一个新的应用条目并选择目标管理类型（DDM 或 MDM），无法修改现有应用的管理类型 | 9.0 | ado-wiki |
| 3 | DDM StatusReport 显示 Valid: Invalid，错误代码 Error.ConfigurationCannotBeApplied | DDM 策略中指定的目标 OS 版本低于设备当前运行的 OS 版本（如目标 15.7.4 但设备已运行 26.3.1） | 1. 检查 DDM 策略中配置的目标 OS 版本；2. 更新策略使目标版本不低于设备当前版本；3. 使用 Kusto 查询 DDMHighLevelChe... | 9.0 | ado-wiki |
| 4 | macOS Platform SSO password synchronization silently fails — local password n... | MDM passcode policy specifies higher complexity requirements than the Microso... | Ensure password complexity requirements between local machine passcode policy... | 9.0 | ado-wiki |
| 5 | macOS legacy MDM-based software update policies deprecated, replaced by DDM | Starting 2510 release, legacy MDM update policies deprecated. From 2602, no n... | Migrate to DDM-based policies at https://aka.ms/Intune/Apple-DDM-software-upd... | 9.0 | ado-wiki |
| 6 | DDM (Declarative Device Management) policy assigned to all users but some dev... | Enrollment mechanism and prerequisites not fully established before policy de... | Verify enrollment mechanism and device readiness prerequisites before broad D... | 8.5 | onenote |
| 7 | updates.log shows Agent sync failed, error = 0x80CF000E. WARNING: Updates cli... | MDM authority is not set to Intune/SCCM. Agents may not be allowed to sync if... | If authority is set to Office and customer has an Intune subscription then se... | 7.5 | contentidea-kb |
| 8 | Tried to enable the Teamviewer connection for devices but in the last step, a... | Intune license missing from the admin account | Use a company administrator      admin that has Intune license  Use an admin ... | 7.5 | contentidea-kb |
| 9 | Starting with the update planned for Summer 2019, Office 365 Mobile Device Ma... |  |  | 7.5 | contentidea-kb |
| 10 | Jamf has released some new features within it’s console to help troubleshoot ... |  |  | 7.5 | contentidea-kb |
| 11 | After upgrading macOS devices to Big Sur (11.x), users are forced to reset th... | Notes from ICM - This behavior is by design.&nbsp;&nbsp;For passcode policies... | Important note in our documentation&nbsp;to share with the customer:1. On mac... | 7.5 | contentidea-kb |
| 12 | During the user-driven autopilot experience, before the user setup phase your... | This can occur if there is a Device Guard or some other policy applied to the... | To work around this issue, assign the policy to a user group instead. | 7.5 | contentidea-kb |
| 13 | Admin initiates Remote task → New remote assistance session from Intune. No n... | The Intune RBAC role assigned to the admin user is missing the required permi... | Review the RBAC role assigned to the admin initiating the remote assistance t... | 7.5 | contentidea-kb |
| 14 | Jamf has released some new features within it’s console to help troubleshoot ... |  |  | 3.0 | contentidea-kb |
