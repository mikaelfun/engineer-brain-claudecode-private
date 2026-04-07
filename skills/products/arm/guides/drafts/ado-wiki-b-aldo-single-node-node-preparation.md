---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Labs for ALDO CSS/Single Node/Azure Local Node Preparation"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Disconnected%20Operations/Labs%20for%20ALDO%20CSS/Single%20Node/Azure%20Local%20Node%20Preparation"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# Overview
---
This set of articles will guide you through all the steps to deploy a single node Azure Local disconnected operations environment in the AL CSS lab. Currently we have 14 nodes in this category, and before performing the exercise, the node should be reserved in our [Reservation System](https://microsoft.sharepoint.com/teams/AzureStackCSSTeams/SitePages/CSS-Labs-Reservation.aspx). 

:::template /.templates/Static/Azure-Local-Disconnected-Operations/Beta-Resources-%2D-Pre%2DGA/Deployment/Labs/Banner.md
:::

1. [Baremetal Deployment](Baremetal-Deployment.md)
1. [VM Deployment (virtual)](VM-Deployment-virtual.md)
1. [DC Preparation](DC-Preparation.md)
1. **Azure Local Node Preparation**
1. [Appliance Deployment](Appliance-Deployment.md)
1. [Azure Local Deployment](Azure-Local-Deployment.md)
1. [Post Steps and Cleanup](Post-Steps-and-Cleanup.md)

# Azure Local Node Preparation

**Create VMSwitches on all HCI nodes:**

From each of the Azure Local nodes (`vHCI01-S1-N0[1-3]`), run the following set of commands to create the appropriate VMSwitches, and rename all the VMNetworkAdapters appropriately.

_**Note:** When you initially connect to the newly deployed Azure Local nodes, they will have Core interface with no GUI and default to running Server Configuration Tool (sconfig) utility. Choose to exit sconfig interface to local Administrator PowerShell session, and paste the scripts below to execute them. Be sure to press enter to execute the final line of each script._

:::template /.templates/Dynamic/Azure-Local-Disconnected-Operations/Beta-Resources-%2D-Pre%2DGA/Deployment/Labs/Single-Node_Nodes_1.md
:::

**Copy devmod to all HCI nodes:**

Copy the following folder from `C:\Scripts\ALdo\Nodes\DevModule\devmod` on the physical host to `C:\devmod` on the `vHCI01-S1-N0[1-3]` VMs. _**Note:** Depending on the release devmod may be a compressed file, devmod.zip. If this is the case, it must be extracted manually._

# Next Steps

After the Azure Local Node Preparation is complete, the next steps will need to be performed on the SeedNode (vHCI01-S1-N01). Click below to continue to the Appliance Deployment:

[< DC Preparation](DC-Preparation.md) - Azure Local Node Preparation - [**Appliance Deployment >**](Appliance-Deployment.md)