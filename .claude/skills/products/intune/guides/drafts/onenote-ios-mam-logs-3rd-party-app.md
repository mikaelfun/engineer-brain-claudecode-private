# Gather MAM Logs from 3rd Party iOS App

## Method 1: In-App Diagnostics Console

1. Launch the MAM-protected app, reproduce the issue
2. Go to iOS **Settings** > find the app > choose **Microsoft Intune**
3. Enable **Display diagnostics console** toggle
4. Go back to the app — Intune Diagnostics page should appear
5. Choose **Get Started** > **Share Logs**
6. Export logs to file and email

## Method 2: iTunes Backup + iExplorer (Deep Extraction)

Use this method when in-app diagnostics are insufficient or unavailable.

### Steps
1. Backup the iOS device to local computer using **iTunes** (use offline installer version, NOT Microsoft Store version)
2. Install and launch **iExplorer** (https://www.macroplant.com/iexplorer/)
3. Go to iExplorer > **Preferences** > check **Show hidden files and folders**
4. Find the last backup under **Browse iTunes Backups**

### Locate MAM Logs
**Option A:** Under **Backup Explorer**, find all AppGroups the app has entitlements for:
- Export all files under `.IntuneMAM`

**Option B:** Under **Backup Explorer** > App > `<bundleID>`:
- Export all files under `Library/.IntuneMAM`

### Example
For Board Papers app: `Backup Explorer > App > com.pervasent.broadpapers.intune > Library > .IntuneMAM`

## Notes
- Method 1 works for any app with Intune App SDK integrated
- Method 2 is useful for deeper investigation when MAM policy issues aren't visible in standard diagnostics
- Both methods apply to 3rd party apps using Intune MAM SDK

## Source
- OneNote: Mooncake POD Support Notebook > Intune > IOS logs > Gather MAM logs from 3rd party app
