# Android Log Collection Guide for Intune Troubleshooting

> Source: OneNote — Android logs / Gather Android Debug log / Log collect & Android device pre-request / Offline to collect mobile log

## Company Portal Logs

1. Launch Company Portal
2. Tap **Menu > Help > Email Support > Upload Logs Only**
3. Send the incident ID to support engineer

For verbose logging:
1. Enable verbose log in Company Portal settings
2. Tap **Menu > Help > Get Support/Email Support > generate log**
3. Share the incident ID

Video guide: https://www.youtube.com/watch?v=JdbVI7KHcFk

## Android Debug Log (Bug Report)

### Prerequisites
- Android device 4.2 or higher
- USB debugging enabled (optional for ADB method)

### Steps
1. Open **Settings > System > About Device**
2. Enable Developer Options by tapping **Build Number** 10+ times
3. Go to **Settings > System > Developer Options**
4. Enable USB debugging (for ADB method)
5. **Reproduce the issue** — note timestamp and apps involved
6. Go to **Settings > System > Developer Options**
7. Tap **Take bug report** > select **Full Report** > tap **Report**
8. Wait for notification "Bug report captured" (may take several minutes)
9. Tap notification and share via email

### ADB Method (Runtime Logs)
1. Download platform-tools: https://dl.google.com/android/repository/platform-tools-latest-windows.zip
2. Unzip to any location
3. Connect device via USB cable
4. Run `adb.exe devices` to verify connection
5. Accept "Allow USB Debugging" prompt on device
6. Run `adb.exe logcat >> log.txt`
7. Reproduce the issue
8. Stop with Ctrl+C — log saved as log.txt

### Samsung-Specific Debug Log
1. Open Samsung Phone Dialer
2. Enter `*#9900#`
3. Select **Enable SecLog**
4. Reboot device
5. Connect via ADB, enable verbose logging
6. **Reproduce the issue**
7. Enter `*#9900#` again
8. Select **Run dumpstate/logcat** > **Copy to sdcard (include CP Ramdump)**

## Outlook Diagnostic Log
1. Sign in with a user **without** Intune license (if troubleshooting MAM)
2. Go to **Outlook > Help > Collect Diagnostic log > Upload log**
3. Share the incident ID

## Offline Log Collection (No Network)

### Android
1. Reproduce the issue
2. Open **Company Portal > Settings > Diagnostic Logs > Save Logs**
3. Save to a new folder
4. Package and transfer logs manually (USB or email later)

### iOS Outlook (Reference)
1. Tap profile avatar > **Settings > Privacy**
2. Confirm "Optional connected experiences" is OFF
3. Go back, tap **? (Help) > Share diagnostic logs**
4. Transfer the log file to IT or support

## Useful ADB Commands
| Command | Description |
|---------|-------------|
| `adb install C:\package.apk` | Install APK |
| `adb uninstall package.name` | Uninstall app |
| `adb push C:\file /sdcard/file` | Push file to device |
| `adb pull /sdcard/file C:\file` | Pull file from device |

## Pre-troubleshooting Checklist (Android)
Before collecting logs, try these fixes:
1. Turn off **battery optimization** for Outlook and Company Portal
2. Change app **Launch** from Automatic to **Manage Manually** — enable Auto-launch, Secondary launch, Run in background
3. If **Data Saver** enabled, add Outlook and Company Portal to unrestricted data usage
4. Enable **notifications** for Outlook and Company Portal
