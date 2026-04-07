# macOS Intune Log Collection Methods

## 1. Company Portal Diagnostic Report (Simplest)
1. Open **Company Portal** app on Mac
2. Click **Help** > **Send Diagnostic Report**
3. Collect the **Incident ID** and share with support

## 2. macOS Console Log (Real-time Debug)
1. Press **Cmd + Space**, search for **Console** (or Applications > Utilities > Console)
2. Select your macOS device from the Devices list
3. Click **Start** to begin capturing
4. From menu: **Action** > **Include Info Messages** and **Include Debug Messages**
5. Reproduce the issue, then pause capturing
6. **Edit** > **Select All**, then **Edit** > **Copy**
7. Paste into text editor
8. **Format** > **Make Plain Text**
9. Save as `.log` file (e.g., `Contosologs.log`)

### Additional Log Location
Sidecar (IME) logs for app installation issues:
```
/Library/Logs/Microsoft/Intune
```

Reference: [View log messages in Console on Mac](https://support.apple.com/en-sg/guide/console/cnsl1012/mac)

## 3. ODC Log Collection (Comprehensive)
1. Open **Terminal**
2. Run:
```bash
curl -L https://aka.ms/IntuneMacODC -o IntuneMacODC.sh
chmod u+x ./IntuneMacODC.sh
sudo ./IntuneMacODC.sh
```
3. Wait for completion. Output folder `odc` is created in the current directory.

## Source
- OneNote: Mooncake POD Support Notebook > Intune > Mac logs
