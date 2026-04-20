---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/How To/ExpressRoute BFD"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/How%20To/ExpressRoute%20BFD"
importDate: "2026-04-18"
type: troubleshooting-guide
---

# ExpressRoute BFD

[[_TOC_]]

## Description

This article provides additional insights on how to investigate and troubleshoot BFD in more detail. 

## Introduction

You can enable ExpressRoute circuit either by Layer 2 connections or managed Layer 3 connections. In both cases, if there are more than one Layer-2 devices in the ExpressRoute connection path, the responsibility of detecting any link failures in the path lies with the overlying BGP session.

On the MSEE devices, BGP keep-alive and hold-time are typically configured as 60 and 180 seconds respectively. For that reason when a link failure happens it can take up to three minutes to detect any link failure and switch traffic to alternate connection.

You can control the BGP timers by configuring a lower BGP keep-alive and hold-time on your edge peering device. If the BGP timers aren't the same between the two peering devices, the BGP session will establish using the lower time value. The BGP keep-alive can be set as low as three seconds, and the hold-time as low as 10 seconds. However, setting a very aggressive BGP timer is not recommended because the protocol is process intensive.

## Limitations and Known Issues

In current ExpressRoute deployments, BFD gets enabled by default for both Private and Microsoft Peering.

If your circuit was created before the dates listed below, use the [Reset ExpressRoute circuit peerings](https://docs.microsoft.com/en-us/azure/expressroute/expressroute-howto-reset-peering)article to enable BFD:  

- If you deployed your ExpressRoute circuit with **Private Peering** before August 1, 2018
- If you deployed your ExpressRoute circuit with **Microsoft Peering** before January 10, 2020

Please confirm when the circuit was created and confirm that each peering was created after the above dates. 

## Confirm BFD is Configured on MSEE

### Cisco

#### Cisco ASC

In ASC, navigate to the ExpressRoute resource and dump routing:

- Dump Routing:

![Dump routing information](/.attachments/image-3cf6985c-5599-4fa5-9b99-13f742fe6b43.png)

#### Cisco Jarvis Action BFD Details

- Jarvis [Link](https://jarvis-west.dc.ad.msft.net/98E08BE4?genevatraceguid=af95b14e-39e8-48e4-92a5-0f91725dabba)

![Jarvis action BFD Details](/.attachments/image-54c16dde-00fc-4e8e-8254-bb87bb4546a4.png)

- Jarvis [Link](https://jarvis-west.dc.ad.msft.net/20E672C3?genevatraceguid=af95b14e-39e8-48e4-92a5-0f91725dabba) that will contain additional information about BFD. You will have to search by the CE IP. 

![Jarvis action BFD additional Details](/.attachments/image-26240f66-3a0e-4d15-a7c9-91f18e72469c.png)

From the image above, this provides more insight into BFD such as uptime, handle (can be queried via syslog), min rx/tx intervals, etc.

#### Cisco Jarvis Action Confirm BFD Applied on VRF

You will need the customer VRF that is located within ASC.

You will see that BFD is configured on the interface specific to the customer. 

Jarvis [Link](https://jarvis-west.dc.ad.msft.net/A131634A?genevatraceguid=af95b14e-39e8-48e4-92a5-0f91725dabba)

![BFD Applied on VRF information](/.attachments/image-cbe7a702-b845-4405-980e-e4c192e36b70.png)

![Neighbor with fall over BFD value](/.attachments/image-606339b7-261a-4fcc-90e9-3f9d13506364.png)

Cisco BFD Documentation: https://www.cisco.com/c/en/us/td/docs/ios/12_0s/feature/guide/fs_bfd.html

### Juniper 

#### Juniper ASC

With Juniper, you are not able to see BFD details within dump routing. 

Known issue: 
#29862

#### Juniper Jarvis Action BFD Details

- Jarvis [Link](https://jarvis-west.dc.ad.msft.net/51C83596?genevatraceguid=360c59c8-f21b-4665-9c7d-ec50202c5818)

![BFD details information](/.attachments/image-f03d6f09-e394-4f8f-9d7b-55df21326dfd.png)

#### Juniper Jarvis Action Confirm BFD Applied on VRF

You will need the customer VRF that is located within ASC.

You will see that BFD is configured on the routing instance (vrf) of the customer.

Jarvis [Link](https://jarvis-west.dc.ad.msft.net/98A127F1?genevatraceguid=af95b14e-39e8-48e4-92a5-0f91725dabba)

![BFD configured on the routing instance VRF of the customer](/.attachments/image-2bc28ff1-afa7-45fe-841c-215fb789053c.png)

Juniper BFD Documentation: 
- https://www.juniper.net/documentation/us/en/software/junos/high-availability/topics/topic-map/bfd-configuring.html
- https://www.juniper.net/documentation/us/en/software/junos/high-availability/topics/topic-map/bfd.html#id-understanding-bfd-for-static-routes-for-faster-network-failure-detection

### Arista

#### Arista ASC

In ASC, navigate to the ExpressRoute resource and dump routing:

![Arista Dump Routing BFD info](/.attachments/image-3f168b22-6e60-469f-b08b-0f58802b574c.png)

#### Arista Jarvis Action BFD Details

Jarvis [Link](https://portal.microsoftgeneva.com/148D7180?genevatraceguid=9908fdd7-cb84-47c1-a1a6-f0a5e352b3b8) that will contain additional information about BFD. You will have to search by the CE IP. 

![Jarvis action BFD additional Details](/.attachments/bfd-arista-1c979b1e-eab7-4499-8dc3-fa7f0b05a428.png)

From the image above, this provides more insight into BFD such as uptime, handle (can be queried via syslog), min rx/tx intervals, etc.

#### Arista Jarvis Action Confirm BFD Applied on VRF

You will need the customer VRF that is located within ASC.

You will see that BFD is configured on the interface specific to the customer.

Geneva Action [Link](https://portal.microsoftgeneva.com/F8DAD2C?genevatraceguid=7a00a87e-18c8-444c-94fb-be2d50c127ae)

![image.png](/.attachments/image-66898e49-d4d9-4f2c-95b4-590b2bbf149b.png)

Arista BFD Documentation: [EOS 4.35.1F - Bidirectional Forwarding Detection - Arista](https://www.arista.com/en/um-eos/eos-bidirectional-forwarding-detection)

## BFD Intervals

Between BFD peers, the slower of the two peers determine the transmission rate. From the configuration mentioned above in both the Cisco and Juniper examples, we can see that both transmission/receive intervals are set to a minimum of 300 **ms**. It's not possible to make these values shorter. However, you can change the intervals to a higher value such as 750 **ms** by configuring on-premises side.

Please also refer to our BFD public document [here](https://learn.microsoft.com/en-us/azure/expressroute/expressroute-bfd#bfd-timer-negotiation).

## BFD Multiplier

The multiplier is the number of packets not received by the neighbor that causes the interface to be declared as down. From the above configuration, we can see the default value is 3.

## BFD Interval/Multiplier Understanding

If the default is configured, the devices will send hello packets every 300ms. Each side will detect neighbor failures when the device doesn't receive a reply in 900 **ms**.

Why 900 **ms**? 

You take the interval x multiplier. 

In the examples above the interval has been 300 and the multiplier has been 3. 300x3= 900

## Syslog

When reviewing BFD issues, it is always a good idea to see if any other customers on the physical interface encountered similar issues.

```
cluster('azphynet.kusto.windows.net').database('azdhmds').SyslogData
| where Device contains "exr01.ash"
| where PreciseTimeStamp>= datetime("2022-04-23T01:06:00.000Z") and PreciseTimeStamp<= datetime("2022-04-23T01:07:00.000Z")
| where EventName has "bfd" or Message contains "192.168.130.221" // remove IP if want to see if other customers saw similar issues
| project PreciseTimeStamp , Device , DeviceIp, EventName, Message , Severity , EventMessage, FacilityMessage
```
| PreciseTimeStamp | Device | EventName | Message
|--|--|--|--|
| 2022-04-23 01:06:50.4917478 | exr01.ash | daemon-4-bfdd_trap_shop_state_down | <140>Apr 23 01:06:48 exr01.ash bfdd[16342]: %DAEMON-4-BFDD_TRAP_SHOP_STATE_DOWN: local discriminator: 3000, new state: down, interface: xe-1/1/10:0.86, peer addr: 192.168.130.221 |
| 2022-04-23 01:06:51.1459715 | exr01.ash | daemon-4 | <140>Apr 23 01:06:48 exr01.ash rpd[17585]: %DAEMON-4: bgp_bfd_callback:158: NOTIFICATION sent to 192.168.130.221 (External AS 65020): code 6 (Cease) subcode 9 (Hard Reset), Reason: BFD Session Down |
| 2022-04-23 01:06:51.4781715 | exr01.ash | daemon-4-rpd_bgp_neighbor_state_changed | <140>Apr 23 01:06:48 exr01.ash rpd[17585]: %DAEMON-4-RPD_BGP_NEIGHBOR_STATE_CHANGED: BGP peer 192.168.130.221 (External AS 65020) changed state from Established to Idle (event BfdDown) (instance 7af80d50b20c47d6b98e6e925cefe0ea) |
| 2022-04-23 01:06:51.8763966 | exr01.ash | daemon-4 | <140>Apr 23 01:06:48 exr01.ash bfdd[16342]: %DAEMON-4: BFD Session 192.168.130.221 (IFL 1618) state Up -> Down LD/RD(3000/272) Up time:1w0d 00:04 Local diag: CtlExpire Remote diag: None Reason: Detect Timer Expiry. |
| 2022-04-23 01:06:52.5481956 | exr01.ash | daemon-4-rpd_bgp_neighbor_state_changed | <140>Apr 23 01:06:50 exr01.ash rpd[17585]: %DAEMON-4-RPD_BGP_NEIGHBOR_STATE_CHANGED: BGP peer 192.168.130.221 (External AS 65020) changed state from OpenConfirm to Established (event RecvKeepAlive) (instance 7af80d50b20c47d6b98e6e925cefe0ea) |
| 2022-04-23 01:06:57.8097347 | exr01.ash | daemon-5-bfdd_trap_shop_state_up | <141>Apr 23 01:06:52 exr01.ash bfdd[16342]: %DAEMON-5-BFDD_TRAP_SHOP_STATE_UP: local discriminator: 3000, new state: up, interface: xe-1/1/10:0.86, peer addr: 192.168.130.221 |

From the above errors, we can confirm that we didn't see the customers hello packets, so we signaled BGP down on the primary MSEE device.

Find additional information about why BFD went down we review the following packet: 

| PreciseTimeStamp | Device | EventName | Message
|--|--|--|--|
| 2022-04-23 01:06:51.8763966 | exr01.ash | daemon-4 | <140>Apr 23 01:06:48 exr01.ash bfdd[16342]: %DAEMON-4: BFD Session 192.168.130.221 (IFL 1618) state Up -> Down LD/RD(3000/272) Up time:1w0d 00:04 Local diag: CtlExpire Remote diag: None Reason: Detect Timer Expiry. |

```
State: Up -> Down     <--- State changed from up to down
LD/RD(3000/272)       <--- Local Discriminator/Remote Discriminator
Up time:1w0d 00:04    <--- Provides the uptime and will be reset with this event
Local diag: CtlExpire <--- Confirm that we declared the interface as down since we didn't receive BFD packets from CE
Remote diag: None     <--- Since MSEE signaled, it would show as none
Reason: Detect Timer Expiry. <--- Provides the reason why BFD went down
```
Example of CE capture when MSEE side detected timer expired:

CE:192.168.130.221

MSEE: 192.168.130.222

![CE Packet capture](/.attachments/image-e0fa5558-0b09-4473-80e7-7c1414154394.png)

Wireshark Filter: bfd.sta == 0x0 or bfd.sta == 0x1

BFD state values are:
```
0 -- AdminDown
1 -- Down
2 -- Init
3 -- Up
```

##LD/RD

LD = Local Discriminator

RD = Remote Discriminator

LD: The local discriminator for this BFD session, used to uniquely identify it.  It MUST be unique across all BFD sessions on this system, and nonzero.  It SHOULD be set to a random (but still unique) value to improve security.  The value is otherwise outside the scope of this specification.

RD: The remote discriminator for this BFD session.  This is the discriminator chosen by the remote system, and is totally opaque to the local system.  This MUST be initialized to zero.  If a period of a Detection Time passes without the receipt of a valid, authenticated BFD packet from the remote system, this variable MUST be set to zero.

RFC: https://datatracker.ietf.org/doc/html/rfc5880 | Page 27


# Contributors
@<F84DD2EA-3ED8-6E71-BBD4-86A47F7D8B78> 


