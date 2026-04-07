# iOS Log Collection Methods for Intune Troubleshooting

## 1. Company Portal Diagnostic Report (Simplest)
1. Open Company Portal app on iOS device
2. Shake the device
3. Tap **Send Diagnostic Report** when the alert appears
4. If alert doesn't appear: Settings > Company Portal > enable **Shake Gesture**
- Ref: https://docs.microsoft.com/en-us/intune-user-help/send-errors-to-your-it-admin-ios

## 2. Mac Console (Real-time Device Logs)
1. Connect iOS device to Mac via cable
2. On iOS device, select "Trust This Computer"
3. On Mac, launch **Console** app
4. Select the iOS device in left panel
5. On iOS device, launch Company Portal and sync
6. Copy content from Console and save to TextEditor

## 3. Xcode Log from Windows (No Mac Available)
1. Download iOSLogInfo tool (BlackBerry KB36986)
2. Extract zip file
3. Ensure iTunes for Windows is installed (desktop version, not Store version)
4. Connect iOS device to computer
5. Launch CMD as Administrator
6. Navigate to extracted folder and run:
   - **Live logging:** `sdsiosloginfo.exe -d`
   - **Log to file:** `sdsiosloginfo.exe -d > c:\ios_log.log`
7. Press Ctrl+C to stop logging

### Additional Commands
| Command | Purpose |
|---|---|
| `sdsiosloginfo.exe -d > C:\Folder\iOS_Console_Log.log` | Start logging |
| `sdsdeviceinfo.exe -q com.apple.disk_usage -x > C:\Folder\iOS_Disk_Usage.xml` | Pull disk usage |
| `sdsdeviceinfo.exe -x > C:\Folder\iOS_Device_Stats.xml` | Pull device stats |
| `sdsioscrashlog.exe -e -k C:\Folder` | Pull iTunes/crash logs |

## 4. tcpdump Network Trace (Mac Required)
1. `sudo tcpdump -i <BSDname> -s 0 -B 524288 -w ~/Desktop/DumpFile01.pcap`
2. Reproduce issue (e.g., log into Company Portal)
3. Press Control-C to stop capture
4. Use Company Portal to collect logs and note Incident ID
5. Share DumpFile01.pcap for review
- Ref: https://support.apple.com/en-us/HT202013

## Source
- OneNote: Mooncake POD Support Notebook > Intune > IOS logs
