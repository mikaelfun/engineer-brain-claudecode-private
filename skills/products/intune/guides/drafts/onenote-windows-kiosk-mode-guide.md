# Windows Kiosk Mode - Configuration & Troubleshooting Guide

## Deployment Methods

### Option 1: Intune Built-in Kiosk Profile
- Create configuration profile > Kiosk (Preview) > Windows 10 and later
- Add UWP, Windows Store, or Win32 apps
- For multi-app kiosk, import a start menu XML layout
- Only supported on Windows 10+ (Pro/Enterprise/Education) 1803+

### Option 2: Custom OMA-URI
- OMA-URI: `./Device/Vendor/MSFT/AssignedAccess/Configuration`
- Data Type: String (XML payload)
- More flexibility for customized settings

### Option 3: PowerShell Script
- Deploy XML via PowerShell for maximum customization
- Can create shortcuts and configure auto-logon for cloud accounts

## Collecting App AUMIDs
```powershell
$installedapps = Get-AppxPackage
$aumidList = @()
foreach ($app in $installedapps) {
    foreach ($id in (Get-AppxPackageManifest $app).package.applications.application.id) {
        $aumidList += $app.packagefamilyname + "!" + $id
    }
}
$aumidList
```

## User Logon Types (Multi-App Kiosk)
- **Auto-logon**: System creates a local account automatically
- **Local user**: Must pre-exist on device, else "No Mapping Between Account Names and Security IDs" error
- **Azure AD user**: Must have previously signed in to device

## Start Layout
- **Default Layout**: System auto-generates icons for allowed apps
- **Alternative Layout (XML)**: Admin specifies .lnk file paths for start menu icons
  - Important: Kiosk user must have read access to .lnk file paths
  - If .lnk is missing at specified path, app silently omitted from start menu

## Common Issues

### Kiosk auto-logon breaks with password policy
- Cause: Password policy creates EAS registry at `HKLM\SYSTEM\CurrentControlSet\Control\EAS`
- Fix: Remove password policy from kiosk devices, delete EAS registry, re-enroll

### PowerShell scripts don't execute on kiosk
- Cause: IME and PowerShell not in allowed apps list
- Fix: Add IME AppUserModelId + PowerShell paths to XML

### Task Scheduler UI not available
- taskschd.msc is an MMC snap-in; requires mmc.exe in allowed apps
- Existing scheduled tasks continue to run in kiosk mode regardless

### Downloads folder access
- "Allow access to Downloads folder" = No blocks ALL Explorer navigation
- Users can still use PowerShell to access other folders

## Useful References
- [Multi-app kiosk setup](https://docs.microsoft.com/en-us/windows/configuration/lock-down-windows-10-to-specific-apps)
- [Kiosk XML reference](https://docs.microsoft.com/en-us/windows/configuration/kiosk-xml)
- [Start layout customization](https://docs.microsoft.com/en-us/windows/configuration/customize-and-export-start-layout)
- [Find AUMID](https://docs.microsoft.com/en-us/windows-hardware/customize/enterprise/find-the-application-user-model-id-of-an-installed-app)

## Source
- OneNote: Mooncake POD Support Notebook > Intune > Windows TSG > Windows Kiosk Mode
