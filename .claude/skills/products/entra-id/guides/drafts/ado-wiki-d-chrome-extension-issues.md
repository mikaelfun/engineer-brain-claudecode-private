---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Window Devices/Chrome Extension Issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FWindow%20Devices%2FChrome%20Extension%20Issues"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Chrome Extension Issues — Microsoft Single Sign On

**Tags**: AAD Authentication, AAD, AzureAD

## Support Ownership

The **Microsoft Single Sign On** Chrome extension ([ppnbnpeolgkicgegkbkbjmhlideopiji](https://chromewebstore.google.com/detail/microsoft-single-sign-on/ppnbnpeolgkicgegkbkbjmhlideopiji)) is owned by the AAD client PG team. Direct cases to Azure AD Device Registration team (AAD Identity CSS - Azure AD Authentication).

**Note**: This is NOT the same as the [My Apps Secure Sign-in Extension](https://chromewebstore.google.com/detail/my-apps-secure-sign-in-ex/ggjhpefgjjfobnfoldnjipclpcfbgbhl) — route those separately.

Google may need to be involved for Chrome-specific bugs. We cannot drive escalations to Google; the customer must escalate, but we can provide technical details or participate in calls.

## Required Logs (Basic Set for Escalation)

Always collect before escalating to ICM:
1. **AAD logs** (via aka.ms/wamhot or auth scripts)
2. **Chrome Developer Console logs**
3. **Chrome debug logs** (collected in incognito mode)

---

## Step 1 — The Incognito Trick (Always Start Here)

1. Navigate to `chrome://extensions/?id=ppnbnpeolgkicgegkbkbjmhlideopiji`
2. Enable **Allow in Incognito**
3. Switch to Incognito mode (Ctrl+Shift+N), ensure ONLY Microsoft Single Sign On extension is enabled
4. Navigate to `https://login.microsoftonline.com`
5. Check if you land on Office start page without credentials prompt

**If SSO works in incognito** → investigate extension interference or cookie issue.  
**If SSO fails in incognito** → proceed to Chrome Developer Console logs.

> Note: Some environments block incognito mode — this must be disabled for investigation.

---

## Step 2 — Excluding Extension Interference

If incognito shows SSO working with only Microsoft SSO extension:

1. Enable extensions ONE BY ONE in incognito mode
2. After each addition, open new incognito window and test SSO
3. Identify the conflicting extension
4. To see all extensions: `chrome://extensions/`

**Known conflict**: Microsoft Editor extension (maintenance mode, see ICM 532505445)

---

## Step 3 — Cookies Issue

If enabling all extensions doesn't identify the culprit, clear all cookies and retest. If SSO works after clearing cookies → cookies issue.

---

## Step 4 — Chrome Developer Console Logs

1. Enable extension in incognito
2. Switch to incognito (Ctrl+Shift+N)
3. Open DevTools (F12) → Console tab
4. Check **Preserve Logs** and enable **Verbose** logging
5. Navigate to `https://login.microsoftonline.com`
6. Look for "BSSO Telemetry" messages

Use the Known Issues section to identify the problem from these logs.

---

## Step 5 — Checking BrowserCore.exe

BrowserCore.exe paths:
- `C:\Program Files\Windows Security\BrowserCore\BrowserCore.exe`
- `C:\Windows\BrowserCore\BrowserCore.exe`

Test BrowserCore.exe (run in CMD as the affected user, not admin):
```cmd
powershell -command "write-host ""$([Text.Encoding]::UTF8.GetString(@(2,0,0,0))){}""" | "C:\Program Files\Windows Security\BrowserCore\BrowserCore.exe"
```
Expected: `{"status": "Fail", "code": "OSError", "description": "Error processing request.", "ext": { "error": -2147186943 }}`

Check antivirus is not blocking BrowserCore.exe. Use Process Monitor to verify.

---

## Step 6 — Registry Check

Verify both keys point to `<BrowserCore Path>\manifest.json`:
- `HKEY_CURRENT_USER\SOFTWARE\Google\Chrome\NativeMessagingHosts\com.microsoft.browsercore`
- `HKEY_LOCAL_MACHINE\SOFTWARE\Google\Chrome\NativeMessagingHosts\com.microsoft.browsercore`

---

## Step 7 — Chrome Debug Logs

```
1. Quit Chrome completely
2. Launch: chrome.exe --enable-logging --v=1
3. Reproduce issue
4. Logs: %localappdata%\Google\Chrome\User Data\chrome_debug.log
```

---

## Known Issues

### WIP Policy Blocking Chrome (error -2147186936)

- **Log**: `Error: ChromeBrowserCore error OSError: Error processing request. (ext: {"error":-2147186936})`
- **Error code**: 0x80048708 = AAD_BROWSERCORE_E_ENTERPRISE_POLICY_NOT_ALLOWED
- **Cause**: WIP policy marks Chrome as non-enterprise app
- **Fix**: Review EDP/WIP policies; contact wdpwip@microsoft.com; reference: http://aka.ms/wiptechnet

### BrowserCore.exe Disabled by Group Policy

- **Log**: `NoSupport: Access to the native messaging host was disabled by the administrator`
- **Cause**: `HKLM\SOFTWARE\Policies\Google\Chrome\NativeMessagingBlacklist = *` or includes `com.microsoft.browsercore`
- **Fix**: Add `com.microsoft.browsercore` to `NativeMessagingWhitelist` registry key

### cmd.exe Blocked by AppLocker

- **Log**: `NoSupport: Failed to start native messaging host`; PML shows cmd.exe exit -1073740956 (STATUS_ACCESS_DISABLED_BY_POLICY_OTHER)
- **Cause**: Chrome native messaging spawns cmd.exe to launch BrowserCore.exe; blocked by AppLocker
- **Fix**: Grant cmd.exe access via AppLocker exception; customer must evaluate security tradeoff

### "Native Host Has Exited" (Streaming Bug)

- **Log**: `NoSupport: Native host has exited` — intermittent SSO failure
- **Cause**: BrowserCore.exe streaming bug when cookie buffer contains 0x0A byte (Bug 28717886)
- **Fix** (by Windows version):
  | Version | Min Build | KB |
  |---------|-----------|-----|
  | Win10 20H2/2004 | 19042.662+ | KB4586853 |
  | Win10 1909/1903 | 18363.1237+ | KB4586819 |
  | Win10 1809 | 17763.1613+ | KB4586839 |
- **Workaround**: Use IE/Edge/Chromium Edge (not affected)

### Resource Utilization / Timeout

- AAD server waits up to **4 seconds** for extension to return SSO cookies
- If system resources are exhausted (high CPU, low memory, slow AV), SSO cookies not returned in time
- Check Windows Task Manager and Chrome Task Manager for resource-heavy processes

### DidStartWorkerFail in Chrome Debug Logs

- **Log**: `DidStartWorkerFail ppnbnpeolgkicgegkbkbjmhlideopiji: 5`
- **Cause**: Chrome bug — extensions cannot communicate with background scripts/service workers
- **Action**: Escalate to Google directly; this is a Chrome bug

### Access Not Granted to Extension

- **Portal shows**: Extension listed under "Access requested" with "To give an extension access to this site, click it"
- **Log**: `NoExtension: Extension is not installed`
- **Action**: Customer admin or Google needs to grant correct permissions

---

## Escalation Paths

- **Extension issue** → Sev3 ICM to `Cloud Identity AuthN Client / MSAL JS Team`
- **BrowserCore.exe / OS issue** → ICM via https://aka.ms/wamhot (Windows client team)

## Combined Log Collection Steps

1. Start AAD logs: `.\Start-auth.ps1 -vauth -acceptEULA`
2. Enable extension for incognito
3. Start Chrome debug logs (`--enable-logging --v=1`)
4. Open incognito (Ctrl+Shift+N)
5. Enable Chrome Developer Console (F12 → Console → Preserve Logs + Verbose)
6. Reproduce issue
7. Save Console logs; close Chrome
8. Stop AAD logs: `.\stop-auth.ps1`
9. Share: AAD logs (authlogs folder) + Chrome debug log + Console logs

## Time Travel Traces (TTT) for BrowserCore.exe

If PG requests TTT:
1. Get `PartnerTTDRecorder_x86_x64.zip` from `\\dbg\privates\LKG\partner`
2. Run: `TTTracer.exe -parent * -onLaunch BrowserCore.exe -children -dumpFull -out <outputPath>`
3. Open Chrome incognito → navigate to login.microsoftonline.com
4. Collect output files; run `TTTRacer.exe -cleanup` then `--delete BrowserCore`
