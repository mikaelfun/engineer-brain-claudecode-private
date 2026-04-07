---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Expert Troubleshooting/DIP and VIP availability for AppGW"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FExpert%20Troubleshooting%2FDIP%20and%20VIP%20availability%20for%20AppGW"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# DIP and VIP Availability for Application Gateway

## Key Concept

DIP (Data Path) availability and VIP availability metrics describe the **reachability of AppGW data plane instances** as seen by Azure SLB, **NOT** end-to-end application availability.

## Understanding DIP Availability

- Measures reachability of AppGW instances (backend IPs) as probed by Azure SLB
- Represents **AppGW instance health**, not direct customer application uptime
- A single unreachable instance causes availability to drop below 100%, even when traffic flows through other healthy instances
- **A reduction in DIP availability does NOT automatically mean customers were unable to access the Application Gateway**

## Behavior During Scale Events

### Scale-In (Removing instances)
- Selected VM is stopped, deallocated, NIC detached, removed from service
- SLB health probes fail → instance marked as Unreachable → DIP availability dips
- **Expected and by design**

### Scale-Out (Adding instances)
- New VM must boot, start AppGW process, complete initialization before responding to health probes
- Probes may fail briefly during startup → instance temporarily unhealthy
- Once fully running and probes succeed → added to backend pool → DIP availability returns to 100%

## Behavior During Repair Events

- Unhealthy instance (OS issue, platform fault, unresponsiveness) is removed and replaced
- During removal + replacement window → backend DIP temporarily unreachable → availability drops
- After replacement instance is provisioned and passes health probes → availability recovers
- **Short-lived dips are normal and do not inherently indicate customer impact**

## Example Scenario

1. Instance appgw_6442 becomes unhealthy → CPU drops to 0 at 09:43
2. SLB health probes fail → DIP availability drops below 100%
3. New instance appgw_6451 appears around 09:50, CPU gradually increases
4. appgw_6451 becomes healthy → DIP availability returns to 100% at 09:53
5. Traffic continued to be served by remaining healthy instance throughout

## What DIP Drops Do NOT Mean

- ❌ Service outage
- ❌ Customer-visible failure
- ❌ Configuration problem
- ✅ Always correlate with AppGW lifecycle events and customer error metrics before escalating
