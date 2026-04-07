---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Common Concepts/Linux Agent Basics"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FCommon%20Concepts%2FLinux%20Agent%20Basics"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Linux Agent Basics — Supportability & Troubleshooting Guide

## Supportability Decision Tree

1. **Is this Distribution and Version on the [Supported List](https://docs.microsoft.com/azure/azure-monitor/platform/log-analytics-agent#supported-linux-operating-systems)?**
2. **Is this CPU Architecture Supported?** Only x86 and x64 are supported.
3. **Is this a hardened system?**
   - **NO** — Proceed with normal troubleshooting:
     - Installation/heartbeat issues → [Troubleshooting OMS Agent Install Issues & Missing Heartbeats](wiki link)
     - Data collection issues → [Troubleshooting OMS Linux Agent - Missing Performance Counters](wiki link)
   - **YES** — Obtain hardening templates from customer and open ICM. PG evaluates case-by-case. **PG will NOT alter agent code for customer hardening — customer must roll back the breaking portion.**
4. **Multi-homing to multiple workspaces?** — **NOT SUPPORTED**, produces unpredictable results. PG has no plans to add this.
5. **Firewall/proxy configured correctly?**

### Required Network Endpoints

| Agent Resource | Port | Direction | Bypass HTTPS Inspection |
|---|---|---|---|
| *.ods.opinsights.azure.com | 443 | Outbound | Yes |
| *.oms.opinsights.azure.com | 443 | Outbound | Yes |
| *.blob.core.windows.net | 443 | Outbound | Yes |
| *.azure-automation.net | 443 | Outbound | Yes |

## Known Issues

- **OpenSSL 1.1.0** only supported on x86_x64 (64-bit). OpenSSL earlier than 1.x not supported on any platform.
- **Proxy without auth**: Linux agent still requires pseudo user/password even if proxy doesn't require authentication.
- **Special characters in proxy password** (e.g., `@`): causes proxy connection error due to incorrect URL parsing. Workaround: URL-encode the password.

## Installation

### Extension Installation (Azure VM)

1. Azure Portal → All services → Log Analytics → select workspace
2. Workspace Data Sources → Virtual machines → select VM → Connect
3. Agent auto-installs. First heartbeat in 10-15 minutes.

### Manual Installation (On-premises)

1. Azure Portal → Log Analytics → workspace → Advanced Settings → Connected Sources → Linux Servers
2. Copy Workspace ID and Primary Key
3. Run:
   ```bash
   wget https://raw.githubusercontent.com/Microsoft/OMS-Agent-for-Linux/master/installer/scripts/onboard_agent.sh && sh onboard_agent.sh -w <WORKSPACE_ID> -s <PRIMARY_KEY>
   ```
   - Azure Government: add `-d opinsights.azure.us`
   - Proxy: add `-p [protocol://][user:password@]proxyhost[:port]`

## Uninstallation / Purge

```bash
# Purge agent
sudo wget https://raw.githubusercontent.com/Microsoft/OMS-Agent-for-Linux/master/installer/scripts/onboard_agent.sh && sh onboard_agent.sh --purge
# Or: sudo sh omsagent-<version>.universal.x64.sh --purge

# Remove remaining packages (CentOS/RHEL/SLES)
sudo rpm -q omsagent omsconfig scx omi
sudo rpm -e omsagent omsconfig scx omi

# Clean directories
rm -rf /var/opt/microsoft/omsagent/ /etc/opt/microsoft/omsagent/ /opt/microsoft/omsagent/
rm -rf /var/opt/microsoft/omsconfig /etc/opt/microsoft/omsconfig /opt/microsoft/omsconfig
rm -rf /var/opt/microsoft/scx /etc/opt/microsoft/scx /opt/microsoft/scx
rm -rf /etc/opt/omi /opt/omi

# Verify no processes remain
ps -ef | grep oms
kill -9 <pid>
```

## Health Verification

```bash
# DSC config check
sudo su omsagent -c 'python /opt/microsoft/omsconfig/Scripts/PerformRequiredConfigurationChecks.py'

# Agent status
sudo /opt/microsoft/omsagent/bin/omsadmin.sh -l

# Package verification (Debian vs RPM)
# Debian: sudo apt-cache depends omsagent omsconfig scx omi
# RPM:    sudo rpm -q omsagent omsconfig scx omi

# Current config exists?
ls /etc/opt/omi/conf/omsconfig/configuration/Current.mof

# Live heartbeat check
tail -f /var/opt/microsoft/omsagent/log/omsagent.log
```

## Cache, Retry, and Buffer Behavior

| Aspect | Detail |
|---|---|
| Retry interval | Starts at 30s, exponential backoff up to 9min max between retries |
| Max retries per chunk | 10 retries before discarding and moving to next chunk |
| Buffer duration | Up to ~8.5 hours before data discarded |
| Default buffer size | 10 MB (configurable in omsagent.conf) |
| On reconnect | Agent uploads buffered data until caught up |
