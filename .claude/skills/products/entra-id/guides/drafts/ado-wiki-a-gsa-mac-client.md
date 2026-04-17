---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra Global Secure Access (ZTNA)/Global Secure Access For Mac"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20Global%20Secure%20Access%20(ZTNA)%2FGlobal%20Secure%20Access%20For%20Mac"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Global Secure Access on Mac

Global Secure Access (GSA) on Mac is achieved via the GSA client installed on the user's device. The client routes traffic that needs to be secured through Global Secure Access in Azure. A Forwarding Profile defines which traffic is secured.

For Forwarding Profile configuration: [Global Secure Access Traffic Forwarding Profiles](https://learn.microsoft.com/en-us/entra/global-secure-access/concept-traffic-forwarding)

## Prerequisites

- Mac device supported on all architectures (Intel, M1, M2, M3)
- Entra tenant on-boarded to Global Secure Access
- Device registered to Microsoft Entra tenant using Company Portal
- macOS 13+ platform
- Internet connection
- Privileged user access

## Client Download and Installation

Download from Microsoft Entra admin center as Global Secure Access Administrator: **Global Secure Access > Connect > Client Download**.

### Automated Installation

```bash
sudo installer -pkg ~/Downloads/GlobalSecureAccessClient_[version].pkg -target / -verboseR
```

The client uses system extensions and transparent application proxy that need approval during installation. Deploy MDM policies for silent approval.

### Intune Policy: Allow Extensions

1. In Intune: **Devices > Manage devices > Configuration > Policies > New policy**
2. Create profile for macOS platform, template type **Extensions**.
3. Enter bundle identifiers and team identifier:

| Bundle identifier | Team identifier |
|---|---|
| com.microsoft.naas.globalsecure.tunnel-df | UBF8T346G9 |
| com.microsoft.naas.globalsecure-df | UBF8T346G9 |

4. Assign to appropriate users and devices.

### Intune Policy: Transparent Application Proxy

1. Create profile for macOS, template type **Custom**.
2. Upload XML configuration file with TransparentProxy settings:
   - PayloadIdentifier: `com.microsoft.naas.globalsecure-df.`
   - ProviderBundleIdentifier: `com.microsoft.naas.globalsecure.tunnel-df`
   - RemoteAddress: `100.64.0.0`
   - VPNType: `TransparentProxy`
3. Assign to appropriate users and devices.

### Manual Interactive Installation

1. Download and run `GlobalSecureAccessClient.pkg`.
2. Follow the setup wizard (Introduction > License > Install).
3. Allow the Global Secure Access system extension when prompted.
4. Sign in to Microsoft Entra (default: SSO via Company Portal credentials).
5. Verify connected status (tick mark in system tray icon).

## Client Actions

| Action | Description |
|--------|-------------|
| Disable | Disables the client (prompts for business justification) |
| Enable | Enables a disabled client |
| Pause | Pauses for 10 minutes (prompts for justification and credentials) |
| Resume | Resumes a paused client |
| Restart | Restarts the client |
| Collect logs | Archives client logs in a zip file for support |
| Settings | Opens settings and advanced diagnostics |
| About | Shows product version information |

## Client Status Icons

| Status | Description |
|--------|-------------|
| Initializing | Checking the connection to Global Secure Access |
| Connected (tick) | Client is connected to GSA |
| Disabled/Paused | Client disabled by user or services are down |
| Disconnected | Client fails to connect to GSA |
| Partial/Warning | Multiple scenarios: partial connection, org-disabled, Private Access disabled on device, no internet/captive portal |

## Settings

- **Telemetry full diagnostics**: Sends full telemetry data to Microsoft.
- **Enable verbose logging**: Enables verbose logging and network capture in exported logs.

## Troubleshooting

- **Get latest policy**: Downloads and applies the latest forwarding profile.
- **Clear cached data**: Deletes internal cached data (authentication, forwarding profile, FQDNs, IPs).
- **Export logs**: Exports client logs into a zip file.
- **Advanced Diagnostics tool**: Monitor and troubleshoot the client's behavior.

## Known Limitations

- **DNS over HTTPS**: Client doesn't capture traffic if DoH is used. FQDN-based acquisition is affected (IP-based is not). Mitigation: disable DNS over HTTPS.
- **IPv6 not supported**: Client tunnels only IPv4 traffic. IPv6 goes directly to the network. Mitigation: disable IPv6.
- **Connection fallback**: On connection error to cloud service, client falls back to direct Internet or blocking based on the hardening value in the forwarding profile.
- **Geolocation**: Tunneled traffic shows edge IP as source. Services relying on geolocation may be affected. Consider enabling [Source IP Restoration](https://learn.microsoft.com/en-us/entra/global-secure-access/how-to-source-ip-restoration) for Office 365 and Entra.
- **Virtualization**: Supported on VM running macOS only if the client is not installed on the host.
- **QUIC not supported for Internet Access**: Traffic to UDP 80/443 cannot be tunneled. Supported in Private Access and M365 workloads. Mitigation: disable QUIC on browsers.
