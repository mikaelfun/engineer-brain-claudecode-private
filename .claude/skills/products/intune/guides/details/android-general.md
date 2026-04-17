# INTUNE Android 通用问题 — 已知问题详情

**条目数**: 19 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: Need to collect runtime Android logs via ADB for Intune Company Portal or managed app troubleshooting; device-side logs insufficient
**Solution**: Enable USB debugging: Settings > About Device > tap Build Number 7+ times > Developer Options > enable USB debugging. Install Android SDK platform-tools. Connect device via USB, allow USB debugging prompt. Run adb.exe devices to verify. Run adb.exe logcat >> log.txt while reproducing issue. Ctrl+C to stop. For Samsung: dial *#9900# > Enable SecLog > reboot > connect ADB > reproduce > dial *#9900# > Run dumpstate/logcat > Copy to sdcard.
`[Source: onenote, Score: 9.5]`

### Step 2: Non-Knox Android device enrolled and compliant but still blocked by CA; user receives quarantine email
**Solution**: User clicks Get Started Now link in the quarantine email. If email not on phone, forward from PC. This is a one-time action when CA is first enabled.
`[Source: ado-wiki, Score: 9.0]`

### Step 3: Android 8.0+ Work Profile 设备重置密码时返回 Not Supported
**Solution**: 1. 在配置策略中启用 Work Profile 密码要求；2. 让用户设置符合要求的密码；3. 用户需接受二次提示允许密码重置；完成后重试
`[Source: ado-wiki, Score: 9.0]`

### Step 4: Zebra Mobility Extensions (MX) integration with Intune — DA management ending Aug 2024 for GMS devices
**Solution**: Switch to Android Enterprise management before DA support ends. See https://techcommunity.microsoft.com/t5/intune-customer-success/microsoft-intune-ending-support-for-android-device-administrator/ba-p/3915443
`[Source: ado-wiki, Score: 9.0]`

### Step 5: Discovered apps list in Intune shows what appear to be personal apps on Android Enterprise work profile devices
**Solution**: No action needed. Verify by checking Settings > Work Profile > Apps on the device. Work apps show a briefcase icon.
`[Source: mslearn, Score: 8.0]`

### Step 6: Cannot attach photos in work profile apps (Word, Excel, Outlook, OneDrive) on Android Enterprise enrolled devices - 'Unable to add attachment due t...
**Solution**: Approve and assign a File Explorer app (e.g., Google Files) from managed Google Play store to the device. Then use the app's Attach icon to attach photos.
`[Source: mslearn, Score: 8.0]`

### Step 7: Customer configures an Azure Intune Device Restrictions Profile with Kiosk Mode enabled. Google Chrome is added via app package name or deep link. ...
**Solution**: Only managed apps can be added to Kiosk Mode via an Intune policy.
`[Source: contentidea-kb, Score: 7.5]`

