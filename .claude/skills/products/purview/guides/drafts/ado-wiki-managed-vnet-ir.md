---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Security and Access Control/Managed VNet IR"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Security%20and%20Access%20Control/Managed%20VNet%20IR"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Using Managed VNet IR to connect Securely

https://docs.microsoft.com/en-us/azure/purview/catalog-managed-vnet

Other options to connect to Key Vault Securely without using a Firewall:
- Setup Managed Vnet IR within PE enabled Purview account (Account, portal, ingestion PE's with Firewall as Deny)
- Manually approve managed PE for account and its managed resources
- Create managed PE for datasource for which user wants to perform scan
- Create Managed PE for keyvault
- Register datasource and perform scan using ManagedVnet IR

## TSG Search Kusto

We can now access Managed Integration Runtime logs in Kusto for troubleshooting.

### Confirm which MIR was used

```kql
cluster('babylon.eastus2').database('babylonMdsLogs').ScanningLog
| where ScanResultId == 'xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx'
| where Message contains "effectiveIntegrationRuntime"
```

### Search for errors

```kql
cluster('babylon.eastus2').database('babylonMdsLogs').ScanningLog
| where ScanResultId == 'xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx'
| where * contains 'failed' or * contains 'Warning' or * contains 'Error' or * contains 'Throttle' or * contains 'Unsupported'
```

### Search the data scan activity for errors

```kql
cluster('purviewadxeus.eastus').database('DataScanLogs').DataScanAgentEvent
| where ScanResultId == 'xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx'
| where * contains 'failed' or * contains 'Warning' or * contains 'Error' or * contains 'Throttle' or * contains 'Unsupported'
```
