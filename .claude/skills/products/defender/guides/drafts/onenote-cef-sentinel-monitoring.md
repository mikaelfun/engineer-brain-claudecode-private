# CEF-Based Security Monitoring in Sentinel

## Overview
CEF (Common Event Format) logs are specially formatted Syslog messages used by network devices (F5, Cisco, Palo Alto) and security products (Check Point, Trend Micro) to send security events. In Sentinel, these logs are stored in the `CommonSecurityLog` table.

## Architecture
Security devices -> CEF format -> Log Forwarder VM (Azure VM/Arc VM) -> AMA agent -> Customer Workspace (CommonSecurityLog)

## Setup Steps (AMA Connector)
1. Configure DCR rules via AMA connector - set Facility and log level matching the CEF data source syslog profile. Add log forwarder VM/Arc VM to DCR resources.
2. Deploy AMA agent to the log forwarder VM.
3. Run Forwarder_AMA_installer.py on the log forwarder VM to open port 514 TCP/UDP:
   ```bash
   sudo wget -O Forwarder_AMA_installer.py https://raw.githubusercontent.com/Azure/Azure-Sentinel/master/DataConnectors/Syslog/Forwarder_AMA_installer.py && sudo python Forwarder_AMA_installer.py
   ```
4. Configure syslog profile on the network/security device, pointing to the log forwarder VM IP on port 514.

## AMA CEF Connector Requirements
- `ProcessName` must equal `CEF`
- `SyslogMessage` must match CEF log format

## Troubleshooting
1. **AMA + OMS coexistence**: CEF logs are NOT collected when both agents exist. Remove OMS agent first.
2. **Check port**: `netstat -an | grep 514`
3. **Run diagnostic script**:
   ```bash
   sudo wget -O cef_AMA_troubleshoot.py https://raw.githubusercontent.com/Azure/Azure-Sentinel/master/DataConnectors/CEF/cef_AMA_troubleshoot.py && sudo python cef_AMA_troubleshoot.py
   ```
4. **Check firewall**: `firewall-cmd --state`, then `firewall-cmd --list-all-zones`. Add port if needed: `firewall-cmd --add-port=514/udp`
5. **Verify syslog reception**: `sudo tcpdump -ni any port 514 -vv`
6. **Send test CEF log**:
   ```bash
   logger -p local4.warn -P 514 -n <log_forwarder_IP> -t CEF: "0|Mock-Test|MOCK|common=event-format-test|end|TRAFFIC|1|..."
   ```
7. **ProcessName not parsed correctly**: Create rsyslog conf to reformat syslog with CEF as ProcessName (see known-issue defender-onenote-015).

## Mooncake Supported Solutions
CEF-based monitoring in Mooncake supports multiple security solutions. Custom rules can be created for devices without built-in solutions.

## Source
OneNote: MCVKB/VM+SCIM/10.12 CEF based security monitor in sentinel
