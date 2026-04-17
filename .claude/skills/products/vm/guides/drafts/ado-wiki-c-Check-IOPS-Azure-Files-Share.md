---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/How Tos/Check IOPS on Azure Files Share_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20All%20Topics%2FHow%20Tos%2FCheck%20IOPS%20on%20Azure%20Files%20Share_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

## Summary

An Azure Files share can be affected by two different IOPS limits:

1. The **1000 IOPS per share** limit that Azure Files imposes.
2. The **20000 IOPS per Storage Account** limit that Azure Storage imposes.

This article helps determine whether you are hitting one of these limits.

## More Information

### Determining whether you are hitting the Storage Account IOPS limit

Each Storage Account can have a maximum of 20000 IOPS at any given time.

1. Open Xdash: http://xdash
2. Go to Account | Account sla.
3. Type the Storage Account name in the "Account Name" field.
4. Select an appropriate time period (Minute or Hour).
5. Select a time to analyze (Latest for ongoing, or specific UTC time).
6. Look at "Transactions/Sec" next to "Total." If at or near 20000, you are likely hitting the per-account IOPS limit. Check for non-zero "Throttling Errors (%)."

### Determining whether you are hitting the per-share IOPS limit

#### Single share

1. Open Xdash -> Account | Account sla.
2. Look at "Transactions/Sec" next to "XFileFE_All." If at or near 1000 with a single share, you are hitting the per-share IOPS limit.

**Note: The data in Xdash is about two minutes behind.**

#### Multiple shares

There is not currently an easy way to see per-share IOPS in Xdash. The customer will need to look at their client systems.

### Isolating where the Azure Files share IOPS are coming from

#### Checking on the guest system (Performance Monitor)

1. Open Performance Monitor (PerfMon.msc).
2. Go to Performance | Monitoring Tools | Performance Monitor.
3. Delete all default counters. Click the green + sign.
4. Under "Available counters," expand "SMB Client Shares."
5. Select "Data Requests/sec" (total IOPS). Optionally select "Data Bytes/sec" for throughput.
6. Under "Instances of selected object," choose the share(s) suspected of hitting the 1000 IOPS limit.
7. Click "Add >>" then OK.

The graph displays IOPS over time. The "Last" field shows IOs in the previous second (often within +/- 5% of Azure Storage IOPS).

## References

- https://docs.microsoft.com/en-us/azure/storage/storage-scalability-targets