### Step 8: Intune receives the data regarding MDM enrolled devices that exceed usage quotas from DatAlert, however, Intune does not disable data roaming on th...
**Solution**: Android For Work does not have access to the Samsung KNOX APIs that perform this scenario. It will work for normal Android Samsung device, but not when enrolled as Android For Work.
`[Source: contentidea-kb, Score: 7.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Need to collect runtime Android logs via ADB for Intune Company Portal or man... | Company Portal uploaded logs may not contain enough detail. ADB logcat provid... | Enable USB debugging: Settings > About Device > tap Build Number 7+ times > D... | 9.5 | onenote |
| 2 | Non-Knox Android device enrolled and compliant but still blocked by CA; user ... | Non-Knox Android devices require the user to click Get Started Now link in th... | User clicks Get Started Now link in the quarantine email. If email not on pho... | 9.0 | ado-wiki |
| 3 | Android 8.0+ Work Profile 设备重置密码时返回 Not Supported | Reset Token 未在设备上激活，需要三个条件：(1) 配置策略中要求 Work Profile 密码；(2) 用户已设置合规的 Work Prof... | 1. 在配置策略中启用 Work Profile 密码要求；2. 让用户设置符合要求的密码；3. 用户需接受二次提示允许密码重置；完成后重试 | 9.0 | ado-wiki |
| 4 | Zebra Mobility Extensions (MX) integration with Intune — DA management ending... | Android device administrator management ending on GMS devices Aug 30 2024. Mu... | Switch to Android Enterprise management before DA support ends. See https://t... | 9.0 | ado-wiki |
| 5 | Discovered apps list in Intune shows what appear to be personal apps on Andro... | By design: these are system apps/services duplicated in the work profile by t... | No action needed. Verify by checking Settings > Work Profile > Apps on the de... | 8.0 | mslearn |
| 6 | Cannot attach photos in work profile apps (Word, Excel, Outlook, OneDrive) on... | Android requires an additional file explorer application in the workspace to ... | Approve and assign a File Explorer app (e.g., Google Files) from managed Goog... | 8.0 | mslearn |
| 7 | Customer configures an Azure Intune Device Restrictions Profile with Kiosk Mo... | By design | Only managed apps can be added to Kiosk Mode via an Intune policy. | 7.5 | contentidea-kb |
| 8 | Intune receives the data regarding MDM enrolled devices that exceed usage quo... | Device is enrolled into Intune as an Android for Work device. https://docs.mi... | Android For Work does not have access to the Samsung KNOX APIs that perform t... | 7.5 | contentidea-kb |
| 9 | In the Intune console a Device Configuration profile for Android device admin... | This can be caused by a variety of different issues. &nbsp; &nbsp; Here is li... | The best way to resolve this issue is have the customer manually configure a ... | 7.5 | contentidea-kb |
| 10 | Certain Samsung devices&nbsp;with the model&nbsp;Galaxy A01 Core cannot enrol... | This occurs because these devices use Android GO system.&nbsp; | Android GO devices are &quot;Light&quot; Android Go, and normally those devic... | 7.5 | contentidea-kb |
| 11 | Customer enrolled the Samsung devices as Android device administrator (Androi... | According to&nbsp;Incident-216302078 Details - IcM (microsofticm.com, this fu... | Please migrate all affected devices to Android Enterprise. | 7.5 | contentidea-kb |
| 12 | Customer enrolled the Samsung devices as Android device administrator (Androi... | According to&nbsp;Incident-214805464 Details - IcM (microsofticm.com), this f... | Please migrate all affected devices to Android Enterprise. | 7.5 | contentidea-kb |
| 13 | We have seen some Customer who have Android Dedicated &quot;CUSO&quot; device... | The cause related to misconfiguration of Device password type in Device Confi... | There are 2 ways to mitigate this issue as below:  1. If the device does not ... | 7.5 | contentidea-kb |
| 14 | Newly enrolled devices are experiencing issues with the Samsung Gallery app. ... | This is an expected limitation, please refer to the following Samsung article... | If you try to create the System App with an existing Managed App, you will re... | 7.5 | contentidea-kb |
| 15 | A customer states that exactly 2 hours after the device enrollment in Intune ... | This issue wasn't caused by Intune, the issue was caused by the retail provid... | Either remove the device from the Samsung Knox Enrollment portal/Zero touch E... | 7.5 | contentidea-kb |
| 16 | Some customers would like to be able to access USB files on Samsung devices w... | Known limitation from Samsung&nbsp;Allow external USB devices in kiosk mode /... | The Samsung documentation is a general MDM guide on how to achieve this. On t... | 7.5 | contentidea-kb |
| 17 | A Knox profile for device customization fails to apply on Samsung devices eve... | The setting “Enable device policy controls” must be explicitly enabled in the... | I check our documentation: Use OEMConfig on Android Enterprise devices in Mic... | 7.5 | contentidea-kb |
| 18 | Samsung work profile devices missing certificates after updating to Android 1... | Samsung Android 12 update issue causing certificate loss on work profile enro... | See temporary workarounds in Intune Customer Success blog. Issue has been res... | 5.5 | mslearn |
| 19 | Skype for Business on Android Enterprise does not save SIP address and passwo... | Intune device restriction Add and Remove accounts set to Block prevents crede... | In Device configuration > Profiles > Device restrictions > Work profile setti... | 5.5 | mslearn |
