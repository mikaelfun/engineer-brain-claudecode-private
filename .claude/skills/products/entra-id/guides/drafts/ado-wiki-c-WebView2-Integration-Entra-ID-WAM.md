---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Window Devices/WebView2 integration in Entra ID WAM"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/Device%20Registration/Window%20Devices/WebView2%20integration%20in%20Entra%20ID%20WAM"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# WebView2 Integration in Entra ID WAM

## What Is This Feature

Windows WAM authentication uses a mini-browser (webview) for sign-in UX (`Microsoft.AAD.BrokerPlugin.exe`). As of early 2025, WAM uses **WebView1/EdgeHTML** (end-of-life). Starting **Windows 24H2 26100.7462** and **25H2 26200.7462**, WAM supports **WebView2** (Chromium-based, same engine as Edge) as opt-in.

**Does NOT include**: MSA, AutoPilot, PIN Reset, Password Reset, OOBE login, Entra ID Join, Windows Hello registration/pin reset, Web Sign-in, Windows Logon.

**Only Windows 24H2 and 25H2** — does NOT work on Windows 10.

## Enablement

### Registry Key (Opt-in)

**Key**: `HKLM\Software\Policies\Microsoft\Windows\AAD`
**Value**: `WebView2Integration` (DWORD) = `1`

```cmd
reg add "HKLM\Software\Policies\Microsoft\Windows\AAD" /v WebView2Integration /t REG_DWORD /d 1
```

Then **reboot** the device.

> Windows 365 Link devices: registry key has no effect — WebView2 is the only option.

### Deploy via GPO Preference

1. GPMC.msc → Edit GPO → Computer Configuration > Preferences > Windows Settings > Registry
2. New Registry Item: Hive=HKLM, Key Path=`SOFTWARE\Policies\Microsoft\Windows\AAD`, Value=`WebView2Integration`, Type=`REG_DWORD`, Data=`1`
3. Run `gpupdate /force` on client

### Deploy via Intune (Custom OMA-URI)

- **OMA-URI**: `./Device/Vendor/MSFT/Policy/Config/Registry/HKLM/SOFTWARE/Policies/Microsoft/Windows/AAD/WebView2Integration`
- **Data type**: Integer, **Value**: 1

## Verify WebView2 Is Active

**Method 1 - Task Manager**: Open Feedback Hub > Sign In > "Work or School Account". In Task Manager filter "Work or School account" — if you see >3 processes (utility processes, renderer, crashpad) → WebView2 is active.

**Method 2 - Fiddler user-agent string**:
- WebView1: `Mozilla/5.0 (Windows NT 10.0; Win64; x64; WebView/3.0) AppleWebKit/537.36 ... Edge/18.26200`
- WebView2: `Mozilla/* ... Chrome/* ... Edg/* OS/*` (with `sec-ch-ua` header present)

## WebView2 Runtime Types

| Type | Location | Update | Notes |
|------|---------|--------|-------|
| **System** | `C:\Windows\System32\Microsoft-Edge-WebView` | Windows Update | Used by WAM (BrokerPlugin.exe from System32) |
| **Evergreen** | `Program Files (x86)` | Edge/dev team | Rare — only if KIR rollback occurred |

## Known Issues and Fixes

### 1. Blank or Broken Login Screens

**Cause**: IdP page uses legacy EdgeHTML behaviors or old user-agent checks (`Edge/18.x`). Page works in Edge browser but not WAM mini-browser.

**Fix**: Ask IdP to update login page for Chromium-based browsers (stop relying on `Edge/18.x` user-agent; use capability-based detection). Test: if IdP page fails in Microsoft Edge, it will fail in WebView2.

### 2. WebView2 Closes Immediately / Not Connecting

**2a) 3rd party app interference**: AV/DLP tools hooking `msedgewebview2.exe`. Check Procmon for external DLLs in BrokerPlugin or msedgewebview2 child processes.
- Reference: https://learn.microsoft.com/en-us/troubleshoot/microsoftteams/teams-administration/include-exclude-teams-from-antivirus-dlp

**2b) Access control / integrity level mismatch**: Verify `ALL APPLICATION PACKAGES` permissions preserved on:
- `C:\Windows\System32\Microsoft-Edge-WebView`
- `C:\Program Files (x86)\Microsoft\EdgeWebView\Application`

**2c) Firewall blocking msedgewebview2.exe**: Remove `msedgewebview2.exe` from blocked apps list.

**2d) Other**: Reference internal doc from WebView2 team on Security Hardening measures.

### 3. WebView2 Not Enabling After Registry Key

1. Verify device is patched to 26100.7462+ (24H2) or 26200.7462+ (25H2)
2. Verify registry key is set: `HKLM\Software\Policies\Microsoft\Windows\AAD\WebView2Integration = 1`
3. **Reboot** device

## Log Collection

1. **Auth Script Logs**: https://aka.ms/wamlogs — captures WebView2 calls in `WebAuth.etl`
2. Format ETL: install Insight Client from https://insightweb/
3. Training: https://platform.qa.com/resource/wam-log-analysis-by-tak-ee-1854/

## Error Codes

| Code | Alias | Meaning |
|------|-------|---------|
| 0xcaa5014b | ERROR_ADAL_COREWEBVIEW2_NOT_INITIALIZED | CoreWebView2 not initialized |
| 0xcaa5014d | ERROR_ADAL_COREWEBVIEW2_BROWSER_LAUNCH_FAILED | Page link tried to launch default browser, failed |

## Time Travel Traces (TTT)

### After WebView2 initialized:
```
tttracer -out <dir> -monitor msedgewebview2.exe -cmdLineFilter "embedded-browser-webview=1 --webview-exe-name=Microsoft.AAD.BrokerPlugin.exe"
```

### At WebView2 initialization:
1. Add registry: `HKCU\Software\Policies\Microsoft\Edge\WebView2\AdditionalBrowserArguments` → `Microsoft.AAD.BrokerPlugin.exe` (String) = `--edge-webview-creation-timeout-seconds=-1`
2. Run tttracer as above

## Escalation Path

| Scenario | Team |
|---------|------|
| BrokerPlugin.exe from System32 (system runtime issues) | Windows Platform Team |
| BrokerPlugin.exe from Program Files (x86) (evergreen runtime) | Developer Browsers SME Team (collaborate before transferring) |
| General WebView2 + WAM issues | File ICM via aka.ms/wamhot |

**ICM**: Cloud Identity AuthN Client → Cloud Identity AuthN Client Team (Windows)

## Q&A

- **Does this affect MSAL flow?** No.
- **Works on Windows 10?** No — only Windows 24H2 and 25H2.
- **WebView2 proxy vs Windows proxy?** WebView2 is Chromium-based, may use different proxy settings than EdgeHTML. Uses own TLS crypto (not Windows SChannel).
- **When will WebView2 be default?** Timeline TBD. Registry key planned for deprecation long-term.
