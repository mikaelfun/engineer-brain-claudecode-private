# INTUNE macOS 软件更新 / DDM — 排查速查

**来源数**: 3 | **21V**: 部分 (13/14)
**条目数**: 14 | **最后更新**: 2026-04-17

## 快速排查路径

1. **macOS Software Update policy InstallLater action not working on macOS 13 devices; update not scheduled for installation.**
   → For macOS 13, use InstallAction:Default instead of InstallLater. Do not set Priority for major version updates. Consider DDM for macOS 14+/iOS 17+. `[onenote, 🟢 9.5]`

2. **无法将 iOS/iPadOS 应用的管理类型从 MDM 切换到 DDM（或反之），创建后选项灰显不可更改**
   → 必须创建一个新的应用条目并选择目标管理类型（DDM 或 MDM），无法修改现有应用的管理类型 `[ado-wiki, 🟢 9.0]`

3. **DDM StatusReport 显示 Valid: Invalid，错误代码 Error.ConfigurationCannotBeApplied**
   → 1. 检查 DDM 策略中配置的目标 OS 版本；2. 更新策略使目标版本不低于设备当前版本；3. 使用 Kusto 查询 DDMHighLevelCheckin 函数检查 StatusReportRequest 中的错误详情 `[ado-wiki, 🟢 9.0]`

4. **macOS Platform SSO password synchronization silently fails — local password not updated to match Entra ID password**
   → Ensure password complexity requirements between local machine passcode policy (MDM) and Microsoft Entra ID password policy are aligned. Intune password/compliance policy must match Entra ID passwor... `[ado-wiki, 🟢 9.0]`

5. **macOS legacy MDM-based software update policies deprecated, replaced by DDM**
   → Migrate to DDM-based policies at https://aka.ms/Intune/Apple-DDM-software-updates. Existing legacy policies remain active `[ado-wiki, 🟢 9.0]`

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | macOS Software Update policy InstallLater action not working on macOS 13 devices; update not sche... | macOS 13 does not support InstallLater action (nor DownloadOnly, NotifyOnly, InstallForceRestart)... | For macOS 13, use InstallAction:Default instead of InstallLater. Do not set Priority for major ve... | 🟢 9.5 | onenote: Mooncake POD Support Notebook/POD/VMS... |
| 2 | 无法将 iOS/iPadOS 应用的管理类型从 MDM 切换到 DDM（或反之），创建后选项灰显不可更改 | Intune 设计限制：应用创建时选择的管理类型（DDM 或 MDM）为不可变属性 | 必须创建一个新的应用条目并选择目标管理类型（DDM 或 MDM），无法修改现有应用的管理类型 | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FApp%20Management%2FApple%2FiOS%20and%20iPadOS%2FApple%20DDM%20Apps) |
| 3 | DDM StatusReport 显示 Valid: Invalid，错误代码 Error.ConfigurationCannotBeApplied | DDM 策略中指定的目标 OS 版本低于设备当前运行的 OS 版本（如目标 15.7.4 但设备已运行 26.3.1） | 1. 检查 DDM 策略中配置的目标 OS 版本；2. 更新策略使目标版本不低于设备当前版本；3. 使用 Kusto 查询 DDMHighLevelCheckin 函数检查 StatusRepo... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FApp%20Management%2FApple%2FiOS%20and%20iPadOS%2FApple%20DDM%20Apps) |
| 4 | macOS Platform SSO password synchronization silently fails — local password not updated to match ... | MDM passcode policy specifies higher complexity requirements than the Microsoft Entra ID account ... | Ensure password complexity requirements between local machine passcode policy (MDM) and Microsoft... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Config%20Features%20Restrictions%20and%20Custom%2FmacOS%2FPlatformSSO%20macOS) |
| 5 | macOS legacy MDM-based software update policies deprecated, replaced by DDM | Starting 2510 release, legacy MDM update policies deprecated. From 2602, no new legacy policies c... | Migrate to DDM-based policies at https://aka.ms/Intune/Apple-DDM-software-updates. Existing legac... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FManage%20Software%20Updates%2FmacOS) |
| 6 | DDM (Declarative Device Management) policy assigned to all users but some devices do not show the... | Enrollment mechanism and prerequisites not fully established before policy deployment. When devic... | Verify enrollment mechanism and device readiness prerequisites before broad DDM policy deployment... | 🟢 8.5 | onenote: Mooncake POD Support Notebook/POD/VMS... |
| 7 | updates.log shows Agent sync failed, error = 0x80CF000E. WARNING: Updates client failed Searching... | MDM authority is not set to Intune/SCCM. Agents may not be allowed to sync if the authority is no... | If authority is set to Office and customer has an Intune subscription then see this article to en... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4019912) |
| 8 | Tried to enable the Teamviewer connection for devices but in the last step, after logging in to T... | Intune license missing from the admin account | Use a company administrator      admin that has Intune license  Use an admin with Update      Rem... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4091165) |
| 9 | Starting with the update planned for Summer 2019, Office 365 Mobile Device Management (MDM) uses ... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4471384) |
| 10 | Jamf has released some new features within it’s console to help troubleshoot the integration betw... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4493346) |
| 11 | After upgrading macOS devices to Big Sur (11.x), users are forced to reset their password. | Notes from ICM - This behavior is by design.&nbsp;&nbsp;For passcode policies, we always include ... | Important note in our documentation&nbsp;to share with the customer:1. On macOS devices running 1... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4613888) |
| 12 | During the user-driven autopilot experience, before the user setup phase your device unexpectedly... | This can occur if there is a Device Guard or some other policy applied to the device that require... | To work around this issue, assign the policy to a user group instead. | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4619827) |
| 13 | Admin initiates Remote task → New remote assistance session from Intune. No notification is recei... | The Intune RBAC role assigned to the admin user is missing the required permission: Microsoft.Int... | Review the RBAC role assigned to the admin initiating the remote assistance task. Ensure the role... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5087041) |
| 14 | Jamf has released some new features within it’s console to help troubleshoot the integration betw... |  |  | 🟡 3.0 | contentidea-kb |

> 本 topic 有排查工作流 → [排查工作流](workflows/macos-update.md)
> → [已知问题详情](details/macos-update.md)
