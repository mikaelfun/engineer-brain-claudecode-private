---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Sync/TSGs/TSG 372 AFS How to Troubleshoot Private Endpoint failures_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20Sync%2FTSGs%2FTSG%20372%20AFS%20How%20to%20Troubleshoot%20Private%20Endpoint%20failures_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# TSG 372: AFS Private Endpoint Troubleshooting

## Summary

Troubleshooting Azure File Sync Private Endpoint-related challenges.

## Pre-check Checklist

1. Valid StorageSync service exists
2. Agent version >= 10.1
3. Valid private endpoint creation
4. PE connection is in **Approved** state
5. Private DNS Zones configured correctly
6. NSG/firewall settings allow traffic
7. New FQDN endpoints used in AFS agent

If PE configuration is correct from StorageSync side:
- Check network firewall blocking
- Check endpoint reachability
- Route to Azure networking team

## Error Codes

| Error | Code |
|---|---|
| PrivateEndpointAccessBlocked | 0x80c83099 |
| HTTP Unreachable | Various |

## Verifying PE Traffic

Query `Ifx3Operation` for `operationName==authentication`:

Key fields to check:
- **allowInternetTraffic**: `AllowAllTraffic` vs `AllowVirtualNetworksOnly`
- **IsPrivateIp**: `True` = traffic using PE
- **PvtLinkId**: Present = PE connection in use
- **canParseIPv6Address**: IPv6 support status

## Management Plane Troubleshooting

NRP Jarvis/Kusto tables for PE creation issues:

```kql
// NRP FrontendOperationEtwEvent
cluster('nrp.kusto.windows.net').database('mdsnrp')
FrontendOperationEtwEvent
| where ...
```

## Common Problems

### 1. PE creation fails with "An error has occurred"

1. Open Jarvis NRP table: FrontDoorOperationEtwEvent
2. Look for Mgmt* failures, BackgroundTaskFailed, Exceptions
3. If isolated to Management, investigate Mgmt API request via iislogs, CounterHfsWebRequestInfo, Ifx3Operation, DebugWrite

### 2. NRP Failure: PLS object with incorrect property

When PE proxy is not in approved state but contains FQDN information - create Sev3 ICM for NRP team.

## FAQs

- **Agent version check**: Must be 10.1+. Check PE table for approved PE for given StorageSyncService.
- **Common customer-reported errors**: HTTP Unreachable, 403 PrivateEndpointAccessBlocked, network/firewall issues with new endpoints.
