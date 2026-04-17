# AVD AVD Teams 多媒体 - 杂项 - Comprehensive Troubleshooting Guide

**Entries**: 14 | **Drafts fused**: 4 | **Kusto queries fused**: 0
**Source drafts**: ado-wiki-b-mmr-technical-solution.md, ado-wiki-screenshot-capture-teams-macos-scoping-questions.md, ado-wiki-screenshot-capture-teams-macos-setup-guide.md, ado-wiki-teams-channel-collaboration-template.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: MS Learn, OneNote, KB, ADO Wiki

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Teams calls drop on the local machine that has an HID periph... | Known issue with Slimcore VDI 2.0 - HID peripheral connected... | Known issue - avoid running Teams simultaneously on the loca... |
| Microsoft Teams running very slow in AVD session. High P95 i... | High input delay on session host indicates either network pe... | 1. Check AVD Insights input delay metrics in portal. 2. If g... |
| AVD Teams/apps running very slow. AVD Insights shows high P9... | Input delay measures the time between user input and screen ... | Check AVD Insights metrics: Green = focus on network perf. R... |
| Capture Screen option greyed out in Windows App on macOS whe... | Windows App version not 2926, Screen Capture Redirection not... | 1) Confirm Windows App version is 2926. 2) Enable Experiment... |
| Cloud PC DeviceModel changed to 'Virtual Machine' in Intune.... | Third-party app (e.g., Carbon Black) blocks the SetDeviceMod... | 1) Check registry HKLM\SYSTEM\ControlSet001\Control\SystemIn... |
| DeviceLock policy (Max Inactivity Time Device Lock) not work... | Citrix VDA overrides the display-required state, preventing ... | Add registry key on the Cloud PC and reboot: HKEY_LOCAL_MACH... |
| Blank screen shows in Teams meeting window instead of video ... | Known Teams Slimcore VDI 2.0 behavior: opening Start menu on... | Known limitation - no fix currently available. Avoid opening... |
| Screen Capture Protection (SCP) causes the presenter shared ... | Known limitation in Slimcore VDI 2.0 optimization - SCP conf... | Disable Screen Capture Protection (SCP) if screen sharing is... |

### Phase 2: Detailed Investigation

#### Confirm client meets requirements
> Source: [ado-wiki-b-mmr-technical-solution.md](guides/drafts/ado-wiki-b-mmr-technical-solution.md)

- [MMR Requirements](https://docs.microsoft.com/en-us/azure/virtual-desktop/multimedia-redirection#requirements)

#### Scoping Questions - Screenshot Capture in Teams via Windows App on macOS
> Source: [ado-wiki-screenshot-capture-teams-macos-scoping-questions.md](guides/drafts/ado-wiki-screenshot-capture-teams-macos-scoping-questions.md)

## 1. Environment & Configuration

#### Screenshot Capture in Teams via Windows App on macOS - Setup Guide
> Source: [ado-wiki-screenshot-capture-teams-macos-setup-guide.md](guides/drafts/ado-wiki-screenshot-capture-teams-macos-setup-guide.md)

## Enable the Feature (Client-side)

#### Windows 365 Support - Case Collaboration Template
> Source: [ado-wiki-teams-channel-collaboration-template.md](guides/drafts/ado-wiki-teams-channel-collaboration-template.md)

Channel: https://aka.ms/W365TeamsCollab

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | Teams calls drop on the local machine that has an HID peripheral connected if a ... | Known issue with Slimcore VDI 2.0 - HID peripheral connected to the local endpoi... | Known issue - avoid running Teams simultaneously on the local machine and in the... | 🟢 8.0 | ADO Wiki |
| 2 | Microsoft Teams running very slow in AVD session. High P95 input delay reported ... | High input delay on session host indicates either network performance bottleneck... | 1. Check AVD Insights input delay metrics in portal. 2. If green -> focus on net... | 🟢 8.0 | OneNote |
| 3 | AVD Teams/apps running very slow. AVD Insights shows high P95 input delay. | Input delay measures the time between user input and screen update. High input d... | Check AVD Insights metrics: Green = focus on network perf. Red = focus on sessio... | 🟢 8.0 | OneNote |
| 4 | Capture Screen option greyed out in Windows App on macOS when connecting to Clou... | Windows App version not 2926, Screen Capture Redirection not enabled in Experime... | 1) Confirm Windows App version is 2926. 2) Enable Experimental > Screen Capture ... | 🔵 7.5 | ADO Wiki |
| 5 | Cloud PC DeviceModel changed to 'Virtual Machine' in Intune. Devices fall out of... | Third-party app (e.g., Carbon Black) blocks the SetDeviceModel scheduled task, o... | 1) Check registry HKLM\SYSTEM\ControlSet001\Control\SystemInformation\SystemProd... | 🔵 7.5 | ADO Wiki |
| 6 | DeviceLock policy (Max Inactivity Time Device Lock) not working on Windows 365 C... | Citrix VDA overrides the display-required state, preventing Windows from trigger... | Add registry key on the Cloud PC and reboot: HKEY_LOCAL_MACHINE\SOFTWARE\Citrix\... | 🔵 7.5 | ADO Wiki |
| 7 | Blank screen shows in Teams meeting window instead of video feed when user opens... | Known Teams Slimcore VDI 2.0 behavior: opening Start menu on VM disrupts video r... | Known limitation - no fix currently available. Avoid opening Start menu during a... | 🔵 7.5 | ADO Wiki |
| 8 | Screen Capture Protection (SCP) causes the presenter shared screen to show as a ... | Known limitation in Slimcore VDI 2.0 optimization - SCP conflicts with Teams scr... | Disable Screen Capture Protection (SCP) if screen sharing is required in Teams m... | 🔵 7.5 | ADO Wiki |
| 9 | Screen Capture Protection (SCP) causes the presenter shared screen to show as a ... | Known limitation in Slimcore VDI 2.0 optimization - SCP conflicts with Teams scr... | Disable Screen Capture Protection (SCP) if screen sharing is required in Teams m... | 🔵 7.5 | ADO Wiki |
| 10 | Windows App for macOS crashes when user attempts to join a Teams Town Hall meeti... | Teams media optimization (VDI 1.0) does not support Town Hall meetings in Teams.... | Turn off media optimizations and join the Town Hall meeting, or connect to the C... | 🔵 7.5 | ADO Wiki |
| 11 | MMR extension version disappears, fails to load on supported sites | Missing latest Visual C++ Redistributable | Install latest Visual C++ Redistributable | 🔵 7.0 | MS Learn |
| 12 | MMR video redirection has failed while playing few Udemy videos in AVD       ... | MMR doesnt support DRM (digital rights managed) content | U     demy uses DRM content on some of their videos. MMR however does not curre... | 🔵 6.5 | KB |
| 13 | Kraken introduced an update that shifted call handling to a new Kraken phone pop... | Since the pop-up is handling the call, the MMR extension with the phone icon is ... | On the pop-up window right click and select option &quot;show as tab&quot;. That... | 🔵 6.5 | KB |
| 14 | Multimedia redirection does not work on session host | cmd.exe is blocked; MMR requires it | Unblock cmd.exe on session hosts | 🔵 6.0 | MS Learn |
