# Intune Microsoft Tunnel VPN — 排查工作流

**来源草稿**: ado-wiki-MS-Tunnel-VPN.md, ado-wiki-VPN-Profiles.md, mslearn-troubleshoot-vpn-profiles.md, onenote-ms-tunnel-log-collection.md, onenote-ms-tunnel-network-trace.md, onenote-windows-vpn-custom-policy.md
**Kusto 引用**: (无)
**场景数**: 25
**生成日期**: 2026-04-07

---

## Portal 路径

- `Intune > Linux > Gather Access Log`

## Scenario 1: Key Components
> 来源: ado-wiki-MS-Tunnel-VPN.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **Intune Service**: Deploys VPN server + client configurations
- **Entra ID**: Issues authentication tokens, evaluates Conditional Access
- **Linux Server**: Runs Podman/Docker CE container with MTG images
- **Container Images**: Server image (VPN connections) + Agent image (Intune backend communication)
- **TLS Certificate**: Required for secure connection between devices and Tunnel server
- **Defender for Endpoint**: Required app on devices for Tunnel connectivity

## Scenario 2: Deployment Scenarios
> 来源: ado-wiki-MS-Tunnel-VPN.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Server location: On-premises or Azure VM (with ExpressRoute)
- Site/Server: Single/Multiple sites, Single/Multiple servers per site
- Client: iOS/iPadOS and Android Enterprise only (MDM or MAM)
- Tunneling: Split Tunnel vs Forced Tunnel; Per-App VPN (iOS: forced tunnel); On-Demand VPN (iOS only)

## Configuration

## Scenario 3: Server Side
> 来源: ado-wiki-MS-Tunnel-VPN.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Meet prerequisites (Linux, Docker/Podman, networking)
2. Create Server Configuration in Intune (IP ranges, DNS, split tunnel rules)
3. Create Site Configuration in Intune
4. Run readiness scripts on server
5. Install MTG

## Scenario 4: Client Side (MDM)
> 来源: ado-wiki-MS-Tunnel-VPN.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Deploy Trusted Root Certificate profile (if private CA)
2. Deploy VPN profile (platform-specific settings)
3. Deploy Defender for Endpoint app

## Scenario 5: Client Side (MAM)
> 来源: ado-wiki-MS-Tunnel-VPN.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- App Configuration + App Protection policies
- LOB apps need SDK integration (Intune App SDK + MSAL + Tunnel SDK)

## Scenario 6: Data Collection
> 来源: ado-wiki-MS-Tunnel-VPN.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **Client logs**: Defender app > Help & feedback > Send Logs > record Incident ID (aka.ms/Powerlift)
- **Server logs**: `journalctl -t ocserv --since -1d > log.txt`
- **Multi-component**: `journalctl --since='-5h' -t mstunnel_monitor -t mstunnel-agent -t ocserv > dump.txt`
- **Debug mode**: Edit `/etc/mstunnel/env.sh`, add `DEBUG_LEVEL=4`, restart with `mst-cli server restart`

## Scenario 7: TLS Certificate Issues
> 来源: ado-wiki-MS-Tunnel-VPN.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Common error: Only leaf cert provided (missing CA chain)
- Verify: `openssl s_client -showcerts -connect vpn_server:443`
- Online test: https://www.ssllabs.com/ssltest/
- If private CA: Deploy full chain via Trusted Certificate profiles

## Scenario 8: Networking
> 来源: ado-wiki-MS-Tunnel-VPN.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **Ports**: Inbound 443/TCP + 443/UDP; Outbound 443/TCP + 80/TCP
- **Test connectivity**: `nc -z -v -u <host> 443` (UDP), `nc -z -v <host> 443` (TCP)
- **SSL Inspector**: Must exclude MTG endpoints; breaks connection if inspecting
- **Authenticated proxy**: NOT supported; must exclude MTG endpoints from auth
- **Proxy config**: `/etc/environment` or Docker's `/etc/systemd/system/docker.service.d/http-proxy.conf`

