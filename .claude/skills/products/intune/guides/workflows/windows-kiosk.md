# Intune Windows Kiosk 模式 — 排查工作流

**来源草稿**: onenote-windows-kiosk-mode-guide.md
**Kusto 引用**: (无)
**场景数**: 7
**生成日期**: 2026-04-07

---

## Portal 路径

- `Intune > Windows TSG > Windows Kiosk Mode`

## Scenario 1: Option 1: Intune Built-in Kiosk Profile
> 来源: onenote-windows-kiosk-mode-guide.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Create configuration profile > Kiosk (Preview) > Windows 10 and later
- Add UWP, Windows Store, or Win32 apps
- For multi-app kiosk, import a start menu XML layout
- Only supported on Windows 10+ (Pro/Enterprise/Education) 1803+

## Scenario 2: Option 2: Custom OMA-URI
> 来源: onenote-windows-kiosk-mode-guide.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- OMA-URI: `./Device/Vendor/MSFT/AssignedAccess/Configuration`
- Data Type: String (XML payload)
- More flexibility for customized settings

## Scenario 3: Option 3: PowerShell Script
> 来源: onenote-windows-kiosk-mode-guide.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

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

## Scenario 4: Kiosk auto-logon breaks with password policy
> 来源: onenote-windows-kiosk-mode-guide.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Cause: Password policy creates EAS registry at `HKLM\SYSTEM\CurrentControlSet\Control\EAS`
- Fix: Remove password policy from kiosk devices, delete EAS registry, re-enroll

## Scenario 5: PowerShell scripts don't execute on kiosk
> 来源: onenote-windows-kiosk-mode-guide.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Cause: IME and PowerShell not in allowed apps list
- Fix: Add IME AppUserModelId + PowerShell paths to XML

## Scenario 6: Task Scheduler UI not available
> 来源: onenote-windows-kiosk-mode-guide.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- taskschd.msc is an MMC snap-in; requires mmc.exe in allowed apps
- Existing scheduled tasks continue to run in kiosk mode regardless

## Scenario 7: Downloads folder access
> 来源: onenote-windows-kiosk-mode-guide.md | 适用: Mooncake ✅

### 排查步骤

- "Allow access to Downloads folder" = No blocks ALL Explorer navigation
- Users can still use PowerShell to access other folders

## Useful References
- [Multi-app kiosk setup](https://docs.microsoft.com/en-us/windows/configuration/lock-down-windows-10-to-specific-apps)
- [Kiosk XML reference](https://docs.microsoft.com/en-us/windows/configuration/kiosk-xml)
- [Start layout customization](https://docs.microsoft.com/en-us/windows/configuration/customize-and-export-start-layout)
- [Find AUMID](https://docs.microsoft.com/en-us/windows-hardware/customize/enterprise/find-the-application-user-model-id-of-an-installed-app)

## Source
- OneNote: Mooncake POD Support Notebook > Intune > Windows TSG > Windows Kiosk Mode

---

> ⚠️ **21V (Mooncake) 注意**: 本主题包含 21V 特有的限制或配置，请注意区分 Global 与 21V 环境差异。
