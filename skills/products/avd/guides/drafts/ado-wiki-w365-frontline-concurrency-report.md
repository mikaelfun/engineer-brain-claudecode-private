---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Reporting/W365 Frontline (FLD&FLS) Concurrency Report"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Reporting/W365%20Frontline%20(FLD%26FLS)%20Concurrency%20Report"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# W365 Frontline (FLD & FLS) Concurrency Report

## Overview

The Cloud PCs Connected report in Intune provides admins with information regarding the maximum number of FLA/FLS Cloud PCs that can be connected at the same time (i.e. concurrency). This max number of CPCs is determined by the amount of active licenses that the customer has in their tenant.

Moreover, admins can use the assignment feature, to control concurrency at the assignment level of a provisioning policy.

When the maximum concurrency is reached, additional end users cannot connect to their CPCs. If connected users fail to log off, administrators must manually turn off those CPCs to bring back concurrency to acceptable levels and allow incoming shift users to log into their Cloud PCs.

## MEM Portal Experience

Customer can now see the connections as assignment level for FLS. And for FLD at service plan level.

## Kusto Queries

**Note**: Following Kusto queries requires Reporting cluster access and SAW device. This is for SaaF only.

### Hourly and Daily Trend
```kql
FlexLicenseUsageEntity_FastStream
| where TenantId == "{customer tenant id}" and DateTimeUTC between ({issue start time} .. {issue end time})
```
Check ClaimedLicenseCount, LicenseCount, BufferSize columns.

### Currently Connected Devices
```kql
CasCloudPcEntity_FastStream
| where TenantId == "{customer tenant id}" and Timestamp between ({issue start time} .. {issue end time})
| project TenantId, ConcurrentAccessGroupId, CloudPCId, Timestamp, State, CreatedDateTimeUTC, DeviceId
```

```kql
CasGroupUserEntity_FastStream
| where TenantId == "{customer tenant id}" and Timestamp between ({issue start time} .. {issue end time})
| project TenantId, ConcurrentAccessGroupId, CloudPCId, Timestamp, State, CreatedDateTimeUTC
```
