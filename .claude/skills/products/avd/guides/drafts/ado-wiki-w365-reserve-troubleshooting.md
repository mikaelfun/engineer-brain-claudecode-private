---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Learning Resources/Introduction to Windows 365/Windows 365 Reserve/Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FLearning%20Resources%2FIntroduction%20to%20Windows%20365%2FWindows%20365%20Reserve%2FTroubleshooting"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Windows 365 Reserve Troubleshooting

**Note:** All the existing provisioning troubleshooting guide is applicable for this release: [Provisioning - Overview](https://supportability.visualstudio.com/Windows365/_wiki/wikis/Windows365%20Support%20Wiki/742590/Provisioning)

## Reserve Policy Assignment

The Reserve policy assignment service manages User Policy Assignments (UPAs). A UPA can be: **Active**, **Inactive**, or **Deleted**.

### State Logic

- **New User Assignment:** No existing UPA → new UPA becomes **Active**
- **Existing User, Additional Assignment:** Already has Active UPA → new UPA becomes **Inactive** (only one Active UPA per user)
- **Multiple Group Assignments:** Earliest assignment (by creation time) is **Active**, rest **Inactive**
- **User Removal from All Groups:** All UPAs → **Deleted**
- **Automatic Failover:** When Active UPA removed, system promotes an Inactive UPA:
  1. First searches for Inactive UPA for the **same policy**
  2. If none, selects the **earliest created** Inactive UPA across all policies

### Relevant Issues

- User assigned to Group A with Policy A, but not visible under policy detail page's Device or Users tabs
- **Root Causes:** User has another active UPA not under Policy A; or no license available

## Reserve Policy Subscription

Subscription states: **Enabled**, **Blocked** (7-day hold), **Expired**, **Deleted**, **UnKnown**

### Subscription Lifecycle

- **Initial Purchase** → Blocked (7-day hold). Licenses assignable but users can't checkout CPC
- **After 7 days** → Blocked → Enabled (automatic)
- **Expiration** → Expired
- **Renewal** → New subscription entity, **bypasses 7-day block**, immediately Enabled
- **License Assignment** → Prioritizes Enabled subscriptions with earliest creation date
- **Deletion** → Deleted

### User License Assignment (ULA) States

- **Enabled** — License active, user can use CPC
- **Candidate** — Active UPA exists but no license available (queued)
- **Blocked** — License assigned, 7-day holding period
- **Expired** — Underlying subscription expired
- **Deleted** — License reclaimed

### ULA State Transitions

- **License Available** → ULA created as Blocked → 7 days → Enabled
- **No License** → ULA created as Candidate → when license freed → Blocked
- **License Reclaim (CPC was used):** ULA stays Enabled until 10 days consumed, then Deleted
- **Subscription Expired:** All Enabled ULAs → Expired

### Relevant Issues

- Tenant has no subscriptions even though purchased
- License number is not correct
- Subscriptions or ULA metadata is wrong
- User does not receive CPC even with active UPA

### Kusto Queries

```kusto
// Get tenant update events for Reserve service plan
CloudPCEvent
| where env_time > ago(1d)
| where ApplicationName contains "assg"
| where Col1 contains "Received a tentant update notification message from EventGrid"
| where Col1 contains "{TenantID}"
| project bj_time=format_datetime(datetime_add('hour', 8, env_time), 'yy-MM-dd [hh:mm:ss tt]'),env_time,
SessionId, env_cloud_environment, ActivityId, TraceLevel, BuildVersion, env_cloud_name, ApplicationName, ComponentName, EventUniqueName, Col1, Message
| order by env_time asc

// Check all subscription state changes
CloudPCEvent
| where env_time > ago(1d)
| where ApplicationName contains "assg"
| where Col1 contains "start to" and Col1 contains "transition"
| where Col1 contains "{TenantId}"
```

## Reserve Policy Management (CRUD)

### Key Features

- Simplified Provisioning (no prior W365 experience needed)
- Geo Selection (region auto-selected by service)
- License: 1 per user per year, managed internally
- 7-day hold after license assignment
- Provisioning on demand (not at policy creation)
- User Settings: self-provisioning, idle-time auto-deprovisioning
- Metering: 10 days/year, tracked in 24-hour increments
- Stacking: up to 3 licenses per user (max 30 days/year)
- Snapshot before deprovisioning

### Reserve Policy vs Other Policies

- **Image:** Only gallery image, default automatic, max 6 versions shown
- **Network:** Only MHN, only CDP supported regions

### Relevant Issues

- Cannot create Reserve policy
- Cannot select "Reserve" license type during policy creation

### Kusto Query - Check Service Plan Registration

```kusto
CloudPCEvent
| where env_time > ago(1d)
| where EventUniqueName == "RetrievePurchasedServicePlansAsync"
| where AccountId == "{TenantId}"
| project bj_time=format_datetime(datetime_add('hour', 8, env_time), 'yy-MM-dd [hh:mm:ss tt]'),env_time,
SessionId, env_cloud_environment, ActivityId, TraceLevel, BuildVersion, env_cloud_name, ApplicationName, ComponentName, EventUniqueName, Col1, Message
| order by env_time asc
```

- In Col1, look for service plan id `7d9859c6-ac79-411d-9188-72151d391e9c`
- **If found:** Refresh pages and retry
- **If not found:** Follow Reserve Tenant Onboard TSG for mitigation
