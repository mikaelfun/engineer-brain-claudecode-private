# INTUNE macOS 通用问题 — 已知问题详情

**条目数**: 7 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: macOS 设备上一个 bad pkg 导致整个下载队列阻塞，其他应用也无法下载安装
**Solution**: 1. 重启 storedownloadd 进程或重启设备；2. 修复问题 pkg（确保 PackageInfo 符合要求）；3. macOS 10.14 Mojave 及以后版本已修复此问题
`[Source: ado-wiki, Score: 9.0]`

### Step 2: Mac device needs to re-enroll in Intune or IntuneMdmDaemon process is stuck/unresponsive
**Solution**: Run 'sudo profiles renew -type enrollment' to re-enroll Mac in Intune. If IntuneMdmDaemon is stuck, kill it first with 'sudo killall IntuneMdmDaemon'.
`[Source: onenote, Score: 8.0]`

### Step 3: macOS pkg 包含 dynamic library 和 executable 应用，安装成功但应用未被检测为已安装
**Solution**: 检查 PackageInfo 确认每个 package 都是 application 类型；如果 pkg 混合了 library 和 app，可能需要分拆或确保主 app bundle 信息正确
`[Source: ado-wiki, Score: 8.0]`

### Step 4: This article lists and describes the different compliance settings you can configure on macOS devices in Intune. As part of your mobile device mana...
**Solution**: 
`[Source: contentidea-kb, Score: 7.5]`

### Step 5: After upgrading to Jamf Pro 10.24.2, macOS Catalina users start receiving multiple prompts each day to allow the JamfAAD process&nbsp;that refreshe...
**Solution**: To resolve this issue, the customer will need to work with Jamf to upgrade their Jamf version to 10.26.1 or later.  Jamf has rolled out a fix in JamfPro 10.26.1 to allow for more
silent authentication attempts prior to defaulting to a manual process needing
end user action which typically will resolve the issue. JamfPro 10.26.1 has also updated to MSAL
version 1.1.12. &nbsp;  Also&nbsp;Customer can configure the JamfAAD to recheck for a valid Azure AD token at check-in by pushing a script from J
`[Source: contentidea-kb, Score: 7.5]`

### Step 6: Standard users get “This app has been blocked by your system administrator” when elevating permission. Normally, we are expected to see the UAC pro...
**Solution**: Collect MDM diagnostic report and check if the above
policies have been applied. Then either edit the existing policy to allow
elevation prompt or deploy a new configuration policy to overwrite the local GPO
setting modified by SharedPC CSP.
`[Source: contentidea-kb, Score: 7.5]`

### Step 7: Jamf Pro shows Could not retrieve the access token for Microsoft Graph API when configuring Intune integration
**Solution**: Unblock TCP ports: 443 (Intune), 2195/2196/5223 (macOS devices), 80/5223 (Jamf Pro)
`[Source: mslearn, Score: 6.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | macOS 设备上一个 bad pkg 导致整个下载队列阻塞，其他应用也无法下载安装 | 损坏/不合规的 pkg 阻塞了 macOS storedownloadd 进程的下载队列，Console 日志显示 LegacyDownloadQueue... | 1. 重启 storedownloadd 进程或重启设备；2. 修复问题 pkg（确保 PackageInfo 符合要求）；3. macOS 10.14 ... | 9.0 | ado-wiki |
| 2 | Mac device needs to re-enroll in Intune or IntuneMdmDaemon process is stuck/u... | MDM enrollment profile expired or corrupted, or IntuneMdmDaemon process hung | Run 'sudo profiles renew -type enrollment' to re-enroll Mac in Intune. If Int... | 8.0 | onenote |
| 3 | macOS pkg 包含 dynamic library 和 executable 应用，安装成功但应用未被检测为已安装 | dynamic library 无法通过 macOS MDM 通道发现，导致应用检测失败 | 检查 PackageInfo 确认每个 package 都是 application 类型；如果 pkg 混合了 library 和 app，可能需要分拆... | 8.0 | ado-wiki |
| 4 | This article lists and describes the different compliance settings you can co... |  |  | 7.5 | contentidea-kb |
| 5 | After upgrading to Jamf Pro 10.24.2, macOS Catalina users start receiving mul... | This occurs because the Jamf AAD Binary silent token process changed with the... | To resolve this issue, the customer will need to work with Jamf to upgrade th... | 7.5 | contentidea-kb |
| 6 | Standard users get “This app has been blocked by your system administrator” w... | There are two possible causes for this issue. 1.&nbsp;Device configuration po... | Collect MDM diagnostic report and check if the above policies have been appli... | 7.5 | contentidea-kb |
| 7 | Jamf Pro shows Could not retrieve the access token for Microsoft Graph API wh... | Required TCP ports for Jamf-Intune communication are blocked by firewall or p... | Unblock TCP ports: 443 (Intune), 2195/2196/5223 (macOS devices), 80/5223 (Jam... | 6.5 | mslearn |
