---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Next-Gen - Defender for Cloud/Investigation & Response/Hunting/Advanced Hunting/[TSG] - MDC Advanced Hunting Tables"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FNext-Gen%20-%20Defender%20for%20Cloud%2FInvestigation%20%26%20Response%2FHunting%2FAdvanced%20Hunting%2F%5BTSG%5D%20-%20MDC%20Advanced%20Hunting%20Tables"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# TSG - MDC Advanced Hunting Tables

## Required Kusto Access
| Cluster Path | Database | Permissions |
|--|--|--|
| https://teamx-prod-use.eastus.kusto.windows.net | InvestigationData | TBD |
| https://teamx-prod-usc.centralus.kusto.windows.net | MDCGlobalData | TBD |
| https://teamx-prod-weu.westeurope.kusto.windows.net | InvestigationData | TBD |

## Overview
Microsoft Defender for Cloud (MDC) is now a workload in Microsoft Defender XDR. MDC customers are not part of the E5 bundle but can purchase licenses (enable MDC) inside Azure portal. Unlike MTP, MDC works on Azure subscription / AWS account / GCP project level, not tenant level.

## MDC Advanced Hunting Tables

### CloudAuditEvents (Preview)
Contains control plane events from cloud resources:
- **ARM events** - operations on cloud resources (create VM, add permissions, etc.)
- **AKS events** - Kubernetes API server operations
- **Arc enabled Kubernetes events** - same as AKS but via agent
- **EKS events** - from AWS CloudWatch via MDC AWS connector
- **GKE events** - from GCP Logging via MDC GCP connector

#### Data Coverage
Each data type maps to an MDC bundle:
- ARM events -> ARM bundle
- AKS/Arc/EKS/GKE events -> Containers bundle (on respective cloud connectors)

**Key**: If customer has Containers bundle on subscription X but not Y, they only get events for clusters in subscription X.

#### Troubleshooting - Data Arriving Check
```kql
CloudAuditEvents
| union cluster('teamx-prod-weu.westeurope').database('InvestigationData').CloudAuditEvents
| where ingestion_time() > ago(1h)
| where TenantId == "<customer-tenant-id>"
| summarize count() by DataSource
```

#### MDC Bundle Enablement Check
```kql
GetCurrentEnvironments()
| where TenantId == "<customer-tenant-id>"
| project HierarchyId, TenantId, Plans
```

#### Known Limitation
Unable to select cloud resource entity as affected entity when creating custom detection alerts. Workaround: use User or SPN affected entity instead.

### CloudProcessEvents (Preview)
Process events from cloud workloads. (Documentation and troubleshooting TBD)

### CloudStorageAggregatedEvents (Private Preview)
Aggregated and enriched logs for cloud storage accounts. Requires **Defender for Storage per storage account plan** enabled on subscription level. Logs auto-appear in Advanced Hunting once enabled.

#### Data Usage (All Tables)
Available on all MTP Advanced Hunting platforms:
- Advanced Hunting queries
- Custom detections
- Streaming detections
- Streaming exports
- Correlation engine detections

## References
- [What is Microsoft Defender XDR](https://learn.microsoft.com/en-us/defender-xdr/microsoft-365-defender)
- [Advanced Hunting overview](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-overview)
- [MDC in Defender portal](https://learn.microsoft.com/defender-xdr/microsoft-365-security-center-defender-cloud)
- [CloudAuditEvents table](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-cloudauditevents-table)
- [CloudProcessEvents table](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-cloudprocessevents-table)
