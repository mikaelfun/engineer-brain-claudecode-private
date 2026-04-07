---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Windows 365 Boot/Setup Guide"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Windows%20365%20Boot/Setup%20Guide"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Windows 365 Boot Setup Guide (End-to-End)

## Prerequisites

- **OS**: Windows 11 Pro, Enterprise, or IoT Enterprise, version **22621.3374 or later**
- **Roles**: Intune Service Administrator permissions
- **Licenses**: Windows 365 Enterprise Cloud PC assigned to the user
- **Network**: Internet access during setup
- **Apps**: Latest **Windows App** (v2.0.285+) installed automatically via Intune Guided Scenario
- **Device Type**: Physical or VM (Hyper-V supported)

## Step 1: Prepare the Physical Device

1. Boot into Windows 11 and enable updates: Settings > Windows Update > Turn on "Get the latest updates as soon as they're available"
2. Wipe the device from Intune: Devices > All devices > [Select device] > Wipe (do NOT select additional wipe options)
3. Wait for device to reset and return to OOBE

## Step 2: Register Device with Windows Autopilot

1. At OOBE sign-in screen, press **Shift + F10** to open Command Prompt
2. Run:
   ```powershell
   PowerShell.exe -ExecutionPolicy Bypass
   [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
   Install-Script -Name Get-WindowsAutopilotInfo -Force
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
   Get-WindowsAutopilotInfo -Online
   ```
3. Sign in with an account that has **Intune Administrator** role
4. Note the device serial number

## Step 3: Configure Windows 365 Boot in Intune

1. Sign in to Microsoft Intune Admin Center
2. Navigate to: Devices > Windows 365 > Windows 365 Boot (under Windows 365 guides)
3. Launch the **Guided Scenario** and complete:
   - Introduction > Next
   - Basics: Apply Autopilot device name template, set resource name prefix
   - Endpoint Updates: Configure Windows Update for Business settings
   - Settings: Configure Wi-Fi, VPN, and Language profiles if needed
   - Assignments: Create or select a Microsoft Entra security group for Boot devices
4. Click Review + Create

## Step 4: Add Device to Windows 365 Boot Group

1. In Intune: Groups > All groups > select the group from Guided Scenario
2. Members > Add members > Search by serial number > Select device > Add
3. Wait for policy sync (several minutes)

## Step 5: Complete OOBE and Boot to Cloud PC

1. Restart the device and complete OOBE
2. Device will automatically apply Boot configuration
3. On next sign-in, user goes directly to their Windows 365 Cloud PC

## Step 6: Validate and Troubleshoot

Confirm registry keys:
```
HKLM\Software\Microsoft\PolicyManager\current\device\CloudDesktop\BootToCloudMode = 1
HKLM\Software\Microsoft\PolicyManager\current\device\WindowsLogon\OverrideShellProgram = 1
HKLM\Software\Microsoft\Windows\CurrentVersion\SharedPC\NodeValues\01 = 1
```

Check installed app versions:
```powershell
Get-AppxPackage -AllUsers -Name *MicrosoftCorporationII*
# Confirm Windows App >= 2.0.704.0
```

If Boot fails, verify:
- Device is in the correct group
- Policies synced in Intune
- Required apps installed

## Optional Enhancements

- **Restrict local access**: Apply CSP policies to prevent Task Manager or local sign-in
- **Enable Return to Local**: Allows fallback to physical device from Ctrl+Alt+Del screen
- **Branding**: Customize login screen via Intune personalization settings
