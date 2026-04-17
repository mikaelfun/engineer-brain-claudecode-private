---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Linux/How-To/AMA Linux: HT: Fluentbit - Set output to file"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Linux/How-To/AMA%20Linux%3A%20HT%3A%20Fluentbit%20-%20Set%20output%20to%20file"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
[Fluentbit](https://docs.fluentbit.io/manual/) is an open-source telemetry agent for collecting and processing telemetry data used by the Azure Monitor Agent. By default, AMA configures fluentbit to output to mdsd (127.0.0.1:28230). In some troubleshooting scenarios, it may be beneficial to see exactly what fluentbit is sending to mdsd. 

This how-to article will demonstrate how fluentbit can be configured to send output to a text file.

# Prerequisites
- root access to the machine where Azure Monitor Agent (AMA) for Linux is installed
- A DCR associated that instructs the AMA to collect a text log or json log (which will in turn configure Fluentbit)

# Process
## Step 1: Create a backup of current config

```
# Create backup
cp -f /etc/opt/microsoft/azuremonitoragent/config-cache/fluentbit/td-agent.conf /tmp/td-agent.conf
```

![image.png](/.attachments/image-b3d9601a-3e4a-4744-97db-c2275ba9b3ed.png)

## Step 2: Update current config to output to file

```
sed -i '$ a[OUTPUT]\n    Name file\n    Match *\n    Path /tmp/\n    File fluentbit-out-file.log' /etc/opt/microsoft/azuremonitoragent/config-cache/fluentbit/td-agent.conf
```

![image.png](/.attachments/image-74caeca9-708a-4b60-9b33-70ef9bee5fa8.png)

## Step 3: Validate results & get a copy of the log file

```
tail -f /tmp/fluentbit-out-file.log
```

![image.png](/.attachments/image-bd3dd0cf-8be6-4162-954f-56e8a7a7e412.png)

Download a copy of the /tmp/fluentbit-ouit-file.log and upload to DTM.

## Step 4: Restore original config

```
# Restore backup
cp -f /tmp/td-agent.conf /etc/opt/microsoft/azuremonitoragent/config-cache/fluentbit/td-agent.conf
```

![image.png](/.attachments/image-930bb47b-6054-45e7-99ea-13a59b629f8f.png)

## Step 5: Clean-up

```
# Remove temp log file and backup config
rm -f /tmp/fluentbit-out-file.log
rm -f /tmp/td-agent.conf
```

![image.png](/.attachments/image-6365dcd3-c655-4e7c-9493-8aa2e71608bb.png)