---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Azure Monitor Agent (AMA) for Linux/How-To/How to 'pretty-print' Data Collection Rule in Linux ssh session"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/Azure%20Monitor%20Agent%20%28AMA%29%20for%20Linux/How-To/How%20to%20%27pretty-print%27%20Data%20Collection%20Rule%20in%20Linux%20ssh%20session"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How to Pretty-Print Data Collection Rule JSON in Linux SSH Session

#Subject
This TSG will describe how to view a formatted JSON document in the SSH terminal of a Linux machine

#A little about Data Collection Rules
Data Collection Rules are found in the folder **/etc/opt/microsoft/azuremonitoragent/config-cache-configchunks**
Data Collection Rules are formatted in JSON and can be difficult to read if displayed using tools like cat.
For instance, here is the contents of a Data Collection Rule when view via the cat commmand.

![image.png](/.attachments/image-c2756361-d932-4c3b-b978-3863ebcf8580.png)

To view this as a JSON formatted document use the following 'python' command instead.

``` json
python3 -m json.tool 17246247579698699560.json
{
    "dataSources": [
        {
            "configuration": {
                "scheduledTransferPeriod": "PT1M",
                "counters": [
                    {
                        "samplingFrequencyInSeconds": 10,
                        "counterSpecifiers": [
                            "Processor(*)\\% Processor Time",
                            "Processor(*)\\% Idle Time",
                            "Processor(*)\\% User Time",
                            "Processor(*)\\% Nice Time",
                            "Processor(*)\\% Privileged Time",
                            "Processor(*)\\% IO Wait Time",
                            "Processor(*)\\% Interrupt Time",
                            "Processor(*)\\% DPC Time",
                            "Memory(*)\\Available MBytes Memory",
                            "Memory(*)\\% Available Memory",
                            "Memory(*)\\Used Memory MBytes",
                            "Memory(*)\\% Used Memory",
                            "Memory(*)\\Pages/sec",
                            "Memory(*)\\Page Reads/sec",
                            "Memory(*)\\Page Writes/sec",
                            "Memory(*)\\Available MBytes Swap",
                            "Memory(*)\\% Available Swap Space",
                            "Memory(*)\\Used MBytes Swap Space",
                            "Memory(*)\\% Used Swap Space",
                            "Logical Disk(*)\\% Free Inodes",
                            "Logical Disk(*)\\% Used Inodes",
                            "Logical Disk(*)\\Free Megabytes",
                            "Logical Disk(*)\\% Free Space",
                            "Logical Disk(*)\\% Used Space",
                            "Logical Disk(*)\\Logical Disk Bytes/sec",
                            "Logical Disk(*)\\Disk Read Bytes/sec",
                            "Logical Disk(*)\\Disk Write Bytes/sec",
                            "Logical Disk(*)\\Disk Transfers/sec",
                            "Logical Disk(*)\\Disk Reads/sec",
                            "Logical Disk(*)\\Disk Writes/sec",
                            "Network(*)\\Total Bytes Transmitted",
                            "Network(*)\\Total Bytes Received",
                            "Network(*)\\Total Bytes",
                            "Network(*)\\Total Packets Transmitted",
                            "Network(*)\\Total Packets Received",
                            "Network(*)\\Total Rx Errors",
                            "Network(*)\\Total Tx Errors",
                            "Network(*)\\Total Collisions"
                        ]
                    }
                ]
            },
            "id": "perfCounterDataSource10",
            "kind": "perfCounter",
            "streams": [
                {
                    "stream": "LINUX_PERF_BLOB",
                    "solution": "LogManagement"
                }
            ],
            "sendToChannels": [
                "ods-ac604a75-54fe-42e7-99bc-e0b23545d3c5"
            ]
        },
        {
            "configuration": {
                "scheduledTransferPeriod": "PT1M",
                "counters": [
                    {
                        "samplingFrequencyInSeconds": 60,
                        "counterSpecifiers": [
                            "\\Process(*)\\% Privileged Time",
                            "\\Process(*)\\% User Time"
                        ]
                    }
                ]
            },
            "id": "perfCounterDataSource60",
            "kind": "perfCounter",
            "streams": [
                {
                    "stream": "LINUX_PERF_BLOB",
                    "solution": "LogManagement"
                }
            ],
            "sendToChannels": [
                "ods-ac604a75-54fe-42e7-99bc-e0b23545d3c5"
            ]
        },
        {
            "configuration": {
                "facilityNames": [
                    "auth",
                    "authpriv",
                    "cron",
                    "daemon",
                    "mark",
                    "kern",
                    "local0",
                    "local1",
                    "local2",
                    "local3",
                    "local4",
                    "local5",
                    "local6",
                    "local7",
                    "lpr",
                    "mail",
                    "news",
                    "syslog",
                    "user",
                    "uucp"
                ],
                "logLevels": [
                    "Debug",
                    "Info",
                    "Notice",
                    "Warning",
                    "Error",
                    "Critical",
                    "Alert",
                    "Emergency"
                ]
            },
            "id": "sysLogsDataSource-1688419672",
            "kind": "syslog",
            "streams": [
                {
                    "stream": "LINUX_SYSLOGS_BLOB",
                    "solution": "LogManagement"
                }
            ],
            "sendToChannels": [
                "ods-ac604a75-54fe-42e7-99bc-e0b23545d3c5"
            ]
        }
    ],
    "channels": [
        {
            "endpoint": "https://ac604a75-54fe-42e7-99bc-e0b23545d3c5.ods.opinsights.azure.com",
            "tokenEndpointUri": "https://linuxlogfilecollectiondce-xa8q.eastus-1.handler.control.monitor.azure.com/subscriptions/c38258ec-3092-4467-b153-75929063fb18/resourceGroups/AzMonArcMachines/providers/Microsoft.HybridCompute/machines/rhel87.home.local/agentConfigurations/dcr-73f4d2c878dd44c5a364bb917c740a62/channels/ods-ac604a75-54fe-42e7-99bc-e0b23545d3c5/issueIngestionToken?operatingLocation=eastus&platform=linux&includeMeConfig=true&api-version=2022-06-02",
            "id": "ods-ac604a75-54fe-42e7-99bc-e0b23545d3c5",
            "protocol": "ods"
        }
    ]
```

