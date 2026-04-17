# INTUNE Android 通用问题 — 排查速查

**来源数**: 4 | **21V**: 部分 (17/19)
**条目数**: 19 | **最后更新**: 2026-04-17

## 快速排查路径

1. **Need to collect runtime Android logs via ADB for Intune Company Portal or managed app troubleshooting; device-side logs insufficient**
   → Enable USB debugging: Settings > About Device > tap Build Number 7+ times > Developer Options > enable USB debugging. Install Android SDK platform-tools. Connect device via USB, allow USB debugging... `[onenote, 🟢 9.5]`

2. **Non-Knox Android device enrolled and compliant but still blocked by CA; user receives quarantine email**
   → User clicks Get Started Now link in the quarantine email. If email not on phone, forward from PC. This is a one-time action when CA is first enabled. `[ado-wiki, 🟢 9.0]`

3. **Android 8.0+ Work Profile 设备重置密码时返回 Not Supported**
   → 1. 在配置策略中启用 Work Profile 密码要求；2. 让用户设置符合要求的密码；3. 用户需接受二次提示允许密码重置；完成后重试 `[ado-wiki, 🟢 9.0]`

4. **Zebra Mobility Extensions (MX) integration with Intune — DA management ending Aug 2024 for GMS devices**
   → Switch to Android Enterprise management before DA support ends. See https://techcommunity.microsoft.com/t5/intune-customer-success/microsoft-intune-ending-support-for-android-device-administrator/b... `[ado-wiki, 🟢 9.0]`

5. **Discovered apps list in Intune shows what appear to be personal apps on Android Enterprise work profile devices**
   → No action needed. Verify by checking Settings > Work Profile > Apps on the device. Work apps show a briefcase icon. `[mslearn, 🟢 8.0]`

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Need to collect runtime Android logs via ADB for Intune Company Portal or managed app troubleshoo... | Company Portal uploaded logs may not contain enough detail. ADB logcat provides real-time verbose... | Enable USB debugging: Settings > About Device > tap Build Number 7+ times > Developer Options > e... | 🟢 9.5 | onenote: Mooncake POD Support Notebook/POD/VMS... |
| 2 | Non-Knox Android device enrolled and compliant but still blocked by CA; user receives quarantine ... | Non-Knox Android devices require the user to click Get Started Now link in the quarantine email t... | User clicks Get Started Now link in the quarantine email. If email not on phone, forward from PC.... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=/Conditional%20Access) |
| 3 | Android 8.0+ Work Profile 设备重置密码时返回 Not Supported | Reset Token 未在设备上激活，需要三个条件：(1) 配置策略中要求 Work Profile 密码；(2) 用户已设置合规的 Work Profile 密码；(3) 用户接受了允许密码... | 1. 在配置策略中启用 Work Profile 密码要求；2. 让用户设置符合要求的密码；3. 用户需接受二次提示允许密码重置；完成后重试 | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Actions) |
| 4 | Zebra Mobility Extensions (MX) integration with Intune — DA management ending Aug 2024 for GMS de... | Android device administrator management ending on GMS devices Aug 30 2024. Must switch to Android... | Switch to Android Enterprise management before DA support ends. See https://techcommunity.microso... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FThird%20Party%20Integration%2FZebra%20MX) |
| 5 | Discovered apps list in Intune shows what appear to be personal apps on Android Enterprise work p... | By design: these are system apps/services duplicated in the work profile by the device OEM, not a... | No action needed. Verify by checking Settings > Work Profile > Apps on the device. Work apps show... | 🟢 8.0 | [mslearn](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/app-management/discovered-apps-list-personal-apps) |
| 6 | Cannot attach photos in work profile apps (Word, Excel, Outlook, OneDrive) on Android Enterprise ... | Android requires an additional file explorer application in the workspace to open photos for atta... | Approve and assign a File Explorer app (e.g., Google Files) from managed Google Play store to the... | 🟢 8.0 | [mslearn](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/app-management/android-enterprise-enrolled-devices-fails-attaching-photo) |
| 7 | Customer configures an Azure Intune Device Restrictions Profile with Kiosk Mode enabled. Google C... | By design | Only managed apps can be added to Kiosk Mode via an Intune policy. | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4041120) |
| 8 | Intune receives the data regarding MDM enrolled devices that exceed usage quotas from DatAlert, h... | Device is enrolled into Intune as an Android for Work device. https://docs.microsoft.com/en-us/in... | Android For Work does not have access to the Samsung KNOX APIs that perform this scenario. It wil... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4055234) |
| 9 | In the Intune console a Device Configuration profile for Android device administrator with profil... | This can be caused by a variety of different issues. &nbsp; &nbsp; Here is list of the issues tha... | The best way to resolve this issue is have the customer manually configure a user profile. &nbsp;... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4517803) |
| 10 | Certain Samsung devices&nbsp;with the model&nbsp;Galaxy A01 Core cannot enroll as Android for wor... | This occurs because these devices use Android GO system.&nbsp; | Android GO devices are &quot;Light&quot; Android Go, and normally those devices don't have enough... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4605397) |
| 11 | Customer enrolled the Samsung devices as Android device administrator (Android 10) and deployed t... | According to&nbsp;Incident-216302078 Details - IcM (microsofticm.com, this function is now deprec... | Please migrate all affected devices to Android Enterprise. | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4610074) |
| 12 | Customer enrolled the Samsung devices as Android device administrator (Android 10) and deployed t... | According to&nbsp;Incident-214805464 Details - IcM (microsofticm.com), this function is now depre... | Please migrate all affected devices to Android Enterprise. | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4610115) |
| 13 | We have seen some Customer who have Android Dedicated &quot;CUSO&quot; devices with Managed Home ... | The cause related to misconfiguration of Device password type in Device Configuration Policy whic... | There are 2 ways to mitigate this issue as below:  1. If the device does not need keyguard lock (... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5015044) |
| 14 | Newly enrolled devices are experiencing issues with the Samsung Gallery app. Specifically, users ... | This is an expected limitation, please refer to the following Samsung article:   Samsung Gallery ... | If you try to create the System App with an existing Managed App, you will receive the following ... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5035139) |
| 15 | A customer states that exactly 2 hours after the device enrollment in Intune the device automatic... | This issue wasn't caused by Intune, the issue was caused by the retail provider which was automat... | Either remove the device from the Samsung Knox Enrollment portal/Zero touch Enrollment portal or ... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5036738) |
| 16 | Some customers would like to be able to access USB files on Samsung devices without having to lea... | Known limitation from Samsung&nbsp;Allow external USB devices in kiosk mode / Knox Manage / Samsu... | The Samsung documentation is a general MDM guide on how to achieve this. On the Intune case here ... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5056874) |
| 17 | A Knox profile for device customization fails to apply on Samsung devices even the report shows t... | The setting “Enable device policy controls” must be explicitly enabled in the OEM profile in Intu... | I check our documentation: Use OEMConfig on Android Enterprise devices in Microsoft Intune / Micr... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5067900) |
| 18 | Samsung work profile devices missing certificates after updating to Android 12, affecting Gmail a... | Samsung Android 12 update issue causing certificate loss on work profile enrolled devices. | See temporary workarounds in Intune Customer Success blog. Issue has been resolved. | 🔵 5.5 | [mslearn](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/known-issues) |
| 19 | Skype for Business on Android Enterprise does not save SIP address and password after app close o... | Intune device restriction Add and Remove accounts set to Block prevents credential persistence on... | In Device configuration > Profiles > Device restrictions > Work profile settings, change Add and ... | 🔵 5.5 | [mslearn](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/device-configuration/sip-address-password-not-saved) |
