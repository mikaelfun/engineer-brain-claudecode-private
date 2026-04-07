---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/In-Development Content/Outdated? - Needs review if still useful/SHU/testing/Kusto Queries"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/937242"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# IDs

## RBAC Failure
- AID: feed82c5-a1ba-4696-9111-4e274407063a
- Correlation ID: feed82c5-a1ba-4696-9111-4e274407063a

## GEN1 to GEN2 Failure 1
- AID: e42086d9-440f-41b0-a0d9-c182116c9d3b
- Correlation ID: e42086d9-440f-41b0-a0d9-c182116c9d3b

## GEN1 to GEN2 Failure 2
- AID: 8cd32054-ad06-4854-beb8-ed6dbe48798a
- Correlation ID: 8cd32054-ad06-4854-beb8-ed6dbe48798a

## Key Vault Failure
- AID: 090eac69-cd6e-4c8f-8534-2c3ede3d3f6f
- Correlation ID: 090eac69-cd6e-4c8f-8534-2c3ede3d3f6f

## Cancel
- AID: 781abe55-cb10-4026-adb4-f59c79fad0d7

## Pause-Resume
- AID: d22a049e-fe2c-46a7-b811-0528b5dae5ea
- Correlation ID:

## Success
- AID: 92e6289a-0c7e-4178-bbde-2432e40239c8


# Queries

## DiagActivity
```
cluster("rdsprodus.eastus2.kusto.windows.net").database("WVD").DiagActivity
| where TIMESTAMP >= ago(4hr)
| where ArmPath == "/subscriptions/a3db17f1-37f5-4ef0-b379-710690cf4c3c/resourceGroups/SessionHostUpdate/providers/Microsoft.DesktopVirtualization/hostpools/SHU-RBAC-Failure"
| where Type == "LongRunningManagement"
| join kind=leftouter (
cluster("rdsprodus.eastus2.kusto.windows.net").database("WVD").DiagError
) on $left.Id == $right.ActivityId
| project TIMESTAMP, StartTime, EndTime, Outcome, ActivityId, ParentUpdateId, Type, Status, SessionHostPoolId, ArmPath, ScheduledTime, UpdateType, UpdateStatus, UpdateMethod, OSDiskSaved, NewVMSize, NewVMSku, ImageSource, MaxVMsUnavailableDuringUpdate, ErrorSource, ReportedBy, ErrorOperation, ErrorCode, ErrorInternal, ErrorCodeSymbolic, ErrorMessage
```

## RDInfraTrace
```
cluster("rdsprodus.eastus2.kusto.windows.net").database("WVD").RDInfraTrace
| where ActivityId == "feed82c5-a1ba-4696-9111-4e274407063a"
| where Role contains "hpu"
//| project TIMESTAMP, ActivityId, Role, Level, Category, Msg
| sort by TIMESTAMP asc
```

## RDOperation
```
cluster("rdsprodus.eastus2.kusto.windows.net").database("WVD").RDOperation
| where ActivityId == "feed82c5-a1ba-4696-9111-4e274407063a"
| where Role contains "hpu"
| project TIMESTAMP, Role, Name, RequestId, IsThrottled, DurationMs, ResType, ResSignature, ResDesc, Props
```

## DiagCheckpoint
```
cluster("rdsprodus.eastus2.kusto.windows.net").database("WVD").DiagCheckpoint
| where ActivityId == "feed82c5-a1ba-4696-9111-4e274407063a"
| project TIMESTAMP, Name, RequestId, ReportedBy, Parameters, ParametersNonPii
```
