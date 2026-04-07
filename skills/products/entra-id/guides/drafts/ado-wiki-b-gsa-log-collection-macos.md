---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra Global Secure Access (ZTNA)/Internal Docs/GSA Private Access - CSS TSGs/GSA Client Advanced Log Collection Files for MacOS"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20Global%20Secure%20Access%20(ZTNA)%2FInternal%20Docs%2FGSA%20Private%20Access%20-%20CSS%20TSGs%2FGSA%20Client%20Advanced%20Log%20Collection%20Files%20for%20MacOS"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# GSA Client Advanced Log Collection Files for MacOS

Overview of the advanced log and diagnostic files collected from macOS devices when Microsoft Entra Global Secure Access (GSA) client logging is enabled with Full Telemetry diagnostics and Verbose logging.

Logs are compressed into: `GlobalSecureAccessLogs-MacOSVersion-YYYY-MM-DD--HH-MM-SS-msec.zip`

Based on version: 1.1.25111702

## Log Files Reference

| File name | Format | Purpose | Troubleshooting tip |
|-----------|--------|---------|---------------------|
| system_info_logs.txt | TEXT | Hardware Overview (OS version), System Software Overview (Computer Name, User Name), Network Adapter info | Validate OS Version, identify device name and User Account, identify active Network adapter and configuration |
| system_extensions_logs.txt | TEXT | Current extensions enabled in MacOS | Must contain Global Secure Access Network Extension and it must be active |
| policy.json | JSON | Dump of profiles, segments, Private DNS etc. | The GUID in audienceScope is the App ID of the Network Policy App |
| netstat_logs.txt | TEXT | Active network connections, listening ports, and routing state | Review for unexpected connections or port conflicts |
| install.log | LOG | Installation/uninstall and upgrade process for the GSA Client | Confirm successful installation, version checks, cleanup of old components, agent/systemextension setup |
| ifconfig_logs.log | LOG | Mac network interface configuration (ifconfig output) | Verify active interface (en0) and tunnel interface (utun4) routing to ensure traffic flows through expected path |
| dns_logs.txt | TEXT | macOS DNS resolver configuration, Private DNS status and configuration | Verify GSA resolvers (6.6.255.254 / 240.0.3.3) are reachable and expected domains resolve through them to confirm DNS tunneling works |
| com.microsoft.globalsecureaccess.tunnel.plist | PLIST | macOS GSA client preference plist showing cloudsourced policy state | If connectivity or tunneling fails, verify policyLastUpdated is recent and policySource is Cloud to confirm client is syncing correctly |
| UBF8T346G9.group.com.microsoft.globalsecureaccess.tunnel.plist | PLIST | User, device, tenant identity, and cryptographic configuration | Verify tenant/device IDs/UserID and key labels match Entra and Keychain; if tunnel fails, delete file to force re-auth and reprovisioning |
| UBF8T346G9.group.com.microsoft.globalsecureaccess | PLIST | Policy configuration, authentication state, and tunnel behavior settings | Review policy and auth state |
| com.microsoft.globalsecureaccess.tunnel YY-MM-DD--*.log | LOG | Runtime tunnel log: token retrieval, flow decisions, gRPC edge connection, tunnel creation, bypass vs tunnel decisions | Confirm whether flows are tunneled or bypassed. Look for: Requesting token, GRPC connection established, Tunnel created successfully, or pre-req didnt meet/BypassByConfig. Similar to GlobalSecureAccess-Trace.etl on Windows |
| com.microsoft.globalsecureaccess YYYY-MM-DD--*.log | LOG | UX/menu bar status, VPN/system extension state, policy fetch status, reachability/captive portal checks, client health | Confirm PolicyFetchSuccess vs failures, system extension registered, state (connected/paused/disabled), captive/internet reachability. Correlate timestamps with tunnel log |
| client-YYYY-MM-DD--HH-MM-SS-XXXX.pcap | PCAP | Network capture | Use [Wireshark](https://www.wireshark.org/) to read |

## Key Troubleshooting Workflow

1. Check `system_extensions_logs.txt` - GSA Network Extension must be active
2. Check `policy.json` - verify profiles/segments are loaded
3. Check `dns_logs.txt` - verify GSA resolvers (6.6.255.254 / 240.0.3.3) reachable
4. Check `ifconfig_logs.log` - verify utun4 tunnel interface exists
5. Check tunnel log - look for "Tunnel created successfully" vs "BypassByConfig"
6. Check app log - look for PolicyFetchSuccess and connected state
7. If tunnel fails - check plist files for stale state, delete to force re-auth

## Teams Channel

[Cloud Identity - Authentication | Global Secure Access (ZTNA)](https://teams.microsoft.com/l/channel/19%3A3b8ba43678fb47a9bf82e03512c34423%40thread.skype/Global%20Secure%20Access%20(ZTNA)?groupId=0f0f4ddf-6429-4dfe-83d2-1a28cb88fadd&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47)
