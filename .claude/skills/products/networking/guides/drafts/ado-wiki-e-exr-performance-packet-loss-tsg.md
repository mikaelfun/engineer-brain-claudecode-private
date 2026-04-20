---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/Review/ExpressRoute Performance_Packet Loss TSG"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FReview%2FExpressRoute%20Performance_Packet%20Loss%20TSG"
importDate: "2026-04-18"
type: troubleshooting-guide
---

[[_TOC_]]

## Description

Example of troubleshooting ExR Performance/Packet Loss

## Understand **working** traffic pattern / packet count

- It is **crucial** that you use a TCP ping utility that where you know exactly how many TCP packets are sent and received for a test. This can be a tool like PsPing or another. The key is that you know what **working** network traffic looks like in a network capture utility, such as, Netmon or Wireshark.
- For this example we used a Linux utility that that sent a single TCP packet from one client to another. The responding client sent a single Ack,Reset packet back to complete the ping.

Working Netmon With 10 Pings and Responses

## Assessing the Broken Scenario

We took simultaneous network traces on the following nodes while reproducing the packet loss: Azure VM, Azure Vnet Gateway and on-premises client. We also counted packets on the Microsoft Edge Router(MSEE).
Here we have an Azure VM sending 10 TCP pings to an on-premises client and is only receiving 3 responses. We are expecting 10.

The on-premises client receives all 10 packets and only responds to 9 of them (-1)

In Debug ACL in ACIS (Now Jarvis Actions), we see MSEE reporting 9 packets coming in through the external interface.

The trace on the Azure Gateway only shows traffic coming into a Vnet (this is by design). Here we see 6 packets coming in (-3)

Azure VM receives only 3 packets(-3)

## Result

ICM to the product group to trace on infrastructure to find hardware causing the issue.

## Related Article

## Using TraceRt to identify path variations

In this document, we look at a scenario where a network interface that communicates with an Internet Exchange needed to be reset. We see how this was observed by simply using TraceRt.
