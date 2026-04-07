---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Labs for ALDO CSS/Single Node/DC Preparation"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Disconnected%20Operations/Labs%20for%20ALDO%20CSS/Single%20Node/DC%20Preparation"
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
1. **DC Preparation**
1. [Azure Local Node Preparation](Azure-Local-Node-Preparation.md)
1. [Appliance Deployment](Appliance-Deployment.md)
1. [Azure Local Deployment](Azure-Local-Deployment.md)
1. [Post Steps and Cleanup](Post-Steps-and-Cleanup.md)

# DC Preparation

Access the DC VM from the physical node using RDCMan (`c:\RDCMan.exe`) and opening the `.rdg` file that we created via the menu system on the desktop (`c:\users\Administrator\Desktop\ASZLabs.rdg`) 
_**Note:** You can delete/ignore the second vHCI02 environment in the .rdg file, this is an articact of the menu system. This will be fixed in a later update._

From the DC VM, perform the following steps in an PowerShell ISE run as Administrator-

**Configure the DNS:**

:::template /.templates/Dynamic/Azure-Local-Disconnected-Operations/Beta-Resources-%2D-Pre%2DGA/Deployment/Labs/Single-Node_DC_0.md
:::

**Install the Certificate Authority Windows Feature:**

:::template /.templates/Dynamic/Azure-Local-Disconnected-Operations/Beta-Resources-%2D-Pre%2DGA/Deployment/Labs/Single-Node_DC_1.md
:::

**Create ALdo Certificate(s):**

:::template /.templates/Dynamic/Azure-Local-Disconnected-Operations/Beta-Resources-%2D-Pre%2DGA/Deployment/Labs/Single-Node_DC_2.md
:::

**Install ADFS Windows Feature and Setup ADFS:**

:::template /.templates/Dynamic/Azure-Local-Disconnected-Operations/Beta-Resources-%2D-Pre%2DGA/Deployment/Labs/Single-Node_DC_3.md
:::

**Create Default AD Users and Groups:**

:::template /.templates/Dynamic/Azure-Local-Disconnected-Operations/Beta-Resources-%2D-Pre%2DGA/Deployment/Labs/Single-Node_DC_4.md
:::

:::template /.templates/Block/Important.md
:::

Make note of the Group Identifier GUID provided in this step from `$SyncGroupIdentifier`, as it will be required during [Appliance Deployment](Appliance-Deployment.md) 

:::template /.templates/Block/End.md
:::

**Export Ent CA root certificate:**

:::template /.templates/Dynamic/Azure-Local-Disconnected-Operations/Beta-Resources-%2D-Pre%2DGA/Deployment/Labs/Single-Node_DC_5.md
:::

**Post Steps:**

And finally, you will need to copy the contents from the following folder `C:\Scripts\ALdo\Nodes\Appliance` on the physical host to `C:\Appliance` on the `vHCI01-DC` VM.

# Next Steps

After the DC Preparation is complete, the next steps will need to be performed on the Azure Local nodes. Click below to continue to Azure Local Node Preparation:

[< VM Deployment (Virtual)](VM-Deployment-virtual.md) - DC Preparation - [**Azure Local Node Preparation >**](Azure-Local-Node-Preparation.md)