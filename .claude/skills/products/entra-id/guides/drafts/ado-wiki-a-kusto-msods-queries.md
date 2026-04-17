---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Troubleshooting tools/Kusto MSODS Queries"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Troubleshooting%20tools%2FKusto%20MSODS%20Queries"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Kusto MSODS Queries

## Introduction

### Intended Audience
CSS Cloud Identity Engineers

### Pre-Requisites
See [Access ServiceSide Logs](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=184043) for details on what is required to run the queries.

Specifics for MSODS Kusto Connection:
- **Data Source** = Any data points listed under section: Kusto EndPoint Information/MSODS

### General Documentation
https://aka.ms/Kusto contains in-depth information regarding Kusto, including a complete language reference.

## Key Variables

Each query uses the **let** statement with these standard variables:

```kql
let start = datetime(YYYY-MM-DDT00:00:00); //Replace: Start Time
let end = datetime(YYYY-MM-DDT00:00:00); //Replace: End Time
let correlationid = "00000000-0000-0000-0000-000000000000"; //Replace: Correlation ID
let searchterm = "00000000-0000-0000-0000-000000000000"; //Replace: search term
let role = "restdirectoryservice"; //Replace: Specific Role If Required. Case sensitive.
```

### Role Reference

| Role | Description |
|------|-------------|
| becwebservice | Msol cmdlets, O365 portal |
| directoryproxy | |
| restdirectoryservice | Aad cmdlets, Graph API |
| adminwebservice | AAD Connect |
| directoryprovisioning | |
| differentialqueryservice | Graph API Delta |
| windowsfabric | |
| windowsfabric-mtf | |
| secondaryreplica | |
| msods-syncservice | Back sync/Forward sync |
| companymanager | |

## Sample Queries

### Query by general search term (Any Field Contains)

```kql
let start = datetime("2018-04-11T07:48:00");
let end = datetime("2018-04-11T07:49:00");
let searchterm = "618a839e-a234-4081-9986-6cfce88a2e83";
find in (
cluster("msodsuseast").database("MSODS").IfxUlsEvents,
cluster("msodsuswest").database("MSODS").IfxUlsEvents,
cluster("msodsusncnt").database("MSODS").IfxUlsEvents,
cluster("msodsusscnt").database("MSODS").IfxUlsEvents,
cluster("msodsneu").database("MSODS").IfxUlsEvents,
cluster("msodsweu").database("MSODS").IfxUlsEvents,
cluster("msodseas").database("MSODS").IfxUlsEvents,
cluster("msodsseas").database("MSODS").IfxUlsEvents) where env_time >= start and env_time <= end and * contains searchterm;
```

### Query by CorrelationId and internalCorrelationId

```kql
let delta = 2m;
let id = "c85bb9bb-63df-49f2-9f57-064d96338e03"; // client-requestid or correlationID
let Timestamp = datetime(2022-04-26 02:32); // UTC timestamp
let icids = toscalar(
cluster("Msodsuseast").database("MSODS").GlobalIfxUlsEvents
| where env_time >= Timestamp - delta and env_time <= Timestamp + delta
| where internalCorrelationId == id or correlationId == id
| summarize makeset(internalCorrelationId));
cluster("Msodsuseast").database("MSODS").GlobalIfxUlsEvents
| where env_time >= Timestamp - delta and env_time <= Timestamp + delta
| where internalCorrelationId in (icids)
| project env_time, internalOperationType, tagId, message, internalCorrelationId, correlationId
```

### Query by CorrelationId (cross-cluster with chaining)

```kql
let start = datetime("2018-04-11T07:48:00");
let end = datetime("2018-04-11T07:49:00");
let CorrelationId = "618a839e-a234-4081-9986-6cfce88a2e83";
let firstPass = find in (
cluster("msodsuseast").database("MSODS").IfxUlsEvents,
cluster("msodsuswest").database("MSODS").IfxUlsEvents,
cluster("msodsusncnt").database("MSODS").IfxUlsEvents,
cluster("msodsusscnt").database("MSODS").IfxUlsEvents,
cluster("msodsneu").database("MSODS").IfxUlsEvents,
cluster("msodsweu").database("MSODS").IfxUlsEvents,
cluster("msodseas").database("MSODS").IfxUlsEvents,
cluster("msodsseas").database("MSODS").IfxUlsEvents) where env_time >= start and env_time <= end and * contains CorrelationId;
let cidsToSearch =
    toscalar(firstPass | summarize makeset(internalCorrelationId));
find in (
cluster("msodsuseast").database("MSODS").IfxUlsEvents,
cluster("msodsuswest").database("MSODS").IfxUlsEvents,
cluster("msodsusncnt").database("MSODS").IfxUlsEvents,
cluster("msodsusscnt").database("MSODS").IfxUlsEvents,
cluster("msodsneu").database("MSODS").IfxUlsEvents,
cluster("msodsweu").database("MSODS").IfxUlsEvents,
cluster("msodseas").database("MSODS").IfxUlsEvents,
cluster("msodsseas").database("MSODS").IfxUlsEvents) where env_time >= start and env_time <= end and internalCorrelationId in (cidsToSearch);
```

> **Note**: Data is split across UlsEvents (Bare Metal) and TofuEtwEvent (New Virtualization). Query both tables for completeness.
> AuditLoggingCommon events use **ifxAuditLoggingCommon** table with specific Operation Names.
