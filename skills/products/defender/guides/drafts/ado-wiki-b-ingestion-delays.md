---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Analytics/Ingestion Delays"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Microsoft%20Sentinel%20Wiki/Analytics/Ingestion%20Delays"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Sentinel Alert Ingestion Delay query

```q
SecurityAlert
| where ProductName == "{ProductName}"
| extend SourceProviderLatency = ingestion_time() - TimeGenerated
| extend SentinelLatency = TimeGenerated - ProcessingEndTime
| project SystemAlertId, DisplayName, SourceProviderLatency , SentinelLatency, _TimeReceived
```

## Notes:

- **StartTime**: time of the first event in the impact time window that triggered the alert
- **EndTime**: time of the last event in the impact time window that triggered the alert
- **ProcessingEndTime**: time the creation/processing of the alert was done at the provider side and ready to be published

# Sentinel Incident Delay queries

```q
SecurityIncident
| extend IncidentIngestionLatency = ingestion_time() - TimeGenerated
| project TimeGenerated, ingestion_time(), IncidentIngestionLatency, AlertIds, IncidentNumber, ProviderIncidentId, Title, _TimeReceived
```

```q
SecurityIncident
| where IncidentName == ""
| project TimeGenerated, TimeReceived=_TimeReceived, IngestionTime=ingestion_time()
| extend delayUntilLAInSeconds = (TimeReceived-TimeGenerated)/1s, delayInLAInSeconds=(IngestionTime-TimeReceived)/1s
```

## Notes

- **ingestion_time()**: when it was written to Kusto and available for query (LA - Log Analytics)
- **TimeGenerated**: Timestamp (UTC) of when the incident was ingested (Sentinel)
- **_TimeReceived**: when it reached ingestion pipeline of LA (Scuba)

Relationship: **ingestion_time() > _TimeReceived**

If ingestion_time() and _TimeReceived do not have any delay, then the delay is most probably with the provider.

The above queries can be used for all 1st Party Connectors (DeviceEvents, etc.)

# Effect on analytic rules

Ingestion delays can cause alerts and incidents to be triggered later than expected.

The analytic rule runs and gets 0 results. It runs again one hour later. If it finds results the second time, the logs were delayed.

Check in SentinelHealth directly:

```q
SentinelHealth
| where OperationName=="Scheduled analytics rule run"
| where Status!="Success"
| extend CorrelationId=tostring(ExtendedProperties.CorrelationId),Issues=ExtendedProperties.Issues
| where CorrelationId=="{CORRELATION_ID}"
```

It will appear with the Issue "IngestionDelay".

# MDE Device Events Delay

For Device Events delay from M365D/XDR Connector:

```
cluster("https://wcdprod.kusto.windows.net").database("Geneva").InvestigationMachine("<DeviceId>",-8d,0d,1h)
```

If there is a communication gap, the issue is 100% with MDE and not with Sentinel.

# Other XDR related Events Delay

```q
<TABLE>
| where TimeGenerated between (datetime(2022-04-28 18:00:00) .. datetime(2022-04-28 20:35:00))
| extend IngestionLatency = ingestion_time() - _TimeReceived
| extend ReceiveLatency = _TimeReceived - TimeGenerated
| summarize percentiles(IngestionLatency, 50, 95, 99), percentiles(ReceiveLatency, 50, 95, 99) by bin(TimeGenerated, 6h)
| order by TimeGenerated
```

If ReceiveLatency is high, the source is not sending data to LAW pipeline in timely manner -- escalate to source provider PG.
