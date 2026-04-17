# Deploy WeChat (and China-market EXE apps) via Win32 in Intune

## Overview
Guide for deploying WeChat and other China-market applications that only provide EXE installers (no MSI) via Intune Win32 app deployment.

## Prerequisites
- Microsoft Win32 Content Prep Tool: https://go.microsoft.com/fwlink/?linkid=2065730
- The app's EXE installer (e.g. WeChatSetup.exe)
- Knowledge of the app's silent install/uninstall switches

## Steps

### 1. Convert EXE to .intunewin
Run via PowerShell:
```powershell
IntuneWinAppUtil -c c:\testapp -s c:\testapp\WeChatSetup.exe -o c:\testappoutput\WeChatSetup -q
```
If `IntuneWinAppUtil` is not in PATH:
```powershell
.\IntuneWinAppUtil.exe -c c:\testapp -s c:\testapp\WeChatSetup.exe -o c:\testappoutput\WeChatSetup -q
```

### 2. Upload to Intune
Microsoft Endpoint admin center > Apps > Add app > Win32 app > Upload the .intunewin package.

### 3. WeChat-specific Configuration

| Setting | Value |
|---------|-------|
| Silent Install | `WeChatSetup.exe /S` |
| Silent Uninstall (32-bit) | `"%ProgramFiles%\Tencent\WeChat\Uninstall.exe" /S` |
| Silent Uninstall (64-bit) | `"%ProgramFiles(x86)%\Tencent\WeChat\Uninstall.exe" /S` |

### 4. Detection Rule
Configure file-based or registry-based detection rule for the installed app.

## General Guidance
For other China-market apps, the same process applies but you must:
1. Confirm the app supports fully silent install (`/S`, `/silent`, `/quiet`, etc.)
2. Contact the app vendor if silent install switch is unknown
3. Test the silent install/uninstall commands before deploying to production

## Source
- OneNote: Mooncake POD Support Notebook > Intune > How To > Windows
