---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/Troubleshooting Guides (TSGs)/Scan/Self-Hosted IR in K8s/How to collect logs from SHIR in K8s"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FScan%2FSelf-Hosted%20IR%20in%20K8s%2FHow%20to%20collect%20logs%20from%20SHIR%20in%20K8s"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Changing Log Level
If you wish to change log level for troubleshooting complex issue such as scan perf issue, please refer to TSG "How to change log level for K8s SHIR" and update log level to "Trace" before collecting logs.

# Command for SHIR log uploading
Unlike SHIR in Windows which logs by a single button click, please run the command `./irctl log upload` to upload SHIR logs in K8s. Copy the log upload id for further troubleshooting purpose.

# Kusto table for SHIR log in K8s
Unlike SHIR in Windows which logs are stored in TraceGatewayLocalEventLog, please leverage the following tables for logs in K8s:

```kql
TaskHostingEvent
| where LogUploadId has "<log-upload-id>"

OperatorOps
| where LogUploadId has "<log-upload-id>"

ComputeDefaultLogEvent
| where LogUploadId has "<log-upload-id>"
```
