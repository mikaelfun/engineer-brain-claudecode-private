# Device Registration Proxy Configuration & Troubleshooting

> Source: OneNote - Mooncake POD Support Notebook / Device Registration / Proxy configuration
> Quality: guide-draft | 21v: Yes

## System Context vs User Context

- **System Context (WinHTTP)**: Non-interactive services, background tasks (e.g., Automatic-Device-Join scheduler task, services running as Local System)
- **User Context (WinINET)**: Applications like IE browser, per-user proxy settings

Device registration runs under **System Context** and uses **WinHTTP**. Browser (IE) proxy settings do NOT apply.

## Proxy Configuration Methods

### Check Current Proxy
- **WinHTTP (System)**: `netsh winhttp show proxy`
- **WinINET (User)**: Check IE > Internet Options > Connections > LAN Settings
- **Registry (WinHTTP)**: `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Internet Settings\Connections\WinHttpSettings`
  - Direct access value: `1800000000000000010000000000000000000000`
- **Registry (WinINET)**: `HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings`

### Configure Proxy
1. **WPAD** (recommended): Web Proxy Auto-Discovery - works for both WinHTTP and WinINET
2. **GPO**: Deploy WinHTTP proxy settings via Group Policy (Windows 10 1709+)
3. **Manual**: `netsh winhttp set proxy <proxy-server>`

## Connectivity Testing

1. **Test-DeviceRegistration Connectivity script**: Runs commands under SYSTEM context via scheduled tasks. No need for PsExec.
2. **PsExec**: Launch IE or PowerShell as SYSTEM to test connectivity
3. **Network trace**: Clear DNS cache first (`ipconfig /flushdns`) before capturing

## Required Endpoints

For device registration, the following must be accessible under System Context:
- `login.microsoftonline.com` (Global) / `login.partner.microsoftonline.cn` (Mooncake)
- `device.login.microsoftonline.com` / `device.login.partner.microsoftonline.cn`
- `enterpriseregistration.windows.net`
- `enterpriseregistration.partner.microsoftonline.cn` (Mooncake)
