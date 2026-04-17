# Deploy WeChat via Intune Win32 App

## Overview
Step-by-step guide to package and deploy WeChat (or similar Chinese apps) as a Win32 app through Microsoft Intune.

## Step 1: Package with Win32 Content Prep Tool
1. Download [Microsoft Win32 Content Prep Tool](https://go.microsoft.com/fwlink/?linkid=2065730)
2. Run the packaging command:
```powershell
IntuneWinAppUtil -c c:\testapp -s c:\testapp\WeChatSetup.exe -o c:\testappoutput\WeChatSetup -q
```
- `-c`: Source folder containing the setup file
- `-s`: Setup file path
- `-o`: Output folder for `.intunewin` file
- `-q`: Quiet mode

If `IntuneWinAppUtil` is not in PATH:
```powershell
.\IntuneWinAppUtil.exe -c c:\testapp -s c:\testapp\WeChatSetup.exe -o c:\testappoutput\WeChatSetup -q
```

## Step 2: Deploy via Intune Portal
1. Log in to Microsoft Endpoint Manager admin center
2. Navigate to **Apps** → **Add app** → **Win32 app**
3. Upload the `.intunewin` package
4. Configure install/uninstall commands:

| Setting | Value |
|---------|-------|
| Silent Install | `WeChatSetup.exe /S` |
| Silent Uninstall (32-bit) | `"%ProgramFiles%\Tencent\WeChat\Uninstall.exe" /S` |
| Silent Uninstall (64-bit) | `"%ProgramFiles(x86)%\Tencent\WeChat\Uninstall.exe" /S` |

## Key Notes
- The app must support silent install (`/S` switch) — check with the vendor
- This method applies to any Windows desktop app that supports silent installation
- For other Chinese apps (DingTalk, WPS, etc.), modify the paths and switches accordingly

## 21v Applicability
Fully applicable to 21Vianet environment. Common scenario for China mainland customers needing to deploy Chinese apps.

---
*Source: OneNote Mooncake POD Support Notebook/.../How to Deploy wechat via Win32.md*
