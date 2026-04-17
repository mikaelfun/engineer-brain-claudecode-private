# DiskRP Kusto Query Reference (Mooncake)

## Cluster
- **Cluster**: disksmc.kusto.chinacloudapi.cn
- **Database**: Disks

## Key Tables

### DiskRPResourceLifecycleEvent
Tracks disk state transitions during VM operations.

```kql
DiskRPResourceLifecycleEvent
| where TIMESTAMP >= datetime(YYYY-MM-DDT00:00:00) and TIMESTAMP <= datetime(YYYY-MM-DD 23:59:59)
| where resourceName contains "<disk_name>"
| project TIMESTAMP, activityId, callerName, resourceName, diskEvent, state, storageAccountType, storageAccountName
```

**Key columns**:
- `diskEvent`: Attach, Move, UpdateDiskMetadata
- `state`: Reserved, Unattached, Attached
- `callerName`: AttachDisk, DoBuildInternal, LogDiskLifeCycleWithCorProgress, UpdateProperties

### DiskManagerApiQoSEvent
API-level events for disk operations.

```kql
DiskManagerApiQoSEvent
| where TIMESTAMP > datetime(YYYY-MM-DDT00:00:00)
| where * has @'<operationId>'
| project TIMESTAMP, subscriptionId, operationId, correlationId, operationName, resourceGroupName, resourceName, httpStatusCode, requestEntity
```

**Key columns**:
- `operationName`: e.g., DiskAvailabilitySets.AllocateDisks.POST
- `httpStatusCode`: 200 = success
- `requestEntity`: Full JSON payload with disk/VM details

## Disk State Machine
```
Unattached -> Reserved (AttachDisk) -> Attached (AttachDisk after allocation)
Attached -> Unattached (DetachDisk / Move during redeploy)
```

## Notes
- Use `activityId` to correlate events across tables
- During VM redeploy, disk transitions: Reserved -> Move(Unattached) -> UpdateDiskMetadata -> Attached
