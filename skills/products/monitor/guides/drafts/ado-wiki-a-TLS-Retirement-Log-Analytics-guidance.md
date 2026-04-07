---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Retirements/Older TLS Versions 1.0,1.1 Retirement - Log-Analytics - Azure-Monitor-logs-guidance"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Log%20Analytics/Retirements/Older%20TLS%20Versions%201.0%2C1.1%20Retirement%20-%20Log-Analytics%20-%20Azure-Monitor-logs-guidance"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# TLS 1.0/1.1 Retirement - Log Analytics / Azure Monitor Logs Guidance

## Overview

As part of Azure-wide legacy TLS retirement, TLS 1.0/1.1 protocol retirement plan for Azure Monitor Logs:

- **Query API**: TLS 1.2+ enforcement started July 1, 2025 (few weeks to reach all regions)
- **Sending logs (ingestion)**: TLS 1.2+ enforcement extended to **March 1, 2026** (from original July 1, 2025)

Reference: https://learn.microsoft.com/en-us/azure/azure-monitor/fundamentals/best-practices-security#secure-logs-data-in-transit

### Phased Rollout for Ingestion (Jan 2026 plan)

- **Phase 1** (March '26 wk1): Disable legacy TLS ingestion in West Central US only
- **Phase 2** (March '26 wk2): Block ingestion for Japan East
- **Phase 3** (March '26 wk3): Rolling out to all other regions (takes 2 weeks)

## Customer Impact

Two scenarios:

1. **Query logs**: LA query API won't accept requests from lower TLS versions (enforced from July 1, 2025)
2. **Send logs**: Ingestion service won't accept connections from TLS 1.0/1.1 clients - logs won't be ingested via Agents, APIs, or connectors

### Scale (as of June 2025)
- S500s: 429 (3646 workspaces)
- Total customers: 10k (23k workspaces)
- Internal Microsoft: 6k workspaces
- Majority involves ingestion via agents; API-based ingestion impact is less

## Support Guidance

1. Customer raises support request looking for impacted workspace details
2. **Raise swarming post** under Log Analytics swarming channel with subscription ID
3. Contact LA STA or regional SME for report/telemetry access

### Internal Kusto Query (SME/FTE only)

Cluster: `omsgenevaodsprod.eastus.kusto.windows.net` / DB: `OperationInsights_ODS_PROD`

```kql
let customerSubscription = "<subscription ID>";
let workspaceList = cluster('oibeftprdflwr.kusto.windows.net').database('AMSTelemetry').WorkspaceSnapshot
| where SnapshotTimestamp > ago(1d)
| where SubscriptionId == customerSubscription
| distinct WorkspaceId;
cluster('omsgenevaodsprod.eastus.kusto.windows.net').database('OperationInsights_ODS_PROD').IISLog
| where TIMESTAMP > ago(1d)
| parse cs_host with workspace ".ods.opinsights.azure.com"
| where crypt_protocol == "40" or crypt_protocol == "100"
| where workspace in (workspaceList)
| extend tls_version = case(crypt_protocol == "40", "1.0",
                            crypt_protocol == "100", "1.1",
                            crypt_protocol)
| summarize count() by Environment, workspace, c_ip, cs_User_Agent_, tls_version
| sort by tls_version desc
```

### ADX Dashboard

https://dataexplorer.azure.com/dashboards/72b75146-7f83-4819-b2ff-4fde8303cd79

Dashboard also has a tab to identify machine resource IDs. Notes:
- VM behind firewall/gateway: c_ip may be the intermediate device, share c_ip values with customer
- On-prem VMs without Azure Arc: ResourceId may be null, provide c_ip values

### ARG Query (for customers)

```kql
Resources
| where type =~ 'microsoft.compute/virtualmachines'
| extend vmName = properties.osProfile.computerName
| extend osOffer = properties.storageProfile.imageReference.offer
| extend osSku = properties.storageProfile.imageReference.sku
| extend osName = properties.extended.instanceView.osName
| extend osVersion = properties.extended.instanceView.osVersion
| project name, resourceGroup, location, vmName, osOffer, osSku, osName, osVersion
```

Compare with TLS support matrix: https://learn.microsoft.com/en-us/security/engineering/solving-tls1-problem#supported-versions-of-tls-in-windows

## Customer Guidance

- Migration guide: https://learn.microsoft.com/en-us/azure/azure-monitor/fundamentals/best-practices-security#secure-logs-data-in-transit
- For OS-level TLS configuration help, customer can open support request under: Windows Servers > Windows Server 2019 > Certificates and PKI > TLS or Schannel (SSL)

## Case Closure

Close under the TLS retirement RCA tree (available for all LA SAPs).
