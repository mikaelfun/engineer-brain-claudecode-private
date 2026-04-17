# INTUNE Windows Kiosk 模式 — 已知问题详情

**条目数**: 7 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: Intune PowerShell script deployed to multi-app kiosk device reports success in Azure portal but script does not actually execute (e.g. registry cha...
**Solution**: Add to kiosk XML allowed apps: <App AppUserModelId='Microsoft.Management.Clients.IntuneManagementExtension' />, <App DesktopAppPath='%SystemRoot%\system32\WindowsPowerShell\v1.0\powershell.exe' />, <App DesktopAppPath='%WinDir%\system32\WindowsPowerShell\v1.0\PowerShell_ISE.exe' />, <App DesktopAppPath='%SystemRoot%\syswow64\WindowsPowerShell\v1.0\powershell.exe' />, and <App DesktopAppPath='%windir%\regedit.exe' /> if registry modification needed.
`[Source: onenote, Score: 9.5]`

### Step 2: Kiosk profile deployment shows error 'No Mapping Between Account Names and Security IDs was Done' in Device Management logs
**Solution**: Ensure the specified kiosk user account exists on the device before deploying the kiosk profile. For local user: create the account first. For Azure AD user: ensure user has previously signed in, or use auto-logon with dynamically created account.
`[Source: onenote, Score: 9.5]`

### Step 3: Specified application does not appear in kiosk mode start menu despite being configured in the kiosk XML alternative start layout
**Solution**: 1) Verify .lnk file exists at exact path in XML (e.g. %ALLUSERSPROFILE%\Microsoft\Windows\Start Menu\Programs\); 2) Test by navigating to lnk path as kiosk user; 3) If lnk missing, create it or switch to default layout (no alternative XML) which auto-generates icons for allowed apps.
`[Source: onenote, Score: 9.5]`

### Step 4: Windows 10 Kiosk mode with 'Local User Account' logon type fails with error 'No mapping between account names and security IDs was done'. The speci...
**Solution**: Use 'Auto-logon' as the Logon type instead of 'Local User Account'. Auto-logon creates a local 'Kiosk' account automatically on the device and logs in after every restart. All kiosk policies are applied correctly.
`[Source: onenote, Score: 9.5]`

### Step 5: After setting up Windows 10 multi-app kiosk devices with multiple monitors, users experience the following behavior:   Multi-app kiosk profile gets...
**Solution**: There are two potential work arounds:1.
    Set dual monitor to “Duplicate display” instead of “Extend display”.
  or
  
    2.
    Change to Single-app kiosk mode, which is compatible with dual monitor extended displays.
`[Source: contentidea-kb, Score: 7.5]`

### Step 6: This article guides you through creating a Windows 10 Kiosk device with Shell Launcher using Microsoft Intune.
**Solution**: 
`[Source: contentidea-kb, Score: 7.5]`

### Step 7: Windows 10 multi app kiosk mode can't use cache credentials to log on for devices without internet connectivity.   Scenario:
**Solution**: By design when you select Azure AD group in the kiosk (multi app) policy there is a Graph querry whish is checking if that user is part of that group (so you need internet connection to check that), but if you add the user directly it should work (to log on with cache credentials and without internet connection).   We recommend not to exceed 100 users. If cx ask what is the limitation of users that can be added, other teams like Windows or Azure can help. To figure out which team it is in charge
`[Source: contentidea-kb, Score: 7.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Intune PowerShell script deployed to multi-app kiosk device reports success i... | In multi-app kiosk mode only applications listed in Assigned Access XML allow... | Add to kiosk XML allowed apps: <App AppUserModelId='Microsoft.Management.Clie... | 9.5 | onenote |
| 2 | Kiosk profile deployment shows error 'No Mapping Between Account Names and Se... | The user account specified in the kiosk profile logon type (Local user or Azu... | Ensure the specified kiosk user account exists on the device before deploying... | 9.5 | onenote |
| 3 | Specified application does not appear in kiosk mode start menu despite being ... | The .lnk shortcut file referenced in the kiosk XML start layout does not exis... | 1) Verify .lnk file exists at exact path in XML (e.g. %ALLUSERSPROFILE%\Micro... | 9.5 | onenote |
| 4 | Windows 10 Kiosk mode with 'Local User Account' logon type fails with error '... | When 'Local User Account' is selected as kiosk logon type, Windows tries to m... | Use 'Auto-logon' as the Logon type instead of 'Local User Account'. Auto-logo... | 9.5 | onenote |
| 5 | After setting up Windows 10 multi-app kiosk devices with multiple monitors, u... | The issue is expected and by-design. This is because a multi-app kiosk profil... | There are two potential work arounds:1.     Set dual monitor to “Duplicate di... | 7.5 | contentidea-kb |
| 6 | This article guides you through creating a Windows 10 Kiosk device with Shell... |  |  | 7.5 | contentidea-kb |
| 7 | Windows 10 multi app kiosk mode can't use cache credentials to log on for dev... | It is by design and mentioned in our&nbsp;official documentation that mention... | By design when you select Azure AD group in the kiosk (multi app) policy ther... | 7.5 | contentidea-kb |
