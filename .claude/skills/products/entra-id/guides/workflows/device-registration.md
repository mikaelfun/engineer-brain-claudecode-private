# Entra ID Device Registration & Join — 排查工作流

**来源草稿**: ado-wiki-b-device-registration-troubleshooting-windows-10-automatic-device-registration.md, ado-wiki-b-entra-hybrid-join-using-entra-kerberos.md, ado-wiki-d-device-registration-authentication-android.md, ado-wiki-device-registration-authentication-android.md, ado-wiki-device-registration-basic-knowledge.md, ado-wiki-device-registration-flowchart.md, ado-wiki-device-registration-troubleshooting-device-management.md, ado-wiki-entra-hybrid-join-using-entra-kerberos.md, ado-wiki-troubleshooting-win10-automatic-device-registration.md, ado-wiki-troubleshooting-windows7-automatic-device-registration.md... (+3 more)
**场景数**: 11
**生成日期**: 2026-04-07

---

## Scenario 1: ado-wiki-b-device-registration-troubleshooting-windows-10-automatic-device-registration
> 来源: ado-wiki-b-device-registration-troubleshooting-windows-10-automatic-device-registration.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Add rule to tag USER accounts: `NOT EXISTS([accounttype == "DJ"]) => add(Type = "...accounttype", Value = "User");`
- 2. Modify ImmutableId rule to apply only to users (add `&& c2:[accounttype, Value == "User"]` condition)
- 3. Add separate ImmutableId rule for DJ computer accounts using `objectGUID`
- 1. Download auth scripts: [KB4487175](https://internal.evergreen.microsoft.com/en-us/help/4487175)
- 2. Elevated PowerShell: `.\Start-auth.ps1 -v -acceptEULA`
- 3. Reproduce the issue (restart or run Automatic-Device-Join scheduled task)
- 4. `.\stop-auth.ps1`
- 5. Upload `authlogs` folder to DTM workspace
- 1. `usercertificate` attribute missing on computer object → `dsregcmd /leave`, delete MS-Organization-Access cert from `certlm.msc`, restart, trigger delta sync
- 2. Device object missing in Azure AD → same as above; re-check sync

---

## Scenario 2: Add Kerberos SPN if missing
> 来源: ado-wiki-b-entra-hybrid-join-using-entra-kerberos.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 3: Device Registration and Authentication on Android
> 来源: ado-wiki-d-device-registration-authentication-android.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. 检查缓存中是否有有效 access token → 有则直接返回
- 2. 若无有效 access token，使用 refresh token 获取新 token（含 access/id/refresh token），缓存后返回
- 3. 若 refresh token 无效，返回错误 → 应用发起新的交互式请求（用户输入凭据、MFA 等）
- 1. 设备网络连接不稳定
- 2. 防火墙/代理拦截应用的网络请求
- 4. 应用版本过旧或不兼容
- 1. 检查网络连接稳定性
- 2. 禁用可能拦截请求的防火墙/代理
- 3. 关闭 broker 应用的电池/电源优化
- 4. 验证设备能访问互联网（系统浏览器登录 Teams/Outlook）

### 相关错误码: AADSTS50097

---

## Scenario 4: Device Registration and Authentication on Android
> 来源: ado-wiki-device-registration-authentication-android.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting**
   - 1. Get correlationID/UPN, app name and timestamp → find signing logs in ASC
   - 2. Check device properties in sign-in logs (IsManaged, IsCompliant, IsKnown, etc.)
   - 3. If no device properties → check user agent via ASC Azure AD explorer > Diagnostics

---

## Scenario 5: Device Registration Basic Knowledge
> 来源: ado-wiki-device-registration-basic-knowledge.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting References**
   - [Troubleshooting Windows 10 Automatic Device Registration](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=184298)
   - [Troubleshooting Windows 10 Azure AD Join](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=184167)
   - [Troubleshooting Windows 10 Add Work/School Account](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=184297)

---

## Scenario 6: Device Registration Flowcharts
> 来源: ado-wiki-device-registration-flowchart.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting**
   - See [Device registration](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=184217) for detailed troubleshooting.

---

## Scenario 7: ado-wiki-device-registration-troubleshooting-device-management
> 来源: ado-wiki-device-registration-troubleshooting-device-management.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Delete stale/unused devices
- 2. Increase quota: Portal > AD > Users and groups > Device Settings > Maximum number of devices per user

---

## Scenario 8: Entra Hybrid Join using Entra Kerberos
> 来源: ado-wiki-entra-hybrid-join-using-entra-kerberos.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting - Collecting Kerberos Logs**
   - 1. Download and unzip logging scripts from https://aka.ms/authscripts
   - 2. If multiple WS2025 DCs, stop KDC on all except one: `net stop kdc`
   - 3. On remaining WS2025 DC: run `start-auth.ps1`

---

## Scenario 9: Test Device Registration Connectivity
> 来源: ado-wiki-troubleshooting-win10-automatic-device-registration.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting workflows by scenario**

---

## Scenario 10: ado-wiki-troubleshooting-windows7-automatic-device-registration
> 来源: ado-wiki-troubleshooting-windows7-automatic-device-registration.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting: None of the Windows 7 devices registering**
   - 1. Run `Get-EntraDomain` — check Name, Status, Authentication; domain must be verified & federated
   - 2. Verify SCP is configured correctly for Azure DRS (not on-prem DRS)
   - 3. Network connectivity — device must reach:
2. **Troubleshooting: Some devices not registering (user/device specific)**
   - 1. User UPN domain suffix must be a verified, federated domain
   - 2. User account must be enabled and not locked out
   - 3. Check device quota not exceeded
3. **Troubleshooting: Repeated re-registration needed**
   - 1. WPJ state stored in 2 places: user profile (HKCU) + user's My cert store — must be in sync
   - Enterprise credential roaming or user profile roaming can break sync
   - 2. Users signing into multiple RDP VMs running Windows 7 → device quota exhaustion → silent WPJ stops working

---

## Scenario 11: Device Registration Proxy Configuration & Troubleshooting
> 来源: onenote-device-registration-proxy-config.md | 适用: Mooncake ✅

### 排查步骤
- 1. **WPAD** (recommended): Web Proxy Auto-Discovery - works for both WinHTTP and WinINET
- 2. **GPO**: Deploy WinHTTP proxy settings via Group Policy (Windows 10 1709+)
- 3. **Manual**: `netsh winhttp set proxy <proxy-server>`
- 1. **Test-DeviceRegistration Connectivity script**: Runs commands under SYSTEM context via scheduled tasks. No need for PsExec.
- 2. **PsExec**: Launch IE or PowerShell as SYSTEM to test connectivity
- 3. **Network trace**: Clear DNS cache first (`ipconfig /flushdns`) before capturing

---


---

## Incremental Scenarios (2026-04-18)

## Scenario 12: Azure AD joined machines take approximately 3 hours  (=2.77 hours) to boot up the logon screen. The machine is not hung ...
> Source: contentidea-kb (entra-id-3668) | Applicability: unverified

### Troubleshooting Steps
1. **Confirm symptom**: Azure AD joined machines take approximately 3 hours  (=2.77 hours) to boot up the logon screen. The machine is not hung and you will see a black screen with spinning dots. 2.77 hours later, after the ...
2. **Root cause**: When you logon with AzureAD account synced with on-premises AD, the domain information of the on-premises AD is set to the client OS. If the on-premises Domain NetBIOS name and the Work Group name of ...
3. **Solution**: Change the Work Group name of the client to a different name than the Domain NetBIOS name of the on-premises AD. This bug will be fixed in the future release.

---
