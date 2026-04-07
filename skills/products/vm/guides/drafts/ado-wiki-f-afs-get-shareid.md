---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Sync/TSGs/TSG 206 AFS How to get ShareId from SyncGroup and Subscription ID_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20Sync%2FTSGs%2FTSG%20206%20AFS%20How%20to%20get%20ShareId%20from%20SyncGroup%20and%20Subscription%20ID_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# TSG 206: How to get ShareId from SyncGroup and Subscription ID

## Summary

This TSG guides you on how to get ShareId from SyncGroup and Subscription Id.

## Steps

1. Search for 9102 sync completion events for the subscription id from the CRI and filter EventData contains SyncGroupName.
   - Reference: TSG No.170: Formatting Server Telemetry Events in Jarvis
2. With the CorrelationId from step 1, query CounterWebRequestInfo filtered with clientCorrelationId contains correlationId from step 1. You should see a hashed version of ShareId for a few sync requests.
3. Query AfSSyncFolderLevelMetrics table filtering with tenantId = "SubscriptionId" from step 1.
4. You should see a list of folders for the subscription/tenant.
5. Use devtools and run `Get-Hash "ShareId"` commandlet to get the hashed version of the ShareId for all folders from step 3.
6. Match the hashed id from step 2. The non-hashed ShareId from AfSSyncFolderLevelMetrics is the one you are looking for.

**Pro Tip**: In V5, ShareId in WebRequestInfo is not hashed. So step 2 should give the ShareId directly.
