---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Labs for ALDO CSS/Single Node/VM Deployment virtual"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Disconnected%20Operations/Labs%20for%20ALDO%20CSS/Single%20Node/VM%20Deployment%20virtual"
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
1. **VM Deployment (virtual)**
1. [DC Preparation](DC-Preparation.md)
1. [Azure Local Node Preparation](Azure-Local-Node-Preparation.md)
1. [Appliance Deployment](Appliance-Deployment.md)
1. [Azure Local Deployment](Azure-Local-Deployment.md)
1. [Post Steps and Cleanup](Post-Steps-and-Cleanup.md)

# VM Deployment (Virtual)

After the baremetal deployment is completed and the new node is accessible, we will use the menu system to perform some preparation steps, deploy the DC VM, and the HCI Cluster Node VMs. The single node ALdo cluster will consist of the single DC, and 3 virtual HCI nodes.

Before starting the deployment, we need to create the data disk that will host all of the VHDs for the VMs on the physical node. Run the following on the physical node:


:::template /.templates/Block/Important.md
:::

The data disk scripts below depend on which environment you are deploying. The first script is for the `ALCSS01`-`ALCSS10` environments, while the second script is for the orignal `ALCSS17`-`ALCSS20` environments (the renamed `ASZCSS10A`-`ASZCSS10D` nodes)

:::template /.templates/Block/End.md
:::

## For ALCSS[01-10]

We use an updated data disk that uses a data stripe created in WinPE with Diskpart where the deploy resources have already been placed

:::template /.templates/Dynamic/Azure-Local-Disconnected-Operations/Beta-Resources-%2D-Pre%2DGA/Deployment/Labs/Single-Node_Enable-Dynamic-SSD-Disks.md
:::


## For ALCSS[17-20]

We use the original create data disk script for the smaller single-node environments

:::template /.templates/Dynamic/Azure-Local-Disconnected-Operations/Beta-Resources-%2D-Pre%2DGA/Deployment/Labs/Single-Node_Create-Data-Disk.md
:::

And then start up the menu system

:::template /.templates/Dynamic/Azure-Local-Disconnected-Operations/Beta-Resources-%2D-Pre%2DGA/Deployment/Labs/Single-Node_Invoke-MenuSystem.md
:::

Then perform the following steps:

1. Go into Advanced (`5`) and Generate the RDCM file (`5`) and configure physical host for the new virtual environment (`6`). _**Note:** The command will currently throw an error and exit the menu system. The error can be ignored, and the menu system will need to be restarted._

    [![Advanced](/.attachments/Lab-Deploy/Single/nodedeployment1_small.png)](/.attachments/Lab-Deploy/Single/nodedeployment1.png)

    [![Expected Error](/.attachments/Lab-Deploy/Single/nodedeployment2_small.png)](/.attachments/Lab-Deploy/Single/nodedeployment2.png)
    
1. Start the DC deployment by reimaging the domain controller (`2`), selecting the first environment '_vHCI01_' (`1`) and using the default values (`enter`). _**Note:** currently two environments will be displayed, which is an artifact of the menu system. vHCI02 can be safely ignored and will be fixed in a later update._

    [![DC Deployment](/.attachments/Lab-Deploy/Single/nodedeployment3_small.png)](/.attachments/Lab-Deploy/Single/nodedeployment3.png)

1. Start the VM deployment by entering the cluster name (EX: `vHCI01`) and monitor for completion. (Expected duration: 10 minutes)

    [![DC Deployment Confirmation](/.attachments/Lab-Deploy/Single/nodedeployment4_small.png)](/.attachments/Lab-Deploy/Single/nodedeployment4.png)

1. Start the node deployment by reimaging the nodes (`3`), choose vHCI01 (`1`) if prompted, then selecting the number of nodes (`3`), Updating the environment configuration (`Y`), Updating the ALdo version (`2`) then specify version (`4`) and select the appropriate version (EX: `16860`) and confirming the configuration (`Enter`) and monitor for completion. (Expected duration: 30 minutes)

    [![Node Deployment](/.attachments/Lab-Deploy/Single/nodedeployment5_small.png)](/.attachments/Lab-Deploy/Single/nodedeployment5.png)

This should complete the use of the Menu System, and the rest of the commands will be performed on the respective VMs via powershell.

# Next Steps

After VM deployment is complete, the next steps will need to be performed by logging into the VMs directly with the automatically created RDCM file located on the desktop of the physical node. Click below to continue to DC Preparation:

[< Baremetal Deployment](Baremetal-Deployment.md) - VM Deployment (Virtual) - [**DC Preparation >**](DC-Preparation.md)