---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Tools/Jarvis/How to run a Test Traffic from Jarvis and Get VFP ( ACL and VNET) programmed in containers"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FTools%2FJarvis%2FHow%20to%20run%20a%20Test%20Traffic%20from%20Jarvis%20and%20Get%20VFP%20(%20ACL%20and%20VNET)%20programmed%20in%20containers"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Running Test Traffic and other Network Diagnostics from Jarvis

## Overview

For checking connectivity from an AKS node to a given IP address, the usual procedure is to use the Test Traffic tool under the Diagnostics section for a given VM. This tool does not always work, and also it does not send any packet - it just inspects the NSG and Routes.

A better option, although more labour intensive, is to use Jarvis.

## Procedure

To use Jarvis we first need to collect some fabric related info about the node we want to test:

- Tenant/Fabric Host
- Node ID
- Container ID

Run the following Kusto query:

```txt
let startTime=datetime(2021-04-09T13:00:00Z);
let endTime=datetime(2021-04-09T23:59:00Z);
cluster('azurecm.kusto.windows.net').database('AzureCM').LogContainerSnapshot
| where PreciseTimeStamp between (startTime..endTime)
| where subscriptionId == "{subscription}"
| where roleInstanceName contains "{AKS NODE VMSS INSTANCE NAME}"
| project PreciseTimeStamp, Fabric_Host=Tenant, Node_ID=nodeId, Container_ID=containerId
| top 1 by PreciseTimeStamp desc
```

After getting this info, open Jarvis-Actions on your SAVM and select **SupportabilityFabric > Fabric Operations > Get VFP Filters (ACL and VNET) programmed on containers**

Short Link: <https://jarvis-west.dc.ad.msft.net/CB93FE86>

After filling the Fabric related fields, scroll down and fill:

- VFPFilter Commands: **process-tuples**
- VPPFilter Options: **<Protocol-6 TCP/17 UDP> <Source IP> <Source Port> <Destination IP> <Destination Port> <direction> <1/0 TCP SYN>**

Example: test TCP connection from node DIP to API Server IP on port 443 sending a TCP SYN.

After pressing RUN, copy the RAW output to Notepad++ and use the **Fix_JARVIS_RAW** macro to make it human-readable.

The final output shows the flow action with Source IP/Port (Outbound IP/SNAT Port of cluster LB) and Destination IP/Port.
