---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Device Config Certificates Email VPN Wifi/MS Tunnel VPN/Proxy Flow in Microsoft Tunnel Gateway & Mobile Devices"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Config%20Certificates%20Email%20VPN%20Wifi%2FMS%20Tunnel%20VPN%2FProxy%20Flow%20in%20Microsoft%20Tunnel%20Gateway%20%26%20Mobile%20Devices"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Proxy Flow in Microsoft Tunnel Gateway & Mobile Devices

## Proxy Types
- **Explicit**: Device configured to send traffic to proxy:port
- **Transparent**: Network-level interception, device unaware
- **Authenticated**: Requires user auth (NOT supported for Tunnel Management Agent)
- **Pass-through**: No HTTPS decryption, uses SNI for routing
- **Reverse**: Sits in front of servers (incoming traffic)

## Static vs PAC
| Type | DNS Behavior |
|------|-------------|
| Static Proxy | Client does NOT resolve DNS, sends URL to proxy |
| PAC File | Device runs JS logic locally before sending packet, may resolve DNS |

## Server-Side Proxy
- OS Level: Linux updates/patches
- Container Level: Management Agent → Microsoft endpoints
- Server proxy is NOT used for VPN client traffic routing
- Only static proxies supported on server (HTTP_PROXY/HTTPS_PROXY env vars)
- No PAC file support on server

### SSL Break & Inspect
- Management Agent: CANNOT use SSL inspection (mutual TLS, will break)
- VPN Clients: Can use B&I, but exclude login.microsoftonline.com etc.

## iOS MDM Client Proxy
- VPN profile delivers proxy settings (static or PAC)
- iOS creates utun interface with proxy as primary config
- **System APIs** (URLSession, CFNetwork, WebKit): Auto-route through proxy
- **Low-level APIs** (BSD Sockets, libcurl, OpenSSL): Bypass proxy, go direct
- Debug: macOS Console filter `neagent` or `nesessionmanager`

## iOS MAM Client Proxy
- MAM SDK reads proxy info (not iOS kernel)
- Check API compatibility of developer's app
- Log collection essential (first-party: built-in; third-party: developer must provide)

## Android (MDM + MAM) Client Proxy
- Defender registers proxy with Android Connectivity Service
- TUN interface created with proxy settings
- **Standard libs** (HttpURLConnection, OkHttp, Cronet): Auto-use proxy
- **Low-level libs** (BSD Sockets, raw TCP/UDP): Bypass proxy
- Debug: `adb logcat` filter `ConnectivityService` or `Vpn`

## Gotchas
- Split tunneling + proxy: Proxy IP must be in split tunnel rules
- Static + PAC configured together: PAC usually wins, no clean failover
- Don't count on redundancy between the two methods
