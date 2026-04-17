# INTUNE iOS/iPadOS 注册与 ADE/DEP — 已知问题详情

**条目数**: 23 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: iOS MDM enrollment fails after Quick Start restore with error: Unable to create unlock token - The unlock token could not be created because a pass...
**Solution**: Use iCloud or iTunes backup restore during Setup Assistant (before passcode step) instead of Quick Start. If Quick Start must be used, instruct user to NOT set passcode before Quick Start. After restore, device must go through Setup Assistant with DEP to properly create unlock token.
`[Source: onenote, Score: 9.5]`

### Step 2: Unable to Enroll DEP Devices When Prompting for User Affinity. After entering username and password, the spinner at the top spins briefly then stop...
**Solution**: 1. Disable MFA until after enrollment is complete. 2. If using PingFederate, upgrade to PingFederate 8.4 and set Default Token Type to "SAML 1.1 for Office 365" in the WS-Trust portion of the Office 365 connection. Contact Ping Federate support if assistance is needed.
`[Source: contentidea-kb, Score: 7.5]`

### Step 3: Advisory: How to collect console logs from iOS/Apple devices using Console app (macOS Sierra 10.12+), Apple Configurator 2, or Xcode. Covers step-b...
**Solution**: 
`[Source: contentidea-kb, Score: 7.5]`

### Step 4: When DEP device attempts to setup and enroll, it takes the following communication path:1. Power on device2. Select Language3. Select Country4. Set...
**Solution**: 
`[Source: contentidea-kb, Score: 7.5]`

### Step 5: An iOS device fails to enroll in Intune and generates the following error message: "Profile Installation Failed. A Network Error Has Occurred"
**Solution**: To resolve the issue, put the devices into DFU mode (Device Firmware Update mode) and restore iOS. Once this is done, the device should be able to enroll successfully.
`[Source: contentidea-kb, Score: 7.5]`

### Step 6: If you have a pre-declared serial number for a DEP device in SCCM you may be unable to delete the entry in the console. This may cause the device t...
**Solution**: SMS: 494132: [CDCR] Unable to delete the iOS device from the PreDeclared list after removing from DEP profileThe temporary fix is to alter the sql table but is not recommended.
`[Source: contentidea-kb, Score: 7.5]`

### Step 7: The Intune product support team has created a step-by-step troubleshooting guide that will walk you through troubleshooting iOS device enrollment p...
**Solution**: 
`[Source: contentidea-kb, Score: 7.5]`

