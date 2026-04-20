---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/How To/How to Read MSEE Syslog Messages"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/How%20To/How%20to%20Read%20MSEE%20Syslog%20Messages"
importDate: "2026-04-18"
type: troubleshooting-guide
---

More Examples Coming Soon

If you are wanting to see something specific please reach out to @<F84DD2EA-3ED8-6E71-BBD4-86A47F7D8B78>

====

# How to Read MSEE Syslog Messages

[[_TOC_]]

**Note: Do not provide syslog output to customers in any format.**

## Description

This article details how to review and understand MSEE syslog messages.

## Overview

Syslog is a message logging standard. Syslog messages are generated from our MSEE's for events that take place. These messages are sent to a database that we can query to provide better understand about what happened at a specific point in time. If we didn't log syslog outside the router, we would only be able to see whats in the buffer which is typically 6-8 minutes depending on the amount of messages being logged. Each syslog message sent from the MSEE is categorized by Severity/Facility.

### Severity Levels:

| Value | Severity | Keyword |
|--|--|--|
| 0 | Emergency | emerg |
| 1 | Alert | alert |
| 2 | Critical | crit |
| 3 | Error | err |
| 4 | Warning | warning |
| 5 | Notice | notice |
| 6 | Information | info |
| 7 | Debug | debug |

### Facility Code

The MSEE routers are using local facilities local0-local7, which mean that these are locally defined on the device.

Reviewing the configurations, I can see that most are using facility `local1`.

## View/Find Syslog Messages

### Kusto Example
```
cluster('azphynet.kusto.windows.net').database('azdhmds').SyslogData
| where Device contains "-06gmr-cis-3" or Device contains "-06gmr-cis-4" //<------MSEEs
| where (PreciseTimeStamp > datetime(2021-03-27 05:00) and PreciseTimeStamp < datetime(2021-03-27 08:00)) //<------TimeStamp
| where Message contains "" or Message contains "" //<------VRFs or PE IP (Peer IP)
| project PreciseTimeStamp , Device , DeviceIp, EventName, Message , Severity , EventMessage, FacilityMessage //<------Columns to include
```

## Reading Syslog Message Format

**Syslog Output Message Example:**

"<141>32858283: Aug 3 03:11:49 UTC: %LINEPROTO-5-UPDOWN: Line protocol on Interface TenGigabitEthernet1/3/0, changed state to down"

| Message | Description |
|--|--|
| Aug 3 03:11:49 UTC | Timestamp |
| %LINEPROTO | The source that generated the message such as hardware, protocol, or even a module of the system software. |
| 5 | Severity Level / *Reference above Security Levels* |
| UPDOWN | Unique error for the message |
| Line protocol on Interface TenGigabitEthernet1/3/0, changed state to down | Description of the event |

## Most Seen Issues
### Interface Local Fault

Syslog Messages:

| PreciseTimeStamp | Device | Device IP | EventName | Message | Severity | Facility |
|--|--|--|--|--|--|--|
| 2021-08-03 03:11:49 | *-06gmr-cis-* | 0.0.0.0 | iosxe_spa-6-updown | Interface TenGigabitEthernet1/3/0, link down due to local fault | Informational | Local1 |
| 2021-08-03 03:11:50 | *-06gmr-cis-* | 0.0.0.0 | link-3-updown | Interface TenGigabitEthernet1/3/0, changed state to down | Error | Local1 |
| 2021-08-03 03:11:51 | *-06gmr-cis-* | 0.0.0.0 | lineproto-5-updown | Line protocol on Interface TenGigabitEthernet1/3/0, changed state to down | Notice | Local1 |

After further investigation, we can confirm that the interface went down due to a local fault. This resulted in an IcM and further investigation by ExR Ops. Please engage a TA via teams to confirm findings and before engaging in IcM to EEE.

Event names from syslog messages:
- iosxe_spa-6-updown
- link-3-updown
- lineproto-5-updown
