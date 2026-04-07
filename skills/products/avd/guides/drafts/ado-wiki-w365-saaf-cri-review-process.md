---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/WCX Specific Content/SaaF CRI Review Process"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FSandbox%2FWCX%20Specific%20Content%2FSaaF%20CRI%20Review%20Process"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# SaaF CRI Review Process

## Overview

The WCX SaaF team performs a monthly review of ICM escalations (CRIs) to determine insights:

- What types of issues are being escalated? Any trends?
- Are there low-quality ICMs to improve?
- What tools, training, and data could CSS use to avoid escalation?

Goal: Reduce overall Time to Resolution (TTR) by eliminating need for CSS to engage SaaF/Engineering or reducing Time in Engineering (TIE).

## CRI Escalation Quality Criteria

Scoring system for escalation quality:

| Criterion | Score |
|-----------|-------|
| Basic information provided (TenantID, UserID, DeviceID, etc.) | +1 if YES |
| Issue Description clear | +1 if YES |
| Troubleshooting details included | +1 if YES |
| Issue NOT already in support wiki or TSG | +1 if NO |
| Issue NOT documented as known issue to CSS | +1 if NO |

- 5/5 = High quality
- 3-4 = Medium quality
- <3 = Low quality

## Regional SaaF CE Review Contacts

- APAC: Xinyu, Andy
- EMEA: Joe, Wei
- US: Venkatesh, Valerie

## Useful Kusto Queries

### Support Ticket Volume
```kql
cluster('cpcsre.eastus.kusto.windows.net').database('SaaF').fn_GetW365SupportCase()
| where CreatedDateTime >= datetime(2023-07-01 00:00) and CreatedDateTime < datetime(2023-08-01 00:00)
| where InitialResponseQueueKey != 3447
| distinct CaseNumber
| count
```

### Total SaaF CRI Volume
```kql
cluster('icmcluster.kusto.windows.net').database('IcMDataWarehouse').Incidents
| where OwningTenantId == 27011 and OwningTeamId == 78675
| where CreateDate >= datetime(2023-08-01 00:00) and CreateDate < datetime(2023-09-01 00:00)
```

### SaaF CRI Status Distribution
```kql
let icmlist = cluster('icmcluster.kusto.windows.net').database('IcMDataWarehouse').Incidents
    | where OwningTenantId == 27011 and OwningTeamId == 78675
    | where CreateDate >= datetime(2023-08-01 00:00) and CreateDate < datetime(2023-09-01 00:00)
    | distinct IncidentId;
cluster('icmcluster.kusto.windows.net').database('IcmDataWarehouse').IncidentsSnapshotV2()
| where IncidentId in (icmlist)
| extend Status = iff(OwningTeamName !contains "jarnold", "Transferred", Status)
| summarize count() by Status
| order by count_ desc
```

### ICMs Transferred to Service Teams
```kql
let icmlist = cluster('icmcluster.kusto.windows.net').database('IcMDataWarehouse').Incidents
    | where OwningTenantId == 27011 and OwningTeamId == 78675
    | where CreateDate >= datetime(2023-08-01 00:00) and CreateDate < datetime(2023-09-01 00:00)
    | distinct IncidentId;
cluster('icmcluster.kusto.windows.net').database('IcmDataWarehouse').IncidentsSnapshotV2()
| where IncidentId in (icmlist)
| where OwningTeamName !contains "jarnold"
| extend OwningTeamName = case(
    OwningTeamName startswith "CLOUDPCSERVICE", split(OwningTeamName,"\\")[1],
    OwningTeamName startswith "WINDOWSVIRTUALDESKTOP" or OwningTeamName startswith "AZUREVIRTUALDESKTOP", strcat("AVD-",split(OwningTeamName,"\\")[1]),
    OwningTeamName)
| summarize count() by OwningTeamName
| order by count_ desc
```

## ICM Review Process

ICM query for pulling list: https://portal.microsofticm.com/imp/v3/incidents/search/advanced?sl=r2fh1jonhpa

### Custom Field Filtering Rules

- FollowUps = Yes → Include in report
- FollowUps = N/A → Exclude
- TSGCovered = False → Include
- Quality = Low/Medium → Include
- DCR = Yes → Exclude (tracked by product team)

### Supportability Dashboard

https://supportability.visualstudio.com/Windows365/_queries/query/57cc35fd-8304-46cc-b6c3-795516c3b012/

### Intake Form for ADO Items

https://aka.ms/WCXSupportabilityIntake — All ADO items created as "Issue"
