# ENTRA-ID FIDO2/Passkey Passwordless Auth — Quick Reference

**Entries**: 103 | **21V**: Partial (81/103)
**Last updated**: 2026-04-07
**Keywords**: fido2, passkey, authenticator, 21v-unsupported, android, security-key

> This topic has a fusion guide with detailed troubleshooting flow
> → [Full troubleshooting flow](details/fido2-passkey.md)

## Issue Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | Microsoft Authenticator passwordless phone sign-in and Certificate-Based Authentication (CBA) are... | Prerequisite infrastructure for device-bound passkeys has not landed in China... | Features not available in Mooncake. Device-bound passkeys (FIDO2) rough ETA 2... | 🟢 9.0 | OneNote |
| 2 📋 | Android passkey sign-in: page stalls/times out after clicking 'Face, fingerprint, PIN or security... | No matching passkey found on device. Common with work profile devices - passk... | 1) For YubiKey/cross-device: click 'sign in another way' dialog to see securi... | 🟢 8.5 | ADO Wiki |
| 3 📋 | Android YubiKey sign-in fails on Samsung devices - passkey web page gets sent back to auth option... | Known issue on Samsung devices: CredMan returns cancellation error when user ... | Workaround: Disable YubiOTP on YubiKeys if not needed. Issue is being investi... | 🟢 8.5 | ADO Wiki |
| 4 📋 | Android passkey: dialog says no passkeys saved on device despite having Authenticator installed | Authenticator not enabled as passkey provider in device settings, or passkey ... | 1) Enable Authenticator as passkey provider in Android Settings (both persona... | 🟢 8.5 | ADO Wiki |
| 5 📋 | Cannot use NFC YubiKey for passkey authentication on Android | Android Credential Manager only supports YubiKey connection via USB, NFC not ... | Use USB connection for YubiKey instead of NFC. This is a platform limitation ... | 🟢 8.5 | ADO Wiki |
| 6 📋 | Linux Intune enrollment fails with 'Certificate validation failed' error dialog | Passkey configured as authentication method for the user account — Linux brok... | 1) Remove passkey as auth method at https://account.microsoft.com/account → s... | 🟢 8.5 | ADO Wiki |
| 7 📋 | FIDO2 security key registration on Apple (macOS/iOS) fails with error 'Something went wrong. You ... | Apple does not support provisioning a new PIN on the FIDO2 device. If the sec... | Have the user first configure the PIN on the FIDO2 security key using a Windo... | 🟢 8.5 | ADO Wiki |
| 8 📋 | FIDO2 security key authentication via NFC fails on Android devices in both browser and native app... | Android does not currently support NFC for FIDO2 security keys. Only USB inte... | Use USB security keys on Android instead of NFC. NFC is only supported on iOS... | 🟢 8.5 | ADO Wiki |
| 9 📋 | MySecurityInfo prompts user to register a Microsoft Authenticator passkey even when authenticatio... | UI/UX inconsistency in MySecurityInfo portal. The page does not filter out Mi... | Instruct user to select 'Security key' instead of Microsoft Authenticator pas... | 🟢 8.5 | ADO Wiki |
| 10 📋 | FIDO2 security key model details show as 'unknown or invalid' in Entra ID portal and Microsoft Gr... | The FIDO2 key vendor has not onboarded/registered the key's AAGUID with Entra... | This is a display-only limitation with no functional impact on authentication... | 🟢 8.5 | ADO Wiki |
| 11 📋 | On 'Add a passkey' page in MySecurityInfo, clicking 'Next' does nothing. No prompt to insert key,... | Policy mismatch between Conditional Access authentication strength (no AAGUID... | Create a custom authentication strength that explicitly lists the same AAGUID... | 🟢 8.5 | ADO Wiki |
| 12 📋 | FIDO2 browser logon stops working on specific Windows device — PIN dialog never appears or times ... | Incomplete auto-install or auto-update of Citrix client (Workspace/Receiver) ... | If Citrix is not required, uninstall it and retest. If Citrix is required, pe... | 🟢 8.5 | ADO Wiki |
| 13 📋 | User signs in to Hybrid Join or Entra ID Join PC with Windows Hello for Business (WHfB/NGC), then... | KeyID claim conflict between the WHfB credential and the FIDO2 credential dur... | Option 1: Instruct users to sign in to the PC using the FIDO2 key (instead of... | 🟢 8.5 | ADO Wiki |
| 14 📋 | FIDO2 security keys appear as 'Disabled' on My Security Info page (aka.ms/mysecurityinfo) under S... | UI rendering bug in the MySecurityInfo portal incorrectly marks FIDO2 keys as... | No action required. Inform users the 'Disabled' label is a visual bug only. D... | 🟢 8.5 | ADO Wiki |
| 15 📋 | Tenant with Passkey Profiles enabled sees 'Windows Hello (preview)' option when editing a passkey... | UI prematurely exposed the Windows Hello (Entra Passkeys on Windows) option i... | Inform customer the Windows Hello (Entra Passkeys on Windows) feature is not ... | 🟢 8.5 | ADO Wiki |
| 16 📋 | FIDO2 security key interactive logon fails with message 'This security key doesn't look familiar.... | The security key does not have credentials registered for the relying party (... | Re-register the FIDO2 security key at aka.ms/mysecurityinfo. If key was previ... | 🟢 8.5 | ADO Wiki |
| 17 📋 | FIDO2 security key PIN entry fails repeatedly. CBOR-decoded CTAP2 response to clientPIN getRetrie... | User has exhausted all PIN retry attempts on the FIDO2 security key. The key ... | The FIDO2 security key must be reset to restore functionality. WARNING: Reset... | 🟢 8.5 | ADO Wiki |
| 18 📋 | FIDO2 registration on Apple fails: Something went wrong when key has no PIN | Apple cannot provision new PIN on FIDO2 device | Configure PIN on Windows first then use on Apple | 🟢 8.5 | ADO Wiki |
| 19 📋 | FIDO2 NFC fails on Android in browser and native apps | Android does not support NFC for FIDO2. Only USB (Chrome/Edge) | Use USB keys. For native apps install Authenticator 6.2405.3618+ on Android 14+ | 🟢 8.5 | ADO Wiki |
| 20 📋 | FIDO key not recognized in unbrokered passwordless auth on Mac (webauthn=1 passed) | Confirmed Apple bug (feedbackassistant.apple.com/feedback/15493539). OneAuth ... | Customer must work with Apple. This is an Apple platform bug, not an auth lib... | 🟢 8.5 | ADO Wiki |
| 21 📋 | FIDO2 security key model details show as unknown or invalid in Entra ID portal and Microsoft Grap... | The FIDO2 key vendor has not onboarded/registered the key AAGUID with Entra I... | Display-only limitation with no functional impact. If model visibility is req... | 🟢 8.5 | ADO Wiki |
| 22 📋 | On Add a passkey page in MySecurityInfo, clicking Next does nothing. Occurs when CA policy enforc... | Policy mismatch between CA authentication strength (no AAGUIDs specified) and... | Create a custom authentication strength that explicitly lists the same AAGUID... | 🟢 8.5 | ADO Wiki |
| 23 📋 | FIDO2 browser logon stops working on specific Windows device - PIN dialog never appears or times ... | Incomplete auto-install or auto-update of Citrix client without admin elevati... | If Citrix not required, uninstall and retest. If required, elevated repair/re... | 🟢 8.5 | ADO Wiki |
| 24 📋 | User signs in to Hybrid/Entra ID Join PC with WHfB/NGC, then accesses resource with CA policy req... | KeyID claim conflict between WHfB credential and FIDO2 credential during CA t... | Option 1: Sign in to PC using FIDO2 key instead of WHfB for resources requiri... | 🟢 8.5 | ADO Wiki |
| 25 📋 | FIDO2 security keys appear as Disabled on My Security Info page (aka.ms/mysecurityinfo). Keys con... | UI rendering bug in MySecurityInfo portal incorrectly marks FIDO2 keys as Dis... | No action required. Inform users the Disabled label is a visual bug only. Do ... | 🟢 8.5 | ADO Wiki |
| 26 📋 | Tenant with Passkey Profiles sees Windows Hello (preview) option when editing passkey profile in ... | UI prematurely exposed Windows Hello (Entra Passkeys on Windows) option befor... | Inform customer the feature is not yet available. PG fix to remove this optio... | 🟢 8.5 | ADO Wiki |
| 27 📋 | FIDO2 security key interactive logon fails with This security key does not look familiar. WebAuth... | Security key has no credentials registered for the relying party (login.micro... | Re-register the FIDO2 security key at aka.ms/mysecurityinfo. If previously wo... | 🟢 8.5 | ADO Wiki |
| 28 📋 | FIDO2 security key PIN entry fails. CBOR-decoded CTAP2 response shows 0 PIN retries remaining. Ke... | User exhausted all PIN retry attempts. Key firmware locks PIN entry after max... | Reset the FIDO2 security key (WARNING: erases ALL credentials). After reset, ... | 🟢 8.5 | ADO Wiki |
| 29 📋 | FIDO2 interactive logon fails with error 0xc000006d / 0xC0048585. AAD Operational Event Log shows... | NCSI (Network Connection Status Indicator) traffic to http://www.msftconnectt... | Allow NCSI traffic through proxy/firewall. Ensure http://www.msftconnecttest.... | 🟢 8.5 | ADO Wiki |
| 30 📋 | FIDO2 security key registration or sign-in fails in browser. Device logs (edge://device-log/ or c... | Firmware bugs in certain FIDO2 security keys (e.g. Nitrokey fw 2.2 AAGUID c39... | Update security key firmware if supported (e.g. Nitrokey 2.2 to 2.4). If no f... | 🟢 8.5 | ADO Wiki |
| 31 📋 | Cross-device passkey authentication or registration fails with Devices could not connect. WebAuth... | Corporate firewall or web proxy blocks access to FIDO2 tunnel service domains... | Unblock Cable.auth.com (Apple) and Cable.ua5v.com (Google) in firewall/proxy.... | 🟢 8.5 | ADO Wiki |
| 32 📋 | FIDO2 cached interactive logon fails off corporate network on Windows 11 24H2 Entra hybrid joined... | GPO 'Always wait for the network at computer startup and logon' or 'Run logon... | Remove or relax the two GPOs on affected devices and retest cached FIDO2 logo... | 🟢 8.5 | ADO Wiki |
| 33 📋 | Passkeys not presented as sign-in option in RDP sessions. WebAuthN Operational log shows Event 21... | Windows 11 passkeys privacy settings have been disabled for the relevant app/... | Enable passkeys privacy settings in Windows Settings app for the relevant app... | 🟢 8.5 | ADO Wiki |
| 34 📋 | Adding security key at aka.ms/mysecurityinfo fails immediately without prompt. HAR shows POST to ... | User has too many orphaned Windows Hello for Business (WHfB) credentials that... | Remove orphaned WHfB credentials using WHfBTools PowerShell module: https://s... | 🟢 8.5 | ADO Wiki |
| 35 📋 | Repeated PIN prompts when enrolling YubiKey credential, enrollment never completes. WebAuthN Oper... | User principal name (UPN) exceeds 64 characters. YubiKey rejects the makeCred... | Shorten UPN to 64 characters or fewer (reduce alias or domain suffix). After ... | 🟢 8.5 | ADO Wiki |
| 36 📋 | Android 设备点击 'face, fingerprint, PIN or security key' 后页面停滞/超时，底部出现 'sign in another way' 小对话框；Br... | 设备上找不到与账户匹配的 passkey（work profile 用户常见）；Credential Manager 将对话框超时或关闭注册为用户主动取消 | 1) 点击底部小对话框展开，选择安全密钥/跨设备选项；2) 确认 Authenticator 已保存 passkey（work profile 需在工作配... | 🟢 8.5 | ADO Wiki |
| 37 📋 | Android 设备无法使用 NFC YubiKey 进行 passkey 认证 | Android Credential Manager API 平台限制：仅支持 USB 连接方式，不支持 NFC，且短期内无添加计划 | 通知客户仅支持 USB 连接方式使用 YubiKey；NFC 为已知平台限制 | 🟢 8.5 | ADO Wiki |
| 38 📋 | MFA required message appears when registering FIDO key using TAP, but registration resumes after ... | Session timeout occurs if FIDO registration takes more than 10 minutes after ... | Refresh the page and resume FIDO key registration. Complete registration with... | 🟢 8.5 | ADO Wiki |
| 39 📋 | Entra Passkey registration prompts user to insert a USB security key instead of offering Windows ... | No Windows Hello container (PIN) exists on the device. WebAuthn call fails to... | Create a Windows Hello PIN first: Win10 Settings>Accounts>Sign-in options>Win... | 🟢 8.5 | ADO Wiki |
| 40 📋 | 'Security key or passkey' method not available in Add sign-in method dropdown on Security Info page | Windows Hello AAGUIDs not added to the Passkey (FIDO2) authentication method ... | Add Windows Hello AAGUIDs to FIDO2 policy: 08987058-cadc-4b81-b6e1-30de50dcbe... | 🟢 8.5 | ADO Wiki |
| ... | *63 more entries* | | | | |

## Quick Troubleshooting Path

1. Check **fido2** related issues (15 entries) `[ado-wiki]`
2. Check **passkey** related issues (11 entries) `[ado-wiki]`
3. Check **android** related issues (6 entries) `[ado-wiki]`
4. Check **authenticator** related issues (2 entries) `[onenote]`
5. Check **yubikey** related issues (2 entries) `[ado-wiki]`
6. Check **apple** related issues (2 entries) `[ado-wiki]`
7. Check **conditional-access** related issues (2 entries) `[ado-wiki]`
8. Check **ctap2** related issues (2 entries) `[ado-wiki]`
