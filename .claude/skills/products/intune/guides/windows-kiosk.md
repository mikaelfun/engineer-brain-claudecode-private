# INTUNE Windows Kiosk 模式 — 排查速查

**来源数**: 2 | **21V**: 全部适用
**条目数**: 7 | **最后更新**: 2026-04-17

## 快速排查路径

1. **Intune PowerShell script deployed to multi-app kiosk device reports success in Azure portal but script does not actually execute (e.g. registry changes not applied)**
   → Add to kiosk XML allowed apps: <App AppUserModelId='Microsoft.Management.Clients.IntuneManagementExtension' />, <App DesktopAppPath='%SystemRoot%\system32\WindowsPowerShell\v1.0\powershell.exe' />,... `[onenote, 🟢 9.5]`

2. **Kiosk profile deployment shows error 'No Mapping Between Account Names and Security IDs was Done' in Device Management logs**
   → Ensure the specified kiosk user account exists on the device before deploying the kiosk profile. For local user: create the account first. For Azure AD user: ensure user has previously signed in, o... `[onenote, 🟢 9.5]`

3. **Specified application does not appear in kiosk mode start menu despite being configured in the kiosk XML alternative start layout**
   → 1) Verify .lnk file exists at exact path in XML (e.g. %ALLUSERSPROFILE%\Microsoft\Windows\Start Menu\Programs\); 2) Test by navigating to lnk path as kiosk user; 3) If lnk missing, create it or swi... `[onenote, 🟢 9.5]`

4. **Windows 10 Kiosk mode with 'Local User Account' logon type fails with error 'No mapping between account names and security IDs was done'. The specified kiosk account does not exist on device.**
   → Use 'Auto-logon' as the Logon type instead of 'Local User Account'. Auto-logon creates a local 'Kiosk' account automatically on the device and logs in after every restart. All kiosk policies are ap... `[onenote, 🟢 9.5]`

5. **After setting up Windows 10 multi-app kiosk devices with multiple monitors, users experience the following behavior:   Multi-app kiosk profile gets deployed to device. The device is rebooted which ...**
   → There are two potential work arounds:1.     Set dual monitor to “Duplicate display” instead of “Extend display”.   or        2.     Change to Single-app kiosk mode, which is compatible with dual mo... `[contentidea-kb, 🔵 7.5]`

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Intune PowerShell script deployed to multi-app kiosk device reports success in Azure portal but s... | In multi-app kiosk mode only applications listed in Assigned Access XML allowed apps can execute.... | Add to kiosk XML allowed apps: <App AppUserModelId='Microsoft.Management.Clients.IntuneManagement... | 🟢 9.5 | onenote: Mooncake POD Support Notebook/POD/VMS... |
| 2 | Kiosk profile deployment shows error 'No Mapping Between Account Names and Security IDs was Done'... | The user account specified in the kiosk profile logon type (Local user or Azure AD user) does not... | Ensure the specified kiosk user account exists on the device before deploying the kiosk profile. ... | 🟢 9.5 | onenote: Mooncake POD Support Notebook/POD/VMS... |
| 3 | Specified application does not appear in kiosk mode start menu despite being configured in the ki... | The .lnk shortcut file referenced in the kiosk XML start layout does not exist at the specified p... | 1) Verify .lnk file exists at exact path in XML (e.g. %ALLUSERSPROFILE%\Microsoft\Windows\Start M... | 🟢 9.5 | onenote: Mooncake POD Support Notebook/POD/VMS... |
| 4 | Windows 10 Kiosk mode with 'Local User Account' logon type fails with error 'No mapping between a... | When 'Local User Account' is selected as kiosk logon type, Windows tries to map to an already exi... | Use 'Auto-logon' as the Logon type instead of 'Local User Account'. Auto-logon creates a local 'K... | 🟢 9.5 | onenote: Mooncake POD Support Notebook/POD/VMS... |
| 5 | After setting up Windows 10 multi-app kiosk devices with multiple monitors, users experience the ... | The issue is expected and by-design. This is because a multi-app kiosk profile uses      Lockdown... | There are two potential work arounds:1.     Set dual monitor to “Duplicate display” instead of “E... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4603146) |
| 6 | This article guides you through creating a Windows 10 Kiosk device with Shell Launcher using Micr... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4645758) |
| 7 | Windows 10 multi app kiosk mode can't use cache credentials to log on for devices without interne... | It is by design and mentioned in our&nbsp;official documentation that mention that &quot;The kios... | By design when you select Azure AD group in the kiosk (multi app) policy there is a Graph querry ... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5008999) |

> 本 topic 有排查工作流 → [排查工作流](workflows/windows-kiosk.md)
> → [已知问题详情](details/windows-kiosk.md)
