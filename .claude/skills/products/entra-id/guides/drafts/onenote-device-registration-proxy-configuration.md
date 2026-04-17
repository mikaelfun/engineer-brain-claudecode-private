# Device Registration Proxy Configuration

## Summary
Device registration requires system-context network connectivity. Devices must access Microsoft endpoints under the SYSTEM account using WinHTTP, not WinINET (user-context).

## System Context vs User Context

| Context | API | Used By | Proxy Config |
|---------|-----|---------|--------------|
| System | WinHTTP | Background services, Automatic-Device-Join task | `netsh winhttp show proxy` |
| User | WinINET | IE/Edge browser, user apps | IE LAN settings per user |

## Required Endpoints (Mooncake)
- `login.partner.microsoftonline.cn`
- `device.login.partner.microsoftonline.cn`
- `enterpriseregistration.windows.net`
- `enterpriseregistration.partner.microsoftonline.cn`

## How to Check Proxy Settings

### WinHTTP (System Context)
```
netsh winhttp show proxy
```
Registry: `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Internet Settings\Connections\WinHttpSettings`
- Direct access value: `1800000000000000010000000000000000000000`

### WinINET (User Context)
Registry: `HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings`

## Quick Connectivity Testing
1. **Test-Device-Registration-Connectivity script** (runs as SYSTEM via scheduled task): https://gallery.technet.microsoft.com/Test-Device-Registration-3dc944c0
2. **PsExec** to run IE/PowerShell under SYSTEM context
3. **Network trace** with `ipconfig /flushdns` before capture

## Common Pitfall
IE proxy settings (WinINET) do NOT apply to device registration. Successful browser access does NOT mean device registration connectivity is OK. Must verify WinHTTP proxy or use WPAD.

## Source
- sourceRef: `Mooncake POD Support Notebook/.../Proxy configuration.md`
