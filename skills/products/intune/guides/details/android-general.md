# Intune Android 通用问题 — 综合排查指南

**条目数**: 19 | **草稿融合数**: 0 | **Kusto 查询融合**: 0
**生成日期**: 2026-04-07

---

## ⚠️ 已知矛盾 (1 条)

- **solution_conflict** (high): intune-ado-wiki-193 vs intune-contentidea-kb-130 — context_dependent: 不同来源给出不同方案，可能适用不同场景

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Need to collect runtime Android logs via ADB for Intune Company Portal or managed app troubleshoo... | Company Portal uploaded logs may not contain enough detail. ADB logcat provid... | Enable USB debugging: Settings > About Device > tap Build Number 7+ times > Developer Options > e... | 🟢 9.0 | OneNote |
| 2 | Non-Knox Android device enrolled and compliant but still blocked by CA; user receives quarantine ... | Non-Knox Android devices require the user to click Get Started Now link in th... | User clicks Get Started Now link in the quarantine email. If email not on phone, forward from PC.... | 🟢 8.5 | ADO Wiki |
| 3 | Android 8.0+ Work Profile 设备重置密码时返回 Not Supported | Reset Token 未在设备上激活，需要三个条件：(1) 配置策略中要求 Work Profile 密码；(2) 用户已设置合规的 Work Prof... | 1. 在配置策略中启用 Work Profile 密码要求；2. 让用户设置符合要求的密码；3. 用户需接受二次提示允许密码重置；完成后重试 | 🟢 8.5 | ADO Wiki |
| 4 | Zebra Mobility Extensions (MX) integration with Intune — DA management ending Aug 2024 for GMS de... | Android device administrator management ending on GMS devices Aug 30 2024. Mu... | Switch to Android Enterprise management before DA support ends. See https://techcommunity.microso... | 🟢 8.5 | ADO Wiki |
| 5 | Discovered apps list in Intune shows what appear to be personal apps on Android Enterprise work p... | By design: these are system apps/services duplicated in the work profile by t... | No action needed. Verify by checking Settings > Work Profile > Apps on the device. Work apps show... | 🔵 7.5 | MS Learn |
| 6 | Samsung KNOX: EAS email profile error 0x87D1FDE8 remediation failed. | Samsung Notes sync option selected but no longer supported. | Deselect Samsung Notes sync option. Wait up to 24h. | 🔵 7.5 | MS Learn |
| 7 | Unable to Configure Android for Work due to continuous looping back to Configure Page. | Issue with IE Security Zone Settings. The manage.microsoft.com page and play.... | Workaround 1: If Protected Mode mismatch, go to Internet Options > Security, enable Protected Mod... | 🔵 7.0 | ContentIdea KB |
| 8 | This article explains how to collect SysDump logging from a Samsung device running Android OS. |  | Open the Phone app. Type *#9900# This will open the SysDump menu. Tap DEBUG LEVEL DISABLED/LOW. S... | 🔵 7.0 | ContentIdea KB |
| 9 | In an Intune/Configuration Manager hybrid environment, deploying an Android for Work (AfW) app fa... | This can occur if the app is deployed as Available. This is by design. | To resolve this problem, remove the existing deployment and re-deploy the app as Required. | 🔵 7.0 | ContentIdea KB |
| 10 | Customer configures an Azure Intune Device Restrictions Profile with Kiosk Mode enabled. Google C... | By design | Only managed apps can be added to Kiosk Mode via an Intune policy. | 🔵 7.0 | ContentIdea KB |
| 11 | When using Intune on premise Exchange conditional access when you try to use a device access rule... | This is because Intune on premise Exchange conditional access does not suppor... | If you have users that need to use the Outlook App you can not target them for conditional access... | 🔵 7.0 | ContentIdea KB |
| 12 | When trying to update an Android line of business app to a newer version via the Azure Intune por... | This can occur if the name of the updated package does not match the name of ... | To resolve this problem, make sure the update package name matches the name of the package being ... | 🔵 7.0 | ContentIdea KB |
| 13 | When you attempt to enroll a Zebra device such as the TC75x in Intune you will be unable to enrol... | The issue is caused by a conflict between Intune and Zebra's MDM solution. | Zebra has released a hotfix on their website that should be in the latest January 2018 patches. C... | 🔵 7.0 | ContentIdea KB |
| 14 | Customer attempts to generate a temporary passcode in the Azure Intune blade for an Android devic... | The device is unable to communicate with the Intune service because it hasn't... | Ensure that the device has internet or cellular connectivity. | 🔵 7.0 | ContentIdea KB |
| 15 | When testing Knox Mobile Enrollment, customer receives the following error "MDM package mismatch.... | App package link was incorrect in KNOX console | Customer removed and re-added app package link and the error went away. | 🔵 7.0 | ContentIdea KB |
| 16 | Question: Is https://support.samsungknox.com/hc/en-us/articles/115015195728-Common-Criteria-Mode ... | Per-current design - not supported. | None - currently not on roadmap at the time of writing of this KB per CxE. | 🔵 7.0 | ContentIdea KB |
| 17 | Samsung devices enrolled in Intune via Knox Mobile Enrollment tool may display an ownership type ... | This is a known issue. | This issue will be resolved in the 1812 release. However, existing devices will require other rem... | 🔵 7.0 | ContentIdea KB |
| 18 | Not Supported message when issuing passcode reset to Android 8.0+ personally owned work profile d... | Reset token not activated on device | 1) Require work profile passcode in config policy 2) User sets passcode 3) User accepts secondary... | 🔵 6.5 | MS Learn |
| 19 | Samsung work profile devices missing certificates after updating to Android 12, affecting Gmail a... | Samsung Android 12 update issue causing certificate loss on work profile enro... | See temporary workarounds in Intune Customer Success blog. Issue has been resolved. | 🔵 5.5 | MS Learn |
