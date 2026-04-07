# Connectivity Testing Script for Mooncake Device Registration

## Summary
PowerShell script (Test-HybridDevicesInternetConnectivity V2.1) to test device registration Internet connectivity under SYSTEM context for Mooncake (21V) environment.

## Tested Endpoints
| Endpoint | Purpose |
|----------|---------|
| `login.partner.microsoftonline.cn` | Mooncake AAD login |
| `device.login.partner.microsoftonline.cn` | Device login |
| `enterpriseregistration.windows.net` | Global device registration |
| `enterpriseregistration.partner.microsoftonline.cn` | Mooncake device registration |

## How It Works
1. Checks WinHTTP proxy settings (`netsh winhttp show proxy`)
2. Detects proxy bypass list for Mooncake endpoints
3. Schedules tasks under `NT AUTHORITY\SYSTEM` to test each endpoint
4. Uses `Invoke-WebRequest` with TLS 1.2 enforcement
5. Reports success/failure per endpoint

## Usage
```powershell
# Must run as Administrator
.\Test-DeviceRegConnectivity
```

## Proxy-Aware
- If proxy detected: uses `-Proxy $ProxyServer` for endpoints not in bypass list
- Checks bypass list patterns: `*.partner.microsoftonline.cn`, specific endpoint FQDNs

## Failure Recommendations
- Ensure device can communicate with MS endpoints under SYSTEM account
- Implement WPAD for proxy environments
- Configure WinHTTP proxy via GPO (Windows 10 1709+)
- For authenticated proxies: ensure machine context can authenticate

## Source
- sourceRef: `Mooncake POD Support Notebook/.../Connectivity testing script for Mooncake.md`
