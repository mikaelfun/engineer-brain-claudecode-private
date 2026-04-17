---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Linux/How-To/AMA Linux: HT: Update the syslog daemon config (Syslog-ng)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Linux/How-To/AMA%20Linux%3A%20HT%3A%20Update%20the%20syslog%20daemon%20config%20%28Syslog-ng%29"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
This article will demonstrate how to configure Syslog-ng for different scenarios related to troubleshooting.

# Scenario: Test writing to disk
This scenario will demonstrate how to configure Syslog-ng to write a syslog message of a given facility and severity to a log file for the purposes of testing and validating Syslog-ng is able to receive and process a syslog message.

- Identify the correct source

Start by asking the customer if they know the name (aka object id) of the Syslog-ng [source](https://syslog-ng.github.io/admin-guide/060_Sources/README) object (common examples include **s_sys** or **s_src**) as defined in the Syslog-ng config.

If the customer does not know this, you have a few options:
1. You can [collect troubleshooter logs](https://learn.microsoft.com/en-us/azure/azure-monitor/agents/troubleshooter-ama-linux?tabs=redhat%2CGenerateLogs#run-the-troubleshooter) and review the Syslog-ng configuration with a SME.
2. You can review [AMA Linux: Concepts: Syslog Daemon (Syslog-ng) - Overview](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1842822/AMA-Linux-Concepts-Syslog-Daemon-(Syslog-ng)) to understand how to interpret the Syslog-ng configurations.
3. You can review [Sources](https://syslog-ng.github.io/admin-guide/060_Sources/README) to understand how to interpret the Syslog-ng configurations.

- Create config

CAUTION: This can consume disk space quickly if you don�t setup the repro quickly and remove the config when done
CAUTION: Restarting the syslog daemon can result in data loss of UDP-based syslog messages

```
# Update these variables to match the scenario
temp_source="s_sys"
temp_facility="local7"
temp_severity="notice"

# Create the test configuration
sudo echo -e "# This was created on $(date) for testing purposes\n# This file should be removed once testing is complete\n\nfilter f_MSSyslogTest {\n\tfacility($temp_facility) and level($temp_severity);\n};\n\ndestination d_MSSyslogTest {\n\tfile(\"/var/log/MSSyslogTest.log\");\n};\n\nlog {\n\tsource($temp_source);\n\tfilter(f_MSSyslogTest);\n\tdestination(d_MSSyslogTest);\n};" > /etc/syslog-ng/conf.d/MSSyslogTest.conf

# Output config
cat /etc/syslog-ng/conf.d/MSSyslogTest.conf

# Reload the syslog daemon
systemctl reload syslog-ng
```

- Test config

[AMA Linux: HT: Syslog - Simulate Syslog Message](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1246725/AMA-Linux-HT-Syslog-Simulate-Syslog-Message)

- Validate daemon functionality

Use the following commands to read the text file where test messages should arrive:

```
cat /var/log/MSSyslogTest.log
```

![image.png](/.attachments/image-0734e25f-9009-433c-9276-a4904c582658.png)


- Remove config

Use the following commands to remove the testing config and reload the syslog daemon:

```
# Remove the testing config
rm -rf /etc/syslog-ng/conf.d/MSSyslogTest.conf

# Reload the syslog daemon
systemctl reload syslog-ng

# Remove the testing log file
rm -rf /var/log/MSSyslogTest.log
```