## Scenario 9: Load Balancer
> 来源: ado-wiki-MS-Tunnel-VPN.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- MUST configure Source IP Affinity
- Without it: TLS handshake and DTLS handshake may hit different servers
- Verify with network trace comparing destination IPs

## Scenario 10: Network Tracing
> 来源: ado-wiki-MS-Tunnel-VPN.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```bash
# Physical adapter
tcpdump -i eth0 -w ./eth0-capture.pcap -vv -XX
# Container bridge
tcpdump -i docker0 -w ./docker0-capture.pcap -vv -XX
# VPN tun adapter (find with mst-cli server show users)
mst-cli server capture ma-tun0 ./ma-tun0-capture.pcap
```

## Scenario 11: Authentication
> 来源: ado-wiki-MS-Tunnel-VPN.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Check sign-in activity (interactive + non-interactive) in MEM portal
- Verify Conditional Access policy configuration
- Confirm device meets compliance requirements

## Scenario 12: Key Limitations & Known Issues
> 来源: ado-wiki-MS-Tunnel-VPN.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Split tunnel rules ignored on iOS Per-App VPN (forced tunnel behavior)
- Authenticated proxy not supported for MTG server
- Azure AD App Proxy not supported for exposing MTG
- SSL termination between device and MTG breaks connection
- Legacy endpoints deprecated Aug 15, 2025 (upgrade to March 19, 2025+ release)

## FAQ
- Multiple Per-App VPN profiles on same iOS device: **Supported**
- Multiple VPN profiles with different proxy PAC files on iOS: **Supported**
- Different Host OS across servers in same site: **Supported** (containers must be same version)

## Support Boundaries
**Intune CSS supports**: Installation script, Intune portal config, VPN profile deployment, Defender app deployment
**Collaboration needed**: Authentication/CA issues (Azure Identity team)
**Customer responsibility**: Network infrastructure sizing, LB/Proxy/Firewall config, Linux server setup, Docker/Podman, TLS certificate acquisition

## SME Contacts
- **ATZ Lead**: Martin Kirtchayan
- **ATZ**: Carlos Jenkins
- **EMEA**: Ameer Ahmed, Anushka Rai
- **Alias**: mtgsme@microsoft.com

## Scenario 13: VPN profile deployment flow
> 来源: ado-wiki-VPN-Profiles.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Settings from Intune are passed to Windows clients using the VPNv2 CSP. For other device platforms it will also use the OMA-DM protocol. The VPN gateway requests authentication, client provides credentials, and VPN gateway sends to RADIUS server for verification.

# Scenarios

## iOS and Android Per App VPN
The Per-app VPN feature allows the IT pro to create and link a VPN profile to a managed application. It requires certificates (SCEP or PKCS) for authentication.

**Key difference:**
- On Android Enterprise, user starts VPN, then per-app settings determine which apps are allowed (allowlist/blocklist).
- On iOS, launching the app triggers the VPN connection.

- Per-App VPN for Android DA: https://docs.microsoft.com/en-us/mem/intune/configuration/android-pulse-secure-per-app-vpn
- Per-App VPN for iOS/iPadOS: https://docs.microsoft.com/en-us/mem/intune/configuration/vpn-setting-configure-per-app
- Android Enterprise: Use App Configuration policy

## Windows AlwaysOn VPN (AOV)
AlwaysOn VPN triggers connection as soon as device starts. Two tunnel types:
- **Device tunnel**: connects before user login, for pre-login connectivity and device management
- **User tunnel**: connects after user login, for accessing organization resources

Troubleshoot: https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/troubleshoot-always-on-vpn

## Split tunnel/force tunnel
- **Force tunneling**: all traffic routes through VPN
- **Split tunneling**: only specific destinations route through VPN, rest uses direct Internet

