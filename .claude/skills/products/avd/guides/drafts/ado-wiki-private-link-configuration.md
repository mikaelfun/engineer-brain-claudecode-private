---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/Archived Content/Deprecated Content/DEPRECATED_Understanding Private Link Configuration in AVD"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=/Sandbox/Archived%20Content/Deprecated%20Content/DEPRECATED_Understanding%20Private%20Link%20Configuration%20in%20AVD"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Understanding Private Link Configuration in AVD

> Note: This page is deprecated. For current guidance, see [Azure Virtual Desktop documentation | Microsoft Learn](https://learn.microsoft.com/en-us/azure/virtual-desktop/).

To achieve connection using Private Link in AVD, you must understand which resource the private endpoint should be linked to, the target sub-resource type, and whether the AVD service will only allow connections using Private Link.

## Private Endpoint Configuration Matrix

| Scenario | PE Linked To | Target Sub-Resource Type | Public Network Setting |
|----------|-------------|-------------------------|----------------------|
| MSRDC Feed | Workspace | workspace | Uncheck "Allow end user access from public network" |
| Web Client Feed | Workspace | **global** | Uncheck "Allow end user access from public network" |
| MSRDC Connection | Host Pool | hostpool | Uncheck both "Allow end user access from public network" AND "Allow session hosts access from public network" |

## Key Notes

- **Mandatory PE**: You must create 1 PE for a sub-resource of a hostpool. This PE must be created once per subscription so that all global URLs within AVD can be accessed privately.
- **Host pools** control both client and session host connections.
- **Workspaces** control feeds.
- A single VNet can connect to multiple host pools/workspaces.
- A single host pool/workspace can connect to multiple VNets.
- **Non-deterministic routing**: Having multiple routes to the same resource (e.g., public & private at the same time) yields non-deterministic results.
- **Independent control**: Public VMs (host pool setting) and public clients (workspace setting) are controlled separately. You can have private-only VMs while still allowing public clients.
- **PE location**: The location of the PE is the location of the VNet (where the VM resides). The host pool will link out to a different geo if the two regions are different.
