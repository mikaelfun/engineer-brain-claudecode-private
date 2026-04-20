---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/Review/Reading Dump Circuit and Private Peering topology"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FReview%2FReading%20Dump%20Circuit%20and%20Private%20Peering%20topology"
importDate: "2026-04-18"
type: troubleshooting-guide
---

# How Dump Circuit relates to ExpressRoute network topology - Private Peering

[[_TOC_]]

## Description
The goal of this wiki is to illustrate the relationship between ExpressRoute Dump Circuit and the ExpressRoute network topology.

To get an in-depth breakdown of Dump Circuit and Dump Routing outputs, please see "How to Parse Dump Circuit & Dump Routing Outputs".

## How to find Dump Circuit

### ASC

The easiest place to pull both Dump Circuit/Route is via the ExR resource page on ASC. Navigate to the ExR resource in ASC. Links to Dump Circuit/Route are at the bottom of the "Properties" section.

### Jarvis-Actions

If ASC is failing you for whatever reason, head over to Jarvis Actions to manually dump the circuit and routing.
Jarvis Actions ---> Brooklyn ---> ExR Diagnostic Operations ---> DumpCircuitInformation/DumpRouting

How to run: Specify the ExpressRoute's **Service Key** which can be located in ASC. Alternatively, if ASC isn't working you can also find the Service Key by running Get NRP Subscription Details in Jarvis Actions using the subscription ID and Region of the ExR.

### ASC Network Topology (links to Jarvis Actions)

If you load the topology in ASC, it will show you all of the VNets in the subscription as well as any ExpressRoutes that are linked to them. This is **very useful** in scenarios where the customer submits a support request specifying the subscription ID of the VNet where they are having connectivity issues but the **ExR is deployed to a different subscription**.

How to get the topology in ASC: At the top of ASC, select Tools ---> Network Topology. If there is no topology, select "Login" or "Generate New Topology". After it is generated, refresh ASC. Select the Circuit you are interested in in the topology, on the right hand side select "Show More" and at the bottom you will have links to Jarvis Actions.

#### Network Topology Quick Tips

Select different objects in the ASC Topology view and use the "Quick Links" which link to common Jarvis Actions and other informational sites with relevant query fields auto-populated with the resource details.

## Dump Circuit

We'll use an example VNet and ExpressRoute to illustrate a typical private peering topology.

### 1. Environment

Customer on-prem address prefixes that will be advertised to Azure over the peering:

* 10.1.0.0/16
* 10.35.0.0/16

Azure Vnet Prefix: 192.168.0.0/16

* GatewaySubnet: 192.168.1.0/27
* WorkloadSubnet: 192.168.2.0/24
   * Contains 1 Azure VM: 192.168.2.5

### 2. Customer Portal Configuration

Here the customer selects the prefixes that will be used for the BGP peering between our MSEE and the Provider Edge. They also select a vlanid which is used for the inner tag of the QinQ encapsulation (also called the customer tag or C-Tag).

### 3. Dump Circuit Output

After the customer creates the peering with above settings, they can then deploy an ExpressRoute Gateway into their VNet and create a Connection between the ExR GW and the ExR.

Below is the Dump Circuit after the customer 1) creates the circuit 2) creates the peering 3) links the ExR to his VNet and 4) advertises the on-prem routes to his VNet over the ExR.

### 4. Topology for this ExpressRoute

The topology illustrates how Dump Circuit properties correspond to the network topology - review the color coded dump circuit side by side with the topology diagram.

## Continued Learning

* About MSEE
* About Datapath between MSEE and PE (Provider Edge)
* About Datapath between MSEE and GWT

## Contributors
Zach Cabrera
