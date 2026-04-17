# How to Check Windows Definition Updates Install Time

> Source: OneNote - [wuxibiologics] How to check definition updates install time
> Status: draft

## Scenario

Customer reports definition updates version mismatch or wants to verify when updates were applied by Azure Update Manager (AUM).

## Steps

1. **Run on target Windows machine:**
   ```powershell
   get-windowsupdatelog
   ```
   This generates a Windows Update log file on the desktop.

2. **Check the log for the specific KB:**
   - Look for `KB2267602` (or relevant KB) entries
   - Check the timestamp for successful installation
   - Check the `Caller` field to identify who initiated the update

3. **Identify the caller:**
   - `Caller: Azure VM Guest Patching` = initiated by AUM
   - `Caller: Windows Defender` = initiated by Windows Defender auto-update, NOT by AUM

## Key Points

- Windows Defender definition updates (e.g., KB2267602) have independent signature update channels
- Signature updates are frequent and do not fully depend on Windows Update or AUM
- After AUM installs a definition update, Windows Defender may independently update to a newer version shortly after
- This explains version discrepancies between AUM-reported version and actual installed version
