# Win32 App Deployment - IME Sample Log Analysis

> Source: OneNote (Mooncake POD Support Notebook / Intune / Windows TSG)
> Status: draft

## Overview

Intune Management Extension (IME) handles Win32 app deployment on Windows devices. Logs are located at `C:\ProgramData\Microsoft\IntuneManagementExtension\Logs`.

## Key Log Entries

### 1. Download Server URL
```
[Location Service] Intune DownloadServiceUrl is [https://fef.cnpasu01.manage.microsoftonline.cn/TrafficGateway/TrafficRoutingService/DownloadService]
```
- 21v (Mooncake) endpoint: `cnpasu01.manage.microsoftonline.cn`

### 2. IME Cache Location
```
[Win32App] SetCurrentDirectory: C:\Windows\IMECache\{appId}_1
```
- Packages are cached temporarily during installation
- Cleaned up after installation: `Cleaning up staged content C:\Windows\IMECache\{appId}_1`

### 3. Check-in Interval
```
[Win32App][CheckinIntervalManager] UpdateTimerIntervalForNextCheckin. Current interval of timer is 3480000
```
- IME check interval: ~3480000ms / 1000 / 60 = **~58 minutes**
- This is NOT the same as device check-in interval
- Timer alternates between 3480000 and 3720000

### 4. Policy Recognition
```
Get policies = [{"Id":"{appId}","Name":"appName","Version":1,"Intent":3,...}]
```
- `Intent: 3` = Required assignment
- Contains: DetectionRule, InstallCommandLine, UninstallCommandLine, RequirementRules

### 5. Detection Rule Flow
```
[Win32App] ProcessDetectionRules starts
[Win32App] DetectionType 2  (File-based detection)
[Win32App] Path doesn't exists: C:\...\WeMeetApp.exe applicationDetected: False
```
- DetectionType 2 = File/folder detection
- Checks path existence, then reports NotInstalled/Installed

### 6. Download Progress
```
[StatusService] Downloading app (id = {appId}, name appName) via CDN, bytes 4096/232851456
```
- Shows CDN download progress with byte count

### 7. Installation
```
[Win32App] ===Step=== Execute retry 0
[Win32App] ===Step=== InstallBehavior RegularWin32App, Intent 3
TencentMeeting.exe /SilentInstall=0
```
- Shows install command execution
- ReturnCodes mapping: 0=Success, 1707=Success, 3010=SoftReboot, 1641=HardReboot, 1618=Retry

### 8. Post-Install Detection
```
[Win32App] Checked filePath: C:\...\WeMeetApp.exe, Exists: True, applicationDetected: True
```
- Confirms successful installation via detection rule

## Troubleshooting Tips

- If app stuck in "InProgress": check download progress in logs, CDN latency issues common for China Telecom
- If detection fails after install: verify detection rule path matches actual installation path
- Reboot may be required if return code is 3010 (SoftReboot) or 1641 (HardReboot)
