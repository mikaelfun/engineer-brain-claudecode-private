---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Windows 365 Boot/Boot Guided Scenario"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Windows%20365%20Boot/Boot%20Guided%20Scenario"
importDate: "2026-04-05"
type: setup-guide
---

> **Scope:** This page covers only the **Intune Guided Scenario** for Windows365 Boot - what it does, prerequisites, the exact resources it creates today, settings you'll see, known issues that affect guided-scenario deployments, and post-deployment management.
> **Launch link:** **https://aka.ms/w365bootGS**

# Overview - What is the Windows 365 Boot Guided Scenario?

The **Windows365 Boot Guided Scenario** in the Intune admin center is a curated wizard that creates and assigns all required Intune artifacts so targeted Windows 11 devices boot directly to a user's Cloud PC. It assembles Autopilot, ESP, device configuration, WUfB updates, and optional physical-device access settings, then assigns them to the Microsoft Entra group you select. After creation, you manage these artifacts in their native Intune blades.

# Resources created by the Intune Guided Scenario wizard

- Windows365 App Boot
- Windows365 Boot Enrollment Status Page Profile Boot
- Windows365 Boot Autopilot Profile Boot
- Windows365 Boot Device Configuration Policy Boot
- Windows365 Boot Windows Update Policy Boot
- [Optional] Windows365 Boot Physical Device Access Policy Boot

**Important change:** HostApp is no longer required for Windows365 Boot and is not created by the wizard.

# Requirements

- **OS:** Windows 11 Pro/Enterprise build 22621.3374+ (physical device and Cloud PC)
- **Admin role:** Intune Service Administrator (or Intune Administrator)
- **WindowsApp:**
  - **Required minimum version:** **2.0.704.0** (or later) to enable the new **Connection Center experience** (multi-Cloud PC selection, restart, troubleshooting at sign-in)
  - Verify version with: `Get-AppxPackage -AllUsers -Name *MicrosoftCorporationII* | Select Name, Version`
- **Licensing:** Windows365 license for each user (Enterprise/Frontline as applicable)

# How the guided scenario works (flow & choices)

1. **Launch - Introduction**: Confirm prerequisites
2. **Basics**: Resource prefix (recommended), Autopilot device name template (optional)
3. **Endpoint updates**: Creates a Windows Update for Business policy
4. **Settings**: Optionally attach WiFi, VPN, and language profiles; configure Physical Device Access
5. **Assignments**: Choose/create a Microsoft Entra group
6. **Review + create**: Deploys resources with your prefix

# Preparing devices before assignment

- Update Windows and wipe if repurposing
- Register with Windows Autopilot at OOBE (`Shift+F10` -> `Get-WindowsAutopilotInfo -Online`)
- Add the device to the Boot assignment group
- Complete OOBE; on first user sign-in the device boots straight into the Cloud PC

**Verification tips:**
- Confirm registry keys:
```
HKLM\Software\Microsoft\PolicyManager\current\device\CloudDesktop\BootToCloudMode = 1
HKLM\Software\Microsoft\PolicyManager\current\device\WindowsLogon\OverrideShellProgram = 1
HKLM\Software\Microsoft\Windows\CurrentVersion\SharedPC\NodeValues\01 = 1
```
- Check installed app versions:
  - `Get-AppxPackage -AllUsers -Name *MicrosoftCorporationII*`
  - Confirm Windows App is >= 2.0.704.0

# Physical-device access (optional policy)

Lets users return to the local OS from Ctrl+Alt+Del or Boot error screens for captive WiFi or break-glass scenarios.

# FAQ

**Q: Why doesn't the wizard create HostApp anymore?**
A: Because Windows App no longer depends on it.

**Q: Where do I start the guided scenario?**
A: Use https://aka.ms/w365bootGS or Intune: Devices > Windows365 > Windows365 Boot.

# Public Links

- Launch Link: https://aka.ms/w365bootGS
- Public Docs: https://learn.microsoft.com/en-us/windows-365/enterprise/windows-365-boot-guide
