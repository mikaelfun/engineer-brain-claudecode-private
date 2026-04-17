# CEF Log Collection Troubleshooting Guide (Sentinel / Log Analytics)

> Source: MCVKB/wiki_migration/======VM&SCIM======/10.12 CEF based security monitor in sentinel.md

## Overview

CEF (Common Event Format) logs are specially formatted Syslog messages used by network devices (F5, Cisco, Palo Alto) and security products (Check Point, Trend Micro). They are stored in the `CommonSecurityLog` table in Log Analytics workspace.

## Architecture

```
Security Device --> [CEF Syslog] --> Log Forwarder VM (514 TCP/UDP) --> AMA Agent --> Log Analytics / Sentinel
```

## Setup Steps

### 1. Configure DCR via AMA Connector
- Set Facility and Log Level matching the CEF data source Syslog profile
- Add the log forwarder VM (Azure VM or Arc VM) to DCR resources

### 2. Run Forwarder Installer on Log Forwarder VM
```bash
sudo wget -O Forwarder_AMA_installer.py https://raw.githubusercontent.com/Azure/Azure-Sentinel/master/DataConnectors/Syslog/Forwarder_AMA_installer.py && sudo python Forwarder_AMA_installer.py
```
This opens port 514 TCP/UDP on the forwarder VM.

### 3. Configure Security Device Syslog Profile
Set the Syslog server to the forwarder VM IP, port 514, protocol UDP (recommended).

## Troubleshooting Checklist

### 1. Remove OMS Agent if Co-existing with AMA
CEF log collection **does not work** when both AMA and OMS agent are present on the same VM. Remove OMS agent first.

### 2. Verify Port 514 is Open
```bash
netstat -an | grep 514
```

### 3. Run CEF Troubleshooting Script
```bash
sudo wget -O cef_AMA_troubleshoot.py https://raw.githubusercontent.com/Azure/Azure-Sentinel/master/DataConnectors/CEF/cef_AMA_troubleshoot.py && sudo python cef_AMA_troubleshoot.py
```

### 4. Check Firewall on Arc VM
```bash
firewall-cmd --state
firewall-cmd --list-all-zones
# If 514 UDP not listed:
firewall-cmd --add-port=514/udp
```

### 5. Verify Syslog Reception
```bash
sudo tcpdump -ni any port 514 -vv
```

### 6. Send Test CEF Log
```bash
logger -p local4.warn -P 514 -n <log_forwarder_IP> -t CEF: "0|Mock-Test|MOCK|common=event-format-test|end|TRAFFIC|1|rt=$common=event-formatted-receive_time deviceExternalId=0002D01655 src=1.1.1.1 dst=2.2.2.2"
```

### 7. Check ProcessName Parsing
AMA CEF connector requires:
- `ProcessName` = `CEF`
- `SyslogMessage` matches CEF log format

If ProcessName is not correctly parsed (e.g., for Palo Alto), create custom rsyslog config:

**File:** `/etc/rsyslog.d/paloalto.conf`
```
template(name="cefmsg" type="string" string="<%PRI%> %timegenerated% %HOSTNAME% CEF %msg:5:$%\n")
if ($rawmsg contains 'CEF:') and ($rawmsg contains 'Palo Alto Networks') then action(type="omfwd"
 Target="127.0.0.1"
 Port="514"
 Protocol="udp"
 Template="cefmsg"
)
& stop
```

This rewrites Syslog with ProcessName=CEF and strips the original CEF: prefix from the message.

### 8. Cross-check with Syslog Table
Create a separate DCR to collect raw Syslog and inspect SyslogMessage content to understand parsing issues.

## Mooncake Support
Currently supported solutions in Mooncake Sentinel include select network/security device connectors. For unsupported devices, use custom analytics rules.

## References
- CEF format spec: https://www.microfocus.com/documentation/arcsight/arcsight-smartconnectors-8.4/pdfdoc/cef-implementation-standard/cef-implementation-standard.pdf
- rsyslog omfwd docs: https://rsyslog.readthedocs.io/en/latest/configuration/modules/omfwd.html
