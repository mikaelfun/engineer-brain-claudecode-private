---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/How To/Check for Auto-Created ICMs for ExpressRoute"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/How%20To/Check%20for%20Auto-Created%20ICMs%20for%20ExpressRoute"
importDate: "2026-04-18"
type: troubleshooting-guide
---

[[_TOC_]]

## Description

Check for Auto-Created ICMs for ExpressRoute

## Scenario

Customer opens a support case complaining about ExpressRoute issues. 

## Investigation

- We have monitoring that auto-creates ICMs to ErOps for multiple scenerios. 
- We need to associate the customer SR with the ErOps ICM
- No need to talk to TA or EEE first for approval
- ICM to ops already exists and SR owner can reach out directly to the ICM owner
- Case owner can find symptoms by obtaining **MSEE device names** and **VRF names** from **ASC**
- Plug those values into the following Kusto query to confirm/deny the reported customer issue (optional: change the time value):

``` 
 cluster('azphynet.kusto.windows.net').database('azdhmds').SyslogData
 | where Device == "lon04-06gmr-cis-3" or Device == "lon04-06gmr-cis-4" 
 | where PreciseTimeStamp >= ago(1d)
 | where Message contains "bcaa71599e864160bc85f0395607a187" or Message contains "33fbe71c7d91457ea39a70b819284d86"
 | project PreciseTimeStamp , Device , Message , Severity , EventMessage 
 | order by PreciseTimeStamp asc nulls last
```

- The case owner should make note of the **neighbor IP addresses** mentioned in the **Message** column.

## BGP Down Example: 

|                      |                   |                                                                                                                                                                                              |              |                  |
| -------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ---------------- |
| **PreciseTimeStamp** | **Device**        | **Message**                                                                                                                                                                                  | **Severity** | **EventMessage** |
| 11/11/2017           | lon04-06gmr-cis-3 | neighbor 192.168.11.9 vpn vrf 33fbe71c7d91457ea39a70b819284d86 Down BGP Notification sent                                                                                                    | Notice       |                  |
| 11/11/2017           | lon04-06gmr-cis-3 | neighbor 192.168.11.9 IPv4 Unicast vpn vrf 33fbe71c7d91457ea39a70b819284d86 topology base removed from session  BGP Notification sent                                                        | Notice       |                  |
| 11/11/2017           | lon04-06gmr-cis-3 | 26637: Nov 11 08:50:01 UTC: %BGP-5-ADJCHANGE: neighbor 192.168.11.9 vpn vrf 33fbe71c7d91457ea39a70b819284d86 Down BGP Notification sent                                                      | Notice       |                  |
| 11/11/2017           | lon04-06gmr-cis-3 | 26638: Nov 11 08:50:01 UTC: %BGP\_SESSION-5-ADJCHANGE: neighbor 192.168.11.9 IPv4 Unicast vpn vrf 33fbe71c7d91457ea39a70b819284d86 topology base removed from session  BGP Notification sent | Notice       |                  |

Use the following Kusto query to query for ICMs auto-created in the last 7 days for the affected MSEE(s):

``` 
 cluster("icmcluster").database("IcmDataWarehouse").Incidents 
 | where CreateDate >= ago(7d)
 | where OccurringDeviceName == "lon04-06gmr-cis-3" 
 | where MonitorId == "PeeringBgpDown" 
 | summarize by IncidentId , CreateDate , OwningContactAlias , Status , Title , Mitigation , MitigatedBy , MitigateDate  , ResolveDate , ResolvedBy , SupportTicketId , SubscriptionId
 | order by CreateDate desc nulls last
```

