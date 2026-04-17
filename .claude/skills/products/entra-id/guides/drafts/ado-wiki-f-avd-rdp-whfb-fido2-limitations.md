---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/Hello for Business/AVD or RDP Sign in using WHfB or FIDO2/AVD or RDP Sign in using WHfB or FIDO2 Limitations known issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/StrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)/Hello%20for%20Business/AVD%20or%20RDP%20Sign%20in%20using%20WHfB%20or%20FIDO2/AVD%20or%20RDP%20Sign%20in%20using%20WHfB%20or%20FIDO2%20Limitations%20known%20issues"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Limitations

- Azure AD remembers up to **15 devices** per user for SSO. When the 16th device is connected, the oldest device is pushed out (FIFO).
- **B2B Guest users are not supported** at this time.

# Supported Platforms - Local Client

| Client Platform | FIDO Support | Microsoft Entra CBA | Notes |
| --- | --- | --- | --- |
| Windows 10+ | Yes | Yes | |
| Windows Server | Partial | Yes | Not recommended for client devices. Jump servers may impede FIDO, use CBA instead. |
| macOS | Yes | Yes | Not all Apple web frameworks support FIDO |
| iOS | Yes | Yes | Not all Apple web frameworks support FIDO |
| Android | Yes | Yes | |
| Linux | Maybe | Yes | Confirm FIDO support with Linux distro vendor |

# Supported Platforms - Session Host/Server/Target

| Target Platform | FIDO Support | CBA Support |
| --- | --- | --- |
| Windows 10+ Entra joined | Yes | Yes |
| Windows Server Entra joined | Yes (2022+) | Yes |
| Windows 10+ Entra hybrid joined | Yes | Yes |
| Windows Server Entra hybrid joined | Yes (2022+) | Yes |
| Windows 10+ Entra registered | No | No |
| Windows 10+ on-prem domain joined only | No | No |
| Windows Server on-prem domain joined only | No | No |
| Windows 10+ Workgroup | No | No |
| Azure Arc-managed Windows Server (2025+) | Yes | Yes |

# Supported RDP Clients

| RDP Client | FIDO Support | CBA Support |
| --- | --- | --- |
| MSTSC.exe for Windows Client | Yes | Yes |
| MSTSC.exe for Windows Server 2022+ | Yes | Yes |
| MSTSC.exe for Windows Server 2019 or earlier | No | No |
| Windows App for Windows | Yes | Yes |
| Windows App for macOS | Yes | Yes |
| Windows App for iOS | Yes | Yes |
| Windows App for Android | Yes | Yes |
| Windows 365 Web App | No | No |
| Third Party RDP Client | Maybe | Maybe |
