---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/How To/ExpressRoute Maintenance"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FHow%20To%2FExpressRoute%20Maintenance"
importDate: "2026-04-18"
type: troubleshooting-guide
---

# ExpressRoute Maintenance Guide

## Maintenance Types

- **Normal**: Alerts sent at least 2 weeks in advance
- **Emergency**: Alerts sent 1-2 days in advance
- **Cancelled**: Alerts that maintenance will be rescheduled

Primary and secondary MSEE maintenance never happens simultaneously. Secondary typically goes first.

## Validate Maintenance

```kql
cluster('azwan').database('OneWan').ExpressRouteCommsLog
| where MaintenanceStartTime >= ago(30d)
| where deviceName == "[MSEE device name]"
```

## MSEE Maintenance Procedure (automated via Clockwerk)

1. Pre-checks (interfaces and BGP status)
2. Set Maintenance Mode
3. Traffic Diversion (AS Path Prepend: 12076 x8)
4. Backup
5. Image/firmware Upgrade
6. Post Checks
7. Set Production Mode
8. Remove AS Path Prepend

## AS Path Prepending

During maintenance, AS prepended 8 times: "12076 12076 12076 12076 12076 12076 12076 12076"

**Customer requirements:**
- Must honor AS-path prepend for traffic to fail over
- Other BGP attributes (local preference, weight, MED) can override AS-path and prevent failover
- Custom maintenance procedures not available: "shared devices"

## BGP Metrics During Maintenance

During non-disruptive maintenance:
- SNMP polling paused (device marked offline)
- Azure metrics may falsely show BGP down
- BGP session actually remains UP

**Template response**: "BGP session was UP. SNMP polling was paused as device marked offline, causing metric to appear down. Known behaviour, not actual outage."

## Confirm MSEE Upgrade

```kql
cluster('azphynet.kusto.windows.net').database('azphynetmds').DeviceOSHistory
| where DeviceName == "" or DeviceName == ""
| project DeviceName, OSVersion, SysUpTime, SysUpTimeLastUpdateTime
```

## Verify Maintenance Timeline

```kql
cluster('phynetval').database('aznwmds').AzureAaaMasterSessions
| where TIMESTAMP between (datetime(2023-03-19 13:00) .. 1h)
| where deviceName =~ 'device-name'
| where command contains "as-path prepend" or command contains "as-path-prepend"
| project PreciseTimeStamp, deviceName, user, command
```

## Confirm Customer Notified

```kql
cluster('Icmcluster').database('ACM.Publisher').AlbnTargets
| where Subscriptions contains "<Subscription ID>"
| project CommunicationId
| join cluster('Icmcluster').database("ACM.Backend").PublishRequest on CommunicationId
| where CommunicationDateTime >= datetime(01-01-2024)
| project CommunicationDateTime, CommunicationType, Title, IncidentId, RichTextMessage
```

## Known Issues

### ASC IcM Communication Tracking URL
- Not Working: `https://portal.microsofticm.com/imp/v3/comms/trackingid/XXX`
- Workaround: `https://iridias.microsoft.com/maintenance?id=XXX`

## Customer Request Postpone Maintenance

Post to Teams for TA approval, then use ASC template: `ExpressRoute Maintenance Postpone Request`
