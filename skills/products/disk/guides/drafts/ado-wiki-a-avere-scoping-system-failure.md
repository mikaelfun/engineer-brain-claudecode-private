---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Avere - FXT and vFXT/Scoping questions | System Failure"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=/Avere%20-%20FXT%20and%20vFXT/Scoping%20questions%20%7C%20System%20Failure"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Avere vFXT/FXT — Scoping Questions: System Failure

Use these questions when a customer reports a node failure, cluster outage, service crash, or repeated service restarts.

## Initial Scoping Questions

> - Are there any Conditions on the Avere dashboard?
> - If there are no Conditions, do cluster operations appear to have returned to normal (Client Ops, Throughput, Client Latency)?
> - Are there any Alerts on the Avere dashboard reporting a service restart?
> - Are one or more services still restarting?
> - Are there more than one Alert listed for service restarts within the same general timeframe?
> - Does it look like the restarts are repeating on one or more nodes?

## If GSI Uploads Are Available

- Upload a Support Bundle via Remote Commands or have the customer upload a Support Bundle.
  Reference: https://azure.github.io/Avere/legacy/ops_guide/4_7/html/support_overview.html#general-information-upload
- Upload any core filer dumps if present.
  Reference: https://azure.github.io/Avere/legacy/ops_guide/4_7/html/support_overview.html#core-dump-management

## Key Diagnostic Notes

- Repeating service restarts on a single node → likely a node-specific issue; restart services on the affected node
- Conditions cleared but alerts still showing → check if historic alerts are stale; use `averecmd alert.clearAllConditions` with care
- No conditions + normal metrics → cluster may have self-recovered; focus on root-cause analysis via GSI from the failure window
