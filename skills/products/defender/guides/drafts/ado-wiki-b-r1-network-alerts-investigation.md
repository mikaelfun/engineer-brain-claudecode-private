---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Security Alerts/[TSG] - Security Alerts initial investigation/[TSG] - Network Alerts Investigation"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/Security%20Alerts/%5BTSG%5D%20-%20Security%20Alerts%20initial%20investigation/%5BTSG%5D%20-%20Network%20Alerts%20Investigation"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Network Alerts Investigation — TSG

## Overview

This guide covers investigation of MDC network alerts such as brute force attempts, inbound/outbound connections to malicious endpoints. MDC collects data from Azure Network endpoints using ML to detect potentially malicious behavior. MDC consumes NRP (Azure Network Resource Provider) data from Cosmos to map Public IP to resource.

**Key goal**: Verify that during the alert generation time, the Victim IP was part of the customer subscription.

## Step 1: Get the Security Alert

```kql
union
cluster('https://romeuksouth.uksouth.kusto.windows.net').database('ProdAlerts').SecurityAlerts,
cluster('https://romeeus.eastus.kusto.windows.net').database('ProdAlerts').SecurityAlerts
| where SystemAlertId == "{Alert ID provided}"
```

Collect from the alert:
- **Victim IP**
- **Attacker IP**
- **StartTimeUTC & EndTimeUTC**
- **Alert Type** (inbound or outbound)

## Step 2: Get IPFIX Network Data

Send raw traffic evidence to the customer using IPFIX data:

```kql
cluster("Netcapplan").database("NetCapPlan").RealTimeIpfixWithMetadata
| where TimeStamp > todatetime("06-23-2020 00:01:00")  // StartTime of the alert
| where TimeStamp < todatetime("06-23-2020 22:59:00")  // End time of the Alert
| where SrcIpAddress == "<VictimIP/AttackerIP>" and DstIpAddress == "<VictimIP/AttackerIP>"
```

From the results: extract TCP flags, packet size, and connection count. A single entry often indicates the attacker attempted a request and got timeout/deny. Multiple entries warrant deeper investigation.

## Additional Kusto Queries

### Get Security Alerts for a Subscription

```kql
union
cluster('https://romeuksouth.uksouth.kusto.windows.net').database('ProdAlerts').SecurityAlerts,
cluster('https://romeeus.eastus.kusto.windows.net').database('ProdAlerts').SecurityAlerts
| where Metadata["StoreManager.Published"] == "True"
| where AzureResourceSubscriptionId == "<SubscriptionId>"
| where StartTimeUtc >= ago(2d)
| where AlertDisplayName contains "traffic"
| order by StartTimeUtc
| project AlertDisplayName, ProviderName
```

### IPFIX Correlation Query

```kql
cluster("Netcapplan").database("NetCapPlan").RealTimeIpfixWithMetadata
| where TimeStamp > todatetime("01-28-2020 00:01:00")
| where TimeStamp < todatetime("01-29-2020 23:59:00")
| where SrcIpAddress == "X.X.X.X" and DstIpAddress == "X.X.X.X"
```

## References

- TCP Flags: https://www.geeksforgeeks.org/tcp-flags/
- Netflow: https://en.wikipedia.org/wiki/NetFlow
- IPFIX: https://en.wikipedia.org/wiki/IP_Flow_Information_Export
- MDC Alerts Reference: https://docs.microsoft.com/en-us/azure/security-center/alerts-reference#alerts-azurenetlayer
- Azure Network Watcher: https://docs.microsoft.com/en-us/azure/network-watcher/network-watcher-monitoring-overview

**Applies to**: All inbound/outbound network type MDC security alerts
