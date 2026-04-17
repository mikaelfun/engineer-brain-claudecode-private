# INTUNE Android MAM 与 App Protection — 已知问题详情

**条目数**: 15 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: Admin initiated MAM selective wipe from Intune portal but cannot confirm whether the wipe request was actually received and processed by the Intune...
**Solution**: Step 1: Query HttpSubsystem with accountId and httpVerb=POST and url contains 'wipe' to confirm backend received the wipe request. Step 2: Query IntuneEvent with AccountId, filter for 'wipe' and user ID in Message - this confirms server processed the wipe. Step 3: Query HttpSubsystem with url contains 'managedAppRegistrations' to verify the wipe status was reported back to the portal. Admin can also track status through Azure portal: Mobile apps > App Selective Wipe.
`[Source: onenote, Score: 9.5]`

### Step 2: Android LOB 应用集成 Intune MAM SDK 后 Gradle 构建失败
**Solution**: 1. 检查 Azure App Registration 的 scope 和 permissions；2. 确认使用 Android Gradle plugin 3.0+ 和 Gradle 4.1+；3. 尝试降低 SDK 库版本验证兼容性；4. 检查 ProGuard 规则是否包含 SDK 配置；5. 如低版本正常则联系 TA 考虑 ICM
`[Source: ado-wiki, Score: 9.0]`

### Step 3: On Android, the Intune MAM Protected version ofManaged Azure Information Protection can Save as PDF when Save As is prevented by Policy.
**Solution**: The &quot;Disable Printing&quot; parameter must be set to YES in the Intune App Protection policy to prevent the Print>Save as PDF functionality from working in a managed app.
`[Source: contentidea-kb, Score: 7.5]`

### Step 4: When accessing Microsoft Planner, error: "You can't get there from here. It looks like you're trying to open this resource with an app that hasn't ...
**Solution**: Remove existing conditional access policies in the Intune App Protection (MAM) blade and configure them in the Azure CA blade: 1) Disable existing Exchange Online CA policy. 2) Go to Azure AD > Conditional access. 3) Create new policy with same assignments, under Grant select Require approved client app.
`[Source: contentidea-kb, Score: 7.5]`

### Step 5: In August 2018, Google announced the release of Android P (Android 9 Pie). The Intune product team has been testing each preview, and currently all...
**Solution**: 
`[Source: contentidea-kb, Score: 7.5]`

### Step 6: Customer has a 3rd party module that they wrote and are integrating it in their main app project, which implements MAM SDK.  &nbsp;The application ...
**Solution**: Go to
the module in the project file and take each java file to check for import ***.

You need to check
the import files and generalize them.

For our example, we
had to rewrite intunemam to include &quot;androidx.arch.*&quot;.

Rebuild the project
and test.
`[Source: contentidea-kb, Score: 7.5]`

### Step 7: Customers or you need to set up their Intune SDK Android app development environment for the first time and the documentation may not seem clear.  ...
**Solution**: 
`[Source: contentidea-kb, Score: 7.5]`

### Step 8: The following YouTube video is available that explains how to&nbsp;create an Intune MAM diagnostic report on Android devices:https://www.youtube.co...
**Solution**: 
`[Source: contentidea-kb, Score: 7.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Admin initiated MAM selective wipe from Intune portal but cannot confirm whet... |  | Step 1: Query HttpSubsystem with accountId and httpVerb=POST and url contains... | 9.5 | onenote |
| 2 | Android LOB 应用集成 Intune MAM SDK 后 Gradle 构建失败 | SDK 版本与 IDE 构建工具、Android Gradle plugin 或 framework 版本不兼容；Gradle 包签名配置不正确；Azur... | 1. 检查 Azure App Registration 的 scope 和 permissions；2. 确认使用 Android Gradle plu... | 9.0 | ado-wiki |
| 3 | On Android, the Intune MAM Protected version ofManaged Azure Information Prot... | By Design. The &quot;Save as PDF&quot; is discoverable under the Print option... | The &quot;Disable Printing&quot; parameter must be set to YES in the Intune A... | 7.5 | contentidea-kb |
| 4 | When accessing Microsoft Planner, error: "You can't get there from here. It l... | An Exchange Online conditional access policy was created using the classic Si... | Remove existing conditional access policies in the Intune App Protection (MAM... | 7.5 | contentidea-kb |
| 5 | In August 2018, Google announced the release of Android P (Android 9 Pie). Th... |  |  | 7.5 | contentidea-kb |
| 6 | Customer has a 3rd party module that they wrote and are integrating it in the... | Customer did not include the library correctly from the Gradle plugin and the... | Go to the module in the project file and take each java file to check for imp... | 7.5 | contentidea-kb |
| 7 | Customers or you need to set up their Intune SDK Android app development envi... |  |  | 7.5 | contentidea-kb |
| 8 | The following YouTube video is available that explains how to&nbsp;create an ... |  |  | 7.5 | contentidea-kb |
| 9 | This article is currently in development, while we finish developing its cont... |  |  | 7.5 | contentidea-kb |
| 10 | When setting the CheckPoint Sandblast (Harmony Mobile) connector for the firs... | This is mostly likely caused because the groups used were not added in the UE... | If you are getting a 400 error you will need work with Sandbalst to fix this ... | 7.5 | contentidea-kb |
| 11 | Users attempting to launch or access MAM (Mobile Application Management) prot... | This problem occurs due to an issue with an older release of MIUI 14. | To resolve this problem, upgrade the device to the latest version of MIUI 14.... | 7.5 | contentidea-kb |
| 12 | Android app configuration policy for edge not accepting Json configuration:  ... | for any additional app configuration for managed devices using JSON ,you have... | IMC - Commercial - System Center&nbsp; When you configure these settings with... | 7.5 | contentidea-kb |
| 13 | On Android devices, when App Protection Policy is applied, setting the device... | This is by design. The offline grace period timer does not begin until MAM ap... | If you follow the steps below, offline grace period should work as expected. ... | 7.5 | contentidea-kb |
| 14 | Customer has a 3rd party module that they wrote and are integrating it in the... | Customer did not include the library correctly from the Gradle plugin and the... | Go to the module in the project file and take each java file to check for imp... | 4.5 | contentidea-kb |
| 15 | Customers or you need to set up their Intune SDK Android app development envi... |  |  | 3.0 | contentidea-kb |
