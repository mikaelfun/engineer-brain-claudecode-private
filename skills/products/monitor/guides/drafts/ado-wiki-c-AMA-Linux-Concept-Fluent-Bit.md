---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/Learning Resources/Concepts/AMA Linux: Concept: Fluent Bit"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAzure%20Monitor%20Agent%20(AMA)%20-%20NEW%20STRUCTURE%2FLearning%20Resources%2FConcepts%2FAMA%20Linux%3A%20Concept%3A%20Fluent%20Bit"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
This concepts document will dive more deeply into fluentbit than is generally included in a troubleshooting guide or how-to document.

# File & Content Requirements
This section will cover different ways by which a file might be created, modified, and log rotated (archived) and how those operations might interact with fluentbit. 

- File Created
    - Supported: Create an empty file
        - ```touch /tmp/test1.log```
    - Supported: Copy or move a file with existing content (should **not** exceed [50MB per minute](https://learn.microsoft.com/en-us/azure/azure-monitor/vm/data-collection-log-text#text-file-requirements-and-best-practices))
        - ```cp /var/log/test1.log /tmp/test1.log```
    - Unsupported: Truncate an existing file
        - ```truncate -s 0 /tmp/test1.log```
- Content Added
    - Supported: Append to the end of the file
        - ```echo " Append content." >> /tmp/test1.log```
    - Unsupported: Truncated to specific offset and then append to the end of the file
        - ```truncate -s 5 /tmp/test1.log && echo " Append after truncate" >> /tmp/test1.log```
    - Unsupported: Overwrite all existing content with new content
        - ```echo "Overwrite content." > /tmp/test1.log```
    - Unsupported: Replace existing content at a specific offset
        - ```sed -i 's/content\./content!/g' /tmp/test1.log```
- Log Rotation
    - Supported: Rename (```rotate {int > 0}```)
    - Supported: Compress (```rotate {int > 0}``` and ```compress```)
    - Supported: Delete (```rotate 0```)
    - Unsupported: Truncate (```copytruncate```)
    - Depends: Custom Actions (```prerotate``` or ```postrotate``` or ```firstaction``` or ```lastaction```)

# Behavior with Truncation
This section will demonstrate how fluentbit handles truncation and how you can demonstrate this in a lab environment. When fluentbit is monitoring a file, it keeps track of the offset. An�**offset**�is the fluent-bit "bookmark" or "byte-position" from where it last read this file (the offset is recorded in the fluent-bit database). If the next offset value is smaller than the previous offset, this is considered truncation (i.e. the file has shrunk in size). Fluentbit will start over from offset 0 and read in all records.

- Step 1: Create the DCR

A text log in this path: ```/tmp/test-text/*.log``` (or you can customize your own path, just update the below code).

- Step 2: Create the first 10 records

```
#!/bin/bash

# Get current date and computer name
DATE=$(date +%Y%m%d)
COMPUTERNAME=$(hostname)

# Create directory if it doesn't exist
mkdir -p /tmp/test-text

# Set log file path
LOGFILE="/tmp/test-text/${DATE}_${COMPUTERNAME}.log"

# Write 10 log entries
for i in {1..10}; do
    echo "$(date +'%Y%m%d %H:%M:%S') - test log entry $i" >> "$LOGFILE"
done
```

- Step 3: Verify the 10 records were created locally and arrive in the Log Analytics Workspace destination

```
[root@vm-rhel87ama-dev-westus2-001 test-text]# cat 20250512_vm-rhel87ama-dev-westus2-001.log
20250512 20:44:51 - test log entry 1
20250512 20:44:51 - test log entry 2
20250512 20:44:51 - test log entry 3
20250512 20:44:51 - test log entry 4
20250512 20:44:51 - test log entry 5
20250512 20:44:51 - test log entry 6
20250512 20:44:51 - test log entry 7
20250512 20:44:51 - test log entry 8
20250512 20:44:51 - test log entry 9
20250512 20:44:51 - test log entry 10
```

![image.png](/.attachments/image-2fc40e49-c155-432a-9188-c6fa777ce128.png)

- Step 4: Truncate the last 5 events and write 5 new events

```
#!/bin/bash

# Set log file path
LOGFILE="/tmp/test-text/20250512_$(hostname).log"

# Truncate file to first 5 lines (in place)
sed -i '6,$d' "$LOGFILE"

# Append new log entries 11 through 15
for i in {11..15}; do
    echo "$(date +'%Y%m%d %H:%M:%S') - test log entry $i" >> "$LOGFILE"
done
```

- Step 4: Verify the 5 records were removed locally and 5 new added

```
[root@vm-rhel87ama-dev-westus2-001 test-text]# cat 20250512_vm-rhel87ama-dev-westus2-001.log
20250512 20:44:51 - test log entry 1
20250512 20:44:51 - test log entry 2
20250512 20:44:51 - test log entry 3
20250512 20:44:51 - test log entry 4
20250512 20:44:51 - test log entry 5
20250512 20:50:22 - test log entry 11
20250512 20:50:22 - test log entry 12
20250512 20:50:22 - test log entry 13
20250512 20:50:22 - test log entry 14
20250512 20:50:22 - test log entry 15
```

- Step 5: Verify that we again collected records 1-5 in Log Analytics Workspace and 11-15

![image.png](/.attachments/image-0b7e1b2d-ebb6-4321-ab13-ae22eb106be9.png)