---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Cloud PC Actions/Disaster Recovery Plus/Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Cloud%20PC%20Actions/Disaster%20Recovery%20Plus/Troubleshooting"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Disaster Recovery Plus - Troubleshooting

As this feature depends on User Settings Configuration, and Disaster Recovery for Cross Region, the same troubleshooting steps can be applied to identify the root cause of the issue.

- [Cross region disaster recovery Wiki](https://supportability.visualstudio.com/Windows365/_wiki/wikis/Windows365%20Support%20Wiki/1620459/Cross-region-disaster-recovery)
- [Business Continuity Disaster Recovery](https://learn.microsoft.com/en-us/windows-365/business-continuity-disaster-recovery) recommendations are applicable as Cross Region does.
- [User Settings Troubleshooting (Wiki)](https://supportability.visualstudio.com/Windows365/_wiki/wikis/Windows365%20Support%20Wiki/1477161/User-Settings-Local-Admin-Check-last-run-result-and-retry-last-payload) is also eligible for troubleshooting.

## Cloud PC Dashboard

CPCD can be used to identify current User Settings related to disaster recovery.

```kql
let TenantID = '';
cluster("https://cloudpc.eastus2.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| union cluster("https://cloudpcneu.northeurope.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| where AccountId == TenantID
| where EventUniqueName == "GetUserSettingByIdAsync(Ln: 159)"
| project Col1
```

CPCD in Action Diagnostic for User Settings tile.

### Disaster Recovery Onboard Process and License Validation

```kql
let TenantID = '';
cluster('cloudpc.eastus2.kusto.windows.net').database('CloudPC').CloudPCEvent
| union cluster('cloudpcneu.northeurope.kusto.windows.net').database('CloudPCProd').CloudPCEvent
| where env_time >= ago(7d)
| where AccountId == TenantID
| where ComponentName in ("OnboardHandler")
| project env_time, AccountId, UserId, ActivityId, ColMetadata, Col1, Col2, Col3, OtherIdentifiers, EventUniqueName, ComponentName
```

Grab ActivityID from previous command for the timestamps matching the repro of the issue:

```kql
let ActivityId = '';
cluster('cloudpc.eastus2.kusto.windows.net').database('CloudPC').CloudPCEvent
| union cluster('cloudpcneu.northeurope.kusto.windows.net').database('CloudPCProd').CloudPCEvent
| where ActivityId == ActivityId
| project env_time, AccountId, UserId, ActivityId, ColMetadata, Col1, Col2, Col3, OtherIdentifiers, EventUniqueName, ComponentName
```

## Cloud PC Reports

Select **Reports** > **Cloud PC overview**. Information related to Cloud PC optional business continuity and disaster recovery status.
