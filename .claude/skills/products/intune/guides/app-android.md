# Intune Android 应用部署 — 排查速查

**来源数**: 3 | **21V**: 全部适用
**条目数**: 13 | **最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Android 设备上应用部署显示 Install Failed 状态 | 常见原因：APK 文件损坏、设备未允许来自未知来源的安装、APK 未签名 | 1. 查看 OMADM 日志中 'Error installing application <app name>, result code: <code>' 的 Android 错误码；2. 通... | 🟢 8.5 | ADO Wiki |
| 2 | Managed Google Play (MGP) account upgrade to Entra identity fails with 'Domain is already being u... | The domain is already registered with another Google service or enterprise ac... | Customer must contact Google Support directly to resolve the domain conflict. Reference: https://... | 🟢 8.5 | ADO Wiki |
| 3 | Cannot perform MGP account upgrade — original user who connected Managed Google Play no longer ex... | MGP upgrade requires Google Super Admin role which was held by the user who i... | Customer can either request Google to provide current Super Admin details or initiate a request t... | 🟢 8.5 | ADO Wiki |
| 4 | Managed Google Play account upgrade fails with generic 'Service Error' at Intune portal level dur... | Transient error from Google Enterprise Mobility Management (EMM) API service | 1) Retry after some time. 2) If error persists, escalate — potentially involving Google support. ... | 🔵 7.5 | ADO Wiki |
| 5 | Cannot attach photos in work profile apps (Word, Excel, Outlook, OneDrive) on Android Enterprise ... | Android requires an additional file explorer application in the workspace to ... | Approve and assign a File Explorer app (e.g., Google Files) from managed Google Play store to the... | 🔵 7.5 | MS Learn |
| 6 | When trying to push the Delve app on Android the device displays &quot;Device must be managed&quo... | Delve for Android is not supported for devices that are enrolled into Microso... |  | 🔵 7.0 | ContentIdea KB |
| 7 | You may encounter a customer stating that users are unable to create new contacts in the Outlook ... | This isn't actually an Intune problem even though customers may report it as ... | A new version of the Outlook app for iOS and Android became available in June of 2017 which added... | 🔵 7.0 | ContentIdea KB |
| 8 | You notice that the Intune Company Portal app for Android no longer receives automatic updates fr... | This can occur if the Company Portal app has not been manually approved in th... | To manually approve the Company Portal app, complete the following steps:1. Browse to the Intune ... | 🔵 7.0 | ContentIdea KB |
| 9 | When attempting to upload an APK file in the Azure Intune portal, after selecting the file, the O... | This can occur if there is an issue with the manifest for the Android app in ... | Contact the publisher or developer of the app and have them update the app. | 🔵 7.0 | ContentIdea KB |
| 10 | This walkthrough will show you how to configure and enroll a COSU device with the QR code methodW... | Education | If you haven't already...Onboard to Google  Approve any applications from      the Managed Play S... | 🔵 7.0 | ContentIdea KB |
| 11 | Customers are unable to enroll specific Huawei models that are running Android 8. 1. Download Com... | We have an internal thread with Huawei and they informed us that this is a KN... | The below workaround was tested and confirmed for the following device models:Huawei P20Huawei P ... | 🔵 7.0 | ContentIdea KB |
| 12 | If your customer is reporting Managed Google Play applications are not auto-updating when enrolle... | There are many factors controlled by Google that can impact the app update be... | Managed Google Play app update overview The update experience for apps installed from managed Goo... | 🔵 7.0 | ContentIdea KB |
| 13 | Company Portal shows "We cannot update enrollment now. Try again later" notification when enrolli... | Outdated version of the Company Portal app on the device. | Update Company Portal to the latest version from the respective app store (Microsoft Store / App ... | 🔵 6.5 | MS Learn |

## 快速排查路径
1. 1. 查看 OMADM 日志中 'Error installing application <app name>, result code: <code>' 的 Android 错误码；2. 通过网络搜索该 Android result code 获取详细原因；3. 确认设备允许安装来自 Intun `[来源: ADO Wiki]`
2. Customer must contact Google Support directly to resolve the domain conflict. Reference: https://support.google.com/a/answer/80610 `[来源: ADO Wiki]`
3. Customer can either request Google to provide current Super Admin details or initiate a request to assign a new Super Admin. Reference ICM: 617111109 `[来源: ADO Wiki]`
4. 1) Retry after some time. 2) If error persists, escalate — potentially involving Google support. Engage SME to evaluate need for ICM. If user fails to `[来源: ADO Wiki]`
5. Approve and assign a File Explorer app (e.g., Google Files) from managed Google Play store to the device. Then use the app's Attach icon to attach pho `[来源: MS Learn]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/app-android.md#排查流程)
