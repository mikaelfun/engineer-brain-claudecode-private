# INTUNE Android MAM 与 App Protection — 排查速查

**来源数**: 3 | **21V**: 部分 (14/15)
**条目数**: 15 | **最后更新**: 2026-04-17

## 快速排查路径

1. **Admin initiated MAM selective wipe from Intune portal but cannot confirm whether the wipe request was actually received and processed by the Intune backend service.**
   → Step 1: Query HttpSubsystem with accountId and httpVerb=POST and url contains 'wipe' to confirm backend received the wipe request. Step 2: Query IntuneEvent with AccountId, filter for 'wipe' and us... `[onenote, 🟢 9.5]`

2. **Android LOB 应用集成 Intune MAM SDK 后 Gradle 构建失败**
   → 1. 检查 Azure App Registration 的 scope 和 permissions；2. 确认使用 Android Gradle plugin 3.0+ 和 Gradle 4.1+；3. 尝试降低 SDK 库版本验证兼容性；4. 检查 ProGuard 规则是否包含 SDK 配置；5. 如低版本正常则联系 TA 考虑 ICM `[ado-wiki, 🟢 9.0]`

3. **On Android, the Intune MAM Protected version ofManaged Azure Information Protection can Save as PDF when Save As is prevented by Policy.**
   → The &quot;Disable Printing&quot; parameter must be set to YES in the Intune App Protection policy to prevent the Print>Save as PDF functionality from working in a managed app. `[contentidea-kb, 🔵 7.5]`

4. **When accessing Microsoft Planner, error: "You can't get there from here. It looks like you're trying to open this resource with an app that hasn't been approved by your IT department."**
   → Remove existing conditional access policies in the Intune App Protection (MAM) blade and configure them in the Azure CA blade: 1) Disable existing Exchange Online CA policy. 2) Go to Azure AD > Con... `[contentidea-kb, 🔵 7.5]`

5. **In August 2018, Google announced the release of Android P (Android 9 Pie). The Intune product team has been testing each preview, and currently all existing Intune MDM and Intune App Protection Pol...**
   →  `[contentidea-kb, 🔵 7.5]`

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Admin initiated MAM selective wipe from Intune portal but cannot confirm whether the wipe request... |  | Step 1: Query HttpSubsystem with accountId and httpVerb=POST and url contains 'wipe' to confirm b... | 🟢 9.5 | onenote: Mooncake POD Support Notebook/POD/VMS... |
| 2 | Android LOB 应用集成 Intune MAM SDK 后 Gradle 构建失败 | SDK 版本与 IDE 构建工具、Android Gradle plugin 或 framework 版本不兼容；Gradle 包签名配置不正确；Azure App Registration s... | 1. 检查 Azure App Registration 的 scope 和 permissions；2. 确认使用 Android Gradle plugin 3.0+ 和 Gradle 4.... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevelop%20and%20Customize%2FApp%20SDK%20for%20Android) |
| 3 | On Android, the Intune MAM Protected version ofManaged Azure Information Protection can Save as P... | By Design. The &quot;Save as PDF&quot; is discoverable under the Print option of the Azure Inform... | The &quot;Disable Printing&quot; parameter must be set to YES in the Intune App Protection policy... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4022831) |
| 4 | When accessing Microsoft Planner, error: "You can't get there from here. It looks like you're try... | An Exchange Online conditional access policy was created using the classic Silverlight portal or ... | Remove existing conditional access policies in the Intune App Protection (MAM) blade and configur... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4057383) |
| 5 | In August 2018, Google announced the release of Android P (Android 9 Pie). The Intune product tea... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4459185) |
| 6 | Customer has a 3rd party module that they wrote and are integrating it in their main app project,... | Customer did not include the library correctly from the Gradle plugin and the mamification proces... | Go to the module in the project file and take each java file to check for import ***.  You need t... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4496576) |
| 7 | Customers or you need to set up their Intune SDK Android app development environment for the firs... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4496589) |
| 8 | The following YouTube video is available that explains how to&nbsp;create an Intune MAM diagnosti... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4528636) |
| 9 | This article is currently in development, while we finish developing its content please refer to ... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4564497) |
| 10 | When setting the CheckPoint Sandblast (Harmony Mobile) connector for the first time, when you try... | This is mostly likely caused because the groups used were not added in the UEM integration, or it... | If you are getting a 400 error you will need work with Sandbalst to fix this issue. Also make sur... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5009817) |
| 11 | Users attempting to launch or access MAM (Mobile Application Management) protected Android applic... | This problem occurs due to an issue with an older release of MIUI 14. | To resolve this problem, upgrade the device to the latest version of MIUI 14. To find the latest ... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5023045) |
| 12 | Android app configuration policy for edge not accepting Json configuration:  Android app configur... | for any additional app configuration for managed devices using JSON ,you have to follow the below... | IMC - Commercial - System Center&nbsp; When you configure these settings with managed device type... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5039924) |
| 13 | On Android devices, when App Protection Policy is applied, setting the device to offline (like us... | This is by design. The offline grace period timer does not begin until MAM app is actually launch... | If you follow the steps below, offline grace period should work as expected.  1. Create an App Pr... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5079076) |
| 14 | Customer has a 3rd party module that they wrote and are integrating it in their main app project,... | Customer did not include the library correctly from the Gradle plugin and the mamification proces... | Go to the module in the project file and take each java file to check for import ***. You need to... | 🟡 4.5 | contentidea-kb |
| 15 | Customers or you need to set up their Intune SDK Android app development environment for the firs... |  |  | 🟡 3.0 | contentidea-kb |

> 本 topic 有排查工作流 → [排查工作流](workflows/mam-android.md)
> → [已知问题详情](details/mam-android.md)
