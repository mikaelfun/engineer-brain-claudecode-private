---
source: mslearn
sourceRef: null
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-storage/files/security/files-client-other-errors
importDate: "2026-04-24"
type: guide-draft
---

# Azure Files ClientOtherErrors Reference Guide

## Overview

ClientOtherErrors are expected client-side errors in Azure Files SMB shares. These are mostly harmless - requests fail but the system behaves as expected. A significant volume of these errors is normal.

## What Are ClientOtherErrors?

ClientOtherError means expected client-side errors such as "not found" and "resource already exists." The Windows SMB client makes exploratory API calls that may fail as expected behavior.

## Diagnostic Queries

### View All ClientOtherErrors (Log Analytics)

```kusto
StorageFileLogs
| where StatusText startswith "ClientOtherError"
| project TimeGenerated, StatusText, StatusCode, OperationName, Uri, CallerIpAddress
| order by TimeGenerated desc
```

### Count by Error Type

```kusto
StorageFileLogs
| where StatusText startswith "ClientOtherError"
| summarize Count = count() by StatusText, OperationName
| order by Count desc
```

### Authentication/Permission Failures

```kusto
StorageFileLogs
| where StatusText has "STATUS_ACCESS_DENIED"
| where OperationName in ("FileOpen", "TreeConnect", "Read", "FileSupersede")
| project TimeGenerated, OperationName, Uri, CallerIpAddress, AuthenticationType, RequesterUpn
| order by TimeGenerated desc
```

### Top Error-Generating Clients

```kusto
StorageFileLogs
| where StatusText startswith "ClientOtherError"
| summarize ErrorCount = count() by CallerIpAddress, bin(TimeGenerated, 1h)
| order by ErrorCount desc
```

## Common Error Code Reference

| Operation | Status Code | Status Name | Explanation |
|-----------|-------------|-------------|-------------|
| QueryFullEaInformation | 0xC00000BB | STATUS_NOT_IMPLEMENTED | Azure Files does not support extended attributes |
| FileOpen | 0xC0000022 (492) | STATUS_ACCESS_DENIED | Caller lacks permissions (check ACLs for Kerberos) |
| FileOpen | 0xC0000033 (257) | STATUS_OBJECT_NAME_INVALID | Path too long or too deep |
| FileOpen | 0xC00000BA (12) | STATUS_FILE_IS_ADIRECTORY | Opening directory without correct CreateFile params |
| FileOpen | 0xC0000043 (8) | STATUS_SHARING_VIOLATION | File already opened with exclusive restrictions |
| FileOpen | 0xC0000034 (6) | STATUS_OBJECT_NAME_NOT_FOUND | File does not exist |
| FSCTL_QUERY_NETWORK_INTERFACE_INFO | 0xC0000010 | STATUS_INVALID_DEVICE_REQUEST | MultiChannel query when not enabled |
| QueryStreamInformation | 0xC00000BB | STATUS_NOT_IMPLEMENTED | Alternate data streams not supported |
| ChangeNotify | 0xC0000120 | STATUS_CANCELLED | Change notification subscription canceled |
| FSCTL_DFS_GET_REFERRALS | 0xC000019C | STATUS_FS_DRIVER_REQUIRED | DFS not supported by Azure Files |
| FileCreate | 0xC0000035 (3) | STATUS_OBJECT_NAME_COLLISION | File already exists |
| TreeConnect | 0xC0000022 | STATUS_ACCESS_DENIED | Missing share-level RBAC permissions (Kerberos) |

## Key Takeaway

Most ClientOtherErrors are benign. Focus investigation on:
- Sustained high volumes of STATUS_ACCESS_DENIED (indicates permission misconfiguration)
- STATUS_SHARING_VIOLATION (indicates application concurrency issues)
- STATUS_OBJECT_NAME_INVALID (indicates path/naming problems)
