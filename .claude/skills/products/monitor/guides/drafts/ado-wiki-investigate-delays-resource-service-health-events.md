---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/How-To/Resource health/How to investigate delays with resource or service health events"
sourceUrl: "https://dev.azure.com/Supportability/6f9dfd80-6071-4f7b-8bf9-c97214ca68cf/_wiki/wikis/bebfc12e-d2ce-4ed1-8a64-d64c20264fd2?pagePath=%2FAlerts%2FHow-To%2FResource%20health%2FHow%20to%20investigate%20delays%20with%20resource%20or%20service%20health%20events"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to investigate delays with resource or service health events

## Before You Begin

To investigate Resource health / Service health event latency, you will need to ensure you have installed Kusto Explorer and added connections for the **azureinsights** Kusto cluster.

## Information you will need

- CorrelationId of the Service or Resource Health event.
- Subscription Id.

## Service Health

### Event data flow

Service Health events flow: Azure Communications Manager → OBO (OnBehalfWorker) → Customer destinations

### Troubleshooting

**Step 1: Get blobPath consuming service health event and event submission time by Azure communications manager.**

- Use [Jarvis query](https://portal.microsoftgeneva.com/s/821C837C).
- Update the Time range according to the event timestamp.
- Replace **CORRELATIONIDGOESHERE** with the Service health event correlation Id.
- Replace **SUBSCRIPTIONGOESHERE** with the customer's subscription in format: `/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`.

Check: **Is there a substantial delay between Time and PreciseTimeStamp columns (more than a few minutes)?**

- **No** → Proceed to next step.
- **Yes** → Delay is upstream from OBO. Open a CRI to Service health team using [escalation template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=r3O263).

**Step 2: Determine processing time in OBO.**

OBO received event query (azureinsights / Insights database):

```kql
let startTime = STARTTIMEGOESHERE;
let endTime = ENDTIMEGOESHERE;
InputBlobFirstTagMetadata
| where PreciseTimeStamp between (startTime ..endTime)
| where recordCountByCategories contains "servicehealth"
| where Role =~"OnBehalfWorker"
| where blobPath contains "BLOBPATHGOESHERE"
| where firstTagValue contains "SUBSCRIPTIONGOESHERE"
```

OBO exported event query:

```kql
let startTime = STARTTIMEGOESHERE;
let endTime = ENDTIMEGOESHERE;
HoboPostTelemetry
| where PreciseTimeStamp between (startTime ..endTime)
| where firstPartyBlobPath contains "BLOBPATHGOESHERE"
| where isFailed==false
| where customerIdentities contains "SUBSCRIPTIONIDOGESHERE"
```

Compare PreciseTimeStamp between queries. **Is the time difference more than 15 minutes?**

- **No** → Check unique resources in blob. If count > 4000, delay up to 15 minutes is expected.

```kql
let startTime = STARTTIMEGOESHERE;
let endTime = ENDTIMEGOESHERE;
InputBlobFirstTagMetadata
| where PreciseTimeStamp between (startTime ..endTime)
| where Role =~"OnBehalfWorker"
| where recordCountByCategories contains "resourcehealth" or recordCountByCategories contains "servicehealth"
| where blobPath contains "BLOBPATHGOESHERE"
| distinct firstTagValue
| count
```

- **Yes** → Delay was introduced in OBO. Open a CRI to Activity logs PG using **Azure Monitor | Activity Logs** escalation template.

## Resource Health

### Event data flow

Resource Health events flow: GHS → OBO → Customer destinations

### Troubleshooting

**Step 1: Get blobPath consuming resource health event and event submission time by GHS.**

- Use [Jarvis query](https://portal.microsoftgeneva.com/s/55B6053D).
- Replace **CORRELATIONIDGOESHERE** with the resource health event correlation Id.
- Replace **RESOURCEIDGOESHERE** with the ARM resource Id.

Check: **Is there a substantial delay between Time and PreciseTimeStamp?**

- **No** → Proceed to step 2.
- **Yes** → Delay is upstream from OBO. Open CRI to Geneva health team using [escalation template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=s1k2V2).

**Step 2: Determine processing time in OBO.**

Same queries as Service Health but use `resourcehealth` category. Same decision logic:
- Time diff > 15 min → OBO delay, CRI to Activity Logs PG
- Time diff ≤ 15 min → Check unique resource count; > 4000 means expected delay (see #57923)
