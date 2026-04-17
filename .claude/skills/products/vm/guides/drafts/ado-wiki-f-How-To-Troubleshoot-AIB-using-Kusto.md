---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Image Builder (AIB)/TSGs/How To Troubleshoot AIB using Kusto_AIB"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Image%20Builder%20%28AIB%29%2FTSGs%2FHow%20To%20Troubleshoot%20AIB%20using%20Kusto_AIB"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How To Troubleshoot AIB using Kusto

## Summary

When Azure Image Builder returns `InternalOperationError` - a generic error without indication of root cause (even with `--debug` flag) - Kusto logs in the `vmimagebuilder` database are required for investigation.

## Prerequisites

Access to the `vmimagebuilder` database under `azcrp.kusto.windows.net` cluster requires joining the CoreIdentity group: https://coreidentity.microsoft.com/manage/entitlement/entitlement/wacts14817-huwx

## Step 1: Get Correlation ID from ASC

In Azure Support Center, locate the operation failure for the image build.

## Step 2: Query UsageKpiEvent for Correlation ID

```kql
cluster('azcrp.kusto.windows.net').database('vmimagebuilder').UsageKpiEvent
| where PreciseTimeStamp between (datetime(2023-06-01 11:30)..datetime(2023-06-01 12:00))
| where subscriptionID == "<subscription-id>" and resourceGroupName == "<rg-name>"
| project PreciseTimeStamp, correlationID, customizerlatencyinms, operationstatus, operationName, resourceGroupName, resourceName, sourcetype
| order by PreciseTimeStamp desc
```

## Step 3: Query AsyncContextActivity with Correlation ID

```kql
cluster('azcrp.kusto.windows.net').database('vmimagebuilder').AsyncContextActivity
| where correlationID == "<correlation-id>"
| project PreciseTimeStamp, level, lineNumber, fileName, msg
| order by PreciseTimeStamp desc
```

## Common Root Causes Found via Kusto

Based on cases investigated using this method:

1. **Incorrect resource ID in template** - e.g., vnet config is invalid with 404 Resource Not Found for wrong RG name
2. **VNET resource in different region or RG** than VM Image Builder service
3. **Creating custom images in different RG** than the source managed image

## Mitigation

The `InternalOperationError` is a generic error with various possible underlying causes. Always investigate using the Kusto method above to identify the actual root cause before providing a fix.

## References

- https://learn.microsoft.com/en-us/rest/api/imagebuilder/virtual-machine-image-templates/create-or-update
- https://learn.microsoft.com/en-us/azure/virtual-machines/linux/image-builder-permissions-cli
- https://learn.microsoft.com/en-us/azure/virtual-machines/linux/image-builder
