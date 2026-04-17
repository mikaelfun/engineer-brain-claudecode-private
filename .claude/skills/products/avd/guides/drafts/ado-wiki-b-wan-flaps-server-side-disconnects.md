---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/In-Development Content/Outdated? - Needs review if still useful/WAN Flaps/Server Side Disconnects"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=/Sandbox/In-Development%20Content/Outdated%3F%20-%20Needs%20review%20if%20still%20useful/WAN%20Flaps/Server%20Side%20Disconnects"
importDate: "2026-04-06"
type: troubleshooting-guide
note: "Marked as Outdated - Needs review if still useful"
---

# Server Side Disconnects (WAN Flaps)

## Example Error Messages

| Error Signature | Path Segment | Description | Probable Cause |
|--|--|--|--|
| RDStack:UnexpectedNetworkDisconnect | VM -> RD Gateway | The VM lost connectivity suddenly | TCP Reset |
| RDStack:ReverseConnectResponseTimeout | VM -> RD Gateway | The VM hit a retransmit timeout | Data flow stopped |
| RDGateway:ConnectionFailedServerDisconnect | VM -> RD Gateway | The VM connection the AVD gateway to disconnected suddenly | TCP Reset most likely, but not it's only reason |
| RDGateway:ConnectionFailedReverseUngracefulClose | VM -> RD Gateway | The AVD gateway tried to close its connection to VM and discovered the connection was lost already | Anything, the gateway is just noticing the connection was down |
| ConnectionFailedServerDisconnect | VM -> RD Gateway | The VM lost connectivity suddenly | TCP Reset most likely, but not it's only reason |
| Client:ConnectionBrokenMissedHeartbeatThresholdExceeded | Client/User -> RD Gateway or VM -> RD Gateway | The AVD client detected that no heartbeats where delivered for 16s from the VM. Can happen on either segment, most of the time correlated errors help understand the specific one that hit it. | Data flow stopped |

## Action Plan

1. AVD Engineer will collect 2-sided network trace when disconnect occurs and get the activity id of connection.

1. AVD Engineer will get the gateway cluster in diagactivity table and provide gateway ip to anp engineer.

1. ANP engineer will filter on gateway ip in network trace - most likely will see the retransmits, dupes, out-of-order packets, etc.. and document timestamp of last packet vm sent to avd gw but didnt get ack.

1. AVD engineer will follow https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/464440/Basic-Queries?anchor=timestamp-of-last-packets and get timestamp of reverse last incoming packet which is timestamp of last packet that was received by the gateway from the stack.

1. If the timestamp of the last packet received by gateway from stack happened BEFORE timestamp of last packet vm sent to gw but didnt get ack → the packet never got to gw (which is the case for every one of these we have seen).

1. If packet didn't get to AVD GW then need to look at what devices traffic goes through like NSG. AVD engineer can run queries from https://www.osgwiki.com/wiki/Cowbell/RDPWANFlaps to check for wan flaps. CloudNet fixed convergence bug so we are not seeing these as much as we used to. However ANP can use information from query results about the gateway region, VM region and the timestamp info and put in EagleEye https://eagleeye.trafficmanager.net/view/services/EagleEye/pages/Home to find correlated CloudNet events and escalate to the product team.

## Case Example

- Take client IP and filter in client trace
- Look at when traffic ended
- When connection explicitly terminates they either terminate with FIN or RST
  - FIN is graceful close (typically see FIN going in both directions)
  - RST is generally unidirectional (someone got sick of trying so it sends a reset and closes the connection)
- In this scenario the client initiated a termination gracefully and gw acknowledged
- The timestamp of disconnect in client nettrace should match Kusto
