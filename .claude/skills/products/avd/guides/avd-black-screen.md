# AVD AVD 黑屏 - Quick Reference

**Entries**: 10 | **21V**: partial
**Keywords**: 0x10b, 0x3, 4005-event, agent-update, appreadiness, black-screen, boot-policy, by-design
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | Black screen after Windows Login on Windows 365 Boot device - user logs in and s... | Boot policy misconfiguration: Boot-to-Cloud fails so user stays local, but Light... | 1) Validate Intune policy assignments: Enable Windows 365 Boot Desktop = Enabled... | 🟢 9.0 | ADO Wiki |
| 2 | AVD user sees black screen after login followed by error message. Session host s... | Session host VM stuck in upgrading state after RD Agent auto-update did not comp... | Restart the affected VM to trigger re-check of WVD agent status. VM returns to A... | 🟢 8.5 | OneNote |
| 3 | AVD/RDS session host experiences server hang, slow performance, slow logons, bla... | Firewall rules accumulate in AppIso and IfIso registry keys over time when many ... | Phase 1: Enable GPO "Delete cached copies of roaming profiles" to prevent future... | 🔵 7.5 | ADO Wiki |
| 4 | CTRL+ALT+DEL and CTRL+ALT+END keyboard shortcuts trigger on Cloud PC instead of ... | By design, keyboard shortcuts like CTRL+ALT+DEL do not propagate through nested ... | On the destination remote server, create a shortcut: C:\Windows\explorer.exe she... | 🔵 7.5 | ADO Wiki |
| 5 | Black screen then disconnect. Error 0x10b or 0x3 (CreateInputDevicesError). Winl... | DeviceInstallation CSP policies (PreventInstallationOfMatchingDeviceIDs etc.) de... | Get MDM report and GPResults. Identify DeviceInstallation CSP policies on Cloud ... | 🔵 7.5 | ADO Wiki |
| 6 | Intermittently black screen appears and session disconnects. Winlogon terminatio... | Session not terminated completely on logoff. At around 250-260 session IDs, netp... | Known issue fixed in 20H1 (2004) and later. For earlier versions, schedule netpr... | 🔵 7.5 | KB |
| 7 | Cloud PC shows black screen. RCM process exit in Kusto. Appx/Readiness suspected... | AppReadiness tasks timing out during logon causing desktop to fail to render | Add registry keys: (1) HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\A... | 🔵 7.0 | ADO Wiki |
| 8 | Azure Virtual Desktop (AVD) users are affected by black screen on logon. While t... | A Complete Memory Dump Collected During the re-pro Shows explorer.exe is Stuck a... | We are tracking this issue in this Bug record (Please do not share this Bug deta... | 🔵 6.5 | KB |
| 9 | If you are running Windows 10 22H2 in Azure as VDI your user might get stuck for... | The AppXSvc is crashing. Do you know what it is? Lets ask our good friend Copilo... | Apply 10D on Windows 10 22H2 AVD via&nbsp;https://support.microsoft.com/en-us/to... | 🔵 6.5 | KB |
| 10 | Black screen on Cloud PC connection followed by disconnection. Error codes 0x10b... | DeviceInstallation CSP policies (PreventInstallationOfMatchingDeviceIDs, Prevent... | Collect MDM report and GPResults. Identify DeviceInstallation CSP policies being... | 🔵 6.0 | ADO Wiki |

## Quick Triage Path

1. Check: Boot policy misconfiguration: Boot-to-Cloud fails `[Source: ADO Wiki]`
2. Check: Session host VM stuck in upgrading state after RD `[Source: OneNote]`
3. Check: Firewall rules accumulate in AppIso and IfIso regi `[Source: ADO Wiki]`
4. Check: By design, keyboard shortcuts like CTRL+ALT+DEL do `[Source: ADO Wiki]`
5. Check: DeviceInstallation CSP policies (PreventInstallati `[Source: ADO Wiki]`
