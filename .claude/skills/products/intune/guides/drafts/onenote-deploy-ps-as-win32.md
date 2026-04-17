# Deploy PowerShell Script as Win32 App

## Steps
1. Put scripts into a folder; create another empty folder for output
2. Package script using IntuneWinAppUtil:
   ```
   IntuneWinAppUtil.exe -c C:\script\folder -s C:\script\folder\YourScript.ps1 -o C:\script\output
   ```
   Download: [Win32 Content Prep Tool](https://learn.microsoft.com/en-us/mem/intune/apps/apps-win32-prepare#convert-the-win32-app-content)
3. Create Win32 app in Intune portal with the .intunewin package
4. Configure detection rule (e.g., scheduled task check, registry key, file existence)

## Detection Script Example
```powershell
$cspTask = Get-ScheduledTask -TaskName "Autologoff"
if ($cspTask) {
    $settings = $cspTask.Settings
    if ($cspTask.Settings.StartWhenAvailable -eq $false) {
        Write-Output "App is installed"
        return 1
    } else {
        return -1
    }
} else {
    return -1
}
```

## Source
- OneNote: Mooncake POD Support Notebook > Intune > Windows TSG > Win32_IME_PowerShell Script TSG
