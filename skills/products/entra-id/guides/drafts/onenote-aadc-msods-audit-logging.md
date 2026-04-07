# AAD Connect: Using MSODS Audit Logging (Kusto) to Investigate Object Operations

> Source: Internal case study (Cen Wu)

## Scenario

Customer insists they did nothing wrong but objects (users/groups/devices) were deleted from AAD. Need to prove AAD Connect performed the operations.

## Approach: Expand Investigation Scope

Don't focus only on the specific object - check the overall audit log pattern.

### Step 1: Check Operations Around the Incident Time

```kusto
let mytime = datetime(2018-07-30 03:05:26.5592925);
GlobalIfxAuditLoggingCommon()
| where env_time > mytime - 30m and env_time < mytime + 30m
| where contextId == "<tenant-id>"
| summarize count() by operationName
| sort by count_
```

Look for patterns like mass Delete operations (devices, users, groups).

### Step 2: Identify the Actor

Check `actorObjectId` - if it's the AAD Connect sync account (e.g., `Sync_<ServerName>_<hash>`), the operations were performed by AAD Connect.

### Step 3: Timeline Visualization

```kusto
let myStartTime = datetime(2018-07-29 09:47:10) - 1h;
let myEndTime = datetime(2018-07-30 03:05:26) + 30m;
GlobalIfxAuditLoggingCommon()
| where env_time > myStartTime and env_time < myEndTime
| where contextId == "<tenant-id>"
| where actorObjectId == "<aadc-sync-account-objectid>"
| where operationName contains "Add " or operationName contains "Delete "
| summarize count(operationName) by bin(env_time, 5m)
```

This renders a timeline showing when AADC started adding and removing objects.

## Tips

- Be careful when delivering results to customers - some may appreciate the findings, others may face blame
- The pattern of mass Add followed by mass Delete often indicates connector space was cleared or a reinstall occurred