### Step 8: This article only apples if the Enrollment profile is set to "Select where users must authenticate = Setup Assistant (Legacy)". During ADE (Formerl...
**Solution**: If using Azure AD MFA, the preferred solution would be D.2Solution A: Enter the correct information and try again Have user validate an azure AD sign in can be competed at https://myapps.microsoft.com Solution B: Edit the Conditional access policy to Exclude "Microsoft Intune Enrollment" In the "Exclude" tab of the conditional access policy, add "Microsoft Intune Enrollment" Solution C: Enable WS-Trust 13 If you're using ADFS and you're using Setup Assistant to authenticate, WS-Trust 1.3 Usernam
`[Source: contentidea-kb, Score: 7.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | iOS MDM enrollment fails after Quick Start restore with error: Unable to crea... | Quick Start restore runs after Setup Assistant completes and passcode is alre... | Use iCloud or iTunes backup restore during Setup Assistant (before passcode s... | 9.5 | onenote |
| 2 | Unable to Enroll DEP Devices When Prompting for User Affinity. After entering... | Two known causes: (1) MFA is enabled — MFA is not supported for DEP during en... | 1. Disable MFA until after enrollment is complete. 2. If using PingFederate, ... | 7.5 | contentidea-kb |
| 3 | Advisory: How to collect console logs from iOS/Apple devices using Console ap... |  |  | 7.5 | contentidea-kb |
| 4 | When DEP device attempts to setup and enroll, it takes the following communic... |  |  | 7.5 | contentidea-kb |
| 5 | An iOS device fails to enroll in Intune and generates the following error mes... | This can occur if there is an unspecified issue with iOS on the device. | To resolve the issue, put the devices into DFU mode (Device Firmware Update m... | 7.5 | contentidea-kb |
| 6 | If you have a pre-declared serial number for a DEP device in SCCM you may be ... | A bug was filed but not yet fixed. The reason the problem occurs is a sql tab... | SMS: 494132: [CDCR] Unable to delete the iOS device from the PreDeclared list... | 7.5 | contentidea-kb |
| 7 | The Intune product support team has created a step-by-step troubleshooting gu... |  |  | 7.5 | contentidea-kb |
| 8 | This article only apples if the Enrollment profile is set to "Select where us... | This has multiple causes: Username or password is actually wrong (typo) The u... | If using Azure AD MFA, the preferred solution would be D.2Solution A: Enter t... | 7.5 | contentidea-kb |
| 9 | When attempting to enroll an Apple DEP device, the device is powered up, and ... | This is often caused by an issue with the device itself. If the customer expe... | You should exhaust all other troubleshooting first, but as a last resort, do ... | 7.5 | contentidea-kb |
| 10 | ConfigMgr Hybrid iOS DEP enrolled devices blocked by CA for Exchange on-prem.... | The EAS ID in ConfigMgr does not match the EAS ID in Exchange. | Please escalate to IET and ask for the tenant to be tagged with the DeviceMer... | 7.5 | contentidea-kb |
| 11 | Admins may report an error similar to the following when creating a new DEP p... | CxE confirmed there is a limit of 100 Dep profiles per Enrollment Program Tok... | If the customer needs to create more than 100 profiles, the current solution/... | 7.5 | contentidea-kb |
| 12 | Replaced by Article&nbsp;  Article title: Intune: iOS DEP Enrolled device usi... | Article title: Intune: iOS DEP Enrolled device using Naming Template cannot b... | Article title: Intune: iOS DEP Enrolled device using Naming Template cannot b... | 7.5 | contentidea-kb |
| 13 | Many organizations requires that corporate owned devices (DEP, pre staged IME... |  |  | 7.5 | contentidea-kb |
| 14 | DeleteMe | At the time of this writing, Network Access Control (NAC) is not supported fo... | Delete Me | 7.5 | contentidea-kb |
| 15 | Compliance check times out on ADE enrolled iOS devices and the&nbsp;following... | This can occur if the device has been restored from a previous iOS backup. | To resolve this issue you must factory reset the device then re-enroll it bac... | 7.5 | contentidea-kb |
| 16 | When deploying a Wi-Fi profile to iOS 14 devices with Intune, the profile is ... | Starting with iOS 14.x and iPadOS 14.x, devices present a randomized MAC addr... | To resolve this issue, set Disable MAC address randomization in the Wi-Fi pro... | 7.5 | contentidea-kb |
| 17 | When attempting to enroll an iOS device, the process fails and you see the fo... | This can occur if there is a problem with the DEP profile (i.e. the profile i... | To resolve this problem, recreate the DEP profile, assign the device to the p... | 7.5 | contentidea-kb |
| 18 | Microsoft Defender for Endpoint on iOS offers protection against phishing and... |  |  | 7.5 | contentidea-kb |
| 19 | Profile error 'Invalid Profile: The configuration for your iPad/iPhone could ... | Invalid enrollment URL used in Apple Configurator setup. | See workaround in Intune Customer Success blog post for correcting the enroll... | 7.0 | mslearn |
| 20 | Apple ADE enrollment fails with XPC_TYPE_ERROR Connection invalid error in mo... | Network connection problem between device and Apple ADE service (cannot reach... | Fix network connectivity or use a different network to enroll; if persists co... | 5.5 | mslearn |
| 21 | Admins may report an error similar to the following when creating a new DEP p... | CxE confirmed there is a limit of 100 Dep profiles per Enrollment Program Tok... | If the customer needs to create more than 100 profiles, the current solution/... | 4.5 | contentidea-kb |
| 22 | Replaced by Article Article title: Intune: iOS DEP Enrolled device using Nami... | Article title: Intune: iOS DEP Enrolled device using Naming Template cannot b... | Article title: Intune: iOS DEP Enrolled device using Naming Template cannot b... | 4.5 | contentidea-kb |
| 23 | Many organizations requires that corporate owned devices (DEP, pre staged IME... |  |  | 3.0 | contentidea-kb |
