---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Linux/How-To/AMA Linux: HT: Fluentbit - Review logs (fluentbit.log)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Linux/How-To/AMA%20Linux%3A%20HT%3A%20Fluentbit%20-%20Review%20logs%20%28fluentbit.log%29"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
[Fluentbit](https://docs.fluentbit.io/manual/) is an open-source telemetry agent for collecting and processing telemetry data used by the Azure Monitor Agent. The fluentbit log file is where we can glean clues to help investigations related to fluentbit. This how-to article will cover how to understand the fluentbit log file.

# File location and permissions
The fluentbit.log is located at:
```
/var/opt/microsoft/azuremonitoragent/log/fluentbit.log
```

The fluentbit.log expected permissions are as follows:
```
ls -ltr /var/opt/microsoft/azuremonitoragent/log/fluentbit.log
-rw-r--r--. 1 root root 550325 Apr  8 17:17 /var/opt/microsoft/azuremonitoragent/log/fluentbit.log
```

# Log levels
[AMA Linux: HT: Fluentbit - Set log level (debug, error, warn, info, off)](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1167658/AMA-Linux-HT-Fluentbit-Set-log-level-(debug-error-warn-info-off)) covers how to set different log levels.

# Is fluentbit watching the file?
- Scanning path
```
[2025/03/11 20:59:34] [debug] [input:tail:tail.0] scanning path /var/log/messages
```

- Found file and inode/offset
    - An **inode** in Linux is a data structure that stores metadata about a file or directory, such as its permissions, owner, size, timestamps, and pointers to the data blocks on the disk where the file's content is stored.
    - An **offset** is the fluent-bit "bookmark" or "byte-position" from where it last read this file (the offset is recorded in the fluent-bit database)
```
[2025/03/11 20:59:34] [debug] [input:tail:tail.0] inode=6492 with offset=334910 appended as /var/log/messages
[2025/03/11 20:59:34] [debug] [input:tail:tail.0] scan_glob add(): /var/log/messages, inode 6492
```

The inode for a specific file can be learned by running the ```ls -i``` command, as shown below:
```
[root@vm-rhel87ama-dev-westus2-001 /]# ls -i /var/log/messages
6492 /var/log/messages
```

- Tailing the file to see if there have been any changes
```
[2025/03/11 20:59:34] [debug] [input:tail:tail.0] inode=6492 file=/var/log/messages promote to TAIL_EVENT
[2025/03/11 20:59:34] [ info] [input:tail:tail.0] inotify_fs_add(): inode=6492 watch_fd=1 name=/var/log/messages
```

# Does fluentbit observe changes to the file?
- Observed a change since last offset marker
```
[2025/03/11 20:59:35] [debug] [input:tail:tail.0] inode=6492, /var/log/messages, events: IN_MODIFY
```

You can manually verify that changes are occurring to a file by using the [tail -f](https://man7.org/linux/man-pages/man1/tail.1.html) command to follow the file:

```
tail -f /var/log/messages
```

As new content is written to the file, it will appear on the screen. Press CTRL + C to cancel the follow.

# Does fluentbit flush changes to mdsd?
- Forwarding observed changes to output target
```
[2025/03/11 20:59:35] [debug] [task] created task=0x7f9328072000 id=0 OK
[2025/03/11 20:59:35] [debug] [output:forward:forward.0] task_id=0 assigned to thread #0
[2025/03/11 20:59:35] [debug] [output:forward:forward.0] request 21405 bytes to flush
[2025/03/11 20:59:35] [debug] [upstream] KA connection #66 to 127.0.0.1:28230 is connected
[2025/03/11 20:59:35] [debug] [task] destroy task=0x7f9328072000 (task_id=0)

```

# Known Issues
#94132
#94578
#94976