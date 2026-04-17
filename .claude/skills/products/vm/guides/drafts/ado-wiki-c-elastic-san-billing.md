---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Elastic SAN/How Tos/ElasticSAN Billing_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/pages/SME%20Topics/Azure%20Elastic%20SAN/How%20Tos/ElasticSAN%20Billing_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Elastic SAN Billing Verification

## Billing Model

- **Base Unit**: Capacity + performance (5,000 IOPS, 200 MBps per TiB) at $0.091/GiB
- **Capacity Only Unit**: Capacity without additional performance at $0.069/GiB
- **Redundancy**: LRS and ZRS (ZRS at 50% premium over LRS)
- **Minimum**: At least one base unit of 1 TiB
- **Billing**: Hourly at a monthly rate
- Provisioned resources on SAN level are shared across all volume groups and volumes

## Technical Billing Verification (Kusto)

> Note: VM Pod provides commercially viable effort to help. Not responsible for proving/disproving billing disputes.

### Kusto Queries

**Access Required**: [Request XDAKustoClusterAccess in CoreIdentity](https://coreidentity.microsoft.com/manage/entitlement/entitlement/xdakustoclus-uqdt)

**Transaction Details**:
```kusto
cluster("xstore.kusto.windows.net").database("xdataanalytics").AccountTransactionsDaily
| where TimePeriod between(datetime({StartTime})..datetime({EndTime}))
and BilledSubscription =~ "{SubscriptionID}"
| project TimePeriod, RequestType, AccessTier, TransactionType, TransactionCount, BillableTransactionCount
```

**Billing by MeterId**:
```kusto
cluster("xstore.kusto.windows.net").database("xdataanalytics").XStoreAccountBillingDaily
| where TimePeriod between(datetime({StartTime})..datetime({EndTime}))
| where MeterId has "{MeterId}"
| project TimePeriod, AccessTier, TransactionType, TransactionCount, BillableTransactionCount
```

## References

- [How to Handle Storage Billing Inquiries](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496208/)
- [Check Storage Billing Usage](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496135/)
- [How to Engage Azure Subscription and Billing Team](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494923/)
