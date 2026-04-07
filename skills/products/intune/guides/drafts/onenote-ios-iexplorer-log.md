# Collecting iOS Logs via iExplorer

## Overview
Use iExplorer tool to extract MAM-related logs from iOS devices, especially useful for 3rd party apps and LOB apps.

## Prerequisites
- iExplorer installed: [https://macroplant.com/iexplorer](https://macroplant.com/iexplorer)
- iTunes installed on Windows PC
- iOS device connected via USB

## Steps (Windows)

1. Download and install iExplorer
2. On first launch, select **"Keep using Demo mode"**
3. **Use iTunes to backup the device to current PC** (required step)
4. Open iExplorer → find the backup data in the backup section
5. Navigate to app data to find MAM-related information for 3rd party/LOB apps

## What You Can Find
- MAM policy information for managed apps
- 3rd party app and LOB app Intune MAM data
- App-specific configuration and protection policy state

## Tips
- iTunes backup must be completed before iExplorer can read the data
- Demo mode is sufficient for log extraction
- Useful when standard Intune diagnostic logs are insufficient for 3rd party/LOB app MAM issues

## Source
- OneNote: MCVKB/Intune/iOS/Collect iExplorer log for iOS.md