|                |                |                        |            |                                                                         |                                       |                 |                  |                 |                |                     |                    |
| -------------- | -------------- | ---------------------- | ---------- | ----------------------------------------------------------------------- | ------------------------------------- | --------------- | ---------------- | --------------- | -------------- | ------------------- | ------------------ |
| **IncidentId** | **CreateDate** | **OwningContactAlias** | **Status** | **Title**                                                               | **Mitigation**                        | **MitigatedBy** | **MitigateDate** | **ResolveDate** | **ResolvedBy** | **SupportTicketId** | **SubscriptionId** |
| 51496179       | 11/11/2017     | v-sathp                | ACTIVE     | \[PeeringBgpDown\] MSEE \[lon04-06gmr-cis-3\] is unhealthy.             |                                       |                 |                  |                 |                |                     |                    |
| 51496179       | 11/11/2017     | v-sathp                | ACTIVE     | \[PeeringBgpDown\] MSEE \[lon04-06gmr-cis-3\] is unhealthy.\[Flapping\] |                                       |                 |                  |                 |                |                     |                    |
| 51227912       | 11/7/2017      | v-sathp                | ACTIVE     | \[PeeringBgpDown\] MSEE \[lon04-06gmr-cis-3\] is unhealthy.             |                                       |                 |                  |                 |                |                     |                    |
| 51227912       | 11/7/2017      | v-gogopi               | RESOLVED   | \[PeeringBgpDown\] MSEE \[lon04-06gmr-cis-3\] is unhealthy.             | BGP is up. Hence, Closing the ticket. | v-gogopi        | 11/8/2017        | 11/8/2017       | v-gogopi       |                     |                    |
| 51227912       | 11/7/2017      |                        | ACTIVE     | \[PeeringBgpDown\] MSEE \[lon04-06gmr-cis-3\] is unhealthy.             |                                       |                 |                  |                 |                |                     |                    |
| 51120232       | 11/6/2017      | v-swkich               | ACTIVE     | \[PeeringBgpDown\] MSEE \[lon04-06gmr-cis-3\] is unhealthy.             |                                       |                 |                  |                 |                |                     |                    |
| 51120232       | 11/6/2017      | v-yaseet               | RESOLVED   | \[PeeringBgpDown\] MSEE \[lon04-06gmr-cis-3\] is unhealthy.             | peer is up hence closing the incident | v-yaseet        | 11/7/2017        | 11/7/2017       | v-yaseet       |                     |                    |
| 51041257       | 11/5/2017      | v-gogopi               | RESOLVED   | \[PeeringBgpDown\] MSEE \[lon04-06gmr-cis-3\] is unhealthy.             | BGP is up. Hence, Closing the ticket. | v-gogopi        | 11/5/2017        | 11/5/2017       | v-gogopi       |                     |                    |
| 51041257       | 11/5/2017      | v-yaseet               | ACTIVE     | \[PeeringBgpDown\] MSEE \[lon04-06gmr-cis-3\] is unhealthy.             |                                       |                 |                  |                 |                |                     |                    |
| 51041263       | 11/5/2017      | v-gogopi               | RESOLVED   | \[PeeringBgpDown\] MSEE \[lon04-06gmr-cis-3\] is unhealthy.             | BGP is up. Hence, Closing the ticket. | v-gogopi        | 11/5/2017        | 11/5/2017       | v-gogopi       |                     |                    |
| 51041263       | 11/5/2017      |                        | ACTIVE     | \[PeeringBgpDown\] MSEE \[lon04-06gmr-cis-3\] is unhealthy.             |                                       |                 |                  |                 |                |                     |                    |
| 51041263       | 11/5/2017      | v-yaseet               | ACTIVE     | \[PeeringBgpDown\] MSEE \[lon04-06gmr-cis-3\] is unhealthy.             |                                       |                 |                  |                 |                |                     |                    |

- The case owner should make note of the most recent **IncidentId(s)** and the **OwningContactAlias** that are still showing **Status = ACTIVE**
- The case owner should open each active incident in the ICM portal and view the **Description** section to see if the **neighbor IP** noted from Syslog for their customer matches the neighbor IP mentioned in the ICM.
- [IcM Portal](http://aka.ms/icm)
- If you believe this has impacted you, reach out to a TA via ExpressRoute teams channel to confirm your findings and provide next steps.

BGP Down is just one scenerio in which ExpressRoute Ops monitors.

## Other Scenerios

You can find a list of what ExpressRoute monitors. Please keep in mind that not all things monitored are signs that customer experienced issues on the MSEE.

Using the following kusto query you can pick a specific device and see what IcM's have been triggered based on the MonitorID field. 

```
cluster("icmcluster").database("IcmDataWarehouse").Incidents 
 | where CreateDate >= ago(30d)
| where OccurringDeviceName contains "exr01.ash"
| order by CreateDate desc nulls last
| summarize count() by MonitorId

```
Example Output: 

```
MonitorId	               count_
SnmpTimeOut	               122
VoiceQueueDrop_Parent	        12
InteractiveQueueDrop_Parent	10
LinkDownV2	                10
```
You can then further investigate. 

The easiest way to determine if there was an issue during the last 30 days is type the MSEE device into IcM portal search and narrow your search down by the date either customer saw the issue or by the syslog messages. 

## Contributors

- @<47E6F91A-5EDD-6B53-9AB9-8E55599D70DA>
- @<F84DD2EA-3ED8-6E71-BBD4-86A47F7D8B78> 