# Scoping Questions
1. What is the device platform?
2. Is this a profile deployment issue or a VPN connection issue?
3. Has the customer contacted involved vendors/internal networking team?
4. What VPN client/server model is being used?
5. What authentication method? (certificate/username+password)

# Support Boundaries
Intune is a **delivery mechanism** for policies and configurations. Supported:
- Policy configuration and delivery to device

Not supported / Transfer to other teams:
- NDES role installation failures
- CRL availability issues
- NDES application pool crashes
- NDES URL returns 500 instead of 403
- NPS/RADIUS authentication issues → Windows Networking team
- Windows native VPN client issues → Windows Networking team
- Third-party VPN vendor issues → Involve vendor

# FAQ and Known Issues

## VPN Disconnects or Resets during every MDM/Device Sync
- During MDM sync, string comparison between existing and "new" VPN profile
- Windows regenerates XML which may differ in formatting from Intune's version
- If mismatch detected, Intune replaces profile causing VPN disconnect
- **Fix**: Export Windows-formatted XML and use it in custom Intune profile:
  1. `$vpns = Get-CimInstance -Namespace root\cimv2\mdm\dmmap -ClassName MDM_VPNv2_01`
  2. `$vpns[0].ProfileXML | Out-File -FilePath "VPN-Corrected.XML"`
  3. Use corrected XML in Intune custom profile per: https://learn.microsoft.com/en-us/windows/security/operating-system-security/network-security/vpn/vpn-profile-options#apply-profilexml-using-intune

# Troubleshooting
- General: https://learn.microsoft.com/en-us/troubleshoot/mem/intune/device-configuration/troubleshoot-vpn-profiles
- Windows L2TP/IPSec: https://learn.microsoft.com/en-US/troubleshoot/windows-client/networking/l2tp-ipsec-vpn-client-connection-issue
- Always On VPN: https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/troubleshoot-always-on-vpn
- SyncML troubleshooting with VPNv2 CSP: https://learn.microsoft.com/en-us/windows/client-management/mdm/vpnv2-csp

# SME Contacts
- ATZ SMEs: Martin Kirtchayan, Carlos Jenkins
- EMEA SME: Prenkumar N, Armia Endrawos

## Scenario 14: Prerequisites
> 来源: mslearn-troubleshoot-vpn-profiles.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Trusted Root and SCEP profiles must be installed and working on device
- VPN app must be installed before VPN profile is applied
- Group-type deployment (user/device) must be consistent across Trusted Root, SCEP, and VPN profiles

## Scenario 15: Android
> 来源: mslearn-troubleshoot-vpn-profiles.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Check profile assignment to correct group
2. Verify device can sync (check LAST CHECK IN)
3. Verify Trusted Root and SCEP profiles deployed
4. If CertificateSelector cannot find matching cert, VPN profile skipped
   - Log: "Waiting for required certificates for vpn profile"
   - Check Any Purpose EKU mismatch between SCEP profile and CA template
5. Verify AnyConnect External Control option enabled

## Scenario 16: iOS
> 来源: mslearn-troubleshoot-vpn-profiles.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Check profile assignment
2. Verify sync capability
3. Check Management Profile for VPN profile
4. Console/device logs for installation details

## Scenario 17: Windows
> 来源: mslearn-troubleshoot-vpn-profiles.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Check profile assignment
2. Verify sync
3. Download MDM Diagnostic Information log
4. Check Event Viewer: DeviceManagement-Enterprise-Diagnostic-Provider Admin/Debug logs

## Scenario 18: Troubleshooting: VPN Deployed But Cannot Connect
> 来源: mslearn-troubleshoot-vpn-profiles.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Usually not an Intune issue
- Try manual connection with same certificate criteria
- Android/iOS: Check VPN client app logs (AnyConnect Diagnostics)
- Windows: Check Radius server logs

## Logs

