---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Device Config Certificates Email VPN Wifi/MS Tunnel VPN"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Config%20Certificates%20Email%20VPN%20Wifi%2FMS%20Tunnel%20VPN"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Microsoft Tunnel Gateway (MTG) VPN

## Architecture Overview
MTG runs in a container (Podman/Docker CE) on Linux, providing VPN access to on-premises resources from iOS/iPadOS and Android Enterprise devices using modern authentication and Conditional Access.

### Key Components
- **Intune Service**: Deploys VPN server + client configurations
- **Entra ID**: Issues authentication tokens, evaluates Conditional Access
- **Linux Server**: Runs Podman/Docker CE container with MTG images
- **Container Images**: Server image (VPN connections) + Agent image (Intune backend communication)
- **TLS Certificate**: Required for secure connection between devices and Tunnel server
- **Defender for Endpoint**: Required app on devices for Tunnel connectivity

## Deployment Scenarios
- Server location: On-premises or Azure VM (with ExpressRoute)
- Site/Server: Single/Multiple sites, Single/Multiple servers per site
- Client: iOS/iPadOS and Android Enterprise only (MDM or MAM)
- Tunneling: Split Tunnel vs Forced Tunnel; Per-App VPN (iOS: forced tunnel); On-Demand VPN (iOS only)

## Configuration

### Server Side
1. Meet prerequisites (Linux, Docker/Podman, networking)
2. Create Server Configuration in Intune (IP ranges, DNS, split tunnel rules)
3. Create Site Configuration in Intune
4. Run readiness scripts on server
5. Install MTG

### Client Side (MDM)
1. Deploy Trusted Root Certificate profile (if private CA)
2. Deploy VPN profile (platform-specific settings)
3. Deploy Defender for Endpoint app

### Client Side (MAM)
- App Configuration + App Protection policies
- LOB apps need SDK integration (Intune App SDK + MSAL + Tunnel SDK)

## Troubleshooting

### Data Collection
- **Client logs**: Defender app > Help & feedback > Send Logs > record Incident ID (aka.ms/Powerlift)
- **Server logs**: `journalctl -t ocserv --since -1d > log.txt`
- **Multi-component**: `journalctl --since='-5h' -t mstunnel_monitor -t mstunnel-agent -t ocserv > dump.txt`
- **Debug mode**: Edit `/etc/mstunnel/env.sh`, add `DEBUG_LEVEL=4`, restart with `mst-cli server restart`

### TLS Certificate Issues
- Common error: Only leaf cert provided (missing CA chain)
- Verify: `openssl s_client -showcerts -connect vpn_server:443`
- Online test: https://www.ssllabs.com/ssltest/
- If private CA: Deploy full chain via Trusted Certificate profiles

### Networking
- **Ports**: Inbound 443/TCP + 443/UDP; Outbound 443/TCP + 80/TCP
- **Test connectivity**: `nc -z -v -u <host> 443` (UDP), `nc -z -v <host> 443` (TCP)
- **SSL Inspector**: Must exclude MTG endpoints; breaks connection if inspecting
- **Authenticated proxy**: NOT supported; must exclude MTG endpoints from auth
- **Proxy config**: `/etc/environment` or Docker's `/etc/systemd/system/docker.service.d/http-proxy.conf`

### Load Balancer
- MUST configure Source IP Affinity
- Without it: TLS handshake and DTLS handshake may hit different servers
- Verify with network trace comparing destination IPs

### Network Tracing
```bash
# Physical adapter
tcpdump -i eth0 -w ./eth0-capture.pcap -vv -XX
# Container bridge
tcpdump -i docker0 -w ./docker0-capture.pcap -vv -XX
# VPN tun adapter (find with mst-cli server show users)
mst-cli server capture ma-tun0 ./ma-tun0-capture.pcap
```

### Authentication
- Check sign-in activity (interactive + non-interactive) in MEM portal
- Verify Conditional Access policy configuration
- Confirm device meets compliance requirements

## Key Limitations & Known Issues
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
