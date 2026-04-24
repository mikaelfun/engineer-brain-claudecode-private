---
source: mslearn
sourceRef: null
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/ad-dmn-services/enable-support-tls-environment
importDate: "2026-04-24"
type: guide-draft
---

# Enable TLS 1.2 Support for Microsoft Entra Environment

## Summary

Comprehensive guide for enabling TLS 1.2 across the environment after Microsoft Entra deprecation of TLS 1.0/1.1. Covers OS-level, .NET Framework, server roles, and client applications.

## Deprecation Timeline

| Instance | Deprecation Date | Status |
|----------|-----------------|--------|
| U.S. government | March 31, 2021 | COMPLETED |
| Public instances | January 31, 2022 | COMPLETED |
| 21Vianet China | January 31, 2025 | ONGOING |

## Affected Components

- Microsoft Entra Connect
- Microsoft Graph PowerShell
- Entra Application Proxy connectors
- PTA (Pass-through Authentication) agents
- Legacy browsers
- Applications integrated with Microsoft Entra ID

## OS-Level TLS 1.2 Enablement

### Windows 8.1/10+ and Server 2012 R2+ (native support)
TLS 1.2 enabled by default. Verify not explicitly disabled.

### Older Windows (8, Server 2012)
1. Install KB3140245
2. Set registry values (see below)

### Registry Keys

**TLS 1.2 Protocol:**
- `HKLM\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Protocols\TLS 1.2\Client`
  - `DisabledByDefault`: 0x00000000
  - `Enabled`: 0x00000001
- Same under `\Server` subkey

**.NET Framework Strong Crypto:**
- `HKLM\SOFTWARE\Microsoft\.NETFramework4.0.30319`
  - `SchUseStrongCrypto`: 0x00000001

## .NET Framework Requirements

- .NET 4.7+: native TLS 1.2 support
- .NET 4.6 and earlier: need updates + registry settings
- For 32-bit on 64-bit OS, also set under `Wow6432Node` path

## Server Role Minimum Versions

| Role | Minimum Version |
|------|----------------|
| Entra Connect | Latest |
| PTA Agent | 1.5.643.0+ |
| Application Proxy | 1.5.1526.0+ |
| NPS Extension for MFA | Latest |
| MFA Server | 8.0.x+ |

## Verification

Check TLS in use via:
- Browser security settings
- Internet Properties > Advanced tab > TLS checkboxes
- Network trace (Wireshark/Fiddler)

## 21Vianet Notes

TLS 1.0/1.1 deprecation for 21Vianet instances started January 31, 2025. Same enablement steps apply to Mooncake environment.