| Platform | Log Location |
|----------|-------------|
| Android | Omadmlog.log (search android.vpn.client) |
| iOS | Console app on Mac, search VPN profile name |
| Windows | Event Viewer > DeviceManagement-Enterprise-Diagnostic-Provider |

## Scenario 19: Common DNS Resolution Failure
> 来源: mslearn-troubleshoot-vpn-profiles.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

AnyConnect log: "SOCKETSUPPORT_ERROR_GETADDRINFO failed to resolve host name" - verify VPN server hostname is resolvable.

## Scenario 20: Log Format
> 来源: onenote-ms-tunnel-log-collection.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```
<timestamp> <ServerName> <PID> <userId> <deviceId> <protocol> <srcIP:port> <dstIP:port> <bytesSent> <bytesReceived> <connectionTimeSec>
```
Example:
```
Feb 25 16:37:56 MSTunnelTest-VM ocserv-access[9528]: ACCESS_LOG,41150dc4-...,f5132455-...,tcp,169.254.54.149:49462,10.88.0.5:80,112,60,10
```

## Scenario 21: Enable Access Logging
> 来源: onenote-ms-tunnel-log-collection.md | 适用: Mooncake ✅

### 排查步骤

1. Set `TRACE_SESSIONS=1` in `/etc/mstunnel/env.sh`
2. Set `TRACE_SESSIONS=2` to include DNS connection logging
3. Run `mst-cli server restart`

To reduce noise: set `TRACE_SESSIONS=1` (disables DNS logging) and restart.

## Source
- OneNote: Mooncake POD Support Notebook > Intune > Linux > Gather Access Log + Gather MS Tunnel Gateway verbose log

## Scenario 22: Method 2: Manual (if mst-cli has issues)
> 来源: onenote-ms-tunnel-network-trace.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Get user Object ID
2. Get client IP:
   ```bash
   mst-cli server show user <object-ID>
   ```
3. Enter the container:
   ```bash
   podman exec -it mstunnel-server bash
   ```
4. Find the VPN sub-interface:
   ```bash
   occtl show users | grep "<client-IP>" | awk '{print $6}'
   ```
5. Capture traffic:
   ```bash
   tcpdump -i <interfaceName> -w <file.name>
   ```
6. Copy file out of container:
   ```bash
   podman cp mstunnel-server:<capture-file> <destination-folder>
   ```

## Reference
- [Red Hat Enterprise Linux 8 Documentation](https://access.redhat.com/documentation/zh-cn/red_hat_enterprise_linux/8)

## Source
- OneNote: Linux/Capture Network Trace based on User Session

## Scenario 23: Always On VPN Example
> 来源: onenote-windows-vpn-custom-policy.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Setting | Value |
|---------|-------|
| Setting name | Always On |
| Data type | String |
| OMA-URI | `./Device/Vendor/VPNv2/{ProfileName}/AlwaysOn` |
| Value | True |

## VPN Profile Storage Paths

## Scenario 24: Device Tunnel
> 来源: onenote-windows-vpn-custom-policy.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```
%ALLUSERSPROFILE%\Microsoft\Network\Connections\Pbk\
```

## Scenario 25: User VPN Profile
> 来源: onenote-windows-vpn-custom-policy.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```
%APPDATA%\Microsoft\Network\Connections\Pbk\
```
(Accessible only when signed in with that user)

## References
- [Create VPN profile via Custom OMA-URIs](https://blogs.technet.microsoft.com/tune_in_to_windows_intune/2015/01/30/create-a-vpn-profile-using-microsoft-intune-standalone-via-custom-oma-uris/)
- [Configuring custom Windows 10 VPN profiles using Intune](https://technofocusin.wordpress.com/2015/08/07/configuring-custom-windows-10-vpn-profiles-using-intune/)

---

> ⚠️ **21V (Mooncake) 注意**: 本主题包含 21V 特有的限制或配置，请注意区分 Global 与 21V 环境差异。
