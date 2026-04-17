---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Linux/How-To/AMA Linux: HT: Update the syslog daemon config (Rsyslog)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Linux/How-To/AMA%20Linux%3A%20HT%3A%20Update%20the%20syslog%20daemon%20config%20%28Rsyslog%29"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
This article will demonstrate how to configure Rsyslog for different scenarios related to troubleshooting.

# Scenario: Test writing to disk
This scenario will demonstrate how to configure Rsyslog to write a syslog message of a given facility and severity to a log file for the purposes of testing and validating Rsyslog is able to receive and process a syslog message.  

- Create config
      
CAUTION: This can consume disk space quickly if you don�t setup the repro quickly and remove the config when done
CAUTION: Restarting the syslog daemon can result in data loss of UDP-based syslog messages

```
# Update this variable to match the correct source
temp_facility="local7"
temp_severity="notice"

sudo echo -e "# This was created on $(date) for testing purposes\n# This file should be removed once testing is complete\n$temp_facility.$temp_severity /var/log/MSSyslogTest.log" > /etc/rsyslog.d/MSSyslogTest.conf
sudo systemctl restart rsyslog
```

- Test config

[AMA Linux: HT: Syslog - Simulate Syslog Message](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1246725/AMA-Linux-HT-Syslog-Simulate-Syslog-Message)

- Validate daemon functionality

Use the following commands to read the text file where test messages should arrive:

```
cat /var/log/MSSyslogTest.log
```

- Remove config

Use the following commands to remove the testing config and reload the syslog daemon:

```
# Remove the testing config
rm -f /etc/rsyslog.d/MSSyslogTest.conf

# Reload the syslog daemon
sudo systemctl restart rsyslog

# Remove the testing log file
rm -f /var/log/MSSyslogTest.log
```

# Known Issues
Pending a known issue from Fayez related to the firewalld service redirecting incoming 514 to a different port && another possible known issue where a load balancer was causing issues.