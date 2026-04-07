---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Linux/How-To/AMA Linux: HT: Fluentbit - Set log level (debug, error, warn, info, off)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Linux/How-To/AMA%20Linux%3A%20HT%3A%20Fluentbit%20-%20Set%20log%20level%20%28debug%2C%20error%2C%20warn%2C%20info%2C%20off%29"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
[Fluentbit](https://docs.fluentbit.io/manual/) is an open-source telemetry agent for collecting and processing telemetry data used by the Azure Monitor Agent. By default, only **info|warning|error** level events are recorded in the log. When troubleshooting [text log](https://learn.microsoft.com/azure/azure-monitor/agents/data-collection-text-log?tabs=portal) (formerly called custom logs) or [json log](https://learn.microsoft.com/en-us/azure/azure-monitor/agents/data-collection-log-json) data collection it may be useful to enable extended logging.

# Prerequisites
- root access to the machine where Azure Monitor Agent (AMA) for Linux is installed
- A DCR associated that instructs the AMA to collect a text log or json log (which will in turn configure Fluentbit)

# Process
## Step 1: Get the current state of fluentbit before making changes
Run the following command to output the fluentbit agent configuration using the [cat](https://man7.org/linux/man-pages/man1/cat.1p.html) utility:
```
cat /etc/opt/microsoft/azuremonitoragent/config-cache/fluentbit/td-agent.conf
```

The result should be similar to:
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

![image.png](/.attachments/image-a120ddd6-b8a4-41cc-8bfe-506ebebb0280.png)

Take note of the following:
- [SERVICE] block: **log_level** value. Acceptable values include (info|warning|error|debug).
- [SERVICE] block: **log_file** value. This is the path to the log file we'll want to review later.
- [INPUT]block(s): These blocks represent the data sources that fluentbit is monitoring. There may be multiple [INPUT] blocks representing different data sources. Use the **Path** value to determine which is relevant for your scenario.
- [INPUT] block: **tag** value. When fluentbit logs data related to specific data sources, it utilizes the tag value in the log. You should take note of the tag value for the data source relevant to your scenario.
- [OUTPUT] block: This block defines the destination for data that fluentbit acquires. For Azure Monitor Agent, we use 127.0.0.1:28230, which we expect the mdsd process to be listening on.

## Step 2: Set the log_level to debug
Run the following command to edit the agent configuration from info to debug using the [sed](https://man7.org/linux/man-pages/man1/sed.1p.html) utility:
```
sed -i 's/log_level\s\+info/log_level    debug/' /etc/opt/microsoft/azuremonitoragent/config-cache/fluentbit/td-agent.conf
```

![image.png](/.attachments/image-6bf35579-8733-4fb7-ad91-aa7b2da9762b.png)

Alternatively, you can utilize a text editor, such as [vi](https://man7.org/linux/man-pages/man1/vi.1p.html) to modify the log_level value.

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Note:** 
A restart of the agent is not required. Fluentbit will detect changes to it's configuration and automatically restarts.
</div>

## Step 3: Review the fluentbit log to verify debug events are being logged
Verify that fluentbit is logging [debug] level events.

Run the following command to output the most recent events in the fluentbit log using the [tail](https://www.man7.org/linux/man-pages/man1/tail.1p.html) utility:
```
tail -f /var/opt/microsoft/azuremonitoragent/log/fluentbit.log
```

![image.png](/.attachments/image-adec8b6f-a639-47d3-97db-69e8adfbccec.png)

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Note:** 
The above command uses the default log path for fluentbit. If that has been changed, you can check the td-agent.conf to see the log_file value in the [SERVICE] block.
</div>

## Step 4: Collect logs
If relevant for your scenario, collect AMA logs using the [AMA Troubleshooter for Linux](https://learn.microsoft.com/azure/azure-monitor/agents/troubleshooter-ama-linux?tabs=redhat%2CGenerateLogs)

## Step 5: Set the log_level to info
Run the following command to edit the agent configuration from debug to info using the [sed](https://man7.org/linux/man-pages/man1/sed.1p.html) utility:
```
sed -i 's/log_level\s\+debug/log_level    info/' /etc/opt/microsoft/azuremonitoragent/config-cache/fluentbit/td-agent.conf
```

![image.png](/.attachments/image-d2e3f6d9-e185-4e98-96f0-2ebcf7f5b965.png)

Alternatively, you can utilize a text editor, such as [vi](https://man7.org/linux/man-pages/man1/vi.1p.html) to modify the log_level value.

# Common Issues
## ERROR: Too many open files

***This error ONLY appears in the log when you have debug logging enabled (not info). This is true for both fluent-bit versions in supported versions (1.3.11 and 1.9.6).***

```/opt/microsoft/azuremonitoragent/bin/fluent-bit --version```

![image.png](/.attachments/image-4bb32610-62f2-41f4-88df-97fb70506edb.png)

![image.png](/.attachments/image-4c70519a-6d31-47b5-a52d-7f4c410047cf.png)

```cat /var/opt/microsoft/azuremonitoragent/log/fluentbit.log | grep "Too many"```

![image.png](/.attachments/image-8537366c-eac0-454d-abfe-da65e93ddffb.png)

```
[2023/12/21 21:52:42] [error] [build.x86_64/plugins/in_tail/CMakeFiles/flb-plugin-in_tail.dir/compiler_depend.ts:888 errno=24] Too many open files
```

Fluent-bit is running in the root user context. You can run the following as root to see the current number of open files by the root user:

```lsof -u root | wc -l```

![image.png](/.attachments/image-e81d4ebd-86c0-4b0e-9820-9039f9d5e499.png)

You can run the following as root to see the current limits:

```ulimit -Sn```

![image.png](/.attachments/image-ae4bfb06-8e45-4bf1-b561-e109cf748d41.png)

Limits can be changed, but customers should do this **at their own risk**:

```vi /etc/security/limits.conf```

Add the following line and then **restart the system** (replace 10000 with desired limit):

```root soft nofile 10000```

![image.png](/.attachments/image-613df97e-9b0c-4ab0-bd96-68715e326617.png)

The limits on the PID would also need to be changed, but this would only apply until the PID is destroyed (that is Fluentbit is restarted):

```
prlimit -p $(pidof fluent-bit)
prlimit -p $(pidof fluent-bit) --nofile=10000:262144
prlimit -p $(pidof fluent-bit)
```
![image.png](/.attachments/image-236daad2-e844-4ee3-8dbc-c616e6878c2d.png)

```lsof -p $(pidof fluent-bit) | wc -l```

![image.png](/.attachments/image-b905915c-9921-4817-9fd9-1359ed2633d9.png)

# Going Deeper
## How does Fluent Bit become aware of changes to a monitored file?
Fluent Bit uses "watcher" APIs from the operating system to become aware of changes made to monitored files (that is it's a triggered event, not a refresh interval event).

On Linux, the [inotify API](https://www.man7.org/linux/man-pages/man7/inotify.7.html) is used by default. This can be changed in the Fluent Bit tail plugin by setting the [Inotify_Watcher](https://docs.fluentbit.io/manual/pipeline/inputs/tail#config) to false. If this is set to false, the [stat](https://github.com/fluent/fluent-bit/blob/master/plugins/in_tail/tail_fs_stat.c) will be used.

On Windows, the [.NET FileSystemWatcher API](https://learn.microsoft.com/dotnet/api/system.io.filesystemwatcher?view=net-8.0) is used.

This should not be confused with the Refresh_Interval setting that we add to the Fluent Bit tail plugin configuration by default set to "1". That value indicates how often (in seconds) we check to see if new files exist that match the pattern we're looking for.

## How can I confirm fluentbit is tracking changes to my file?
[AMA Linux: HT: Fluentbit - Demonstrate file change tracking](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1345312/AMA-Linux-HT-Fluentbit-Demonstrate-file-change-tracking)