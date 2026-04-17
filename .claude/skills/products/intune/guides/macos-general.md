# INTUNE macOS 通用问题 — 排查速查

**来源数**: 4 | **21V**: 部分 (5/7)
**条目数**: 7 | **最后更新**: 2026-04-17

## 快速排查路径

1. **macOS 设备上一个 bad pkg 导致整个下载队列阻塞，其他应用也无法下载安装**
   → 1. 重启 storedownloadd 进程或重启设备；2. 修复问题 pkg（确保 PackageInfo 符合要求）；3. macOS 10.14 Mojave 及以后版本已修复此问题 `[ado-wiki, 🟢 9.0]`

2. **Mac device needs to re-enroll in Intune or IntuneMdmDaemon process is stuck/unresponsive**
   → Run 'sudo profiles renew -type enrollment' to re-enroll Mac in Intune. If IntuneMdmDaemon is stuck, kill it first with 'sudo killall IntuneMdmDaemon'. `[onenote, 🟢 8.0]`

3. **macOS pkg 包含 dynamic library 和 executable 应用，安装成功但应用未被检测为已安装**
   → 检查 PackageInfo 确认每个 package 都是 application 类型；如果 pkg 混合了 library 和 app，可能需要分拆或确保主 app bundle 信息正确 `[ado-wiki, 🟢 8.0]`

4. **This article lists and describes the different compliance settings you can configure on macOS devices in Intune. As part of your mobile device management (MDM) solution, use these settings to set a...**
   →  `[contentidea-kb, 🔵 7.5]`

5. **After upgrading to Jamf Pro 10.24.2, macOS Catalina users start receiving multiple prompts each day to allow the JamfAAD process&nbsp;that refreshes the token. These users are not prevented or bloc...**
   → To resolve this issue, the customer will need to work with Jamf to upgrade their Jamf version to 10.26.1 or later.  Jamf has rolled out a fix in JamfPro 10.26.1 to allow for more silent authenticat... `[contentidea-kb, 🔵 7.5]`

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | macOS 设备上一个 bad pkg 导致整个下载队列阻塞，其他应用也无法下载安装 | 损坏/不合规的 pkg 阻塞了 macOS storedownloadd 进程的下载队列，Console 日志显示 LegacyDownloadQueue: Could not add down... | 1. 重启 storedownloadd 进程或重启设备；2. 修复问题 pkg（确保 PackageInfo 符合要求）；3. macOS 10.14 Mojave 及以后版本已修复此问题 | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevelop%20and%20Customize%2FApp%20Wrapping%20Tool%20for%20macOS) |
| 2 | Mac device needs to re-enroll in Intune or IntuneMdmDaemon process is stuck/unresponsive | MDM enrollment profile expired or corrupted, or IntuneMdmDaemon process hung | Run 'sudo profiles renew -type enrollment' to re-enroll Mac in Intune. If IntuneMdmDaemon is stuc... | 🟢 8.0 | onenote: MCVKB/Intune/Mac/Mac re-enroll cmd.md |
| 3 | macOS pkg 包含 dynamic library 和 executable 应用，安装成功但应用未被检测为已安装 | dynamic library 无法通过 macOS MDM 通道发现，导致应用检测失败 | 检查 PackageInfo 确认每个 package 都是 application 类型；如果 pkg 混合了 library 和 app，可能需要分拆或确保主 app bundle 信息正确 | 🟢 8.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevelop%20and%20Customize%2FApp%20Wrapping%20Tool%20for%20macOS) |
| 4 | This article lists and describes the different compliance settings you can configure on macOS dev... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/2822388) |
| 5 | After upgrading to Jamf Pro 10.24.2, macOS Catalina users start receiving multiple prompts each d... | This occurs because the Jamf AAD Binary silent token process changed with the move to MSAL 1.1.2&... | To resolve this issue, the customer will need to work with Jamf to upgrade their Jamf version to ... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4599382) |
| 6 | Standard users get “This app has been blocked by your system administrator” when elevating permis... | There are two possible causes for this issue. 1.&nbsp;Device configuration policy has been set to... | Collect MDM diagnostic report and check if the above policies have been applied. Then either edit... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5016377) |
| 7 | Jamf Pro shows Could not retrieve the access token for Microsoft Graph API when configuring Intun... | Required TCP ports for Jamf-Intune communication are blocked by firewall or proxy (ports 443, 219... | Unblock TCP ports: 443 (Intune), 2195/2196/5223 (macOS devices), 80/5223 (Jamf Pro) | 🔵 6.5 | [mslearn](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/device-protection/could-not-retrieve-access-token) |
