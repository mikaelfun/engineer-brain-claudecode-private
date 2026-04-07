---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Containers/Defender for cloud admission controller/[TSG] Phoenix OCI - Message processing takes too long"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/Workload%20Protections/Defender%20for%20Containers/Defender%20for%20cloud%20admission%20controller/%5BTSG%5D%20Phoenix%20OCI%20-%20Message%20processing%20takes%20too%20long"
importDate: "2026-04-06"
type: troubleshooting-guide
---

See general summary about the OciArtifactPublisher component in the [No successful message processing TSG](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud/10988/-TSG-Phoenix-OCI-No-successful-message-processing).

**Monitor meaning**

The monitor is triggered when metrics measuring message processing time (P50/P95) raise above certain threshold.

**Investigation steps**

The goal is understanding the reasons for the slow message processing.

1. Check the CPU load, Deployed pod count and Message processing time graphs in the [Grafana dashboard](https://detection-grafana-ggfde9ehfuc6enb0.eus.grafana.azure.com/d/ceh0q7ofq1wcga/ociartifact-components). Are any changes noticable?

2. Query Kusto to identify operations that take noticably long times, that can give a hint for the long times:
```kql
cluster('mdcprd.centralus.kusto.windows.net').database('Detection').Span
| where (k8s_pod_name startswith "ociartifactpublisher") and TIMESTAMP > ago(1hr)
| summarize P50 = percentile(durationMs, 50), P95 = percentile(durationMs, 95) by name
| order by P50
```

Contact Vasili Galka for further assistance.
