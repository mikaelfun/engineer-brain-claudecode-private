# AVD AVD Teams 多媒体 - 杂项 - Quick Reference

**Entries**: 14 | **21V**: all applicable
**Keywords**: avd-insights, blank-screen, call-drop, citrix-hdx-plus, cloud-pc, cmd.exe, device-model, devicelock
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | Teams calls drop on the local machine that has an HID peripheral connected if a ... | Known issue with Slimcore VDI 2.0 - HID peripheral connected to the local endpoi... | Known issue - avoid running Teams simultaneously on the local machine and in the... | 🟢 8.0 | ADO Wiki |
| 2 📋 | Microsoft Teams running very slow in AVD session. High P95 input delay reported ... | High input delay on session host indicates either network performance bottleneck... | 1. Check AVD Insights input delay metrics in portal. 2. If green -> focus on net... | 🟢 8.0 | OneNote |
| 3 📋 | AVD Teams/apps running very slow. AVD Insights shows high P95 input delay. | Input delay measures the time between user input and screen update. High input d... | Check AVD Insights metrics: Green = focus on network perf. Red = focus on sessio... | 🟢 8.0 | OneNote |
| 4 📋 | Capture Screen option greyed out in Windows App on macOS when connecting to Clou... | Windows App version not 2926, Screen Capture Redirection not enabled in Experime... | 1) Confirm Windows App version is 2926. 2) Enable Experimental > Screen Capture ... | 🔵 7.5 | ADO Wiki |
| 5 📋 | Cloud PC DeviceModel changed to 'Virtual Machine' in Intune. Devices fall out of... | Third-party app (e.g., Carbon Black) blocks the SetDeviceModel scheduled task, o... | 1) Check registry HKLM\SYSTEM\ControlSet001\Control\SystemInformation\SystemProd... | 🔵 7.5 | ADO Wiki |
| 6 📋 | DeviceLock policy (Max Inactivity Time Device Lock) not working on Windows 365 C... | Citrix VDA overrides the display-required state, preventing Windows from trigger... | Add registry key on the Cloud PC and reboot: HKEY_LOCAL_MACHINE\SOFTWARE\Citrix\... | 🔵 7.5 | ADO Wiki |
| 7 📋 | Blank screen shows in Teams meeting window instead of video feed when user opens... | Known Teams Slimcore VDI 2.0 behavior: opening Start menu on VM disrupts video r... | Known limitation - no fix currently available. Avoid opening Start menu during a... | 🔵 7.5 | ADO Wiki |
| 8 📋 | Screen Capture Protection (SCP) causes the presenter shared screen to show as a ... | Known limitation in Slimcore VDI 2.0 optimization - SCP conflicts with Teams scr... | Disable Screen Capture Protection (SCP) if screen sharing is required in Teams m... | 🔵 7.5 | ADO Wiki |
| 9 📋 | Screen Capture Protection (SCP) causes the presenter shared screen to show as a ... | Known limitation in Slimcore VDI 2.0 optimization - SCP conflicts with Teams scr... | Disable Screen Capture Protection (SCP) if screen sharing is required in Teams m... | 🔵 7.5 | ADO Wiki |
| 10 📋 | Windows App for macOS crashes when user attempts to join a Teams Town Hall meeti... | Teams media optimization (VDI 1.0) does not support Town Hall meetings in Teams.... | Turn off media optimizations and join the Town Hall meeting, or connect to the C... | 🔵 7.5 | ADO Wiki |
| 11 📋 | MMR extension version disappears, fails to load on supported sites | Missing latest Visual C++ Redistributable | Install latest Visual C++ Redistributable | 🔵 7.0 | MS Learn |
| 12 📋 | MMR video redirection has failed while playing few Udemy videos in AVD       ... | MMR doesnt support DRM (digital rights managed) content | U     demy uses DRM content on some of their videos. MMR however does not curre... | 🔵 6.5 | KB |
| 13 📋 | Kraken introduced an update that shifted call handling to a new Kraken phone pop... | Since the pop-up is handling the call, the MMR extension with the phone icon is ... | On the pop-up window right click and select option &quot;show as tab&quot;. That... | 🔵 6.5 | KB |
| 14 📋 | Multimedia redirection does not work on session host | cmd.exe is blocked; MMR requires it | Unblock cmd.exe on session hosts | 🔵 6.0 | MS Learn |

## Quick Triage Path

1. Check: Known issue with Slimcore VDI 2.0 - HID peripheral `[Source: ADO Wiki]`
2. Check: High input delay on session host indicates either `[Source: OneNote]`
3. Check: Input delay measures the time between user input a `[Source: OneNote]`
4. Check: Windows App version not 2926, Screen Capture Redir `[Source: ADO Wiki]`
5. Check: Third-party app (e.g., Carbon Black) blocks the Se `[Source: ADO Wiki]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-teams-multimedia-misc.md#troubleshooting-flow)
