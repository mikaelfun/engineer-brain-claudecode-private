---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Linux/How-To/AMA Linux: HT: Fluentbit - Review config (td-agent.conf)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Linux/How-To/AMA%20Linux%3A%20HT%3A%20Fluentbit%20-%20Review%20config%20%28td-agent.conf%29"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
[Fluentbit](https://docs.fluentbit.io/manual/) is an open-source telemetry agent for collecting and processing telemetry data used by the Azure Monitor Agent. The configuration of fluentbit is defined in a configuration file called td-agent.conf. This how-to article will cover how to understand the fluentbit configuration.

# File location and permissions
The td-agent.conf is located at:
```
/etc/opt/microsoft/azuremonitoragent/config-cache/fluentbit/td-agent.conf
```

The td-agent.conf expected permissions are as follows:
```
ls -ltr /etc/opt/microsoft/azuremonitoragent/config-cache/fluentbit/td-agent.conf
-rw-r--r--. 1 syslog syslog 1834 Mar 26 14:07 /etc/opt/microsoft/azuremonitoragent/config-cache/fluentbit/td-agent.conf
```

# Sample configuration

```
[SERVICE]
    flush                     1
    daemon                    Off
    log_level                 info
    log_file                  /var/opt/microsoft/azuremonitoragent/log/fluentbit.log
    storage.path              /etc/opt/microsoft/azuremonitoragent/config-cache/fluentbit/stg
    storage.sync              normal
    storage.checksum          off
    storage.backlog.mem_limit 50M
    http_server               Off
    parsers_file              /etc/opt/microsoft/azuremonitoragent/config-cache/fluentbit/parsers.conf
[INPUT]
    Name                 tail
    Path                 /var/log/messages
    db                   /etc/opt/microsoft/azuremonitoragent/config-cache/fluentbit/db/c6443697777051972350_27819768146997924650.db
    tag                  c6443697777051972350_2781976814699792465
    multiline.parser     timestamp-format8
    Path_Key             FilePath
    key                  RawData
    Mem_Buf_Limit        512MB
    Buffer_Chunk_Size    1MB
    Buffer_Max_Size      512MB
    Skip_Long_Lines      On
    Skip_Empty_Lines     On
    Refresh_Interval     1
[OUTPUT]
    Name                       forward
    Match                      *
    Host                       127.0.0.1
    Port    28230    Time_as_Integer            true
```

# Is fluentbit configured to tail the file?
*If running 1.33 or earlier, check [known issue 82182](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2009980/AMA-Linux-HT-Fluentbit-Review-config-(td-agent.conf)?anchor=known-issues) below.*

In the ```[INPUT]``` directive, the ```Path``` parameter defines the file(s) that will be tailed. For example:

Specify a single file:
```
[INPUT]
    Name                 tail
    Path                 /var/log/messages
```

Specify a wildcard pattern:
```
[INPUT]
    Name                 tail
    Path                 /tmp/test*.log
```

You can enumerate the files that match a pattern, their offset, and inode value in the same way that that fluentbit does:

```
ls -ltri /tmp/test*.log
```

![image.png](/.attachments/image-22a4f347-304c-4df7-ad1f-8949a0d50318.png)

See [this documentation](https://docs.fluentbit.io/manual/pipeline/inputs/tail) for more details.

# Is fluentbit configured to forward to mdsd?
In the ```[OUTPUT]``` directive, the ```Host``` and ```Port``` parameters defines the destination to output records. For example:

```
[OUTPUT]
    Name       forward
    Match      *
    Host       127.0.0.1
    Port       28230
```

See [this documentation](https://docs.fluentbit.io/manual/pipeline/outputs/forward) for more details.

# Known Issues
#82182