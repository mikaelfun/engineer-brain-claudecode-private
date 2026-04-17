# INTUNE macOS Shell 脚本与 Sidecar Agent — 排查速查

**来源数**: 3 | **21V**: 全部适用
**条目数**: 8 | **最后更新**: 2026-04-17

## 快速排查路径

1. **Error uploading macOS shell script (.sh) in Intune console - script preview shows extra Unicode characters (e.g. 'i p c o n f i g' with embedded spaces, BOM header)**
   → Copy the script content to a new file in Notepad, then Save As with ANSI encoding (or UTF-8 without BOM). Re-upload the corrected .sh file to Intune. `[ado-wiki, 🟢 9.0]`

2. **Exclude groups option missing for PowerShell scripts assignments in Intune UI — cannot exclude groups from script targeting**
   → 1) Submit SAW request to add flighting tag 'EnableGAndTForPowershell' via ICM/IET 2) WARNING: procedure removes ALL existing Windows PowerShell script assignments 3) Customer must capture current a... `[ado-wiki, 🟢 9.0]`

3. **macOS 11.2.x devices: apps can't be downloaded/installed (Install Pending indefinitely), shell scripts don't run, Intune management agent installation fails. Error 506 'Install request is a duplica...**
   → Upgrade the device to macOS 11.3 or later version. `[mslearn, 🟢 8.0]`

4. **Customer is using RBAC roles to manage scripts and other resources.RBAC showed the user with this RBAC should be able to access the script as user has Assign, Create, Delete, Read, Update and View ...**
   → Please have the customer attempt the following as a potential workaround:  With      an admin account, go to Devices -&gt; macOS -&gt; Custom attributesOpen      all custom attribute policies and e... `[contentidea-kb, 🔵 7.5]`

5. **This article describes generic troubleshooting steps to follow when investigating MacOS scripts delivered from Intune.**
   →  `[contentidea-kb, 🔵 7.5]`

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Error uploading macOS shell script (.sh) in Intune console - script preview shows extra Unicode c... | Script file saved with Unicode/UTF-16 encoding, injecting non-standard Unicode BOM and wide-chara... | Copy the script content to a new file in Notepad, then Save As with ANSI encoding (or UTF-8 witho... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Config%20Features%20Restrictions%20and%20Custom%2FmacOS) |
| 2 | Exclude groups option missing for PowerShell scripts assignments in Intune UI — cannot exclude gr... | Older tenant was built without exclude groups functionality for PowerShell scripts. Newer tenants... | 1) Submit SAW request to add flighting tag 'EnableGAndTForPowershell' via ICM/IET 2) WARNING: pro... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FSAW%20Actions%2FExclude%20Groups%20Powershell) |
| 3 | macOS 11.2.x devices: apps can't be downloaded/installed (Install Pending indefinitely), shell sc... | Known macOS Big Sur 11.2.x bug causing ASDErrorDomain Code=506 duplicate install request errors. | Upgrade the device to macOS 11.3 or later version. | 🟢 8.0 | [mslearn](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/app-management/cannot-install-macos-apps-and-run-shell-scripts) |
| 4 | Customer is using RBAC roles to manage scripts and other resources.RBAC showed the user with this... | Issue is caused at service level. Fix roll-out is in preparation. | Please have the customer attempt the following as a potential workaround:  With      an admin acc... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4602839) |
| 5 | This article describes generic troubleshooting steps to follow when investigating MacOS scripts d... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4616314) |
| 6 | THIS CONTENT IS NO LONGER UP TO DATE. FOR THE MOST UP-TO-DATE CONTENT, REFER TO THE INTUNE CSS WI... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4650118) |
| 7 | The Exclusion&nbsp;button for Powershell Scripts is not visible in the UI. | The customer must be flighted for EnableGAndTForPowershell&nbsp;to get the Exclusion&nbsp;group o... | To resolve this problem, the customer must be flighted&nbsp;EnableGAndTForPowershell. Note howeve... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5031811) |
| 8 | Currently, the Intune platform does not support retrieving or downloading PowerShell scripts once... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5061769) |

> 本 topic 有排查工作流 → [排查工作流](workflows/macos-scripts.md)
> → [已知问题详情](details/macos-scripts.md)
