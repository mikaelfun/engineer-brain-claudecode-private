---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Storage/[TSG] - Defender for Storage"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/Workload%20Protections/Defender%20for%20Storage/%5BTSG%5D%20-%20Defender%20for%20Storage"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## Storage Accounts MDC enablement status and type

- Check if Defender for Storage enabled on a subscription level:

   **Customer** side PowerShell query to check pricing on storage accounts
   (Note that this apply to legacy "per-transaction" plans only)
   ```powershell
    $context =Get-AzContext
    $subId = $context.Subscription
    $SAs = Get-AzStorageAccount
    Foreach ($SA in $SAs)
    {
       $resID = "/subscriptions/" + $subID + "/resourceGroups/" + $SA.ResourceGroupName +
       "/providers/Microsoft.Storage/storageAccounts/" + $SA.StorageAccountName + "/"
       Get-AzSecurityAdvancedThreatProtection -ResourceId $resID
    }
   ```
   You can also use the above code to disable Storage ATP using Disable-AzSecurityAdvancedThreatProtection

## Activity Log of enabling plan operations

- Name: Update security operators
- `"action": "Microsoft.Security/pricings/securityoperators/write",`
- `"scope": "/subscriptions/<subscriptionId>/providers/Microsoft.Security/pricings/StorageAccounts/securityoperators/DefenderForStorageSecurityOperator"`

**Activity log kusto query** — who activated the plan?
```kql
let startDateTime = datetime(2023-01-01);
let endDateTime = datetime(2023-01-31); //replace with presumed change date range
cluster("Armprod").database("ARMProd").EventServiceEntries
| where subscriptionId == "{subscriptionId}"
| where TIMESTAMP between (startDateTime .. endDateTime)
| where resourceUri has "/Microsoft.Security/pricings/StorageAccounts/securityoperators/DefenderForStorageSecurityOperator"
| extend Claims = parse_json(claims)
| extend Auth = parse_json(authorization)
| extend Http = parse_json(httpRequest)
| project TIMESTAMP, ExecutedBy = Claims.name, ClientSourceIp = Claims.ipaddr, UserRole = Auth.evidence.role, Method = Http.method, SourceIpAdress = Http.clientIpAddress, operationName,resourceUri,eventName,status,subStatus ,httpRequest, properties
```

## Reference alerts

https://docs.microsoft.com/azure/security-center/alerts-reference#alerts-azurestorage

## Kusto queries

### Get Defender for Storage alerts
```kql
union cluster('romeeus.eastus.kusto.windows.net').database("ProdAlerts").SecurityAlerts, cluster('romeuksouth.uksouth.kusto.windows.net').database("ProdAlerts").SecurityAlerts
| where StartTimeUtc > ago(7d)
| where ProviderName == "StorageThreatDetection"
//| where AzureResourceSubscriptionId == "<SubscriptionID>"
| where AzureResourceId == "<storage-account-resource-id>"
```

### Check in Kusto if customer Defender for Storage is enabled

**Access needed:** https://coreidentity.microsoft.com/manage/Entitlement/entitlement/tmascdatapro-ozme

```kql
cluster("https://dfsv2telemetryadx.westeurope.kusto.windows.net").database("Snapshots").HourlyPolicyTableSnapshot_v1
| where StorageResourceId contains "<subscription or storage account resource id>"
| sort by SnapshotTime desc
```

**Note:** Access to `cluster('RomeDataProtection.kusto.windows.net').database('ProdAtpClientTelemetry')` is granted to 'CSS Cybersecurity Infra Solutions WW' (SecPodWW-IS@microsoft.com). No need for MyAccess group for this one.

### Billing

Use this query to retrieve the MeterId:
```kql
cluster('rometelemetrydata').database('RomeTelemetryProd').BillingReportsByDaySubscriptionAndMeterId(now()-14d,now())
| where SubscriptionId == '<SubscriptionID>'
| where Bundle contains "Storage"
| sort by Day desc
```

Then use the Meter Id in this query to get the results:
```kql
cluster('rometelemetrydata.kusto.windows.net').database('RomeTelemetryProd').BillingReportsRawArchive
| where UsageTime > ago(7d)
| where MeterId == "<MeterId>"
```

## Role deletions in activity log

This is expected behavior. Defender for Storage uses DefenderForStorageSecurityOperator service principal to manage role assignments for the data scanner. The service principal may delete some role assignments to optimize the number needed on the subscription and avoid reaching tenant assignment capacity. This does not affect other role assignments or functionality.

## Current Limitations

- Azure Defender for Storage is not available for storage accounts in the North East region

## Event Grid System topic for StorageAntimalwareSubscription

When Microsoft Defender for Cloud is enabled on a StorageV2 account, it automatically creates an Event Grid System Topic with a StorageAntimalwareSubscription event subscription.

- Default supported events: `Microsoft.Storage.BlobCreated`, `Microsoft.Storage.BlobRenamed`
- System topic is read-only (managed by Storage Antimalware RP)
- Attempting to modify other event types triggers AAD tenant mismatch error
- **Resolution**: Create a NEW event subscription for additional event types
- If default subscription is deleted, it auto-recreates on plan disable/re-enable

## Escalation

- IcM: Microsoft Defender for Cloud > Antimalware for Storage
- Team: storageaveng@microsoft.com
