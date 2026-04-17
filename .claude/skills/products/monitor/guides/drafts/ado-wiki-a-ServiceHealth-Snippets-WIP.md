---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Service Health/Service Health Snippets (WIP)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitoring%20Essentials%2FService%20Health%2FService%20Health%20Snippets%20(WIP)"
importDate: "2026-04-07"
type: troubleshooting-guide
---


[[_TOC_]]

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Important - This article is a WIP reference to various and potentially otherwise undocumented Service Health behaviors
</div>

&nbsp;

# Service Health Planned Maintenance UI
---   
This UI uses an ARG call under the hood that can be seen in the HAR trace, and will appear as such:
```
servicehealthresources  
������� | where type =~ 'Microsoft.ResourceHealth/events'  
������� | where properties.EventType in ('PlannedMaintenance')  
������� | where properties.LastUpdateTime >= ago(50d)  
������� | where properties.Status == 'Active'  
������� | project id, name, type, location, subscriptionId, properties
```

However, the UI itself then is also subject to any Azure Portal advanced subscription filters <b>and also filters out any events where the impactMitigationTime is less than the current time of the portal viewer.</b> 

Then, any records are rolled up by unique tracking Ids, and the count will be substantially smaller than what is returned by the ARG query in the HAR file. 

A better query to use as an analogue for the events that would get listed in the Portal UI here is:
```
servicehealthresources  
| where type =~ 'Microsoft.ResourceHealth/events'  
| extend eventType = properties.EventType, status = properties.Status, description = properties.Title, trackingId = properties.TrackingId, summary = properties.Summary, priority = properties.Priority, impactStartTime = properties.ImpactStartTime, impactMitigationTime = todatetime(tolong(properties.ImpactMitigationTime))  
| where eventType == 'PlannedMaintenance' and impactMitigationTime > now()
| distinct trackingId 
```
(amended from: https://learn.microsoft.com/en-us/azure/service-health/resource-graph-samples?tabs=azure-cli)

&nbsp;

# Service Health Health Advisories UI
---

Same as above, but the events are specific to Health Advisories, and the lookback time is less than ago(50d)

Health Advisories do not have Impacted Resources. 

&nbsp;

# Service Health Security Advisories UI
---

Same as above, but the events are specific to Security Advisories, and the lookback time is less than ago(50d)

&nbsp;

# Health History UI
---

There is no public facing APIs to perform the tasks such as requesting the PIR (Post Incident Review), so this cannot be done programmatically

![image.png](/.attachments/image-7165a455-1dde-4eb8-b0c4-993a8887e80d.png)
<i>Screenshot of the Health History UI from Classic mode</i>

&nbsp;

# Impacted Resources
--- 

Impacted Resources are not supported for Health Advisory events, only the Service Issues, Planned Maintenance, and Security Incidents. 

Longterm, the plan is for nearly all RPs using Service Health to also onboard to sending the impacted resources information through the BRAIN service. 
At time of writing, most RPs have not yet onboarded to this, so most Service Health events do not have impacted resources information. 

For Service Health event of any of the other 3 types, impacted resources are not mandatory. A subscription can be listed as a notified subscription without containing an impacted resource (this is very common).

A way to check ARG for any impacted resources and what event and event type they were associated with is the following:

```
servicehealthresources
| where type == "microsoft.resourcehealth/events/impactedresources"
| extend TrackingId = tostring(split(split(id, "/events/", 1)[0], "/impactedResources", 0)[0])
| join kind=fullouter  (
    servicehealthresources
    | where type =~ "microsoft.resourcehealth/events"
    | extend eventType = tostring(properties.EventType)
    )
    on $left.TrackingId == $right.name
| extend p1 = parse_json(properties1), p = parse_json(properties)
| project name1, subscriptionId1, targetResourceId= tostring(p.targetResourceId), ImpactMitigationTime = todatetime(tolong(p1.ImpactMitigationTime)), EventType = tostring(p1.EventType)
| order by EventType, name1, targetResourceId

```  
&nbsp;

A very internal method of attempting to validate if an event legitimately does not have any impacted resources information for a subscription is the following. We have little documentation for this table, but this <i>should</i> source the same results as ARG queries about a specific event. 

```
let startTime = ago(60d);
let endTime = datetime(now);
let subId = "PASTE_SUBSCRIPTION_ID";
let trkId = "PASTE_TRACKING_ID";
cluster('azsh.kusto.windows.net').database('azshmds').SystemTrace
| where �env_time between (startTime .. endTime)
| where Tag =~ "ServiceHealthEventsController_PostImpactedResources_Metadata"
| project Message, CorrelationId, env_time
| join kind = inner (
� ��cluster('azsh.kusto.windows.net').database('azshmds').SystemTrace
� ��| where env_time between (startTime .. endTime)
� ��| where Tag =~ "ServiceHealthEventsController_PostImpactedResources_IncidentIngestion"
� ��| where TrackingId =~ trkId
� ��| where SubscriptionId =~ subId
� ��| mv-expand parse_json(Impact)
) on CorrelationId
| project env_time, CorrelationId, Message, CommunicationId, Impact.internalId, Impact.resourceId, Impact.resourceName 
```
