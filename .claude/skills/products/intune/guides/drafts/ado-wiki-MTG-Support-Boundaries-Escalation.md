---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Device Config Certificates Email VPN Wifi/MS Tunnel VPN/Support Boundaries & Escalation Guide"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Config%20Certificates%20Email%20VPN%20Wifi%2FMS%20Tunnel%20VPN%2FSupport%20Boundaries%20%26%20Escalation%20Guide"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Support Boundaries & Escalation Guide

_Applies to: Intune, Microsoft Tunnel, iOS, Android Enterprise_

This guide defines ownership, support scope, and escalation requirements for Microsoft Tunnel Gateway (MTG) cases that may require involvement of the Intune Escalation Team (IET).

## Support Boundaries

### In Scope

#### Client-Side
- **Intune Profile Configuration** — Verification that VPN, Trusted Certificate, App Configuration, and App Protection (MAM) policies are successfully delivered from Intune to the device.
- **Application Management** — Validation of app deployment, assignment targeting, and delivery of per-app VPN or MAM settings.

#### Tunnel Gateway Servers
- **Configuration & Validation** — MTG settings within the Intune Admin Center.
- **Container Health & Runtime** — mstunnel-server and mstunnel-agent containers (startup failures, crashes, lifecycle).
- **Service Reliability & Telemetry** — MTG service malfunctions, failed version upgrades, telemetry sync issues.
- **Custom Settings** — Configuration and delivery of MTG custom values (MTU, timeout values).
- **Certificate Management** — TLS certificate upgrade issues.

#### Authentication Flow
- **Token Exchange** — Troubleshooting token issuance and authentication between client and Microsoft Entra ID.
- **Server Authentication** — MTG agent authentication failures.

### Gray Areas (Best-Effort)

#### Performance Issues (High CPU or Memory Usage)
- Determine whether MTG containers are responsible.
- If MTG is root cause → continue troubleshooting.
- If host OS or third-party agents → customer must investigate.

#### Connectivity Issues (VPN Connects but Resources Are Unreachable)
- Validate connectivity from Tunnel Server to target resource (curl/ping).
- If server cannot reach resource → customer's internal network/routing issue.
- If server can reach but client cannot → MTG troubleshooting continues.

### Out of Scope
- **Sizing**: VPN or infrastructure capacity planning.
- **Host Infrastructure**: Hardware health, hypervisor stability, Podman/Docker installation.
- **Host OS (Linux)**: OS patching, kernel updates, disk management, custom hardening scripts.
- **Network Path**: DNS resolution for Tunnel FQDN, ISP instability, SSL inspection, middleboxes.
- **Internal Routing**: Network path from MTG server to internal resources.

### Handling Out-of-Scope Scenarios
- Set expectations early, assist on best-effort basis.
- Evidence-Based Handoff: provide evidence so customer can take action internally.
- Collaborative Resolution: customer's teams lead remediation, we remain available for guidance.

## Escalating a Case to IET

### Required Escalation Information
- Clear and current issue description summary.
- Business impact (see [Business Impact article](https://supportability.visualstudio.com/Intune/_wiki/wikis/Intune/1521094/Business-Impact)).
- Case scope.
- Current and correlated diagnostic data (logs must be < 7 days old).

### MTG Infrastructure Information
Gather via Assist365 tool or server logs:
- Tunnel Site ID
- Configuration ID
- Server ID(s)

Additional details:
- Proxy configured (client and/or server)? Type (static/PAC)?
- SSL inspection enabled?
- Number of servers deployed.
- Load balancer / Firewall in front (type and affinity).

### Identifying the Right Server
```bash
mst-cli server show user <UserID>
```

### Required Server Files
```bash
sudo cat /etc/mstunnel/env.sh
sudo cat mst-cli diagnose
sudo cat /etc/mstunnel/agent-info.json
sudo cat /etc/mstunnel/ocserv.conf
sudo cat /etc/mstunnel/version-info.json
```

Readiness tool outputs:
```bash
sudo mst-readiness account
sudo mst-readiness utils
sudo mst-readiness network
```

### Collecting Server Logs (UTC)
```bash
# Last 24 hours
journalctl -t mstunnel_monitor -t mstunnel-agent -t ocserv --since "1 day ago" --utc > TunnelLogs.txt

# Specific timestamp
journalctl -t mstunnel_monitor -t mstunnel-agent -t ocserv --since "2026-02-23 00:00:00" --utc > TunnelLogs.txt

# Specific time window
journalctl -t mstunnel_monitor -t mstunnel-agent -t ocserv --since "2026-02-24 13:00:00" --until "2026-02-24 15:00:00" --utc > TunnelLogs.txt
```

Alternative: Collect via Intune Admin Center (see [documentation](https://learn.microsoft.com/en-us/intune/intune-service/protect/microsoft-tunnel-monitor#easy-upload-of-diagnostic-logs-for-tunnel-servers)).

### Device Information
- VPN profile name and ID
- App Configuration name and ID (MAM scenarios)
- App Protection name and ID (MAM scenarios)
- Affected user UPN
- Intune device ID

### Defender Logs
1. Open Microsoft Defender app → Profile icon → Help & feedback → Send logs to Microsoft → Copy Incident ID

### Microsoft Edge Logs (MAM Tunnel scenarios)
1. Open Edge → `edge://flags` → Set `MAM Tunnel Log Level = Enabled Debug`
2. Close and relaunch Edge → Reproduce issue → Export via Help and feedback → diagnostic data

### LOB App Logs (MAM Scenarios)
SDK logging delegate must be added by app developer. See [public document](https://learn.microsoft.com/en-us/mem/intune/developer/tunnel-mam-ios-sdk#logging-on-iosipados-lob-apps).
Remember to ask for MAM-SDK and Tunnel-MAM-SDK versions.

### Target Resource
Always document the resource the user is trying to reach (endpoint name/URL and IP address).

### Network Traces (Optional)
Useful when VPN connects but internal resources are unreachable, or MTG server cannot reach Microsoft endpoints.

### Live Reproduction (Repro) Requirements
1. Start data collection on client and server
2. Reproduce the issue
3. Stop data collection immediately
4. Provide logs for analysis

**Always document the timestamp (day, time, timezone) of reproduction.**

### Contact
- Email: mtgsme@microsoft.com
- Teams: Device Config - Certificates, Email, VPN and Wifi channel
