---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/Archived Content/Deprecated Content/DEPRECATED_Mobius/DEPRECATED_Unified Web Client"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1234487"
importDate: "2026-04-06"
type: troubleshooting-guide
deprecated: true
deprecationNote: "See Windows App (Unified Client) documentation going forward."
---

> ⚠️ **Deprecated**: See the [Windows App (Unified Client) documentation](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1240862/Windows-App-(Unified-Client)) going onwards.

[[_TOC_]]

# Unified Web Client (Nighthawk/Mobius)

## Overview

Nighthawk (W365 web client) extended to support all AVD resources (VMs and remote applications) via unified web experience.

## Key Technical Notes

- **Feed discovery and connection** happen at different URLs and on different web apps
- Users can bookmark connection URL to skip feed discovery in future
- **Nighthawk** = application running in user's browser that loads RD Core Web
- **RD Core Web** = component managing session and connection
- **Mobius client** = allows users to connect directly to a resource without going through feed discovery
  - User Agent: `CPC.Web`
- **Broadcast Channel**: communication between Mobius portal and client for launching remote apps in correct browser tab
- Telemetry: ARIA (from Nighthawk itself, scrubbed of EUPI); RD Core emits telemetry uniformly to Event Hub
- **ECS** = flighting system for feature exposure control
- **ADFS SSO**: not supported during public preview (falls back to password); **Azure AD SSO**: supported for public preview

## Connection Flow

1. Request token from Azure AD by calling RD Web API
2. Receive token from Azure AD
3. Get RDP file URL from RDWeb using direct launch URL
4. Construct direct launch URL using tenant ID and resource ID from URL → send to RDWeb
5. Get back the URL for the RDP file
6. Get RDP file contents
7. Hand off to RD Core Web → start orchestration

**For RemoteApps**: portal maintains a Broadcast Channel with web client. Opening additional apps communicated over broadcast channel. Client verifies same host → opens new app; different host → opens new client tab.

## Error Codes Reference

| Error Code | Symptom / User Message | Root Cause / Notes |
|-----------|----------------------|-------------------|
| AccountDisabled | Can't connect — account disabled | User account disabled in directory |
| AccountExpired | Can't connect — account expired | User account expired |
| AccountLockedOut | Can't connect — account locked | Too many sign-in or password change attempts |
| AccountRestricted | Can't connect — account restricted | User account restriction preventing sign-in |
| AutoReconnectFailed | Couldn't auto-reconnect | Auto-reconnect mechanism failed |
| CertExpired | Session ended — certificate expired or invalid | Server auth certificate expired or invalid |
| CertMismatch | Session ended — unexpected certificate | Unexpected server authentication certificate received |
| ConnectionBroken | Connection to remote PC lost | Network connection problem |
| ConnectionTimeout | Couldn't establish session in time | Session setup timed out |
| CredSSPRequired | Session ended — CredSSP required by server | CredSSP must be enabled; contact administrator |
| FreshCredsRequired | Working on refreshing token, try again shortly | Token refresh in progress |
| GatewayAuthFailure | Couldn't connect to gateway | Gateway authentication error |
| GenericLicenseError | Can't connect — licensing error | Licensing issue; contact admin |
| IdleTimeout | Session timed out due to inactivity | Inactivity timeout; try reconnecting |
| InvalidLogonHours | Session ended — outside allowed sign-in hours | Admin restricted allowed sign-in hours |
| InvalidWorkStation | Can't connect — device not allowed | Admin restricted which devices can sign in |
| LogonFailed | Sign in failed | Incorrect username or password |
| LogonTimeout | Session ended — session time limit exceeded | Admin or network policy time limit |
| LoopbackUnsupported | Can't connect — device and remote PC are same | Loopback connection not supported |
| NoLicenseAvailable | Can't connect — no licenses available | No licenses available for this PC; contact admin |
| NoLicenseServer | Can't connect — no license server available | No license server available |
| NoRemoteConnectionLicense | Session ended — PC not licensed for remote connections | PC not licensed for remote connections |
| NoSuchUser | Can't connect — username doesn't exist | Username not found; verify username |
| OrchestrationResourceNotAvailableError | Can't connect — no available resources | No session hosts currently available; try later |
| OutOfMemory | Web client out of memory | Reduce browser window size or disconnect existing sessions |
| PasswordExpired | Can't connect — password expired | User password expired; change password |
| PasswordMustChange | Can't connect — must change password | Password change required before sign-in |
| RemotingDisabled | Can't connect | Remote access not enabled on PC |
| ReplacedByOtherConnection | Disconnected — another connection made | Another session replaced this connection |
| SSLHandshakeFailed | Can't connect | Possible expired password; SSL handshake failed |
| ServerNameLookupFailed | Can't connect — PC can't be found | DNS resolution failure for server name |
| SessionHostResourceNotAvailable | Can't connect — VM failed to start | Session host VM failed to start; try again or contact support |
| TimeSkew | Can't connect — TimeSkew | Date/time difference between client and remote PC; sync clock |
| VersionMismatch | Session ended — protocol version mismatch | Local and server RDP versions don't match; update client |
| WebWorkerError | Can't start connection due to webworker error | Click Reconnect to start new session without webworkers |
| ScreenCaptureProtectNotSupported | Can't connect — screen capture protection | Enable screen capture protection; contact admin if persists |
