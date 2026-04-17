---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/Advanced Troubleshooting/Troubleshoot BGP flapping between ExpressRoute and Customer On-Premises"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FTroubleshoot%20BGP%20flapping%20between%20ExpressRoute%20and%20Customer%20On-Premises"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Troubleshoot BGP flapping between ExpressRoute and Customer On-Premises

[[_TOC_]]

Use the following guidance in determining the scope and next steps for cases involving BGP flapping between ExpressRoute and Customer On-Premises. These cases may have a customer verbatim like: "Intermittent flapping on the secondary BGP session to Azure ExpressRoute Circuit. Flapping started on Mar 18 23:13 UTC. My ISP says Azure isn't responding."

The ExpressRoute Circuit Dashboard (found in Azure Support Center properties pane and clicking on the Circuit Dashboard link) will show the BGP health flap in the chart "SubInterface --> CustomerPeerIp."

Link BGP flapping typically correlates with physical connectivity failure somewhere on the layer-2 physical path. The break may happen between the MSEE and the customer's ISP equipment in the colo or somewhere in the ISP's network.

Likely Support Topic: ExpressRoute\Connectivity issues\Connectivity to Azure Private, Azure Public or Dynamics 365 Services.

> Applies to standard ExpressRoute circuits, not ExpressRoute Direct.

## Prerequisites
- Circuit Resource Id: Confirm the circuit with the customer to ensure you look at the correct circuit in ASC.

## ExpressRoute Architecture Review

ExpressRoute customers use an ISP to physically connect their on-premises network to Azure. The physical Ethernet connection between the service provider interface and the MSEE (cross-connect) is shared between all customers of the same SP on the MSEE. Q-in-Q tags on sub-interfaces logically divide the shared link per customer.

## Troubleshooting Steps

### Step 1 — Get Circuit Details from ASC

Use DumpCircuitInfo in ASC to collect:
1. **Customer peering sub-interface name** (e.g. `TenGigabitEthernet0/3/0.100`)
2. **Service provider parent interface** (e.g. `TenGigabitEthernet0/3/0`)
3. **Bandwidth of parent interface** (BW value, e.g. 10000 = 10Gbps)

Identify which MSEE is affected by checking the BGP health chart in Circuit Dashboard — the one whose line drops is the affected device.

### Step 2 — Check Parent Interface Utilization via CoreTools

Login at https://aka.ms/coretools and browse to the specific interface:
```
https://coretools.azurefd.net/#/interface/home?target={MSEE-name},{interface-url-encoded}
```
Note: `/` in interface names → encoded as `%2F`

> ⚠️ Do NOT share CoreTools graphs with customer — they contain proprietary information (link speed, co-tenant count).

**Interpret the graph:**
- **No sharp drop in bandwidth** → link between MSEE and SP was stable → issue is specific to the customer circuit → respond to customer to follow up with their SP
- **Sharp drop in bandwidth** → physical link failure between MSEE and SP → proceed to Step 3

**Template response (no bandwidth drop):**
> We have reviewed the telemetry on the ExpressRoute edge router and observed your instance of BGP flapping on the hour interval starting at `<time>` UTC was due to no response received from your peer. We validated that the circuit between us and your provider `<SP>` had sufficient capacity for the duration of that time and no link failures were observed. Therefore, this appears to be specific to your circuit. Please follow up with `<SP>` and inform them that we have investigated our device and found the BGP flaps to be specific to your circuit.

### Step 3 — Search Syslog for Physical Interface Flapping

If bandwidth showed a sharp drop, query syslog:

```kusto
cluster('azphynet.kusto.windows.net').database('azdhmds').SyslogData
| where PreciseTimeStamp between (datetime(YYYY-MM-DD HH:mm) .. datetime(YYYY-MM-DD HH:mm))
| where Device == "{MSEE-device-name}"
| where Message contains "UpDown"
| where Message contains "{parent-interface-name}"
| project PreciseTimeStamp, Message
```

If you see: `%LINK-3-UPDOWN: Interface TenGigabitEthernet0/3/0, changed state to down` → physical link between MSEE and SP failed.

### Step 4 — Check for Existing ICM

Search ICM for the MSEE name. If ExpressRoute Ops already reached out to the SP for an RCA, reference that ICM.

### Step 5 — Escalation Decision

- If existing ICM found with RCA → reference it
- If no ICM, bandwidth near capacity, or errors on link → create CRI to EEE after TA validation
  - Currently on-going → use Sev A template in ASC
  - Historical RCA → use non-Sev A template

# Contributors
@AAD67C1A-C862-4157-995E-B930B4652CED
