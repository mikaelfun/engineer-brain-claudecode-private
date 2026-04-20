---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/How To/TSG: MSEE Packet Captures"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/How%20To/TSG%3A%20MSEE%20Packet%20Captures"
importDate: "2026-04-18"
type: troubleshooting-guide
---

[[_TOC_]]

<https://aka.ms/AnpExrPacketCaptures>

## Overview

This document outlines how to get MSEE interface captures from an ExpressRoute circuit. This should be a "last resort" after all other troubleshooting options have been exhausted. This includes [Debug ACL](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/350138/Debug-ACL).

**NOTE:** For Private Peering tests, it is expected that you will first attempt troubleshooting with the Debug ACL operation, which does not require TA approval or assistance. An in-depth playbook for troubleshooting private peering performance issues (including packet loss) is documented here: [ExpressRoute Performance Troubleshooting](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/134205/ExpressRoute-Performance). You should only use the process below for Microsoft Peering captures or if Debug ACL demonstrates the issue is between the MSEE and the Azure VM as explained in the performance troubleshooting TSG.

## Limitations

- Debug ACL does not work with Microsoft Peering due to an ACL already being applied. 
- Not able to gather Fairfax MSEE captures

## Do I Actually Need MSEE Captures?

::: mermaid
graph TD
    K("Does a Traceroute show the MSEE /30 IPs in the path?")
    K-->A("<center>YES</center> <br/> What Peering Type?")
    K-->M("NO<br/> Customer likely has a routing configuration issue on-prem that is directing traffic<br/> across a different path than the ExR. Consult with Provider on why traffic isn't routed to the ExR")
    A-->B("Private Peering")
    B-->D("Have you run a Debug ACL (https://aka.ms/AnpDebugAcl)?")
    D-->F("YES<br/> Did the Debug ACL provide unexpected results?")
    D-->G("NO<br/> Go Run a Debug ACL (https://aka.ms/AnpDebugAcl)")
    A-->C("Microsoft Peering")
    C-->E("Are all Microsoft Peering Services Affected?")
    E-->I("YES<br/> Proceed with approval request for MSEE Captures")
    E-->J("NO<br/> Unlikely that MSEE captures will assist.")
    F-->N("YES<br/> Proceed with approval request for MSEE Captures")
    F-->O("NO<br/> Did the Debug ACL show *any* results?")
:::

## Process

First you need to gather:

* TA Approver
* Why a MSEE capture is necessary - what problem are you looking to solve, and what have you done thus far in an attempt to solve it? You must indicate why a Debug ACL (https://aka.ms/AnpDebugAcl) isn't sufficient to solve the problem. If you are working on a performance case, ensure you have reviewed the [ExpressRoute Performance TSG](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/134205/ExpressRoute-Performance).
* Confirmation from the customer that a repro is actively running or set up a time to run a repro. The issue MUST be actively occurring, whether via the customer's application or synthetic load such as iPerf or Ntttcp.
* Device Names (From Dump Circuit)
* Device Type (From Dump Circuit)
* Subinterface Name (From Dump Circuit)
* Description of desired captured traffic
   * Source IP
   * Destination IP
   * Port & Protocol information
   * Peering Type (refer to the Dump Circuit)

Next, you MUST work through a TA via the [ExpressRoute Channel in Teams](https://teams.microsoft.com/l/channel/19%3a5693c71a57e34093a0d7c4dae35b05ed%40thread.skype/Express%2520Route?groupId=c3e00ac7-3f76-4350-ba3b-e335a6bbbe21&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47).

Please provide all the information gathered in your investigation including the information above to expedite the process. 

**TAs have the capability to perform captures on Cisco, Juniper, and Arista devices.**

**If a TA is not available, you may proceed with the IcM.**

## Packet Capture Request CRI Process

Only if a TA is not available, you may proceed by select the follow template from ASC: `ExpressRoute MSEE Packet Capture Request`

If for some reason ASC is not working, create the CRI from the template [here](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=OZ1e1U).

Fill out the template completely. Failure to do so will result in your CRI being marked as noise. 

Once submitted, verify the IcM Owning service/team is `Cloudnet/ExpressRouteOps`. 

![expressroute ops owning service/team in IcM](/.attachments/image-00aa401a-8035-4558-a226-55d521c68b4d.png)

## Loading MSEE Packet Captures in Wireshark

When viewing MSEE captures collected via Pythia or manually by EROps for Juniper devices, the VXLAN encapsulated packets must be "decoded" so that you can view and filter on the inner IP headers. The process is simple and is necessary for all Peering types across the Circuit.

Once you have received your capture, you will see that the traffic is all UDP, and using IPs not within the customer routing domains.
![MSEE results capture](/.attachments/image-dc873e13-3bc5-4925-838b-98334a257626.png)

To fix this, first go to "Analyze" in Wireshark and select "Decode As...". Then you'll select the "+" sign to add the fields.
![Add fields in Analyze option using Wireshark](/.attachments/image-7624344c-c6f1-4131-b32b-ec6b3946e7ca.png)

Next, you'll select UDP for "Field", change the "Value" to the Destination Port seen on the capture (65530), leave "Type" & "Default" alone and then select VXLAN for "Current".
![Value field 65530](/.attachments/image-44990380-7fdf-40b8-b7d5-772f69ef9a29.png)

Once you select "OK", the capture will re-parse and show you the inner packet headers that you are expecting to see.
![Correct MSEE capture results](/.attachments/image-6d202171-c593-4a24-9f6d-270677590dc1.png)

To read these captures in Network Monitor, you will need to use the Custom Parser profile: NMCap Last Path. If you already have the Custom Parser profile and the traffic is still showing the 65530 traffic, you may need to redownload the custom profile again. 
To download, go here: https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/138470/Network-Monitor-Parsers-for-Azure-Networking?anchor=how-to-configure-the-custom-parsers

![Parser Profiles using Microsoft Network Monitor](/.attachments/image-c35b03a5-11c1-47fd-8f8e-ffd2729ef9a0.png)

**Do NOT share MSEE captures via screenshot or the capture itself with customers. If customer is asking for PROOF, please ask for guidance from a TA before anything is send directly to customer.**


# Contributors

* @<B0B19791-83EB-4561-9380-2B186BDF9BC7> 
* @<AAD67C1A-C862-4157-995E-B930B4652CED>
* @<F84DD2EA-3ED8-6E71-BBD4-86A47F7D8B78> 