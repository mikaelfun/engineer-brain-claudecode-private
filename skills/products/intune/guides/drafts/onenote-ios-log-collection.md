# iOS Log Collection for Intune Troubleshooting

## Method 1: Company Portal Diagnostic Report

1. Open Company Portal app on iOS device
2. Shake the device
3. Tap **Send Diagnostic Report** when the diagnostics alert appears
4. If alert doesn't appear → Settings > Company Portal > enable **Shake Gesture**

Reference: https://docs.microsoft.com/en-us/intune-user-help/send-errors-to-your-it-admin-ios

## Method 2: Mac Console (Real-time Device Logs)

1. Connect iOS device to Mac via cable
2. On iOS device, select **Trust This Computer**
3. On Mac, launch **Console** app → select iOS device in left panel
4. On iOS device, launch Company Portal and sync
5. Copy content from Console and save to text file

Reference: https://internal.support.services.microsoft.com/en-us/help/3090505

## Method 3: XCode-style Logs from Windows (iOSLogInfo)

1. Download `iOSLogInfo.zip` from BlackBerry resources
2. Extract the zip file
3. Ensure iTunes for Windows is installed (desktop version, not Store version)
4. Connect iOS device to computer
5. Launch CMD as administrator
6. Navigate to extracted folder and run:

```cmd
:: Live log collection
sdsiosloginfo.exe -d

:: Write to log file
sdsiosloginfo.exe -d > c:\ios_log.log

:: Stop: Ctrl+C
```

### Additional Commands

```cmd
:: Pull disk usage
sdsdeviceinfo.exe -q com.apple.disk_usage -x > C:\Folder\iOS_Disk_Usage.xml

:: Pull device stats
sdsdeviceinfo.exe -x > C:\Folder\iOS_Device_Stats.xml

:: Pull iTunes logs / crash logs
sdsioscrashlog.exe -e -k C:\Folder
```

## Method 4: Network Capture (tcpdump on Mac)

1. Start capture: `sudo tcpdump -i <BSDname> -s 0 -B 524288 -w ~/Desktop/DumpFile01.pcap`
2. Reproduce the issue in Company Portal app
3. Press Ctrl+C to stop capture
4. Collect Company Portal logs for Incident ID correlation
5. Provide `DumpFile01.pcap` trace for analysis

Reference: https://support.apple.com/en-us/HT202013

## Method 5: MAM Logs from 3rd Party Apps

1. Launch the app, reproduce the issue
2. Go to iOS Settings → find the app → **Microsoft Intune** → **Display diagnostics console** → turn ON
3. Return to the app → Intune diagnostic page appears
4. Tap **Get Started** → **Share Logs** → export to file

### Deep MAM Log Extraction (via iTunes Backup)

1. Backup device to local computer using iTunes (offline installer, NOT Microsoft Store version)
2. Install and launch **iExplorer** (https://www.macroplant.com/iexplorer/)
3. Go to iExplorer → Preferences → check **Show hidden files and folders**
4. Find last backup under **Browse iTunes Backups**
5. Navigate to:
   - `Backup Explorer > AppGroups > [app group] > .IntuneMAM` OR
   - `Backup Explorer > App > [bundleID] > Library > .IntuneMAM`
6. Export all files under `.IntuneMAM`

## Source

- OneNote: Mooncake POD Support Notebook/POD/VMSCIM/4. Services/Intune/IOS logs
- OneNote: Mooncake POD Support Notebook/POD/VMSCIM/4. Services/Intune/IOS logs/1 - Gather MAM logs from 3rd party app
