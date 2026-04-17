# Android Debug Log Collection for Intune Troubleshooting

> Source: Mooncake POD Support Notebook / Intune / Android logs / Gather Android Debug log

## 1. Company Portal Logs

1. Launch Company Portal
2. Menu > Help > Email Support > Upload Logs Only
3. Share the incident ID

## 2. Android Bug Report (Standard)

1. Open Settings > System > About Device
2. Enable Developer Options: tap Build Number 10+ times
3. **Reproduce the issue** (note timestamp and apps opened)
4. Open Settings > System > Developer options
5. Click "Take bug report" > select Full Report > click Report
6. Wait for notification "Bug report captured" (may take several minutes)
7. Tap notification to share

## 3. ADB Logcat (Runtime Logs)

### Prerequisites
- Android 4.2+ device
- USB debugging enabled
- Android SDK Platform Tools: https://dl.google.com/android/repository/platform-tools-latest-windows.zip
- USB cable

### Enable USB Debugging
1. Settings > About phone/device > Software Info
2. Tap "Build number" 7 times to unlock Developer Mode
3. Settings > Developer Options > enable USB debugging

### Collect Logs
1. Connect device to PC via USB
2. Accept "Allow USB Debugging" prompt on device
3. Open CMD, navigate to platform-tools folder
4. Verify connection: `adb.exe devices`
5. Start capture: `adb.exe logcat >> log.txt`
6. Reproduce the issue
7. Stop with Ctrl+C
8. Log saved as `log.txt` in platform-tools folder

### Useful ADB Commands
- `adb install C:\package.apk` - Install APK
- `adb uninstall package.name` - Uninstall app
- `adb push C:\file /sdcard/file` - Push file to device
- `adb pull /sdcard/file C:\file` - Pull file from device

## 4. Samsung-Specific ADB Logging

1. Open Samsung Phone Dialer, enter `*#9900#`
2. Select "Enable SecLog"
3. Reboot device
4. Connect to PC, establish ADB connection
5. Enable verbose logging via ADB terminal
6. **Reproduce the issue**
7. Enter `*#9900#` again in Phone Dialer
8. Select "Run dumpstate/logcat"
9. Select "Copy to sdcard (include CP Ramdump)"
10. Collect from sdcard

## Company Portal Log Location (File System)
`device\Internal storage\Android\data\com.microsoft.windowsintune.companyportal`
