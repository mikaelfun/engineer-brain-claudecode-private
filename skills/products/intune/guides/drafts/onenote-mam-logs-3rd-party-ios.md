# Gather MAM Logs from Third-Party iOS Apps

> Source: OneNote - Gather MAM logs from 3rd party app
> Status: draft

## Method 1: Intune Diagnostic Console (Preferred)

1. Launch the third-party app and reproduce the issue
2. Go to iOS **Settings** > find the app > **Microsoft Intune**
3. Enable **Display diagnostics console**
4. Go back to the app - Intune diagnostic page should appear
5. Tap **Get Started** > **Share logs**
6. Export the logs to a file

## Method 2: iTunes Backup + iExplorer

Use this when the diagnostic console is not available or does not capture sufficient data.

1. Backup the iOS device to local computer using **iTunes** (use offline installer, NOT Microsoft Store version)
2. Install and launch **iExplorer** (https://www.macroplant.com/iexplorer/)
3. Go to iExplorer > Preferences > check **Show hidden files and folders**
4. Find the last backup under **Browse iTunes Backups**
5. Navigate to one of:
   - `Backup Explorer > AppGroups > [group] > .IntuneMAM` (export all files)
   - `Backup Explorer > App > <bundleID> > Library > .IntuneMAM` (export all files)

### Example Path

For an app with bundle ID `com.pervasent.broadpapers.intune`:
```
Backup Explorer > App > com.pervasent.broadpapers.intune > Library > .IntuneMAM
```

## Notes

- The `.IntuneMAM` folder contains MAM policy enforcement logs and state files
- These logs are critical for diagnosing MAM policy application failures on third-party apps
