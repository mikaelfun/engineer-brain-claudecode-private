# INTUNE iOS/iPadOS 注册与 ADE/DEP — 排查速查

**来源数**: 3 | **21V**: 部分 (21/23)
**条目数**: 23 | **最后更新**: 2026-04-17

## 快速排查路径

1. **iOS MDM enrollment fails after Quick Start restore with error: Unable to create unlock token - The unlock token could not be created because a passcode has already been set (MCKeybagErrorDomain Cod...**
   → Use iCloud or iTunes backup restore during Setup Assistant (before passcode step) instead of Quick Start. If Quick Start must be used, instruct user to NOT set passcode before Quick Start. After re... `[onenote, 🟢 9.5]`

2. **Unable to Enroll DEP Devices When Prompting for User Affinity. After entering username and password, the spinner at the top spins briefly then stops, remaining at the Username and Password prompt.**
   → 1. Disable MFA until after enrollment is complete. 2. If using PingFederate, upgrade to PingFederate 8.4 and set Default Token Type to "SAML 1.1 for Office 365" in the WS-Trust portion of the Offic... `[contentidea-kb, 🔵 7.5]`

3. **Advisory: How to collect console logs from iOS/Apple devices using Console app (macOS Sierra 10.12+), Apple Configurator 2, or Xcode. Covers step-by-step instructions for each method.**
   →  `[contentidea-kb, 🔵 7.5]`

4. **When DEP device attempts to setup and enroll, it takes the following communication path:1. Power on device2. Select Language3. Select Country4. Setup Wifi a. At this point, based on User Affinity s...**
   →  `[contentidea-kb, 🔵 7.5]`

5. **An iOS device fails to enroll in Intune and generates the following error message: "Profile Installation Failed. A Network Error Has Occurred"**
   → To resolve the issue, put the devices into DFU mode (Device Firmware Update mode) and restore iOS. Once this is done, the device should be able to enroll successfully. `[contentidea-kb, 🔵 7.5]`

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | iOS MDM enrollment fails after Quick Start restore with error: Unable to create unlock token - Th... | Quick Start restore runs after Setup Assistant completes and passcode is already configured. MDM ... | Use iCloud or iTunes backup restore during Setup Assistant (before passcode step) instead of Quic... | 🟢 9.5 | onenote: Mooncake POD Support Notebook/POD/VMS... |
| 2 | Unable to Enroll DEP Devices When Prompting for User Affinity. After entering username and passwo... | Two known causes: (1) MFA is enabled — MFA is not supported for DEP during enrollment as there is... | 1. Disable MFA until after enrollment is complete. 2. If using PingFederate, upgrade to PingFeder... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4014915) |
| 3 | Advisory: How to collect console logs from iOS/Apple devices using Console app (macOS Sierra 10.1... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/3090505) |
| 4 | When DEP device attempts to setup and enroll, it takes the following communication path:1. Power ... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4034736) |
| 5 | An iOS device fails to enroll in Intune and generates the following error message: "Profile Insta... | This can occur if there is an unspecified issue with iOS on the device. | To resolve the issue, put the devices into DFU mode (Device Firmware Update mode) and restore iOS... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4036535) |
| 6 | If you have a pre-declared serial number for a DEP device in SCCM you may be unable to delete the... | A bug was filed but not yet fixed. The reason the problem occurs is a sql table in SCCM database ... | SMS: 494132: [CDCR] Unable to delete the iOS device from the PreDeclared list after removing from... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4041479) |
| 7 | The Intune product support team has created a step-by-step troubleshooting guide that will walk y... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4095854) |
| 8 | This article only apples if the Enrollment profile is set to "Select where users must authenticat... | This has multiple causes: Username or password is actually wrong (typo) The user is targeted by a... | If using Azure AD MFA, the preferred solution would be D.2Solution A: Enter the correct informati... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4100372) |
| 9 | When attempting to enroll an Apple DEP device, the device is powered up, and when the DEP splash ... | This is often caused by an issue with the device itself. If the customer experiences this error w... | You should exhaust all other troubleshooting first, but as a last resort, do a factory reset on t... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4134139) |
| 10 | ConfigMgr Hybrid iOS DEP enrolled devices blocked by CA for Exchange on-prem. If a customer has t... | The EAS ID in ConfigMgr does not match the EAS ID in Exchange. | Please escalate to IET and ask for the tenant to be tagged with the DeviceMergeForBulkEnrollment ... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4470863) |
| 11 | Admins may report an error similar to the following when creating a new DEP profile:&nbsp;An erro... | CxE confirmed there is a limit of 100 Dep profiles per Enrollment Program Token (DEP Token). | If the customer needs to create more than 100 profiles, the current solution/workaround will be t... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4491978) |
| 12 | Replaced by Article&nbsp;  Article title: Intune: iOS DEP Enrolled device using Naming Template c... | Article title: Intune: iOS DEP Enrolled device using Naming Template cannot be renamed after enro... | Article title: Intune: iOS DEP Enrolled device using Naming Template cannot be renamed after enro... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4493018) |
| 13 | Many organizations requires that corporate owned devices (DEP, pre staged IMEI or serial number) ... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4500267) |
| 14 | DeleteMe | At the time of this writing, Network Access Control (NAC) is not supported for iOS and Cisco AnyC... | Delete Me | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4539678) |
| 15 | Compliance check times out on ADE enrolled iOS devices and the&nbsp;following message is logged i... | This can occur if the device has been restored from a previous iOS backup. | To resolve this issue you must factory reset the device then re-enroll it back into Intune. | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4599592) |
| 16 | When deploying a Wi-Fi profile to iOS 14 devices with Intune, the profile is stuck in ‘pending’ s... | Starting with iOS 14.x and iPadOS 14.x, devices present a randomized MAC address instead of the p... | To resolve this issue, set Disable MAC address randomization in the Wi-Fi profile to Yes: | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4603612) |
| 17 | When attempting to enroll an iOS device, the process fails and you see the following error messag... | This can occur if there is a problem with the DEP profile (i.e. the profile is broken or corrupted). | To resolve this problem, recreate the DEP profile, assign the device to the profile, reset the de... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4649249) |
| 18 | Microsoft Defender for Endpoint on iOS offers protection against phishing and unsafe network conn... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5032127) |
| 19 | Profile error 'Invalid Profile: The configuration for your iPad/iPhone could not be downloaded' w... | Invalid enrollment URL used in Apple Configurator setup. | See workaround in Intune Customer Success blog post for correcting the enrollment URL. | 🔵 7.0 | [mslearn](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/known-issues) |
| 20 | Apple ADE enrollment fails with XPC_TYPE_ERROR Connection invalid error in mobileassetd logs | Network connection problem between device and Apple ADE service (cannot reach mesu.apple.com) | Fix network connectivity or use a different network to enroll; if persists contact Apple support | 🔵 5.5 | [mslearn](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/device-enrollment/dep-enrollment-xpc-type-error) |
| 21 | Admins may report an error similar to the following when creating a new DEP profile: An error occ... | CxE confirmed there is a limit of 100 Dep profiles per Enrollment Program Token (DEP Token). | If the customer needs to create more than 100 profiles, the current solution/workaround will be t... | 🟡 4.5 | contentidea-kb |
| 22 | Replaced by Article Article title: Intune: iOS DEP Enrolled device using Naming Template cannot b... | Article title: Intune: iOS DEP Enrolled device using Naming Template cannot be renamed after enro... | Article title: Intune: iOS DEP Enrolled device using Naming Template cannot be renamed after enro... | 🟡 4.5 | contentidea-kb |
| 23 | Many organizations requires that corporate owned devices (DEP, pre staged IMEI or serial number) ... |  |  | 🟡 3.0 | contentidea-kb |

> 本 topic 有排查工作流 → [排查工作流](workflows/enrollment-ios.md)
> → [已知问题详情](details/enrollment-ios.md)
