---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Archive/Data Ingestion - Connectors/Deprecated/CEF & Syslog Step by Step Troubleshooter"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=%2FArchive%2FData%20Ingestion%20-%20Connectors%2FDeprecated%2FCEF%20%26%20Syslog%20Step%20by%20Step%20Troubleshooter"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# CEF & Syslog Step by Step Troubleshooter (Deprecated OMS Agent)

> **This page is mostly for the old and deprecated OMS agent, use at your own risk**

## Prerequisites

### Azure VM as Syslog Collector
- Disable Azure Security Center auto-provisioning of MMA/OMS agent during setup
- VM must not be connected to existing workspace before deploying CEF connector script
- Sentinel workspace must have SecurityInsights solution installed
- Minimum VM size: 4 vCPUs, 8 GB memory (allows 8500 EPS)

### Installation
```bash
sudo wget -O cef_installer.py https://raw.githubusercontent.com/Azure/Azure-Sentinel/master/DataConnectors/CEF/cef_installer.py && sudo python cef_installer.py <WorkspaceId> <Primary Key>
```

## OS Configuration Troubleshooting

### Check Network Connectivity
1. Verify NSG allows inbound TCP/UDP 514 from log sender
2. Capture arriving packets: `tcpdump -Ani any port 514 and host <sender_ip> -vv`
3. Check for rejected packets: `watch -n 2 -d iptables -nvL`

### SELinux Blocking Connections
- Check: `sestatus`
- If enforced: `setenforce 0` (temporary) or edit `/etc/selinux/config` → `SELINUX=permissive` (permanent)

### Firewall Blocking Ports 25226/25224
```bash
sudo firewall-cmd --direct --add-rule ipv4 filter INPUT 0 -p tcp --dport 25226 -j ACCEPT
sudo firewall-cmd --direct --add-rule ipv4 filter INPUT 0 -p udp --dport 25224 -j ACCEPT
sudo firewall-cmd --direct --add-rule ipv4 filter INPUT 0 -p tcp --dport 25224 -j ACCEPT
sudo firewall-cmd --reload
```

### Check Rsyslog Listening
```bash
netstat -anp | grep syslog
# Should see established connection on TCP 25226 for CEF/ASA
```

## OMS Agent / Azure Issues

### Verify Agent Connectivity
```kql
Heartbeat
| where Computer contains "<computername>"
| sort by TimeGenerated desc
```

### Syslog Not Showing in Kusto
- Check `/etc/rsyslog.d/95-omsagent.conf` for required facility entries
- If missing, add facilities in LA Workspace Agent Configuration → Syslog
- Force update: `sudo su omsagent -c 'python /opt/microsoft/omsconfig/Scripts/PerformRequiredConfigurationChecks.py'`

### CEF Logs Showing as Syslog (not CommonSecurityLog)
- **Root cause**: Missing hostname in ASA log header
- **Validate**: Use regex101.com with CEF regex pattern
- **Fix**: Enable hostname logging on ASA device
- Good format: `<166>Jun 06 2023 17:39:40 HOSTNAMEHERE : %ASA-6-302013: Built inbound TCP...`

### Double Ingestion (Syslog + CEF on same facility)
```bash
cd /etc/rsyslog.d
mv security-config-omsagent.conf 94-security-config-omsagent.conf
# Edit and add '& stop' after CEF filter:
# if $rawmsg contains "CEF:" or $rawmsg contains "ASA-" then @@127.0.0.1:25226
# & stop
systemctl restart rsyslog
```

### Corrupt OMS Agent Installation
Symptoms: missing files, empty files, ruby not listening on 25224/25226
```bash
cd /var/log && mkdir SentinelAgent && cd SentinelAgent
wget https://raw.githubusercontent.com/Microsoft/OMS-Agent-for-Linux/master/installer/scripts/onboard_agent.sh
chmod 777 onboard_agent.sh
sudo sh onboard_agent.sh --purge
# Clean up old scripts, then reinstall from Connector Page
```

### Disk Space Full from Local Logging
- Check: `df -ah` and `du -mh /var/log/`
- Fix: Disable local logging by commenting out syslog line in `/etc/rsyslog.conf` or `/etc/rsyslog.d/50-default.conf`:
  ```
  # *.*;auth,authpriv.none -/var/log/syslog
  ```
- Reduce log rotation: change `rotate` value and frequency in `/etc/logrotate.d/rsyslog`

### Missing Data / Incorrect Timestamps (e.g., Cisco Meraki)
```bash
wget -O TimeGenerated.py https://raw.githubusercontent.com/Azure/Azure-Sentinel/master/DataConnectors/CEF/TimeGenerated.py && python TimeGenerated.py {ws_id}
```

## Rsyslog Required Config Files

### security_events.conf
- Listens on port 25226 (TCP) at 127.0.0.1
- Uses CEF/ASA regex pattern for parsing

### security-config-omsagent.conf
```
if $rawmsg contains "CEF:" or $rawmsg contains "ASA-" then @@127.0.0.1:25226
```

### 95-omsagent.conf
- Auto-populated from LA Workspace Agent Configuration
- Contains facility forwarding rules to 127.0.0.1:25224

## Validation Queries
```kql
CommonSecurityLog | sort by TimeGenerated desc
Syslog | sort by TimeGenerated desc
-- Mock test logs:
CommonSecurityLog | where DeviceVendor == "TestCommonEventFormat" | sort by TimeGenerated desc
```

## RFC Compliance
- RFC 5424: Use regex pattern for validation at regex101.com
- RFC 3164: Use corresponding regex pattern for older format

## Syslog Filtering (Not Supported by Microsoft)
Create file with lower number than 95-omsagent.conf:
```
if $rawmsg contains "whatever_here" then /dev/null
& stop
```
