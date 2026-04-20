---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/Review/ExR Cheat Sheet - Draft"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/Review/ExR%20Cheat%20Sheet%20-%20Draft"
importDate: "2026-04-18"
type: troubleshooting-guide
---


# ExpressRoute Quick Reference Sheet

# Description
This quick reference is an introductory part of ExpressRoute, for deep analysis and investigation kindly use the Wiki. [ExpressRoute – Overview](https://msazure.visualstudio.com/AzureWiki/_wiki/wikis/AzureWiki.wiki/177390/ExpressRoute)

## Quick Reference Sheet

| Basics | Keynote | Tools |
|---|---|---|
| - Circuit provisioning state <br>- Verify the Service Key <br>- DumpCircuit info: On ASC > ExpressRoute circuit > 'Diagnostics' tab <br>- DumpRouting info: On ASC > ExpressRoute circuit > 'Diagnostics' tab <br>- Peering Types (Private Peering, Public Peering, Microsoft Peering) <br>- Device names and Location | - Verify DumpCircuit Info shows Provisioning state “Enabled” <br>**ELSE** <br>Ask customer to check with Provider <br>- Note neighbor peer IP for both Primary / Secondary IP from DumpCircuit Info <br>e.g. <br>Peer IP: 10.0.0.5 <br>Subnet: 10.0.0.4/30 | - Circuit Dashboard: Peering Health / Customer peer IP and BGP State. <br>- Dump Circuit: Service Key, SKU, Billing Type, Service Provider Tag, Provisioning State, VLAN ID (Ctag), Subinterface. <br>- Dump Routing: Routing info, ARP info, BGP State. <br>- Syslog: [Syslog Portal](https://portal.microsoftgeneva.com/s/F5E973CB) <br>- Wiki: [How to Read MSEE Syslog Messages – Overview](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/486865/How-to-Read-MSEE-Syslog-Messages) <br>- [Core Tools](https://coretools.azurefd.net/#/) <br>- [Eagle Eye](https://eagleeye.trafficmanager.net/diagnostics/Home/EagleEye) <br>- [NetVMA](https://netvma.azure.net/) <br>- [ASI](https://asi.azure.ms/) |

| **Private Peering** |  | **Routing** |
|---------------------|--|-------------|
| - Validate Circuit is provisioned: ASC / Dump Circuit<br>- Validate BGP State (Up/Down): Circuit Dashboard<br>- Check Arp table is complete OR Missing<br>- VM SKU bandwidth limit<br>- **Note: Utilize listed tools for TSG** | [![Expressroute Quick Reference Sheet](/.attachments/ExpressrouteQuickReferenceSheet.png =400x)](/.attachments/ExpressrouteQuickReferenceSheet.png) <br> **Note:** This quick reference is an introductory part of ExpressRoute, for deep analysis and investigation kindly use the Wiki. [ExpressRoute – Overview](https://msazure.visualstudio.com/AzureWiki/_wiki/wikis/AzureWiki.wiki/177390/ExpressRoute) | - When customer has 2 ExpressRoute connections, consider the routing weight… highest routing weight takes Priority<br>- The path with shortest AS_Path is preferred |

| **Scenario: [Check with Provider/cx](#**check-with-provider/cx**)** | **Scenario: [CX report connectivity loss](#**cx-report-connectivity-loss**)** | **Scenario: [Performance issue reported](#**performance-issue-reported**)** |
|--------------------------------------|------------------------------------------|------------------------------------------|
| **IF**<br>- State/PfxRcd is showing Zero, which implies no BGP address is advertised (provider/cx needs to investigate BGP advertisement on their end)<br>- Up/Down shows Idle, which might imply there is no Route established or refused by neighbor… (provider/cx needs to investigate BGP advertisement on their end) | - Check Dumprouting for recent BGP flap<br>- Check Syslog / Gateway Tenant logs to investigate why connection flapped<br>- Check Core tools to investigate parent interface and sub interface to isolate issue. | - Use Debug ACL during test<br>- Run iperf3 test<br>- MSEE Capture (last resort)<br>- Check for discrepancies to isolate issue from test conducted.<br>- Wiki for Perf issues: [ExpressRoute Performance – Overview](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/890521/ExpressRoute-Performance)<br>- [ExpressRoute Performance Advanced – Overview](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/134205/ExpressRoute-Performance-Advanced) |



## Mermaid Format:

###Basics

::: mermaid
flowchart TD
  %% === Groups (match original columns) ===
  subgraph BASICS["Basics"]
    B1["Circuit provisioning state"]
    B2["Verify the Service Key"]
    B3["DumpCircuit info: On ASC > ExpressRoute circuit > 'Diagnostics' tab"]
    B4["DumpRouting info: On ASC > ExpressRoute circuit > 'Diagnostics' tab"]
    B5["Peering Types (Private Peering, Public Peering, Microsoft Peering)"]
    B6["Device names and Location"]
  end
  subgraph KEYNOTE["Keynote"]
    K1["Verify DumpCircuit Info shows Provisioning state \"Enabled\""]
    K2["ELSE: Ask customer to check with Provider"]
    K3["Note neighbor peer IPs for Primary/Secondary from DumpCircuit Info"]
    K4["Example: Peer IP 10.0.0.5 | Subnet 10.0.0.4/30"]
  end
  subgraph TOOLS["Tools"]
    T1["Circuit Dashboard: Peering Health / Customer peer IP / BGP State"]
    T2["Dump Circuit: Service Key, SKU, Billing, Provider Tag, Provisioning State, VLAN (Ctag), Subinterface"]
    T3["Dump Routing: Routing info, ARP info, BGP State"]
    T4["Syslog portal"]
    T5["Wiki: How to Read MSEE Syslog Messages"]
    T6["Core Tools"]
    T7["Eagle Eye"]
    T8["NetVMA"]
    T9["ASI"]
  end

%% Optional relationships
  BASICS --> TOOLS
  %% Clicks
  click T4 "https://portal.microsoftgeneva.com/s/F5E973CB" "Open Syslog portal" _blank
  click T5 "https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/486865/How-to-Read-MSEE-Syslog-Messages" "Open MSEE Syslog Wiki" _blank
  click T6 "https://coretools.azurefd.net/#/" "Open Core Tools" _blank
  click T7 "https://eagleeye.trafficmanager.net/diagnostics/Home/EagleEye" "Open Eagle Eye diagnostics" _blank
  click T8 "https://netvma.azure.net/" "Open NetVMA" _blank
  click T9 "https://asi.azure.ms/" "Open ASI" _blank
 
  %% === High‑level relationships ===
  BASICS --> KEYNOTE
  BASICS --> TOOLS
  %% === Optional internal flows ===
  K1 --> K2
  K3 --> K4
  T1 --> T2
:::

###Private Peering
::: mermaid
flowchart TD
  subgraph PRIVATE["Private Peering"]
    P1["Validate circuit is provisioned (ASC / Dump Circuit)"]
    P2["Validate BGP State (Up/Down) — Circuit Dashboard"]
    P3["Check ARP table — complete or missing"]
    P4["VM SKU bandwidth limit"]
    P5["Note: Utilize listed tools for TSG"]
  end
  subgraph ROUTING["Routing"]
    R1["Two ExpressRoute connections: consider routing weight (higher wins)"]
    R2["AS_Path shortest path is preferred"]
  end
  PRIVATE --> ROUTING
  P2 --> R1
:::

##Scenarios together
::: mermaid
flowchart TD
  %% Scenario 1: Provider / CX checks
  subgraph S1["Scenario: Check with Provider / CX"]
    S1A["If State/PfxRcd = 0 → no BGP routes advertised on provider/CX side"]
    S1B["If Up/Down shows Idle → no route established or neighbor refused"]
    S1N["Note: This is an introductory quick reference; use the full Wiki for deep analysis"]
  end

%% Optional relationships
click S1N "https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/134205/ExpressRoute-Performance-Advanced" "Open Expressroute Performance Advance Wiki" _blank

  %% Scenario 2: Connectivity loss
  subgraph S2["Scenario: CX reports connectivity loss"]
    S2A["Check DumpRouting for recent BGP flap"]
    S2B["Check Syslog / Gateway Tenant logs to investigate flap cause"]
    S2C["Use Core Tools to inspect parent & subinterfaces"]
  end
  %% Scenario 3: Performance issue
  subgraph S3["Scenario: Performance issue reported"]
    S3A["Use Debug ACL during tests"]
    S3B["Run iperf3 test"]
    S3C["MSEE Capture (last resort)"]
    S3D["Compare measurements to isolate discrepancies"]
  end
  %% Light relationships between scenarios and tooling
  S2A --> S2B
  S2B --> S2C
  S3A --> S3B
  S3B --> S3C
:::


##Scenarios
### **Check with Provider/cx**
::: mermaid
flowchart TD
  CL0["Connectivity loss reported"] --> CL1["DumpRouting: check recent BGP flaps"]
  CL1 --> D1{"Flaps detected?"}
  D1 -->|Yes| CL2["Correlate with Syslog / Gateway Tenant log events"]
  D1 -->|No| CL3["Inspect parent/subinterfaces and counters in Core Tools"]
  CL2 --> CL4["Root-cause from logs (auth, hold timers, neighbor resets)"]
  CL4 --> CL5["Validate neighbor state (Up/Down) on Circuit Dashboard"]
  CL5 --> D2{"Neighbor Up?"}
  D2 -->|Yes| CL6["Validate PfxRcd > 0"]
  D2 -->|No| CL7["Verify peer reachability, ASN, auth, VLAN/Ctag; collect neighbor IPs from DumpCircuit"]
  CL6 --> D3{"Prefixes received?"}
  D3 -->|Yes| CL8["Confirm traffic path restored; end‑to‑end verification"]
:::
 
### **CX report connectivity loss**
::: mermaid
flowchart TD
  PF0["Performance issue reported"] --> PF1["Enable Debug ACL (temporary, during test window)"]
  PF1 --> PF2["Run iperf3 (directional, multiple streams)"]
  PF2 --> PF3["Compare to ER/VM SKU bandwidth expectations"]
  PF3 --> D4{"Below expected?"}
  D4 -->|Yes| PF4["Check loss/latency/jitter; inspect interface counters"]
  D4 -->|No| PF5["Validate app‑level bottlenecks (CPU, disk, TLS, etc.)"]
  PF4 --> PF6["If unresolved: schedule MSEE Capture (last resort)"]
:::
 
###  **Performance issue reported** 

::: mermaid
flowchart TD
  PR0["Zero PfxRcd / BGP 'Idle' or 'Down'"] --> PR1["Circuit Dashboard: confirm state"]
  PR1 --> D5{"Idle or Down?"}
  D5 -->|Idle| PR2["Verify BGP params (ASN, auth, timers); ensure session can establish"]
  D5 -->|Down| PR3["Check L2/L3 reachability (ARP/MAC/IP), subinterface/VLAN mapping"]
  PR2 --> PR4["Confirm provider/CX route export policy active; check communities/route‑maps"]
  PR3 --> PR5["DumpRouting ARP/BGP: neighbor MAC/IP; trace path to peer"]
  PR4 --> D6{"Routes now advertised?"}
  D6 -->|Yes| PR6["PfxRcd increases; validate best path (AS_Path, local pref, MED)"]
:::

#Contributors
@<5EB62ADA-BD61-6FC3-9B2A-35767ECFBC17> (Author)

@<6E9FCDB5-A7B7-4CD7-AB48-1C69FB220B96> 